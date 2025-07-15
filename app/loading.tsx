import React from "react";

export default function Loading(props: { nbProblems: number }) {
  const items = Array.from({ length: props.nbProblems });

  return (
    <ul className="space-y-2">
      {items.map((_, index) => (
        <li key={index}>
          <div
            className="flex items-center justify-between h-12">
            <span className="w-full h-full bg-gray-700 rounded-lg animate-pulse"></span>
          </div>
        </li>
      ))}
    </ul>
  );
}
