import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { User, ClaimData, ClaimType, ClaimStatus, ChatThread, Message } from '../types';

interface AppContextType {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  claimData: ClaimData | null;
  setClaimData: (data: ClaimData) => void;
  claimTypes: ClaimType[];
  chatThread: ChatThread;
  addMessageToChat: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  showWelcomeModal: boolean;
  setShowWelcomeModal: (show: boolean) => void;
  resetChat: () => void;
  uploadedDocuments: string[];
  setUploadedDocuments: (docs: string[]) => void;
  claimStatus: ClaimStatus;
  setClaimStatus: (status: ClaimStatus) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user] = useState<User>({ name: 'John Smith', policyNumber: 'ALZ-1234567' });
  const [activeTab, setActiveTab] = useState('start');
  const [claimData, setClaimData] = useState<ClaimData | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);
  const [claimStatus, setClaimStatus] = useState<ClaimStatus>('Not Started');
  const [claimTypes] = useState<ClaimType[]>([
    { id: 'annuity', name: 'Annuity Claim', description: 'File a claim on an annuity contract' },
    { id: 'life', name: 'Life Insurance Claim', description: 'Submit a death benefit claim' },
    { id: 'ltc', name: 'Long-Term Care Claim', description: 'Claim for long-term care benefits' },
    { id: 'disability', name: 'Disability Income Claim', description: 'Claim for disability benefits' }
  ]);
  const [chatThread, setChatThread] = useState<ChatThread>({
    id: 'main-chat-thread',
    messages: [],
  });
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);

  const addMessageToChat = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: new Date(),
    };
    
    setChatThread(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));

    // Simulate agent response if user sends a message
    if (message.sender === 'user') {
      // Display typing indicator
      setTimeout(() => {
        // Generate a contextual response based on active tab
        let responseContent = '';
        
        // Generate different responses based on which tab is active
        switch(activeTab) {
          case 'start':
            responseContent = "Thank you for the information. I can help you start the claims process for Allianz. Please select the policy type you're filing a claim against from the options provided.";
            break;
          case 'upload':
            responseContent = "Thank you for uploading your documents. Our system will verify these documents. Please ensure all required documents for your claim type have been uploaded to avoid processing delays.";
            break;
          case 'fill':
            responseContent = "I've reviewed the information you've provided. Please confirm the pre-filled details on the form and complete any missing fields to proceed with your claim submission.";
            break;
          case 'track':
            responseContent = "Your claim is currently being processed. You can check the status in real-time on this page. If you have any questions about the process, feel free to ask.";
            break;
          case 'contact':
            responseContent = "If you need immediate assistance, you can contact our claims team directly. Would you prefer to speak with someone by phone, email, or live chat?";
            break;
          default:
            responseContent = "Thank you for your message. How else can I assist you with your Allianz claim today?";
        }
        
        const agentResponse = {
          id: `msg-${Date.now() + 1}`,
          sender: 'agent',
          content: responseContent,
          timestamp: new Date(),
          agentType: 'claims-assistant'
        };
        
        setChatThread(prev => ({
          ...prev,
          messages: [...prev.messages, agentResponse],
        }));
      }, 1500);
    }
  }, [activeTab]);

  const resetChat = useCallback(() => {
    setChatThread({
      id: 'main-chat-thread',
      messages: [],
    });
    // Initialize with welcome message
    setTimeout(() => {
      addMessageToChat({
        sender: 'agent',
        content: "Hello! I'm your Allianz Claims Assistant. I can help you file a claim and guide you through the entire process. What type of policy are you filing a claim for?",
        agentType: 'claims-assistant'
      });
    }, 500);
  }, [addMessageToChat]);

  return (
    <AppContext.Provider
      value={{
        user,
        activeTab,
        setActiveTab,
        claimData,
        setClaimData,
        claimTypes,
        chatThread,
        addMessageToChat,
        showWelcomeModal,
        setShowWelcomeModal,
        resetChat,
        uploadedDocuments,
        setUploadedDocuments,
        claimStatus,
        setClaimStatus
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};