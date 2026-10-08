const axios = require('axios');

async function testApi() {
  try {
    console.log('Testing login as student...');
    const res = await axios.post('http://localhost:4000/api/auth/login', {
      email: 'aditya@ayurdash.com',
      password: 'demo1234'
    });
    console.log('Login Success!', res.data.user.email);
    
    console.log('\nTesting Medicines Directory...');
    const medRes = await axios.get('http://localhost:4000/api/medicines', {
      headers: { Authorization: `Bearer ${res.data.token}` }
    });
    console.log('Medicines Loaded:', medRes.data.data.length);
    
    console.log('\nAll tests passed successfully!');
  } catch (err) {
    console.error('Test Failed:', err.response ? err.response.data : err.message);
  }
}

testApi();
