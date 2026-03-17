import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import CampaignCard from '../components/CampaignCard';

interface Campaign {
  _id: string;
  title: string;
  slug: string;
  description: string;
  fundingGoal: number;
  currentFunding: number;
  deadline: string;
  creator: {
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    isVerified?: boolean;
  };
  category: string;
  featuredImage?: string;
  status: string;
  stats: {
    views: number;
    uniqueContributors: number;
  };
}

const CampaignsPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const categories = [
    'all', 'technology', 'art', 'music', 'film', 
    'publishing', 'games', 'food', 'fashion', 
    'community', 'education', 'health', 'environment', 'other'
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Created Date' },
    { value: 'fundingGoal', label: 'Funding Goal' },
    { value: 'currentFunding', label: 'Current Funding' },
    { value: 'deadline', label: 'Deadline' }
  ];

  useEffect(() => {
    // TODO: Fetch campaigns from API
    const mockCampaigns: Campaign[] = [
      {
        _id: '1',
        title: 'Build the Future of Education',
        slug: 'build-future-education',
        description: 'A revolutionary platform for decentralized learning on Stellar blockchain.',
        fundingGoal: 50000,
        currentFunding: 25000,
        deadline: '2024-06-01',
        creator: {
          username: 'alice_creator',
          firstName: 'Alice',
          lastName: 'Smith',
          isVerified: true
        },
        category: 'education',
        featuredImage: '',
        status: 'active',
        stats: {
          views: 1250,
          uniqueContributors: 45
        }
      }
    ];
    
    setCampaigns(mockCampaigns);
    setLoading(false);
  }, []);

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || campaign.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    let aValue: any = a[sortBy as keyof Campaign];
    let bValue: any = b[sortBy as keyof Campaign];
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Explore Campaigns
          </h1>
          
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Sort */}
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="h-4 w-4 text-gray-400" />
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split('-');
                  setSortBy(sort);
                  setSortOrder(order as 'asc' | 'desc');
                }}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={`${option.value}-desc`} value={`${option.value}-desc`}>
                    {option.label} (Newest First)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Campaigns Grid */}
            {sortedCampaigns.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No campaigns found matching your criteria.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedCampaigns.map((campaign) => (
                  <CampaignCard key={campaign._id} campaign={campaign} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CampaignsPage;
