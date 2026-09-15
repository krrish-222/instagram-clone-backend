const multer = require("multer");

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === "image/jpg") {
    cb(null, true); // Accept file
  } else {
    cb(new Error('Only .png, .jpeg and .jpg formats are allowed!'), false); // Reject file
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

module.exports = upload;