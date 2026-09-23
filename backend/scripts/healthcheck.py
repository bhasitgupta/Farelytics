import sys
import urllib.request

def check_health(url="http://localhost:8000/docs"):
    try:
        res = urllib.request.urlopen(url, timeout=5)
        return res.status == 200
    except Exception:
        return False

if __name__ == "__main__":
    ok = check_health()
    print("API health:", "OK" if ok else "OFFLINE")
    sys.exit(0 if ok else 1)
