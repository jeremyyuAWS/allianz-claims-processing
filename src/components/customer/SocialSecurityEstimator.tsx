import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { DollarSign } from 'lucide-react';
import QuickQuestions from '../common/QuickQuestions';
import IntegratedDemoHelper from '../common/IntegratedDemoHelper';
import ChatWindow from '../common/ChatWindow';

const SocialSecurityEstimator: React.FC = () => {
  const { retirementData, selectedPortfolio, portfolios } = useAppContext();
  const [claimingAge, setClaimingAge] = useState<number>(67);
  const [workedYears, setWorkedYears] = useState<number>(35);
  const [averageIncome, setAverageIncome] = useState<number>(retirementData?.annualIncome || 90000);
  
  const activePortfolio = selectedPortfolio || (portfolios.length > 0 ? portfolios[0] : null);
  
  if (!retirementData) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-yellow-800 mb-2">No retirement data available</h3>
        <p className="text-yellow-700">
          Please complete the questionnaire first to calculate Social Security benefits.
        </p>
      </div>
    );
  }
  
  // Calculate primary insurance amount (PIA) - simplified
  // This is a simplified calculation and not an accurate representation of actual SS calculations
  const calculatePIA = (avgIncome: number, years: number) => {
    // Cap the income at the Social Security wage base
    const cappedIncome = Math.min(avgIncome, 160000);
    
    // Adjust for less than 35 years of work
    const reductionFactor = Math.min(1, years / 35);
    
    // Base calculation
    let pia = 0;
    
    // First bend point - 90% of first $1,115
    pia += Math.min(1115, cappedIncome) * 0.9;
    
    // Second bend point - 32% of income between $1,115 and $6,721
    if (cappedIncome > 1115) {
      pia += Math.min(6721 - 1115, cappedIncome - 1115) * 0.32;
    }
    
    // Third bend point - 15% of income over $6,721
    if (cappedIncome > 6721) {
      pia += (cappedIncome - 6721) * 0.15;
    }
    
    // Apply reduction for less than 35 years
    pia *= reductionFactor;
    
    // Max benefit is capped
    return Math.min(pia, 3900);
  };
  
  // Calculate adjustments for claiming age
  const calculateAgeAdjustment = (pia: number, age: number) => {
    // Simplified adjustment factors
    if (age < 67) {
      // Reduction for early claiming (up to 30% reduction at age 62)
      const reductionPercentage = (67 - age) * 6;
      return pia * (1 - reductionPercentage / 100);
    } else if (age > 67) {
      // Increase for delayed claiming (8% per year up to age 70)
      const increasePercentage = (age - 67) * 8;
      return pia * (1 + increasePercentage / 100);
    }
    return pia;
  };
  
  const baseMonthlyBenefit = calculatePIA(averageIncome, workedYears);
  const adjustedMonthlyBenefit = calculateAgeAdjustment(baseMonthlyBenefit, claimingAge);
  const annualBenefit = adjustedMonthlyBenefit * 12;
  
  // Portfolio comparison
  const portfolioReplacement = activePortfolio 
    ? (annualBenefit / activePortfolio.annualWithdrawal) * 100 
    : 0;
  
  // Total income in retirement with Social Security
  const totalAnnualIncome = activePortfolio 
    ? activePortfolio.annualWithdrawal + annualBenefit 
    : annualBenefit;
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <DollarSign className="h-6 w-6 text-green-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Social Security Estimator</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Customize Your Estimate</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Social Security Claiming Age
                  </label>
                  <div className="flex items-center">
                    <input
                      type="range"
                      min="62"
                      max="70"
                      step="1"
                      value={claimingAge}
                      onChange={(e) => setClaimingAge(parseInt(e.target.value, 10))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700 w-16 text-right">{claimingAge} years</span>
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>Early (62)</span>
                    <span>Full (67)</span>
                    <span>Delayed (70)</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Years Worked (paying into Social Security)
                  </label>
                  <div className="flex items-center">
                    <input
                      type="range"
                      min="10"
                      max="40"
                      step="1"
                      value={workedYears}
                      onChange={(e) => setWorkedYears(parseInt(e.target.value, 10))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700 w-16 text-right">{workedYears} years</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Average Annual Income (career average)
                  </label>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">$</span>
                    <input
                      type="number"
                      value={averageIncome}
                      onChange={(e) => setAverageIncome(Math.max(0, parseInt(e.target.value, 10)))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter average annual income"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h5 className="text-xs font-medium text-gray-700 mb-2">About Claiming Age:</h5>
                <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
                  <li>Your Full Retirement Age (FRA) is 67 for those born after 1960</li>
                  <li>Claiming early (62-66) reduces your benefit permanently</li>
                  <li>Delaying past FRA (68-70) increases your benefit up to 8% per year</li>
                  <li>Maximum benefit occurs at age 70; no increase for waiting longer</li>
                </ul>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Your Projected Benefit</h4>
              
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <div className="flex flex-col items-center">
                  <p className="text-sm text-green-700 mb-1">Estimated Monthly Benefit at Age {claimingAge}</p>
                  <p className="text-3xl font-bold text-green-700 mb-1">{formatCurrency(adjustedMonthlyBenefit)}</p>
                  <p className="text-sm text-green-600">Annual: {formatCurrency(annualBenefit)}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Benefit Breakdown</h5>
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Base benefit (at age 67):</span>
                      <span className="text-sm font-medium">{formatCurrency(baseMonthlyBenefit)} / month</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Age adjustment:</span>
                      <span className="text-sm font-medium">
                        {claimingAge < 67 ? '-' : '+'}{Math.abs(Math.round((adjustedMonthlyBenefit - baseMonthlyBenefit) / baseMonthlyBenefit * 100))}%
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="text-sm text-gray-600">Total estimated benefit:</span>
                      <span className="text-sm font-medium">{formatCurrency(adjustedMonthlyBenefit)} / month</span>
                    </div>
                  </div>
                </div>
                
                {activePortfolio && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Compared to Portfolio Income</h5>
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Portfolio withdrawal:</span>
                        <span className="text-sm font-medium">{formatCurrency(activePortfolio.annualWithdrawal)} / year</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Social Security:</span>
                        <span className="text-sm font-medium">{formatCurrency(annualBenefit)} / year</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Total income:</span>
                        <span className="text-sm font-medium">{formatCurrency(totalAnnualIncome)} / year</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="text-sm text-gray-600">Social Security % of total:</span>
                        <span className="text-sm font-medium">{Math.round(portfolioReplacement)}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-lg text-sm">
            <h4 className="font-medium text-gray-700 mb-2">Important Notes</h4>
            <ul className="space-y-1 text-gray-600 list-disc pl-5">
              <li>This is a simplified estimate. Actual Social Security benefits are calculated based on your highest 35 years of earnings.</li>
              <li>Social Security benefits may be taxable depending on your total retirement income.</li>
              <li>Benefits are typically adjusted for inflation annually (not reflected here).</li>
              <li>For a personalized calculation, visit <a href="https://www.ssa.gov/myaccount/" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">ssa.gov/myaccount</a></li>
            </ul>
          </div>
        </div>
        
        {/* Interactive Examples moved to bottom */}
        <IntegratedDemoHelper />
        <QuickQuestions standalone={true} />
        
        {/* Chat window added at the bottom */}
        <ChatWindow 
          title="Ask About Social Security Benefits" 
          placeholder="Ask questions about claiming strategies, benefit calculations, etc..."
          tabIdentifier="social"
        />
      </div>
    </div>
  );
};

export default SocialSecurityEstimator;