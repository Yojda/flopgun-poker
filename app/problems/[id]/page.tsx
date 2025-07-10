import ProblemDetails from "./ProblemDetailsClient";
import { getProblem, listProblems } from "../../actions/problemActions";
import { notFound } from "next/navigation";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { redirect } from "next/navigation";

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

export async function getUserFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return payload; // { userId: ... }
  } catch (err) {
    return null;
  }
}

export default async function ProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const problem = await getProblem(id);
  const allProblems = await listProblems();
  const user = await getUserFromCookie();

  if (!user) {
    return redirect("/login");
  }

  if (!problem) return notFound();

  const currentIndex = allProblems.findIndex(p => p.id === Number(id));
  const previousId = currentIndex > 0 ? allProblems[currentIndex - 1].id : null;
  const nextId = currentIndex < allProblems.length - 1 ? allProblems[currentIndex + 1].id : null;

  return (
    <ProblemDetails
      user={user}
      problem={problem}
      previousId={previousId}
      nextId={nextId}
    />
  );
}
