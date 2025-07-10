"use client";
import { useAuth } from './hooks/useAuth';
import * as problemStateActions from './actions/problemStateActions';
import { useEffect, useState } from 'react';
import AuthButtons from './AuthButtons';
import { getXPFromProgress, getLevel, getRank, getRankStyle, getNextLevelXP } from "../src/utils/level";
import { getCountdownInfo } from "./actions/problemStateActions";
import { useRouter } from 'next/navigation';

const categories = ['All', 'Pot Open', 'Pot 3bet', 'BVB'];

export default function ProblemsPage({ searchParams }: { searchParams?: Promise<{ category?: string }> }) {
  const { user, isAuthenticated } = useAuth();
  const [progress, setProgress] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [countdowns, setCountdowns] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchProgress = async () => {
    if (user) {
      const data = await problemStateActions.getUserProgress(user.id);
      setProgress(data);
    }
  };

  useEffect(() => {
    async function fetchData() {
      // Charger les problèmes
      const { listProblems } = await import('./actions/problemActions');
      const allProblems = await listProblems();
      setProblems(allProblems);
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [user]);

  // Écouter les changements de navigation pour rafraîchir le progrès
  useEffect(() => {
    const handleFocus = () => {
      fetchProgress();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  // Vérifier les décomptes pour tous les problèmes
  useEffect(() => {
    async function checkAllCountdowns() {
      if (!user) return;
      
      const countdownData: Record<number, number> = {};
      for (const problem of problems) {
        const info = await getCountdownInfo(user.id, problem.id);
        if (info && info.isActive) {
          countdownData[problem.id] = info.remainingSeconds;
        }
      }
      setCountdowns(countdownData);
    }
    
    if (user && problems.length > 0) {
      checkAllCountdowns();
    }
  }, [user, problems]);

  // Timer côté client pour faire avancer les compteurs
  useEffect(() => {
    const hasActiveCountdowns = Object.values(countdowns).some(time => time > 0);
    
    if (!hasActiveCountdowns) return;
    
    const interval = setInterval(() => {
      setCountdowns(prev => {
        const newCountdowns: Record<number, number> = {};
        let hasActive = false;
        
        for (const [problemId, time] of Object.entries(prev)) {
          const id = parseInt(problemId);
          if (time > 1) {
            newCountdowns[id] = time - 1;
            hasActive = true;
          } else if (time === 1) {
            // Le timer se termine, on le retire
            hasActive = false;
          }
        }
        
        return newCountdowns;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [countdowns]);

  // Rafraîchir les décomptes quand on revient sur la page
  useEffect(() => {
    const handleFocus = () => {
      if (user && problems.length > 0) {
        async function refreshCountdowns() {
          const countdownData: Record<number, number> = {};
          for (const problem of problems) {
            const info = await getCountdownInfo(user!.id, problem.id);
            if (info && info.isActive) {
              countdownData[problem.id] = info.remainingSeconds;
            }
          }
          setCountdowns(countdownData);
        }
        refreshCountdowns();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, problems]);

  function getStateForProblem(problemId: number) {
    return progress.find((p) => p.problem_id === problemId)?.state;
  }

  const filteredProblems =
    selectedCategory === 'All'
      ? problems
      : problems.filter((p) => p.categories?.includes(selectedCategory));

  const total = problems.length;
  const correctCount = progress.filter((p) => p.state === 'correct').length;
  // Adapter le format pour getXPFromProgress
  const progressObj = Array.isArray(progress)
    ? Object.fromEntries(progress.map((p: any) => [p.problem_id, { state: p.state }]))
    : progress;
  const xp = getXPFromProgress(progressObj);
  const level = getLevel(xp);
  const rank = getRank(level);
  const rankStyle = getRankStyle(rank);
  const xpForCurrentLevel = getNextLevelXP(level - 1);
  const xpForNextLevel = getNextLevelXP(level);
  const xpProgress = Math.max(0, xp - xpForCurrentLevel);
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const xpPercent = Math.min(100, Math.round((xpProgress / xpNeeded) * 100));

  return (
    <div
      className="bg-fixed bg-cover bg-center w-screen min-h-screen"
      style={{ backgroundImage: "url('/images/bg1.png')" }}
    >
      <div className="p-6 max-w-[1000px] mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex font-semibold">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center w-16 h-16 rounded-full text-white font-bold text-lg bg-cover bg-center bg-no-repeat"
                style={{ 
                  backgroundImage: `url(${rankStyle.icon})`,
                  boxShadow: `0 0 10px ${rankStyle.color}40`,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                }}
              >
                {level}
              </div>
              <div className="flex flex-col min-w-[120px]">
                <div className="w-full h-3 bg-gray-700 rounded-full my-1 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${xpPercent}%`,
                      background: rankStyle.color,
                      boxShadow: `0 0 6px ${rankStyle.color}80`
                    }}
                  />
                </div>
                <span className="text-xs text-gray-400">{xpProgress} / {xpNeeded} XP</span>
                <span
                  className="font-bold flex items-center gap-1"
                  style={{ color: rankStyle.color }}
                >
                  <span>{rank}</span>
                </span>
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Poker Practice</h1>
          <AuthButtons />
        </div>

        <div className="flex gap-4 mb-6 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full ${
                selectedCategory === cat
                  ? 'bg-white text-black'
                  : 'bg-[#182B35] text-white hover:bg-white hover:text-black'
              } transition`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <div className="mb-4 flex gap-4 items-center font-semibold">
            <span className="flex items-center gap-1 text-green-400"><span className="text-lg">●</span> Réussi</span>
            <span className="flex items-center gap-1 text-red-400"><span className="text-lg">●</span> Échoué</span>
          </div>
          <div className="mb-2 text-white font-semibold">
            {`Réussis : ${correctCount} / ${total}`}
          </div>
        </div>

        

        <ul className="space-y-2">
          {filteredProblems.length > 0 ? (
            filteredProblems.map((problem) => {
              const state = getStateForProblem(problem.id);
              let indicator;
              if (state === 'correct') indicator = <span className="ml-2 text-green-400 text-lg">●</span>;
              else if (state === 'incorrect') indicator = <span className="ml-2 text-red-400 text-lg">●</span>;
              else indicator = <span></span>;              
              const countdown = countdowns[problem.id];
              
              return (
                <li key={problem.id}>
                  <div 
                    className={`flex items-center justify-between p-3 bg-[#1F2A35] rounded-lg transition-colors cursor-pointer ${
                      countdown !== undefined 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-[#2A3744]'
                    }`}
                    onClick={() => {
                      if (countdown === undefined) {
                        router.push(`/problems/${problem.id}`);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">{problem.id}. {problem.title} {indicator}</span>
                        {countdown !== undefined && (
                          <span className="text-red-400 text-sm font-bold bg-red-900/20 px-2 py-1 rounded">
                            ⏰ {countdown}s
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex items-end">
                      <span className="text-gray-400 text-sm">
                        {countdown !== undefined ? 'En cooldown' : ''}
                      </span>
                      <p
                        className={`text-sm font-semibold ml-2 ${
                          problem.difficulty === 'Easy'
                            ? 'text-blue-400'
                            : problem.difficulty === 'Medium'
                            ? 'text-orange-400'
                            : 'text-red-400'
                        }`}
                      >
                        {problem.difficulty}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })
          ) : (
            <p className="text-white">Aucun problème trouvé.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
