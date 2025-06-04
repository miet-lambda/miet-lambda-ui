import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AnimatedModal from './AnimatedModal';

interface ScriptUrlConfigProps {
  isOpen: boolean;
  onClose: () => void;
  urlPath: string;
  onSave: (newPath: string) => void;
  projectId: string;
  scriptName: string;
}

const ScriptUrlConfig: React.FC<ScriptUrlConfigProps> = ({
  isOpen,
  onClose,
  urlPath,
  onSave,
  projectId,
  scriptName
}) => {
  // Remove .lua extension from script name for display
  const displayScriptName = scriptName.replace(/\.lua$/, '');
  
  // Get the current path without the project ID and script name
  const getCurrentPath = () => {
    const parts = urlPath.split('/');
    const projectIndex = parts.indexOf(projectId);
    if (projectIndex !== -1 && parts[projectIndex + 1]) {
      return parts.slice(projectIndex + 2).join('/');
    }
    return '';
  };

  const [path, setPath] = useState(getCurrentPath());
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate path
    if (path.includes('..')) {
      setError('Invalid path: cannot use parent directory references');
      return;
    }

    // Clean up path
    const cleanPath = path
      .split('/')
      .filter(Boolean)
      .join('/');

    // Construct new URL path
    const newPath = `/${projectId}/${cleanPath || displayScriptName}`;
    onSave(newPath);
  };

  return (
    <AnimatedModal isOpen={isOpen} onClose={onClose} title="Configure URL Path">
      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current URL Path
            </label>
            <div className="px-4 py-2 bg-gray-50 dark:bg-dark-700 rounded-lg text-sm text-gray-600 dark:text-gray-400">
              {urlPath}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New URL Path
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">/{projectId}/</span>
              <input
                type="text"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder={displayScriptName}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-dark-700 dark:text-white"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Leave empty to use script name: <code className="px-1 py-0.5 bg-gray-100 dark:bg-dark-600 rounded">{displayScriptName}</code>
            </p>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-600 dark:text-red-400 text-sm"
            >
              {error}
            </motion.p>
          )}
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-dark-700">
          <motion.button
            type="button"
            onClick={onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2.5 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200 text-base font-medium"
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 text-base font-medium"
          >
            Save
          </motion.button>
        </div>
      </form>
    </AnimatedModal>
  );
};

export default ScriptUrlConfig; 