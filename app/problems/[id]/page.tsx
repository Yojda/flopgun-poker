"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useAuth } from "../../hooks/useAuth";
import * as problemStateActions from "../../actions/problemStateActions";
import { setCountdownStart, getCountdownInfo, resetCountdown } from "../../actions/problemStateActions";
import { saveAttempt, getAttempts } from "../../actions/problemStateActions";
import { getProblem, listProblems } from "../../actions/problemActions";
import { use } from "react";

export default function ProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [problem, setProblem] = useState<any>(null);
  const [allProblems, setAllProblems] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'description' | 'solution'>('description');
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [problemState, setProblemState] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const [countdownActive, setCountdownActive] = useState(false);
  const [canRetry, setCanRetry] = useState(false);
  const [countdownInterval, setCountdownInterval] = useState<NodeJS.Timeout | null>(null);
  const [attempts, setAttempts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      const p = await getProblem(id);
      const all = await listProblems();
      setProblem(p);
      setAllProblems(all);
      setLoading(false);
    }
    fetchData();
  }, [id]);

  // Navigation helpers
  const currentIndex = allProblems.findIndex(p => p.id === Number(id));
  const previousId = currentIndex > 0 ? allProblems[currentIndex - 1]?.id : null;
  const nextId = currentIndex < allProblems.length - 1 ? allProblems[currentIndex + 1]?.id : null;
  const onPrevious = () => previousId && router.push(`/problems/${previousId}`);
  const onNext = () => nextId && router.push(`/problems/${nextId}`);
  const onBackToList = () => router.push(`/`);

  // Wrapper pour démarrer un problème via server action
  const startProblem = async () => {
    if (!user) return;
    try {
      const state = await problemStateActions.startProblem(user.id, Number(id));
      setProblemState(state.state);
    } catch (error: any) {
      // Peut arriver si déjà démarré ou déjà réussi
      console.log('Start problem error:', error.message);
    }
  };

  // Wrapper pour soumettre une réponse via server action
  const submitAnswer = async (isCorrect: boolean) => {
    if (!user) return;
    try {
      const state = await problemStateActions.submitAnswer(user.id, Number(id), isCorrect);
      setProblemState(state.state);
      setHasAnswered(true);
      
      // Rafraîchir les données après une réponse
      await fetchProblemState();
    } catch (error: any) {
      // Peut arriver si déjà répondu correctement
      console.log('Submit answer error:', error.message);
    }
  };

  // Wrapper pour récupérer l'état du problème via server action
  const fetchProblemState = async () => {
    if (!user) return;
    try {
      const state = await problemStateActions.getProblemState(user.id, Number(id));
      if (state) {
        setProblemState(state.state);
        if (state.state === 'correct' || state.state === 'incorrect') {
          setHasAnswered(true);
          // Afficher le résultat précédent
          if (state.state === 'correct') {
            setResult("✅ Bonne réponse !");
            // Garder la bonne réponse sélectionnée
            setSelected(problem?.solution || null);
          } else {
            setResult(`❌ Mauvaise réponse. La bonne réponse est : ${problem?.solution}`);
          }
        }
      }
    } catch (error: any) {}
  };

  // Fonction pour rafraîchir toutes les données
  const refreshData = async () => {
    await fetchProblemState();
    if (user) {
      const userAttempts = await getAttempts(user.id, Number(id));
      setAttempts(userAttempts);
    }
  };

  useEffect(() => {
    if (problem && user) {
      fetchProblemState();
    }
    // eslint-disable-next-line
  }, [problem, user]);

  useEffect(() => {
    if (!problemState && isAuthenticated && user) {
      startProblem();
    }
    // eslint-disable-next-line
  }, [problemState, isAuthenticated, user]);

  // Charger les tentatives
  useEffect(() => {
    async function loadAttempts() {
      if (!user) return;
      const userAttempts = await getAttempts(user.id, Number(id));
      setAttempts(userAttempts);
    }
    loadAttempts();
  }, [user, id]);

  // Rafraîchir les données quand on revient sur la page
  useEffect(() => {
    const handleFocus = () => {
      refreshData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, id, problem]);

  // Vérifie le timer serveur au chargement et à l'intervalle
  useEffect(() => {
    let clientTimer: NodeJS.Timeout;
    
    async function checkCountdown() {
      if (!user) return;
      const info = await getCountdownInfo(user.id, Number(id));
      if (info && info.isActive) {
        setCountdownActive(true);
        setCountdown(info.remainingSeconds);
        setCanRetry(false);
        
        // Utiliser un timer côté client pour les mises à jour visuelles
        if (clientTimer) clearInterval(clientTimer);
        clientTimer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              setCountdownActive(false);
              setCountdown(0);
              setCanRetry(false); // Pas besoin du bouton réessayer
              setSelected(null);
              setResult(null);
              setHasAnswered(false);
              setActiveTab('description'); // Retourner à la description
              clearInterval(clientTimer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
      } else if (info && !info.isActive) {
        setCountdownActive(false);
        setCountdown(0);
        setCanRetry(false);
        // Permettre de répondre directement après la fin du timer
        setSelected(null);
        setResult(null);
        setHasAnswered(false);
        setActiveTab('description');
        // Arrêter les vérifications une fois le timer terminé
        if (clientTimer) clearInterval(clientTimer);
      } else {
        setCountdownActive(false);
        setCountdown(30);
        setCanRetry(false);
      }
    }
    
    // Vérifier seulement au chargement de la page
    if (user) {
      checkCountdown();
    }
    
    return () => {
      if (clientTimer) clearInterval(clientTimer);
    };
  }, [user, id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (result || hasAnswered || countdownActive) {
      return;
    }
    if (selected === null) {
      setResult("Veuillez choisir une réponse.");
      return;
    }
    const isCorrect = selected === problem.solution;
    
    // Sauvegarder la tentative
    if (user) {
      await saveAttempt(user.id, Number(id), selected, isCorrect);
      // Recharger les tentatives
      const userAttempts = await getAttempts(user.id, Number(id));
      setAttempts(userAttempts);
    }
    
    await submitAnswer(isCorrect);
    setActiveTab('solution');
    if (isCorrect) {
      setResult("✅ Bonne réponse !");
    } else {
      setResult(`❌ Mauvaise réponse. La bonne réponse est : ${problem.solution}`);
      // Démarrer le décompte côté serveur
      if (user) await setCountdownStart(user.id, Number(id));
      
      // Récupérer immédiatement le temps restant après avoir démarré le timer
      const info = await getCountdownInfo(user!.id, Number(id));
      if (info && info.isActive) {
        setCountdownActive(true);
        setCountdown(info.remainingSeconds);
        setCanRetry(false);
        
        // Utiliser un timer côté client pour les mises à jour visuelles
        const clientTimer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              setCountdownActive(false);
              setCountdown(0);
              setCanRetry(false); // Pas besoin du bouton réessayer
              setSelected(null);
              setResult(null);
              setHasAnswered(false);
              setActiveTab('description'); // Retourner à la description
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        // Nettoyer le timer après 30 secondes
        setTimeout(() => {
          clearInterval(clientTimer);
        }, 30000);
      }
    }
  }

  // Fonction pour réessayer après le décompte (maintenant optionnelle)
  const handleRetry = async () => {
    setSelected(null);
    setResult(null);
    setHasAnswered(false);
    setCanRetry(false);
    setActiveTab('description');
    // Reset le timer côté serveur
    if (user) await resetCountdown(user.id, Number(id));
    // Rafraîchir les données
    await refreshData();
  };

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

  if (!problem) {
    return null;
  }

  return (
    <div
      className="bg-fixed bg-cover bg-center w-screen min-h-screen"
      style={{ backgroundImage: "url('/images/bg2.png')" }}
    >
      <div className="p-6 max-w-[1500px] mx-auto flex min-h-screen text-white gap-8">
        {/* Partie gauche : Infos du problème */}
        <div className="bg-[#1F2A35] text-white p-6 rounded-lg w-full md:max-w-md space-y-6">
          <button onClick={onBackToList} className="text-blue-400 hover:underline mb-2">← Retour à la liste</button>
          <div className="flex border-b border-gray-600 mb-4">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-4 py-2 text-sm font-medium transition ${activeTab === 'description' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('solution')}
              className={`px-4 py-2 text-sm font-medium transition ${activeTab === 'solution' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Solution
            </button>
          </div>
          {activeTab === 'description' && (
            <div>
              <h1 className="text-xl font-semibold mb-2">{problem.title}</h1>
              <p className={`text-sm mb-2 font-semibold ${problem.difficulty === "Easy" ? "text-blue-400" : problem.difficulty === "Medium" ? "text-orange-400" : "text-red-400"}`}>{problem.difficulty}</p>
              <p className="text-gray-100">{problem.description}</p>
            </div>
          )}
          {activeTab === 'solution' && (
            <div>
              {problem.solution ? (
                <div>
                  <p className="text-gray-100 whitespace-pre-wrap">{typeof result === 'string' ? result : String(result)}</p>
                  <p className="text-gray-100 whitespace-pre-wrap">{problem.explaination}</p>
                </div>
              ) : (
                <p className="text-gray-400 italic">Aucune solution disponible pour ce problème.</p>
              )}
            </div>
          )}
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
          <form onSubmit={handleSubmit} className="p-4 rounded-lg flex flex-col items-center space-y-4 text-white max-w-2xl">
            <p className="text-lg font-semibold mb-4">Quelle est votre décision ?</p>
            
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
          
          {/* Tableau des tentatives */}
          {attempts.length > 0 && (
            <div className="mt-6 p-4 bg-[#1F2A35] rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-3">Historique des tentatives</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="text-left py-2 text-gray-300">Date</th>
                      <th className="text-left py-2 text-gray-300">Réponse</th>
                      <th className="text-center py-2 text-gray-300">Résultat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.map((attempt, index) => (
                      <tr key={attempt.id} className="border-b border-gray-700">
                        <td className="py-2 text-gray-300">
                          {formatDate(attempt.submitted_at)}
                        </td>
                        <td className="py-2 text-white">
                          {attempt.answer}
                        </td>
                        <td className="py-2 text-center">
                          {attempt.is_correct ? (
                            <span className="text-green-400 font-bold">✅ Correct</span>
                          ) : (
                            <span className="text-red-400 font-bold">❌ Incorrect</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <div className="flex justify-between mt-4">
            <button onClick={onPrevious} disabled={!previousId} className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50">Précédent</button>
            <button onClick={onNext} disabled={!nextId} className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50">Suivant</button>
          </div>
        </div>
      </div>
    </div>
  );
}
