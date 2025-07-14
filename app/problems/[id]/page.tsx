"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState, useTransition } from "react";
import { useAuth } from "../../hooks/useAuth";
import * as problemStateActions from "../../actions/problemStateActions";
import { setCountdownStart, getCountdownInfo, resetCountdown } from "../../actions/problemStateActions";
import { saveAttempt, getAttempts } from "../../actions/problemStateActions";
import { getProblem, listProblems } from "../../actions/problemActions";
import { use } from "react";
import ReactMarkdown from 'react-markdown';
import Loading from "./loading";

export default function ProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [problem, setProblem] = useState<any>(null);
  const [previousProblem, setPreviousProblem] = useState<any>(null);
  const [nextProblem, setNextProblem] = useState<any>(null);
  const [allProblems, setAllProblems] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'description' | 'solution'>('description');
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [problemState, setProblemState] = useState<string | null | undefined>(undefined);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [countdownActive, setCountdownActive] = useState(false);
  const [canRetry, setCanRetry] = useState(false);
  const [countdownInterval, setCountdownInterval] = useState<NodeJS.Timeout | null>(null);
  const [attempts, setAttempts] = useState<any[]>([]);

  const onPrevious = () => {
    if (previousProblem) router.push(`/problems/${previousProblem.id}`);
  };
  const onNext = () => {
    if (nextProblem) router.push(`/problems/${nextProblem.id}`);
  };
  const onBackToList = () => router.push(`/`);

  const fetchProblem = async () => {
    const p = await getProblem(id);
    setProblem(p);
    const prev = await getProblem(String(Number(id) - 1));
    setPreviousProblem(prev);
    const next = await getProblem(String(Number(id) + 1));
    setNextProblem(next);
    setLoading(false);
  }

  // Charger le problème, le précédent et le suivant
  useEffect(() => {
    console.log('Fetching problem with ID:', id);
    fetchProblem();
    fetchProblemState();
  }, [id]);

  // Wrapper pour démarrer un problème via server action
  const startProblem = async () => {
    if (!user) return;
    try {
      const state = await problemStateActions.startProblem(user.id, Number(id));
      setProblemState(state.state);
    } catch (error: any) {
      console.log('Start problem error:', error.message);
    }
  };

  // Wrapper pour soumettre une réponse via server action
  const submitAnswer = async (isCorrect: boolean) => {
    if (!user) return;
    try {
      const state = await problemStateActions.submitAnswer(user.id, Number(id), isCorrect);
    } catch (error: any) {
      console.log('Submit answer error:', error.message);
    }
  };

  // Wrapper pour récupérer l'état du problème via server action
  const fetchProblemState = async () => {
    console.info('Fetching problem state for user:', user, 'and problem:', id, 'and problemState:', problemState);
    if (!user) return;
    try {
      const state = await problemStateActions.getProblemState(user.id, Number(id));
      console.log('[ACTION] Problem state fetched:', state);
      const userAttempts = await getAttempts(user.id, Number(id));
      console.log('[ACTION] User attempts fetched:', userAttempts);
      setAttempts(userAttempts);
      if (state) {
        setProblemState(state.state);
        return state.state;
      } else {
        return undefined;
      }
    } catch (error: any) {}
  };

  const getProblemInfos = async () => {
    const info = await getCountdownInfo(user!.id, Number(id));
    console.log('Countdown info:', info);
    return info;
  }

  // Appeler startProblem au montage si user et problem existent
  useEffect(() => {
    if (!user || !problem) return;

    fetchProblemState().then((r) => {
      console.info('Problem state fetched:', r);
      if (r === undefined) {
        startProblem().then(() => {console.log('Problem started : ', problemState);});
      } else if (r === 'correct') {
        console.log('Problem already solved');
        setResult(problem.explanation);
        setSelected(problem?.solution || null);
      } else if (r === 'incorrect') {
        console.log('Problem was answered incorrectly, starting countdown');
        getProblemInfos().then(r => {
          if (r !== null) {
            if (r.isActive) {
              console.log('Countdown is active, starting countdown with remaining seconds:', r.remainingSeconds);
              startCount(r);
            } else {
              console.log('Countdown is not active, resetting countdown');
              setProblemState('started');
            }
          }
        });
      }
    });
  }, [user, problem]);

  const startCount = async (info: { isActive: boolean; remainingSeconds: number; countdownStart: Date }) => {
    setCountdownActive(true);
    setCountdown(info.remainingSeconds);
    setCanRetry(false);

    const clientTimer = setInterval(() => {
      setCountdown(prev => {
        if (prev === null) return Number(process.env.NEXT_PUBLIC_WRONG_ANSWER_WAIT_TIME) || 30;
        if (prev <= 1) {
          setCountdownActive(false);
          setCountdown(0);
          setProblemState('started');
          setCanRetry(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Nettoyer le timer après le temps d'attente défini en variable d'environnement
    setTimeout(() => {
      clearInterval(clientTimer);
    }, process.env.NEXT_PUBLIC_WRONG_ANSWER_WAIT_TIME ? Number(process.env.NEXT_PUBLIC_WRONG_ANSWER_WAIT_TIME) * 1000 : 30000);
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!user) return;

    e.preventDefault();
    if (selected === null) {
      setResult("Veuillez choisir une réponse.");
      return;
    }
    const isCorrect = selected === problem.solution;

    await saveAttempt(user.id, Number(id), selected, isCorrect);
    const userAttempts = await getAttempts(user.id, Number(id));
    setAttempts(userAttempts);
    
    await submitAnswer(isCorrect);

    if (isCorrect) {
      setActiveTab('solution');
      setResult(problem.explanation);
      setProblemState('correct');
    } else {
      await setCountdownStart(user.id, Number(id)).then(() => {
        setProblemState('incorrect');
        startCount({
          isActive : true,
          remainingSeconds : process.env.NEXT_PUBLIC_WRONG_ANSWER_WAIT_TIME ? Number(process.env.NEXT_PUBLIC_WRONG_ANSWER_WAIT_TIME) : 30,
          countdownStart : new Date()
        });
      });
    }
  }

  // Formater la date pour l'affichage
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <Loading/>;
  }

  if (!problem) {
    return <div className="p-8">Problème non trouvé</div>;
  }

  return (
    <div
      className="bg-fixed bg-cover bg-center w-screen min-h-screen"
      style={{ backgroundImage: "url('/images/bg2.png')" }}
    >
      <div className="p-6 max-w-[1500px] mx-auto flex min-h-screen text-white gap-8">
        {/* Partie gauche : Infos du problème */}
        <div className="bg-[#1F2A35] text-white p-6 rounded-lg w-1/2 md:max-w-md space-y-6">
          <div className="flex justify-between">
            <button onClick={onPrevious} disabled={!previousProblem} className="px-4 bg-gray-700 rounded disabled:opacity-50">Précédent</button>
            <button onClick={onNext} disabled={!nextProblem} className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50">Suivant</button>
          </div>
          <button onClick={onBackToList} className="text-blue-400 hover:underline mb-2">
            ← Liste des problèmes
          </button>

          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'description'
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('solution')}
              disabled={!(problemState === 'correct')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'solution'
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Solution
            </button>
          </div>

          <div className="space-y-6">
            {/* Tags de catégories */}
            <div className="flex flex-wrap gap-2">
              {problem.categories.map((category: string) => (
                <span
                  key={category}
                  className={`px-3 py-1 rounded-full text-sm ${
                    category === 'Maths' ? 'bg-purple-800' :
                    category === 'Stratégie' ? 'bg-blue-800' :
                    category === 'Tactique' ? 'bg-green-800' :
                    'bg-gray-700'
                  }`}
                >
                  {category}
                </span>
              ))}
            </div>

            {/* Contenu de l'onglet */}
            <div>
              {activeTab === 'description' ? (
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown>{problem.description}</ReactMarkdown>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown>{problem.explanation}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Partie droite */}
        <div className="w-1/2 flex flex-col gap-6">
          {/* Replayer en haut */}
          <div className="aspect-video border border-gray-700 overflow-hidden rounded-lg">
            {!problem.replayerurl ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                Aucune vidéo disponible pour ce problème.
              </div>
            ) : (
              <iframe
                src={problem.replayerurl}
                className="w-full h-full"
                allowFullScreen
              />
            )}
          </div>
          {/* Réponses en bas */}
          <form onSubmit={handleSubmit} className="p-4 rounded-lg flex flex-col items-center space-y-4 text-white">

            {/* Affichage du décompte */}
            {countdownActive && (
              <div className="w-full bg-red-900/20 border border-red-500 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-400 mb-2">
                  ⏰ {countdown}s
                </div>
                <p className="text-red-300 text-sm">
                  Attendez avant de pouvoir réessayer...
                </p>
              </div>
            )}

            <ul className="grid gap-6 md:grid-cols-2 w-full">
              {Object.values(problem.options ?? {}).map((answer, index) => {
                const inputId = `answer-${index}`;
                const isCorrect = answer === problem.solution;
                const isSelected = selected === answer;
                const isAnswered = hasAnswered || result !== null || countdownActive;
                const isProblemSolved = problemState === 'correct';
                let labelClass = `inline-flex items-center justify-center w-full p-5 border rounded-lg cursor-pointer transition hover:bg-gray-100 dark:hover:bg-gray-700`;

                if (isAnswered && isSelected) {
                  labelClass += isCorrect ? " bg-green-600 text-white border-green-700" : " bg-red-600 text-white border-red-700";
                } else if (isProblemSolved && isCorrect) {
                  // Afficher la bonne réponse en vert même si pas sélectionnée
                  labelClass += " bg-green-600 text-white border-green-700";
                } else {
                  labelClass += ` text-gray-400 border-gray-300 dark:border-gray-400 dark:text-gray-400 peer-checked:border-blue-600 peer-checked:text-blue-600 dark:peer-checked:text-blue-500 dark:peer-checked:border-blue-500`;
                }

                return (
                  <li key={inputId}>
                    <input
                      type="radio"
                      id={inputId}
                      name="answer"
                      value={String(answer)}
                      checked={selected === String(answer)}
                      onChange={() => setSelected(String(answer))}
                      className="hidden peer"
                      disabled={isAnswered || countdownActive || isProblemSolved}
                    />
                    <label htmlFor={inputId} className={labelClass}>
                      {String(answer)}
                    </label>
                  </li>
                );
              })}
            </ul>
            <button
              type="submit"
              className="mt-4 px-6 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50 transition-colors"
              disabled={hasAnswered || countdownActive || problemState === 'correct'}
            >
              {problemState === 'correct' ? 'Problème résolu' : hasAnswered ? 'Déjà répondu' : 'Valider'}
            </button>
          </form>

          {/* Historique des tentatives */}
          {attempts.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Soumissions</h3>
                <div className="text-sm text-gray-400">
                  {attempts.length} tentative{attempts.length > 1 ? 's' : ''}
                </div>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {attempts.map((attempt, index) => (
                  <div
                    key={index}
                    className={`relative p-4 rounded-lg ${
                      attempt.is_correct
                        ? 'bg-green-600/10 border border-green-500/50 hover:border-green-500'
                        : 'bg-red-600/10 border border-red-500/50 hover:border-red-500'
                    } transition-colors`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`text-lg ${attempt.is_correct ? 'text-green-400' : 'text-red-400'}`}>
                          {attempt.is_correct ? '✓' : '✗'}
                        </div>
                        <div>
                          <div className="font-medium">
                            {Object.entries(problem.options).find(([key]) => key === attempt.answer)?.[1] as React.ReactNode}
                          </div>
                          <div className="text-sm text-gray-400">
                            {formatDate(attempt.submitted_at)}
                          </div>
                        </div>
                      </div>
                      {attempt.is_correct ? (
                        <div className="px-2 py-1 text-xs font-medium text-green-400 bg-green-400/10 rounded-full border border-green-400/20">
                          Correct
                        </div>
                      ) : (
                        <div className="px-2 py-1 text-xs font-medium text-red-400 bg-red-400/10 rounded-full border border-red-400/20">
                          Incorrect
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
