import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { DollarSign, Clock, Search, TrendingUp } from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';
import { taskService, type Task, type TaskCategory } from '../../services/taskService';

const BrowseTasks: React.FC = () => {
  const { walletAddress } = useWallet();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'all'>('all');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allTasks = await taskService.getOpenTasks();
      
      // Filter out tasks created by the current user and tasks already assigned to a freelancer
      const filteredTasks = allTasks.filter(task => {
        const notOwnTask = !walletAddress || task.client_wallet.toLowerCase() !== walletAddress.toLowerCase();
        const notAssigned = !task.freelancer_wallet; // Only show tasks without a freelancer
        return notOwnTask && notAssigned;
      });
      
      setTasks(filteredTasks);
    } catch (err: any) {
      console.error('Error loading tasks:', err);
      setError(err.message || 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories: (TaskCategory | 'all')[] = ['all', 'coding', 'design', 'translation', 'math', 'writing', 'other'];

  return (
    <div className="min-h-screen bg-[#111111] text-gray-300 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-8 h-8 text-orange-500" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Browse Tasks</h1>
          </div>
          <p className="text-gray-400">Find and apply to tasks that match your skills</p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by title or description..."
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  categoryFilter === category
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-800/50 text-gray-400 hover:text-gray-300 border border-gray-700/50'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm mb-6">
            {error}
          </div>
        )}

        {/* Results Count */}
        {!isLoading && (
          <div className="mb-6">
            <p className="text-gray-400">
              Showing <span className="text-white font-semibold">{filteredTasks.length}</span> {filteredTasks.length === 1 ? 'task' : 'tasks'}
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-8 max-w-md mx-auto">
              <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No tasks found</h3>
              <p className="text-gray-400">
                Try adjusting your search or filters to find more tasks
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <Link to={`/freelancer/task/${task.id}`}>
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 hover:border-orange-500/50 transition-all cursor-pointer h-full flex flex-col">
                    {/* Badges */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-500 border border-orange-500/20">
                        {task.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                      {task.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-400 mb-4 line-clamp-3 flex-grow">
                      {task.description}
                    </p>

                    {/* Publisher removed per requirements */}

                    {/* Footer Info */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                      <div className="flex items-center space-x-1 text-orange-500">
                        <DollarSign className="w-5 h-5" />
                        <span className="font-semibold text-lg">{task.budget}</span>
                        <span className="text-xs text-gray-400">PYUSD</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BrowseTasks;

