const { z } = require('zod');

const LEAD_SOURCES = ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Event', 'Other'];
const LEAD_STATUSES = ['New', 'Contacted', 'Qualified', 'Lost'];
const SORTABLE_FIELDS = ['name', 'company', 'status', 'createdAt'];

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

// Update schema: all fields optional, but at least one must be provided
const updateLeadSchema = leadBaseSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided to update',
  });

// Query schema for filtering, sorting, and pagination
const leadQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z
    .enum(LEAD_STATUSES, {
      errorMap: () => ({
        message: `Status must be one of: ${LEAD_STATUSES.join(', ')}`,
      }),
    })
    .optional(),
  sortBy: z
    .enum(SORTABLE_FIELDS, {
      errorMap: () => ({
        message: `sortBy must be one of: ${SORTABLE_FIELDS.join(', ')}`,
      }),
    })
    .default('createdAt'),
  order: z
    .enum(['asc', 'desc'], {
      errorMap: () => ({
        message: 'order must be either "asc" or "desc"',
      }),
    })
    .default('desc'),
  page: z.coerce
    .number({ invalid_type_error: 'page must be a number' })
    .int('page must be an integer')
    .positive('page must be greater than 0')
    .default(1),
  limit: z.coerce
    .number({ invalid_type_error: 'limit must be a number' })
    .int('limit must be an integer')
    .positive('limit must be greater than 0')
    .max(100, 'limit cannot exceed 100')
    .default(10),
});

module.exports = {
  createLeadSchema,
  updateLeadSchema,
  leadQuerySchema,
  LEAD_SOURCES,
  LEAD_STATUSES,
  SORTABLE_FIELDS,
};
