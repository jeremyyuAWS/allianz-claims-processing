import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Send, Bot, User, InfoIcon, Sparkles, Check } from 'lucide-react';

interface PortfolioEditorProps {
  portfolioType: string;
}

const PortfolioEditor: React.FC<PortfolioEditorProps> = ({ portfolioType }) => {
  const { advisorChats, addMessageToAdvisorChat, portfolios } = useAppContext();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const chatThread = advisorChats[portfolioType];
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatThread?.messages]);
  
  // Initialize chat with a welcome message if empty
  useEffect(() => {
    if (chatThread && chatThread.messages.length === 0) {
      addMessageToAdvisorChat(portfolioType, {
        sender: 'agent',
        content: `Welcome to the ${portfolioType} Portfolio Editor. You can modify this portfolio by telling me what changes you'd like to make. For example, you can say "Increase stock allocation to 60%" or "Add more international exposure."`,
        agentType: 'editor'
      });
    }
  }, [portfolioType, chatThread, addMessageToAdvisorChat]);
  
  const handleSendMessage = () => {
    if (input.trim() === '') return;
    
    addMessageToAdvisorChat(portfolioType, {
      sender: 'user',
      content: input,
    });
    
    setInput('');
    setIsTyping(true);
    
    // Simulate AI thinking time
    setTimeout(() => {
      setIsTyping(false);
    }, 1500);
  };

  // Suggestions based on portfolio type
  const getSuggestions = () => {
    const commonSuggestions = [
      "Increase stock allocation by 10%",
      "Reduce bond exposure and add more REITs",
      "Add more international diversification",
      "Make this portfolio more tax-efficient"
    ];
    
    if (portfolioType === 'Aggressive') {
      return [
        ...commonSuggestions,
        "Add small-cap growth exposure",
        "Increase emerging markets allocation"
      ];
    } else if (portfolioType === 'Balanced') {
      return [
        ...commonSuggestions,
        "Balance growth and income more evenly",
        "Add dividend-focused stocks"
      ];
    } else {
      return [
        ...commonSuggestions,
        "Add more defensive sectors",
        "Increase bond duration for higher yield"
      ];
    }
  };
  
  const suggestions = getSuggestions();
  
  const handleSuggestionClick = (suggestion: string, index: number) => {
    setSuggestionIndex(index);
    setInput(suggestion);
    
    // Automatically send after a brief delay
    setTimeout(() => {
      addMessageToAdvisorChat(portfolioType, {
        sender: 'user',
        content: suggestion,
      });
      
      setInput('');
      setSuggestionIndex(null);
      setIsTyping(true);
      
      // Simulate AI thinking time
      setTimeout(() => {
        setIsTyping(false);
      }, 1500);
    }, 500);
  };

  // Get the active portfolio
  const activePortfolio = portfolios.find(p => p.type === portfolioType);

  // Get the color for highlighting changes
  const getHighlightColor = () => {
    if (!activePortfolio) return '#3b82f6';
    return activePortfolio.colorScheme.primary;
  };
  
  if (!chatThread) {
    return <div>Loading chat...</div>;
  }
  
  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 p-4">
        <h3 className="font-medium text-lg text-gray-900">{portfolioType} Portfolio Editor</h3>
        <p className="text-sm text-gray-500">
          Make modifications to this portfolio by chatting with the AI assistant.
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatThread.messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-2.5 ${
              message.sender === 'user' ? 'justify-end' : ''
            }`}
          >
            {message.sender === 'agent' && (
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <Bot className="w-4 h-4 text-indigo-600" />
              </div>
            )}
            <div
              className={`flex flex-col max-w-[80%] leading-1.5 ${
                message.sender === 'user'
                  ? 'items-end'
                  : 'items-start'
              }`}
            >
              <div
                className={`px-4 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
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
        
        {isTyping && (
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <Bot className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="px-4 py-2 bg-gray-100 rounded-lg rounded-tl-none">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Show most recent portfolio changes */}
        {chatThread.messages.length > 1 && chatThread.messages[chatThread.messages.length - 1].sender === 'agent' && (
          <div className="mt-4 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <div className="flex items-center mb-2">
              <Sparkles className="h-4 w-4 text-indigo-600 mr-2" />
              <h4 className="text-sm font-medium text-indigo-700">Portfolio Changes Applied</h4>
            </div>
            {activePortfolio && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-between p-2 bg-white rounded-md">
                  <span className="text-gray-600">Stocks:</span> 
                  <span className="font-medium" style={{color: getHighlightColor()}}>{activePortfolio.allocation.stocks}%</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded-md">
                  <span className="text-gray-600">Bonds:</span> 
                  <span className="font-medium" style={{color: getHighlightColor()}}>{activePortfolio.allocation.bonds}%</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded-md">
                  <span className="text-gray-600">REITs:</span> 
                  <span className="font-medium" style={{color: getHighlightColor()}}>{activePortfolio.allocation.reits}%</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded-md">
                  <span className="text-gray-600">International:</span> 
                  <span className="font-medium" style={{color: getHighlightColor()}}>{activePortfolio.allocation.international}%</span>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Quick suggestions */}
      {!(isTyping || suggestionIndex !== null) && (
        <div className="px-4 pt-2 pb-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Quick suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 rounded-full border border-gray-200 hover:border-indigo-200 transition-colors"
                onClick={() => handleSuggestionClick(suggestion, index)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Type portfolio modifications..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button
            className="bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-700 transition-colors"
            onClick={handleSendMessage}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mt-3 flex items-start text-xs text-gray-500">
          <InfoIcon className="h-4 w-4 text-gray-400 mr-1 mt-0.5 flex-shrink-0" />
          <p>
            Example commands: "Reduce stock allocation by 10%", "Add more REITs", "Make this portfolio more conservative", "Increase international exposure"
          </p>
        </div>
        
        <div className="mt-4 flex justify-end space-x-2">
          <button className="px-3 py-1 text-sm border border-gray-300 rounded-md shadow-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Reset Changes
          </button>
          <button className="px-3 py-1 text-sm border border-transparent rounded-md shadow-sm font-medium text-white bg-green-600 hover:bg-green-700">
            Publish for Customer
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioEditor;