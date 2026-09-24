import React, { useState } from 'react';
import { PastVitalReading, PatientProfile } from '../../types';
import {
  HeartPulse,
  Plus,
  CalendarCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  X,
  Heart,
  ChevronDown,
  ChevronUp,
  Activity,
  Stethoscope,
  Info,
  SlidersHorizontal,
} from 'lucide-react';

interface PastBloodPressureHeartRateCardProps {
  patient: PatientProfile;
  pastReadings: PastVitalReading[];
  onAddReading?: (newReading: PastVitalReading) => void;
  className?: string;
}

export const PastBloodPressureHeartRateCard: React.FC<PastBloodPressureHeartRateCardProps> = ({
  patient,
  pastReadings,
  onAddReading,
  className = '',
}) => {
  const [filter, setFilter] = useState<'All' | 'Clinic' | 'Home'>('All');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedReading, setSelectedReading] = useState<PastVitalReading | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Form states for adding new reading
  const [systolic, setSystolic] = useState('120');
  const [diastolic, setDiastolic] = useState('80');
  const [heartRate, setHeartRate] = useState('72');
  const [checkDate, setCheckDate] = useState('2026-09-24');
  const [checkTime, setCheckTime] = useState('08:30 AM');
  const [source, setSource] = useState('Hospital Clinic Intake');
  const [contextNote, setContextNote] = useState('Routine clinical check');

  // Filter readings for current patient if patientId is present
  const patientLogs = pastReadings.filter((r) => !r.patientId || r.patientId === patient.id);
  const activeLogs = patientLogs.length > 0 ? patientLogs : pastReadings;

  const clinicCount = activeLogs.filter(
    (item) =>
      item.source.toLowerCase().includes('clinic') ||
      item.source.toLowerCase().includes('hospital') ||
      item.source.toLowerCase().includes('triage')
  ).length;

  const homeCount = activeLogs.filter(
    (item) =>
      item.source.toLowerCase().includes('home') ||
      item.source.toLowerCase().includes('cuff') ||
      item.source.toLowerCase().includes('watch') ||
      item.source.toLowerCase().includes('healthkit')
  ).length;

  const filteredLogs = activeLogs.filter((item) => {
    if (filter === 'Clinic') {
      return (
        item.source.toLowerCase().includes('clinic') ||
        item.source.toLowerCase().includes('hospital') ||
        item.source.toLowerCase().includes('triage')
      );
    }
    if (filter === 'Home') {
      return (
        item.source.toLowerCase().includes('home') ||
        item.source.toLowerCase().includes('cuff') ||
        item.source.toLowerCase().includes('watch') ||
        item.source.toLowerCase().includes('healthkit')
      );
    }
    return true;
  });

  const latest = activeLogs[0] || {
    bloodPressure: '120/80',
    systolic: 120,
    diastolic: 80,
    heartRate: 72,
    timestamp: 'Sep 24, 2026 • 08:30 AM',
    date: 'Sep 24, 2026',
    time: '08:30 AM',
    lastCheckedDate: 'Sep 24, 2026',
    bpStatus: 'Normal' as const,
    hrStatus: 'Normal' as const,
    source: 'Hospital Triage Telemetry',
    context: 'Resting baseline',
  };

  const handleSaveReading = (e: React.FormEvent) => {
    e.preventDefault();
    const sysNum = parseInt(systolic, 10) || 120;
    const diaNum = parseInt(diastolic, 10) || 80;
    const hrNum = parseInt(heartRate, 10) || 72;

    let bpStat: PastVitalReading['bpStatus'] = 'Normal';
    if (sysNum < 115 && diaNum < 75) bpStat = 'Optimal';
    else if (sysNum >= 130 || diaNum >= 85) bpStat = 'Elevated';
    else if (sysNum >= 140 || diaNum >= 90) bpStat = 'Caution';

    let hrStat: PastVitalReading['hrStatus'] = 'Normal';
    if (hrNum < 60) hrStat = 'Resting';
    else if (hrNum > 85) hrStat = 'Elevated';

    // Format human readable date
    let formattedDateLabel = checkDate;
    try {
      const parts = checkDate.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        formattedDateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    } catch {
      formattedDateLabel = checkDate;
    }

    const newEntry: PastVitalReading = {
      id: `bp-log-${Date.now()}`,
      patientId: patient.id,
      timestamp: `${formattedDateLabel} • ${checkTime}`,
      date: formattedDateLabel,
      time: checkTime,
      lastCheckedDate: formattedDateLabel,
      bloodPressure: `${sysNum}/${diaNum}`,
      systolic: sysNum,
      diastolic: diaNum,
      heartRate: hrNum,
      bpStatus: bpStat,
      hrStatus: hrStat,
      source: source || 'Clinical Check',
      context: contextNote || 'Doctor Recorded',
    };

    if (onAddReading) {
      onAddReading(newEntry);
    }
    setIsLogModalOpen(false);
  };

  return (
    <div className={`bg-white border border-[#bec9c5] rounded-xl p-4 shadow-2xs transition-all ${className}`}>
      {/* Header with Title, Actions, and Collapsible Toggle */}
      <div className="mb-3 border-b border-[#c9e7f7] pb-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-serif font-bold text-sm text-[#001f2a] flex items-center gap-2 min-w-0">
            <span className="flex items-center justify-center p-1 bg-[#e6f6ff] text-[#004f45] rounded-md shrink-0">
              <HeartPulse className="w-4 h-4 text-[#004f45] shrink-0" />
            </span>
            <span className="leading-snug">Past Blood Pressure & Heart Rate</span>
          </h3>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsLogModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#004f45] hover:bg-[#003831] text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer shrink-0"
              title="Record new Blood Pressure and Heart Beat reading"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>New</span>
            </button>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-lg text-xs font-semibold border border-slate-200 transition-all cursor-pointer shrink-0"
              title={isExpanded ? 'Collapse historical list' : 'Expand full history'}
            >
              <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              )}
            </button>
          </div>
        </div>

        {/* Sub-row: Records badge and Latest metadata aligned with the text rather than the icon */}
        <div className="flex items-center gap-2 mt-1.5 pl-8 flex-wrap">
          <span className="bg-[#004f45]/10 text-[#004f45] border border-[#004f45]/20 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono shrink-0">
            {activeLogs.length} Records
          </span>
          <span className="text-slate-300">•</span>
          <p className="text-[11px] text-[#546067]">
            Latest: <strong className="text-slate-900 font-semibold">{latest.bloodPressure} mmHg</strong> •{' '}
            <strong className="text-rose-600 font-semibold">{latest.heartRate} bpm</strong> •{' '}
            <span className="text-slate-600">{latest.lastCheckedDate || latest.date}</span>
          </p>
        </div>
      </div>

      {/* Collapsed View Box: Clean 2-tile metric display with separate timestamp & expand footer */}
      {!isExpanded ? (
        <div
          onClick={() => setIsExpanded(true)}
          className="bg-[#f8fbfd] hover:bg-[#f0f8fc] border border-[#c9e7f7] hover:border-[#004f45]/50 rounded-xl p-3.5 transition-all cursor-pointer group shadow-2xs"
        >
          {/* Top row: 2 dedicated metric tiles side-by-side */}
          <div className="grid grid-cols-2 gap-2.5 mb-3">
            {/* Metric 1: Blood Pressure */}
            <div className="bg-white border border-[#c9e7f7]/80 rounded-lg p-2.5 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#546067] tracking-wider block mb-1">
                  Blood Pressure
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-xl font-bold text-slate-900 leading-tight">
                    {latest.bloodPressure}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">mmHg</span>
                </div>
              </div>
              <div className="mt-2">
                <span
                  className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    latest.bpStatus === 'Optimal' || latest.bpStatus === 'Normal'
                      ? 'bg-emerald-100 text-emerald-800'
                      : latest.bpStatus === 'Elevated'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {latest.bpStatus}
                </span>
              </div>
            </div>

            {/* Metric 2: Heart Beat */}
            <div className="bg-white border border-[#c9e7f7]/80 rounded-lg p-2.5 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#546067] tracking-wider block mb-1">
                  Heart Beat
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-xl font-bold text-rose-600 flex items-center gap-1 leading-tight">
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 shrink-0" />
                    {latest.heartRate}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">bpm</span>
                </div>
              </div>
              <div className="mt-2">
                <span className="inline-block text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  {latest.hrStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom row: Verified Timestamp & Expand action */}
          <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-[#c9e7f7]">
            <div className="min-w-0 pr-1">
              <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 truncate">
                <CalendarCheck className="w-3.5 h-3.5 text-[#004f45] shrink-0" />
                <span className="truncate">{latest.lastCheckedDate || latest.date}</span>
                <span className="text-slate-400 font-normal shrink-0">•</span>
                <span className="text-slate-600 font-mono text-[11px] shrink-0">{latest.time}</span>
              </div>
              <div className="text-[11px] text-slate-500 truncate mt-0.5">
                {latest.source}
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs font-bold text-[#004f45] bg-[#e6f6ff] group-hover:bg-[#d6f0ff] px-2.5 py-1.5 rounded-lg shrink-0 transition-colors">
              <span>View All ({activeLogs.length})</span>
              <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
            </div>
          </div>
        </div>
      ) : (
        /* Expanded View: Filter tabs & responsive readings list */
        <div className="space-y-3">
          {/* Filter Segmented Controls */}
          <div className="flex items-center justify-between gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
            <div className="flex items-center gap-1 text-[11px] font-semibold flex-wrap">
              <button
                type="button"
                onClick={() => setFilter('All')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  filter === 'All'
                    ? 'bg-[#004f45] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                All ({activeLogs.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('Clinic')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  filter === 'Clinic'
                    ? 'bg-[#004f45] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Clinic ({clinicCount})
              </button>
              <button
                type="button"
                onClick={() => setFilter('Home')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  filter === 'Home'
                    ? 'bg-[#004f45] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Home ({homeCount})
              </button>
            </div>

            <span className="text-[11px] text-slate-500 font-mono shrink-0 hidden sm:inline">
              {filteredLogs.length} of {activeLogs.length}
            </span>
          </div>

          {/* Clean Card rows without horizontal overflow or overlapping */}
          <div className="space-y-2">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                onClick={() => setSelectedReading(log)}
                className="bg-white hover:bg-[#f4faff] border border-slate-200 hover:border-[#004f45]/50 rounded-xl p-3 transition-all cursor-pointer group shadow-2xs"
              >
                {/* Header line of the item: Date & Time, and Source badge */}
                <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2 min-w-0">
                    <CalendarCheck className="w-3.5 h-3.5 text-[#004f45] shrink-0" />
                    <span className="font-semibold text-xs text-slate-900 truncate">
                      {log.lastCheckedDate || log.date}
                    </span>
                    <span className="text-[10.5px] text-slate-500 font-mono shrink-0 flex items-center gap-0.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {log.time}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium truncate max-w-[140px] shrink-0">
                    {log.source}
                  </span>
                </div>

                {/* Vitals metrics row: Blood Pressure, Pulse, Status, Details */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {/* BP */}
                    <div>
                      <div className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wider">BP</div>
                      <div className="flex items-baseline gap-1">
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {log.bloodPressure}
                        </span>
                        <span className="text-[9.5px] text-slate-400 font-mono">mmHg</span>
                      </div>
                    </div>

                    {/* HR */}
                    <div className="border-l border-slate-200 pl-3">
                      <div className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wider">Pulse</div>
                      <div className="flex items-center gap-1 text-rose-600 font-bold font-mono text-sm">
                        <Heart className="w-3 h-3 fill-rose-500 text-rose-500 shrink-0" />
                        <span>{log.heartRate}</span>
                        <span className="text-[9.5px] text-slate-400 font-normal">bpm</span>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div className="border-l border-slate-200 pl-3 shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.bpStatus === 'Optimal'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.bpStatus === 'Normal'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : log.bpStatus === 'Elevated'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.bpStatus === 'Optimal' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {log.bpStatus === 'Normal' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {log.bpStatus === 'Elevated' && <TrendingUp className="w-3 h-3 text-amber-600" />}
                        {log.bpStatus === 'Caution' && <AlertCircle className="w-3 h-3 text-rose-600" />}
                        <span>{log.bpStatus}</span>
                      </span>
                    </div>
                  </div>

                  {/* Details Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedReading(log);
                    }}
                    className="text-xs font-semibold text-[#004f45] group-hover:bg-[#e6f6ff] px-2.5 py-1 rounded transition-colors shrink-0 cursor-pointer"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}

            {filteredLogs.length === 0 && (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-200">
                <Info className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-slate-700">No readings found in this filter</p>
                <button
                  type="button"
                  onClick={() => setFilter('All')}
                  className="mt-2 text-xs font-bold text-[#004f45] hover:underline"
                >
                  Show All Recordings
                </button>
              </div>
            )}
          </div>

          {/* Footer Collapse Action */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>Click any record to inspect clinical notes</span>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="inline-flex items-center gap-1 text-[#004f45] hover:text-[#001f2a] font-semibold hover:underline cursor-pointer"
            >
              <span>Collapse</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Modal: Record New Blood Pressure & Heart Rate */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#004f45] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-[#86efac]" />
                <h4 className="font-serif font-bold text-base">Record Blood Pressure & Heart Rate</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsLogModalOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg text-white/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReading} className="p-5 space-y-4">
              <div className="bg-[#f4faff] p-2.5 rounded-xl border border-[#c9e7f7] text-xs text-slate-700">
                Recording vitals entry for <strong className="text-[#001f2a]">{patient.name}</strong> ({patient.age}y, {patient.gender}).
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Date Checked
                  </label>
                  <input
                    type="date"
                    value={checkDate}
                    onChange={(e) => setCheckDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004f45]"
                  />
                  <span className="text-[10px] text-slate-500">Day examination was checked</span>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Time Checked
                  </label>
                  <input
                    type="text"
                    value={checkTime}
                    onChange={(e) => setCheckTime(e.target.value)}
                    placeholder="e.g. 08:30 AM"
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004f45]"
                  />
                  <span className="text-[10px] text-slate-500">Check timestamp</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Systolic (mmHg)
                  </label>
                  <input
                    type="number"
                    min="70"
                    max="240"
                    value={systolic}
                    onChange={(e) => setSystolic(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004f45]"
                    placeholder="120"
                  />
                  <span className="text-[10px] text-slate-500">Normal: 90 - 120</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Diastolic (mmHg)
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="140"
                    value={diastolic}
                    onChange={(e) => setDiastolic(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004f45]"
                    placeholder="80"
                  />
                  <span className="text-[10px] text-slate-500">Normal: 60 - 80</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Heart Beat / Pulse (bpm)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="40"
                    max="200"
                    value={heartRate}
                    onChange={(e) => setHeartRate(e.target.value)}
                    required
                    className="w-full px-3 py-2 pl-9 bg-white border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004f45]"
                    placeholder="72"
                  />
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500 absolute left-3 top-2.5" />
                </div>
                <span className="text-[10px] text-slate-500">Resting range: 60 - 85 bpm</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Recording Device / Source
                </label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004f45]"
                >
                  <option value="Hospital Clinic Intake">Hospital Clinic Intake</option>
                  <option value="Cardiology Specialist Cuff">Cardiology Specialist Cuff</option>
                  <option value="Emergency Triage Monitor">Emergency Triage Monitor</option>
                  <option value="Smart Home BP Cuff">Smart Home BP Cuff (Bluetooth)</option>
                  <option value="Apple Watch / HealthKit">Apple Watch / HealthKit Telemetry</option>
                  <option value="Patient Self-Log">Patient Self-Log</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Clinical Context / Notes
                </label>
                <input
                  type="text"
                  value={contextNote}
                  onChange={(e) => setContextNote(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004f45]"
                  placeholder="e.g. Morning fasting, post-medication check"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#004f45] hover:bg-[#003831] text-white rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  Save Reading
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Single Reading Details */}
      {selectedReading && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-[#004f45]" />
                <h4 className="font-serif font-bold text-sm text-slate-900">Recorded Reading Details</h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReading(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Blood Pressure</span>
                  <span className="font-mono text-xl font-bold text-slate-900">
                    {selectedReading.bloodPressure}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-1 font-mono">mmHg</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Heart Beat</span>
                  <span className="font-mono text-xl font-bold text-rose-600 flex items-center gap-1 justify-end">
                    <Heart className="w-4 h-4 fill-rose-500" />
                    {selectedReading.heartRate}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">bpm</span>
                </div>
              </div>

              <div className="text-xs space-y-1.5 text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Date Checked:</span>
                  <span className="font-bold text-[#004f45] flex items-center gap-1">
                    <CalendarCheck className="w-3.5 h-3.5 text-[#004f45]" />
                    {selectedReading.lastCheckedDate || selectedReading.date}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Time Checked:</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {selectedReading.time}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Recorded Timestamp:</span>
                  <span className="font-medium text-slate-700">{selectedReading.timestamp}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Blood Pressure Status:</span>
                  <span className="font-semibold text-emerald-700">{selectedReading.bpStatus}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Heart Rate Rhythm:</span>
                  <span className="font-semibold text-slate-800">{selectedReading.hrStatus}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Source:</span>
                  <span className="font-semibold text-slate-800">{selectedReading.source}</span>
                </div>
                {selectedReading.context && (
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Notes:</span>
                    <span className="font-semibold text-slate-800 italic">{selectedReading.context}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedReading(null)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
