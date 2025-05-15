const mongoose = require('mongoose');
const User = require('./models/user');
const bcrypt = require('bcrypt');

const MONGOURL = "mongodb+srv://aj417650:crK2wj9mSv7tYnix@cluster0.wxwa6.mongodb.net/coupon_hub?retryWrites=true&w=majority&appName=Cluster0";

// Replace these with your actual login credentials
const TEST_EMAIL = 'aj417650@gmail.com';
const TEST_PASSWORD = '123456';

async function testLogin() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGOURL);
    console.log('Database connected successfully');

    console.log(`Looking for user: ${TEST_EMAIL}`);
    const user = await User.findOne({email: TEST_EMAIL});
    
    if (!user) {
      console.error('ERROR: User not found');
      return;
    }

    console.log('User found:', {
      id: user._id,
      name: user.name,
      email: user.email
    });

    console.log('Verifying password...');
    const isMatch = await bcrypt.compare(TEST_PASSWORD, user.password);
    console.log('Password verification result:', isMatch);

    if (!isMatch) {
      console.error('ERROR: Password does not match');
      console.log('Stored password hash:', user.password);
    }

  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

testLogin();
