# Architettura CRM Fede Energia

> Documento tecnico aggiornato al 17 agosto 2026. Colonne, backfill, mesi fornitori e webhook sono stati verificati live.

## Obiettivo

Il CRM gestisce il ciclo operativo dei contratti energia: inserimento, anagrafica cliente, punti di fornitura, documenti, competenza commerciale, stati, CB, target e viste amministrative.

Principi del progetto:

- interfaccia mobile-first utilizzabile dagli agenti sul campo;
- credenziali e logica autorizzativa solo sul server;
- una pratica commerciale in `Contratti`, una riga per ogni POD/PDR in `Forniture`;
- compatibilita in lettura con i campi storici presenti sul contratto padre;
- modifiche Baserow retroattive eseguite con dry-run, conferma esatta e report locale.

## Stack

| Livello              | Tecnologia                                                          |
| -------------------- | ------------------------------------------------------------------- |
| Backend              | Node.js, Express 5                                                  |
| Frontend             | SPA Vanilla JavaScript, HTML e CSS                                  |
| Database applicativo | Baserow REST API                                                    |
| Sessioni             | SQLite tramite `better-sqlite3`                                     |
| Allegati             | multer in memoria, compressione immagini con `sharp`, storage R2/S3 |
| Notifiche            | Resend opzionale                                                    |
| Sicurezza            | Helmet/CSP, bcrypt, cookie HttpOnly, rate limiting                  |
| Test e qualita       | Node test runner, ESLint, Prettier, controllo sintassi custom       |

File principali:

```text
server.js                         API, autenticazione e integrazione Baserow
public/index.html                 struttura della SPA
public/app.js                     stato, rendering e interazioni frontend
public/styles.css                 layout responsive e componenti visuali
public/baserowClient.js           client HTTP verso /api/*
switch-opportunities.js           motore puro della disponibilita per POD/PDR
scripts/setup-baserow-forniture.js setup schema con JWT temporaneo
scripts/migrate-multipoint-supplies.js migrazione chirurgica multipunto
scripts/backfill-switch-ok-dates.js backfill dry-run delle date OK
scripts/backfill-client-fields.js  backfill dry-run dei campi Clienti
test/                             test di logica, route, validazione e transazioni
```

## Confini di sicurezza

```text
Browser -> API Express -> Baserow
                    |-> SQLite sessioni
                    |-> R2/S3 allegati
                    `-> Resend
```

Il browser non riceve `BASEROW_TOKEN`, ID interni delle tabelle, credenziali storage o hash password. L'endpoint autenticato `/api/config` espone soltanto `googleMapsApiKey`.

Il server applica:

- cookie `crm_session` con `HttpOnly`, `SameSite=Lax` e `Secure` in produzione;
- sessioni persistenti con durata predefinita di 12 ore;
- redirect HTTPS quando `NODE_ENV=production` e il proxy invia `x-forwarded-proto`;
- massimo 10 tentativi login falliti ogni 15 minuti;
- massimo 120 richieste al minuto sulle letture principali;
- body JSON massimo 100 KB;
- massimo 10 allegati da 15 MB ciascuno;
- whitelist di documenti Office/OpenDocument, PDF e immagini comuni.

## Ruoli e autorizzazioni

| Capacita                                     | Agente                 | Admin | Spettatore |
| -------------------------------------------- | ---------------------- | ----- | ---------- |
| Vedere i propri contratti                    | Si                     | Si    | Si         |
| Vedere tutti i contratti e statistiche Admin | No                     | Si    | Si         |
| Vedere tutti i clienti                       | No                     | Si    | Si         |
| Creare/modificare/eliminare contratti        | Si, nel proprio ambito | Si    | No         |
| Gestire agenti e cut-off                     | No                     | Si    | No         |
| Vedere `Nuovo contratto`                     | Si                     | Si    | No         |
| Vedere gli switch disponibili                | Solo i propri          | Tutti | Tutti      |

Le viste amministrative usano `requireAdminViewer`, valido per `admin` e `spettatore`. Le scritture amministrative usano `requireAdmin`, valido solo per `admin`. Le altre scritture chiamano `assertCanWrite`, che risponde `403 READ_ONLY_ROLE` allo Spettatore.

## Modello dati

### Relazioni

```text
Agenti 1 ---- N Contratti
Clienti 1 --- N Contratti
Contratti 1 - N Forniture
Clienti 1 --- N Forniture
```

`Contratti` rappresenta la pratica commerciale. `Forniture` rappresenta i punti fisici. Il link `cliente` sulla figlia e affiancato da `intestatario`, utile per ricerca e filtri diretti in Baserow.

Esempi:

| Contratto CRM            | Righe `Contratti` | Righe `Forniture` |
| ------------------------ | ----------------: | ----------------: |
| Luce standard            |                 1 |             1 POD |
| Gas standard             |                 1 |             1 PDR |
| Dual standard            |                 1 |     1 POD + 1 PDR |
| Multipunto 5 POD + 1 PDR |                 1 |                 6 |

### Tabella `Agenti` live

| Campo                | Tipo          | Note                                |
| -------------------- | ------------- | ----------------------------------- |
| `nome`               | Text, primary | Nome account                        |
| `email`              | Email         | Identificativo login                |
| `password_hash`      | Text          | Hash bcrypt, mai password in chiaro |
| `cb_unitaria`        | Number        | Valore unitario usato per CB        |
| `target_mensile`     | Number        | Target mese                         |
| `target_trimestrale` | Number        | Target trimestre                    |
| `target_annuale`     | Number        | Target anno                         |
| `ruolo`              | Single select | `agente`, `admin`, `spettatore`     |
| `attivo`             | Boolean       | Abilitazione account                |
| `Contratti`          | Link row      | Relazione inversa verso contratti   |

### Tabella `Contratti` live

Campi principali:

| Area                | Campi                                                                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Identita            | `codice_crm` formula primary, `id_contratto` opzionale                                                                                  |
| Assegnazione        | `agente`, `cliente`, `data_inserimento`                                                                                                 |
| Cliente             | `ragione_sociale`, `cellulare`, `tipo_cliente`, `categoria_cliente`, `piva`, `email`, `pec`, `amministratore`, `indirizzo_fatturazione` |
| Commerciale         | `fornitore`, `fornitore_ref`, `ex_fornitore`, `nome_offerta`, `tipo_operazione`, `tipo_fornitura`                                       |
| Compatibilita punti | `pod`, `pdr`, `indirizzo_fornitura`, `metodo_pagamento`                                                                                 |
| Stato e CB          | `stato_contratto`, `cb_unitaria_snapshot`, `cb_maturata`                                                                                |
| Competenza          | `mese_riferimento`, `trimestre_riferimento`, `anno_riferimento`, `data_inizio_fornitura`                                                |
| Contenuti           | `file_contratto`, `descrizione`                                                                                                         |
| Relazione inversa   | `Forniture`                                                                                                                             |

`codice_crm` usa la formula `concat('CRM-', row_id())`; e automatico e stabile. `id_contratto` rimane il codice commerciale facoltativo.

I campi POD/PDR/stato/pagamento sul padre restano per compatibilita e riepilogo. I valori operativi per punto sono autorevoli in `Forniture`.

### Tabella `Forniture` live

| Campo                 | Tipo                  | Regola                                        |
| --------------------- | --------------------- | --------------------------------------------- |
| `nome`                | Text, primary         | Cliente, vettore e codice punto               |
| `contratto`           | Link row -> Contratti | Obbligatorio                                  |
| `cliente`             | Link row -> Clienti   | Una sola relazione                            |
| `intestatario`        | Text                  | Copia ricercabile del nome cliente            |
| `tipo_fornitura`      | Single select         | `luce` o `gas`                                |
| `stato`               | Single select         | Stato operativo del vettore                   |
| `metodo_pagamento`    | Single select         | `bollettino` o `rid`                          |
| `pod`                 | Text                  | Solo Luce                                     |
| `pdr`                 | Text                  | Solo Gas                                      |
| `indirizzo_fornitura` | Text                  | Indirizzo del singolo punto                   |
| `metodo_inserimento`  | Single select         | `AppAround` o `Cartaceo` per Hera             |
| `potenza_impegnata`   | Number                | Solo POD                                      |
| `potenza_disponibile` | Number                | `potenza_impegnata * 1,10`, calcolata dal CRM |
| `consumo_annuo`       | Number                | kWh su Luce, Smc su Gas                       |
| `data_switch_ok`      | Date                  | Data effettiva dell'ultimo ingresso in `OK`   |

La modifica CRM riutilizza l'ID della riga figlia quando disponibile. In alternativa il backend effettua un match conservativo per tipo e codice. Le righe non piu presenti nel form vengono eliminate solo dopo aver salvato quelle desiderate; in caso di errore vengono eseguite compensazioni.

### Tabella `Clienti` live

| Campo                    | Tipo               |
| ------------------------ | ------------------ |
| `Ragione Sociale`        | Text, primary      |
| `piva`                   | Text               |
| `email`                  | Email              |
| `cellulare`              | Text               |
| `indirizzo_fatturazione` | Long text          |
| `agente`                 | Link row -> Agenti |
| `tipo_cliente`           | Single select      |
| `categoria_cliente`      | Single select      |
| `pec`                    | Email              |
| `metodo_pagamento`       | Single select      |
| `iban`                   | Text               |
| `Forniture`              | Link row inverso   |

I campi `pec`, `metodo_pagamento` e `iban` sono stati creati e verificati live il 16 agosto 2026. Il backfill ha integrato 333 clienti senza sovrascritture e il dry-run finale ha restituito zero modifiche.

### Tabelle di supporto

- `Competenze`: tabella legacy ancora configurabile, ma non usata dal salvataggio corrente.
- `Fornitori`: elenco fornitori e campo intero `mesi_storno_switch`.
- `Cutoff_fornitori`: cut-off specifico per coppia fornitore/mese.

## Flusso contratto

### Creazione

1. Il frontend valida il form e invia `multipart/form-data`.
2. Il server normalizza dati, stati, pagamenti e `puntiFornitura` JSON.
3. Gli allegati vengono validati, le immagini compresse e i file caricati su R2.
4. Il server calcola competenza e `cb_unitaria_snapshot`.
5. Viene creata la riga padre `Contratti`.
6. Viene sincronizzato e collegato il cliente quando possibile.
7. Viene creata una riga `Forniture` per ogni POD/PDR.
8. Se una fornitura fallisce, vengono eliminate le figlie gia create e il padre.

### Modifica

1. Il server verifica proprieta del contratto o ruolo Admin.
2. Conserva gli allegati esplicitamente mantenuti.
3. Aggiorna padre e anagrafica cliente.
4. Aggiorna/crea/elimina le figlie mantenendo gli ID esistenti.
5. In caso di errore ripristina padre e forniture tramite payload compensativi.

### Eliminazione

Le forniture vengono eliminate prima del contratto padre. Se il padre non puo essere eliminato, il server ricrea le figlie rimosse usando gli snapshot scrivibili.

## Dual, stati e pagamenti

Per un Dual il riepilogo e la gestione amministrativa espongono:

- un solo metodo di pagamento contrattuale, propagato a tutte le righe `Forniture`;
- `Stato Luce` e `Stato Gas`;
- consumo annuo specifico per ogni riga multipunto, in kWh per POD e Smc per PDR.

Uno stato uniforme sulle figlie viene riportato come stato complessivo. Stati diversi producono il valore UI `Misto`. Per compatibilita operativa, una modifica manuale allo stato padre in Baserow viene recepita dal CRM quando tutte le figlie hanno ancora lo stesso stato; stati figlio gia misti rimangono indipendenti.

## Multipunto

Il form `Multipunto` consente di aggiungere piu POD e PDR. Ogni riga richiede, per il salvataggio completo, codice e indirizzo. I POD espongono anche potenza impegnata e disponibile; la disponibile e sempre ricalcolata lato server al +10%, quindi il valore inviato dal browser non e autorevole.

Il backend applica:

- massimo 100 punti per richiesta;
- tipo ammesso solo `luce` o `gas`;
- coerenza tra punti e tipo contratto;
- codice e indirizzo obbligatori fuori dalle bozze;
- unicita di tipo + codice;
- unicita degli ID figlia inviati in modifica;
- numeri non negativi per potenze e consumi.

## Hera

Quando `fornitore` normalizzato e Hera, compare `Metodo di inserimento`. Per un contratto completo il valore deve essere `AppAround` oppure `Cartaceo`. Il campo viene salvato sulle forniture figlie.

## Competenza e cut-off

La competenza e calcolata dal server, non dal browser. Se il mese viene scelto esplicitamente nel form, quel valore viene rispettato. In assenza di scelta:

- senza cut-off configurato: mese della data di inserimento;
- inserimento entro la data di cut-off inclusa: mese successivo;
- inserimento dopo il cut-off: due mesi dopo il mese di inserimento.

Il server salva `mese_riferimento`, `trimestre_riferimento` e `anno_riferimento`. Il calcolo corrente consulta `Cutoff_fornitori`; non usa la vecchia tabella `Competenze` come fallback.

## Switch disponibili

La schermata non usa una tabella di appoggio. `switch-opportunities.js` espande ogni pratica in eventi per singola fornitura, raggruppati tramite `luce:POD` o `gas:PDR`. Per i contratti storici senza figlie usa i codici del padre.

Regole applicate:

- operazioni ammesse: `switch`, `switch + voltura`, `subentro`, mostrato come `Subentro + Switch`;
- `cambio listino` viene escluso prima del raggruppamento;
- solo `OK` sostituisce l'ultimo switch valido;
- `Caricato`, `Inviato` e il legacy `In avanzamento` producono lo stato UI `CARICATO`;
- `K.O.` e `Switch - Out` non cambiano il riferimento e ripristinano `DISPONIBILE`;
- la disponibilita e il giorno 15 del mese ottenuto aggiungendo `mesi_storno_switch` a `data_inizio_fornitura` dell'ultimo switch `OK`; il campo contiene mesi aggiuntivi post-ingresso, quindi Hera vale `0` per evitare di contare due volte i due mesi gia inclusi in `data_inizio_fornitura`;
- se `data_inizio_fornitura` manca su uno storico, il fallback e `data_switch_ok`, quindi `data_inserimento`;
- una volta disponibile, l'utenza rimane in lista finche un nuovo tentativo diventa `OK`;
- Dual e multipunto vengono valutati per singola riga `Forniture`;
- l'endpoint filtra lato server le opportunita degli agenti normali usando il proprietario in `Clienti.agente`, con fallback sull'agente dell'ultimo OK.
- il filtro Agente della vista Admin/Spettatore usa l'elenco completo di `Agenti`, inclusi gli account nuovi senza opportunita correnti; agli agenti normali tale elenco non viene restituito dall'API.

Le transizioni effettuate dal CRM valorizzano o puliscono `data_switch_ok` insieme allo stato. Per le modifiche dirette in Baserow sono attivi due webhook, entrambi protetti da `BASEROW_WEBHOOK_SECRET`: `Forniture` verso `POST /api/integrations/baserow/supply-status` e `Contratti` verso `POST /api/integrations/baserow/contract-status`. Il primo riallinea il padre quando tutte le figlie hanno lo stesso stato; il secondo propaga lo stato del padre a ogni figlia. I payload di prova con `id=0` e gli eventi tecnici senza righe vengono accettati come no-op autenticati per evitare disattivazioni automatiche di Baserow.

Valori live iniziali: Hera 2 mesi, Estra 4, Duferco 6, Sev Iren 4, Sorgenia 4 ed Eni 4. I valori di Duferco, Sev Iren, Sorgenia ed Eni sono provvisori e possono essere aggiornati dalla configurazione Admin; non sono costanti nel codice.

## Conteggi, target e CB

- Ogni riga `Forniture` vale una unita.
- Un Dual standard vale 2 unita.
- Un multipunto vale il numero reale di POD/PDR.
- In assenza di figlie, il CRM usa i campi legacy e le righe etichettate sul padre.
- La CB validata considera le unita `OK`.
- La CB potenziale considera `OK`, `Caricato` e `Inviato`.
- `K.O.`, `Switch - Out` e `Bozza` non maturano CB.
- I target considerano le regole applicative su categoria e tipo operazione gia implementate in `buildAdminStats`.

## API

| Metodo e percorso                                | Accesso                       | Scopo                          |
| ------------------------------------------------ | ----------------------------- | ------------------------------ |
| `GET /api/health`                                | Pubblico                      | Stato configurazione minima    |
| `GET /api/config`                                | Autenticato                   | Config frontend non sensibile  |
| `GET /api/session`                               | Pubblico con cookie opzionale | Stato sessione                 |
| `POST /api/login`                                | Pubblico, limitato            | Login                          |
| `POST /api/logout`                               | Sessione opzionale            | Logout                         |
| `GET /api/agent`                                 | Autenticato                   | Profilo corrente               |
| `GET /api/contracts`                             | Autenticato                   | Contratti nello scope utente   |
| `POST /api/contracts`                            | Agente/Admin                  | Crea contratto e forniture     |
| `PATCH /api/contracts/:id`                       | Proprietario/Admin            | Modifica contratto e forniture |
| `DELETE /api/contracts/:id`                      | Proprietario/Admin            | Elimina contratto e forniture  |
| `PATCH /api/contracts/:id/status`                | Proprietario/Admin            | Aggiorna stato padre e figlie  |
| `GET /api/competence/current`                    | Autenticato                   | Competenza corrente            |
| `GET /api/competenze`                            | Autenticato                   | Configurazioni competenza      |
| `GET /api/suppliers`                             | Autenticato                   | Fornitori                      |
| `GET /api/switch-opportunities`                  | Autenticato                   | Vista dinamica per POD/PDR     |
| `GET /api/clients`                               | Autenticato                   | Clienti filtrati o globali     |
| `PATCH /api/clients/:id`                         | Proprietario/Admin            | Aggiorna e propaga anagrafica  |
| `GET /api/admin/agents`                          | Admin/Spettatore              | Lista agenti                   |
| `POST /api/admin/agents`                         | Admin                         | Crea account                   |
| `PATCH /api/admin/agents/:id`                    | Admin                         | Modifica account               |
| `GET /api/admin/contracts`                       | Admin/Spettatore              | Contratti globali              |
| `PATCH /api/admin/contracts/:id/sent`            | Admin                         | Segna inviato/non inviato      |
| `GET /api/admin/stats`                           | Admin/Spettatore              | Statistiche globali            |
| `GET /api/admin/supplier-cutoffs`                | Admin/Spettatore              | Legge cut-off                  |
| `PUT /api/admin/supplier-cutoffs`                | Admin                         | Salva cut-off                  |
| `GET /api/admin/switch-delays`                   | Admin/Spettatore              | Legge mesi di storno           |
| `PUT /api/admin/switch-delays/:id`               | Admin                         | Salva mesi di storno           |
| `POST /api/integrations/baserow/supply-status`   | Segreto webhook               | Sincronizza `data_switch_ok`   |
| `POST /api/integrations/baserow/contract-status` | Segreto webhook               | Propaga lo stato alle figlie   |

## Cache e invalidazione

Le letture principali usano una cache in memoria con TTL predefinito di 15 secondi. Le scritture invalidano le chiavi per contratti, statistiche e clienti coinvolti. Una modifica manuale in Baserow puo quindi richiedere fino al TTL della cache prima di essere visibile nel CRM.

## Migrazioni Baserow

`scripts/setup-baserow-forniture.js` richiede `BASEROW_JWT_TOKEN` per modificare lo schema. Il JWT deve essere temporaneo e non va configurato stabilmente su Render.

`scripts/migrate-multipoint-supplies.js`:

- parte sempre in dry-run;
- verifica i campi obbligatori;
- genera report con permessi `0600` in `migration-reports/`;
- include snapshot precedenti per update/delete;
- richiede `--apply --confirm=N` con il numero esatto di operazioni;
- esegue create, update e infine delete;
- registra checkpoint e ID creati;
- e idempotente: dopo una migrazione corretta il dry-run deve mostrare `operations: 0`.

Lo script `migrate-contract-supplies.js` e legacy e non deve essere applicato dopo la migrazione multipunto.

I nuovi backfill partono sempre in dry-run:

```bash
npm run baserow:backfill-switch-ok
npm run baserow:backfill-clienti
```

Dopo il controllo dell'elenco previsto si applicano con `-- --apply --confirm=N`, usando il numero esatto mostrato dal dry-run. Il backfill switch usa `data_inserimento` come approssimazione dichiarata per gli `OK` storici; quello Clienti valorizza solo campi vuoti prendendo il contratto collegato piu recente.

## Variabili ambiente

La lista completa, con valori vuoti e commenti, e in [.env.example](./.env.example). In produzione le variabili vanno configurate sul servizio Render; `.env` resta solo locale ed e ignorato da Git.

Minimo runtime:

- `BASEROW_TOKEN`
- `BASEROW_TABLE_AGENTI_ID`
- `BASEROW_TABLE_CONTRATTI_ID`

Necessarie per il modello completo:

- `BASEROW_TABLE_FORNITURE_ID`
- `BASEROW_TABLE_CLIENTI_ID`
- `BASEROW_WEBHOOK_SECRET`
- ID tabelle fornitori e cut-off
- configurazione R2 per allegati

Opzionali:

- Google Maps Places;
- Resend;
- override nomi campo Baserow;
- TTL cache/sessioni e percorso SQLite.

## Qualita e rilascio

Prima di ogni push destinato alla produzione:

```bash
npm test
npm run lint
npm run build
npm run format:check
npm audit --omit=dev
```

Per le verifiche manuali usare almeno:

1. Luce standard.
2. Gas standard.
3. Dual con pagamenti e stati diversi.
4. Multipunto con almeno 2 POD e 1 PDR.
5. Modifica del multipunto senza duplicare le righe.
6. Stato `K.O.` modificato in Baserow e ricaricato dopo il TTL.
7. Login Spettatore e tentativi di scrittura bloccati.

## Limiti noti

- I valori di storno di Duferco, Sev Iren, Sorgenia ed Eni sono provvisori e devono essere confermati dal committente.
- Le transazioni tra Baserow, R2 e SQLite sono applicative, non ACID distribuite.
- La sincronizzazione delle modifiche dirette dipende dai webhook `Forniture` e `Contratti`, attivi e verificati live; una loro futura disattivazione interromperebbe l'allineamento padre/figlie e delle date di transizione.
- I report di migrazione sono locali e ignorati da Git: vanno conservati in un backup operativo sicuro se necessari per audit.
