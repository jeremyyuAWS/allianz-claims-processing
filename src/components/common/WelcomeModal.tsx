import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { X, MessageSquare, Upload, FileText, Clock, Phone } from 'lucide-react';

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
                  Welcome to Allianz Claims Processing
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-4">
                    This application guides you through the claims process with AI-powered assistance. Here's how it works:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <MessageSquare className="h-5 w-5 text-blue-500 mr-2" />
                        <h4 className="font-medium text-blue-800">Start a Claim</h4>
                      </div>
                      <p className="text-sm text-gray-600">Begin by selecting the type of policy you're filing a claim against, and our assistant will guide you through the process.</p>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Upload className="h-5 w-5 text-blue-500 mr-2" />
                        <h4 className="font-medium text-blue-800">Upload Documents</h4>
                      </div>
                      <p className="text-sm text-gray-600">Securely upload required documentation such as death certificates, claim forms, or medical records.</p>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <FileText className="h-5 w-5 text-blue-500 mr-2" />
                        <h4 className="font-medium text-blue-800">Fill Claim Form</h4>
                      </div>
                      <p className="text-sm text-gray-600">Our AI assistant helps you complete the necessary claim forms with pre-filled information whenever possible.</p>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Clock className="h-5 w-5 text-blue-500 mr-2" />
                        <h4 className="font-medium text-blue-800">Track Status</h4>
                      </div>
                      <p className="text-sm text-gray-600">Monitor your claim's progress through each stage of the review and approval process.</p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                    <div className="flex items-center mb-2">
                      <Phone className="h-5 w-5 text-yellow-500 mr-2" />
                      <h4 className="font-medium text-yellow-800">Demo Mode</h4>
                    </div>
                    <p className="text-sm text-gray-600">This is a demonstration application using simulated data. In a production environment, your actual policy information would be displayed and processed securely.</p>
                  </div>
                  
                  <p className="text-sm text-gray-500 mt-4">
                    <span className="font-medium">To get started:</span> Follow the tabs from left to right, beginning with "Start a Claim". Each tab represents a step in the claims process, and you can use the AI assistant at any point by clicking the chat button.
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