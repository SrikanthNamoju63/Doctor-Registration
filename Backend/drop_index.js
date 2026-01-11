const mongoose = require('mongoose');

const mongoURI = 'mongodb://localhost:27017/HealthPredict_DoctorRegistration';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(async () => {
    console.log('MongoDB Connected');
    try {
        const collection = mongoose.connection.collection('doctors');
        // List indexes first
        const indexes = await collection.indexes();
        console.log('Current Indexes:', indexes);

        // Drop the problematic index
        // The error said "index: doctor_id_1"
        const indexName = 'doctor_id_1';
        const indexExists = indexes.some(idx => idx.name === indexName);
        
        if (indexExists) {
            await collection.dropIndex(indexName);
            console.log(`Index ${indexName} dropped successfully.`);
        } else {
            console.log(`Index ${indexName} not found.`);
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        mongoose.disconnect();
    }
})
.catch(err => console.error('MongoDB Connection Error:', err));
