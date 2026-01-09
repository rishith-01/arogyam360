'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'framer-motion';
import { FiPackage, FiAlertTriangle, FiCheckCircle, FiX } from 'react-icons/fi';
import api from '@/lib/api';

export default function MedicationsPage() {
  const { user, userProfile } = useAuth();
  const [medications, setMedications] = useState<string[]>(['']);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientMedications, setPatientMedications] = useState<string[]>([]);
  const [showAddMedication, setShowAddMedication] = useState(false);

  const isDoctor = userProfile?.role === 'doctor';

  useEffect(() => {
    if (isDoctor) {
      fetchPatients();
    } else {
      fetchPatientMedications();
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

  const fetchPatientMedications = async () => {
    try {
      const medications = userProfile?.medicalHistory?.medications || [];
      setPatientMedications(medications);
    } catch (error) {
      console.error('Error fetching medications:', error);
    }
  };

  const addMedication = () => {
    setMedications([...medications, '']);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, value: string) => {
    const updated = [...medications];
    updated[index] = value;
    setMedications(updated);
  };

  const saveMedicationsForPatient = async () => {
    if (!selectedPatientId) {
      alert('Please select a patient');
      return;
    }

    const validMeds = medications.filter((m) => m.trim() !== '');
    if (validMeds.length === 0) {
      alert('Please enter at least one medication');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/medications/save-for-patient', {
        patientId: selectedPatientId,
        medications: validMeds,
      });
      alert('Medications saved successfully');
      setShowAddMedication(false);
      setMedications(['']);
      setSelectedPatientId('');
      setResults(response.data);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error saving medications');
    } finally {
      setLoading(false);
    }
  };

  const checkInteractions = async () => {
    const validMeds = medications.filter((m) => m.trim() !== '');
    if (validMeds.length < 2) {
      alert('Please enter at least 2 medications');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/medications/check-interactions', {
        medications: validMeds,
      });
      setResults(response.data);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error checking interactions');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'major':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'minor':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
            {isDoctor ? 'Manage Patient Medications' : 'My Medications'}
          </h1>
          {isDoctor && (
            <button
              onClick={() => setShowAddMedication(!showAddMedication)}
              className="bg-primary-600 dark:bg-primary-500 text-white px-6 py-2.5 rounded-xl hover:bg-primary-700 dark:hover:bg-primary-400 font-bold shadow-lg shadow-primary-200 dark:shadow-none transition-all hover:-translate-y-0.5"
            >
              Add Medications for Patient
            </button>
          )}
        </div>

        {isDoctor && showAddMedication && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 md:p-8 mb-8"
          >
            <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-slate-100">Add Medications for Patient</h2>
            <div className="space-y-6">
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
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-slate-100">Medications:</h3>
                {medications.map((med, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-1 relative">
                      <FiPackage className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={med}
                        onChange={(e) => updateMedication(index, e.target.value)}
                        placeholder="e.g., Metformin, Aspirin"
                        className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium"
                      />
                    </div>
                    {medications.length > 1 && (
                      <button
                        onClick={() => removeMedication(index)}
                        className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                      >
                        <FiX />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addMedication}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-bold flex items-center gap-1"
                >
                  <FiCheckCircle className="w-4 h-4" /> Add Another Medication
                </button>
              </div>
              <button
                onClick={saveMedicationsForPatient}
                disabled={loading || !selectedPatientId}
                className="w-full bg-primary-600 dark:bg-primary-500 text-white py-3 rounded-xl font-bold hover:bg-primary-700 dark:hover:bg-primary-400 disabled:opacity-50 transition-all shadow-lg shadow-primary-200 dark:shadow-none"
              >
                {loading ? 'Saving...' : 'Save Medications'}
              </button>
            </div>
          </motion.div>
        )}

        {!isDoctor && (
          <div className="glass-card p-6 md:p-8 mb-8">
            <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-slate-100">Your Current Medications</h2>
            {patientMedications.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 italic">No medications prescribed yet. Please consult your doctor.</p>
            ) : (
              <div className="space-y-3">
                {patientMedications.map((med, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 rounded-xl">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                      <FiPackage className="text-primary-600 dark:text-primary-400 w-5 h-5" />
                    </div>
                    <span className="text-slate-900 dark:text-slate-100 font-medium">{med}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {isDoctor && (
          <div className="glass-card p-6 md:p-8 mb-8">
            <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-slate-100">Check Drug Interactions</h2>
            <div className="space-y-4">
              {medications.map((med, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-1 relative">
                    <FiPackage className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={med}
                      onChange={(e) => updateMedication(index, e.target.value)}
                      placeholder="e.g., Metformin, Aspirin"
                      className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium"
                    />
                  </div>
                  {medications.length > 1 && (
                    <button
                      onClick={() => removeMedication(index)}
                      className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                    >
                      <FiX />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addMedication}
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-bold flex items-center gap-1"
              >
                <FiCheckCircle className="w-4 h-4" /> Add Another Medication
              </button>
            </div>

            <button
              onClick={checkInteractions}
              disabled={loading || medications.filter((m) => m.trim()).length < 2}
              className="mt-8 w-full bg-primary-600 dark:bg-primary-500 text-white py-3 rounded-xl font-bold hover:bg-primary-700 dark:hover:bg-primary-400 disabled:opacity-50 transition-all shadow-lg shadow-primary-200 dark:shadow-none"
            >
              {loading ? 'Checking...' : 'Check Interactions'}
            </button>
          </div>
        )}

        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Interaction Results</h2>
              {(results.severity || 'none') === 'none' ? (
                <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <FiCheckCircle className="text-green-600 dark:text-green-400 w-5 h-5" />
                </div>
              ) : (
                <div className="p-1 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <FiAlertTriangle className="text-red-600 dark:text-red-400 w-5 h-5" />
                </div>
              )}
            </div>

            {(results.severity || 'none') === 'none' ? (
              <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-xl p-4 md:p-6">
                <p className="text-green-800 dark:text-green-300 font-medium">
                  ✓ No significant interactions found between your medications.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`border rounded-xl p-4 md:p-6 ${getSeverityColor(results.severity || 'none')}`}>
                  <p className="font-bold text-lg">
                    Overall Risk Level: {(results.severity || 'none').toUpperCase()}
                  </p>
                </div>

                {results.interactions && results.interactions.length > 0 ? (
                  results.interactions.map((interaction: any, idx: number) => (
                    <div
                      key={idx}
                      className={`border rounded-xl p-4 md:p-6 ${getSeverityColor(interaction.severity || 'none')}`}
                    >
                      <p className="font-bold mb-2">
                        {interaction.medication1 || 'Unknown'} + {interaction.medication2 || 'Unknown'}
                      </p>
                      <p className="text-sm opacity-90">{interaction.description || 'No description available'}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 dark:text-slate-400">No interactions found</p>
                )}

                {results.recommendations && (
                  <div className="mt-6">
                    <h3 className="font-bold mb-3 text-slate-900 dark:text-slate-100">Recommendations:</h3>
                    <ul className="list-disc list-inside space-y-2">
                      {results.recommendations.map((rec: any, idx: number) => (
                        <li key={idx} className="text-sm text-slate-700 dark:text-slate-300">
                          {rec.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl">
              <p className="text-sm text-amber-800 dark:text-amber-400 font-medium">
                ⚠️ This is for informational purposes only. Always consult your doctor before
                making any changes to your medications.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

