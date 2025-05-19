import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
  BarChart,
  ArrowRight,
  TrendingUp,
  BarChartBig,
  ShieldAlert,
  Shell
} from 'lucide-react';
import ProjectionChart from '../visualizations/ProjectionChart';
import InflationAdjustedChart from '../visualizations/InflationAdjustedChart';
import ComparativePortfolioChart from '../visualizations/ComparativePortfolioChart';
import QuickQuestions from '../common/QuickQuestions';
import IntegratedDemoHelper from '../common/IntegratedDemoHelper';
import ChatWindow from '../common/ChatWindow';

const PortfolioComparison: React.FC = () => {
  const { portfolios, retirementData } = useAppContext();
  const [selectedMetric, setSelectedMetric] = useState<'growth' | 'risk' | 'allocation' | 'withdrawal'>('growth');
  const [selectedPortfolios, setSelectedPortfolios] = useState<string[]>(['Aggressive', 'Balanced', 'Safe']);
  const [animationState, setAnimationState] = useState<boolean>(false);
  
  // Trigger animation after component mounts
  useEffect(() => {
    setTimeout(() => {
      setAnimationState(true);
    }, 300);
  }, []);
  
  if (portfolios.length === 0 || !retirementData) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-yellow-50 p-6 rounded-lg max-w-lg">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">No portfolios to compare</h3>
          <p className="text-yellow-700">
            Please complete the questionnaire in the "Plan Your Retirement" tab first to generate your personalized portfolio options.
          </p>
        </div>
      </div>
    );
  }

  const filteredPortfolios = portfolios.filter(p => selectedPortfolios.includes(p.type));
  
  const togglePortfolio = (portfolioType: string) => {
    if (selectedPortfolios.includes(portfolioType)) {
      // Don't allow deselecting if it's the only one selected
      if (selectedPortfolios.length > 1) {
        setSelectedPortfolios(selectedPortfolios.filter(p => p !== portfolioType));
      }
    } else {
      setSelectedPortfolios([...selectedPortfolios, portfolioType]);
    }
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'growth':
        return <TrendingUp className="w-5 h-5" />;
      case 'risk':
        return <ShieldAlert className="w-5 h-5" />;
      case 'allocation':
        return <BarChart className="w-5 h-5" />;
      case 'withdrawal':
        return <BarChartBig className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 transition-all duration-500 transform-gpu" style={{
          opacity: animationState ? 1 : 0,
          transform: animationState ? 'translateY(0)' : 'translateY(20px)'
        }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Portfolio Comparison</h2>
          <p className="text-gray-600">
            Compare your retirement portfolio options side by side to make an informed decision.
            Use the tools below to analyze different aspects of each portfolio.
          </p>
        </div>

        <div 
          className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8 transition-all duration-700 transform-gpu" 
          style={{
            opacity: animationState ? 1 : 0,
            transform: animationState ? 'translateY(0)' : 'translateY(20px)',
            transitionDelay: '100ms'
          }}
        >
          <div className="md:col-span-9">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex flex-wrap justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Portfolio Comparison</h3>
                <div className="flex space-x-2">
                  <div className="flex items-center space-x-3 bg-gray-100 p-1 rounded-lg">
                    <button
                      className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                        selectedMetric === 'growth'
                          ? 'bg-white shadow-sm text-blue-700'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setSelectedMetric('growth')}
                    >
                      <TrendingUp className="h-4 w-4 mr-1.5" />
                      <span>Growth</span>
                    </button>
                    <button
                      className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                        selectedMetric === 'risk'
                          ? 'bg-white shadow-sm text-blue-700'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setSelectedMetric('risk')}
                    >
                      <ShieldAlert className="h-4 w-4 mr-1.5" />
                      <span>Risk</span>
                    </button>
                    <button
                      className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                        selectedMetric === 'allocation'
                          ? 'bg-white shadow-sm text-blue-700'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setSelectedMetric('allocation')}
                    >
                      <BarChart className="h-4 w-4 mr-1.5" />
                      <span>Allocation</span>
                    </button>
                    <button
                      className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                        selectedMetric === 'withdrawal'
                          ? 'bg-white shadow-sm text-blue-700'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setSelectedMetric('withdrawal')}
                    >
                      <BarChartBig className="h-4 w-4 mr-1.5" />
                      <span>Withdrawal</span>
                    </button>
                  </div>
                </div>
              </div>

              {selectedMetric === 'growth' && (
                <div className="animate-fade-in">
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Projected Growth over Time</h4>
                    <div className="h-[350px] w-full">
                      {/* New combined chart component */}
                      <ComparativePortfolioChart 
                        portfolios={portfolios}
                        retirementData={retirementData}
                        width={600}
                        height={350}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    {filteredPortfolios.map((portfolio) => (
                      <div 
                        key={portfolio.type}
                        className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                      >
                        <h5 className="font-medium text-gray-900 mb-2">{portfolio.type} Portfolio</h5>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Initial Investment:</span>
                            <span className="font-medium">{formatCurrency(retirementData.currentSavings)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Annual Contributions:</span>
                            <span className="font-medium">{formatCurrency(retirementData.annualIncome * 0.15)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Years to Retirement:</span>
                            <span className="font-medium">{retirementData.retirementAge - retirementData.age}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Projected Value:</span>
                            <span className="font-medium">{formatCurrency(portfolio.projectedFund)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Compounding Rate:</span>
                            <span className="font-medium">{(portfolio.cagr * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedMetric === 'risk' && (
                <div className="animate-fade-in">
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Risk Profile Comparison</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {filteredPortfolios.map((portfolio) => (
                        <div 
                          key={portfolio.type}
                          className="bg-white border rounded-lg overflow-hidden shadow-sm transition-all duration-500"
                          style={{ borderTop: `4px solid ${portfolio.colorScheme.primary}` }}
                        >
                          <div className="p-4">
                            <div className="flex justify-between items-center mb-3">
                              <h5 className="font-medium text-gray-900">{portfolio.type}</h5>
                              <span 
                                className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                  portfolio.riskLevel === 'High' 
                                    ? 'bg-red-100 text-red-800' 
                                    : portfolio.riskLevel === 'Medium'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {portfolio.riskLevel} Risk
                              </span>
                            </div>
                            
                            <div className="space-y-4">
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-xs text-gray-500">Volatility</span>
                                  <span className="text-xs font-medium">
                                    {portfolio.riskLevel === 'High' ? 'High' : portfolio.riskLevel === 'Medium' ? 'Moderate' : 'Low'}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="h-2 rounded-full" 
                                    style={{ 
                                      width: portfolio.riskLevel === 'High' ? '80%' : portfolio.riskLevel === 'Medium' ? '50%' : '20%',
                                      backgroundColor: portfolio.colorScheme.primary
                                    }}
                                  ></div>
                                </div>
                              </div>
                              
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-xs text-gray-500">Potential Return</span>
                                  <span className="text-xs font-medium">
                                    {portfolio.riskLevel === 'High' ? 'High' : portfolio.riskLevel === 'Medium' ? 'Moderate' : 'Low'}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="h-2 rounded-full" 
                                    style={{ 
                                      width: portfolio.riskLevel === 'High' ? '80%' : portfolio.riskLevel === 'Medium' ? '50%' : '30%',
                                      backgroundColor: portfolio.colorScheme.primary
                                    }}
                                  ></div>
                                </div>
                              </div>
                              
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-xs text-gray-500">Drawdown Risk</span>
                                  <span className="text-xs font-medium">
                                    {portfolio.riskLevel === 'High' ? '30-40%' : portfolio.riskLevel === 'Medium' ? '20-30%' : '10-20%'}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="h-2 rounded-full" 
                                    style={{ 
                                      width: portfolio.riskLevel === 'High' ? '85%' : portfolio.riskLevel === 'Medium' ? '55%' : '25%',
                                      backgroundColor: portfolio.colorScheme.primary
                                    }}
                                  ></div>
                                </div>
                              </div>
                              
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-xs text-gray-500">Recovery Period</span>
                                  <span className="text-xs font-medium">
                                    {portfolio.riskLevel === 'High' ? '3-5 Years' : portfolio.riskLevel === 'Medium' ? '2-3 Years' : '1-2 Years'}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="h-2 rounded-full" 
                                    style={{ 
                                      width: portfolio.riskLevel === 'High' ? '75%' : portfolio.riskLevel === 'Medium' ? '50%' : '25%',
                                      backgroundColor: portfolio.colorScheme.primary
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-4 pt-3 border-t border-gray-200">
                              <p className="text-xs text-gray-600">
                                {portfolio.riskLevel === 'High' 
                                  ? 'Higher potential returns with significant volatility. Best for long time horizons.'
                                  : portfolio.riskLevel === 'Medium'
                                  ? 'Balanced approach with moderate volatility. Suitable for medium time horizons.'
                                  : 'Lower volatility with moderate returns. Good for shorter time horizons or conservative investors.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Historical Context</h4>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-blue-800 mb-2 font-medium">Risk in Perspective</p>
                      <p className="text-sm text-blue-700 mb-2">
                        Based on historical market data (1926-present), here's what each portfolio's risk profile might mean:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="bg-white rounded p-3 shadow-sm">
                          <p className="font-medium text-sm text-red-700 mb-1">Aggressive (High Risk)</p>
                          <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
                            <li>Worst year: -43% (2008 equivalent)</li>
                            <li>Best year: +54% (1933 equivalent)</li>
                            <li>3 in 10 years may be negative</li>
                          </ul>
                        </div>
                        <div className="bg-white rounded p-3 shadow-sm">
                          <p className="font-medium text-sm text-blue-700 mb-1">Balanced (Medium Risk)</p>
                          <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
                            <li>Worst year: -28% (2008 equivalent)</li>
                            <li>Best year: +33% (1933 equivalent)</li>
                            <li>2 in 10 years may be negative</li>
                          </ul>
                        </div>
                        <div className="bg-white rounded p-3 shadow-sm">
                          <p className="font-medium text-sm text-green-700 mb-1">Safe (Low Risk)</p>
                          <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
                            <li>Worst year: -15% (2008 equivalent)</li>
                            <li>Best year: +22% (1933 equivalent)</li>
                            <li>1 in 10 years may be negative</li>
                          </ul>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-4 italic">
                        Note: Past performance is not indicative of future results. The above examples are simplified illustrations based on historical market behavior.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedMetric === 'allocation' && (
                <div className="animate-fade-in">
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Portfolio Allocation Comparison</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Asset Class
                            </th>
                            {filteredPortfolios.map(portfolio => (
                              <th 
                                key={portfolio.type} 
                                scope="col" 
                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                                style={{ color: portfolio.colorScheme.primary }}
                              >
                                {portfolio.type}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Stocks
                            </td>
                            {filteredPortfolios.map(portfolio => (
                              <td key={portfolio.type} className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                <div className="flex items-center">
                                  <span className="mr-2">{portfolio.allocation.stocks}%</span>
                                  <div className="w-24 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="h-2 rounded-full" 
                                      style={{ 
                                        width: `${portfolio.allocation.stocks}%`,
                                        backgroundColor: portfolio.colorScheme.primary 
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Bonds
                            </td>
                            {filteredPortfolios.map(portfolio => (
                              <td key={portfolio.type} className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                <div className="flex items-center">
                                  <span className="mr-2">{portfolio.allocation.bonds}%</span>
                                  <div className="w-24 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="h-2 rounded-full" 
                                      style={{ 
                                        width: `${portfolio.allocation.bonds}%`,
                                        backgroundColor: portfolio.colorScheme.secondary 
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              REITs
                            </td>
                            {filteredPortfolios.map(portfolio => (
                              <td key={portfolio.type} className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                <div className="flex items-center">
                                  <span className="mr-2">{portfolio.allocation.reits}%</span>
                                  <div className="w-24 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="h-2 rounded-full" 
                                      style={{ 
                                        width: `${portfolio.allocation.reits}%`,
                                        backgroundColor: portfolio.colorScheme.accent 
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              International
                            </td>
                            {filteredPortfolios.map(portfolio => (
                              <td key={portfolio.type} className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                <div className="flex items-center">
                                  <span className="mr-2">{portfolio.allocation.international}%</span>
                                  <div className="w-24 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="h-2 rounded-full" 
                                      style={{ 
                                        width: `${portfolio.allocation.international}%`,
                                        backgroundColor: portfolio.colorScheme.primary 
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Alternatives
                            </td>
                            {filteredPortfolios.map(portfolio => (
                              <td key={portfolio.type} className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                <div className="flex items-center">
                                  <span className="mr-2">{portfolio.allocation.alternatives}%</span>
                                  <div className="w-24 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="h-2 rounded-full" 
                                      style={{ 
                                        width: `${portfolio.allocation.alternatives}%`,
                                        backgroundColor: portfolio.colorScheme.secondary 
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Cash
                            </td>
                            {filteredPortfolios.map(portfolio => (
                              <td key={portfolio.type} className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                <div className="flex items-center">
                                  <span className="mr-2">{portfolio.allocation.cash}%</span>
                                  <div className="w-24 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="h-2 rounded-full" 
                                      style={{ 
                                        width: `${portfolio.allocation.cash}%`,
                                        backgroundColor: portfolio.colorScheme.accent 
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div className="bg-indigo-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-indigo-800 mb-2 font-medium">Asset Class Definitions</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-medium text-indigo-700">Stocks</p>
                        <p className="text-xs text-gray-600">Equities representing ownership in companies, including large, mid, and small-cap stocks.</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-indigo-700">Bonds</p>
                        <p className="text-xs text-gray-600">Fixed-income securities that pay interest, including government, municipal, and corporate bonds.</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-indigo-700">REITs</p>
                        <p className="text-xs text-gray-600">Real Estate Investment Trusts that own and operate income-producing properties.</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-indigo-700">International</p>
                        <p className="text-xs text-gray-600">Investments in stocks and bonds from markets outside your home country.</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-indigo-700">Alternatives</p>
                        <p className="text-xs text-gray-600">Investments outside traditional asset classes, such as commodities, private equity, or hedge funds.</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-indigo-700">Cash</p>
                        <p className="text-xs text-gray-600">Money market funds, CDs, Treasury bills, and other short-term, low-risk investments.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedMetric === 'withdrawal' && (
                <div className="animate-fade-in">
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Retirement Withdrawal Comparison</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      {filteredPortfolios.map((portfolio) => (
                        <div 
                          key={portfolio.type}
                          className="bg-white border rounded-lg overflow-hidden shadow-sm"
                          style={{ borderLeft: `4px solid ${portfolio.colorScheme.primary}` }}
                        >
                          <div className="p-4">
                            <h5 className="font-medium text-gray-900 mb-1">{portfolio.type} Portfolio</h5>
                            <div className="text-2xl font-bold mb-2" style={{ color: portfolio.colorScheme.primary }}>
                              {formatCurrency(Math.round(portfolio.annualWithdrawal))}
                            </div>
                            <p className="text-sm text-gray-600 mb-3">Annual withdrawal at 4%</p>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Monthly Income:</span>
                                <span className="font-medium">{formatCurrency(Math.round(portfolio.annualWithdrawal / 12))}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Withdrawal Rate:</span>
                                <span className="font-medium">4.0%</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Portfolio Balance:</span>
                                <span className="font-medium">{formatCurrency(Math.round(portfolio.projectedFund))}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">30-Year Success Rate:</span>
                                <span className="font-medium">
                                  {portfolio.riskLevel === 'High' ? '88%' : portfolio.riskLevel === 'Medium' ? '92%' : '95%'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Inflation Impact over 30 Years</h4>
                    <p className="text-xs text-gray-600 mb-4">
                      This chart shows how inflation affects your withdrawal purchasing power over time. The blue line represents your nominal annual withdrawal amount, while the 
                      orange line shows the inflation-adjusted amount needed to maintain the same purchasing power.
                    </p>
                    
                    {filteredPortfolios.length > 0 && (
                      <div className="mb-4">
                        <InflationAdjustedChart
                          initialWithdrawal={filteredPortfolios[0].annualWithdrawal}
                          withdrawalRate={0.04}
                          inflationRate={0.025}
                          yearsInRetirement={30}
                          colorScheme={{
                            primary: "#3b82f6",
                            secondary: "#f97316"
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="bg-amber-50 p-4 rounded-lg mt-6">
                      <p className="text-sm text-amber-800 mb-2 font-medium">Understanding the 4% Rule</p>
                      <p className="text-xs text-gray-700 mb-2">
                        The 4% rule suggests withdrawing 4% of your portfolio in the first year of retirement, then adjusting that amount for inflation each year. 
                        Based on historical data, this approach has a high likelihood of sustaining a 30-year retirement without depleting your savings.
                      </p>
                      <p className="text-xs text-gray-700">
                        However, it's important to note that this rule is a guideline, not a guarantee. Market conditions, inflation rates, and your personal longevity 
                        all affect how long your savings will last. Consult with a financial advisor to create a personalized withdrawal strategy.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div 
            className="md:col-span-3 transition-all duration-700 transform-gpu"
            style={{
              opacity: animationState ? 1 : 0,
              transform: animationState ? 'translateY(0)' : 'translateY(20px)',
              transitionDelay: '200ms'
            }}
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Portfolios to Compare</h3>
              <div className="space-y-3">
                {portfolios.map((portfolio) => (
                  <div 
                    key={portfolio.type}
                    className="flex items-center"
                  >
                    <button
                      className={`w-5 h-5 rounded-md mr-3 border ${
                        selectedPortfolios.includes(portfolio.type)
                          ? 'bg-blue-600 border-blue-600'
                          : 'bg-white border-gray-300'
                      }`}
                      onClick={() => togglePortfolio(portfolio.type)}
                      aria-label={`Toggle ${portfolio.type} portfolio`}
                    >
                      {selectedPortfolios.includes(portfolio.type) && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-5 h-5">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                    <div 
                      className={`flex-1 p-3 rounded-md border ${
                        selectedPortfolios.includes(portfolio.type)
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-2"
                            style={{ backgroundColor: portfolio.colorScheme.primary }}
                          ></div>
                          <span className="font-medium text-gray-900">{portfolio.type}</span>
                        </div>
                        <span 
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            portfolio.riskLevel === 'High' 
                              ? 'bg-red-100 text-red-800' 
                              : portfolio.riskLevel === 'Medium'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {portfolio.riskLevel} Risk
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Planning Tips</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 mr-2" />
                      <span className="text-xs text-gray-600">Compare different portfolios to understand risk-return tradeoffs</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 mr-2" />
                      <span className="text-xs text-gray-600">Review how inflation might impact your retirement income</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 mr-2" />
                      <span className="text-xs text-gray-600">Consider your time horizon when selecting a portfolio</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 mr-2" />
                      <span className="text-xs text-gray-600">Adjust your plan as your personal situation changes</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6">
                <button className="w-full bg-blue-600 text-white rounded-md py-2 px-4 font-medium shadow-sm hover:bg-blue-700 transition-colors">
                  Generate PDF Report
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Interactive Examples moved to bottom */}
        <IntegratedDemoHelper />
        <QuickQuestions standalone={true} />
        
        {/* Chat window added at the bottom */}
        <ChatWindow 
          title="Ask About Portfolio Comparisons" 
          placeholder="Ask questions about comparing portfolios..."
          tabIdentifier="compare"
        />
      </div>
    </div>
  );
};

export default PortfolioComparison;