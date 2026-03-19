const express = require('express');
const { 
    getCompanies, 
    createCompany, 
    updateCompany, 
    deleteCompany 
} = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All routes protected

router.route('/')
    .get(getCompanies)
    .post(authorize('admin'), createCompany);

router.route('/:id')
    .put(authorize('admin'), updateCompany)
    .delete(authorize('admin'), deleteCompany);

module.exports = router;
