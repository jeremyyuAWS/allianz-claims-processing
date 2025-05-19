import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, ClaimData, ClaimType, ClaimStatus, ChatThread, Message, Document, DocumentType } from '../types';
import claimTypesData from '../data/claim_types.json';

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
  documents: Document[];
  setDocuments: (docs: Document[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user] = useState<User>({ name: 'John Smith', policyNumber: 'ALZ-1234567' });
  const [activeTab, setActiveTab] = useState('start');
  const [claimData, setClaimData] = useState<ClaimData | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);
  const [claimStatus, setClaimStatus] = useState<ClaimStatus>('Not Started');
  const [claimTypes] = useState<ClaimType[]>(claimTypesData);
  const [chatThread, setChatThread] = useState<ChatThread>({
    id: 'main-chat-thread',
    messages: [],
  });
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);

  // Monitor tab changes for a more cohesive workflow
  useEffect(() => {
    // Add contextual guidance when user navigates between tabs
    if (claimData) {
      switch(activeTab) {
        case 'upload':
          // Only show this guidance if we have claim data but no documents yet
          if (uploadedDocuments.length === 0) {
            setTimeout(() => {
              addMessageToChat({
                sender: 'agent',
                content: `Now that you've started your ${claimData.claimType} claim, please upload the required documents. Make sure each document is clear and complete.`,
                agentType: 'document-assistant'
              });
            }, 500);
          }
          break;
        case 'fill':
          if (uploadedDocuments.length > 0 && claimStatus === 'Not Started') {
            setTimeout(() => {
              addMessageToChat({
                sender: 'agent',
                content: `Thank you for uploading your documents. Now, let's complete the claim form. I'll guide you through each section.`,
                agentType: 'form-assistant'
              });
            }, 500);
          }
          break;
        case 'track':
          if (claimStatus !== 'Not Started') {
            setTimeout(() => {
              addMessageToChat({
                sender: 'agent',
                content: `You can track the progress of your claim here. The current status is "${claimStatus}". I'll notify you of any status changes or if additional information is needed.`,
                agentType: 'status-assistant'
              });
            }, 500);
          }
          break;
      }
    }
  }, [activeTab, claimData, uploadedDocuments, claimStatus]);

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
            responseContent = `Your claim is currently ${claimStatus}. You can check the status in real-time on this page. If you have any questions about the process, feel free to ask.`;
            break;
          case 'contact':
            responseContent = "If you need immediate assistance, you can contact our claims team directly. Would you prefer to speak with someone by phone, email, or live chat?";
            break;
          default:
            responseContent = "Thank you for your message. How else can I assist you with your Allianz claim today?";
        }
        
        // Try to detect if the message is a question and provide more relevant responses
        const userMessage = message.content.toLowerCase();
        if (userMessage.includes('how long') || userMessage.includes('time') || userMessage.includes('when')) {
          if (activeTab === 'track') {
            responseContent = `The processing time for a ${claimData?.claimType || 'claim'} is typically ${
              claimData?.policyType === 'life' ? '7-10' : 
              claimData?.policyType === 'ltc' ? '10-14' : 
              claimData?.policyType === 'annuity' ? '5-7' : '7-10'
            } business days. Your claim is currently ${claimStatus}, and we'll notify you of any updates.`;
          } else {
            responseContent = `Processing times vary by claim type. For a ${claimData?.claimType || 'claim'}, it typically takes ${
              claimData?.policyType === 'life' ? '7-10' : 
              claimData?.policyType === 'ltc' ? '10-14' : 
              claimData?.policyType === 'annuity' ? '5-7' : '7-10'
            } business days after we receive all required documentation.`;
          }
        } else if (userMessage.includes('document') || userMessage.includes('upload')) {
          responseContent = "Required documents depend on your claim type. For life insurance claims, you'll need a death certificate, completed claim form, and proof of identity. For annuity claims, you'll need a completed claim form and proof of identity. You can upload these in the 'Upload Documents' tab.";
        } else if (userMessage.includes('payment') || userMessage.includes('money')) {
          responseContent = "Once your claim is approved, you'll receive payment via your chosen method (direct deposit or check). Direct deposit is faster, typically processing within 1-3 business days after claim approval.";
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
  }, [activeTab, claimData, claimStatus]);

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
        setClaimStatus,
        documents,
        setDocuments
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