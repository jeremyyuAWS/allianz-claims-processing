import React, { useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
  Printer, 
  Download,
  TrendingUp,
  BarChartBig,
  ShieldAlert,
  Share2
} from 'lucide-react';
import PortfolioDonutChart from '../visualizations/PortfolioDonutChart';
import ProjectionChart from '../visualizations/ProjectionChart';
import IntegratedDemoHelper from '../common/IntegratedDemoHelper';
import ChatWindow from '../common/ChatWindow';

const PrintableReport: React.FC = () => {
  const { portfolios, retirementData, selectedPortfolio } = useAppContext();
  const reportRef = useRef<HTMLDivElement>(null);
  
  const activePortfolio = selectedPortfolio || (portfolios.length > 0 ? portfolios[0] : null);
  
  if (!activePortfolio || !retirementData) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-yellow-50 p-6 rounded-lg max-w-lg">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">No portfolio selected</h3>
          <p className="text-yellow-700">
            Please complete the questionnaire and select a portfolio first to generate a printable report.
          </p>
        </div>
      </div>
    );
  }
  
  const handlePrint = () => {
    const printContent = reportRef.current?.innerHTML || '';
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>RetireWise - ${activePortfolio.type} Portfolio Report</title>
            <style>
              body { font-family: Arial, sans-serif; color: #333; line-height: 1.5; padding: 20px; }
              .page-break { page-break-after: always; }
              h1, h2, h3, h4 { margin-top: 20px; color: #1e3a8a; }
              table { width: 100%; border-collapse: collapse; margin: 15px 0; }
              th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
              th { background-color: #f8fafc; }
              .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ddd; padding-bottom: 15px; margin-bottom: 20px; }
              .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #64748b; }
              @media print {
                body { margin: 0; padding: 15px; }
                .no-print { display: none !important; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>RetireWise</h1>
              <div>
                <p>Portfolio Report</p>
                <p>Generated: ${new Date().toLocaleDateString()}</p>
              </div>
            </div>
            ${printContent}
            <div class="footer">
              <p>This report is generated based on the information you provided and includes projections that are not guaranteed. Past performance is not indicative of future results.</p>
              <p>© ${new Date().getFullYear()} RetireWise. All rights reserved.</p>
            </div>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
      }, 500);
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
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Portfolio Report</h2>
            <div className="flex space-x-2">
              <button
                onClick={handlePrint}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Printer className="w-4 h-4 mr-2" />
                <span>Print Report</span>
              </button>
              <button className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                <span>Download PDF</span>
              </button>
              <button className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                <Share2 className="w-4 h-4 mr-2" />
                <span>Share</span>
              </button>
            </div>
          </div>
          
          <div ref={reportRef} className="space-y-6">
            {/* Cover Page */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">RetireWise</h1>
                <h2 className="text-xl font-medium text-gray-700 mb-6">Your Personalized Retirement Plan</h2>
                
                <div className="mx-auto w-40 h-40 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                  <TrendingUp className="w-16 h-16 text-blue-600" />
                </div>
                
                <h3 className="text-2xl font-bold mb-2" style={{ color: activePortfolio.colorScheme.primary }}>
                  {activePortfolio.type} Portfolio
                </h3>
                <p className="text-gray-600 mb-4">Prepared for {retirementData.desiredLifestyle ? 'Your ' + retirementData.desiredLifestyle : 'Your Retirement'}</p>
                <p className="text-sm text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            
            {/* Client Profile */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Your Retirement Profile</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Personal Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Current Age:</span>
                      <span className="text-sm font-medium">{retirementData.age}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Retirement Age:</span>
                      <span className="text-sm font-medium">{retirementData.retirementAge}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Years to Retirement:</span>
                      <span className="text-sm font-medium">{retirementData.retirementAge - retirementData.age}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Risk Tolerance:</span>
                      <span className="text-sm font-medium">{retirementData.riskTolerance}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Financial Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Annual Income:</span>
                      <span className="text-sm font-medium">{formatCurrency(retirementData.annualIncome)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Current Savings:</span>
                      <span className="text-sm font-medium">{formatCurrency(retirementData.currentSavings)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Annual Contributions:</span>
                      <span className="text-sm font-medium">{formatCurrency(retirementData.annualIncome * 0.15)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Contribution Rate:</span>
                      <span className="text-sm font-medium">15%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {retirementData.desiredLifestyle && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-700 mb-2">Lifestyle Goals</h4>
                  <p className="text-sm text-gray-700">"{retirementData.desiredLifestyle}"</p>
                </div>
              )}
            </div>
            
            {/* Portfolio Summary */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                <span style={{ color: activePortfolio.colorScheme.primary }}>{activePortfolio.type}</span> Portfolio Summary
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white border rounded-lg shadow-sm overflow-hidden" style={{ borderTop: `4px solid ${activePortfolio.colorScheme.primary}` }}>
                  <div className="p-4">
                    <div className="flex items-center mb-2">
                      <TrendingUp className="w-5 h-5 mr-2 text-gray-500" />
                      <h4 className="text-sm font-medium text-gray-700">Projected Value</h4>
                    </div>
                    <p className="text-2xl font-bold mb-1" style={{ color: activePortfolio.colorScheme.primary }}>
                      {formatCurrency(activePortfolio.projectedFund)}
                    </p>
                    <p className="text-xs text-gray-500">At retirement age {retirementData.retirementAge}</p>
                  </div>
                </div>
                
                <div className="bg-white border rounded-lg shadow-sm overflow-hidden" style={{ borderTop: `4px solid ${activePortfolio.colorScheme.primary}` }}>
                  <div className="p-4">
                    <div className="flex items-center mb-2">
                      <BarChartBig className="w-5 h-5 mr-2 text-gray-500" />
                      <h4 className="text-sm font-medium text-gray-700">Annual Withdrawal</h4>
                    </div>
                    <p className="text-2xl font-bold mb-1" style={{ color: activePortfolio.colorScheme.primary }}>
                      {formatCurrency(activePortfolio.annualWithdrawal)}
                    </p>
                    <p className="text-xs text-gray-500">Based on the 4% rule</p>
                  </div>
                </div>
                
                <div className="bg-white border rounded-lg shadow-sm overflow-hidden" style={{ borderTop: `4px solid ${activePortfolio.colorScheme.primary}` }}>
                  <div className="p-4">
                    <div className="flex items-center mb-2">
                      <ShieldAlert className="w-5 h-5 mr-2 text-gray-500" />
                      <h4 className="text-sm font-medium text-gray-700">Risk Level</h4>
                    </div>
                    <p className="text-2xl font-bold mb-1" style={{ color: activePortfolio.colorScheme.primary }}>
                      {activePortfolio.riskLevel}
                    </p>
                    <p className="text-xs text-gray-500">Expected growth rate: {(activePortfolio.cagr * 100).toFixed(1)}% annually</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white border rounded-lg shadow-sm p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Portfolio Allocation</h4>
                  <div className="flex justify-center mb-4">
                    <div className="w-48 h-48">
                      <PortfolioDonutChart 
                        allocation={activePortfolio.allocation}
                        colorPrimary={activePortfolio.colorScheme.primary}
                        colorSecondary={activePortfolio.colorScheme.secondary}
                        colorAccent={activePortfolio.colorScheme.accent}
                      />
                    </div>
                  </div>
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
                
                <div className="bg-white border rounded-lg shadow-sm p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Portfolio Strategy</h4>
                  <p className="text-sm text-gray-600 mb-4">{activePortfolio.description}</p>
                  
                  <h5 className="text-xs font-medium text-gray-700 mb-2">Key Characteristics</h5>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
                    <div className="text-sm flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      <span>
                        {activePortfolio.riskLevel === 'High' 
                          ? 'Growth oriented' 
                          : activePortfolio.riskLevel === 'Medium'
                          ? 'Balanced approach'
                          : 'Conservative focus'}
                      </span>
                    </div>
                    <div className="text-sm flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      <span>
                        {activePortfolio.riskLevel === 'High' 
                          ? 'Higher volatility' 
                          : activePortfolio.riskLevel === 'Medium'
                          ? 'Moderate volatility'
                          : 'Lower volatility'}
                      </span>
                    </div>
                    <div className="text-sm flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      <span>
                        {activePortfolio.riskLevel === 'High' 
                          ? 'Long time horizon' 
                          : activePortfolio.riskLevel === 'Medium'
                          ? 'Medium time horizon'
                          : 'Shorter time horizon'}
                      </span>
                    </div>
                    <div className="text-sm flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      <span>
                        {activePortfolio.riskLevel === 'High' 
                          ? 'Favors stocks & growth' 
                          : activePortfolio.riskLevel === 'Medium'
                          ? 'Diversified mix'
                          : 'Emphasizes income & stability'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Projections */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Retirement Projections</h3>
              
              <div className="bg-white border rounded-lg shadow-sm p-4 mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Growth Projection</h4>
                <ProjectionChart
                  retirementData={retirementData}
                  annualReturn={activePortfolio.cagr}
                  colorScheme={{
                    primary: activePortfolio.colorScheme.primary,
                    secondary: activePortfolio.colorScheme.secondary
                  }}
                />
                <p className="text-xs text-gray-500 mt-2">
                  The chart above shows the projected growth of your portfolio over time, including the accumulation phase before retirement
                  and the distribution phase during retirement.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white border rounded-lg shadow-sm p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Key Milestones</h4>
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Projected Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-2 text-sm text-gray-900">{retirementData.age}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">{new Date().getFullYear()}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(retirementData.currentSavings)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm text-gray-900">{retirementData.age + 10}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">{new Date().getFullYear() + 10}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {formatCurrency(retirementData.currentSavings * Math.pow(1 + activePortfolio.cagr, 10) + retirementData.annualIncome * 0.15 * ((Math.pow(1 + activePortfolio.cagr, 10) - 1) / activePortfolio.cagr))}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm text-gray-900">{retirementData.age + 20}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">{new Date().getFullYear() + 20}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {formatCurrency(retirementData.currentSavings * Math.pow(1 + activePortfolio.cagr, 20) + retirementData.annualIncome * 0.15 * ((Math.pow(1 + activePortfolio.cagr, 20) - 1) / activePortfolio.cagr))}
                        </td>
                      </tr>
                      <tr className="bg-blue-50">
                        <td className="px-4 py-2 text-sm font-medium text-blue-900">{retirementData.retirementAge}</td>
                        <td className="px-4 py-2 text-sm text-blue-700">
                          {new Date().getFullYear() + (retirementData.retirementAge - retirementData.age)}
                        </td>
                        <td className="px-4 py-2 text-sm font-medium text-blue-900">
                          {formatCurrency(activePortfolio.projectedFund)}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm text-gray-900">{retirementData.retirementAge + 10}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {new Date().getFullYear() + (retirementData.retirementAge - retirementData.age) + 10}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {formatCurrency(activePortfolio.projectedFund * Math.pow(1 + (activePortfolio.cagr - 0.04), 10))}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="bg-white border rounded-lg shadow-sm p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Retirement Income</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-900 mb-1">Annual Withdrawal (4% Rule)</p>
                      <div className="flex items-center">
                        <div className="flex-1">
                          <div className="h-6 bg-gray-200 rounded-full">
                            <div 
                              className="h-6 rounded-full flex items-center pl-3 text-xs text-white font-medium" 
                              style={{ 
                                width: '100%',
                                backgroundColor: activePortfolio.colorScheme.primary 
                              }}
                            >
                              {formatCurrency(activePortfolio.annualWithdrawal)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-900 mb-1">Monthly Income</p>
                      <div className="flex items-center">
                        <div className="flex-1">
                          <div className="h-6 bg-gray-200 rounded-full">
                            <div 
                              className="h-6 rounded-full flex items-center pl-3 text-xs text-white font-medium" 
                              style={{ 
                                width: '100%',
                                backgroundColor: activePortfolio.colorScheme.secondary 
                              }}
                            >
                              {formatCurrency(activePortfolio.annualWithdrawal / 12)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <table className="min-w-full mt-4">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Income Source</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Annual Amount</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">% of Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-2 text-sm text-gray-900">Portfolio Withdrawal</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(activePortfolio.annualWithdrawal)}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">70%</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-sm text-gray-900">Social Security (Estimated)</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(retirementData.annualIncome * 0.15)}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">25%</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-sm text-gray-900">Other Income</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(retirementData.annualIncome * 0.03)}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">5%</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">Total Estimated Income</td>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">
                            {formatCurrency(activePortfolio.annualWithdrawal + retirementData.annualIncome * 0.15 + retirementData.annualIncome * 0.03)}
                          </td>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">100%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recommendations */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recommendations & Next Steps</h3>
              
              <div className="bg-white border rounded-lg shadow-sm p-4 mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Key Recommendations</h4>
                <div className="space-y-4">
                  <div className="flex">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-blue-700">1</span>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-1">Review Your Plan Regularly</h5>
                      <p className="text-sm text-gray-600">
                        Schedule annual check-ins to review your portfolio performance and make adjustments as needed based on changing circumstances or market conditions.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-blue-700">2</span>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-1">Diversify Your Investments</h5>
                      <p className="text-sm text-gray-600">
                        Ensure your portfolio is properly diversified across different asset classes, sectors, and geographies to help manage risk.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-blue-700">3</span>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-1">Consider Tax-Efficient Strategies</h5>
                      <p className="text-sm text-gray-600">
                        Maximize tax-advantaged accounts and consider tax-efficient withdrawal strategies during retirement to minimize your tax burden.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-blue-700">4</span>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-1">Establish an Emergency Fund</h5>
                      <p className="text-sm text-gray-600">
                        Maintain 3-6 months of living expenses in an easily accessible account to handle unexpected expenses without disrupting your retirement savings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Disclaimer */}
            <div className="bg-gray-50 p-4 rounded-lg text-xs text-gray-500">
              <p className="font-medium mb-2">Important Disclaimer</p>
              <p className="mb-2">
                This report is generated based on the information you provided and includes projections that are hypothetical in nature.
                The results shown are based on many assumptions that may not represent actual results.
                Past performance is not indicative of future results.
              </p>
              <p>
                This information is provided for educational purposes only and is not intended as investment, legal, or tax advice.
                Please consult with a qualified financial advisor, attorney, or tax professional regarding your specific situation.
              </p>
            </div>
          </div>
        </div>
        
        {/* Interactive Examples moved to bottom */}
        <IntegratedDemoHelper />
        
        {/* Chat window added at the bottom */}
        <ChatWindow 
          title="Ask About Your Retirement Report" 
          placeholder="Ask questions about your retirement projections, analysis, etc..."
          tabIdentifier="report"
        />
      </div>
    </div>
  );
};

export default PrintableReport;