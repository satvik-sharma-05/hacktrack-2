import { useState } from 'react';
import { submitCustomEvent } from '../api/events';

export default function SubmitHackathon() {
  const [form, setForm] = useState({
    title: '', url: '', description: '',
    start: '', end: '', registrationDeadline: '',
    prize: '', prizeType: 'unknown', location: 'online',
    organizer: '', themes: '', skills: ''
  });
  const [created, setCreated] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      prize: form.prize ? Number(form.prize) : null,
      themes: form.themes ? form.themes.split(',').map(s => s.trim()) : [],
      skills: form.skills ? form.skills.split(',').map(s => s.trim()) : [],
    };
    const ev = await submitCustomEvent(payload);
    setCreated(ev);
  };

  return (
    <div className="mx-auto max-w-2xl p-4 space-y-4">
      <h1 className="text-xl font-semibold">Submit Hackathon (Organizer)</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        {['title','url','description','start','end','registrationDeadline','prize','organizer','themes','skills'].map(k => (
          <input key={k} className="w-full border p-2 rounded" placeholder={k}
            type={['start','end','registrationDeadline'].includes(k) ? 'datetime-local' : 'text'}
            value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
        ))}
        <select className="w-full border p-2 rounded" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}>
          <option value="online">online</option>
          <option value="in-person">in-person</option>
          <option value="hybrid">hybrid</option>
        </select>
        <select className="w-full border p-2 rounded" value={form.prizeType} onChange={e => setForm(f => ({ ...f, prizeType: e.target.value }))}>
          <option value="unknown">unknown</option>
          <option value="cash">cash</option>
          <option value="in-kind">in-kind</option>
        </select>
        <button className="px-4 py-2 border rounded">Create</button>
      </form>

      {created && (
        <div className="p-3 border rounded">
          <div className="font-medium">Created: {created.title}</div>
          <a className="text-blue-600 underline" href={created.url} target="_blank">Open</a>
        </div>
      )}
    </div>
  );
}
    