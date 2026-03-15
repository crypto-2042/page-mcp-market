const STAR_WEIGHT = 0.5;
const USAGE_WEIGHT = 0.4;
const RECENCY_WEIGHT = 0.1;

function computeRecencyScore(lastActiveAt: string | null, now: Date): number {
  if (!lastActiveAt) return 0;
  const diffMs = now.getTime() - new Date(lastActiveAt).getTime();
  if (!Number.isFinite(diffMs) || diffMs < 0) return 100;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return Math.max(0, 100 - diffDays * 2);
}

export function computeRepositoryScore(input: {
  starsCount: number;
  usageCount: number;
  lastActiveAt: string | null;
  now?: Date;
}): number {
  const now = input.now ?? new Date();
  const recencyScore = computeRecencyScore(input.lastActiveAt, now);
  const score =
    input.starsCount * STAR_WEIGHT +
    input.usageCount * USAGE_WEIGHT +
    recencyScore * RECENCY_WEIGHT;

  return Number(score.toFixed(4));
}
