const mongoose = require('mongoose');

const doctorDocumentSchema = new mongoose.Schema({
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    type: {
        type: String, // 'profile_image' or 'document'
        enum: ['profile_image', 'document'],
        required: true
    },
    original_name: {
        type: String,
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    mimetype: {
        type: String
    },
    size: {
        type: Number
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('DoctorDocument', doctorDocumentSchema);
