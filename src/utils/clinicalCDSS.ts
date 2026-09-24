// Clinical Decision Support System: Pharmacology Classification & Contraindication Engine

export interface DrugClassInfo {
  genericClass: string;
  crossReactiveAllergenKeys: string[]; // e.g. ['penicillin', 'beta-lactam']
  severity: 'Severe' | 'Moderate' | 'Mild';
  clinicalMechanism: string;
  suggestedAlternatives: {
    name: string;
    dosage: string;
    category: string;
    coverage: string;
    advantages: string;
  }[];
}

// Medical dictionary of drug classes and cross-reactivity
export const DRUG_CROSS_REACTIVITY_RULES: Record<string, DrugClassInfo> = {
  amoxicillin: {
    genericClass: 'Beta-Lactam Antibiotic (Aminopenicillin)',
    crossReactiveAllergenKeys: ['penicillin', 'amoxicillin', 'beta-lactam', 'ampicillin'],
    severity: 'Severe',
    clinicalMechanism: 'Contains 4-membered Beta-Lactam ring structure with high risk of IgE-mediated anaphylaxis in penicillin-allergic patients.',
    suggestedAlternatives: [
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
        dosage: '15-20 mg/kg IV q8-12h',
        category: 'Glycopeptide',
        coverage: 'Gram-positive coverage including MRSA',
        advantages: 'No structural homology with beta-lactams',
      },
    ],
  },
  augmentin: {
    genericClass: 'Beta-Lactam + Beta-Lactamase Inhibitor (Amoxicillin/Clavulanate)',
    crossReactiveAllergenKeys: ['penicillin', 'amoxicillin', 'beta-lactam'],
    severity: 'Severe',
    clinicalMechanism: 'Amoxicillin component triggers severe anaphylactic cascade in penicillin-allergic individuals.',
    suggestedAlternatives: [
      {
        name: 'Ciprofloxacin + Metronidazole',
        dosage: '500mg / 500mg BID',
        category: 'Fluoroquinolone + Nitroimidazole',
        coverage: 'Broad-spectrum intra-abdominal and anaerobic coverage',
        advantages: 'Safe in beta-lactam anaphylaxis',
      },
    ],
  },
  cephalexin: {
    genericClass: '1st Generation Cephalosporin (Beta-Lactam)',
    crossReactiveAllergenKeys: ['penicillin', 'cephalosporin', 'beta-lactam'],
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
    crossReactiveAllergenKeys: ['nsaid', 'aspirin', 'ibuprofen', 'naproxen'],
    severity: 'Moderate',
    clinicalMechanism: 'Inhibits COX-1, shunting arachidonic acid into leukotriene pathway, inducing bronchospasm in NSAID-sensitive patients.',
    suggestedAlternatives: [
      {
        name: 'Acetaminophen (Tylenol)',
        dosage: '500mg-1000mg q6h PRN',
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
    crossReactiveAllergenKeys: ['aspirin', 'nsaid', 'salicylate'],
    severity: 'Severe',
    clinicalMechanism: 'Irreversible COX-1 acetylation, precipitating AERD (Aspirin-Exacerbated Respiratory Disease).',
    suggestedAlternatives: [
      {
        name: 'Acetaminophen',
        dosage: '650mg PO q6h',
        category: 'Central Analgesic',
        coverage: 'Pain and fever control',
        advantages: 'Safe in AERD patients',
      },
    ],
  },
  lisinopril: {
    genericClass: 'Angiotensin-Converting Enzyme (ACE) Inhibitor',
    crossReactiveAllergenKeys: ['ace inhibitor', 'lisinopril', 'angioedema'],
    severity: 'Severe',
    clinicalMechanism: 'Bradykinin accumulation risking fatal laryngeal angioedema.',
    suggestedAlternatives: [
      {
        name: 'Losartan (Cozaar)',
        dosage: '50mg daily',
        category: 'Angiotensin Receptor Blocker (ARB)',
        coverage: 'Hypertension, renal protection in diabetes',
        advantages: 'Minimal bradykinin effect; much lower incidence of angioedema',
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

export interface ActiveConflict {
  id: string;
  medicationName: string;
  allergenName: string;
  severity: 'Severe' | 'Moderate' | 'Mild';
  mechanism: string;
  rule: DrugClassInfo;
}

/**
 * Dynamically evaluates a patient's active medication list against their registered allergies.
 * Detects direct name matches as well as pharmacological class cross-reactivity.
 */
export function detectContraindications(
  medications: { name: string; genericName?: string; category?: string }[],
  allergies: { allergen: string; severity: string }[]
): ActiveConflict[] {
  const conflicts: ActiveConflict[] = [];

  for (const med of medications) {
    const medLower = (med.name || '').toLowerCase();
    const genericLower = (med.genericName || '').toLowerCase();

    // Check all rules
    for (const [ruleKey, rule] of Object.entries(DRUG_CROSS_REACTIVITY_RULES)) {
      if (medLower.includes(ruleKey) || genericLower.includes(ruleKey)) {
        // Check if patient has any matching allergy
        for (const alg of allergies) {
          const algLower = alg.allergen.toLowerCase();
          const isConflict = rule.crossReactiveAllergenKeys.some((k) => algLower.includes(k));

          if (isConflict) {
            conflicts.push({
              id: `${med.name}-${alg.allergen}`,
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

  return conflicts;
}
