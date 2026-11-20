const express = require('express');
const router = express.Router();

const leadController = require('../controllers/leadController');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  createLeadSchema,
  updateLeadSchema,
  leadQuerySchema,
} = require('../validators/leadSchema');

// Protect all lead routes with authentication middleware
router.use(protect);

// Stats endpoint - MUST be registered BEFORE /:id route
router.get('/stats', leadController.getLeadStats);

// /api/leads
router
  .route('/')
  .get(validate(leadQuerySchema, 'query'), leadController.getLeads)
  .post(validate(createLeadSchema, 'body'), leadController.createLead);

// /api/leads/:id
router
  .route('/:id')
  .get(leadController.getLeadById)
  .put(validate(updateLeadSchema, 'body'), leadController.updateLead)
  .delete(leadController.deleteLead);

module.exports = router;
