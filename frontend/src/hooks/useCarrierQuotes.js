import { useState, useEffect } from 'react';
import { fetchFares } from '../services/api';

export function useCarrierQuotes(route = 'ALL', leadTime = 'ALL') {
  const [fares, setFares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const params = {};
    if (route !== 'ALL') params.route = route;
    if (leadTime !== 'ALL') params.lead_time = leadTime;

    fetchFares(params)
      .then(res => {
        if (!isMounted) return;
        setFares(res.fares || res || []);
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
  }, [route, leadTime]);

  return { fares, loading, error };
}
