import React, { useState, useEffect } from 'react';
import { aiService } from '../services/aiService';

interface AiConfigProps {
  isOpen: boolean;
  onClose: () => void;
}

const AiConfig: React.FC<AiConfigProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load API key from localStorage when component mounts
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      aiService.setApiKey(savedKey);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      // Test the API key with a simple request
      aiService.setApiKey(apiKey);
      await aiService.generateResponse([
        { role: 'user', content: 'Test connection' }
      ]);

      // If successful, save the key
      localStorage.setItem('openai_api_key', apiKey);
      onClose();
    } catch (error) {
      console.error('Error testing API key:', error);
      setError('Invalid API key or connection error. Please check your key and try again.');
      aiService.setApiKey('');
      localStorage.removeItem('openai_api_key');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[11000] p-4">
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all"
        style={{ maxHeight: 'calc(100vh - 2rem)' }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-white rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <i className="fas fa-key text-blue-600 text-lg"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">OpenAI API Key</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto">
          <div className="p-6">
            <div className="mb-4">
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setError(null);
                  }}
                  placeholder="sk-..."
                  className={`w-full px-4 py-2 rounded-lg border ${
                    error ? 'border-red-300' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <i className={`fas fa-${showKey ? 'eye-slash' : 'eye'}`}></i>
                </button>
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <i className="fas fa-exclamation-circle mr-2"></i>
                  {error}
                </p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                <i className="fas fa-info-circle mr-2"></i>
                Your API key will be stored locally and used only for AI assistance.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end space-x-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !apiKey.trim()}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                isSaving || !apiKey.trim()
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  <span>Save Key</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AiConfig; 