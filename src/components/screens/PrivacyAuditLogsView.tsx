import React, { useState } from 'react';
import { AuditLogEvent, PatientProfile } from '../../types';
import {
  ShieldCheck,
  Lock,
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
  Search,
  Filter,
  Flame,
  KeyRound,
  Trash2,
} from 'lucide-react';

interface PrivacyAuditLogsViewProps {
  auditLogs: AuditLogEvent[];
  patient: PatientProfile;
}

export const PrivacyAuditLogsView: React.FC<PrivacyAuditLogsViewProps> = ({ auditLogs, patient }) => {
  const [filterType, setFilterType] = useState<string>('All');
  const [search, setSearch] = useState('');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesFilter =
      filterType === 'All' ||
      (filterType === 'Emergency' && log.isEmergency) ||
      log.eventType.toLowerCase().includes(filterType.toLowerCase());
    const matchesSearch =
      log.accessorName.toLowerCase().includes(search.toLowerCase()) ||
      log.facilityLocation.toLowerCase().includes(search.toLowerCase()) ||
      log.dataAccessed.some((d) => d.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-[calc(100vh-100px)] bg-[#f4faff] text-[#001f2a] pb-24">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6 flex flex-col gap-6">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#bec9c5] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#e6f6ff] text-[#004f45] rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-[#001f2a]">Privacy & Visit History</h1>
              <p className="text-xs text-[#546067] mt-0.5">
                A clear record showing who viewed <strong>{patient.name}</strong>'s medical chart, when they opened it, and confirmation that all data was wiped after their visit.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-[#10b981]/15 text-[#047857] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-[#10b981]/30">
              <CheckCircle2 className="w-4 h-4" />
              <span>Data Protection Active</span>
            </span>
          </div>
        </div>

        {/* Zero-Residual Retention Policy Card */}
        <div className="bg-[#e6f6ff] border border-[#c9e7f7] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-[#004f45] text-white rounded-xl mt-0.5">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-[#004f45]">Zero-Residual Data Retention Policy</h2>
              <p className="text-xs text-[#001f2a] mt-1 leading-relaxed max-w-3xl">
                All clinical records are transmitted via ephemeral ECDH end-to-end encryption. Data is decrypted purely
                into isolated browser RAM during the active session. When the timer expires or the session ends, private
                cryptographic keys are permanently overwritten, leaving zero residual cache on clinician hardware.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="p-2 bg-white rounded-xl border border-[#c9e7f7] text-center">
              <span className="text-[10px] font-bold text-[#546067] uppercase block">RAM Purge</span>
              <span className="text-xs font-mono font-bold text-[#047857]">100% Zero Trace</span>
            </div>
          </div>
        </div>

        {/* Key Metrics Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-[#bec9c5] rounded-xl p-4 shadow-2xs">
            <span className="text-[10px] font-bold text-[#546067] uppercase tracking-wider block">Total Sessions</span>
            <span className="font-serif text-2xl font-bold text-[#001f2a] mt-1 block">18</span>
            <span className="text-[10px] text-[#047857] font-medium mt-0.5 block">All verified logged</span>
          </div>

          <div className="bg-white border border-[#bec9c5] rounded-xl p-4 shadow-2xs">
            <span className="text-[10px] font-bold text-[#546067] uppercase tracking-wider block">RAM Purge Rate</span>
            <span className="font-serif text-2xl font-bold text-[#047857] mt-1 block">100%</span>
            <span className="text-[10px] text-[#047857] font-medium mt-0.5 block">Zero data leaks</span>
          </div>

          <div className="bg-white border border-[#bec9c5] rounded-xl p-4 shadow-2xs">
            <span className="text-[10px] font-bold text-[#546067] uppercase tracking-wider block">Emergency Overrides</span>
            <span className="font-serif text-2xl font-bold text-[#ba1a1a] mt-1 block">3</span>
            <span className="text-[10px] text-[#546067] font-medium mt-0.5 block">Paramedic handoffs</span>
          </div>

          <div className="bg-white border border-[#bec9c5] rounded-xl p-4 shadow-2xs">
            <span className="text-[10px] font-bold text-[#546067] uppercase tracking-wider block">Avg Session Time</span>
            <span className="font-serif text-2xl font-bold text-[#004f45] mt-1 block">12m 40s</span>
            <span className="text-[10px] text-[#546067] font-medium mt-0.5 block">Within 15m safe cap</span>
          </div>
        </div>

        {/* Filter and Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-[#bec9c5] rounded-xl p-3 shadow-2xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['All', 'Emergency', 'Clinical Review', 'Pharmacy'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterType === type
                    ? 'bg-[#004f45] text-white shadow-2xs'
                    : 'bg-[#f4faff] text-[#546067] hover:bg-[#e6f6ff] hover:text-[#001f2a]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search facility, doctor, data..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#f4faff] border border-[#bec9c5] rounded-lg text-xs outline-none focus:border-[#004f45]"
            />
          </div>
        </div>

        {/* Timeline Event Cards */}
        <div className="space-y-4">
          {filteredLogs.map((log) => {
            const isEmerg = log.isEmergency;
            return (
              <div
                key={log.id}
                className={`bg-white border rounded-2xl p-5 shadow-xs transition-all hover:shadow-md ${
                  isEmerg ? 'border-[#ba1a1a]/40 ring-1 ring-[#ba1a1a]/10' : 'border-[#bec9c5]'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`p-2.5 rounded-xl ${
                        isEmerg ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#e6f6ff] text-[#004f45]'
                      }`}
                    >
                      {isEmerg ? <Flame className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-serif text-lg font-bold text-[#001f2a]">{log.accessorName}</h3>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                            isEmerg ? 'bg-[#ba1a1a] text-white' : 'bg-[#004f45] text-white'
                          }`}
                        >
                          {log.eventType}
                        </span>
                      </div>

                      <p className="text-xs text-[#546067] mt-0.5">
                        {log.facilityLocation} • <strong className="text-[#001f2a]">{log.timestamp}</strong>
                      </p>

                      <div className="mt-3 p-3 bg-[#f4faff] border border-[#c9e7f7] rounded-xl">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#546067] block mb-1">
                          DATA OBJECTS DECRYPTED INTO RAM
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {log.dataAccessed.map((item, idx) => (
                            <span
                              key={idx}
                              className="bg-white border border-[#c9e7f7] text-[#001f2a] text-xs font-semibold px-2.5 py-0.5 rounded-md"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end justify-between self-stretch shrink-0 gap-3 border-t md:border-t-0 border-[#c9e7f7] pt-3 md:pt-0">
                    <div className="flex items-center gap-1.5 text-xs text-[#546067]">
                      <Clock className="w-3.5 h-3.5 text-[#004f45]" />
                      <span>Duration: <strong>{log.sessionDuration}</strong></span>
                    </div>

                    <div className="bg-[#f4faff] border border-[#c9e7f7] p-2.5 rounded-xl text-left md:text-right">
                      <span className="text-xs font-bold text-[#047857] flex items-center md:justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {log.securityStatus}
                      </span>
                      <span className="text-[10px] text-[#546067] font-mono block mt-0.5">{log.securityDetail}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
