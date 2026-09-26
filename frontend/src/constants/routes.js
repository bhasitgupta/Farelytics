/**
 * Canonical 7 DGCA trunk routes monitored by Farelytics.
 */

export const MONITORED_ROUTES = [
  { code: 'DEL-BOM', origin: 'DEL', destination: 'BOM', label: 'Delhi ⇄ Mumbai', annualTrafficK: 4850, weight: 0.24495 },
  { code: 'DEL-BLR', origin: 'DEL', destination: 'BLR', label: 'Delhi ⇄ Bengaluru', annualTrafficK: 3950, weight: 0.19950 },
  { code: 'BOM-BLR', origin: 'BOM', destination: 'BLR', label: 'Mumbai ⇄ Bengaluru', annualTrafficK: 2750, weight: 0.13889 },
  { code: 'DEL-CCU', origin: 'DEL', destination: 'CCU', label: 'Delhi ⇄ Kolkata', annualTrafficK: 2350, weight: 0.11869 },
  { code: 'BLR-HYD', origin: 'BLR', destination: 'HYD', label: 'Bengaluru ⇄ Hyderabad', annualTrafficK: 2100, weight: 0.10606 },
  { code: 'MAA-DEL', origin: 'MAA', destination: 'DEL', label: 'Chennai ⇄ Delhi', annualTrafficK: 1950, weight: 0.09848 },
  { code: 'DEL-HYD', origin: 'DEL', destination: 'HYD', label: 'Delhi ⇄ Hyderabad', annualTrafficK: 1850, weight: 0.09343 }
];
