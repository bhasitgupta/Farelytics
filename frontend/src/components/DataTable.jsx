import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Filter, Eye } from 'lucide-react';

export default function DataTable({ data = [], loading = false, onInspectRow }) {
  const [search, setSearch] = useState('');
  const [carrierFilter, setCarrierFilter] = useState('ALL');
  const [routeFilter, setRouteFilter] = useState('ALL');
  const [sortField, setSortField] = useState('total_consumer_price');
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Extract unique routes and carriers
  const uniqueRoutes = useMemo(() => {
    return Array.from(new Set(data.map((d) => d.route_id))).sort();
  }, [data]);

  const uniqueCarriers = useMemo(() => {
    return Array.from(new Set(data.map((d) => d.carrier))).sort();
  }, [data]);

  // Filter and sort
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const matchSearch =
        search === '' ||
        row.route_id?.toLowerCase().includes(search.toLowerCase()) ||
        row.carrier?.toLowerCase().includes(search.toLowerCase()) ||
        row.travel_date?.includes(search);
      const matchCarrier = carrierFilter === 'ALL' || row.carrier === carrierFilter;
      const matchRoute = routeFilter === 'ALL' || row.route_id === routeFilter;
      return matchSearch && matchCarrier && matchRoute;
    }).sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === 'string') {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortAsc ? aVal - bVal : bVal - aVal;
    });
  }, [data, search, carrierFilter, routeFilter, sortField, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="mini-card bg-white border-[#DEDEDE] overflow-hidden shadow-tactile">
      {/* Table Controls Header */}
      <div className="p-4 border-b border-[#DEDEDE] bg-[#FAFAFA] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
          <input
            type="text"
            placeholder="Search sector, carrier, date..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[#DFDDD8] bg-white text-xs text-[#2D2D2D] placeholder-[#A3A3A3] focus:outline-none focus:border-[#3171C6]"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-[#4E4E4E]">
            <Filter className="w-3.5 h-3.5 text-[#767676]" />
            <span>Filter:</span>
          </div>

          <select
            value={carrierFilter}
            onChange={(e) => {
              setCarrierFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs font-medium px-2 py-1.5 rounded-lg border border-[#DFDDD8] bg-white text-[#2D2D2D] focus:outline-none focus:border-[#3171C6]"
          >
            <option value="ALL">All Carriers</option>
            {uniqueCarriers.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={routeFilter}
            onChange={(e) => {
              setRouteFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs font-medium px-2 py-1.5 rounded-lg border border-[#DFDDD8] bg-white text-[#2D2D2D] focus:outline-none focus:border-[#3171C6]"
          >
            <option value="ALL">All Routes</option>
            {uniqueRoutes.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F4F3F1] border-b border-[#DFDDD8] text-[#767676] uppercase font-semibold text-[10px] tracking-wider">
            <tr>
              <th className="py-2.5 px-4 cursor-pointer select-none" onClick={() => toggleSort('route_id')}>
                <div className="flex items-center gap-1">
                  <span>Sector</span>
                  <ArrowUpDown className="w-3 h-3 text-[#A3A3A3]" />
                </div>
              </th>
              <th className="py-2.5 px-4 cursor-pointer select-none" onClick={() => toggleSort('carrier')}>
                <div className="flex items-center gap-1">
                  <span>Carrier</span>
                  <ArrowUpDown className="w-3 h-3 text-[#A3A3A3]" />
                </div>
              </th>
              <th className="py-2.5 px-4 cursor-pointer select-none" onClick={() => toggleSort('travel_date')}>
                <div className="flex items-center gap-1">
                  <span>Travel Date</span>
                  <ArrowUpDown className="w-3 h-3 text-[#A3A3A3]" />
                </div>
              </th>
              <th className="py-2.5 px-4 cursor-pointer select-none" onClick={() => toggleSort('lead_time')}>
                <div className="flex items-center gap-1">
                  <span>Horizon</span>
                  <ArrowUpDown className="w-3 h-3 text-[#A3A3A3]" />
                </div>
              </th>
              <th className="py-2.5 px-4 text-right cursor-pointer select-none" onClick={() => toggleSort('base_fare')}>
                <div className="flex items-center justify-end gap-1">
                  <span>Base (₹)</span>
                  <ArrowUpDown className="w-3 h-3 text-[#A3A3A3]" />
                </div>
              </th>
              <th className="py-2.5 px-4 text-right cursor-pointer select-none" onClick={() => toggleSort('total_consumer_price')}>
                <div className="flex items-center justify-end gap-1">
                  <span>Total Payable (₹)</span>
                  <ArrowUpDown className="w-3 h-3 text-[#A3A3A3]" />
                </div>
              </th>
              <th className="py-2.5 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DFDDD8]/60 text-[#2D2D2D]">
            {loading ? (
              // Loading Skeleton
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-3 px-4"><div className="w-16 h-3 bg-[#EBEBEB] rounded"></div></td>
                  <td className="py-3 px-4"><div className="w-8 h-3 bg-[#EBEBEB] rounded"></div></td>
                  <td className="py-3 px-4"><div className="w-20 h-3 bg-[#EBEBEB] rounded"></div></td>
                  <td className="py-3 px-4"><div className="w-10 h-3 bg-[#EBEBEB] rounded"></div></td>
                  <td className="py-3 px-4 text-right"><div className="w-12 h-3 bg-[#EBEBEB] rounded ml-auto"></div></td>
                  <td className="py-3 px-4 text-right"><div className="w-14 h-3 bg-[#EBEBEB] rounded ml-auto"></div></td>
                  <td className="py-3 px-4 text-center"><div className="w-12 h-3 bg-[#EBEBEB] rounded mx-auto"></div></td>
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan="7" className="py-12 text-center text-[#767676]">
                  <p className="text-xs font-medium">No matching quote records found.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('');
                      setCarrierFilter('ALL');
                      setRouteFilter('ALL');
                    }}
                    className="mt-2 text-xs text-[#3171C6] hover:underline font-semibold"
                  >
                    Clear search filters
                  </button>
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => (
                <tr key={row.validated_id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="py-2.5 px-4 font-mono font-bold text-[#171717]">{row.route_id}</td>
                  <td className="py-2.5 px-4 font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-[#FAFAFA] border border-[#DEDEDE] text-[11px] font-bold">
                      {row.carrier}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-[#4D4D4D]">{row.travel_date}</td>
                  <td className="py-2.5 px-4 font-mono text-[11px]">
                    <span className="text-[#171717] font-semibold">T+{row.lead_time}</span>
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums text-[#4D4D4D]">
                    ₹{row.base_fare?.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold tabular-nums text-[#171717]">
                    ₹{row.total_consumer_price?.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        row.availability_status === 'available'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {row.availability_status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-[#DEDEDE] bg-[#FAFAFA] flex items-center justify-between text-xs text-[#4D4D4D]">
        <span>
          Showing <strong className="text-[#171717]">{filteredData.length ? (page - 1) * pageSize + 1 : 0}</strong> to{' '}
          <strong className="text-[#171717]">{Math.min(filteredData.length, page * pageSize)}</strong> of{' '}
          <strong className="text-[#171717]">{filteredData.length}</strong> quotes
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-7 h-7 rounded-lg border border-[#DEDEDE] bg-white flex items-center justify-center text-[#171717] disabled:opacity-40 hover:bg-[#F5F5F5] transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-xs font-medium">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-7 h-7 rounded-lg border border-[#DEDEDE] bg-white flex items-center justify-center text-[#171717] disabled:opacity-40 hover:bg-[#F5F5F5] transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}