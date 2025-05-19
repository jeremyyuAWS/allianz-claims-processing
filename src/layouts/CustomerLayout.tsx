import React from 'react';
import { useAppContext } from '../context/AppContext';
import PlanRetirement from '../components/customer/PlanRetirement';
import ExploreOptions from '../components/customer/ExploreOptions';
import PortfolioComparison from '../components/customer/PortfolioComparison';
import PrintableReport from '../components/customer/PrintableReport';
import TaxImplicationsCalculator from '../components/customer/TaxImplicationsCalculator';
import SocialSecurityEstimator from '../components/customer/SocialSecurityEstimator';
import MonthlyContributionCalculator from '../components/customer/MonthlyContributionCalculator';
import DelayedRetirementCalculator from '../components/customer/DelayedRetirementCalculator';

const CustomerLayout: React.FC = () => {
  const { activeTab, setActiveTab } = useAppContext();

  return (
    <div className="flex flex-col h-full">
      <div className="py-2 px-4 bg-white border-b border-gray-200">
        <div className="flex space-x-4 overflow-x-auto">
          <button
            className={`py-2 px-1 text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === 'plan'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('plan')}
          >
            Plan Your Retirement
          </button>
          <button
            className={`py-2 px-1 text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === 'explore'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('explore')}
          >
            Explore Options
          </button>
          <button
            className={`py-2 px-1 text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === 'compare'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('compare')}
          >
            Compare Portfolios
          </button>
          <button
            className={`py-2 px-1 text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === 'tax'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('tax')}
          >
            Tax Calculator
          </button>
          <button
            className={`py-2 px-1 text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === 'social'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('social')}
          >
            Social Security
          </button>
          <button
            className={`py-2 px-1 text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === 'contribution'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('contribution')}
          >
            Contribution Calculator
          </button>
          <button
            className={`py-2 px-1 text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === 'delay'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('delay')}
          >
            Cost of Delay
          </button>
          <button
            className={`py-2 px-1 text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === 'report'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('report')}
          >
            Printable Report
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        {activeTab === 'plan' && <PlanRetirement />}
        {activeTab === 'explore' && <ExploreOptions />}
        {activeTab === 'compare' && <PortfolioComparison />}
        {activeTab === 'tax' && <TaxImplicationsCalculator />}
        {activeTab === 'social' && <SocialSecurityEstimator />}
        {activeTab === 'contribution' && <MonthlyContributionCalculator />}
        {activeTab === 'delay' && <DelayedRetirementCalculator />}
        {activeTab === 'report' && <PrintableReport />}
      </div>
    </div>
  );
};

export default CustomerLayout;