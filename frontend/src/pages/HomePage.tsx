import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Users, TrendingUp } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Fund Your Dreams on
              <span className="text-blue-600"> Stellar</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Decentralized crowdfunding with low fees, fast transactions, and global reach
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/campaigns"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                Explore Campaigns
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/create-campaign"
                className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Start Your Campaign
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose CrowdFundX?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center p-6 rounded-lg border border-gray-200"
            >
              <Star className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Low Fees</h3>
              <p className="text-gray-600">
                Stellar's network ensures minimal transaction costs, maximizing funds for creators
              </p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center p-6 rounded-lg border border-gray-200"
            >
              <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Global Access</h3>
              <p className="text-gray-600">
                Reach contributors worldwide with Stellar's fast, borderless transactions
              </p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center p-6 rounded-lg border border-gray-200"
            >
              <TrendingUp className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Transparent</h3>
              <p className="text-gray-600">
                Blockchain technology ensures complete transparency and accountability
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Featured Campaigns
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Placeholder for featured campaigns */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
              <p className="text-gray-600">Featured campaigns will appear here</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
