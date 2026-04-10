# CRM Energia MVP

## Obiettivo

Prodotto interno per agente commerciale energia. L'MVP fa solo tre cose: inserire contratti, leggere la propria CB, capire quanto manca ai target. Ogni pagina deve aiutare l'agente a decidere o completare un'azione in pochi secondi.

Principio UI: mobile-first. L'agente deve poter usare l'app da telefono senza zoom, senza tabelle compresse e senza campi inutili.

## Architettura frontend

- `index.html`: shell applicativa, navigazione e pagine principali.
- `styles.css`: design system minimale con layout responsive.
- `app.js`: stato demo, rendering UI, filtri, salvataggio locale in `localStorage`.
- Integrazione futura Baserow: sostituire l'array `contracts` con chiamate API filtrate per `agente_id`.

Per un MVP reale consigliato:

- Vite + React oppure SvelteKit se serve routing e build moderna.
- Nessun backend custom nella prima versione se Baserow gestisce dati e permessi.
- Un piccolo layer `baserowClient` con funzioni `listContracts`, `createContract`, `getAgentStats`.
- Autenticazione separata o token server-side se l'app diventa pubblica. Non esporre token Baserow admin nel browser.
- Stato MVP attuale: prototipo statico apribile da browser, senza build step e senza backend.

### Struttura consigliata quando si passa a Baserow

```text
src/
  app/
    AppShell
    navigation
  pages/
    Dashboard
    NewContract
    Contracts
    Cb
    Progress
  components/
    MetricCard
    Panel
    StatusBadge
    ProgressBar
    charts
    tables
  services/
    baserowClient
    stats
  utils/
    dates
    money
```

Il frontend deve chiedere a Baserow solo dati dell'agente corrente. Se l'app viene pubblicata online, il token Baserow va protetto dietro un piccolo proxy/API server.

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
- Cellulare
- Tipo cliente
- P.IVA
- Email
- Indirizzo
- Indirizzo fatturazione
- Indirizzo fornitura
- Descrizione / note
- Stato contratto
- Agente assegnato

Scelta UX: il valore predefinito di `stato_contratto` è `in attesa`. L'agente inserisce, la validazione avviene dopo.

Nel form agente lo stato non deve essere modificabile: viene mostrato come `In attesa` e salvato automaticamente.

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
- Quanto manca
- Media giornaliera necessaria
- Messaggio diretto e utile

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

| Campo | Tipo | Note |
| --- | --- | --- |
| `id` | Autonumber | ID interno Baserow |
| `nome` | Testo | Nome agente |
| `email` | Email | Unica per agente |
| `cb_unitaria` | Numero decimale | Valore CB base per contratto |
| `target_mensile` | Numero intero | Contratti validati |
| `target_trimestrale` | Numero intero | Contratti validati |
| `target_annuale` | Numero intero | Contratti validati |
| `ruolo` | Single select | `agente`, `admin` |
| `attivo` | Boolean | Per nascondere agenti disattivati |
| `created_at` | Created on | Audit |
| `updated_at` | Last modified | Audit |

### Tabella `Contratti`

| Campo | Tipo | Note |
| --- | --- | --- |
| `id` | Autonumber | ID interno Baserow |
| `agente` | Link to table | Relazione verso `Agenti` |
| `data_inserimento` | Date | Default oggi |
| `ragione_sociale` | Testo | Cliente o azienda |
| `cellulare` | Testo | Meglio testo, non numero |
| `tipo_cliente` | Single select | `Business`, `Privato`, `Condominio` |
| `piva` | Testo | Opzionale |
| `email` | Email | Opzionale |
| `indirizzo` | Long text | Indirizzo principale |
| `indirizzo_fatturazione` | Long text | Opzionale |
| `indirizzo_fornitura` | Long text | Opzionale |
| `descrizione` | Long text | Note |
| `stato_contratto` | Single select | `in attesa`, `validato`, `scartato` |
| `cb_maturata` | Formula/Numero | `0` se scartato, altrimenti valore CB |
| `mese_riferimento` | Formula | `YYYY-MM` da `data_inserimento` |
| `trimestre_riferimento` | Formula | `YYYY-Qn` |
| `anno_riferimento` | Formula | `YYYY` |
| `created_at` | Created on | Audit |
| `updated_at` | Last modified | Audit |

### Formule consigliate

- `cb_maturata`: se `stato_contratto = scartato`, valore `0`; altrimenti usa la CB unitaria dell'agente o un numero copiato al momento dell'inserimento.
- `mese_riferimento`: anno e mese da `data_inserimento`.
- `trimestre_riferimento`: anno + trimestre da `data_inserimento`.
- `anno_riferimento`: anno da `data_inserimento`.

Per stabilita contabile, in produzione conviene salvare anche `cb_unitaria_snapshot` nel contratto. Cosi una modifica futura alla CB dell'agente non cambia lo storico.

### Vista Baserow consigliata

- `Contratti - agente corrente`: filtrata per agente.
- `Contratti - mese corrente`: filtrata per `mese_riferimento`.
- `Contratti - validati`: `stato_contratto = validato`.
- `Contratti - in attesa`: `stato_contratto = in attesa`.
- `Contratti - scartati`: `stato_contratto = scartato`.

### Permessi minimi

- Agente: crea contratti, legge solo contratti collegati al proprio agente, non modifica target.
- Admin: modifica agenti, target, stati contratto e dati economici.
- Validazione: lo stato `validato/scartato` dovrebbe essere gestito da admin o backoffice, non dall'agente standard.

## Regole MVP

- La CB validata conta solo contratti `validato`.
- La CB potenziale conta `validato` + `in attesa`.
- I contratti `scartato` valgono `0`.
- Il target si misura sui contratti validati, non sugli inseriti.
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
│ Tipo cliente                 │ P.IVA                         │
│ Email                        │ Stato                         │
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
