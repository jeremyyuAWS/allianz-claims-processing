import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Send, Bot, User } from 'lucide-react';

interface ChatWindowProps {
  title?: string;
  placeholder?: string;
  tabIdentifier: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  title = "Ask Questions About Your Retirement", 
  placeholder = "Type your question here...",
  tabIdentifier 
}) => {
  const { 
    addMessageToQuestionnaire, 
    portfolios, 
    retirementData 
  } = useAppContext();
  
  const [messages, setMessages] = useState<Array<{
    id: string;
    sender: 'user' | 'agent';
    content: string;
    timestamp: Date;
  }>>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Add initial greeting message based on current tab
    let initialMessage = "Hello! How can I help you with your retirement planning today?";

    switch (tabIdentifier) {
      case 'explore':
        initialMessage = "Hi there! I can answer questions about your portfolio options. Feel free to ask about risk, allocation, or expected returns.";
        break;
      case 'compare':
        initialMessage = "Welcome! I can help you compare your portfolio options. Ask me about the differences in risk levels, potential returns, or allocation strategies.";
        break;
      case 'tax':
        initialMessage = "Hello! I can answer your questions about tax implications for different retirement accounts. Feel free to ask about Traditional vs. Roth, tax-efficient strategies, or RMDs.";
        break;
      case 'social':
        initialMessage = "Hi! Have questions about Social Security benefits? Ask me about claiming strategies, benefit calculations, or how Social Security fits into your retirement plan.";
        break;
      case 'contribution':
        initialMessage = "Welcome! I can help you understand how your contribution levels affect your retirement goals. Ask me about savings rates, catch-up contributions, or optimal strategies.";
        break;
      case 'delay':
        initialMessage = "Hello! I can help you understand the impact of delaying retirement. Ask me about working longer, phased retirement, or how timing affects your retirement security.";
        break;
      case 'report':
        initialMessage = "Hi there! I can answer questions about your retirement report. Feel free to ask about any of the projections, recommendations, or how to interpret the data.";
        break;
    }

    setMessages([
      {
        id: `${tabIdentifier}-initial`,
        sender: 'agent',
        content: initialMessage,
        timestamp: new Date()
      }
    ]);
  }, [tabIdentifier]);

  const handleSendMessage = () => {
    if (input.trim() === '') return;
    
    // Add user message
    const userMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user' as const,
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Also add to main chat if needed
    addMessageToQuestionnaire({
      sender: 'user',
      content: input,
    });
    
    setInput('');
    setIsTyping(true);
    
    // Generate contextual response based on tab and question
    setTimeout(() => {
      let responseContent = '';
      const userQuestion = input.toLowerCase();
      
      // Generate response based on the tab and question content
      if (tabIdentifier === 'explore') {
        if (userQuestion.includes('risk')) {
          responseContent = `Risk management is essential in retirement planning. Based on your ${retirementData?.riskTolerance || 'medium'} risk tolerance, we've designed portfolios that balance growth potential with appropriate risk safeguards. Remember that risk is typically rewarded with higher expected returns over long time periods.`;
        } else if (userQuestion.includes('allocation') || userQuestion.includes('asset')) {
          responseContent = `Your portfolio allocations are designed to optimize risk-return tradeoffs. The Aggressive portfolio has approximately 70% stocks, the Balanced has 50% stocks, and the Safe portfolio has 30% stocks. The specific mix is calibrated to meet different risk tolerances and retirement timelines.`;
        } else if (userQuestion.includes('inflation')) {
          responseContent = `Our portfolios address inflation risk through strategic allocations to stocks, REITs, and other assets that historically have outpaced inflation. The Aggressive and Balanced portfolios in particular are designed with inflation protection in mind, which is crucial for maintaining purchasing power throughout retirement.`;
        } else {
          responseContent = `Based on your inputs (current age: ${retirementData?.age}, retirement age: ${retirementData?.retirementAge}, risk tolerance: ${retirementData?.riskTolerance}), I've provided portfolio options with different risk-return profiles. Each is designed to help you reach your retirement goals while aligning with your comfort level for market fluctuations.`;
        }
      } else if (tabIdentifier === 'compare') {
        if (userQuestion.includes('aggressive')) {
          responseContent = `The Aggressive portfolio has the highest expected return at approximately ${portfolios.find(p => p.type === 'Aggressive')?.cagr ? (portfolios.find(p => p.type === 'Aggressive')!.cagr * 100).toFixed(1) : '8'}% annually, but also the highest volatility. It's designed for those who can tolerate significant market fluctuations and have a longer time horizon (15+ years).`;
        } else if (userQuestion.includes('balanced')) {
          responseContent = `The Balanced portfolio offers a middle ground with approximately ${portfolios.find(p => p.type === 'Balanced')?.cagr ? (portfolios.find(p => p.type === 'Balanced')!.cagr * 100).toFixed(1) : '6'}% expected annual return. It provides more stability than the Aggressive option while still offering good growth potential, making it suitable for most investors with a medium time horizon.`;
        } else if (userQuestion.includes('safe')) {
          responseContent = `The Safe portfolio prioritizes capital preservation with a more modest ${portfolios.find(p => p.type === 'Safe')?.cagr ? (portfolios.find(p => p.type === 'Safe')!.cagr * 100).toFixed(1) : '4'}% expected annual return. It has significantly lower volatility, making it appropriate for those approaching retirement or with lower risk tolerance who prioritize stability over maximum growth.`;
        } else {
          responseContent = `When comparing portfolios, consider your time horizon, risk tolerance, and income needs. The Aggressive portfolio offers higher potential returns but more volatility, the Balanced provides a moderate approach, and the Safe offers more stability but lower growth potential. The ideal choice often depends on how close you are to retirement and your comfort with market fluctuations.`;
        }
      } else if (tabIdentifier === 'tax') {
        if (userQuestion.includes('roth')) {
          responseContent = `Roth accounts are funded with after-tax dollars, but grow tax-free and qualified withdrawals in retirement are tax-free. This is particularly advantageous if you expect to be in a higher tax bracket in retirement or want to leave tax-free assets to heirs. Unlike Traditional accounts, Roth IRAs don't have Required Minimum Distributions.`;
        } else if (userQuestion.includes('traditional')) {
          responseContent = `Traditional retirement accounts offer upfront tax deductions, reducing your current taxable income. The investments grow tax-deferred, but withdrawals in retirement are taxed as ordinary income. This approach works best if you expect to be in a lower tax bracket during retirement than you are now.`;
        } else if (userQuestion.includes('rmd')) {
          responseContent = `Required Minimum Distributions (RMDs) begin at age 73 for Traditional IRAs and 401(k)s. These mandatory withdrawals are taxed as ordinary income and are calculated based on your account balance and life expectancy. Failing to take RMDs results in a substantial 25% penalty on the amount not withdrawn. Roth IRAs don't have RMDs, which adds flexibility to your retirement tax planning.`;
        } else {
          responseContent = `Tax planning is a crucial part of retirement strategy. Consider diversifying across account types (Traditional, Roth, and taxable) to give yourself flexibility in managing tax liability during retirement. Strategic withdrawals from different account types can help minimize your overall tax burden and maximize retirement income.`;
        }
      } else if (tabIdentifier === 'social') {
        if (userQuestion.includes('claim') || userQuestion.includes('when')) {
          responseContent = `The optimal Social Security claiming age depends on your specific situation. Claiming at 62 provides income sooner but permanently reduces your benefit by up to 30%. Waiting until your Full Retirement Age (67 for most people) provides your full benefit. Delaying until 70 increases your benefit by approximately 8% per year beyond Full Retirement Age, resulting in a benefit that's 24% higher than at FRA.`;
        } else if (userQuestion.includes('spouse') || userQuestion.includes('survivor')) {
          responseContent = `For married couples, coordinating Social Security claiming strategies is important. Spousal benefits allow your spouse to receive up to 50% of your benefit at their Full Retirement Age. Survivor benefits allow a widow or widower to receive up to 100% of their deceased spouse's benefit. This is why the higher earner in a couple might consider delaying benefits to maximize the survivor benefit.`;
        } else if (userQuestion.includes('tax')) {
          responseContent = `Social Security benefits may be subject to federal income tax depending on your "combined income" (adjusted gross income + nontaxable interest + half of Social Security benefits). If your combined income exceeds certain thresholds ($25,000 for individuals or $32,000 for couples), up to 85% of your benefits could be taxable. Strategic withdrawal planning can help minimize taxes on your benefits.`;
        } else {
          responseContent = `Social Security typically replaces about 40% of pre-retirement income for average earners. Based on your profile, we estimate your benefit would be about $${Math.round((retirementData?.annualIncome || 90000) * 0.35 / 12).toLocaleString()} per month at Full Retirement Age. Remember that Social Security has a Cost of Living Adjustment (COLA) that helps benefits keep pace with inflation.`;
        }
      } else if (tabIdentifier === 'contribution') {
        if (userQuestion.includes('how much')) {
          responseContent = `Financial experts typically recommend saving 15-20% of your gross income for retirement. Based on your current annual income of $${retirementData?.annualIncome.toLocaleString() || '90,000'}, that would be approximately $${Math.round((retirementData?.annualIncome || 90000) * 0.15).toLocaleString()} to $${Math.round((retirementData?.annualIncome || 90000) * 0.2).toLocaleString()} per year. The specific amount depends on your retirement age goal, desired lifestyle, and current savings.`;
        } else if (userQuestion.includes('catch')) {
          responseContent = `Catch-up contributions allow people age 50 and older to save more in tax-advantaged retirement accounts. In 2023, you can contribute an additional $7,500 to a 401(k) beyond the standard $22,500 limit, and an extra $1,000 to an IRA beyond the standard $6,500 limit. These higher limits can significantly boost your retirement savings during your peak earning years.`;
        } else if (userQuestion.includes('compound')) {
          responseContent = `Compound growth is powerful - for example, $10,000 invested with a 7% annual return would grow to about $76,000 over 30 years without adding any additional money. This illustrates why starting early is so important, even with smaller contribution amounts. Your retirement calculation incorporates compound growth based on your selected portfolio's expected return rate.`;
        } else {
          responseContent = `Regular contributions are the foundation of retirement success. Even small increases in your contribution rate can have a significant impact over time due to compound growth. For example, increasing your monthly contribution by just $100 could add over $100,000 to your retirement fund over 30 years, assuming a 7% average annual return.`;
        }
      } else if (tabIdentifier === 'delay') {
        if (userQuestion.includes('health')) {
          responseContent = `Health considerations are indeed important when deciding retirement timing. Working longer may provide continued access to employer healthcare before Medicare eligibility at 65. However, if health issues might limit your longevity or quality of life, retiring earlier could be preferable. This calculator shows the financial impact, but your personal health situation should be a key factor in your decision.`;
        } else if (userQuestion.includes('part-time') || userQuestion.includes('phase')) {
          responseContent = `A phased retirement approach can provide an excellent middle ground. Working part-time for a few years before full retirement allows you to: 1) continue earning income, reducing the need to draw from savings, 2) potentially maintain access to employer benefits, and 3) ease into retirement lifestyle gradually. Our calculations show even part-time work can significantly extend the life of your portfolio.`;
        } else if (userQuestion.includes('social security')) {
          responseContent = `Delaying retirement often coincides with delaying Social Security benefits, which can increase your monthly benefit by approximately 8% per year between your Full Retirement Age and age 70. This effect is separate from, but complementary to, the portfolio growth shown in this calculator. The combined effect of larger Social Security benefits and a larger portfolio can substantially increase your retirement income security.`;
        } else {
          responseContent = `Delaying retirement even by a few years can significantly impact your financial security through: 1) additional contributions to your retirement accounts, 2) more time for investments to compound, 3) fewer years of withdrawals from your portfolio, and 4) potentially higher Social Security benefits. The calculator shows that delaying retirement by ${retirementData?.retirementAge ? 5 : 3} years could increase your sustainable annual withdrawal by approximately 25-35%.`;
        }
      } else if (tabIdentifier === 'report') {
        if (userQuestion.includes('withdrawal')) {
          responseContent = `Your report uses the 4% rule as a starting point for sustainable withdrawals, which historically has provided a high probability of portfolio survival for 30 years. Based on your projected retirement fund of $${Math.round(portfolios[0]?.projectedFund || 1000000).toLocaleString()}, this suggests an initial annual withdrawal of $${Math.round((portfolios[0]?.projectedFund || 1000000) * 0.04).toLocaleString()}, adjusted annually for inflation.`;
        } else if (userQuestion.includes('assumptions')) {
          responseContent = `This report assumes: 1) An annual investment return of ${portfolios[0]?.cagr ? (portfolios[0].cagr * 100).toFixed(1) : '7'}% before retirement and slightly lower during retirement, 2) Inflation rate of 2.5% annually, 3) Life expectancy extending 30 years beyond retirement, 4) Annual savings rate of approximately 15% of income, and 5) Social Security benefits supplementing your portfolio withdrawals.`;
        } else if (userQuestion.includes('adjust') || userQuestion.includes('change')) {
          responseContent = `You can adjust your retirement plan by: 1) Changing your portfolio allocation in the "Explore Options" tab, 2) Modifying your contribution amount in the "Contribution Calculator", 3) Considering a different retirement age in the "Cost of Delay" calculator, or 4) Comparing tax strategies in the "Tax Calculator". Any changes will be reflected in an updated report.`;
        } else {
          responseContent = `This comprehensive report provides a personalized roadmap for your retirement journey. It includes projections for your retirement fund growth, recommended withdrawal strategies, and key milestones. Remember that this is a living document – as your circumstances change, your plan should be revisited and adjusted accordingly.`;
        }
      } else {
        // Default response for any tab
        responseContent = `Thank you for your question. Based on your retirement profile (age: ${retirementData?.age}, retirement age: ${retirementData?.retirementAge}, risk tolerance: ${retirementData?.riskTolerance}), I can provide personalized guidance. In a production environment, our AI would analyze your specific situation in detail. For now, I encourage you to explore the different calculators and portfolio options to see how they align with your retirement goals.`;
      }
      
      // Add agent response
      const agentMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'agent' as const,
        content: responseContent,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, agentMessage]);
      
      // Also add to main chat if needed
      addMessageToQuestionnaire({
        sender: 'agent',
        content: responseContent,
        agentType: 'explainer'
      });
      
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6 overflow-hidden">
      <div className="border-b border-gray-200 px-4 py-3 bg-blue-50">
        <h3 className="font-medium text-blue-800 flex items-center">
          <Bot className="w-5 h-5 mr-2 text-blue-600" />
          {title}
        </h3>
        <p className="text-xs text-blue-600">
          Ask any questions about your retirement plan and get AI-powered answers
        </p>
      </div>
      
      <div className="max-h-60 overflow-y-auto p-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-2.5 mb-4 ${
              message.sender === 'user' ? 'justify-end' : ''
            }`}
          >
            {message.sender === 'agent' && (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
            )}
            <div
              className={`flex flex-col max-w-[80%] leading-1.5 ${
                message.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`px-4 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
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
          <div className="flex items-start gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Bot className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex flex-col max-w-[80%] leading-1.5 items-start">
              <div className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-800 rounded-tl-none">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={placeholder}
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
      </div>
    </div>
  );
};

export default ChatWindow;