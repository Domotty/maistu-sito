# maistu.it

Sito di **Maistu**, il gestionale su misura di Domotty S.r.l. Pagine statiche (HTML, CSS e JavaScript senza librerie) pubblicate con **GitHub Pages**.

```
index.html              home
assets/css/site.css     stili (tema scuro e chiaro, versione leggera per mobile)
assets/js/sew-intro.js  intro: l'ago cuce il marchio
assets/js/site.js       sezioni interattive, simulazione, prezzi, moduli
assets/js/config.js     indirizzo Supabase e domini su cui i moduli inviano davvero
assets/img, assets/fonts  marchio Maistu, Poppins e JetBrains Mono (licenza OFL)
```

## Stato

Versione di prova. I moduli (richiesta prova e newsletter) inviano davvero solo da `maistu.it`;
altrove l'invio è simulato. Prima della messa online servono:

- pagine `privacy.html` e `cookie.html`;
- aggiornamento delle Edge Functions Supabase di domotty.it (origini consentite, tipo "Prova Maistu 15 giorni", campo `sito`);
- file `CNAME` con `maistu.it` e DNS del dominio verso GitHub Pages.

Listino: `PRICING` in `assets/js/site.js`.
