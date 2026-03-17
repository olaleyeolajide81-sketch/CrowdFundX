const request = require('supertest');
const app = require('../src/index');

describe('API Endpoints', () => {
  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('OK');
    });
  });

  describe('Campaigns', () => {
    it('should get campaigns list', async () => {
      const response = await request(app)
        .get('/api/campaigns')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should create new campaign', async () => {
      const campaignData = {
        title: 'Test Campaign',
        description: 'A test campaign for unit testing',
        fundingGoal: 1000,
        deadline: '2024-12-31T23:59:59.000Z',
        category: 'technology'
      };

      const response = await request(app)
        .post('/api/campaigns')
        .send(campaignData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(campaignData.title);
    });
  });

  describe('Authentication', () => {
    it('should register new user', async () => {
      const userData = {
        stellarAddress: 'GD5XOVABCXHI3ZWM4PYVFY3',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe(userData.username);
    });
  });
});
