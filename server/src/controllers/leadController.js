const mongoose = require('mongoose');
const { Lead } = require('../models/Lead');

// Helper to escape regex special characters to prevent regex injection (ReDoS)
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// POST /api/leads - Create a new lead scoped to req.user._id
const createLead = async (req, res, next) => {
  try {
    const lead = await Lead.create({
      ...req.body,
      user: req.user._id,
    });

    res.status(201).json({
      message: 'Lead created successfully',
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/leads - List leads with search, filter, sort, and pagination
const getLeads = async (req, res, next) => {
  try {
    const { search, status, sortBy, order, page, limit } = req.query;

    // Base filter scoped to authenticated user
    const filter = { user: req.user._id };

    // Exact status match
    if (status) {
      filter.status = status;
    }

    // Case-insensitive regex match on name (safely escaped)
    if (search && search.trim()) {
      const escaped = escapeRegex(search.trim());
      filter.name = { $regex: escaped, $options: 'i' };
    }

    // Sort order
    const sortDirection = order === 'asc' ? 1 : -1;
    const sortOptions = { [sortBy]: sortDirection };

    // Pagination
    const skip = (page - 1) * limit;

    const [total, leads] = await Promise.all([
      Lead.countDocuments(filter),
      Lead.find(filter).sort(sortOptions).skip(skip).limit(limit),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    res.status(200).json({
      message: 'Leads fetched successfully',
      data: leads,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/leads/stats - Leads count per status plus total (zero-filled)
const getLeadStats = async (req, res, next) => {
  try {
    // Aggregation ensures fast counting per status on the DB layer
    const stats = await Lead.aggregate([
      {
        $match: { user: new mongoose.Types.ObjectId(req.user._id) },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Zero-filled default stats for all valid statuses
    const result = {
      total: 0,
      New: 0,
      Contacted: 0,
      Qualified: 0,
      Lost: 0,
    };

    stats.forEach((item) => {
      if (Object.prototype.hasOwnProperty.call(result, item._id)) {
        result[item._id] = item.count;
      }
      result.total += item.count;
    });

    res.status(200).json({
      message: 'Lead statistics fetched successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/leads/:id - Fetch single lead owned by the user
const getLeadById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid lead ID format',
        errors: [{ field: 'id', message: 'ID must be a valid 24-character hexadecimal string' }],
      });
    }

    const lead = await Lead.findOne({ _id: id, user: req.user._id });

    if (!lead) {
      return res.status(404).json({
        message: 'Lead not found',
        errors: [],
      });
    }

    res.status(200).json({
      message: 'Lead fetched successfully',
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/leads/:id - Update an existing lead owned by the user
const updateLead = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid lead ID format',
        errors: [{ field: 'id', message: 'ID must be a valid 24-character hexadecimal string' }],
      });
    }

    const updates = { ...req.body };
    delete updates.user;

    const updatedLead = await Lead.findOneAndUpdate(
      { _id: id, user: req.user._id },
      updates,
      {
        returnDocument: 'after',
        runValidators: true,
      }
    );

    if (!updatedLead) {
      return res.status(404).json({
        message: 'Lead not found',
        errors: [],
      });
    }

    res.status(200).json({
      message: 'Lead updated successfully',
      data: updatedLead,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/leads/:id - Delete a lead owned by the user
const deleteLead = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid lead ID format',
        errors: [{ field: 'id', message: 'ID must be a valid 24-character hexadecimal string' }],
      });
    }

    const deletedLead = await Lead.findOneAndDelete({ _id: id, user: req.user._id });

    if (!deletedLead) {
      return res.status(404).json({
        message: 'Lead not found',
        errors: [],
      });
    }

    res.status(200).json({
      message: 'Lead deleted successfully',
      data: { id: deletedLead._id },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLead,
  getLeads,
  getLeadStats,
  getLeadById,
  updateLead,
  deleteLead,
};
