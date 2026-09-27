/**
 * @license
 * Système Intégré DDL-PN — République du Congo (MCAPNIT)
 * Application Principale : Scission Totale Agent Mobile vs Direction Générale
 */

import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar.tsx';
import type { TabType } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { AtelierRedaction } from './components/AtelierRedaction.tsx';
import { RegistreActes, DossierRecord } from './components/RegistreActes.tsx';
import { SuiviPTA } from './components/SuiviPTA.tsx';
import { RapportTrimestriel } from './components/RapportTrimestriel.tsx';
import { ReferentielTextes } from './components/ReferentielTextes.tsx';
import { MoteurTarifsActivites } from './components/MoteurTarifsActivites.tsx';
import { ModuleTerrainRecouvrement } from './components/ModuleTerrainRecouvrement.tsx';
import { SessionProvider, useSession } from './lib/sessionContext.tsx';
import { SessionLoginModal } from './components/SessionLoginModal.tsx';
import { LandingPageConnexion } from './components/LandingPageConnexion.tsx';
import { AgentTerrainApp } from './components/AgentTerrainApp.tsx';
import { apiFetchEstablishments, FieldEstablishment } from './lib/supabase.ts';

function MainAppContent() {
  const { isAuthenticated, isFieldAgent, isAdmin } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [establishments, setEstablishments] = useState<FieldEstablishment[]>([]);

  const loadData = () => {
    apiFetchEstablishments([]).then((res) => {
      if (res.data) {
        setEstablishments(res.data);
      }
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenInAtelier = (_dossier: DossierRecord) => {
    setActiveTab('atelier');
  };

  const handleOpenAtelierWithActivity = (_activityCode: string) => {
    setActiveTab('atelier');
  };

  const handleSuccessLogin = (targetTab: TabType) => {
    setActiveTab(targetTab);
    loadData();
  };

  // 1. If not authenticated, render the Confidential Republic Portal
  if (!isAuthenticated) {
    return <LandingPageConnexion onSuccessLogin={handleSuccessLogin} />;
  }

  // 2. If authenticated as Field Agent (SAA), strictly render the Agent Mobile Platform!
  // No direction sidebar, no PTA, no ministerial acts, strictly their personal calendar & portfolio.
  if (isFieldAgent) {
    return (
      <AgentTerrainApp
        establishments={establishments}
        onRefreshEstablishments={loadData}
      />
    );
  }

  // 3. If authenticated as Direction / Admin (M. Jacques Alphonse MATOKO):
  // Render the full Republican Governance & Central Command Center
  return (
    <div className="min-h-screen flex bg-[#f9f9ff] text-[#161c27] antialiased selection:bg-[#d5e3ff] selection:text-[#001c3b]">
      {/* Menu Vertical à Gauche (Sidebar Officielle Direction) */}
      <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Zone de Travail Principale (Décalée de la Sidebar sur grand écran) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 w-full">
        <main className="flex-1 w-full pt-16 lg:pt-6 pb-8 px-3 sm:px-6 max-w-7xl mx-auto main-content-area">
          {activeTab === 'dashboard' && <Dashboard onNavigateToTab={setActiveTab} />}
          {activeTab === 'agenda' && <ModuleTerrainRecouvrement initialSubTab="agenda-rdv" />}
          {activeTab === 'terrain' && <ModuleTerrainRecouvrement initialSubTab="recensement" />}
          {activeTab === 'terminal-mobile' && <ModuleTerrainRecouvrement initialSubTab="mode-mobile" />}
          {activeTab === 'registre' && <RegistreActes onOpenInAtelier={handleOpenInAtelier} />}
          {activeTab === 'atelier' && <AtelierRedaction />}
          {activeTab === 'rapport-trimestriel' && <RapportTrimestriel />}
          {activeTab === 'suivi-pta' && <SuiviPTA onNavigateToTab={setActiveTab} />}
          {activeTab === 'tarifs' && (
            <MoteurTarifsActivites onInjectIntoActe={handleOpenAtelierWithActivity} />
          )}
          {activeTab === 'referentiel' && <ReferentielTextes />}
        </main>

        {/* Pied de page officiel */}
        <Footer />
      </div>
      <SessionLoginModal />
    </div>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <MainAppContent />
    </SessionProvider>
  );
}
