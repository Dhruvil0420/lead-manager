const { z } = require('zod');

const LEAD_SOURCES = ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Event', 'Other'];
const LEAD_STATUSES = ['New', 'Contacted', 'Qualified', 'Lost'];

// Standard phone format regex (allows optional leading +, digits, spaces, hyphens, parentheses; 7-20 characters)
const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;

// Base schema for common field definitions
const leadBaseSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(1, 'Name cannot be empty'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Invalid email address')
    .toLowerCase(),
  phone: z
    .string({ required_error: 'Phone number is required' })
    .trim()
    .regex(phoneRegex, 'Invalid phone number format'),
  company: z
    .string({ required_error: 'Company is required' })
    .trim()
    .min(1, 'Company cannot be empty'),
  source: z.enum(LEAD_SOURCES, {
    errorMap: () => ({
      message: `Source must be one of: ${LEAD_SOURCES.join(', ')}`,
    }),
  }),
  status: z.enum(LEAD_STATUSES, {
    errorMap: () => ({
      message: `Status must be one of: ${LEAD_STATUSES.join(', ')}`,
    }),
  }),
});

// Create schema: status defaults to 'New' if not provided
const createLeadSchema = leadBaseSchema.extend({
  status: leadBaseSchema.shape.status.default('New'),
});

// Update schema: all fields optional, but at least one must be supplied
const updateLeadSchema = leadBaseSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided to update',
  });

module.exports = {
  createLeadSchema,
  updateLeadSchema,
  LEAD_SOURCES,
  LEAD_STATUSES,
};
