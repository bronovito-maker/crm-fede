# CRM Energia MVP

## Obiettivo

Prodotto interno per agente commerciale energia. L'MVP fa solo tre cose: inserire contratti, leggere la propria CB, capire quanto manca ai target. Ogni pagina deve aiutare l'agente a decidere o completare un'azione in pochi secondi.

Principio UI: mobile-first. L'agente deve poter usare l'app da telefono senza zoom, senza tabelle compresse e senza campi inutili.

## Architettura

- `server.js`: server Express, serve il frontend e espone API interne controllate.
- `public/index.html`: shell applicativa, navigazione e pagine principali.
- `public/styles.css`: design system minimale con layout responsive.
- `public/app.js`: stato UI, rendering, filtri, feedback e interazioni.
- `public/baserowClient.js`: client API interno. Non chiama Baserow direttamente.
- `public/config.js`: solo flag non sensibili per il frontend.
- `.env`: token Baserow, ID tabelle e agente corrente per MVP.

Flusso dati:

```text
Browser -> /api/agent e /api/contracts -> server.js -> Baserow
```

Il browser non deve conoscere token Baserow, ID tabelle, ID campo Baserow o logica di filtro agente.

### API interne

```text
GET    /api/health
GET    /api/session
POST   /api/login
POST   /api/logout
GET    /api/agent
GET    /api/contracts
POST   /api/contracts
PATCH  /api/contracts/:id/status
GET    /api/admin/agents
POST   /api/admin/agents
PATCH  /api/admin/agents/:id
GET    /api/admin/stats
```

`POST /api/contracts` accetta solo i campi del form agente. Il server aggiunge automaticamente agente, data, stato `Caricato` e `cb_unitaria_snapshot`.

Il login usa email + password. Il server cerca l'agente in Baserow tramite email, confronta la password con `password_hash` e crea una sessione con cookie `HttpOnly`.
Gli endpoint `/api/admin/*` richiedono `ruolo = admin` nella tabella `Agenti`.

### Configurazione `.env`

- `BASEROW_BASE_URL`
- `BASEROW_TOKEN`
- `BASEROW_TABLE_AGENTI_ID`
- `BASEROW_TABLE_CONTRATTI_ID`
- `BASEROW_FIELD_CONTRATTI_AGENTE`
- `SESSION_TTL_HOURS`
- `BCRYPT_ROUNDS`
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

### Nuovo contratto

Pagina più importante. Layout a 2 colonne desktop, 1 colonna mobile. Campi ridotti al minimo:

- Ragione sociale o nome cliente
- ID contratto
- Cellulare
- Tipo cliente
- Categoria cliente: prospect o switch ricorrente
- P.IVA
- Email
- Fornitore
- Nome offerta
- Tipo operazione
- Tipo fornitura
- POD/PDR in base alla fornitura
- Metodo pagamento
- IBAN se pagamento RID
- Documenti contratto: PDF, Office/OpenDocument e immagini da telefono
- Indirizzo
- Indirizzo fatturazione
- Indirizzo fornitura
- Descrizione / note
- Agente assegnato

Scelta UX: il valore predefinito di `stato_contratto` è `Caricato`. L'agente inserisce, la validazione avviene dopo.

Nel form agente lo stato non deve essere modificabile ne visibile: viene salvato automaticamente come `Caricato`. Al suo posto l'agente sceglie la categoria cliente: `prospect` o `switch ricorrente`.

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

Su mobile la tabella diventa una lista di schede, con etichetta visibile per ogni valore.

### CB

Pagina guadagni:

- CB del mese
- CB validata
- CB in attesa
- Conteggio contratti per stato
- Tabella sintetica contratti collegati

### Avanzamento

Pagina motivazionale:

- Target mensile, trimestrale, annuale
- Percentuale raggiunta
- Barre percentuali per target mensile, trimestrale e annuale
- Quanto manca
- Media giornaliera necessaria
- Messaggio diretto e utile

### Admin

Visibile solo agli agenti con `ruolo = admin`.

MVP admin:

- creazione agente con password hashata lato server
- lista agenti
- modifica dati agente
- modifica ruolo e stato attivo
- statistiche globali mese corrente
- statistiche per agente su target mensile, trimestrale e annuale

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
| `id_contratto`           | Testo           | ID interno o esterno del contratto                                                       |
| `ragione_sociale`        | Testo           | Cliente o azienda                                                                        |
| `cellulare`              | Testo           | Meglio testo, non numero                                                                 |
| `tipo_cliente`           | Single select   | `Business`, `Privato`, `Condominio`                                                      |
| `categoria_cliente`      | Single select   | `prospect`, `switch ricorrente`                                                          |
| `fornitore`              | Testo           | Nome fornitore                                                                           |
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
| `indirizzo`              | Long text       | Indirizzo principale                                                                     |
| `indirizzo_fatturazione` | Long text       | Opzionale                                                                                |
| `indirizzo_fornitura`    | Long text       | Opzionale                                                                                |
| `descrizione`            | Long text       | Note                                                                                     |
| `stato_contratto`        | Single select   | `Caricato`, `OK`, `K.O.`, `Switch - Out`                                                 |
| `cb_maturata`            | Formula/Numero  | `0` se `K.O.` o `Switch - Out`, altrimenti valore CB                                     |
| `mese_riferimento`       | Formula         | `YYYY-MM` da `data_inserimento`                                                          |
| `trimestre_riferimento`  | Formula         | `YYYY-Qn`                                                                                |
| `anno_riferimento`       | Formula         | `YYYY`                                                                                   |
| `created_at`             | Created on      | Audit                                                                                    |
| `updated_at`             | Last modified   | Audit                                                                                    |

### Formule consigliate

- `cb_maturata`: se `stato_contratto = K.O.` o `Switch - Out`, valore `0`; altrimenti usa la CB unitaria dell'agente o un numero copiato al momento dell'inserimento.
- `mese_riferimento`: anno e mese da `data_inserimento`.
- `trimestre_riferimento`: anno + trimestre da `data_inserimento`.
- `anno_riferimento`: anno da `data_inserimento`.

Per stabilita contabile, in produzione conviene salvare anche `cb_unitaria_snapshot` nel contratto. Cosi una modifica futura alla CB dell'agente non cambia lo storico.

### Vista Baserow consigliata

- `Contratti - agente corrente`: filtrata per agente.
- `Contratti - mese corrente`: filtrata per `mese_riferimento`.
- `Contratti - validati`: `stato_contratto = OK`.
- `Contratti - in attesa`: `stato_contratto = Caricato`.
- `Contratti - scartati`: `stato_contratto = K.O.` oppure `Switch - Out`.

### Permessi minimi

- Agente: crea contratti, legge solo contratti collegati al proprio agente, non modifica target.
- Admin: modifica agenti, target, stati contratto e dati economici.
- Validazione: lo stato `OK/K.O./Switch - Out` dovrebbe essere gestito da admin o backoffice, non dall'agente standard.

## Regole MVP

- La CB validata conta solo contratti `OK` e usa lo stesso moltiplicatore del target.
- La CB potenziale conta `OK` + `Caricato` e usa lo stesso moltiplicatore del target.
- I contratti `K.O.` e `Switch - Out` valgono `0`.
- Il target si misura sui contratti `OK`, non sugli inseriti.
- Le statistiche e i target usano il conteggio ponderato: `tipo_fornitura = dual` e `categoria_cliente = prospect` vale `2` contratti.
- Tutti gli altri casi valgono `1` contratto, inclusi dual con `categoria_cliente = switch ricorrente`.
- La riga Baserow resta sempre una sola pratica: il doppio conteggio e una regola statistica/economica applicata dall'app.
- L'agente vede solo i propri contratti.

## Wireframe testuale

```text
Desktop

┌───────────────┬──────────────────────────────────────────────┐
│ Logo + agente │ Aprile 2026                         Agente   │
│ Dashboard     │ Dashboard                                    │
│ Nuovo         │ [KPI][KPI][KPI][KPI]                         │
│ Contratti     │ [KPI][KPI][KPI][KPI]                         │
│ CB            │                                              │
│ Avanzamento   │ [Donut stati]          [Target mensile]      │
│               │ [Andamento mese]       [Confronto mesi]      │
└───────────────┴──────────────────────────────────────────────┘

Nuovo contratto

┌──────────────────────────────────────────────────────────────┐
│ Nuovo contratto                         Tempo: meno di 1 min │
├──────────────────────────────┬───────────────────────────────┤
│ Ragione sociale              │ Cellulare                     │
│ Tipo cliente                 │ Categoria cliente             │
│ Email                        │ P.IVA                         │
│ Indirizzo                    │ Agente                        │
│ Indirizzo fatturazione       │ Indirizzo fornitura           │
│ Note                                                         │
│                                      [Salva contratto]        │
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
