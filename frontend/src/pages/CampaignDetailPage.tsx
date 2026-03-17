import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, DollarSign, User, Clock, Heart, Share2, ChevronLeft } from 'lucide-react';

interface Campaign {
  id: string;
  title: string;
  description: string;
  fundingGoal: number;
  currentFunding: number;
  deadline: string;
  creator: {
    username: string;
    avatar?: string;
  };
  category: string;
  featuredImage?: string;
  rewardTiers: Array<{
    id: string;
    title: string;
    description: string;
    minContribution: number;
    maxBackers: number;
    currentBackers: number;
    estimatedDelivery: string;
  }>;
  updates: Array<{
    id: string;
    title: string;
    content: string;
    createdAt: string;
  }>;
}

const CampaignDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReward, setSelectedReward] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [contributing, setContributing] = useState(false);

  useEffect(() => {
    // TODO: Fetch campaign data from API
    const mockCampaign: Campaign = {
      id: '1',
      title: 'Build the Future of Education',
      description: 'A revolutionary platform that makes learning accessible to everyone, everywhere. We are building an AI-powered educational platform that adapts to each student\'s learning style and pace.',
      fundingGoal: 10000,
      currentFunding: 7500,
      deadline: '2024-12-31T23:59:59.000Z',
      creator: {
        username: 'edtech_innovator',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      },
      category: 'education',
      featuredImage: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=400&fit=crop',
      rewardTiers: [
        {
          id: '1',
          title: 'Early Supporter',
          description: 'Get early access and exclusive updates',
          minContribution: 10,
          maxBackers: 100,
          currentBackers: 45,
          estimatedDelivery: '2024-02-01'
        },
        {
          id: '2',
          title: 'Premium Access',
          description: 'Lifetime access and exclusive content',
          minContribution: 50,
          maxBackers: 50,
          currentBackers: 23,
          estimatedDelivery: '2024-03-01'
        },
        {
          id: '3',
          title: 'Founder Circle',
          description: 'All benefits plus personalized coaching',
          minContribution: 500,
          maxBackers: 10,
          currentBackers: 3,
          estimatedDelivery: '2024-04-01'
        }
      ],
      updates: [
        {
          id: '1',
          title: 'Milestone Reached: 75% Funded!',
          content: 'We are thrilled to announce that we have reached 75% of our funding goal. Thank you to all our supporters!',
          createdAt: '2024-01-15T10:00:00.000Z'
        },
        {
          id: '2',
          title: 'New Feature Preview',
          content: 'Check out our latest AI-powered learning module in action. This is just the beginning!',
          createdAt: '2024-01-10T15:30:00.000Z'
        }
      ]
    };

    setTimeout(() => {
      setCampaign(mockCampaign);
      setLoading(false);
    }, 1000);
  }, [slug]);

  const handleContribution = async () => {
    if (!selectedReward || !contributionAmount) {
      setError('Please select a reward tier and enter contribution amount');
      return;
    }

    setContributing(true);
    setError('');

    try {
      // TODO: Implement actual contribution logic
      console.log('Making contribution:', {
        campaignId: campaign?.id,
        rewardId: selectedReward,
        amount: contributionAmount
      });

      // Mock successful contribution
      setTimeout(() => {
        setContributing(false);
        alert('Thank you for your contribution!');
        setContributionAmount('');
        setSelectedReward(null);
      }, 2000);
    } catch (err) {
      setContributing(false);
      setError('Contribution failed. Please try again.');
      console.error('Contribution error:', err);
    }
  };

  const calculateProgress = () => {
    if (!campaign) return 0;
    return Math.min((campaign.currentFunding / campaign.fundingGoal) * 100, 100);
  };

  const calculateDaysLeft = () => {
    if (!campaign) return 0;
    const deadline = new Date(campaign.deadline);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Campaign Not Found</h1>
          <button
            onClick={() => navigate('/campaigns')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md"
          >
            Back to Campaigns
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/campaigns')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Campaigns
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Campaign Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {campaign.title}
              </h1>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">{campaign.creator.username}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">{calculateDaysLeft()} days left</span>
                </div>
                <div className="flex items-center">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {campaign.category}
                  </span>
                </div>
              </div>

              {/* Featured Image */}
              {campaign.featuredImage && (
                <div className="mb-6">
                  <img
                    src={campaign.featuredImage}
                    alt={campaign.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Campaign Description */}
              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About this campaign</h2>
                <p className="text-gray-600 leading-relaxed">
                  {campaign.description}
                </p>
              </div>
            </div>

            {/* Updates */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Campaign Updates</h2>
              <div className="space-y-4">
                {campaign.updates.map((update) => (
                  <div key={update.id} className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {update.title}
                    </h3>
                    <p className="text-gray-600 mb-2">{update.content}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(update.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Funding Progress */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="text-sm font-medium text-gray-900">
                    {calculateProgress().toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${calculateProgress()}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Raised</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {campaign.currentFunding.toLocaleString()} XLM
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Goal</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {campaign.fundingGoal.toLocaleString()} XLM
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {calculateDaysLeft()} days left
                </div>
                <div className="flex items-center">
                  <Heart className="h-4 w-4 mr-1" />
                  {campaign.rewardTiers.reduce((sum, tier) => sum + tier.currentBackers, 0)} backers
                </div>
              </div>
            </div>

            {/* Contribute Form */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Back this project</h3>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select a reward tier
                  </label>
                  <div className="space-y-2">
                    {campaign.rewardTiers.map((tier) => (
                      <label key={tier.id} className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="reward"
                          value={tier.id}
                          checked={selectedReward === tier.id}
                          onChange={(e) => setSelectedReward(e.target.value)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">{tier.title}</p>
                              <p className="text-sm text-gray-600">{tier.description}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {tier.currentBackers}/{tier.maxBackers} backers
                              </p>
                            </div>
                            <span className="text-lg font-semibold text-gray-900">
                              {tier.minContribution} XLM
                            </span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contribution amount (XLM)
                  </label>
                  <input
                    type="number"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <button
                  onClick={handleContribution}
                  disabled={!selectedReward || !contributionAmount || contributing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {contributing ? 'Processing...' : 'Contribute Now'}
                </button>
              </div>
            </div>

            {/* Share */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Share this campaign</h3>
              <div className="flex space-x-4">
                <button className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetailPage;
