# Supabase · domotty.it e maistu.it

Il progetto Supabase è **lo stesso di domotty.it**. Queste sono le versioni aggiornate delle due Edge Functions,
che servono entrambi i siti, e la modifica al database che aggiunge il campo `sito`.
Vanno riportate anche nel repository `domotty-site`, che oggi contiene la versione precedente.

## Cosa cambia
- Ogni richiesta e ogni iscrizione viene salvata con `sito = 'domotty'` oppure `'maistu'`.
- Il sito si riconosce dal dominio (domotty.it o maistu.it). Dalle pagine di prova su github.io vale il campo `sito` inviato dal modulo.
- **domotty.it non cambia**: stessa casella, stesse email, oggetto `[Sito] …`.
- **maistu.it**: le email partono e arrivano da **assistenza@maistu.it**, con oggetto `[Sito] <tipo> · <nome>` (stesso formato letto dal gestionale).
  La conferma al cliente e quella della newsletter hanno la grafica Maistu. Il link di conferma porta a `maistu.it/conferma.html`.
- La stessa persona può iscriversi a entrambe le newsletter.

## Passi nel pannello Supabase
1. **SQL Editor**: esegui `migrations/20261025000000_sito_maistu.sql`.
2. **Edge Functions › Secrets**: aggiungi

   | Nome | Valore |
   |---|---|
   | `MAISTU_SMTP_USER` | `assistenza@maistu.it` |
   | `MAISTU_SMTP_PASS` | password della casella assistenza@maistu.it |
   | `MAISTU_MAIL_FROM` | `Maistu <assistenza@maistu.it>` |
   | `MAISTU_MAIL_TO` | `assistenza@maistu.it` |
   | `MAISTU_SITE_URL` | `https://maistu.it` |

   Server e porta sono quelli di Domotty (`SMTP_HOST`, `SMTP_PORT`). Se la casella Maistu ne usa altri, aggiungi `MAISTU_SMTP_HOST` e `MAISTU_SMTP_PORT`.
   Se esiste già il segreto `ALLOWED_ORIGINS`, aggiungi in fondo `,https://maistu.it,https://www.maistu.it,https://domotty.github.io`.
   Se non esiste, il valore predefinito nel codice li comprende già.
3. **Edge Functions**: apri `contact`, sostituisci tutto il codice con `functions/contact/index.ts` e fai il deploy.
   Ripeti con `newsletter` e `functions/newsletter/index.ts`. Lascia disattivato *Enforce JWT verification*.
4. Prova: un invio dal modulo di domotty.it deve arrivare come prima ad assistenza@domotty.it.
