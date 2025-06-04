import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AnimatedModal from './AnimatedModal';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string) => void;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate a small delay for the animation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onCreate(name, description);
    setIsSubmitting(false);
    setName('');
    setDescription('');
  };

  return (
    <AnimatedModal isOpen={isOpen} onClose={onClose} title="Create New Project">
      <form onSubmit={handleSubmit}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 space-y-4"
        >
          <div>
            <motion.label
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="block text-gray-700 mb-2"
              htmlFor="projectName"
            >
              Project Name
            </motion.label>
            <motion.input
              type="text"
              id="projectName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gray-50 px-6 py-4 flex justify-end space-x-3"
        >
          <motion.button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors relative"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
          >
            <motion.div
              className="absolute inset-0 bg-blue-500 rounded-lg"
              initial={false}
              animate={isSubmitting ? { width: "100%" } : { width: "0%" }}
              transition={{ duration: 0.5 }}
            />
            <motion.div className="relative flex items-center justify-center space-x-2">
              {isSubmitting ? (
                <>
                  <motion.div
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-plus"></i>
                  <span>Create Project</span>
                </>
              )}
            </motion.div>
          </motion.button>
        </motion.div>
      </form>
    </AnimatedModal>
  );
};

export default NewProjectModal; 