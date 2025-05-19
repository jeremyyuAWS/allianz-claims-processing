import React from 'react';
import { useAppContext } from '../../context/AppContext';
import ModeToggle from './ModeToggle';
import { User } from 'lucide-react';

const Header: React.FC = () => {
  const { user } = useAppContext();
  
  return (
    <header className="bg-white border-b border-gray-200 fixed w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <svg
                className="h-8 w-8 text-blue-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v6.5M12 22v-6.5M4.93 5.93l4.6 4.6M14.36 13.36l4.6 4.6M2 12h6.5M22 12h-6.5M5.93 19.07l4.6-4.6M13.36 4.93l4.6 4.6" />
              </svg>
              <span className="ml-2 text-xl font-semibold text-gray-900">RetireWise</span>
            </div>
          </div>
          <div className="flex items-center">
            <ModeToggle />
            <div className="ml-4 flex items-center">
              <div className="mr-3 text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">Session: {user.sessionId}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;