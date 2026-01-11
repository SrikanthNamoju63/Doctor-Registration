const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const doctorRoutes = require('./routes/doctorRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploaded files (optional, if you want to serve them)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
mongoose.connect('mongodb://localhost:27017/HealthPredict_DoctorRegistration', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB Connected: HealthPredict_DoctorRegistration'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/doctors', doctorRoutes);

// Root Endpoint
// Serve Frontend Static Files
app.use(express.static(path.join(__dirname, '../Frontend')));

// Fallback to index.html for SPA routing (if needed, though this is a simple page)
app.get('*', (req, res) => {
    // Check if the request is for API, if so, don't return index.html (though specific API routes usually hit first)
    // But since we have app.use('/api/doctors', ...) above, those should match first if they are specific.
    // However, it's safer to just serve static and let the API routes handle /api path.
    // For now, simple static serving is enough as there's only index.html.
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ message: 'API route not found' });
    }
    res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
