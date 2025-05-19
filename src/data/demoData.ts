import { RetirementData } from '../types';

// Sample user profiles for demo purposes
export const sampleUserProfiles = [
  {
    name: 'John Smith',
    age: 35,
    retirementAge: 65,
    currentSavings: 150000,
    annualIncome: 90000,
    riskTolerance: 'Medium' as const,
    desiredLifestyle: 'I want to travel a few months each year and maintain my current standard of living. I\'d like to have a small vacation home somewhere warm.'
  },
  {
    name: 'Sarah Johnson',
    age: 42,
    retirementAge: 67,
    currentSavings: 320000,
    annualIncome: 125000,
    riskTolerance: 'High' as const,
    desiredLifestyle: 'I plan to downsize my home but want to travel extensively. I\'d like to spend time with grandchildren and pursue my passion for photography.'
  },
  {
    name: 'Michael Rodriguez',
    age: 29,
    retirementAge: 60,
    currentSavings: 85000,
    annualIncome: 75000,
    riskTolerance: 'High' as const,
    desiredLifestyle: 'I want to retire early and pursue entrepreneurial projects. I\'m willing to live frugally now for financial independence later.'
  },
  {
    name: 'Emily Chang',
    age: 52,
    retirementAge: 69,
    currentSavings: 650000,
    annualIncome: 180000,
    riskTolerance: 'Low' as const,
    desiredLifestyle: 'I\'m looking for a secure retirement with predictable income. Healthcare costs are a priority, and I\'d like to leave inheritance for my children.'
  },
  {
    name: 'Robert Wilson',
    age: 60,
    retirementAge: 67,
    currentSavings: 950000,
    annualIncome: 140000,
    riskTolerance: 'Medium' as const,
    desiredLifestyle: 'I\'m approaching retirement and want to ensure my savings last through my lifetime. I plan to travel moderately and enjoy hobbies.'
  }
];

// Prewritten questions for customer questionnaire
export const questionnaireResponses = {
  age: [
    '35',
    '42',
    '29',
    '52',
    '60'
  ],
  retirementAge: [
    '65',
    '67',
    '60',
    '69',
    '67'
  ],
  currentSavings: [
    '150000',
    '320000',
    '85000',
    '650000',
    '950000'
  ],
  annualIncome: [
    '90000',
    '125000',
    '75000',
    '180000',
    '140000'
  ],
  riskTolerance: [
    'I\'d say medium, I can handle some ups and downs',
    'High, I want maximum growth and can tolerate volatility',
    'High. I have time to recover from market downturns',
    'Low. I\'m getting closer to retirement and want stability',
    'Medium - I\'m cautious but want decent returns'
  ],
  desiredLifestyle: [
    'I want to travel a few months each year and maintain my current standard of living. I\'d like to have a small vacation home somewhere warm.',
    'I plan to downsize my home but want to travel extensively. I\'d like to spend time with grandchildren and pursue my passion for photography.',
    'I want to retire early and pursue entrepreneurial projects. I\'m willing to live frugally now for financial independence later.',
    'I\'m looking for a secure retirement with predictable income. Healthcare costs are a priority, and I\'d like to leave inheritance for my children.',
    'I\'m approaching retirement and want to ensure my savings last through my lifetime. I plan to travel moderately and enjoy hobbies.'
  ]
};

// Questions for portfolio exploration tab - related to investment strategy and portfolios
export const portfolioQuestions = [
  'How does this balanced portfolio perform during high inflation?',
  'What would happen to my aggressive portfolio in a major market correction?',
  'How much international exposure should I have in my portfolio at my age?',
  'Should I adjust my allocation as I get closer to retirement?',
  'What is the difference between passive and active investment strategies?',
  'How does this portfolio account for sequence of returns risk?',
  'What is a good rebalancing strategy for my portfolio?',
  'How do REITs perform in different economic environments?',
  'Should I be concerned about interest rate changes with this allocation?',
  'How does dollar-cost averaging work with this portfolio strategy?'
];

// Advisor customization requests - focused on portfolio adjustments
export const advisorRequests = [
  'Add more dividend-focused investments for income generation',
  'Reduce U.S. large cap exposure and increase international allocation',
  'Add Treasury Inflation-Protected Securities to hedge against inflation',
  'Lower the overall volatility while maintaining similar expected returns',
  'Incorporate more ESG investments in this portfolio',
  'Optimize this portfolio for tax-efficiency in retirement',
  'Split the equity allocation more evenly between growth and value',
  'Add some allocation to commodities for inflation protection',
  'Increase bond duration to take advantage of higher interest rates',
  'Incorporate a barbell strategy with focus on quality and small caps'
];

// Sample advisor responses to customization requests
export const advisorResponses = [
  'I\'ve increased the stock allocation by 10% and reduced bonds accordingly. This increases the expected return but also the volatility of the portfolio.',
  'I\'ve added more international exposure to reduce correlation with US markets. This should provide better diversification benefits during market stress.',
  'I\'ve made this portfolio more conservative by reducing equity exposure and increasing bonds and cash. This should reduce volatility as the client approaches retirement.',
  'I\'ve adjusted the portfolio for higher inflation expectations by adding REIT exposure and inflation-protected securities. These asset classes have historically provided better inflation protection.',
  'I\'ve optimized the portfolio for tax efficiency by allocating to municipal bonds in taxable accounts and keeping high-turnover strategies in tax-advantaged accounts.',
  'I\'ve increased allocation to dividend-focused equities and REITs to enhance income generation while maintaining growth potential.',
  'I\'ve reduced small cap exposure and added more large established companies. This should reduce volatility while still providing good growth potential.',
  'I\'ve increased the bond duration component which should provide higher yield, though with more interest rate sensitivity.',
  'I\'ve shifted the portfolio to include more ESG-focused funds that align with environmental, social, and governance considerations while maintaining similar risk/return characteristics.',
  'I\'ve added a 5% allocation to alternative investments like commodities and absolute return strategies to improve diversification.'
];

// Demo questions for tax implications calculator - focused on tax planning
export const taxQuestions = [
  'What is the difference between marginal and effective tax rates in retirement?',
  'How should I allocate assets between Roth and Traditional accounts?',
  'What are the tax implications of Roth conversions during early retirement?',
  'How do Required Minimum Distributions affect my retirement tax planning?',
  'Can I reduce taxes by timing my Social Security with IRA withdrawals?',
  'What tax bracket should I expect to be in during retirement?',
  'How are capital gains taxed differently in retirement?',
  'Would a Qualified Charitable Distribution help reduce my tax burden?',
  'How do state taxes factor into my retirement tax planning?',
  'What healthcare tax credits might I qualify for in retirement?'
];

// Demo questions for Social Security estimator - focused on benefits and claiming strategies
export const socialSecurityQuestions = [
  'How much will my benefit increase if I wait until age 70 to claim?',
  'What is the break-even age for delaying Social Security benefits?',
  'How are my benefits calculated if I have a government pension?',
  'Will working part-time in retirement reduce my Social Security benefits?',
  'How are spousal benefits calculated compared to my own record?',
  'What happens to Social Security benefits when a spouse passes away?',
  'How much of my Social Security benefits will be taxable?',
  'Can I claim Social Security and still contribute to retirement accounts?',
  'How does early retirement affect my Social Security calculation?',
  'Should I take Social Security early and invest it instead of waiting?'
];

// Questions related to monthly contribution calculator - focused on savings strategies
export const contributionQuestions = [
  'How would increasing my savings rate by 3% affect my retirement outcome?',
  'What if I front-load my contributions earlier in the year?',
  'Should I prioritize paying down debt or increasing retirement contributions?',
  'How much more should I save if I want to retire 5 years earlier?',
  'What is the impact of contributing to a Roth vs Traditional account at my income level?',
  'How much of a company match am I leaving on the table with my current contribution?',
  'What is a catch-up contribution and when can I start making them?',
  'How should I adjust contributions if I expect a significant income increase?',
  'Is there a point where contributing more has diminishing returns?',
  'How do backdoor Roth contributions work for higher income earners?'
];

// Questions about ETF recommendations - focused on specific investment vehicles
export const etfQuestions = [
  'Which bond ETFs perform best in a rising interest rate environment?',
  'What is the difference between VOO and VTI for U.S. equity exposure?',
  'How do sector ETFs fit within a diversified retirement portfolio?',
  'Which international ETFs are best for emerging market exposure?',
  'How do dividend ETFs compare to growth ETFs for retirement income?',
  'What are the tax efficiency differences between ETFs and mutual funds?',
  'How should I evaluate ETF expense ratios versus performance?',
  'Are actively managed ETFs worth the higher expense ratios?',
  'Which ETFs provide the best inflation protection in retirement?',
  'How do bond ladder ETFs work for retirement income planning?'
];

// Questions related to cost of delay calculator - focused on retirement timing
export const delayQuestions = [
  'How would delaying retirement by 3 years change my monthly income?',
  'What is the impact on my portfolio if I start taking Social Security at 62 vs 70?',
  'How much more would I need to save to retire 5 years earlier than planned?',
  'Would a phased retirement approach improve my long-term financial security?',
  'How do healthcare costs factor into the optimal retirement timing?',
  'What is the financial impact of working part-time in early retirement?',
  'How does sequence of returns risk change with different retirement dates?',
  'If I delay retirement, should I adjust my asset allocation?',
  'What tax benefits might I gain by timing my retirement strategically?',
  'How does delaying retirement affect the longevity of my portfolio?'
];

// Common follow-up questions for retirement planning - general retirement knowledge
export const commonFollowUpQuestions = [
  {
    question: "How much will healthcare cost in retirement?",
    answer: "Healthcare costs in retirement can vary widely, but studies suggest a 65-year-old couple might need around $300,000 set aside specifically for healthcare expenses throughout retirement, not including long-term care. Medicare will cover some costs, but there are premiums, copays, and services not covered."
  },
  {
    question: "How does inflation affect my retirement plan?",
    answer: "Inflation erodes purchasing power over time. A 3% annual inflation rate means $100 today will only buy $74 worth of goods in 10 years. Your retirement portfolio needs to grow faster than inflation to maintain your lifestyle. This is why we include inflation-hedging assets like stocks and REITs in your portfolio."
  },
  {
    question: "What happens if the market crashes right before I retire?",
    answer: "A market crash near retirement can significantly impact your portfolio. This 'sequence of returns risk' is why we recommend gradually reducing risk as you approach retirement and maintaining a cash buffer of 1-2 years of expenses. This allows you to avoid selling investments at depressed prices during market downturns."
  },
  {
    question: "Should I pay off my mortgage before retiring?",
    answer: "It depends on your specific situation. Paying off a mortgage provides peace of mind and reduces monthly expenses. However, if your mortgage interest rate is lower than what your investments can earn, it might make mathematical sense to keep the mortgage. Consider your comfort with debt, tax situation, and overall financial plan."
  },
  {
    question: "How much can I withdraw without running out of money?",
    answer: "The traditional guideline is the 4% rule, which suggests withdrawing 4% of your portfolio in the first year of retirement, then adjusting that amount for inflation each year. This approach has historically provided a high probability of your money lasting 30+ years. However, your personal withdrawal rate should be tailored to your unique situation."
  },
  {
    question: "What is the best age to start taking Social Security?",
    answer: "You can start claiming Social Security as early as 62, but benefits increase about 8% for each year you delay until age 70. The optimal claiming age depends on your health, longevity expectations, financial needs, and marital status. For married couples, coordinating claiming strategies becomes even more important."
  },
  {
    question: "How does Medicare work with my retirement plan?",
    answer: "Medicare eligibility begins at age 65, regardless of when you retire. It has multiple parts: Part A (hospital coverage, usually premium-free), Part B (medical services, with premiums), Part D (prescription drugs, with premiums), and optional Medigap policies. If you retire before 65, you'll need to secure alternative health insurance until Medicare eligibility."
  },
  {
    question: "How do I factor in long-term care costs?",
    answer: "Long-term care is a significant retirement risk. Options include: long-term care insurance, hybrid life/LTC policies, self-funding through additional savings, or relying on family care. The average nursing home costs over $100,000 annually, so having a strategy is essential. We typically recommend starting to consider these options in your 50s."
  }
];

// Helper functions to simulate advisors tailoring portfolios
export function simulatePortfolioAdjustment(
  portfolio: RetirementData, 
  adjustmentType: string
): RetirementData {
  // Create a deep copy to avoid modifying original
  const adjustedPortfolio = JSON.parse(JSON.stringify(portfolio));
  
  switch (adjustmentType) {
    case 'conservative':
      adjustedPortfolio.riskTolerance = 'Low';
      break;
    case 'aggressive':
      adjustedPortfolio.riskTolerance = 'High';
      break;
    case 'earlier':
      adjustedPortfolio.retirementAge = Math.max(55, adjustedPortfolio.retirementAge - 5);
      break;
    case 'later':
      adjustedPortfolio.retirementAge = Math.min(75, adjustedPortfolio.retirementAge + 5);
      break;
    case 'more-savings':
      adjustedPortfolio.currentSavings = Math.round(adjustedPortfolio.currentSavings * 1.5);
      break;
    case 'higher-income':
      adjustedPortfolio.annualIncome = Math.round(adjustedPortfolio.annualIncome * 1.2);
      break;
    default:
      // No changes
      break;
  }
  
  return adjustedPortfolio;
}