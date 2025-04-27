import React from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, apiKey }) => {
  if (!isOpen) return null;

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    alert('API key copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h3 className="text-xl font-semibold">Your API Key</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="p-6">
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-600 mb-2">Keep this key secret. It provides full access to your account.</p>
            <div className="flex items-center">
              <input
                type="text"
                value={apiKey}
                readOnly
                className="flex-1 bg-white px-3 py-2 border rounded-l-lg focus:outline-none"
              />
              <button
                onClick={copyApiKey}
                className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition"
              >
                <i className="fas fa-copy"></i>
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Use this key to authenticate your API requests. Example:
            <code className="block bg-gray-100 p-2 rounded mt-2 text-xs">
              curl -X POST https://api.luascript.io/execute \<br />
              -H &quot;Authorization: Bearer YOUR_API_KEY&quot; \<br />
              -H &quot;Content-Type: application/json&quot; \<br />
              -d &apos;{'{'}&quot;project_id&quot;: &quot;123&quot;, &quot;script_name&quot;: &quot;main.lua&quot;{'}'}&apos;
            </code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal; 