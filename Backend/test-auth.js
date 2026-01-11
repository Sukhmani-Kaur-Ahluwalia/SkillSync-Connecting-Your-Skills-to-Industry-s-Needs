// Simple script to test if credentials are saved in the database
// Run this with: node test-auth.js

const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function checkUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    // Find all users
    const users = await User.find().select('-password');
    
    console.log(`Total users registered: ${users.length}\n`);
    
    if (users.length === 0) {
      console.log('No users found in database. Try registering a new user first!');
    } else {
      console.log('Registered Users:');
      console.log('==================');
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   ID: ${user._id}`);
        console.log(`   Created: ${user.createdAt}`);
      });
    }

    // Also check if passwords are hashed (should not see plain passwords)
    const usersWithPasswords = await User.find();
    console.log('\n\nPassword Verification:');
    console.log('=====================');
    usersWithPasswords.forEach((user, index) => {
      console.log(`\n${index + 1}. Email: ${user.email}`);
      console.log(`   Password Hash: ${user.password.substring(0, 20)}... (hashed)`);
      console.log(`   Password Length: ${user.password.length} characters`);
      if (user.password.length > 50) {
        console.log('   ✓ Password is properly hashed (bcrypt)');
      } else {
        console.log('   ⚠ Password might not be hashed properly!');
      }
    });

    await mongoose.connection.close();
    console.log('\n\nDatabase connection closed.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();
