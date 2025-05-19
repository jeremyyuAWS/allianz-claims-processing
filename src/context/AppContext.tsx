import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Mode, User, RetirementData, Portfolio, ChatThread, Message } from '../types';
import { generatePortfolios } from '../data/mockData';
import { commonFollowUpQuestions, advisorResponses } from '../data/demoData';

interface AppContextType {
  mode: Mode;
  setMode: (mode: Mode) => void;
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  retirementData: RetirementData | null;
  setRetirementData: (data: RetirementData) => void;
  portfolios: Portfolio[];
  setPortfolios: (portfolios: Portfolio[]) => void;
  questionnaireChatThread: ChatThread;
  addMessageToQuestionnaire: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  showWelcomeModal: boolean;
  setShowWelcomeModal: (show: boolean) => void;
  resetQuestionnaire: () => void;
  selectedPortfolio: Portfolio | null;
  setSelectedPortfolio: (portfolio: Portfolio | null) => void;
  advisorChats: Record<string, ChatThread>;
  addMessageToAdvisorChat: (portfolioType: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
}

const defaultRetirementData: RetirementData = {
  age: 35,
  retirementAge: 65,
  currentSavings: 150000,
  annualIncome: 90000,
  riskTolerance: 'Medium',
  desiredLifestyle: ''
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<Mode>('customer');
  const [user] = useState<User>({ name: 'John Smith', sessionId: 'user-123456' });
  const [activeTab, setActiveTab] = useState('plan');
  const [retirementData, setRetirementData] = useState<RetirementData | null>(null);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [questionnaireChatThread, setQuestionnaireChatThread] = useState<ChatThread>({
    id: 'questionnaire-thread',
    messages: [],
  });
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [advisorChats, setAdvisorChats] = useState<Record<string, ChatThread>>({
    'Aggressive': { id: 'advisor-aggressive', messages: [] },
    'Balanced': { id: 'advisor-balanced', messages: [] },
    'Safe': { id: 'advisor-safe', messages: [] },
  });

  const addMessageToQuestionnaire = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: new Date(),
    };
    
    setQuestionnaireChatThread(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));

    // If this is the last user message and we have all the data, generate portfolios
    if (message.sender === 'user' && retirementData?.desiredLifestyle) {
      setTimeout(() => {
        const generatedPortfolios = generatePortfolios(retirementData);
        setPortfolios(generatedPortfolios);
        
        const finalMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'agent',
          content: 'Based on your inputs, I\'ve created three retirement portfolio options for you. Please switch to the "Explore Options" tab to view them.',
          timestamp: new Date(),
          agentType: 'questionnaire',
        };
        
        setQuestionnaireChatThread(prev => ({
          ...prev,
          messages: [...prev.messages, finalMessage],
        }));
        
        setActiveTab('explore');
      }, 1500);
    } else if (message.sender === 'user') {
      // For demonstration purposes, add follow-up response to general questions
      setTimeout(() => {
        // Check if the message might be a question
        if (message.content.endsWith('?') || message.content.toLowerCase().includes('how') || message.content.toLowerCase().includes('what') || message.content.toLowerCase().includes('why')) {
          // Find if we have a prepared answer
          const questionLower = message.content.toLowerCase();
          const matchedQuestion = commonFollowUpQuestions.find(q => 
            questionLower.includes(q.question.toLowerCase().replace('?', ''))
          );
          
          if (matchedQuestion) {
            const responseMessage = {
              id: `msg-${Date.now() + 1}`,
              sender: 'agent',
              content: matchedQuestion.answer,
              timestamp: new Date(),
              agentType: 'questionnaire',
            };
            
            setQuestionnaireChatThread(prev => ({
              ...prev,
              messages: [...prev.messages, responseMessage],
            }));
          } else {
            // Generate a more contextual response based on keywords
            let responseContent = "That's a great question about retirement planning. In a production environment, I would provide a detailed, personalized answer based on your specific situation and the latest financial research.";
            
            if (questionLower.includes('portfolio') || questionLower.includes('invest')) {
              responseContent = "Based on your retirement goals and risk tolerance, I've recommended a diversified portfolio across different asset classes. Each portfolio option provides a different balance of risk and potential return, aligned with your time horizon to retirement.";
            } else if (questionLower.includes('withdraw') || questionLower.includes('income')) {
              responseContent = "Your withdrawal strategy in retirement should balance providing sufficient income while ensuring your savings last. The 4% rule is a common starting point, suggesting you can withdraw 4% of your initial portfolio value annually, adjusted for inflation, with a high probability of your money lasting 30 years.";
            } else if (questionLower.includes('tax') || questionLower.includes('roth')) {
              responseContent = "Tax planning is a crucial component of retirement strategy. Consider using tax-advantaged accounts like 401(k)s and IRAs. Whether to use traditional (tax-deferred) or Roth (tax-free growth) accounts depends on your current tax bracket versus your expected retirement tax bracket.";
            }
            
            const responseMessage = {
              id: `msg-${Date.now() + 1}`,
              sender: 'agent',
              content: responseContent,
              timestamp: new Date(),
              agentType: 'questionnaire',
            };
            
            setQuestionnaireChatThread(prev => ({
              ...prev,
              messages: [...prev.messages, responseMessage],
            }));
          }
        }
      }, 1000);
    }
  }, [retirementData, setActiveTab]);

  const addMessageToAdvisorChat = useCallback((portfolioType: string, message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: new Date(),
    };
    
    setAdvisorChats(prev => ({
      ...prev,
      [portfolioType]: {
        ...prev[portfolioType],
        messages: [...prev[portfolioType].messages, newMessage],
      }
    }));

    // Simulate AI response for advisor
    if (message.sender === 'user') {
      setAdvisorChats(prev => ({
        ...prev,
        [portfolioType]: {
          ...prev[portfolioType],
          typing: true
        }
      }));
      
      setTimeout(() => {
        // Get a random predefined response or generate a contextual one
        let responseContent = advisorResponses[Math.floor(Math.random() * advisorResponses.length)];
        
        // Try to make the response more contextual based on user input
        const userInput = message.content.toLowerCase();
        
        if (userInput.includes('stock') || userInput.includes('equit')) {
          responseContent = `I've adjusted the stock allocation as requested. This changes the risk/return profile of the portfolio while maintaining diversification across asset classes. The updated allocation should better align with your investment strategy.`;
        } else if (userInput.includes('bond')) {
          responseContent = `I've modified the bond allocation as requested. This affects the income and stability characteristics of the portfolio. The new allocation provides a better balance between growth potential and capital preservation.`;
        } else if (userInput.includes('international') || userInput.includes('global')) {
          responseContent = `I've adjusted the international exposure as requested. This changes the portfolio's geographic diversification and currency exposure, which can help reduce correlation with domestic markets and potentially improve risk-adjusted returns.`;
        } else if (userInput.includes('reit') || userInput.includes('real estate')) {
          responseContent = `I've modified the REIT allocation as requested. This affects the portfolio's exposure to real estate markets and potential inflation protection. REITs typically provide both income and growth potential with relatively low correlation to stocks and bonds.`;
        } else if (userInput.includes('risk') || userInput.includes('conservative') || userInput.includes('aggressive')) {
          responseContent = `I've adjusted the overall risk profile of the portfolio as requested. This impacts the expected volatility and long-term returns. The new allocation better aligns with the client's risk tolerance while maintaining appropriate diversification.`;
        }
        
        const aiResponse = {
          id: `msg-${Date.now() + 1}`,
          sender: 'agent',
          content: responseContent,
          timestamp: new Date(),
          agentType: 'editor',
        };
        
        setAdvisorChats(prev => ({
          ...prev,
          [portfolioType]: {
            ...prev[portfolioType],
            messages: [...prev[portfolioType].messages, aiResponse],
            typing: false
          }
        }));

        // Update portfolio allocation (simulated)
        setPortfolios(prev => 
          prev.map(p => {
            if (p.type === portfolioType) {
              // Create more realistic changes based on the user input
              let newStocks = p.allocation.stocks;
              let newBonds = p.allocation.bonds;
              let newReits = p.allocation.reits;
              let newInternational = p.allocation.international;
              let newAlternatives = p.allocation.alternatives;
              let newCash = p.allocation.cash;
              
              if (userInput.includes('stock')) {
                if (userInput.includes('increase') || userInput.includes('more') || userInput.includes('higher')) {
                  const increaseAmount = userInput.match(/\d+/) ? parseInt(userInput.match(/\d+/)?.[0] || '10') : 10;
                  newStocks = Math.min(100, p.allocation.stocks + increaseAmount);
                  // Reduce others proportionally
                  const totalReduction = increaseAmount;
                  const totalOther = newBonds + newReits + newInternational + newAlternatives + newCash;
                  const reductionFactor = totalOther > 0 ? totalReduction / totalOther : 0;
                  
                  newBonds = Math.max(0, newBonds - (newBonds * reductionFactor));
                  newReits = Math.max(0, newReits - (newReits * reductionFactor));
                  newInternational = Math.max(0, newInternational - (newInternational * reductionFactor));
                  newAlternatives = Math.max(0, newAlternatives - (newAlternatives * reductionFactor));
                  newCash = Math.max(0, newCash - (newCash * reductionFactor));
                } else if (userInput.includes('decrease') || userInput.includes('less') || userInput.includes('lower') || userInput.includes('reduce')) {
                  const decreaseAmount = userInput.match(/\d+/) ? parseInt(userInput.match(/\d+/)?.[0] || '10') : 10;
                  newStocks = Math.max(0, p.allocation.stocks - decreaseAmount);
                  // Increase bonds primarily
                  newBonds = Math.min(100, newBonds + decreaseAmount * 0.7);
                  newCash = Math.min(100, newCash + decreaseAmount * 0.3);
                }
              } else if (userInput.includes('conservative') || userInput.includes('safe')) {
                // Make portfolio more conservative
                const adjustAmount = 15;
                newStocks = Math.max(0, p.allocation.stocks - adjustAmount);
                newBonds = Math.min(100, p.allocation.bonds + adjustAmount * 0.7);
                newCash = Math.min(100, p.allocation.cash + adjustAmount * 0.3);
              } else if (userInput.includes('aggressive') || userInput.includes('growth')) {
                // Make portfolio more aggressive
                const adjustAmount = 15;
                newStocks = Math.min(100, p.allocation.stocks + adjustAmount * 0.6);
                newInternational = Math.min(100, p.allocation.international + adjustAmount * 0.3);
                newAlternatives = Math.min(100, p.allocation.alternatives + adjustAmount * 0.1);
                
                // Reduce bonds and cash
                const totalReduction = adjustAmount;
                newBonds = Math.max(0, p.allocation.bonds - (totalReduction * 0.7));
                newCash = Math.max(0, p.allocation.cash - (totalReduction * 0.3));
              } else if (userInput.includes('international')) {
                if (userInput.includes('increase') || userInput.includes('more')) {
                  const adjustAmount = 5;
                  newInternational = Math.min(100, p.allocation.international + adjustAmount);
                  newStocks = Math.max(0, p.allocation.stocks - adjustAmount);
                } else {
                  const adjustAmount = 5;
                  newInternational = Math.max(0, p.allocation.international - adjustAmount);
                  newStocks = Math.min(100, p.allocation.stocks + adjustAmount);
                }
              } else {
                // Make some random small adjustments
                newStocks = Math.max(0, Math.min(100, p.allocation.stocks + (Math.random() * 6 - 3)));
                newBonds = Math.max(0, Math.min(100, p.allocation.bonds + (Math.random() * 6 - 3)));
                newReits = Math.max(0, Math.min(100, p.allocation.reits + (Math.random() * 4 - 2)));
                newInternational = Math.max(0, Math.min(100, p.allocation.international + (Math.random() * 4 - 2)));
                newAlternatives = Math.max(0, Math.min(100, p.allocation.alternatives + (Math.random() * 4 - 2)));
                newCash = Math.max(0, Math.min(100, p.allocation.cash + (Math.random() * 4 - 2)));
              }
              
              // Ensure total is 100%
              const total = newStocks + newBonds + newReits + newInternational + newAlternatives + newCash;
              const adjustmentFactor = 100 / total;
              
              return { 
                ...p, 
                allocation: { 
                  stocks: Math.round(newStocks * adjustmentFactor),
                  bonds: Math.round(newBonds * adjustmentFactor),
                  reits: Math.round(newReits * adjustmentFactor),
                  international: Math.round(newInternational * adjustmentFactor),
                  alternatives: Math.round(newAlternatives * adjustmentFactor),
                  cash: Math.round(newCash * adjustmentFactor),
                },
                // Adjust the CAGR based on the new allocation
                cagr: p.cagr * (1 + (newStocks / p.allocation.stocks - 1) * 0.1),
                // Adjust risk level
                riskLevel: newStocks > 60 ? 'High' : newStocks < 40 ? 'Low' : 'Medium',
              }
            } else {
              return p;
            }
          })
        );
      }, 1500);
    }
  }, []);

  const resetQuestionnaire = useCallback(() => {
    setQuestionnaireChatThread({
      id: 'questionnaire-thread',
      messages: [],
    });
    setRetirementData({...defaultRetirementData, desiredLifestyle: ''});
  }, []);

  // This effect watches for changes to retirementData and generates portfolios
  React.useEffect(() => {
    if (retirementData && retirementData.desiredLifestyle) {
      const generatedPortfolios = generatePortfolios(retirementData);
      setPortfolios(generatedPortfolios);
    }
  }, [retirementData]);

  return (
    <AppContext.Provider
      value={{
        mode,
        setMode,
        user,
        activeTab,
        setActiveTab,
        retirementData,
        setRetirementData,
        portfolios,
        setPortfolios,
        questionnaireChatThread,
        addMessageToQuestionnaire,
        showWelcomeModal,
        setShowWelcomeModal,
        resetQuestionnaire,
        selectedPortfolio,
        setSelectedPortfolio,
        advisorChats,
        addMessageToAdvisorChat,
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