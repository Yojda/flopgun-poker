export function getXPFromProgress(progress: Record<string, { state: string }>) {
  // 10 XP par problème réussi, 2 XP par problème tenté
  let xp = 0;
  Object.values(progress).forEach(({ state }) => {
    if (state === "correct") xp += 10;
    else if (state === "incorrect" || state === "started") xp += 2;
  });
  return xp;
}

export function getLevel(xp: number) {
  // Courbe simple : level 1 à 10 XP, 2 à 30 XP, 3 à 60 XP, etc.
  // level = floor(sqrt(xp / 10)) + 1
  return Math.floor(Math.sqrt(xp / 10)) + 1;
}

export function getRank(level: number) {
  if (level >= 20) return "Platinum";
  if (level >= 15) return "Gold";
  if (level >= 10) return "Silver";
  if (level >= 5) return "Bronze";
  return "Novice";
}

export function getRankStyle(rank: string) {
  switch (rank) {
    case "Platinum":
      return { color: "#60a5fa", icon: "/images/platiniumEmblem.svg" };
    case "Gold":
      return { color: "#facc15", icon: "/images/goldEmblem.svg" };
    case "Silver":
      return { color: "#a3a3a3", icon: "/images/silverEmblem.svg" };
    case "Bronze":
      return { color: "#d97706", icon: "/images/bronzeEmblem.svg" };
    default:
      return { color: "#6b7280", icon: "/images/noviceEmblem.svg" };
  }
}

export function getNextLevelXP(level: number) {
  // XP total requis pour atteindre le prochain niveau
  // On inverse la formule de getLevel pour obtenir l'XP cible du prochain niveau
  // level = floor(sqrt(xp / 10)) + 1
  // donc xp = 10 * (level)^2
  return 10 * (level) * (level);
} 