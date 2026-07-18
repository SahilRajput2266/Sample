import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileSearch, FileText, Mail, MessageCircleQuestion, Sparkles, WandSparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import PageHeader from '../components/profile/PageHeader';

const tools = [
  ['/ai/cover-letter','Cover Letter Generator','Create a tailored, editable letter from a matched job.',Mail],
  ['/ai/resume-summary','Resume Summary','Write an ATS-friendly professional summary.',FileText],
  ['/ai/resume-optimizer','Resume Optimizer','Find missing keywords and improve resume positioning.',WandSparkles],
  ['/ai/job-fit','Job Fit Analysis','Understand strengths, gaps, and preparation priorities.',FileSearch],
  ['/ai/interview-prep','Interview Preparation','Generate HR, technical, and role-specific questions.',MessageCircleQuestion],
  ['/ai/follow-up','Follow-up Email','Draft application and interview follow-ups.',Sparkles],
];
export default function AIToolsDashboard() {
  const [logs, setLogs] = useState([]), [documents, setDocuments] = useState(0), [error, setError] = useState('');
  useEffect(() => { Promise.all([axios.get('/ai/logs', { params: { limit: 8 } }), axios.get('/generated-documents', { params: { limit: 1 } })]).then(([logResponse, documentResponse]) => { setLogs(logResponse.data.logs); setDocuments(documentResponse.data.pagination.total); }).catch((e) => setError(e.response?.data?.message || 'Unable to load AI history')); }, []);
  return <Layout><div className="space-y-6"><PageHeader title="AI Career Tools" description="Generate career documents with provider-backed AI or deterministic template mode." action={<Link to="/generated-documents" className="btn-secondary">Generated documents ({documents})</Link>} />{error && <div className="alert-error">{error}</div>}<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{tools.map(([to,title,description,Icon]) => <Link key={to} to={to} className="card group hover:border-blue-300"><span className="inline-flex rounded-xl bg-indigo-50 p-3 text-indigo-600"><Icon /></span><h2 className="mt-4 text-lg font-bold group-hover:text-blue-600">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p></Link>)}</div><section className="card"><h2 className="text-lg font-bold">Recent AI usage</h2><div className="mt-3 divide-y divide-slate-100">{logs.map((log) => <div key={log._id} className="flex flex-wrap items-center justify-between gap-2 py-3"><div><p className="font-semibold capitalize">{log.feature.replaceAll('_',' ')}</p><p className="text-xs text-slate-500">{log.provider} · {log.model}</p></div><span className={`rounded-full px-2 py-1 text-xs font-semibold ${log.status === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{log.status}</span></div>)}{!logs.length && <p className="py-6 text-center text-sm text-slate-500">No AI requests yet.</p>}</div></section></div></Layout>;
}
