import React, { useState } from 'react';
import { Allergy, PatientProfile } from '../../types';
import {
  AlertTriangle,
  ShieldCheck,
  Plus,
  Filter,
  CheckCircle2,
  Calendar,
  User,
  Search,
  Flame,
  AlertCircle,
  FileWarning,
} from 'lucide-react';

interface AllergiesWarningsViewProps {
  allergies: Allergy[];
  patient: PatientProfile;
  onAddAllergy: () => void;
  onOpenContraindication: () => void;
  hasContraindication: boolean;
}

export const AllergiesWarningsView: React.FC<AllergiesWarningsViewProps> = ({
  allergies,
  patient,
  onAddAllergy,
  onOpenContraindication,
  hasContraindication,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'All' | 'Severe' | 'Moderate' | 'Mild'>('All');
  const [search, setSearch] = useState('');

  // Scope to active patient
  const patientAllergies = allergies.filter((a) => !a.patientId || a.patientId === patient.id);

  const filteredAllergies = patientAllergies.filter((a) => {
    const matchesSev = filterSeverity === 'All' || a.severity === filterSeverity;
    const matchesSearch =
      a.allergen.toLowerCase().includes(search.toLowerCase()) ||
      a.reactionDetails.toLowerCase().includes(search.toLowerCase());
    return matchesSev && matchesSearch;
  });

  return (
    <div className="min-h-[calc(100vh-100px)] bg-[#f4faff] text-[#001f2a] pb-24">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6 flex flex-col gap-6">
        {/* Header Title Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#bec9c5] rounded-2xl p-5 shadow-xs">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#ffdad6] text-[#ba1a1a] rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold text-[#001f2a]">Allergies & Adverse Drug Reactions</h1>
                <p className="text-xs text-[#546067] mt-0.5">
                  Verified sensitivities and clinical contraindication registry for{' '}
                  <strong className="text-[#004f45]">{patient.name}</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onAddAllergy}
              className="flex items-center gap-2 bg-[#004f45] hover:bg-[#003831] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Allergy Record</span>
            </button>
          </div>
        </div>

        {/* Critical Alert Banner if Contraindication Exists */}
        {hasContraindication && (
          <div className="bg-[#ffdad6] border-2 border-[#ba1a1a] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2 bg-[#ba1a1a] text-white rounded-xl mt-0.5">
                <Flame className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-[#ba1a1a]">
                  CRITICAL CONTRAINDICATION ALERT (CDSS)
                </span>
                <h2 className="font-serif text-base font-bold text-[#93000a] mt-0.5">
                  Active Drug vs Allergy Conflict Detected for {patient.name}
                </h2>
                <p className="text-xs text-[#410002] mt-1 font-medium">
                  Patient exhibits high-risk anaphylaxis/cross-reactivity. Immediate clinical review required to switch to a safe non-cross-reactive alternative.
                </p>
              </div>
            </div>

            <button
              onClick={onOpenContraindication}
              className="bg-[#ba1a1a] hover:bg-[#93000a] text-white text-xs font-bold px-4 py-2 rounded-xl uppercase tracking-wider transition-colors shadow-2xs shrink-0"
            >
              View Clinical Alternatives
            </button>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-[#bec9c5] rounded-xl p-3 shadow-2xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(['All', 'Severe', 'Moderate', 'Mild'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterSeverity === sev
                    ? 'bg-[#004f45] text-white shadow-2xs'
                    : 'bg-[#f4faff] text-[#546067] hover:bg-[#e6f6ff] hover:text-[#001f2a]'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search allergens, reactions..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#f4faff] border border-[#bec9c5] rounded-lg text-xs outline-none focus:border-[#004f45]"
            />
          </div>
        </div>

        {/* Allergies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAllergies.map((allergy) => {
            const isSevere = allergy.severity === 'Severe';
            return (
              <div
                key={allergy.id}
                className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${
                  isSevere ? 'border-[#ba1a1a]/40 ring-1 ring-[#ba1a1a]/15' : 'border-[#bec9c5]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif font-bold text-lg text-[#001f2a]">{allergy.allergen}</h3>
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                          {allergy.category}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                          isSevere
                            ? 'bg-[#ffdad6] text-[#ba1a1a]'
                            : allergy.severity === 'Moderate'
                            ? 'bg-[#ffe8b3] text-[#7a4e00]'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {allergy.riskLabel}
                      </span>
                    </div>

                    <span className="bg-[#10b981]/15 text-[#047857] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                      <ShieldCheck className="w-3 h-3" />
                      {allergy.tierLabel}
                    </span>
                  </div>

                  <div className="bg-[#f4faff] border border-[#c9e7f7] rounded-xl p-3 text-xs text-[#001f2a] leading-relaxed">
                    <strong className="block text-[10px] uppercase font-bold text-[#546067] mb-0.5">
                      Documented Reaction Symptoms
                    </strong>
                    {allergy.reactionDetails}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#c9e7f7] flex items-center justify-between text-[11px] text-[#546067]">
                  <span>Source: {allergy.source}</span>
                  <span>First Logged: {allergy.firstReported}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
