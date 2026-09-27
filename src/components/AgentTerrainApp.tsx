/**
 * @license
 * Système Intégré DDL-PN — République du Congo (MCAPNIT)
 * Plateforme Agent Mobile : Copie Conforme de Google Agenda (Google Calendar)
 * 100% fidèle au design Google Agenda • Adapté aux missions de terrain SAA
 * - Gestion des acomptes avec calcul automatique du reste
 * - Choix du prochain passage (Visite terrain de l'agent vs Passage promoteur à la Direction)
 * - Notification matinale Google Agenda (briefing des visites du jour qui clignote)
 * - Historique exhaustif des acomptes jusqu'au solde
 * - Date d'anniversaire automatique (+1 an depuis le 1er versement) pour renouvellement
 * - Dépôt d'invitation / convocation officielle pour convier l'usager à la Direction
 * - Fonctionne 100% Hors-Ligne avec synchronisation automatique vers l'Admin MATOKO.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Menu,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  AlertCircle,
  Building2,
  Banknote,
  Bell,
  X,
  Wifi,
  WifiOff,
  RefreshCw,
  LogOut,
  ChevronDown,
  User,
  Share2,
  Check,
  CalendarDays,
  List,
  Printer,
  Sparkles,
  FileText,
  Sun,
  Flame,
  CornerDownRight,
  Send,
  Download
} from 'lucide-react';
import { useSession } from '../lib/sessionContext.tsx';
import { FieldEstablishment, apiUpsertEstablishment, apiRecordPayment } from '../lib/supabase.ts';
import { OfflineSyncService, AgentRendezVous } from '../lib/offlineSync.ts';
import { getActivityRatePerSqm, CONFIRMED_ACTIVITY_RATES } from './MoteurTarifsActivites.tsx';
import {
  addOneYear,
  getFirstPaymentDate,
  formatISOToFR,
  normalizeDateToISO,
} from './CalendrierRdvTerrain.tsx';
import { printElement } from '../lib/printUtils.ts';
import { ArmoiriesCongo, LogoDDLPN } from './RepublicSeal.tsx';
import {
  POINTE_NOIRE_ARRONDISSEMENTS,
  LEISURE_ACTIVITY_TYPES,
  getQuartiersForArrondissement,
} from '../lib/referentielLoisirs.ts';

interface AgentTerrainAppProps {
  establishments: FieldEstablishment[];
  onRefreshEstablishments?: () => void;
}

type CalendarView = 'month' | 'week' | 'schedule';
type ModalMode =
  | 'view_event'
  | 'create_event'
  | 'create_establishment'
  | 'record_acompte'
  | 'convocation_modal'
  | 'convocation_view'
  | null;

interface CalendarEventItem {
  id: string;
  establishmentId?: string;
  title: string;
  type: 'rdv' | 'acompte' | 'recensement' | 'rappel' | 'renouvellement';
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  establishmentName: string;
  promoterName: string;
  promoterPhone: string;
  district: string;
  address?: string;
  amount?: number;
  totalDue?: number;
  paidAmount?: number;
  notes?: string;
  status: 'programme' | 'effectue' | 'annule';
  color: string;
  nextActionType?: 'AGENT_PASSAGE' | 'DIRECTION_VISIT';
  installmentAmount?: number;
  remainingAfter?: number;
  firstPaymentDate?: string;
  anniversaryRenewalDate?: string;
  paymentHistory?: any[];
  hasConvocation?: boolean;
  convocationDetails?: {
    ref: string;
    date: string;
    time: string;
    office: string;
    reason: string;
  };
}

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const WEEK_DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

const HOURS_GRID = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

export const AgentTerrainApp: React.FC<AgentTerrainAppProps> = ({
  establishments: masterEstablishments,
  onRefreshEstablishments,
}) => {
  const { currentAgent, logout, filterEstablishmentsForUser } = useSession();

  // Current view date navigation
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<string>(new Date().toISOString().split('T')[0]);
  const [calendarView, setCalendarView] = useState<CalendarView>('month');

  // Drawer / Side menu
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showMorningBriefing, setShowMorningBriefing] = useState<boolean>(true);

  // Filter calendars (Checkboxes Google Agenda)
  const [filterRdv, setFilterRdv] = useState(true);
  const [filterAcomptes, setFilterAcomptes] = useState(true);
  const [filterRecensements, setFilterRecensements] = useState(true);
  const [filterRappels, setFilterRappels] = useState(true);

  // Network & Sync State
  const [isOnline, setIsOnline] = useState<boolean>(OfflineSyncService.isOnline());
  const [queueCount, setQueueCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Modals & Active Event
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventItem | null>(null);
  const [activeConvocation, setActiveConvocation] = useState<any | null>(null);

  // Listen to network status
  useEffect(() => {
    return OfflineSyncService.subscribe((online, count) => {
      setIsOnline(online);
      setQueueCount(count);
    });
  }, []);

  // Filter establishments to THIS agent's portfolio
  const myEstablishments = useMemo(() => {
    const list = filterEstablishmentsForUser(masterEstablishments);
    OfflineSyncService.cacheAgentEstablishments(currentAgent.badgeNumber, list);
    return list;
  }, [masterEstablishments, currentAgent.badgeNumber, filterEstablishmentsForUser]);

  // Load and merge events (Rendez-vous + Recensements + Acomptes)
  const [rawRdvs, setRawRdvs] = useState<AgentRendezVous[]>(() => {
    return OfflineSyncService.getAgentRendezVous(currentAgent.badgeNumber);
  });

  // Fetch remote from Supabase if online
  useEffect(() => {
    OfflineSyncService.fetchRemoteRendezVous(currentAgent.badgeNumber).then((list) => {
      if (list && list.length > 0) {
        setRawRdvs(list);
      }
    });
  }, [currentAgent.badgeNumber]);

  const reloadEvents = () => {
    const list = OfflineSyncService.getAgentRendezVous(currentAgent.badgeNumber);
    setRawRdvs(list);
  };

  // Convert all items to Google Calendar events
  const allCalendarEvents = useMemo<CalendarEventItem[]>(() => {
    const events: CalendarEventItem[] = [];

    // 1. Rendez-vous de tournée
    rawRdvs.forEach((r) => {
      events.push({
        id: r.id,
        establishmentId: r.establishmentId,
        title: `${r.motif === 'recouvrement' ? '💰 Recouvrement' : r.motif === 'homologation' ? '📋 Contrôle' : r.motif === 'renouvellement' ? '🎂 Renouvellement' : '📅 RDV'} : ${r.establishmentName}`,
        type: r.motif === 'renouvellement' ? 'renouvellement' : 'rdv',
        date: r.date,
        time: r.time || '10:00',
        establishmentName: r.establishmentName,
        promoterName: r.promoterName,
        promoterPhone: r.promoterPhone,
        district: r.district,
        address: r.address,
        notes: r.notes,
        status: r.status === 'effectue' ? 'effectue' : 'programme',
        color: r.status === 'effectue' ? '#10b981' : r.nextActionType === 'AGENT_PASSAGE' ? '#dc2626' : '#1a73e8',
        nextActionType: r.nextActionType || 'AGENT_PASSAGE',
        installmentAmount: r.installmentAmount,
        remainingAfter: r.remainingAfter,
        firstPaymentDate: r.firstPaymentDate,
        anniversaryRenewalDate: r.anniversaryRenewalDate,
        hasConvocation: r.hasConvocation,
        convocationDetails: r.convocationDetails,
      });
    });

    // 2. Échéances, Acomptes et Dates d'anniversaire des établissements suivis
    myEstablishments.forEach((est) => {
      const isSettled = est.paidAmount >= est.totalDue && est.totalDue > 0;
      const firstPayment = getFirstPaymentDate(est);
      const anniversaryDate = addOneYear(firstPayment);
      const anniversaryISO = normalizeDateToISO(anniversaryDate);

      // Historique des paiements
      if (est.paymentHistory && Array.isArray(est.paymentHistory)) {
        est.paymentHistory.forEach((p) => {
          const parts = p.date.split(' ')[0].split('/');
          if (parts.length === 3) {
            const iso = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            events.push({
              id: `PAY-${p.id}`,
              establishmentId: est.id,
              title: `💵 Acompte : ${p.amount.toLocaleString('fr-FR')} F - ${est.name}`,
              type: 'acompte',
              date: iso,
              time: '11:00',
              establishmentName: est.name,
              promoterName: est.promoter,
              promoterPhone: est.phone,
              district: est.district,
              address: est.address,
              amount: p.amount,
              totalDue: est.totalDue,
              paidAmount: est.paidAmount,
              notes: `Encaissé via ${p.location === 'DIRECTION' ? 'Guichet Direction' : 'Terrain'} (Réf: ${p.receiptRef})`,
              status: 'effectue',
              color: '#0d904f', // Google Green
              firstPaymentDate: firstPayment,
              anniversaryRenewalDate: anniversaryDate,
              paymentHistory: est.paymentHistory,
            });
          }
        });
      }

      // Prochaine Échéance si non soldé
      if (est.nextDueDate && !isSettled) {
        const iso = normalizeDateToISO(est.nextDueDate);
        if (iso) {
          events.push({
            id: `DUE-${est.id}`,
            establishmentId: est.id,
            title: `⏰ Relance échéance : ${est.name} (Reste: ${(est.totalDue - est.paidAmount).toLocaleString('fr-FR')} F)`,
            type: 'rappel',
            date: iso,
            time: est.nextAppointmentTime || '09:00',
            establishmentName: est.name,
            promoterName: est.promoter,
            promoterPhone: est.phone,
            district: est.district,
            address: est.address,
            amount: est.totalDue - est.paidAmount,
            totalDue: est.totalDue,
            paidAmount: est.paidAmount,
            notes: `Rappel de versement pour solde des droits d'exploitation`,
            status: 'programme',
            color: est.nextAppointmentType === 'TERRAIN' ? '#dc2626' : '#e37400',
            nextActionType: est.nextAppointmentType === 'TERRAIN' ? 'AGENT_PASSAGE' : 'DIRECTION_VISIT',
            firstPaymentDate: firstPayment,
            anniversaryRenewalDate: anniversaryDate,
            paymentHistory: est.paymentHistory,
          });
        }
      }

      // Événement de Renouvellement Annuel Automatique (+1 an) si soldé
      if (isSettled && anniversaryISO) {
        events.push({
          id: `ANNIV-${est.id}`,
          establishmentId: est.id,
          title: `🎂 Renouvellement Annuel : ${est.name} (Échéance 1 an)`,
          type: 'renouvellement',
          date: anniversaryISO,
          time: '09:00',
          establishmentName: est.name,
          promoterName: est.promoter,
          promoterPhone: est.phone,
          district: est.district,
          address: est.address,
          totalDue: est.totalDue,
          paidAmount: est.paidAmount,
          notes: `Date d'anniversaire d'exploitation échue. Perception des droits de renouvellement annuel pour l'exercice suivant.`,
          status: 'programme',
          color: '#8b5cf6', // Purple
          firstPaymentDate: firstPayment,
          anniversaryRenewalDate: anniversaryDate,
          paymentHistory: est.paymentHistory,
        });
      }
    });

    return events;
  }, [rawRdvs, myEstablishments]);

  // Filtered by checkboxes and search
  const visibleEvents = useMemo(() => {
    return allCalendarEvents.filter((ev) => {
      if (ev.type === 'rdv' && !filterRdv) return false;
      if (ev.type === 'acompte' && !filterAcomptes) return false;
      if (ev.type === 'recensement' && !filterRecensements) return false;
      if (ev.type === 'rappel' && !filterRappels) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          ev.title.toLowerCase().includes(q) ||
          ev.establishmentName.toLowerCase().includes(q) ||
          ev.promoterName.toLowerCase().includes(q) ||
          ev.district.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allCalendarEvents, filterRdv, filterAcomptes, filterRecensements, filterRappels, searchQuery]);

  // Today ISO
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Today Appointments (Google Agenda Morning Briefing)
  const todayAppointments = useMemo(() => {
    return visibleEvents.filter((ev) => ev.date === todayStr && ev.status !== 'effectue');
  }, [visibleEvents, todayStr]);

  // Sync Trigger
  const handleTriggerSync = async () => {
    if (!isOnline) {
      setSyncToast('Mode Hors-Ligne : vos données sont conservées en sécurité sur le téléphone.');
      setTimeout(() => setSyncToast(null), 3500);
      return;
    }
    setIsSyncing(true);
    setSyncToast('Synchronisation avec la base de M. le Directeur MATOKO...');
    const res = await OfflineSyncService.processQueue();
    setIsSyncing(false);
    if (res.synced > 0) {
      setSyncToast(`✅ ${res.synced} événement(s) synchronisé(s) avec la Direction !`);
      if (onRefreshEstablishments) onRefreshEstablishments();
    } else {
      setSyncToast('✅ Votre agenda est parfaitement à jour avec la Direction.');
    }
    setTimeout(() => setSyncToast(null), 3500);
  };

  // Calendar month days calculation
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const days = [];
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 is Dimanche

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const prevDate = new Date(year, month - 1, d);
      days.push({
        date: prevDate.toISOString().split('T')[0],
        dayNumber: d,
        isCurrentMonth: false,
      });
    }

    for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
      const thisDate = new Date(year, month, d);
      days.push({
        date: thisDate.toISOString().split('T')[0],
        dayNumber: d,
        isCurrentMonth: true,
      });
    }

    const remaining = 35 - days.length > 0 ? 35 - days.length : 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(year, month + 1, d);
      days.push({
        date: nextDate.toISOString().split('T')[0],
        dayNumber: d,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentDate]);

  // Week days calculation for Week View (Google Calendar format)
  const weekDays = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay(); // 0 is Sunday
    const sunday = new Date(d);
    sunday.setDate(d.getDate() - day);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const cur = new Date(sunday);
      cur.setDate(sunday.getDate() + i);
      const dateStr = cur.toISOString().split('T')[0];
      days.push({
        dateObj: cur,
        dateStr,
        dayName: WEEK_DAYS[cur.getDay()],
        dayNumber: cur.getDate(),
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDay,
      });
    }
    return days;
  }, [currentDate, todayStr, selectedDay]);

  // Dynamic header title
  const headerTitle = useMemo(() => {
    if (calendarView === 'week' && weekDays.length > 0) {
      const startM = MONTH_NAMES[weekDays[0].dateObj.getMonth()];
      const endM = MONTH_NAMES[weekDays[6].dateObj.getMonth()];
      const startY = weekDays[0].dateObj.getFullYear();
      const endY = weekDays[6].dateObj.getFullYear();
      if (startM === endM) {
        return `${startM} ${startY}`;
      }
      return `${startM.slice(0, 4)}. - ${endM.slice(0, 4)}. ${endY}`;
    }
    return `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  }, [calendarView, weekDays, currentDate]);

  const handlePrevDate = () => {
    if (calendarView === 'week') {
      const prev = new Date(currentDate);
      prev.setDate(prev.getDate() - 7);
      setCurrentDate(prev);
    } else {
      const prev = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      setCurrentDate(prev);
    }
  };

  const handleNextDate = () => {
    if (calendarView === 'week') {
      const next = new Date(currentDate);
      next.setDate(next.getDate() + 7);
      setCurrentDate(next);
    } else {
      const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      setCurrentDate(next);
    }
  };

  // Form states for Creation Modal
  const [createType, setCreateType] = useState<'rdv' | 'etablissement' | 'acompte'>('rdv');
  const [formEstId, setFormEstId] = useState<string>('');
  const [formEstName, setFormEstName] = useState<string>('');
  const [formPromoter, setFormPromoter] = useState<string>('');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formArrondissement, setFormArrondissement] = useState<string>('Arrondissement 1 Lumumba');
  const [formQuartier, setFormQuartier] = useState<string>('Mpita');
  const [formCustomQuartier, setFormCustomQuartier] = useState<string>('');
  const [formDistrict, setFormDistrict] = useState<string>('Mpita, Arrondissement 1 Lumumba');
  const [formAddress, setFormAddress] = useState<string>('');
  const [formDate, setFormDate] = useState<string>(selectedDay);
  const [formTime, setFormTime] = useState<string>('10:00');
  const [formMotif, setFormMotif] = useState<'recouvrement' | 'premiere_visite' | 'homologation' | 'relance_paiement' | 'renouvellement'>('recouvrement');
  const [formNotes, setFormNotes] = useState<string>('');
  const [formAmount, setFormAmount] = useState<number>(35000); // Ex: 35000 avance
  const [formTotalDue, setFormTotalDue] = useState<number>(150000); // Ex: 150000 total exigible
  const [formPaidSoFar, setFormPaidSoFar] = useState<number>(0);
  const [formActivity, setFormActivity] = useState<string>('BAR');
  const [formSurface, setFormSurface] = useState<number>(60);

  // Rendez-vous & Prochain passage
  const [formNextActionType, setFormNextActionType] = useState<'AGENT_PASSAGE' | 'DIRECTION_VISIT'>('AGENT_PASSAGE');
  const [formNextDueDate, setFormNextDueDate] = useState<string>(
    new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
  );
  const [formDepositConvocation, setFormDepositConvocation] = useState<boolean>(true);
  const [formConvocationOffice, setFormConvocationOffice] = useState<string>(
    'Bureau N° 4 - Service Autorisation & Animation (SAA), Direction Départementale des Loisirs de Pointe-Noire'
  );

  // Calculated remaining balance
  const computedRemainingBalance = useMemo(() => {
    return Math.max(0, formTotalDue - (formPaidSoFar + formAmount));
  }, [formTotalDue, formPaidSoFar, formAmount]);

  const isFormWillBeSettled = useMemo(() => {
    return (formPaidSoFar + formAmount) >= formTotalDue && formTotalDue > 0;
  }, [formPaidSoFar, formAmount, formTotalDue]);

  // When picking an existing establishment for RDV or Acompte
  const handleSelectExistingEst = (estId: string) => {
    setFormEstId(estId);
    const found = myEstablishments.find((e) => e.id === estId);
    if (found) {
      setFormEstName(found.name);
      setFormPromoter(found.promoter);
      setFormPhone(found.phone);
      setFormDistrict(found.district);
      setFormAddress(found.address || '');
      setFormTotalDue(found.totalDue || 150000);
      setFormPaidSoFar(found.paidAmount || 0);
      setFormAmount(Math.min(35000, Math.max(5000, found.totalDue - found.paidAmount)));
    }
  };

  // Submit Quick Creation
  const handleSaveCreation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (createType === 'rdv') {
      const newRdv: AgentRendezVous = {
        id: `RDV-${Date.now()}`,
        establishmentId: formEstId || undefined,
        establishmentName: formEstName || 'Rendez-vous de tournée',
        promoterName: formPromoter || 'Non précisé',
        promoterPhone: formPhone,
        district: formDistrict,
        address: formAddress,
        date: formDate,
        time: formTime,
        motif: formMotif,
        status: 'programme',
        notes: formNotes,
        assignedAgentBadge: currentAgent.badgeNumber,
        assignedAgentName: currentAgent.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
        synced: isOnline,
        nextActionType: formNextActionType,
      };

      OfflineSyncService.saveAgentRendezVous(currentAgent.badgeNumber, newRdv);
      reloadEvents();
      setModalMode(null);
      setSyncToast('📅 Rendez-vous programmé et enregistré dans votre Google Agenda !');
      setTimeout(() => setSyncToast(null), 3000);
    } else if (createType === 'acompte') {
      const est = myEstablishments.find((e) => e.id === formEstId);
      const receiptRef = `REC-TRN-${Date.now().toString().slice(-6)}`;
      const nowISO = new Date().toISOString();
      const newTotalPaid = formPaidSoFar + formAmount;
      const willSettle = newTotalPaid >= formTotalDue && formTotalDue > 0;

      // Date de 1er versement de référence pour la date d'anniversaire (+1 an)
      const existingFirstPayment = est ? getFirstPaymentDate(est) : formatISOToFR(formDate);
      const computedAnniversaryDate = addOneYear(existingFirstPayment);

      const paymentRecord = {
        establishment_id: est?.id || `EST-${Date.now()}`,
        establishment_name: formEstName,
        amount: formAmount,
        record_date: formDate,
        collected_by: currentAgent.name,
        assigned_agent_id: currentAgent.id,
        assigned_agent_badge: currentAgent.badgeNumber,
        location: 'TERRAIN' as const,
        receipt_ref: receiptRef,
        payment_method: 'ESPECES',
        next_due_date: willSettle ? computedAnniversaryDate : formNextDueDate,
        next_action_type: willSettle ? undefined : formNextActionType,
      };

      const computedNextDueDateStr = willSettle ? computedAnniversaryDate : formatISOToFR(formNextDueDate);

      const updatedHistory = [
        ...(est?.paymentHistory || []),
        {
          id: receiptRef,
          date: new Date().toLocaleDateString('fr-FR'),
          amount: formAmount,
          collectedBy: `${currentAgent.name} (Terrain)`,
          location: 'TERRAIN' as const,
          receiptRef,
          nextDueDate: computedNextDueDateStr,
          nextAppointmentType: formNextActionType === 'AGENT_PASSAGE' ? ('TERRAIN' as const) : ('BUREAU' as const),
          nextAppointmentTime: '10:00',
        },
      ];

      const updatedEst: FieldEstablishment = {
        ...(est || {
          id: `EST-${Date.now()}`,
          name: formEstName,
          promoter: formPromoter,
          phone: formPhone,
          district: formDistrict,
          address: formAddress,
          activityCode: 'ACT-BAR',
          activityLabel: 'Bar Standard',
          sector: 'informal',
          surfaceSqm: 60,
          identifiedDate: new Date().toLocaleDateString('fr-FR'),
          identifiedBy: `${currentAgent.name} (${currentAgent.badgeNumber})`,
          filingFee: 30000,
          penaltyFee: 0,
          ratePerSqm: 1000,
          installmentsCount: 3,
          sanctions: [],
        }),
        totalDue: formTotalDue,
        paidAmount: newTotalPaid,
        nextDueDate: computedNextDueDateStr,
        nextAppointmentType: formNextActionType === 'AGENT_PASSAGE' ? 'TERRAIN' : 'BUREAU',
        status: willSettle ? 'autorise_dgl' : 'attestation_depot',
        paymentHistory: updatedHistory,
      };

      // Also schedule next calendar event (either next installment visit or annual renewal)
      const scheduledEventDate = (willSettle ? normalizeDateToISO(computedAnniversaryDate) : formNextDueDate) || formNextDueDate;
      const followUpRdv: AgentRendezVous = {
        id: `RDV-FLW-${Date.now()}`,
        establishmentId: updatedEst.id,
        establishmentName: updatedEst.name,
        promoterName: updatedEst.promoter,
        promoterPhone: updatedEst.phone,
        district: updatedEst.district,
        address: updatedEst.address,
        date: scheduledEventDate,
        time: '10:00',
        motif: willSettle ? 'renouvellement' : 'recouvrement',
        status: 'programme',
        notes: willSettle
          ? `Date d'anniversaire d'autorisation échue. Renouvellement annuel pour l'année suivante.`
          : `Relance solde. Reste à percevoir : ${computedRemainingBalance.toLocaleString('fr-FR')} FCFA. ${formNextActionType === 'AGENT_PASSAGE' ? "L'agent passe sur place." : "Le promoteur passe à la Direction."}`,
        assignedAgentBadge: currentAgent.badgeNumber,
        assignedAgentName: currentAgent.name,
        createdAt: nowISO,
        updatedAt: nowISO,
        version: 1,
        synced: isOnline,
        nextActionType: willSettle ? undefined : formNextActionType,
        installmentAmount: formAmount,
        remainingAfter: computedRemainingBalance,
        firstPaymentDate: existingFirstPayment,
        anniversaryRenewalDate: computedAnniversaryDate,
      };

      OfflineSyncService.saveAgentRendezVous(currentAgent.badgeNumber, followUpRdv);
      reloadEvents();

      if (isOnline) {
        try {
          await apiRecordPayment(paymentRecord as any);
          await apiUpsertEstablishment(updatedEst);
        } catch {
          OfflineSyncService.enqueueAction({
            type: 'record_payment',
            payload: { payment: paymentRecord },
            agentBadge: currentAgent.badgeNumber,
          });
        }
      } else {
        OfflineSyncService.enqueueAction({
          type: 'record_payment',
          payload: { payment: paymentRecord },
          agentBadge: currentAgent.badgeNumber,
        });
      }

      setModalMode(null);
      if (onRefreshEstablishments) onRefreshEstablishments();

      if (willSettle) {
        setSyncToast(`🎉 Félicitations ! Établissement soldé. Renouvellement annuel fixé au ${computedAnniversaryDate}.`);
      } else {
        setSyncToast(
          `💵 Avance de ${formAmount.toLocaleString('fr-FR')} F perçue. Reste: ${computedRemainingBalance.toLocaleString('fr-FR')} F. Prochain RDV au ${formatISOToFR(formNextDueDate)}.`
        );
      }
      setTimeout(() => setSyncToast(null), 4500);
    } else if (createType === 'etablissement') {
      const effectiveQuartier = formQuartier.startsWith('Autre') ? (formCustomQuartier.trim() || 'Quartier non précisé') : formQuartier;
      const effectiveDistrict = `${effectiveQuartier}, ${formArrondissement}`;
      const actDef = LEISURE_ACTIVITY_TYPES.find((a) => a.code === formActivity);
      const rate = actDef ? actDef.defaultRatePerSqm : getActivityRatePerSqm(formActivity);
      const totalDue = 30000 + (formSurface * rate);
      const estId = `EST-SAA-${Date.now().toString().slice(-6)}`;
      const convocationRef = `CONV-DDL-${Date.now().toString().slice(-5)}`;

      const newEst: FieldEstablishment = {
        id: estId,
        name: formEstName.trim(),
        promoter: formPromoter.trim(),
        phone: formPhone.trim(),
        district: effectiveDistrict,
        address: formAddress.trim() ? `${formAddress.trim()} (${effectiveQuartier})` : `${effectiveQuartier}, Pointe-Noire`,
        activityCode: formActivity,
        activityLabel: actDef ? actDef.label : 'Bar Standard',
        sector: 'informal',
        surfaceSqm: formSurface,
        identifiedDate: new Date().toLocaleDateString('fr-FR'),
        identifiedBy: `${currentAgent.name} (${currentAgent.badgeNumber})`,
        status: formDepositConvocation ? 'convoque' : 'identifie',
        filingFee: 30000,
        penaltyFee: 0,
        ratePerSqm: rate,
        totalDue,
        installmentsCount: 3,
        paidAmount: 0,
        nextDueDate: formatISOToFR(formDate),
        nextAppointmentType: 'BUREAU',
        assignedAgentBadge: currentAgent.badgeNumber,
        assignedAgentName: currentAgent.name,
        paymentHistory: [],
        sanctions: formDepositConvocation
          ? [
              {
                type: 'CONVOCATION',
                issuedDate: new Date().toLocaleDateString('fr-FR'),
                deadline: `Convocation fixée au ${formatISOToFR(formDate)} à ${formTime} à la Direction`,
                appointmentTime: formTime,
                appointmentOffice: formConvocationOffice,
                reason: "Examen de la conformité d'exploitation et fixation des droits",
                resolved: false,
              },
            ]
          : [],
      };

      // Agenda Event for the convocation / initial visit
      const newRdv: AgentRendezVous = {
        id: `RDV-${Date.now()}`,
        establishmentId: newEst.id,
        establishmentName: newEst.name,
        promoterName: newEst.promoter,
        promoterPhone: newEst.phone,
        district: newEst.district,
        address: newEst.address,
        date: formDate,
        time: formTime,
        motif: 'premiere_visite',
        status: 'programme',
        notes: `Recensé par ${currentAgent.name}. ${formDepositConvocation ? `Convocation N° ${convocationRef} déposée.` : ''}`,
        assignedAgentBadge: currentAgent.badgeNumber,
        assignedAgentName: currentAgent.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
        synced: isOnline,
        hasConvocation: formDepositConvocation,
        convocationDetails: formDepositConvocation
          ? {
              ref: convocationRef,
              date: formatISOToFR(formDate),
              time: formTime,
              office: formConvocationOffice,
              reason: "Examen de la conformité d'exploitation et régularisation des droits",
            }
          : undefined,
      };

      OfflineSyncService.saveAgentRendezVous(currentAgent.badgeNumber, newRdv);
      reloadEvents();

      if (isOnline) {
        try {
          await apiUpsertEstablishment(newEst);
        } catch {
          OfflineSyncService.enqueueAction({
            type: 'create_establishment',
            payload: { establishment: newEst },
            agentBadge: currentAgent.badgeNumber,
          });
        }
      } else {
        OfflineSyncService.enqueueAction({
          type: 'create_establishment',
          payload: { establishment: newEst },
          agentBadge: currentAgent.badgeNumber,
        });
      }

      setModalMode(null);
      if (onRefreshEstablishments) onRefreshEstablishments();

      if (formDepositConvocation) {
        setActiveConvocation({
          ref: convocationRef,
          estName: formEstName,
          promoter: formPromoter,
          phone: formPhone,
          district: formDistrict,
          date: formatISOToFR(formDate),
          time: formTime,
          office: formConvocationOffice,
          agentName: currentAgent.name,
          agentBadge: currentAgent.badgeNumber,
        });
        setModalMode('convocation_view');
        setSyncToast(`🏢 Établissement recensé & Invitation officielle n° ${convocationRef} générée !`);
      } else {
        setSyncToast(`🏢 Établissement « ${formEstName} » ajouté à votre portefeuille !`);
      }
      setTimeout(() => setSyncToast(null), 3500);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafd] text-[#1f1f1f] flex flex-col font-sans select-none">

      {/* ======================================================== */}
      {/* 1. GOOGLE CALENDAR HEADER (Barre supérieure officielle)  */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#e0e3e7] px-3 sm:px-6 h-16 flex items-center justify-between shadow-xs">
        {/* Left section: Hamburger, Google Calendar Logo, Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 rounded-full hover:bg-gray-100 text-[#444746] transition-colors"
            title="Menu principal"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Google Calendar Logo Mockup */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#dadce0] flex flex-col items-center justify-center shadow-xs overflow-hidden">
              <div className="w-full bg-[#1a73e8] text-white text-[9px] font-bold text-center leading-3 py-0.5">
                {MONTH_NAMES[currentDate.getMonth()].slice(0, 3).toUpperCase()}
              </div>
              <div className="text-[#1a73e8] font-bold text-sm leading-none mt-0.5">
                {new Date().getDate()}
              </div>
            </div>
            <div>
              <span className="font-semibold text-lg text-[#1f1f1f] tracking-tight flex items-center gap-2">
                Agenda DDL-PN
                <span className="hidden sm:inline-block text-xs font-normal px-2 py-0.5 rounded-full bg-[#e8f0fe] text-[#1a73e8]">
                  SAA Terrain
                </span>
              </span>
            </div>
          </div>

          {/* Today Button & Navigation Arrows */}
          <div className="flex items-center gap-1 ml-2 sm:ml-6">
            <button
              onClick={() => {
                const now = new Date();
                setCurrentDate(now);
                setSelectedDay(now.toISOString().split('T')[0]);
              }}
              className="px-3 py-1.5 rounded-md border border-[#dadce0] hover:bg-[#f1f3f4] text-xs font-medium text-[#3c4043] transition-colors"
            >
              Aujourd’hui
            </button>

            <button
              onClick={handlePrevDate}
              className="p-1.5 rounded-full hover:bg-[#f1f3f4] text-[#5f6368] transition-colors"
              title={calendarView === 'week' ? 'Semaine précédente' : 'Mois précédent'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleNextDate}
              className="p-1.5 rounded-full hover:bg-[#f1f3f4] text-[#5f6368] transition-colors"
              title={calendarView === 'week' ? 'Semaine suivante' : 'Mois suivant'}
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <h2 className="text-sm sm:text-base font-semibold text-[#3c4043] ml-2">
              {headerTitle}
            </h2>
          </div>
        </div>

        {/* Right section: Search, View Selector, Sync Status, Avatar */}
        <div className="flex items-center gap-2">
          {/* View switcher dropdown */}
          <div className="flex items-center bg-[#f1f3f4] rounded-lg p-0.5 text-xs font-medium">
            <button
              onClick={() => setCalendarView('month')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                calendarView === 'month'
                  ? 'bg-white text-[#1a73e8] font-bold shadow-xs'
                  : 'text-[#5f6368] hover:text-[#202124]'
              }`}
            >
              Mois
            </button>
            <button
              onClick={() => setCalendarView('week')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                calendarView === 'week'
                  ? 'bg-white text-[#1a73e8] font-bold shadow-xs'
                  : 'text-[#5f6368] hover:text-[#202124]'
              }`}
            >
              Semaine
            </button>
            <button
              onClick={() => setCalendarView('schedule')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                calendarView === 'schedule'
                  ? 'bg-white text-[#1a73e8] font-bold shadow-xs'
                  : 'text-[#5f6368] hover:text-[#202124]'
              }`}
            >
              Planning
            </button>
          </div>

          {/* Sync & Offline Badge */}
          <button
            onClick={handleTriggerSync}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              isOnline
                ? queueCount > 0
                  ? 'bg-[#fef7e0] text-[#b06000] border border-[#f9ab00]/40'
                  : 'bg-[#e6f4ea] text-[#137333] border border-[#ceead6]'
                : 'bg-[#fce8e6] text-[#c5221f] border border-[#fad2cf]'
            }`}
            title="État de la synchronisation automatique"
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-[#137333]" />
                <span className="hidden sm:inline">
                  {queueCount > 0 ? `${queueCount} en attente` : 'En ligne'}
                </span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-[#c5221f]" />
                <span className="hidden sm:inline">Hors-Ligne ({queueCount})</span>
              </>
            )}
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-[#1a73e8]' : 'text-gray-500'}`} />
          </button>

          {/* Agent Avatar & Logout */}
          <div className="flex items-center gap-1 ml-1">
            <div
              className="w-8 h-8 rounded-full bg-[#1a73e8] text-white flex items-center justify-center font-bold text-xs shadow-xs"
              title={`${currentAgent.name} (${currentAgent.badgeNumber})`}
            >
              {currentAgent.name.charAt(0)}
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-full hover:bg-gray-100 text-[#5f6368] hover:text-red-600 transition-colors"
              title="Quitter ma session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Sync Toast Feedback */}
      {syncToast && (
        <div className="bg-[#202124] text-white text-xs px-4 py-2.5 text-center font-medium shadow-md transition-all flex items-center justify-center gap-2">
          <span>{syncToast}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. NOTIFICATION DU MATIN GOOGLE AGENDA (Qui Clignote)    */}
      {/* ======================================================== */}
      {showMorningBriefing && todayAppointments.length > 0 && (
        <div className="bg-gradient-to-r from-[#eff6ff] via-[#f0fdf4] to-[#fef2f2] border-b border-[#bfdbfe] px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center gap-2.5">
            {/* Clignotement / Pulsation d'alerte */}
            <div className="relative mt-0.5 sm:mt-0">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-ping absolute"></div>
              <div className="w-3 h-3 rounded-full bg-red-600 relative"></div>
            </div>

            <div>
              <p className="text-xs font-bold text-[#1e3a8a] flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Bonjour {currentAgent.name.split(' ')[0]} ! Programme de vos tournées du jour ({todayAppointments.length} visite{todayAppointments.length > 1 ? 's' : ''}) :</span>
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {todayAppointments.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => {
                      setSelectedEvent(app);
                      setModalMode('view_event');
                    }}
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1.5 shadow-2xs hover:scale-105 transition-all ${
                      app.nextActionType === 'AGENT_PASSAGE'
                        ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    <span>{app.time}</span>
                    <span>•</span>
                    <span className="font-bold underline">{app.establishmentName}</span>
                    <span>{app.nextActionType === 'AGENT_PASSAGE' ? '🚶‍♂️ Passer sur place' : '🏛️ Attendu direction'}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowMorningBriefing(false)}
            className="text-gray-400 hover:text-gray-600 text-xs self-end sm:self-auto"
            title="Masquer le rappel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. BODY LAYOUT: Collapsible Drawer + Calendar View      */}
      {/* ======================================================== */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Sidebar / Drawer (Google Calendar style) */}
        {isDrawerOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex"
            onClick={() => setIsDrawerOpen(false)}
          >
            <div
              className="w-72 bg-white h-full shadow-2xl p-4 flex flex-col justify-between overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-6">
                {/* Header in Drawer */}
                <div className="flex items-center justify-between border-b border-[#e0e3e7] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#1a73e8] text-white flex items-center justify-center font-bold text-xs">
                      {currentAgent.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#1f1f1f]">{currentAgent.name}</p>
                      <p className="text-[11px] text-[#5f6368]">Agent SAA • {currentAgent.badgeNumber}</p>
                    </div>
                  </div>
                  <button onClick={() => setIsDrawerOpen(false)} className="text-gray-400 hover:text-gray-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* FAB: + Créer Google Calendar */}
                <div>
                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      setCreateType('rdv');
                      setFormDate(selectedDay);
                      setModalMode('create_event');
                    }}
                    className="w-full py-3 px-4 rounded-full bg-white hover:bg-[#f8fafd] border border-[#dadce0] hover:shadow-md text-sm font-semibold text-[#3c4043] flex items-center justify-center gap-3 transition-all"
                  >
                    <span className="w-6 h-6 rounded-full bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center font-bold">
                      +
                    </span>
                    <span>Créer un événement</span>
                  </button>
                </div>

                {/* Checkboxes "Mes Agendas" Google Calendar */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-[#5f6368] uppercase tracking-wider">
                    Mes Agendas de Travail
                  </h3>

                  <label className="flex items-center gap-3 text-xs text-[#3c4043] cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg">
                    <input
                      type="checkbox"
                      checked={filterRdv}
                      onChange={(e) => setFilterRdv(e.target.checked)}
                      className="w-4 h-4 rounded text-[#1a73e8] focus:ring-0 accent-[#1a73e8]"
                    />
                    <span className="w-3 h-3 rounded-full bg-[#1a73e8] shrink-0"></span>
                    <span className="font-medium">Rendez-vous & Visites de tournée</span>
                  </label>

                  <label className="flex items-center gap-3 text-xs text-[#3c4043] cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg">
                    <input
                      type="checkbox"
                      checked={filterAcomptes}
                      onChange={(e) => setFilterAcomptes(e.target.checked)}
                      className="w-4 h-4 rounded text-[#0d904f] focus:ring-0 accent-[#0d904f]"
                    />
                    <span className="w-3 h-3 rounded-full bg-[#0d904f] shrink-0"></span>
                    <span className="font-medium">Acomptes & Recouvrements reçus</span>
                  </label>

                  <label className="flex items-center gap-3 text-xs text-[#3c4043] cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg">
                    <input
                      type="checkbox"
                      checked={filterRappels}
                      onChange={(e) => setFilterRappels(e.target.checked)}
                      className="w-4 h-4 rounded text-[#e37400] focus:ring-0 accent-[#e37400]"
                    />
                    <span className="w-3 h-3 rounded-full bg-[#e37400] shrink-0"></span>
                    <span className="font-medium">Rappels & Échéances tenanciers</span>
                  </label>
                </div>

                {/* Portefeuille Summary */}
                <div className="bg-[#f8fafd] border border-[#e0e3e7] rounded-xl p-3 space-y-2">
                  <h4 className="text-xs font-bold text-[#1f1f1f] flex items-center justify-between">
                    <span>Mon Portefeuille</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#e8f0fe] text-[#1a73e8] text-[10px]">
                      {myEstablishments.length} suivis
                    </span>
                  </h4>
                  <p className="text-[11px] text-[#5f6368] leading-relaxed">
                    Chaque avance perçue calcule le solde en direct et planifie la date de votre prochain passage ou du renouvellement annuel.
                  </p>
                </div>
              </div>

              {/* Bottom Drawer info */}
              <div className="pt-4 border-t border-[#e0e3e7] text-[11px] text-[#5f6368] space-y-2">
                <div className="flex items-center justify-between">
                  <span>Zone attribuée :</span>
                  <span className="font-semibold text-[#1f1f1f] truncate max-w-[140px]">{currentAgent.zone}</span>
                </div>
                <button
                  onClick={logout}
                  className="w-full py-2 px-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Déconnexion
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 4. CALENDAR VIEWS: Month View, Week Grid or Schedule     */}
        {/* ======================================================== */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-white">

          {/* VIEW A: GOOGLE CALENDAR MONTH GRID */}
          {calendarView === 'month' && (
            <div className="flex-1 flex flex-col min-w-full">
              {/* Day of Week Header */}
              <div className="grid grid-cols-7 border-b border-[#dadce0] bg-[#fafafa] text-center text-xs font-semibold text-[#70757a] py-2 sticky top-0 z-10">
                {WEEK_DAYS.map((day, idx) => (
                  <div key={idx} className="uppercase tracking-wider">
                    {day}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="flex-1 grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[#dadce0] border-b border-[#dadce0]">
                {calendarDays.map((cell, idx) => {
                  const dayEvents = visibleEvents.filter((ev) => ev.date === cell.date);
                  const isToday = cell.date === todayStr;
                  const isSelected = cell.date === selectedDay;

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedDay(cell.date);
                      }}
                      className={`min-h-[90px] sm:min-h-[110px] p-1 sm:p-1.5 flex flex-col justify-between transition-colors cursor-pointer ${
                        cell.isCurrentMonth ? 'bg-white hover:bg-[#f8fafd]' : 'bg-[#fafafa] text-gray-400'
                      } ${isSelected ? 'ring-2 ring-[#1a73e8] ring-inset' : ''}`}
                    >
                      {/* Day number with circle if today */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`w-6 h-6 rounded-full text-xs font-medium flex items-center justify-center transition-all ${
                            isToday
                              ? 'bg-[#1a73e8] text-white font-bold shadow-xs'
                              : 'text-[#3c4043]'
                          }`}
                        >
                          {cell.dayNumber}
                        </span>

                        {dayEvents.length > 0 && (
                          <span className="text-[10px] text-gray-500 font-medium sm:hidden">
                            {dayEvents.length}
                          </span>
                        )}
                      </div>

                      {/* Events Chips in Day Cell (Google Calendar Chip Style) */}
                      <div className="space-y-1 mt-1 flex-1 overflow-hidden">
                        {dayEvents.slice(0, 3).map((ev) => {
                          const isFlashing = ev.date === todayStr && ev.nextActionType === 'AGENT_PASSAGE' && ev.status !== 'effectue';
                          return (
                            <div
                              key={ev.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(ev);
                                setModalMode('view_event');
                              }}
                              className={`text-[11px] px-1.5 py-0.5 rounded truncate font-medium flex items-center gap-1 shadow-2xs hover:opacity-90 transition-opacity ${
                                isFlashing ? 'animate-pulse ring-1 ring-red-400 font-bold' : ''
                              }`}
                              style={{
                                backgroundColor: ev.color === '#1a73e8' ? '#e8f0fe' : ev.color === '#0d904f' ? '#e6f4ea' : ev.color === '#8b5cf6' ? '#ede9fe' : '#fef2f2',
                                color: ev.color,
                                borderLeft: `3px solid ${ev.color}`,
                              }}
                              title={`${ev.time} - ${ev.title}`}
                            >
                              <span className="font-mono text-[9px] shrink-0 font-bold">{ev.time}</span>
                              <span className="truncate">{ev.establishmentName}</span>
                            </div>
                          );
                        })}

                        {dayEvents.length > 3 && (
                          <span className="text-[10px] text-[#1a73e8] font-bold block px-1">
                            +{dayEvents.length - 3} de plus
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW B: GOOGLE CALENDAR WEEK GRID */}
          {calendarView === 'week' && (
            <div className="flex-1 flex flex-col min-w-full overflow-x-auto">
              {/* Week Header: 7 Days Columns */}
              <div className="flex border-b border-[#dadce0] bg-[#fafafa] sticky top-0 z-20 min-w-[700px]">
                {/* Time column spacer on the left */}
                <div className="w-14 sm:w-16 shrink-0 border-r border-[#dadce0] flex items-center justify-center text-[10px] text-gray-400 font-mono">
                  GMT+1
                </div>

                {/* 7 Days Columns Headers */}
                <div className="flex-1 grid grid-cols-7 divide-x divide-[#dadce0]">
                  {weekDays.map((day, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedDay(day.dateStr)}
                      className={`py-2 px-1 text-center cursor-pointer transition-colors ${
                        day.isSelected ? 'bg-[#f0f7ff]' : 'hover:bg-[#f1f3f4]'
                      }`}
                    >
                      <div className={`text-[11px] font-semibold uppercase ${day.isToday ? 'text-[#1a73e8] font-bold' : 'text-[#70757a]'}`}>
                        {day.dayName}
                      </div>
                      <div className="flex justify-center mt-0.5">
                        <span
                          className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                            day.isToday
                              ? 'bg-[#1a73e8] text-white shadow-xs'
                              : day.isSelected
                              ? 'border-2 border-[#1a73e8] text-[#1a73e8]'
                              : 'text-[#3c4043]'
                          }`}
                        >
                          {day.dayNumber}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* All-Day Events row / Summary row */}
              <div className="flex border-b border-[#dadce0] bg-[#f8fafd] min-w-[700px] text-xs">
                <div className="w-14 sm:w-16 shrink-0 border-r border-[#dadce0] py-1 px-1.5 text-[10px] text-gray-500 font-medium">
                  Journée
                </div>
                <div className="flex-1 grid grid-cols-7 divide-x divide-[#dadce0] p-1 gap-1">
                  {weekDays.map((day, idx) => {
                    const dayEvents = visibleEvents.filter((ev) => ev.date === day.dateStr);
                    return (
                      <div key={idx} className="min-h-[26px] flex flex-col gap-1">
                        {dayEvents.length > 0 ? (
                          <div
                            onClick={() => {
                              setSelectedDay(day.dateStr);
                              if (dayEvents.length === 1) {
                                setSelectedEvent(dayEvents[0]);
                                setModalMode('view_event');
                              }
                            }}
                            className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-[#e8f0fe] text-[#1a73e8] truncate cursor-pointer hover:bg-[#d2e3fc]"
                            title={`${dayEvents.length} tâche(s) pour ${day.dayName} ${day.dayNumber}`}
                          >
                            {dayEvents.length} tâche{dayEvents.length > 1 ? 's' : ''}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Hourly Timeline Grid */}
              <div className="flex-1 min-w-[700px] overflow-y-auto">
                <div className="relative divide-y divide-[#f1f3f4]">
                  {HOURS_GRID.map((hourStr, hourIdx) => {
                    const hourNum = parseInt(hourStr.split(':')[0], 10);
                    return (
                      <div key={hourIdx} className="flex min-h-[56px] group">
                        {/* Hour Label */}
                        <div className="w-14 sm:w-16 shrink-0 border-r border-[#dadce0] pr-2 text-right text-[11px] font-mono text-[#70757a] -mt-2.5">
                          {hourStr}
                        </div>

                        {/* 7 Columns for this Hour */}
                        <div className="flex-1 grid grid-cols-7 divide-x divide-[#dadce0] relative">
                          {weekDays.map((day, dayIdx) => {
                            const cellEvents = visibleEvents.filter((ev) => {
                              if (ev.date !== day.dateStr) return false;
                              const evHour = parseInt(ev.time.split(':')[0], 10);
                              return evHour === hourNum;
                            });

                            return (
                              <div
                                key={dayIdx}
                                onClick={() => {
                                  setSelectedDay(day.dateStr);
                                  setFormDate(day.dateStr);
                                  setFormTime(hourStr);
                                  setCreateType('rdv');
                                  setModalMode('create_event');
                                }}
                                className="relative p-0.5 hover:bg-[#f8fafd] transition-colors cursor-pointer"
                              >
                                {cellEvents.map((ev) => {
                                  const isFlashing = ev.date === todayStr && ev.nextActionType === 'AGENT_PASSAGE' && ev.status !== 'effectue';
                                  return (
                                    <div
                                      key={ev.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedEvent(ev);
                                        setModalMode('view_event');
                                      }}
                                      className={`rounded-lg p-1.5 text-xs shadow-2xs hover:shadow-xs transition-all mb-1 cursor-pointer flex flex-col justify-between ${
                                        isFlashing ? 'animate-pulse ring-1 ring-red-400 font-bold' : ''
                                      }`}
                                      style={{
                                        backgroundColor: ev.color === '#1a73e8' ? '#e8f0fe' : ev.color === '#0d904f' ? '#e6f4ea' : ev.color === '#8b5cf6' ? '#ede9fe' : '#fef2f2',
                                        borderLeft: `4px solid ${ev.color}`,
                                        color: ev.color,
                                      }}
                                    >
                                      <div className="flex items-center justify-between font-bold text-[11px] leading-tight">
                                        <span className="truncate">{ev.establishmentName}</span>
                                        <span className="font-mono text-[9px] shrink-0 ml-1">{ev.time}</span>
                                      </div>
                                      <div className="text-[10px] truncate opacity-90 font-medium mt-0.5">
                                        {ev.promoterName}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* VIEW C: SCHEDULE / PLANNING VIEW (Google Calendar Agenda List) */}
          {calendarView === 'schedule' && (
            <div className="flex-1 p-3 sm:p-6 max-w-2xl mx-auto w-full space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#dadce0]">
                <h3 className="font-bold text-[#1f1f1f] text-base flex items-center gap-2">
                  <List className="w-5 h-5 text-[#1a73e8]" />
                  Planning & Événements à venir ({visibleEvents.length})
                </h3>
              </div>

              {visibleEvents.length === 0 ? (
                <div className="py-12 text-center text-gray-500 space-y-2">
                  <CalendarIcon className="w-10 h-10 text-gray-300 mx-auto" />
                  <p className="text-sm font-medium">Aucun événement programmé</p>
                  <p className="text-xs">Utilisez le bouton « + » pour planifier une visite ou un acompte.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {visibleEvents
                    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
                    .map((ev) => {
                      const isFlashing = ev.date === todayStr && ev.nextActionType === 'AGENT_PASSAGE' && ev.status !== 'effectue';
                      return (
                        <div
                          key={ev.id}
                          onClick={() => {
                            setSelectedEvent(ev);
                            setModalMode('view_event');
                          }}
                          className={`bg-white border border-[#dadce0] hover:border-[#1a73e8] rounded-xl p-3.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-start justify-between gap-3 ${
                            isFlashing ? 'border-red-400 bg-red-50/20' : ''
                          }`}
                          style={{ borderLeft: `5px solid ${ev.color}` }}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-[#1a73e8] bg-[#e8f0fe] px-2 py-0.5 rounded">
                                {ev.date} à {ev.time}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  ev.type === 'acompte'
                                    ? 'bg-[#e6f4ea] text-[#137333]'
                                    : ev.type === 'rappel'
                                    ? 'bg-[#fef7e0] text-[#b06000]'
                                    : ev.type === 'renouvellement'
                                    ? 'bg-[#ede9fe] text-[#6d28d9]'
                                    : 'bg-[#e8f0fe] text-[#1a73e8]'
                                }`}
                              >
                                {ev.type.toUpperCase()}
                              </span>

                              {ev.nextActionType && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  ev.nextActionType === 'AGENT_PASSAGE' ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {ev.nextActionType === 'AGENT_PASSAGE' ? '🚶‍♂️ Agent passe sur place' : '🏛️ Usager passe Direction'}
                                </span>
                              )}
                            </div>

                            <h4 className="font-bold text-sm text-[#1f1f1f]">{ev.establishmentName}</h4>
                            <p className="text-xs text-[#5f6368] flex items-center gap-1">
                              <span>Promoteur : {ev.promoterName}</span>
                              <span>•</span>
                              <span>{ev.district}</span>
                            </p>

                            {ev.notes && (
                              <p className="text-[11px] text-[#444746] bg-gray-50 p-2 rounded-lg border border-gray-100 mt-1">
                                📝 {ev.notes}
                              </p>
                            )}
                          </div>

                          {ev.promoterPhone && (
                            <a
                              href={`tel:${ev.promoterPhone.replace(/\s+/g, '')}`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-2.5 rounded-full bg-[#e6f4ea] text-[#137333] hover:bg-[#ceead6] transition-colors"
                              title={`Appeler ${ev.promoterPhone}`}
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ======================================================== */}
      {/* 5. GOOGLE FLOATING ACTION BUTTON (+ Créer)               */}
      {/* ======================================================== */}
      <button
        onClick={() => {
          setCreateType('rdv');
          setFormDate(selectedDay);
          setModalMode('create_event');
        }}
        className="fixed bottom-6 right-6 z-40 bg-white hover:bg-[#f8fafd] border border-[#dadce0] text-[#3c4043] rounded-full px-5 py-3.5 shadow-lg hover:shadow-xl flex items-center gap-3 transition-all active:scale-95 group"
      >
        <span className="w-7 h-7 rounded-full bg-[#1a73e8] text-white flex items-center justify-center font-bold text-base shadow-xs">
          +
        </span>
        <span className="font-semibold text-sm tracking-wide text-[#3c4043]">
          Créer
        </span>
      </button>

      {/* ======================================================== */}
      {/* 6. MODAL: CRÉATION D'ÉVÉNEMENT / ACOMPTE AVEC CALCUL     */}
      {/* ======================================================== */}
      {modalMode === 'create_event' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-[#dadce0] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-[#f8fafd] px-5 py-3.5 border-b border-[#dadce0] flex items-center justify-between">
              <h3 className="font-bold text-base text-[#1f1f1f] flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-[#1a73e8]" />
                Ajouter dans l’Agenda
              </h3>
              <button
                onClick={() => setModalMode(null)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-type tabs: RDV / Recensement / Acompte */}
            <div className="grid grid-cols-3 p-1 bg-[#f1f3f4] mx-5 mt-4 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setCreateType('rdv')}
                className={`py-2 rounded-lg transition-all ${
                  createType === 'rdv' ? 'bg-white text-[#1a73e8] shadow-xs' : 'text-[#5f6368]'
                }`}
              >
                📅 Visite / RDV
              </button>
              <button
                type="button"
                onClick={() => setCreateType('acompte')}
                className={`py-2 rounded-lg transition-all ${
                  createType === 'acompte' ? 'bg-white text-[#0d904f] shadow-xs' : 'text-[#5f6368]'
                }`}
              >
                💵 Prendre Acompte
              </button>
              <button
                type="button"
                onClick={() => setCreateType('etablissement')}
                className={`py-2 rounded-lg transition-all ${
                  createType === 'etablissement' ? 'bg-white text-[#e37400] shadow-xs' : 'text-[#5f6368]'
                }`}
              >
                🏢 Nouvel Établissement
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveCreation} className="p-5 space-y-3.5 text-xs overflow-y-auto flex-1">

              {/* Existing establishment picker for RDV or Acompte */}
              {createType !== 'etablissement' && (
                <div>
                  <label className="block text-[#3c4043] font-semibold mb-1">
                    Sélectionner l'établissement (Portefeuille) :
                  </label>
                  <select
                    value={formEstId}
                    onChange={(e) => handleSelectExistingEst(e.target.value)}
                    className="w-full bg-[#f8fafd] border border-[#dadce0] rounded-xl px-3 py-2.5 text-[#1f1f1f] text-xs focus:border-[#1a73e8] focus:bg-white focus:outline-none"
                  >
                    <option value="">-- Sélectionner ou saisie libre ci-dessous --</option>
                    {myEstablishments.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.promoter} - Reste: {(e.totalDue - e.paidAmount).toLocaleString('fr-FR')} F)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Title / Name */}
              <div>
                <label className="block text-[#3c4043] font-semibold mb-1">
                  Nom de l’établissement *
                </label>
                <input
                  type="text"
                  required
                  value={formEstName}
                  onChange={(e) => setFormEstName(e.target.value)}
                  placeholder="Ex: Bar Le Silence, VIP Lounge Tié-Tié..."
                  className="w-full bg-[#f8fafd] border border-[#dadce0] rounded-xl px-3.5 py-2.5 text-xs text-[#1f1f1f] focus:border-[#1a73e8] focus:bg-white focus:outline-none"
                />
              </div>

              {/* Promoter & Phone */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[#3c4043] font-semibold mb-1">Promoteur / Gérant</label>
                  <input
                    type="text"
                    value={formPromoter}
                    onChange={(e) => setFormPromoter(e.target.value)}
                    placeholder="Nom du responsable"
                    className="w-full bg-[#f8fafd] border border-[#dadce0] rounded-xl px-3 py-2 text-xs text-[#1f1f1f] focus:border-[#1a73e8] focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#3c4043] font-semibold mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="06 xxx xx xx"
                    className="w-full bg-[#f8fafd] border border-[#dadce0] rounded-xl px-3 py-2 text-xs text-[#1f1f1f] focus:border-[#1a73e8] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* SECTION SPÉCIFIQUE ACOMPTE & RESTE À PAYER (Conforme à votre brief) */}
              {createType === 'acompte' && (
                <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-[#166534]">
                    <span className="font-bold flex items-center gap-1.5">
                      <Banknote className="w-4 h-4 text-[#15803d]" />
                      Régularisation des Frais d'Exploitation
                    </span>
                    <span className="text-[11px] bg-white px-2 py-0.5 rounded-full border border-[#86efac] font-mono font-bold">
                      Calcul Automatique
                    </span>
                  </div>

                  {/* Total exigible vs Déjà versé */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-[#dcfce7]">
                      <span className="text-[#64748b] block text-[10px]">Total Exigible (Frais globaux) :</span>
                      <input
                        type="number"
                        value={formTotalDue}
                        onChange={(e) => setFormTotalDue(Number(e.target.value))}
                        className="font-mono font-bold text-sm text-[#0f172a] w-full focus:outline-none"
                      />
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-[#dcfce7]">
                      <span className="text-[#64748b] block text-[10px]">Déjà versé au dossier :</span>
                      <span className="font-mono font-bold text-sm text-[#15803d]">
                        {formPaidSoFar.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  </div>

                  {/* Saisie de l'Avance */}
                  <div>
                    <label className="block text-[#166534] font-bold mb-1">
                      Montant de l'avance donnée par le tenancier (FCFA) * :
                    </label>
                    <input
                      type="number"
                      step="5000"
                      min="1000"
                      required
                      value={formAmount}
                      onChange={(e) => setFormAmount(Number(e.target.value))}
                      className="w-full bg-white border-2 border-[#22c55e] text-[#15803d] font-mono font-bold text-base rounded-xl px-3.5 py-2.5 focus:outline-none"
                      placeholder="Ex: 35000"
                    />
                  </div>

                  {/* Reste Calculé Automatiquement */}
                  <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    isFormWillBeSettled
                      ? 'bg-[#dcfce7] border-[#86efac] text-[#166534]'
                      : 'bg-[#fff7ed] border-[#fed7aa] text-[#c2410c]'
                  }`}>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider block">
                        {isFormWillBeSettled ? '🎉 Dossier Intégralement Soldé !' : '⚠️ Reste à Recouvrer :'}
                      </span>
                      <span className="font-mono font-bold text-base">
                        {computedRemainingBalance.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>

                    {isFormWillBeSettled && (
                      <span className="text-[11px] font-semibold text-[#166534] text-right">
                        Autorisation 1 an accordée.<br/>
                        Anniversaire l'an prochain.
                      </span>
                    )}
                  </div>

                  {/* Prochain Rendez-vous & Modalité de passage */}
                  {!isFormWillBeSettled && (
                    <div className="space-y-2 pt-2 border-t border-[#bbf7d0]">
                      <label className="block text-[#166534] font-bold">
                        Modalité du prochain rendez-vous convenu avec le tenancier :
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                          formNextActionType === 'AGENT_PASSAGE'
                            ? 'bg-red-50 border-red-300 text-red-800 font-bold'
                            : 'bg-white border-gray-200 text-gray-700'
                        }`}>
                          <input
                            type="radio"
                            name="nextAction"
                            checked={formNextActionType === 'AGENT_PASSAGE'}
                            onChange={() => setFormNextActionType('AGENT_PASSAGE')}
                            className="text-red-600 focus:ring-0"
                          />
                          <span>🚶‍♂️ L'agent repasse sur place (Clignotera)</span>
                        </label>

                        <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                          formNextActionType === 'DIRECTION_VISIT'
                            ? 'bg-blue-50 border-blue-300 text-blue-800 font-bold'
                            : 'bg-white border-gray-200 text-gray-700'
                        }`}>
                          <input
                            type="radio"
                            name="nextAction"
                            checked={formNextActionType === 'DIRECTION_VISIT'}
                            onChange={() => setFormNextActionType('DIRECTION_VISIT')}
                            className="text-blue-600 focus:ring-0"
                          />
                          <span>🏛️ Le promoteur passera à la Direction</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <label className="block text-[#374151] font-semibold mb-1">Date du prochain passage :</label>
                          <input
                            type="date"
                            required
                            value={formNextDueDate}
                            onChange={(e) => setFormNextDueDate(e.target.value)}
                            className="w-full bg-white border border-[#dadce0] rounded-xl px-3 py-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[#374151] font-semibold mb-1">Heure convenue :</label>
                          <input
                            type="time"
                            value={formTime}
                            onChange={(e) => setFormTime(e.target.value)}
                            className="w-full bg-white border border-[#dadce0] rounded-xl px-3 py-2 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Date & Time if not acompte */}
              {createType !== 'acompte' && (
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[#3c4043] font-semibold mb-1">Date *</label>
                    <input
                      type="date"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full bg-[#f8fafd] border border-[#dadce0] rounded-xl px-3 py-2 text-xs text-[#1f1f1f] focus:border-[#1a73e8] focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#3c4043] font-semibold mb-1">Heure</label>
                    <input
                      type="time"
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      className="w-full bg-[#f8fafd] border border-[#dadce0] rounded-xl px-3 py-2 text-xs text-[#1f1f1f] focus:border-[#1a73e8] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Specific fields for New Establishment */}
              {createType === 'etablissement' && (
                <div className="space-y-2.5 pt-1">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[#3c4043] font-semibold mb-1">Arrondissement</label>
                      <select
                        value={formDistrict}
                        onChange={(e) => setFormDistrict(e.target.value)}
                        className="w-full bg-[#f8fafd] border border-[#dadce0] rounded-xl px-3 py-2 text-xs focus:outline-none"
                      >
                        <option value="Arrondissement 1 Lumumba">Lumumba</option>
                        <option value="Arrondissement 2 Mvou-Mvou">Mvou-Mvou</option>
                        <option value="Arrondissement 3 Tié-Tié">Tié-Tié</option>
                        <option value="Arrondissement 4 Louandjili">Louandjili</option>
                        <option value="Arrondissement 5 Mongo-Mpoukou">Mongo-Mpoukou</option>
                        <option value="Arrondissement 6 Ngoyo">Ngoyo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[#3c4043] font-semibold mb-1">Activité</label>
                      <select
                        value={formActivity}
                        onChange={(e) => setFormActivity(e.target.value)}
                        className="w-full bg-[#f8fafd] border border-[#dadce0] rounded-xl px-3 py-2 text-xs focus:outline-none"
                      >
                        {CONFIRMED_ACTIVITY_RATES.map((act) => (
                          <option key={act.code} value={act.code}>
                            {act.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#3c4043] font-semibold mb-1">Surface (m²)</label>
                    <input
                      type="number"
                      value={formSurface}
                      onChange={(e) => setFormSurface(Number(e.target.value))}
                      className="w-full bg-[#f8fafd] border border-[#dadce0] rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  {/* Option: DÉPÔT D'INVITATION / CONVOCATION OFFICIELLE */}
                  <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl p-3 space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-[#1e40af] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formDepositConvocation}
                        onChange={(e) => setFormDepositConvocation(e.target.checked)}
                        className="w-4 h-4 rounded text-[#1a73e8] focus:ring-0"
                      />
                      <span>📜 Déposer immédiatement une Invitation officielle (Convocation SAA)</span>
                    </label>

                    {formDepositConvocation && (
                      <div className="pl-6 space-y-1.5 text-[11px] text-[#1e3a8a]">
                        <p>
                          L'usager sera invité à se présenter au bureau de la Direction pour son dossier. Une convocation conforme A4 sera générée et partageable par WhatsApp.
                        </p>
                        <div>
                          <span className="font-semibold block">Bureau de réception :</span>
                          <input
                            type="text"
                            value={formConvocationOffice}
                            onChange={(e) => setFormConvocationOffice(e.target.value)}
                            className="w-full bg-white border border-[#93c5fd] rounded-lg px-2 py-1 text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-[#3c4043] font-semibold mb-1">
                  Notes / Instructions de terrain
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Ex: Tenancier prévenu, versera le solde lors du prochain passage..."
                  className="w-full bg-[#f8fafd] border border-[#dadce0] rounded-xl px-3 py-2 text-xs focus:border-[#1a73e8] focus:bg-white focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#dadce0]">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5f6368] hover:bg-gray-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold text-xs shadow-md shadow-[#1a73e8]/30 flex items-center gap-1.5 transition-all"
                >
                  <Check className="w-4 h-4" /> Enregistrer dans l’Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. MODAL: DÉTAIL D'UN ÉVÉNEMENT & HISTORIQUE DES ACOMPTES */}
      {/* ======================================================== */}
      {modalMode === 'view_event' && selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-[#dadce0] w-full max-w-md shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#dadce0] pb-3">
              <div className="flex items-center gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0"
                  style={{ backgroundColor: selectedEvent.color }}
                />
                <div>
                  <h3 className="font-bold text-[#1f1f1f] text-base leading-tight">
                    {selectedEvent.establishmentName}
                  </h3>
                  <p className="text-[11px] text-[#5f6368]">
                    Promoteur : <strong>{selectedEvent.promoterName}</strong>
                  </p>
                </div>
              </div>
              <button onClick={() => setModalMode(null)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#3c4043]">
              <div className="flex items-center justify-between bg-[#f8fafd] p-2.5 rounded-xl border border-[#e0e3e7]">
                <div className="flex items-center gap-2 text-[#1a73e8] font-bold">
                  <Clock className="w-4 h-4" />
                  <span>{selectedEvent.date} à {selectedEvent.time}</span>
                </div>
                {selectedEvent.nextActionType && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedEvent.nextActionType === 'AGENT_PASSAGE'
                      ? 'bg-red-100 text-red-700 animate-pulse'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {selectedEvent.nextActionType === 'AGENT_PASSAGE' ? '🚶‍♂️ Agent sur place' : '🏛️ Usager à la Direction'}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500 shrink-0" />
                <span>{selectedEvent.district} {selectedEvent.address ? `(${selectedEvent.address})` : ''}</span>
              </div>

              {/* SITUATION FINANCIÈRE & DATE ANNIVERSAIRE */}
              {selectedEvent.totalDue && (
                <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-3 space-y-2">
                  <div className="flex justify-between items-center text-[#166534]">
                    <span className="font-bold">Situation du Dossier :</span>
                    <span className="font-mono font-bold">
                      {(selectedEvent.paidAmount || 0).toLocaleString('fr-FR')} / {selectedEvent.totalDue.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-[#dcfce7] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#16a34a] h-full"
                      style={{ width: `${Math.min(100, Math.round(((selectedEvent.paidAmount || 0) / selectedEvent.totalDue) * 100))}%` }}
                    />
                  </div>

                  {/* Solde vs Soldé */}
                  {(selectedEvent.paidAmount || 0) >= selectedEvent.totalDue ? (
                    <div className="bg-white p-2.5 rounded-lg border border-[#86efac] text-[#15803d] space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
                        <span>Dossier Intégralement Soldé !</span>
                      </p>
                      <p className="text-[11px] text-[#166534]">
                        🎂 <strong>Date Anniversaire de Renouvellement :</strong> {selectedEvent.anniversaryRenewalDate || 'Dans 1 an'}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-[#c2410c] text-[11px] font-bold bg-[#fff7ed] p-2 rounded-lg border border-[#fed7aa]">
                      <span>Reste à recouvrer :</span>
                      <span>{(selectedEvent.totalDue - (selectedEvent.paidAmount || 0)).toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  )}
                </div>
              )}

              {/* HISTORIQUE COMPLET DES ACOMPTES */}
              {selectedEvent.paymentHistory && selectedEvent.paymentHistory.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-[#1f1f1f] text-xs flex items-center justify-between">
                    <span>Historique des versements ({selectedEvent.paymentHistory.length}) :</span>
                    <span className="text-[10px] text-gray-500 font-normal">Quittances DDL-PN</span>
                  </h4>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {selectedEvent.paymentHistory.map((p: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-white border border-gray-200 p-2 rounded-lg flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-[#15803d]">{p.amount?.toLocaleString('fr-FR')} FCFA</span>
                          <span className="text-[10px] text-gray-500 block">Réf: {p.receiptRef || p.id} • {p.date}</span>
                        </div>
                        <span className="text-[10px] font-semibold bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                          {p.location === 'DIRECTION' ? 'Guichet' : 'Terrain'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedEvent.notes && (
                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-gray-700">
                  <span className="font-semibold block text-[10px] text-gray-500 uppercase">Notes :</span>
                  {selectedEvent.notes}
                </div>
              )}
            </div>

            {/* Quick Actions on Event */}
            <div className="pt-3 border-t border-[#dadce0] flex flex-col gap-2">
              <div className="flex items-center gap-2">
                {selectedEvent.promoterPhone ? (
                  <a
                    href={`tel:${selectedEvent.promoterPhone.replace(/\s+/g, '')}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#e6f4ea] text-[#137333] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#ceead6]"
                  >
                    <Phone className="w-3.5 h-3.5" /> Appeler ({selectedEvent.promoterPhone})
                  </a>
                ) : (
                  <span className="text-xs text-gray-400">Sans téléphone</span>
                )}

                <button
                  onClick={() => {
                    setModalMode(null);
                    setCreateType('acompte');
                    setFormEstId(selectedEvent.establishmentId || '');
                    setFormEstName(selectedEvent.establishmentName);
                    setFormPromoter(selectedEvent.promoterName);
                    setFormPhone(selectedEvent.promoterPhone);
                    setFormDistrict(selectedEvent.district);
                    setFormTotalDue(selectedEvent.totalDue || 150000);
                    setFormPaidSoFar(selectedEvent.paidAmount || 0);
                    setModalMode('create_event');
                  }}
                  className="py-2 px-3 rounded-xl bg-[#1a73e8] text-white font-bold text-xs flex items-center gap-1.5 hover:bg-[#1557b0]"
                >
                  <Banknote className="w-3.5 h-3.5" /> Prendre Avance
                </button>
              </div>

              {/* Bouton pour générer / afficher l'invitation */}
              <button
                onClick={() => {
                  setActiveConvocation({
                    ref: `CONV-DDL-${Date.now().toString().slice(-5)}`,
                    estName: selectedEvent.establishmentName,
                    promoter: selectedEvent.promoterName,
                    phone: selectedEvent.promoterPhone,
                    district: selectedEvent.district,
                    date: formatISOToFR(selectedEvent.date),
                    time: selectedEvent.time,
                    office: 'Bureau N° 4 - Service Autorisation & Animation (SAA)',
                    agentName: currentAgent.name,
                    agentBadge: currentAgent.badgeNumber,
                  });
                  setModalMode('convocation_view');
                }}
                className="w-full py-2 px-3 rounded-xl border border-[#bfdbfe] bg-[#eff6ff] text-[#1e40af] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#dbeafe]"
              >
                <FileText className="w-3.5 h-3.5" /> Déposer / Imprimer Invitation Direction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. MODAL: INVITATION / CONVOCATION OFFICIELLE CONGOLAISE */}
      {/* ======================================================== */}
      {modalMode === 'convocation_view' && activeConvocation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-gray-300 w-full max-w-xl shadow-2xl p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div id="convocation-print-sheet" className="space-y-4 p-2 bg-white text-[#161c27]">
              {/* Header Officiel République du Congo */}
              <div className="border-b-2 border-black pb-3 text-center space-y-1">
                <div className="flex justify-between items-center">
                  <ArmoiriesCongo className="w-12 h-12" />
                  <div>
                    <h4 className="font-serif text-xs font-bold tracking-wider uppercase">
                      République du Congo
                    </h4>
                    <p className="text-[10px] italic">Unité - Travail - Progrès</p>
                  </div>
                  <LogoDDLPN className="w-12 h-12" />
                </div>
                <div className="pt-2 text-[10px] uppercase font-bold text-[#022448] leading-tight">
                  MINISTÈRE DE LA CULTURE, DES ARTS, DU PATRIMOINE NATIONAL ET DE L'INDUSTRIE TOURISTIQUE
                  <br />
                  <span className="text-xs text-[#006d2f]">Direction Départementale des Loisirs de Pointe-Noire</span>
                </div>
              </div>

              {/* Document Title */}
              <div className="text-center py-1">
                <span className="inline-block px-3 py-1 bg-gray-100 border border-gray-400 font-mono font-bold text-xs tracking-wider uppercase">
                  INVITATION / CONVOCATION OFFICIELLE N° {activeConvocation.ref}
                </span>
              </div>

              {/* Corps de la convocation */}
              <div className="space-y-3 text-xs leading-relaxed text-gray-800">
                <p>
                  <strong>Destinataire :</strong> M./Mme <strong className="text-black">{activeConvocation.promoter}</strong>, promoteur/gérant de l'établissement dénommé <strong className="text-black">« {activeConvocation.estName} »</strong>, situé à {activeConvocation.district}.
                </p>

                <div className="bg-[#f8fafd] border border-gray-200 p-3 rounded-xl space-y-1.5">
                  <p className="font-semibold text-black">
                    Vous êtes prié(e) de vous présenter impérativement :
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500 block">Date fixée :</span>
                      <strong className="text-[#022448] font-bold">{activeConvocation.date}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Heure de réception :</span>
                      <strong className="text-[#022448] font-bold">{activeConvocation.time}</strong>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Lieu de convocation :</span>
                    <strong>{activeConvocation.office}</strong>
                  </div>
                </div>

                <p className="text-justify text-[11px] text-gray-600">
                  <strong>Objet :</strong> Régularisation administrative de l'activité de loisirs, examen de conformité et fixation des droits d'exploitation prévus par la réglementation en vigueur.
                </p>

                <div className="pt-2 border-t border-gray-200 flex justify-between items-end text-[10px] text-gray-600">
                  <div>
                    <span>Délivré sur le terrain par l'Agent Assermenté :</span>
                    <p className="font-bold text-black">{activeConvocation.agentName} ({activeConvocation.agentBadge})</p>
                  </div>
                  <div className="text-right">
                    <span>Pointe-Noire, le {new Date().toLocaleDateString('fr-FR')}</span>
                    <p className="font-serif italic font-bold">Pour le Directeur Départemental</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2 no-print">
              <button
                onClick={() => setModalMode(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Fermer
              </button>

              <div className="flex items-center gap-2">
                {activeConvocation.phone && (
                  <a
                    href={`https://wa.me/${activeConvocation.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Bonjour ${activeConvocation.promoter}, voici votre Invitation Officielle DDL-PN N° ${activeConvocation.ref} pour l'établissement ${activeConvocation.estName}. Rendez-vous fixé au ${activeConvocation.date} à ${activeConvocation.time} à la Direction Départementale des Loisirs.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-[#25d366] text-white font-bold text-xs flex items-center gap-1.5 hover:bg-[#20ba5a]"
                  >
                    <Send className="w-3.5 h-3.5" /> WhatsApp Promoteur
                  </a>
                )}

                <button
                  onClick={() => printElement(document.getElementById('convocation-print-sheet'), `Convocation_${activeConvocation.ref}`)}
                  className="px-4 py-2 rounded-xl bg-[#022448] text-white font-bold text-xs flex items-center gap-1.5 hover:bg-[#001830] cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Imprimer / A4
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
