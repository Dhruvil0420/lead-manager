import { useState, useEffect, useRef } from 'react';
import { useLeads } from '../hooks/useLeads';
import { useDebounce } from '../hooks/useDebounce';
import StatusBadge from '../components/StatusBadge';
import LeadFormModal from '../components/LeadFormModal';
import ConfirmDialog from '../components/ConfirmDialog';

const STATUS_OPTIONS = ['New', 'Contacted', 'Qualified', 'Lost'];

const Dashboard = () => {
  const {
    leads,
    pagination,
    loading,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead,
  } = useLeads();

  // Filter, sort, and pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 400);

  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Track previous debounced search and status to reset page to 1 on changes
  const isFirstRender = useRef(true);
  const prevSearchRef = useRef(debouncedSearch);
  const prevStatusRef = useRef(statusFilter);

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Reset to page 1 when search or status filter changes (after initial render)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (
      prevSearchRef.current !== debouncedSearch ||
      prevStatusRef.current !== statusFilter
    ) {
      prevSearchRef.current = debouncedSearch;
      prevStatusRef.current = statusFilter;
      setPage(1);
    }
  }, [debouncedSearch, statusFilter]);

  // Main fetch effect: triggers whenever query params change
  useEffect(() => {
    const params = {
      page,
      limit,
      sortBy,
      order,
    };
    if (debouncedSearch.trim()) {
      params.search = debouncedSearch.trim();
    }
    if (statusFilter) {
      params.status = statusFilter;
    }

    fetchLeads(params);
  }, [fetchLeads, page, limit, sortBy, order, debouncedSearch, statusFilter]);

  // Refresh current query
  const refreshLeads = () => {
    const params = {
      page,
      limit,
      sortBy,
      order,
    };
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    if (statusFilter) params.status = statusFilter;
    fetchLeads(params);
  };

  // Sort toggle handler
  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setOrder(field === 'createdAt' ? 'desc' : 'asc');
    }
  };

  // Render sort indicator
  const renderSortIndicator = (field) => {
    const isActive = sortBy === field;
    return (
      <span className="inline-flex flex-col ml-1.5 text-[10px] leading-[8px] text-slate-400">
        <span className={isActive && order === 'asc' ? 'text-indigo-600 font-bold' : ''}>
          ▲
        </span>
        <span className={isActive && order === 'desc' ? 'text-indigo-600 font-bold' : ''}>
          ▼
        </span>
      </span>
    );
  };

  // Form submit (Add or Edit)
  const handleFormSubmit = async (formData) => {
    if (selectedLead) {
      await updateLead(selectedLead._id, formData);
    } else {
      await createLead(formData);
    }
    refreshLeads();
  };

  // Confirmed Delete (handles fallback to previous page if last item on page is deleted)
  const handleConfirmDelete = async () => {
    if (!selectedLead) return;
    setDeleteLoading(true);
    try {
      await deleteLead(selectedLead._id);
      setDeleteModalOpen(false);
      setSelectedLead(null);

      // If this was the only item on the page and we're not on page 1, go back one page
      if (leads.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        refreshLeads();
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Pagination calculation
  const total = pagination.total || 0;
  const totalPages = pagination.totalPages || 1;
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Leads</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and track your prospect pipeline</p>
        </div>
        <button
          onClick={() => {
            setSelectedLead(null);
            setFormModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Lead
        </button>
      </div>

      {/* Controls: Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search leads by name..."
            className="w-full pl-9 pr-8 py-2 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500 whitespace-nowrap">
            Status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 text-slate-700"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider select-none">
                {/* Sortable: Name */}
                <th
                  onClick={() => handleSort('name')}
                  className="py-3.5 px-4 sm:px-6 cursor-pointer hover:bg-slate-100/75 transition-colors"
                >
                  <div className="flex items-center">
                    Name
                    {renderSortIndicator('name')}
                  </div>
                </th>
                {/* Non-sortable: Contact */}
                <th className="py-3.5 px-4">Contact</th>
                {/* Sortable: Company */}
                <th
                  onClick={() => handleSort('company')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/75 transition-colors"
                >
                  <div className="flex items-center">
                    Company
                    {renderSortIndicator('company')}
                  </div>
                </th>
                {/* Non-sortable: Source */}
                <th className="py-3.5 px-4">Source</th>
                {/* Sortable: Status */}
                <th
                  onClick={() => handleSort('status')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/75 transition-colors"
                >
                  <div className="flex items-center">
                    Status
                    {renderSortIndicator('status')}
                  </div>
                </th>
                {/* Sortable: Created Date */}
                <th
                  onClick={() => handleSort('createdAt')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/75 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center">
                    Created
                    {renderSortIndicator('createdAt')}
                  </div>
                </th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      Loading leads...
                    </div>
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-slate-500">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="font-medium text-slate-800">No leads found</h3>
                      <p className="text-xs text-slate-400">
                        {searchTerm || statusFilter
                          ? 'Try adjusting your search or filter'
                          : 'Get started by creating your first lead'}
                      </p>
                      {searchTerm || statusFilter ? (
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('');
                          }}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          Clear filters
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedLead(null);
                            setFormModalOpen(true);
                          }}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          + Add Lead
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-medium text-slate-900">
                      {lead.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-700">{lead.email}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{lead.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{lead.company}</td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs">{lead.source}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs whitespace-nowrap">
                      {formatDate(lead.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedLead(lead);
                            setFormModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedLead(lead);
                            setDeleteModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 py-3.5 border-t border-slate-200 bg-slate-50/50 text-xs text-slate-600">
          <div>
            Showing <span className="font-semibold text-slate-900">{startItem}</span> to{' '}
            <span className="font-semibold text-slate-900">{endItem}</span> of{' '}
            <span className="font-semibold text-slate-900">{total}</span> leads
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="px-3 py-1.5 rounded border border-slate-300 bg-white font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            {/* Page number buttons */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => {
                // Show smart window: always show 1, last, and pages adjacent to current page
                if (
                  p === 1 ||
                  p === totalPages ||
                  (p >= page - 1 && p <= page + 1)
                ) {
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      disabled={loading}
                      className={`w-7 h-7 rounded text-xs font-medium transition-colors ${
                        page === p
                          ? 'bg-indigo-600 text-white'
                          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  );
                } else if (p === page - 2 || p === page + 2) {
                  return (
                    <span key={p} className="px-1 text-slate-400">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="px-3 py-1.5 rounded border border-slate-300 bg-white font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <LeadFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialLead={selectedLead}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        leadName={selectedLead?.name}
        loading={deleteLoading}
      />
    </div>
  );
};

export default Dashboard;
