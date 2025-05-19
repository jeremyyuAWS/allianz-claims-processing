import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { User, Phone, MessageSquare, HelpCircle } from 'lucide-react';

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
                <path d="M20 7h-9m9 10h-9m9-5h-9m-3 10a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"></path>
              </svg>
              <span className="ml-2 text-xl font-semibold text-gray-900">Allianz Claims</span>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex items-center space-x-4">
              <a href="#" className="flex items-center text-sm text-gray-600 hover:text-blue-600">
                <HelpCircle className="h-4 w-4 mr-1" />
                <span>Help</span>
              </a>
              <a href="#" className="flex items-center text-sm text-gray-600 hover:text-blue-600">
                <Phone className="h-4 w-4 mr-1" />
                <span>1-800-555-7890</span>
              </a>
              <a href="#" className="flex items-center text-sm text-gray-600 hover:text-blue-600">
                <MessageSquare className="h-4 w-4 mr-1" />
                <span>Live Chat</span>
              </a>
            </div>
            <div className="ml-4 flex items-center">
              <div className="mr-3 text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">Policy #: {user.policyNumber}</p>
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