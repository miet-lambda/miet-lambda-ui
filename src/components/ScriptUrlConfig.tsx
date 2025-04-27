import React, { useState, useEffect } from 'react';

interface ScriptUrlConfigProps {
  isOpen: boolean;
  onClose: () => void;
  urlPath: string;
  onSave: (urlPath: string) => void;
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
  const [path, setPath] = useState(urlPath);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPath(urlPath);
  }, [urlPath]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!path.startsWith('/')) {
      setError('Path must start with /');
      return;
    }

    if (path.includes('//')) {
      setError('Path cannot contain consecutive slashes');
      return;
    }

    if (!/^[a-zA-Z0-9\-_\/]+$/.test(path)) {
      setError('Path can only contain letters, numbers, hyphens, underscores, and forward slashes');
      return;
    }

    onSave(path);
    onClose();
  };

  const generateDefaultPath = () => {
    const safeName = scriptName.replace('.lua', '').toLowerCase();
    const newPath = `/projects/${projectId}/scripts/${safeName}`;
    setPath(newPath);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <i className="fas fa-link text-blue-600 text-lg"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Configure URL Path</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="urlPath">
                URL Path
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="urlPath"
                  value={path}
                  onChange={(e) => {
                    setPath(e.target.value);
                    setError(null);
                  }}
                  placeholder="/projects/123/scripts/example"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    error ? 'border-red-300' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                <button
                  type="button"
                  onClick={generateDefaultPath}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Generate default path"
                >
                  <i className="fas fa-magic"></i>
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
                This path will be used to access your script via HTTP requests
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2"
            >
              <i className="fas fa-save"></i>
              <span>Save Path</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScriptUrlConfig; 