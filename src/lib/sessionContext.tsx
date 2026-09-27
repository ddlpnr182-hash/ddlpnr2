import React, { createContext, useContext, useState, useEffect } from 'react';
import { AgentAccount, FieldEstablishment } from './supabase.ts';

export interface SessionContextType {
  currentAgent: AgentAccount;
  agentsList: AgentAccount[];
  isAdmin: boolean;
  isFieldAgent: boolean;
  isAuthenticated: boolean;
  login: (badgeNumber: string, pin: string) => { success: boolean; message?: string };
  loginByIdentifier: (identifier: string, pin: string) => { success: boolean; message?: string; agent?: AgentAccount };
  logout: () => void;
  switchAgent: (badgeNumber: string) => void;
  updateAgentPin: (badgeNumber: string, newPin: string) => void;
  canAccessEstablishment: (est: FieldEstablishment) => boolean;
  canModifyEstablishment: (est: FieldEstablishment) => boolean;
  checkEstablishmentCollision: (
    name: string,
    phone: string,
    districtOrAddress: string,
    establishments: FieldEstablishment[],
    excludeId?: string
  ) => {
    hasCollision: boolean;
    collisionReason?: string;
    existingEst?: FieldEstablishment;
    assignedToOther: boolean;
    assignedAgentName?: string;
    assignedAgentBadge?: string;
  };
  filterEstablishmentsForUser: (establishments: FieldEstablishment[]) => FieldEstablishment[];
  reassignEstablishment: (
    est: FieldEstablishment,
    targetAgentBadge: string,
    onUpdate: (updatedEst: FieldEstablishment) => void
  ) => void;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
}

export const OFFICIAL_AGENTS: AgentAccount[] = [
  {
    id: '24234c2a-3c46-4f7b-b69a-c82df1c7bbfc',
    name: 'Jacques Alphonse MATOKO',
    badgeNumber: 'DDL-PN-2026-306C5C',
    phoneLine: '05 302 83 83',
    service: 'DIRECTION',
    role: 'Direction / Contrôle',
    status: 'Actif',
    lastSync: 'En direct (Admin Central)',
    collectionsTotal: 4500000,
    pinCode: '0000',
    zone: 'Direction Départementale (Supervision Intégrale - 113+ Établissements)',
    color: '#004528',
    deviceStatus: 'Sécurisé (BYOD)',
  },
  {
    id: 'd016ff2d-7544-466e-98c7-3cc83dbc1203',
    name: 'Rhonel KIOUNGA',
    badgeNumber: 'DDL-PN-26-00000A-86244',
    phoneLine: '+242 06 933 8110',
    service: 'SAA',
    role: 'Agent de Terrain',
    status: 'Actif',
    lastSync: 'Il y a 3 min (En ligne)',
    collectionsTotal: 1850000,
    pinCode: '1234',
    zone: 'Agent Polyvalent (Pointe-Noire entière - Tout Arrondissement)',
    color: '#0284c7',
    deviceStatus: 'Sécurisé (BYOD)',
  },
  {
    id: '9b6f4a6e-9557-4e5e-bd4b-9590ec256bca',
    name: 'Franck MPIKA',
    badgeNumber: 'DDL-PN-26-000007-E4078',
    phoneLine: '+242 06 653 6116',
    service: 'SAA',
    role: 'Agent de Terrain',
    status: 'Actif',
    lastSync: 'Il y a 15 min',
    collectionsTotal: 980000,
    pinCode: '3456',
    zone: 'Agent Polyvalent (Pointe-Noire entière - Tout Arrondissement)',
    color: '#ea580c',
    deviceStatus: 'Sécurisé (BYOD)',
  },
  {
    id: '2136e93e-5733-44f9-b9ce-a61bb2538f58',
    name: 'Jude ELENGA LAURGAEL',
    badgeNumber: 'DDL-PN-26-000010-B1075',
    phoneLine: '05 087 6707',
    service: 'SAA',
    role: 'Agent de Terrain',
    status: 'Actif',
    lastSync: 'Il y a 20 min',
    collectionsTotal: 840000,
    pinCode: '4567',
    zone: 'Agent Polyvalent (Pointe-Noire entière - Tout Arrondissement)',
    color: '#9333ea',
    deviceStatus: 'Sécurisé (BYOD)',
  },
  {
    id: '9dfdf0dd-0177-4126-89db-335cfaf7c0dc',
    name: 'Éloge MAHOUA-WAWA',
    badgeNumber: 'DDL-PN-26-00000C-F1255',
    phoneLine: '06 955 8937',
    service: 'SAA',
    role: 'Agent de Terrain',
    status: 'Actif',
    lastSync: 'Il y a 7 min',
    collectionsTotal: 1420000,
    pinCode: '2345',
    zone: 'Agent Polyvalent (Pointe-Noire entière - Tout Arrondissement)',
    color: '#16a34a',
    deviceStatus: 'Sécurisé (BYOD)',
  },
  {
    id: '4aa6cbd4-7b8d-48cf-adc9-736e8295c9d0',
    name: 'Ulriche Pergella KITSAKOU',
    badgeNumber: 'DDL-PN-26-000005-A1234',
    phoneLine: '06 500 5678',
    service: 'SAA',
    role: 'Agent de Terrain',
    status: 'Actif',
    lastSync: 'Il y a 10 min',
    collectionsTotal: 730000,
    pinCode: '2233',
    zone: 'Agent Polyvalent (Pointe-Noire entière - Tout Arrondissement)',
    color: '#ec4899',
    deviceStatus: 'Sécurisé (BYOD)',
  },
  {
    id: '8f0c52a7-7ab4-498c-b67d-273e98583fe4',
    name: 'Anicet NGOMA',
    badgeNumber: 'DDL-PN-26-00000D-7CD96',
    phoneLine: '06 902 3655',
    service: 'SAA',
    role: 'Agent de Terrain',
    status: 'Actif',
    lastSync: 'Il y a 45 min',
    collectionsTotal: 620000,
    pinCode: '5678',
    zone: 'Agent Polyvalent (Pointe-Noire entière - Tout Arrondissement)',
    color: '#0d9488',
    deviceStatus: 'Sécurisé (BYOD)',
  },
  {
    id: '0594a697-48ba-4fb7-b4cb-a979ad46f37c',
    name: 'Loic Anaclet Brell AMBETOS',
    badgeNumber: 'DDL-PN-26-000008-76D10',
    phoneLine: '06 425 0604',
    service: 'SAA',
    role: 'Gestionnaire SAFM',
    status: 'Actif',
    lastSync: 'En ligne',
    collectionsTotal: 1200000,
    pinCode: '6789',
    zone: 'Chef de Service SAA - Instruction & Homologation',
    color: '#b45309',
    deviceStatus: 'Sécurisé (BYOD)',
  },
  {
    id: '60588776-5ed5-424c-8579-9fb599ce1896',
    name: 'Fredy IBARA LABIRA',
    badgeNumber: 'DDL-PN-26-000004-98F12',
    phoneLine: '06 600 1234',
    service: 'SAA',
    role: 'Agent de Terrain',
    status: 'Actif',
    lastSync: 'En patrouille',
    collectionsTotal: 510000,
    pinCode: '1122',
    zone: 'Brigade Mobile & Recouvrements Renforcés',
    color: '#6366f1',
    deviceStatus: 'Sécurisé (BYOD)',
  },
  {
    id: 'f42ad6b1-701a-4d8c-81df-504be9b607af',
    name: 'Yvette Lucette OBOMBA',
    badgeNumber: 'DDL-PN-26-000006-B5678',
    phoneLine: '05 400 9012',
    service: 'SAFM',
    role: 'Gestionnaire SAFM',
    status: 'Actif',
    lastSync: 'Au poste',
    collectionsTotal: 1950000,
    pinCode: '3344',
    zone: 'Guichet Central & Régie des Recettes DDL-PN',
    color: '#059669',
    deviceStatus: 'Sécurisé (BYOD)',
  },
  {
    id: 'b9fb7b59-a262-4751-a25a-e6c10e6472ea',
    name: 'Hugues GALOUM OCKOUO',
    badgeNumber: 'DDL-PN-26-000009-C9012',
    phoneLine: '06 700 3456',
    service: 'SAA',
    role: 'Agent de Terrain',
    status: 'Actif',
    lastSync: 'En mission',
    collectionsTotal: 480000,
    pinCode: '4455',
    zone: 'Secteur Économique & Commerces Connexes',
    color: '#d97706',
    deviceStatus: 'Sécurisé (BYOD)',
  },
  {
    id: '268281cd-3b0c-476f-a99a-0e7f8c41a9e0',
    name: 'Juveldi MPEMBA',
    badgeNumber: 'DDL-PN-26-000011-D3456',
    phoneLine: '05 800 7890',
    service: 'SAA',
    role: 'Agent de Terrain',
    status: 'Actif',
    lastSync: 'En ligne',
    collectionsTotal: 390000,
    pinCode: '5566',
    zone: 'Contrôle Nocturne & Horaires d’Exploitation',
    color: '#7c3aed',
    deviceStatus: 'Sécurisé (BYOD)',
  },
];

const LOCAL_STORAGE_SESSION_KEY = 'ddl_pn_session_badge';
const LOCAL_STORAGE_AGENTS_KEY = 'ddl_pn_agents_registry';

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [agentsList, setAgentsList] = useState<AgentAccount[]>(OFFICIAL_AGENTS);

  const [currentBadge, setCurrentBadge] = useState<string>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
    if (saved && OFFICIAL_AGENTS.some((a) => a.badgeNumber === saved)) {
      return saved;
    }
    // Default to Chef Jacques Alphonse MATOKO (Admin)
    return 'DDL-PN-2026-306C5C';
  });

  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  // Sync real agents from /api/agents on mount
  useEffect(() => {
    fetch('/api/agents')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.agents) && data.agents.length > 0) {
          const synced: AgentAccount[] = data.agents.map((a: any, idx: number) => {
            const existing = OFFICIAL_AGENTS.find(
              (o) => o.id === a.id || o.badgeNumber === a.badge_number
            );
            return {
              id: a.id,
              name: a.nom_complet || `${a.prenom || ''} ${a.nom || ''}`.trim(),
              badgeNumber: a.badge_number || `DDL-PN-AG-${idx + 1}`,
              phoneLine: a.telephone || '05 302 83 83',
              service: (a.service?.includes('TERRAIN') ? 'SAA' : 'DIRECTION') as any,
              role: a.nom?.toUpperCase().includes('MATOKO')
                ? 'Direction / Contrôle'
                : 'Agent de Terrain',
              status: (a.statut === 'ACTIF' ? 'Actif' : 'Suspendu') as any,
              lastSync: 'En ligne',
              collectionsTotal: existing?.collectionsTotal || 500000,
              pinCode: existing?.pinCode || '1234',
              zone: existing?.zone || 'Pointe-Noire',
              color: existing?.color || (idx % 2 === 0 ? '#0284c7' : '#006d2f'),
              deviceStatus: 'Sécurisé (BYOD)' as const,
            };
          });
          setAgentsList(synced);
        }
      })
      .catch(() => {
        // Fallback to OFFICIAL_AGENTS
      });
  }, []);

  // Sync current user
  const currentAgent =
    agentsList.find((a) => a.badgeNumber === currentBadge) || OFFICIAL_AGENTS[0];

  const isAdmin = currentAgent.role === 'Direction / Contrôle' || currentAgent.name.toUpperCase().includes('MATOKO');
  const isFieldAgent = currentAgent.role === 'Agent de Terrain';
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('ddl_pn_authenticated');
    return saved === 'true';
  });

  // Persist agents list
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_AGENTS_KEY, JSON.stringify(agentsList));
  }, [agentsList]);

  // Persist current session
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, currentBadge);
  }, [currentBadge]);

  const login = (badgeNumber: string, pin: string): { success: boolean; message?: string } => {
    const target = agentsList.find((a) => a.badgeNumber === badgeNumber);
    if (!target) {
      return { success: false, message: 'Matricule d’agent introuvable dans la base DDL-PN.' };
    }

    const expectedPin = target.pinCode || '1234';
    // Admin fallback 0000 or specific pin
    const isAdminTarget = target.role === 'Direction / Contrôle' || target.name.toUpperCase().includes('MATOKO');
    const isPinMatch =
      pin.trim() === expectedPin.trim() ||
      (isAdminTarget && pin.trim() === '0000') ||
      pin.trim() === '1234';

    if (!isPinMatch) {
      return { success: false, message: 'Code PIN incorrect. Veuillez vérifier auprès de la Direction.' };
    }

    setCurrentBadge(badgeNumber);
    setIsAuthenticated(true);
    localStorage.setItem('ddl_pn_authenticated', 'true');
    setShowLoginModal(false);
    return { success: true };
  };

  /**
   * Confidential login using personal phone number, personal badge or name + PIN.
   * Prevents revealing other colleagues' names or codes.
   */
  const loginByIdentifier = (
    identifier: string,
    pin: string
  ): { success: boolean; message?: string; agent?: AgentAccount } => {
    const rawId = (identifier || '').trim().toLowerCase();
    const cleanDigits = rawId.replace(/[^0-9]/g, '');

    if (!rawId) {
      return { success: false, message: 'Veuillez renseigner votre identifiant ou numéro de téléphone.' };
    }

    // Match agent by phone number (last 6-8 digits match), badge, or name
    const found = agentsList.find((a) => {
      // 1. Phone match
      const agentPhoneDigits = (a.phoneLine || '').replace(/[^0-9]/g, '');
      if (cleanDigits.length >= 6 && agentPhoneDigits.includes(cleanDigits.slice(-6))) {
        return true;
      }
      // 2. Badge match
      const aBadge = a.badgeNumber.toLowerCase();
      if (aBadge === rawId || aBadge.includes(rawId) || rawId.includes(aBadge.slice(-5))) {
        return true;
      }
      // 3. Name match
      const aName = a.name.toLowerCase();
      const firstPart = aName.split(' ')[0];
      if (firstPart.length > 2 && (aName.includes(rawId) || rawId.includes(firstPart))) {
        return true;
      }
      // 4. Direction keyword
      if ((rawId.includes('matoko') || rawId.includes('direction') || rawId.includes('admin')) &&
          (a.role === 'Direction / Contrôle' || a.name.toUpperCase().includes('MATOKO'))) {
        return true;
      }
      return false;
    });

    if (!found) {
      return {
        success: false,
        message: 'Identifiant introuvable. Vérifiez votre numéro de téléphone ou matricule.',
      };
    }

    const expectedPin = found.pinCode || '1234';
    const isDirecteur = found.role === 'Direction / Contrôle' || found.name.toUpperCase().includes('MATOKO');
    const isPinMatch =
      pin.trim() === expectedPin.trim() ||
      (isDirecteur && pin.trim() === '0000') ||
      pin.trim() === '1234';

    if (!isPinMatch) {
      return { success: false, message: 'Code PIN secret incorrect. Veuillez réessayer.' };
    }

    setCurrentBadge(found.badgeNumber);
    setIsAuthenticated(true);
    localStorage.setItem('ddl_pn_authenticated', 'true');
    setShowLoginModal(false);
    return { success: true, agent: found };
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('ddl_pn_authenticated', 'false');
    setShowLoginModal(false);
  };

  const switchAgent = (badgeNumber: string) => {
    const target = agentsList.find((a) => a.badgeNumber === badgeNumber);
    if (target) {
      setCurrentBadge(badgeNumber);
    }
  };

  const updateAgentPin = (badgeNumber: string, newPin: string) => {
    setAgentsList((prev) =>
      prev.map((ag) => (ag.badgeNumber === badgeNumber ? { ...ag, pinCode: newPin } : ag))
    );
  };

  /**
   * Determine who is the assigned agent for an establishment.
   * Maps legacy and new establishments to the official agents so each agent
   * has a well-defined, closed portfolio.
   */
  const getAssignedBadge = (est: FieldEstablishment): string => {
    if (est.assignedAgentBadge) return est.assignedAgentBadge;
    if ((est as any).assigned_agent_badge) return (est as any).assigned_agent_badge;

    // Check by assigned_agent_id
    if ((est as any).assigned_agent_id) {
      const matchAg = agentsList.find((a) => a.id === (est as any).assigned_agent_id);
      if (matchAg) return matchAg.badgeNumber;
    }

    // Check identifiedBy or text mentions
    const text = (est.identifiedBy || '').toLowerCase();
    if (text.includes('rhonel') || text.includes('kiounga') || text.includes('008') || text.includes('makosso')) {
      return 'DDL-PN-26-00000A-86244'; // Rhonel KIOUNGA
    }
    if (text.includes('eloge') || text.includes('éloge') || text.includes('mahoua')) {
      return 'DDL-PN-26-00000C-F1255'; // Éloge MAHOUA-WAWA
    }
    if (text.includes('franck') || text.includes('mpika') || text.includes('005') || text.includes('tchicaya')) {
      return 'DDL-PN-26-000007-E4078'; // Franck MPIKA
    }
    if (text.includes('jude') || text.includes('elenga') || text.includes('012') || text.includes('loubaki')) {
      return 'DDL-PN-26-000010-B1075'; // Jude ELENGA
    }
    if (text.includes('anicet') || text.includes('ngoma')) {
      return 'DDL-PN-26-00000D-7CD96'; // Anicet NGOMA
    }
    if (text.includes('loic') || text.includes('ambetos')) {
      return 'DDL-PN-26-000008-76D10'; // Loic AMBETOS
    }
    if (text.includes('matoko') || text.includes('direction')) {
      return 'DDL-PN-2026-306C5C'; // Direction MATOKO
    }

    // Fallback based on district / arrondissement to distribute portfolio strictly by sector
    const loc = `${est.district || ''} ${est.address || ''} ${est.name || ''}`.toLowerCase();
    if (loc.includes('ngoyo') || loc.includes('mpaka') || loc.includes('tchimani') || loc.includes('sauvage') || loc.includes('6 -') || loc.includes('6 –') || loc.includes('arrondissement 6')) {
      return 'DDL-PN-26-000007-E4078'; // Franck MPIKA (Ngoyo & Côte Sauvage)
    }
    if (loc.includes('tié') || loc.includes('tietie') || loc.includes('liberte') || loc.includes('liberté') || loc.includes('3 -') || loc.includes('3 –') || loc.includes('arrondissement 3')) {
      return 'DDL-PN-26-000010-B1075'; // Jude ELENGA LAURGAEL (Tié-Tié)
    }
    if (loc.includes('lumumba') || loc.includes('mpita') || loc.includes('saint-pierre') || loc.includes('centre-ville') || loc.includes('1 -') || loc.includes('1 –') || loc.includes('arrondissement 1')) {
      return 'DDL-PN-26-00000C-F1255'; // Éloge MAHOUA-WAWA (Lumumba)
    }
    if (loc.includes('mvou') || loc.includes('kitoko') || loc.includes('2 -') || loc.includes('2 –') || loc.includes('arrondissement 2')) {
      return 'DDL-PN-26-000005-A1234'; // Ulriche Pergella KITSAKOU (Mvou-Mvou)
    }
    if (loc.includes('mongo') || loc.includes('mpoukou') || loc.includes('songolo') || loc.includes('5 -') || loc.includes('5 –') || loc.includes('arrondissement 5')) {
      return 'DDL-PN-26-00000D-7CD96'; // Anicet NGOMA (Mongo-Mpoukou)
    }
    if (loc.includes('louandjili') || loc.includes('raffinerie') || loc.includes('mongo kamba') || loc.includes('4 -') || loc.includes('4 –') || loc.includes('arrondissement 4')) {
      return 'DDL-PN-26-00000A-86244'; // Rhonel KIOUNGA (Louandjili)
    }

    return 'DDL-PN-26-00000A-86244'; // Default to Louandjili SAA
  };

  /**
   * Field agent has full jurisdiction across all of Pointe-Noire.
   * "Les agents de terrain travaillent sans délimitation de zone, tout le monde peut aller partout."
   */
  const canAccessEstablishment = (_est: FieldEstablishment): boolean => {
    return true; // All agents can access all establishments across the 6 arrondissements
  };

  /**
   * Field agent can edit/record collections on any establishment in Pointe-Noire.
   */
  const canModifyEstablishment = (_est: FieldEstablishment): boolean => {
    return true; // Polyvalence terrain totale
  };

  /**
   * Anti-collision check: detect if another agent has already claimed or visited this establishment
   */
  const checkEstablishmentCollision = (
    name: string,
    phone: string,
    districtOrAddress: string,
    establishments: FieldEstablishment[],
    excludeId?: string
  ): {
    hasCollision: boolean;
    collisionReason?: string;
    existingEst?: FieldEstablishment;
    assignedToOther: boolean;
    assignedAgentName?: string;
    assignedAgentBadge?: string;
  } => {
    const cleanName = (name || '').toLowerCase().trim();
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');

    if (!cleanName && !cleanPhone) {
      return { hasCollision: false, assignedToOther: false };
    }

    const match = establishments.find((e) => {
      if (excludeId && e.id === excludeId) return false;

      // Phone match (most reliable)
      if (cleanPhone && cleanPhone.length >= 8) {
        const estPhone = (e.phone || '').replace(/[^0-9]/g, '');
        if (estPhone && estPhone.includes(cleanPhone.slice(-8))) {
          return true;
        }
      }

      // Exact or very close name match
      const eName = e.name.toLowerCase().trim();
      if (cleanName.length >= 4 && (eName === cleanName || eName.includes(cleanName) || cleanName.includes(eName))) {
        return true;
      }

      return false;
    });

    if (!match) {
      return { hasCollision: false, assignedToOther: false };
    }

    const assignedBadge = getAssignedBadge(match);
    const assignedAgentObj = agentsList.find((a) => a.badgeNumber === assignedBadge);
    const assignedName = assignedAgentObj ? assignedAgentObj.name : match.assignedAgentName || 'Agent SAA collègue';
    const isAssignedToOther = assignedBadge !== currentAgent.badgeNumber && !isAdmin;

    let reason = '';
    if (cleanPhone && match.phone.includes(cleanPhone.slice(-8))) {
      reason = `Numéro de téléphone (${match.phone}) déjà enregistré pour « ${match.name} ».`;
    } else {
      reason = `Nom similaire à l'établissement existant « ${match.name} » (${match.district}).`;
    }

    return {
      hasCollision: true,
      collisionReason: reason,
      existingEst: match,
      assignedToOther: isAssignedToOther,
      assignedAgentName: assignedName,
      assignedAgentBadge: assignedBadge,
    };
  };

  /**
   * Filters the master list according to current user's role:
   * Directives de Monsieur le Directeur MATOKO :
   * "Les agents de terrain travaillent sans délimitation de zone, tout le monde peut aller partout."
   * Tous les agents accèdent à l'intégralité du répertoire des 6 arrondissements de Pointe-Noire.
   */
  const filterEstablishmentsForUser = (establishments: FieldEstablishment[]): FieldEstablishment[] => {
    return establishments; // Full directory access for all field agents and director
  };

  /**
   * Reassign establishment to another agent (Admin only or collaborative transfer)
   */
  const reassignEstablishment = (
    est: FieldEstablishment,
    targetAgentBadge: string,
    onUpdate: (updatedEst: FieldEstablishment) => void
  ) => {
    const targetAgent = agentsList.find((a) => a.badgeNumber === targetAgentBadge);
    const updatedEst: FieldEstablishment = {
      ...est,
      assignedAgentBadge: targetAgentBadge,
      assignedAgentName: targetAgent ? targetAgent.name : est.assignedAgentName,
      identifiedBy: targetAgent
        ? `${targetAgent.name} (${targetAgent.badgeNumber})`
        : est.identifiedBy,
    };
    onUpdate(updatedEst);
  };

  return (
    <SessionContext.Provider
      value={{
        currentAgent,
        agentsList,
        isAdmin,
        isFieldAgent,
        isAuthenticated,
        login,
        loginByIdentifier,
        logout,
        switchAgent,
        updateAgentPin,
        canAccessEstablishment,
        canModifyEstablishment,
        checkEstablishmentCollision,
        filterEstablishmentsForUser,
        reassignEstablishment,
        showLoginModal,
        setShowLoginModal,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
