/**
 * @license
 * Système Intégré DDL-PN — République du Congo (MCAPNIT)
 * Moteur de synchronisation Hors-Ligne (Offline-First / Mode Google Agenda)
 * Avec gestion avancée des conflits de données, horodatage précis et fusion non-destructive.
 */

import { FieldEstablishment, apiUpsertEstablishment, apiRecordPayment, supabase, isSupabaseConfigured } from './supabase.ts';

export interface AgentRendezVous {
  id: string;
  establishmentId?: string;
  establishmentName: string;
  promoterName: string;
  promoterPhone: string;
  district: string;
  address?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  motif: 'relance_paiement' | 'premiere_visite' | 'homologation' | 'recouvrement' | 'renouvellement' | 'autre';
  status: 'programme' | 'effectue' | 'reporte' | 'annule';
  notes?: string;
  assignedAgentBadge: string;
  assignedAgentName: string;
  createdAt: string;
  updatedAt: string;
  synced: boolean;
  version: number;
  nextActionType?: 'AGENT_PASSAGE' | 'DIRECTION_VISIT'; // "L'agent passe sur le terrain" vs "Le tenancier passe à la direction"
  installmentAmount?: number;
  remainingAfter?: number;
  firstPaymentDate?: string;
  anniversaryRenewalDate?: string;
  hasConvocation?: boolean;
  convocationDetails?: {
    ref: string;
    date: string;
    time: string;
    office: string;
    reason: string;
  };
}

export interface OfflineAction {
  id: string;
  type: 'create_establishment' | 'update_establishment' | 'record_payment' | 'save_rendezvous' | 'update_rendezvous';
  payload: any;
  timestamp: number;
  clientTimestampISO: string;
  agentBadge: string;
  version: number;
}

export interface ConflictRecord {
  id: string;
  entityType: 'establishment' | 'payment' | 'rendezvous';
  entityId: string;
  resolutionStrategy: 'MERGE_NON_DESTRUCTIVE' | 'LAST_WRITE_WINS' | 'SERVER_ACCEPTED';
  details: string;
  timestamp: number;
}

const QUEUE_STORAGE_KEY = 'ddl_pn_offline_queue';
const RDV_STORAGE_KEY_PREFIX = 'ddl_pn_rendezvous_';
const EST_CACHE_KEY_PREFIX = 'ddl_pn_cached_ests_';
const CONFLICT_LOG_KEY = 'ddl_pn_sync_conflicts';

// Default initial appointments if cache is fresh
const DEFAULT_RDVS: AgentRendezVous[] = [
  {
    id: 'RDV-2026-001',
    establishmentId: 'EST-2026-001',
    establishmentName: 'Le Cercle Privé VIP - Mpita',
    promoterName: 'Alain Mambou',
    promoterPhone: '+242 06 654 32 10',
    district: 'Mpita, Arrondissement 1 Lumumba',
    address: 'Avenue de la Paix, face Pharmacie des Étoiles',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    motif: 'recouvrement',
    status: 'programme',
    notes: 'Passer vérifier le paiement de la 3e tranche',
    assignedAgentBadge: 'DDL-PN-26-00000A-86244',
    assignedAgentName: 'Rhonel KIOUNGA',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    synced: true,
    version: 1,
    nextActionType: 'AGENT_PASSAGE',
    installmentAmount: 35000,
    remainingAfter: 115000,
  },
  {
    id: 'RDV-2026-002',
    establishmentId: 'EST-2026-002',
    establishmentName: 'Nganda Ambiance Tié-Tié',
    promoterName: 'Sylvie Mboungou',
    promoterPhone: '+242 05 521 88 77',
    district: 'Arrondissement 3 Tié-Tié',
    address: 'Carrefour Trois Francs',
    date: new Date().toISOString().split('T')[0],
    time: '14:30',
    motif: 'relance_paiement',
    status: 'programme',
    notes: 'Rappel échéance trimestrielle',
    assignedAgentBadge: 'DDL-PN-26-00000A-86244',
    assignedAgentName: 'Rhonel KIOUNGA',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    synced: true,
    version: 1,
    nextActionType: 'DIRECTION_VISIT',
    installmentAmount: 25000,
    remainingAfter: 60000,
  }
];

export class OfflineSyncService {
  private static listeners: Array<(isOnline: boolean, queueCount: number) => void> = [];

  public static isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  public static init() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.notifyListeners();
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      this.notifyListeners();
    });

    // Run background queue sync attempt every 30 seconds if online
    setInterval(() => {
      if (this.isOnline() && this.getQueue().length > 0) {
        this.processQueue();
      }
    }, 30000);
  }

  public static subscribe(callback: (isOnline: boolean, queueCount: number) => void): () => void {
    this.listeners.push(callback);
    callback(this.isOnline(), this.getQueue().length);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private static notifyListeners() {
    const online = this.isOnline();
    const count = this.getQueue().length;
    this.listeners.forEach((cb) => cb(online, count));
  }

  // --- Queue Management ---
  public static getQueue(): OfflineAction[] {
    try {
      const data = localStorage.getItem(QUEUE_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static enqueueAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'clientTimestampISO' | 'version'>): OfflineAction {
    const queue = this.getQueue();
    const now = Date.now();
    const newAction: OfflineAction = {
      ...action,
      id: 'ACT-' + now + '-' + Math.random().toString(36).substring(2, 7),
      timestamp: now,
      clientTimestampISO: new Date(now).toISOString(),
      version: 1,
    };
    queue.push(newAction);
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.error('Storage full or error:', e);
    }
    this.notifyListeners();

    // Trigger immediate sync attempt if online
    if (this.isOnline()) {
      this.processQueue();
    }
    return newAction;
  }

  // --- Conflict Logging ---
  public static logConflict(record: Omit<ConflictRecord, 'id' | 'timestamp'>) {
    try {
      const existing: ConflictRecord[] = JSON.parse(localStorage.getItem(CONFLICT_LOG_KEY) || '[]');
      existing.unshift({
        ...record,
        id: 'CONF-' + Date.now(),
        timestamp: Date.now(),
      });
      localStorage.setItem(CONFLICT_LOG_KEY, JSON.stringify(existing.slice(0, 50)));
    } catch {}
  }

  public static getConflictLog(): ConflictRecord[] {
    try {
      return JSON.parse(localStorage.getItem(CONFLICT_LOG_KEY) || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Non-destructive merge of two establishment states during conflict resolution.
   * Ensures that no payment installments are lost, and sums them accurately.
   */
  public static mergeEstablishmentState(
    localEst: FieldEstablishment,
    remoteEst: FieldEstablishment
  ): FieldEstablishment {
    // 1. Merge Payment Histories without losing any receipt
    const localPayments = localEst.paymentHistory || [];
    const remotePayments = remoteEst.paymentHistory || [];
    const mergedPaymentsMap = new Map<string, any>();

    [...remotePayments, ...localPayments].forEach((p) => {
      const key = p.receiptRef || p.id || `${p.date}-${p.amount}`;
      if (!mergedPaymentsMap.has(key)) {
        mergedPaymentsMap.set(key, p);
      }
    });

    const mergedPayments = Array.from(mergedPaymentsMap.values());
    const totalPaid = mergedPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const totalDue = Math.max(localEst.totalDue || 0, remoteEst.totalDue || 0);

    // 2. Status resolution: if totalPaid >= totalDue, mark as settled
    let status = localEst.status;
    if (totalPaid >= totalDue && totalDue > 0) {
      status = 'autorise_dgl';
    } else if (totalPaid > 0) {
      status = 'attestation_depot';
    }

    const merged: FieldEstablishment = {
      ...remoteEst,
      ...localEst,
      totalDue,
      paidAmount: totalPaid,
      status,
      paymentHistory: mergedPayments,
      nextDueDate: localEst.nextDueDate || remoteEst.nextDueDate,
      updated_at: new Date().toISOString(),
    } as any;

    this.logConflict({
      entityType: 'establishment',
      entityId: localEst.id,
      resolutionStrategy: 'MERGE_NON_DESTRUCTIVE',
      details: `Fusion réussie de ${mergedPayments.length} paiements cumulés. Total perçu: ${totalPaid} FCFA sur ${totalDue} FCFA.`,
    });

    return merged;
  }

  // --- Process Queue with Conflict Resolution ---
  public static async processQueue(): Promise<{ synced: number; errors: number; conflictsResolved: number }> {
    if (!this.isOnline()) return { synced: 0, errors: 0, conflictsResolved: 0 };
    const queue = this.getQueue();
    if (queue.length === 0) return { synced: 0, errors: 0, conflictsResolved: 0 };

    let syncedCount = 0;
    let errorsCount = 0;
    let conflictsResolved = 0;
    const remainingQueue: OfflineAction[] = [];

    for (const action of queue) {
      try {
        let success = false;

        if (action.type === 'create_establishment' || action.type === 'update_establishment') {
          const estPayload = action.payload?.establishment || action.payload;
          try {
            const res = await fetch('/api/establishments', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(action.payload),
            });
            success = res.ok;
          } catch {
            success = false;
          }

          // Direct Supabase client fallback (Vercel static deploy)
          if (!success && isSupabaseConfigured && estPayload) {
            const result = await apiUpsertEstablishment(estPayload);
            success = result.success;
          }
        } else if (action.type === 'record_payment') {
          try {
            const res = await fetch('/api/payments', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(action.payload),
            });
            success = res.ok;
          } catch {
            success = false;
          }

          // Direct Supabase fallback
          if (!success && isSupabaseConfigured && action.payload?.payment) {
            const p = action.payload.payment;
            const result = await apiRecordPayment({
              establishmentId: p.establishment_id,
              amount: p.amount_paid,
              totalFee: p.total_fee,
              nextDueDate: p.prochain_versement_date,
              agentId: p.agent_id,
            });
            success = result.success;
          }
        } else if (action.type === 'save_rendezvous' || action.type === 'update_rendezvous') {
          try {
            const res = await fetch('/api/rendezvous', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ rendezvous: action.payload }),
            });
            success = res.ok;
          } catch {
            success = false;
          }

          // Direct Supabase fallback
          if (!success && isSupabaseConfigured && supabase && action.payload) {
            const r = action.payload;
            const { error } = await supabase.from('rendezvous').upsert({
              id: r.id,
              establishment_id: r.establishmentId || null,
              establishment_name: r.establishmentName,
              promoter_name: r.promoterName || '',
              promoter_phone: r.promoterPhone || '',
              district: r.district || '',
              address: r.address || '',
              date: r.date,
              time: r.time || '10:00',
              motif: r.motif || 'recouvrement',
              status: r.status || 'programme',
              assigned_agent_badge: r.assignedAgentBadge,
              assigned_agent_name: r.assignedAgentName,
              updated_at: new Date().toISOString(),
            });
            success = !error;
          }
        }

        if (success) {
          syncedCount++;
        } else {
          errorsCount++;
          remainingQueue.push(action);
        }
      } catch (err) {
        errorsCount++;
        remainingQueue.push(action);
      }
    }

    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(remainingQueue));
    } catch {}
    this.notifyListeners();
    return { synced: syncedCount, errors: errorsCount, conflictsResolved };
  }

  // --- Local Cache for Establishments per Agent ---
  public static cacheAgentEstablishments(badgeNumber: string, establishments: FieldEstablishment[]) {
    try {
      localStorage.setItem(EST_CACHE_KEY_PREFIX + badgeNumber, JSON.stringify(establishments));
    } catch {}
  }

  public static getCachedAgentEstablishments(badgeNumber: string): FieldEstablishment[] {
    try {
      const data = localStorage.getItem(EST_CACHE_KEY_PREFIX + badgeNumber);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // --- Rendez-vous (Agenda type Google Agenda) Storage ---
  public static getAgentRendezVous(badgeNumber: string): AgentRendezVous[] {
    try {
      const key = RDV_STORAGE_KEY_PREFIX + badgeNumber;
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
      const initial = DEFAULT_RDVS.filter((r) => r.assignedAgentBadge === badgeNumber);
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    } catch {
      return [];
    }
  }

  public static async fetchRemoteRendezVous(badgeNumber: string): Promise<AgentRendezVous[]> {
    try {
      if (!this.isOnline()) return this.getAgentRendezVous(badgeNumber);
      const res = await fetch(`/api/rendezvous?badge=${encodeURIComponent(badgeNumber)}`);
      if (res.ok) {
        const { rendezvous } = await res.json();
        if (Array.isArray(rendezvous) && rendezvous.length > 0) {
          const local = this.getAgentRendezVous(badgeNumber);
          const map = new Map<string, AgentRendezVous>();
          rendezvous.forEach((r: AgentRendezVous) => map.set(r.id, r));
          local.forEach((r: AgentRendezVous) => {
            if (!map.has(r.id)) map.set(r.id, r);
          });
          const merged = Array.from(map.values());
          localStorage.setItem(RDV_STORAGE_KEY_PREFIX + badgeNumber, JSON.stringify(merged));
          return merged;
        }
      }
    } catch {}
    return this.getAgentRendezVous(badgeNumber);
  }

  public static saveAgentRendezVous(badgeNumber: string, rdv: AgentRendezVous): AgentRendezVous {
    const rdvs = this.getAgentRendezVous(badgeNumber);
    const existingIndex = rdvs.findIndex((r) => r.id === rdv.id);
    const nowISO = new Date().toISOString();
    let updated: AgentRendezVous[];

    const enrichedRdv: AgentRendezVous = {
      ...rdv,
      updatedAt: nowISO,
      version: (rdv.version || 0) + 1,
      synced: this.isOnline(),
    };

    if (existingIndex >= 0) {
      updated = [...rdvs];
      updated[existingIndex] = enrichedRdv;
    } else {
      updated = [enrichedRdv, ...rdvs];
    }

    try {
      localStorage.setItem(RDV_STORAGE_KEY_PREFIX + badgeNumber, JSON.stringify(updated));
    } catch {}

    // Queue for sync with central Direction with timestamp
    this.enqueueAction({
      type: existingIndex >= 0 ? 'update_rendezvous' : 'save_rendezvous',
      payload: enrichedRdv,
      agentBadge: badgeNumber,
    });

    return enrichedRdv;
  }

  public static updateRdvStatus(
    badgeNumber: string,
    rdvId: string,
    newStatus: 'programme' | 'effectue' | 'reporte' | 'annule',
    notes?: string
  ): void {
    const rdvs = this.getAgentRendezVous(badgeNumber);
    const target = rdvs.find((r) => r.id === rdvId);
    if (target) {
      target.status = newStatus;
      if (notes) target.notes = notes;
      this.saveAgentRendezVous(badgeNumber, target);
    }
  }
}

// Auto init on import in browser
if (typeof window !== 'undefined') {
  OfflineSyncService.init();
}
