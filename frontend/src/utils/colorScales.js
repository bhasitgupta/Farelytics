/**
 * Heatmap color interpolator and carrier brand colors.
 */

export const CARRIER_COLORS = {
  '6E': '#0052cc', // IndiGo Blue
  'AI': '#b91c1c', // Air India Red
  'QP': '#ea580c', // Akasa Air Orange
  'SG': '#d97706', // SpiceJet Amber
  'MMT': '#dc2626' // MakeMyTrip Red
};

export function getHeatmapColor(value, min = 3000, max = 12000) {
  const norm = Math.max(0, Math.min(1, (value - min) / (max - min)));
  // Interpolate from emerald green to amber to deep red
  if (norm < 0.5) {
    const t = norm * 2;
    return `rgba(${Math.round(16 + t * 218)}, ${Math.round(185 - t * 45)}, ${Math.round(129 - t * 80)}, 0.85)`;
  }
  const t = (norm - 0.5) * 2;
  return `rgba(${Math.round(234 + t * 15)}, ${Math.round(140 - t * 90)}, ${Math.round(49 - t * 20)}, 0.9)`;
}
