import React, { useState, useMemo } from 'react';
import { PatientProfile, Medication, Allergy, VitalRecord, MajorHealthEvent } from '../../types';
import {
  ShieldAlert,
  Activity,
  Lock,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Pill,
  ArrowRight,
  FileText,
  Calendar,
  Layers,
  HeartPulse,
  Syringe,
  Info,
  SlidersHorizontal,
} from 'lucide-react';

interface SuperCrucialHUDProps {
  patient: PatientProfile;
  medications: Medication[];
  allergies: Allergy[];
  vitals?: VitalRecord;
  triageScope: string;
  onSelectScope: (scope: string) => void;
  hasContraindication: boolean;
  onViewAlternatives: () => void;
}

export const SuperCrucialHUD: React.FC<SuperCrucialHUDProps> = ({
  patient,
  medications,
  allergies,
  triageScope,
  onSelectScope,
  hasContraindication,
  onViewAlternatives,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Automatically build smart tabs dynamically tailored to THIS specific patient
  const patientTabs = useMemo(() => {
    // Tab 1: All Records (always present)
    const tabs: Array<{
      id: string;
      label: string;
      subtitle: string;
      badgeText: string;
      badgeType: 'critical' | 'high' | 'important' | 'managed' | 'default';
      keyMetric: string;
      icon: React.ReactNode;
      accentColor: string;
      eventData?: MajorHealthEvent;
    }> = [
      {
        id: 'all',
        label: 'All Patient Records',
        subtitle: 'Complete medical history',
        badgeText: `${medications.length} Meds • ${allergies.length} Allergies`,
        badgeType: 'default',
        keyMetric: `${patient.name} Overview`,
        icon: <Layers className="w-4 h-4" />,
        accentColor: 'border-slate-300',
      },
    ];

    // Add tabs for each major condition, surgery, or major event in this patient's profile
    if (patient.majorEvents && patient.majorEvents.length > 0) {
      patient.majorEvents.forEach((evt) => {
        let icon = <Activity className="w-4 h-4" />;
        let accentColor = 'border-sky-300';
        let badgeType: 'critical' | 'high' | 'important' | 'managed' = 'managed';

        if (evt.type === 'allergy' || evt.severity === 'Critical') {
          icon = <ShieldAlert className="w-4 h-4 text-rose-600" />;
          accentColor = 'border-rose-300';
          badgeType = 'critical';
        } else if (evt.type === 'surgery') {
          icon = <Syringe className="w-4 h-4 text-amber-600" />;
          accentColor = 'border-amber-300';
          badgeType = 'important';
        } else if (evt.severity === 'High') {
          icon = <HeartPulse className="w-4 h-4 text-emerald-600" />;
          accentColor = 'border-emerald-300';
          badgeType = 'high';
        }

        tabs.push({
          id: evt.id,
          label: evt.shortLabel,
          subtitle: evt.dateOrYear,
          badgeText: evt.status.split('•')[0].trim(),
          badgeType,
          keyMetric: evt.title,
          icon,
          accentColor,
          eventData: evt,
        });
      });
    }

    return tabs;
  }, [patient, medications, allergies]);

  // Active selected tab object (fallback to first tab if ID doesn't exist for this patient)
  const activeTab = useMemo(() => {
    return patientTabs.find((t) => t.id === triageScope) || patientTabs[0];
  }, [patientTabs, triageScope]);

  // Active event object if a condition tab is selected
  const activeEvent: MajorHealthEvent | undefined = activeTab.eventData;

  // Find relevant medications tied to the active condition
  const relevantMeds = useMemo(() => {
    if (!activeEvent) return medications;
    return medications.filter((m) => {
      const matchName = activeEvent.relatedMedications?.some((r) =>
        m.name.toLowerCase().includes(r.toLowerCase().split(' ')[0]) ||
        (m.category && activeEvent.title.toLowerCase().includes(m.category.toLowerCase()))
      );
      return matchName;
    });
  }, [medications, activeEvent]);

  // Find relevant allergies tied to the active condition
  const relevantAllergies = useMemo(() => {
    if (!activeEvent) return allergies;
    if (activeEvent.type === 'allergy') {
      return allergies.filter((a) =>
        activeEvent.title.toLowerCase().includes(a.allergen.toLowerCase()) ||
        a.allergen.toLowerCase().includes(activeEvent.shortLabel.toLowerCase())
      );
    }
    return [];
  }, [allergies, activeEvent]);

  return (
    <div className="bg-white border border-[#bec9c5]/80 rounded-2xl text-[#001f2a] shadow-sm overflow-hidden transition-all duration-200">
      
      {/* ========================================================= */}
      {/* 1. TOP UTILITY HEADER BAR (Plain English, No Fake Vitals) */}
      {/* ========================================================= */}
      <div className="bg-[#f8fbfb] px-4 py-2.5 border-b border-[#bec9c5]/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Smart AI Indicator */}
          <div className="flex items-center gap-2 bg-[#e6f6ff] border border-[#c9e7f7] px-3 py-1 rounded-full text-[#004f45]">
            <Sparkles className="w-3.5 h-3.5 text-[#00A87D]" />
            <span className="font-bold tracking-wide text-xs">
              AI Patient Priority Highlights
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-[#546067]">
            <span>Patient: <strong className="text-slate-900">{patient.name}</strong></span>
            <span>•</span>
            <span className="text-[#004f45] font-medium flex items-center gap-1">
              <Lock className="w-3 h-3 text-[#00A87D]" /> Private & Encrypted Record
            </span>
          </div>

          {/* Collapsed Fast Summary Chips */}
          {isCollapsed && (
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="bg-[#004f45] text-white text-[11px] px-2.5 py-0.5 rounded-full font-medium">
                Active Tab: {activeTab.label}
              </span>
              <span className="bg-slate-100 text-slate-700 text-[11px] px-2 py-0.5 rounded-full">
                Blood Group: {patient.bloodType}
              </span>
            </div>
          )}
        </div>

        {/* Expand/Collapse Button */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1.5 text-xs text-[#004f45] hover:text-[#003831] font-bold px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          {isCollapsed ? (
            <>
              <Maximize2 className="w-3.5 h-3.5 shrink-0" />
              <span>Show Focus Topics</span>
              <ChevronDown className="w-3.5 h-3.5 shrink-0" />
            </>
          ) : (
            <>
              <Minimize2 className="w-3.5 h-3.5 shrink-0" />
              <span>Hide Focus Topics</span>
              <ChevronUp className="w-3.5 h-3.5 shrink-0" />
            </>
          )}
        </button>
      </div>

      {/* ========================================================= */}
      {/* 2. DYNAMIC PATIENT TABS & INTERACTIVE INFORMATION VIEW */}
      {/* ========================================================= */}
      {!isCollapsed && (
        <div className="p-4 sm:p-5 space-y-4">
          
          {/* SECTION A: PATIENT-SPECIFIC PRIORITY TABS */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#004f45]" />
                  Select Health Condition or Past Procedure to View Details:
                </span>
              </div>
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                Tabs are customized for {patient.name}’s medical history
              </span>
            </div>

            {/* Dynamic Grid of Tabs (Changes dynamically per patient) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {patientTabs.map((item) => {
                const isSelected = activeTab.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectScope(item.id)}
                    className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-[#004f45] border-[#004f45] text-white shadow-md ring-2 ring-[#004f45] scale-[1.01]'
                        : `bg-white ${item.accentColor} text-slate-800 hover:bg-slate-50 shadow-2xs`
                    }`}
                  >
                    <div>
                      {/* Icon + Severity Badge */}
                      <div className="flex items-center justify-between gap-1.5 mb-1.5">
                        <div
                          className={`p-1.5 rounded-lg shrink-0 ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {item.icon}
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider truncate max-w-[120px] ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : item.badgeType === 'critical'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : item.badgeType === 'important'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : item.badgeType === 'high'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {item.badgeText}
                        </span>
                      </div>

                      {/* Tab Title */}
                      <div className="font-bold text-xs leading-tight line-clamp-1">{item.label}</div>
                      <div
                        className={`text-[10.5px] mt-0.5 line-clamp-1 ${
                          isSelected ? 'text-white/80' : 'text-slate-500'
                        }`}
                      >
                        {item.subtitle}
                      </div>
                    </div>

                    {/* Bottom Status Snippet */}
                    <div
                      className={`mt-2 pt-1.5 border-t text-[10px] font-medium leading-tight truncate ${
                        isSelected ? 'border-white/20 text-emerald-200' : 'border-slate-100 text-slate-500'
                      }`}
                    >
                      {item.keyMetric}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ========================================================= */}
          {/* SECTION B: DEDICATED INFORMATION PANEL FOR THE ACTIVE TAB */}
          {/* ========================================================= */}
          {activeEvent ? (
            /* --- SPECIFIC CONDITION / SURGERY / ALLERGY VIEW --- */
            <div className="bg-[#f0f9f8] border border-[#004f45]/20 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 animate-in fade-in duration-200">
              
              {/* Event Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#004f45]/15 pb-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-[#004f45] text-white rounded-xl shadow-xs shrink-0 mt-0.5">
                    {activeTab.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-serif font-bold text-base sm:text-lg text-[#001f2a]">
                        {activeEvent.title}
                      </h3>
                      <span className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-white border border-[#004f45]/30 text-[#004f45]">
                        {activeEvent.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-2">
                      <span className="font-semibold text-[#004f45]">{activeEvent.dateOrYear}</span>
                      <span>•</span>
                      <span>Documented for {patient.name}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span className="text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-lg">
                    Severity: <strong className="text-slate-800">{activeEvent.severity}</strong>
                  </span>
                </div>
              </div>

              {/* 3-Column Detail Cards for this Condition */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. What This Means (Summary) */}
                <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#004f45]" />
                    About This Condition
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {activeEvent.summary}
                  </p>
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    Verified from official patient discharge & diagnostic history.
                  </div>
                </div>

                {/* 2. Medicines & Treatments For This Condition */}
                <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5 text-[#004f45]" />
                    Prescriptions & Treatments
                  </span>
                  {activeEvent.relatedMedications && activeEvent.relatedMedications.length > 0 ? (
                    <div className="space-y-1.5">
                      {activeEvent.relatedMedications.map((med, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-50 border border-slate-200/80 rounded-lg p-2 text-xs flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-semibold text-slate-900">{med}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No active prescriptions required for this past event.</p>
                  )}
                </div>

                {/* 3. Official Lab / Medical Document Reference */}
                <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#004f45]" />
                    Verified Medical Record
                  </span>
                  <div className="bg-[#e6f6ff] border border-[#c9e7f7] rounded-lg p-3 text-xs space-y-1">
                    <span className="font-bold text-[#004f45] block">
                      {activeEvent.relatedLabOrDocument || 'Verified Electronic Health Record'}
                    </span>
                    <p className="text-[11px] text-slate-600">
                      Digitized and verified on file with hospital provider.
                    </p>
                  </div>
                  <div className="text-[11px] text-slate-600 bg-amber-50 border border-amber-200 p-2 rounded-lg">
                    <strong>Doctor Instructions:</strong> {activeEvent.clinicalInstructions}
                  </div>
                </div>

              </div>

              {/* Special Action Alert if Allergy is Selected */}
              {activeEvent.type === 'allergy' && hasContraindication && (
                <div className="bg-rose-50 border-2 border-rose-400 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-rose-900 text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      <strong>Prescription Warning:</strong> An active conflict exists with this allergy. Please select a safe replacement.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onViewAlternatives}
                    className="bg-[#ba1a1a] hover:bg-[#93000a] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs cursor-pointer shrink-0"
                  >
                    <span>View Safe Replacement Medicines</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

            </div>
          ) : (
            /* --- DEFAULT 'ALL RECORDS' SUMMARY VIEW --- */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
              
              {/* CARD 1: SEVERE WARNINGS & BLOOD TYPE */}
              <div className="bg-white border border-rose-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="inline-flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Documented Allergies</span>
                    </div>
                    <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {allergies.length} Recorded
                    </span>
                  </div>

                  <div className="space-y-2">
                    {allergies.slice(0, 2).map((alg) => (
                      <div
                        key={alg.id}
                        className={`p-2.5 rounded-xl border text-xs ${
                          alg.severity === 'Severe'
                            ? 'bg-rose-50 border-rose-200'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <strong className={alg.severity === 'Severe' ? 'text-rose-900' : 'text-slate-900'}>
                            {alg.allergen}
                          </strong>
                          <span
                            className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded uppercase ${
                              alg.severity === 'Severe'
                                ? 'bg-rose-200 text-rose-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {alg.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                          {alg.reactionDetails}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Blood Group */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 flex items-center justify-between text-xs mt-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-500 font-medium">Blood Group:</span>
                    <span className="font-bold text-slate-900 font-mono text-xs">{patient.bloodType}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                    {patient.bloodType === 'O-Negative' ? 'Universal Donor' : 'Standard'}
                  </span>
                </div>
              </div>

              {/* CARD 2: CURRENT ACTIVE PRESCRIPTIONS */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs uppercase tracking-wider">
                      <Pill className="w-4 h-4 text-[#004f45]" />
                      <span>Active Prescriptions</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                      {medications.length} Medicines
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {medications.slice(0, 3).map((med) => (
                      <div
                        key={med.id}
                        className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 flex items-center justify-between"
                      >
                        <div>
                          <strong className="text-slate-900 font-semibold block text-xs">
                            {med.name} {med.dosage}
                          </strong>
                          <span className="text-[10px] text-slate-500">{med.category}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-[#004f45] bg-[#e6f6ff] border border-[#c9e7f7] px-2 py-0.5 rounded">
                          {med.frequency.split(' ')[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-slate-500 text-center bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                  Select a condition tab above to filter medications by specific illness.
                </div>
              </div>

              {/* CARD 3: MEDICINE SAFETY CHECK */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Drug Safety Check</span>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Automated
                    </span>
                  </div>

                  {hasContraindication ? (
                    <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-3 mb-2 space-y-2">
                      <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Prescription Warning Found</span>
                      </div>
                      <p className="text-[11px] text-amber-900 leading-snug">
                        A conflict was detected with this patient’s allergy records. Please check the recommended safe alternatives.
                      </p>
                      <button
                        type="button"
                        onClick={onViewAlternatives}
                        className="w-full bg-[#ba1a1a] hover:bg-[#93000a] text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <span>Pick Safe Replacement Medicine</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center space-y-1 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                      <span className="text-xs font-bold text-emerald-900 block">
                        All Prescriptions Safe to Take
                      </span>
                      <span className="text-[11px] text-emerald-700">No harmful drug-allergy conflicts detected</span>
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  Patient Health Records synchronized with electronic health provider.
                </div>
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
};
