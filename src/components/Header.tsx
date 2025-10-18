import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, User, Folder } from 'lucide-react';

interface HeaderProps {
  userRole: 'publisher' | 'freelancer';
  onToggleRole: () => void;
}

const Header: React.FC<HeaderProps> = ({ userRole, onToggleRole }) => {
  const location = useLocation();
  const isPublisher = userRole === 'publisher';

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 bg-[#111111]/95 border-b border-gray-700/50 backdrop-blur-sm"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Briefcase className="text-orange-500 w-7 h-7" />
            <span className="text-xl font-bold text-white">freelanceai</span>
          </Link>

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
              </>
            )}
          </nav>

          {/* Role Toggle */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-gray-800/50 rounded-lg p-1 border border-gray-700/50">
              <button
                onClick={onToggleRole}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  isPublisher
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <Folder className="w-4 h-4" />
                <span>Publisher</span>
              </button>
              <button
                onClick={onToggleRole}
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

