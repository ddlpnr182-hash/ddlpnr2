-- ========================================================================
-- SCHEMA SQL OFFICIEL SUPABASE POUR LA DDL-PN (RÉPUBLIQUE DU CONGO)
-- Direction Départementale des Loisirs de Pointe-Noire (MCAPNIT)
-- À exécuter dans le "SQL Editor" de votre tableau de bord Supabase
-- Projet : https://nbpcecsnivfggyitpxdn.supabase.co
-- ========================================================================

-- 1. Table des Rendez-vous & Tournées de Recouvrement (Google Agenda SAA)
CREATE TABLE IF NOT EXISTS public.rendezvous (
    id TEXT PRIMARY KEY,
    establishment_id TEXT,
    establishment_name TEXT NOT NULL,
    promoter_name TEXT,
    promoter_phone TEXT,
    district TEXT,
    address TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL DEFAULT '10:00',
    motif TEXT NOT NULL DEFAULT 'recouvrement',
    status TEXT NOT NULL DEFAULT 'programme', -- 'programme', 'effectue', 'reporte', 'annule'
    next_action_type TEXT DEFAULT 'AGENT_PASSAGE', -- 'AGENT_PASSAGE' (visite terrain clignotante) ou 'DIRECTION_VISIT' (attendu bureau)
    installment_amount NUMERIC(12, 2) DEFAULT 0,
    remaining_after NUMERIC(12, 2) DEFAULT 0,
    first_payment_date DATE,
    anniversary_renewal_date DATE,
    notes TEXT,
    assigned_agent_badge TEXT NOT NULL,
    assigned_agent_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table d'Archivage des Invitations & Convocations Officielles Déposées
CREATE TABLE IF NOT EXISTS public.convocations (
    id TEXT PRIMARY KEY,
    reference_num TEXT UNIQUE NOT NULL,
    establishment_id TEXT,
    promoter_name TEXT NOT NULL,
    promoter_phone TEXT,
    district TEXT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL DEFAULT '10:00',
    reception_office TEXT NOT NULL DEFAULT 'Bureau SAA N° 4',
    reason TEXT NOT NULL DEFAULT 'Régularisation des droits d''exploitation',
    status TEXT NOT NULL DEFAULT 'DEPOSEE', -- 'DEPOSEE', 'HONOREE', 'REPORTEE', 'DEFAUT'
    delivered_by_agent_badge TEXT NOT NULL,
    delivered_by_agent_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table des Dossiers d'Instruction d'Actes & Demandes Administratives
CREATE TABLE IF NOT EXISTS public.dossiers_actes (
    id TEXT PRIMARY KEY,
    num TEXT UNIQUE NOT NULL,
    date TEXT,
    service_code TEXT DEFAULT 'SAA / J.A.M.',
    title TEXT NOT NULL,
    promoter TEXT NOT NULL,
    loc TEXT,
    arrondissement TEXT NOT NULL,
    category TEXT NOT NULL,
    type_label TEXT,
    type_sub TEXT,
    pieces_count INT DEFAULT 0,
    total_pieces INT DEFAULT 5,
    pieces_status TEXT,
    status_key TEXT NOT NULL DEFAULT 'reserves',
    status_label TEXT,
    status_sub TEXT,
    pieces_list JSONB DEFAULT '[]'::jsonb,
    avis_motive TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Activation de la synchronisation en temps réel (Supabase Realtime)
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.rendezvous;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.convocations;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.dossiers_actes;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 5. Politiques de Sécurité (Row Level Security - RLS)
ALTER TABLE public.rendezvous ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dossiers_actes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'rendezvous' AND policyname = 'acces_total_rendezvous'
    ) THEN
        CREATE POLICY acces_total_rendezvous ON public.rendezvous FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'convocations' AND policyname = 'acces_total_convocations'
    ) THEN
        CREATE POLICY acces_total_convocations ON public.convocations FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'dossiers_actes' AND policyname = 'acces_total_dossiers_actes'
    ) THEN
        CREATE POLICY acces_total_dossiers_actes ON public.dossiers_actes FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;
