'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'framer-motion';
import { FiUser, FiSave, FiPlus, FiX, FiTrash2, FiActivity, FiAlertTriangle } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function ProfilePage() {
  const { userProfile, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    fetchProfile();
  }, [userProfile]);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    setSaving(true);
    try {
      await api.post('/users/profile', profile);
      alert('Profile updated successfully');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const updateMedicalHistory = async () => {
    setSaving(true);
    try {
      await api.post('/users/medical-history', {
        allergies: profile.medicalHistory?.allergies || [],
        medications: profile.medicalHistory?.medications || [],
        conditions: profile.medicalHistory?.conditions || [],
        surgeries: profile.medicalHistory?.surgeries || [],
      });
      alert('Medical history updated successfully');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error updating medical history');
    } finally {
      setSaving(false);
    }
  };

  const addItem = (type: 'allergy' | 'medication' | 'condition') => {
    if (!profile.medicalHistory) {
      profile.medicalHistory = { allergies: [], medications: [], conditions: [], surgeries: [] };
    }

    const newProfile = { ...profile };
    const value =
      type === 'allergy'
        ? newAllergy
        : type === 'medication'
          ? newMedication
          : newCondition;

    if (value.trim()) {
      if (type === 'allergy') {
        newProfile.medicalHistory.allergies = [
          ...(newProfile.medicalHistory.allergies || []),
          value,
        ];
        setNewAllergy('');
      } else if (type === 'medication') {
        newProfile.medicalHistory.medications = [
          ...(newProfile.medicalHistory.medications || []),
          value,
        ];
        setNewMedication('');
      } else {
        newProfile.medicalHistory.conditions = [
          ...(newProfile.medicalHistory.conditions || []),
          value,
        ];
        setNewCondition('');
      }
      setProfile(newProfile);
    }
  };

  const removeItem = (type: 'allergy' | 'medication' | 'condition', index: number) => {
    const newProfile = { ...profile };
    if (type === 'allergy') {
      newProfile.medicalHistory.allergies.splice(index, 1);
    } else if (type === 'medication') {
      newProfile.medicalHistory.medications.splice(index, 1);
    } else {
      newProfile.medicalHistory.conditions.splice(index, 1);
    }
    setProfile(newProfile);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      alert('Please type "DELETE" to confirm account deletion');
      return;
    }

    setDeleting(true);
    try {
      await api.delete('/users/account');
      alert('Your account has been deleted successfully');
      await logout();
      router.push('/');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error deleting account');
      setDeleting(false);
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50 mb-8 tracking-tight">Profile Settings</h1>

        {/* Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 md:p-8 mb-8"
        >
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <FiUser className="text-primary-600" />
            Basic Information
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Name</label>
              <input
                type="text"
                value={profile?.name || ''}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={profile?.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  value={profile?.dateOfBirth || ''}
                  onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Gender</label>
                <select
                  value={profile?.gender || ''}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium appearance-none"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Diet Type</label>
                <select
                  value={profile?.dietType || ''}
                  onChange={(e) => setProfile({ ...profile, dietType: e.target.value })}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium appearance-none"
                >
                  <option value="">Select Diet</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="nonVegetarian">Non-Vegetarian</option>
                  <option value="vegan">Vegan</option>
                </select>
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={updateProfile}
                disabled={saving}
                className="flex items-center gap-2 medical-gradient text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:translate-y-[-2px] hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSave />
                {saving ? 'Saving...' : 'Save Basic Info'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Medical History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 md:p-8 mb-8"
        >
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <FiActivity className="text-emerald-500" />
            Medical History
          </h2>

          {/* Allergies */}
          <div className="mb-8">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Allergies</label>
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                placeholder="e.g., Peanuts, Penicillin"
                className="flex-1 px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium"
                onKeyPress={(e) => e.key === 'Enter' && addItem('allergy')}
              />
              <button
                onClick={() => addItem('allergy')}
                className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-4 rounded-xl hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors font-bold"
              >
                <FiPlus />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(profile?.medicalHistory?.allergies || []).map((allergy: string, idx: number) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-900/30 px-3 py-1.5 rounded-lg text-sm font-medium"
                >
                  {allergy}
                  <button onClick={() => removeItem('allergy', idx)} className="hover:text-red-900 dark:hover:text-red-100">
                    <FiX className="w-4 h-4" />
                  </button>
                </span>
              ))}
              {(!profile?.medicalHistory?.allergies?.length) && (
                <span className="text-sm text-slate-400 dark:text-slate-600 italic">No allergies recorded</span>
              )}
            </div>
          </div>

          {/* Medications */}
          <div className="mb-8">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Current Medications
            </label>
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={newMedication}
                onChange={(e) => setNewMedication(e.target.value)}
                placeholder="e.g., Metformin 500mg"
                className="flex-1 px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium"
                onKeyPress={(e) => e.key === 'Enter' && addItem('medication')}
              />
              <button
                onClick={() => addItem('medication')}
                className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-4 rounded-xl hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors font-bold"
              >
                <FiPlus />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(profile?.medicalHistory?.medications || []).map(
                (med: string, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/30 px-3 py-1.5 rounded-lg text-sm font-medium"
                  >
                    {med}
                    <button onClick={() => removeItem('medication', idx)} className="hover:text-blue-900 dark:hover:text-blue-100">
                      <FiX className="w-4 h-4" />
                    </button>
                  </span>
                )
              )}
              {(!profile?.medicalHistory?.medications?.length) && (
                <span className="text-sm text-slate-400 dark:text-slate-600 italic">No medications recorded</span>
              )}
            </div>
          </div>

          {/* Conditions */}
          <div className="mb-8">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Medical Conditions
            </label>
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                placeholder="e.g., Type 2 Diabetes, Hypertension"
                className="flex-1 px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium"
                onKeyPress={(e) => e.key === 'Enter' && addItem('condition')}
              />
              <button
                onClick={() => addItem('condition')}
                className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-4 rounded-xl hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors font-bold"
              >
                <FiPlus />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(profile?.medicalHistory?.conditions || []).map(
                (condition: string, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-900/30 px-3 py-1.5 rounded-lg text-sm font-medium"
                  >
                    {condition}
                    <button onClick={() => removeItem('condition', idx)} className="hover:text-amber-900 dark:hover:text-amber-100">
                      <FiX className="w-4 h-4" />
                    </button>
                  </span>
                )
              )}
              {(!profile?.medicalHistory?.conditions?.length) && (
                <span className="text-sm text-slate-400 dark:text-slate-600 italic">No conditions recorded</span>
              )}
            </div>
          </div>

          <button
            onClick={updateMedicalHistory}
            disabled={saving}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 px-8 py-3 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
          >
            <FiSave />
            {saving ? 'Saving...' : 'Save Medical History'}
          </button>
        </motion.div>

        {/* Account Deletion Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-red-50/50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-2xl p-6 md:p-8 mt-6"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-700 dark:text-red-400">
            <FiAlertTriangle />
            Danger Zone
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-4 font-medium">
            Once you delete your account, there is no going back. This will permanently delete your profile, reports, consultations, and all other data.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200 dark:shadow-none"
            >
              <FiTrash2 />
              Delete My Account
            </button>
          ) : (
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Type <span className="text-red-600 font-black">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-2 border-red-300 dark:border-red-900/50 rounded-xl text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-red-500 outline-none font-bold"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting || deleteConfirmText !== 'DELETE'}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiTrash2 />
                  {deleting ? 'Deleting...' : 'Confirm Deletion'}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                  }}
                  disabled={deleting}
                  className="px-6 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

