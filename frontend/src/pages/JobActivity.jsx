import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import PageHeader from '../components/profile/PageHeader';
import JobActivityTimeline from '../components/jobs/JobActivityTimeline';

export default function JobActivity() {
  const { id } = useParams(), [activities, setActivities] = useState([]), [loading, setLoading] = useState(true), [error, setError] = useState('');
  useEffect(() => { axios.get(`/jobs/${id}/activity`).then(({ data }) => setActivities(data)).catch((e) => setError(e.response?.data?.message || 'Unable to load activity')).finally(() => setLoading(false)); }, [id]);
  return <Layout><div className="mx-auto max-w-3xl space-y-6"><Link to={`/jobs/${id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600"><ArrowLeft size={16} />Back to job</Link><PageHeader title="Job Activity Timeline" description="A complete history of actions and status changes." />{error && <div className="alert-error">{error}</div>}<div className="card"><JobActivityTimeline activities={activities} loading={loading} /></div></div></Layout>;
}
