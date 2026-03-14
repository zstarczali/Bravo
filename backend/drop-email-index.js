const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/bravo-points')
  .then(() => {
    console.log('Connected to MongoDB');
    return mongoose.connection.db.collection('emails').indexes();
  })
  .then((indexes) => {
    console.log('Current indexes:');
    indexes.forEach(idx => {
      console.log('  -', idx.name, ':', JSON.stringify(idx.key));
    });
    
    // Try to find and drop the email unique index
    const emailIndex = indexes.find(idx => idx.key.email === 1 && idx.unique);
    if (emailIndex) {
      console.log('\nDropping unique email index:', emailIndex.name);
      return mongoose.connection.db.collection('emails').dropIndex(emailIndex.name);
    } else {
      console.log('\n✓ No unique email index found (already removed or never existed)');
      process.exit(0);
    }
  })
  .then(() => {
    console.log('✅ Index dropped successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
