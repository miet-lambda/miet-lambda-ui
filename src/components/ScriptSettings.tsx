import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AnimatedModal from './AnimatedModal';

export interface ScriptConfig {
  memoryLimit: number;
  timeout: number;
}

interface ScriptSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ScriptConfig;
  onSave: (settings: ScriptConfig) => void;
}

const ScriptSettings: React.FC<ScriptSettingsProps> = ({
  isOpen,
  onClose,
  settings,
  onSave
}) => {
  const [memoryLimit, setMemoryLimit] = useState(settings.memoryLimit);
  const [timeout, setTimeout] = useState(settings.timeout);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      memoryLimit,
      timeout
    });
    onClose();
  };

  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={onClose}
      title="Script Settings"
    >
      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Memory Limit (MB)
          </label>
          <div className="mt-1">
            <input
              type="number"
              min="32"
              max="512"
              value={memoryLimit}
              onChange={(e) => setMemoryLimit(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Maximum memory allocation for script execution (32-512 MB)
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timeout (ms)
          </label>
          <div className="mt-1">
            <input
              type="number"
              min="1000"
              max="300000"
              value={timeout}
              onChange={(e) => setTimeout(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Maximum execution time (1-300 seconds)
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-end space-x-4 pt-4 mt-8 border-t border-gray-100"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200 text-base font-medium"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="px-6 py-2.5 text-white rounded-lg bg-blue-600 hover:bg-blue-700 shadow-sm transition-all duration-200 text-base font-medium"
          >
            Save Settings
          </motion.button>
        </motion.div>
      </form>
    </AnimatedModal>
  );
};

export default ScriptSettings;

