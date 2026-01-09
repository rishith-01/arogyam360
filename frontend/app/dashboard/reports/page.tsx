'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiFileText, FiAlertCircle, FiCheckCircle, FiPlus, FiFilter, FiActivity, FiArrowRight, FiX } from 'react-icons/fi';
import api from '@/lib/api';

export default function ReportsPage() {
  const { user, userProfile } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [reportName, setReportName] = useState('');
  const [reportType, setReportType] = useState('general');
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');

  const isDoctor = userProfile?.role === 'doctor';

  useEffect(() => {
    if (user) {
      fetchReports();
      if (isDoctor) {
        fetchPatients();
      }
    }
  }, [user, isDoctor]);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/reports/patients');
      setPatients(response.data.patients || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await api.get('/reports');
      setReports(response.data.reports || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    if (isDoctor && !selectedPatientId) {
      alert('Please select a patient');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('report', selectedFile);
      formData.append('reportName', reportName || selectedFile.name);
      formData.append('reportType', reportType);
      if (isDoctor) {
        formData.append('patientId', selectedPatientId);
      }

      const response = await api.post('/reports/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newReport = {
        ...response.data,
        id: response.data.reportId || response.data.id,
      };
      setReports([newReport, ...reports]);
      setShowUpload(false);
      setSelectedFile(null);
      setReportName('');
      setSelectedPatientId('');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error uploading report');
    } finally {
      setUploading(false);
    }
  };

  const getRiskStyles = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'text-red-600 bg-red-100 dark:bg-red-900/40 dark:text-red-400 border-red-200 dark:border-red-900/50';
      case 'moderate':
        return 'text-amber-600 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-900/50';
      default:
        return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">Retrieving medical records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 transition-colors duration-500">
      {/* Background Orbs */}
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/30 dark:bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/30 dark:bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-slate-50 tracking-tight mb-2">
              {isDoctor ? 'Manage Patient Reports' : 'Medical Reports'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
              <FiFileText className="text-primary-600" />
              {reports.length} {reports.length === 1 ? 'Report' : 'Reports'} available in your archive
            </p>
          </div>

          <div className="flex gap-3">
            {isDoctor && (
              <button
                onClick={() => setShowUpload(!showUpload)}
                className="flex items-center gap-2 medical-gradient text-white px-6 py-3 rounded-2xl font-bold hover:translate-y-[-2px] transition-all shadow-lg active:scale-95"
              >
                <FiPlus className="w-5 h-5" />
                Upload New Report
              </button>
            )}
            {!isDoctor && (
              <button className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 px-6 py-3 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                <FiFilter />
                Filter
              </button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showUpload && isDoctor && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              className="mb-10 overflow-hidden"
            >
              <div className="glass-card p-8 border-primary-500/20 bg-primary-50/10 dark:bg-primary-900/5">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">Upload Medical Evidence</h2>
                  <button
                    onClick={() => setShowUpload(false)}
                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">
                        Select Target Patient
                      </label>
                      <select
                        value={selectedPatientId}
                        onChange={(e) => setSelectedPatientId(e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-slate-50 font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all"
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

                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">
                        Report Title
                      </label>
                      <input
                        type="text"
                        value={reportName}
                        onChange={(e) => setReportName(e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-slate-50 font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        placeholder="e.g., Annual Physical - Blood Panel"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">
                        Category
                      </label>
                      <select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-slate-50 font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                      >
                        <option value="general">Comprehensive General</option>
                        <option value="blood">Blood Diagnostics</option>
                        <option value="urine">Urinalysis</option>
                        <option value="imaging">Medical Imaging (X-Ray/MRI)</option>
                        <option value="other">Specialized / Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">
                        Document File
                      </label>
                      <div className="relative group h-40">
                        <input
                          type="file"
                          onChange={handleFileSelect}
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className={`w-full h-full border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-2 transition-all group-hover:bg-primary-50/30 dark:group-hover:bg-primary-900/10 ${selectedFile ? 'border-primary-500 bg-primary-50/20 dark:bg-primary-900/20' : 'border-slate-300 dark:border-white/10'}`}>
                          <FiUpload className={`w-8 h-8 ${selectedFile ? 'text-primary-600' : 'text-slate-400'}`} />
                          <p className={`font-bold text-sm ${selectedFile ? 'text-primary-700 dark:text-primary-400' : 'text-slate-500'}`}>
                            {selectedFile ? selectedFile.name : 'Click or Drag File Here'}
                          </p>
                          <p className="text-[10px] uppercase font-black tracking-tighter text-slate-400">PDF, JPG, PNG (Max 10MB)</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                      <button
                        onClick={handleUpload}
                        disabled={!selectedFile || uploading || !selectedPatientId}
                        className="flex-1 bg-primary-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-200 dark:shadow-none hover:bg-primary-700 disabled:opacity-50 transition-all uppercase tracking-widest text-sm"
                      >
                        {uploading ? 'Processing Analysis...' : 'Finalize & Upload'}
                      </button>
                      <button
                        onClick={() => {
                          setShowUpload(false);
                          setSelectedFile(null);
                          setSelectedPatientId('');
                        }}
                        className="px-8 py-4 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-300 dark:hover:bg-slate-750 transition-all"
                      >
                        Discard
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {reports.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card py-24 text-center"
          >
            <div className="w-24 h-24 medical-gradient rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <FiFileText className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">Archive Empty</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">No medical reports have been digitized for this account yet.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {reports.map((report, reportIndex) => (
              <motion.div
                key={report.id || report.reportId || `report-${reportIndex}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: reportIndex * 0.05 }}
                className="glass-card group hover:border-primary-500/30 transition-all duration-500"
              >
                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    <div className="flex gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/10 flex items-center justify-center shadow-sm group-hover:medical-gradient group-hover:border-transparent transition-all duration-500">
                        <FiFileText className="w-8 h-8 text-primary-600 group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
                            {report.reportName}
                          </h3>
                          <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5">
                            {report.reportType}
                          </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm tracking-wide">
                          Analyzed on {report.testDate ? new Date(report.testDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown Date'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 self-center md:self-start">
                      <div className={`px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border shadow-sm ${getRiskStyles(report.overallRisk || 'normal')}`}>
                        Risk Level: {report.overallRisk || 'Normal'}
                      </div>
                      {report.fileUrl && (
                        <a
                          href={report.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-black text-sm hover:underline tracking-tight group/link"
                        >
                          Access Original Document
                          <FiArrowRight className="group-hover/link:translate-x-1 transition-transform" />
                        </a>
                      )}
                    </div>
                  </div>

                  {report.biomarkers && report.biomarkers.length > 0 && (
                    <div className="mt-10">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-1 bg-primary-600 rounded-full" />
                        <h4 className="text-sm font-black text-slate-900 dark:text-slate-50 uppercase tracking-widest">Digital Insights & Biomarkers</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {report.biomarkers.map((marker: any, idx: number) => (
                          <div
                            key={`${report.id || report.reportId || reportIndex}-marker-${idx}`}
                            className="flex items-center justify-between p-4 bg-white/50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 rounded-2xl hover:shadow-md transition-all group/marker"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${marker.riskLevel === 'high' ? 'bg-red-500 animate-pulse' : marker.riskLevel === 'moderate' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                              <div>
                                <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{marker.displayName || 'Metric'}</p>
                                <p className="text-xs font-black text-primary-600 dark:text-primary-400 tracking-wider">
                                  {marker.value || '—'} <span className="text-[10px] text-slate-400 opacity-60 uppercase">{marker.unit || ''}</span>
                                </p>
                              </div>
                            </div>
                            <div className="opacity-40 group-hover/marker:opacity-100 transition-opacity">
                              {marker.riskLevel === 'normal' ? (
                                <FiCheckCircle className="text-emerald-500 w-5 h-5" />
                              ) : (
                                <FiAlertCircle
                                  className={`w-5 h-5 ${marker.riskLevel === 'high' ? 'text-red-500' : 'text-amber-500'}`}
                                />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
