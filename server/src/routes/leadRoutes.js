const express = require('express');
const router = express.Router();

const leadController = require('../controllers/leadController');
const validate = require('../middleware/validate');
const { createLeadSchema, updateLeadSchema } = require('../validators/leadSchema');

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

