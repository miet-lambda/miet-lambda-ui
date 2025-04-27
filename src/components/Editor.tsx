import React, { useState, useEffect, useCallback, useRef } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import AiAssistant from './AiAssistant';
import AiConfig from './AiConfig';
import { aiService, Message } from '../services/aiService';
import '../styles/editor.css';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

const CodeEditor: React.FC<EditorProps> = ({ value, onChange }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [showMinimap, setShowMinimap] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [selectedCode, setSelectedCode] = useState('');
  const [isAiConfigOpen, setIsAiConfigOpen] = useState(false);
  const editorRef = useRef<any>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const lastY = useRef(0);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Handle manual resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      
      const container = editorContainerRef.current;
      if (!container) return;

      const dy = e.clientY - lastY.current;
      const newHeight = container.offsetHeight + dy;
      
      // Constrain height between 200px and 1000px
      if (newHeight >= 200 && newHeight <= 1000) {
        container.style.height = `${newHeight}px`;
        lastY.current = e.clientY;
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
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Error toggling fullscreen:', err);
    }
  }, []);

  // Handle font size changes
  const handleFontSizeChange = (delta: number) => {
    setFontSize(prev => Math.max(8, Math.min(32, prev + delta)));
  };

  // Start resize
  const startResize = (e: React.MouseEvent) => {
    isResizing.current = true;
    lastY.current = e.clientY;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  };

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;

    // Add selection change listener
    editor.onDidChangeCursorSelection((e: any) => {
      const selection = editor.getModel().getValueInRange(e.selection);
      setSelectedCode(selection);
    });
  };

  // Handle AI messages
  const handleSendMessage = async (message: string, type?: 'explain' | 'general') => {
    let finalMessage = message;
    const codeToAnalyze = selectedCode || value;
    
    if (!codeToAnalyze.trim()) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'There is no code to analyze. Please enter some code first.'
        }
      ]);
      return;
    }

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: finalMessage }]);
    setIsAiLoading(true);

    try {
      let response: string;

      switch (type) {
        case 'explain':
          response = await aiService.explainCode(codeToAnalyze, message);
          break;
        case 'general':
          if (message.toLowerCase().includes('improve') || message.toLowerCase().includes('optimize')) {
            response = await aiService.suggestImprovements(codeToAnalyze);
          } else if (message.toLowerCase().includes('bug') || message.toLowerCase().includes('issue')) {
            response = await aiService.findBugs(codeToAnalyze);
          } else if (message.toLowerCase().includes('comment')) {
            response = await aiService.addComments(codeToAnalyze);
          } else {
            response = await aiService.generateResponse([{ role: 'user', content: `${message}\nHere's the code:\n\`\`\`lua\n${codeToAnalyze}\n\`\`\`` }]);
          }
          break;
        default:
          response = await aiService.generateResponse([{ role: 'user', content: message }]);
      }

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: response
        }
      ]);
    } catch (error) {
      console.error('Error sending message to AI:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: error instanceof Error 
            ? error.message 
            : 'Sorry, I encountered an error while processing your request. Please try again.'
        }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleExplainCode = () => {
    const codeToExplain = selectedCode || value;
    if (!codeToExplain.trim()) return;

    handleSendMessage(
      selectedCode ? 'Could you explain this selected code?' : 'Could you explain this entire file?',
      'explain'
    );
    setShowAiAssistant(true);
  };

  const handleAiToggle = () => {
    // Check if API key is configured
    const apiKey = localStorage.getItem('openai_api_key');
    if (!apiKey) {
      setIsAiConfigOpen(true);
    } else {
      setShowAiAssistant(!showAiAssistant);
    }
  };

  return (
    <div 
      ref={editorContainerRef}
      className={`editor-container relative ${isFullscreen ? 'fullscreen' : ''}`}
      style={{ height: isFullscreen ? '100vh' : '500px' }}
    >
      <div className="flex flex-col h-full">
        {/* Editor Toolbar */}
        <div className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center editor-toolbar">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleFontSizeChange(-2)}
                className="p-1 hover:bg-gray-700 rounded"
                title="Decrease font size"
              >
                <i className="fas fa-minus text-sm"></i>
              </button>
              <span className="text-sm">{fontSize}px</span>
              <button
                onClick={() => handleFontSizeChange(2)}
                className="p-1 hover:bg-gray-700 rounded"
                title="Increase font size"
              >
                <i className="fas fa-plus text-sm"></i>
              </button>
            </div>
            <div className="h-4 w-px bg-gray-600"></div>
            <button
              onClick={() => setShowMinimap(!showMinimap)}
              className={`p-1 rounded transition-colors ${
                showMinimap ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-gray-700'
              }`}
              title="Toggle minimap"
            >
              <i className="fas fa-map text-sm"></i>
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExplainCode}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
              title="Explain Code"
            >
              <i className="fas fa-question-circle text-sm"></i>
            </button>
            <button
              onClick={() => setIsAiConfigOpen(true)}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
              title="Configure AI"
            >
              <i className="fas fa-cog text-sm"></i>
            </button>
            <button
              onClick={handleAiToggle}
              className={`p-1 rounded transition-colors ${
                showAiAssistant ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-gray-700'
              }`}
              title="Toggle AI Assistant"
            >
              <i className="fas fa-robot text-sm"></i>
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
              title="Toggle fullscreen"
            >
              <i className={`fas fa-${isFullscreen ? 'compress' : 'expand'} text-sm`}></i>
            </button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex flex-1 relative">
          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="lua"
              theme="vs-dark"
              value={value}
              onChange={(value) => onChange(value || '')}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: showMinimap },
                fontSize,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                readOnly: false,
                automaticLayout: true,
                padding: { top: 10, bottom: 10 },
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                formatOnPaste: true,
                formatOnType: true,
                renderWhitespace: 'selection',
                renderLineHighlight: 'line',
                scrollbar: {
                  verticalScrollbarSize: 12,
                  horizontalScrollbarSize: 12,
                },
                overviewRulerLanes: 0,
                lineDecorationsWidth: 8,
                wordWrap: 'off',
                glyphMargin: false,
                folding: true,
                lineHeight: 1.5,
                letterSpacing: 0.5,
                suggestSelection: 'first',
                quickSuggestions: true,
                quickSuggestionsDelay: 10,
                snippetSuggestions: 'top',
                tabSize: 2,
                insertSpaces: true,
                detectIndentation: true,
                trimAutoWhitespace: true,
              }}
              loading={
                <div className="flex items-center justify-center h-full bg-gray-900">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              }
            />
          </div>
          {showAiAssistant && (
            <div className="w-80 border-l border-gray-700">
              <AiAssistant
                onSendMessage={(msg) => handleSendMessage(msg, 'general')}
                isLoading={isAiLoading}
                messages={messages}
              />
            </div>
          )}
        </div>
      </div>

      {/* Resize Handle */}
      {!isFullscreen && (
        <div
          className="absolute bottom-0 left-0 right-0 h-2 bg-transparent cursor-row-resize hover:bg-blue-500 hover:bg-opacity-20"
          onMouseDown={startResize}
        />
      )}

      {/* AI Configuration Dialog */}
      <AiConfig
        isOpen={isAiConfigOpen}
        onClose={() => {
          setIsAiConfigOpen(false);
          if (localStorage.getItem('openai_api_key') && !showAiAssistant) {
            setShowAiAssistant(true);
          }
        }}
      />
    </div>
  );
};

export default CodeEditor; 