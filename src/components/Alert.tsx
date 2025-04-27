import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface AlertProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  confirmLabel?: string;
  onConfirm?: () => void;
  cancelLabel?: string;
}

const Alert: React.FC<AlertProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type,
  confirmLabel = 'OK',
  onConfirm,
  cancelLabel
}) => {
  useEffect(() => {
    if (isOpen) {
      // Prevent scrolling when alert is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-green-100',
          iconBg: 'bg-green-600',
          icon: 'fas fa-check',
          textColor: 'text-green-800'
        };
      case 'error':
        return {
          bgColor: 'bg-red-100',
          iconBg: 'bg-red-600',
          icon: 'fas fa-exclamation-triangle',
          textColor: 'text-red-800'
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-100',
          iconBg: 'bg-yellow-600',
          icon: 'fas fa-exclamation-circle',
          textColor: 'text-yellow-800'
        };
      case 'info':
      default:
        return {
          bgColor: 'bg-blue-100',
          iconBg: 'bg-blue-600',
          icon: 'fas fa-info-circle',
          textColor: 'text-blue-800'
        };
    }
  };

  const styles = getTypeStyles();

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'fas fa-check-circle text-green-500';
      case 'error':
        return 'fas fa-times-circle text-red-500';
      case 'warning':
        return 'fas fa-exclamation-triangle text-yellow-500';
      case 'info':
        return 'fas fa-info-circle text-blue-500';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[60]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-[60] pointer-events-none"
          >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 pointer-events-auto">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <i className={`${getIcon()} text-2xl mr-3`}></i>
                  <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                </div>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex justify-end space-x-3">
                  {onConfirm && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-700 transition-colors"
                      >
                        {cancelLabel}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          onConfirm();
                          onClose();
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {confirmLabel}
                      </motion.button>
                    </>
                  )}
                  {!onConfirm && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onClose}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      OK
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Alert; 