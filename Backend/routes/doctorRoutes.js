const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const doctorController = require('../controllers/doctorController');

// Configure Multer for temporary storage
const upload = multer({
    dest: path.join(__dirname, '../uploads/temp/'), // Temporary folder
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'profile_image') {
            const filetypes = /jpeg|jpg|png|gif|webp/;
            const mimetype = filetypes.test(file.mimetype);
            const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

            if (mimetype && extname) {
                return cb(null, true);
            }
            cb(new Error('Only image files (JPG, PNG, GIF, WEBP) are allowed for profile photo!'));
        } else {
            // For documents, allow PDF and Images
            const filetypes = /jpeg|jpg|png|gif|webp|pdf/;
            const mimetype = filetypes.test(file.mimetype);
            const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

            if (mimetype && extname) {
                return cb(null, true);
            }
            cb(new Error('Only PDF and image files are allowed for documents!'));
        }
    }
});

// Define File Fields
const cpUpload = upload.fields([
    { name: 'profile_image', maxCount: 1 },
    { name: 'documents', maxCount: 10 }
]);

// Route
router.post('/register', cpUpload, doctorController.registerDoctor);

module.exports = router;
