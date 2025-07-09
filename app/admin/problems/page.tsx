import { ProblemService } from '@/main/services/problemService';
import ProblemAdminClient from './ProblemAdminClient';

export default async function ProblemAdminPage() {
  const problems = await ProblemService.listProblems();
  console.log('Loaded problems:', problems);

  return <ProblemAdminClient initialProblems={problems} />;
}
