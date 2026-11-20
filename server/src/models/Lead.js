const mongoose = require('mongoose');

const LEAD_SOURCES = ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Event', 'Other'];
const LEAD_STATUSES = ['New', 'Contacted', 'Qualified', 'Lost'];

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Company is required'],
      trim: true,
    },
    source: {
      type: String,
      required: [true, 'Lead source is required'],
      enum: {
        values: LEAD_SOURCES,
        message: '{VALUE} is not a valid lead source',
      },
    },
    status: {
      type: String,
      enum: {
        values: LEAD_STATUSES,
        message: '{VALUE} is not a valid lead status',
      },
      default: 'New',
    },
    // User reference prepared for Part 3 authentication
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast querying, filtering, and sorting
leadSchema.index({ user: 1, status: 1 });
leadSchema.index({ user: 1, createdAt: -1 });
leadSchema.index({ user: 1, name: 1 });
leadSchema.index({ name: 1 });

const Lead = mongoose.model('Lead', leadSchema);

module.exports = {
  Lead,
  LEAD_SOURCES,
  LEAD_STATUSES,
};

