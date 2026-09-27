/**
 * @license
 * Système Intégré DDL-PN — République du Congo (MCAPNIT)
 * Modèle Officiel Républicain du Rapport Trimestriel d'Activités
 * Conforme à 100% au document officiel de la Direction Départementale des Loisirs de Pointe-Noire.
 */

export interface TableauBordPtaItem {
  id: string;
  indicateur: string;
  cibleAnnuelle: string;
  resultatTrimestre: string;
  statut: 'ATTEINT' | 'NON_REALISE' | 'BLOQUE' | 'REPORTE' | 'INITIATIVE_NOUVELLE' | 'EN_COURS';
  statutLabel: string;
}

export interface BilanCumuleItem {
  id: string;
  activite: string;
  t1: string;
  t2: string;
  t3: string;
  statutCumule: string;
  isCompleted?: boolean;
}

export interface ActiviteRealiseeDetail {
  id: string;
  num: string;
  activitePrevue: string;
  contenusActions: string[];
  indicateurs: string[];
  execution: string;
  observation: string;
}

export interface ActiviteNonRealiseeDetail {
  id: string;
  num: string;
  activitePrevue: string;
  contenusActions: string[];
  indicateurs: string[];
  execution: string;
  observation: string;
}

export interface ParticipationInstitutionnelle {
  id: string;
  date: string;
  lieu: string;
  reference?: string;
  activiteEvenement: string;
  roleParticipation: string;
  cadrePatronage: string;
}

export interface DifficulteRapport {
  id: string;
  num: number;
  titre: string;
  description: string;
}

export interface SuggestionRapport {
  id: string;
  numRomain: string;
  titre: string;
  description: string;
}

export interface RapportTrimestrielDirection {
  id: string;
  referenceNumero: string;
  ministere: string;
  directionGenerale: string;
  departement: string;
  directionDepartementale: string;
  serviceEmetteur: string;
  republique: string;
  devise: string;
  titre: string;
  sousTitre: string;
  trimestre: '1er Trimestre' | '2ème Trimestre' | '3ème Trimestre' | '4ème Trimestre';
  annee: number;
  periodeMois: string;
  dateSignature: string;
  lieuSignature: string;

  // 1. Introduction
  introduction: string;

  // 2. Synthèse Tableau de bord PTA
  tableauBordPta: TableauBordPtaItem[];
  faitMarquantTitre: string;
  faitMarquantTexte: string;

  // 3. Bilan Cumulé
  bilanCumule: BilanCumuleItem[];
  analyseBilanCumuleTitre: string;
  analyseBilanCumuleTexte: string;

  // 4. Activités programmées réalisées
  activitesRealiseesSAFM: ActiviteRealiseeDetail[];
  activitesRealiseesAutorisation: ActiviteRealiseeDetail[];
  activitesRealiseesNumérique: ActiviteRealiseeDetail[];
  valeurStrategiqueNumerique: string;

  // 5. Activités programmées non réalisées
  activitesNonRealisees: ActiviteNonRealiseeDetail[];

  // 6. Participations institutionnelles
  participationsInstitutionnelles: ParticipationInstitutionnelle[];
  noteOpportuniteWingWah: string;

  // 7. Difficultés rencontrées
  difficultes: DifficulteRapport[];

  // 8. Suggestions
  suggestions: SuggestionRapport[];

  // 9. Conclusion & Signature
  conclusion: string;
  directeurNom: string;
  directeurTitre: string;
  distributionList: string[];
}

export const RAPPORT_OFFICIEL_PROTOTYPE: RapportTrimestrielDirection = {
  id: 'rapport-t3-2026-ddl-pn-officiel',
  referenceNumero: 'N°_____/MCAPNIT/DGL/DDL-PN/SAFM',
  ministere: "MINISTÈRE DE LA CULTURE, DES ARTS, DU PATRIMOINE NATIONAL ET DE L'INDUSTRIE TOURISTIQUE",
  directionGenerale: 'DIRECTION GÉNÉRALE DES LOISIRS',
  departement: 'DÉPARTEMENT DE POINTE-NOIRE',
  directionDepartementale: 'DIRECTION DÉPARTEMENTALE DES LOISIRS DE POINTE-NOIRE',
  serviceEmetteur: 'SERVICE ADMINISTRATIF, FINANCIER ET MATÉRIEL',
  republique: 'REPUBLIQUE DU CONGO',
  devise: 'Unité – Travail – Progrès',
  titre: "RAPPORT D'ACTIVITÉS DU TROISIÈME TRIMESTRE 2026",
  sousTitre: 'Direction Départementale des Loisirs de Pointe-Noire',
  trimestre: '3ème Trimestre',
  annee: 2026,
  periodeMois: 'Juillet – Septembre 2026',
  dateSignature: '2026',
  lieuSignature: 'Pointe-Noire',

  introduction:
    "Le présent rapport dresse le bilan des activités du troisième trimestre de l'exercice 2026 de la Direction Départementale des Loisirs (DDL) de Pointe-Noire. Il constitue le troisième rapport trimestriel d'exécution du Plan de Travail Annuel (PTA) 2026, conformément aux mécanismes de suivi-évaluation et de reporting prévus au Tableau 7 dudit plan.\n\nCe trimestre (juillet – septembre 2026) s'inscrit dans un contexte de continuité des contraintes structurelles déjà documentées aux trimestres précédents, qui ont une nouvelle fois limité l'exécution des activités d'animation, de contrôle et de partenariat. Cependant, le troisième trimestre est marqué par une initiative nouvelle et significative : le lancement de la présence numérique officielle de la DDL-PN à travers la création de sa page Facebook institutionnelle, accompagnée de la rédaction de son Terme de Référence (TDR) et de la mise en traitement de son plan de communication.\n\nPar ailleurs, la DDL a honoré sa représentation institutionnelle lors de trois cérémonies officielles de haut niveau au mois de septembre 2026, dont une placée sous le Haut Patronage de Monsieur le Premier Ministre, Chef du Gouvernement.\n\nLe présent rapport rend compte de l'ensemble de ces éléments et formule des propositions concrètes pour le quatrième et dernier trimestre de l'exercice 2026, qui devra impérativement constituer un trimestre de rattrapage opérationnel et de consolidation des acquis.",

  tableauBordPta: [
    {
      id: 'pta-1',
      indicateur: 'Gestion administrative courante (SAFM)',
      cibleAnnuelle: '4 trimestres',
      resultatTrimestre: 'Assuré',
      statut: 'ATTEINT',
      statutLabel: '✅ ATTEINT',
    },
    {
      id: 'pta-2',
      indicateur: 'Missions de contrôle qualité établissements',
      cibleAnnuelle: '2 missions / trimestre',
      resultatTrimestre: '0 mission réalisée',
      statut: 'NON_REALISE',
      statutLabel: '⚠ NON RÉALISÉ',
    },
    {
      id: 'pta-3',
      indicateur: "Autorisations d'exploitation délivrées",
      cibleAnnuelle: 'En continu',
      resultatTrimestre: '0 dossier complet déposé',
      statut: 'BLOQUE',
      statutLabel: '⚠ BLOQUÉ',
    },
    {
      id: 'pta-4',
      indicateur: 'Enquête statistique — Phase 2 (T2-T3)',
      cibleAnnuelle: '10 000 répondants cumulés',
      resultatTrimestre: 'Phase 2 en attente accompagnement',
      statut: 'REPORTE',
      statutLabel: '⚠ REPORTÉ',
    },
    {
      id: 'pta-5',
      indicateur: 'Conventions de partenariat signées',
      cibleAnnuelle: '3 conventions min.',
      resultatTrimestre: '0 — partenaires hésitants',
      statut: 'REPORTE',
      statutLabel: '⚠ REPORTÉ',
    },
    {
      id: 'pta-6',
      indicateur: 'Activités de loisirs sains scolaires',
      cibleAnnuelle: 'Lancement T1',
      resultatTrimestre: 'Non démarrées',
      statut: 'REPORTE',
      statutLabel: '⚠ REPORTÉ',
    },
    {
      id: 'pta-7',
      indicateur: 'Présence numérique DDL-PN (page officielle)',
      cibleAnnuelle: 'Non prévu au PTA initial',
      resultatTrimestre: 'Page Facebook créée',
      statut: 'INITIATIVE_NOUVELLE',
      statutLabel: '✅ INITIATIVE NOUVELLE',
    },
    {
      id: 'pta-8',
      indicateur: 'Plan de communication DDL-PN',
      cibleAnnuelle: 'Non prévu au PTA initial',
      resultatTrimestre: 'TDR en rédaction',
      statut: 'EN_COURS',
      statutLabel: '✅ EN COURS',
    },
    {
      id: 'pta-9',
      indicateur: 'Participations aux cérémonies officielles',
      cibleAnnuelle: 'Continue',
      resultatTrimestre: '3 cérémonies — sept. 2026',
      statut: 'ATTEINT',
      statutLabel: '✅ ATTEINT',
    },
    {
      id: 'pta-10',
      indicateur: 'Rapport trimestriel T3 produit et transmis',
      cibleAnnuelle: '4 rapports / an',
      resultatTrimestre: 'Présent rapport',
      statut: 'EN_COURS',
      statutLabel: '✅ EN COURS',
    },
  ],

  faitMarquantTitre: 'FAIT MARQUANT DU T3 2026 — INITIATIVE NUMÉRIQUE DDL-PN',
  faitMarquantTexte:
    "La création de la page Facebook officielle de la Direction Départementale des Loisirs de Pointe-Noire constitue l'initiative la plus significative du T3 2026. Bien que non inscrite au PTA initial, cette action s'inscrit pleinement dans l'Axe 4 du PTA 2026 — Gouvernance, information et communication institutionnelle. Elle répond directement à l'une des recommandations de l'enquête statistique T1 qui avait identifié le manque d'information (6ème frein) comme un obstacle adressable à faible coût. La DDL entre désormais dans l'ère de la communication publique numérique.",

  bilanCumule: [
    {
      id: 'bc-1',
      activite: 'Gestion administrative SAFM',
      t1: '✅ Exécuté',
      t2: '✅ Exécuté',
      t3: '✅ Exécuté',
      statutCumule: '✅ Continu — 3/3',
      isCompleted: true,
    },
    {
      id: 'bc-2',
      activite: 'Missions inventaire / contrôle établissements',
      t1: '✅ 1 mission',
      t2: '—',
      t3: '0 mission',
      statutCumule: '⚠ 1 mission sur 6 prévues',
    },
    {
      id: 'bc-3',
      activite: 'Autorisations délivrées',
      t1: 'En cours',
      t2: '—',
      t3: '0 (blocage docs)',
      statutCumule: '⚠ Blocage persistant',
    },
    {
      id: 'bc-4',
      activite: 'Vulgarisation textes réglementaires',
      t1: '✅ Quotidienne',
      t2: '✅ Quotidienne',
      t3: '✅ Quotidienne',
      statutCumule: '✅ Continu — 3/3',
      isCompleted: true,
    },
    {
      id: 'bc-5',
      activite: 'Enquête statistique (Phase 1 réalisée)',
      t1: '✅ 512 répondants',
      t2: '—',
      t3: 'Phase 2 en attente',
      statutCumule: '⚠ Phase 2 non encore réalisée',
    },
    {
      id: 'bc-6',
      activite: 'Conventions de partenariat signées',
      t1: '0',
      t2: '0',
      t3: '0',
      statutCumule: '⚠ 0/3 — Partenaires hésitants',
    },
    {
      id: 'bc-7',
      activite: 'Activités de loisirs sains scolaires',
      t1: '0',
      t2: '0',
      t3: '0',
      statutCumule: '⚠ Non démarrées',
    },
    {
      id: 'bc-8',
      activite: 'Présence numérique (page Facebook DDL-PN)',
      t1: '—',
      t2: '—',
      t3: '✅ Créée',
      statutCumule: '✅ INITIATIVE NOUVELLE T3',
      isCompleted: true,
    },
    {
      id: 'bc-9',
      activite: 'Plan de communication DDL-PN',
      t1: '—',
      t2: '—',
      t3: '✅ TDR en cours',
      statutCumule: '✅ EN COURS',
      isCompleted: true,
    },
    {
      id: 'bc-10',
      activite: 'Cérémonies officielles',
      t1: '8 cérémonies',
      t2: '—',
      t3: '3 cérémonies',
      statutCumule: '✅ Représentation assurée',
      isCompleted: true,
    },
  ],

  analyseBilanCumuleTitre: "ANALYSE DU BILAN CUMULÉ — CE QUE DIT L'ÉTAT D'AVANCEMENT À 9 MOIS",
  analyseBilanCumuleTexte:
    "Les activités relevant de la gestion administrative courante et de la représentation institutionnelle sont assurées avec constance depuis le début de l'exercice. En revanche, les activités à fort impact direct sur les populations — contrôle des établissements, délivrance d'autorisations, activités de promotion des loisirs sains — restent en suspens. Le T4 2026 devra être le trimestre du rattrapage opérationnel et de la concrétisation des partenariats.",

  activitesRealiseesSAFM: [
    {
      id: 'safm-1',
      num: '01',
      activitePrevue: 'Gestion Administrative et Courrier',
      contenusActions: [
        'Traitement de la correspondance entrante et sortante.',
        'Archivage et classement des documents du trimestre.',
        'Suivi des actes administratifs.',
        'Coordination interne entre les services.',
      ],
      indicateurs: ['Registre de courrier à jour.', 'Archives classées.', 'Dossiers constitués.'],
      execution: 'Exécuté',
      observation:
        "Activités routinières assurées sans interruption sur l'ensemble du trimestre. Troisième trimestre consécutif de continuité administrative.",
    },
    {
      id: 'safm-2',
      num: '02',
      activitePrevue: 'Gestion des Ressources Humaines',
      contenusActions: [
        'Tenue du registre de présence.',
        'Suivi des congés et absences.',
        'Gestion des mouvements du personnel.',
        'Coordination pour les participations aux cérémonies officielles.',
      ],
      indicateurs: [
        'Registre de présence à jour.',
        'Personnel coordonné pour 3 cérémonies officielles en septembre.',
      ],
      execution: 'Exécuté',
      observation:
        'Coordination et représentation institutionnelle assurées pour les 3 cérémonies du mois de septembre 2026.',
    },
  ],

  activitesRealiseesAutorisation: [
    {
      id: 'auto-1',
      num: '01',
      activitePrevue: 'Vulgarisation continue des textes réglementaires (Notes N°151 et 152)',
      contenusActions: [
        "Information et accompagnement quotidien des usagers à l'accueil.",
        "Explication des conditions d'obtention des autorisations d'exploitation.",
        'Orientation des tenanciers dans la constitution de leurs dossiers.',
        'Écoute et enregistrement des difficultés signalées par les usagers.',
      ],
      indicateurs: [
        'Usagers informés et accompagnés lors de chaque passage.',
        'Retours des usagers sur les blocages documentés.',
      ],
      execution: 'Exécuté',
      observation:
        "Information réglementaire délivrée quotidiennement. Note : les tenanciers signalent unanimement que le coût des pièces exigées impacte leur chiffre d'affaires, ce qui les empêche de constituer des dossiers complets. Ce constat alimente la proposition de simplification à soumettre au T4.",
    },
  ],

  activitesRealiseesNumérique: [
    {
      id: 'num-1',
      num: '01',
      activitePrevue: 'Création de la page Facebook officielle de la DDL-PN',
      contenusActions: [
        'Ouverture et paramétrage de la page Facebook institutionnelle de la Direction Départementale des Loisirs de Pointe-Noire.',
        "Définition de l'identité visuelle de la page.",
        'Publication des premiers contenus institutionnels.',
      ],
      indicateurs: [
        'Page Facebook DDL-PN créée et opérationnelle.',
        'Première présence numérique officielle de la DDL-PN.',
      ],
      execution: 'Exécuté — Initiative T3',
      observation:
        "Initiative conduite hors PTA initial mais alignée avec l'Axe 4 (Communication) et les recommandations de l'enquête statistique T1. Constitue un acquis durable et un outil de rayonnement institutionnel à faible coût. Cible : augmenter la visibilité de la DDL auprès des opérateurs, partenaires et grand public.",
    },
    {
      id: 'num-2',
      num: '02',
      activitePrevue: 'Rédaction du Terme de Référence (TDR) de la page Facebook DDL-PN',
      contenusActions: [
        'Conception du cadre de gouvernance éditoriale.',
        'Définition des objectifs, des publics cibles et de la ligne éditoriale.',
        'Planification du calendrier éditorial.',
        'Identification des responsabilités de publication et de modération.',
      ],
      indicateurs: ['TDR en cours de rédaction.', 'Cadre éditorial en cours de finalisation.'],
      execution: 'En cours',
      observation:
        'Document structurant pour la gestion durable et professionnelle de la présence numérique de la DDL. À finaliser et valider au T4 2026.',
    },
    {
      id: 'num-3',
      num: '03',
      activitePrevue: 'Élaboration du Plan de Communication DDL-PN',
      contenusActions: [
        'Analyse du contexte communicationnel de la DDL.',
        'Identification des axes de communication prioritaires.',
        'Définition des outils et canaux de diffusion.',
        'Calendrier prévisionnel de déploiement.',
      ],
      indicateurs: [
        'Plan de communication en cours de traitement.',
        'Document stratégique en voie de finalisation.',
      ],
      execution: 'En cours',
      observation:
        "Le plan de communication est un document stratégique qui orientera l'ensemble des actions de communication de la DDL pour 2026-2027. Sa finalisation au T4 permettra une mise en œuvre dès le début de l'exercice 2027.",
    },
  ],

  valeurStrategiqueNumerique:
    "La présence numérique officielle de la DDL-PN crée une opportunité à trois niveaux.\nInstitutionnel : renforcer la crédibilité de la DDL auprès des partenaires potentiels (Globaline, Institut Français, Wing Wah) qui peuvent désormais constater l'existence et l'activité de la Direction en ligne. Opérationnel : informer les tenanciers des établissements de loisirs sur les procédures d'autorisation, réduisant ainsi le nombre de dossiers incomplets. Politique : rendre visible l'action de la DDL auprès du grand public et des autorités de tutelle, renforçant le plaidoyer pour les moyens nécessaires à l'accomplissement des missions.",

  activitesNonRealisees: [
    {
      id: 'anr-1',
      num: '01',
      activitePrevue: 'Missions de contrôle qualité des établissements de loisirs',
      contenusActions: [
        'Vérification de la conformité réglementaire des établissements.',
        'PV de mise en demeure des établissements non conformes.',
        'Rapport de mission.',
      ],
      indicateurs: ['2 missions prévues au PTA pour le T3.', 'PV de mise en demeure.'],
      execution: 'Non réalisé',
      observation:
        "Aucune mission de contrôle sur le terrain. Les contraintes opérationnelles n'ont pas permis la conduite de missions autonomes non prescrites par ordre de service préfectoral. Reporté au T4 2026.",
    },
    {
      id: 'anr-2',
      num: '02',
      activitePrevue: "Délivrance d'autorisations d'exploitation",
      contenusActions: [
        "Réception et instruction des dossiers de demande d'autorisation.",
        "Délivrance d'autorisations aux établissements conformes.",
        'Archivage et suivi.',
      ],
      indicateurs: ["Nombre d'autorisations délivrées.", 'Taux de régularisation des établissements.'],
      execution: 'Non réalisé',
      observation:
        "Aucun dossier complet déposé au T3. Les tenanciers se plaignent unanimement du coût élevé des pièces exigées, qui impacte leur chiffre d'affaires au point de les empêcher de régulariser leur situation. Ce constat renforce l'urgence de la note de proposition de simplification des procédures — à transmettre impérativement au T4.",
    },
    {
      id: 'anr-3',
      num: '03',
      activitePrevue: 'Enquête statistique — Phase 2 (T2-T3)',
      contenusActions: [
        'Déploiement des agents dans les 7 zones.',
        'Collecte de questionnaires (cible T2-T3 : ~4 500 répondants).',
        'Traitement et analyse des données.',
      ],
      indicateurs: ['Cible annuelle : 10 000 répondants.', 'Phase 1 réalisée : 512 (5,12 %).', 'Phase 2 : en attente.'],
      execution: 'Non réalisé',
      observation:
        "La Phase 2 n'a pas pu être conduite. La DDL attend l'accompagnement (logistique et financier) nécessaire à la réalisation des Phases 2 et 3. La demande formelle a été documentée dans le rapport T1. La cible annuelle de 10 000 répondants est désormais à risque si la Phase 3 ne peut absorber le reliquat.",
    },
    {
      id: 'anr-4',
      num: '04',
      activitePrevue: 'Formalisation des conventions de partenariat (Globaline, Institut Français, Wing Wah)',
      contenusActions: [
        'Négociation et signature des conventions.',
        'Cérémonie de lancement des partenariats.',
        'Démarrage des activités co-portées.',
      ],
      indicateurs: ['3 conventions signées minimum.', '1 cérémonie de lancement.'],
      execution: 'Non réalisé',
      observation:
        "Les trois partenaires stratégiques identifiés n'ont pas encore formalisé leur engagement. Leur hésitation persiste malgré les relances. À noter : le PDG de la Société Wing Wah était présent à la cérémonie d'inauguration de la Station-Service SCI le 19/09/2026 (cérémonie à laquelle la DDL a participé). Cette présence simultanée constitue une opportunité de prise de contact à exploiter au T4. Le Club Hippique de Pointe-Noire demeure silencieux.",
    },
    {
      id: 'anr-5',
      num: '05',
      activitePrevue: 'Activités de promotion des loisirs sains (scolaires, seniors, inclusives)',
      contenusActions: [
        'Concours de scrabble en milieu scolaire.',
        'Randonnées seniors.',
        'Programme scrabble pour orphelins.',
      ],
      indicateurs: ['10 écoles engagées.', '2 randonnées réalisées.', '30 orphelins bénéficiaires.'],
      execution: 'Non réalisé',
      observation:
        "Aucune activité de promotion des loisirs sains n'a pu être organisée au T3. L'absence de ressources budgétaires dédiées et de partenariats formalisés bloque l'ensemble de ces activités depuis le début de l'exercice. Le T4 doit constituer un point de rupture avec cette situation.",
    },
    {
      id: 'anr-6',
      num: '06',
      activitePrevue: 'Note de proposition de simplification des procédures administratives',
      contenusActions: [
        "Rédaction d'une note formelle.",
        'Transmission à la DGL et au Cabinet du Ministère.',
      ],
      indicateurs: ['1 note transmise et validée.'],
      execution: 'Non réalisé',
      observation:
        "La note de proposition n'a pas encore été rédigée ni transmise, alors que les retours des usagers au cours des trois trimestres fournissent désormais des arguments de terrain irréfutables. À finaliser et transmettre en urgence au T4. Les données de l'enquête statistique T1 et les retours des tenanciers au T3 constituent un dossier complet.",
    },
  ],

  participationsInstitutionnelles: [
    {
      id: 'pi-1',
      date: '19/09/2026 – 10h00',
      lieu: 'Auditorium du Siège Social du Port Autonome de Pointe-Noire',
      reference: 'N°050./MID/DPN/P/C/DDPE/SCP',
      activiteEvenement: 'Cérémonie de Clôture de la VAC+ 3ème Édition',
      roleParticipation: "Participation officielle en tant qu'autorité départementale invitée.",
      cadrePatronage: 'Sous le Haut Patronage de Monsieur le Premier Ministre, Chef du Gouvernement.',
    },
    {
      id: 'pi-2',
      date: '19/09/2026 – 10h00',
      lieu: 'Station-Service de SCI (2ème sortie du Port Autonome, en face de AGL)',
      reference: 'N°045./MID/DPN/P/C/DDPE/SCP',
      activiteEvenement: 'Cérémonie d’inauguration de la Station-Service de SCI à Pointe-Noire',
      roleParticipation: "Participation officielle en tant qu'autorité départementale invitée.",
      cadrePatronage: 'Sous le patronage de Monsieur le Ministre des Hydrocarbures.',
    },
    {
      id: 'pi-3',
      date: '21/09/2026 – 11h00',
      lieu: 'Salle de Conférence du Conseil Congolais des Chargeurs',
      reference: 'N°048./MID/DPN/P/C/DDDE/SCP',
      activiteEvenement: 'Conférence-débat sur la « Campagne Nationale de Sensibilisation sur le Civisme, la Citoyenneté et la Paix »',
      roleParticipation: "Participation officielle en tant qu'autorité départementale invitée.",
      cadrePatronage: "Sous le patronage de Monsieur le Ministre Délégué, Chargé de la Jeunesse et de l'Éducation Civique.",
    },
  ],

  noteOpportuniteWingWah:
    "Il est à noter que la cérémonie d'inauguration de la Station-Service SCI du 19 septembre 2026 a vu la présence du Président Directeur Général de la Société Wing Wah, partenaire stratégique recherché par la DDL depuis le début de l'exercice 2026. Cette présence simultanée représente une opportunité de prise de contact directe à exploiter lors du T4 2026.",

  difficultes: [
    {
      id: 'diff-1',
      num: 1,
      titre: "Blocage de la régularisation des établissements — Signal d'alarme",
      description:
        "Le troisième trimestre confirme une tendance préoccupante : aucun dossier d'autorisation n'a été déposé en bonne et due forme depuis le début de l'exercice 2026. Les tenanciers qui se présentent à la Direction expriment unanimement leur incapacité à rassembler les pièces exigées, dont le coût cumulé absorbe une part significative de leur chiffre d'affaires. Ce blocage signifie qu'un nombre croissant d'établissements opèrent sans autorisation valide — situation qui expose les usagers à des risques et prive l'État d'un outil de régulation de la qualité des loisirs. Une simplification urgente du dossier de demande d'autorisation est incontournable.",
    },
    {
      id: 'diff-2',
      num: 2,
      titre: "Partenariats stratégiques — La fenêtre d'opportunité se rétrécit",
      description:
        "À neuf mois de l'exercice 2026, aucune des trois conventions de partenariat prévues n'a été signée. La présence du PDG de Wing Wah à la cérémonie du 19 septembre 2026 constitue une opportunité concrète et immédiate à ne pas laisser passer. Un courrier de prise de contact direct, appuyé des résultats de l'enquête statistique T1, pourrait relancer cette piste au T4. Sans signature d'au moins une convention avant la clôture de l'exercice, l'indicateur «partenariats» du PTA 2026 sera à zéro.",
    },
  ],

  suggestions: [
    {
      id: 'sug-1',
      numRomain: 'I',
      titre: 'Capitaliser sur la présence numérique DDL-PN',
      description:
        "Finaliser le TDR de la page Facebook et mettre en œuvre le plan de communication dès le début du T4. Publier régulièrement des contenus institutionnels : présentation des missions de la DDL, informations sur les procédures d'autorisation, actualités des cérémonies, résultats de l'enquête statistique. Utiliser la page comme outil de rapprochement avec les partenaires stratégiques.",
    },
    {
      id: 'sug-2',
      numRomain: 'II',
      titre: "Exploiter l'opportunité Wing Wah",
      description:
        "Adresser sans délai un courrier de prise de contact direct au PDG de la Société Wing Wah, en valorisant sa présence à la cérémonie du 19 septembre 2026 et en joignant les résultats de l'enquête statistique DDL-PN. Objectif : signer au moins une convention de partenariat avant la clôture de l'exercice 2026.",
    },
    {
      id: 'sug-3',
      numRomain: 'III',
      titre: 'Transmettre en urgence la note de simplification des procédures',
      description:
        "Rédiger et transmettre à la DGL et au Cabinet du Ministère la note de proposition de simplification de la liste des pièces exigées pour les autorisations d'exploitation. Les retours des tenanciers sur trois trimestres consécutifs constituent un dossier d'argumentation solide et crédible. La simplification est la condition sine qua non de l'augmentation du taux de régularisation.",
    },
    {
      id: 'sug-4',
      numRomain: 'IV',
      titre: 'Conduire au moins deux missions de contrôle des établissements',
      description:
        "Organiser et conduire les deux missions de contrôle qualité prévues au PTA pour le T4 2026, en priorité dans les arrondissements 4 (Loandjili) et 2 (Mvou-Mvou), identifiés comme zones prioritaires par l'enquête statistique T1.",
    },
    {
      id: 'sug-5',
      numRomain: 'V',
      titre: 'Préparer un bilan annuel complet et un PTA 2027 ambitieux',
      description:
        "Le T4 doit être l'occasion de produire un bilan annuel exhaustif de l'exercice 2026, intégrant l'ensemble des données des quatre trimestres, les résultats de l'enquête statistique Phase 1, et les enseignements tirés pour l'élaboration d'un PTA 2027 réaliste et opérationnel — qui intégrera dès le départ les contraintes logistiques actuelles.",
    },
  ],

  conclusion:
    "Le troisième trimestre 2026 de la Direction Départementale des Loisirs de Pointe-Noire s'achève sur un bilan marqué par la persistance des contraintes opérationnelles connues, mais aussi par l'émergence d'une initiative nouvelle qui mérite d'être saluée : la création de la première présence numérique officielle de la DDL-PN.\n\nSi les activités à fort impact direct sur les populations — missions de contrôle, délivrance d'autorisations, enquête statistique Phase 2, promotion des loisirs sains — restent en attente des conditions de leur réalisation, la DDL a démontré au cours de ce trimestre sa capacité à innover et à créer de la valeur institutionnelle même dans des conditions contraintes. La page Facebook de la DDL-PN est une preuve concrète que l'institution peut progresser avec les outils à sa disposition, sans attendre que les conditions idéales soient réunies.\n\nLe quatrième trimestre 2026 sera décisif. À moins de quatre-vingt-dix jours de la clôture de l'exercice, la DDL doit transformer l'essai sur les indicateurs restants : signer au moins une convention de partenariat, conduire ses premières missions de contrôle autonomes, transmettre sa note de simplification des procédures, et produire un bilan annuel à la hauteur du travail accompli.",

  directeurNom: 'Jean Richard NTSEKE NGOUAKA',
  directeurTitre: 'Le Directeur Départemental des Loisirs de Pointe-Noire',
  distributionList: [
    'Direction Générale des Loisirs',
    'Cabinet du Ministère de la Culture, des Arts, du Patrimoine National et de l\'Industrie Touristique',
    'Cabinet du Préfet de Pointe-Noire',
    'Archives DDL-PN',
  ],
};
