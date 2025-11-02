// lib/ese.ts
export type SInput = { S1: number; S2: number; S3: number; S4: number }; // Likert 1~5

export type BRaw = {
  saveActual: number;   // 실제 저축액
  saveGoal: number;     // 목표 저축액
  spendActual: number;  // 실제 지출
  spendBudget: number;  // 목표 지출(예산)
  investWeeks: number;  // 지난 4주 중 투자 유지 주수 (0~4)
  habitDays: number;    // 기록/확인 일수 (0~7)
};

export const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
export const likertToRatio = (v: number) => clamp01((v - 1) / 4); // 1→0, 5→1

// S = ((S1+S2+S3+S4)/4) × 20
export const computeS_v2 = (s: SInput) =>
  Math.round(((s.S1 + s.S2 + s.S3 + s.S4) / 4) * 20);

// B 비율 파트(0~1) - 원자료에서 계산
export function computeBPartsFromRaw(raw: BRaw) {
  const B1 = raw.saveGoal > 0 ? clamp01(raw.saveActual / raw.saveGoal) : 0;
  const B2 = raw.spendActual > 0 ? clamp01(raw.spendBudget / raw.spendActual) : 0;
  const B3 = clamp01(raw.investWeeks / 4);
  const B4 = clamp01(raw.habitDays / 7);
  return { B1, B2, B3, B4 };
}

// B = (B1×0.4 + B2×0.3 + B3×0.2 + B4×0.1) × 100
export function computeB_v2_fromParts({
  B1, B2, B3, B4,
}: { B1: number; B2: number; B3: number; B4: number }) {
  const w = 0.4 * B1 + 0.3 * B2 + 0.2 * B3 + 0.1 * B4; // 0~1
  return Math.round(w * 100);
}

// L = (정답률 0~1) × 100
export const computeL_v2 = (ratio: number) => Math.round(clamp01(ratio) * 100);

// ESE = 0.5·S + 0.3·B + 0.2·L
export const computeESE_v2 = (S: number, B: number, L: number) =>
  Math.round(0.5 * S + 0.3 * B + 0.2 * L);
