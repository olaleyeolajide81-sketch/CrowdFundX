import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    campaignsCreated: 0,
    contributionsMade: 0,
    totalRaised: 0,
    totalContributed: 0
  });

  useEffect(() => {
    // TODO: Fetch user stats from API
    const mockStats = {
      campaignsCreated: 3,
      contributionsMade: 12,
      totalRaised: 2500,
      totalContributed: 500
    };
    setStats(mockStats);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Dashboard
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <p className="text-white font-medium">{stats.campaignsCreated}</p>
                </div>
                <div className="ml-4">
                  <p className="text-lg font-medium text-gray-900">Campaigns Created</p>
                  <p className="text-sm text-gray-500">Total campaigns you've launched</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <p className="text-white font-medium">{stats.contributionsMade}</p>
                </div>
                <div className="ml-4">
                  <p className="text-lg font-medium text-gray-900">Contributions Made</p>
                  <p className="text-sm text-gray-500">Total contributions you've made</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <p className="text-white font-medium">{stats.totalRaised}</p>
                </div>
                <div className="ml-4">
                  <p className="text-lg font-medium text-gray-900">Total Raised</p>
                  <p className="text-sm text-gray-500">Total amount raised across all campaigns</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                  <p className="text-white font-medium">{stats.totalContributed}</p>
                </div>
                <div className="ml-4">
                  <p className="text-lg font-medium text-gray-900">Total Contributed</p>
                  <p className="text-sm text-gray-500">Total amount you've contributed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Recent Activity
          </h2>
          
          <div className="bg-white shadow rounded-lg">
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Contributed to "Build the Future"</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-medium text-gray-900">100 XLM</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Created campaign "Education Platform"</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500">Draft</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
