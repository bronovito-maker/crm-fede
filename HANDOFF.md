# Handoff CRM Fede Energia

> Stato codice, schema, backfill, mesi di storno e webhook aggiornato e verificato live al 17 agosto 2026.

## Sintesi

Il modello Contratti/Forniture e attivo:

- una riga `Contratti` per pratica commerciale;
- una riga `Forniture` per ogni POD/PDR;
- Dual standard separato in Luce e Gas;
- multipunto gestito nel form e nella modifica;
- pagamenti, stati e consumi separati per vettore;
- ruolo `spettatore` in sola lettura;
- `codice_crm` automatico come identificativo tecnico del contratto.
- vista dinamica `Switch disponibili` per singolo POD/PDR, inclusi Dual e multipunto.

La migrazione Baserow multipunto e stata eseguita con successo. Il repository e stato testato; il deploy Render della sezione Switch disponibili deve essere eseguito e verificato.

## Stato produzione Baserow

Verifica live dell'11 agosto 2026:

| Tabella            |      ID | Stato                                                             |
| ------------------ | ------: | ----------------------------------------------------------------- |
| `Agenti`           |  925635 | Ruoli inclusi `agente`, `admin`, `spettatore`                     |
| `Contratti`        |  925638 | Primary `codice_crm` formula; link a Clienti e Forniture presenti |
| `Competenze`       |  928679 | Tabella legacy; non usata dal salvataggio corrente                |
| `Fornitori`        |  930259 | Elenco fornitori; `mesi_storno_switch` presente                   |
| `Cutoff_fornitori` |  930260 | Cut-off per fornitore/mese                                        |
| `Clienti`          |  931646 | `pec`, `metodo_pagamento` e `iban` presenti                       |
| `Forniture`        | 1117525 | Schema multipunto completo; `data_switch_ok` presente             |

Esito migrazione del 10 agosto 2026:

- 47 contratti multipunto storici individuati;
- 165 punti fisici creati;
- 46 righe aggregate sostituite;
- 408 forniture esistenti arricchite;
- 619 operazioni totali completate;
- 573 righe finali in `Forniture`;
- 0 duplicati;
- 0 link cliente mancanti;
- 0 indirizzi multipunto mancanti;
- dry-run finale con `operations: 0`.

I report con snapshot, checkpoint e ID creati sono in `migration-reports/`, directory ignorata da Git.

## Allineamento schema e backfill completati

Il 16 agosto 2026 sono stati creati nella tabella live `Clienti`:

- `pec`;
- `metodo_pagamento`;
- `iban`.

Sono stati inoltre creati `Forniture.data_switch_ok` come Date e `Fornitori.mesi_storno_switch` come Number intero non negativo.

Backfill applicati con conferma numerica e dry-run finale:

1. 444 forniture `OK` valorizzate con la `data_inserimento` storica come approssimazione dichiarata.
2. 333 clienti integrati senza sovrascrivere campi esistenti: 333 pagamenti, 230 IBAN e 33 PEC.
3. Dry-run finale `data_switch_ok`: 0 modifiche, 0 anomalie.
4. Dry-run finale Clienti: 0 modifiche.

Non aggiungere colonne omonime con maiuscole o spazi: il backend usa esattamente i nomi sopra. Lo script `baserow:setup-forniture` ora crea questi campi.

Configurazione mesi verificata live il 17 agosto 2026:

| Fornitore | Mesi dopo ingresso in fornitura | Stato regola |
| --------- | ------------------------------: | ------------ |
| Hera      |                               0 | confermata   |
| Estra     |                               4 | confermata   |
| Duferco   |                               6 | provvisoria  |
| Sev Iren  |                               4 | provvisoria  |
| Sorgenia  |                               4 | provvisoria  |
| Eni       |                               4 | provvisoria  |

I valori restano modificabili dalla configurazione Admin senza deploy. I webhook Baserow `Forniture` e `Contratti` sono attivi, protetti dal segreto Render e verificati con risposta `200 OK`. Il collaudo reversibile `K.O. -> Caricato -> K.O.` ha confermato la propagazione padre/figlie e il ripristino finale senza date spurie.

Il periodo di storno decorre da `data_inizio_fornitura` dell'ultimo switch `OK`. I valori configurati sono quindi mesi aggiuntivi dopo l'ingresso in fornitura: Hera vale `0`, perche i due mesi di ingresso sono gia rappresentati da `data_inizio_fornitura`. Solo per gli storici senza tale data il motore usa `data_switch_ok` e poi `data_inserimento` come fallback.

## Configurazione Render

Variabili Baserow necessarie per il modello corrente:

```dotenv
BASEROW_BASE_URL=https://api.baserow.io
BASEROW_TOKEN=...
BASEROW_TABLE_AGENTI_ID=925635
BASEROW_TABLE_CONTRATTI_ID=925638
BASEROW_TABLE_COMPETENZE_ID=928679
BASEROW_TABLE_FORNITORI_ID=930259
BASEROW_TABLE_CUTOFF_FORNITORI_ID=930260
BASEROW_TABLE_CLIENTI_ID=931646
BASEROW_TABLE_FORNITURE_ID=1117525
BASEROW_FIELD_FORNITORI_MESI_STORNO=mesi_storno_switch
BASEROW_FIELD_FORNITURE_DATA_SWITCH_OK=data_switch_ok
BASEROW_WEBHOOK_SECRET=...
```

I nomi campo configurabili e i servizi opzionali sono elencati in [.env.example](./.env.example).

`BASEROW_JWT_TOKEN` non e una variabile runtime e non deve restare su Render: serve solo temporaneamente allo script di setup schema.

Configurazione consigliata del servizio:

```text
Build command: npm ci
Start command: npm start
Health check: /api/health
NODE_ENV: production
```

Il filesystem Render puo essere effimero. Se `SESSION_DB_PATH` punta al disco locale senza persistent disk, le sessioni possono perdersi a redeploy/riavvio. Per mantenerle serve un percorso su volume persistente oppure un session store esterno.

## Ruoli

### Agente

- vede contratti nel proprio scope;
- crea, modifica ed elimina i contratti consentiti;
- vede i clienti assegnati e quelli senza agente;
- non accede alle viste amministrative globali.

### Admin

- vede dati e statistiche globali;
- assegna contratti ad altri agenti;
- crea/modifica account;
- modifica cut-off e stato inviato;
- dispone di tutte le scritture applicative.

### Spettatore

- vede tutto cio che espongono le viste amministrative;
- non vede `Nuovo contratto`;
- non puo creare, modificare o eliminare contratti/clienti;
- non puo gestire agenti o cut-off;
- riceve `403 READ_ONLY_ROLE` o `403 ADMIN_REQUIRED` sui tentativi diretti di scrittura.

## Modello Contratti/Forniture

`Contratti` conserva dati comuni: cliente, agente, fornitore, offerta, documenti, competenza e campi legacy.

`Forniture` conserva dati del singolo punto:

- link `contratto`;
- link `cliente` singolo;
- `intestatario` ricercabile;
- POD oppure PDR;
- indirizzo specifico;
- stato e pagamento;
- potenze per i POD;
- consumo annuo del relativo vettore;
- metodo di inserimento Hera.

Il conteggio per statistiche e CB usa il numero reale delle figlie. Se un contratto storico non ha figlie, resta disponibile il fallback sui campi padre.

## Modifica multipunto

Il frontend riceve l'array normalizzato `forniture` e inserisce l'ID Baserow in ogni riga del form. Al salvataggio invia `puntiFornitura` JSON.

Il backend abbina una figlia in questo ordine:

1. ID esplicito presente nel contratto corrente;
2. coppia `tipo:codice`;
3. fallback per tipo solo quando esiste esattamente un punto desiderato e una riga esistente dello stesso tipo.

Le righe non trattenute vengono eliminate. ID duplicati, codici duplicati o punti incompatibili col tipo contratto sono bloccati dalla validazione.

## Stati e pagamenti

Per i Dual:

- `statoLuce` aggiorna tutte le righe Luce;
- `statoGas` aggiorna tutte le righe Gas;
- il form usa un solo `metodoPagamento`, applicato a tutte le forniture Luce/Gas del contratto; i vecchi campi separati restano accettati soltanto per compatibilita API;
- stati diversi vengono mostrati come `Misto` sul riepilogo.

La route `PATCH /api/contracts/:id/status` aggiorna padre e tutte le figlie. Una modifica manuale del padre in Baserow viene recepita se le figlie hanno ancora uno stato uniforme. Considerare il TTL cache, predefinito 15 secondi.

## Consumi e potenze

- Per un contratto non multipunto, `Consumo annuo luce` e `Consumo annuo gas` vengono salvati rispettivamente in kWh e Smc.
- Nel multipunto ogni POD/PDR ha il proprio `consumoAnnuo`, salvato nella specifica riga `Forniture`.
- Nel form di inserimento gli stati Luce/Gas non sono selezionabili: le nuove forniture partono automaticamente da `Caricato`; le modifiche preservano gli stati esistenti.
- Per il multipunto ogni POD espone la propria potenza impegnata.
- La potenza disponibile e read-only nel browser e ricalcolata dal server con `impegnata * 1,10`.

Per i dati storici la migrazione ha conservato i valori disponibili senza inventare potenze o consumi mancanti.

## Hera

Selezionando Hera compare `Metodo di inserimento`, obbligatorio per il salvataggio completo. Valori ammessi, case-sensitive:

- `AppAround`;
- `Cartaceo`.

## Competenza e cut-off

Ordine applicato:

1. Se il form invia un mese competenza valido, il server lo usa.
2. Altrimenti cerca il cut-off del fornitore per il mese di inserimento.
3. Entro il cut-off incluso assegna il mese successivo.
4. Dopo il cut-off assegna due mesi dopo il mese di inserimento.
5. Senza cut-off mantiene il mese di inserimento.

Quando si verifica un problema di competenza controllare prima `Cutoff_fornitori`, il nome normalizzato del fornitore e il valore gia salvato in `mese_riferimento`. Modificare `Competenze` non cambia il calcolo corrente dei nuovi contratti.

## Operazioni Baserow

### Setup schema

```bash
BASEROW_JWT_TOKEN=... npm run baserow:setup-forniture
```

Lo script aggiunge solo campi mancanti per Contratti/Forniture e l'opzione `spettatore`. Non completa attualmente i tre campi mancanti di `Clienti`; crearli manualmente o estendere lo script in una modifica dedicata.

### Migrazione date switch e Clienti

Eseguire prima i dry-run:

```bash
npm run baserow:backfill-switch-ok
npm run baserow:backfill-clienti
```

Solo dopo il controllo puntuale dell'output:

```bash
npm run baserow:backfill-switch-ok -- --apply --confirm=N
npm run baserow:backfill-clienti -- --apply --confirm=N
```

Il primo usa `data_inserimento` come approssimazione per gli `OK` storici. Il secondo non sovrascrive mai PEC, pagamento o IBAN gia presenti.

### Migrazione multipunto

Dry-run:

```bash
npm run baserow:migrate-multipoint
```

Applicazione, solo dopo aver letto il report:

```bash
npm run baserow:migrate-multipoint -- --apply --confirm=N
```

La produzione e gia migrata e il dry-run atteso e `operations: 0`. Non eseguire `--apply` con un valore diverso da zero senza una nuova analisi dei dati.

### Script legacy

`npm run baserow:migrate-forniture` appartiene alla prima migrazione Dual. Sul modello multipunto puo segnalare tipi duplicati come anomalie ed e lasciato solo per tracciabilita storica. Non applicarlo in produzione.

## Verifiche rilascio

Automatiche:

```bash
npm ci
npm test
npm run lint
npm run build
npm run format:check
npm audit --omit=dev
```

Smoke test:

```bash
npm start
curl http://localhost:3000/api/health
```

Checklist manuale:

1. Login Agente e creazione Luce standard.
2. Creazione Gas standard con consumo gas.
3. Creazione Dual con stati e pagamenti diversi.
4. Creazione multipunto con almeno 2 POD e 1 PDR.
5. Modifica dello stesso multipunto e verifica che il numero di righe non raddoppi.
6. Eliminazione di un punto e verifica della sola riga corrispondente.
7. Ricerca in Baserow `Forniture` per intestatario.
8. Modifica padre a `K.O.` in Baserow, attesa TTL e refresh CRM.
9. Login Spettatore: dati visibili, `Nuovo contratto` assente, scritture bloccate.
10. Upload reale su R2 e ricezione notifica Resend, se configurata.
11. Verifica della configurazione mesi di storno per tutti i fornitori.
12. Verifica Switch disponibili il 14 e il 15 del mese utile.
13. Sequenza `OK -> CARICATO -> K.O. -> CARICATO -> OK` sullo stesso POD/PDR.
14. Modifica diretta dello stato sia in `Forniture` sia in `Contratti` e verifica automatica di stato e `data_switch_ok` via webhook.

## Test attuali

La suite copre:

- normalizzazione e validazione contratti;
- punti multipunto, duplicati e potenze;
- creazione multipla e compensazioni Baserow;
- aggregazione stati e conteggi unita;
- cut-off e competenze;
- autorizzazioni Spettatore;
- route principali con fetch mockato;
- sessioni SQLite.
- motore switch per giorno 15, retry, Cambio listino, subentro e multipunto.

## Attivita aperte

- [x] Applicare e verificare lo schema live per Clienti, `data_switch_ok` e mesi di storno.
- [x] Eseguire i due backfill dopo aver controllato i dry-run.
- [x] Inserire e verificare i mesi di storno per tutti i fornitori.
- [x] Configurare e provare i webhook Baserow di `Forniture` e `Contratti`.
- [ ] Eseguire uno smoke test completo sul deploy Render successivo al commit multipunto.
- [ ] Verificare persistenza `SESSION_DB_PATH` su Render.
- [ ] Verificare upload R2 con file reale e URL pubblico.
- [ ] Verificare dominio mittente e consegna Resend.
- [ ] Testare Google Places e righe multipunto su Safari iOS.
- [ ] Ruotare eventuali token condivisi fuori dal secret manager e aggiornare Render/.env.

## Regole di manutenzione

- Rispondere e documentare in italiano.
- Non mettere segreti nei file versionati o nei report committati.
- Non cambiare manualmente IDs di righe figlie.
- Non usare comandi Git distruttivi su un worktree con modifiche utente.
- Prima di migrazioni: dry-run, report, conteggio esatto, backup e verifica post-run.
- Dopo modifiche al modello: aggiornare `README.md`, `ARCHITETTURA-MVP.md`, `HANDOFF.md` e `.env.example` nello stesso commit.
