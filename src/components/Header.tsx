import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, User, Folder, Wallet } from 'lucide-react';

interface HeaderProps {
  userRole: 'publisher' | 'freelancer';
  onSelectRole: (role: 'publisher' | 'freelancer') => void;
}

const Header: React.FC<HeaderProps> = ({ userRole, onSelectRole }) => {
  const location = useLocation();
  const isPublisher = userRole === 'publisher';
  const navigate = useNavigate();
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 bg-[#111111]/95 border-b border-gray-700/50 backdrop-blur-sm"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo (no navigation) */}
          <div className="flex items-center space-x-2 select-none">
            <Briefcase className="text-orange-500 w-7 h-7" />
            <span className="text-xl font-bold text-white">freelanceai</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {isPublisher ? (
              <>
                <Link
                  to="/publisher/tasks"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname.includes('/publisher/tasks')
                      ? 'text-orange-500'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Your Tasks
                </Link>
               
              </>
            ) : (
              <>
                <Link
                  to="/freelancer/browse"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname.includes('/freelancer/browse')
                      ? 'text-orange-500'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Browse Tasks
                </Link>
                <Link
                  to="/freelancer/your-tasks"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname.includes('/freelancer/your-tasks')
                      ? 'text-orange-500'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Your Tasks
                </Link>
                <Link
                  to="/profile"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/profile'
                      ? 'text-orange-500'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Profile
                </Link>
              </>
            )}
          </nav>

          {/* Role Toggle */}
          <div className="flex items-center space-x-4">
            {/* Connect Wallet */}
            <motion.button
              onClick={() => {
                if (!isWalletConnected) {
                  setIsWalletConnected(true);
                }
                navigate('/profile');
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-orange-500 text-white px-3 sm:px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-orange-600 transition-colors flex items-center space-x-2 shadow-lg"
            >
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">{isWalletConnected ? 'Connected' : 'Connect Wallet'}</span>
              <span className="sm:hidden">{isWalletConnected ? 'Connected' : 'Connect'}</span>
            </motion.button>
            <div className="flex items-center bg-gray-800/50 rounded-lg p-1 border border-gray-700/50">
              <button
                onClick={() => {
                  if (!isPublisher) {
                    onSelectRole('publisher');
                  }
                  navigate('/publisher/tasks');
                }}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  isPublisher
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <Folder className="w-4 h-4" />
                <span>Client</span>
              </button>
              <button
                onClick={() => {
                  if (isPublisher) {
                    onSelectRole('freelancer');
                  }
                  navigate('/freelancer/browse');
                }}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  !isPublisher
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Freelancer</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;

