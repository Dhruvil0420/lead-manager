import { useState, useEffect } from 'react';
import { useLeads } from '../hooks/useLeads';
import StatusBadge from '../components/StatusBadge';
import LeadFormModal from '../components/LeadFormModal';
import ConfirmDialog from '../components/ConfirmDialog';

const Dashboard = () => {
  const { leads, loading, fetchLeads, createLead, updateLead, deleteLead } = useLeads();

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Open modal to add a lead
  const handleOpenAdd = () => {
    setSelectedLead(null);
    setFormModalOpen(true);
  };

  // Open modal to edit a lead
  const handleOpenEdit = (lead) => {
    setSelectedLead(lead);
    setFormModalOpen(true);
  };

  // Open modal to confirm deletion
  const handleOpenDelete = (lead) => {
    setSelectedLead(lead);
    setDeleteModalOpen(true);
  };

  // Handle create or update submit
  const handleFormSubmit = async (formData) => {
    if (selectedLead) {
      await updateLead(selectedLead._id, formData);
    } else {
      await createLead(formData);
    }
    fetchLeads();
  };

  // Handle confirmed delete
  const handleConfirmDelete = async () => {
    if (!selectedLead) return;
    setDeleteLoading(true);
    try {
      await deleteLead(selectedLead._id);
      setDeleteModalOpen(false);
      setSelectedLead(null);
      fetchLeads();
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Leads</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and track your prospect pipeline</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Lead
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Name</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Company</th>
                <th className="py-3.5 px-4">Source</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Created</th>
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
                      <p className="text-xs text-slate-400">Get started by creating your first lead</p>
                      <button
                        onClick={handleOpenAdd}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        + Add Lead
                      </button>
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
                          onClick={() => handleOpenEdit(lead)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleOpenDelete(lead)}
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
