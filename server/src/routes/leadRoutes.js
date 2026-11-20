const express = require('express');
const router = express.Router();

const leadController = require('../controllers/leadController');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { createLeadSchema, updateLeadSchema } = require('../validators/leadSchema');

// Protect all lead routes with authentication middleware
router.use(protect);

// /api/leads
router
  .route('/')
  .get(leadController.getLeads)
  .post(validate(createLeadSchema), leadController.createLead);

// /api/leads/:id
router
  .route('/:id')
  .get(leadController.getLeadById)
  .put(validate(updateLeadSchema), leadController.updateLead)
  .delete(leadController.deleteLead);

module.exports = router;
