const multer = require('multer');

const path = require('path');

const fs = require('fs');

//  uploads folder 
const uploadPath = 'uploads/';

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, {
    recursive: true
  });
}

// Storage
const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {

    const uniqueName =
      Date.now() +
      '-' +
      Math.round(Math.random() * 1E9);

    cb(
      null,
      uniqueName +
      path.extname(file.originalname)
    );
  }
});

// File filter
const fileFilter = (req, file, cb) => {

  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;

  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  const mimetype =
    file.mimetype.includes('image') ||
    file.mimetype.includes('pdf') ||
    file.mimetype.includes('word') ||
    file.mimetype.includes('msword');

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only images, PDF, DOC, DOCX allowed'));
  }
};

// Multer upload config
const upload = multer({

  storage,

  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024 
  }
});

module.exports = upload;