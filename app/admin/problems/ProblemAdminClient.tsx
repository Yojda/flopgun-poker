'use client';

import { useState } from 'react';
import * as problemActions from '../../actions/problemActions';
import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

export default function ProblemAdminClient({ initialProblems }: { initialProblems: any[] }) {
  const [problems, setProblems] = useState(initialProblems);
  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(null);
  const [form, setForm] = useState({
    id: '',
    title: '',
    difficulty: 'Easy',
    categories: '',
    description: '',
    replayerurl: '',
    options: '{"option1": "Call", "option2": "Fold"}',
    solution: '',
    explanation: '',
  });

  const handleSelectProblem = (p: any) => {
    setSelectedProblemId(p.id);
    setForm({
      id: p.id,
      title: p.title,
      difficulty: p.difficulty,
      categories: p.categories?.join(', '),
      description: p.description,
      replayerurl: p.replayerurl,
      options: JSON.stringify(p.options, null, 2),
      solution: p.solution,
      explanation: p.explanation,
    });
  };

  const handleNewProblem = () => {
    setSelectedProblemId(null);
    setForm({
      id: '',
      title: '',
      difficulty: 'Easy',
      categories: '',
      description: '',
      replayerurl: '',
      options: '{"option1": "Call", "option2": "Fold"}',
      solution: '',
      explanation: '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleMarkdownChange = (field: 'description' | 'explanation', value: string | undefined) => {
    setForm((prev) => ({ ...prev, [field]: value || '' }));
  };

  const refresh = async () => {
    const data = await problemActions.listProblems();
    setProblems(data);
  };

  const handleAdd = async () => {
    try {
      const problemData = {
        ...form,
        categories: form.categories.split(',').map((c) => c.trim()),
        options: JSON.parse(form.options),
      };
      // Supprimer l'id pour la création d'un nouveau problème
      delete problemData.id;

      await problemActions.addProblem(problemData);
      alert('✅ Problème ajouté avec succès !');
      refresh();
      handleNewProblem(); // Reset form after adding
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      alert('❌ Erreur lors de l\'ajout du problème');
    }
  };

  const handleEdit = async () => {
    try {
      await problemActions.editProblem({
        ...form,
        id: parseInt(form.id),
        categories: form.categories.split(',').map((c) => c.trim()),
        options: JSON.parse(form.options),
      });
      alert('✏️ Problème modifié avec succès !');
      refresh();
    } catch (error) {
      alert('❌ Erreur lors de la modification');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce problème ?')) {
      return;
    }
    try {
      await problemActions.deleteProblem(parseInt(form.id));
      alert('🗑️ Problème supprimé avec succès !');
      refresh();
      setForm({
        id: '',
        title: '',
        difficulty: 'Easy',
        categories: '',
        description: '',
        replayerurl: '',
        options: '{"option1": "Call", "option2": "Fold"}',
        solution: '',
        explanation: '',
      });
    } catch (error) {
      alert('❌ Erreur lors de la suppression');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A1117] to-[#1A2730] p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-white">Administration des Problèmes</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Liste des problèmes */}
          <div className="lg:w-1/3">
            <div className="bg-[#182B35] rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Liste des problèmes</h2>
                <button
                  onClick={() => {
                    setSelectedProblemId(null);
                    setForm({
                      id: '',
                      title: '',
                      difficulty: 'Easy',
                      categories: '',
                      description: '',
                      replayerurl: '',
                      options: '{"option1": "Call", "option2": "Fold"}',
                      solution: '',
                      explanation: '',
                    });
                  }}
                  className="px-3 py-1 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm font-medium"
                >
                  Nouveau
                </button>
              </div>

              <div className="space-y-2 max-h-[calc(100vh-12rem)] overflow-y-auto">
                {problems.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProblem(p)}
                    className={`block w-full text-left p-4 rounded-lg transition-colors ${
                      selectedProblemId === p.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#243B47] text-gray-300 hover:bg-[#2D4B5A]'
                    }`}
                  >
                    <div className="font-medium">#{p.id} {p.title}</div>
                    <div className="text-sm opacity-75">{p.difficulty}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <div className="lg:w-2/3">
            <div className="bg-[#182B35] rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6 text-white">
                {selectedProblemId ? `Modifier le problème #${selectedProblemId}` : 'Ajouter un nouveau problème'}
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Titre</label>
                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      className="w-full p-2 bg-[#243B47] border border-[#34566A] rounded-md text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Difficulté</label>
                    <select
                      name="difficulty"
                      value={form.difficulty}
                      onChange={handleChange}
                      className="w-full p-2 bg-[#243B47] border border-[#34566A] rounded-md text-white"
                    >
                      <option value="Easy">Facile</option>
                      <option value="Medium">Moyen</option>
                      <option value="Hard">Difficile</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Catégories</label>
                  <input
                    type="text"
                    name="categories"
                    value={form.categories}
                    onChange={handleChange}
                    placeholder="Séparées par des virgules (ex: Maths, Stratégie, Tactique)"
                    className="w-full p-2 bg-[#243B47] border border-[#34566A] rounded-md text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">URL du Replayer</label>
                  <input
                    type="text"
                    name="replayerurl"
                    value={form.replayerurl}
                    onChange={handleChange}
                    className="w-full p-2 bg-[#243B47] border border-[#34566A] rounded-md text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                  <div data-color-mode="dark">
                    <MDEditor
                      value={form.description}
                      onChange={(value) => handleMarkdownChange('description', value)}
                      preview="edit"
                      height={200}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Options de réponse (JSON)</label>
                  <textarea
                    name="options"
                    value={form.options}
                    onChange={handleChange}
                    rows={3}
                    className="w-full p-2 bg-[#243B47] border border-[#34566A] rounded-md text-white font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Solution</label>
                  <input
                    type="text"
                    name="solution"
                    value={form.solution}
                    onChange={handleChange}
                    className="w-full p-2 bg-[#243B47] border border-[#34566A] rounded-md text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Explication</label>
                  <div data-color-mode="dark">
                    <MDEditor
                      value={form.explanation}
                      onChange={(value) => handleMarkdownChange('explanation', value)}
                      preview="edit"
                      height={200}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleAdd}
                    className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white font-medium"
                  >
                    Ajouter un nouveau
                  </button>
                  <button
                    onClick={handleEdit}
                    disabled={!selectedProblemId}
                    className={`px-4 py-2 rounded-md ${
                      !selectedProblemId
                        ? 'bg-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white font-medium`}
                  >
                    Modifier #{selectedProblemId}
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={!selectedProblemId}
                    className={`px-4 py-2 rounded-md ${
                      !selectedProblemId
                        ? 'bg-gray-500 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700'
                    } text-white font-medium`}
                  >
                    Supprimer #{selectedProblemId}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
