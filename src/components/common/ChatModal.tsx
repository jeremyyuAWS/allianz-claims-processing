import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Send, X, Bot, User, Minimize2, Maximize2, Paperclip, Info, FileText } from 'lucide-react';
import faqAnswers from '../../data/faq_answers.json';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose }) => {
  const { chatThread, addMessageToChat, activeTab, claimData, claimStatus, documents } = useAppContext();
  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change or modal opens
    if (messagesEndRef.current && isOpen && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatThread.messages, isOpen, isMinimized]);

  // Generate tab-specific suggested questions
  useEffect(() => {
    if (isOpen) {
      // Generate different suggestions based on the active tab
      let questions: string[] = [];
      
      switch (activeTab) {
        case 'start':
          questions = [
            "What documents do I need for my claim?",
            "How long does the claims process take?", 
            "Can someone else file a claim on my behalf?",
            "Is there a deadline for filing a claim?"
          ];
          break;
        case 'upload':
          questions = [
            "What file formats do you accept?",
            "Do I need to upload original documents?",
            "Why was my document rejected?",
            "Can I upload more than one document at a time?"
          ];
          break;
        case 'fill':
          questions = [
            "What if I don't have all the information?",
            "How do I get my routing number?",
            "How will I receive my payment?",
            "Can I save my form and finish later?"
          ];
          break;
        case 'track':
          questions = [
            "Why is my claim taking so long?",
            "What does 'Additional Info Required' mean?",
            "When will I receive my payment?",
            "How can I appeal a denied claim?"
          ];
          break;
        case 'contact':
          questions = [
            "What are your customer service hours?",
            "Can I speak with a supervisor?",
            "How long will it take to get a callback?",
            "Do you have weekend support hours?"
          ];
          break;
        default:
          questions = [
            "How can I check the status of my claim?",
            "What documents do I need to submit?",
            "How long does it take to process a claim?",
            "How will I receive my payment?"
          ];
      }
      
      setSuggestedQuestions(questions);
    }
  }, [isOpen, activeTab]);

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
    setIsTyping(true);
    
    // Find matching FAQ if any
    const faqMatch = faqAnswers.find(faq => 
      faq.question.toLowerCase().includes(input.toLowerCase()) ||
      input.toLowerCase().includes(faq.question.toLowerCase())
    );
    
    // Simulate agent thinking
    setTimeout(() => {
      let responseContent = '';
      
      // If we have a matching FAQ, use that
      if (faqMatch) {
        responseContent = faqMatch.answer;
      } else {
        // Generate context-aware response based on input and tab
        responseContent = generateContextAwareResponse(input);
      }
      
      addMessageToChat({
        sender: 'agent',
        content: responseContent,
        agentType: getAgentType()
      });
      
      setIsTyping(false);
      
      // Update suggested questions based on the conversation
      updateSuggestedQuestions(input);
    }, 1500);
  };
  
  const handleSuggestedQuestionClick = (question: string) => {
    // Set the input to the question
    setInput(question);
    
    // Submit after a short delay to show the input change
    setTimeout(() => {
      addMessageToChat({
        sender: 'user',
        content: question,
      });
      
      setInput('');
      setIsTyping(true);
      
      // Find matching FAQ
      const faqMatch = faqAnswers.find(faq => 
        faq.question.toLowerCase().includes(question.toLowerCase())
      );
      
      // Generate response after delay
      setTimeout(() => {
        let responseContent = '';
        
        if (faqMatch) {
          responseContent = faqMatch.answer;
        } else {
          responseContent = generateContextAwareResponse(question);
        }
        
        addMessageToChat({
          sender: 'agent',
          content: responseContent,
          agentType: getAgentType()
        });
        
        setIsTyping(false);
        // Update suggested questions
        updateSuggestedQuestions(question);
      }, 1500);
    }, 100);
  };
  
  // Update suggested questions based on conversation
  const updateSuggestedQuestions = (lastMessage: string) => {
    const lowerMessage = lastMessage.toLowerCase();
    let newQuestions: string[] = [];
    
    // If message mentions documents
    if (lowerMessage.includes('document') || lowerMessage.includes('upload')) {
      newQuestions = [
        "What documents do I need for my claim?",
        "How long will document verification take?", 
        "Can I submit additional documents later?",
        "Do you need original documents or copies?"
      ];
    }
    // If message mentions payment
    else if (lowerMessage.includes('payment') || lowerMessage.includes('money') || lowerMessage.includes('check') || lowerMessage.includes('deposit')) {
      newQuestions = [
        "How will I receive my payment?",
        "How long after approval will I get paid?",
        "Can I change my payment method?",
        "Are there taxes on my claim payment?"
      ];
    }
    // If message mentions status or time
    else if (lowerMessage.includes('status') || lowerMessage.includes('time') || lowerMessage.includes('long') || lowerMessage.includes('when')) {
      newQuestions = [
        "Why is my claim taking so long?",
        "What's the average processing time?",
        "Will I be notified of status changes?",
        "Can I escalate my claim if it's delayed?"
      ];
    }
    // Default follow-up questions
    else {
      const baseQuestions = [
        "What happens next in the process?",
        "How can I contact a claims representative?",
        "What if I need to make changes to my claim?",
        "How will I be notified of updates?"
      ];
      
      // Add some context-aware questions based on the active tab
      if (activeTab === 'track' && claimStatus === 'Additional Info Required') {
        baseQuestions.push("What additional information do you need?");
        baseQuestions.push("How do I submit the required documents?");
      } else if (activeTab === 'fill') {
        baseQuestions.push("What happens if I don't complete all fields?");
        baseQuestions.push("Can I save my progress and return later?");
      }
      
      newQuestions = baseQuestions;
    }
    
    setSuggestedQuestions(newQuestions);
  };
  
  // Get agent type based on active tab
  const getAgentType = () => {
    switch (activeTab) {
      case 'start':
        return 'claims-assistant';
      case 'upload':
        return 'document-assistant';
      case 'fill':
        return 'form-assistant';
      case 'track':
        return 'status-assistant';
      case 'contact':
        return 'escalation-assistant';
      default:
        return 'claims-assistant';
    }
  };
  
  // Generate context-aware response based on user input and current app state
  const generateContextAwareResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    // First, check if the input contains common question patterns
    if (input.includes('how long') || input.includes('when') || input.includes('time')) {
      if (claimData?.policyType) {
        const processingTime = claimData.policyType === 'life' 
          ? '7-10 business days' 
          : claimData.policyType === 'ltc' 
          ? '10-14 business days' 
          : claimData.policyType === 'annuity'
          ? '5-7 business days'
          : '7-10 business days';
          
        return `For a ${claimData.claimType}, the typical processing time is ${processingTime} after we receive all required documentation. ${
          claimStatus ? `Your claim is currently ${claimStatus}.` : ''
        }`;
      } else {
        return "Processing times vary by claim type. Life insurance claims typically take 7-10 business days, annuity claims 5-7 business days, and long-term care claims 10-14 business days after we receive all required documentation.";
      }
    }
    
    // Status-related questions
    if (input.includes('status') || input.includes('update') || input.includes('progress')) {
      if (claimStatus && claimStatus !== 'Not Started') {
        return `Your claim is currently in the "${claimStatus}" stage. ${
          claimStatus === 'In Review' 
            ? 'Our claims team is reviewing your submission and verifying the information provided.'
            : claimStatus === 'Additional Info Required'
            ? 'We need some additional documentation to continue processing your claim. Please check the Track Claim Status tab for details.'
            : claimStatus === 'Approved'
            ? 'Your claim has been approved! We\'re now processing payment according to your selected method.'
            : claimStatus === 'Paid'
            ? 'Your claim payment has been processed. You should receive it shortly via your selected payment method.'
            : claimStatus === 'Denied'
            ? 'Unfortunately, your claim has been denied. Please contact our support team to discuss the reason and potential next steps.'
            : 'You can monitor updates in real-time on the Track Claim Status tab.'
        }`;
      } else {
        return "You'll be able to track your claim status once you've submitted your claim form. The Track Claim Status tab will provide real-time updates on your claim's progress.";
      }
    }
    
    // Document-related questions
    if (input.includes('document') || input.includes('upload') || input.includes('file')) {
      if (documents && documents.length > 0) {
        const verifiedCount = documents.filter(d => d.status === 'Verified').length;
        return `You've uploaded ${documents.length} document${documents.length !== 1 ? 's' : ''}, and ${verifiedCount} ${verifiedCount !== 1 ? 'have' : 'has'} been verified. ${
          claimData?.policyType
            ? `For a ${claimData.claimType}, you'll need to provide ${
                claimData.policyType === 'life' 
                ? 'a death certificate, completed claim form, and proof of identity' 
                : claimData.policyType === 'ltc' 
                ? 'medical records, a completed claim form, and proof of identity' 
                : 'a completed claim form and proof of identity'
              }.`
            : 'Please make sure all required documents are uploaded before submitting your claim.'
        }`;
      } else {
        return "You'll need to upload supporting documentation for your claim. The specific documents required depend on your claim type, but typically include a completed claim form and identification. For life insurance claims, you'll also need a death certificate.";
      }
    }
    
    // Payment-related questions
    if (input.includes('payment') || input.includes('money') || input.includes('check') || input.includes('deposit')) {
      return "You can choose to receive payment via direct deposit or check. Direct deposit is faster and more secure, typically processing within 1-3 business days after claim approval. Checks may take 7-10 business days to arrive by mail.";
    }
    
    // Tab-specific default responses
    switch(activeTab) {
      case 'start':
        return "To start your claim, select the type of policy you're filing a claim for from the options provided. Once you've selected the policy type and provided a reason for the claim, you'll be guided through the next steps of the process.";
      
      case 'upload':
        return "Please upload all required documents for your claim. Make sure they're clear, complete, and in one of the supported formats (PDF, JPG, or PNG). Each file must be under 10MB in size.";
      
      case 'fill':
        return "Complete all required fields in the claim form. If you're unsure about any field, you can hover over the label for more information or ask me for assistance. Your progress is automatically saved as you type.";
      
      case 'track':
        return `You can track the status of your claim on this page. The current status is "${claimStatus}". You'll receive notifications when there are updates to your claim.`;
      
      case 'contact':
        return "You can contact our claims team via phone, email, or live chat. Our representatives are available Monday through Friday, 8 AM to 8 PM Eastern Time. For urgent matters outside of business hours, please call our 24/7 emergency line.";
      
      default:
        return "I'm here to help you with your claim. Feel free to ask any questions about the claims process, required documentation, or next steps.";
    }
  };

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div 
        className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg z-50 border border-blue-200 p-3 cursor-pointer transition-all duration-300 hover:shadow-xl"
        onClick={() => setIsMinimized(false)}
      >
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
      
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col h-[600px] sm:h-[700px] relative overflow-hidden z-50 animate-fade-in">
        {/* Header */}
        <div className="px-4 py-3 bg-blue-600 flex justify-between items-center text-white">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <h3 className="font-medium">{getAgentTitle()}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setIsMinimized(true)} 
              className="p-1 hover:bg-blue-700 rounded transition-colors"
              aria-label="Minimize chat"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
            <button 
              onClick={onClose} 
              className="p-1 hover:bg-blue-700 rounded transition-colors"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Context Info */}
        {claimData && (
          <div className="bg-blue-50 px-4 py-2 border-b border-blue-100">
            <div className="flex items-center text-xs text-blue-700">
              <Info className="h-3.5 w-3.5 mr-1.5" />
              <span>
                Discussing: {claimData.claimType} • Policy #{claimData.policyNumber} • 
                Status: <span className="font-medium">{claimStatus}</span>
              </span>
            </div>
          </div>
        )}
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatThread.messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-2.5 ${
                message.sender === 'user' ? 'justify-end' : ''
              } animate-fade-in`}
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
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-start gap-2.5 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
              <div className="bg-gray-100 px-4 py-2 rounded-lg rounded-tl-none inline-block">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Suggested Questions */}
        {suggestedQuestions.length > 0 && !isTyping && (
          <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.slice(0, 3).map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestionClick(question)}
                  className="text-xs bg-white border border-gray-300 rounded-full px-3 py-1 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex items-center space-x-2">
            <button className="text-gray-400 hover:text-gray-500">
              <Paperclip className="h-5 w-5" />
            </button>
            <input
              type="text"
              className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your message here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              className={`rounded-full p-2 transition-colors ${
                input.trim() 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              onClick={handleSendMessage}
              disabled={!input.trim()}
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