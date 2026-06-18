const mongoose = require('mongoose');

// Mock mongoose connect/disconnect
mongoose.connect = async () => {
  console.log('[Mock] mongoose.connect called');
};
mongoose.disconnect = async () => {
  console.log('[Mock] mongoose.disconnect called');
};

// Mock User model
const User = require('./src/models/User');
User.findOne = async (query) => {
  console.log('[Mock] User.findOne called with:', query);
  return null; // Return null so it creates the admin
};

User.create = async (data) => {
  console.log('[Mock] User.create called with:', data);
  return {
    fullName: `${data.firstName} ${data.lastName}`,
    email: data.email,
    role: data.role
  };
};

// Now execute the seed script by requiring it!
console.log('Running seedAdmin script with mocked DB...');
require('./src/scripts/seedAdmin');
