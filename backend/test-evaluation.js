const mongoose = require('mongoose');

// First, let's check if the evaluation route works
async function testEvaluationGeneration() {
  try {
    await mongoose.connect('mongodb://localhost:27017/bravo-points');
    console.log('Connected to MongoDB\n');
    
    // Get user
    const User = mongoose.connection.db.collection('users');
    const user = await User.findOne({ email: 'rlungma@gmail.com' });
    console.log('User ID:', user._id.toString());
    
    // Get first employee
    const Email = mongoose.connection.db.collection('emails');
    const employee = await Email.findOne({ userId: user._id.toString() });
    console.log('Employee ID:', employee._id.toString());
    console.log('Employee Name:', employee.name);
    console.log('Employee userId:', employee.userId);
    
    // Check if employee belongs to user
    if (employee.userId === user._id.toString()) {
      console.log('\n✅ Employee belongs to user - evaluation should work');
    } else {
      console.log('\n❌ Employee userId mismatch!');
      console.log('   Expected:', user._id.toString());
      console.log('   Got:', employee.userId);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

testEvaluationGeneration();
