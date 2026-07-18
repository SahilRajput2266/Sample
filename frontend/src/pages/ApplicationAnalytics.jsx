import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BriefcaseBusiness, CalendarClock, CheckCircle2, MessageSquare, Trophy, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import PageHeader from '../components/profile/PageHeader';

export default function ApplicationAnalytics() {
  const [data, setData] = useState(null), [error, setError] = useState('');
  useEffect(() => { axios.get('/applications/analytics/summary').then((response) => setData(response.data)).catch((e) => setError(e.response?.data?.message || 'Unable to load analytics')); }, []);
  const cards = [['Total Applications','totalApplications',BriefcaseBusiness],['Applied','applied',CheckCircle2],['Interviews','interviews',MessageSquare],['Offers','offers',Trophy],['Rejected','rejected',XCircle],['Follow-ups Due','followUpsDue',CalendarClock]];
  return <Layout><div className="space-y-6"><PageHeader title="Application Analytics" description="Pipeline volume, outcomes, response rate, and follow-up workload." />{error && <div className="alert-error">{error}</div>}<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([label,key,Icon]) => <div key={key} className="card flex items-center gap-4"><span className="rounded-xl bg-indigo-50 p-3 text-indigo-600"><Icon /></span><div><p className="text-sm text-slate-500">{label}</p><p className="text-2xl font-bold">{data?.[key] ?? '—'}</p></div></div>)}</div><div className="grid gap-6 lg:grid-cols-[300px_1fr]"><div className="card text-center"><p className="text-sm font-semibold text-slate-500">RESPONSE RATE</p><p className="mt-3 text-5xl font-bold text-blue-600">{data?.responseRate ?? 0}%</p><p className="mt-2 text-sm text-slate-500">Applications receiving employer responses</p></div><div className="card"><h2 className="text-lg font-bold">Recent applications</h2><div className="mt-3 divide-y divide-slate-100">{data?.recentApplications?.map((application) => <Link key={application._id} to={`/applications/${application._id}`} className="flex items-center justify-between gap-3 py-3 hover:text-blue-600"><div><p className="font-semibold">{application.role}</p><p className="text-sm text-slate-500">{application.company}</p></div><span className="badge">{application.status}</span></Link>)}</div></div></div></div></Layout>;
}
