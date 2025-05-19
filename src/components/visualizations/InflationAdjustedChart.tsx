import React, { useEffect, useRef } from 'react';

interface InflationAdjustedChartProps {
  initialWithdrawal: number;
  withdrawalRate: number;
  inflationRate: number;
  yearsInRetirement: number;
  colorScheme: {
    primary: string;
    secondary: string;
  };
}

const InflationAdjustedChart: React.FC<InflationAdjustedChartProps> = ({
  initialWithdrawal,
  withdrawalRate,
  inflationRate,
  yearsInRetirement,
  colorScheme
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
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
    const nominalData = [];
    const inflationAdjustedData = [];
    
    // Initial withdrawal is a nominal value
    for (let year = 0; year <= yearsInRetirement; year++) {
      // Nominal amount stays constant with 4% rule
      const nominal = initialWithdrawal;
      
      // Inflation-adjusted amount increases each year
      const adjusted = initialWithdrawal * Math.pow(1 + inflationRate, year);
      
      nominalData.push({ year, amount: nominal });
      inflationAdjustedData.push({ year, amount: adjusted });
    }
    
    // Find maximum value for scaling
    const maxAmount = Math.max(...inflationAdjustedData.map(d => d.amount));
    
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
    
    // X-axis labels (years)
    const yearStep = Math.ceil(yearsInRetirement / 5); // Show about 5 labels on x-axis
    for (let i = 0; i <= yearsInRetirement; i += yearStep) {
      const x = padding + (i / yearsInRetirement) * chartWidth;
      ctx.fillText(`Year ${i}`, x, canvas.height - padding + 15);
    }
    
    // Y-axis labels (withdrawal amount)
    ctx.textAlign = 'right';
    const moneyFormatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
      notation: 'compact'
    });
    
    const valueStep = maxAmount / 5; // 5 steps on y-axis
    for (let i = 0; i <= 5; i++) {
      const value = i * valueStep;
      const y = canvas.height - padding - (i / 5) * chartHeight;
      ctx.fillText(moneyFormatter.format(value), padding - 5, y + 3);
    }
    
    // Draw nominal withdrawal line
    ctx.beginPath();
    ctx.strokeStyle = colorScheme.primary;
    ctx.lineWidth = 2;
    
    nominalData.forEach((data, index) => {
      const x = padding + (data.year / yearsInRetirement) * chartWidth;
      const y = canvas.height - padding - (data.amount / maxAmount) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    
    // Draw inflation-adjusted withdrawal line
    ctx.beginPath();
    ctx.strokeStyle = colorScheme.secondary;
    ctx.lineWidth = 2;
    
    inflationAdjustedData.forEach((data, index) => {
      const x = padding + (data.year / yearsInRetirement) * chartWidth;
      const y = canvas.height - padding - (data.amount / maxAmount) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    
    // Add legend
    const legendY = padding + 15;
    
    // Nominal line
    ctx.beginPath();
    ctx.strokeStyle = colorScheme.primary;
    ctx.lineWidth = 2;
    ctx.moveTo(padding + 10, legendY);
    ctx.lineTo(padding + 40, legendY);
    ctx.stroke();
    
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'left';
    ctx.fillText('Nominal Withdrawal', padding + 45, legendY + 3);
    
    // Inflation-adjusted line
    ctx.beginPath();
    ctx.strokeStyle = colorScheme.secondary;
    ctx.lineWidth = 2;
    ctx.moveTo(padding + 160, legendY);
    ctx.lineTo(padding + 190, legendY);
    ctx.stroke();
    
    ctx.fillText('Inflation-Adjusted', padding + 195, legendY + 3);
    
  }, [initialWithdrawal, withdrawalRate, inflationRate, yearsInRetirement, colorScheme]);
  
  return (
    <canvas 
      ref={canvasRef} 
      width={600} 
      height={300} 
      className="w-full h-auto"
    />
  );
};

export default InflationAdjustedChart;