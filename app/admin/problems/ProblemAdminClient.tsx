'use client';

import { useState } from 'react';

export default function ProblemAdminClient({ initialProblems }) {
  const [problems, setProblems] = useState(initialProblems);
  const [form, setForm] = useState({
    id: '',
    title: '',
    difficulty: 'Easy',
    categories: '',
    description: '',
    video: '',
    options: '{"option1": "Call", "option2": "Fold"}',
    solution: '',
    explanation: '',
  });

  const handleSelectProblem = (p) => {
    setForm({
      id: p.id,
      title: p.title,
      difficulty: p.difficulty,
      categories: p.categories?.join(', '),
      description: p.description,
      video: p.video,
      options: JSON.stringify(p.options, null, 2),
      solution: p.solution,
      explanation: p.explanation,
    });
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const refresh = async () => {
    const res = await fetch('/api/problems/all');
    const data = await res.json();
    setProblems(data);
  };

  const handleAdd = async () => {
    await fetch('/api/problems', {
      method: 'POST',
      body: JSON.stringify({
        ...form,
        categories: form.categories.split(',').map((c) => c.trim()),
        options: JSON.parse(form.options),
      }),
    });
    alert('✅ Problème ajouté !');
    refresh();
  };

  const handleEdit = async () => {
    await fetch('/api/problems', {
      method: 'PUT',
      body: JSON.stringify({
        ...form,
        id: parseInt(form.id),
        categories: form.categories.split(',').map((c) => c.trim()),
        options: JSON.parse(form.options),
      }),
    });
    alert('✏️ Problème modifié !');
    refresh();
  };

  const handleDelete = async () => {
    await fetch('/api/problems', {
      method: 'DELETE',
      body: JSON.stringify({ id: parseInt(form.id) }),
    });
    alert('🗑️ Problème supprimé !');
    refresh();
    setForm({
      id: '',
      title: '',
      difficulty: 'Easy',
      categories: '',
      description: '',
      video: '',
      options: '{"option1": "Call", "option2": "Fold"}',
      solution: '',
      explanation: '',
    });
  };

  return (
    <div className="flex min-h-screen p-8 gap-8 bg-gray-100">
      {/* Liste des problèmes */}
      <div className="w-1/3 space-y-2 overflow-y-auto max-h-screen">
        <h2 className="text-xl font-semibold mb-2">Problèmes existants</h2>
        {problems.map((p) => (
          <button
            key={p.id}
            onClick={() => handleSelectProblem(p)}
            className="block w-full text-left p-3 bg-white rounded shadow hover:bg-blue-100 transition"
          >
            <div className="font-semibold">
              #{p.id} {p.title}
            </div>
            <div className="text-sm text-gray-500">{p.difficulty}</div>
          </button>
        ))}
      </div>

      {/* Formulaire */}
      <div className="w-2/3 space-y-4 bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Formulaire problème</h2>

        <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="Titre" className="input" />

        <select name="difficulty" value={form.difficulty} onChange={handleChange} className="input">
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>

        <input type="text" name="categories" value={form.categories} onChange={handleChange} placeholder="Catégories (séparées par ,)" className="input" />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="input" />
        <input type="text" name="video" value={form.video} onChange={handleChange} placeholder="Lien vidéo" className="input" />
        <textarea name="options" value={form.options} onChange={handleChange} placeholder='{"option1": "Call"}' className="input" />
        <input type="text" name="solution" value={form.solution} onChange={handleChange} placeholder="Bonne réponse" className="input" />
        <textarea name="explanation" value={form.explanation} onChange={handleChange} placeholder="Explication" className="input" />

        <div className="flex gap-4">
          <button onClick={handleAdd} className="btn bg-green-600">Ajouter</button>
          <button onClick={handleEdit} disabled={!form.id} className="btn bg-yellow-500 disabled:opacity-50">Modifier</button>
          <button onClick={handleDelete} disabled={!form.id} className="btn bg-red-600 disabled:opacity-50">Supprimer</button>
        </div>
      </div>
    </div>
  );
}
