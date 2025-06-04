import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AnimatedModal from './AnimatedModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => void;
  onRegister: (email: string, password: string, confirmPassword: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, onRegister }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoginMode) {
      onLogin(email, password);
    } else {
      onRegister(email, password, confirmPassword);
    }
  };

  const inputVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom * 0.1 }
    })
  };

  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={onClose}
      title={isLoginMode ? "Sign In" : "Create Account"}
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <motion.div
          variants={inputVariants}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your email"
          />
        </motion.div>

        <motion.div
          variants={inputVariants}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your password"
          />
        </motion.div>

        {!isLoginMode && (
          <motion.div
            variants={inputVariants}
            initial="hidden"
            animate="visible"
            custom={2}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Confirm your password"
            />
          </motion.div>
        )}

        <motion.div
          variants={inputVariants}
          initial="hidden"
          animate="visible"
          custom={3}
          className="flex flex-col space-y-3 pt-2"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isLoginMode ? 'Sign In' : 'Create Account'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="w-full py-2.5 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            {isLoginMode ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
          </motion.button>
        </motion.div>
      </form>
    </AnimatedModal>
  );
};

export default AuthModal; 