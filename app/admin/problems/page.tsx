import { listProblems } from '../../actions/problemActions';
import ProblemAdminClient from './ProblemAdminClient';

export default async function ProblemAdminPage() {
  const problems = await listProblems();
  console.log('Loaded problems:', problems);

  return <ProblemAdminClient initialProblems={problems} />;
}
