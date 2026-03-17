import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold text-blue-600">CrowdFundX</span>
              </Link>
            </div>
            
            <nav className="flex space-x-8">
              <Link
                to="/"
                className={`text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium ${
                  isHomePage ? 'bg-blue-100 text-blue-700' : ''
                }`}
              >
                Home
              </Link>
              <Link
                to="/campaigns"
                className={`text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/campaigns' ? 'bg-blue-100 text-blue-700' : ''
                }`}
              >
                Explore
              </Link>
              <Link
                to="/create-campaign"
                className={`text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/create-campaign' ? 'bg-blue-100 text-blue-700' : ''
                }`}
              >
                Create Campaign
              </Link>
            </nav>
            
            {!isAuthPage && (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="md:flex md:justify-between">
            <div className="md:mb-0 md:mr-4">
              <p className="text-base text-gray-500">
                &copy; 2024 CrowdFundX. All rights reserved.
              </p>
            </div>
            
            <div className="md:mb-0 md:space-x-6">
              <Link to="/about" className="text-gray-600 hover:text-blue-600">
                About
              </Link>
              <span className="text-gray-300">|</span>
              <Link to="/privacy" className="text-gray-600 hover:text-blue-600">
                Privacy
              </Link>
              <span className="text-gray-300">|</span>
              <Link to="/terms" className="text-gray-600 hover:text-blue-600">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
