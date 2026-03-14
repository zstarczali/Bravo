const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/bravo-points')
  .then(async () => {
    console.log('Connected to MongoDB\n');
    
    // Find user
    const User = mongoose.connection.db.collection('users');
    const user = await User.findOne({ email: 'rlungma@gmail.com' });
    
    if (!user) {
      console.log('❌ User rlungma@gmail.com not found');
      process.exit(0);
    }
    
    console.log('✅ User found:');
    console.log('   ID:', user._id.toString());
    console.log('   Name:', user.name);
    console.log('   Email:', user.email);
    
    // Find employees for this user
    const Email = mongoose.connection.db.collection('emails');
    const employees = await Email.find({ userId: user._id.toString() }).toArray();
    
    console.log('\n📋 Employees for this user:', employees.length);
    employees.forEach(emp => {
      console.log('   -', emp.name, '(', emp.email, ') - userId:', emp.userId);
    });
    
    // Check employees without userId
    const orphanedEmails = await Email.find({ userId: { $exists: false } }).toArray();
    console.log('\n⚠️  Employees without userId:', orphanedEmails.length);
    orphanedEmails.forEach(emp => {
      console.log('   -', emp.name, '(', emp.email, ')');
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
