'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'framer-motion';
import { FiVideo, FiCalendar, FiClock, FiExternalLink, FiX, FiCheckCircle, FiPackage } from 'react-icons/fi';
import api from '@/lib/api';

export default function ConsultationsPage() {
  const { user, userProfile } = useAuth();
  const [consultations, setConsultations] = useState<any[]>([]);
  const [showBook, setShowBook] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [prescription, setPrescription] = useState<string[]>(['']);

  const isDoctor = userProfile?.role === 'doctor';

  useEffect(() => {
    fetchConsultations();
    if (!isDoctor) {
      fetchDoctors();
    }
  }, [isDoctor]);

  const fetchConsultations = async () => {
    try {
      const response = await api.get('/consultations');
      setConsultations(response.data.consultations || []);
    } catch (error) {
      console.error('Error fetching consultations:', error);
    }
  };

  const fetchDoctors = async () => {
    // Only fetch doctors if user is a patient
    if (!isDoctor) {
      try {
        const response = await api.get('/consultations/doctors');
        setDoctors(response.data.doctors || []);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        // Set empty array on error
        setDoctors([]);
      }
    }
  };

  const bookConsultation = async () => {
    if (!selectedDoctor || !dateTime) {
      alert('Please select doctor and date/time');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/consultations/book', {
        doctorId: selectedDoctor,
        dateTime: new Date(dateTime).toISOString(),
        reason,
      });
      // Ensure the consultation has an id field
      const newConsultation = {
        ...response.data,
        id: response.data.consultationId || response.data.id,
      };
      setConsultations([newConsultation, ...consultations]);
      setShowBook(false);
      setSelectedDoctor('');
      setDateTime('');
      setReason('');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error booking consultation');
    } finally {
      setLoading(false);
    }
  };

  const acceptConsultation = async (consultationId: string) => {
    setLoading(true);
    try {
      await api.post(`/consultations/${consultationId}/accept`);
      fetchConsultations();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error accepting consultation');
    } finally {
      setLoading(false);
    }
  };

  const updateConsultation = async (consultationId: string) => {
    setLoading(true);
    try {
      const validPrescription = prescription.filter((p) => p.trim() !== '');
      await api.patch(`/consultations/${consultationId}`, {
        notes,
        prescription: validPrescription,
        status: 'completed',
      });
      setEditingConsultation(null);
      setNotes('');
      setPrescription(['']);
      fetchConsultations();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error updating consultation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
            {isDoctor ? 'Manage Consultations' : 'My Consultations'}
          </h1>
          {!isDoctor && (
            <button
              onClick={() => setShowBook(!showBook)}
              className="bg-primary-600 dark:bg-primary-500 text-white px-6 py-2.5 rounded-xl hover:bg-primary-700 dark:hover:bg-primary-400 font-bold shadow-lg shadow-primary-200 dark:shadow-none transition-all hover:-translate-y-0.5"
            >
              Book Consultation
            </button>
          )}
        </div>

        {showBook && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 md:p-8 mb-8"
          >
            <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-slate-100">Book New Consultation</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Select Doctor
                  </label>
                  <select
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium appearance-none"
                  >
                    <option value="">Choose a doctor</option>
                    {doctors.length === 0 ? (
                      <option value="" disabled>No doctors available</option>
                    ) : (
                      doctors.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.name} - {doc.specialty}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Reason (optional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Brief reason for consultation"
                  className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium"
                  rows={3}
                />
              </div>
              <button
                onClick={bookConsultation}
                disabled={loading || !selectedDoctor || !dateTime}
                className="w-full bg-primary-600 dark:bg-primary-500 text-white py-3 rounded-xl font-bold hover:bg-primary-700 dark:hover:bg-primary-400 disabled:opacity-50 transition-all shadow-lg shadow-primary-200 dark:shadow-none"
              >
                {loading ? 'Booking...' : 'Book Consultation'}
              </button>
            </div>
          </motion.div>
        )}

        {consultations.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="bg-slate-100 dark:bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiVideo className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">No consultations scheduled</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {consultations.map((consultation, consultationIndex) => (
              <motion.div
                key={consultation.id || consultation.consultationId || `consultation-${consultationIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 md:p-8"
              >
                <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                      {consultation.reason}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm flex items-center gap-2 font-medium">
                      <FiCalendar className="text-primary-500" />
                      {new Date(consultation.dateTime).toLocaleString()}
                    </p>
                    {isDoctor && consultation.patientId && (
                      <p className="text-slate-400 text-xs mt-2 font-mono">Patient ID: {consultation.patientId}</p>
                    )}
                    {!isDoctor && consultation.doctorId && (
                      <p className="text-slate-400 text-xs mt-2 font-mono">
                        Doctor ID: {consultation.doctorId}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm ${consultation.status === 'completed'
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                        : consultation.status === 'cancelled'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                          : consultation.status === 'pending'
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        }`}
                    >
                      {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                    </span>
                    {isDoctor && consultation.status === 'pending' && (
                      <button
                        onClick={() => acceptConsultation(consultation.id)}
                        disabled={loading}
                        className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 shadow-md shadow-emerald-200 dark:shadow-none transition-all"
                      >
                        Accept
                      </button>
                    )}
                  </div>
                </div>

                {isDoctor && consultation.status !== 'completed' && (
                  <div className="mt-6 border-t border-slate-100 dark:border-white/5 pt-6">
                    {editingConsultation === consultation.id ? (
                      <div className="space-y-4 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-white/5">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                            Notes
                          </label>
                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium"
                            rows={3}
                            placeholder="Consultation notes..."
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                            Prescription
                          </label>
                          {prescription.map((med, idx) => (
                            <div key={`${consultation.id || consultationIndex}-prescription-${idx}`} className="flex gap-2 mb-2">
                              <input
                                type="text"
                                value={med}
                                onChange={(e) => {
                                  const updated = [...prescription];
                                  updated[idx] = e.target.value;
                                  setPrescription(updated);
                                }}
                                className="flex-1 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium"
                                placeholder="Medication name"
                              />
                              {prescription.length > 1 && (
                                <button
                                  onClick={() => setPrescription(prescription.filter((_, i) => i !== idx))}
                                  className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 rounded-xl transition-colors"
                                >
                                  <FiX />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            onClick={() => setPrescription([...prescription, ''])}
                            className="text-primary-600 dark:text-primary-400 font-bold text-sm hover:underline mt-1"
                          >
                            + Add Medication
                          </button>
                        </div>
                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={() => updateConsultation(consultation.id)}
                            disabled={loading}
                            className="bg-primary-600 dark:bg-primary-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-700 dark:hover:bg-primary-400 disabled:opacity-50 transition-all shadow-lg shadow-primary-200 dark:shadow-none"
                          >
                            Save & Complete
                          </button>
                          <button
                            onClick={() => {
                              setEditingConsultation(null);
                              setNotes('');
                              setPrescription(['']);
                            }}
                            className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingConsultation(consultation.id);
                          setNotes(consultation.notes || '');
                          setPrescription(consultation.prescription || ['']);
                        }}
                        className="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-100 dark:border-primary-900/30 px-6 py-2.5 rounded-xl font-bold hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-all"
                      >
                        Add Notes & Prescription
                      </button>
                    )}
                  </div>
                )}

                {consultation.meetingUrl && (
                  <div className="mt-6">
                    <a
                      href={consultation.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    >
                      <FiVideo className="w-5 h-5" />
                      Join Video Call
                      <FiExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  </div>
                )}

                {consultation.notes && (
                  <div className="mt-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-white/5">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                      <FiCheckCircle className="text-emerald-500" /> Doctor Notes:
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed disabled:opacity-50">{consultation.notes}</p>
                  </div>
                )}

                {consultation.prescription && consultation.prescription.length > 0 && (
                  <div className="mt-4 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                      <FiPackage className="text-blue-500" /> Prescription:
                    </h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-700 dark:text-slate-300 font-medium">
                      {consultation.prescription.map((med: string, idx: number) => (
                        <li key={`${consultation.id || consultationIndex}-med-${idx}`} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                          {med}
                        </li>
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

