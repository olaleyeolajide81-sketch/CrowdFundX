const mongoose = require('mongoose');

// Setup test database connection
beforeAll(async () => {
  const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/crowdfundx_test';
  await mongoose.connect(mongoUri);
});

// Cleanup test database
afterAll(async () => {
  await mongoose.connection.close();
});

// Clear collections before each test
beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
