import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BalanceDisplay from './BalanceDisplay';

interface User {
  name: string;
  email: string;
  id: number;
}

interface ProfilePageProps {
  user: User;
  onClose: () => void;
  onUpdateProfile: (name: string, email: string) => void;
}

const StatCard: React.FC<{
  label: string;
  value: number;
  icon: string;
  delay: number;
}> = ({ label, value, icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="bg-white dark:bg-dark-800/50 rounded-xl shadow-sm p-6 backdrop-blur-lg bg-opacity-80 dark:shadow-dark-900/50"
  >
    <div className="flex items-center space-x-4">
      <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
        <i className={`fas ${icon} text-purple-600 dark:text-purple-400 text-xl`}></i>
      </div>
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  </motion.div>
);

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onClose, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(name, email);
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-950 py-12 overflow-y-auto"
    >
      <motion.div 
        className="max-w-4xl mx-auto px-4 pb-20"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-12">
          <motion.h1 
            className="text-3xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400"
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5 }}
          >
            Profile Settings
          </motion.h1>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <i className="fas fa-times text-xl"></i>
          </motion.button>
        </div>

        <div className="bg-white dark:bg-dark-800/50 rounded-2xl shadow-xl p-8 mb-8 backdrop-blur-lg bg-opacity-80 dark:shadow-dark-900/50">
          <motion.div 
            className="flex items-center space-x-6 mb-8"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 flex items-center justify-center text-white text-4xl font-bold shadow-lg"
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              {user.name.charAt(0).toUpperCase()}
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{user.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <BalanceDisplay userId={user.id} />
          </motion.div>

          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Name</label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Email</label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
                <div className="flex space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 text-white rounded-xl hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
                  >
                    <i className="fas fa-save"></i>
                    <span>Save Changes</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => {
                      setName(user.name);
                      setEmail(user.email);
                      setIsEditing(false);
                    }}
                    className="px-6 py-3 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-dark-600 transition-all duration-200 flex items-center space-x-2"
                  >
                    <i className="fas fa-times"></i>
                    <span>Cancel</span>
                  </motion.button>
                </div>
              </motion.form>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 text-white rounded-xl hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
                >
                  <i className="fas fa-pencil-alt"></i>
                  <span>Edit Profile</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-white dark:bg-dark-800/50 rounded-2xl shadow-xl p-8 backdrop-blur-lg bg-opacity-80 dark:shadow-dark-900/50">
          <motion.h3 
            className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Account Statistics
          </motion.h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              label="Total Scripts"
              value={12}
              icon="fa-code"
              delay={0.2}
            />
            <StatCard
              label="Executions"
              value={156}
              icon="fa-play"
              delay={0.3}
            />
            <StatCard
              label="Projects"
              value={4}
              icon="fa-project-diagram"
              delay={0.4}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfilePage; 