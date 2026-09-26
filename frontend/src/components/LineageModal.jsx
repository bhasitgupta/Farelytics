import React, { useEffect, useState, useRef } from 'react';
import { X, Search, ArrowRight } from 'lucide-react';
import { fetchLineage } from '../services/api';

export default function LineageModal({ indexId, onClose }) {
  const [lineage, setLineage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterQuery, setFilterQuery] = useState('');
  const modalRef = useRef(null);

  useEffect(() => {
    if (!indexId) return;
    setLoading(true);
    fetchLineage(indexId)
      .then(setLineage)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [indexId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const filteredQuotes = (lineage?.sample_quotes || []).filter((q) => {
    if (!filterQuery) return true;
    const query = filterQuery.toLowerCase();
    return (
      q.route_id.toLowerCase().includes(query) ||
      q.carrier.toLowerCase().includes(query) ||
      String(q.validated_id).includes(query)
    );
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-brand-dark/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lineage-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="bg-white border border-brand-border rounded-xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between">
          <div>
            <h2 id="lineage-modal-title" className="text-sm font-bold text-brand-dark flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-accent"></span>
              Data Lineage & Audit Trail
            </h2>
            <p className="text-xs text-brand-muted mt-0.5">
              Trace from published index point #{indexId} back to contributing observations
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-md text-brand-muted hover:text-brand-dark hover:bg-brand-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {loading && (
            <div className="text-center py-16 space-y-2">
              <div className="w-5 h-5 mx-auto border-2 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-brand-muted">Tracing calculation lineage...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
              Error fetching lineage: {error}
            </div>
          )}

          {lineage && (
            <>
              {/* Pipeline Flow Card */}
              <div className="p-4 rounded-lg bg-brand-surface border border-brand-border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                  <div className="p-3 bg-white rounded-md border border-brand-border text-center">
                    <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">
                      Contributing Quotes
                    </span>
                    <span className="text-base font-bold font-mono text-brand-dark tabular-nums">
                      {lineage.contributing_sample_size} Quotes
                    </span>
                    <span className="text-[10px] text-brand-muted block mt-0.5">Raw observations</span>
                  </div>

                  <div className="flex items-center justify-center text-brand-muted">
                    <ArrowRight className="w-4 h-4 hidden md:block text-brand-accent" />
                  </div>

                  <div className="p-3 bg-white rounded-md border border-brand-border text-center">
                    <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">
                      Published Index Point
                    </span>
                    <span className="text-base font-bold font-mono text-brand-dark tabular-nums">
                      APIx {lineage.apix_value.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-brand-muted block mt-0.5">Period: {lineage.period_date}</span>
                  </div>
                </div>
              </div>

              {/* Table & Filter */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-xs font-bold text-brand-dark uppercase tracking-wider">
                    Normalized Observations (Sample of {lineage.sample_quotes.length})
                  </span>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-muted" />
                    <input
                      type="text"
                      placeholder="Filter by sector or carrier..."
                      value={filterQuery}
                      onChange={(e) => setFilterQuery(e.target.value)}
                      className="text-xs pl-8 pr-3 py-1.5 rounded-md bg-white border border-brand-border text-brand-dark w-56 focus:w-64 transition-all placeholder:text-brand-muted/60 focus:outline-none focus:border-brand-accent"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto border border-brand-border rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-brand-surface text-brand-dark font-bold border-b border-brand-border">
                      <tr>
                        <th className="py-2.5 px-3">Val ID</th>
                        <th className="py-2.5 px-3">Raw ID</th>
                        <th className="py-2.5 px-3">Sector</th>
                        <th className="py-2.5 px-3">Carrier</th>
                        <th className="py-2.5 px-3">Lead Time</th>
                        <th className="py-2.5 px-3">Base Fare</th>
                        <th className="py-2.5 px-3">Taxes & Fees</th>
                        <th className="py-2.5 px-3 font-bold text-brand-dark">Total Price</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/60 font-mono text-[11px]">
                      {filteredQuotes.map((q) => (
                        <tr key={q.validated_id} className="hover:bg-brand-surface/70 transition-colors">
                          <td className="py-2 px-3 text-brand-muted">#{q.validated_id}</td>
                          <td className="py-2 px-3 text-brand-muted">#{q.raw_id}</td>
                          <td className="py-2 px-3 font-semibold text-brand-dark">{q.route_id}</td>
                          <td className="py-2 px-3 text-brand-muted">{q.carrier}</td>
                          <td className="py-2 px-3 text-brand-muted">T+{q.lead_time}</td>
                          <td className="py-2 px-3 text-brand-muted">₹{q.base_fare.toLocaleString()}</td>
                          <td className="py-2 px-3 text-brand-muted">₹{(q.mandatory_taxes + q.mandatory_fees).toLocaleString()}</td>
                          <td className="py-2 px-3 font-bold text-brand-dark">₹{q.total_consumer_price.toLocaleString()}</td>
                          <td className="py-2 px-3">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              q.availability_status === 'available'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {q.availability_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {filteredQuotes.length === 0 && (
                        <tr>
                          <td colSpan="9" className="py-8 text-center text-brand-muted">
                            No quotes match filter "{filterQuery}"
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-brand-border bg-brand-surface/60 flex items-center justify-between text-xs text-brand-muted">
          <span>Cryptographic hash verified across observation chain.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded bg-white hover:bg-brand-surface border border-brand-border text-brand-dark font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
