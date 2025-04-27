import React, { useState, useEffect, useCallback, useRef } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import AiAssistant from './AiAssistant';
import { aiService, Message } from '../services/aiService';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [chatWidth, setChatWidth] = useState(320);
  const editorRef = useRef<any>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const isChatResizing = useRef(false);
  const resizeTimeoutRef = useRef<NodeJS.Timeout>();

  // Debounced layout update function
  const updateEditorLayout = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    
    resizeTimeoutRef.current = setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.layout();
      }
    }, 16); // Roughly one frame at 60fps
  }, []);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null);
      updateEditorLayout();
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [updateEditorLayout]);

  // Handle chat panel resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isChatResizing.current) return;
      
      const dx = lastX.current - e.clientX;
      const newWidth = Math.max(280, Math.min(800, chatWidth + dx));
      
      if (newWidth !== chatWidth) {
        setChatWidth(newWidth);
        updateEditorLayout();
      }
      lastX.current = e.clientX;
    };

    const handleMouseUp = () => {
      isChatResizing.current = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
      updateEditorLayout();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [chatWidth, updateEditorLayout]);

  // Update editor layout when chat visibility changes
  useEffect(() => {
    updateEditorLayout();
  }, [showAiAssistant, updateEditorLayout]);

  const startChatResize = (e: React.MouseEvent) => {
    e.preventDefault();
    isChatResizing.current = true;
    lastX.current = e.clientX;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    
    editor.onDidChangeCursorSelection((e: any) => {
      const selection = editor.getModel().getValueInRange(e.selection);
      setSelectedCode(selection);
    });

    updateEditorLayout();
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
    setShowAiAssistant(!showAiAssistant);
  };

  // Start resize
  const startResize = (e: React.MouseEvent) => {
    isResizing.current = true;
    lastY.current = e.clientY;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  };

  return (
    <div 
      ref={editorContainerRef}
      className={`relative flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-gray-900' : 'h-full'}`}
    >
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          {/* Font Size Control */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFontSize(prev => Math.max(8, prev - 2))}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <i className="fas fa-minus"></i>
            </button>
            <span className="text-gray-300 text-sm">{fontSize}px</span>
            <button
              onClick={() => setFontSize(prev => Math.min(32, prev + 2))}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <i className="fas fa-plus"></i>
            </button>
          </div>

          {/* Minimap Toggle */}
          <button
            onClick={() => setShowMinimap(!showMinimap)}
            className={`text-sm px-3 py-1 rounded-lg transition-colors ${
              showMinimap ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <i className="fas fa-map"></i>
          </button>
        </div>

        <div className="flex items-center space-x-4">
          {/* AI Assistant Button */}
          <button
            onClick={() => setShowAiAssistant(!showAiAssistant)}
            className={`text-sm px-3 py-1 rounded-lg transition-colors ${
              showAiAssistant ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <i className="fas fa-robot mr-2"></i>
            AI Assistant
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => {
              if (isFullscreen) {
                document.exitFullscreen();
              } else {
                editorContainerRef.current?.requestFullscreen();
              }
            }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <i className={`fas fa-${isFullscreen ? 'compress' : 'expand'}`}></i>
          </button>
        </div>
      </div>

      {/* Editor and AI Assistant */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Editor */}
        <div 
          className="flex-1 relative"
          style={{
            width: showAiAssistant ? `calc(100% - ${chatWidth}px)` : '100%',
            transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <Editor
            height="100%"
            defaultLanguage="lua"
            value={value}
            onChange={value => value && onChange(value)}
            theme="vs-dark"
            options={{
              fontSize: fontSize,
              minimap: { 
                enabled: showMinimap,
                side: showAiAssistant ? 'left' : 'right',
                maxColumn: 60,
                renderCharacters: false,
                showSlider: 'mouseover'
              },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              lineNumbers: 'on',
              renderWhitespace: 'selection',
              automaticLayout: false
            }}
            onMount={handleEditorDidMount}
          />
        </div>

        {/* AI Assistant Panel */}
        <AnimatePresence>
          {showAiAssistant && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-1 cursor-col-resize hover:bg-blue-500 hover:bg-opacity-50 transition-colors"
                onMouseDown={startChatResize}
              />
              <motion.div
                initial={{ x: chatWidth, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: chatWidth, opacity: 0 }}
                transition={{ 
                  type: "tween",
                  duration: 0.3,
                  ease: "easeInOut"
                }}
                style={{ width: chatWidth }}
                className="border-l border-gray-700 absolute right-0 top-0 bottom-0 bg-white dark:bg-dark-900"
              >
                <AiAssistant
                  onSendMessage={(msg) => handleSendMessage(msg, 'general')}
                  isLoading={isAiLoading}
                  messages={messages}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Resize Handle */}
      {!isFullscreen && (
        <div
          className="absolute bottom-0 left-0 right-0 h-2 bg-transparent cursor-row-resize hover:bg-blue-500 hover:bg-opacity-20"
          onMouseDown={startResize}
        />
      )}
    </div>
  );
};

export default CodeEditor; 