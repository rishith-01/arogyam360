// Drug interaction checker
// In production, integrate with APIs like DrugBank, RxNorm, or use ML models

const DRUG_INTERACTIONS = {
  // Common interactions
  'warfarin': {
    'aspirin': { severity: 'major', description: 'Increased risk of bleeding' },
    'ibuprofen': { severity: 'major', description: 'Increased risk of bleeding' },
    'alcohol': { severity: 'moderate', description: 'May increase bleeding risk' },
  },
  'metformin': {
    'alcohol': { severity: 'moderate', description: 'Risk of lactic acidosis' },
    'furosemide': { severity: 'moderate', description: 'May affect blood sugar control' },
  },
  'aspirin': {
    'ibuprofen': { severity: 'moderate', description: 'May reduce aspirin effectiveness' },
    'alcohol': { severity: 'moderate', description: 'Increased stomach bleeding risk' },
  },
  'atorvastatin': {
    'grapefruit': { severity: 'moderate', description: 'May increase statin levels' },
    'alcohol': { severity: 'minor', description: 'May increase liver risk' },
  },
  'lisinopril': {
    'potassium supplements': { severity: 'moderate', description: 'Risk of hyperkalemia' },
    'ibuprofen': { severity: 'moderate', description: 'May reduce blood pressure control' },
  },
};

export function checkDrugInteractions(medications) {
  const interactions = [];
  const normalizedMeds = medications.map(m => m.toLowerCase().trim());

  for (let i = 0; i < normalizedMeds.length; i++) {
    for (let j = i + 1; j < normalizedMeds.length; j++) {
      const med1 = normalizedMeds[i];
      const med2 = normalizedMeds[j];

      // Check both directions
      if (DRUG_INTERACTIONS[med1]?.[med2]) {
        interactions.push({
          medication1: medications[i],
          medication2: medications[j],
          ...DRUG_INTERACTIONS[med1][med2],
        });
      } else if (DRUG_INTERACTIONS[med2]?.[med1]) {
        interactions.push({
          medication1: medications[j],
          medication2: medications[i],
          ...DRUG_INTERACTIONS[med2][med1],
        });
      }
    }
  }

  return {
    hasInteractions: interactions.length > 0,
    interactions,
    severity: interactions.length > 0 
      ? interactions.some(i => i.severity === 'major') ? 'major' 
        : interactions.some(i => i.severity === 'moderate') ? 'moderate' 
        : 'minor'
      : 'none',
  };
}

export function getInteractionRecommendations(interactions) {
  const recommendations = [];

  interactions.forEach(interaction => {
    if (interaction.severity === 'major') {
      recommendations.push({
        type: 'warning',
        message: `⚠️ MAJOR INTERACTION: ${interaction.medication1} + ${interaction.medication2}. ${interaction.description}. Consult your doctor immediately.`,
      });
    } else if (interaction.severity === 'moderate') {
      recommendations.push({
        type: 'caution',
        message: `⚠️ MODERATE INTERACTION: ${interaction.medication1} + ${interaction.medication2}. ${interaction.description}. Monitor closely and consult your doctor.`,
      });
    } else {
      recommendations.push({
        type: 'info',
        message: `ℹ️ MINOR INTERACTION: ${interaction.medication1} + ${interaction.medication2}. ${interaction.description}.`,
      });
    }
  });

  return recommendations;
}


