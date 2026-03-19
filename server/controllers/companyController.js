const Company = require('../models/Company');

// @desc    Get all companies
// @route   GET /api/companies
exports.getCompanies = async (req, res) => {
  try {
    const { search, location, jobRole } = req.query;
    let query = {};

    if (search) {
      query.companyName = { $regex: search, $options: 'i' };
    }
    if (location) {
        query.location = { $regex: location, $options: 'i' };
    }
    if (jobRole) {
        query.jobRole = { $regex: jobRole, $options: 'i' };
    }

    const companies = await Company.find(query);
    res.status(200).json({ success: true, count: companies.length, data: companies });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Create new company
// @route   POST /api/companies
exports.createCompany = async (req, res) => {
  try {
    const company = await Company.create(req.body);
    res.status(201).json({ success: true, data: company });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update company
// @route   PUT /api/companies/:id
exports.updateCompany = async (req, res) => {
  try {
    let company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    // Add to history
    company.history.push({
        action: 'UPDATE',
        details: `Updated fields: ${Object.keys(req.body).join(', ')}`
    });

    company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: company });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete company
// @route   DELETE /api/companies/:id
exports.deleteCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    await company.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
