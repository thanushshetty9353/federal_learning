import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axiosClient from '../../api/axiosClient';

function AlertBanner({ msg, type }) {
  if (!msg) return null;
  const colors = {
    success: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', text: '#10b981' },
    error: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', text: '#f87171' },
  };
  const c = colors[type] || colors.error;
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: '0.65rem', padding: '0.75rem 1rem', marginBottom: '1rem', color: c.text, fontSize: '0.875rem' }}>
      {msg}
    </motion.div>
  );
}

export function OrgJobsList({ isDark }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionAlert, setActionAlert] = useState(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/training-jobs/list');
      setJobs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load jobs.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchJobs(); }, []);

  const joinJob = async (id) => {
    try {
      await axiosClient.post(`/training-jobs/${id}/join`);
      setActionAlert({ msg: 'Successfully joined training job!', type: 'success' });
      fetchJobs();
    } catch (err) {
      setActionAlert({ msg: err.response?.data?.detail || 'Failed to join job.', type: 'error' });
    }
  };

  const startTraining = async (id) => {
    try {
      await axiosClient.post(`/training-jobs/${id}/train`);
      setActionAlert({ msg: 'Training process started on your node!', type: 'success' });
    } catch (err) {
      setActionAlert({ msg: err.response?.data?.detail || 'Failed to start training.', type: 'error' });
    }
  };

  return (
    <div>
      <h2 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '1.5rem', color: isDark ? '#e2e8f0' : '#1e293b' }}>
        🚀 Available Training Jobs
      </h2>
      {actionAlert && <AlertBanner msg={actionAlert.msg} type={actionAlert.type} />}
      {error && <AlertBanner msg={error} type="error" />}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading...</div>
      ) : jobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>No active training jobs available.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(99,102,241,0.15)' }}>
                {['ID', 'Model', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.map((job, i) => (
                <motion.tr key={job.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(99,102,241,0.07)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#6366f1' }}>#{job.id}</td>
                  <td style={{ padding: '0.85rem 1rem', color: isDark ? '#e2e8f0' : '#1e293b' }}>{job.model_type || job.model}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span className={`status-badge ${job.status === 'CREATED' ? 'badge-created' : 'badge-training'}`}>{job.status}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => joinJob(job.id)} className="btn-primary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}>Join</button>
                      <button onClick={() => startTraining(job.id)} className="btn-success" style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}>Start Training</button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function UploadDataset({ isDark }) {
  const [file, setFile] = useState(null);
  const [jobId, setJobId] = useState('');
  const [datasetName, setDatasetName] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !jobId || !datasetName) {
      setAlert({ msg: 'Please fill all fields and select a CSV file.', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('job_id', jobId);
      formData.append('dataset_name', datasetName);
      
      await axiosClient.post('/datasets/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAlert({ msg: 'Dataset uploaded and encrypted successfully!', type: 'success' });
      setFile(null);
      setJobId('');
      setDatasetName('');
    } catch (err) {
      setAlert({ msg: err.response?.data?.detail || 'Upload failed.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px' }}>
      <h2 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '1.5rem', color: isDark ? '#e2e8f0' : '#1e293b' }}>
        📁 Upload Training Dataset
      </h2>
      {alert && <AlertBanner msg={alert.msg} type={alert.type} />}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: isDark ? '#94a3b8' : '#475569' }}>Job ID</label>
          <input type="number" value={jobId} onChange={e => setJobId(e.target.value)} placeholder="Enter Job ID" className={`input-field ${!isDark ? 'input-field-light' : ''}`} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: isDark ? '#94a3b8' : '#475569' }}>Dataset Name</label>
          <input type="text" value={datasetName} onChange={e => setDatasetName(e.target.value)} placeholder="e.g. Patient Records Q1" className={`input-field ${!isDark ? 'input-field-light' : ''}`} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: isDark ? '#94a3b8' : '#475569' }}>CSV File</label>
          <div style={{
            border: `2px dashed ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(99,102,241,0.2)'}`,
            borderRadius: '0.75rem', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
            background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(99,102,241,0.02)'
          }} onClick={() => document.getElementById('fileInput').click()}>
            {file ? (
              <div style={{ color: '#6366f1', fontWeight: 600 }}>📄 {file.name}</div>
            ) : (
              <div style={{ color: '#64748b' }}>Click to select or drag CSV file</div>
            )}
            <input id="fileInput" type="file" accept=".csv" onChange={e => setFile(e.target.files[0])} style={{ display: 'none' }} />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Uploading...' : '☁️ Upload Dataset'}
        </button>
      </form>
    </div>
  );
}
