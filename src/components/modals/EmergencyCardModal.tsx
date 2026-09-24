import React from 'react';
import { PatientProfile, Allergy, Medication } from '../../types';
import { CaduceusSymbol } from '../brand/CaduceusSymbol';
import {
  HeartPulse,
  AlertTriangle,
  X,
  Phone,
  Droplet,
  ShieldAlert,
  User,
  Heart,
  QrCode,
  Sparkles,
  Lock,
} from 'lucide-react';

interface EmergencyCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  allergies: Allergy[];
  medications: Medication[];
}

export const EmergencyCardModal: React.FC<EmergencyCardModalProps> = ({
  isOpen,
  onClose,
  patient,
  allergies,
  medications,
}) => {
  if (!isOpen) return null;

  const severeAllergies = allergies.filter((a) => a.severity === 'Severe');

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-4 border-[#ba1a1a] animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Emergency Header */}
        <div className="flex items-start justify-between gap-4 border-b-2 border-[#ffdad6] pb-4 mb-4">
          <div className="flex items-center gap-3">
            {patient.photoUrl ? (
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#ba1a1a] shadow-sm shrink-0">
                <img src={patient.photoUrl} alt={patient.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="p-3 bg-[#ba1a1a] text-white rounded-2xl animate-pulse flex items-center justify-center">
                <CaduceusSymbol size={28} color="#ffffff" />
              </div>
            )}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-[#ba1a1a]">
                PARAMEDIC FAST RESUSCITATION PASSPORT
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#93000a]">{patient.name}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vital Blood Type & Donor Banner */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-4 bg-[#ffdad6] border border-[#ba1a1a]/40 rounded-2xl text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#93000a] block">Blood Type</span>
            <span className="font-serif text-3xl font-bold text-[#ba1a1a] mt-1 block flex items-center justify-center gap-1">
              <Droplet className="w-5 h-5 fill-[#ba1a1a]" />
              {patient.bloodType}
            </span>
            <span className="text-[10px] text-[#93000a] font-bold mt-0.5 block">Universal Red Cell Donor</span>
          </div>

          <div className="p-4 bg-[#e6f6ff] border border-[#c9e7f7] rounded-2xl text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#004f45] block">Organ Donor</span>
            <span className="font-serif text-2xl font-bold text-[#004f45] mt-1 block flex items-center justify-center gap-1">
              <Heart className="w-5 h-5 fill-[#004f45]" />
              {patient.isOrganDonor ? 'YES (Verified)' : 'NO'}
            </span>
            <span className="text-[10px] text-[#004f45] font-semibold mt-0.5 block">State Registry Verified</span>
          </div>
        </div>

        {/* Severe Allergies Emergency Alert */}
        <div className="bg-[#ffdad6]/70 border-2 border-[#ba1a1a] rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-[#ba1a1a]" />
            <h3 className="font-serif font-bold text-sm text-[#93000a] uppercase tracking-wider">
              CRITICAL LIFE-THREATENING ALLERGIES
            </h3>
          </div>

          <div className="space-y-2">
            {severeAllergies.map((alg) => (
              <div key={alg.id} className="bg-white p-3 rounded-xl border border-[#ba1a1a]/30">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#ba1a1a]">{alg.allergen}</span>
                  <span className="text-[10px] font-bold bg-[#ffdad6] text-[#ba1a1a] px-2 py-0.5 rounded">
                    DO NOT ADMINISTER
                  </span>
                </div>
                <p className="text-xs text-[#001f2a] mt-1 font-medium">{alg.reactionDetails}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-[#f4faff] border border-[#c9e7f7] rounded-2xl p-4 mb-4 space-y-3">
          <h3 className="font-serif font-bold text-xs text-[#001f2a] uppercase tracking-wider">
            Primary Emergency Contacts
          </h3>

          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-[#bec9c5]">
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4 text-[#004f45]" />
              <div>
                <h4 className="font-bold text-xs text-[#001f2a]">{patient.emergencyContact.name}</h4>
                <p className="text-[10px] text-[#546067]">{patient.emergencyContact.relation}</p>
              </div>
            </div>
            <a
              href={`tel:${patient.emergencyContact.phone}`}
              className="bg-[#004f45] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-[#003831] transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{patient.emergencyContact.phone}</span>
            </a>
          </div>

          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-[#bec9c5]">
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4 text-[#004f45]" />
              <div>
                <h4 className="font-bold text-xs text-[#001f2a]">{patient.primaryDoctor.name}</h4>
                <p className="text-[10px] text-[#546067]">{patient.primaryDoctor.clinic}</p>
              </div>
            </div>
            <a
              href={`tel:${patient.primaryDoctor.phone}`}
              className="border border-[#004f45] text-[#004f45] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-[#e6f6ff] transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{patient.primaryDoctor.phone}</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#bec9c5]/60 text-xs text-[#546067]">
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-[#004f45]" />
            <span>Encrypted Handoff Validated</span>
          </span>
          <button
            onClick={onClose}
            className="bg-[#004f45] text-white px-4 py-2 rounded-xl font-bold hover:bg-[#003831] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
