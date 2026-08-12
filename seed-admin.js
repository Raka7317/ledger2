// One-time script to create the FIRST admin account.
// Run: npm run seed:admin -- <username> <password>
// Example: npm run seed:admin -- rammohan MySecret123
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI;
const [, , username, password] = process.argv;

if (!MONGO_URI) {
  console.error('ERROR: MONGO_URI is not set. Create a .env file (see .env.example).');
  process.exit(1);
}

if (!username || !password) {
  console.error('Usage: npm run seed:admin -- <username> <password>');
  process.exit(1);
}

if (password.length < 6) {
  console.error('Password must be at least 6 characters.');
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(MONGO_URI);

    const existing = await User.findOne({ username: username.toLowerCase().trim() });
    if (existing) {
      console.error(`A user named "${username}" already exists.`);
      process.exit(1);
    }

    const admin = new User({ username, password, role: 'admin' });
    await admin.save();

    console.log(`✅ Admin user created: ${admin.username} (role: admin)`);
    console.log('You can now log in on the website with this username and password.');
  } catch (err) {
    console.error('Error creating admin:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
