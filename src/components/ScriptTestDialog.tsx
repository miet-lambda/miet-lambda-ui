import React, { useState } from 'react';

interface ScriptTestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  scriptName: string;
  urlPath: string;
}

interface TestResponse {
  status: number;
  data: any;
  executionTime: number;
  memoryUsed: number;
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
type ContentType = 'application/json' | 'text/plain' | 'application/x-www-form-urlencoded' | 'multipart/form-data';

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
  
  /* For horizontal scrollbars */
  .custom-scrollbar-x::-webkit-scrollbar {
    height: 8px;
  }
`;

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center space-x-2 rounded-lg border ${
      active
        ? 'text-purple-600 bg-purple-50 border-purple-200 shadow-sm'
        : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50 hover:border-purple-100 border-transparent'
    }`}
  >
    <i className={`fas fa-${icon} ${active ? 'text-purple-500' : 'text-gray-400'}`}></i>
    <span>{label}</span>
  </button>
);

const highlightShellCommand = (command: string) => {
  // Split the command into lines
  return command.split('\n').map((line, i) => {
    // Highlight different parts of the command
    const parts = line.split(' ').map((part, j) => {
      if (j === 0 && i === 0) {
        // First word of first line (curl)
        return `<span class="text-purple-600">${part}</span>`;
      } else if (part.startsWith('-')) {
        // Options/flags
        return `<span class="text-blue-600">${part}</span>`;
      } else if (part.startsWith('"')) {
        // Quoted strings
        return `<span class="text-green-600">${part}</span>`;
      } else if (part.includes(':')) {
        // Headers
        return `<span class="text-orange-600">${part}</span>`;
      }
      return part;
    }).join(' ');

    // Add continuation symbol for multiline
    if (i < command.split('\n').length - 1) {
      return parts + `<span class="text-gray-500">\\</span>`;
    }
    return parts;
  }).join('\n');
};

const ScriptTestDialog: React.FC<ScriptTestDialogProps> = ({
  isOpen,
  onClose,
  scriptName,
  urlPath,
}) => {
  const [requestMethod, setRequestMethod] = useState<RequestMethod>('POST');
  const [contentType, setContentType] = useState<ContentType>('application/json');
  const [requestBody, setRequestBody] = useState('{\n  \n}');
  const [headers, setHeaders] = useState<Header[]>([{ key: '', value: '' }]);
  const [queryParams, setQueryParams] = useState<QueryParam[]>([{ key: '', value: '' }]);
  const [response, setResponse] = useState<TestResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'body' | 'headers' | 'params'>('body');

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
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
    const validParams = queryParams.filter(p => p.key && p.value);
    const queryString = validParams.length > 0
      ? '?' + validParams.map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join('&')
      : '';
    return `${baseUrl}${urlPath}${queryString}`;
  };

  const validateRequestBody = () => {
    if (contentType === 'application/json' && requestBody.trim()) {
      try {
        JSON.parse(requestBody);
      } catch (err) {
        throw new Error('Invalid JSON format');
      }
    }
  };

  const handleTest = async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      validateRequestBody();

      const validHeaders = headers
        .filter(h => h.key && h.value)
        .reduce((acc, h) => ({ ...acc, [h.key]: h.value }), {});

      const requestOptions: RequestInit = {
        method: requestMethod,
        headers: {
          ...validHeaders,
          'Content-Type': contentType,
        },
      };

      if (requestMethod !== 'GET' && requestBody.trim()) {
        requestOptions.body = requestBody;
      }

      const response = await fetch(buildUrl(), requestOptions);
      const data = await response.json();
      
      setResponse({
        status: response.status,
        data: data,
        executionTime: data.executionTime || 0,
        memoryUsed: data.memoryUsed || 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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
      command += `\\\n  -H "${header.key}: ${header.value}"`;
    });
    
    // Add content type if not in custom headers
    if (!validHeaders.some(h => h.key.toLowerCase() === 'content-type')) {
      command += `\\\n  -H "Content-Type: ${contentType}"`;
    }
    
    // Add request body if needed
    if (requestMethod !== 'GET' && requestBody.trim()) {
      // Escape double quotes in the request body
      const escapedBody = requestBody.replace(/"/g, '\\"');
      command += `\\\n  -d "${escapedBody}"`;
    }
    
    return command;
  };

  const renderRequestConfig = () => {
    switch (activeTab) {
      case 'headers':
        return (
          <div className="flex-1">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-medium text-gray-700">Headers</h4>
              <button
                onClick={handleAddHeader}
                className="text-sm text-purple-600 hover:text-purple-700 transition-colors"
              >
                + Add Header
              </button>
            </div>
            {headers.map((header, index) => (
              <div key={index} className="flex space-x-2 mb-2">
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
          </div>
        );
      
      case 'params':
        return (
          <div className="flex-1">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-medium text-gray-700">Query Parameters</h4>
              <button
                onClick={handleAddQueryParam}
                className="text-sm text-purple-600 hover:text-purple-700 transition-colors"
              >
                + Add Parameter
              </button>
            </div>
            {queryParams.map((param, index) => (
              <div key={index} className="flex space-x-2 mb-2">
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
          </div>
        );
      
      default: // body tab
        return (
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Request Body</h4>
            <div className="relative">
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                className="w-full h-64 font-mono text-sm p-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder={contentType === 'application/json' ? 'Enter JSON body' : 'Enter request body'}
              />
              <div className="absolute bottom-2 right-2">
                <button
                  onClick={() => setRequestBody(contentType === 'application/json' ? '{\n  \n}' : '')}
                  className="text-xs text-gray-500 hover:text-purple-600 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <style>{SCROLLBAR_STYLES}</style>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col transform transition-all duration-300 scale-100 opacity-100">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white rounded-t-2xl">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg">
              <i className="fas fa-flask text-white text-xl"></i>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-1">
                Test Script
              </h3>
              <p className="text-sm text-gray-500">{scriptName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 flex space-x-6 overflow-hidden bg-gray-50">
          {/* Request Panel */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-xl shadow-lg border border-gray-100">
            {/* Fixed header section with tabs */}
            <div className="px-6 pt-6 bg-white border-b border-gray-100">
              {/* Method and Content Type Selection */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Request Method
                  </label>
                  <select
                    value={requestMethod}
                    onChange={(e) => setRequestMethod(e.target.value as RequestMethod)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
                  >
                    {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Type
                  </label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value as ContentType)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
                  >
                    <option value="application/json">JSON</option>
                    <option value="text/plain">Plain Text</option>
                    <option value="application/x-www-form-urlencoded">Form URL Encoded</option>
                    <option value="multipart/form-data">Multipart Form Data</option>
                  </select>
                </div>
              </div>

              {/* Request Configuration Tabs */}
              <div className="flex space-x-2">
                <TabButton
                  active={activeTab === 'body'}
                  onClick={() => setActiveTab('body')}
                  icon="code"
                  label="Body"
                />
                <TabButton
                  active={activeTab === 'headers'}
                  onClick={() => setActiveTab('headers')}
                  icon="list"
                  label="Headers"
                />
                <TabButton
                  active={activeTab === 'params'}
                  onClick={() => setActiveTab('params')}
                  icon="link"
                  label="Params"
                />
              </div>
            </div>

            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {/* Request Configuration Content */}
              <div className="mb-6">
                {renderRequestConfig()}
              </div>

              {/* Curl Command */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                    <i className="fas fa-terminal text-gray-400"></i>
                    <span>Curl Command</span>
                  </h4>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generateCurlCommand());
                    }}
                    className="text-sm text-purple-600 hover:text-purple-700 transition-colors flex items-center space-x-2 px-3 py-1.5 rounded-lg hover:bg-purple-50"
                  >
                    <i className="fas fa-copy"></i>
                    <span>Copy</span>
                  </button>
                </div>
                <div className="font-mono text-sm bg-white p-4 rounded-lg border border-gray-200 overflow-x-auto whitespace-pre shadow-inner custom-scrollbar custom-scrollbar-x">
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: highlightShellCommand(generateCurlCommand()) 
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Test Button */}
            <div className="p-6 border-t border-gray-100">
              <button
                onClick={handleTest}
                disabled={isLoading}
                className={`${
                  isLoading
                    ? 'bg-purple-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
                } text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 w-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Testing...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-play"></i>
                    <span>Test Script</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Response Panel */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <i className="fas fa-reply text-gray-400"></i>
                <span>Response</span>
              </h4>
            </div>
            <div className="flex-1 overflow-hidden p-6">
              {error ? (
                <div className="p-6 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-start space-x-3">
                  <i className="fas fa-exclamation-circle mt-0.5"></i>
                  <div>
                    <div className="font-medium mb-1">Error</div>
                    <div className="text-sm text-red-500">{error}</div>
                  </div>
                </div>
              ) : response ? (
                <div className="h-full flex flex-col">
                  <div className="bg-gray-50 p-4 rounded-t-xl border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium px-3 py-1 rounded-lg ${
                        response.status >= 200 && response.status < 300
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        Status: {response.status}
                      </span>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <i className="fas fa-memory"></i>
                          <span>{response.memoryUsed.toFixed(2)} MB</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <i className="fas fa-clock"></i>
                          <span>{response.executionTime.toFixed(2)} ms</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto bg-gray-50 p-4 rounded-b-xl border-x border-b border-gray-200 custom-scrollbar">
                    <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700">
                      {JSON.stringify(response.data, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <i className="fas fa-terminal text-4xl mb-3"></i>
                    <div className="text-sm">Response will appear here</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const customPrismStyles = `
  /* Override Prism.js styles for better integration */
  pre[class*="language-"] {
    margin: 0;
    padding: 0;
    background: transparent;
    overflow: visible;
  }
  
  code[class*="language-"] {
    text-shadow: none;
    padding: 0;
  }
  
  .token.function {
    color: #6366f1;
  }
  
  .token.string {
    color: #059669;
  }
  
  .token.operator {
    color: #4f46e5;
  }
  
  .token.parameter {
    color: #7c3aed;
  }
  
  .token.url {
    color: #2563eb;
  }
`;

export default ScriptTestDialog; 