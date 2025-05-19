import React from 'react';
import { useAppContext } from '../context/AppContext';
import CustomerInsights from '../components/advisor/CustomerInsights';
import CustomizePortfolios from '../components/advisor/CustomizePortfolios';
import ETFRecommendations from '../components/advisor/ETFRecommendations';

const AdvisorLayout: React.FC = () => {
  const { activeTab, setActiveTab } = useAppContext();

  return (
    <div className="flex flex-col h-full">
      <div className="py-2 px-4 bg-white border-b border-gray-200">
        <div className="flex space-x-4 overflow-x-auto">
          <button
            className={`py-2 px-1 text-sm font-medium border-b-2 ${
              activeTab === 'plan'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('plan')}
          >
            Customer Insights
          </button>
          <button
            className={`py-2 px-1 text-sm font-medium border-b-2 ${
              activeTab === 'explore'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('explore')}
          >
            Customize Portfolios
          </button>
          <button
            className={`py-2 px-1 text-sm font-medium border-b-2 ${
              activeTab === 'etf'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('etf')}
          >
            ETF Recommendations
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        {activeTab === 'plan' && <CustomerInsights />}
        {activeTab === 'explore' && <CustomizePortfolios />}
        {activeTab === 'etf' && <ETFRecommendations />}
      </div>
    </div>
  );
};

export default AdvisorLayout;