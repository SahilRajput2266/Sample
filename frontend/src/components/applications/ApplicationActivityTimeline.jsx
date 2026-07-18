import React from 'react';
import { History } from 'lucide-react';
export default function ApplicationActivityTimeline({ activities = [], loading = false }) {
  if (loading) return <div className="space-y-3">{[1,2,3].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-slate-100" />)}</div>;
  if (!activities.length) return <div className="empty-state py-8">No application activity yet.</div>;
  return <ol className="space-y-4">{activities.map((item) => <li key={item._id} className="flex gap-3"><span className="mt-1 rounded-full bg-indigo-50 p-2 text-indigo-600"><History size={14} /></span><div><p className="font-semibold capitalize">{item.action.replaceAll('_', ' ')}</p>{item.oldStatus !== item.newStatus && <p className="text-sm text-slate-600">{item.oldStatus || 'none'} → {item.newStatus}</p>}<time className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</time></div></li>)}</ol>;
}
