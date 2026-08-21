# Preventivatore bollette

## Obiettivo

Il preventivatore è una pagina pubblica, non indicizzata, raggiungibile dal percorso `/strumenti/preventivatore`. Serve a leggere una bolletta e una CTE/offerta e stimare il confronto economico sulla fattura.

È una pagina di servizio non indicizzata e non sostituisce il processo di acquisizione di un contratto: la trasformazione in cliente o pratica resta un'azione esplicita del commerciale.

## Flusso operativo

1. L'utente apre `/strumenti/preventivatore`, oppure l'agente usa il link `Strumenti > Confronta bolletta` dal CRM.
2. Carica la bolletta e la CTE in PDF.
3. Il CRM salva temporaneamente i file e li invia a OpenAI tramite il backend.
4. OpenAI restituisce dati strutturati su cliente, fornitura, fattura e offerta.
5. Se l'utente è autenticato nel CRM, il sistema può salvare file, dati estratti, risultato del confronto e agente proprietario.
6. Gli utenti anonimi ricevono soltanto il risultato del confronto: i PDF non vengono salvati nello storico CRM.
7. L'agente può aprire un nuovo contratto precompilato con i dati riconosciuti, sempre con controllo e conferma manuale prima del salvataggio.

## Dati estratti

### Identità e contatto

- nome / ragione sociale;
- partita IVA o codice fiscale, quando leggibili;
- email, telefono e indirizzo;
- eventuale referente o amministratore.

### Fornitura

- POD o PDR;
- luce, gas o dual;
- fornitore attuale;
- consumo e unità di misura;
- periodo e durata della fattura;
- destinazione domestica o business.

### Confronto economico

- prezzo attuale della materia;
- quota fissa attuale;
- tipo di prezzo della CTE;
- indice e spread, se variabile;
- costo fisso dell'offerta;
- totale confrontato;
- risparmio o maggiore spesa;
- livello di affidabilità dell'estrazione;
- motivazione di eventuali blocchi.

## Persistenza

I PDF devono essere conservati in storage oggetti S3-compatible/R2 con chiavi non pubbliche. Il database salva soltanto i riferimenti ai file e i dati strutturati dell'analisi.

La tabella applicativa consigliata è `Analisi bollette`, con almeno:

- identificativo analisi;
- agente proprietario;
- stato (`Nuova`, `Da ricontattare`, `Contattato`, `Convertita`, `Scartata`);
- data creazione e ultimo aggiornamento;
- chiavi storage della bolletta e della CTE;
- nome originale dei file;
- JSON dei dati estratti;
- JSON del confronto;
- eventuale cliente collegato;
- eventuale contratto collegato;
- note e prossima data di ricontatto.

I file e i dati personali non devono essere esposti con URL pubblici. Il download passa da una rotta autenticata e verificata sull'agente proprietario o su un amministratore.

## Regole di sicurezza e privacy

- la pagina e l'analisi sono pubbliche, ma lo storico CRM e i download storici richiedono una sessione;
- la chiave OpenAI è solo una variabile d'ambiente e non va committata;
- i PDF non vengono inseriti nel browser storage;
- un agente vede le proprie analisi, mentre admin e spettatori seguono le regole di visibilità amministrativa;
- la creazione di un cliente non è automatica;
- sono necessarie azioni di eliminazione e una politica di conservazione definita prima dell'uso su larga scala.

## Configurazione

Variabili necessarie:

```dotenv
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4.1
BASEROW_TABLE_ANALISI_BOLLETTE_ID=...
```

Lo storage riutilizza la configurazione R2/S3 già presente nel CRM. Se `BASEROW_TABLE_ANALISI_BOLLETTE_ID` non è configurata, il preventivatore deve rimanere in modalità non persistente e mostrare un avviso all'agente, senza simulare un salvataggio riuscito.

Per creare la tabella e i campi in Baserow, usare un JWT temporaneo Admin/Builder:

```bash
BASEROW_JWT_TOKEN=... node scripts/setup-baserow-analisi-bollette.js
```

Lo script stampa l'ID da inserire in `BASEROW_TABLE_ANALISI_BOLLETTE_ID`. Il JWT è solo per il setup e non va committato.

## Stati di implementazione

- [x] voce nella sidebar;
- [x] pagina protetta;
- [x] upload a chunk;
- [x] analisi PDF con OpenAI Responses API;
- [x] salvataggio permanente dei PDF, quando R2 e tabella sono configurati;
- [x] endpoint storico delle analisi;
- [x] endpoint per collegare/creare un cliente con conferma agente;
- [x] comandi dal risultato per creare/aggiornare il cliente;
- [x] collegamento dell'analisi al cliente tramite il campo Baserow `Analisi bollette`;
- [x] apertura del nuovo contratto con precompilazione tramite sessione del browser;
- [ ] interfaccia completa dello storico nel CRM;
- [ ] eliminazione e retention dei documenti.
