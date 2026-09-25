// Clinical Decision Support System: Pharmacology Classification, Cross-Reactivity & Drug-Drug Interaction Engine

export interface DrugAlternative {
  name: string;
  dosage: string;
  category: string;
  coverage: string;
  advantages: string;
}

export interface DrugClassInfo {
  genericClass: string;
  crossReactiveAllergenKeys: string[]; // e.g. ['penicillin', 'beta-lactam']
  severity: 'Severe' | 'Moderate' | 'Mild';
  clinicalMechanism: string;
  suggestedAlternatives: DrugAlternative[];
}

export interface DrugDrugRule {
  drug1Keys: string[];
  drug2Keys: string[];
  interactionTitle: string;
  severity: 'Severe' | 'Moderate' | 'Mild';
  clinicalMechanism: string;
  suggestedAlternatives: DrugAlternative[];
}

// -------------------------------------------------------------
// 1. DRUG-ALLERGY CROSS-REACTIVITY RULES
// -------------------------------------------------------------
export const DRUG_CROSS_REACTIVITY_RULES: Record<string, DrugClassInfo> = {
  amoxicillin: {
    genericClass: 'Beta-Lactam Antibiotic (Aminopenicillin)',
    crossReactiveAllergenKeys: ['penicillin', 'amoxicillin', 'beta-lactam', 'ampicillin'],
    severity: 'Severe',
    clinicalMechanism:
      'Contains 4-membered Beta-Lactam ring structure with high risk of IgE-mediated anaphylaxis in penicillin-allergic patients.',
    suggestedAlternatives: [
      {
        name: 'Azithromycin (Zithromax)',
        dosage: '500mg Day 1, then 250mg Days 2-5 (adjust if CrCl < 30)',
        category: 'Macrolide Antibiotic',
        coverage: 'Atypical respiratory pathogens, Gram-positive cocci',
        advantages: 'Zero cross-reactivity with Beta-Lactam / Penicillin allergy',
      },
      {
        name: 'Doxycycline Hyclate',
        dosage: '100mg orally twice daily for 7-10 days',
        category: 'Tetracycline Class',
        coverage: 'Broad spectrum, MRSA, atypicals, non-gonococcal infections',
        advantages: 'Zero Beta-Lactam ring structure, safe in penicillin allergy',
      },
      {
        name: 'Levofloxacin',
        dosage: '500mg orally once daily (dosage adjustment required in renal impairment)',
        category: 'Fluoroquinolone',
        coverage: 'Pseudomonas, Gram-negative bacilli, Streptococcus pneumoniae',
        advantages: 'Reserve for complicated respiratory tract infections',
      },
    ],
  },
  ampicillin: {
    genericClass: 'Beta-Lactam Antibiotic (Aminopenicillin)',
    crossReactiveAllergenKeys: ['penicillin', 'amoxicillin', 'beta-lactam', 'ampicillin'],
    severity: 'Severe',
    clinicalMechanism: 'Full cross-allergenicity with Penicillin. Shares core thiazolidine ring and Beta-Lactam pharmacophore.',
    suggestedAlternatives: [
      {
        name: 'Azithromycin (Zithromax)',
        dosage: '500mg IV/Oral daily',
        category: 'Macrolide Antibiotic',
        coverage: 'Non-beta-lactam coverage',
        advantages: 'Completely safe in confirmed penicillin anaphylaxis',
      },
      {
        name: 'Vancomycin',
        dosage: '15-20 mg/kg IV q8-12h (monitor trough levels & renal function)',
        category: 'Glycopeptide',
        coverage: 'Gram-positive coverage including MRSA',
        advantages: 'No structural homology with beta-lactams',
      },
    ],
  },
  augmentin: {
    genericClass: 'Beta-Lactam + Beta-Lactamase Inhibitor (Amoxicillin/Clavulanate)',
    crossReactiveAllergenKeys: ['penicillin', 'amoxicillin', 'beta-lactam', 'augmentin', 'co-amoxiclav'],
    severity: 'Severe',
    clinicalMechanism: 'Amoxicillin component triggers severe anaphylactic cascade in penicillin-allergic individuals.',
    suggestedAlternatives: [
      {
        name: 'Ciprofloxacin + Metronidazole',
        dosage: '500mg / 500mg BID (adjust for renal clearance)',
        category: 'Fluoroquinolone + Nitroimidazole',
        coverage: 'Broad-spectrum intra-abdominal and anaerobic coverage',
        advantages: 'Safe in beta-lactam anaphylaxis',
      },
    ],
  },
  cephalexin: {
    genericClass: '1st Generation Cephalosporin (Beta-Lactam)',
    crossReactiveAllergenKeys: ['penicillin', 'cephalosporin', 'beta-lactam', 'keflex'],
    severity: 'Moderate',
    clinicalMechanism: 'Shares identical or similar R1 side chain with ampicillin; up to 5-10% cross-reactivity with penicillin.',
    suggestedAlternatives: [
      {
        name: 'Clindamycin',
        dosage: '300mg PO TID',
        category: 'Lincosamide',
        coverage: 'Gram-positive skin and soft tissue pathogens',
        advantages: 'Zero beta-lactam cross-reactivity',
      },
    ],
  },
  ibuprofen: {
    genericClass: 'Nonsteroidal Anti-inflammatory Drug (NSAID)',
    crossReactiveAllergenKeys: ['nsaid', 'aspirin', 'ibuprofen', 'naproxen', 'advil', 'motrin'],
    severity: 'Moderate',
    clinicalMechanism: 'Inhibits COX-1, shunting arachidonic acid into leukotriene pathway, inducing bronchospasm in NSAID-sensitive patients.',
    suggestedAlternatives: [
      {
        name: 'Acetaminophen (Tylenol / Paracetamol)',
        dosage: '500mg-1000mg q6h PRN (max 3000mg/24h, check hepatic status)',
        category: 'Non-Opioid Analgesic / Antipyretic',
        coverage: 'Mild to moderate pain, fever',
        advantages: 'Does not inhibit peripheral COX-1; safe in aspirin/NSAID triad',
      },
      {
        name: 'Celecoxib',
        dosage: '100mg-200mg daily',
        category: 'Selective COX-2 Inhibitor',
        coverage: 'Inflammatory pain and arthritis',
        advantages: 'Selective COX-2 inhibition with low cross-reactivity in single-NSAID hypersensitivity',
      },
    ],
  },
  aspirin: {
    genericClass: 'Salicylate / Non-selective NSAID',
    crossReactiveAllergenKeys: ['aspirin', 'nsaid', 'salicylate', 'asa'],
    severity: 'Severe',
    clinicalMechanism: 'Irreversible COX-1 acetylation, precipitating AERD (Aspirin-Exacerbated Respiratory Disease).',
    suggestedAlternatives: [
      {
        name: 'Acetaminophen (Paracetamol)',
        dosage: '650mg PO q6h',
        category: 'Central Analgesic',
        coverage: 'Pain and fever control',
        advantages: 'Safe in AERD patients',
      },
    ],
  },
  lisinopril: {
    genericClass: 'Angiotensin-Converting Enzyme (ACE) Inhibitor',
    crossReactiveAllergenKeys: ['ace inhibitor', 'lisinopril', 'angioedema', 'enalapril', 'ramipril'],
    severity: 'Severe',
    clinicalMechanism: 'Bradykinin degradation blockage risking fatal laryngeal angioedema.',
    suggestedAlternatives: [
      {
        name: 'Losartan (Cozaar)',
        dosage: '50mg daily (monitor potassium & renal panel)',
        category: 'Angiotensin Receptor Blocker (ARB)',
        coverage: 'Hypertension, renal protection in diabetes',
        advantages: 'Minimal bradykinin accumulation; significantly lower incidence of angioedema',
      },
      {
        name: 'Amlodipine (Norvasc)',
        dosage: '5mg daily',
        category: 'Dihydropyridine Calcium Channel Blocker',
        coverage: 'Peripheral vasodilation, blood pressure control',
        advantages: 'Zero renin-angiotensin-bradykinin pathway involvement',
      },
    ],
  },
};

// -------------------------------------------------------------
// 2. CRITICAL DRUG-DRUG INTERACTION (DDI) RULES
// -------------------------------------------------------------
export const DRUG_DRUG_INTERACTIONS: DrugDrugRule[] = [
  {
    drug1Keys: ['sildenafil', 'viagra', 'revatio', 'tadalafil', 'cialis', 'vardenafil', 'levitra'],
    drug2Keys: ['nitroglycerin', 'nitro', 'nitrostat', 'isosorbide', 'isordil', 'imdur', 'monoket', 'nitroprusside'],
    interactionTitle: 'PDE-5 Inhibitor + Nitrate (Fatal Hypotension Risk)',
    severity: 'Severe',
    clinicalMechanism:
      'Co-administration of PDE-5 inhibitors with nitrates potentiates cyclic GMP accumulation, causing catastrophic, refractory systemic vasodilation, severe hypotension, myocardial infarction, and cardiovascular collapse.',
    suggestedAlternatives: [
      {
        name: 'Amlodipine (Norvasc)',
        dosage: '5-10mg daily',
        category: 'Calcium Channel Blocker (Anti-anginal / Antihypertensive)',
        coverage: 'Coronary and peripheral vasodilation',
        advantages: 'Safe non-nitrate anti-anginal regimen without cGMP hyperactivation',
      },
      {
        name: 'Ranolazine (Ranexa)',
        dosage: '500mg BID',
        category: 'Late Sodium Channel Inhibitor',
        coverage: 'Chronic stable angina pectoris',
        advantages: 'Does not affect hemodynamics or cyclic GMP; non-nitrate alternative for angina',
      },
    ],
  },
  {
    drug1Keys: ['warfarin', 'coumadin', 'apixaban', 'eliquis', 'rivaroxaban', 'xarelto', 'dabigatran', 'pradaxa'],
    drug2Keys: ['aspirin', 'ibuprofen', 'advil', 'motrin', 'naproxen', 'aleve', 'diclofenac', 'meloxicam'],
    interactionTitle: 'Anticoagulant + NSAID / Antiplatelet (Severe Hemorrhage)',
    severity: 'Severe',
    clinicalMechanism:
      'Combining therapeutic anticoagulation with NSAID-induced platelet inhibition and gastric mucosal injury dramatically increases the incidence of major gastrointestinal hemorrhage and intracranial bleeding.',
    suggestedAlternatives: [
      {
        name: 'Acetaminophen (Tylenol)',
        dosage: '500mg-1000mg q6h PRN (max 2-3g/day under anticoagulation)',
        category: 'Non-Opioid Analgesic',
        coverage: 'Pain and fever management',
        advantages: 'Zero antiplatelet effect; markedly lower gastrointestinal bleeding risk',
      },
      {
        name: 'Topical Lidocaine 5% Patch',
        dosage: '1 patch applied for 12h on, 12h off',
        category: 'Local Anesthetic',
        coverage: 'Localized musculoskeletal and neuropathic pain',
        advantages: 'Negligible systemic absorption; zero bleeding risk with anticoagulants',
      },
    ],
  },
  {
    drug1Keys: ['lisinopril', 'enalapril', 'ramipril', 'losartan', 'valsartan', 'candesartan'],
    drug2Keys: ['spironolactone', 'aldactone', 'eplerenone', 'triamterene', 'potassium chloride', 'k-dur'],
    interactionTitle: 'RAAS Inhibitor + Potassium-Sparing Diuretic / K+ Salt (Lethal Hyperkalemia)',
    severity: 'Severe',
    clinicalMechanism:
      'Combined aldosterone antagonism and ACE/ARB therapy suppresses potassium excretion, predisposing patients to rapid-onset hyperkalemia, peaked T-waves, ventricular arrhythmias, and cardiac arrest.',
    suggestedAlternatives: [
      {
        name: 'Furosemide (Lasix)',
        dosage: '20-40mg daily (monitor electrolytes)',
        category: 'Loop Diuretic',
        coverage: 'Volume overload and mild potassium elimination',
        advantages: 'Potassium-wasting profile prevents dangerous potassium accumulation',
      },
      {
        name: 'Hydrochlorothiazide (HCTZ)',
        dosage: '12.5-25mg daily',
        category: 'Thiazide Diuretic',
        coverage: 'Synergistic BP reduction with ACEi/ARBs without hyperkalemia risk',
        advantages: 'Promotes mild kaliuresis, neutralizing hyperkalemia risk',
      },
    ],
  },
  {
    drug1Keys: ['methotrexate', 'trexall'],
    drug2Keys: ['ibuprofen', 'aspirin', 'naproxen', 'diclofenac', 'indomethacin'],
    interactionTitle: 'Methotrexate + NSAID (Methotrexate Toxicity & Pancytopenia)',
    severity: 'Severe',
    clinicalMechanism:
      'NSAIDs inhibit renal tubular secretion of methotrexate and displace it from plasma albumin, causing severe methotrexate toxicity, acute renal shutdown, and life-threatening bone marrow aplasia.',
    suggestedAlternatives: [
      {
        name: 'Acetaminophen',
        dosage: '500-1000mg q6h PRN',
        category: 'Analgesic',
        coverage: 'Pain relief',
        advantages: 'No interference with methotrexate renal clearance or albumin binding',
      },
    ],
  },
  {
    drug1Keys: ['clopidogrel', 'plavix'],
    drug2Keys: ['omeprazole', 'prilosec', 'esomeprazole', 'nexium'],
    interactionTitle: 'Clopidogrel + Omeprazole (Reduced Antiplatelet / Stent Thrombosis)',
    severity: 'Moderate',
    clinicalMechanism:
      'Omeprazole competitively inhibits CYP2C19, significantly reducing the bioactivation of clopidogrel and increasing the risk of adverse cardiovascular ischemic events and stent thrombosis.',
    suggestedAlternatives: [
      {
        name: 'Pantoprazole (Protonix)',
        dosage: '40mg daily',
        category: 'PPI (Low CYP2C19 Affinity)',
        coverage: 'Gastroprotection in dual antiplatelet therapy',
        advantages: 'Minimal CYP2C19 inhibition; preserves clopidogrel antiplatelet efficacy',
      },
      {
        name: 'Famotidine (Pepcid)',
        dosage: '20-40mg daily',
        category: 'H2-Receptor Antagonist',
        coverage: 'Acid suppression and ulcer prophylaxis',
        advantages: 'Zero CYP2C19 interaction, entirely safe with clopidogrel',
      },
    ],
  },
];

export interface ActiveConflict {
  id: string;
  conflictType: 'drug-allergy' | 'drug-drug';
  medicationName: string;
  allergenName?: string;
  secondMedicationName?: string;
  severity: 'Severe' | 'Moderate' | 'Mild';
  mechanism: string;
  rule: DrugClassInfo;
}

/**
 * Evaluates active medications for:
 * 1. Drug-Allergy contraindications (cross-reactivity)
 * 2. Drug-Drug lethal/critical interactions (e.g. Sildenafil + Nitroglycerin)
 */
export function detectContraindications(
  medications: { name: string; genericName?: string; category?: string }[],
  allergies: { allergen: string; severity: string }[]
): ActiveConflict[] {
  const conflicts: ActiveConflict[] = [];

  // 1. DRUG-ALLERGY CHECK
  for (const med of medications) {
    const medLower = (med.name || '').toLowerCase();
    const genericLower = (med.genericName || '').toLowerCase();

    for (const [ruleKey, rule] of Object.entries(DRUG_CROSS_REACTIVITY_RULES)) {
      if (medLower.includes(ruleKey) || genericLower.includes(ruleKey)) {
        for (const alg of allergies) {
          const algLower = (alg.allergen || '').toLowerCase();
          const isConflict = rule.crossReactiveAllergenKeys.some((k) => algLower.includes(k));

          if (isConflict) {
            conflicts.push({
              id: `allergy-${med.name}-${alg.allergen}`,
              conflictType: 'drug-allergy',
              medicationName: med.name,
              allergenName: alg.allergen,
              severity: rule.severity,
              mechanism: rule.clinicalMechanism,
              rule,
            });
          }
        }
      }
    }
  }

  // 2. DRUG-DRUG INTERACTION CHECK
  for (let i = 0; i < medications.length; i++) {
    const med1 = medications[i];
    const m1Text = `${med1.name} ${med1.genericName || ''} ${med1.category || ''}`.toLowerCase();

    for (let j = i + 1; j < medications.length; j++) {
      const med2 = medications[j];
      const m2Text = `${med2.name} ${med2.genericName || ''} ${med2.category || ''}`.toLowerCase();

      for (const ddi of DRUG_DRUG_INTERACTIONS) {
        const matchesForward =
          ddi.drug1Keys.some((k) => m1Text.includes(k)) &&
          ddi.drug2Keys.some((k) => m2Text.includes(k));

        const matchesBackward =
          ddi.drug2Keys.some((k) => m1Text.includes(k)) &&
          ddi.drug1Keys.some((k) => m2Text.includes(k));

        if (matchesForward || matchesBackward) {
          conflicts.push({
            id: `ddi-${med1.name}-${med2.name}`,
            conflictType: 'drug-drug',
            medicationName: med1.name,
            secondMedicationName: med2.name,
            severity: ddi.severity,
            mechanism: ddi.clinicalMechanism,
            rule: {
              genericClass: ddi.interactionTitle,
              crossReactiveAllergenKeys: [],
              severity: ddi.severity,
              clinicalMechanism: ddi.clinicalMechanism,
              suggestedAlternatives: ddi.suggestedAlternatives,
            },
          });
        }
      }
    }
  }

  // Prioritize Severe conflicts first
  return conflicts.sort((a, b) => {
    if (a.severity === 'Severe' && b.severity !== 'Severe') return -1;
    if (b.severity === 'Severe' && a.severity !== 'Severe') return 1;
    return 0;
  });
}
