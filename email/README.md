# Email Maistu

Veste grafica delle email per chi arriva da **maistu.it**. È la stessa struttura delle email Domotty
(fondo blu notte, riquadro, titolo, testo, pulsante arancio, piè di pagina) con il marchio Maistu.
Anteprima: `anteprima-email-maistu.png`.

## Per il gestionale (Domotty Hub)

`gestionale/base_maistu.html` è un modello Django con **le stesse variabili** di `templates/email/base.html`
(`core.email_grafica.html_email`): `nome`, `titolo`, `paragrafi`, `firma`, `pulsanti`, `nota`, `azienda`, `colori`.
Facoltative: `logo_url`, `sito_url` (predefinito `https://maistu.it`).

Uso previsto: copiarlo in `backend/templates/email/base_maistu.html` e far scegliere a `html_email` il modello
in base all'origine della conversazione, per esempio `modulo_sito["sito"] == "maistu"` → `email/base_maistu.html`,
altrimenti `email/base.html`. Il testo semplice resta uguale.

## Per il sito (Edge Functions Supabase)

- `sito/conferma-richiesta.html`: conferma di ricezione del modulo «Contattaci». Segnaposto: `{{nome}}`, `{{tipo}}`, `{{site}}`.
- `sito/conferma-newsletter.html`: conferma dell'iscrizione (doppio consenso). Segnaposto: `{{link}}`, `{{site}}`.

I valori vanno sempre passati con l'escape HTML.

## Immagini

Le email usano PNG, perché Gmail e Outlook non mostrano gli SVG:

- `assets/img/email/maistu-logo-email.png`: logo orizzontale per fondi scuri (480×170, mostrato a 200 px);
- `assets/img/email/maistu-cornice-email.png`: cornice a zig-zag.

Gli indirizzi puntano a `https://maistu.it/...`: le immagini si vedono quando il dominio è collegato a GitHub Pages.
Fino ad allora, se serve provare, usare `sito_url = "https://domotty.github.io/maistu-sito"`.
