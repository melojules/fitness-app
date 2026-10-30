// Height/weight unit conversion for onboarding UI. BMI/BMR/calorie math lives in ../../models/metrics
// (shared with Profile and elsewhere so the formulas stay in one place).
export { calcBMI, bmiLabel, calcBMR, calcCalorieTarget } from '../../models/metrics';

export function cmToFeetInches(cm: number) {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

export function kgToLb(kg: number) {
  return Math.round(kg * 2.20462);
}

export function lbToKg(lb: number) {
  return lb / 2.20462;
}
