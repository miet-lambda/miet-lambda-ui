import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ScriptTestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  scriptName: string;
  urlPath: string;
  projectName?: string;
}

interface Header {
  key: string;
  value: string;
}

interface QueryParam {
  key: string;
  value: string;
}

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface SavedRequestState {
  requestMethod: RequestMethod;
  contentType: string;
  requestBody: string;
  headers: Header[];
  queryParams: QueryParam[];
}

const SCROLLBAR_STYLES = `
  /* Custom Scrollbar Styles */
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 4px;
    transition: all 0.2s ease;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
  
  /* For Firefox */
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #d1d5db #f1f1f1;
  }
  
  /* Dark mode scrollbar */
  .dark .custom-scrollbar::-webkit-scrollbar-track {
    background: #1f2937;
  }
  
  .dark .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #4b5563;
  }
  
  .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #6b7280;
  }
  
  .dark .custom-scrollbar {
    scrollbar-color: #4b5563 #1f2937;
  }
`;

const ScriptTestDialog: React.FC<ScriptTestDialogProps> = ({
  isOpen,
  onClose,
  scriptName,
  urlPath,
  projectName
}) => {
  const storageKey = `test-request-${projectName}-${scriptName}`;

  // Load initial state from localStorage
  const loadSavedState = (): SavedRequestState | null => {
    const savedState = localStorage.getItem(storageKey);
    if (savedState) {
      try {
        return JSON.parse(savedState);
      } catch (err) {
        console.error('Failed to load saved request state:', err);
      }
    }
    return null;
  };

  const savedState = loadSavedState();

  const [response, setResponse] = useState<{ data: string; status: number; statusText: string; headers: { [key: string]: string } }>({ data: '', status: 0, statusText: '', headers: {} });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contentType, setContentType] = useState(savedState?.contentType || 'application/json');
  const [requestMethod, setRequestMethod] = useState<RequestMethod>(savedState?.requestMethod || 'POST');
  const [requestBody, setRequestBody] = useState(savedState?.requestBody || '{\n  \n}');
  const [headers, setHeaders] = useState<Header[]>(savedState?.headers || [{ key: '', value: '' }]);
  const [queryParams, setQueryParams] = useState<QueryParam[]>(savedState?.queryParams || [{ key: '', value: '' }]);
  const [activeTab, setActiveTab] = useState<'body' | 'headers' | 'params'>('body');
  const [responseWidth, setResponseWidth] = useState(400);
  const [requestDuration, setRequestDuration] = useState<number | null>(null);
  const isResizing = useRef(false);
  const lastX = useRef(0);
  const responseRef = useRef<HTMLDivElement>(null);

  // Save state whenever it changes
  useEffect(() => {
    const stateToSave: SavedRequestState = {
      requestMethod,
      contentType,
      requestBody,
      headers,
      queryParams
    };
    localStorage.setItem(storageKey, JSON.stringify(stateToSave));
  }, [requestMethod, contentType, requestBody, headers, queryParams, storageKey]);

  // Handle dialog close
  const handleClose = () => {
    // Save state one last time before closing
    const stateToSave: SavedRequestState = {
      requestMethod,
      contentType,
      requestBody,
      headers,
      queryParams
    };
    localStorage.setItem(storageKey, JSON.stringify(stateToSave));
    onClose();
  };

  const handleAddHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const handleRemoveHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const handleHeaderChange = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const handleAddQueryParam = () => {
    setQueryParams([...queryParams, { key: '', value: '' }]);
  };

  const handleRemoveQueryParam = (index: number) => {
    setQueryParams(queryParams.filter((_, i) => i !== index));
  };

  const handleQueryParamChange = (index: number, field: 'key' | 'value', value: string) => {
    const newParams = [...queryParams];
    newParams[index][field] = value;
    setQueryParams(newParams);
  };

  const buildUrl = () => {
    const baseUrl = process.env.REACT_APP_API_URL || 'http://balancer-miet-lambda.reos.fun';
    const validParams = queryParams.filter(p => p.key && p.value);
    const queryString = validParams.length > 0
      ? '?' + validParams.map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join('&')
      : '';
    return `${baseUrl}/${projectName}/${urlPath}${queryString}`;
  };

  const handleTest = async () => {
    setIsLoading(true);
    setError(null);
    setRequestDuration(null);
    const startTime = performance.now();
    
    try {
      const validHeaders = headers
        .filter(h => h.key && h.value)
        .reduce((acc, h) => ({ ...acc, [h.key]: h.value }), {});

      const requestOptions: RequestInit = {
        method: requestMethod,
        headers: {
          ...validHeaders,
          'Content-Type': contentType,
          'Accept': contentType
        }
      };

      if (requestMethod !== 'GET' && requestBody.trim()) {
        requestOptions.body = requestBody;
      }

      const response = await fetch(buildUrl(), requestOptions);
      const data = await response.text();
      
      // Store response headers and status
      const responseHeaders: { [key: string]: string } = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      
      const endTime = performance.now();
      setRequestDuration(endTime - startTime);
      
      setResponse({
        data,
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute script');
    } finally {
      setIsLoading(false);
    }
  };

  const generateCurlCommand = () => {
    const url = buildUrl();
    const validHeaders = headers.filter(h => h.key && h.value);
    
    let command = `curl -X ${requestMethod} "${url}"`;
    
    // Add headers
    validHeaders.forEach(header => {
      command += ` \\\n  -H "${header.key}: ${header.value}"`;
    });
    
    // Add content type if not in custom headers
    if (!validHeaders.some(h => h.key.toLowerCase() === 'content-type')) {
      command += ` \\\n  -H "Content-Type: ${contentType}"`;
    }
    
    // Add request body if needed
    if (requestMethod !== 'GET' && requestBody.trim()) {
      // Escape special characters in the request body
      const escapedBody = requestBody
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
      command += ` \\\n  -d "${escapedBody}"`;
    }
    
    return command;
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(generateCurlCommand());
  };

  // Handle sidebar resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      
      const dx = e.clientX - lastX.current;
      const newWidth = responseWidth - dx;
      
      if (newWidth >= 200 && newWidth <= 800) {
        setResponseWidth(newWidth);
        lastX.current = e.clientX;
      }
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [responseWidth]);

  const startResize = (e: React.MouseEvent) => {
    isResizing.current = true;
    lastX.current = e.clientX;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const renderRequestConfig = () => {
    switch (activeTab) {
      case 'headers':
        return (
          <div className="space-y-4">
            {headers.map((header, index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="text"
                  value={header.key}
                  onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                  placeholder="Header name"
                  className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="text"
                  value={header.value}
                  onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                  placeholder="Value"
                  className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={() => handleRemoveHeader(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors px-2"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
            <button
              onClick={handleAddHeader}
              className="text-sm text-purple-600 hover:text-purple-700 transition-colors"
            >
              + Add Header
            </button>
          </div>
        );
      
      case 'params':
        return (
          <div className="space-y-4">
            {queryParams.map((param, index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="text"
                  value={param.key}
                  onChange={(e) => handleQueryParamChange(index, 'key', e.target.value)}
                  placeholder="Parameter name"
                  className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="text"
                  value={param.value}
                  onChange={(e) => handleQueryParamChange(index, 'value', e.target.value)}
                  placeholder="Value"
                  className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={() => handleRemoveQueryParam(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors px-2"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
            <button
              onClick={handleAddQueryParam}
              className="text-sm text-purple-600 hover:text-purple-700 transition-colors"
            >
              + Add Parameter
            </button>
          </div>
        );
      
      default: // body tab
        return (
          <textarea
            value={requestBody}
            onChange={(e) => setRequestBody(e.target.value)}
            className="w-full h-32 font-mono text-sm p-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder={contentType === 'application/json' ? 'Enter JSON body' : 'Enter request body'}
          />
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <style>{SCROLLBAR_STYLES}</style>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-dark-800 rounded-xl shadow-xl w-full max-w-6xl h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Test Script
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {projectName && `${projectName} / `}{scriptName}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Request Section */}
          <div className="p-4 border-b border-gray-200 dark:border-dark-700">
            <div className="flex items-center space-x-4">
              <select
                value={requestMethod}
                onChange={(e) => setRequestMethod(e.target.value as RequestMethod)}
                className="px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-dark-700 dark:text-white"
              >
                {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
              <input
                type="text"
                value={buildUrl()}
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-dark-700 dark:text-white"
              />
              <button
                onClick={handleTest}
                disabled={isLoading}
                className={`${
                  isLoading
                    ? 'bg-purple-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700'
                } text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2`}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    <span>Send</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Request Configuration */}
          <div className="flex-1 flex overflow-hidden">
            <div className="w-1/2 p-4 overflow-y-auto custom-scrollbar border-r border-gray-200 dark:border-dark-700">
              <div className="space-y-6">
                {/* Tabs */}
                <div className="flex space-x-2 border-b border-gray-200 dark:border-dark-700">
                  <button
                    onClick={() => setActiveTab('body')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === 'body'
                        ? 'text-purple-600 border-b-2 border-purple-600'
                        : 'text-gray-500 hover:text-purple-600'
                    }`}
                  >
                    Body
                  </button>
                  <button
                    onClick={() => setActiveTab('headers')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === 'headers'
                        ? 'text-purple-600 border-b-2 border-purple-600'
                        : 'text-gray-500 hover:text-purple-600'
                    }`}
                  >
                    Headers
                  </button>
                  <button
                    onClick={() => setActiveTab('params')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === 'params'
                        ? 'text-purple-600 border-b-2 border-purple-600'
                        : 'text-gray-500 hover:text-purple-600'
                    }`}
                  >
                    Query Params
                  </button>
                </div>

                {/* Content Type Selector */}
                {activeTab === 'body' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Content Type
                    </label>
                    <select
                      value={contentType}
                      onChange={(e) => setContentType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-dark-700 dark:text-white"
                    >
                      <option value="application/json">application/json</option>
                      <option value="application/xml">application/xml</option>
                      <option value="text/plain">text/plain</option>
                      <option value="text/html">text/html</option>
                    </select>
                  </div>
                )}

                {/* Tab Content */}
                <div className="mt-4">
                  {renderRequestConfig()}
                </div>
              </div>
            </div>

            {/* Response Section */}
            <div className="w-1/2 p-4 overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Response
                  </h4>
                  <div className="flex items-center space-x-4">
                    {requestDuration !== null && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Duration: {requestDuration.toFixed(2)}ms
                      </span>
                    )}
                    <button
                      onClick={handleCopyCurl}
                      className="text-sm text-gray-500 hover:text-purple-600 transition-colors flex items-center space-x-2"
                    >
                      <i className="fas fa-terminal"></i>
                      <span>Copy cURL</span>
                    </button>
                  </div>
                </div>

                {error ? (
                  <div className="text-red-600 dark:text-red-400">{error}</div>
                ) : (
                  <div className="space-y-4">
                    {response && (
                      <>
                        <div className="bg-white dark:bg-dark-800 p-4 rounded-lg border border-gray-200 dark:border-dark-700">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 rounded text-sm font-medium ${
                              response.status >= 200 && response.status < 300
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : response.status >= 400
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}>
                              {response.status} {response.statusText}
                            </span>
                            <span className="text-sm text-gray-500">
                              {response.data.length} bytes
                            </span>
                          </div>
                          <div className="space-y-2">
                            {Object.entries(response.headers).map(([key, value]) => (
                              <div key={key} className="text-sm">
                                <span className="font-medium text-gray-700 dark:text-gray-300">{key}:</span>{' '}
                                <span className="text-gray-600 dark:text-gray-400">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <pre className="bg-white dark:bg-dark-800 p-4 rounded-lg border border-gray-200 dark:border-dark-700 overflow-x-auto font-mono text-sm custom-scrollbar">
                          {response.data || 'No response data'}
                        </pre>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ScriptTestDialog; 