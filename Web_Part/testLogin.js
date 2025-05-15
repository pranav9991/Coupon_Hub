const mongoose = require('mongoose');
const User = require('./models/user');
const bcrypt = require('bcrypt');

const MONGOURL = "mongodb+srv://aj417650:crK2wj9mSv7tYnix@cluster0.wxwa6.mongodb.net/coupon_hub?retryWrites=true&w=majority&appName=Cluster0";

async function testLogin() {
  try {
    // Connect to database
    await mongoose.connect(MONGOURL);
    console.log('Connected to database');

    // Test with your email - replace with actual email you're trying to login with
    const testEmail = 'test@test.com';
    const user = await User.findOne({email: testEmail});
    
    if (!user) {
      console.log(`User with email ${testEmail} not found`);
      return;
    }

    console.log('User found:', user);

    // Test password - replace with actual password you're trying
    const testPassword = 'test123';
    const isMatch = await bcrypt.compare(testPassword, user.password);
    console.log('Password match:', isMatch);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    mongoose.disconnect();
  }
}

testLogin();
