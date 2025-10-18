import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Briefcase, GraduationCap, Award, Plus, X, Save, CheckCircle } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { userService } from '../services/userService';
import type { WorkExperience as DBWorkExperience, Education as DBEducation } from '../services/supabase';

interface WorkExperience extends DBWorkExperience {
  id: string;
}

interface Education extends DBEducation {
  id: string;
}

const Profile: React.FC = () => {
  const { walletAddress, user, refreshUser } = useWallet();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState<string[]>(['']);
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([
    { id: '1', company: '', position: '', duration: '', description: '' }
  ]);
  const [education, setEducation] = useState<Education[]>([
    { id: '1', institution: '', degree: '', year: '' }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load user profile data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setDescription(user.description || '');
      setSkills(user.skills && user.skills.length > 0 ? user.skills : ['']);
      
      // Add IDs to work experience for UI management
      const expWithIds = user.work_experience && user.work_experience.length > 0
        ? user.work_experience.map((exp, idx) => ({ ...exp, id: idx.toString() }))
        : [{ id: '1', company: '', position: '', duration: '', description: '' }];
      setWorkExperience(expWithIds);
      
      // Add IDs to education for UI management
      const eduWithIds = user.education && user.education.length > 0
        ? user.education.map((edu, idx) => ({ ...edu, id: idx.toString() }))
        : [{ id: '1', institution: '', degree: '', year: '' }];
      setEducation(eduWithIds);
      
      setIsLoading(false);
    }
  }, [user]);

  const handleAddSkill = () => {
    setSkills([...skills, '']);
  };

  const handleRemoveSkill = (index: number) => {
    const newSkills = skills.filter((_, i) => i !== index);
    setSkills(newSkills.length > 0 ? newSkills : ['']);
  };

  const handleSkillChange = (index: number, value: string) => {
    const newSkills = [...skills];
    newSkills[index] = value;
    setSkills(newSkills);
  };

  const handleAddExperience = () => {
    const newExp: WorkExperience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      duration: '',
      description: ''
    };
    setWorkExperience([...workExperience, newExp]);
  };

  const handleRemoveExperience = (id: string) => {
    setWorkExperience(workExperience.filter(exp => exp.id !== id));
  };

  const handleExperienceChange = (id: string, field: keyof WorkExperience, value: string) => {
    setWorkExperience(workExperience.map(exp =>
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const handleAddEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      year: ''
    };
    setEducation([...education, newEdu]);
  };

  const handleRemoveEducation = (id: string) => {
    setEducation(education.filter(edu => edu.id !== id));
  };

  const handleEducationChange = (id: string, field: keyof Education, value: string) => {
    setEducation(education.map(edu =>
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  const handleSave = async () => {
    if (!walletAddress) {
      alert('Please connect your wallet first!');
      return;
    }

    setIsSaving(true);
    try {
      // Filter out empty skills
      const cleanedSkills = skills.filter(skill => skill.trim() !== '');
      
      // Remove IDs from work experience and education for DB storage
      const cleanedWorkExp = workExperience
        .filter(exp => exp.company.trim() || exp.position.trim())
        .map(({ id, ...rest }) => rest);
      
      const cleanedEdu = education
        .filter(edu => edu.institution.trim() || edu.degree.trim())
        .map(({ id, ...rest }) => rest);

      // Save to Supabase
      await userService.updateProfile(walletAddress, {
        name,
        description,
        skills: cleanedSkills,
        work_experience: cleanedWorkExp,
        education: cleanedEdu,
      });

      // Refresh user data
      await refreshUser();

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      alert(`Failed to save profile: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Show wallet connection prompt if not connected
  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-[#111111] text-gray-300 pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-12">
            <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Wallet Not Connected</h2>
            <p className="text-gray-400 mb-6">Please connect your wallet to view and edit your profile.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#111111] text-gray-300 pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] text-gray-300 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Your Profile</h1>
              <p className="text-gray-400">Build your professional profile to attract better opportunities</p>
            </div>
            <motion.button
              onClick={handleSave}
              disabled={isSaving}
              whileHover={{ scale: isSaving ? 1 : 1.05 }}
              whileTap={{ scale: isSaving ? 1 : 0.95 }}
              className="bg-orange-500 text-white px-6 py-3 rounded-md font-semibold hover:bg-orange-600 transition-colors flex items-center space-x-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
            </motion.button>
          </div>
          
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center space-x-2"
            >
              <Award className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-medium">Profile saved successfully!</span>
            </motion.div>
          )}
        </motion.div>

        {/* About / Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-8 mb-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <User className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-bold text-white">About Me</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-white mb-2">Name *</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                required
              />
            </div>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            placeholder="Tell us about yourself, your expertise, and what makes you unique..."
            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors resize-none"
          />
        </motion.div>

        {/* Skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-8 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Award className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-bold text-white">Skills</h2>
            </div>
            <button
              onClick={handleAddSkill}
              className="text-orange-500 hover:text-orange-400 text-sm font-medium flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Skill</span>
            </button>
          </div>
          <div className="space-y-3">
            {skills.map((skill, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => handleSkillChange(index, e.target.value)}
                  placeholder={`Skill ${index + 1} (e.g., React, Python, UI Design)`}
                  className="flex-grow bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                />
                {skills.length > 1 && (
                  <button
                    onClick={() => handleRemoveSkill(index)}
                    className="text-red-400 hover:text-red-300 p-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Work Experience */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-8 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Briefcase className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-bold text-white">Work Experience</h2>
            </div>
            <button
              onClick={handleAddExperience}
              className="text-orange-500 hover:text-orange-400 text-sm font-medium flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Experience</span>
            </button>
          </div>
          <div className="space-y-6">
            {workExperience.map((exp, index) => (
              <div key={exp.id} className="bg-gray-900/30 border border-gray-700/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Experience {index + 1}</h3>
                  {workExperience.length > 1 && (
                    <button
                      onClick={() => handleRemoveExperience(exp.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleExperienceChange(exp.id, 'company', e.target.value)}
                      placeholder="Company Name"
                      className="bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                    <input
                      type="text"
                      value={exp.position}
                      onChange={(e) => handleExperienceChange(exp.id, 'position', e.target.value)}
                      placeholder="Position"
                      className="bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                  <input
                    type="text"
                    value={exp.duration}
                    onChange={(e) => handleExperienceChange(exp.id, 'duration', e.target.value)}
                    placeholder="Duration (e.g., Jan 2020 - Dec 2022)"
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                  <textarea
                    value={exp.description}
                    onChange={(e) => handleExperienceChange(exp.id, 'description', e.target.value)}
                    rows={3}
                    placeholder="Describe your responsibilities and achievements..."
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Education */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-8 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <GraduationCap className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-bold text-white">Education</h2>
            </div>
            <button
              onClick={handleAddEducation}
              className="text-orange-500 hover:text-orange-400 text-sm font-medium flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Education</span>
            </button>
          </div>
          <div className="space-y-6">
            {education.map((edu, index) => (
              <div key={edu.id} className="bg-gray-900/30 border border-gray-700/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Education {index + 1}</h3>
                  {education.length > 1 && (
                    <button
                      onClick={() => handleRemoveEducation(edu.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => handleEducationChange(edu.id, 'institution', e.target.value)}
                    placeholder="Institution Name"
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(edu.id, 'degree', e.target.value)}
                      placeholder="Degree/Certificate"
                      className="bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                    <input
                      type="text"
                      value={edu.year}
                      onChange={(e) => handleEducationChange(edu.id, 'year', e.target.value)}
                      placeholder="Year (e.g., 2020)"
                      className="bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Profile;

