export const getScoreLevel = (score) => {
  if (score > 75) return "Strong";
  if (score >= 50) return "Average";
  return "Weak";
};

export const getScoreColorClass = (score) => {
  if (score > 75) return "text-green-400";
  if (score >= 50) return "text-yellow-300";
  return "text-red-400";
};
