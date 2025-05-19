import React, { useEffect, useRef } from 'react';

interface TaxComparisonChartProps {
  traditionalTotal: number;
  rothTotal: number;
  taxableTotal: number;
  width: number;
  height: number;
  animate?: boolean;
}

const TaxComparisonChart: React.FC<TaxComparisonChartProps> = ({
  traditionalTotal,
  rothTotal,
  taxableTotal,
  width,
  height,
  animate = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Define colors
    const colors = {
      traditional: {
        main: '#3b82f6', // Blue
        light: '#93c5fd'
      },
      roth: {
        main: '#10b981', // Green
        light: '#6ee7b7'
      },
      taxable: {
        main: '#6b7280', // Gray
        light: '#d1d5db'
      }
    };
    
    // Find maximum for scaling
    const maxValue = Math.max(traditionalTotal, rothTotal, taxableTotal);
    
    // Chart dimensions
    const padding = 20;
    const bottomPadding = 40;
    const barWidth = (width - (padding * 2) - 40) / 3;
    const chartHeight = height - padding - bottomPadding;
    
    // Animation duration
    const animationDuration = animate ? 1000 : 0;
    const startTime = Date.now();
    
    // Function to draw a single frame
    const drawFrame = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Calculate animation progress
      const progress = animate 
        ? Math.min((Date.now() - startTime) / animationDuration, 1)
        : 1;
      
      // Draw axes
      ctx.beginPath();
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.moveTo(padding, padding);
      ctx.lineTo(padding, height - bottomPadding);
      ctx.lineTo(width - padding, height - bottomPadding);
      ctx.stroke();
      
      // Draw labels
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      
      // X-axis labels
      ctx.fillText('Traditional', padding + barWidth/2, height - bottomPadding + 20);
      ctx.fillText('Roth', padding + barWidth + 20 + barWidth/2, height - bottomPadding + 20);
      ctx.fillText('Taxable', padding + barWidth*2 + 40 + barWidth/2, height - bottomPadding + 20);
      
      // Format currency for y-axis and bar labels
      const formatCurrency = (value: number) => {
        if (value >= 1000000) {
          return `$${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
          return `$${(value / 1000).toFixed(0)}K`;
        } else {
          return `$${value.toFixed(0)}`;
        }
      };
      
      // Draw Traditional bar
      const traditionalHeight = (traditionalTotal / maxValue) * chartHeight * progress;
      ctx.fillStyle = colors.traditional.light;
      ctx.fillRect(padding, height - bottomPadding - traditionalHeight, barWidth, traditionalHeight);
      
      // Draw Traditional bar outline
      ctx.strokeStyle = colors.traditional.main;
      ctx.lineWidth = 2;
      ctx.strokeRect(padding, height - bottomPadding - traditionalHeight, barWidth, traditionalHeight);
      
      // Draw Roth bar
      const rothHeight = (rothTotal / maxValue) * chartHeight * progress;
      ctx.fillStyle = colors.roth.light;
      ctx.fillRect(padding + barWidth + 20, height - bottomPadding - rothHeight, barWidth, rothHeight);
      
      // Draw Roth bar outline
      ctx.strokeStyle = colors.roth.main;
      ctx.lineWidth = 2;
      ctx.strokeRect(padding + barWidth + 20, height - bottomPadding - rothHeight, barWidth, rothHeight);
      
      // Draw Taxable bar
      const taxableHeight = (taxableTotal / maxValue) * chartHeight * progress;
      ctx.fillStyle = colors.taxable.light;
      ctx.fillRect(padding + barWidth*2 + 40, height - bottomPadding - taxableHeight, barWidth, taxableHeight);
      
      // Draw Taxable bar outline
      ctx.strokeStyle = colors.taxable.main;
      ctx.lineWidth = 2;
      ctx.strokeRect(padding + barWidth*2 + 40, height - bottomPadding - taxableHeight, barWidth, taxableHeight);
      
      // Draw value labels above bars
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 12px sans-serif';
      
      if (progress === 1) {
        // Only draw labels when animation is complete
        ctx.fillText(
          formatCurrency(traditionalTotal),
          padding + barWidth/2,
          height - bottomPadding - traditionalHeight - 10
        );
        
        ctx.fillText(
          formatCurrency(rothTotal),
          padding + barWidth + 20 + barWidth/2,
          height - bottomPadding - rothHeight - 10
        );
        
        ctx.fillText(
          formatCurrency(taxableTotal),
          padding + barWidth*2 + 40 + barWidth/2,
          height - bottomPadding - taxableHeight - 10
        );
      }
      
      // Continue animation if not complete
      if (progress < 1) {
        requestAnimationFrame(drawFrame);
      }
    };
    
    // Start the animation
    drawFrame();
  }, [traditionalTotal, rothTotal, taxableTotal, width, height, animate]);
  
  return (
    <canvas 
      ref={canvasRef} 
      width={width} 
      height={height}
      className="mx-auto"
    />
  );
};

export default TaxComparisonChart;