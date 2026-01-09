'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiCalendar, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';
import api from '@/lib/api';

export default function NutritionPage() {
  const { userProfile } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [showGenerate, setShowGenerate] = useState(false);
  const [condition, setCondition] = useState('general');
  const [dietType, setDietType] = useState('vegetarian');
  const [targetCalories, setTargetCalories] = useState('');
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');

  const isDoctor = userProfile?.role === 'doctor';

  useEffect(() => {
    fetchPlans();
    if (isDoctor) {
      fetchPatients();
    }
  }, [isDoctor]);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/reports/patients');
      setPatients(response.data.patients || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await api.get('/nutrition');
      setPlans(response.data.plans || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const generatePlan = async () => {
    if (isDoctor && !selectedPatientId) {
      alert('Please select a patient');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/nutrition/generate', {
        condition,
        dietType,
        targetCalories: targetCalories ? parseInt(targetCalories) : undefined,
        patientId: isDoctor ? selectedPatientId : undefined,
      });
      // Ensure the plan has an id field (backend returns planId)
      const newPlan = {
        ...response.data,
        id: response.data.planId || response.data.id,
      };
      setPlans([newPlan, ...plans]);
      setShowGenerate(false);
      setCondition('general');
      setDietType('vegetarian');
      setTargetCalories('');
      setSelectedPatientId('');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error generating plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
            {isDoctor ? 'Manage Patient Nutrition Plans' : 'My Nutrition Plans'}
          </h1>
          {isDoctor && (
            <button
              onClick={() => setShowGenerate(!showGenerate)}
              className="bg-primary-600 dark:bg-primary-500 text-white px-6 py-2.5 rounded-xl hover:bg-primary-700 dark:hover:bg-primary-400 font-bold shadow-lg shadow-primary-200 dark:shadow-none transition-all hover:-translate-y-0.5"
            >
              Create Plan for Patient
            </button>
          )}
        </div>

        {showGenerate && isDoctor && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 md:p-8 mb-8"
          >
            <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <FiTrendingUp className="text-primary-500" />
              Create Nutrition Plan
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Select Patient *
                  </label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium appearance-none"
                    required
                  >
                    <option value="">Choose a patient...</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name || patient.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Health Condition
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium appearance-none"
                  >
                    <option value="general">General Health</option>
                    <option value="diabetes">Diabetes</option>
                    <option value="hypertension">Hypertension</option>
                    <option value="anemia">Anemia</option>
                    <option value="obesity">Weight Management</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Diet Type
                  </label>
                  <select
                    value={dietType}
                    onChange={(e) => setDietType(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium appearance-none"
                  >
                    <option value="vegetarian">Vegetarian</option>
                    <option value="nonVegetarian">Non-Vegetarian</option>
                    <option value="vegan">Vegan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Target Calories (optional)
                  </label>
                  <input
                    type="number"
                    value={targetCalories}
                    onChange={(e) => setTargetCalories(e.target.value)}
                    placeholder="e.g., 2000"
                    className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium"
                  />
                </div>
              </div>
              <button
                onClick={generatePlan}
                disabled={loading || !selectedPatientId}
                className="w-full bg-primary-600 dark:bg-primary-500 text-white py-3 rounded-xl font-bold hover:bg-primary-700 dark:hover:bg-primary-400 disabled:opacity-50 transition-all shadow-lg shadow-primary-200 dark:shadow-none"
              >
                {loading ? 'Generating...' : 'Create Plan'}
              </button>
            </div>
          </motion.div>
        )}

        {plans.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="bg-slate-100 dark:bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiShoppingBag className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">No nutrition plans yet</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {plans.map((plan, planIndex) => (
              <motion.div
                key={plan.id || plan.planId || `plan-${planIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 md:p-8"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {plan.condition.charAt(0).toUpperCase() + plan.condition.slice(1)} Plan
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mt-1">
                      {plan.dietType} • {plan.dailyMacros?.calories || 0} calories/day
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg text-sm font-bold shadow-sm">
                    {plan.duration} days
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 text-center border border-blue-100 dark:border-blue-900/20">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Carbs</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{plan.dailyMacros?.carbs || 0}g</p>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-xl p-4 text-center border border-emerald-100 dark:border-emerald-900/20">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Proteins</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
                      {plan.dailyMacros?.proteins || 0}g
                    </p>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-4 text-center border border-amber-100 dark:border-amber-900/20">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Fats</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{plan.dailyMacros?.fats || 0}g</p>
                  </div>
                </div>

                {plan.meals && Object.keys(plan.meals).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(plan.meals).map(([mealName, meal]: [string, any], mealIndex: number) => (
                      <div key={`${plan.id || plan.planId || 'plan'}-${mealName}-${mealIndex}`} className="border border-slate-200 dark:border-white/10 rounded-xl p-4 md:p-5 bg-slate-50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-slate-900 dark:text-slate-100 capitalize flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                            {mealName}
                          </h4>
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-md">
                            {meal?.time || 'N/A'} • {meal?.calories || 0} cal
                          </span>
                        </div>
                        <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300 space-y-1 font-medium pl-2">
                          {meal?.items?.map((item: string, idx: number) => (
                            <li key={`${mealName}-item-${idx}`}>{item}</li>
                          )) || []}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400 text-sm italic">No meal plan available</p>
                )}

                {plan.recommendations && plan.recommendations.length > 0 && (
                  <div className="mt-6 p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/20">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                      <FiCheckCircle className="text-indigo-500" /> Recommendations:
                    </h4>
                    <ul className="list-disc list-inside text-sm text-slate-700 dark:text-slate-300 font-medium space-y-1">
                      {plan.recommendations.map((rec: string, idx: number) => (
                        <li key={`${plan.id || plan.planId || 'plan'}-rec-${idx}`}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

