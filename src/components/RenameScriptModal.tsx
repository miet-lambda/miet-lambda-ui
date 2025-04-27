import React, { useState } from 'react';
import Modal from './Modal';

interface RenameScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: (newName: string) => void;
  currentName: string;
  existingNames: string[];
}

const RenameScriptModal: React.FC<RenameScriptModalProps> = ({
  isOpen,
  onClose,
  onRename,
  currentName,
  existingNames
}) => {
  const [newName, setNewName] = useState(currentName);
  const [error, setError] = useState<string | undefined>();

  const validateName = (name: string): string | undefined => {
    if (!name.endsWith('.lua')) {
      return 'File name must end with .lua';
    }
    if (name === '') {
      return 'File name cannot be empty';
    }
    if (name === currentName) {
      return 'New name must be different from current name';
    }
    if (existingNames.includes(name)) {
      return 'A script with this name already exists';
    }
    return undefined;
  };

  const handleNameChange = (value: string) => {
    setNewName(value);
    setError(validateName(value));
  };

  const handleSubmit = () => {
    const validationError = validateName(newName);
    if (validationError) {
      setError(validationError);
      return;
    }
    onRename(newName);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
        <div className="sm:flex sm:items-start">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
            <i className="fas fa-file-signature text-blue-600"></i>
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Rename Script
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Enter a new name for the script. The .lua extension is required.
              </p>
            </div>
            <div className="mt-4">
              <div className="flex flex-col space-y-2">
                <label htmlFor="scriptName" className="text-sm font-medium text-gray-700">
                  Script Name
                </label>
                <input
                  type="text"
                  id="scriptName"
                  value={newName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    error ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="script.lua"
                />
                {error && (
                  <p className="text-sm text-red-600">
                    {error}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <button
          type="button"
          className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={!!error}
        >
          Rename
        </button>
        <button
          type="button"
          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default RenameScriptModal; 