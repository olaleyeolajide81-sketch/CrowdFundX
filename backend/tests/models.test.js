const mongoose = require('mongoose');
const User = require('../src/models/User');
const Campaign = require('../src/models/Campaign');
const Contribution = require('../src/models/Contribution');

describe('Models', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/crowdfundx_test';
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Campaign.deleteMany({});
    await Contribution.deleteMany({});
  });

  describe('User Model', () => {
    it('should create a new user', async () => {
      const userData = {
        stellarAddress: 'GD5XOVABCXHI3ZWM4PYVFY3',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.stellarAddress).toBe(userData.stellarAddress);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.username).toBe(userData.username);
    });

    it('should require unique stellar address', async () => {
      const userData = {
        stellarAddress: 'GD5XOVABCXHI3ZWM4PYVFY3',
        email: 'test1@example.com',
        username: 'testuser1',
        firstName: 'Test',
        lastName: 'User'
      };

      const user1 = new User(userData);
      await user1.save();

      const user2 = new User({
        ...userData,
        email: 'test2@example.com',
        username: 'testuser2'
      });

      await expect(user2.save()).rejects.toThrow();
    });
  });

  describe('Campaign Model', () => {
    it('should create a new campaign', async () => {
      const user = new User({
        stellarAddress: 'GD5XOVABCXHI3ZWM4PYVFY3',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User'
      });
      await user.save();

      const campaignData = {
        creator: user._id,
        title: 'Test Campaign',
        description: 'A test campaign',
        fundingGoal: 1000,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        category: 'technology'
      };

      const campaign = new Campaign(campaignData);
      const savedCampaign = await campaign.save();

      expect(savedCampaign.title).toBe(campaignData.title);
      expect(savedCampaign.slug).toBe('test-campaign');
      expect(savedCampaign.status).toBe('draft');
    });

    it('should generate slug from title', async () => {
      const user = new User({
        stellarAddress: 'GD5XOVABCXHI3ZWM4PYVFY3',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User'
      });
      await user.save();

      const campaign = new Campaign({
        creator: user._id,
        title: 'Test Campaign With Spaces!',
        description: 'A test campaign',
        fundingGoal: 1000,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        category: 'technology'
      });

      const savedCampaign = await campaign.save();
      expect(savedCampaign.slug).toBe('test-campaign-with-spaces');
    });
  });

  describe('Contribution Model', () => {
    it('should create a new contribution', async () => {
      const user = new User({
        stellarAddress: 'GD5XOVABCXHI3ZWM4PYVFY3',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User'
      });
      await user.save();

      const campaign = new Campaign({
        creator: user._id,
        title: 'Test Campaign',
        description: 'A test campaign',
        fundingGoal: 1000,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        category: 'technology'
      });
      await campaign.save();

      const contributionData = {
        campaign: campaign._id,
        contributor: user._id,
        amount: 100,
        asset: 'XLM',
        transactionHash: 'test_tx_hash',
        status: 'completed'
      };

      const contribution = new Contribution(contributionData);
      const savedContribution = await contribution.save();

      expect(savedContribution.amount).toBe(contributionData.amount);
      expect(savedContribution.status).toBe(contributionData.status);
    });
  });
});
