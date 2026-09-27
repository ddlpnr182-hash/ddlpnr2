import React from 'react';
import { RapportTrimestrielDirection } from '../lib/rapportTypes.ts';

interface RapportA4PrintProps {
  data: RapportTrimestrielDirection;
}

export const RapportA4Print: React.FC<RapportA4PrintProps> = ({ data }) => {
  return (
    <div className="printable-document bg-white text-[#161c27] mx-auto font-serif print:w-full print:max-w-none print:shadow-none print:p-0 print:border-0 shadow-2xl border border-[#cbd5e1] rounded-sm max-w-[850px] p-8 md:p-12">
      
      {/* ======================================================== */}
      {/* PAGE 1 : EN-TÊTE OFFICIEL & TABLE DES MATIÈRES          */}
      {/* ======================================================== */}
      <div className="min-h-[1050px] flex flex-col justify-between pb-12 mb-12 border-b border-[#e2e8f0] print:border-0 print:mb-0 print:min-h-0 page-break-after">
        <div>
          {/* Header 2 Colonnes Républicaines */}
          <div className="flex justify-between items-start text-[11px] leading-tight pb-6 border-b border-[#94a3b8]">
            <div className="text-left w-[58%] font-sans font-bold text-[#0f172a] uppercase tracking-tight space-y-1">
              <div>{data.ministere}</div>
              <div className="text-[9px] text-[#64748b]">──────────────────────────</div>
              <div>{data.directionGenerale}</div>
              <div className="text-[9px] text-[#64748b]">──────────────────────────</div>
              <div>{data.departement}</div>
              <div className="text-[9px] text-[#64748b]">──────────────────────────</div>
              <div>{data.directionDepartementale}</div>
              <div className="text-[9px] text-[#64748b]">──────────────────────────</div>
              <div className="text-[10px] text-[#334155]">{data.serviceEmetteur}</div>
              <div className="text-[9px] text-[#64748b]">──────────────────────────</div>
              <div className="font-mono text-[10px] text-[#0f172a] normal-case">{data.referenceNumero}</div>
            </div>

            <div className="text-center w-[38%] space-y-1 font-sans">
              <div className="font-bold text-[#0f172a] text-[13px] tracking-wider uppercase">{data.republique}</div>
              <div className="italic text-[11px] text-[#475569]">{data.devise}</div>
              <div className="text-[9px] text-[#64748b]">──────────────────────────</div>
            </div>
          </div>

          {/* Grand Titre Centré */}
          <div className="mt-14 mb-12 text-center">
            <div className="inline-block border-y-2 border-[#0284c7] py-3 px-6">
              <h1 className="text-[20px] md:text-[23px] font-bold text-[#0369a1] tracking-wide uppercase font-sans">
                {data.titre}
              </h1>
            </div>
            <div className="mt-3 text-[14px] italic text-[#475569] font-serif">
              {data.sousTitre}
            </div>
            <div className="text-[13px] font-medium text-[#64748b] font-sans">
              {data.periodeMois}
            </div>
          </div>

          {/* Table des matières */}
          <div className="mt-10 bg-[#f8fafc] border border-[#cbd5e1] rounded-md p-6">
            <h2 className="text-[14px] font-bold text-[#0369a1] uppercase tracking-wider font-sans border-b border-[#0369a1] pb-2 mb-4">
              TABLE DES MATIÈRES
            </h2>
            <ol className="space-y-2 text-[13px] text-[#1e293b] font-serif list-decimal list-inside leading-relaxed">
              <li className="font-semibold">Introduction</li>
              <li className="font-semibold">Synthèse du bilan trimestriel — Tableau de bord PTA {data.annee}</li>
              <li className="font-semibold">Bilan cumulé sur les trois trimestres {data.annee}</li>
              <li className="font-semibold">
                Activités programmées réalisées
                <ul className="pl-6 mt-1 space-y-1 font-normal list-none text-[12.5px] text-[#475569]">
                  <li>a. Service Administratif, Financier et du Matériel</li>
                  <li>b. Service de l'Autorisation</li>
                  <li>c. Initiative nouvelle — Communication numérique DDL-PN</li>
                </ul>
              </li>
              <li className="font-semibold">Activités programmées non réalisées</li>
              <li className="font-semibold">Activités ponctuelles — Participations institutionnelles</li>
              <li className="font-semibold">Difficultés rencontrées</li>
              <li className="font-semibold">Suggestions pour le quatrième trimestre {data.annee}</li>
              <li className="font-semibold">Conclusion</li>
            </ol>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1 : INTRODUCTION                                */}
      {/* ======================================================== */}
      <div className="mb-10 avoid-break">
        <h2 className="text-[15px] font-bold text-[#0369a1] uppercase font-sans border-b border-[#0369a1] pb-1 mb-4">
          1. INTRODUCTION
        </h2>
        <div className="text-[13px] text-[#1e293b] leading-relaxed text-justify space-y-3 whitespace-pre-line">
          {data.introduction}
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 2 : SYNTHÈSE DU BILAN TRIMESTRIEL — TABLEAU DE BORD PTA */}
      {/* ======================================================== */}
      <div className="mb-10 avoid-break">
        <h2 className="text-[15px] font-bold text-[#0369a1] uppercase font-sans border-b border-[#0369a1] pb-1 mb-4">
          2. SYNTHÈSE DU BILAN TRIMESTRIEL — TABLEAU DE BORD PTA {data.annee}
        </h2>
        <p className="text-[12.5px] text-[#475569] italic mb-3">
          Le tableau ci-après présente le niveau de réalisation des principaux indicateurs du PTA {data.annee} à l'issue du troisième trimestre {data.annee}.
        </p>

        <table className="w-full text-left text-[11.5px] border-collapse border border-[#334155] mb-4">
          <thead>
            <tr className="bg-[#f1f5f9] text-[#0f172a] font-sans text-[10px] uppercase font-bold border-b border-[#334155]">
              <th className="p-2 border border-[#334155] w-[35%]">INDICATEUR PTA {data.annee}</th>
              <th className="p-2 border border-[#334155] w-[20%] text-center">CIBLE ANNUELLE</th>
              <th className="p-2 border border-[#334155] w-[25%]">RÉSULTAT {data.trimestre.includes('3') ? 'T3' : 'TRIMESTRE'} {data.annee}</th>
              <th className="p-2 border border-[#334155] w-[20%] text-center">STATUT</th>
            </tr>
          </thead>
          <tbody>
            {data.tableauBordPta.map((item, idx) => (
              <tr key={item.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'}>
                <td className="p-2 border border-[#334155] font-semibold text-[#1e293b]">{item.indicateur}</td>
                <td className="p-2 border border-[#334155] text-center text-[#475569]">{item.cibleAnnuelle}</td>
                <td className="p-2 border border-[#334155] text-[#334155]">{item.resultatTrimestre}</td>
                <td className="p-2 border border-[#334155] text-center font-sans font-bold text-[10.5px]">
                  {item.statutLabel || item.statut}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Encadré Fait Marquant */}
        {data.faitMarquantTexte && (
          <div className="bg-[#f0fdf4] border border-[#86efac] rounded-sm p-4 mt-4">
            <div className="bg-[#0284c7] text-white font-sans text-[11px] font-bold uppercase px-2.5 py-1 inline-block mb-2">
              {data.faitMarquantTitre || "FAIT MARQUANT DU TRIMESTRE"}
            </div>
            <p className="text-[12px] text-[#1e293b] leading-relaxed text-justify">
              {data.faitMarquantTexte}
            </p>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* SECTION 3 : BILAN CUMULÉ SUR LES TROIS TRIMESTRES      */}
      {/* ======================================================== */}
      <div className="mb-10 avoid-break page-break">
        <h2 className="text-[15px] font-bold text-[#0369a1] uppercase font-sans border-b border-[#0369a1] pb-1 mb-4">
          3. BILAN CUMULÉ SUR LES TROIS TRIMESTRES {data.annee}
        </h2>
        <p className="text-[12.5px] text-[#475569] italic mb-3">
          À neuf mois de l'exercice, le tableau ci-dessous dresse le bilan consolidé de l'exécution du PTA {data.annee}. Il permet d'évaluer le chemin parcouru et le chemin restant à parcourir avant la clôture de l'exercice.
        </p>

        <table className="w-full text-left text-[11.5px] border-collapse border border-[#334155] mb-4">
          <thead>
            <tr className="bg-[#f1f5f9] text-[#0f172a] font-sans text-[10px] uppercase font-bold border-b border-[#334155]">
              <th className="p-2 border border-[#334155] w-[35%]">ACTIVITÉ / INDICATEUR</th>
              <th className="p-2 border border-[#334155] w-[14%] text-center">T1 {data.annee}</th>
              <th className="p-2 border border-[#334155] w-[14%] text-center">T2 {data.annee}</th>
              <th className="p-2 border border-[#334155] w-[14%] text-center">T3 {data.annee}</th>
              <th className="p-2 border border-[#334155] w-[23%] text-center">STATUT CUMULÉ</th>
            </tr>
          </thead>
          <tbody>
            {data.bilanCumule.map((item, idx) => (
              <tr key={item.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'}>
                <td className="p-2 border border-[#334155] font-semibold text-[#1e293b]">{item.activite}</td>
                <td className="p-2 border border-[#334155] text-center text-[#334155]">{item.t1}</td>
                <td className="p-2 border border-[#334155] text-center text-[#334155]">{item.t2}</td>
                <td className="p-2 border border-[#334155] text-center text-[#334155]">{item.t3}</td>
                <td className="p-2 border border-[#334155] text-center font-sans font-semibold text-[10.5px]">
                  {item.statutCumule}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Encadré Analyse Bilan Cumulé */}
        {data.analyseBilanCumuleTexte && (
          <div className="bg-[#f0fdf4] border border-[#86efac] rounded-sm p-4 mt-4">
            <div className="bg-[#0284c7] text-white font-sans text-[11px] font-bold uppercase px-2.5 py-1 inline-block mb-2">
              {data.analyseBilanCumuleTitre || "ANALYSE DU BILAN CUMULÉ"}
            </div>
            <p className="text-[12px] text-[#1e293b] leading-relaxed text-justify">
              {data.analyseBilanCumuleTexte}
            </p>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* SECTION 4 : ACTIVITÉS PROGRAMMÉES RÉALISÉES              */}
      {/* ======================================================== */}
      <div className="mb-10 page-break">
        <h2 className="text-[15px] font-bold text-[#0369a1] uppercase font-sans border-b border-[#0369a1] pb-1 mb-4">
          4. ACTIVITÉS PROGRAMMÉES RÉALISÉES
        </h2>
        <p className="text-[12.5px] text-[#475569] italic mb-4">
          Le troisième trimestre {data.annee} a permis la continuité des missions administratives fondamentales de la DDL et l'émergence d'une initiative nouvelle à fort potentiel institutionnel.
        </p>

        {/* 4.a SAFM */}
        <div className="mb-6 avoid-break">
          <h3 className="text-[13.5px] font-bold text-[#0369a1] font-sans mb-2">
            a. Service Administratif, Financier et du Matériel (SAFM)
          </h3>
          <p className="text-[12px] text-[#334155] mb-2">
            Le SAFM a assuré sans discontinuité ses missions de gestion administrative courante tout au long du trimestre, garantissant le bon fonctionnement interne de la Direction.
          </p>

          <table className="w-full text-left text-[11px] border-collapse border border-[#334155]">
            <thead>
              <tr className="bg-[#f1f5f9] text-[#0f172a] font-sans text-[9.5px] uppercase font-bold border-b border-[#334155]">
                <th className="p-2 border border-[#334155] w-[5%] text-center">N°</th>
                <th className="p-2 border border-[#334155] w-[20%]">ACTIVITÉS PRÉVUES</th>
                <th className="p-2 border border-[#334155] w-[28%]">CONTENUS / ACTIONS</th>
                <th className="p-2 border border-[#334155] w-[18%]">INDICATEURS</th>
                <th className="p-2 border border-[#334155] w-[11%] text-center">EXÉCUTION</th>
                <th className="p-2 border border-[#334155] w-[18%]">OBSERVATION</th>
              </tr>
            </thead>
            <tbody>
              {data.activitesRealiseesSAFM.map((act) => (
                <tr key={act.id} className="bg-white">
                  <td className="p-2 border border-[#334155] text-center font-bold font-mono">{act.num}</td>
                  <td className="p-2 border border-[#334155] font-semibold text-[#1e293b]">{act.activitePrevue}</td>
                  <td className="p-2 border border-[#334155] text-[#334155]">
                    <ul className="list-disc list-inside space-y-0.5">
                      {act.contenusActions.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="p-2 border border-[#334155] text-[#334155]">
                    <ul className="list-disc list-inside space-y-0.5">
                      {act.indicateurs.map((ind, i) => (
                        <li key={i}>{ind}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="p-2 border border-[#334155] text-center font-bold text-[#059669]">{act.execution}</td>
                  <td className="p-2 border border-[#334155] text-[#475569]">{act.observation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 4.b Service Autorisation */}
        <div className="mb-6 avoid-break">
          <h3 className="text-[13.5px] font-bold text-[#0369a1] font-sans mb-2">
            b. Service de l'Autorisation — Vulgarisation continue
          </h3>
          <p className="text-[12px] text-[#334155] mb-2">
            Si le Service de l'Autorisation n'a pu conduire de missions de contrôle sur le terrain ni délivrer d'autorisation au cours du trimestre, il a néanmoins maintenu sa mission quotidienne d'information et d'accompagnement des usagers à l'accueil de la Direction.
          </p>

          <table className="w-full text-left text-[11px] border-collapse border border-[#334155]">
            <thead>
              <tr className="bg-[#f1f5f9] text-[#0f172a] font-sans text-[9.5px] uppercase font-bold border-b border-[#334155]">
                <th className="p-2 border border-[#334155] w-[5%] text-center">N°</th>
                <th className="p-2 border border-[#334155] w-[20%]">ACTIVITÉS PRÉVUES</th>
                <th className="p-2 border border-[#334155] w-[28%]">CONTENUS / ACTIONS</th>
                <th className="p-2 border border-[#334155] w-[18%]">INDICATEURS</th>
                <th className="p-2 border border-[#334155] w-[11%] text-center">EXÉCUTION</th>
                <th className="p-2 border border-[#334155] w-[18%]">OBSERVATION</th>
              </tr>
            </thead>
            <tbody>
              {data.activitesRealiseesAutorisation.map((act) => (
                <tr key={act.id} className="bg-white">
                  <td className="p-2 border border-[#334155] text-center font-bold font-mono">{act.num}</td>
                  <td className="p-2 border border-[#334155] font-semibold text-[#1e293b]">{act.activitePrevue}</td>
                  <td className="p-2 border border-[#334155] text-[#334155]">
                    <ul className="list-disc list-inside space-y-0.5">
                      {act.contenusActions.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="p-2 border border-[#334155] text-[#334155]">
                    <ul className="list-disc list-inside space-y-0.5">
                      {act.indicateurs.map((ind, i) => (
                        <li key={i}>{ind}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="p-2 border border-[#334155] text-center font-bold text-[#059669]">{act.execution}</td>
                  <td className="p-2 border border-[#334155] text-[#475569]">{act.observation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 4.c Communication Numérique */}
        <div className="mb-6 avoid-break">
          <h3 className="text-[13.5px] font-bold text-[#0369a1] font-sans mb-2">
            c. Initiative nouvelle — Communication numérique DDL-PN
          </h3>
          <p className="text-[12px] text-[#334155] mb-2">
            Le troisième trimestre {data.annee} marque l'entrée de la Direction Départementale des Loisirs de Pointe-Noire dans l'ère de la communication publique numérique. Cette initiative, conduite en dehors du cadre strict des activités programmées au PTA, répond à un besoin réel documenté par l'enquête statistique T1 et s'inscrit dans l'Axe 4 du PTA {data.annee}.
          </p>

          <table className="w-full text-left text-[11px] border-collapse border border-[#334155] mb-4">
            <thead>
              <tr className="bg-[#f1f5f9] text-[#0f172a] font-sans text-[9.5px] uppercase font-bold border-b border-[#334155]">
                <th className="p-2 border border-[#334155] w-[5%] text-center">N°</th>
                <th className="p-2 border border-[#334155] w-[20%]">ACTIVITÉS PRÉVUES</th>
                <th className="p-2 border border-[#334155] w-[28%]">CONTENUS / ACTIONS</th>
                <th className="p-2 border border-[#334155] w-[18%]">INDICATEURS</th>
                <th className="p-2 border border-[#334155] w-[11%] text-center">EXÉCUTION</th>
                <th className="p-2 border border-[#334155] w-[18%]">OBSERVATION</th>
              </tr>
            </thead>
            <tbody>
              {data.activitesRealiseesNumérique.map((act) => (
                <tr key={act.id} className="bg-white">
                  <td className="p-2 border border-[#334155] text-center font-bold font-mono">{act.num}</td>
                  <td className="p-2 border border-[#334155] font-semibold text-[#1e293b]">{act.activitePrevue}</td>
                  <td className="p-2 border border-[#334155] text-[#334155]">
                    <ul className="list-disc list-inside space-y-0.5">
                      {act.contenusActions.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="p-2 border border-[#334155] text-[#334155]">
                    <ul className="list-disc list-inside space-y-0.5">
                      {act.indicateurs.map((ind, i) => (
                        <li key={i}>{ind}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="p-2 border border-[#334155] text-center font-bold text-[#0284c7]">{act.execution}</td>
                  <td className="p-2 border border-[#334155] text-[#475569]">{act.observation}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Encadré Valeur Stratégique */}
          {data.valeurStrategiqueNumerique && (
            <div className="bg-[#f0fdf4] border border-[#86efac] rounded-sm p-4 mt-3">
              <div className="bg-[#0284c7] text-white font-sans text-[11px] font-bold uppercase px-2.5 py-1 inline-block mb-2">
                VALEUR STRATÉGIQUE DE L'INITIATIVE NUMÉRIQUE DDL-PN
              </div>
              <p className="text-[12px] text-[#1e293b] leading-relaxed text-justify whitespace-pre-line">
                {data.valeurStrategiqueNumerique}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 5 : ACTIVITÉS PROGRAMMÉES NON RÉALISÉES          */}
      {/* ======================================================== */}
      <div className="mb-10 avoid-break page-break">
        <h2 className="text-[15px] font-bold text-[#0369a1] uppercase font-sans border-b border-[#0369a1] pb-1 mb-4">
          5. ACTIVITÉS PROGRAMMÉES NON RÉALISÉES
        </h2>
        <p className="text-[12.5px] text-[#475569] italic mb-3">
          Les activités relevant du cœur de métier de la DDL — contrôle des établissements, délivrance d'autorisations, enquête statistique Phase 2, promotion des loisirs sains, formalisation des partenariats — n'ont pu être menées à bien au cours du T3 {data.annee}.
        </p>

        <table className="w-full text-left text-[11px] border-collapse border border-[#334155]">
          <thead>
            <tr className="bg-[#f1f5f9] text-[#0f172a] font-sans text-[9.5px] uppercase font-bold border-b border-[#334155]">
              <th className="p-2 border border-[#334155] w-[5%] text-center">N°</th>
              <th className="p-2 border border-[#334155] w-[20%]">ACTIVITÉS PRÉVUES</th>
              <th className="p-2 border border-[#334155] w-[28%]">CONTENUS / ACTIONS</th>
              <th className="p-2 border border-[#334155] w-[18%]">INDICATEURS</th>
              <th className="p-2 border border-[#334155] w-[11%] text-center">EXÉCUTION</th>
              <th className="p-2 border border-[#334155] w-[18%]">OBSERVATION</th>
            </tr>
          </thead>
          <tbody>
            {data.activitesNonRealisees.map((act) => (
              <tr key={act.id} className="bg-white">
                <td className="p-2 border border-[#334155] text-center font-bold font-mono">{act.num}</td>
                <td className="p-2 border border-[#334155] font-semibold text-[#1e293b]">{act.activitePrevue}</td>
                <td className="p-2 border border-[#334155] text-[#334155]">
                  <ul className="list-disc list-inside space-y-0.5">
                    {act.contenusActions.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </td>
                <td className="p-2 border border-[#334155] text-[#334155]">
                  <ul className="list-disc list-inside space-y-0.5">
                    {act.indicateurs.map((ind, i) => (
                      <li key={i}>{ind}</li>
                    ))}
                  </ul>
                </td>
                <td className="p-2 border border-[#334155] text-center font-bold text-[#e11d48]">{act.execution}</td>
                <td className="p-2 border border-[#334155] text-[#475569]">{act.observation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ======================================================== */}
      {/* SECTION 6 : ACTIVITÉS PONCTUELLES — PARTICIPATIONS INSTITUTIONNELLES */}
      {/* ======================================================== */}
      <div className="mb-10 avoid-break page-break">
        <h2 className="text-[15px] font-bold text-[#0369a1] uppercase font-sans border-b border-[#0369a1] pb-1 mb-4">
          6. ACTIVITÉS PONCTUELLES — PARTICIPATIONS INSTITUTIONNELLES
        </h2>
        <p className="text-[12.5px] text-[#475569] italic mb-3">
          La Direction Départementale des Loisirs a assuré sa représentation institutionnelle lors de trois cérémonies officielles de haut niveau au cours du mois de septembre {data.annee}. L'une de ces cérémonies était placée sous le Haut Patronage de Monsieur le Premier Ministre, Chef du Gouvernement.
        </p>

        <table className="w-full text-left text-[11.5px] border-collapse border border-[#334155] mb-4">
          <thead>
            <tr className="bg-[#f1f5f9] text-[#0f172a] font-sans text-[10px] uppercase font-bold border-b border-[#334155]">
              <th className="p-2 border border-[#334155] w-[30%]">DATE & LIEU</th>
              <th className="p-2 border border-[#334155] w-[25%]">ACTIVITÉ / ÉVÉNEMENT</th>
              <th className="p-2 border border-[#334155] w-[22%]">RÔLE / PARTICIPATION</th>
              <th className="p-2 border border-[#334155] w-[23%]">CADRE / PATRONAGE</th>
            </tr>
          </thead>
          <tbody>
            {data.participationsInstitutionnelles.map((p) => (
              <tr key={p.id} className="bg-white">
                <td className="p-2 border border-[#334155]">
                  <div className="font-bold text-[#0f172a]">{p.date}</div>
                  <div className="text-[11px] text-[#475569]">{p.lieu}</div>
                  {p.reference && <div className="text-[9.5px] font-mono text-[#64748b] mt-0.5">({p.reference})</div>}
                </td>
                <td className="p-2 border border-[#334155] font-semibold text-[#1e293b]">{p.activiteEvenement}</td>
                <td className="p-2 border border-[#334155] text-[#334155]">{p.roleParticipation}</td>
                <td className="p-2 border border-[#334155] font-medium text-[#0369a1]">{p.cadrePatronage}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {data.noteOpportuniteWingWah && (
          <p className="text-[12.5px] text-[#1e293b] leading-relaxed text-justify bg-[#f8fafc] border-l-4 border-[#0284c7] p-3">
            {data.noteOpportuniteWingWah}
          </p>
        )}
      </div>

      {/* ======================================================== */}
      {/* SECTION 7 : DIFFICULTÉS RENCONTRÉES                      */}
      {/* ======================================================== */}
      <div className="mb-10 avoid-break">
        <h2 className="text-[15px] font-bold text-[#0369a1] uppercase font-sans border-b border-[#0369a1] pb-1 mb-4">
          7. DIFFICULTÉS RENCONTRÉES
        </h2>
        <p className="text-[12.5px] text-[#475569] italic mb-3">
          Les difficultés du T3 {data.annee} s'inscrivent dans la continuité des trimestres précédents. Deux éléments méritent une attention particulière pour ce trimestre.
        </p>

        <div className="space-y-4">
          {data.difficultes.map((d) => (
            <div key={d.id} className="bg-[#f8fafc] border border-[#cbd5e1] p-4 rounded-sm">
              <h3 className="font-sans font-bold text-[13px] text-[#0f172a] mb-2 underline">
                {d.num}. {d.titre}
              </h3>
              <p className="text-[12.5px] text-[#1e293b] leading-relaxed text-justify">
                {d.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 8 : SUGGESTIONS POUR LE QUATRIÈME TRIMESTRE      */}
      {/* ======================================================== */}
      <div className="mb-10 avoid-break page-break">
        <h2 className="text-[15px] font-bold text-[#0369a1] uppercase font-sans border-b border-[#0369a1] pb-1 mb-4">
          8. SUGGESTIONS POUR LE QUATRIÈME TRIMESTRE {data.annee}
        </h2>
        <p className="text-[12.5px] text-[#475569] italic mb-3">
          Le quatrième trimestre {data.annee} est le dernier de l'exercice. Il doit impérativement être un trimestre de rattrapage opérationnel et de concrétisation. Les actions suivantes sont prioritaires :
        </p>

        <div className="space-y-4">
          {data.suggestions.map((s) => (
            <div key={s.id} className="bg-[#f8fafc] border-l-4 border-[#0369a1] p-3 pl-4">
              <h3 className="font-sans font-bold text-[13px] text-[#0369a1] mb-1">
                {s.numRomain}. {s.titre}
              </h3>
              <p className="text-[12.5px] text-[#1e293b] leading-relaxed text-justify">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 9 : CONCLUSION & SIGNATURE                       */}
      {/* ======================================================== */}
      <div className="mb-8 avoid-break page-break">
        <h2 className="text-[15px] font-bold text-[#0369a1] uppercase font-sans border-b border-[#0369a1] pb-1 mb-4">
          9. CONCLUSION
        </h2>
        <div className="text-[13px] text-[#1e293b] leading-relaxed text-justify space-y-3 whitespace-pre-line mb-10">
          {data.conclusion}
        </div>

        {/* Bloc Signature Officielle */}
        <div className="flex justify-between items-start mt-8 pt-4">
          <div className="text-[12px] text-[#475569] font-serif">
            Fait à {data.lieuSignature}, le _____________________ {data.annee}
          </div>

          <div className="text-center w-[50%]">
            <div className="font-sans font-bold text-[13px] text-[#0f172a]">
              {data.directeurTitre}
            </div>
            <div className="h-24"></div>
            <div className="font-sans font-bold text-[14px] text-[#0f172a] uppercase underline tracking-wider">
              {data.directeurNom}
            </div>
          </div>
        </div>

        {/* Distribution en bas de page */}
        <div className="mt-14 pt-4 border-t border-[#94a3b8] text-[10px] text-[#64748b] italic font-sans leading-tight">
          <strong>Distribution :</strong> {data.distributionList.join(' | ')}
        </div>
      </div>

    </div>
  );
};
