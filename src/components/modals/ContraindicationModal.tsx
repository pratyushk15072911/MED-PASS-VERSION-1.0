import React from 'react';
import { AlertTriangle, CheckCircle2, X, Pill, ShieldAlert, ArrowRight, Info } from 'lucide-react';
import { ActiveConflict } from '../../utils/clinicalCDSS';

interface ContraindicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAlternative: (altMedName: string, dosage: string, conflictingMedName?: string) => void;
  activeConflict?: ActiveConflict | null;
  patientName?: string;
}

export const ContraindicationModal: React.FC<ContraindicationModalProps> = ({
  isOpen,
  onClose,
  onSelectAlternative,
  activeConflict,
  patientName = 'Patient',
}) => {
  if (!isOpen) return null;

  // Use dynamic CDSS rule alternatives if available
  const alternatives = activeConflict?.rule?.suggestedAlternatives || [
    {
      name: 'Azithromycin (Zithromax)',
      dosage: '500mg Day 1, then 250mg Days 2-5',
      category: 'Macrolide Antibiotic',
      coverage: 'Atypical respiratory pathogens, Gram-positive cocci',
      advantages: 'Zero cross-reactivity with Beta-Lactam / Penicillin allergy',
    },
  ];

  const isDrugDrug = activeConflict?.conflictType === 'drug-drug';
  const conflictingMed = activeConflict?.medicationName || 'Amoxicillin';
  const secondMed = activeConflict?.secondMedicationName || '';
  const conflictingAllergen = activeConflict?.allergenName || 'Penicillin';
  const clinicalMechanism =
    activeConflict?.mechanism ||
    'Contains 4-membered Beta-Lactam ring structure with high risk of IgE-mediated anaphylaxis in penicillin-allergic patients.';

  const modalTitle = isDrugDrug
    ? `Fatal Drug Interaction: ${conflictingMed} + ${secondMed}`
    : `${conflictingAllergen} Allergy vs. ${conflictingMed} Contraindication`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border-2 border-[#ba1a1a] animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 border-b border-[#ffdad6] pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#ba1a1a] text-white rounded-2xl shadow-sm">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-[#ba1a1a]">
                {isDrugDrug ? 'CDSS DRUG-DRUG LETHAL INTERACTION' : 'CDSS DRUG-ALLERGY CROSS-REACTIVITY'}
              </span>
              <h2 className="font-serif text-xl font-bold text-[#93000a]">
                {modalTitle}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-[#ffdad6]/60 border border-[#ba1a1a]/30 rounded-2xl mb-6">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-[#ba1a1a] shrink-0 mt-0.5" />
            <div className="text-xs text-[#410002] leading-relaxed">
              <strong className="font-bold">Risk Assessment for {patientName}:</strong>{' '}
              {isDrugDrug ? (
                <>
                  Active prescription for <strong className="underline">{conflictingMed}</strong> exhibits a life-threatening interaction with concurrent medication <strong className="underline">{secondMed}</strong>.
                </>
              ) : (
                <>
                  Documented sensitivity to <strong className="underline">{conflictingAllergen}</strong> conflicts with active prescription for <strong className="underline">{conflictingMed}</strong>.
                </>
              )}
              <p className="mt-2 font-mono text-[11px] text-rose-900 bg-rose-100/70 p-2.5 rounded-lg border border-rose-200">
                <strong>Clinical Mechanism:</strong> {clinicalMechanism}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif font-bold text-sm text-[#001f2a] uppercase tracking-wider">
            Pharmacologically Verified Safe Alternatives:
          </h3>
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <Info className="w-3 h-3" /> Adjust for CrCl / hepatic panel
          </span>
        </div>

        <div className="space-y-3 mb-6">
          {alternatives.map((alt, idx) => (
            <div
              key={idx}
              className="p-4 bg-[#f4faff] border border-[#c9e7f7] rounded-2xl hover:border-[#004f45] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#001f2a] text-sm">{alt.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#004f45]/10 text-[#004f45] font-semibold">
                    {alt.category}
                  </span>
                </div>
                <div className="text-xs text-[#546067]">
                  <strong className="text-[#001f2a]">Regimen:</strong> {alt.dosage}
                </div>
                <div className="text-xs text-[#546067]">
                  <strong className="text-[#001f2a]">Clinical Advantage:</strong> {alt.advantages}
                </div>
              </div>

              <button
                onClick={() => {
                  onSelectAlternative(alt.name, alt.dosage, conflictingMed);
                  onClose();
                }}
                className="self-end sm:self-center px-4 py-2 bg-[#004f45] hover:bg-[#003831] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
              >
                <span>Swap to this Med</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Keep Under Close Observation
          </button>
        </div>
      </div>
    </div>
  );
};
