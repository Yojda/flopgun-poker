"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useAuth } from "../../hooks/useAuth";
import * as problemStateActions from "../../actions/problemStateActions";

export default function ProblemDetailsClient({ user, problem, previousId, nextId }: {
  user: any;
  problem: any;
  previousId: number | null;
  nextId: number | null;
}) {
  const [activeTab, setActiveTab] = useState<'description' | 'solution'>('description');
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [problemState, setProblemState] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const onPrevious = () => previousId && router.push(`/problems/${previousId}`);
  const onNext = () => nextId && router.push(`/problems/${nextId}`);
  const onBackToList = () => router.push(`/`);

  // Wrapper pour démarrer un problème via server action
  const startProblem = async () => {
    try {
      const state = await problemStateActions.startProblem(user.userId, problem.id);
      setProblemState(state.state);
    } catch (error: any) {
      console.error('Error starting problem:', error?.message || error);
    }
  };

  // Wrapper pour soumettre une réponse via server action
  const submitAnswer = async (isCorrect: boolean) => {
    try {
      const state = await problemStateActions.submitAnswer(user.userId, problem.id, isCorrect);
      setProblemState(state.state);
      setHasAnswered(true);
    } catch (error: any) {
      console.error('Error submitting answer:', error?.message || error);
    }
  };

  // Wrapper pour récupérer l'état du problème via server action
  const fetchProblemState = async () => {
    try {
      const state = await problemStateActions.getProblemState(user.userId, problem.id);
      if (state) {
        setProblemState(state.state);
        if (state.state === 'correct' || state.state === 'incorrect') {
          setHasAnswered(true);
          // Afficher le résultat précédent
          if (state.state === 'correct') {
            setResult("✅ Bonne réponse !");
          } else {
            setResult(`❌ Mauvaise réponse. La bonne réponse est : ${problem.solution}`);
          }
        }
      }
    } catch (error: any) {
      console.error('Error fetching problem state:', error?.message || error);
    }
  };

  useEffect(() => {
    // Charger l'état du problème au montage du composant
    fetchProblemState();
    // eslint-disable-next-line
  }, [problem.id]);

  // Démarrer le problème quand l'utilisateur clique sur le problème
  useEffect(() => {
    if (!problemState && isAuthenticated) {
      startProblem();
    }
    // eslint-disable-next-line
  }, [problemState, isAuthenticated]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (result || hasAnswered) {
      return;
    }
    if (selected === null) {
      setResult("Veuillez choisir une réponse.");
      return;
    }
    const isCorrect = selected === problem.solution;
    // Enregistrer la réponse dans la base de données
    await submitAnswer(isCorrect);
    setActiveTab('solution');
    if (isCorrect) {
      setResult("✅ Bonne réponse !");
    } else {
      setResult(`❌ Mauvaise réponse. La bonne réponse est : ${problem.solution}`);
    }
  }

  return (
    <div
      className="bg-fixed bg-cover bg-center w-screen min-h-screen"
      style={{ backgroundImage: "url('/images/bg2.png')" }}
    >
      <div className="p-6 max-w-[1500px] mx-auto flex min-h-screen text-white gap-8">
        {/* Partie gauche : Infos du problème */}
        <div className="bg-[#1F2A35] text-white p-6 rounded-lg w-full md:max-w-md space-y-6">

      {/* Navigation Buttons */}
      <div className="flex flex-row gap-2 mb-4">
        <button onClick={onBackToList} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded transition">
          📋 Liste de questions
        </button>
        <button onClick={onPrevious} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition">
          <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button onClick={onNext} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <span className={`m-auto text-sm font-semibold ${problem.solved ? 'text-green-500' : 'text-red-500'}`}>
          {problem.solved ? 'Solved' : 'Unsolved'}
        </span>
      </div>

      {/* Tabs */}
      <div>
        <div className="flex border-b border-gray-600 mb-4">
          <button
            onClick={() => setActiveTab('description')}
            className={`px-4 py-2 text-sm font-medium transition ${
              activeTab === 'description'
                ? 'border-b-2 border-blue-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab('solution')}
            className={`px-4 py-2 text-sm font-medium transition ${
              activeTab === 'solution'
                ? 'border-b-2 border-blue-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Solution
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'description' && (
          <div>
            <h1 className="text-xl font-semibold mb-2">{problem.title}</h1>
            <p
              className={`text-sm mb-2 font-semibold ${
                problem.difficulty === "Easy"
                  ? "text-blue-400"
                  : problem.difficulty === "Medium"
                  ? "text-orange-400"
                  : "text-red-400"
              }`}
            >
              {problem.difficulty}
            </p>
            <p className="text-gray-100">{problem.description}</p>
          </div>
        )}

        {activeTab === 'solution' && (
          <div>
            {problem.solution ? (
                <div>
                  <p className="text-gray-100 whitespace-pre-wrap">{result}</p>
                  <p className="text-gray-100 whitespace-pre-wrap">{problem.explaination}</p>
                  </div>
            ) : (
              <p className="text-gray-400 italic">Aucune solution disponible pour ce problème.</p>
            )}
          </div>
        )}
      </div>
    </div>

      {/* Partie droite */}
      <div className="w-1/2 flex flex-col gap-6">
        {/* Replayer en haut */}
        <div className="aspect-video border border-gray-700 overflow-hidden rounded-lg">
          <iframe
            src={problem.replayerurl}
            className="w-full h-full"
            allowFullScreen
          />
        </div>

        {/* Réponses en bas */}
        <form onSubmit={handleSubmit}
              className="p-4 rounded-lg flex flex-col items-center space-y-4 text-white max-w-2xl">
          <p className="text-lg font-semibold mb-4">Quelle est votre décision ?</p>

          <ul className="grid gap-6 md:grid-cols-2 w-full">
            {Object.values(problem.options ?? {}).map((answer, index) => {
              const inputId = `answer-${index}`;
              const isCorrect = answer === problem.solution;
              const isSelected = selected === answer;
              const isAnswered = hasAnswered || result !== null;

              let labelClass = `
                inline-flex items-center justify-center w-full p-5 border rounded-lg cursor-pointer
                transition hover:bg-gray-100 dark:hover:bg-gray-700
              `;

              if (isAnswered && isSelected) {
                labelClass += isCorrect
                  ? " bg-green-600 text-white border-green-700"
                  : " bg-red-600 text-white border-red-700";
              } else {
                labelClass += `
                  text-gray-400 border-gray-300
                  dark:border-gray-400 dark:text-gray-400
                  peer-checked:border-blue-600 peer-checked:text-blue-600
                  dark:peer-checked:text-blue-500 dark:peer-checked:border-blue-500
                `;
              }

              return (
                <li key={inputId}>
                  <input
                    type="radio"
                    id={inputId}
                    name="answer"
                    value={answer}
                    checked={isSelected}
                    onChange={() => setSelected(answer)}
                    disabled={isAnswered}
                    className="hidden peer"
                    required
                  />
                  <label htmlFor={inputId} className={labelClass}>
                    <span className="flex justify-center">
                      <span className="text-lg font-semibold">{answer}</span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>

          <button 
            type="submit"
            disabled={hasAnswered}
            className={`font-semibold text-white font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 focus:outline-none focus:ring-4 ${
              hasAnswered 
                ? 'bg-gray-500 cursor-not-allowed' 
                : 'bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
            }`}
          >
            {hasAnswered ? 'Déjà répondu' : 'Valider'}
          </button>

        </form>

      </div>
    </div>
    </div>
  );
}
