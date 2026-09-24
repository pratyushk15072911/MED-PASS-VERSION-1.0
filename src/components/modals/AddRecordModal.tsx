import React, { useState } from 'react';
import { Medication, Allergy, PatientProfile } from '../../types';
import { Plus, X, Pill, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { DRUG_CROSS_REACTIVITY_RULES } from '../../utils/clinicalCDSS';

interface AddRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  onAddMedication: (med: Medication) => void;
  onAddAllergy: (alg: Allergy) => void;
}

export const AddRecordModal: React.FC<AddRecordModalProps> = ({
  isOpen,
  onClose,
  patient,
  onAddMedication,
  onAddAllergy,
}) => {
  const [recordType, setRecordType] = useState<'medication' | 'allergy'>('medication');

  // Medication Form
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medFreq, setMedFreq] = useState('Once daily');
  const [medCategory, setMedCategory] = useState('General Health');
  const [medDoctor, setMedDoctor] = useState('Dr. Sarah Jenkins');
  const [medInstructions, setMedInstructions] = useState('');

  // Allergy Form
  const [algName, setAlgName] = useState('');
  const [algSeverity, setAlgSeverity] = useState<'Severe' | 'Moderate' | 'Mild'>('Moderate');
  const [algCategory, setAlgCategory] = useState<'Drug' | 'Food' | 'Environmental'>('Drug');
  const [algReaction, setAlgReaction] = useState('');
  const [algSource, setAlgSource] = useState('Patient Self-Report');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (recordType === 'medication') {
      if (!medName || !medDosage) return;
      const cleanName = medName.trim();
      const lowerName = cleanName.toLowerCase();

      // Auto-detect pharmacological class from CDSS engine if available
      let detectedCategory = medCategory;
      for (const [key, rule] of Object.entries(DRUG_CROSS_REACTIVITY_RULES)) {
        if (lowerName.includes(key)) {
          detectedCategory = rule.genericClass;
          break;
        }
      }

      const newMed: Medication = {
        id: `med-${Date.now()}`,
        patientId: patient.id, // Scoped to active patient
        name: cleanName,
        dosage: medDosage.trim(),
        frequency: medFreq,
        category: detectedCategory,
        prescribingDoctor: medDoctor.trim(),
        startDate: 'Today',
        status: 'active',
        tier: 'tier1',
        tierLabel: 'Gold Tier Verified',
        instructions: medInstructions.trim(),
      };
      onAddMedication(newMed);
    } else {
      if (!algName) return;
      const newAlg: Allergy = {
        id: `alg-${Date.now()}`,
        patientId: patient.id, // Scoped to active patient
        allergen: algName.trim(),
        severity: algSeverity,
        riskLabel: `${algSeverity} Risk Sensitivity`,
        tier: 'tier1',
        tierLabel: 'Gold Tier Verified',
        reactionDetails: algReaction.trim() || 'Documented allergic sensitivity.',
        firstReported: 'Today',
        source: algSource,
        category: algCategory,
      };
      onAddAllergy(newAlg);
    }
    // Reset forms
    setMedName('');
    setMedDosage('');
    setMedInstructions('');
    setAlgName('');
    setAlgReaction('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#bec9c5] max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-[#c9e7f7] pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#e6f6ff] text-[#004f45] rounded-xl">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#001f2a]">Add Health Record</h2>
              <p className="text-[11px] text-[#546067]">Adding to patient profile: {patient.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          <button
            type="button"
            onClick={() => setRecordType('medication')}
            className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              recordType === 'medication'
                ? 'bg-[#004f45] text-white shadow-2xs'
                : 'bg-[#f4faff] text-[#546067] hover:bg-[#e6f6ff]'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>Medication</span>
          </button>

          <button
            type="button"
            onClick={() => setRecordType('allergy')}
            className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              recordType === 'allergy'
                ? 'bg-[#ba1a1a] text-white shadow-2xs'
                : 'bg-[#f4faff] text-[#546067] hover:bg-[#ffdad6]'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Allergy / Sensitivity</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {recordType === 'medication' ? (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#001f2a] mb-1">
                  Medication Name *
                </label>
                <input
                  type="text"
                  required
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  placeholder="e.g. Cephalexin, Augmentin, Ibuprofen, Atorvastatin"
                  className="w-full p-2.5 bg-[#f4faff] border border-[#bec9c5] rounded-xl text-xs outline-none focus:border-[#004f45]"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Tip: Adding beta-lactams (e.g. Cephalexin, Augmentin) will automatically trigger CDSS cross-reactivity checks against patient allergies.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#001f2a] mb-1">
                    Dosage *
                  </label>
                  <input
                    type="text"
                    required
                    value={medDosage}
                    onChange={(e) => setMedDosage(e.target.value)}
                    placeholder="e.g. 10mg, 500mg"
                    className="w-full p-2.5 bg-[#f4faff] border border-[#bec9c5] rounded-xl text-xs outline-none focus:border-[#004f45]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#001f2a] mb-1">
                    Frequency
                  </label>
                  <input
                    type="text"
                    value={medFreq}
                    onChange={(e) => setMedFreq(e.target.value)}
                    placeholder="e.g. Twice daily with meals"
                    className="w-full p-2.5 bg-[#f4faff] border border-[#bec9c5] rounded-xl text-xs outline-none focus:border-[#004f45]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#001f2a] mb-1">
                  Prescribing Physician
                </label>
                <input
                  type="text"
                  value={medDoctor}
                  onChange={(e) => setMedDoctor(e.target.value)}
                  placeholder="e.g. Dr. Sarah Jenkins"
                  className="w-full p-2.5 bg-[#f4faff] border border-[#bec9c5] rounded-xl text-xs outline-none focus:border-[#004f45]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#001f2a] mb-1">
                  Special Instructions
                </label>
                <textarea
                  rows={2}
                  value={medInstructions}
                  onChange={(e) => setMedInstructions(e.target.value)}
                  placeholder="e.g. Take with food. Avoid grapefruit."
                  className="w-full p-2.5 bg-[#f4faff] border border-[#bec9c5] rounded-xl text-xs outline-none focus:border-[#004f45]"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#001f2a] mb-1">
                  Allergen / Drug Name *
                </label>
                <input
                  type="text"
                  required
                  value={algName}
                  onChange={(e) => setAlgName(e.target.value)}
                  placeholder="e.g. Penicillin, NSAIDs, Sulfa, Peanuts, Latex"
                  className="w-full p-2.5 bg-[#f4faff] border border-[#bec9c5] rounded-xl text-xs outline-none focus:border-[#ba1a1a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#001f2a] mb-1">
                    Severity Risk
                  </label>
                  <select
                    value={algSeverity}
                    onChange={(e) => setAlgSeverity(e.target.value as any)}
                    className="w-full p-2.5 bg-[#f4faff] border border-[#bec9c5] rounded-xl text-xs outline-none"
                  >
                    <option value="Severe">Severe (Anaphylaxis)</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Mild">Mild Intolerance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#001f2a] mb-1">
                    Category
                  </label>
                  <select
                    value={algCategory}
                    onChange={(e) => setAlgCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-[#f4faff] border border-[#bec9c5] rounded-xl text-xs outline-none"
                  >
                    <option value="Drug">Drug Sensitivity</option>
                    <option value="Food">Food Allergy</option>
                    <option value="Environmental">Environmental</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#001f2a] mb-1">
                  Reaction Profile / Symptoms
                </label>
                <textarea
                  rows={2}
                  value={algReaction}
                  onChange={(e) => setAlgReaction(e.target.value)}
                  placeholder="e.g. Airway constriction, hives, swelling of lips and tongue"
                  className="w-full p-2.5 bg-[#f4faff] border border-[#bec9c5] rounded-xl text-xs outline-none focus:border-[#ba1a1a]"
                />
              </div>
            </>
          )}

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#c9e7f7]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-[#001f2a] text-xs font-bold rounded-xl hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#004f45] hover:bg-[#003831] text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
