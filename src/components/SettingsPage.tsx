import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

interface SettingsPageProps {
  onClose: () => void;
  editorFontSize: number;
  onEditorFontSizeChange: (size: number) => void;
  autoSave: boolean;
  onAutoSaveChange: (enabled: boolean) => void;
  notifications: boolean;
  onNotificationsChange: (enabled: boolean) => void;
}

interface SettingsSectionProps {
  title: string;
  description: string;
  delay?: number;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, description, delay = 0, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="bg-white dark:bg-dark-800/50 rounded-2xl shadow-lg p-6 backdrop-blur-lg bg-opacity-80 dark:shadow-dark-900/50"
  >
    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">{title}</h2>
    <p className="text-gray-600 dark:text-gray-400 mb-6">{description}</p>
    {children}
  </motion.div>
);

const SettingsPage: React.FC<SettingsPageProps> = ({
  onClose,
  editorFontSize,
  onEditorFontSizeChange,
  autoSave,
  onAutoSaveChange,
  notifications,
  onNotificationsChange
}) => {
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleReset = () => {
    setTheme('system');
    onEditorFontSizeChange(14);
    onAutoSaveChange(true);
    onNotificationsChange(true);
    setIsResetConfirmOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-950 flex flex-col"
    >
      {/* Fixed Header */}
      <motion.div 
        className="flex-shrink-0 border-b border-gray-200 dark:border-dark-600/30 bg-white dark:bg-dark-800/80 bg-opacity-80 backdrop-blur-lg"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <motion.h1
              className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400"
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.5 }}
            >
              Settings
            </motion.h1>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <i className="fas fa-times text-xl"></i>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Scrollable Content */}
      <motion.div 
        className="flex-1 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="space-y-6">
            <SettingsSection
              title="Appearance"
              description="Customize how LambdaExecutor Hub looks and feels"
              delay={0.1}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Theme</label>
                  <div className="grid grid-cols-3 gap-4">
                    {(['light', 'dark', 'system'] as const).map((t) => (
                      <motion.button
                        key={t}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setTheme(t)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                          theme === t
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500 text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        <i className={`fas fa-${t === 'light' ? 'sun' : t === 'dark' ? 'moon' : 'laptop'} mr-2`}></i>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Editor Font Size: {editorFontSize}px
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="24"
                    value={editorFontSize}
                    onChange={(e) => onEditorFontSizeChange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-dark-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </SettingsSection>

            <SettingsSection
              title="Editor"
              description="Configure your coding environment"
              delay={0.2}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">Auto Save</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Automatically save changes as you type</p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onAutoSaveChange(!autoSave)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      autoSave ? 'bg-blue-500 dark:bg-blue-400' : 'bg-gray-200 dark:bg-dark-600'
                    }`}
                  >
                    <motion.span
                      layout
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        autoSave ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </motion.button>
                </div>
              </div>
            </SettingsSection>

            <SettingsSection
              title="Notifications"
              description="Manage your notification preferences"
              delay={0.3}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">Enable Notifications</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receive updates about script executions and changes</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onNotificationsChange(!notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications ? 'bg-blue-500 dark:bg-blue-400' : 'bg-gray-200 dark:bg-dark-600'
                  }`}
                >
                  <motion.span
                    layout
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </motion.button>
              </div>
            </SettingsSection>

            <SettingsSection
              title="Reset Settings"
              description="Reset all settings to their default values"
              delay={0.4}
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsResetConfirmOpen(true)}
                className="px-4 py-2 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-500/20 transition-colors flex items-center space-x-2"
              >
                <i className="fas fa-undo"></i>
                <span>Reset to Defaults</span>
              </motion.button>
            </SettingsSection>
          </div>
        </div>
      </motion.div>

      {/* Reset Confirmation Dialog */}
      <AnimatePresence>
        {isResetConfirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Reset Settings?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This will reset all settings to their default values. This action cannot be undone.
              </p>
              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReset}
                  className="px-4 py-2 bg-red-500 dark:bg-red-500/80 text-white rounded-lg hover:bg-red-600 dark:hover:bg-red-500/90 transition-colors"
                >
                  Reset
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsResetConfirmOpen(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SettingsPage; 