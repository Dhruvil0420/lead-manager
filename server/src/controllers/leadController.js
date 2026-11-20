const mongoose = require('mongoose');
const { Lead } = require('../models/Lead');

// POST /api/leads - Create a new lead
const createLead = async (req, res, next) => {
  try {
    const leadData = { ...req.body };

    // Attach authenticated user ID if present (prepared for Part 3)
    if (req.user && req.user._id) {
      leadData.user = req.user._id;
    }

    const lead = await Lead.create(leadData);

    res.status(201).json({
      message: 'Lead created successfully',
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/leads - List all leads
const getLeads = async (req, res, next) => {
  try {
    const filter = {};

    // Filter by user if authenticated (prepared for Part 3)
    if (req.user && req.user._id) {
      filter.user = req.user._id;
    }

    const leads = await Lead.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Leads fetched successfully',
      count: leads.length,
      data: leads,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/leads/:id - Fetch single lead by ID
const getLeadById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid lead ID format',
        errors: [{ field: 'id', message: 'ID must be a valid 24-character hexadecimal string' }],
      });
    }

    const filter = { _id: id };
    if (req.user && req.user._id) {
      filter.user = req.user._id;
    }

    const lead = await Lead.findOne(filter);

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

// PUT /api/leads/:id - Update an existing lead
const updateLead = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid lead ID format',
        errors: [{ field: 'id', message: 'ID must be a valid 24-character hexadecimal string' }],
      });
    }

    const filter = { _id: id };
    if (req.user && req.user._id) {
      filter.user = req.user._id;
    }

    const updatedLead = await Lead.findOneAndUpdate(filter, req.body, {
      returnDocument: 'after',
      runValidators: true,
    });

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

// DELETE /api/leads/:id - Delete a lead
const deleteLead = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid lead ID format',
        errors: [{ field: 'id', message: 'ID must be a valid 24-character hexadecimal string' }],
      });
    }

    const filter = { _id: id };
    if (req.user && req.user._id) {
      filter.user = req.user._id;
    }

    const deletedLead = await Lead.findOneAndDelete(filter);

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
  getLeadById,
  updateLead,
  deleteLead,
};
