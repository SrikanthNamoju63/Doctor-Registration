const Doctor = require('../models/Doctor');
const DoctorDocument = require('../models/DoctorDocument');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

// Helper to sanitize filenames
const sanitizeName = (name) => {
    return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
};

// Helper to generate custom ID
const generateDoctorId = () => {
    return `DOC-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
};

exports.registerDoctor = async (req, res) => {
    try {
        console.log('Received Registration Request');
        console.log('Body:', req.body);
        console.log('Files:', req.files);

        const {
            name, email, phone, specialization, other_specialization,
            languages, hospital_name, hospital_pincode, hospital_village,
            hospital_city, hospital_state, education, license_year,
            experience, password
        } = req.body;

        // 1. Check if email already exists
        const existingDoctor = await Doctor.findOne({ email });
        if (existingDoctor) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        // 2. Handle Specialization Logic
        const finalSpecialization = (specialization === 'Other' && other_specialization)
            ? other_specialization
            : specialization;

        // 3. Generate Custom ID
        let customId = generateDoctorId();
        // Ensure uniqueness (simple check)
        let idExists = await Doctor.findOne({ doctor_display_id: customId });
        while (idExists) {
            customId = generateDoctorId();
            idExists = await Doctor.findOne({ doctor_display_id: customId });
        }

        // 4. Create Initial Doctor Object
        const newDoctor = new Doctor({
            full_name: name,
            doctor_display_id: customId,
            email,
            phone,
            specialization: finalSpecialization,
            languages,
            hospital_details: {
                name: hospital_name,
                pincode: hospital_pincode,
                village: hospital_village,
                city: hospital_city,
                state: hospital_state
            },
            education,
            professional_details: {
                license_year,
                experience
            },
            password, // Will be hashed by pre-save hook
        });

        const savedDoctor = await newDoctor.save();
        const doctorId = savedDoctor._id; // This is the mongo ID
        // For file naming, we use the custom ID as requested "DOC-XXXXXX"
        const filePrefix = customId;
        const doctorNameClean = sanitizeName(name);

        // 5. Handle Files
        const docIds = [];
        let profileImagePath = '';

        // Ensure directories exist
        const UPLOADS_DIR = path.join(__dirname, '../uploads');
        await fs.ensureDir(UPLOADS_DIR);

        // Process Profile Image
        if (req.files['profile_image'] && req.files['profile_image'][0]) {
            const file = req.files['profile_image'][0];
            const ext = path.extname(file.originalname);
            // Rename logic: CustomID_Name_Profile.ext
            const newFilename = `${filePrefix}_${doctorNameClean}_profile${ext}`;
            const newPath = path.join(UPLOADS_DIR, newFilename);

            // Move/Rename file
            await fs.move(file.path, newPath, { overwrite: true });

            // Create Document Entry
            const docEntry = new DoctorDocument({
                doctor: doctorId,
                type: 'profile_image',
                original_name: file.originalname,
                filename: newFilename,
                path: `/uploads/${newFilename}`,
                mimetype: file.mimetype,
                size: file.size
            });
            await docEntry.save();

            profileImagePath = `/uploads/${newFilename}`;
            docIds.push(docEntry._id);
        }

        // Process Other Documents
        if (req.files['documents']) {
            const files = req.files['documents'];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const ext = path.extname(file.originalname);
                // Rename logic: CustomID_Name_Doc_N.ext
                const newFilename = `${filePrefix}_${doctorNameClean}_doc_${i + 1}${ext}`;
                const newPath = path.join(UPLOADS_DIR, newFilename);

                // Move/Rename file
                await fs.move(file.path, newPath, { overwrite: true });

                const docEntry = new DoctorDocument({
                    doctor: doctorId,
                    type: 'document',
                    original_name: file.originalname,
                    filename: newFilename,
                    path: `/uploads/${newFilename}`,
                    mimetype: file.mimetype,
                    size: file.size
                });
                await docEntry.save();
                docIds.push(docEntry._id);
            }
        }

        // 6. Update Doctor with File Data
        savedDoctor.profile_image = profileImagePath;
        savedDoctor.documents = docIds;
        await savedDoctor.save();

        res.status(201).json({
            success: true,
            message: 'Doctor Registered Successfully',
            doctor_id: doctorId,
            display_id: customId
        });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
    }
};
