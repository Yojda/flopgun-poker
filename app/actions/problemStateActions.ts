"use server";
import { prisma } from "@/main/utils/db";

export async function startProblem(userId: number, problemId: number) {
  // Vérifier si l'utilisateur a déjà commencé ce problème
  const existingState = await prisma.problemstate.findFirst({
    where: {
      user_id: userId,
      problem_id: problemId,
    },
  });
  
  if (existingState) {
    // Si l'utilisateur a déjà répondu incorrectement, on peut refaire le problème
    if (existingState.state === 'incorrect') {
      // Réinitialiser l'état pour permettre une nouvelle tentative
      return await prisma.problemstate.update({
        where: { id: existingState.id },
        data: {
          state: 'started',
          countdown_start: null,
          updated_at: new Date(),
        },
      });
    }
    // Si déjà en cours ou déjà réussi, retourner l'état existant
    return existingState;
  }

  // Créer un nouvel état "started"
  return await prisma.problemstate.create({
    data: {
      problem_id: problemId,
      user_id: userId,
      state: 'started'
    },
  });
}

export async function submitAnswer(userId: number, problemId: number, isCorrect: boolean) {
  // Vérifier si l'utilisateur a déjà répondu à ce problème
  const existingState = await prisma.problemstate.findFirst({
    where: {
      user_id: userId,
      problem_id: problemId,
    },
  });
  
  if (!existingState) {
    throw new Error('User has not started this problem');
  }

  // Empêcher de répondre si déjà réussi
  if (existingState.state === 'correct') {
    throw new Error('User has already answered this problem correctly');
  }

  // Permettre de soumettre une réponse si en cours ou échoué
  if (existingState.state !== 'started' && existingState.state !== 'incorrect') {
    throw new Error('Problem is not in a valid state for answering');
  }

  // Mettre à jour l'état avec la réponse
  const newState = isCorrect ? 'correct' : 'incorrect';
  return await prisma.problemstate.update({
    where: { id: existingState.id },
    data: { 
      state: newState,
      updated_at: new Date(),
    },
  });
}

export async function getUserProgress(userId: number) {
  return await prisma.problemstate.findMany({
    where: {
      user_id: userId,
    },
    include: {
      problem: true,
    },
  });
}

export async function getProblemState(userId: number, problemId: number) {
  return await prisma.problemstate.findFirst({
    where: {
      user_id: userId,
      problem_id: problemId,
    },
  });
}

export async function canAnswerProblem(userId: number, problemId: number) {
  const state = await prisma.problemstate.findFirst({
    where: {
      user_id: userId,
      problem_id: problemId,
    },
  });
  
  if (!state) {
    return true; // L'utilisateur n'a jamais commencé ce problème
  }

  // L'utilisateur peut répondre seulement s'il n'a pas encore réussi
  return state.state === 'started' || state.state === 'incorrect';
}

export async function canRetryProblem(userId: number, problemId: number) {
  const state = await prisma.problemstate.findFirst({
    where: {
      user_id: userId,
      problem_id: problemId,
    },
  });
  
  if (!state) {
    return false; // Pas encore commencé
  }

  // Peut refaire seulement si échoué
  return state.state === 'incorrect';
}

export async function hasAnsweredProblem(userId: number, problemId: number) {
  const state = await prisma.problemstate.findFirst({
    where: {
      user_id: userId,
      problem_id: problemId,
    },
  });
  
  if (!state) {
    return false;
  }

  return state.state === 'correct' || state.state === 'incorrect';
}

export async function setCountdownStart(userId: number, problemId: number) {
  const state = await prisma.problemstate.findFirst({
    where: {
      user_id: userId,
      problem_id: problemId,
    },
  });
  
  if (!state) {
    throw new Error('User has not started this problem');
  }

  // Sauvegarder le timestamp du début du décompte
  return await prisma.problemstate.update({
    where: { id: state.id },
    data: { 
      countdown_start: new Date(),
      updated_at: new Date(),
    },
  });
}

export async function getCountdownInfo(userId: number, problemId: number) {
  const state = await prisma.problemstate.findFirst({
    where: {
      user_id: userId,
      problem_id: problemId,
    },
  });
  
  if (!state || !state.countdown_start) {
    return null;
  }

  const now = new Date();
  const countdownStart = new Date(state.countdown_start);
  const elapsedSeconds = Math.floor((now.getTime() - countdownStart.getTime()) / 1000);
  const remainingSeconds = Math.max(0, 30 - elapsedSeconds);
  const isActive = remainingSeconds > 0;

  return {
    isActive,
    remainingSeconds,
    countdownStart: state.countdown_start,
  };
}

export async function resetCountdown(userId: number, problemId: number) {
  const state = await prisma.problemstate.findFirst({
    where: {
      user_id: userId,
      problem_id: problemId,
    },
  });
  
  if (!state) {
    throw new Error('User has not started this problem');
  }

  return await prisma.problemstate.update({
    where: { id: state.id },
    data: { 
      countdown_start: null,
      updated_at: new Date(),
    },
  });
}

export async function saveAttempt(userId: number, problemId: number, answer: string, isCorrect: boolean) {
  return await prisma.attempts.create({
    data: {
      problem_id: problemId,
      user_id: userId,
      answer: answer,
      is_correct: isCorrect,
    },
  });
}

export async function getAttempts(userId: number, problemId: number) {
  return await prisma.attempts.findMany({
    where: {
      user_id: userId,
      problem_id: problemId,
    },
    orderBy: {
      submitted_at: 'desc',
    },
  });
} 