# CRM Energia

## Obiettivo

Prodotto interno per la gestione commerciale energia. L'app aiuta agenti e admin a inserire contratti, controllare CB/target, gestire competenze mensili e mantenere allineate le anagrafiche cliente.

Principio UI: mobile-first. L'agente deve poter usare l'app da telefono senza zoom, senza tabelle compresse e senza campi inutili.

## Architettura

- `server.js`: server Express, serve il frontend e espone API interne controllate.
- `public/index.html`: shell applicativa, navigazione e pagine principali.
- `public/styles.css`: design system minimale con layout responsive.
- `public/app.js`: stato UI, rendering, filtri, feedback e interazioni.
- `public/baserowClient.js`: client API interno. Non chiama Baserow direttamente.
- `public/config.js`: solo flag non sensibili per il frontend.
- `sessions.db`: sessioni persistenti SQLite, generato localmente di default.
- `.env`: token Baserow, ID tabelle, servizi esterni e opzioni runtime.

Flusso dati:

```text
Browser -> /api/* -> server.js -> Baserow
                       ├-> SQLite sessioni
                       ├-> R2/S3 compatibile per allegati
                       └-> Resend per notifiche opzionali
```

Il browser non deve conoscere token Baserow, ID tabelle, ID campo Baserow, credenziali storage o logica di filtro agente. L'unica configurazione esposta al browser dopo login è la chiave Google Maps via `/api/config`.

### API interne

```text
GET    /api/health
GET    /api/session
POST   /api/login
POST   /api/logout
GET    /api/agent
GET    /api/config
GET    /api/contracts
POST   /api/contracts
PATCH  /api/contracts/:id
DELETE /api/contracts/:id
PATCH  /api/contracts/:id/status
GET    /api/competence/current
GET    /api/competenze
GET    /api/suppliers
GET    /api/clients
PATCH  /api/clients/:id
GET    /api/admin/agents
POST   /api/admin/agents
PATCH  /api/admin/agents/:id
GET    /api/admin/contracts
PATCH  /api/admin/contracts/:id/sent
GET    /api/admin/stats
GET    /api/admin/supplier-cutoffs
PUT    /api/admin/supplier-cutoffs
```

`POST /api/contracts` accetta `multipart/form-data` perché può includere allegati. Il server aggiunge automaticamente agente, data inserimento, competenza, stato (`Bozza` o `Caricato`) e `cb_unitaria_snapshot`. In modifica, gli allegati già caricati possono essere mantenuti tramite lista dei file conservati.

Il login usa email + password. Il server cerca l'agente in Baserow tramite email, confronta la password con `password_hash` e crea una sessione con cookie `HttpOnly`.
Gli endpoint `/api/admin/*` richiedono `ruolo = admin` nella tabella `Agenti`.

Le letture principali hanno rate limit e una cache breve (`API_CACHE_TTL_MS`, default 15 secondi). Le scritture invalidano le cache coinvolte.

### Configurazione `.env`

- `BASEROW_BASE_URL`
- `BASEROW_TOKEN`
- `BASEROW_TABLE_AGENTI_ID`
- `BASEROW_TABLE_CONTRATTI_ID`
- `BASEROW_TABLE_COMPETENZE_ID`
- `BASEROW_TABLE_FORNITORI_ID`
- `BASEROW_TABLE_CUTOFF_FORNITORI_ID`
- `BASEROW_TABLE_CLIENTI_ID`
- `BASEROW_FIELD_CONTRATTI_AGENTE`
- `BASEROW_FIELD_COMPETENZE_MESE`
- `BASEROW_FIELD_COMPETENZE_CUTOFF`
- `BASEROW_FIELD_FORNITORI_NOME`
- `BASEROW_FIELD_CUTOFF_FORNITORE`
- `BASEROW_FIELD_CUTOFF_MESE`
- `BASEROW_FIELD_CUTOFF_DATA`
- `BASEROW_FIELD_EX_FORNITORE`
- `SESSION_TTL_HOURS`
- `SESSION_DB_PATH`
- `BCRYPT_ROUNDS`
- `GOOGLE_MAPS_API_KEY`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_ENDPOINT`
- `R2_PUBLIC_URL`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `NOTIFY_EMAIL`
- `API_CACHE_TTL_MS`
- `PORT`

Le password non devono essere salvate in chiaro. Generare l'hash con `npm run hash-password -- passwordDaUsare` e copiarlo nel campo `password_hash` dell'agente in Baserow.

### Fallback demo

Il fallback demo/localStorage resta utile solo aprendo il frontend come file statico o impostando `ENABLE_DEMO_FALLBACK` in `public/config.js`. Quando l'app gira tramite server, se le API non rispondono non deve salvare dati locali in silenzio.

## Pagine

### Dashboard

Home dell'agente. Mostra:

- Contratti inseriti nel mese
- Contratti validati
- Contratti scartati
- CB maturata
- CB potenziale
- Target mensile
- Mancanti al target
- Grafici sintetici: donut stati, avanzamento target, andamento mese, confronto mesi
- Frase motivazionale

### Nuovo contratto

Pagina più importante. Layout a 2 colonne desktop, 1 colonna mobile.

Colonna anagrafica:

- Ragione sociale o nome cliente
- Cellulare
- Tipo cliente
- Amministratore per condomini
- PEC per business e condomini
- Categoria cliente: `Prospect` o `Switch ricorrente`
- P.IVA / codice fiscale
- Email
- Indirizzo fatturazione

Colonna contratto:

- ID contratto
- Mese competenza
- Fornitore
- Ex fornitore
- Nome offerta
- Tipo operazione
- Tipo fornitura
- POD/PDR in base alla fornitura, anche multipunto
- Metodo pagamento
- IBAN se pagamento RID
- Indirizzo fornitura
- Agente assegnato
- Documenti contratto: PDF, Office/OpenDocument e immagini da telefono
- Descrizione / note

Scelta UX: l'agente può salvare una bozza o caricare il contratto completo. Il valore predefinito del contratto completo è `Caricato`; la validazione operativa avviene dopo.

Nel form agente lo stato non deve essere modificabile né visibile. Al suo posto l'agente sceglie la categoria cliente.

Il form include lookup anagrafica clienti: cercando una ragione sociale esistente vengono compilati i dati disponibili.

### Contratti

Lista operativa dell'agente:

- Cliente
- Data inserimento
- Stato
- Tipo cliente
- CB
- Telefono

Filtri MVP:

- Ricerca testuale
- Mese
- Stato
- Categoria cliente
- Tipo operazione
- Fornitore
- Agente, solo per admin

Su mobile la tabella diventa una lista di schede, con etichetta visibile per ogni valore.

### CB

Pagina guadagni:

- CB del mese
- CB validata
- CB in attesa
- Conteggio contratti per stato
- Tabella sintetica contratti collegati
- Filtri per mese, ricerca, categoria, operazione e fornitore

### Admin

Visibile solo agli agenti con `ruolo = admin`.

Funzioni admin:

- creazione agente con password hashata lato server
- lista agenti
- modifica dati agente
- modifica ruolo e stato attivo
- statistiche globali mese corrente
- statistiche per agente su target mensile, trimestrale e annuale
- gestione cut-off mensili per fornitore
- lista globale contratti con filtri operativi
- selezione multipla contratti e azione "Segna inviati"

## Componenti UI

- `AppShell`: sidebar + contenuto.
- `NavItem`: voce di navigazione.
- `Topbar`: mese corrente e agente.
- `MetricCard`: numero principale con etichetta.
- `Panel`: blocco contenuto standard.
- `StatusBadge`: badge stato contratto.
- `ProgressBar`: avanzamento target.
- `DonutChart`: distribuzione stati.
- `LineChart`: andamento mese.
- `BarChart`: confronto mesi.
- `ContractForm`: inserimento contratto.
- `ContractsTable`: tabella contratti con filtri.
- `AdminContractsTable`: vista admin con filtri, selezione e invio.
- `AdminAgentEditor`: creazione/modifica account agente.
- `SupplierCutoffForm`: gestione competenze per fornitore.

## Accessibilita e mobile

- Navigazione con touch target minimi da 44px.
- Skip link per saltare direttamente al contenuto.
- Stato pagina attiva esposto con `aria-current`.
- Tabelle trasformate in card leggibili su mobile.
- Campi form con autocomplete/inputmode dove utile.
- Nessun testo importante deve richiedere zoom su telefono.

## Schema Baserow definitivo

### Tabella `Agenti`

| Campo                | Tipo            | Note                              |
| -------------------- | --------------- | --------------------------------- |
| `id`                 | Autonumber      | ID interno Baserow                |
| `nome`               | Testo           | Nome agente                       |
| `email`              | Email           | Unica per agente                  |
| `cb_unitaria`        | Numero decimale | Valore CB base per contratto      |
| `target_mensile`     | Numero intero   | Contratti validati                |
| `target_trimestrale` | Numero intero   | Contratti validati                |
| `target_annuale`     | Numero intero   | Contratti validati                |
| `ruolo`              | Single select   | `agente`, `admin`                 |
| `attivo`             | Boolean         | Per nascondere agenti disattivati |
| `password_hash`      | Long text       | Hash bcrypt della password        |
| `created_at`         | Created on      | Audit                             |
| `updated_at`         | Last modified   | Audit                             |

### Tabella `Contratti`

| Campo                    | Tipo            | Note                                                                                     |
| ------------------------ | --------------- | ---------------------------------------------------------------------------------------- |
| `id`                     | Autonumber      | ID interno Baserow                                                                       |
| `agente`                 | Link to table   | Relazione verso `Agenti`                                                                 |
| `data_inserimento`       | Date            | Default oggi                                                                             |
| `data_inizio_fornitura`  | Date            | Data prevista calcolata/gestita dal form                                                 |
| `id_contratto`           | Testo           | ID interno o esterno del contratto                                                       |
| `ragione_sociale`        | Testo           | Cliente o azienda                                                                        |
| `cellulare`              | Testo           | Meglio testo, non numero                                                                 |
| `tipo_cliente`           | Single select   | `Business`, `Privato`, `Condominio`                                                      |
| `categoria_cliente`      | Single select   | `Prospect`, `Switch ricorrente`                                                          |
| `amministratore`         | Testo           | Solo condomini                                                                           |
| `pec`                    | Email/Testo     | PEC cliente business/condominio                                                          |
| `fornitore`              | Testo           | Nome fornitore                                                                           |
| `ex_fornitore`           | Testo           | Campo configurabile con `BASEROW_FIELD_EX_FORNITORE`                                     |
| `nome_offerta`           | Testo           | Nome offerta venduta                                                                     |
| `tipo_operazione`        | Multiple select | `switch`, `switch + voltura`, `cambio listino`, `subentro`                               |
| `tipo_fornitura`         | Single select   | `luce`, `gas`, `dual`                                                                    |
| `pod`                    | Testo           | Obbligatorio se luce o dual                                                              |
| `pdr`                    | Testo           | Obbligatorio se gas o dual                                                               |
| `metodo_pagamento`       | Single select   | `bollettino`, `rid`                                                                      |
| `iban`                   | Testo           | Obbligatorio se RID                                                                      |
| `file_contratto`         | File            | Allegati multipli: PDF, Word, Excel, PowerPoint, OpenDocument, JPG, PNG, WebP, HEIC/HEIF |
| `piva`                   | Testo           | Opzionale                                                                                |
| `email`                  | Email           | Opzionale                                                                                |
| `indirizzo_fatturazione` | Long text       | Opzionale                                                                                |
| `indirizzo_fornitura`    | Long text       | Opzionale                                                                                |
| `descrizione`            | Long text       | Note                                                                                     |
| `stato_contratto`        | Single select   | `Bozza`, `Caricato`, `Inviato`, `OK`, `K.O.`, `Switch - Out`                             |
| `cb_maturata`            | Formula/Numero  | `0` se `K.O.` o `Switch - Out`, altrimenti valore CB                                     |
| `cb_unitaria_snapshot`   | Numero          | CB agente copiata al momento del caricamento                                             |
| `mese_riferimento`       | Formula         | `YYYY-MM` da `data_inserimento`                                                          |
| `trimestre_riferimento`  | Formula         | `YYYY-Qn`                                                                                |
| `anno_riferimento`       | Formula         | `YYYY`                                                                                   |
| `created_at`             | Created on      | Audit                                                                                    |
| `updated_at`             | Last modified   | Audit                                                                                    |

### Tabella `Clienti`

| Campo                    | Tipo          | Note                                                |
| ------------------------ | ------------- | --------------------------------------------------- |
| `ragione_sociale`        | Testo         | Nome cliente                                        |
| `piva`                   | Testo         | P.IVA o codice fiscale                              |
| `email`                  | Email/Testo   | Email cliente                                       |
| `pec`                    | Email/Testo   | PEC se disponibile                                  |
| `cellulare`              | Testo         | Telefono                                            |
| `indirizzo_fatturazione` | Long text     | Indirizzo amministrativo                            |
| `tipo_cliente`           | Single select | `Business`, `Privato`, `Condominio`                 |
| `categoria_cliente`      | Single select | `Prospect`, `Switch ricorrente`                     |
| `metodo_pagamento`       | Single select | `bollettino`, `rid`                                 |
| `iban`                   | Testo         | IBAN se disponibile                                 |
| `agente`                 | Link to table | Agente assegnato, se configurato nello schema reale |

### Tabelle competenze e fornitori

- `Competenze`: mese competenza e cut-off generale.
- `Fornitori`: elenco fornitori mostrati nel form e nei filtri.
- `Cut-off fornitori`: cut-off specifico per fornitore e mese.

Dal giorno successivo al cut-off del fornitore, i contratti entrano nella competenza del mese successivo.

### Calcoli consigliati

- `cb_maturata`: se `stato_contratto = K.O.` o `Switch - Out`, valore `0`; altrimenti usa la CB unitaria dell'agente o un numero copiato al momento dell'inserimento.
- `mese_riferimento`: anno e mese da `data_inserimento`.
- `trimestre_riferimento`: anno + trimestre da `data_inserimento`.
- `anno_riferimento`: anno da `data_inserimento`.

Per stabilità contabile, usare `cb_unitaria_snapshot` nel contratto. Così una modifica futura alla CB dell'agente non cambia lo storico.

Il frontend e il server contano le unità così:

- righe multipunto `POD n:` / `PDR n:` se presenti
- `dual` = 2 unità
- `luce` o `gas` = 1 unità

La commissione totale usa `cb_maturata * unità`, salvo presenza di un valore commissione già normalizzato.

### Vista Baserow consigliata

- `Contratti - agente corrente`: filtrata per agente.
- `Contratti - mese corrente`: filtrata per `mese_riferimento`.
- `Contratti - validati`: `stato_contratto = OK`.
- `Contratti - in attesa`: `stato_contratto = Caricato`.
- `Contratti - bozze`: `stato_contratto = Bozza`.
- `Contratti - inviati`: `stato_contratto = Inviato`.
- `Contratti - scartati`: `stato_contratto = K.O.` oppure `Switch - Out`.

### Permessi minimi

- Agente: crea contratti, legge solo contratti collegati al proprio agente, non modifica target.
- Admin: modifica agenti, target, stati contratto e dati economici.

## Comandi

```text
npm run dev             Avvio sviluppo con watch
npm start               Avvio produzione locale
npm test                Test Node
npm run lint            ESLint
npm run build           Controllo build/statico
npm run hash-password   Genera hash bcrypt
```

## Regole operative

- La CB validata conta solo contratti `OK` e usa lo stesso moltiplicatore del target.
- La CB potenziale conta `OK` + `Caricato` + `Inviato` e usa lo stesso moltiplicatore del target.
- I contratti `K.O.` e `Switch - Out` valgono `0`.
- Il target si misura sui contratti `OK`, non sugli inseriti.
- Le statistiche e i target usano il conteggio unità: multipunto se presente, altrimenti `dual` vale 2 e luce/gas valgono 1.
- La riga Baserow resta sempre una sola pratica: il conteggio unità è una regola statistica/economica applicata dall'app.
- L'agente vede solo i propri contratti.
- Validazione: lo stato `OK/K.O./Switch - Out` dovrebbe essere gestito da admin o backoffice, non dall'agente standard.

## Schermate principali

```text
Desktop

┌───────────────┬──────────────────────────────────────────────┐
│ Logo + agente │ Mese selezionato                   Agente    │
│ Dashboard     │ Dashboard                                    │
│ Nuovo         │ [KPI][KPI][KPI][KPI]                         │
│ Contratti     │ [KPI][KPI][KPI][KPI]                         │
│ CB            │                                              │
│ Admin         │ [Donut stati]          [Target mensile]      │
│               │ [Andamento mese]       [Confronto mesi]      │
└───────────────┴──────────────────────────────────────────────┘

Nuovo contratto

┌──────────────────────────────────────────────────────────────┐
│ Nuovo contratto                                               │
├──────────────────────────────┬───────────────────────────────┤
│ Anagrafica cliente           │ Dati contratto                │
│ Ragione sociale              │ ID / mese competenza          │
│ Cellulare, tipo, categoria   │ Fornitore, offerta, operazione│
│ P.IVA/CF, email, indirizzo   │ POD/PDR, pagamento, agente    │
│ Documenti e note                                             │
│                         [Salva bozza] [Salva contratto]      │
└──────────────────────────────────────────────────────────────┘

Mobile

┌─────────────────────┐
│ Logo + nav scroll   │
├─────────────────────┤
│ Dashboard           │
│ [KPI]               │
│ [KPI]               │
│ [Donut stati]       │
│ [Target]            │
│ [Grafici]           │
└─────────────────────┘
```

## Cosa rimandare

- Pipeline commerciale
- Task e appuntamenti
- Email marketing
- Feed attività
- Ruoli complessi
- Automazioni avanzate
- Report amministrativi
