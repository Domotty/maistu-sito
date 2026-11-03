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

Repository: `Domotty/maistu-sito`. Sito di prova: https://domotty.github.io/maistu-sito/

Versione di prova. I moduli (richiesta prova e newsletter) inviano davvero solo da `maistu.it`;
altrove l'invio è simulato. Prima della messa online servono:

- pagine `privacy.html` e `cookie.html`;
- aggiornamento delle Edge Functions Supabase di domotty.it (origini consentite, tipo "Prova Maistu 15 giorni", campo `sito`);
- file `CNAME` con `maistu.it` e DNS del dominio verso GitHub Pages.

## Listino

Tutto in `PRICING` in `assets/js/site.js` (prezzi IVA esclusa; decisioni del 3/11/2026).
Annuale = 10 mensilità pagate in una volta («2 mesi gratis»), per i piani e per i moduli.

**Aziende** (per numero di addetti e di utenti; oltre 50 utenti o 250 addetti: su quotazione)

| Piano | Al mese | Utenti inclusi | Utente in più |
|---|---|---|---|
| Bottega Light (1–2 persone) | 69 € | 3 | 15 € |
| Bottega | 99 € | 5 | 15 € |
| Laboratorio (1 modulo di settore incluso) | 199 € | 10 | 12 € |
| Atelier (moduli di settore illimitati, AI CORE automazioni, Jana) | 349 € | 20 | 10 € |

**Ospitalità** (per camera o alloggio; il minimo vale per la parte camere, utenti e moduli si sommano)

| Piano | Al mese | Minimo | Utenti inclusi | Utente in più |
|---|---|---|---|---|
| B&B e case vacanza | 6 € ad alloggio | 39 € | 3 | 12 € (proposta) |
| Alberghi | 4 € a camera | 99 € | 5 | 12 € (proposta) |

**Moduli aggiuntivi a fasce** (al mese): Piccolo 9 € (D-Learn, D-Survey) · Medio 19 € (D-Project, Chat del sito,
Area clienti, Jana, App sul campo) · Settore 29 € (modulo del tuo settore) · Grande 39 € (Marketplace) e 49 €
(AI CORE automazioni) · Modulo personalizzato da 29 €. I moduli già compresi nel piano non si pagano a parte.

Rinnovo dell'annuale: avviso `rinnovoAvvisoGiorni` giorni prima (oggi 30, **da confermare con il legale**).
