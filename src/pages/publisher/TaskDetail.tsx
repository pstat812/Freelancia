import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, DollarSign, Clock, Tag, CheckCircle, XCircle, AlertCircle, User, FileText, Image as ImageIcon, Code, FileCode } from 'lucide-react';
import { getTaskById, deleteTaskById } from '../../data/mockData';

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const task = getTaskById(id || '');
  const navigate = useNavigate();

  const handleDeleteTask = () => {
    if (!task) return;
    const confirmed = window.confirm('Delete this task? This action cannot be undone.');
    if (!confirmed) return;

    const success = deleteTaskById(task.id);
    if (success) {
      navigate('/publisher/tasks');
    } else {
      alert('Failed to delete task.');
    }
  };

  if (!task) {
    return (
      <div className="min-h-screen bg-[#111111] text-gray-300 pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Task Not Found</h2>
          <Link to="/publisher/tasks" className="text-orange-500 hover:text-orange-400">
            Return to Your Tasks
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'pending': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'rejected': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'verified': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'submitted': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getFileIcon = (fileType?: string) => {
    switch (fileType) {
      case 'image': return <ImageIcon className="w-5 h-5" />;
      case 'code': return <Code className="w-5 h-5" />;
      case 'text': return <FileText className="w-5 h-5" />;
      case 'pdf': return <FileCode className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

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
        </motion.div>

        {/* Assigned Freelancer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-8 mb-6"
        >
          <h2 className="text-2xl font-bold text-white mb-6">
            Assigned Freelancer
          </h2>
          {task.applications.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No freelancer assigned</p>
          ) : (
            (() => {
              const application = task.applications[0];
              return (
                <div
                  key={application.id}
                  className="bg-gray-900/50 border border-gray-700/30 rounded-lg p-6"
                >
                  <div className="flex items-start mb-4">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center mr-3">
                      <User className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{application.freelancerName}</h3>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">Description</h4>
                    <p className="text-sm text-gray-300">{application.experience}</p>
                  </div>
                </div>
              );
            })()
          )}
        </motion.div>

        {/* Submissions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">
            Submissions ({task.submissions.length})
          </h2>
          {task.submissions.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No submissions yet</p>
          ) : (
            <div className="space-y-6">
              {task.submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="bg-gray-900/50 border border-gray-700/30 rounded-lg p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{submission.freelancerName}</h3>
                        <p className="text-sm text-gray-400">
                          Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(submission.status)}`}>
                      {submission.status.charAt(0).toUpperCase() + submission.status.slice(1).replace('-', ' ')}
                    </span>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-white mb-2">Submission</h4>
                    <p className="text-sm text-gray-300 mb-3">{submission.content}</p>
                    {submission.fileUrl && (
                      <div className="flex items-center space-x-2 text-sm text-orange-500">
                        {getFileIcon(submission.fileType)}
                        <a href={submission.fileUrl} className="hover:underline">
                          View {submission.fileType || 'file'}
                        </a>
                      </div>
                    )}
                  </div>

                  {submission.aiVerification && (
                    <div className={`border rounded-lg p-4 ${
                      submission.aiVerification.verified 
                        ? 'bg-green-900/20 border-green-500/30' 
                        : 'bg-red-900/20 border-red-500/30'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-white flex items-center">
                          {submission.aiVerification.verified ? (
                            <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400 mr-2" />
                          )}
                          AI Verification
                        </h4>
                        <span className={`text-sm font-semibold ${
                          submission.aiVerification.verified ? 'text-green-400' : 'text-red-400'
                        }`}>
                          Score: {submission.aiVerification.score}/100
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">{submission.aiVerification.feedback}</p>
                      <p className="text-xs text-gray-500">
                        Verified on {new Date(submission.aiVerification.verifiedAt).toLocaleDateString()}
                      </p>
                      {submission.aiVerification.verified && task.status === 'submitted' && (
                        <div className="mt-4 pt-4 border-t border-gray-700/50">
                          <div className="flex items-center text-sm text-green-400">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            <span>Payment of {task.budget} PYUSD ready to be released</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TaskDetail;

