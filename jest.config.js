/** @type {import("jest").Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1", // Pour supporter les imports "@/..."
  },
  transform: {
    "^.+\\.tsx?$": "ts-jest", // Pour compiler TypeScript
  },
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"], // Pour trouver les tests
  moduleFileExtensions: ["ts", "tsx", "js", "json", "node"],
};
