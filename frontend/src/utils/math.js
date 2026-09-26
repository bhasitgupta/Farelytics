/**
 * Mathematical calculations and interpolation for dashboard charts.
 */

export function computeAverage(arr) {
  if (!arr || !arr.length) return 0;
  return arr.reduce((acc, curr) => acc + curr, 0) / arr.length;
}

export function computeMovingAverage(data, windowSize = 3) {
  if (!data || data.length < windowSize) return data;
  return data.map((val, idx, arr) => {
    if (idx < windowSize - 1) return val;
    const windowSlice = arr.slice(idx - windowSize + 1, idx + 1);
    return computeAverage(windowSlice);
  });
}
