# Handoff — CRM Fede Energia
> Stato al 2026-04-15. Da leggere prima di iniziare qualsiasi modifica al progetto.

---

## Come lavorare su questo progetto
- Rispondere sempre in **italiano**
- L'utente è il **product owner**, non un developer: descrive le cose in termini di business/UX
- Modifiche **conservative**: non aggiungere feature non richieste, non refactorare codice non toccato
- Quando ci sono opzioni tecniche da scegliere, presentarle brevemente e procedere subito con quella scelta

---

## Stack tecnico

| Layer | Tecnologia |
|---|---|
| Backend | Node.js + Express (`server.js`, ~2260 righe) |
| Frontend | Vanilla JS SPA — nessun framework (`public/app.js` ~3000 righe) |
| Database | Baserow (REST API) — nessun ORM, chiamate HTTP dirette |
| File upload | multer (multipart/form-data) |
| Sicurezza | helmet (CSP), bcryptjs, express-rate-limit, sessioni in-memory |

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

## Tabelle Baserow

| Variabile .env | ID tabella | Scopo |
|---|---|---|
| `BASEROW_TABLE_AGENTI_ID` | 925635 | Agenti (utenti del CRM) |
| `BASEROW_TABLE_CONTRATTI_ID` | 925638 | Contratti |
| `BASEROW_TABLE_COMPETENZE_ID` | 928679 | Cut-off mensili competenza |
| `BASEROW_TABLE_FORNITORI_ID` | 930259 | Fornitori disponibili |
| `BASEROW_TABLE_CUTOFF_FORNITORI_ID` | 930260 | Cut-off per fornitore |
| `BASEROW_TABLE_CLIENTI_ID` | 931646 | Anagrafica clienti |

---

## Ruoli utente

- **agent** — vede e gestisce solo i propri contratti + clienti assegnati
- **admin** — vede tutto, gestisce agenti, cut-off fornitori, statistiche globali

---

## Architettura sessioni

Sessioni **in-memory** sul server (nessun Redis/DB separato). Cookie `session_token`. TTL configurabile via `SESSION_TTL_HOURS` in `.env`.  
⚠️ Al riavvio del server tutte le sessioni vengono perse → gli utenti vengono disconnessi.

---

## Funzionalità implementate

### Form contratto a 2 colonne
Il form "Nuovo contratto" / "Modifica contratto" è layout a 2 colonne:
- **Colonna sinistra — Anagrafica Cliente**: ragioneSociale, cellulare, tipoCliente, categoriaCliente, piva, email, indirizzoFatturazione
- **Colonna destra — Dati Contratto**: idContratto, fornitore, exFornitore, nomeOfferta, tipoOperazione, tipoFornitura, POD, PDR, metodoPagamento, IBAN, agenteId (solo admin), indirizzoFornitura
- **Full-width sotto**: Documenti contratto, Note/descrizione
- CSS: `.contract-form-cols` — grid 1 colonna su mobile, 2 colonne a ≥ 1024px

### Anagrafica integrata nel contratto (pagina Anagrafiche eliminata)
Non esiste più una pagina separata "Anagrafiche". Modificare un contratto aggiorna automaticamente anche l'anagrafica del cliente collegato via `PATCH /api/clients/:clienteId`. Il server propaga la modifica a tutti i contratti dello stesso cliente tramite `propagateClientUpdateToContracts`.

### Validazioni form contratto (`validateContractDraft` in app.js)
- **Salva bozza**: richiede almeno uno tra ragioneSociale, cellulare, email, P.IVA
- **Salva contratto** (submit completo): tutti i campi obbligatori + **almeno 1 allegato** (documento obbligatorio)
- **POD obbligatorio** quando tipoFornitura = `"luce"` o `"dual"`
- **PDR obbligatorio** quando tipoFornitura = `"gas"` o `"dual"`
- IBAN obbligatorio se metodoPagamento = `"rid"`
- Email e P.IVA validate con regex

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
  - Include i campi: `tipo_cliente`, `categoria_cliente` (campi Single Select in Baserow)
- **Modifica contratto** → aggiorna il contratto + aggiorna il cliente + propaga a tutti i contratti collegati

### Valori case-sensitive importanti
`categoriaCliente` ha valori **case-sensitive**: `"Prospect"` e `"Switch ricorrente"` (P maiuscola, S maiuscola). Il server li valida così. Non chiamare `.toLowerCase()` su questi valori.

---

## Protezioni e guard importanti

- `renderAdminPage()` ha guard `if (agent?.ruolo !== 'admin') return` — previene chiamate API non autorizzate se il ruolo non è settato correttamente
- Nel `catch` di `initApp`, se la sessione va in errore dopo che l'agent era già stato impostato, il `ruolo` viene rimosso: `agent = { ...agent, ruolo: undefined }`
- La 401 su `/api/admin/supplier-cutoffs` può accadere se il server viene riavviato con l'utente loggato — è gestita gracefully

---

## Attività pendenti / da verificare

### Da testare dopo l'ultima sessione di sviluppo
- [ ] **Google Maps autocomplete**: verificare che funzioni dopo il riavvio del server (fix CSP + migrazione a `PlaceAutocompleteElement` con callback). Aprire DevTools → cercare errori `[Maps]`.
- [ ] **`gmp-place-autocomplete` styling su Safari iOS**: il CSS `::part(input)` richiede supporto CSS Shadow Parts — testare su dispositivo reale.

### Azione manuale richiesta in Baserow
- [ ] Creare nella tabella **Clienti** (ID 931646) i campi `tipo_cliente` e `categoria_cliente` come **Single Select**. Il server è già pronto a scriverli ma i campi non esistono ancora in Baserow.

### Bug risolti — da confermare
- [x] **"Categoria cliente non valida"** durante creazione contratto: era causato da `.toLowerCase()` sul valore `categoriaCliente` in `buildContractDraft`. Fix applicato. Se ricompare: hard refresh del browser (Cmd+Shift+R).
- [x] **Debug logs rimossi** da app.js (erano stati aggiunti temporaneamente per diagnosticare il bug sopra).

---

## Endpoint API principali

```
GET  /api/session                    — controlla sessione attiva
POST /api/login                      — login
POST /api/logout                     — logout
GET  /api/config                     — configurazione pubblica (es. googleMapsApiKey)
GET  /api/contracts                  — lista contratti (filtrata per agente)
POST /api/contracts                  — crea contratto + sincronizza cliente
PATCH /api/contracts/:id             — aggiorna contratto + propaga a cliente
DELETE /api/contracts/:id            — elimina contratto
PATCH /api/contracts/:id/status      — aggiorna solo lo stato
GET  /api/clients                    — lista clienti
PATCH /api/clients/:id               — aggiorna cliente + propaga a contratti collegati
GET  /api/admin/agents               — [admin] lista agenti
GET  /api/admin/contracts            — [admin] tutti i contratti
GET  /api/admin/stats                — [admin] statistiche globali
GET  /api/admin/supplier-cutoffs     — [admin] cut-off per fornitore
PUT  /api/admin/supplier-cutoffs     — [admin] salva cut-off
```
