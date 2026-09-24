import React from 'react';
import { AlertTriangle, CheckCircle2, X, Pill, ShieldAlert, ArrowRight } from 'lucide-react';
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

  // Use dynamic CDSS rule alternatives if available, otherwise standard safe alternatives
  const alternatives = activeConflict?.rule?.suggestedAlternatives || [
    {
      name: 'Azithromycin (Zithromax)',
      dosage: '500mg Day 1, then 250mg Days 2-5',
      category: 'Macrolide Antibiotic',
      coverage: 'Atypical respiratory pathogens, Gram-positive cocci',
      advantages: 'Zero cross-reactivity with Beta-Lactam / Penicillin allergy',
    },
    {
      name: 'Doxycycline Hyclate',
      dosage: '100mg orally twice daily for 7-10 days',
      category: 'Tetracycline Class',
      coverage: 'Broad spectrum, MRSA, atypicals, non-gonococcal infections',
      advantages: 'Zero Beta-Lactam ring structure, highly effective alternative',
    },
    {
      name: 'Levofloxacin',
      dosage: '500mg orally once daily for 7 days',
      category: 'Fluoroquinolone',
      coverage: 'Pseudomonas, Gram-negative bacilli, Streptococcus pneumoniae',
      advantages: 'Reserve for complicated respiratory tract infections',
    },
  ];

  const conflictingMed = activeConflict?.medicationName || 'Amoxicillin';
  const conflictingAllergen = activeConflict?.allergenName || 'Penicillin';
  const clinicalMechanism =
    activeConflict?.mechanism ||
    'Contains 4-membered Beta-Lactam ring structure with high risk of IgE-mediated anaphylaxis in penicillin-allergic patients.';

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
                CDSS CLINICAL DECISION SUPPORT
              </span>
              <h2 className="font-serif text-xl font-bold text-[#93000a]">
                {conflictingAllergen} Allergy vs. {conflictingMed} Contraindication
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
              <strong className="font-bold">Risk Assessment for {patientName}:</strong> Documented sensitivity to{' '}
              <strong className="underline">{conflictingAllergen}</strong> conflicts with active prescription for{' '}
              <strong className="underline">{conflictingMed}</strong>.
              <p className="mt-1 font-mono text-[11px] text-rose-900 bg-rose-100/60 p-2 rounded-lg">
                <strong>Mechanism:</strong> {clinicalMechanism}
              </p>
            </div>
          </div>
        </div>

        <h3 className="font-serif font-bold text-sm text-[#001f2a] uppercase tracking-wider mb-3">
          Pharmacologically Verified Safe Alternatives:
        </h3>

        <div className="space-y-3 mb-6">
          {alternatives.map((alt, idx) => (
            <div
              key={idx}
              className="p-4 bg-[#f4faff] border border-[#c9e7f7] rounded-2xl hover:border-[#004f45] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-[#004f45]">{alt.name}</h4>
                  <span className="text-[10px] font-bold bg-[#e6f6ff] text-[#004f45] px-2 py-0.5 rounded">
                    {alt.category}
                  </span>
                </div>
                <p className="text-xs font-mono text-[#001f2a] font-semibold">{alt.dosage}</p>
                <p className="text-[11px] text-[#546067]">{alt.coverage}</p>
                <div className="text-[11px] text-[#047857] font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{alt.advantages}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onSelectAlternative(alt.name, alt.dosage, conflictingMed);
                  onClose();
                }}
                className="bg-[#004f45] hover:bg-[#003831] text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-2xs"
              >
                <span>Swap to {alt.name.split(' ')[0]}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-[#bec9c5]/60">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#001f2a] rounded-xl text-xs font-bold"
          >
            Cancel & Keep Advisory
          </button>
        </div>
      </div>
    </div>
  );
};
