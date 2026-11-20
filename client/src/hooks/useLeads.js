import { useState, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export const useLeads = () => {
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [stats, setStats] = useState({
    total: 0,
    New: 0,
    Contacted: 0,
    Qualified: 0,
    Lost: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch leads with query params (search, filter, sort, page, limit)
  const fetchLeads = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/leads', { params });
      setLeads(res.data.data);
      if (res.data.pagination) {
        setPagination(res.data.pagination);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load leads';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch status breakdown stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/leads/stats');
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  // Create lead mutation
  const createLead = async (leadData) => {
    const res = await api.post('/leads', leadData);
    toast.success('Lead added successfully!');
    return res.data.data;
  };

  // Update lead mutation
  const updateLead = async (id, leadData) => {
    const res = await api.put(`/leads/${id}`, leadData);
    toast.success('Lead updated successfully!');
    return res.data.data;
  };

  // Delete lead mutation
  const deleteLead = async (id) => {
    await api.delete(`/leads/${id}`);
    toast.success('Lead deleted successfully!');
  };

  return {
    leads,
    pagination,
    stats,
    loading,
    error,
    fetchLeads,
    fetchStats,
    createLead,
    updateLead,
    deleteLead,
  };
};

