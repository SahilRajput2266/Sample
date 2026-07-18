import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Save, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import PageHeader from '../components/profile/PageHeader';

export default function SavedJobs() {
  const [items, setItems] = useState([]), [notes, setNotes] = useState({}), [loading, setLoading] = useState(true), [error, setError] = useState(''), [notice, setNotice] = useState('');
  const load = useCallback(async () => { setLoading(true); try { const data = (await axios.get('/jobs/saved')).data; setItems(data); setNotes(Object.fromEntries(data.map((item) => [item.jobId._id, item.notes || '']))); setError(''); } catch (e) { setError(e.response?.data?.message || 'Unable to load saved jobs'); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  const updateNotes = async (id) => { try { await axios.post(`/jobs/${id}/save`, { notes: notes[id] }); setNotice('Notes saved'); } catch (e) { setError(e.response?.data?.message || 'Unable to save notes'); } };
  const remove = async (id) => { if (!window.confirm('Remove this saved job?')) return; try { await axios.delete(`/jobs/${id}/save`); await load(); } catch (e) { setError(e.response?.data?.message || 'Unable to remove saved job'); } };
  return <Layout><div className="space-y-6"><PageHeader title="Saved Jobs" description="Shortlisted opportunities and your private notes." />{notice && <div className="alert-success">{notice}</div>}{error && <div className="alert-error">{error}</div>}{loading ? <div className="grid gap-4 md:grid-cols-2">{[1,2].map((item) => <div key={item} className="h-64 animate-pulse rounded-2xl bg-slate-200" />)}</div> : items.length ? <div className="grid gap-4 lg:grid-cols-2">{items.map(({ jobId: job, notes: savedNotes }) => <article key={job._id} className="card space-y-4"><div><div className="flex items-start justify-between gap-3"><div><Link to={`/jobs/${job._id}`} className="text-lg font-bold hover:text-blue-600">{job.title}</Link><p className="text-slate-600">{job.company}</p></div><span className="badge">{job.matchScore}%</span></div><p className="item-meta">{job.location} · {job.remoteType}</p></div><label><span className="field-label">Notes</span><textarea className="field min-h-24" maxLength={2000} value={notes[job._id] ?? savedNotes ?? ''} onChange={(e) => setNotes({ ...notes, [job._id]: e.target.value })} /></label><div className="flex flex-wrap gap-2"><button onClick={() => updateNotes(job._id)} className="btn-primary"><Save size={16} />Save notes</button><button onClick={() => remove(job._id)} className="btn-secondary text-red-600"><Trash2 size={16} />Remove</button></div></article>)}</div> : <div className="empty-state">No saved jobs yet.</div>}</div></Layout>;
}
