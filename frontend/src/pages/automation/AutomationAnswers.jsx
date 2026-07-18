import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { automationApi } from '../../api/automation';

export default function AutomationAnswers() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ questionText: '', answerType: 'text', answer: '', requiresConfirmation: false });
  const [error, setError] = useState('');
  const load = () => automationApi.answers().then((response) => setItems(response.data)).catch(() => setError('Unable to load saved answers'));
  useEffect(load, []);
  const save = async (event) => {
    event.preventDefault();
    try {
      await automationApi.saveAnswer(form);
      setForm({ questionText: '', answerType: 'text', answer: '', requiresConfirmation: false });
      load();
    } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to save answer'); }
  };
  const remove = async (id) => { await automationApi.deleteAnswer(id); load(); };
  return <Layout><div className="space-y-6"><h1 className="text-2xl font-bold">Saved Answers</h1>{error && <div className="alert-error">{error}</div>}
    <form onSubmit={save} className="card grid gap-3 sm:grid-cols-2"><input required className="field sm:col-span-2" placeholder="Application question" value={form.questionText} onChange={(event) => setForm({ ...form, questionText: event.target.value })}/><select className="field" value={form.answerType} onChange={(event) => setForm({ ...form, answerType: event.target.value })}>{['text','number','boolean','select','date','sensitive'].map((type) => <option key={type}>{type}</option>)}</select><input required className="field" placeholder="Answer" value={form.answer} onChange={(event) => setForm({ ...form, answer: event.target.value })}/><label className="flex gap-2"><input type="checkbox" checked={form.requiresConfirmation} onChange={(event) => setForm({ ...form, requiresConfirmation: event.target.checked })}/>Require confirmation</label><button className="btn-primary">Save answer</button></form>
    <div className="grid gap-3">{items.map((item) => <div className="card flex items-center justify-between gap-3" key={item._id}><div><strong>{item.questionText}</strong><p className="text-sm text-slate-500">{item.answerType}{item.requiresConfirmation ? ' · confirmation required' : ''} · used {item.usageCount} times</p></div><div className="flex gap-2"><button className="btn-secondary" onClick={async () => { const answer = window.prompt('Update answer'); if (answer !== null) { await automationApi.updateAnswer(item._id, { answer, requiresConfirmation: item.requiresConfirmation }); load(); } }}>Edit</button><button className="btn-secondary text-red-600" onClick={() => remove(item._id)}>Delete</button></div></div>)}</div>
  </div></Layout>;
}