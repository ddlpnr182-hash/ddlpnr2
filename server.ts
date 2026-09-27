import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || 'https://nbpcecsnivfggyitpxdn.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5icGNlY3NuaXZmZ2d5aXRweGRuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODI4OTI2NiwiZXhwIjoyMTAzODY1MjY2fQ.PVU6ZECng32GvVrB-XqJAw6CVVqwqjm66nYfnyYJNeY';

// Supabase client with admin privileges (bypasses RLS)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    fetch: fetch,
  },
});

async function startServer() {
  const app = express();
  app.use(express.json());

  // 1. Health check & Supabase connection test
  app.get('/api/health', async (_req, res) => {
    try {
      const { count, error } = await supabaseAdmin
        .from('establishments')
        .select('*', { count: 'exact', head: true });
      if (error) {
        return res.status(500).json({ status: 'error', error: error.message });
      }
      return res.json({
        status: 'ok',
        supabaseConnected: true,
        establishmentsCount: count,
        url: SUPABASE_URL,
      });
    } catch (err: any) {
      return res.status(500).json({ status: 'error', message: err.message });
    }
  });

  // 2. Fetch establishments joined with terrain_records and agent details
  app.get('/api/establishments', async (_req, res) => {
    try {
      const [estsRes, recsRes, agentsRes, badgesRes] = await Promise.all([
        supabaseAdmin
          .from('establishments')
          .select('*')
          .order('created_at', { ascending: false }),
        supabaseAdmin
          .from('terrain_records')
          .select('*')
          .order('record_date', { ascending: false }),
        supabaseAdmin.from('agents').select('*'),
        supabaseAdmin.from('badges').select('*'),
      ]);

      if (estsRes.error) {
        return res.status(500).json({ error: estsRes.error.message });
      }

      const rawEsts = estsRes.data || [];
      const records = recsRes.data || [];
      const agents = agentsRes.data || [];
      const badges = badgesRes.data || [];

      const establishments = rawEsts.map((est) => {
        const ag = agents.find((a) => a.id === est.assigned_agent_id);
        const bd = ag ? badges.find((b) => b.agent_id === ag.id) : null;
        return {
          ...est,
          assigned_agent_name: ag
            ? ag.nom_complet || `${ag.prenom || ''} ${ag.nom || ''}`.trim()
            : undefined,
          assigned_agent_badge: bd
            ? bd.badge_number
            : ag
            ? ag.badge_id
            : undefined,
          assigned_agent_phone: ag ? ag.telephone : undefined,
        };
      });

      return res.json({ establishments, records });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // 3. Create a new establishment
  app.post('/api/establishments', async (req, res) => {
    try {
      const { establishment, record } = req.body;
      if (!establishment || !establishment.name) {
        return res.status(400).json({ error: 'Nom établissement requis' });
      }

      const { data: createdEst, error: estError } = await supabaseAdmin
        .from('establishments')
        .insert(establishment)
        .select()
        .single();

      if (estError) {
        return res.status(500).json({ error: estError.message });
      }

      let createdRecord = null;
      if (record && createdEst?.id) {
        record.establishment_id = createdEst.id;
        delete record.remaining_balance; // auto-computed column
        const { data: recData, error: recError } = await supabaseAdmin
          .from('terrain_records')
          .insert(record)
          .select()
          .single();
        if (recError) {
          console.warn('Initial terrain record insert error:', recError.message);
        } else {
          createdRecord = recData;
        }
      }

      return res.status(201).json({ establishment: createdEst, record: createdRecord });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // 4. Record a payment on the terrain or direction
  app.post('/api/payments', async (req, res) => {
    try {
      const { payment } = req.body;
      if (!payment || !payment.establishment_id) {
        return res.status(400).json({ error: 'establishment_id requis' });
      }

      delete payment.remaining_balance; // generated column
      const { data, error } = await supabaseAdmin
        .from('terrain_records')
        .insert(payment)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(201).json({ payment: data });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // 5. Fetch instruction dossiers (bypasses RLS)
  app.get('/api/dossiers', async (_req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('dossiers_instruction')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.json({ dossiers: data || [] });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // 6. Upsert an instruction dossier
  app.post('/api/dossiers', async (req, res) => {
    try {
      const { dossier } = req.body;
      if (!dossier) {
        return res.status(400).json({ error: 'Données de dossier requises' });
      }

      const { data, error } = await supabaseAdmin
        .from('dossiers_instruction')
        .upsert(dossier)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.json({ dossier: data });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // 7. Fetch active agents and their badges
  app.get('/api/agents', async (_req, res) => {
    try {
      const [agentsRes, badgesRes] = await Promise.all([
        supabaseAdmin.from('agents').select('*').order('nom', { ascending: true }),
        supabaseAdmin.from('badges').select('*'),
      ]);

      if (agentsRes.error) {
        return res.status(500).json({ error: agentsRes.error.message });
      }

      const agents = agentsRes.data || [];
      const badges = badgesRes.data || [];

      const agentsWithBadges = agents.map((agent) => {
        const badge = badges.find((b) => b.agent_id === agent.id);
        return {
          ...agent,
          badge_number: badge ? badge.badge_number : agent.badge_id || 'DDL-PN-AGENT',
          badge_status: badge ? badge.status : agent.statut,
        };
      });

      return res.json({ agents: agentsWithBadges });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // In-memory / persistent rendezvous store fallback
  const rendezvousStore: any[] = [];
  const convocationsStore: any[] = [];

  // 8. Fetch rendezvous (calendar appointments)
  app.get('/api/rendezvous', async (req, res) => {
    try {
      const agentBadge = req.query.badge as string | undefined;
      // Try fetching from Supabase table if it exists
      const { data, error } = await supabaseAdmin
        .from('rendezvous')
        .select('*')
        .order('date', { ascending: true });

      if (!error && data) {
        let mapped = data.map((r: any) => ({
          id: r.id,
          establishmentId: r.establishment_id,
          establishmentName: r.establishment_name,
          promoterName: r.promoter_name,
          promoterPhone: r.promoter_phone,
          district: r.district,
          address: r.address,
          date: r.date,
          time: r.time ? r.time.slice(0, 5) : '10:00',
          motif: r.motif,
          status: r.status,
          nextActionType: r.next_action_type,
          installmentAmount: r.installment_amount ? Number(r.installment_amount) : 0,
          remainingAfter: r.remaining_after ? Number(r.remaining_after) : 0,
          firstPaymentDate: r.first_payment_date,
          anniversaryRenewalDate: r.anniversary_renewal_date,
          notes: r.notes,
          assignedAgentBadge: r.assigned_agent_badge,
          assignedAgentName: r.assigned_agent_name,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
          synced: true,
          version: 1,
        }));

        if (agentBadge) {
          mapped = mapped.filter((r: any) => r.assignedAgentBadge === agentBadge);
        }
        return res.json({ rendezvous: mapped });
      }

      // Fallback to memory store
      let results = rendezvousStore;
      if (agentBadge) {
        results = results.filter((r) => r.assignedAgentBadge === agentBadge);
      }
      return res.json({ rendezvous: results });
    } catch (err: any) {
      return res.json({ rendezvous: rendezvousStore });
    }
  });

  // 9. Save or update a rendezvous
  app.post('/api/rendezvous', async (req, res) => {
    try {
      const { rendezvous } = req.body;
      if (!rendezvous || !rendezvous.establishmentName) {
        return res.status(400).json({ error: 'Données de rendez-vous requises' });
      }

      // Normalize to snake_case for Supabase
      const dbPayload: any = {
        id: rendezvous.id,
        establishment_id: rendezvous.establishmentId || null,
        establishment_name: rendezvous.establishmentName,
        promoter_name: rendezvous.promoterName || '',
        promoter_phone: rendezvous.promoterPhone || '',
        district: rendezvous.district || '',
        address: rendezvous.address || '',
        date: rendezvous.date,
        time: rendezvous.time || '10:00',
        motif: rendezvous.motif || 'recouvrement',
        status: rendezvous.status || 'programme',
        next_action_type: rendezvous.nextActionType || 'AGENT_PASSAGE',
        installment_amount: rendezvous.installmentAmount || 0,
        remaining_after: rendezvous.remainingAfter || 0,
        first_payment_date: rendezvous.firstPaymentDate || null,
        anniversary_renewal_date: rendezvous.anniversaryRenewalDate || null,
        notes: rendezvous.notes || '',
        assigned_agent_badge: rendezvous.assignedAgentBadge,
        assigned_agent_name: rendezvous.assignedAgentName,
        updated_at: new Date().toISOString(),
      };

      // Try Supabase first
      const { data, error } = await supabaseAdmin
        .from('rendezvous')
        .upsert(dbPayload)
        .select()
        .single();

      if (!error && data) {
        return res.json({ rendezvous: { ...rendezvous, synced: true } });
      }

      // Fallback to store
      const idx = rendezvousStore.findIndex((r) => r.id === rendezvous.id);
      if (idx >= 0) {
        rendezvousStore[idx] = rendezvous;
      } else {
        rendezvousStore.unshift(rendezvous);
      }
      return res.json({ rendezvous });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // 10. Convocations & Invitations
  app.get('/api/convocations', async (_req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('convocations')
        .select('*')
        .order('appointment_date', { ascending: false });

      if (!error && data) {
        return res.json({ convocations: data });
      }
      return res.json({ convocations: convocationsStore });
    } catch {
      return res.json({ convocations: convocationsStore });
    }
  });

  app.post('/api/convocations', async (req, res) => {
    try {
      const { convocation } = req.body;
      if (!convocation || !convocation.ref) {
        return res.status(400).json({ error: 'Données de convocation requises' });
      }

      const dbPayload: any = {
        id: convocation.id || `CONV-${Date.now()}`,
        reference_num: convocation.ref,
        establishment_id: convocation.establishmentId || null,
        promoter_name: convocation.promoter || convocation.promoterName || '',
        promoter_phone: convocation.phone || convocation.promoterPhone || '',
        district: convocation.district || '',
        appointment_date: convocation.date || new Date().toISOString().split('T')[0],
        appointment_time: convocation.time || '10:00',
        reception_office: convocation.office || 'Bureau SAA N° 4',
        reason: convocation.reason || "Régularisation des droits d'exploitation",
        status: convocation.status || 'DEPOSEE',
        delivered_by_agent_badge: convocation.agentBadge || '',
        delivered_by_agent_name: convocation.agentName || '',
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabaseAdmin
        .from('convocations')
        .upsert(dbPayload)
        .select()
        .single();

      if (!error && data) {
        return res.json({ convocation: data });
      }

      convocationsStore.unshift(convocation);
      return res.json({ convocation });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Dev server or Production static serving
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DDL-PN] Server running on http://0.0.0.0:${PORT}`);
    console.log(`[DDL-PN] Connected to Supabase: ${SUPABASE_URL}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
