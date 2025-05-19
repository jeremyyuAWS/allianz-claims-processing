import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import QuickQuestions from '../common/QuickQuestions';
import IntegratedDemoHelper from '../common/IntegratedDemoHelper';
import { AlertTriangle, Filter } from 'lucide-react';
import ComparativePortfolioChart from '../visualizations/ComparativePortfolioChart';
import ChatWindow from '../common/ChatWindow';
import PortfolioTabs from './PortfolioTabs';

const ExploreOptions: React.FC = () => {
  const { portfolios, retirementData, setSelectedPortfolio, setActiveTab } = useAppContext();
  const [selectedRisk, setSelectedRisk] = useState<string | null>(null);
  const [featuredPortfolio, setFeaturedPortfolio] = useState<string | null>(null);
  const [showComparativeChart, setShowComparativeChart] = useState<boolean>(true);
  const [animationState, setAnimationState] = useState({
    cards: false,
    profile: false,
    chart: false
  });
  
  useEffect(() => {
    // Trigger animations sequentially with proper timing
    setTimeout(() => setAnimationState(prev => ({ ...prev, profile: true })), 300);
    setTimeout(() => setAnimationState(prev => ({ ...prev, chart: true })), 600);
    setTimeout(() => setAnimationState(prev => ({ ...prev, cards: true })), 900);
    
    // Set recommended portfolio
    if (portfolios.length > 0) {
      // Base recommendation on risk tolerance
      const riskBasedPortfolio = retirementData?.riskTolerance === 'High' 
        ? 'Aggressive' 
        : retirementData?.riskTolerance === 'Low' 
          ? 'Safe' 
          : 'Balanced';
      
      setFeaturedPortfolio(riskBasedPortfolio);
    }
  }, [portfolios.length, retirementData]);

  const filteredPortfolios = selectedRisk 
    ? portfolios.filter(p => p.riskLevel === selectedRisk)
    : portfolios;

  if (portfolios.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-yellow-50 p-6 rounded-lg max-w-lg">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">No portfolios generated yet</h3>
          <p className="text-yellow-700">
            Please complete the questionnaire in the "Plan Your Retirement" tab first to generate your personalized portfolio options.
          </p>
        </div>
      </div>
    );
  }

  const handleCompareAll = () => {
    setActiveTab('compare');
  };

  const handleViewPortfolio = (portfolioType: string) => {
    const portfolio = portfolios.find(p => p.type === portfolioType);
    if (portfolio) {
      setSelectedPortfolio(portfolio);
      setActiveTab('report');
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top section - Retirement Profile */}
        <div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Retirement Portfolio Options</h2>
              <p className="text-gray-600">
                Based on your inputs, we've created three personalized portfolio options for your retirement planning. 
                Each option balances risk and return differently to suit your preferences.
              </p>
            </div>
            
            <div className="flex items-center">
              <div className="bg-gray-100 p-1 rounded-lg flex items-center">
                <button 
                  onClick={() => setSelectedRisk(null)}
                  className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${!selectedRisk ? 'bg-white shadow text-blue-700' : 'text-gray-700 hover:text-blue-700'}`}
                >
                  All
                </button>
                <button 
                  onClick={() => setSelectedRisk('Low')}
                  className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${selectedRisk === 'Low' ? 'bg-white shadow text-blue-700' : 'text-gray-700 hover:text-blue-700'}`}
                >
                  Low Risk
                </button>
                <button 
                  onClick={() => setSelectedRisk('Medium')}
                  className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${selectedRisk === 'Medium' ? 'bg-white shadow text-blue-700' : 'text-gray-700 hover:text-blue-700'}`}
                >
                  Medium Risk
                </button>
                <button 
                  onClick={() => setSelectedRisk('High')}
                  className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${selectedRisk === 'High' ? 'bg-white shadow text-blue-700' : 'text-gray-700 hover:text-blue-700'}`}
                >
                  High Risk
                </button>
              </div>
            </div>
          </div>
          
          {retirementData && (
            <div className={`mt-4 bg-blue-50 p-4 rounded-lg border border-blue-100 transition-all duration-500 ${animationState.profile ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-4'}`}>
              <h3 className="font-medium text-blue-800 mb-2">Your Retirement Profile</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Current Age</p>
                  <p className="font-medium">{retirementData.age}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Retirement Age</p>
                  <p className="font-medium">{retirementData.retirementAge}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Savings</p>
                  <p className="font-medium">${retirementData.currentSavings.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Annual Income</p>
                  <p className="font-medium">${retirementData.annualIncome.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Risk Tolerance</p>
                  <p className="font-medium">{retirementData.riskTolerance}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Years to Retirement</p>
                  <p className="font-medium">{retirementData.retirementAge - retirementData.age}</p>
                </div>
              </div>
              
              {retirementData.desiredLifestyle && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-sm text-gray-600 italic">"{retirementData.desiredLifestyle}"</p>
                </div>
              )}
              
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={handleCompareAll}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Filter className="h-4 w-4 mr-1.5" />
                  Compare All Options
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Second section - Portfolio Growth Comparison Chart - Now with proper spacing */}
        {showComparativeChart && (
          <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all duration-700 mb-8 ${
            animationState.chart ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Portfolio Growth Comparison</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              This chart compares the projected growth of all three portfolio options over your investment horizon.
              Toggle each portfolio by clicking its name to see how they compare.
            </p>
            <div className="h-[350px] w-full">
              {retirementData && (
                <ComparativePortfolioChart
                  portfolios={portfolios}
                  retirementData={retirementData}
                  width={800}
                  height={350}
                />
              )}
            </div>
          </div>
        )}

        {/* Third section - Portfolio Tabs (replacing both the recommendation card and portfolio cards) */}
        <div className={`transition-all duration-500 ${animationState.cards ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
          <PortfolioTabs 
            portfolios={filteredPortfolios}
            featuredPortfolio={featuredPortfolio}
            onViewDetails={handleViewPortfolio}
            onCompare={handleCompareAll}
          />
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Disclaimer</h3>
              <p className="text-sm text-gray-600">
                This is an AI-generated recommendation based on the information you provided. 
                Actual investment results may vary. Past performance is not indicative of future results. 
                Please consult with a qualified financial advisor before making investment decisions.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <a href="https://www.lyzr.ai/responsible-ai" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  Learn more about Lyzr's Responsible AI
                </a>
              </p>
            </div>
          </div>
        </div>
        
        {/* Interactive Examples and Chat moved to bottom for better spacing */}
        <div className="space-y-6">
          <IntegratedDemoHelper />
          <QuickQuestions standalone={true} />
          
          <ChatWindow 
            title="Ask About Your Portfolio Options" 
            placeholder="Ask questions about your portfolio options..."
            tabIdentifier="explore"
          />
        </div>
      </div>
    </div>
  );
};

export default ExploreOptions;