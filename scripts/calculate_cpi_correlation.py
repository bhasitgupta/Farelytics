"""Statistical utility to compute correlation between Farelytics and official benchmark."""
import math
from typing import List

def pearson_correlation(x: List[float], y: List[float]) -> float:
    """Calculate Pearson correlation coefficient r between two series."""
    n = len(x)
    if n != len(y) or n < 2:
        return 0.0
    mean_x = sum(x) / n
    mean_y = sum(y) / n
    
    num = sum((xi - mean_x) * (yi - mean_y) for xi, yi in zip(x, y))
    den_x = math.sqrt(sum((xi - mean_x) ** 2 for xi in x))
    den_y = math.sqrt(sum((yi - mean_y) ** 2 for yi in y))
    
    if den_x == 0 or den_y == 0:
        return 0.0
    return num / (den_x * den_y)

if __name__ == "__main__":
    series_index = [100.0, 101.2, 102.5, 103.1, 104.8]
    series_cpi = [100.0, 100.9, 101.8, 102.6, 104.1]
    r = pearson_correlation(series_index, series_cpi)
    print(f"Calculated Pearson Correlation: {r:.4f}")
