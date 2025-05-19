import React, { useEffect, useRef } from 'react';

interface TaxGrowthChartProps {
  principal: number;
  annualContribution: number;
  years: number;
  annualReturn: number;
  width: number;
  height: number;
  isTraditional: boolean;
  currentTaxRate: number;
  retirementTaxRate: number;
  colorScheme?: {
    traditional: string;
    roth: string;
    taxable: string;
  };
  animate?: boolean;
}

const TaxGrowthChart: React.FC<TaxGrowthChartProps> = ({
  principal,
  annualContribution,
  years,
  annualReturn,
  width,
  height,
  isTraditional,
  currentTaxRate,
  retirementTaxRate,
  colorScheme = {
    traditional: '#3b82f6', // Blue
    roth: '#10b981', // Green
    taxable: '#6b7280' // Gray
  },
  animate = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Calculate traditional, Roth, and taxable account values over time
    const calculateGrowth = () => {
      // Adjust contributions based on tax treatment
      const traditionalContribution = annualContribution;
      const rothContribution = annualContribution * (1 - currentTaxRate / 100);
      const taxableContribution = annualContribution;
      
      // Initialize arrays to store values over time
      const traditionalValues = [principal];
      const rothValues = [principal * (1 - currentTaxRate / 100)]; // Initial principal after taxes for Roth
      const taxableValues = [principal * (1 - currentTaxRate / 100)]; // Initial principal after taxes for taxable
      
      // Calculate yearly growth with contributions
      for (let year = 1; year <= years; year++) {
        // Traditional - grows tax-deferred
        const traditionalValue = traditionalValues[year - 1] * (1 + annualReturn) + traditionalContribution;
        traditionalValues.push(traditionalValue);
        
        // Roth - grows tax-free
        const rothValue = rothValues[year - 1] * (1 + annualReturn) + rothContribution;
        rothValues.push(rothValue);
        
        // Taxable - pays tax on gains each year (simplified)
        const previousValue = taxableValues[year - 1];
        const gains = previousValue * annualReturn;
        const taxOnGains = gains * (currentTaxRate / 100) * 0.3; // Assuming 30% of gains are taxed each year
        const taxableValue = previousValue + gains - taxOnGains + taxableContribution;
        taxableValues.push(taxableValue);
      }
      
      // Apply taxes on withdrawal for Traditional
      const afterTaxTraditional = traditionalValues.map(value => 
        value * (1 - retirementTaxRate / 100)
      );
      
      return {
        traditional: traditionalValues,
        afterTaxTraditional,
        roth: rothValues,
        taxable: taxableValues
      };
    };
    
    const growthData = calculateGrowth();
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Chart dimensions
    const padding = { top: 30, right: 30, bottom: 50, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    // Find maximum value for scaling
    const maxValue = Math.max(
      ...growthData.traditional,
      ...growthData.roth,
      ...growthData.taxable
    );
    
    // Animation settings
    const animationDuration = animate ? 1000 : 0; 
    const startTime = Date.now();
    
    // Format currency for axis labels
    const formatCurrency = (value: number) => {
      return value >= 1000000
        ? `$${(value / 1000000).toFixed(1)}M`
        : value >= 1000
          ? `$${(value / 1000).toFixed(0)}K`
          : `$${value.toFixed(0)}`;
    };
    
    // Function to draw a single animation frame
    const drawFrame = () => {
      // Calculate animation progress
      const progress = animate 
        ? Math.min((Date.now() - startTime) / animationDuration, 1)
        : 1;
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Draw axes
      ctx.beginPath();
      ctx.strokeStyle = '#e5e7eb'; // Light gray
      ctx.lineWidth = 1;
      
      // Y-axis
      ctx.moveTo(padding.left, padding.top);
      ctx.lineTo(padding.left, height - padding.bottom);
      
      // X-axis
      ctx.moveTo(padding.left, height - padding.bottom);
      ctx.lineTo(width - padding.right, height - padding.bottom);
      
      ctx.stroke();
      
      // Draw Y-axis labels
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#6b7280'; // Gray
      ctx.font = '12px sans-serif';
      
      const yStep = maxValue / 5;
      for (let i = 0; i <= 5; i++) {
        const yValue = i * yStep;
        const y = height - padding.bottom - (i / 5) * chartHeight;
        
        ctx.fillText(formatCurrency(yValue), padding.left - 10, y);
        
        // Draw horizontal grid line
        ctx.beginPath();
        ctx.strokeStyle = '#f3f4f6'; // Lighter gray for grid
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
      }
      
      // Draw X-axis labels
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      
      const xStep = Math.ceil(years / 5); // Show about 5 labels
      for (let i = 0; i <= years; i += xStep) {
        const x = padding.left + (i / years) * chartWidth;
        
        ctx.fillText(`Year ${i}`, x, height - padding.bottom + 10);
        
        // Draw vertical grid line
        if (i > 0) {
          ctx.beginPath();
          ctx.strokeStyle = '#f3f4f6'; // Lighter gray for grid
          ctx.moveTo(x, padding.top);
          ctx.lineTo(x, height - padding.bottom);
          ctx.stroke();
        }
      }
      
      // Chart title
      ctx.textAlign = 'center';
      ctx.fillStyle = '#374151'; // Dark gray
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(`Account Growth Over ${years} Years`, width / 2, 15);
      
      // Draw data lines - only up to the current progress point
      const pointsToShow = Math.floor(growthData.traditional.length * progress);
      
      // Function to draw a line
      const drawLine = (data: number[], color: string, isDashed: boolean = false) => {
        if (pointsToShow < 2) return; // Need at least 2 points to draw a line
        
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        
        if (isDashed) {
          ctx.setLineDash([5, 3]);
        } else {
          ctx.setLineDash([]);
        }
        
        for (let i = 0; i < pointsToShow; i++) {
          const x = padding.left + (i / (data.length - 1)) * chartWidth;
          const y = height - padding.bottom - (data[i] / maxValue) * chartHeight;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      };
      
      // Draw each line
      if (isTraditional) {
        drawLine(growthData.traditional, colorScheme.traditional);
        drawLine(growthData.afterTaxTraditional, colorScheme.traditional, true);
      } else {
        drawLine(growthData.roth, colorScheme.roth);
      }
      drawLine(growthData.taxable, colorScheme.taxable);
      
      // Draw legend
      const legendY = padding.top + 15;
      const legendX = padding.left + 20;
      
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.font = '12px sans-serif';
      ctx.setLineDash([]);
      
      if (isTraditional) {
        // Traditional line
        ctx.beginPath();
        ctx.strokeStyle = colorScheme.traditional;
        ctx.lineWidth = 2;
        ctx.moveTo(legendX, legendY);
        ctx.lineTo(legendX + 20, legendY);
        ctx.stroke();
        
        ctx.fillStyle = '#374151';
        ctx.fillText('Traditional (Pre-tax)', legendX + 25, legendY);
        
        // After-tax Traditional line
        ctx.beginPath();
        ctx.strokeStyle = colorScheme.traditional;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);
        ctx.moveTo(legendX, legendY + 20);
        ctx.lineTo(legendX + 20, legendY + 20);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillText('Traditional (After-tax)', legendX + 25, legendY + 20);
      } else {
        // Roth line
        ctx.beginPath();
        ctx.strokeStyle = colorScheme.roth;
        ctx.lineWidth = 2;
        ctx.moveTo(legendX, legendY);
        ctx.lineTo(legendX + 20, legendY);
        ctx.stroke();
        
        ctx.fillStyle = '#374151';
        ctx.fillText('Roth', legendX + 25, legendY);
      }
      
      // Taxable line
      ctx.beginPath();
      ctx.strokeStyle = colorScheme.taxable;
      ctx.lineWidth = 2;
      ctx.moveTo(legendX + (isTraditional ? 0 : 180), legendY + (isTraditional ? 40 : 0));
      ctx.lineTo(legendX + 20 + (isTraditional ? 0 : 180), legendY + (isTraditional ? 40 : 0));
      ctx.stroke();
      
      ctx.fillText('Taxable', legendX + 25 + (isTraditional ? 0 : 180), legendY + (isTraditional ? 40 : 0));
      
      // Continue animation if not complete
      if (progress < 1) {
        requestAnimationFrame(drawFrame);
      }
    };
    
    // Start the animation
    drawFrame();
    
  }, [principal, annualContribution, years, annualReturn, width, height, isTraditional, currentTaxRate, retirementTaxRate, colorScheme, animate]);
  
  return (
    <canvas 
      ref={canvasRef} 
      width={width} 
      height={height}
      className="mx-auto"
    />
  );
};

export default TaxGrowthChart;