import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, Filter, Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import PageHeader from '../components/profile/PageHeader';

const types = ['', 'cover_letter', 'resume_summary', 'resume_optimization', 'job_fit_analysis', 'interview_questions', 'follow_up_email'];
const label = (value) => value ? value.replaceAll('_', ' ') : 'All types';

export default function GeneratedDocuments() {
  const [documents, setDocuments] = useState([]), [pagination, setPagination] = useState(null), [type, setType] = useState(''), [query, setQuery] = useState(''), [loading, setLoading] = useState(true), [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (type) params.type = type;
      const { data } = await axios.get('/generated-documents', { params });
      setDocuments(data.documents);
      setPagination(data.pagination);
      setError('');
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to load generated documents');
    } finally {
      setLoading(false);
    }
  }, [type]);
  useEffect(() => { load(); }, [load]);
  const filtered = documents.filter((document) => `${document.title} ${document.content}`.toLowerCase().includes(query.toLowerCase()));
  return <Layout><div className="space-y-6"><PageHeader title="Generated Documents" description="Review, edit, attach, and reuse AI-generated career content." action={<Link to="/ai" className="btn-primary"><Plus size={16} />New generation</Link>} />{error && <div className="alert-error">{error}</div>}<div className="card grid gap-3 md:grid-cols-[220px_1fr]"><label><span className="field-label"><Filter size={14} className="inline" /> Type</span><select className="field" value={type} onChange={(e) => setType(e.target.value)}>{types.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select></label><label><span className="field-label"><Search size={14} className="inline" /> Search</span><input className="field" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title or content" /></label></div>{loading ? <div className="h-72 animate-pulse rounded-2xl bg-slate-200" /> : filtered.length ? <div className="grid gap-4 lg:grid-cols-2">{filtered.map((document) => <Link key={document._id} to={`/generated-documents/${document._id}`} className="card group flex gap-4 hover:border-blue-300"><span className="h-fit rounded-xl bg-blue-50 p-3 text-blue-600"><FileText /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="truncate font-bold group-hover:text-blue-600">{document.title}</h2><span className="badge capitalize">{label(document.type)}</span></div><p className="item-meta">{document.provider} / {document.model} / {new Date(document.createdAt).toLocaleString()}</p><p className="mt-3 line-clamp-3 whitespace-pre-line text-sm leading-6 text-slate-600">{document.content}</p></div></Link>)}</div> : <div className="empty-state">No generated documents found.</div>}{pagination && <p className="text-sm text-slate-500">Showing {filtered.length} of {pagination.total} saved documents.</p>}</div></Layout>;
}