import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import PortfolioDonutChart from '../visualizations/PortfolioDonutChart';
import PortfolioEditor from './PortfolioEditor';
import IntegratedDemoHelper from '../common/IntegratedDemoHelper';

const CustomizePortfolios: React.FC = () => {
  const { portfolios } = useAppContext();
  const [activeTab, setActiveTab] = useState('Aggressive');

  if (portfolios.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-yellow-50 p-6 rounded-lg max-w-lg">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">No portfolios generated yet</h3>
          <p className="text-yellow-700">
            Please complete the client questionnaire in the "Customer Insights" tab first to generate portfolio options.
          </p>
        </div>
      </div>
    );
  }

  const activePortfolio = portfolios.find(p => p.type === activeTab);

  if (!activePortfolio) {
    return null;
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <IntegratedDemoHelper />
      
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Customize Client Portfolios</h2>
        <p className="text-gray-600">
          Use the AI-powered editor to customize each portfolio option. You can adjust allocations, add asset classes, 
          or modify the strategy using natural language commands.
        </p>
      </div>

      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          {portfolios.map((portfolio) => (
            <button
              key={portfolio.type}
              className={`py-2 px-4 text-sm font-medium mr-2 focus:outline-none ${
                activeTab === portfolio.type
                  ? `border-b-2 text-${portfolio.type === 'Aggressive' ? 'red' : portfolio.type === 'Balanced' ? 'blue' : 'green'}-600 border-${portfolio.type === 'Aggressive' ? 'red' : portfolio.type === 'Balanced' ? 'blue' : 'green'}-600`
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(portfolio.type)}
            >
              {portfolio.type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-medium text-lg text-gray-900 mb-4">{activePortfolio.type} Portfolio</h3>
            
            <div className="flex justify-center mb-4">
              <PortfolioDonutChart 
                allocation={activePortfolio.allocation}
                colorPrimary={activePortfolio.colorScheme.primary}
                colorSecondary={activePortfolio.colorScheme.secondary}
                colorAccent={activePortfolio.colorScheme.accent}
              />
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Projected Outcomes</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Projected Fund:</span>
                    <span className="font-medium">${Math.round(activePortfolio.projectedFund).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Annual Withdrawal:</span>
                    <span className="font-medium">${Math.round(activePortfolio.annualWithdrawal).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">CAGR:</span>
                    <span className="font-medium">{(activePortfolio.cagr * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Risk Level:</span>
                    <span className="font-medium">{activePortfolio.riskLevel}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Current Allocation</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Stocks:</span>
                    <span className="font-medium">{activePortfolio.allocation.stocks}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Bonds:</span>
                    <span className="font-medium">{activePortfolio.allocation.bonds}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">REITs:</span>
                    <span className="font-medium">{activePortfolio.allocation.reits}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">International:</span>
                    <span className="font-medium">{activePortfolio.allocation.international}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Alternatives:</span>
                    <span className="font-medium">{activePortfolio.allocation.alternatives}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Cash:</span>
                    <span className="font-medium">{activePortfolio.allocation.cash}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <PortfolioEditor portfolioType={activePortfolio.type} />
        </div>
      </div>
    </div>
  );
};

export default CustomizePortfolios;