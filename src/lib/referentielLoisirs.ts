/**
 * @license
 * Système Intégré DDL-PN — République du Congo (MCAPNIT)
 * Référentiel Officiel des Établissements de Loisirs & Découpage Territorial
 * Département de Pointe-Noire (6 Arrondissements & Quartiers Officiels)
 */

export interface ArrondissementDefinition {
  id: string;
  code: string;
  number: number;
  name: string;
  officialName: string;
  quartiers: string[];
}

export const POINTE_NOIRE_ARRONDISSEMENTS: ArrondissementDefinition[] = [
  {
    id: 'arr_1',
    code: '1_LUMUMBA',
    number: 1,
    name: 'Arrondissement 1 Lumumba',
    officialName: 'Arrondissement 1 Patrice Émery Lumumba',
    quartiers: [
      'Centre-Ville',
      'Mpita',
      'Côte Sauvage',
      'Saint-Pierre',
      'Tchicapika',
      'KM 4',
      'Grand Marché',
      'Plateau',
      'Losangeles',
      'Zone Portuaire',
      'Quartier 101',
      'Quartier 102',
      'Quartier 103',
      'Autre quartier (Lumumba)',
    ],
  },
  {
    id: 'arr_2',
    code: '2_MVOUMVOU',
    number: 2,
    name: 'Arrondissement 2 Mvou-Mvou',
    officialName: 'Arrondissement 2 Mvou-Mvou',
    quartiers: [
      'Kitoko',
      'Matende',
      'Quartier Chic',
      'Rond-point Thystère',
      'Titi-Gnoumbou',
      'Saint-Vincent-de-Paul',
      'Grand Quartier',
      'Mbota-Mvoumvou',
      'Quartier 201',
      'Quartier 202',
      'Quartier 203',
      'Autre quartier (Mvou-Mvou)',
    ],
  },
  {
    id: 'arr_3',
    code: '3_TIETIE',
    number: 3,
    name: 'Arrondissement 3 Tié-Tié',
    officialName: 'Arrondissement 3 Tié-Tié',
    quartiers: [
      'Marché Liberté',
      'Trois Francs',
      'Fouks',
      'Fond Tié-Tié',
      'OCH',
      'Bord-Bord',
      'Quartier Mbota (Tié-Tié)',
      'Quartier 301',
      'Quartier 302',
      'Quartier 303',
      'Quartier 304',
      'Autre quartier (Tié-Tié)',
    ],
  },
  {
    id: 'arr_4',
    code: '4_LOUANDJILI',
    number: 4,
    name: 'Arrondissement 4 Louandjili',
    officialName: 'Arrondissement 4 Loandjili (Louandjili)',
    quartiers: [
      'Raffinerie (CORAF)',
      'Mongo Kamba',
      'Siafoumou',
      'Vindoulou',
      'Côte-Matève',
      'Tchimbamba',
      'Nkouikou',
      'Quartier 401',
      'Quartier 405',
      'Quartier 408',
      'Autre quartier (Louandjili)',
    ],
  },
  {
    id: 'arr_5',
    code: '5_MONGO_MPOUKOU',
    number: 5,
    name: 'Arrondissement 5 Mongo-Mpoukou',
    officialName: 'Arrondissement 5 Mongo-Mpoukou',
    quartiers: [
      'Songolo',
      'Malala',
      'Loubou',
      'Mpaka Nord',
      'Matombi',
      'Tchimba',
      'Hôpital Général',
      'Quartier 501',
      'Quartier 502',
      'Quartier 503',
      'Autre quartier (Mongo-Mpoukou)',
    ],
  },
  {
    id: 'arr_6',
    code: '6_NGOYO',
    number: 6,
    name: 'Arrondissement 6 Ngoyo',
    officialName: 'Arrondissement 6 Ngoyo',
    quartiers: [
      'Mpaka (Centre & Sud)',
      'Tchimani',
      'Ngoyo Village',
      'Plage de Ngoyo',
      'Cité des Métiers',
      'Djeno (Route)',
      'Quartier des Écoles',
      'Côte Sauvage Sud',
      'Quartier 601',
      'Quartier 602',
      'Autre quartier (Ngoyo)',
    ],
  },
];

export interface LeisureActivityType {
  code: string;
  label: string;
  category: string;
  defaultRatePerSqm: number;
  iconName: string;
  description: string;
}

/**
 * Types officiels d'établissements de loisirs selon les directives de la DDL-PN :
 * Bars, Caves, VIP, Night-club, Lounge Bar, Salle de fête, Salle de jeux,
 * Salle de mariage, Entreprise événementielle, Parc d'attraction, etc.
 */
export const LEISURE_ACTIVITY_TYPES: LeisureActivityType[] = [
  {
    code: 'BAR',
    label: 'Bar / Bar Dancing / Nganda',
    category: 'Débits de Boissons',
    defaultRatePerSqm: 1000,
    iconName: 'Wine',
    description: 'Débit de boisson standard, bar dancing, nganda traditionnel, buvette récréative.',
  },
  {
    code: 'CAVE',
    label: 'Cave à Vin / Cave à Bière',
    category: 'Débits de Boissons',
    defaultRatePerSqm: 1000,
    iconName: 'Store',
    description: 'Comptoir de dégustation, cave à bière, cave à vin avec espace de consommation sur place.',
  },
  {
    code: 'VIP',
    label: 'Salon VIP / Espace Privé',
    category: 'Espaces Récréatifs Exclusifs',
    defaultRatePerSqm: 1000,
    iconName: 'Sparkles',
    description: 'Salons privés, espaces VIP climatisés pour clientèle haut standing et cercles réservés.',
  },
  {
    code: 'NIGHT_CLUB',
    label: 'Night-Club / Discothèque / Boîte de Nuit',
    category: 'Loisirs Nocturnes',
    defaultRatePerSqm: 1500,
    iconName: 'Moon',
    description: 'Établissement nocturne avec piste de danse, DJ, sonorisation amplifiée et normes isophoniques.',
  },
  {
    code: 'LOUNGE_BAR',
    label: 'Lounge Bar / Piano Bar',
    category: 'Loisirs Conviviaux',
    defaultRatePerSqm: 1200,
    iconName: 'Coffee',
    description: 'Cadre feutré, musique d’ambiance, cocktails, restauration légère et divertissement.',
  },
  {
    code: 'SALLE_FETE',
    label: 'Salle des Fêtes / Espace Réceptif',
    category: 'Événementiel & Réceptions',
    defaultRatePerSqm: 1000,
    iconName: 'PartyPopper',
    description: 'Espace polyvalent loué pour anniversaires, galas, banquets, réunions de famille et festivités.',
  },
  {
    code: 'SALLE_DE_JEUX',
    label: 'Salle de Jeux / Loisirs Récréatifs',
    category: 'Jeux & Attractions',
    defaultRatePerSqm: 1000,
    iconName: 'Gamepad2',
    description: 'Billards, babyfoots, jeux vidéo, bornes d’arcade, casinottes et divertissements ludiques.',
  },
  {
    code: 'SALLE_MARIAGE',
    label: 'Salle de Mariage / Espace Cérémonial',
    category: 'Événementiel & Réceptions',
    defaultRatePerSqm: 1200,
    iconName: 'HeartHandshake',
    description: 'Espaces de prestige spécialisés dans les cérémonies nuptiales, dots et réceptions solennelles.',
  },
  {
    code: 'ENTREPRISE_EVENEMENTIELLE',
    label: 'Entreprise Événementielle / Sonorisation & Spectacles',
    category: 'Production de Loisirs',
    defaultRatePerSqm: 1500,
    iconName: 'Volume2',
    description: 'Structures de régie générale, sonorisation, animation de podiums, lumières et organisation de spectacles.',
  },
  {
    code: 'PARC_ATTRACTION',
    label: "Parc d'Attraction / Espace Forain & Manèges",
    category: 'Parcs & Plein Air',
    defaultRatePerSqm: 800,
    iconName: 'FerrisWheel',
    description: 'Parcs de jeux pour enfants, manèges, structures gonflables, attractions foraines et parcs à thème.',
  },
  {
    code: 'AUTRE',
    label: 'Autre Établissement ou Activité de Loisirs',
    category: 'Divers Loisirs',
    defaultRatePerSqm: 1000,
    iconName: 'Building2',
    description: 'Terrasses plein air, cabarets, complexes balnéaires et activités récréatives connexes.',
  },
];

export const getQuartiersForArrondissement = (arrondissementNameOrCode: string): string[] => {
  if (!arrondissementNameOrCode) return POINTE_NOIRE_ARRONDISSEMENTS[0].quartiers;
  const clean = arrondissementNameOrCode.toLowerCase();

  const found = POINTE_NOIRE_ARRONDISSEMENTS.find(
    (a) =>
      clean.includes(a.number.toString()) ||
      clean.includes(a.code.toLowerCase()) ||
      clean.includes(a.name.toLowerCase()) ||
      (a.number === 1 && clean.includes('lumumba')) ||
      (a.number === 2 && clean.includes('mvou')) ||
      (a.number === 3 && (clean.includes('tié') || clean.includes('tietie'))) ||
      (a.number === 4 && (clean.includes('louan') || clean.includes('loand'))) ||
      (a.number === 5 && (clean.includes('mongo') || clean.includes('mpoukou'))) ||
      (a.number === 6 && clean.includes('ngoyo'))
  );

  return found ? found.quartiers : POINTE_NOIRE_ARRONDISSEMENTS[0].quartiers;
};

export const normalizeArrondissement = (input?: string): string => {
  if (!input) return 'Arrondissement 1 Lumumba';
  const clean = input.toLowerCase();
  if (clean.includes('1') || clean.includes('lumumba')) return 'Arrondissement 1 Lumumba';
  if (clean.includes('2') || clean.includes('mvou')) return 'Arrondissement 2 Mvou-Mvou';
  if (clean.includes('3') || clean.includes('tié') || clean.includes('tietie')) return 'Arrondissement 3 Tié-Tié';
  if (clean.includes('4') || clean.includes('louan') || clean.includes('loand')) return 'Arrondissement 4 Louandjili';
  if (clean.includes('5') || clean.includes('mongo') || clean.includes('mpoukou')) return 'Arrondissement 5 Mongo-Mpoukou';
  if (clean.includes('6') || clean.includes('ngoyo')) return 'Arrondissement 6 Ngoyo';
  return 'Arrondissement 1 Lumumba';
};
