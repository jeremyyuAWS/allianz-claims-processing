import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { CheckCircle2, TrendingUp, BarChartBig, Shield, ArrowRight } from 'lucide-react';
import PortfolioDonutChart from '../visualizations/PortfolioDonutChart';
import { Portfolio } from '../../types';

interface PortfolioTabsProps {
  portfolios: Portfolio[];
  featuredPortfolio: string | null;
  onViewDetails: (portfolioType: string) => void;
  onCompare: () => void;
}

const PortfolioTabs: React.FC<PortfolioTabsProps> = ({
  portfolios,
  featuredPortfolio,
  onViewDetails,
  onCompare
}) => {
  const { retirementData } = useAppContext();
  const [activeTab, setActiveTab] = useState<string>('recommended');
  const [expandedDetails, setExpandedDetails] = useState<string | null>(null);
  const [animateIn, setAnimateIn] = useState<boolean>(false);

  // Effect to animate in
  useEffect(() => {
    setTimeout(() => {
      setAnimateIn(true);
    }, 300);
  }, []);

  // Set default active tab based on if we have a featured portfolio
  useEffect(() => {
    if (featuredPortfolio) {
      setActiveTab('recommended');
    } else {
      setActiveTab(portfolios.length > 0 ? portfolios[0].type : 'Aggressive');
    }
  }, [featuredPortfolio, portfolios]);

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-blue-100 text-blue-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleDetails = (portfolioType: string) => {
    if (expandedDetails === portfolioType) {
      setExpandedDetails(null);
    } else {
      setExpandedDetails(portfolioType);
    }
  };

  // Get the active portfolio based on tab
  const getActivePortfolio = (): Portfolio | null => {
    if (activeTab === 'recommended' && featuredPortfolio) {
      return portfolios.find(p => p.type === featuredPortfolio) || null;
    }
    return portfolios.find(p => p.type === activeTab) || null;
  };

  const activePortfolio = getActivePortfolio();

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-700 ${
      animateIn ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
    }`}>
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {featuredPortfolio && (
          <button
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'recommended'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('recommended')}
          >
            <div className="flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              <span>Recommended</span>
            </div>
          </button>
        )}
        
        {portfolios.map((portfolio) => (
          <button
            key={portfolio.type}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === portfolio.type
                ? `border-${portfolio.type === 'Aggressive' ? 'red' : portfolio.type === 'Balanced' ? 'blue' : 'green'}-600 
                   text-${portfolio.type === 'Aggressive' ? 'red' : portfolio.type === 'Balanced' ? 'blue' : 'green'}-600`
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab(portfolio.type)}
            style={{ 
              borderBottomColor: activeTab === portfolio.type ? portfolio.colorScheme.primary : 'transparent',
              color: activeTab === portfolio.type ? portfolio.colorScheme.primary : ''
            }}
          >
            {portfolio.type}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Recommended Tab Content */}
        {activeTab === 'recommended' && featuredPortfolio && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <CheckCircle2 className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-medium text-blue-800">AI-Recommended Option</h3>
              </div>
              
              <p className="text-blue-800 mb-4">
                Based on your {retirementData?.riskTolerance} risk tolerance and retirement goals, our AI recommends the <strong>{featuredPortfolio}</strong> portfolio as the best match for your situation.
              </p>
              
              {featuredPortfolio === 'Aggressive' && (
                <div className="space-y-2 mb-4">
                  <div className="flex items-start">
                    <TrendingUp className="h-4 w-4 text-blue-600 mt-1 mr-2" />
                    <p className="text-sm text-gray-700">Higher growth potential to maximize your retirement funds</p>
                  </div>
                  <div className="flex items-start">
                    <BarChartBig className="h-4 w-4 text-blue-600 mt-1 mr-2" />
                    <p className="text-sm text-gray-700">Your {retirementData?.retirementAge - retirementData?.age} years until retirement provides time to weather market volatility</p>
                  </div>
                  <div className="flex items-start">
                    <Shield className="h-4 w-4 text-blue-600 mt-1 mr-2" />
                    <p className="text-sm text-gray-700">Still maintains some stability through strategic diversification</p>
                  </div>
                </div>
              )}
              {featuredPortfolio === 'Balanced' && (
                <div className="space-y-2 mb-4">
                  <div className="flex items-start">
                    <TrendingUp className="h-4 w-4 text-blue-600 mt-1 mr-2" />
                    <p className="text-sm text-gray-700">Good balance between growth and stability for your medium risk tolerance</p>
                  </div>
                  <div className="flex items-start">
                    <BarChartBig className="h-4 w-4 text-blue-600 mt-1 mr-2" />
                    <p className="text-sm text-gray-700">Designed to provide consistent returns while managing volatility</p>
                  </div>
                  <div className="flex items-start">
                    <Shield className="h-4 w-4 text-blue-600 mt-1 mr-2" />
                    <p className="text-sm text-gray-700">Well-rounded strategy that adapts to changing market conditions</p>
                  </div>
                </div>
              )}
              {featuredPortfolio === 'Safe' && (
                <div className="space-y-2 mb-4">
                  <div className="flex items-start">
                    <TrendingUp className="h-4 w-4 text-blue-600 mt-1 mr-2" />
                    <p className="text-sm text-gray-700">Focus on capital preservation with modest growth potential</p>
                  </div>
                  <div className="flex items-start">
                    <BarChartBig className="h-4 w-4 text-blue-600 mt-1 mr-2" />
                    <p className="text-sm text-gray-700">Reduced volatility to protect your savings as you approach retirement</p>
                  </div>
                  <div className="flex items-start">
                    <Shield className="h-4 w-4 text-blue-600 mt-1 mr-2" />
                    <p className="text-sm text-gray-700">Strategic allocation to income-producing assets for reliability</p>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={() => onViewDetails(featuredPortfolio)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  View Full Report
                </button>
                <button
                  onClick={() => setActiveTab(portfolios[0]?.type || 'Aggressive')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Show All Options
                </button>
              </div>
            </div>
            
            <div>
              {portfolios.map((portfolio) => (
                portfolio.type === featuredPortfolio && (
                  <div key={portfolio.type} className="flex flex-col items-center">
                    <PortfolioDonutChart 
                      allocation={portfolio.allocation}
                      colorPrimary={portfolio.colorScheme.primary}
                      colorSecondary={portfolio.colorScheme.secondary}
                      colorAccent={portfolio.colorScheme.accent}
                    />
                    <div className="mt-2 text-center">
                      <p className="text-sm font-medium text-gray-900">Projected Value</p>
                      <p className="text-xl font-bold text-blue-700">${Math.round(portfolio.projectedFund).toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Annual Withdrawal: ${Math.round(portfolio.annualWithdrawal).toLocaleString()}</p>
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* Portfolio Tab Content */}
        {activeTab !== 'recommended' && activePortfolio && (
          <div className="animate-slide-up">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <h3 className="text-xl font-bold text-gray-900">{activePortfolio.type} Plan</h3>
                {activePortfolio.riskTolerance === activePortfolio.type && (
                  <span className="ml-2 flex items-center text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="h-3 w-3 mr-0.5" />
                    Recommended
                  </span>
                )}
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskBadgeColor(activePortfolio.riskLevel)}`}>
                {activePortfolio.riskLevel} Risk
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-gray-100">
                      <TrendingUp className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Projected at Retirement</p>
                      <p className="text-lg font-bold text-gray-900">
                        ${Math.round(activePortfolio.projectedFund).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-gray-100">
                      <BarChartBig className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Annual Withdrawal</p>
                      <p className="text-lg font-bold text-gray-900">
                        ${Math.round(activePortfolio.annualWithdrawal).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Portfolio Strategy</h4>
                    <p className="text-sm text-gray-600 mb-4">{activePortfolio.description}</p>

                    <h4 className="font-medium text-gray-900 mb-2">Key Features</h4>
                    <div className="text-sm text-gray-600 space-y-2">
                      {activePortfolio.type === 'Aggressive' && (
                        <>
                          <div className="flex items-center">
                            <ArrowRight className="h-3.5 w-3.5 text-gray-500 mr-1.5 flex-shrink-0" />
                            <span>Higher volatility with greater growth potential</span>
                          </div>
                          <div className="flex items-center">
                            <ArrowRight className="h-3.5 w-3.5 text-gray-500 mr-1.5 flex-shrink-0" />
                            <span>May experience significant short-term fluctuations</span>
                          </div>
                          <div className="flex items-center">
                            <ArrowRight className="h-3.5 w-3.5 text-gray-500 mr-1.5 flex-shrink-0" />
                            <span>Best suited for longer time horizons (10+ years)</span>
                          </div>
                        </>
                      )}
                      {activePortfolio.type === 'Balanced' && (
                        <>
                          <div className="flex items-center">
                            <ArrowRight className="h-3.5 w-3.5 text-gray-500 mr-1.5 flex-shrink-0" />
                            <span>Moderate volatility with steady growth potential</span>
                          </div>
                          <div className="flex items-center">
                            <ArrowRight className="h-3.5 w-3.5 text-gray-500 mr-1.5 flex-shrink-0" />
                            <span>More stability during market downturns than aggressive</span>
                          </div>
                          <div className="flex items-center">
                            <ArrowRight className="h-3.5 w-3.5 text-gray-500 mr-1.5 flex-shrink-0" />
                            <span>Well-suited for medium time horizons (5-15 years)</span>
                          </div>
                        </>
                      )}
                      {activePortfolio.type === 'Safe' && (
                        <>
                          <div className="flex items-center">
                            <ArrowRight className="h-3.5 w-3.5 text-gray-500 mr-1.5 flex-shrink-0" />
                            <span>Lower volatility with more predictable returns</span>
                          </div>
                          <div className="flex items-center">
                            <ArrowRight className="h-3.5 w-3.5 text-gray-500 mr-1.5 flex-shrink-0" />
                            <span>Focus on capital preservation and income generation</span>
                          </div>
                          <div className="flex items-center">
                            <ArrowRight className="h-3.5 w-3.5 text-gray-500 mr-1.5 flex-shrink-0" />
                            <span>Better suited for shorter time horizons (1-10 years)</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  <button 
                    onClick={() => onCompare()}
                    className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Compare
                  </button>
                  <button 
                    onClick={() => onViewDetails(activePortfolio.type)}
                    className="flex-1 px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Full Report
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-center mb-4">
                  <PortfolioDonutChart 
                    allocation={activePortfolio.allocation}
                    colorPrimary={activePortfolio.colorScheme.primary}
                    colorSecondary={activePortfolio.colorScheme.secondary}
                    colorAccent={activePortfolio.colorScheme.accent}
                  />
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Portfolio Allocation</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm">
                      <span className="text-gray-500">Stocks:</span> {activePortfolio.allocation.stocks}%
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Bonds:</span> {activePortfolio.allocation.bonds}%
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">REITs:</span> {activePortfolio.allocation.reits}%
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">International:</span> {activePortfolio.allocation.international}%
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Alternatives:</span> {activePortfolio.allocation.alternatives}%
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Cash:</span> {activePortfolio.allocation.cash}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioTabs;