"""CLI validation script to check data quality thresholds."""
import sys

def check_quality(coverage: float, freshness_seconds: int, duplicate_rate: float) -> bool:
    passed = True
    if coverage < 0.90:
        print(f"FAILED: Coverage ratio {coverage*100:.1f}% below 90% threshold")
        passed = False
    if freshness_seconds > 86400:
        print(f"FAILED: Data freshness {freshness_seconds}s exceeds 24 hour threshold")
        passed = False
    if duplicate_rate > 0.05:
        print(f"FAILED: Duplicate rate {duplicate_rate*100:.1f}% exceeds 5% threshold")
        passed = False
        
    if passed:
        print("PASSED: All data quality thresholds satisfied.")
    return passed

if __name__ == "__main__":
    status = check_quality(0.985, 3600, 0.002)
    sys.exit(0 if status else 1)
