import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Users, UserCog } from 'lucide-react';

const ModeToggle: React.FC = () => {
  const { mode, setMode, resetQuestionnaire } = useAppContext();

  const handleModeChange = (newMode: 'customer' | 'advisor') => {
    setMode(newMode);
    if (newMode === 'customer') {
      resetQuestionnaire();
    }
  };

  return (
    <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
      <button
        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
          mode === 'customer'
            ? 'bg-white shadow-sm text-blue-700'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => handleModeChange('customer')}
      >
        <Users className="h-4 w-4 mr-2" />
        <span>Customer</span>
      </button>
      <button
        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
          mode === 'advisor'
            ? 'bg-white shadow-sm text-blue-700'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => handleModeChange('advisor')}
      >
        <UserCog className="h-4 w-4 mr-2" />
        <span>Advisor</span>
      </button>
    </div>
  );
};

export default ModeToggle;