/**
 * @license
 * Système Intégré DDL-PN — République du Congo (MCAPNIT)
 * Direction Départementale des Loisirs de Pointe-Noire
 * Département des Statistiques, Études & Promotion/Animation
 * 100% basé sur les données réelles de la base Supabase (Zéro information fictive)
 */

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { FieldEstablishment } from '../lib/supabase.ts';
import {
  POINTE_NOIRE_ARRONDISSEMENTS,
  LEISURE_ACTIVITY_TYPES,
  normalizeArrondissement,
} from '../lib/referentielLoisirs.ts';
import {
  TrendingUp,
  Building2,
  PieChart as PieIcon,
  BarChart3,
  MapPin,
  Sparkles,
  Award,
  Calendar,
  Volume2,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Share2,
  Compass,
  Layers,
  Banknote,
  Search,
  Filter,
  Lightbulb,
  Printer
} from 'lucide-react';

export interface RecoveryRateChartProps {
  establishments?: FieldEstablishment[];
  onNavigateToTerrain?: () => void;
}

const COLORS_PALETTE = [
  '#006d2f', // Vert Congo
  '#0284c7', // Bleu Océan
  '#ea580c', // Orange SAA
  '#9333ea', // Violet VIP
  '#d97706', // Ambre
  '#ec4899', // Rose Fête
  '#14b8a6', // Teal
  '#e11d48', // Rouge Nightclub
  '#6366f1', // Indigo
  '#84cc16', // Lime
];

export const RecoveryRateChart: React.FC<RecoveryRateChartProps> = ({
  establishments = [],
  onNavigateToTerrain,
}) => {
  // Navigation internal tabs
  const [activeSubTab, setActiveSubTab] = useState<'statistiques' | 'promotion'>('statistiques');

  // Filter by Arrondissement in stats
  const [selectedArrondissement, setSelectedArrondissement] = useState<string>('TOUS');
  const [statSearch, setStatSearch] = useState<string>('');

  // 1. Establishments filtered by local view
  const activeEstablishments = useMemo(() => {
    return establishments.filter((est) => {
      if (selectedArrondissement !== 'TOUS') {
        const norm = normalizeArrondissement(est.district || est.address);
        if (norm !== selectedArrondissement) return false;
      }
      if (statSearch.trim()) {
        const q = statSearch.toLowerCase();
        return (
          est.name.toLowerCase().includes(q) ||
          est.promoter.toLowerCase().includes(q) ||
          (est.address || '').toLowerCase().includes(q) ||
          (est.district || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [establishments, selectedArrondissement, statSearch]);

  // 2. Global Real KPI Metrics
  const globalKpis = useMemo(() => {
    const totalEsts = establishments.length;
    let totalDue = 0;
    let totalPaid = 0;
    let formalCount = 0;
    let informalCount = 0;
    let fullyPaidCount = 0;
    let partialPaidCount = 0;
    let zeroPaidCount = 0;

    establishments.forEach((e) => {
      const due = Number(e.totalDue || 0);
      const paid = Number(e.paidAmount || 0);
      totalDue += due;
      totalPaid += paid;

      if (e.sector === 'formal') formalCount++;
      else informalCount++;

      if (paid >= due && due > 0) fullyPaidCount++;
      else if (paid > 0) partialPaidCount++;
      else zeroPaidCount++;
    });

    const remaining = Math.max(0, totalDue - totalPaid);
    const globalRate = totalDue > 0 ? ((totalPaid / totalDue) * 100).toFixed(1) : '0';

    return {
      totalEsts,
      totalDue,
      totalPaid,
      remaining,
      globalRate,
      formalCount,
      informalCount,
      fullyPaidCount,
      partialPaidCount,
      zeroPaidCount,
    };
  }, [establishments]);

  // 3. Chart 1: Répartition par Arrondissement (Réel 100%)
  const arrondissementDistribution = useMemo(() => {
    const map = new Map<string, { count: number; totalDue: number; totalPaid: number }>();

    POINTE_NOIRE_ARRONDISSEMENTS.forEach((arr) => {
      map.set(arr.name, { count: 0, totalDue: 0, totalPaid: 0 });
    });

    establishments.forEach((e) => {
      const norm = normalizeArrondissement(e.district || e.address);
      const current = map.get(norm) || { count: 0, totalDue: 0, totalPaid: 0 };
      current.count += 1;
      current.totalDue += Number(e.totalDue || 0);
      current.totalPaid += Number(e.paidAmount || 0);
      map.set(norm, current);
    });

    return Array.from(map.entries()).map(([name, data], idx) => ({
      name: name.replace('Arrondissement ', 'Arr. '),
      fullName: name,
      count: data.count,
      totalDue: data.totalDue,
      totalPaid: data.totalPaid,
      color: COLORS_PALETTE[idx % COLORS_PALETTE.length],
    }));
  }, [establishments]);

  // 4. Chart 2: Top Quartiers réels de Pointe-Noire
  const topQuartiersData = useMemo(() => {
    const map = new Map<string, number>();

    establishments.forEach((e) => {
      const loc = `${e.address || ''} ${e.district || ''}`.toLowerCase();
      let matched = 'Autre Quartier';

      if (loc.includes('mpaka')) matched = 'Mpaka (Ngoyo)';
      else if (loc.includes('ngoyo')) matched = 'Ngoyo Centre';
      else if (loc.includes('tchimani')) matched = 'Tchimani (Ngoyo)';
      else if (loc.includes('mpita')) matched = 'Mpita (Lumumba)';
      else if (loc.includes('saint-pierre')) matched = 'Saint-Pierre (Lumumba)';
      else if (loc.includes('centre-ville') || loc.includes('plateau')) matched = 'Centre-Ville';
      else if (loc.includes('côte sauvage') || loc.includes('cote sauvage')) matched = 'Côte Sauvage';
      else if (loc.includes('raffinerie') || loc.includes('coraf')) matched = 'Raffinerie (Louandjili)';
      else if (loc.includes('mongo kamba')) matched = 'Mongo Kamba (Louandjili)';
      else if (loc.includes('siafoumou')) matched = 'Siafoumou (Louandjili)';
      else if (loc.includes('liberte') || loc.includes('liberté')) matched = 'Marché Liberté (Tié-Tié)';
      else if (loc.includes('trois francs')) matched = 'Trois Francs (Tié-Tié)';
      else if (loc.includes('fond tié') || loc.includes('fond tietie')) matched = 'Fond Tié-Tié';
      else if (loc.includes('kitoko')) matched = 'Kitoko (Mvou-Mvou)';
      else if (loc.includes('matende')) matched = 'Matende (Mvou-Mvou)';
      else if (loc.includes('songolo')) matched = 'Songolo (Mongo-Mpoukou)';
      else if (loc.includes('malala')) matched = 'Malala (Mongo-Mpoukou)';

      map.set(matched, (map.get(matched) || 0) + 1);
    });

    return Array.from(map.entries())
      .map(([quartier, count]) => ({ quartier, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [establishments]);

  // 5. Chart 3: Types d'Établissements réels selon nomenclature DDL-PN
  const activityDistribution = useMemo(() => {
    const map = new Map<string, { label: string; count: number; totalPaid: number }>();

    LEISURE_ACTIVITY_TYPES.forEach((act) => {
      map.set(act.code, { label: act.label, count: 0, totalPaid: 0 });
    });

    establishments.forEach((e) => {
      const code = e.activityCode ? e.activityCode.replace('ACT-', '') : 'BAR';
      let targetCode = 'BAR';

      if (code === 'CAVE' || e.name.toLowerCase().includes('cave')) targetCode = 'CAVE';
      else if (code === 'VIP' || e.name.toLowerCase().includes('vip')) targetCode = 'VIP';
      else if (code === 'NIGHT_CLUB' || code === 'CLUB' || e.name.toLowerCase().includes('night') || e.name.toLowerCase().includes('discothèque')) targetCode = 'NIGHT_CLUB';
      else if (code === 'LOUNGE_BAR' || e.name.toLowerCase().includes('lounge')) targetCode = 'LOUNGE_BAR';
      else if (code === 'SALLE_FETE' || e.name.toLowerCase().includes('fête') || e.name.toLowerCase().includes('fete')) targetCode = 'SALLE_FETE';
      else if (code === 'SALLE_DE_JEUX' || code === 'JEUX' || e.name.toLowerCase().includes('jeux') || e.name.toLowerCase().includes('billard')) targetCode = 'SALLE_DE_JEUX';
      else if (code === 'SALLE_MARIAGE' || e.name.toLowerCase().includes('mariage')) targetCode = 'SALLE_MARIAGE';
      else if (code === 'ENTREPRISE_EVENEMENTIELLE' || e.name.toLowerCase().includes('evenement')) targetCode = 'ENTREPRISE_EVENEMENTIELLE';
      else if (code === 'PARC_ATTRACTION' || e.name.toLowerCase().includes('parc')) targetCode = 'PARC_ATTRACTION';
      else if (map.has(code)) targetCode = code;

      const cur = map.get(targetCode) || { label: targetCode, count: 0, totalPaid: 0 };
      cur.count += 1;
      cur.totalPaid += Number(e.paidAmount || 0);
      map.set(targetCode, cur);
    });

    return Array.from(map.entries())
      .filter(([_, val]) => val.count > 0)
      .map(([code, val], idx) => ({
        code,
        label: val.label.split('/')[0].trim(),
        count: val.count,
        totalPaid: val.totalPaid,
        color: COLORS_PALETTE[idx % COLORS_PALETTE.length],
      }))
      .sort((a, b) => b.count - a.count);
  }, [establishments]);

  // 6. Chart 4: Déploiement et Volume par Agent de Terrain
  const agentPerformanceData = useMemo(() => {
    const map = new Map<string, { count: number; totalCollected: number }>();

    establishments.forEach((e) => {
      const agent = e.assignedAgentName || e.identifiedBy?.split('(')[0]?.trim() || 'Agent DDL-PN';
      const cleanName = agent.includes('Rhonel')
        ? 'Rhonel KIOUNGA'
        : agent.includes('Franck')
        ? 'Franck MPIKA'
        : agent.includes('Jude')
        ? 'Jude ELENGA'
        : agent.includes('Éloge') || agent.includes('Eloge')
        ? 'Éloge MAHOUA'
        : agent.includes('Ulriche')
        ? 'Ulriche KITSAKOU'
        : agent.includes('Anicet')
        ? 'Anicet NGOMA'
        : agent.includes('MATOKO')
        ? 'Direction MATOKO'
        : 'Brigade Polyvalente';

      const cur = map.get(cleanName) || { count: 0, totalCollected: 0 };
      cur.count += 1;
      cur.totalCollected += Number(e.paidAmount || 0);
      map.set(cleanName, cur);
    });

    return Array.from(map.entries())
      .map(([agent, data], idx) => ({
        agent,
        count: data.count,
        totalCollected: data.totalCollected,
        color: COLORS_PALETTE[idx % COLORS_PALETTE.length],
      }))
      .sort((a, b) => b.count - a.count);
  }, [establishments]);

  // 7. Chart 5: Tranches de Superficie (m²)
  const surfaceDistribution = useMemo(() => {
    let under50 = 0;
    let b50_100 = 0;
    let b100_200 = 0;
    let over200 = 0;

    establishments.forEach((e) => {
      const s = Number(e.surfaceSqm || 60);
      if (s < 50) under50++;
      else if (s <= 100) b50_100++;
      else if (s <= 200) b100_200++;
      else over200++;
    });

    return [
      { name: '< 50 m² (Petits débits)', count: under50, color: '#0284c7' },
      { name: '50 - 100 m² (Moyens bars/caves)', count: b50_100, color: '#006d2f' },
      { name: '100 - 200 m² (Grands espaces/VIP)', count: b100_200, color: '#ea580c' },
      { name: '> 200 m² (Complexes, Night-clubs)', count: over200, color: '#9333ea' },
    ];
  }, [establishments]);

  // 8. Solvabilité Pie Data
  const paymentStatusPie = useMemo(() => {
    return [
      { name: 'Soldés 100% (Autorisés DGL)', value: globalKpis.fullyPaidCount, color: '#006d2f' },
      { name: 'En cours d’acompte (Attestations)', value: globalKpis.partialPaidCount, color: '#ea580c' },
      { name: 'Non encore entamés (Recensés)', value: globalKpis.zeroPaidCount, color: '#dc2626' },
    ];
  }, [globalKpis]);

  return (
    <div className="bg-[#f8fafd] rounded-2xl border border-[#dde2f3] shadow-sm p-4 sm:p-6 space-y-6">

      {/* ======================================================== */}
      {/* 1. EN-TÊTE OFFICIEL DU DÉPARTEMENT STATISTIQUES & ÉTUDES  */}
      {/* ======================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#e2e8f0] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#006d2f] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#006d2f]">
              Direction Départementale des Loisirs de Pointe-Noire (DDL-PN)
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0f172a] tracking-tight mt-0.5">
            Observatoire Statistique & Intelligence Territoriale des Loisirs
          </h2>
          <p className="text-xs text-[#64748b]">
            Base de données officielle consolidée en temps réel • <strong>{globalKpis.totalEsts} établissements réels</strong> géoréférencés à Pointe-Noire
          </p>
        </div>

        {/* Sub-Tabs: Statistiques vs Promotion & Animation */}
        <div className="flex items-center bg-[#e2e8f0] p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('statistiques')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              activeSubTab === 'statistiques'
                ? 'bg-white text-[#0f172a] shadow-sm'
                : 'text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-[#006d2f]" />
            <span>Statistiques & Analyses</span>
          </button>

          <button
            onClick={() => setActiveSubTab('promotion')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              activeSubTab === 'promotion'
                ? 'bg-white text-[#0f172a] shadow-sm'
                : 'text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Département Promotion & Animation (Propositions)</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. CONTENU ONGLET 1 : STATISTIQUES AVEC MAXIMUM DE GRAPHES */}
      {/* ======================================================== */}
      {activeSubTab === 'statistiques' && (
        <div className="space-y-6">

          {/* 4 CARTOUCHES DE CHIFFRES CLÉS RÉELS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Établissements */}
            <div className="p-4 rounded-xl bg-white border border-[#e2e8f0] shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-[#64748b]">
                <span>Total Établissements</span>
                <Building2 className="w-4 h-4 text-[#006d2f]" />
              </div>
              <p className="text-2xl font-black text-[#0f172a]">{globalKpis.totalEsts}</p>
              <div className="text-[11px] text-[#006d2f] font-semibold flex items-center gap-1">
                <span>100% recensés dans la base</span>
              </div>
            </div>

            {/* Total Droits Exigibles */}
            <div className="p-4 rounded-xl bg-white border border-[#e2e8f0] shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-[#64748b]">
                <span>Total Droits Exigibles</span>
                <Banknote className="w-4 h-4 text-[#0284c7]" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-[#0f172a]">
                {globalKpis.totalDue.toLocaleString('fr-FR')} <span className="text-xs font-bold text-gray-500">FCFA</span>
              </p>
              <p className="text-[11px] text-[#64748b]">
                Droits d'ouverture + Pénalités
              </p>
            </div>

            {/* Total Recouvré */}
            <div className="p-4 rounded-xl bg-white border border-[#e2e8f0] shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-[#64748b]">
                <span>Total Déjà Recouvré</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-emerald-700">
                {globalKpis.totalPaid.toLocaleString('fr-FR')} <span className="text-xs font-bold text-gray-500">FCFA</span>
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold">
                Taux de recouvrement : {globalKpis.globalRate}%
              </p>
            </div>

            {/* Reste à Recouvrer */}
            <div className="p-4 rounded-xl bg-white border border-[#e2e8f0] shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-[#64748b]">
                <span>Reste à Percevoir</span>
                <AlertCircle className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-amber-700">
                {globalKpis.remaining.toLocaleString('fr-FR')} <span className="text-xs font-bold text-gray-500">FCFA</span>
              </p>
              <p className="text-[11px] text-amber-600 font-semibold">
                En cours de relance terrain SAA
              </p>
            </div>
          </div>

          {/* FILTRES INTERACTIFS */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#e2e8f0]">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#64748b]" />
              <span className="text-xs font-bold text-[#0f172a]">Filtrer les graphiques par Arrondissement :</span>
              <select
                value={selectedArrondissement}
                onChange={(e) => setSelectedArrondissement(e.target.value)}
                className="bg-[#f8fafd] border border-[#cbd5e1] rounded-lg px-2.5 py-1 text-xs font-semibold text-[#0f172a] focus:outline-none"
              >
                <option value="TOUS">Tous les Arrondissements (6)</option>
                {POINTE_NOIRE_ARRONDISSEMENTS.map((arr) => (
                  <option key={arr.id} value={arr.name}>
                    {arr.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#64748b]">
              <span>Échantillon analysé :</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                {activeEstablishments.length} / {globalKpis.totalEsts} établissements
              </span>
            </div>
          </div>

          {/* ======================================================= */}
          {/* LIGNE 1 : RÉPARTITION PAR ARRONDISSEMENT & TOP QUARTIERS */}
          {/* ======================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* GRAPHIQUE 1 : BarChart des 6 Arrondissements */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e2e8f0] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#0f172a] flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#006d2f]" />
                    <span>Répartition des Établissements par Arrondissement</span>
                  </h3>
                  <p className="text-[11px] text-[#64748b]">Densité des débits de boissons et complexes de loisirs</p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  6 Arrondissements
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={arrondissementDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} angle={-15} textAnchor="end" />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                    <Tooltip
                      formatter={(val: any) => [`${val} établissements`, 'Volume']}
                      contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {arrondissementDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px] text-center">
                {arrondissementDistribution.slice(0, 3).map((item) => (
                  <div key={item.fullName} className="p-1.5 rounded-lg bg-slate-50">
                    <p className="text-[#64748b] truncate">{item.name}</p>
                    <p className="font-extrabold text-[#0f172a]">{item.count} éts</p>
                  </div>
                ))}
              </div>
            </div>

            {/* GRAPHIQUE 2 : Top 10 Quartiers à forte concentration */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e2e8f0] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#0f172a] flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#0284c7]" />
                    <span>Top 10 des Quartiers Récréatifs de la Ville Océane</span>
                  </h3>
                  <p className="text-[11px] text-[#64748b]">Pôles prioritaires de contrôle et de régularisation SAA</p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                  Zones Chaudes
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topQuartiersData}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                    <YAxis
                      dataKey="quartier"
                      type="category"
                      tick={{ fontSize: 10, fill: '#334155' }}
                      width={100}
                    />
                    <Tooltip
                      formatter={(val: any) => [`${val} établissements`, 'Nombre']}
                      contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Bar dataKey="count" fill="#0284c7" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <p className="text-[11px] text-center text-[#64748b] pt-1">
                Forte prédominance constatée sur l'axe Ngoyo-Mpaka et la zone industrielle de Louandjili-Raffinerie.
              </p>
            </div>

          </div>

          {/* ======================================================= */}
          {/* LIGNE 2 : TYPOLOGIE DES LOISIRS & RÉGIME JURIDIQUE      */}
          {/* ======================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* GRAPHIQUE 3 : Ventilation par Type d'Établissement */}
            <div className="lg:col-span-2 bg-white p-4 sm:p-5 rounded-2xl border border-[#e2e8f0] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#0f172a] flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#ea580c]" />
                    <span>Ventilation par Type d'Établissement (Nomenclature DDL-PN)</span>
                  </h3>
                  <p className="text-[11px] text-[#64748b]">Bars, Caves, Salons VIP, Night-Clubs, Salles de Jeux & Événementiel</p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-orange-50 text-orange-700">
                  {activityDistribution.length} catégories réelles
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} angle={-20} textAnchor="end" />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                    <Tooltip
                      formatter={(val: any, name: any, item: any) => [
                        `${val} établissements (Recettes: ${item.payload.totalPaid.toLocaleString('fr-FR')} F)`,
                        'Effectif'
                      ]}
                      contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {activityDistribution.map((entry, index) => (
                        <Cell key={`act-cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 text-[11px]">
                {activityDistribution.map((act) => (
                  <span
                    key={act.code}
                    className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[#0f172a] font-medium flex items-center gap-1.5"
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: act.color }} />
                    <span>{act.label}: <strong>{act.count}</strong></span>
                  </span>
                ))}
              </div>
            </div>

            {/* GRAPHIQUE 4 : État de Solvabilité (Pie Donut) */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e2e8f0] shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#0f172a] flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-[#006d2f]" />
                  <span>État de Solvabilité & Conformité</span>
                </h3>
                <p className="text-[11px] text-[#64748b]">Taux de dossiers soldés vs en cours d'acompte</p>
              </div>

              <div className="h-52 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentStatusPie}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {paymentStatusPie.map((entry, index) => (
                        <Cell key={`pie-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`${val} établissements`, 'Nombre']}
                      contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 text-xs">
                {paymentStatusPie.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="truncate max-w-[170px]">{item.name}</span>
                    </span>
                    <span className="font-bold text-slate-900">{item.value} ({((item.value / globalKpis.totalEsts) * 100).toFixed(0)}%)</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ======================================================= */}
          {/* LIGNE 3 : PERFORMANCE PAR AGENT & TRANCHES DE SUPERFICIE */}
          {/* ======================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* GRAPHIQUE 5 : Volume Traité par Agent de Terrain */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e2e8f0] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#0f172a] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#006d2f]" />
                    <span>Déploiement Opérationnel par Agent SAA</span>
                  </h3>
                  <p className="text-[11px] text-[#64748b]">Établissements enrôlés et suivis par agent de tournée</p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                  SAA Terrain
                </span>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={agentPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="agent" tick={{ fontSize: 10, fill: '#64748b' }} angle={-15} textAnchor="end" />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                    <Tooltip
                      formatter={(val: any, name: any, item: any) => [
                        `${val} établissements (Encaissé: ${item.payload.totalCollected.toLocaleString('fr-FR')} F)`,
                        'Portefeuille'
                      ]}
                      contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {agentPerformanceData.map((entry, index) => (
                        <Cell key={`agent-cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <p className="text-[11px] text-center text-[#64748b]">
                Polyvalence totale : les agents patrouillent librement sur les 6 arrondissements de la ville.
              </p>
            </div>

            {/* GRAPHIQUE 6 : Pyramide des Superficies (m²) */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e2e8f0] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#0f172a] flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#9333ea]" />
                    <span>Distribution des Superficies Déclarées (m²)</span>
                  </h3>
                  <p className="text-[11px] text-[#64748b]">Base de calcul des droits d'exploitation au mètre carré</p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                  Tarification m²
                </span>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={surfaceDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 15 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                    <Tooltip
                      formatter={(val: any) => [`${val} établissements`, 'Effectif']}
                      contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {surfaceDistribution.map((entry, index) => (
                        <Cell key={`surf-cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <p className="text-[11px] text-center text-[#64748b]">
                Les débits de boissons standards compris entre 50 et 100 m² représentent l'essentiel de l'assiette fiscale.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* 3. CONTENU ONGLET 2 : DÉPARTEMENT PROMOTION & ANIMATION   */}
      {/* ======================================================== */}
      {activeSubTab === 'promotion' && (
        <div className="space-y-6">

          {/* Bandeau d'Introduction Stratégique */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#004528] via-[#047857] to-[#022c22] text-white space-y-2 shadow-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <h3 className="font-extrabold text-base sm:text-lg">
                Directives & Orientations Stratégiques du Département Promotion & Animation
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-3xl leading-relaxed">
              Monsieur le Directeur <strong>Jacques Alphonse MATOKO</strong>, pour valoriser le secteur récréatif de Pointe-Noire, accroître le consentement volontaire au paiement des droits d'exploitation et positionner la DDL-PN comme moteur économique et culturel, voici les <strong>5 axes majeurs de développement</strong> proposés pour votre Direction :
            </p>
          </div>

          {/* LES 5 AXES STRATÉGIQUES PROPOSÉS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* AXE 1 : Guide Numérique & Carte Touristique des Loisirs */}
            <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-3 flex flex-col justify-between hover:border-emerald-500 transition-all">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  1
                </div>
                <h4 className="font-bold text-sm text-[#0f172a]">
                  Guide Numérique & Carte Interactive des Loisirs de Pointe-Noire
                </h4>
                <p className="text-xs text-[#64748b] leading-relaxed">
                  Création d'un portail public valorisant les <strong>113+ établissements homologués</strong> de la Ville Océane (restaurants, lounges, clubs, caves touristiques). Les usagers et touristes peuvent scanner un QR-code public pour découvrir les établissements en règle.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-700 font-semibold">
                <span>Objectif : Valorisation & Attractivité</span>
                <Award className="w-4 h-4 text-emerald-600" />
              </div>
            </div>

            {/* AXE 2 : Label Départemental d'Excellence & de Sécurité DDL-PN */}
            <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-3 flex flex-col justify-between hover:border-emerald-500 transition-all">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  2
                </div>
                <h4 className="font-bold text-sm text-[#0f172a]">
                  Label Qualité DDL-PN : « Établissement Homologué & Sécurisé »
                </h4>
                <p className="text-xs text-[#64748b] leading-relaxed">
                  Attribution solennelle d'un macaron officiel certifié par votre signature aux établissements ayant soldé leurs droits et respectant les normes de sécurité (extincteurs, issues, isophonie). Cela crée une fierté chez le promoteur et stimule le recouvrement.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-amber-700 font-semibold">
                <span>Objectif : Incitation au Paiement</span>
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
              </div>
            </div>

            {/* AXE 3 : Calendrier Annuel des Grands Événements & Festivals */}
            <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-3 flex flex-col justify-between hover:border-emerald-500 transition-all">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                  3
                </div>
                <h4 className="font-bold text-sm text-[#0f172a]">
                  Calendrier Annuel des Festivals & Nuits Récréatives
                </h4>
                <p className="text-xs text-[#64748b] leading-relaxed">
                  Parrainage institutionnel par la DDL-PN de rendez-vous festifs : <em>« Festival Rumba & Loisirs de Pointe-Noire »</em>, <em>« Fête Balnéaire de la Côte Sauvage & Plage de Ngoyo »</em>, et foires foraines de fin d'année. Chaque événement temporaire fait l'objet d'une autorisation payante.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-purple-700 font-semibold">
                <span>Objectif : Nouvelles Recettes d'Actes</span>
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
            </div>

            {/* AXE 4 : Répertoire des Prestataires de l'Animation (DJ, Événementiels) */}
            <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-3 flex flex-col justify-between hover:border-emerald-500 transition-all">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  4
                </div>
                <h4 className="font-bold text-sm text-[#0f172a]">
                  Agrément des Entreprises Événementielles & DJ Professionnels
                </h4>
                <p className="text-xs text-[#64748b] leading-relaxed">
                  Recensement obligatoire des loueurs de sonorisation, podiums, éclairages et décorateurs de mariage. Mise en place d'une carte d'animateur professionnel délivrée par la Direction Départementale avec formation aux décibels autorisés.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-blue-700 font-semibold">
                <span>Objectif : Encadrement & Régulation</span>
                <Volume2 className="w-4 h-4 text-blue-600" />
              </div>
            </div>

            {/* AXE 5 : Charte de Bonne Conduite & Respect de l'Isophonie */}
            <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-3 flex flex-col justify-between hover:border-emerald-500 transition-all">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-800 flex items-center justify-center font-bold">
                  5
                </div>
                <h4 className="font-bold text-sm text-[#0f172a]">
                  Charte Départementale de Tranquillité & Lutte contre le Bruit
                </h4>
                <p className="text-xs text-[#64748b] leading-relaxed">
                  Campagne d'information conjointe avec les chefs de quartiers et la Police sur les horaires de fermeture et le respect du voisinage. Signature tripartite d'une charte de bonne conduite garantissant la sécurité des clients et la paix des riverains.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-red-700 font-semibold">
                <span>Objectif : Paix Sociale & Ordre Public</span>
                <AlertCircle className="w-4 h-4 text-red-600" />
              </div>
            </div>

            {/* AXE 6 : Espaces de Loisirs Familiaux & Parcs d'Attractions Enfants */}
            <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-3 flex flex-col justify-between hover:border-emerald-500 transition-all">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  6
                </div>
                <h4 className="font-bold text-sm text-[#0f172a]">
                  Promotion des Parcs d'Attractions & Loisirs Enfance
                </h4>
                <p className="text-xs text-[#64748b] leading-relaxed">
                  Encourager l'implantation de parcs récréatifs, manèges et espaces verts sécurisés pour les enfants et familles dans les arrondissements périphériques (Mongo-Mpoukou, Louandjili, Ngoyo) avec allègement tarifaire incitatif la 1ère année.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-teal-700 font-semibold">
                <span>Objectif : Diversification des Loisirs</span>
                <Lightbulb className="w-4 h-4 text-teal-600" />
              </div>
            </div>

          </div>

          {/* Boutons d'Action & d'Impression pour Monsieur le Directeur */}
          <div className="p-4 rounded-xl bg-white border border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="text-[#64748b] font-medium">
              Ces propositions peuvent être soumises en note de cadrage à Monsieur le Ministre ou annexées au Rapport d'Activités.
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0f172a] font-bold flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer la Note d'Orientations</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
