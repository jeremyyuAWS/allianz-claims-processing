import React, { useEffect, useRef } from 'react';

interface PortfolioDonutChartProps {
  allocation: {
    stocks: number;
    bonds: number;
    reits: number;
    international: number;
    alternatives: number;
    cash: number;
  };
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
}

const PortfolioDonutChart: React.FC<PortfolioDonutChartProps> = ({ 
  allocation, 
  colorPrimary,
  colorSecondary,
  colorAccent
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Parse hex color to RGB for transparency
        const parseColor = (hexColor: string, alpha: number) => {
          const r = parseInt(hexColor.slice(1, 3), 16);
          const g = parseInt(hexColor.slice(3, 5), 16);
          const b = parseInt(hexColor.slice(5, 7), 16);
          return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;
        
        // Define the data and colors
        const data = [
          allocation.stocks,
          allocation.bonds,
          allocation.reits,
          allocation.international,
          allocation.alternatives,
          allocation.cash
        ];
        
        const colors = [
          colorPrimary,
          colorSecondary,
          colorAccent,
          parseColor(colorPrimary, 0.7),
          parseColor(colorSecondary, 0.7),
          parseColor(colorAccent, 0.7)
        ];
        
        // Calculate the total
        const total = data.reduce((acc, value) => acc + value, 0);
        
        // Draw the donut chart
        let startAngle = -Math.PI / 2; // Start at the top
        
        for (let i = 0; i < data.length; i++) {
          // Calculate the angle for this segment
          const segmentAngle = (data[i] / total) * (2 * Math.PI);
          
          // Draw the segment
          context.beginPath();
          context.moveTo(centerX, centerY);
          context.arc(centerX, centerY, radius, startAngle, startAngle + segmentAngle);
          context.closePath();
          
          // Fill the segment
          context.fillStyle = colors[i];
          context.fill();
          
          // Update the starting angle for the next segment
          startAngle += segmentAngle;
        }
        
        // Draw the inner circle (to create the donut hole)
        context.beginPath();
        context.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
        context.fillStyle = 'white';
        context.fill();
      }
    }
  }, [allocation, colorPrimary, colorSecondary, colorAccent]);

  return (
    <canvas ref={canvasRef} width={200} height={200} className="max-w-full" />
  );
};

export default PortfolioDonutChart;