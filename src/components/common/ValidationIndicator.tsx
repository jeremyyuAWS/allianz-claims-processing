import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface ValidationIndicatorProps {
  isValid: boolean;
  message?: string;
  showIcon?: boolean;
}

const ValidationIndicator: React.FC<ValidationIndicatorProps> = ({
  isValid,
  message,
  showIcon = true
}) => {
  if (!message && isValid) return null;
  
  return (
    <div className={`flex items-center mt-1 text-xs ${isValid ? 'text-green-600' : 'text-red-600'}`}>
      {showIcon && (
        isValid ? (
          <CheckCircle className="w-3 h-3 mr-1" />
        ) : (
          <AlertCircle className="w-3 h-3 mr-1" />
        )
      )}
      <span>{message}</span>
    </div>
  );
};

export default ValidationIndicator;