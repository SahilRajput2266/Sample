import React from 'react';
import { Bookmark, Eye, MapPin, Play, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const statusColors = { new: 'bg-slate-100 text-slate-700', saved: 'bg-blue-100 text-blue-700', ignored: 'bg-red-100 text-red-700', started: 'bg-amber-100 text-amber-700', applied: 'bg-indigo-100 text-indigo-700', interview: 'bg-emerald-100 text-emerald-700', rejected: 'bg-red-100 text-red-700' };
export default function JobCard({ job, onSave, onIgnore, onStart, saved = false }) {
  return <article className="card flex h-full flex-col gap-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="truncate text-lg font-bold">{job.title}</h2><p className="font-medium text-slate-600">{job.company}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${job.matchScore >= 70 ? 'bg-emerald-100 text-emerald-700' : job.matchScore >= 45 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{job.matchScore}% match</span></div>
    <div className="flex flex-wrap gap-2 text-xs"><span className="badge bg-blue-50 text-blue-700">{job.source}</span><span className={`rounded-full px-2 py-1 font-semibold ${statusColors[job.status]}`}>{job.status}</span><span className="inline-flex items-center gap-1 text-slate-500"><MapPin size={13} />{job.location || job.remoteType}</span></div>
    <p className="line-clamp-2 text-sm text-slate-600">{job.description}</p><div className="flex flex-wrap gap-1.5">{job.skills.slice(0, 5).map((skill) => <span key={skill} className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600">{skill}</span>)}</div>
    <div className="mt-auto flex flex-wrap gap-2 border-t border-slate-100 pt-4">{onSave && <button onClick={() => onSave(job)} className="btn-secondary px-3"><Bookmark size={15} />{saved || job.status === 'saved' ? 'Saved' : 'Save'}</button>}{onIgnore && <button onClick={() => onIgnore(job)} className="btn-secondary px-3 text-red-600"><XCircle size={15} />Ignore</button>}{onStart && <button onClick={() => onStart(job)} className="btn-secondary px-3"><Play size={15} />Start apply</button>}<Link to={`/jobs/${job._id}`} className="btn-primary ml-auto px-3"><Eye size={15} />Details</Link></div>
  </article>;
}
