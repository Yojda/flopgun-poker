"use client";

import React, { useState } from "react";

const categories = ["All", "Pot Open", "Pot 3bet", "BVB"];

const problems = [
  {id: 1, title: "[MTT MS 5€ - Milieu MTT] Pot open CO vs LJ 25 BB deep", categories: ["Pot Open"], difficulty: "Easy", success: true},
  {id: 2, title: "[MTT MS 5€ - Début de tournoi] Pot open CO vs BB 35 BB deep", categories: ["Pot Open"], difficulty: "Easy", success : false},
  {id: 3, title: "[MTT MS 5€ - Début de tournoi] Pot 3bet BTN vs LJ 35 BB deep", categories: ["Pot 3bet"], difficulty: "Easy", success : false}
];

export default function ProblemsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProblems =
    selectedCategory === "All"
      ? problems
      : problems.filter((p) =>
          p.categories.includes(selectedCategory)
        );

  return (
      <div className="bg-fixed bg-cover bg-center w-screen h-screen"
      style={{ backgroundImage: "url('images/bg1.png')" }}
      >
          <div className="p-6 max-w-[1000px] mx-auto">
          <h1 className="text-2xl font-bold mb-4">Poker Practice</h1>

          <div className="flex gap-4 mb-6 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full ${
                  selectedCategory === cat
                    ? "bg-white text-black"
                    : "bg-[#182B35] text-white"
                }`}
              >
                {selectedCategory === cat ? <strong>{cat}</strong> : cat}
              </button>
            ))}
          </div>
            <ul className="space-y-2">
              {filteredProblems.length > 0 ? (
                filteredProblems.map((problem) => (
                  <li key={problem.id}>
                      <button
                        onClick={() => console.log("Clicked:", problem.title)} // remplace ça par ta logique TODO
                        className="w-full px-8 py-4 rounded-lg bg-[#182B35] hover:bg-[#3E4F57] transition text-left flex justify-between items-center"
                      >
                        <div>
                          <strong>{problem.id}. {problem.title}</strong>
                        </div>
                        <span className="text-gray-400 text-sm">{problem.difficulty}</span>
                      </button>
                    </li>
                ))
              ) : (
                <p>Aucun problème trouvé pour cette catégorie.</p>
              )}
            </ul>
        </div>
      </div>
  );
}

