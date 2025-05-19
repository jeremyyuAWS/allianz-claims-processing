import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Calculator, ArrowRight, Info, AlertTriangle, PiggyBank, DollarSign } from 'lucide-react';
import TaxGrowthChart from '../visualizations/TaxGrowthChart';
import TaxComparisonChart from '../visualizations/TaxComparisonChart';
import QuickQuestions from '../common/QuickQuestions';
import IntegratedDemoHelper from '../common/IntegratedDemoHelper';
import ChatWindow from '../common/ChatWindow';
import { formatCurrency, parseMoneyInput } from '../../utils/formatters';

const TaxImplicationsCalculator: React.FC = () => {
  const { retirementData } = useAppContext();
  const [initialInvestment, setInitialInvestment] = useState<number>(10000);
  const [annualContribution, setAnnualContribution] = useState<number>(6000);
  const [currentTaxRate, setCurrentTaxRate] = useState<number>(25);
  const [retirementTaxRate, setRetirementTaxRate] = useState<number>(15);
  const [investmentYears, setInvestmentYears] = useState<number>(30);
  const [expectedReturn, setExpectedReturn] = useState<number>(7);
  const [selectedAccount, setSelectedAccount] = useState<'traditional' | 'roth'>('traditional');
  const [results, setResults] = useState<{
    traditional: number;
    roth: number;
    taxable: number;
  } | null>(null);

  useEffect(() => {
    // Initialize with user data if available
    if (retirementData) {
      // Set annual contribution to 10% of income (capped at $22,500 for 2023)
      const contribution = Math.min(retirementData.annualIncome * 0.1, 22500);
      setAnnualContribution(Math.round(contribution));
      
      // Set investment years based on years to retirement
      setInvestmentYears(retirementData.retirementAge - retirementData.age);
      
      // Initial investment could be a portion of current savings
      setInitialInvestment(Math.min(retirementData.currentSavings * 0.25, 50000));
      
      // Set tax rates based on income (simplified)
      setCurrentTaxRate(estimateTaxRate(retirementData.annualIncome));
      setRetirementTaxRate(estimateTaxRate(retirementData.annualIncome * 0.8)); // Assume 80% of current income
      
      // Set expected return based on risk tolerance
      if (retirementData.riskTolerance === 'High') {
        setExpectedReturn(8);
      } else if (retirementData.riskTolerance === 'Low') {
        setExpectedReturn(5);
      } else {
        setExpectedReturn(7);
      }
    }
    
    calculateTaxImplications();
  }, [retirementData]);

  useEffect(() => {
    calculateTaxImplications();
  }, [initialInvestment, annualContribution, currentTaxRate, retirementTaxRate, investmentYears, expectedReturn]);

  // Simple tax bracket estimator function
  const estimateTaxRate = (income: number): number => {
    if (income < 40000) return 12;
    if (income < 90000) return 22;
    if (income < 170000) return 24;
    if (income < 220000) return 32;
    if (income < 550000) return 35;
    return 37;
  };

  const calculateTaxImplications = () => {
    // Convert percentage to decimal
    const annualReturnRate = expectedReturn / 100;
    const currentTaxRateDecimal = currentTaxRate / 100;
    const retirementTaxRateDecimal = retirementTaxRate / 100;

    // Traditional IRA/401(k)
    // Tax-deferred growth, taxed on withdrawal
    let traditionalValue = calculateCompoundGrowth(
      initialInvestment,
      annualContribution,
      annualReturnRate,
      investmentYears
    );
    const traditionalAfterTax = traditionalValue * (1 - retirementTaxRateDecimal);

    // Roth IRA/401(k)
    // Contributions are after-tax, but growth is tax-free
    const rothContribution = annualContribution * (1 - currentTaxRateDecimal);
    const rothInitial = initialInvestment * (1 - currentTaxRateDecimal);
    const rothValue = calculateCompoundGrowth(
      rothInitial,
      rothContribution,
      annualReturnRate,
      investmentYears
    );

    // Taxable Account
    // No tax advantages, but more flexible
    // Simplified: pay taxes on gains annually (in reality, it's more complex with dividends, capital gains, etc.)
    const taxableTaxEffectiveReturn = annualReturnRate * (1 - currentTaxRateDecimal * 0.7); // Assuming about 70% of gains are taxed annually
    const taxableValue = calculateCompoundGrowth(
      initialInvestment * (1 - currentTaxRateDecimal),
      annualContribution * (1 - currentTaxRateDecimal),
      taxableTaxEffectiveReturn,
      investmentYears
    );

    setResults({
      traditional: traditionalAfterTax,
      roth: rothValue,
      taxable: taxableValue
    });
  };

  const calculateCompoundGrowth = (
    principal: number,
    annualAddition: number,
    rate: number,
    years: number
  ): number => {
    let total = principal;
    for (let year = 0; year < years; year++) {
      total = total * (1 + rate) + annualAddition;
    }
    return total;
  };

  const getRecommendation = (): string => {
    if (!results) return '';

    if (currentTaxRate > retirementTaxRate + 5) {
      return 'A Traditional retirement account may be advantageous since your current tax rate is significantly higher than your expected retirement tax rate.';
    } else if (retirementTaxRate > currentTaxRate + 5) {
      return 'A Roth retirement account may be beneficial since your expected retirement tax rate is significantly higher than your current tax rate.';
    } else {
      return 'Given similar tax rates now and in retirement, consider diversifying between both Traditional and Roth accounts for tax flexibility.';
    }
  };

  const getTaxBenefitOverTaxable = (): string => {
    if (!results) return '';
    
    const traditionalBenefit = results.traditional - results.taxable;
    const rothBenefit = results.roth - results.taxable;
    
    const maxBenefit = Math.max(traditionalBenefit, rothBenefit);
    const accountType = traditionalBenefit > rothBenefit ? 'Traditional' : 'Roth';
    
    const percentage = Math.round((maxBenefit / results.taxable) * 100);
    
    return `Using a ${accountType} retirement account could provide approximately ${percentage}% more retirement funds (${formatCurrency(maxBenefit)}) compared to a regular taxable investment account.`;
  };

  // Handle input change with support for abbreviations
  const handleInitialInvestmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseMoneyInput(e.target.value);
    setInitialInvestment(Math.max(0, value));
  };

  const handleAnnualContributionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseMoneyInput(e.target.value);
    setAnnualContribution(Math.max(0, value));
  };

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center mb-6">
            <Calculator className="h-6 w-6 text-blue-500 mr-2" />
            <h3 className="text-xl font-bold text-gray-900">Tax-Advantaged Retirement Account Comparison</h3>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg mb-6 flex items-start">
            <Info className="h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-amber-800 mb-1">How taxes affect your retirement savings</h4>
              <p className="text-sm text-amber-700">
                Your choice of retirement account type can significantly impact your final savings due to tax treatment differences.
                This calculator helps you compare Traditional (tax-deferred) vs. Roth (tax-free growth) vs. Taxable accounts 
                based on your specific situation.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Retirement Account Comparison</h4>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Type
                  </label>
                  <div className="flex space-x-4">
                    <button
                      className={`flex-1 py-2 rounded-md text-sm font-medium ${
                        selectedAccount === 'traditional'
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                      }`}
                      onClick={() => setSelectedAccount('traditional')}
                    >
                      Traditional
                    </button>
                    <button
                      className={`flex-1 py-2 rounded-md text-sm font-medium ${
                        selectedAccount === 'roth'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                      }`}
                      onClick={() => setSelectedAccount('roth')}
                    >
                      Roth
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Initial Investment
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="text"
                        value={initialInvestment}
                        onChange={handleInitialInvestmentChange}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md py-2 border"
                        placeholder="10000 or 10K"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Annual Contribution
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="text"
                        value={annualContribution}
                        onChange={handleAnnualContributionChange}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md py-2 border"
                        placeholder="6000 or 6K"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Tax Rate
                    </label>
                    <div className="flex items-center">
                      <input
                        type="range"
                        min="10"
                        max="40"
                        value={currentTaxRate}
                        onChange={(e) => setCurrentTaxRate(Number(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700 w-16 text-right">
                        {currentTaxRate}%
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Retirement Tax Rate
                    </label>
                    <div className="flex items-center">
                      <input
                        type="range"
                        min="10"
                        max="40"
                        value={retirementTaxRate}
                        onChange={(e) => setRetirementTaxRate(Number(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700 w-16 text-right">
                        {retirementTaxRate}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Investment Years
                    </label>
                    <div className="flex items-center">
                      <input
                        type="range"
                        min="5"
                        max="50"
                        step="1"
                        value={investmentYears}
                        onChange={(e) => setInvestmentYears(Number(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700 w-16 text-right">
                        {investmentYears} years
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expected Annual Return
                    </label>
                    <div className="flex items-center">
                      <input
                        type="range"
                        min="2"
                        max="12"
                        step="0.5"
                        value={expectedReturn}
                        onChange={(e) => setExpectedReturn(Number(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700 w-16 text-right">
                        {expectedReturn}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Comparison Chart */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Final Account Value Comparison</h4>
                <div className="h-64">
                  {results && (
                    <TaxComparisonChart
                      traditionalTotal={results.traditional}
                      rothTotal={results.roth}
                      taxableTotal={results.taxable}
                      width={500}
                      height={250}
                    />
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <div className="flex items-center mb-2">
                  <PiggyBank className="h-5 w-5 text-blue-600 mr-2" />
                  <h4 className="text-lg font-medium text-blue-800">After-Tax Value at Retirement</h4>
                </div>
                {results && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-blue-700">Traditional (After-Tax):</span>
                      <span className="text-xl font-bold text-blue-900">{formatCurrency(results.traditional)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-700">Roth (Tax-Free):</span>
                      <span className="text-xl font-bold text-green-900">{formatCurrency(results.roth)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Taxable Account:</span>
                      <span className="text-xl font-bold text-gray-900">{formatCurrency(results.taxable)}</span>
                    </div>
                    <div className="pt-3 border-t border-blue-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-indigo-700">Tax-Advantaged Benefit:</span>
                        <span className="text-xl font-bold text-indigo-900">
                          {formatCurrency(Math.max(results.traditional, results.roth) - results.taxable)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg mb-6">
                <div className="border-b border-gray-200 p-4">
                  <h4 className="text-lg font-medium text-gray-900">Growth Visualization</h4>
                  <p className="text-sm text-gray-600">
                    See how your chosen account type grows over time compared to a taxable account.
                  </p>
                </div>
                <div className="p-4 h-64">
                  <TaxGrowthChart
                    principal={initialInvestment}
                    annualContribution={annualContribution}
                    years={investmentYears}
                    annualReturn={expectedReturn / 100}
                    width={500}
                    height={250}
                    isTraditional={selectedAccount === 'traditional'}
                    currentTaxRate={currentTaxRate}
                    retirementTaxRate={retirementTaxRate}
                    colorScheme={{
                      traditional: '#3b82f6',
                      roth: '#10b981',
                      taxable: '#6b7280'
                    }}
                  />
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg mb-6">
                <div className="p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">AI Tax Strategy Recommendation</h4>
                  <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
                    <p className="text-sm text-blue-800">{getRecommendation()}</p>
                  </div>
                  
                  <div className="mt-4 p-3 bg-green-50 rounded-md border border-green-100">
                    <p className="text-sm text-green-800">{getTaxBenefitOverTaxable()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 grid md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <DollarSign className="h-5 w-5 text-blue-700" />
                </div>
                <h4 className="font-medium text-gray-900">Traditional IRA/401(k)</h4>
              </div>
              <ul className="space-y-1 text-sm text-gray-600 mb-3">
                <li>• Tax-deductible contributions</li>
                <li>• Tax-deferred growth</li>
                <li>• Taxed as ordinary income on withdrawal</li>
                <li>• Required minimum distributions (RMDs) at 73</li>
                <li>• 10% penalty on early withdrawals (pre-59½)</li>
              </ul>
              <p className="text-xs text-gray-500">
                Best when you expect to be in a lower tax bracket in retirement.
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <DollarSign className="h-5 w-5 text-green-700" />
                </div>
                <h4 className="font-medium text-gray-900">Roth IRA/401(k)</h4>
              </div>
              <ul className="space-y-1 text-sm text-gray-600 mb-3">
                <li>• After-tax contributions</li>
                <li>• Tax-free growth</li>
                <li>• Tax-free qualified withdrawals</li>
                <li>• No required minimum distributions (Roth IRA)</li>
                <li>• Penalty-free withdrawal of contributions</li>
              </ul>
              <p className="text-xs text-gray-500">
                Best when you expect to be in a higher tax bracket in retirement.
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                  <DollarSign className="h-5 w-5 text-gray-700" />
                </div>
                <h4 className="font-medium text-gray-900">Taxable Account</h4>
              </div>
              <ul className="space-y-1 text-sm text-gray-600 mb-3">
                <li>• After-tax contributions</li>
                <li>• Dividends and interest taxed yearly</li>
                <li>• Capital gains taxed when realized (selling)</li>
                <li>• Long-term gains (&gt;1 year) taxed at favorable rates</li>
                <li>• No contribution limits or withdrawal penalties</li>
              </ul>
              <p className="text-xs text-gray-500">
                Best for additional savings or accessing funds before retirement.
              </p>
            </div>
          </div>
          
          <div className="mt-6 bg-amber-50 p-4 rounded-lg flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-amber-800 mb-1">Disclaimer</h4>
              <p className="text-sm text-amber-700">
                This calculator provides hypothetical examples for educational purposes only and should not
                be considered tax or investment advice. Consult with a qualified financial advisor, tax
                professional, or retirement planner regarding your specific situation.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Tax Strategy Insights</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Key Tax Planning Strategies</h4>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-sm mr-2 mt-0.5">
                    1
                  </div>
                  <div>
                    <h5 className="text-base font-medium text-gray-900">Tax Diversification</h5>
                    <p className="text-sm text-gray-600">
                      Consider having a mix of pre-tax, Roth, and taxable accounts to give yourself flexibility in managing your tax liability during retirement.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-sm mr-2 mt-0.5">
                    2
                  </div>
                  <div>
                    <h5 className="text-base font-medium text-gray-900">Roth Conversion Ladder</h5>
                    <p className="text-sm text-gray-600">
                      Gradually convert Traditional IRA funds to Roth during lower-income years to minimize taxes while building tax-free growth.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-sm mr-2 mt-0.5">
                    3
                  </div>
                  <div>
                    <h5 className="text-base font-medium text-gray-900">Tax-Loss Harvesting</h5>
                    <p className="text-sm text-gray-600">
                      Strategically sell investments at a loss to offset capital gains, potentially reducing your tax liability by up to $3,000 per year.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-sm mr-2 mt-0.5">
                    4
                  </div>
                  <div>
                    <h5 className="text-base font-medium text-gray-900">Managing RMDs</h5>
                    <p className="text-sm text-gray-600">
                      Plan ahead for Required Minimum Distributions from traditional accounts, which start at age 73 and can push you into higher tax brackets.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">AI Tailored Insights</h4>
              
              <div className="mb-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                <h5 className="text-sm font-medium text-indigo-800 mb-2">Personalized Recommendation</h5>
                <p className="text-sm text-indigo-700">
                  {currentTaxRate > retirementTaxRate + 10 ? (
                    <>
                      <strong>Focus on Traditional accounts now.</strong> With your current tax rate {currentTaxRate}% 
                      significantly higher than your expected retirement tax rate {retirementTaxRate}%, 
                      you'll likely benefit from the immediate tax deduction.
                    </>
                  ) : currentTaxRate + 10 < retirementTaxRate ? (
                    <>
                      <strong>Prioritize Roth contributions.</strong> Since your expected retirement tax rate {retirementTaxRate}% 
                      is higher than your current tax rate {currentTaxRate}%, 
                      paying taxes now will likely result in greater long-term benefits.
                    </>
                  ) : (
                    <>
                      <strong>Consider a mixed strategy.</strong> With your current tax rate {currentTaxRate}% and 
                      expected retirement tax rate {retirementTaxRate}% relatively close, 
                      diversifying between Traditional and Roth accounts offers flexibility.
                    </>
                  )}
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Common Misconceptions</h5>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <ArrowRight className="h-4 w-4 text-blue-500 mt-1 mr-2 flex-shrink-0" />
                    <span><strong>Myth:</strong> Roth accounts are always better than Traditional accounts.</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="h-4 w-4 text-blue-500 mt-1 mr-2 flex-shrink-0" />
                    <span><strong>Myth:</strong> You can't access retirement funds before age 59½ without penalties.</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="h-4 w-4 text-blue-500 mt-1 mr-2 flex-shrink-0" />
                    <span><strong>Myth:</strong> Higher income always means you should choose Traditional accounts.</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="h-4 w-4 text-blue-500 mt-1 mr-2 flex-shrink-0" />
                    <span><strong>Myth:</strong> Tax rates in retirement will always be lower than during working years.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Interactive Examples moved to bottom */}
        <IntegratedDemoHelper />
        <QuickQuestions standalone={true} />
        
        {/* Chat window added at the bottom */}
        <ChatWindow 
          title="Ask About Tax Strategies" 
          placeholder="Ask about tax-efficient retirement strategies..."
          tabIdentifier="tax"
        />
      </div>
    </div>
  );
};

export default TaxImplicationsCalculator;