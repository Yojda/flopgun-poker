'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as problemStateActions from '../actions/problemStateActions';

interface ProblemState {
  id: number;
  problem_id: number;
  user_id: number;
  state: string | null;
  created_at: string | Date | null;
  updated_at: string | Date | null;
  problem?: {
    id: number;
    title: string;
    difficulty: string;
    categories: string[];
  };
}

export default function ProgressStats() {
  const { isAuthenticated, user } = useAuth();
  const [progress, setProgress] = useState<ProblemState[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProgress();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchProgress = async () => {
    try {
      if (!user) return;
      const data = await problemStateActions.getUserProgress(user.id);
      setProgress(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-[#182B35] p-4 rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-600 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-600 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const stats = {
    total: progress.length,
    started: progress.filter(p => p.state === 'started').length,
    correct: progress.filter(p => p.state === 'correct').length,
    incorrect: progress.filter(p => p.state === 'incorrect').length,
    completed: progress.filter(p => p.state === 'correct' || p.state === 'incorrect').length,
  };

  const accuracy = stats.completed > 0 ? Math.round((stats.correct / stats.completed) * 100) : 0;

  const difficultyStats = {
    easy: progress.filter(p => p.problem?.difficulty === 'Easy' && (p.state === 'correct' || p.state === 'incorrect')).length,
    medium: progress.filter(p => p.problem?.difficulty === 'Medium' && (p.state === 'correct' || p.state === 'incorrect')).length,
    hard: progress.filter(p => p.problem?.difficulty === 'Hard' && (p.state === 'correct' || p.state === 'incorrect')).length,
    expert: progress.filter(p => p.problem?.difficulty === 'Expert' && (p.state === 'correct' || p.state === 'incorrect')).length,
  };

  return (
    <div className="bg-[#182B35] p-6 rounded-lg mb-6">
      <h3 className="text-lg font-bold text-white mb-4">📊 Your Progress</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
          <div className="text-sm text-gray-400">Started</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{stats.correct}</div>
          <div className="text-sm text-gray-400">Correct</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-400">{stats.incorrect}</div>
          <div className="text-sm text-gray-400">Incorrect</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">{accuracy}%</div>
          <div className="text-sm text-gray-400">Accuracy</div>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-semibold text-white mb-2">Progress by Difficulty</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="bg-[#2A3B45] p-2 rounded text-center">
            <div className="text-sm font-bold text-green-400">{difficultyStats.easy}</div>
            <div className="text-xs text-gray-400">Easy</div>
          </div>
          <div className="bg-[#2A3B45] p-2 rounded text-center">
            <div className="text-sm font-bold text-yellow-400">{difficultyStats.medium}</div>
            <div className="text-xs text-gray-400">Medium</div>
          </div>
          <div className="bg-[#2A3B45] p-2 rounded text-center">
            <div className="text-sm font-bold text-red-400">{difficultyStats.hard}</div>
            <div className="text-xs text-gray-400">Hard</div>
          </div>
          <div className="bg-[#2A3B45] p-2 rounded text-center">
            <div className="text-sm font-bold text-purple-400">{difficultyStats.expert}</div>
            <div className="text-xs text-gray-400">Expert</div>
          </div>
        </div>
      </div>

      {stats.started > 0 && (
        <div className="text-center">
          <div className="text-sm text-gray-400 mb-1">
            {stats.started} problem{stats.started > 1 ? 's' : ''} in progress
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(stats.completed / (stats.total || 1)) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
} 