// Nutrition planner for Indian diet context
// Generates personalized meal plans based on conditions and preferences

const INDIAN_DIET_OPTIONS = {
  vegetarian: {
    proteins: ['dal', 'chana', 'rajma', 'paneer', 'tofu', 'soy chunks', 'nuts'],
    carbs: ['rice', 'roti', 'naan', 'paratha', 'idli', 'dosa', 'poha'],
    vegetables: ['sabzi', 'curry', 'salad', 'raita', 'pickle'],
    fats: ['ghee', 'oil', 'butter'],
  },
  nonVegetarian: {
    proteins: ['chicken', 'fish', 'eggs', 'mutton', 'dal', 'paneer'],
    carbs: ['rice', 'roti', 'naan', 'paratha'],
    vegetables: ['sabzi', 'curry', 'salad', 'raita'],
    fats: ['ghee', 'oil', 'butter'],
  },
  vegan: {
    proteins: ['dal', 'chana', 'rajma', 'tofu', 'soy chunks', 'nuts'],
    carbs: ['rice', 'roti', 'idli', 'dosa', 'poha'],
    vegetables: ['sabzi', 'curry', 'salad'],
    fats: ['oil'],
  },
};

const CONDITION_BASED_PLANS = {
  diabetes: {
    calories: { min: 1500, max: 2000 },
    carbs: { percentage: 45, focus: 'complex' },
    proteins: { percentage: 20 },
    fats: { percentage: 35 },
    restrictions: ['sugar', 'refined carbs', 'sweet fruits'],
    recommendations: ['high fiber', 'low GI foods', 'regular meals'],
  },
  hypertension: {
    calories: { min: 1800, max: 2200 },
    carbs: { percentage: 50 },
    proteins: { percentage: 18 },
    fats: { percentage: 32 },
    restrictions: ['salt', 'processed foods', 'alcohol'],
    recommendations: ['DASH diet principles', 'potassium rich', 'low sodium'],
  },
  anemia: {
    calories: { min: 2000, max: 2500 },
    carbs: { percentage: 50 },
    proteins: { percentage: 20 },
    fats: { percentage: 30 },
    restrictions: ['tea with meals', 'calcium with iron'],
    recommendations: ['iron rich foods', 'vitamin C', 'folate'],
  },
  obesity: {
    calories: { min: 1200, max: 1800 },
    carbs: { percentage: 40 },
    proteins: { percentage: 25 },
    fats: { percentage: 35 },
    restrictions: ['fried foods', 'sweets', 'processed'],
    recommendations: ['portion control', 'high protein', 'regular exercise'],
  },
  general: {
    calories: { min: 2000, max: 2500 },
    carbs: { percentage: 50 },
    proteins: { percentage: 20 },
    fats: { percentage: 30 },
    restrictions: [],
    recommendations: ['balanced diet', 'variety', 'hydration'],
  },
};

export function generateNutritionPlan(condition, dietType, preferences = {}) {
  const plan = CONDITION_BASED_PLANS[condition] || CONDITION_BASED_PLANS.general;
  const diet = INDIAN_DIET_OPTIONS[dietType] || INDIAN_DIET_OPTIONS.vegetarian;

  const targetCalories = preferences.targetCalories || 
    Math.floor((plan.calories.min + plan.calories.max) / 2);

  const dailyMacros = {
    calories: targetCalories,
    carbs: Math.round((targetCalories * plan.carbs.percentage) / 100 / 4), // grams
    proteins: Math.round((targetCalories * plan.proteins.percentage) / 100 / 4), // grams
    fats: Math.round((targetCalories * plan.fats.percentage) / 100 / 9), // grams
  };

  // Generate meal plan
  const meals = {
    breakfast: {
      time: '8:00 AM',
      items: generateMealItems('breakfast', diet, plan, dailyMacros.calories * 0.25),
      calories: Math.round(dailyMacros.calories * 0.25),
    },
    lunch: {
      time: '1:00 PM',
      items: generateMealItems('lunch', diet, plan, dailyMacros.calories * 0.35),
      calories: Math.round(dailyMacros.calories * 0.35),
    },
    snack: {
      time: '4:00 PM',
      items: generateMealItems('snack', diet, plan, dailyMacros.calories * 0.10),
      calories: Math.round(dailyMacros.calories * 0.10),
    },
    dinner: {
      time: '8:00 PM',
      items: generateMealItems('dinner', diet, plan, dailyMacros.calories * 0.30),
      calories: Math.round(dailyMacros.calories * 0.30),
    },
  };

  return {
    condition,
    dietType,
    dailyMacros,
    meals,
    restrictions: plan.restrictions,
    recommendations: plan.recommendations,
    duration: preferences.duration || 30, // days
    createdAt: new Date().toISOString(),
  };
}

function generateMealItems(mealType, diet, plan, targetCalories) {
  const items = [];

  if (mealType === 'breakfast') {
    items.push(`${diet.carbs[0]} (1 serving)`);
    items.push(`${diet.proteins[0]} curry (1 bowl)`);
    items.push('Vegetables');
  } else if (mealType === 'lunch') {
    items.push(`${diet.carbs[0]} (1.5 servings)`);
    items.push(`${diet.proteins[1]} curry (1.5 bowls)`);
    items.push(`${diet.vegetables[0]} (1 serving)`);
    items.push('Salad');
  } else if (mealType === 'snack') {
    items.push('Fruits');
    items.push('Nuts (handful)');
  } else if (mealType === 'dinner') {
    items.push(`${diet.carbs[0]} (1 serving)`);
    items.push(`${diet.proteins[0]} curry (1 bowl)`);
    items.push(`${diet.vegetables[0]} (1 serving)`);
  }

  return items;
}


