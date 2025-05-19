import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Send, Bot, User } from 'lucide-react';
import { Message } from '../../types';
import QuickQuestions from '../common/QuickQuestions';
import IntegratedDemoHelper from '../common/IntegratedDemoHelper';
import { parseMoneyInput } from '../../utils/formatters';

const PlanRetirement: React.FC = () => {
  const { 
    questionnaireChatThread, 
    addMessageToQuestionnaire, 
    retirementData, 
    setRetirementData 
  } = useAppContext();
  
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Initialize the chat if it's empty
    if (questionnaireChatThread.messages.length === 0) {
      addMessageToQuestionnaire({
        sender: 'agent',
        content: "Hello! I'm your Retirement Planning AI Assistant. I'll help you create a personalized retirement plan. Let's start with some questions. What is your current age?",
        agentType: 'questionnaire'
      });
    }
  }, [questionnaireChatThread.messages.length, addMessageToQuestionnaire]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [questionnaireChatThread.messages]);

  const handleSendMessage = () => {
    if (input.trim() === '') return;
    
    // Add user message
    addMessageToQuestionnaire({
      sender: 'user',
      content: input,
    });
    
    // Process user input based on the last agent question
    const lastAgentMessage = [...questionnaireChatThread.messages]
      .reverse()
      .find(msg => msg.sender === 'agent');
      
    if (lastAgentMessage) {
      processUserInput(input, lastAgentMessage);
    }
    
    setInput('');
  };

  const processUserInput = (userInput: string, lastAgentMessage: Message) => {
    // Parse and store the user's input based on the question
    if (lastAgentMessage.content.includes('current age')) {
      const age = parseInt(userInput, 10);
      setRetirementData(prev => ({ ...prev!, age }));
      
      // Ask next question
      setTimeout(() => {
        addMessageToQuestionnaire({
          sender: 'agent',
          content: 'Great! And at what age do you plan to retire?',
          agentType: 'questionnaire'
        });
      }, 500);
    } 
    else if (lastAgentMessage.content.includes('plan to retire')) {
      const retirementAge = parseInt(userInput, 10);
      setRetirementData(prev => ({ ...prev!, retirementAge }));
      
      setTimeout(() => {
        addMessageToQuestionnaire({
          sender: 'agent',
          content: 'How much have you already saved for retirement?',
          agentType: 'questionnaire'
        });
      }, 500);
    } 
    else if (lastAgentMessage.content.includes('saved for retirement')) {
      // Parse monetary input with support for abbreviations like 1M or 100K
      const currentSavings = parseMoneyInput(userInput);
      setRetirementData(prev => ({ ...prev!, currentSavings }));
      
      setTimeout(() => {
        addMessageToQuestionnaire({
          sender: 'agent',
          content: 'What is your current annual income?',
          agentType: 'questionnaire'
        });
      }, 500);
    } 
    else if (lastAgentMessage.content.includes('annual income')) {
      // Parse monetary input with support for abbreviations like 1M or 100K
      const annualIncome = parseMoneyInput(userInput);
      setRetirementData(prev => ({ ...prev!, annualIncome }));
      
      setTimeout(() => {
        addMessageToQuestionnaire({
          sender: 'agent',
          content: 'How would you describe your risk tolerance? Low, Medium, or High?',
          agentType: 'questionnaire'
        });
      }, 500);
    } 
    else if (lastAgentMessage.content.includes('risk tolerance')) {
      let riskTolerance: 'Low' | 'Medium' | 'High' = 'Medium';
      const normalizedInput = userInput.toLowerCase();
      
      if (normalizedInput.includes('low')) {
        riskTolerance = 'Low';
      } else if (normalizedInput.includes('high')) {
        riskTolerance = 'High';
      }
      
      setRetirementData(prev => ({ ...prev!, riskTolerance }));
      
      setTimeout(() => {
        addMessageToQuestionnaire({
          sender: 'agent',
          content: 'Finally, describe your desired retirement lifestyle in a few sentences.',
          agentType: 'questionnaire'
        });
      }, 500);
    } 
    else if (lastAgentMessage.content.includes('lifestyle')) {
      setRetirementData(prev => ({ ...prev!, desiredLifestyle: userInput }));
      
      // Add final summary response after the user describes their lifestyle
      setTimeout(() => {
        // Get years to retirement
        const yearsToRetirement = retirementData ? retirementData.retirementAge - retirementData.age : 0;
        
        addMessageToQuestionnaire({
          sender: 'agent',
          content: `Thank you for sharing your retirement goals with me! Based on your inputs, I've created a personalized retirement plan:
          
- Current age: ${retirementData?.age}
- Planning to retire at: ${retirementData?.retirementAge} (in ${yearsToRetirement} years)
- Current savings: $${retirementData?.currentSavings.toLocaleString()}
- Annual income: $${retirementData?.annualIncome.toLocaleString()}
- Risk tolerance: ${retirementData?.riskTolerance}
- Lifestyle goals: ${userInput}

I've generated three portfolio options tailored to your situation. Please navigate to the "Explore Options" tab to view and compare these portfolios. You can also use the other calculators to analyze specific aspects of your retirement plan, such as tax implications, Social Security benefits, and the impact of different contribution levels.`,
          agentType: 'questionnaire'
        });
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <IntegratedDemoHelper />
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {questionnaireChatThread.messages.map((message) => (
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
                <p className="text-sm whitespace-pre-line">{message.content}</p>
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
      
      <div className="border-t p-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your response..."
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
          This is a simulated AI assistant. In a production environment, this would be powered by Lyzr's Questionnaire Agent.
        </p>
      </div>

      <QuickQuestions standalone={false} />
    </div>
  );
};

export default PlanRetirement;