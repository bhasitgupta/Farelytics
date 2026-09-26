import { useState, useEffect } from 'react';
import { fetchQuality } from '../services/api';

export function useDataQuality() {
  const [quality, setQuality] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    fetchQuality()
      .then(data => {
        if (!isMounted) return;
        setQuality(data);
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
  }, []);

  return { quality, loading, error };
}
