import { useState, useEffect } from 'react';
import Modal from './Modal';
import toast from 'react-hot-toast';

const SOURCES = ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Event', 'Other'];
const STATUSES = ['New', 'Contacted', 'Qualified', 'Lost'];

const initialFormData = {
  name: '',
  email: '',
  phone: '',
  company: '',
  source: 'Website',
  status: 'New',
};

const LeadFormModal = ({ isOpen, onClose, onSubmit, initialLead = null }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isEditing = Boolean(initialLead);

  // Pre-fill form when editing or reset when adding
  useEffect(() => {
    if (initialLead) {
      setFormData({
        name: initialLead.name || '',
        email: initialLead.email || '',
        phone: initialLead.phone || '',
        company: initialLead.company || '',
        source: initialLead.source || 'Website',
        status: initialLead.status || 'New',
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [initialLead, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = 'Invalid phone number format';
    }
    if (!formData.company.trim()) newErrors.company = 'Company is required';
    if (!formData.source) newErrors.source = 'Source is required';
    if (!formData.status) newErrors.status = 'Status is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        company: formData.company.trim(),
        source: formData.source,
        status: formData.status,
      });
      onClose();
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        const fieldErrors = {};
        data.errors.forEach((e) => {
          fieldErrors[e.field] = e.message;
        });
        setErrors(fieldErrors);
      } else {
        toast.error(data?.message || 'Failed to save lead');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Lead' : 'Add New Lead'}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Sarah Connor"
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
              errors.name
                ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-600'
            }`}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="sarah@acme.com"
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                errors.email
                  ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                  : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-600'
              }`}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1-555-0199"
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                errors.phone
                  ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                  : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-600'
              }`}
            />
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Company <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="Cyberdyne Systems"
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
              errors.company
                ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-600'
            }`}
          />
          {errors.company && <p className="mt-1 text-xs text-red-500">{errors.company}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Source <span className="text-red-500">*</span>
            </label>
            <select
              name="source"
              value={formData.source}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
            >
              {SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.source && <p className="mt-1 text-xs text-red-500">{errors.source}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {isEditing ? 'Save Changes' : 'Create Lead'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default LeadFormModal;

