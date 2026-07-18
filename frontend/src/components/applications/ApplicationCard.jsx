import React from 'react';
import { CalendarDays, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { statusColors } from './constants';

export default function ApplicationCard({ application, draggable = false, onDragStart }) {
  return <article draggable={draggable} onDragStart={onDragStart} className="card cursor-default space-y-3 p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><Link to={`/applications/${application._id}`} className="font-bold hover:text-blue-600">{application.role}</Link><p className="truncate text-sm text-slate-600">{application.company}</p></div><span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusColors[application.status]}`}>{application.status}</span></div>{application.location && <p className="flex items-center gap-1 text-xs text-slate-500"><MapPin size={13} />{application.location}</p>}<div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500"><span className={`rounded-full px-2 py-1 font-semibold ${application.priority === 'high' ? 'bg-red-50 text-red-700' : application.priority === 'low' ? 'bg-slate-100' : 'bg-amber-50 text-amber-700'}`}>{application.priority} priority</span>{application.followUpDate && <span className="flex items-center gap-1"><CalendarDays size={13} />Follow up {new Date(application.followUpDate).toLocaleDateString()}</span>}</div></article>;
}
