/**
 * @license
 * Système Intégré DDL-PN — République du Congo (MCAPNIT)
 * Portail Républicain d'Accès Sécurisé & Souverain
 * Avec Carte Géographique Officielle de la République du Congo
 * Scission Cloisonnée : Postes de Brigade Terrain SAA vs Commandement Central Direction
 */

import React, { useState } from 'react';
import { useSession } from '../lib/sessionContext.tsx';
import { ArmoiriesCongo, LogoDDLPN } from './RepublicSeal.tsx';
import { CarteCongoBrazzaville } from './CarteCongoBrazzaville.tsx';
import {
  Shield,
  Smartphone,
  Lock,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Building2,
  ChevronRight,
  Flame,
  Award,
  Sparkles,
  Layers,
  KeyRound,
  FileCheck2,
  Eye,
  Info
} from 'lucide-react';
import type { TabType } from './Navbar.tsx';

interface LandingPageConnexionProps {
  onSuccessLogin?: (tab: TabType) => void;
}

export const LandingPageConnexion: React.FC<LandingPageConnexionProps> = ({ onSuccessLogin }) => {
  const { loginByIdentifier, switchAgent, agentsList } = useSession();

  // Active Tab: 'agent' or 'admin'
  const [activePortal, setActivePortal] = useState<'agent' | 'admin'>('agent');

  // Agent form state
  const [selectedAgentBadge, setSelectedAgentBadge] = useState<string>('DDL-PN-26-00000A-86244'); // Default Rhonel
  const [agentIdentifier, setAgentIdentifier] = useState<string>('+242 06 933 8110');
  const [agentPin, setAgentPin] = useState<string>('');
  const [agentError, setAgentError] = useState<string | null>(null);
  const [isAgentSubmitting, setIsAgentSubmitting] = useState<boolean>(false);
  const [showAgentPicker, setShowAgentPicker] = useState<boolean>(true);

  // Admin form state (M. Jacques Alphonse MATOKO)
  const [adminPin, setAdminPin] = useState<string>('');
  const [adminError, setAdminError] = useState<string | null>(null);
  const [isAdminSubmitting, setIsAdminSubmitting] = useState<boolean>(false);

  // Pick agent helper
  const handleSelectAgent = (ag: any) => {
    setSelectedAgentBadge(ag.badgeNumber);
    setAgentIdentifier(ag.phoneLine || ag.badgeNumber);
    setAgentPin('');
    setAgentError(null);
  };

  // Agent Login Submit
  const handleAgentSubmit = (e?: React.FormEvent, customPin?: string) => {
    if (e) e.preventDefault();
    const pin = customPin !== undefined ? customPin : agentPin;

    if (!agentIdentifier.trim()) {
      setAgentError('Veuillez sélectionner un agent ou saisir votre numéro de téléphone.');
      return;
    }
    if (!pin || pin.length < 4) {
      setAgentError('Veuillez composer votre code PIN secret à 4 chiffres.');
      return;
    }

    setIsAgentSubmitting(true);
    setAgentError(null);

    setTimeout(() => {
      const res = loginByIdentifier(agentIdentifier, pin);
      if (res.success) {
        if (onSuccessLogin) onSuccessLogin('terminal-mobile');
      } else {
        setAgentError(res.message || 'Identifiant ou code PIN erroné.');
        setIsAgentSubmitting(false);
      }
    }, 200);
  };

  // Direct 1-Click Test Access for Monsieur le Directeur MATOKO
  const handleDirectAgentDemoLogin = (ag: any) => {
    const pin = ag.pinCode || '1234';
    setIsAgentSubmitting(true);
    setAgentError(null);
    setTimeout(() => {
      const res = loginByIdentifier(ag.badgeNumber, pin);
      if (res.success) {
        if (onSuccessLogin) onSuccessLogin('terminal-mobile');
      } else {
        setIsAgentSubmitting(false);
      }
    }, 150);
  };

  // Admin Login Submit (M. Jacques Alphonse MATOKO)
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPin) {
      setAdminError('Veuillez saisir le code PIN d’accréditation Direction.');
      return;
    }

    setIsAdminSubmitting(true);
    setAdminError(null);

    setTimeout(() => {
      const res = loginByIdentifier('MATOKO', adminPin);
      if (res.success) {
        if (onSuccessLogin) onSuccessLogin('dashboard');
      } else {
        setAdminError(res.message || 'Code PIN Direction incorrect.');
        setIsAdminSubmitting(false);
      }
    }, 200);
  };

  // Virtual Pin Pad for Agent
  const handleDigit = (d: string) => {
    if (agentPin.length < 4) {
      const next = agentPin + d;
      setAgentPin(next);
      setAgentError(null);
      if (next.length === 4 && agentIdentifier.trim()) {
        setTimeout(() => handleAgentSubmit(undefined, next), 150);
      }
    }
  };

  const handleBackspace = () => {
    setAgentPin((prev) => prev.slice(0, -1));
    setAgentError(null);
  };

  const handleClear = () => {
    setAgentPin('');
    setAgentError(null);
  };

  // Selected agent object
  const currentSelectedAgent = agentsList.find((a) => a.badgeNumber === selectedAgentBadge) || agentsList[1];

  return (
    <div className="min-h-screen bg-[#02130c] text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white font-sans relative overflow-x-hidden">
      
      {/* Texture de fond républicaine & filigrane institutionnel */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* ========================================================= */}
      {/* 1. EN-TÊTE RÉGALIEN & BANDEAU TRICOLORE (VERT JAUNE ROUGE) */}
      {/* ========================================================= */}
      <header className="relative z-20 border-b border-emerald-900/60 bg-[#031d13]/90 backdrop-blur-md">
        {/* Liseré tricolore du drapeau de la République du Congo */}
        <div className="h-1.5 w-full flex">
          <div className="h-full flex-1 bg-[#009543]" /> {/* Vert */}
          <div className="h-full flex-1 bg-[#fbde4a]" /> {/* Jaune */}
          <div className="h-full flex-1 bg-[#dc241f]" /> {/* Rouge */}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Sceaux officiels jumeaux & Titre ministériel */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-emerald-500/30 shadow-lg">
              <ArmoiriesCongo size={42} className="drop-shadow-md" />
              <div className="w-px h-8 bg-emerald-500/20" />
              <LogoDDLPN size={42} className="drop-shadow-md" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#facc15] font-serif">
                  République du Congo
                </span>
                <span className="hidden sm:inline-block text-[10px] text-emerald-300 font-semibold px-2 py-0.2 rounded-full bg-emerald-950/80 border border-emerald-500/30">
                  Unité • Travail • Progrès
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-emerald-200/90 font-medium">
                Ministère de l'Industrie Culturelle, Touristique, Artistique et des Loisirs
              </p>
              <p className="text-[10px] sm:text-[11px] text-slate-300 font-bold tracking-tight">
                Direction Départementale des Loisirs de Pointe-Noire (DDL-PN)
              </p>
            </div>
          </div>

          {/* Badge d'accréditation régalienne */}
          <div className="hidden md:flex items-center gap-2.5 text-xs text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-3.5 py-1.5 rounded-full shadow-inner">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">Portail Souverain d’Accès Sécurisé</span>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. CORPS PRINCIPAL : CARTE GÉOGRAPHIQUE DU CONGO + LOGIN  */}
      {/* ========================================================= */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* COLONNE GAUCHE (5 cols) : Carte du Congo-Brazzaville & Présentation Institutionnelle */}
        <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            <span>Département de Pointe-Noire • Ville Océane</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Système Intégré de Recouvrement, Contrôle & Délivrance des Actes
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md">
            Plateforme départementale officielle de la <strong>DDL-PN</strong> assurant la scission stricte et le cloisonnement territorial étanche entre les brigades de terrain SAA et le commandement de la Direction.
          </p>

          {/* Intégration de la Carte Vectorielle Officielle du Congo */}
          <div className="w-full flex justify-center lg:justify-start pt-2">
            <CarteCongoBrazzaville
              showDetails={true}
              className="transform hover:scale-[1.02] transition-transform duration-300"
            />
          </div>

          {/* Règle de polyvalence régalienne */}
          <div className="w-full max-w-md p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-200/90 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Polyvalence Républicaine SAA :</strong> Les agents de terrain opèrent sur <strong>l’ensemble des 6 arrondissements sans délimitation de zone</strong>. Tout le monde peut recenser et recouvrer partout à Pointe-Noire, avec synchronisation centralisée vers la Direction Départementale.
            </p>
          </div>
        </div>

        {/* COLONNE DROITE (7 cols) : Module de Connexion Cloisonné */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="w-full max-w-lg bg-[#062419]/90 border border-emerald-500/30 rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6 relative overflow-hidden">
            
            {/* Ruban décoratif d'angle */}
            <div className="absolute top-0 right-0 w-28 h-28 overflow-hidden pointer-events-none">
              <div className="w-40 h-5 bg-[#facc15] -rotate-45 translate-x-5 -translate-y-6 shadow" />
            </div>

            {/* Sélecteur de Portail : Agent Terrain vs Direction */}
            <div className="grid grid-cols-2 p-1.5 bg-[#02130c] rounded-2xl border border-emerald-500/30 text-xs">
              <button
                type="button"
                onClick={() => {
                  setActivePortal('agent');
                  setAgentError(null);
                }}
                className={`py-3 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  activePortal === 'agent'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/50 border border-emerald-400/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Agents SAA Terrain</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActivePortal('admin');
                  setAdminError(null);
                }}
                className={`py-3 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  activePortal === 'admin'
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-950/50 border border-amber-400/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Shield className="w-4 h-4 text-amber-200" />
                <span>Direction Départementale</span>
              </button>
            </div>

            {/* ======================================================== */}
            {/* PORTAIL 1 : AGENTS SAA DE TERRAIN (CLOISONNEMENT STRICT) */}
            {/* ======================================================== */}
            {activePortal === 'agent' && (
              <div className="space-y-4">
                <div className="text-center sm:text-left space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Carnet Mobile & Google Agenda SAA</span>
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                      Cloisonné par Secteur
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Chaque agent ne voit <strong>strictement que ses propres établissements</strong> et ses tournées du jour.
                  </p>
                </div>

                {agentError && (
                  <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{agentError}</span>
                  </div>
                )}

                {/* Sélecteur Visuel Rapide des Agents (Permet à M. le Directeur de tester chaque session) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-300">
                    <span>Sélectionner votre profil d’agent :</span>
                    <button
                      type="button"
                      onClick={() => setShowAgentPicker(!showAgentPicker)}
                      className="text-[11px] text-amber-300 hover:underline"
                    >
                      {showAgentPicker ? 'Masquer la liste' : 'Afficher les agents'}
                    </button>
                  </div>

                  {showAgentPicker && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 select-none">
                      {agentsList
                        .filter((a) => a.role === 'Agent de Terrain' || a.role === 'Gestionnaire SAFM')
                        .map((ag) => {
                          const isSelected = ag.badgeNumber === selectedAgentBadge;
                          return (
                            <div
                              key={ag.id}
                              onClick={() => handleSelectAgent(ag)}
                              className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                                isSelected
                                  ? 'bg-emerald-950/90 border-emerald-400 shadow-md ring-1 ring-emerald-400'
                                  : 'bg-[#02180f]/80 border-emerald-900/60 hover:bg-emerald-950/40 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-white truncate max-w-[130px]">
                                  {ag.name}
                                </span>
                                <span
                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{ backgroundColor: ag.color || '#10b981' }}
                                />
                              </div>
                              <span className="text-[10px] text-emerald-400 font-medium truncate mt-0.5">
                                {ag.zone}
                              </span>
                              <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1 pt-1 border-t border-emerald-900/40 font-mono">
                                <span>{ag.phoneLine}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDirectAgentDemoLogin(ag);
                                  }}
                                  className="text-amber-300 hover:text-amber-200 underline font-sans font-bold"
                                  title="Tester immédiatement la session de cet agent"
                                >
                                  Connexion directe →
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* Profil Actif & Saisie du PIN */}
                <div className="bg-[#02180f] border border-emerald-500/30 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-emerald-900/60 pb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white shadow"
                        style={{ backgroundColor: currentSelectedAgent.color || '#0284c7' }}
                      >
                        {currentSelectedAgent.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-white">{currentSelectedAgent.name}</p>
                        <p className="text-[10px] text-emerald-400 font-semibold">{currentSelectedAgent.zone}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-black/40 px-2 py-0.5 rounded border border-emerald-900/60">
                      {currentSelectedAgent.badgeNumber.slice(-8)}
                    </span>
                  </div>

                  {/* Affichage des 4 chiffres PIN */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-slate-300 text-xs font-semibold">
                        Code PIN secret (4 chiffres) :
                      </label>
                      {agentPin && (
                        <button
                          type="button"
                          onClick={handleClear}
                          className="text-[11px] text-emerald-400 hover:underline"
                        >
                          Effacer
                        </button>
                      )}
                    </div>
                    <div className="flex justify-center gap-3 py-1">
                      {[0, 1, 2, 3].map((idx) => (
                        <div
                          key={idx}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold transition-all border ${
                            agentPin.length > idx
                              ? 'bg-emerald-600/30 border-emerald-400 text-emerald-300 shadow-md scale-105'
                              : 'bg-black/40 border-emerald-900/80 text-slate-600'
                          }`}
                        >
                          {agentPin.length > idx ? '●' : '—'}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Clavier Tactile Téléphone */}
                  <div className="grid grid-cols-3 gap-2 pt-1 select-none">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((item) => (
                      <button
                        type="button"
                        key={item}
                        onClick={() => {
                          if (item === 'C') handleClear();
                          else if (item === '⌫') handleBackspace();
                          else handleDigit(item);
                        }}
                        className="h-11 rounded-xl bg-[#031d13] hover:bg-emerald-900/40 active:scale-95 border border-emerald-800/40 font-bold text-sm text-slate-100 flex items-center justify-center transition-all shadow-xs"
                      >
                        {item}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAgentSubmit()}
                    disabled={isAgentSubmitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all active:scale-[0.99]"
                  >
                    {isAgentSubmitting ? (
                      <span>Accréditation en cours...</span>
                    ) : (
                      <>
                        <span>Ouvrir mon Portefeuille ({currentSelectedAgent.name.split(' ')[0]})</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* PORTAIL 2 : DIRECTION DÉPARTEMENTALE (M. MATOKO)        */}
            {/* ======================================================== */}
            {activePortal === 'admin' && (
              <div className="space-y-4">
                <div className="text-center sm:text-left space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Shield className="w-5 h-5 text-amber-400" />
                      <span>Poste de Commandement Central</span>
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                      Vue 100% Consolidée
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Réservé exclusivement à <strong>M. Jacques Alphonse MATOKO</strong>, Directeur Départemental des Loisirs de Pointe-Noire.
                  </p>
                </div>

                {adminError && (
                  <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{adminError}</span>
                  </div>
                )}

                <form onSubmit={handleAdminSubmit} className="space-y-4 text-xs">
                  <div className="bg-[#02180f] border border-amber-500/30 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-amber-900/40 pb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-white flex items-center justify-center font-bold text-sm shadow">
                          JM
                        </div>
                        <div>
                          <p className="font-bold text-sm text-white">Jacques Alphonse MATOKO</p>
                          <p className="text-[11px] text-amber-300 font-semibold">Directeur Départemental / Contrôle</p>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono">
                        ADMIN CENTRAL
                      </span>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Clé d'Accréditation / PIN Direction :
                      </label>
                      <input
                        type="password"
                        required
                        value={adminPin}
                        onChange={(e) => setAdminPin(e.target.value)}
                        placeholder="Code secret de commandement (ex: 0000)"
                        className="w-full bg-black/60 border border-amber-500/40 rounded-xl px-4 py-3 text-white text-sm tracking-widest placeholder-slate-600 focus:border-amber-400 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Supervision globale : 113+ établissements, 6 arrondissements, régie de recettes, validation des arrêtés et rapports trimestriels.
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={isAdminSubmitting}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-950 transition-all active:scale-[0.99]"
                    >
                      {isAdminSubmitting ? (
                        <span>Ouverture du Commandement Central...</span>
                      ) : (
                        <>
                          <span>Accéder à la Direction Départementale</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Résumé des prérogatives de Direction */}
                <div className="p-3 bg-amber-950/20 rounded-2xl border border-amber-500/20 text-[11px] text-amber-200/90 space-y-1">
                  <p className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Prérogatives de Commandement Central :</span>
                  </p>
                  <p className="leading-relaxed text-slate-300">
                    Accès à l'ensemble des 113+ établissements répertoriés, ventilation par agent SAA, encaissement au guichet central SAFM, et signature numérique des arrêtés préfectoraux et ministériels.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* ========================================================= */}
      {/* 3. PIED DE PAGE RÉGALIEN & MENTIONS LÉGALES DU CONGO      */}
      {/* ========================================================= */}
      <footer className="relative z-20 border-t border-emerald-900/60 bg-[#031d13]/90 py-3.5 px-4 text-center text-slate-400 text-[11px] space-y-1">
        <p className="font-medium text-slate-300">
          Direction Départementale des Loisirs de Pointe-Noire (DDL-PN) • Ministère de l'Industrie Culturelle, Touristique, Artistique et des Loisirs
        </p>
        <p className="text-[10px] text-slate-500">
          Application Régie par le Décret N° 2018-842 portant organisation de la Direction Départementale des Loisirs • République du Congo
        </p>
      </footer>
    </div>
  );
};
