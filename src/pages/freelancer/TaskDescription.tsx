import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, DollarSign, Clock, Tag, CheckCircle } from 'lucide-react';
import { taskService, type Task } from '../../services/taskService';
import { useWallet } from '../../contexts/WalletContext';
import AgentDrawer from '../../components/AgentDrawer';

const TaskDescription: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useWallet();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [interactionId, setInteractionId] = useState<string | null>(null);

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

  const handleApply = async () => {
    if (!user || !task) {
      alert('Please complete your profile first!');
      return;
    }

    setIsApplying(true);
    setIsDrawerOpen(true);
    
    try {
      const response = await fetch('http://localhost:5000/evaluate-freelancer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_id: task.id,
          profile: {
            name: user.name,
            skills: user.skills,
            description: user.description,
            work_experience: user.work_experience,
            education: user.education,
            wallet: user.wallet_address
          },
          job_requirements: {
            title: task.title,
            category: task.category,
            requirements: task.requirements,
            description: task.description
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setInteractionId(data.interaction_id);
        
        // Store wallet and task ID for the drawer
        if (user.wallet_address) {
          localStorage.setItem('currentEvaluation', JSON.stringify({
            wallet: user.wallet_address,
            taskId: task.id
          }));
        }
      } else {
        alert('Failed to start evaluation. Please try again.');
        setIsDrawerOpen(false);
      }
    } catch (error) {
      console.error('Error applying:', error);
      alert('AI Agent not available. Please try again later.');
      setIsDrawerOpen(false);
    } finally {
      setIsApplying(false);
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
          <Link to="/freelancer/browse" className="text-orange-500 hover:text-orange-400">
            Return to Browse Tasks
          </Link>
        </div>
      </div>
    );
  }

  const daysUntilDeadline = Math.ceil((new Date(task.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-[#111111] text-gray-300 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Link to="/freelancer/browse">
          <motion.button
            whileHover={{ x: -4 }}
            className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Browse</span>
          </motion.button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-8"
            >
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-500 border border-orange-500/20">
                  {task.category}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-white mb-4">{task.title}</h1>

              <div className="flex items-center space-x-2 text-gray-400 text-sm mb-6">
                <Tag className="w-4 h-4" />
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-500 border border-orange-500/20">
                  {task.category}
                </span>
                <span className="text-gray-600">•</span>
                <span>{new Date(task.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-3">Description</h2>
                <p className="text-gray-300 leading-relaxed">{task.description}</p>
              </div>
            </motion.div>

            {/* Requirements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-8"
            >
              <h2 className="text-xl font-semibold text-white mb-4">Requirements</h2>
              <ul className="space-y-2">
                {task.requirements.map((req, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{req}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Task Info Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 sticky top-24"
            >
              <div className="mb-6">
                <div className="text-sm text-gray-400 mb-2">Budget</div>
                <div className="flex items-center space-x-1 text-orange-500">
                  <DollarSign className="w-6 h-6" />
                  <span className="text-3xl font-bold">{task.budget}</span>
                  <span className="text-sm text-gray-400">PYUSD</span>
                </div>
              </div>

              <div className="mb-6 pb-6 border-b border-gray-700/50">
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-gray-400">Deadline</span>
                  <div className="flex items-center space-x-1 text-white">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Time Left</span>
                  <span className={`font-semibold ${daysUntilDeadline < 7 ? 'text-red-400' : 'text-white'}`}>
                    {daysUntilDeadline} days
                  </span>
                </div>
              </div>

              <motion.button
                onClick={handleApply}
                disabled={isApplying || showSuccess}
                whileHover={{ scale: isApplying || showSuccess ? 1 : 1.03 }}
                whileTap={{ scale: isApplying || showSuccess ? 1 : 0.97 }}
                className={`w-full py-4 rounded-lg text-base font-semibold transition-all ${
                  showSuccess
                    ? 'bg-green-500/20 text-green-400 border-2 border-green-500/40 cursor-default'
                    : isApplying
                    ? 'bg-orange-500/50 text-white cursor-not-allowed'
                    : 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg'
                }`}
              >
                {showSuccess ? (
                  <span className="flex items-center justify-center space-x-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Application Sent!</span>
                  </span>
                ) : isApplying ? (
                  'Applying...'
                ) : (
                  'Apply for Task'
                )}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
      
      <AgentDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        interactionId={interactionId}
        agentType="client"
        title="Application Evaluation by Client Agent"
        taskId={task?.id}
      />
    </div>
  );
};

export default TaskDescription;

