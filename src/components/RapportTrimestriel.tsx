import React, { useState, useEffect, useRef } from 'react';
import {
  RapportTrimestrielDirection,
  RAPPORT_OFFICIEL_PROTOTYPE,
} from '../lib/rapportTypes.ts';
import { RapportA4Print } from './RapportA4Print.tsx';
import { printElement } from '../lib/printUtils.ts';
import {
  Printer,
  FileText,
  Download,
  RotateCcw,
  CheckCircle2,
  Edit3,
  Eye,
  Plus,
  Trash2,
  FileDown,
} from 'lucide-react';

const STORAGE_KEY = 'ddl_pn_rapport_officiel_16p_v1';

export const RapportTrimestriel: React.FC = () => {
  const [data, setData] = useState<RapportTrimestrielDirection>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.tableauBordPta && parsed?.bilanCumule) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return RAPPORT_OFFICIEL_PROTOTYPE;
  });

  const [activeMainTab, setActiveMainTab] = useState<
    'general' | 'tableau-bord' | 'bilan-cumule' | 'realisees' | 'non-realisees' | 'participations' | 'difficultes-suggestions'
  >('tableau-bord');

  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('preview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const printContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [data]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handlePrint = () => {
    if (printContainerRef.current) {
      printElement(printContainerRef.current, `${data.titre} - DDL-PN`);
    } else {
      window.print();
    }
    showToast("Impression du rapport officiel lancée.");
  };

  const handleResetToOfficialModel = () => {
    if (
      window.confirm(
        'Charger le modèle officiel conforme DDL-PN (T3 2026 - 16 pages) ? Vos modifications en cours seront remplacées.'
      )
    ) {
      setData(RAPPORT_OFFICIEL_PROTOTYPE);
      showToast('Modèle officiel de la DDL-PN chargé avec succès.');
    }
  };

  // Export to Word Document (.doc)
  const handleExportDoc = () => {
    if (!printContainerRef.current) return;
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${data.titre}</title>
        <style>
          body { font-family: 'Calibri', 'Times New Roman', serif; font-size: 11pt; line-height: 1.3; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 15px; }
          th, td { border: 1px solid #333333; padding: 5px; text-align: left; }
          th { background-color: #f2f2f2; }
          h1, h2, h3 { color: #0284c7; }
        </style>
      </head>
      <body>
        ${printContainerRef.current.innerHTML}
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff' + content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rapport_${data.trimestre.replace(/\s+/g, '_')}_${data.annee}_DDLPN.doc`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Document Word officiel téléchargé (.doc) !');
  };

  return (
    <div className="space-y-6">
      {/* Barre de contrôle supérieure (Boutons d'action) */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0] flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#0284c7]/10 flex items-center justify-center text-[#0284c7]">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#0f172a] font-sans">
              Rapport d'Activités Trimestriel Officiel (DDL-PN)
            </h1>
            <p className="text-xs text-[#64748b]">
              Modèle conforme à 100% au format de la Direction Départementale des Loisirs de Pointe-Noire (Exercice {data.annee})
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Bascule Mode Aperçu / Édition */}
          <div className="bg-[#f1f5f9] p-1 rounded-lg flex items-center gap-1 border border-[#e2e8f0]">
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'preview'
                  ? 'bg-white text-[#0284c7] shadow-sm font-bold'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Aperçu & Impression
            </button>
            <button
              onClick={() => setViewMode('editor')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'editor'
                  ? 'bg-white text-[#0284c7] shadow-sm font-bold'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" /> Éditeur & Données
            </button>
          </div>

          {/* Boutons d'exportation */}
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Imprimer / Exporter PDF
          </button>

          <button
            onClick={handleExportDoc}
            className="px-3 py-2 bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#334155] border border-[#cbd5e1] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-[#0284c7]" /> Exporter Word (.doc)
          </button>

          <button
            onClick={handleResetToOfficialModel}
            title="Recharger le modèle officiel complet (T3 2026)"
            className="px-3 py-2 bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#64748b] border border-[#cbd5e1] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Recharger Modèle
          </button>
        </div>
      </div>

      {/* Toast de notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0f172a] text-white px-4 py-3 rounded-lg shadow-xl border border-[#334155] flex items-center gap-3 text-xs font-medium animate-fade-in no-print">
          <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE ÉDITEUR                                             */}
      {/* ======================================================== */}
      {viewMode === 'editor' && (
        <div className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] p-6 space-y-6 no-print">
          {/* Navigation des sous-onglets éditeur */}
          <div className="flex flex-wrap gap-2 border-b border-[#e2e8f0] pb-3">
            {[
              { id: 'general', label: '1. En-tête & Introduction' },
              { id: 'tableau-bord', label: '2. Tableau de Bord PTA' },
              { id: 'bilan-cumule', label: '3. Bilan Cumulé 9 Mois' },
              { id: 'realisees', label: '4. Activités Réalisées' },
              { id: 'non-realisees', label: '5. Activités Non Réalisées' },
              { id: 'participations', label: '6. Cérémonies Officielles' },
              { id: 'difficultes-suggestions', label: '7-9. Difficultés & Suggestions' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveMainTab(tab.id as any)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeMainTab === tab.id
                    ? 'bg-[#0284c7] text-white shadow-sm'
                    : 'bg-[#f8fafc] text-[#64748b] hover:bg-[#f1f5f9]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 1. En-tête & Introduction */}
          {activeMainTab === 'general' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-[#0f172a] uppercase">En-tête Officiel & Période</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">Titre du Rapport</label>
                  <input
                    type="text"
                    value={data.titre}
                    onChange={(e) => setData({ ...data, titre: e.target.value })}
                    className="w-full text-xs p-2.5 border border-[#cbd5e1] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">Période / Trimestre</label>
                  <input
                    type="text"
                    value={data.periodeMois}
                    onChange={(e) => setData({ ...data, periodeMois: e.target.value })}
                    className="w-full text-xs p-2.5 border border-[#cbd5e1] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">N° de Référence Document</label>
                  <input
                    type="text"
                    value={data.referenceNumero}
                    onChange={(e) => setData({ ...data, referenceNumero: e.target.value })}
                    className="w-full text-xs p-2.5 border border-[#cbd5e1] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">Directeur Départemental Signataire</label>
                  <input
                    type="text"
                    value={data.directeurNom}
                    onChange={(e) => setData({ ...data, directeurNom: e.target.value })}
                    className="w-full text-xs p-2.5 border border-[#cbd5e1] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">1. Texte d'Introduction Officiel</label>
                <textarea
                  rows={8}
                  value={data.introduction}
                  onChange={(e) => setData({ ...data, introduction: e.target.value })}
                  className="w-full text-xs p-2.5 border border-[#cbd5e1] rounded-lg leading-relaxed font-serif"
                />
              </div>
            </div>
          )}

          {/* 2. Tableau de Bord PTA */}
          {activeMainTab === 'tableau-bord' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold text-[#0f172a] uppercase">2. Tableau de Bord PTA {data.annee}</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-[#cbd5e1]">
                  <thead className="bg-[#f1f5f9] text-[#0f172a] font-bold">
                    <tr>
                      <th className="p-2 border">Indicateur PTA</th>
                      <th className="p-2 border">Cible Annuelle</th>
                      <th className="p-2 border">Résultat Trimestre</th>
                      <th className="p-2 border">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.tableauBordPta.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td className="p-2 border font-medium">
                          <input
                            type="text"
                            value={item.indicateur}
                            onChange={(e) => {
                              const updated = [...data.tableauBordPta];
                              updated[idx].indicateur = e.target.value;
                              setData({ ...data, tableauBordPta: updated });
                            }}
                            className="w-full p-1 border rounded"
                          />
                        </td>
                        <td className="p-2 border">
                          <input
                            type="text"
                            value={item.cibleAnnuelle}
                            onChange={(e) => {
                              const updated = [...data.tableauBordPta];
                              updated[idx].cibleAnnuelle = e.target.value;
                              setData({ ...data, tableauBordPta: updated });
                            }}
                            className="w-full p-1 border rounded"
                          />
                        </td>
                        <td className="p-2 border">
                          <input
                            type="text"
                            value={item.resultatTrimestre}
                            onChange={(e) => {
                              const updated = [...data.tableauBordPta];
                              updated[idx].resultatTrimestre = e.target.value;
                              setData({ ...data, tableauBordPta: updated });
                            }}
                            className="w-full p-1 border rounded"
                          />
                        </td>
                        <td className="p-2 border">
                          <input
                            type="text"
                            value={item.statutLabel}
                            onChange={(e) => {
                              const updated = [...data.tableauBordPta];
                              updated[idx].statutLabel = e.target.value;
                              setData({ ...data, tableauBordPta: updated });
                            }}
                            className="w-full p-1 border rounded"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Fait Marquant */}
              <div className="pt-4 border-t border-[#e2e8f0]">
                <label className="block text-xs font-semibold text-[#475569] mb-1">Titre de l'Encadré Fait Marquant</label>
                <input
                  type="text"
                  value={data.faitMarquantTitre}
                  onChange={(e) => setData({ ...data, faitMarquantTitre: e.target.value })}
                  className="w-full text-xs p-2 border border-[#cbd5e1] rounded-lg mb-2"
                />
                <label className="block text-xs font-semibold text-[#475569] mb-1">Contenu du Fait Marquant</label>
                <textarea
                  rows={4}
                  value={data.faitMarquantTexte}
                  onChange={(e) => setData({ ...data, faitMarquantTexte: e.target.value })}
                  className="w-full text-xs p-2 border border-[#cbd5e1] rounded-lg leading-relaxed font-serif"
                />
              </div>
            </div>
          )}

          {/* 3. Bilan Cumulé */}
          {activeMainTab === 'bilan-cumule' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-[#0f172a] uppercase">3. Bilan Cumulé sur les Trois Trimestres</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-[#cbd5e1]">
                  <thead className="bg-[#f1f5f9] text-[#0f172a] font-bold">
                    <tr>
                      <th className="p-2 border">Activité / Indicateur</th>
                      <th className="p-2 border text-center">T1 {data.annee}</th>
                      <th className="p-2 border text-center">T2 {data.annee}</th>
                      <th className="p-2 border text-center">T3 {data.annee}</th>
                      <th className="p-2 border text-center">Statut Cumulé</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.bilanCumule.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td className="p-2 border font-medium">
                          <input
                            type="text"
                            value={item.activite}
                            onChange={(e) => {
                              const updated = [...data.bilanCumule];
                              updated[idx].activite = e.target.value;
                              setData({ ...data, bilanCumule: updated });
                            }}
                            className="w-full p-1 border rounded"
                          />
                        </td>
                        <td className="p-2 border">
                          <input
                            type="text"
                            value={item.t1}
                            onChange={(e) => {
                              const updated = [...data.bilanCumule];
                              updated[idx].t1 = e.target.value;
                              setData({ ...data, bilanCumule: updated });
                            }}
                            className="w-full p-1 border rounded text-center"
                          />
                        </td>
                        <td className="p-2 border">
                          <input
                            type="text"
                            value={item.t2}
                            onChange={(e) => {
                              const updated = [...data.bilanCumule];
                              updated[idx].t2 = e.target.value;
                              setData({ ...data, bilanCumule: updated });
                            }}
                            className="w-full p-1 border rounded text-center"
                          />
                        </td>
                        <td className="p-2 border">
                          <input
                            type="text"
                            value={item.t3}
                            onChange={(e) => {
                              const updated = [...data.bilanCumule];
                              updated[idx].t3 = e.target.value;
                              setData({ ...data, bilanCumule: updated });
                            }}
                            className="w-full p-1 border rounded text-center"
                          />
                        </td>
                        <td className="p-2 border">
                          <input
                            type="text"
                            value={item.statutCumule}
                            onChange={(e) => {
                              const updated = [...data.bilanCumule];
                              updated[idx].statutCumule = e.target.value;
                              setData({ ...data, bilanCumule: updated });
                            }}
                            className="w-full p-1 border rounded text-center font-semibold"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">Analyse de l'État d'Avancement à 9 Mois</label>
                <textarea
                  rows={4}
                  value={data.analyseBilanCumuleTexte}
                  onChange={(e) => setData({ ...data, analyseBilanCumuleTexte: e.target.value })}
                  className="w-full text-xs p-2.5 border border-[#cbd5e1] rounded-lg font-serif"
                />
              </div>
            </div>
          )}

          {/* 7-9. Difficultés, Suggestions & Conclusion */}
          {activeMainTab === 'difficultes-suggestions' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-bold text-[#0f172a] uppercase mb-3">7. Difficultés Rencontrées</h2>
                <div className="space-y-3">
                  {data.difficultes.map((d, idx) => (
                    <div key={d.id} className="p-3 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg space-y-2">
                      <input
                        type="text"
                        value={d.titre}
                        onChange={(e) => {
                          const updated = [...data.difficultes];
                          updated[idx].titre = e.target.value;
                          setData({ ...data, difficultes: updated });
                        }}
                        className="w-full p-1.5 font-bold text-xs border rounded"
                      />
                      <textarea
                        rows={3}
                        value={d.description}
                        onChange={(e) => {
                          const updated = [...data.difficultes];
                          updated[idx].description = e.target.value;
                          setData({ ...data, difficultes: updated });
                        }}
                        className="w-full p-1.5 text-xs border rounded font-serif"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#e2e8f0]">
                <h2 className="text-sm font-bold text-[#0f172a] uppercase mb-3">8. Suggestions T4</h2>
                <div className="space-y-3">
                  {data.suggestions.map((s, idx) => (
                    <div key={s.id} className="p-3 bg-[#f8fafc] border border-[#cbd5e1] rounded-lg space-y-2">
                      <div className="flex gap-2">
                        <span className="font-bold text-xs text-[#0284c7]">{s.numRomain}.</span>
                        <input
                          type="text"
                          value={s.titre}
                          onChange={(e) => {
                            const updated = [...data.suggestions];
                            updated[idx].titre = e.target.value;
                            setData({ ...data, suggestions: updated });
                          }}
                          className="w-full p-1.5 font-bold text-xs border rounded"
                        />
                      </div>
                      <textarea
                        rows={3}
                        value={s.description}
                        onChange={(e) => {
                          const updated = [...data.suggestions];
                          updated[idx].description = e.target.value;
                          setData({ ...data, suggestions: updated });
                        }}
                        className="w-full p-1.5 text-xs border rounded font-serif"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#e2e8f0]">
                <h2 className="text-sm font-bold text-[#0f172a] uppercase mb-2">9. Conclusion Finale</h2>
                <textarea
                  rows={6}
                  value={data.conclusion}
                  onChange={(e) => setData({ ...data, conclusion: e.target.value })}
                  className="w-full text-xs p-2.5 border border-[#cbd5e1] rounded-lg font-serif leading-relaxed"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE APERÇU / IMPRESSION (Rapport A4 Officiel Conforme)  */}
      {/* ======================================================== */}
      <div ref={printContainerRef} className="print-area">
        <RapportA4Print data={data} />
      </div>
    </div>
  );
};
