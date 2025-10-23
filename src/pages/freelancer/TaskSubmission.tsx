import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, FileText, Code, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { taskService } from '../../services/taskService';
import type { Task } from '../../services/taskService';

type SubmissionField = {
  id: string;
  type: 'text' | 'code';
  label: string;
  content: string;
};

const TaskSubmission: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fields, setFields] = useState<SubmissionField[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const loadTask = async () => {
      if (!id) return;
      try {
        const taskData = await taskService.getTaskById(id);
        setTask(taskData);
      } catch (error) {
        console.error('Error loading task:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTask();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#111111] text-gray-300 pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-[#111111] text-gray-300 pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Task Not Found</h2>
          <Link to="/freelancer/your-tasks" className="text-orange-500 hover:text-orange-400">
            Return to Your Tasks
          </Link>
        </div>
      </div>
    );
  }

  const addField = (type: 'text' | 'code') => {
    const newField: SubmissionField = {
      id: Date.now().toString(),
      type,
      label: '',
      content: ''
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const updateFieldLabel = (id: string, label: string) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, label } : field
    ));
  };

  const updateFieldContent = (id: string, content: string) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, content } : field
    ));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (fields.length === 0) {
      alert('Please add at least one submission field');
      return;
    }

    if (fields.some(f => !f.label.trim() || !f.content.trim())) {
      alert('Please fill in all field labels and content');
      return;
    }

    setIsSubmitting(true);

    try {
      const submissionData = {
        fields: fields.map(f => ({
          type: f.type,
          label: f.label,
          content: f.content
        })),
        submitted_at: new Date().toISOString()
      };

      await taskService.submitWork(task!.id, submissionData);
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/freelancer/your-tasks');
      }, 3000);
    } catch (error) {
      console.error('Error submitting work:', error);
      alert('Failed to submit work. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: SubmissionField) => {
    switch (field.type) {
      case 'text':
        return (
          <div key={field.id} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-orange-500" />
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => updateFieldLabel(field.id, e.target.value)}
                  placeholder="Field Label"
                  className="bg-gray-900/50 border border-gray-700 rounded px-3 py-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                />
              </div>
              <button
                type="button"
                onClick={() => removeField(field.id)}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <textarea
              value={field.content}
              onChange={(e) => updateFieldContent(field.id, e.target.value)}
              placeholder="Enter your text content here..."
              rows={6}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 resize-none"
            />
          </div>
        );

      case 'code':
        return (
          <div key={field.id} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-orange-500" />
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => updateFieldLabel(field.id, e.target.value)}
                  placeholder="Field Label"
                  className="bg-gray-900/50 border border-gray-700 rounded px-3 py-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                />
              </div>
              <button
                type="button"
                onClick={() => removeField(field.id)}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <textarea
              value={field.content}
              onChange={(e) => updateFieldContent(field.id, e.target.value)}
              placeholder="Paste your code here..."
              rows={12}
              className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 resize-none font-mono text-sm"
            />
          </div>
        );

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
          <div className="bg-gray-800/50 border border-green-500/50 rounded-xl p-12 max-w-lg">
            <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-3">Submission Received!</h2>
            <p className="text-gray-300 mb-4">
              Your work has been submitted successfully. The AI agent will now verify your submission.
            </p>
            <p className="text-sm text-gray-400">
              Redirecting to your tasks...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] text-gray-300 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Link to="/freelancer/your-tasks">
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
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Submit Your Work</h1>
          <p className="text-xl text-gray-400">{task.title}</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Submission Fields */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {fields.map((field, index) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {renderField(field)}
              </motion.div>
            ))}
          </motion.div>

          {/* Add Field Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6"
          >
            <p className="text-sm font-semibold text-white mb-3">Add Submission Field:</p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => addField('text')}
                className="flex items-center space-x-2 bg-gray-700/50 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <FileText className="w-4 h-4" />
                <span>Text Field</span>
              </button>
              <button
                type="button"
                onClick={() => addField('code')}
                className="flex items-center space-x-2 bg-gray-700/50 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <Code className="w-4 h-4" />
                <span>Code Field</span>
              </button>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-end space-x-4"
          >
            <Link to="/freelancer/your-tasks">
              <button
                type="button"
                className="px-6 py-3 rounded-md text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </Link>
            <motion.button
              type="submit"
              disabled={isSubmitting || fields.length === 0}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              className="bg-orange-500 text-white px-8 py-3 rounded-md font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Submit Work</span>
                </>
              )}
            </motion.button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default TaskSubmission;

