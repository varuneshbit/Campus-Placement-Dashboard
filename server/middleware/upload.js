const multer = require('multer');
const path = require('path');

// Storage for Resume
const resumeStorage = multer.diskStorage({
  destination: './uploads/resumes/',
  filename: function(req, file, cb) {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Storage for Image
const imageStorage = multer.diskStorage({
  destination: './uploads/images/',
  filename: function(req, file, cb) {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

function checkResumeType(file, cb) {
  const filetypes = /pdf|doc|docx/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: PDF and Word documents only!');
  }
}

function checkImageType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images only (jpeg, jpg, png, gif)!');
  }
}

const uploadResume = multer({
  storage: resumeStorage,
  limits: { fileSize: 5000000 },
  fileFilter: function(req, file, cb) {
    checkResumeType(file, cb);
  }
}).single('resume');

const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 2000000 },
  fileFilter: function(req, file, cb) {
    checkImageType(file, cb);
  }
}).single('image');

const uploadExcel = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: function(req, file, cb) {
    const extname = path.extname(file.originalname).toLowerCase();
    if (extname === '.xlsx' || extname === '.xls' || extname === '.csv') {
      return cb(null, true);
    }
    cb(new Error('Excel files only!'));
  }
}).single('file');

module.exports = { uploadResume, uploadImage, uploadExcel };
