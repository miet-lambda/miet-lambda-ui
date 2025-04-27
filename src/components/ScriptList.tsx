import { Script } from '../types';

interface ScriptListProps {
  scripts: Script[];
  onScriptSelect: (script: Script) => void;
  onScriptDelete: (script: Script) => void;
  onUrlConfig: (script: Script) => void;
  selectedScript?: Script | null;
}

export default function ScriptList({ scripts, onScriptSelect, onScriptDelete, onUrlConfig, selectedScript }: ScriptListProps) {
  return (
    <div className="flex flex-col space-y-2">
      {scripts.map((script) => (
        <div
          key={script.id}
          className={`p-3 rounded-lg border ${
            selectedScript?.id === script.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          } cursor-pointer transition-all`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">{script.name}</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUrlConfig(script);
                }}
                className="text-gray-400 hover:text-blue-600 transition-colors"
                title="Configure URL Path"
              >
                <i className="fas fa-link text-sm"></i>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onScriptDelete(script);
                }}
                className="text-gray-400 hover:text-red-600 transition-colors"
                title="Delete Script"
              >
                <i className="fas fa-trash text-sm"></i>
              </button>
            </div>
          </div>
          {script.urlPath && (
            <div className="text-xs text-gray-500 mb-2">
              Path: {script.urlPath}
            </div>
          )}
          <div className="text-xs text-gray-400">
            {script.code.split('\n')[0].substring(0, 50)}
            {script.code.split('\n')[0].length > 50 ? '...' : ''}
          </div>
        </div>
      ))}
    </div>
  );
} 