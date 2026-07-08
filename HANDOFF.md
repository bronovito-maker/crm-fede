# Handoff — CRM Fede Energia

> Stato al 2026-07-08. Da leggere prima di iniziare qualsiasi modifica al progetto.

---

## Come lavorare su questo progetto

- Rispondere sempre in **italiano**
- L'utente è il **product owner**, non un developer: descrive le cose in termini di business/UX
- Modifiche **conservative**: non aggiungere feature non richieste, non refactorare codice non toccato
- Quando ci sono opzioni tecniche da scegliere, presentarle brevemente e procedere subito con quella scelta

---

## Stack tecnico

| Layer       | Tecnologia                                                      |
| ----------- | --------------------------------------------------------------- |
| Backend     | Node.js + Express (`server.js`, ~2500 righe)                    |
| Frontend    | Vanilla JS SPA — nessun framework (`public/app.js` ~4200 righe) |
| Database    | Baserow (REST API) — nessun ORM, chiamate HTTP dirette          |
| Sessioni    | SQLite locale con `better-sqlite3` (`sessions.db` di default)   |
| File upload | multer in memoria + storage R2/S3 compatibile                   |
| Immagini    | `sharp` per normalizzazione/compressione immagini caricate      |
| Email       | Resend opzionale per notifica nuovo contratto                   |
| Sicurezza   | helmet (CSP), bcryptjs, express-rate-limit, cookie HttpOnly     |

**Avvio dev**: `npm run dev`

---

## File principali

```
server.js                  — tutti gli endpoint REST /api/*
public/
  app.js                   — tutta la logica SPA (login, form contratto, tabelle, admin)
  index.html               — HTML della SPA
  styles.css               — CSS (mobile-first, CSS grid, CSS custom properties)
  baserowClient.js         — wrapper fetch verso /api/* (il browser NON parla con Baserow direttamente)
  config.js                — costanti statiche (ENABLE_DEMO_FALLBACK)
.env                       — chiavi API, ID tabelle Baserow, Google Maps key
```

---

## Tabelle Baserow principali

| Variabile .env                      | ID tabella | Scopo                      |
| ----------------------------------- | ---------- | -------------------------- |
| `BASEROW_TABLE_AGENTI_ID`           | 925635     | Agenti (utenti del CRM)    |
| `BASEROW_TABLE_CONTRATTI_ID`        | 925638     | Contratti                  |
| `BASEROW_TABLE_COMPETENZE_ID`       | 928679     | Cut-off mensili competenza |
| `BASEROW_TABLE_FORNITORI_ID`        | 930259     | Fornitori disponibili      |
| `BASEROW_TABLE_CUTOFF_FORNITORI_ID` | 930260     | Cut-off per fornitore      |
| `BASEROW_TABLE_CLIENTI_ID`          | 931646     | Anagrafica clienti         |

Altre variabili Baserow rilevanti:

- `BASEROW_FIELD_COMPETENZE_MESE` / `BASEROW_FIELD_COMPETENZE_CUTOFF`
- `BASEROW_FIELD_FORNITORI_NOME`
- `BASEROW_FIELD_CUTOFF_FORNITORE`, `BASEROW_FIELD_CUTOFF_MESE`, `BASEROW_FIELD_CUTOFF_DATA`
- `BASEROW_FIELD_EX_FORNITORE`
- `BASEROW_FIELD_CONTRATTI_AGENTE`

---

## Ruoli utente

- **agent** — vede e gestisce solo i propri contratti + clienti assegnati
- **admin** — vede tutto, gestisce agenti, cut-off fornitori, statistiche globali

---

## Architettura sessioni

Le sessioni sono persistenti su SQLite tramite `SqliteSessionStore`. Il database predefinito è `sessions.db` nella root del progetto, configurabile con `SESSION_DB_PATH`. Il cookie si chiama `crm_session`, è `HttpOnly`, `SameSite=Lax` e diventa `secure` in produzione. Il TTL è configurabile via `SESSION_TTL_HOURS`.

Al riavvio del server le sessioni non vengono perse, ma quelle scadute vengono ripulite all'avvio e poi ogni ora.

## Configurazione servizi esterni

- Google Maps: `GOOGLE_MAPS_API_KEY`, esposta al frontend solo tramite `GET /api/config` dopo login.
- Upload documenti: `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_ENDPOINT`, `R2_PUBLIC_URL`.
- Notifiche email: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `NOTIFY_EMAIL`. Se mancano, la notifica viene semplicemente saltata.
- Cache letture API: `API_CACHE_TTL_MS`, default 15 secondi.

---

## Funzionalità implementate

### Form contratto a 2 colonne

Il form "Nuovo contratto" / "Modifica contratto" è layout a 2 colonne:

- **Colonna sinistra — Anagrafica Cliente**: ragioneSociale, cellulare, tipoCliente, categoriaCliente, piva, email, indirizzoFatturazione
- **Campi condizionali anagrafica**: `amministratore` testuale solo per `tipoCliente = Condominio`; `PEC` visibile per `Business` e `Condominio`
- **Colonna destra — Dati Contratto**: idContratto, meseCompetenza, fornitore, exFornitore, nomeOfferta, tipoOperazione, tipoFornitura, POD/PDR, multipunto, metodoPagamento, IBAN, agenteId (solo admin), indirizzoFornitura
- **Full-width sotto**: Documenti contratto, Note/descrizione
- CSS: `.contract-form-cols` — grid 1 colonna su mobile, 2 colonne a ≥ 1024px

Il form supporta due modalità di salvataggio:

- **Salva bozza**: salva con stato `Bozza` e validazioni minime.
- **Salva contratto**: salva con stato `Caricato` se era una bozza o mantiene lo stato esistente in modifica.

### Multipunto POD/PDR

Il checkbox "Multipunto" permette di inserire più POD/PDR. Il conteggio unità usa le righe etichettate `POD 1: ...`, `PDR 1: ...`; in assenza di righe multipunto, un contratto `dual` vale 2 unità, una fornitura singola vale 1.

### Anagrafica integrata nel contratto (pagina Anagrafiche eliminata)

Non esiste più una pagina separata "Anagrafiche". Il campo ragione sociale include una ricerca su clienti esistenti e compila i dati anagrafici trovati. Modificare un contratto aggiorna automaticamente anche l'anagrafica del cliente collegato via `PATCH /api/clients/:clienteId`. Il server propaga la modifica a tutti i contratti dello stesso cliente tramite `propagateClientUpdateToContracts`.

### Validazioni form contratto (`validateContractDraft` in app.js)

- **Salva bozza**: richiede almeno uno tra ragioneSociale, cellulare, email, P.IVA/CF
- **Salva contratto** (submit completo): tutti i campi obbligatori + **almeno 1 allegato** (documento obbligatorio)
- **POD obbligatorio** quando tipoFornitura = `"luce"` o `"dual"`
- **PDR obbligatorio** quando tipoFornitura = `"gas"` o `"dual"`
- IBAN obbligatorio se metodoPagamento = `"rid"`
- Email e P.IVA validate con regex
- PEC opzionale ma validata come email se compilata
- Nome amministratore obbligatorio per i condomini
- P.IVA/CF accetta 11 cifre oppure 16 caratteri alfanumerici
- File contratto: massimo 10 file, 15 MB per file, estensioni/documenti/immagini consentiti dalla whitelist del server

I campi POD e PDR sono anche gestiti da `toggleField()` che imposta `input.required = true/false` quando i campi diventano visibili/nascosti.

### Google Maps Places Autocomplete

- Applicato a: `#indirizzo-fatturazione-input` e `#indirizzo-fornitura-input`
- API usata: `PlaceAutocompleteElement` (nuova API Google, non deprecata)
- Restrizione: solo Italia, tipo "address"
- La chiave API è in `.env` → esposta al browser via `GET /api/config` (restituisce solo `{ googleMapsApiKey }`)
- `initGoogleMapsAutocomplete()` viene chiamata dopo il login avvenuto con successo
- **Approccio tecnico**: l'input originale diventa `type="hidden"` (mantiene il `name` per FormData), `<gmp-place-autocomplete>` lo sostituisce visivamente
- Lo script Maps viene caricato dinamicamente con `libraries=places&callback=_initMapsCallback`
- CSS: `gmp-place-autocomplete::part(input)` per stile identico agli altri input del form
- CSP (helmet in server.js) include: `maps.googleapis.com`, `maps.gstatic.com`, `fonts.googleapis.com`
- Funzioni helper:
  - `setAddressAutocompleteValue(inputId, value)` — precompila il campo quando si modifica un contratto esistente
  - `resetAddressAutocompleteValues()` — pulisce i campi quando si resetta il form

### Login con supporto password manager

- `id="login-email"` e `id="login-password"` sugli input
- `autocomplete="username"` sull'email (riconosciuto da Apple Passwords, Chrome, Firefox)
- `autocomplete="current-password"` sulla password
- Label con `for` esplicito collegato all'`id`

### Sincronizzazione cliente ↔ contratto

- **Creazione contratto** → `syncClientFromContract` (server.js) crea/aggiorna il record Clienti (match su P.IVA)
  - Include i campi: `tipo_cliente`, `categoria_cliente`, metodo pagamento, IBAN e agente assegnato quando disponibili
- **Modifica contratto** → aggiorna il contratto + aggiorna il cliente + propaga a tutti i contratti collegati

### Competenza mensile e cut-off

Il contratto salva `mese_riferimento`, `trimestre_riferimento` e `anno_riferimento`. La competenza viene risolta dal server in base al mese scelto nel form e ai cut-off per fornitore: dal giorno successivo al cut-off, il contratto passa alla competenza del mese successivo.

Gli admin gestiscono i cut-off in pagina Admin tramite tabella `Cut-off fornitori`.

### Admin operativo

La pagina Admin include:

- metriche globali e per stato
- gestione cut-off fornitore per mese
- tabella contratti globale con ricerca, filtri multi-agente/multi-operazione, stato, ordinamento e vista inviati/da inviare
- selezione multipla contratti e azione "Segna inviati"
- lista agenti con filtri per nome/email, ruolo e stato account
- creazione/modifica agenti con password hashata lato server

### Valori case-sensitive importanti

`categoriaCliente` ha valori **case-sensitive**: `"Prospect"` e `"Switch ricorrente"` (P maiuscola, S maiuscola). Il server li valida così. Non chiamare `.toLowerCase()` su questi valori.

Stati contratto validi: `"Bozza"`, `"Caricato"`, `"Inviato"`, `"OK"`, `"K.O."`, `"Switch - Out"`.

---

## Protezioni e guard importanti

- `renderAdminPage()` ha guard `if (agent?.ruolo !== 'admin') return` — previene chiamate API non autorizzate se il ruolo non è settato correttamente
- Nel `catch` di `initApp`, se la sessione va in errore dopo che l'agent era già stato impostato, il `ruolo` viene rimosso: `agent = { ...agent, ruolo: undefined }`
- La 401 su `/api/admin/supplier-cutoffs` può accadere se il server viene riavviato con l'utente loggato — è gestita gracefully

---

## Attività pendenti / da verificare

- [ ] Verificare in Baserow che i campi della tabella **Clienti** includano `tipo_cliente`, `categoria_cliente`, `metodo_pagamento`, `iban` e il link agente se usati in produzione.
- [ ] Verificare in ambiente reale upload documenti su R2: credenziali, bucket, endpoint e URL pubblico.
- [ ] Verificare invio email Resend con mittente autorizzato e destinatario `NOTIFY_EMAIL`.
- [ ] Google Maps autocomplete: testare su Safari iOS, soprattutto styling dei componenti Places.
- [ ] Dopo modifiche rilevanti: eseguire `npm test`, `npm run lint` e `npm run build`.

---

## Endpoint API principali

```
GET  /api/session                    — controlla sessione attiva
POST /api/login                      — login
POST /api/logout                     — logout
GET  /api/config                     — configurazione pubblica (es. googleMapsApiKey)
GET  /api/agent                      — agente corrente
GET  /api/contracts                  — lista contratti (filtrata per agente)
GET  /api/competence/current         — competenza corrente
GET  /api/competenze                 — cut-off competenze
GET  /api/suppliers                  — lista fornitori
POST /api/contracts                  — crea contratto + sincronizza cliente
PATCH /api/contracts/:id             — aggiorna contratto + propaga a cliente
DELETE /api/contracts/:id            — elimina contratto
PATCH /api/contracts/:id/status      — aggiorna solo lo stato
GET  /api/clients                    — lista clienti
PATCH /api/clients/:id               — aggiorna cliente + propaga a contratti collegati
GET  /api/admin/agents               — [admin] lista agenti
POST /api/admin/agents               — [admin] crea agente
PATCH /api/admin/agents/:id          — [admin] modifica agente
GET  /api/admin/contracts            — [admin] tutti i contratti
PATCH /api/admin/contracts/:id/sent  — [admin] segna contratto inviato/non inviato
GET  /api/admin/stats                — [admin] statistiche globali
GET  /api/admin/supplier-cutoffs     — [admin] cut-off per fornitore
PUT  /api/admin/supplier-cutoffs     — [admin] salva cut-off
```
