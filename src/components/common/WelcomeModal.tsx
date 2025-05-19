import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { X, BrainCircuit, Calculator, LineChart, Edit, Database } from 'lucide-react';

const WelcomeModal: React.FC = () => {
  const { showWelcomeModal, setShowWelcomeModal } = useAppContext();

  if (!showWelcomeModal) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => setShowWelcomeModal(false)}
            >
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-2xl leading-6 font-bold text-gray-900 mb-4" id="modal-title">
                  Welcome to RetireWise
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-4">
                    This application is powered by AI agents from the Lyzr platform. Each agent helps you navigate retirement planning more intelligently. Here's how it works:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <BrainCircuit className="h-5 w-5 text-blue-500 mr-2" />
                        <h4 className="font-medium text-blue-800">Questionnaire Agent</h4>
                      </div>
                      <p className="text-sm text-gray-600">Guides you through retirement planning questions to gather your information and preferences.</p>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Calculator className="h-5 w-5 text-blue-500 mr-2" />
                        <h4 className="font-medium text-blue-800">Portfolio Recommender</h4>
                      </div>
                      <p className="text-sm text-gray-600">Analyzes your inputs and generates three personalized portfolio options based on your risk profile.</p>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <LineChart className="h-5 w-5 text-blue-500 mr-2" />
                        <h4 className="font-medium text-blue-800">Plan Explainer</h4>
                      </div>
                      <p className="text-sm text-gray-600">Answers your questions about each portfolio option and explains projections and assumptions.</p>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Edit className="h-5 w-5 text-blue-500 mr-2" />
                        <h4 className="font-medium text-blue-800">Plan Editor</h4>
                      </div>
                      <p className="text-sm text-gray-600">Allows financial advisors to customize portfolios through natural language instructions.</p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                    <div className="flex items-center mb-2">
                      <Database className="h-5 w-5 text-yellow-500 mr-2" />
                      <h4 className="font-medium text-yellow-800">Simulated Mode</h4>
                    </div>
                    <p className="text-sm text-gray-600">This demo uses simulated data and AI responses. In a production environment, these would be powered by real-time Lyzr AI agents.</p>
                  </div>
                  
                  <p className="text-sm text-gray-500 mt-4">
                    <span className="font-medium">To get started:</span> Toggle between Customer and Advisor modes in the top menu. As a customer, answer the questionnaire to get portfolio recommendations. As an advisor, you can customize portfolios using the chat interface.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={() => setShowWelcomeModal(false)}
            >
              Get Started
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={() => setShowWelcomeModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;