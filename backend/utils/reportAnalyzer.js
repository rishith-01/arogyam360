// Medical report analyzer - extracts biomarkers and risk levels
// This is a simplified version. In production, use ML models or specialized APIs

const BIOMARKER_PATTERNS = {
  // Blood tests
  hemoglobin: { pattern: /hemoglobin|hb|hgb/i, normalRange: { min: 12, max: 17.5 }, unit: 'g/dL' },
  rbc: { pattern: /red blood cells|rbc|erythrocytes/i, normalRange: { min: 4.5, max: 6.0 }, unit: 'million/μL' },
  wbc: { pattern: /white blood cells|wbc|leukocytes/i, normalRange: { min: 4000, max: 11000 }, unit: '/μL' },
  platelets: { pattern: /platelets|plt/i, normalRange: { min: 150000, max: 450000 }, unit: '/μL' },
  glucose: { pattern: /glucose|blood sugar|bs/i, normalRange: { min: 70, max: 100 }, unit: 'mg/dL' },
  hba1c: { pattern: /hba1c|glycated hemoglobin|a1c/i, normalRange: { min: 4, max: 5.6 }, unit: '%' },
  cholesterol: { pattern: /total cholesterol|cholesterol/i, normalRange: { min: 0, max: 200 }, unit: 'mg/dL' },
  ldl: { pattern: /ldl|low density lipoprotein/i, normalRange: { min: 0, max: 100 }, unit: 'mg/dL' },
  hdl: { pattern: /hdl|high density lipoprotein/i, normalRange: { min: 40, max: 1000 }, unit: 'mg/dL' },
  triglycerides: { pattern: /triglycerides|tg/i, normalRange: { min: 0, max: 150 }, unit: 'mg/dL' },
  creatinine: { pattern: /creatinine/i, normalRange: { min: 0.6, max: 1.2 }, unit: 'mg/dL' },
  bun: { pattern: /blood urea nitrogen|bun/i, normalRange: { min: 7, max: 20 }, unit: 'mg/dL' },
  alt: { pattern: /alt|alanine aminotransferase|sgpt/i, normalRange: { min: 7, max: 56 }, unit: 'U/L' },
  ast: { pattern: /ast|aspartate aminotransferase|sgot/i, normalRange: { min: 10, max: 40 }, unit: 'U/L' },
  tsh: { pattern: /tsh|thyroid stimulating hormone/i, normalRange: { min: 0.4, max: 4.0 }, unit: 'mIU/L' },
  t3: { pattern: /t3|triiodothyronine/i, normalRange: { min: 80, max: 200 }, unit: 'ng/dL' },
  t4: { pattern: /t4|thyroxine/i, normalRange: { min: 4.5, max: 12.0 }, unit: 'μg/dL' },
  vitaminD: { pattern: /vitamin d|25-oh vitamin d/i, normalRange: { min: 30, max: 100 }, unit: 'ng/mL' },
  vitaminB12: { pattern: /vitamin b12|b12|cyanocobalamin/i, normalRange: { min: 200, max: 900 }, unit: 'pg/mL' },
  ferritin: { pattern: /ferritin/i, normalRange: { min: 15, max: 200 }, unit: 'ng/mL' },
};

export function analyzeReportText(text) {
  const biomarkers = [];
  const lines = text.split('\n');

  for (const [key, config] of Object.entries(BIOMARKER_PATTERNS)) {
    for (const line of lines) {
      if (config.pattern.test(line)) {
        // Extract numeric value
        const valueMatch = line.match(/(\d+\.?\d*)/);
        if (valueMatch) {
          const value = parseFloat(valueMatch[1]);
          const { min, max } = config.normalRange;
          let riskLevel = 'normal';
          let interpretation = '';

          if (value < min) {
            riskLevel = 'low';
            interpretation = `Below normal range. May indicate deficiency or underlying condition.`;
          } else if (value > max) {
            riskLevel = 'high';
            interpretation = `Above normal range. May indicate excess or underlying condition.`;
          } else {
            interpretation = `Within normal range.`;
          }

          biomarkers.push({
            name: key,
            displayName: key.toUpperCase(),
            value,
            unit: config.unit,
            normalRange: { min, max },
            riskLevel,
            interpretation,
          });
          break;
        }
      }
    }
  }

  return biomarkers;
}

export function getOverallRiskLevel(biomarkers) {
  const riskCounts = biomarkers.reduce((acc, b) => {
    acc[b.riskLevel] = (acc[b.riskLevel] || 0) + 1;
    return acc;
  }, {});

  if (riskCounts.high > 2 || riskCounts.low > 2) {
    return 'high';
  }
  if (riskCounts.high > 0 || riskCounts.low > 0) {
    return 'moderate';
  }
  return 'normal';
}


