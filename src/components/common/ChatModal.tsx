import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Send, X, Bot, User, Minimize2, Maximize2 } from 'lucide-react';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose }) => {
  const { chatThread, addMessageToChat, activeTab } = useAppContext();
  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change or modal opens
    if (messagesEndRef.current && isOpen && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatThread.messages, isOpen, isMinimized]);

  // Get agent title based on active tab
  const getAgentTitle = () => {
    switch (activeTab) {
      case 'start':
        return 'Claims Intake Assistant';
      case 'upload':
        return 'Document Upload Assistant';
      case 'fill':
        return 'Form Completion Assistant';
      case 'track':
        return 'Claims Status Assistant';
      case 'contact':
        return 'Support Escalation Assistant';
      default:
        return 'Allianz Claims Assistant';
    }
  };

  const handleSendMessage = () => {
    if (input.trim() === '') return;
    
    addMessageToChat({
      sender: 'user',
      content: input,
    });
    
    setInput('');
  };

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg z-50 border border-blue-200 p-3 cursor-pointer" onClick={() => setIsMinimized(false)}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Bot className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium">Allianz Assistant</p>
            <p className="text-xs text-gray-500">Click to continue chatting</p>
          </div>
          <Maximize2 className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-end justify-end p-4 sm:p-6">
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
      
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col h-[600px] sm:h-[700px] relative overflow-hidden z-50">
        {/* Header */}
        <div className="px-4 py-3 bg-blue-600 flex justify-between items-center text-white">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <h3 className="font-medium">{getAgentTitle()}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setIsMinimized(true)} 
              className="p-1 hover:bg-blue-700 rounded"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
            <button 
              onClick={onClose} 
              className="p-1 hover:bg-blue-700 rounded"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatThread.messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-2.5 ${
                message.sender === 'user' ? 'justify-end' : ''
              }`}
            >
              {message.sender === 'agent' && (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
              )}
              <div
                className={`flex flex-col max-w-[75%] leading-1.5 ${
                  message.sender === 'user'
                    ? 'items-end'
                    : 'items-start'
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-gray-100 text-gray-800 rounded-tl-none'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              {message.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your message here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              className="bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors"
              onClick={handleSendMessage}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            This is a simulated AI assistant. In a production environment, this would be powered by a specialized claims processing AI.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;