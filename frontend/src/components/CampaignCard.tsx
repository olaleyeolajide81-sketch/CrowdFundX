import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, TrendingUp } from 'lucide-react';
import { Campaign } from '../types';

interface CampaignCardProps {
  campaign: Campaign;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
  const progress = (Number(campaign.current_funding) / Number(campaign.funding_goal)) * 100;
  const daysLeft = Math.ceil((campaign.deadline - Date.now()) / (1000 * 60 * 60 * 24));
  
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <Link to={`/campaigns/${campaign.id}`}>
        {/* Campaign Image */}
        <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
          {campaign.image_url ? (
            <img
              src={campaign.image_url}
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-300">
              <span className="text-gray-500">No Image</span>
            </div>
          )}
        </div>
        
        {/* Campaign Content */}
        <div className="p-6">
          {/* Category Badge */}
          <div className="mb-2">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">
              {campaign.category}
            </span>
          </div>
          
          {/* Title */}
          <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
            {campaign.title}
          </h3>
          
          {/* Description */}
          <p className="text-gray-600 mb-4 line-clamp-3">
            {campaign.description}
          </p>
          
          {/* Creator Info */}
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-gray-300 rounded-full mr-2"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {campaign.creator}
              </p>
              <p className="text-xs text-gray-500">Creator</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{progress.toFixed(1)}% funded</span>
              <span>{daysLeft} days left</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex justify-between text-sm text-gray-600">
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>{campaign.current_funding} / {campaign.funding_goal}</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>0</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{new Date(campaign.deadline).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default CampaignCard;
