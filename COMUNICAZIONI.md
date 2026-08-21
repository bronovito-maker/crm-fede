# Comunicazioni tra agenti

La dashboard ora contiene un centro comunicazioni riservato agli agenti autenticati:

- Notifiche personali, con lettura singola o globale.
- Messaggi diretti tra agenti attivi.
- Aggiornamento automatico ogni 30 secondi mentre la sessione è aperta.
- Notifica automatica al destinatario quando un admin assegna un contratto.
- Notifica automatica al destinatario quando riceve un messaggio.

## Configurazione Baserow

Le tabelle vengono create con:

```bash
npm run baserow:setup-comunicazioni
```

Il comando richiede temporaneamente `BASEROW_JWT_TOKEN` con permessi Admin/Builder e usa il database `414331` e la tabella Agenti `925635` come default. Dopo il comando, copiare gli ID stampati nel servizio Render:

```text
BASEROW_TABLE_NOTIFICHE_ID=...
BASEROW_TABLE_MESSAGGI_ID=...
```

Il JWT serve solo per creare lo schema e non va lasciato nelle variabili runtime. L'applicazione usa il normale `BASEROW_TOKEN`.

## Schema

`Notifiche`: `nome`, `destinatario` (link a Agenti), `tipo`, `titolo`, `testo`, `letta`, `link`.

`Messaggi`: `nome`, `conversazione`, `mittente` (link a Agenti), `destinatario` (link a Agenti), `testo`, `letta`.

Il server filtra sempre le notifiche sul destinatario e i messaggi sul mittente/destinatario: un agente non può leggere le comunicazioni di altri agenti modificando l'URL.

## Scelte MVP

Il centro è volutamente interno e leggero: non è una chat realtime, non contiene allegati e non invia email. Il polling evita di introdurre subito WebSocket o un servizio esterno. In seguito si possono aggiungere notifiche per cambio stato contratto, analisi bolletta e scadenze di follow-up.
