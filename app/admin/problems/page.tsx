import { listProblems } from '../../actions/problemActions';
import ProblemAdminClient from './ProblemAdminClient';

export default async function ProblemAdminPage() {
  const problems = await listProblems();

  return <ProblemAdminClient initialProblems={problems} />;
}
