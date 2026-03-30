# Istruzioni per completare il setup

Ho preparato tutta la struttura del progetto, l'autenticazione, la dashboard, il calendario interattivo e i form.

Per far funzionare l'applicazione, devi configurare **Supabase**.

## 1. Configurazione Supabase

1. Vai su [Supabase](https://supabase.com/) e crea un nuovo progetto (se non l'hai già fatto).
2. Nel menu a sinistra, vai su **SQL Editor** ed esegui il seguente script per creare la tabella e configurare la sicurezza (RLS):

```sql
-- Crea la tabella activities
CREATE TABLE activities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  subject text NOT NULL,
  type text NOT NULL,
  notes text,
  date date NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Abilita RLS (Row Level Security)
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Crea le policy per far sì che ogni utente veda solo i propri dati
CREATE POLICY "Utenti possono vedere le proprie attività" ON activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Utenti possono inserire proprie attività" ON activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Utenti possono aggiornare proprie attività" ON activities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Utenti possono eliminare proprie attività" ON activities FOR DELETE USING (auth.uid() = user_id);
```

## 2. Variabili d'ambiente (.env.local)

Nella root del progetto (`C:\Users\giaco\Desktop\Projects\active-recall`), crea un file denominato `.env.local` e inserisci le tue chiavi di Supabase (che trovi in *Project Settings > API*):

```env
NEXT_PUBLIC_SUPABASE_URL=https://tuo-progetto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=la-tua-anon-key

# Necessario per la route dei cron job (opzionale)
SUPABASE_SERVICE_ROLE_KEY=la-tua-service-role-key
CRON_SECRET=una-tua-chiave-segreta
```

## 3. Sistema di Notifiche (Cron Job)

Ho implementato un endpoint `/api/cron/reminders` che puoi chiamare una volta al giorno (es. tramite un Cron Job di Vercel, o `pg_cron` da Supabase) per scansionare il database e preparare l'invio delle email di reminder per chi ha la tipologia "Ripetizione" assegnata a "oggi". 
Nell'MVP questo effettua un `console.log`, basterà integrare Resend o simili quando decidi il provider di posta.

Per chiamare il cron dovrai effettuare un GET con header `Authorization: Bearer <CRON_SECRET>`.

## 4. Avvia il server

Una volta inserito il `.env.local`, avvia l'app in questa directory:

```bash
npm run dev
```
