import { useState, useEffect } from 'react';
import { fetchCurrentIndex, fetchIndexHistory, fetchRouteWeights } from '../services/api';

export function useFareIndex(granularity = 'daily') {
  const [currentIndex, setCurrentIndex] = useState(null);
  const [history, setHistory] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      fetchCurrentIndex().catch(() => null),
      fetchIndexHistory(granularity).catch(() => []),
      fetchRouteWeights().catch(() => [])
    ])
      .then(([cur, hist, rts]) => {
        if (!isMounted) return;
        setCurrentIndex(cur);
        setHistory(hist);
        setRoutes(rts);
        setLoading(false);
      })
      .catch(err => {
        if (!isMounted) return;
        setError(err);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [granularity]);

  return { currentIndex, history, routes, loading, error };
}
