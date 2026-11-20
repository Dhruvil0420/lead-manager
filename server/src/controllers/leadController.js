const mongoose = require('mongoose');
const { Lead } = require('../models/Lead');

// POST /api/leads - Create a new lead scoped to req.user._id
const createLead = async (req, res, next) => {
  try {
    const lead = await Lead.create({
      ...req.body,
      user: req.user._id, // Enforce ownership from authenticated token
    });

    res.status(201).json({
      message: 'Lead created successfully',
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/leads - List all leads for the authenticated user
const getLeads = async (req, res, next) => {
  try {
    const leads = await Lead.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Leads fetched successfully',
      count: leads.length,
      data: leads,
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

    // Scoped strictly to req.user._id; returns 404 if not found or owned by another user
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

    // Ensure user ownership cannot be reassigned via body
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
  getLeadById,
  updateLead,
  deleteLead,
};
