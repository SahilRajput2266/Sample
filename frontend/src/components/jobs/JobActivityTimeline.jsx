import React from 'react';
import { Clock3 } from 'lucide-react';

const labels = { fetched: 'Job fetched', viewed: 'Job viewed', saved: 'Job saved', ignored: 'Job ignored', status_changed: 'Status changed', apply_started: 'Application started' };
export default function JobActivityTimeline({ activities = [], loading = false }) {
  if (loading) return <div className="space-y-3">{[1,2,3].map((item) => <div key={item} className="h-16 animate-pulse rounded-xl bg-slate-100" />)}</div>;
  if (!activities.length) return <div className="empty-state py-8">No activity recorded yet.</div>;
  return <ol className="space-y-4">{activities.map((activity) => <li key={activity._id} className="flex gap-3"><span className="mt-1 rounded-full bg-blue-50 p-2 text-blue-600"><Clock3 size={15} /></span><div className="min-w-0"><p className="font-semibold">{labels[activity.action] || activity.action}</p>{activity.oldStatus !== activity.newStatus && <p className="text-sm text-slate-600">{activity.oldStatus || 'none'} → {activity.newStatus}</p>}<time className="text-xs text-slate-400">{new Date(activity.createdAt).toLocaleString()}</time></div></li>)}</ol>;
}
