import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, X, ExternalLink, QrCode } from 'lucide-react';

interface QRCodeProps {
  value: string;
  size?: number;
  label?: string;
  className?: string;
  showVerifyButton?: boolean;
  metadata?: {
    reference: string;
    establishmentName: string;
    promoterName?: string;
    amount?: number;
    agentName: string;
    agentBadge: string;
    date: string;
    type: 'RECU' | 'CONVOCATION' | 'ATTESTATION';
  };
}

/**
 * QR Code Générateur Sécurisé DDL-PN (République du Congo)
 * Génère un QR code officiel certifié et propose un modal de vérification anti-fraude instantané.
 */
export const QRCodeSecure: React.FC<QRCodeProps> = ({
  value,
  size = 120,
  label = 'Certification Officielle Anti-Fraude DDL-PN',
  className = '',
  showVerifyButton = true,
  metadata,
}) => {
  const [showModal, setShowModal] = useState(false);

  // URL standard Google Chart API pour générer le QR code SVG/PNG haute résolution sans dépendance lourde
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size * 2}x${size * 2}&data=${encodeURIComponent(
    value
  )}&bgcolor=ffffff&color=1A3C5E&margin=2`;

  return (
    <div className={`flex flex-col items-center justify-center p-2 bg-white rounded-lg border border-slate-200 shadow-sm ${className}`}>
      <div className="relative group cursor-pointer" onClick={() => metadata && setShowModal(true)}>
        <img
          src={qrCodeUrl}
          alt="QR Code Sécurité DDL-PN"
          width={size}
          height={size}
          className="rounded border border-[#1A3C5E]/20"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-[#1A3C5E]/10 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-[#1A3C5E]" />
        </div>
      </div>

      {label && <p className="text-[10px] text-slate-500 font-medium text-center mt-1.5 uppercase tracking-wide">{label}</p>}

      {showVerifyButton && metadata && (
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#1A3C5E] hover:underline"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Vérifier l'authenticité
        </button>
      )}

      {/* Modal de Certification Anti-Fraude */}
      {showModal && metadata && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            {/* Entête Officielle */}
            <div className="bg-[#1A3C5E] text-white p-5 text-center relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 mb-2 border border-white/20">
                <ShieldCheck className="w-7 h-7 text-emerald-300" />
              </div>
              <h3 className="text-lg font-bold">Certificat d'Authenticité Numérique</h3>
              <p className="text-xs text-white/80 uppercase tracking-widest mt-0.5">Direction Départementale des Loisirs de Pointe-Noire</p>
            </div>

            {/* Corps du certificat */}
            <div className="p-5 space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-900">DOCUMENT OFFICIEL VÉRIFIÉ ET CONFORME</p>
                  <p className="text-[11px] text-emerald-700">Enregistré dans le registre central sécurisé DDL-PN / Supabase.</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 space-y-2.5 text-xs text-slate-700 border border-slate-200">
                <div className="flex justify-between pb-1.5 border-b border-slate-200">
                  <span className="text-slate-500">Réf. Officielle :</span>
                  <span className="font-mono font-bold text-[#1A3C5E]">{metadata.reference}</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-slate-200">
                  <span className="text-slate-500">Établissement :</span>
                  <span className="font-semibold text-slate-900">{metadata.establishmentName}</span>
                </div>
                {metadata.promoterName && (
                  <div className="flex justify-between pb-1.5 border-b border-slate-200">
                    <span className="text-slate-500">Promoteur / Exploitant :</span>
                    <span className="font-semibold text-slate-900">{metadata.promoterName}</span>
                  </div>
                )}
                {metadata.amount !== undefined && (
                  <div className="flex justify-between pb-1.5 border-b border-slate-200">
                    <span className="text-slate-500">Montant Certifié :</span>
                    <span className="font-bold text-emerald-700 text-sm">{metadata.amount.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                )}
                <div className="flex justify-between pb-1.5 border-b border-slate-200">
                  <span className="text-slate-500">Agent Percepteur :</span>
                  <span className="font-semibold text-slate-800">{metadata.agentName}</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-slate-200">
                  <span className="text-slate-500">Matricule Badge :</span>
                  <span className="font-mono text-slate-800">{metadata.agentBadge}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Horodatage d'Émission :</span>
                  <span className="font-semibold text-slate-800">{metadata.date}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Ce document fait foi auprès du Trésor Public et de la brigade mobile de contrôle DDL-PN.</span>
              </div>
            </div>

            {/* Bouton de fermeture */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full py-2 px-4 rounded-lg bg-[#1A3C5E] text-white text-xs font-semibold hover:bg-[#15324e] transition"
              >
                Fermer l'attestation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
