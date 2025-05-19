import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { DollarSign, Calculator, TrendingUp, Clock } from 'lucide-react';
import QuickQuestions from '../common/QuickQuestions';
import IntegratedDemoHelper from '../common/IntegratedDemoHelper';
import ChatWindow from '../common/ChatWindow';
import { formatCurrency, parseMoneyInput } from '../../utils/formatters';

const MonthlyContributionCalculator: React.FC = () => {
  const { retirementData, selectedPortfolio, portfolios } = useAppContext();
  const [contributionAmount, setContributionAmount] = useState<number>(500);
  const [targetAmount, setTargetAmount] = useState<number>(1000000);
  const [years, setYears] = useState<number>(30);
  const [contributionResults, setContributionResults] = useState<{
    monthlyAmount: number;
    totalContributions: number;
    totalInterest: number;
    finalBalance: number;
  } | null>(null);
  
  const activePortfolio = selectedPortfolio || (portfolios.length > 0 ? portfolios[0] : null);
  
  useEffect(() => {
    // Initialize with user data if available
    if (retirementData) {
      // Set initial contribution to 15% of monthly income
      setContributionAmount(Math.round(retirementData.annualIncome * 0.15 / 12));
      
      if (activePortfolio) {
        // Set initial target to projected fund
        setTargetAmount(Math.round(activePortfolio.projectedFund));
        
        // Set years to years until retirement
        setYears(retirementData.retirementAge - retirementData.age);
      }
    }
  }, [retirementData, activePortfolio]);
  
  useEffect(() => {
    if (activePortfolio) {
      calculateContribution();
    }
  }, [contributionAmount, years, activePortfolio]);
  
  const calculateContribution = () => {
    if (!activePortfolio) return;
    
    const monthlyRate = activePortfolio.cagr / 12;
    const numMonths = years * 12;
    
    // Calculate future value with regular deposits
    // FV = PMT × ((1 + r)^n - 1) / r
    const futureValue = contributionAmount * ((Math.pow(1 + monthlyRate, numMonths) - 1) / monthlyRate) * (1 + monthlyRate);
    
    const totalContributions = contributionAmount * numMonths;
    const totalInterest = futureValue - totalContributions;
    
    setContributionResults({
      monthlyAmount: contributionAmount,
      totalContributions: totalContributions,
      totalInterest: totalInterest,
      finalBalance: futureValue
    });
  };
  
  // Handle value input with support for abbreviations like 1M, 100K
  const handleTargetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const parsedValue = parseMoneyInput(value);
    setTargetAmount(Math.max(1000, parsedValue));
  };
  
  const calculateRequiredContribution = () => {
    if (!activePortfolio) return;
    
    const monthlyRate = activePortfolio.cagr / 12;
    const numMonths = years * 12;
    
    // Calculate payment required to reach target future value
    // PMT = FV × r / ((1 + r)^n - 1)
    const requiredContribution = targetAmount * monthlyRate / ((Math.pow(1 + monthlyRate, numMonths) - 1) * (1 + monthlyRate));
    
    setContributionAmount(Math.ceil(requiredContribution));
    
    // Results will be updated by the useEffect
  };
  
  if (!activePortfolio || !retirementData) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-yellow-800 mb-2">No portfolio selected</h3>
        <p className="text-yellow-700">
          Please complete the questionnaire first to use the contribution calculator.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Calculator className="h-6 w-6 text-blue-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Monthly Contribution Calculator</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Contribution Parameters</h4>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Monthly Contribution
                    </label>
                    <span className="text-sm text-gray-500">{formatCurrency(contributionAmount)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">$</span>
                    <input
                      type="range"
                      min="100"
                      max="5000"
                      step="50"
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(parseInt(e.target.value, 10))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>$100</span>
                    <span>$5,000</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Time Horizon (Years)
                    </label>
                    <span className="text-sm text-gray-500">{years} years</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="range"
                      min="1"
                      max="50"
                      step="1"
                      value={years}
                      onChange={(e) => setYears(parseInt(e.target.value, 10))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>1 year</span>
                    <span>50 years</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Target Amount
                    </label>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">$</span>
                    <input
                      type="text"
                      value={targetAmount}
                      onChange={handleTargetAmountChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter target amount (e.g. 1M, 500K)"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    You can use abbreviations like "1M" for $1,000,000 or "500K" for $500,000
                  </p>
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={calculateRequiredContribution}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Calculate Required Contribution
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 bg-blue-50 p-3 rounded-lg">
                <div className="flex items-start">
                  <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-700">Investment Growth Assumptions</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Calculations are based on the {activePortfolio.type} portfolio with an estimated annual return of {(activePortfolio.cagr * 100).toFixed(1)}%. 
                      These projections are for illustration purposes only.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Contribution Results</h4>
              
              {contributionResults && (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-blue-700 mb-1">Projected Future Value</p>
                    <p className="text-3xl font-bold text-blue-700">{formatCurrency(contributionResults.finalBalance)}</p>
                    <p className="text-xs text-blue-600 mt-1">After {years} years of monthly contributions</p>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <DollarSign className="h-4 w-4 text-gray-500 mr-1" />
                          <p className="text-xs font-medium text-gray-700">Your Contributions</p>
                        </div>
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(contributionResults.totalContributions)}</p>
                        <p className="text-xs text-gray-500 mt-1">{Math.round(contributionResults.totalContributions / contributionResults.finalBalance * 100)}% of final</p>
                      </div>
                      
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                          <p className="text-xs font-medium text-green-700">Investment Returns</p>
                        </div>
                        <p className="text-lg font-bold text-green-700">{formatCurrency(contributionResults.totalInterest)}</p>
                        <p className="text-xs text-green-600 mt-1">{Math.round(contributionResults.totalInterest / contributionResults.finalBalance * 100)}% of final</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Contribution Impact</h5>
                    
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <Clock className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Monthly Contribution</p>
                          <p className="text-xs text-gray-500">{formatCurrency(contributionResults.monthlyAmount)} per month for {years} years</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">{formatCurrency(contributionResults.totalContributions)}</p>
                          <p className="text-xs text-gray-500">Total contribution</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Compound Growth</p>
                          <p className="text-xs text-gray-500">{(activePortfolio.cagr * 100).toFixed(1)}% annual return for {years} years</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-green-600">{formatCurrency(contributionResults.totalInterest)}</p>
                          <p className="text-xs text-gray-500">Total earnings</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center pt-3 border-t border-gray-200">
                        <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                          <DollarSign className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Future Value</p>
                          <p className="text-xs text-gray-500">Total growth over {years} years</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-indigo-600">{formatCurrency(contributionResults.finalBalance)}</p>
                          <p className="text-xs text-gray-500">Final balance</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg text-sm">
            <h4 className="font-medium text-gray-700 mb-2">Tips to Maximize Your Contributions</h4>
            <ul className="space-y-1 text-gray-600 list-disc pl-5">
              <li>Starting early is one of the most powerful ways to build wealth due to compound interest.</li>
              <li>Consistently increase your contributions as your income grows.</li>
              <li>Take advantage of employer matching in retirement accounts if available.</li>
              <li>Set up automatic contributions to ensure consistent investing.</li>
              <li>Consider tax-advantaged accounts for long-term retirement savings.</li>
            </ul>
          </div>
        </div>
        
        {/* Interactive Examples moved to bottom */}
        <IntegratedDemoHelper />
        <QuickQuestions standalone={true} />
        
        {/* Chat window added at the bottom */}
        <ChatWindow 
          title="Ask About Contribution Strategies" 
          placeholder="Ask questions about saving rates, retirement contributions..."
          tabIdentifier="contribution"
        />
      </div>
    </div>
  );
};

export default MonthlyContributionCalculator;