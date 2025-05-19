import React, { useEffect, useRef } from 'react';
import { RetirementData } from '../../types';

interface ProjectionChartProps {
  retirementData: RetirementData;
  annualReturn: number; // Expected annual return rate (e.g., 0.07 for 7%)
  colorScheme: {
    primary: string;
    secondary: string;
  };
}

const ProjectionChart: React.FC<ProjectionChartProps> = ({
  retirementData,
  annualReturn,
  colorScheme
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
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
    
    // Calculate projection data
    const currentAge = retirementData.age;
    const retirementAge = retirementData.retirementAge;
    const yearsToRetirement = retirementAge - currentAge;
    const lifeExpectancy = retirementAge + 30; // Assuming 30 years in retirement
    const yearsTotal = lifeExpectancy - currentAge;
    
    const annualSavings = retirementData.annualIncome * 0.15; // Assuming 15% savings rate
    
    // Generate projection data
    const projectionData = [];
    let currentSavings = retirementData.currentSavings;
    
    for (let year = 0; year <= yearsTotal; year++) {
      const age = currentAge + year;
      
      if (age < retirementAge) {
        // Growth during accumulation phase (with contributions)
        currentSavings = currentSavings * (1 + annualReturn) + annualSavings;
      } else {
        // Growth during retirement (with withdrawals)
        const withdrawalRate = 0.04; // 4% withdrawal rule
        const withdrawal = year === yearsToRetirement ? 0 : currentSavings * withdrawalRate;
        currentSavings = currentSavings * (1 + annualReturn) - withdrawal;
        
        // Prevent negative balance
        currentSavings = Math.max(0, currentSavings);
      }
      
      projectionData.push({
        age,
        savings: currentSavings
      });
    }
    
    // Find maximum value for scaling
    const maxSavings = Math.max(...projectionData.map(d => d.savings));
    
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
    
    // Draw projection line
    ctx.beginPath();
    ctx.strokeStyle = colorScheme.primary;
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
    
    // Draw area under the curve
    ctx.lineTo(padding + chartWidth, canvas.height - padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.closePath();
    ctx.fillStyle = `${colorScheme.primary}20`; // Add 20% opacity to the color
    ctx.fill();
    
    // Add key milestones as circles with labels
    ctx.font = '10px sans-serif';
    
    // Starting point
    const startX = padding;
    const startY = canvas.height - padding - (projectionData[0].savings / maxSavings) * chartHeight;
    ctx.beginPath();
    ctx.arc(startX, startY, 4, 0, Math.PI * 2);
    ctx.fillStyle = colorScheme.primary;
    ctx.fill();
    ctx.fillText('Start', startX, startY - 10);
    
    // Retirement point
    ctx.beginPath();
    ctx.arc(retirementX, canvas.height - padding - (projectionData[yearsToRetirement].savings / maxSavings) * chartHeight, 4, 0, Math.PI * 2);
    ctx.fillStyle = colorScheme.secondary;
    ctx.fill();
    
    // Peak savings
    const peakIndex = projectionData.findIndex(d => d.savings === maxSavings);
    const peakX = padding + (peakIndex / yearsTotal) * chartWidth;
    const peakY = canvas.height - padding - (maxSavings / maxSavings) * chartHeight;
    
    ctx.beginPath();
    ctx.arc(peakX, peakY, 4, 0, Math.PI * 2);
    ctx.fillStyle = colorScheme.secondary;
    ctx.fill();
    ctx.fillText('Peak', peakX, peakY - 10);
    ctx.fillText(moneyFormatter.format(maxSavings), peakX, peakY - 23);
    
  }, [retirementData, annualReturn, colorScheme]);
  
  return (
    <canvas 
      ref={canvasRef} 
      width={600} 
      height={300} 
      className="w-full h-auto"
    />
  );
};

export default ProjectionChart;