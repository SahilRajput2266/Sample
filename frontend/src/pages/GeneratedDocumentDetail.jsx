import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Clipboard, Download, Link as LinkIcon, Save, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import PageHeader from '../components/profile/PageHeader';

const label = (value) => value?.replaceAll('_', ' ') || '';

export default function GeneratedDocumentDetail() {
  const { id } = useParams(), navigate = useNavigate();
  const [document, setDocument] = useState(null), [form, setForm] = useState({ title: '', content: '' }), [applications, setApplications] = useState([]), [applicationId, setApplicationId] = useState(''), [loading, setLoading] = useState(true), [saving, setSaving] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('');
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [documentResponse, applicationResponse] = await Promise.all([axios.get(`/generated-documents/${id}`), axios.get('/applications', { params: { limit: 100 } })]);
      setDocument(documentResponse.data);
      setForm({ title: documentResponse.data.title, content: documentResponse.data.content });
      setApplicationId(documentResponse.data.applicationId || '');
      setApplications(applicationResponse.data.applications || []);
      setError('');
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to load generated document');
    } finally {
      setLoading(false);
    }
  }, [id]);
  useEffect(() => { load(); }, [load]);
  const save = async () => {
    setSaving(true); setError(''); setNotice('');
    try {
      const { data } = await axios.put(`/generated-documents/${id}`, form);
      setDocument(data); setNotice('Document saved');
    } catch (e) { setError(e.response?.data?.message || 'Unable to save document'); }
    finally { setSaving(false); }
  };
  const copy = async () => { await navigator.clipboard.writeText(form.content); setNotice('Content copied'); };
  const downloadTxt = () => {
    const blob = new Blob([form.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob), a = window.document.createElement('a');
    a.href = url; a.download = `${form.title || 'generated-document'}.txt`; window.document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };
  const attach = async () => {
    setError(''); setNotice('');
    try { await axios.post(`/generated-documents/${id}/attach-to-application`, { applicationId }); setNotice('Document attached to application'); await load(); }
    catch (e) { setError(e.response?.data?.message || 'Unable to attach document'); }
  };
  const remove = async () => {
    if (!window.confirm('Delete this generated document?')) return;
    try { await axios.delete(`/generated-documents/${id}`); navigate('/generated-documents'); }
    catch (e) { setError(e.response?.data?.message || 'Unable to delete document'); }
  };
  if (loading) return <Layout><div className="h-96 animate-pulse rounded-2xl bg-slate-200" /></Layout>;
  if (!document) return <Layout><div className="alert-error">{error || 'Generated document not found'}</div></Layout>;
  return <Layout><div className="space-y-6"><Link to="/generated-documents" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600"><ArrowLeft size={16} />Back to documents</Link>{notice && <div className="alert-success">{notice}</div>}{error && <div className="alert-error">{error}</div>}<PageHeader title={document.title} description={`${label(document.type)} / ${document.provider} / ${document.model}`} />
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]"><main className="card space-y-4"><label><span className="field-label">Title</span><input className="field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label><label><span className="field-label">Content</span><textarea className="field min-h-[520px] font-mono leading-6" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></label><div className="flex flex-wrap gap-2"><button onClick={save} disabled={saving} className="btn-primary"><Save size={16} />{saving ? 'Saving...' : 'Save'}</button><button onClick={copy} className="btn-secondary"><Clipboard size={16} />Copy</button><button onClick={downloadTxt} className="btn-secondary"><Download size={16} />TXT</button><button onClick={remove} className="btn-secondary text-red-600"><Trash2 size={16} />Delete</button></div></main><aside className="space-y-6"><section className="card"><h2 className="mb-3 text-lg font-bold">Attach to application</h2><select className="field" value={applicationId} onChange={(e) => setApplicationId(e.target.value)}><option value="">Select an application</option>{applications.map((application) => <option key={application._id} value={application._id}>{application.role} - {application.company}</option>)}</select><button onClick={attach} disabled={!applicationId} className="btn-primary mt-3 w-full"><LinkIcon size={16} />Attach</button></section><section className="card"><h2 className="mb-3 text-lg font-bold">Generation metadata</h2><dl className="space-y-3 text-sm"><div><dt className="field-label">Created</dt><dd>{new Date(document.createdAt).toLocaleString()}</dd></div><div><dt className="field-label">Updated</dt><dd>{new Date(document.updatedAt).toLocaleString()}</dd></div><div><dt className="field-label">Provider</dt><dd>{document.provider}</dd></div><div><dt className="field-label">Model</dt><dd>{document.model}</dd></div></dl></section></aside></div></div></Layout>;
}