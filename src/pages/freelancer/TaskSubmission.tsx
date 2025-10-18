import React, { useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, FileText, Image as ImageIcon, Code, FileCode, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { getTaskById } from '../../data/mockData';

type FileType = 'image' | 'text' | 'code' | 'pdf' | null;

const TaskSubmission: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const task = getTaskById(id || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [description, setDescription] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');
  const [fileType, setFileType] = useState<FileType>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);

    // Determine file type
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split('.').pop();

    if (file.type.startsWith('image/')) {
      setFileType('image');
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (fileExtension === 'pdf') {
      setFileType('pdf');
      setFilePreview(file.name);
    } else if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json'].includes(fileExtension || '')) {
      setFileType('code');
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsText(file);
    } else if (['txt', 'md'].includes(fileExtension || '')) {
      setFileType('text');
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsText(file);
    } else {
      setFileType(null);
      setFilePreview(file.name);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFilePreview('');
    setFileType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setShowSuccess(true);

    // Redirect after showing success
    setTimeout(() => {
      navigate('/freelancer/your-tasks');
    }, 3000);
  };

  const getFileIcon = () => {
    switch (fileType) {
      case 'image': return <ImageIcon className="w-6 h-6" />;
      case 'code': return <Code className="w-6 h-6" />;
      case 'text': return <FileText className="w-6 h-6" />;
      case 'pdf': return <FileCode className="w-6 h-6" />;
      default: return <FileText className="w-6 h-6" />;
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
          <p className="text-xl text-gray-400 mb-4">{task.title}</p>
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-orange-500 mb-1">AI Verification Process</h3>
                <p className="text-sm text-gray-300">
                  After submission, an AI agent will verify that your work meets all task requirements. Payment will be released automatically upon successful verification.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-8"
          >
            <label htmlFor="description" className="block text-lg font-semibold text-white mb-3">
              Description of Your Work *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={6}
              placeholder="Describe what you've completed, any challenges you faced, and how your work meets the requirements..."
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors resize-none"
            />
          </motion.div>

          {/* File Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-8"
          >
            <label className="block text-lg font-semibold text-white mb-3">
              Upload Files *
            </label>
            <p className="text-sm text-gray-400 mb-4">
              Supported formats: Images (JPG, PNG, GIF), Text files (TXT, MD), Code files (JS, PY, etc.), PDF
            </p>

            {!uploadedFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-700 rounded-lg p-12 text-center hover:border-orange-500 transition-colors cursor-pointer"
              >
                <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-300 mb-2">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500">Maximum file size: 10MB</p>
              </div>
            ) : (
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-orange-500">
                      {getFileIcon()}
                    </div>
                    <div>
                      <p className="text-white font-medium">{uploadedFile.name}</p>
                      <p className="text-sm text-gray-400">
                        {(uploadedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* File Preview */}
                {fileType === 'image' && filePreview && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-white mb-2">Preview:</h4>
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="max-w-full h-auto rounded-lg border border-gray-700"
                    />
                  </div>
                )}

                {fileType === 'code' && filePreview && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-white mb-2">Code Preview:</h4>
                    <pre className="bg-gray-950 border border-gray-700 rounded-lg p-4 overflow-x-auto text-sm text-gray-300 max-h-96">
                      <code>{filePreview}</code>
                    </pre>
                  </div>
                )}

                {fileType === 'text' && filePreview && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-white mb-2">Text Preview:</h4>
                    <div className="bg-gray-950 border border-gray-700 rounded-lg p-4 text-sm text-gray-300 max-h-96 overflow-y-auto whitespace-pre-wrap">
                      {filePreview}
                    </div>
                  </div>
                )}

                {fileType === 'pdf' && (
                  <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-sm text-blue-400">
                      PDF file uploaded. Preview not available.
                    </p>
                  </div>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png,.gif,.txt,.md,.js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.html,.css,.json,.pdf"
              className="hidden"
            />
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
              disabled={isSubmitting || !uploadedFile || !description.trim()}
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

