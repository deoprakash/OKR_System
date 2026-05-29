import 'dotenv/config';
import mongoose from 'mongoose';
import Employee from '../src/models/employee.js';

async function main() {
  const [,, emailArg, passwordArg] = process.argv;
  if (!emailArg || !passwordArg) {
    console.error('Usage: node scripts/setAdminPassword.js <email> <newPassword>');
    process.exit(2);
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error('MONGODB_URI must be set in .env');
    process.exit(2);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = String(emailArg).trim().toLowerCase();
    const emp = await Employee.findOne({ emailId: email });
    if (!emp) {
      console.error('Employee not found with email:', email);
      process.exit(3);
    }

    emp.setPassword(passwordArg);
    emp.mustChangePassword = false;
    await emp.save();

    console.log(`Password updated for ${emp.userId} (${emp.emailId})`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to set password:', err?.message || err);
    process.exit(1);
  }
}

main();
