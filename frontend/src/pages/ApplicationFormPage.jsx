import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import PageHeader from '../components/profile/PageHeader';
import ApplicationForm from '../components/applications/ApplicationForm';

export default function ApplicationFormPage() {
  const { id } = useParams(), navigate = useNavigate(), [application, setApplication] = useState(null), [loading, setLoading] = useState(Boolean(id)), [error, setError] = useState('');
  useEffect(() => { if (!id) return; axios.get(`/applications/${id}`).then(({ data }) => setApplication(data)).catch((e) => setError(e.response?.data?.message || 'Unable to load application')).finally(() => setLoading(false)); }, [id]);
  const submit = async (data) => { const response = id ? await axios.put(`/applications/${id}`, data) : await axios.post('/applications', data); navigate(`/applications/${response.data._id}`); };
  return <Layout><div className="mx-auto max-w-4xl space-y-6"><PageHeader title={id ? 'Edit Application' : 'Create Manual Application'} description={id ? 'Update application details, dates, contacts, and documents used.' : 'Track an application that did not originate from JobOrbit jobs.'} />{error && <div className="alert-error">{error}</div>}{loading ? <div className="h-96 animate-pulse rounded-2xl bg-slate-200" /> : <ApplicationForm initialValue={application} onSubmit={submit} submitLabel={id ? 'Update application' : 'Create application'} />}</div></Layout>;
}
