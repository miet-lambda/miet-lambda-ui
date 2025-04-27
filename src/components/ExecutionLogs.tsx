import React, { useState } from 'react';

export interface ExecutionLog {
  id: string;
  projectId: string;
  projectName: string;
  scriptName: string;
  timestamp: Date;
  status: 'success' | 'error';
  response?: string;
  error?: string;
  executionCost: number; // in credits/tokens
  memoryUsed: number; // in MB
  executionTime: number; // in milliseconds
}

export interface ScriptChange {
  id: string;
  projectId: string;
  projectName: string;
  scriptName: string;
  timestamp: Date;
  changeType: 'create' | 'modify' | 'delete' | 'rename';
  description: string;
  author: string;
  diff?: string;
}

interface ExecutionLogsProps {
  logs: ExecutionLog[];
  scriptHistory: ScriptChange[];
  onClearLogs: (projectId?: string) => void;
  currentProjectId?: string;
}

const ExecutionLogs: React.FC<ExecutionLogsProps> = ({ logs, scriptHistory, onClearLogs, currentProjectId }) => {
  const [showAllProjects, setShowAllProjects] = useState(!currentProjectId);
  const [selectedLog, setSelectedLog] = useState<ExecutionLog | null>(null);
  const [activeTab, setActiveTab] = useState<'executions' | 'history'>('executions');
  const [selectedChange, setSelectedChange] = useState<ScriptChange | null>(null);

  // Filter logs based on current project or show all
  const filteredLogs = showAllProjects ? logs : logs.filter(log => log.projectId === currentProjectId);
  const filteredHistory = showAllProjects ? scriptHistory : scriptHistory.filter(change => change.projectId === currentProjectId);

  // Get unique projects from logs
  const projects = Array.from(new Set(logs.map(log => log.projectId))).map(projectId => ({
    id: projectId,
    name: logs.find(log => log.projectId === projectId)?.projectName || 'Unknown Project'
  }));

  const getChangeTypeColor = (changeType: string) => {
    switch (changeType) {
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'modify':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      case 'rename':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Activity Logs</h2>
            <p className="text-sm text-gray-600 mt-1">View your script execution and change history</p>
          </div>
          <div className="flex space-x-3">
            {currentProjectId && (
              <button
                onClick={() => setShowAllProjects(!showAllProjects)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                  showAllProjects 
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                <i className={`fas fa-${showAllProjects ? 'filter' : 'project-diagram'}`}></i>
                <span>{showAllProjects ? 'Current Project Only' : 'All Projects'}</span>
              </button>
            )}
            <button
              onClick={() => onClearLogs(showAllProjects ? undefined : currentProjectId)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center space-x-2"
            >
              <i className="fas fa-trash-alt"></i>
              <span>Clear {!showAllProjects ? 'Project ' : ''}Logs</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mt-6">
          <button
            onClick={() => setActiveTab('executions')}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              activeTab === 'executions'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-2">
              <i className="fas fa-play-circle"></i>
              <span>Execution Logs</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              activeTab === 'history'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-2">
              <i className="fas fa-history"></i>
              <span>Script History</span>
            </div>
          </button>
        </div>

        {showAllProjects && projects.length > 1 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {projects.map(project => (
              <div
                key={project.id}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm flex items-center"
              >
                <i className="fas fa-project-diagram mr-2 opacity-70"></i>
                <span>{project.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'executions' ? (
          // Execution Logs Content
          filteredLogs.length > 0 ? (
            <div className="min-w-full">
              <div className="sticky top-0 bg-gray-50 shadow-sm">
                <div className="grid grid-cols-8 gap-4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="col-span-1">Timestamp</div>
                  {showAllProjects && <div className="col-span-1">Project</div>}
                  <div className="col-span-1">Script</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-2">Response/Error</div>
                  <div className="col-span-1">Cost</div>
                  <div className="col-span-1">Memory</div>
                  <div className="col-span-1">Time</div>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="grid grid-cols-8 gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                  >
                    <div className="col-span-1 text-sm text-gray-600">
                      {log.timestamp.toLocaleString()}
                    </div>
                    {showAllProjects && (
                      <div className="col-span-1 text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          <i className="fas fa-project-diagram mr-2 opacity-70"></i>
                          {log.projectName}
                        </div>
                      </div>
                    )}
                    <div className="col-span-1 text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        <i className="fas fa-file-code mr-2 opacity-70"></i>
                        {log.scriptName}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          log.status === 'success'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                    <div className="col-span-2 text-sm text-gray-500">
                      <div className="max-w-lg truncate">
                        {log.status === 'success' ? log.response : log.error}
                      </div>
                    </div>
                    <div className="col-span-1 text-sm text-gray-600">
                      {log.executionCost.toFixed(2)} credits
                    </div>
                    <div className="col-span-1 text-sm text-gray-600">
                      {log.memoryUsed.toFixed(1)} MB
                    </div>
                    <div className="col-span-1 text-sm text-gray-600">
                      {log.executionTime} ms
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-history text-gray-400 text-xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No execution logs {!showAllProjects ? 'for this project ' : ''}yet
              </h3>
              <p className="text-gray-600">
                Execute a script to see its logs appear here
              </p>
            </div>
          )
        ) : (
          // Script History Content
          filteredHistory.length > 0 ? (
            <div className="min-w-full">
              <div className="sticky top-0 bg-gray-50 shadow-sm">
                <div className="grid grid-cols-6 gap-4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="col-span-1">Timestamp</div>
                  {showAllProjects && <div className="col-span-1">Project</div>}
                  <div className="col-span-1">Script</div>
                  <div className="col-span-1">Type</div>
                  <div className="col-span-2">Description</div>
                  <div className="col-span-1">Author</div>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredHistory.map((change) => (
                  <div
                    key={change.id}
                    onClick={() => setSelectedChange(change)}
                    className="grid grid-cols-6 gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                  >
                    <div className="col-span-1 text-sm text-gray-600">
                      {change.timestamp.toLocaleString()}
                    </div>
                    {showAllProjects && (
                      <div className="col-span-1 text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          <i className="fas fa-project-diagram mr-2 opacity-70"></i>
                          {change.projectName}
                        </div>
                      </div>
                    )}
                    <div className="col-span-1 text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        <i className="fas fa-file-code mr-2 opacity-70"></i>
                        {change.scriptName}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getChangeTypeColor(
                          change.changeType
                        )}`}
                      >
                        {change.changeType}
                      </span>
                    </div>
                    <div className="col-span-2 text-sm text-gray-500">
                      {change.description}
                    </div>
                    <div className="col-span-1 text-sm text-gray-600">
                      {change.author}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-code-branch text-gray-400 text-xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No script changes {!showAllProjects ? 'for this project ' : ''}yet
              </h3>
              <p className="text-gray-600">
                Make changes to your scripts to see the history here
              </p>
            </div>
          )
        )}
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Log Details</h3>
                <p className="text-sm text-gray-600">
                  {selectedLog.timestamp.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Project</h4>
                  <p className="text-gray-900">{selectedLog.projectName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Script</h4>
                  <p className="text-gray-900">{selectedLog.scriptName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Status</h4>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedLog.status === 'success'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {selectedLog.status}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Execution Cost</h4>
                  <p className="text-gray-900">{selectedLog.executionCost.toFixed(2)} credits</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Memory Used</h4>
                  <p className="text-gray-900">{selectedLog.memoryUsed.toFixed(1)} MB</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Execution Time</h4>
                  <p className="text-gray-900">{selectedLog.executionTime} ms</p>
                </div>
              </div>
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  {selectedLog.status === 'success' ? 'Response' : 'Error'}
                </h4>
                <pre className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 overflow-x-auto">
                  {selectedLog.status === 'success'
                    ? selectedLog.response
                    : selectedLog.error}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Details Modal */}
      {selectedChange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Change Details</h3>
                <p className="text-sm text-gray-600">
                  {selectedChange.timestamp.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedChange(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Project</h4>
                  <p className="text-gray-900">{selectedChange.projectName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Script</h4>
                  <p className="text-gray-900">{selectedChange.scriptName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Change Type</h4>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getChangeTypeColor(
                      selectedChange.changeType
                    )}`}
                  >
                    {selectedChange.changeType}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Author</h4>
                  <p className="text-gray-900">{selectedChange.author}</p>
                </div>
              </div>
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
                <p className="text-gray-900">{selectedChange.description}</p>
              </div>
              {selectedChange.diff && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Changes</h4>
                  <pre className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 overflow-x-auto font-mono">
                    {selectedChange.diff}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecutionLogs; 