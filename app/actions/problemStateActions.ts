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
    throw new Error('User has already started this problem');
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

  if (existingState.state === 'correct' || existingState.state === 'incorrect') {
    throw new Error('User has already answered this problem');
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

  // L'utilisateur peut répondre seulement s'il a commencé mais pas encore répondu
  return state.state === 'started';
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