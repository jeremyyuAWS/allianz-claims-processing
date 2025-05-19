export type Mode = 'customer' | 'advisor';

export interface User {
  name: string;
  sessionId: string;
}

export interface RetirementData {
  age: number;
  retirementAge: number;
  currentSavings: number;
  annualIncome: number;
  riskTolerance: 'Low' | 'Medium' | 'High';
  desiredLifestyle: string;
}

export interface Portfolio {
  type: 'Aggressive' | 'Balanced' | 'Safe';
  projectedFund: number;
  annualWithdrawal: number;
  cagr: number;
  allocation: {
    stocks: number;
    bonds: number;
    reits: number;
    international: number;
    alternatives: number;
    cash: number;
  };
  description: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface Message {
  id: string;
  sender: 'user' | 'agent';
  content: string;
  timestamp: Date;
  agentType?: 'questionnaire' | 'recommender' | 'explainer' | 'editor';
}

export interface ChatThread {
  id: string;
  messages: Message[];
}