import { RetirementData, Portfolio } from '../types';

// This simulates the API call to the AI agent that would generate portfolios
export const generatePortfolios = (data: RetirementData): Portfolio[] => {
  const { age, retirementAge, currentSavings, annualIncome, riskTolerance } = data;
  
  // Simplified calculation for demo purposes
  const yearsToRetirement = retirementAge - age;
  
  // Different growth rates based on portfolio type
  const aggressive = {
    cagr: 0.08, // 8% annual growth
    stocksAllocation: 70,
    bondsAllocation: 15,
    reitsAllocation: 5,
    internationalAllocation: 5,
    alternativesAllocation: 5,
    cashAllocation: 0,
  };
  
  const balanced = {
    cagr: 0.06, // 6% annual growth
    stocksAllocation: 50,
    bondsAllocation: 30,
    reitsAllocation: 5,
    internationalAllocation: 5,
    alternativesAllocation: 5,
    cashAllocation: 5,
  };
  
  const safe = {
    cagr: 0.04, // 4% annual growth
    stocksAllocation: 30,
    bondsAllocation: 50,
    reitsAllocation: 5,
    internationalAllocation: 5,
    alternativesAllocation: 0,
    cashAllocation: 10,
  };
  
  // Calculate future value for each portfolio type
  const calculateFutureValue = (principal: number, rate: number, time: number): number => {
    // Future Value formula: FV = P(1 + r)^t
    return principal * Math.pow(1 + rate, time);
  };
  
  // Additional annual contributions (simplified as 15% of income)
  const annualContribution = annualIncome * 0.15;
  
  // Calculate future value with annual contributions
  const calculateFutureValueWithContributions = (
    principal: number,
    rate: number,
    time: number,
    annualContribution: number
  ): number => {
    let futureValue = principal;
    for (let i = 0; i < time; i++) {
      futureValue = futureValue * (1 + rate) + annualContribution;
    }
    return futureValue;
  };
  
  // Calculate the projected fund for each portfolio
  const aggressiveProjectedFund = calculateFutureValueWithContributions(
    currentSavings,
    aggressive.cagr,
    yearsToRetirement,
    annualContribution
  );
  
  const balancedProjectedFund = calculateFutureValueWithContributions(
    currentSavings,
    balanced.cagr,
    yearsToRetirement,
    annualContribution
  );
  
  const safeProjectedFund = calculateFutureValueWithContributions(
    currentSavings,
    safe.cagr,
    yearsToRetirement,
    annualContribution
  );
  
  // Calculate annual withdrawal (4% rule)
  const aggressiveAnnualWithdrawal = aggressiveProjectedFund * 0.04;
  const balancedAnnualWithdrawal = balancedProjectedFund * 0.04;
  const safeAnnualWithdrawal = safeProjectedFund * 0.04;
  
  return [
    {
      type: 'Aggressive',
      projectedFund: aggressiveProjectedFund,
      annualWithdrawal: aggressiveAnnualWithdrawal,
      cagr: aggressive.cagr,
      allocation: {
        stocks: aggressive.stocksAllocation,
        bonds: aggressive.bondsAllocation,
        reits: aggressive.reitsAllocation,
        international: aggressive.internationalAllocation,
        alternatives: aggressive.alternativesAllocation,
        cash: aggressive.cashAllocation,
      },
      description: 'This high-growth portfolio aims to maximize returns through a higher allocation to stocks and growth assets. While it may experience more volatility in the short-term, it offers the potential for greater long-term returns.',
      riskLevel: 'High',
      colorScheme: {
        primary: '#ef4444',
        secondary: '#f87171',
        accent: '#fca5a5',
      },
    },
    {
      type: 'Balanced',
      projectedFund: balancedProjectedFund,
      annualWithdrawal: balancedAnnualWithdrawal,
      cagr: balanced.cagr,
      allocation: {
        stocks: balanced.stocksAllocation,
        bonds: balanced.bondsAllocation,
        reits: balanced.reitsAllocation,
        international: balanced.internationalAllocation,
        alternatives: balanced.alternativesAllocation,
        cash: balanced.cashAllocation,
      },
      description: 'This balanced portfolio offers a mix of growth and stability, providing a moderate level of risk. It\'s designed to capture market growth while also providing some downside protection during market downturns.',
      riskLevel: 'Medium',
      colorScheme: {
        primary: '#3b82f6',
        secondary: '#60a5fa',
        accent: '#93c5fd',
      },
    },
    {
      type: 'Safe',
      projectedFund: safeProjectedFund,
      annualWithdrawal: safeAnnualWithdrawal,
      cagr: safe.cagr,
      allocation: {
        stocks: safe.stocksAllocation,
        bonds: safe.bondsAllocation,
        reits: safe.reitsAllocation,
        international: safe.internationalAllocation,
        alternatives: safe.alternativesAllocation,
        cash: safe.cashAllocation,
      },
      description: 'This conservative portfolio prioritizes capital preservation and income generation over growth. It offers more stability during market fluctuations but may provide lower long-term returns compared to more aggressive portfolios.',
      riskLevel: 'Low',
      colorScheme: {
        primary: '#10b981',
        secondary: '#34d399',
        accent: '#6ee7b7',
      },
    },
  ];
};

// Simulated questions flow for the questionnaire agent
export const questionnaireFlow = [
  "Hello! I'm your Retirement Planning AI Assistant. I'll help you create a personalized retirement plan. Let's start with some questions. What is your current age?",
  "Great! And at what age do you plan to retire?",
  "How much have you already saved for retirement?",
  "What is your current annual income?",
  "How would you describe your risk tolerance? Low, Medium, or High?",
  "Finally, describe your desired retirement lifestyle in a few sentences.",
  "Based on your inputs, I've created three retirement portfolio options for you. Please switch to the \"Explore Options\" tab to view them."
];

// Simulated answers to advisor portfolio customization
export const advisorResponses = [
  "I've adjusted the portfolio by reducing the stock allocation and increasing bonds as requested. This change lowers the overall risk profile while maintaining reasonable growth potential.",
  "I've increased the international exposure in this portfolio. This provides better geographic diversification and may help reduce overall portfolio volatility.",
  "I've added REIT exposure as requested. Real estate investment trusts can provide both income and potential growth, adding diversification benefits to the portfolio.",
  "I've optimized the portfolio for income generation by increasing the allocation to dividend-paying stocks and higher-yield bonds. This should provide more regular income during retirement.",
  "Based on your request, I've made the portfolio more tax-efficient by allocating more assets to tax-advantaged investments and reducing turnover in the taxable portions."
];