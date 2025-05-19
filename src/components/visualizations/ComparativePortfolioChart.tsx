import React, { useEffect, useRef, useState } from 'react';
import { RetirementData, Portfolio } from '../../types';

interface ComparativePortfolioChartProps {
  portfolios: Portfolio[];
  retirementData: RetirementData;
  width?: number;
  height?: number;
}

const ComparativePortfolioChart: React.FC<ComparativePortfolioChartProps> = ({
  portfolios,
  retirementData,
  width = 600,
  height = 300
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visiblePortfolios, setVisiblePortfolios] = useState<Record<string, boolean>>({});
  
  // Initialize visible portfolios
  useEffect(() => {
    const initialVisibility: Record<string, boolean> = {};
    portfolios.forEach(portfolio => {
      initialVisibility[portfolio.type] = true;
    });
    setVisiblePortfolios(initialVisibility);
  }, [portfolios]);
  
  const togglePortfolio = (portfolioType: string) => {
    setVisiblePortfolios(prev => ({
      ...prev,
      [portfolioType]: !prev[portfolioType]
    }));
  };
  
  useEffect(() => {
    if (!canvasRef.current || !retirementData) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Chart dimensions
    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;
    
    // Calculate projection data for all portfolios
    const currentAge = retirementData.age;
    const retirementAge = retirementData.retirementAge;
    const yearsToRetirement = retirementAge - currentAge;
    const lifeExpectancy = retirementAge + 30; // Assuming 30 years in retirement
    const yearsTotal = lifeExpectancy - currentAge;
    
    const annualSavings = retirementData.annualIncome * 0.15; // Assuming 15% savings rate
    
    // Generate projection data
    const portfolioProjections: Record<string, { age: number, savings: number }[]> = {};
    
    // Find the maximum savings across all portfolios
    let maxSavings = 0;
    
    // Generate projections
    portfolios.forEach(portfolio => {
      if (!visiblePortfolios[portfolio.type]) return;
      
      const projectionData = [];
      let currentSavings = retirementData.currentSavings;
      
      for (let year = 0; year <= yearsTotal; year++) {
        const age = currentAge + year;
        
        if (age < retirementAge) {
          // Growth during accumulation phase (with contributions)
          currentSavings = currentSavings * (1 + portfolio.cagr) + annualSavings;
        } else {
          // Growth during retirement (with withdrawals)
          const withdrawalRate = 0.04; // 4% withdrawal rule
          const withdrawal = year === yearsToRetirement ? 0 : currentSavings * withdrawalRate;
          currentSavings = currentSavings * (1 + portfolio.cagr) - withdrawal;
          
          // Prevent negative balance
          currentSavings = Math.max(0, currentSavings);
        }
        
        projectionData.push({
          age,
          savings: currentSavings
        });
        
        // Update max savings
        maxSavings = Math.max(maxSavings, currentSavings);
      }
      
      portfolioProjections[portfolio.type] = projectionData;
    });
    
    // Draw axes
    ctx.beginPath();
    ctx.strokeStyle = '#cbd5e1'; // Tailwind slate-300
    ctx.lineWidth = 1;
    
    // X-axis
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    
    // Y-axis
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.stroke();
    
    // Draw axes labels
    ctx.fillStyle = '#475569'; // Tailwind slate-600
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    
    // X-axis labels (age)
    const ageStep = Math.ceil(yearsTotal / 6); // Show about 6 labels on x-axis
    for (let i = 0; i <= yearsTotal; i += ageStep) {
      const age = currentAge + i;
      const x = padding + (i / yearsTotal) * chartWidth;
      ctx.fillText(age.toString(), x, canvas.height - padding + 15);
    }
    
    // Y-axis labels (savings)
    ctx.textAlign = 'right';
    const moneyFormatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
      notation: 'compact'
    });
    
    const valueStep = maxSavings / 5; // 5 steps on y-axis
    for (let i = 0; i <= 5; i++) {
      const value = i * valueStep;
      const y = canvas.height - padding - (i / 5) * chartHeight;
      ctx.fillText(moneyFormatter.format(value), padding - 5, y + 3);
    }
    
    // Draw retirement age vertical line
    const retirementX = padding + (yearsToRetirement / yearsTotal) * chartWidth;
    ctx.beginPath();
    ctx.strokeStyle = '#94a3b8'; // Tailwind slate-400
    ctx.setLineDash([5, 3]);
    ctx.moveTo(retirementX, padding);
    ctx.lineTo(retirementX, canvas.height - padding);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Label for retirement age
    ctx.fillStyle = '#475569';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Retirement', retirementX, padding - 5);
    ctx.fillText(`Age ${retirementAge}`, retirementX, padding - 18);
    
    // Draw projections for each portfolio
    portfolios.forEach(portfolio => {
      if (!visiblePortfolios[portfolio.type] || !portfolioProjections[portfolio.type]) return;
      
      const projectionData = portfolioProjections[portfolio.type];
      
      ctx.beginPath();
      ctx.strokeStyle = portfolio.colorScheme.primary;
      ctx.lineWidth = 2;
      
      projectionData.forEach((data, index) => {
        const x = padding + (index / yearsTotal) * chartWidth;
        const y = canvas.height - padding - (data.savings / maxSavings) * chartHeight;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
      
      // Draw area under the curve with transparency
      ctx.beginPath();
      ctx.moveTo(padding, canvas.height - padding);
      
      projectionData.forEach((data, index) => {
        const x = padding + (index / yearsTotal) * chartWidth;
        const y = canvas.height - padding - (data.savings / maxSavings) * chartHeight;
        ctx.lineTo(x, y);
      });
      
      ctx.lineTo(padding + chartWidth, canvas.height - padding);
      ctx.closePath();
      ctx.fillStyle = `${portfolio.colorScheme.primary}20`; // 20% opacity
      ctx.fill();
      
      // Add key milestones as circles
      // Peak savings
      const peakIndex = projectionData.reduce((maxIdx, data, idx, arr) => 
        data.savings > arr[maxIdx].savings ? idx : maxIdx, 0);
      
      const peakX = padding + (peakIndex / yearsTotal) * chartWidth;
      const peakY = canvas.height - padding - (projectionData[peakIndex].savings / maxSavings) * chartHeight;
      
      ctx.beginPath();
      ctx.arc(peakX, peakY, 4, 0, Math.PI * 2);
      ctx.fillStyle = portfolio.colorScheme.primary;
      ctx.fill();
    });
    
    // Add legend
    const legendY = height - 20;
    let legendX = padding;
    
    portfolios.forEach(portfolio => {
      const isVisible = visiblePortfolios[portfolio.type];
      
      // Draw colored line
      ctx.beginPath();
      ctx.strokeStyle = isVisible ? portfolio.colorScheme.primary : '#d1d5db';
      ctx.lineWidth = 2;
      ctx.moveTo(legendX, legendY);
      ctx.lineTo(legendX + 20, legendY);
      ctx.stroke();
      
      // Draw portfolio name
      ctx.fillStyle = isVisible ? '#1e293b' : '#9ca3af';
      ctx.textAlign = 'left';
      ctx.font = isVisible ? 'bold 10px sans-serif' : '10px sans-serif';
      ctx.fillText(portfolio.type, legendX + 25, legendY + 3);
      
      legendX += 100; // Space between legend items
    });
    
  }, [portfolios, retirementData, visiblePortfolios]);
  
  return (
    <div className="flex flex-col">
      <div className="flex justify-center mb-4">
        <div className="flex space-x-4">
          {portfolios.map(portfolio => (
            <button
              key={portfolio.type}
              className={`px-3 py-1 text-xs rounded-full flex items-center transition-colors`}
              onClick={() => togglePortfolio(portfolio.type)}
              style={{
                backgroundColor: visiblePortfolios[portfolio.type] ? `${portfolio.colorScheme.primary}20` : '#e5e7eb',
                color: visiblePortfolios[portfolio.type] ? portfolio.colorScheme.primary : '#4b5563',
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: visiblePortfolios[portfolio.type] ? portfolio.colorScheme.primary : 'transparent'
              }}
            >
              <span className={`mr-1.5 inline-block w-3 h-3 rounded-full`} 
                style={{ backgroundColor: portfolio.colorScheme.primary }}></span>
              {portfolio.type}
            </button>
          ))}
        </div>
      </div>
      <canvas 
        ref={canvasRef} 
        width={width} 
        height={height}
        className="w-full h-auto mx-auto"
      />
      <div className="text-xs text-gray-500 text-center mt-1">
        Click on a portfolio type to toggle visibility
      </div>
    </div>
  );
};

export default ComparativePortfolioChart;