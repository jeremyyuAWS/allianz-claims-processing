import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { AlertCircle, Clock, DollarSign, TrendingUp } from 'lucide-react';
import QuickQuestions from '../common/QuickQuestions';
import IntegratedDemoHelper from '../common/IntegratedDemoHelper';
import ChatWindow from '../common/ChatWindow';

const DelayedRetirementCalculator: React.FC = () => {
  const { retirementData, selectedPortfolio, portfolios } = useAppContext();
  const [delayYears, setDelayYears] = useState<number>(5);
  const [delayResults, setDelayResults] = useState<{
    originalBalance: number;
    delayedBalance: number;
    difference: number;
    percentageIncrease: number;
    annualWithdrawalOriginal: number;
    annualWithdrawalDelayed: number;
    withdrawalDifference: number;
  } | null>(null);
  
  const activePortfolio = selectedPortfolio || (portfolios.length > 0 ? portfolios[0] : null);
  
  useEffect(() => {
    if (activePortfolio && retirementData) {
      calculateDelayImpact();
    }
  }, [delayYears, activePortfolio, retirementData]);
  
  const calculateDelayImpact = () => {
    if (!activePortfolio || !retirementData) return;
    
    const { currentSavings, age, retirementAge, annualIncome } = retirementData;
    const yearsToRetirement = retirementAge - age;
    const annualContribution = annualIncome * 0.15; // 15% contribution rate
    
    // Calculate original retirement balance
    const originalBalance = calculateFutureValue(
      currentSavings,
      annualContribution,
      yearsToRetirement,
      activePortfolio.cagr
    );
    
    // Calculate delayed retirement balance
    const delayedBalance = calculateFutureValue(
      currentSavings,
      annualContribution,
      yearsToRetirement + delayYears,
      activePortfolio.cagr
    );
    
    const difference = delayedBalance - originalBalance;
    const percentageIncrease = (difference / originalBalance) * 100;
    
    // Calculate withdrawal amounts (assuming 4% withdrawal rate)
    const withdrawalRate = 0.04;
    const annualWithdrawalOriginal = originalBalance * withdrawalRate;
    const annualWithdrawalDelayed = delayedBalance * withdrawalRate;
    const withdrawalDifference = annualWithdrawalDelayed - annualWithdrawalOriginal;
    
    setDelayResults({
      originalBalance,
      delayedBalance,
      difference,
      percentageIncrease,
      annualWithdrawalOriginal,
      annualWithdrawalDelayed,
      withdrawalDifference
    });
  };
  
  // Helper function to calculate future value with regular contributions
  const calculateFutureValue = (
    principal: number,
    annualContribution: number,
    years: number,
    annualRate: number
  ): number => {
    let balance = principal;
    for (let i = 0; i < years; i++) {
      balance = balance * (1 + annualRate) + annualContribution;
    }
    return balance;
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  if (!activePortfolio || !retirementData) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-yellow-800 mb-2">No portfolio selected</h3>
        <p className="text-yellow-700">
          Please select a portfolio first to calculate the cost of delaying retirement.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Clock className="h-6 w-6 text-purple-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Cost of Delay Calculator</h3>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-purple-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-purple-800 mb-1">Understanding the Cost of Delay</h4>
                <p className="text-sm text-purple-700">
                  This calculator shows how delaying retirement can significantly increase your retirement savings and potential income.
                  See how working just a few more years can boost your retirement security through continued contributions,
                  additional years of compound growth, and a shorter withdrawal period.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Retirement Delay Parameters</h4>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Original Retirement Age
                    </label>
                    <span className="text-sm text-gray-500">{retirementData.retirementAge}</span>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-3">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Clock className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Current retirement timeline</p>
                        <p className="text-xs text-gray-500">
                          Planning to retire in {retirementData.retirementAge - retirementData.age} years at age {retirementData.retirementAge}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Delay Retirement By
                    </label>
                    <span className="text-sm text-gray-500">{delayYears} years</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={delayYears}
                      onChange={(e) => setDelayYears(parseInt(e.target.value, 10))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>1 year</span>
                    <span>10 years</span>
                  </div>
                </div>
                
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-3">
                      <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Clock className="h-5 w-5 text-purple-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Delayed retirement timeline</p>
                      <p className="text-xs text-gray-500">
                        Retiring in {retirementData.retirementAge - retirementData.age + delayYears} years at age {retirementData.retirementAge + delayYears}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">How Delay Builds Value</h4>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-sm mr-2 mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Additional Contributions</p>
                      <p className="text-xs text-gray-600">
                        {delayYears} more years of saving approx. {formatCurrency(retirementData.annualIncome * 0.15 * delayYears)} extra
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-sm mr-2 mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Compound Growth</p>
                      <p className="text-xs text-gray-600">
                        More time for your investments to grow at {(activePortfolio.cagr * 100).toFixed(1)}% per year
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-sm mr-2 mt-0.5">
                      3
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Shorter Withdrawal Period</p>
                      <p className="text-xs text-gray-600">
                        Funds need to last for fewer years in retirement
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              {delayResults && (
                <>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Impact of Delaying Retirement</h4>
                  
                  <div className="bg-purple-50 p-4 rounded-lg text-center mb-4">
                    <p className="text-sm text-purple-700 mb-1">Additional Retirement Savings</p>
                    <p className="text-3xl font-bold text-purple-700">{formatCurrency(delayResults.difference)}</p>
                    <p className="text-xs text-purple-600 mt-1">
                      By delaying retirement {delayYears} {delayYears === 1 ? 'year' : 'years'} 
                      (+{delayResults.percentageIncrease.toFixed(1)}%)
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center mb-1">
                        <TrendingUp className="h-4 w-4 text-gray-500 mr-1" />
                        <p className="text-xs font-medium text-gray-700">Original Balance</p>
                      </div>
                      <p className="text-lg font-bold text-gray-800">{formatCurrency(delayResults.originalBalance)}</p>
                      <p className="text-xs text-gray-500 mt-1">At age {retirementData.retirementAge}</p>
                    </div>
                    
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center mb-1">
                        <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                        <p className="text-xs font-medium text-green-700">Delayed Balance</p>
                      </div>
                      <p className="text-lg font-bold text-green-700">{formatCurrency(delayResults.delayedBalance)}</p>
                      <p className="text-xs text-green-600 mt-1">At age {retirementData.retirementAge + delayYears}</p>
                    </div>
                  </div>
                  
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Monthly Retirement Income (4% Rule)</h5>
                  
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Scenario
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Annual Income
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Monthly Income
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            Original Plan
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(delayResults.annualWithdrawalOriginal)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(delayResults.annualWithdrawalOriginal / 12)}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            Delayed Plan
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-700">
                            {formatCurrency(delayResults.annualWithdrawalDelayed)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-700">
                            {formatCurrency(delayResults.annualWithdrawalDelayed / 12)}
                          </td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            Difference
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-700">
                            +{formatCurrency(delayResults.withdrawalDifference)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-700">
                            +{formatCurrency(delayResults.withdrawalDifference / 12)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">What You Could Do With The Extra Income</h5>
                    
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-green-500 mr-2" />
                        <p className="text-sm text-gray-700">Increase your monthly budget by {formatCurrency(delayResults.withdrawalDifference / 12)}</p>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-green-500 mr-2" />
                        <p className="text-sm text-gray-700">Fund additional travel of {formatCurrency(delayResults.withdrawalDifference * 0.3)} per year</p>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-green-500 mr-2" />
                        <p className="text-sm text-gray-700">Increase healthcare budget by {formatCurrency(delayResults.withdrawalDifference * 0.2)} per year</p>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-green-500 mr-2" />
                        <p className="text-sm text-gray-700">Leave a larger estate for heirs or charity</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg text-sm">
            <h4 className="font-medium text-gray-700 mb-2">Retirement Timing Considerations</h4>
            <ul className="space-y-1 text-gray-600 list-disc pl-5">
              <li>Consider part-time work as a transition strategy to extend your income without fully delaying retirement.</li>
              <li>Balance financial benefits with quality of life and health considerations when deciding retirement timing.</li>
              <li>Delayed retirement can also increase your Social Security benefits if you delay claiming.</li>
              <li>Remember that personal fulfillment should be a key factor in your retirement decision.</li>
            </ul>
          </div>
        </div>
        
        {/* Interactive Examples moved to bottom */}
        <IntegratedDemoHelper />
        <QuickQuestions standalone={true} />
        
        {/* Chat window added at the bottom */}
        <ChatWindow 
          title="Ask About Retirement Timing" 
          placeholder="Ask questions about delaying retirement, working longer, etc..." 
          tabIdentifier="delay"
        />
      </div>
    </div>
  );
};

export default DelayedRetirementCalculator;