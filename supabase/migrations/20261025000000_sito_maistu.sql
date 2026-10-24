-- Domotty · due siti, un solo database: domotty.it e maistu.it
-- Aggiunge il campo «sito» alle richieste e agli iscritti. Le righe esistenti diventano «domotty».
-- Eseguire una volta nel SQL Editor di Supabase, DOPO 20261018000000_domotty_site.sql.

alter table public.contact_requests
  add column if not exists sito text not null default 'domotty';
alter table public.newsletter_subscribers
  add column if not exists sito text not null default 'domotty';

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'contact_requests_sito_chk') then
    alter table public.contact_requests add constraint contact_requests_sito_chk check (sito in ('domotty','maistu'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'newsletter_subscribers_sito_chk') then
    alter table public.newsletter_subscribers add constraint newsletter_subscribers_sito_chk check (sito in ('domotty','maistu'));
  end if;
end $$;

create index if not exists contact_requests_sito_idx on public.contact_requests (sito, created_at desc);

-- La stessa persona può iscriversi a entrambe le newsletter: l'unicità diventa (sito, email).
drop index if exists public.newsletter_email_uidx;
create unique index if not exists newsletter_sito_email_uidx on public.newsletter_subscribers (sito, lower(email));
