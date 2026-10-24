// Configurazione del sito Maistu.
// L'indirizzo Supabase non è un segreto: le funzioni sono pubbliche e scrivono
// nel database con chiavi custodite lato server. È lo stesso progetto di domotty.it;
// le richieste da questo sito vengono marcate con sito = "maistu".
window.MAISTU_CONFIG = {
  supabaseUrl: 'https://yrsxbsreupnfdkbxgcxi.supabase.co',
  sito: 'maistu',
  // Domini da cui i moduli inviano davvero. Altrove (anteprime, GitHub Pages di test) l'invio viene simulato.
  liveHosts: ['maistu.it', 'www.maistu.it']
};
