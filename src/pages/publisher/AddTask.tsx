import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, Calendar, Tag, FileText, CheckCircle } from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';
import { taskService, type TaskCategory } from '../../services/taskService';
import { taskEscrowService } from '../../services/taskEscrow';

const AddTask: React.FC = () => {
  const navigate = useNavigate();
  const { walletAddress } = useWallet();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'coding' as TaskCategory,
    budget: '',
    deadline: '',
    requirements: [''],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories: TaskCategory[] = ['coding', 'design', 'translation', 'math', 'writing', 'other'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRequirementChange = (index: number, value: string) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData({
      ...formData,
      requirements: newRequirements,
    });
  };

  const addRequirement = () => {
    setFormData({
      ...formData,
      requirements: [...formData.requirements, ''],
    });
  };

  const removeRequirement = (index: number) => {
    const newRequirements = formData.requirements.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      requirements: newRequirements.length > 0 ? newRequirements : [''],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletAddress) {
      setError('Please connect your wallet first');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const budget = parseFloat(formData.budget);
      const deadline = new Date(formData.deadline);
      const cleanedRequirements = formData.requirements.filter(req => req.trim() !== '');

      const balance = await taskEscrowService.getPyusdBalance(walletAddress);

      if (parseFloat(balance) < budget) {
        throw new Error(`Insufficient PYUSD balance. You have ${balance} PYUSD, but need ${budget} PYUSD`);
      }

      const allowance = await taskEscrowService.checkAllowance(walletAddress);

      if (parseFloat(allowance) < budget) {
        await taskEscrowService.approvePyusd(budget);
      }

      const taskId = crypto.randomUUID();

      await taskEscrowService.depositForTask(
        taskId,
        budget,
        deadline
      );

      await taskService.createTask(walletAddress, {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        budget,
        deadline: deadline.toISOString(),
        requirements: cleanedRequirements,
      }, taskId);

      setIsSubmitting(false);
      setShowSuccess(true);

      setTimeout(() => {
        navigate('/publisher/tasks');
      }, 3000);
    } catch (err: any) {
      if (err.code === 4001 || err.code === 'ACTION_REJECTED' || err.message?.includes('user rejected') || err.message?.includes('User denied')) {
        setIsSubmitting(false);
        return;
      }
      
      console.error('Error creating task with deposit:', err);
      setError(err.message || 'Failed to create task and deposit PYUSD. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-[#111111] text-gray-300 pt-24 pb-16 px-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="bg-gray-800/50 border border-green-500/50 rounded-xl p-12 max-w-md">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Task Posted Successfully!</h2>
            <p className="text-gray-400 mb-2">PYUSD deposited to smart contract</p>
            <p className="text-gray-500 text-sm">Redirecting to your tasks...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] text-gray-300 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
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

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Post a New Task</h1>
          <p className="text-gray-400">Fill in the details below to create your task</p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-8 space-y-6"
        >
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Task Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-white mb-2">
              Task Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Build a React Component Library"
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="text-sm font-semibold text-white mb-2 flex items-center">
              <Tag className="w-4 h-4 mr-2" />
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="text-sm font-semibold text-white mb-2 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={6}
              placeholder="Describe your task in detail..."
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors resize-none"
            />
          </div>

          {/* Budget and Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="budget" className="text-sm font-semibold text-white mb-2 flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Budget (PYUSD) *
              </label>
              <input
                type="number"
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                required
                min="1"
                placeholder="500"
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="deadline" className="text-sm font-semibold text-white mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Deadline *
              </label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Requirements</label>
            <div className="space-y-3">
              {formData.requirements.map((req, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={req}
                    onChange={(e) => handleRequirementChange(index, e.target.value)}
                    placeholder={`Requirement ${index + 1}`}
                    className="flex-grow bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                  {formData.requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="text-red-400 hover:text-red-300 text-sm font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addRequirement}
              className="mt-3 text-orange-500 hover:text-orange-400 text-sm font-medium"
            >
              + Add Requirement
            </button>
          </div>

          {/* Payment Info removed as requested */}

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4 pt-4">
            <Link to="/publisher/tasks">
              <button
                type="button"
                className="px-6 py-3 rounded-md text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </Link>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              className="bg-orange-500 text-white px-8 py-3 rounded-md font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isSubmitting ? 'Posting...' : 'Post Task'}
            </motion.button>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default AddTask;

