import { prisma } from '@/main/utils/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();

  const problem = await prisma.problem.create({
    data: {
      title: body.title,
      difficulty: body.difficulty,
      categories: body.categories,
      description: body.description,
      replayerurl: body.replayerurl,
      options: body.options,
      solution: body.solution,
      explanation: body.explanation,
    },
  });

  return NextResponse.json(problem);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();

  await prisma.problem.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}

export async function PUT(req: Request) {
  const body = await req.json();

  const updated = await prisma.problem.update({
    where: { id: body.id },
    data: {
      title: body.title,
      difficulty: body.difficulty,
      categories: body.categories,
      description: body.description,
      replayerurl: body.replayerurl,
      options: body.options,
      solution: body.solution,
      explanation: body.explanation,
    },
  });

  return NextResponse.json(updated);
}

export async function GET() {
  try {
    const problems = await prisma.problem.findMany({
      orderBy: { id: 'asc' }, // facultatif : trie par ID croissant
    });

    return NextResponse.json(problems);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la récupération des problèmes' }, { status: 500 });
  }
}
