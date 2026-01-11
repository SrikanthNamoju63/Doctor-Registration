const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const doctorSchema = new mongoose.Schema({
    full_name: {
        type: String,
        required: true
    },
    doctor_display_id: {
        type: String,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    specialization: {
        type: String,
        required: true
    },
    languages: {
        type: String,
        required: true
    },
    hospital_details: {
        name: { type: String, required: true },
        pincode: { type: String, required: true },
        village: { type: String },
        city: { type: String },
        state: { type: String }
    },
    education: {
        type: String,
        required: true
    },
    professional_details: {
        license_year: { type: Number, required: true },
        experience: { type: Number, default: 0 }
    },
    password: {
        type: String,
        required: true
    },
    profile_image: {
        type: String,
    },
    documents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DoctorDocument'
    }]
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

// Pre-save hook to hash password
doctorSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('Doctor', doctorSchema);
