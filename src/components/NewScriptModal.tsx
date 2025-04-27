import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AnimatedModal from './AnimatedModal';
import { ScriptLanguage, LANGUAGE_CONFIGS } from '../types/script';
import Icon from './Icon';

interface NewScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, language: ScriptLanguage) => void;
  existingScriptNames?: string[];
}

const NewScriptModal: React.FC<NewScriptModalProps> = ({ isOpen, onClose, onCreate, existingScriptNames = [] }) => {
  const [scriptName, setScriptName] = useState('');
  const [language, setLanguage] = useState<ScriptLanguage>('lua');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let finalName = scriptName.trim();
    const config = LANGUAGE_CONFIGS[language];

    if (!finalName) {
      setError('Script name is required');
      return;
    }

    // Add extension if not provided
    if (!finalName.endsWith(config.extension)) {
      finalName += config.extension;
    }

    // Check for duplicate names
    if (existingScriptNames.includes(finalName)) {
      setError('A script with this name already exists');
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreate(finalName, language);
      setScriptName('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create script');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatedModal isOpen={isOpen} onClose={onClose} title="Create New Script">
      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">Script Name</label>
          <input
            type="text"
            value={scriptName}
            onChange={(e) => setScriptName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base"
            placeholder={`my-script${LANGUAGE_CONFIGS[language].extension}`}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3 mt-6"
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
          <div className="grid grid-cols-3 gap-4">
            {(Object.keys(LANGUAGE_CONFIGS) as ScriptLanguage[]).map((lang) => (
              <motion.button
                key={lang}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setLanguage(lang)}
                className={`flex items-center justify-center p-4 rounded-lg border ${
                  language === lang
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Icon name={LANGUAGE_CONFIGS[lang].icon} className="w-5 h-5 mr-3" />
                <span className="capitalize text-base">{lang}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-600 text-sm mt-4 px-1"
          >
            {error}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-end space-x-4 mt-8 pt-4 border-t border-gray-100"
        >
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
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-6 py-2.5 text-white rounded-lg text-base font-medium ${
              isSubmitting
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 shadow-sm'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <Icon name="spinner" className="animate-spin -ml-1 mr-3 h-5 w-5" />
                Creating...
              </span>
            ) : (
              'Create Script'
            )}
          </motion.button>
        </motion.div>
      </form>
    </AnimatedModal>
  );
};

export default NewScriptModal; 