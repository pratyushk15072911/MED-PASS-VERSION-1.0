import React, { useState } from 'react';
import { Medication, MedicationHistoryItem, PatientProfile } from '../../types';
import {
  Pill,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  User,
  Clock,
  FileDown,
  History,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';

interface ActiveMedicationsViewProps {
  medications: Medication[];
  history: MedicationHistoryItem[];
  patient: PatientProfile;
  onAddMedication: () => void;
  onOpenExportModal: () => void;
  hasContraindication: boolean;
  onOpenContraindication: () => void;
}

export const ActiveMedicationsView: React.FC<ActiveMedicationsViewProps> = ({
  medications,
  history,
  patient,
  onAddMedication,
  onOpenExportModal,
  hasContraindication,
  onOpenContraindication,
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [search, setSearch] = useState('');

  // Scope to active patient (fallback if no patientId explicitly set)
  const patientMeds = medications.filter((m) => !m.patientId || m.patientId === patient.id);
  const patientHistory = history.filter((h) => !h.patientId || h.patientId === patient.id);

  const filteredMeds = patientMeds.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase()) ||
      m.prescribingDoctor.toLowerCase().includes(search.toLowerCase())
  );

  const filteredHistory = patientHistory.filter(
    (h) =>
      h.medication.toLowerCase().includes(search.toLowerCase()) ||
      h.outcome.toLowerCase().includes(search.toLowerCase()) ||
      h.prescriber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-100px)] bg-[#f4faff] text-[#001f2a] pb-24">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6 flex flex-col gap-6">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#bec9c5] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#e6f6ff] text-[#004f45] rounded-xl">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-[#001f2a]">Medications & Regimen</h1>
              <p className="text-xs text-[#546067] mt-0.5">
                Active prescriptions, verified dosages, and historical outcomes for{' '}
                <strong className="text-[#004f45]">{patient.name}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenExportModal}
              className="flex items-center gap-1.5 border border-[#006a62] text-[#006a62] hover:bg-[#e6f6ff] px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors"
            >
              <FileDown className="w-4 h-4" />
              <span>Export Rx Summary</span>
            </button>

            <button
              onClick={onAddMedication}
              className="flex items-center gap-2 bg-[#004f45] hover:bg-[#003831] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Medication</span>
            </button>
          </div>
        </div>

        {/* Tab Selector & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-[#bec9c5] rounded-xl p-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'active'
                  ? 'bg-[#004f45] text-white shadow-2xs'
                  : 'bg-[#f4faff] text-[#546067] hover:bg-[#e6f6ff] hover:text-[#001f2a]'
              }`}
            >
              <Pill className="w-3.5 h-3.5" />
              <span>Active Prescriptions ({patientMeds.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-[#004f45] text-white shadow-2xs'
                  : 'bg-[#f4faff] text-[#546067] hover:bg-[#e6f6ff] hover:text-[#001f2a]'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Medication History ({patientHistory.length})</span>
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search medication, physician..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#f4faff] border border-[#bec9c5] rounded-lg text-xs outline-none focus:border-[#004f45]"
            />
          </div>
        </div>

        {/* Tab 1: Active Medications */}
        {activeTab === 'active' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {filteredMeds.map((med) => {
              const isAmox = med.name.toLowerCase().includes('amoxicillin');
              return (
                <div
                  key={med.id}
                  className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all ${
                    isAmox && hasContraindication ? 'border-[#ba1a1a] ring-1 ring-[#ba1a1a]/20' : 'border-[#bec9c5]'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-serif font-bold text-lg text-[#001f2a]">{med.name}</h3>
                        {med.genericName && (
                          <p className="text-[11px] text-[#546067] italic">{med.genericName}</p>
                        )}
                      </div>
                      <span className="bg-[#10b981]/15 text-[#047857] text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                        <ShieldCheck className="w-3 h-3" />
                        {med.tierLabel}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between text-[#546067]">
                        <span>Dosage:</span>
                        <strong className="text-[#001f2a] font-mono">{med.dosage}</strong>
                      </div>
                      <div className="flex items-center justify-between text-[#546067]">
                        <span>Frequency:</span>
                        <span className="text-[#001f2a] font-medium">{med.frequency}</span>
                      </div>
                      <div className="flex items-center justify-between text-[#546067]">
                        <span>Category:</span>
                        <span className="text-[#004f45] font-semibold">{med.category}</span>
                      </div>
                    </div>

                    {med.instructions && (
                      <div className="bg-[#f4faff] border border-[#c9e7f7] rounded-xl p-3 text-[11px] text-[#001f2a]">
                        <strong className="block text-[10px] uppercase font-bold text-[#546067] mb-0.5">
                          Instructions
                        </strong>
                        {med.instructions}
                      </div>
                    )}
                  </div>

                  {isAmox && hasContraindication && (
                    <div className="mt-4 pt-3 border-t border-[#ba1a1a]/30">
                      <div className="bg-[#ffdad6] border border-[#ba1a1a]/30 p-2.5 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-[#ba1a1a] font-bold">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>Penicillin Allergy Conflict</span>
                        </div>
                        <button
                          onClick={onOpenContraindication}
                          className="bg-[#ba1a1a] text-white text-[11px] px-2.5 py-1 rounded-lg font-bold hover:bg-[#93000a] transition-colors"
                        >
                          Swap Rx
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-[#c9e7f7] flex items-center justify-between text-[11px] text-[#546067]">
                    <span>Dr: {med.prescribingDoctor}</span>
                    <span>Started: {med.startDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Medication History */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#bec9c5] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-serif font-bold text-base text-[#001f2a]">{item.medication}</h3>
                    <span
                      className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                      style={{ backgroundColor: `${item.goalStatusColor}20`, color: item.goalStatusColor }}
                    >
                      {item.goalStatus}
                    </span>
                  </div>

                  <p className="text-xs text-[#546067]">
                    Period: <strong>{item.period}</strong> • Prescribed by: {item.prescriber}
                  </p>

                  <div className="text-xs text-[#001f2a]">
                    <strong>Outcome:</strong> {item.outcome}
                  </div>

                  {item.notes && <p className="text-[11px] text-[#546067] italic">Note: {item.notes}</p>}
                </div>

                <div className="bg-[#f4faff] border border-[#c9e7f7] rounded-xl p-3 min-w-[240px] text-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#546067] block">
                    Follow-up Recommendation
                  </span>
                  <div className="text-[#004f45] font-semibold">{item.nextStepsAction}</div>
                  <span className="text-[10px] text-slate-500 block">Level: {item.nextStepsLevel} Priority</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
