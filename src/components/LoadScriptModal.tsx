import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import AnimatedModal from './AnimatedModal';

interface LoadScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (files: File[]) => void;
  existingScriptNames: string[];
}

const LoadScriptModal: React.FC<LoadScriptModalProps> = ({
  isOpen,
  onClose,
  onLoad,
  existingScriptNames
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const luaFiles = files.filter(file => file.name.endsWith('.lua'));
    
    // Check for duplicate names
    const duplicates = luaFiles.filter(file => 
      existingScriptNames.includes(file.name)
    );

    if (duplicates.length > 0) {
      setError(`Scripts already exist: ${duplicates.map(f => f.name).join(', ')}`);
      setSelectedFiles([]);
      return;
    }

    setError('');
    setSelectedFiles(luaFiles);
  };

  const handleSubmit = () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one Lua script file');
      return;
    }
    onLoad(selectedFiles);
    onClose();
  };

  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={onClose}
      title="Load Scripts"
    >
      <div className="space-y-6 p-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".lua"
            onChange={handleFileChange}
            className="hidden"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center space-x-3 text-gray-600 hover:text-blue-600"
          >
            <i className="fas fa-cloud-upload-alt text-3xl"></i>
            <span className="text-base">Click to select Lua scripts</span>
          </motion.button>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-600 text-sm mt-4 px-1"
          >
            {error}
          </motion.p>
        )}

        {selectedFiles.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Selected Files:</h4>
            <ul className="space-y-2">
              {selectedFiles.map((file, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-center p-2 hover:bg-gray-100 rounded-lg">
                  <i className="fas fa-file-code text-blue-500 mr-3"></i>
                  {file.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end space-x-4 pt-4 mt-8 border-t border-gray-100">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="px-6 py-2.5 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200 text-base font-medium"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            className={`px-6 py-2.5 text-white rounded-lg text-base font-medium ${
              selectedFiles.length === 0
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 shadow-sm'
            }`}
            disabled={selectedFiles.length === 0}
          >
            Load Scripts
          </motion.button>
        </div>
      </div>
    </AnimatedModal>
  );
};

export default LoadScriptModal; 