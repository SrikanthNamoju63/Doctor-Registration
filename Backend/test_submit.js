const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testRegistration() {
    console.log('Preparing registration test...');

    // Create dummy files if not exist
    if (!fs.existsSync('test_image.jpg')) fs.writeFileSync('test_image.jpg', 'dummy image content');
    if (!fs.existsSync('test_doc.pdf')) fs.writeFileSync('test_doc.pdf', 'dummy pdf content');

    const form = new FormData();
    form.append('name', 'Dr. Vinay');
    form.append('email', 'vinaypatturi' + Date.now() + '@gmail.com');
    form.append('phone', '9392010204');
    form.append('specialization', 'General Medicine');
    form.append('languages', 'English, Telugu');
    form.append('hospital_name', 'Apollo Hospital');
    form.append('hospital_pincode', '500061');
    form.append('hospital_village', 'Sitaphalmandi');
    form.append('hospital_city', 'Hyderabad');
    form.append('hospital_state', 'Telangana');
    form.append('edu_degree', 'MBBS');
    form.append('edu_college', 'Githam University');
    form.append('edu_year', '2021');
    form.append('license_year', '2021');
    form.append('experience', '5');
    form.append('password', 'Vinay@1234');
    form.append('confirm_password', 'Vinay@1234');
    form.append('education', 'MBBS from Githam University (2021)');

    form.append('profile_image', fs.createReadStream('test_image.jpg'));
    // User sent one document
    form.append('documents', fs.createReadStream('test_doc.pdf'));

    try {
        console.log('Sending request to http://localhost:5000/api/doctors/register ...');
        const response = await axios.post('http://localhost:5000/api/doctors/register', form, {
            headers: {
                ...form.getHeaders()
            }
        });
        console.log('Response:', response.data);
    } catch (error) {
        if (error.response) {
            console.error('SERVER ERROR:', error.response.status);
            console.error('Response Data:', error.response.data);
        } else if (error.request) {
            console.error('NETWORK ERROR: No response received');
            console.error(error.message);
        } else {
            console.error('ERROR:', error.message);
        }
    }
}

testRegistration();
