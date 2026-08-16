# CRM Fede Energia

CRM interno per inserimento e gestione di contratti energia, clienti, forniture Luce/Gas, competenze, CB e target commerciali.

## Stato attuale

- Backend Node.js + Express e frontend SPA in JavaScript senza framework.
- Baserow e la fonte dati applicativa; il browser accede solo alle API interne del server.
- Un contratto resta una singola pratica commerciale.
- Ogni POD o PDR occupa una riga autonoma nella tabella Baserow `Forniture`.
- Un Dual standard genera due forniture; un multipunto con 5 POD e 1 PDR ne genera 6.
- I ruoli disponibili sono `agente`, `admin` e `spettatore`.
- La sezione `Switch disponibili` deriva una sola opportunita per POD/PDR dallo storico reale.
- La migrazione multipunto storica e stata completata il 10 agosto 2026.

La configurazione e lo stato di produzione sono descritti in [HANDOFF.md](./HANDOFF.md). Le scelte tecniche e lo schema dati sono descritti in [ARCHITETTURA-MVP.md](./ARCHITETTURA-MVP.md).

## Avvio locale

Requisiti: Node.js 20 o successivo e accesso alle tabelle Baserow del progetto.

```bash
npm ci
cp .env.example .env
npm run dev
```

Il CRM viene esposto normalmente su `http://localhost:3000`. La porta puo essere cambiata con `PORT`.

Variabili minime per avere un health check positivo e usare autenticazione/contratti:

```dotenv
BASEROW_TOKEN=...
BASEROW_TABLE_AGENTI_ID=...
BASEROW_TABLE_CONTRATTI_ID=...
```

Per il modello dati corrente sono necessarie anche le tabelle `Forniture` e `Clienti`. Fornitori, cut-off, upload e notifiche richiedono le rispettive variabili elencate in [.env.example](./.env.example).

Non committare mai `.env`, JWT temporanei, token Baserow o credenziali R2/Resend.

## Comandi

| Comando                              | Scopo                                            |
| ------------------------------------ | ------------------------------------------------ |
| `npm run dev`                        | Avvia il server con watch                        |
| `npm start`                          | Avvia il server senza watch                      |
| `npm test`                           | Esegue i test Node                               |
| `npm run coverage`                   | Esegue i test con copertura                      |
| `npm run lint`                       | Controlla il codice con ESLint                   |
| `npm run build`                      | Verifica la sintassi dei file runtime            |
| `npm run format:check`               | Controlla la formattazione Prettier              |
| `npm run hash-password -- password`  | Genera un hash bcrypt per un account             |
| `npm run baserow:setup-forniture`    | Completa lo schema con un JWT Baserow temporaneo |
| `npm run baserow:migrate-multipoint` | Esegue il dry-run della migrazione multipunto    |
| `npm run baserow:backfill-switch-ok` | Dry-run delle date storiche di passaggio a OK    |
| `npm run baserow:backfill-clienti`   | Dry-run dei campi mancanti sulle anagrafiche     |

`baserow:migrate-forniture` e lo script legacy usato per il primo passaggio Dual. Non va applicato sul modello multipunto gia migrato.

## Flusso applicativo

```text
Browser
  -> /api/*
  -> server.js
       -> Baserow: dati CRM
       -> SQLite: sessioni
       -> R2/S3: allegati
       -> Resend: notifiche opzionali
```

Il token Baserow e gli ID delle tabelle non vengono esposti al frontend. `/api/config`, dopo autenticazione, restituisce soltanto la chiave Google Maps necessaria all'autocomplete.

## Ruoli

| Ruolo        | Visibilita                                 | Scrittura                                  |
| ------------ | ------------------------------------------ | ------------------------------------------ |
| `agente`     | Propri contratti e clienti accessibili     | Crea e gestisce i dati consentiti          |
| `admin`      | Dati globali, statistiche e pannello Admin | Accesso completo alle operazioni CRM       |
| `spettatore` | Stesse viste amministrative dell'Admin     | Nessuna creazione, modifica o eliminazione |

Per lo Spettatore la pagina `Nuovo contratto` e nascosta; il backend applica comunque il blocco `403 READ_ONLY_ROLE` su tutte le scritture ordinarie.

## Verifica prima del rilascio

```bash
npm test
npm run lint
npm run build
npm run format:check
npm audit --omit=dev
```

Prima di distribuire leggere la sezione `Stato produzione` di [HANDOFF.md](./HANDOFF.md): contiene lo stato dello schema live, la migrazione eseguita e le verifiche ancora necessarie.
