import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { TrendingUp, AlertTriangle, Search, ExternalLink } from 'lucide-react';
import IntegratedDemoHelper from '../common/IntegratedDemoHelper';

interface ETF {
  ticker: string;
  name: string;
  type: 'stocks' | 'bonds' | 'reits' | 'international' | 'alternatives' | 'cash';
  expenseRatio: number;
  category: string;
  risk: 'Low' | 'Medium' | 'High';
  url: string;
}

const ETFRecommendations: React.FC = () => {
  const { portfolios } = useAppContext();
  const [activePortfolio, setActivePortfolio] = useState(portfolios.length > 0 ? portfolios[0] : null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
  if (portfolios.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-yellow-50 p-6 rounded-lg max-w-lg">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">No portfolios generated yet</h3>
          <p className="text-yellow-700">
            Please complete the client questionnaire first to generate portfolio options.
          </p>
        </div>
      </div>
    );
  }

  // Sample ETF database
  const etfDatabase: ETF[] = [
    // Stocks
    { ticker: 'VTI', name: 'Vanguard Total Stock Market ETF', type: 'stocks', expenseRatio: 0.03, category: 'Total Market', risk: 'Medium', url: 'https://investor.vanguard.com/investment-products/etfs/profile/vti' },
    { ticker: 'SPY', name: 'SPDR S&P 500 ETF Trust', type: 'stocks', expenseRatio: 0.09, category: 'Large Cap', risk: 'Medium', url: 'https://www.ssga.com/us/en/institutional/etfs/funds/spdr-sp-500-etf-trust-spy' },
    { ticker: 'QQQ', name: 'Invesco QQQ Trust', type: 'stocks', expenseRatio: 0.20, category: 'Technology', risk: 'High', url: 'https://www.invesco.com/us/financial-products/etfs/product-detail?audienceType=Investor&ticker=QQQ' },
    { ticker: 'VUG', name: 'Vanguard Growth ETF', type: 'stocks', expenseRatio: 0.04, category: 'Growth', risk: 'High', url: 'https://investor.vanguard.com/investment-products/etfs/profile/vug' },
    { ticker: 'VTV', name: 'Vanguard Value ETF', type: 'stocks', expenseRatio: 0.04, category: 'Value', risk: 'Medium', url: 'https://investor.vanguard.com/investment-products/etfs/profile/vtv' },
    { ticker: 'VB', name: 'Vanguard Small-Cap ETF', type: 'stocks', expenseRatio: 0.05, category: 'Small Cap', risk: 'High', url: 'https://investor.vanguard.com/investment-products/etfs/profile/vb' },
    
    // Bonds
    { ticker: 'BND', name: 'Vanguard Total Bond Market ETF', type: 'bonds', expenseRatio: 0.03, category: 'Total Bond', risk: 'Low', url: 'https://investor.vanguard.com/investment-products/etfs/profile/bnd' },
    { ticker: 'AGG', name: 'iShares Core U.S. Aggregate Bond ETF', type: 'bonds', expenseRatio: 0.03, category: 'Total Bond', risk: 'Low', url: 'https://www.ishares.com/us/products/239458/ishares-core-total-us-bond-market-etf' },
    { ticker: 'GOVT', name: 'iShares U.S. Treasury Bond ETF', type: 'bonds', expenseRatio: 0.05, category: 'Government', risk: 'Low', url: 'https://www.ishares.com/us/products/239456/ishares-us-treasury-bond-etf' },
    { ticker: 'LQD', name: 'iShares iBoxx $ Investment Grade Corporate Bond ETF', type: 'bonds', expenseRatio: 0.14, category: 'Corporate', risk: 'Medium', url: 'https://www.ishares.com/us/products/239566/ishares-iboxx-investment-grade-corporate-bond-etf' },
    { ticker: 'VCSH', name: 'Vanguard Short-Term Corporate Bond ETF', type: 'bonds', expenseRatio: 0.04, category: 'Short-Term', risk: 'Low', url: 'https://investor.vanguard.com/investment-products/etfs/profile/vcsh' },
    { ticker: 'VTIP', name: 'Vanguard Short-Term Inflation-Protected Securities ETF', type: 'bonds', expenseRatio: 0.04, category: 'Inflation-Protected', risk: 'Low', url: 'https://investor.vanguard.com/investment-products/etfs/profile/vtip' },
    
    // REITs
    { ticker: 'VNQ', name: 'Vanguard Real Estate ETF', type: 'reits', expenseRatio: 0.12, category: 'Real Estate', risk: 'Medium', url: 'https://investor.vanguard.com/investment-products/etfs/profile/vnq' },
    { ticker: 'IYR', name: 'iShares U.S. Real Estate ETF', type: 'reits', expenseRatio: 0.41, category: 'Real Estate', risk: 'Medium', url: 'https://www.ishares.com/us/products/239520/ishares-us-real-estate-etf' },
    { ticker: 'SCHH', name: 'Schwab U.S. REIT ETF', type: 'reits', expenseRatio: 0.07, category: 'Real Estate', risk: 'Medium', url: 'https://www.schwabfunds.com/products/schh' },
    
    // International
    { ticker: 'VXUS', name: 'Vanguard Total International Stock ETF', type: 'international', expenseRatio: 0.07, category: 'International', risk: 'Medium', url: 'https://investor.vanguard.com/investment-products/etfs/profile/vxus' },
    { ticker: 'EFA', name: 'iShares MSCI EAFE ETF', type: 'international', expenseRatio: 0.32, category: 'Developed Markets', risk: 'Medium', url: 'https://www.ishares.com/us/products/239623/ishares-msci-eafe-etf' },
    { ticker: 'VWO', name: 'Vanguard FTSE Emerging Markets ETF', type: 'international', expenseRatio: 0.08, category: 'Emerging Markets', risk: 'High', url: 'https://investor.vanguard.com/investment-products/etfs/profile/vwo' },
    { ticker: 'IXUS', name: 'iShares Core MSCI Total International Stock ETF', type: 'international', expenseRatio: 0.07, category: 'International', risk: 'Medium', url: 'https://www.ishares.com/us/products/244048/ishares-core-msci-total-international-stock-etf' },
    
    // Alternatives
    { ticker: 'GLD', name: 'SPDR Gold Shares', type: 'alternatives', expenseRatio: 0.40, category: 'Commodities', risk: 'High', url: 'https://www.spdrgoldshares.com/' },
    { ticker: 'PDBC', name: 'Invesco Optimum Yield Diversified Commodity Strategy ETF', type: 'alternatives', expenseRatio: 0.59, category: 'Commodities', risk: 'High', url: 'https://www.invesco.com/us/financial-products/etfs/product-detail?audienceType=Investor&ticker=PDBC' },
    { ticker: 'USRT', name: 'iShares Core U.S. REIT ETF', type: 'alternatives', expenseRatio: 0.08, category: 'Real Estate', risk: 'Medium', url: 'https://www.ishares.com/us/products/275474/ishares-core-us-reit-etf' },
    
    // Cash equivalents
    { ticker: 'SHV', name: 'iShares Short Treasury Bond ETF', type: 'cash', expenseRatio: 0.15, category: 'Short-Term Treasury', risk: 'Low', url: 'https://www.ishares.com/us/products/239466/ishares-short-treasury-bond-etf' },
    { ticker: 'BIL', name: 'SPDR Bloomberg 1-3 Month T-Bill ETF', type: 'cash', expenseRatio: 0.14, category: 'Cash Equivalent', risk: 'Low', url: 'https://www.ssga.com/us/en/institutional/etfs/funds/spdr-bloomberg-1-3-month-t-bill-etf-bil' },
    { ticker: 'GBIL', name: 'Goldman Sachs Access Treasury 0-1 Year ETF', type: 'cash', expenseRatio: 0.12, category: 'Cash Equivalent', risk: 'Low', url: 'https://www.gsam.com/content/gsam/us/en/advisors/products/etf-fund-finder/goldman-sachs-access-treasury-0-1-year-etf.html' },
  ];
  
  // Filter ETFs based on search and selected type
  const filteredETFs = etfDatabase.filter(etf => {
    const matchesSearch = searchTerm === '' || 
      etf.ticker.toLowerCase().includes(searchTerm.toLowerCase()) || 
      etf.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === null || etf.type === selectedType;
    
    return matchesSearch && matchesType;
  });
  
  // Group filtered ETFs by type for recommendations
  const groupedETFs: Record<string, ETF[]> = {};
  filteredETFs.forEach(etf => {
    if (!groupedETFs[etf.type]) {
      groupedETFs[etf.type] = [];
    }
    groupedETFs[etf.type].push(etf);
  });
  
  // Get recommended ETFs based on the active portfolio's allocation
  const getRecommendedETFs = () => {
    if (!activePortfolio) return [];
    
    const recommendations: ETF[] = [];
    
    // For each asset class, recommend ETFs based on allocation percentage
    Object.entries(activePortfolio.allocation).forEach(([assetClass, percentage]) => {
      if (percentage > 0 && groupedETFs[assetClass]) {
        // Get number of ETFs to recommend based on allocation percentage
        const count = Math.max(1, Math.floor(percentage / 20)); // 1 ETF per 20% allocation
        
        // Get ETFs for this asset class, sorted by expense ratio
        const assetClassETFs = groupedETFs[assetClass].sort((a, b) => a.expenseRatio - b.expenseRatio);
        
        // Add the top N ETFs
        recommendations.push(...assetClassETFs.slice(0, count));
      }
    });
    
    return recommendations;
  };
  
  const recommendedETFs = getRecommendedETFs();
  
  return (
    <div className="p-6">
      <IntegratedDemoHelper />
      
      <h2 className="text-xl font-bold text-gray-900 mb-2">ETF Recommendations</h2>
      <p className="text-gray-600 mb-6">
        Based on the selected portfolio allocation, here are recommended ETFs to consider for implementation.
        These suggestions are based on low cost, diversification, and appropriate risk level.
      </p>
      
      <div className="mb-6">
        <div className="flex space-x-4 mb-4">
          {portfolios.map((portfolio) => (
            <button
              key={portfolio.type}
              className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                activePortfolio?.type === portfolio.type
                  ? `bg-${portfolio.type === 'Aggressive' ? 'red' : portfolio.type === 'Balanced' ? 'blue' : 'green'}-100 text-${portfolio.type === 'Aggressive' ? 'red' : portfolio.type === 'Balanced' ? 'blue' : 'green'}-800 border border-${portfolio.type === 'Aggressive' ? 'red' : portfolio.type === 'Balanced' ? 'blue' : 'green'}-200`
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
              onClick={() => setActivePortfolio(portfolio)}
            >
              {portfolio.type} Portfolio
            </button>
          ))}
        </div>
        
        {activePortfolio && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-4">
            {Object.entries(activePortfolio.allocation).map(([key, value]) => (
              <button
                key={key}
                className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                  selectedType === key
                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
                onClick={() => setSelectedType(selectedType === key ? null : key)}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)} ({value}%)
              </button>
            ))}
          </div>
        )}
        
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search by ticker or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">Recommended ETFs for {activePortfolio?.type} Portfolio</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticker</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Class</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expense Ratio</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Info</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recommendedETFs.length > 0 ? (
                recommendedETFs.map((etf) => (
                  <tr key={etf.ticker} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{etf.ticker}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{etf.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{etf.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{etf.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{etf.expenseRatio.toFixed(2)}%</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        etf.risk === 'Low' 
                          ? 'bg-green-100 text-green-800' 
                          : etf.risk === 'Medium'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {etf.risk}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <a 
                        href={etf.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 inline-flex items-center"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Details
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    No ETFs match your current filters. Try adjusting your search or selected asset class.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">All Available ETFs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticker</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Class</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expense Ratio</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Info</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredETFs.length > 0 ? (
                filteredETFs.map((etf) => (
                  <tr key={etf.ticker} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{etf.ticker}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{etf.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{etf.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{etf.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{etf.expenseRatio.toFixed(2)}%</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        etf.risk === 'Low' 
                          ? 'bg-green-100 text-green-800' 
                          : etf.risk === 'Medium'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {etf.risk}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <a 
                        href={etf.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 inline-flex items-center"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Details
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    No ETFs match your current filters. Try adjusting your search or selected asset class.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-6 bg-yellow-50 p-4 rounded-lg flex items-start">
        <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
        <div>
          <h4 className="font-medium text-yellow-800 mb-1">Disclaimer</h4>
          <p className="text-sm text-yellow-700">
            The ETF recommendations provided are for educational purposes only and do not constitute investment advice. 
            Past performance is not indicative of future results. Always conduct your own research or consult with a qualified 
            financial advisor before making investment decisions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ETFRecommendations;