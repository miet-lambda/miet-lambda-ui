import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AiAssistantProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

const AiAssistant: React.FC<AiAssistantProps> = ({
  onSendMessage,
  isLoading = false,
  messages
}) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const renderMessage = (content: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <p key={`text-${lastIndex}`} className="whitespace-pre-wrap break-words leading-relaxed">
            {content.slice(lastIndex, match.index)}
          </p>
        );
      }

      const language = match[1] || 'plaintext';
      const code = match[2];
      parts.push(
        <div key={`code-${match.index}`} className="my-3 overflow-hidden rounded-lg border border-gray-700/50">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 dark:bg-gray-800 border-b border-gray-700">
            <span className="text-xs text-gray-400 font-mono">{language}</span>
            <button 
              className="text-xs text-gray-400 hover:text-white transition-colors"
              onClick={() => navigator.clipboard.writeText(code)}
            >
              <i className="fas fa-copy"></i>
            </button>
          </div>
          <div className="overflow-x-auto">
            <pre className="bg-gray-800/30 dark:bg-gray-800/50 text-gray-100 dark:text-gray-200 p-4 m-0 text-sm font-mono">
              <code className="break-words whitespace-pre-wrap">{code}</code>
            </pre>
          </div>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push(
        <p key={`text-${lastIndex}`} className="whitespace-pre-wrap break-words leading-relaxed">
          {content.slice(lastIndex)}
        </p>
      );
    }

    return parts.length > 0 ? parts : <p className="whitespace-pre-wrap break-words leading-relaxed">{content}</p>;
  };

  const quickActions = [
    {
      icon: 'book-open',
      label: 'Explain this code',
      message: 'Could you explain what this code does?'
    },
    {
      icon: 'bug',
      label: 'Find bugs',
      message: 'Could you check this code for potential bugs or issues?'
    },
    {
      icon: 'bolt',
      label: 'Optimize code',
      message: 'How can I optimize this code?'
    },
    {
      icon: 'comment',
      label: 'Add comments',
      message: 'Could you help me add appropriate comments to this code?'
    }
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/50 backdrop-blur-lg">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg shadow-lg">
            <i className="fas fa-robot text-white text-lg"></i>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">AI Assistant</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ready to help with your code</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="shrink-0 p-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/30 backdrop-blur-sm">
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSendMessage(action.message)}
              disabled={isLoading}
              className={`px-3 py-2 rounded-lg flex items-center space-x-2 ${
                isLoading
                  ? 'bg-gray-100 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 shadow-sm'
              } transition-all duration-200`}
            >
              <i className={`fas fa-${action.icon} text-xs`}></i>
              <span className="text-sm font-medium">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'} items-end space-x-2`}
            >
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-robot text-white text-xs"></i>
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 overflow-hidden ${
                  msg.role === 'assistant'
                    ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm'
                    : 'bg-blue-600 text-white ml-2'
                }`}
              >
                <div className="text-sm overflow-hidden">
                  {msg.role === 'assistant' ? renderMessage(msg.content) : msg.content}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start items-end space-x-2"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <i className="fas fa-robot text-white text-xs"></i>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
              <div className="flex space-x-2">
                <motion.div 
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.2 }}
                  className="w-2 h-2 bg-blue-500 rounded-full"
                />
                <motion.div 
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.3 }}
                  className="w-2 h-2 bg-blue-500 rounded-full"
                />
                <motion.div 
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.4 }}
                  className="w-2 h-2 bg-blue-500 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="shrink-0 p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/50 backdrop-blur-lg">
        <div className="relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Ask for help..."
            rows={3}
            className="w-full px-4 py-3 pr-12 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 resize-none"
          />
          <button
            type="submit"
            disabled={isLoading || !message.trim()}
            className={`absolute right-3 bottom-3 p-2 rounded-lg transition-colors ${
              isLoading || !message.trim()
                ? 'text-gray-400 dark:text-gray-600'
                : 'text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-800'
            }`}
          >
            <i className={`fas fa-${isLoading ? 'spinner fa-spin' : 'paper-plane'}`}></i>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AiAssistant; 