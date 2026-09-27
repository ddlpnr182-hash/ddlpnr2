/**
 * @license
 * Système Intégré DDL-PN — République du Congo (MCAPNIT)
 * Composant Cartographique Régalien : Carte Vectorielle SVG de la République du Congo
 * Avec focus sur le Département de Pointe-Noire & le fleuve Congo
 */

import React, { useState } from 'react';
import { MapPin, Navigation, Compass, Waves, CheckCircle2 } from 'lucide-react';

interface CarteCongoBrazzavilleProps {
  className?: string;
  showDetails?: boolean;
  activeDept?: string;
  onSelectPoint?: (city: string) => void;
}

export const CarteCongoBrazzaville: React.FC<CarteCongoBrazzavilleProps> = ({
  className = '',
  showDetails = true,
  onSelectPoint,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Container SVG stylisé de la République du Congo */}
      <div className="relative w-full max-w-[340px] sm:max-w-[400px] aspect-[4/5] bg-gradient-to-b from-[#062c1d]/90 via-[#031d13]/95 to-[#02130c] border border-emerald-500/30 rounded-3xl p-4 shadow-2xl overflow-hidden backdrop-blur-md">
        
        {/* Motif de fond : coordonnées géographiques & grille souveraine */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

        {/* Banderole tricolore en filigrane (Vert Jaune Rouge) */}
        <div className="absolute top-0 right-0 w-36 h-36 overflow-hidden pointer-events-none opacity-25">
          <div className="w-52 h-6 bg-[#009543] -rotate-45 translate-x-3 -translate-y-8" />
          <div className="w-52 h-6 bg-[#fbde4a] -rotate-45 translate-x-3 -translate-y-6" />
          <div className="w-52 h-6 bg-[#dc241f] -rotate-45 translate-x-3 -translate-y-4" />
        </div>

        {/* Titre cartographique */}
        <div className="relative z-10 flex items-center justify-between pb-2 border-b border-emerald-500/20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              République du Congo
            </h4>
          </div>
          <span className="text-[10px] font-mono text-emerald-400/80 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30">
            Juridiction DDL-PN
          </span>
        </div>

        {/* Carte SVG Vectorielle Précise de la République du Congo */}
        <svg
          viewBox="0 0 400 500"
          className="w-full h-full my-auto drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Dégradé du territoire national congolais */}
            <linearGradient id="congoGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#064e3b" />
              <stop offset="35%" stopColor="#047857" />
              <stop offset="70%" stopColor="#059669" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>

            {/* Dégradé Océan Atlantique */}
            <linearGradient id="oceanGradient" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.05" />
            </linearGradient>

            {/* Filtre brillance */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Océan Atlantique (Sud-Ouest) */}
          <path
            d="M 0,320 Q 40,340 70,380 T 110,480 L 0,500 Z"
            fill="url(#oceanGradient)"
          />
          <text
            x="20"
            y="430"
            fill="#38bdf8"
            opacity="0.6"
            fontSize="10"
            fontWeight="bold"
            letterSpacing="1"
            transform="rotate(-55 20,430)"
          >
            OCÉAN ATLANTIQUE
          </text>

          {/* Contour officiel stylisé de la République du Congo */}
          {/* Forme géographique caractéristique allongée du Sud-Ouest vers le Nord-Est */}
          <path
            d="
              M 90,430 
              C 80,410 75,390 75,370 
              C 85,340 100,320 115,310 
              C 120,290 135,270 145,250 
              C 160,230 180,210 190,180 
              C 195,150 200,120 220,90 
              C 235,60 255,40 275,30 
              C 290,40 305,65 315,95 
              C 325,130 310,165 295,190 
              C 285,215 270,240 255,260 
              C 240,280 230,300 225,320 
              C 220,340 215,360 200,380 
              C 185,400 165,410 145,415 
              C 125,420 105,425 90,430 Z
            "
            fill="url(#congoGradient)"
            stroke="#34d399"
            strokeWidth="2.5"
            strokeLinejoin="round"
            className="transition-all duration-300 hover:brightness-110"
          />

          {/* Ligne bleue du Fleuve Congo & Oubangui (Frontière Est / RDC) */}
          <path
            d="
              M 275,30 
              C 295,70 315,110 305,155 
              C 295,190 275,225 255,260 
              C 240,285 230,310 225,335 
              C 220,355 205,375 195,395
            "
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="4 2"
            opacity="0.8"
          />
          <text
            x="275"
            y="170"
            fill="#7dd3fc"
            fontSize="8"
            fontWeight="bold"
            opacity="0.75"
            transform="rotate(65 275,170)"
          >
            Fleuve Congo →
          </text>

          {/* Subdivisions / Régions & Départements */}
          {/* Lignes intérieures légères */}
          <path
            d="M 190,180 Q 230,200 280,210"
            fill="none"
            stroke="#065f46"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <path
            d="M 145,250 Q 185,270 245,270"
            fill="none"
            stroke="#065f46"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <path
            d="M 115,310 Q 155,330 220,345"
            fill="none"
            stroke="#065f46"
            strokeWidth="1"
            strokeDasharray="3 3"
          />

          {/* Points repères majeurs */}

          {/* 1. BRAZZAVILLE (Capitale Politique) */}
          <g
            className="cursor-pointer group"
            onMouseEnter={() => setHoveredPoint('Brazzaville')}
            onMouseLeave={() => setHoveredPoint(null)}
            onClick={() => onSelectPoint?.('Brazzaville')}
          >
            <circle cx="215" cy="360" r="5" fill="#facc15" stroke="#713f12" strokeWidth="1.5" />
            <circle cx="215" cy="360" r="8" fill="none" stroke="#facc15" strokeWidth="1" opacity="0.6" />
            <text x="225" y="363" fill="#fef08a" fontSize="10" fontWeight="bold">
              Brazzaville
            </text>
            <text x="225" y="373" fill="#ca8a04" fontSize="7">
              Siège Ministériel
            </text>
          </g>

          {/* 2. POINTE-NOIRE (CAPITALE ÉCONOMIQUE & DDL-PN) - MISE EN ÉVIDENCE MAJEURE */}
          <g
            className="cursor-pointer"
            onMouseEnter={() => setHoveredPoint('Pointe-Noire')}
            onMouseLeave={() => setHoveredPoint(null)}
            onClick={() => onSelectPoint?.('Pointe-Noire')}
          >
            {/* Onde de choc radar animée */}
            <circle cx="85" cy="420" r="18" fill="#dc2626" opacity="0.2">
              <animate attributeName="r" values="6;24;6" dur="2.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0;0.6" dur="2.4s" repeatCount="indefinite" />
            </circle>

            <circle cx="85" cy="420" r="11" fill="#f59e0b" opacity="0.4">
              <animate attributeName="r" values="4;15;4" dur="2.4s" repeatCount="indefinite" />
            </circle>

            {/* Point focal doré / rouge */}
            <circle cx="85" cy="420" r="7" fill="#dc2626" stroke="#ffffff" strokeWidth="2" filter="url(#glow)" />
            <circle cx="85" cy="420" r="3" fill="#fef08a" />

            {/* Étiquette officielle DDL-PN avec flèche */}
            <g transform="translate(10, 442)">
              <rect
                x="0"
                y="0"
                width="145"
                height="34"
                rx="8"
                fill="#022c22"
                stroke="#10b981"
                strokeWidth="1.5"
                filter="url(#glow)"
              />
              <text x="8" y="14" fill="#ffffff" fontSize="9" fontWeight="bold">
                📍 POINTE-NOIRE (DDL-PN)
              </text>
              <text x="8" y="26" fill="#34d399" fontSize="7.5" fontWeight="semibold">
                6 Arrondissements • 113+ Éts
              </text>
            </g>
          </g>

          {/* Autres Départements indicatifs */}
          <text x="105" y="360" fill="#a7f3d0" fontSize="7" opacity="0.75" fontWeight="semibold">
            KOUILOU
          </text>
          <text x="140" y="340" fill="#a7f3d0" fontSize="7" opacity="0.7" fontWeight="semibold">
            NIARI / DOLISIE
          </text>
          <text x="180" y="270" fill="#a7f3d0" fontSize="7" opacity="0.6">
            PLATEAUX
          </text>
          <text x="210" y="190" fill="#a7f3d0" fontSize="7" opacity="0.6">
            CUVETTE
          </text>
          <text x="235" y="110" fill="#a7f3d0" fontSize="7" opacity="0.6">
            SANGHA
          </text>
          <text x="260" y="70" fill="#a7f3d0" fontSize="7" opacity="0.6">
            LIKOUALA
          </text>

          {/* Rose des vents régalienne */}
          <g transform="translate(45, 55)" opacity="0.65">
            <circle cx="0" cy="0" r="16" fill="none" stroke="#34d399" strokeWidth="1" strokeDasharray="2 2" />
            <path d="M 0,-18 L 4,-4 L 0,0 L -4,-4 Z" fill="#facc15" />
            <path d="M 0,18 L 4,4 L 0,0 L -4,4 Z" fill="#047857" />
            <path d="M 18,0 L 4,4 L 0,0 L 4,-4 Z" fill="#047857" />
            <path d="M -18,0 L -4,4 L 0,0 L -4,-4 Z" fill="#047857" />
            <text x="-3" y="-21" fill="#facc15" fontSize="8" fontWeight="bold">N</text>
          </g>
        </svg>

        {/* Bandeau d'information bas de carte */}
        <div className="relative z-10 pt-2 border-t border-emerald-500/20 flex items-center justify-between text-[11px] text-emerald-200">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span className="font-semibold text-white">Département de Pointe-Noire</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">
            4°48′ S • 11°51′ E
          </span>
        </div>
      </div>

      {/* Cartouche descriptif sous la carte */}
      {showDetails && (
        <div className="mt-3 text-center space-y-1">
          <p className="text-xs font-semibold text-emerald-400">
            Territoire de Contrôle & Recouvrement SAA
          </p>
          <p className="text-[11px] text-slate-400 max-w-xs">
            Lumumba • Mvou-Mvou • Tié-Tié • Louandjili • Mongo-Mpoukou • Ngoyo
          </p>
        </div>
      )}
    </div>
  );
};
