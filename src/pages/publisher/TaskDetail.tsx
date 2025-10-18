import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, DollarSign, Clock, Tag, XCircle } from 'lucide-react';
import { taskService, type Task } from '../../services/taskService';

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadTask();
    }
  }, [id]);

  const loadTask = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const fetchedTask = await taskService.getTaskById(id);
      setTask(fetchedTask);
    } catch (err: any) {
      console.error('Error loading task:', err);
      setError(err.message || 'Failed to load task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!task) return;
    const confirmed = window.confirm('Delete this task? This action cannot be undone.');
    if (!confirmed) return;

    try {
      await taskService.deleteTask(task.id);
      navigate('/publisher/tasks');
    } catch (err: any) {
      console.error('Error deleting task:', err);
      alert(`Failed to delete task: ${err.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#111111] text-gray-300 pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-[#111111] text-gray-300 pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            {error || 'Task Not Found'}
          </h2>
          <Link to="/publisher/tasks" className="text-orange-500 hover:text-orange-400">
            Return to Your Tasks
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] text-gray-300 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Link to="/publisher/tasks">
          <motion.button
            whileHover={{ x: -4 }}
            className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Your Tasks</span>
          </motion.button>
        </Link>

        {/* Task Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-8 mb-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-3">{task.title}</h1>
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center text-orange-500 font-semibold">
                  <DollarSign className="w-5 h-5" />
                  {task.budget} PYUSD
                </span>
                <span className="flex items-center text-gray-400 text-sm">
                  <Clock className="w-4 h-4 mr-1" />
                  Due: {new Date(task.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="flex items-center text-gray-400 text-sm">
                  <Tag className="w-4 h-4 mr-1" />
                  {task.category}
                </span>
              </div>
            </div>

            {task.status === 'open' && (
              <motion.button
                onClick={handleDeleteTask}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bg-red-500/10 border border-red-500/40 text-red-400 px-4 py-2 rounded-md text-sm font-semibold hover:bg-red-500/20 transition-colors flex items-center space-x-2"
              >
                <XCircle className="w-4 h-4" />
                <span>Delete Task</span>
              </motion.button>
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
            <p className="text-gray-300">{task.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Requirements</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              {task.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>

          {/* Status Badge */}
          <div className="mt-6 pt-6 border-t border-gray-700/50">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Status:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                task.status === 'open' ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' :
                task.status === 'in-progress' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' :
                task.status === 'completed' ? 'text-green-400 bg-green-400/10 border-green-400/20' :
                'text-red-400 bg-red-400/10 border-red-400/20'
              }`}>
                {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ')}
              </span>
            </div>
            {task.freelancer_wallet && (
              <div className="mt-3 flex items-center space-x-2">
                <span className="text-sm text-gray-400">Assigned to:</span>
                <span className="text-sm text-white font-mono">
                  {task.freelancer_wallet.slice(0, 6)}...{task.freelancer_wallet.slice(-4)}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TaskDetail;

