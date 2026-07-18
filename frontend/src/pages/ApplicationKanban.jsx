import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { List } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import PageHeader from '../components/profile/PageHeader';
import ApplicationCard from '../components/applications/ApplicationCard';
import { applicationStatuses } from '../components/applications/constants';

export default function ApplicationKanban() {
  const [items, setItems] = useState([]), [loading, setLoading] = useState(true), [error, setError] = useState(''), [dragging, setDragging] = useState('');
  const load = useCallback(async () => { setLoading(true); try { setItems((await axios.get('/applications', { params: { limit: 100, sort: 'status' } })).data.applications); setError(''); } catch (e) { setError(e.response?.data?.message || 'Unable to load Kanban board'); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  const move = async (id, status) => { const current = items.find((item) => item._id === id); if (!current || current.status === status) return; setItems(items.map((item) => item._id === id ? { ...item, status } : item)); try { await axios.patch(`/applications/${id}/status`, { status, metadata: { source: 'kanban' } }); } catch (e) { setError(e.response?.data?.message || 'Unable to move application'); await load(); } };
  return <Layout><div className="space-y-6"><PageHeader title="Application Kanban" description="Drag applications through the hiring pipeline. Use the selector on touch devices." action={<Link to="/applications" className="btn-secondary"><List size={16} />List view</Link>} />{error && <div className="alert-error">{error}</div>}{loading ? <div className="h-96 animate-pulse rounded-2xl bg-slate-200" /> : <div className="flex snap-x gap-4 overflow-x-auto pb-5">{applicationStatuses.map((status) => { const column = items.filter((item) => item.status === status); return <section key={status} onDragOver={(e) => e.preventDefault()} onDrop={() => { move(dragging, status); setDragging(''); }} className="w-[85vw] max-w-80 shrink-0 snap-start rounded-2xl bg-slate-100 p-3 sm:w-80"><div className="mb-3 flex items-center justify-between px-1"><h2 className="font-bold capitalize">{status}</h2><span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-500">{column.length}</span></div><div className="space-y-3">{column.map((application) => <div key={application._id}><ApplicationCard application={application} draggable onDragStart={() => setDragging(application._id)} /><select aria-label="Move application" className="field mt-2 md:hidden" value={application.status} onChange={(e) => move(application._id, e.target.value)}>{applicationStatuses.map((value) => <option key={value}>{value}</option>)}</select></div>)}{!column.length && <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-400">Drop applications here</div>}</div></section>; })}</div>}
  </div></Layout>;
}
