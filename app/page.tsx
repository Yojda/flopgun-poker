import { listProblems } from "./actions/problemActions";
import AuthButtons from './AuthButtons';

const categories = ['All', 'Pot Open', 'Pot 3bet', 'BVB'];

export default async function ProblemsPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const selectedCategory = params?.category || 'All';

  const problems = await listProblems();

  const filteredProblems =
    selectedCategory === 'All'
      ? problems
      : problems.filter((p) => p.categories?.includes(selectedCategory));

  return (
    <div
      className="bg-fixed bg-cover bg-center w-screen min-h-screen"
      style={{ backgroundImage: "url('/images/bg1.png')" }}
    >
      <div className="p-6 max-w-[1000px] mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-white">Poker Practice</h1>
          <AuthButtons />
        </div>

        <div className="flex gap-4 mb-6 flex-wrap">
          {categories.map((cat) => (
            <form key={cat} method="GET">
              <input type="hidden" name="category" value={cat} />
              <button
                type="submit"
                className={`px-4 py-2 rounded-full ${
                  selectedCategory === cat
                    ? 'bg-white text-black'
                    : 'bg-[#182B35] text-white hover:bg-white hover:text-black'
                } transition`}
              >
                {cat}
              </button>
            </form>
          ))}
        </div>

        <ul className="space-y-2">
          {filteredProblems.length > 0 ? (
            filteredProblems.map((problem) => (
              <li key={problem.id}>
                <a
                  href={`/problems/${problem.id}`}
                  className="block w-full px-8 py-4 rounded-lg bg-[#182B35] hover:bg-[#3E4F57] transition text-left flex justify-between items-center"
                >
                  <div>
                    <strong>
                      {problem.id}. {problem.title}
                    </strong>
                  </div>
                  <p
                    className={`text-sm font-semibold ${
                      problem.difficulty === 'Easy'
                        ? 'text-blue-400'
                        : problem.difficulty === 'Medium'
                        ? 'text-orange-400'
                        : 'text-red-400'
                    }`}
                  >
                    {problem.difficulty}
                  </p>
                </a>
              </li>
            ))
          ) : (
            <p className="text-white">Aucun problème trouvé.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
