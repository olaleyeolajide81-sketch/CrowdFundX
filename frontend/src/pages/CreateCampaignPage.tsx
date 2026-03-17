import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, DollarSign, FileText, Image, Plus, X } from 'lucide-react';

const CreateCampaignPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fundingGoal: 1000,
    deadline: '',
    category: 'technology',
    featuredImage: '',
    rewardTiers: [
      {
        title: 'Early Supporter',
        description: 'Get early access and exclusive updates',
        minContribution: 10,
        maxBackers: 100,
        estimatedDelivery: '2024-02-01'
      }
    ]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // TODO: Implement actual campaign creation logic
      console.log('Creating campaign:', formData);
      
      // Mock successful creation
      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }, 1000);
    } catch (err) {
      setLoading(false);
      setError('Failed to create campaign. Please try again.');
      console.error('Campaign creation error:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFormData({
          ...formData,
          featuredImage: result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const addRewardTier = () => {
    const newTier = {
      title: '',
      description: '',
      minContribution: 1,
      maxBackers: 100,
      estimatedDelivery: ''
    };
    
    setFormData({
      ...formData,
      rewardTiers: [...formData.rewardTiers, newTier]
    });
  };

  const removeRewardTier = (index: number) => {
    const newRewardTiers = formData.rewardTiers.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      rewardTiers: newRewardTiers
    });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="flex justify-center items-center mb-8">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Campaign Created Successfully!
                  </h2>
                  <p className="mt-2 text-sm text-gray-600">
                    Your campaign has been created and is now under review.
                  </p>
                </div>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              What's Next?
            </h2>
            
            <div className="space-y-6">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Dashboard
              </button>
              
              <button
                onClick={() => navigate('/campaigns')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Create Another Campaign
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Campaign
          </h1>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Campaign Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter your campaign title"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Describe your campaign and what makes it unique"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="fundingGoal" className="block text-sm font-medium text-gray-700">
                Funding Goal (XLM)
              </label>
              <input
                type="number"
                id="fundingGoal"
                name="fundingGoal"
                value={formData.fundingGoal}
                onChange={handleChange}
                required
                min="1"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="1000"
              />
            </div>
            
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
                Campaign Deadline
              </label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Select a category</option>
              <option value="technology">Technology</option>
              <option value="art">Art</option>
              <option value="music">Music</option>
              <option value="film">Film</option>
              <option value="publishing">Publishing</option>
              <option value="games">Games</option>
              <option value="food">Food</option>
              <option value="fashion">Fashion</option>
              <option value="community">Community</option>
              <option value="education">Education</option>
              <option value="health">Health</option>
              <option value="environment">Environment</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          {/* Featured Image */}
          <div>
            <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700">
              Featured Image
            </label>
            <div className="mt-1 flex items-center space-x-4">
              <input
                type="file"
                id="featuredImage"
                name="featuredImage"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label className="cursor-pointer bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm hover:bg-gray-50">
                <Image className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {formData.featuredImage ? 'Change' : 'Upload'}
                </span>
              </label>
            </div>
            {formData.featuredImage && (
              <div className="mt-2">
                <img
                  src={formData.featuredImage}
                  alt="Campaign featured image"
                  className="h-20 w-20 object-cover rounded-lg"
                />
              </div>
            )}
          </div>
          
          {/* Reward Tiers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Reward Tiers</h3>
              <button
                type="button"
                onClick={addRewardTier}
                className="flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4" />
                Add Reward Tier
              </button>
            </div>
            
            {formData.rewardTiers.map((tier, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Tier {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeRewardTier(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500">Max backers: {tier.maxBackers}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    value={tier.title}
                    onChange={(e) => {
                      const updatedTiers = [...formData.rewardTiers];
                      updatedTiers[index] = {
                        ...tier,
                        title: e.target.value
                      };
                      setFormData({ ...formData, rewardTiers: updatedTiers });
                    }}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Reward tier title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={tier.description}
                    onChange={(e) => {
                      const updatedTiers = [...formData.rewardTiers];
                      updatedTiers[index] = {
                        ...tier,
                        description: e.target.value
                      };
                      setFormData({ ...formData, rewardTiers: updatedTiers });
                    }}
                    rows={2}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Describe this reward tier"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Minimum Contribution
                    </label>
                    <input
                      type="number"
                      value={tier.minContribution}
                      onChange={(e) => {
                        const updatedTiers = [...formData.rewardTiers];
                        updatedTiers[index] = {
                          ...tier,
                          minContribution: parseInt(e.target.value)
                        };
                        setFormData({ ...formData, rewardTiers: updatedTiers });
                      }}
                      min="1"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Maximum Backers
                    </label>
                    <input
                      type="number"
                      value={tier.maxBackers}
                      onChange={(e) => {
                        const updatedTiers = [...formData.rewardTiers];
                        updatedTiers[index] = {
                          ...tier,
                          maxBackers: parseInt(e.target.value)
                        };
                        setFormData({ ...formData, rewardTiers: updatedTiers });
                      }}
                      min="1"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Estimated Delivery
                    </label>
                    <input
                      type="date"
                      value={tier.estimatedDelivery}
                      onChange={(e) => {
                        const updatedTiers = [...formData.rewardTiers];
                        updatedTiers[index] = {
                          ...tier,
                          estimatedDelivery: e.target.value
                        };
                        setFormData({ ...formData, rewardTiers: updatedTiers });
                      }}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Submit Button */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Creating Campaign...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaignPage;
