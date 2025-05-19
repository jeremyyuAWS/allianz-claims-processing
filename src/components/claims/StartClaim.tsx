import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Info, ArrowRight, FileText, HelpCircle } from 'lucide-react';
import claimTypesData from '../../data/claim_types.json';

const StartClaim: React.FC = () => {
  const { setClaimData, setActiveTab, addMessageToChat, user, demoMode } = useAppContext();
  const [selectedClaimType, setSelectedClaimType] = useState<string | null>(null);
  const [claimReason, setClaimReason] = useState<string>('');
  const [showGuide, setShowGuide] = useState(true);
  const [showRequiredDocs, setShowRequiredDocs] = useState<boolean>(false);
  const [claimTypeDetail, setClaimTypeDetail] = useState<any>(null);
  
  useEffect(() => {
    // Welcome message for this tab
    setTimeout(() => {
      addMessageToChat({
        sender: 'agent',
        content: "Welcome to the Allianz Claims Portal. To get started, please select the type of policy you're filing a claim for. If you're unsure, I can help you determine the right claim type.",
        agentType: 'claims-assistant'
      });
    }, 500);
  }, [addMessageToChat]);

  useEffect(() => {
    // Auto-fill form when demo mode is enabled
    if (demoMode) {
      // Select a default claim type (life insurance)
      const defaultClaimType = 'life';
      setSelectedClaimType(defaultClaimType);
      
      // Find the claim type details
      const claimType = claimTypesData.find(type => type.id === defaultClaimType);
      if (claimType) {
        setClaimTypeDetail(claimType);
      }
      
      // Set a default claim reason
      setClaimReason('Filing a death benefit claim for policy holder who passed away on March 15, 2023 due to natural causes.');
      
      // Add message to chat about demo mode
      addMessageToChat({
        sender: 'agent',
        content: "Demo mode activated. Form has been pre-filled with sample data. You can now continue through the claims process to see how tracking works.",
        agentType: 'claims-assistant'
      });

      // Automatically handle submission after a short delay
      setTimeout(() => {
        handleSubmit();
      }, 1000);
    }
  }, [demoMode, addMessageToChat]);

  const handleClaimTypeSelection = (claimTypeId: string) => {
    setSelectedClaimType(claimTypeId);
    
    // Find the claim type details from our JSON data
    const claimType = claimTypesData.find(type => type.id === claimTypeId);
    
    if (claimType) {
      // Store detailed information about the claim type
      setClaimTypeDetail(claimType);
      
      // Add message to chat about selection
      addMessageToChat({
        sender: 'user',
        content: `I'd like to file a ${claimType.name.toLowerCase()}.`
      });
      
      // Simulate agent response with specific guidance based on claim type
      setTimeout(() => {
        addMessageToChat({
          sender: 'agent',
          content: `Thank you for selecting a ${claimType.name}. Please provide a brief description of the reason for your claim. Then I'll guide you through the required documentation, which includes ${claimType.requiredDocuments.join(", ")}.`,
          agentType: 'claims-assistant'
        });
      }, 1000);
    }
  };

  const handleSubmit = () => {
    if ((!selectedClaimType || !claimReason.trim()) && !demoMode) return;
    
    const claimType = claimTypesData.find(type => type.id === selectedClaimType);
    
    if (claimType) {
      setClaimData({
        policyNumber: user.policyNumber,
        policyHolder: user.name,
        policyType: selectedClaimType,
        claimType: claimType.name,
        claimReason: claimReason
      });

      // Add message to chat about proceeding
      addMessageToChat({
        sender: 'user',
        content: `The reason for my claim is: ${claimReason}`
      });
      
      // Simulate agent response about next steps with specific details
      setTimeout(() => {
        addMessageToChat({
          sender: 'agent',
          content: `Thank you for providing the details. I've recorded that you're filing a ${claimType.name} for the following reason: "${claimReason}". Now let's proceed to document upload, where you'll need to provide ${claimType.requiredDocuments.join(", ")}. The typical processing time for this type of claim is ${claimType.processingTime}.`,
          agentType: 'claims-assistant'
        });
        
        // Navigate to document upload tab
        setActiveTab('upload');
      }, 1500);
    }
  };

  const isDisabled = (!selectedClaimType || !claimReason.trim()) && !demoMode;

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Start Your Claim</h1>
              <p className="text-gray-600">
                Select the type of policy you're filing a claim for, and we'll guide you through the process.
              </p>
            </div>
          </div>
        </div>
        
        {showGuide && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6 flex items-start">
            <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-800 mb-1">How to Start a Claim</h3>
              <p className="text-sm text-blue-600">
                Filing a claim is simple. Select your policy type, provide basic information about your claim, and then proceed to upload the required documents. If you need assistance at any step, you can use the chat feature to speak with our AI assistant.
              </p>
              <button 
                onClick={() => setShowGuide(false)} 
                className="mt-2 text-xs text-blue-700 hover:text-blue-800 underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
        
        {demoMode && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 animate-fade-in">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-md font-medium text-green-800 mb-1">Demo Mode Activated</h3>
                <p className="text-sm text-green-700 mb-3">
                  Form has been pre-filled with sample data. You can review the information or proceed directly to see the claim tracking experience.
                </p>
                <button
                  onClick={handleSubmit}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none transition-colors"
                >
                  Skip to Claim Status Tracking
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Policy Information</h2>
            <button
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              onClick={() => setShowRequiredDocs(!showRequiredDocs)}
            >
              <HelpCircle className="h-4 w-4 mr-1" />
              {showRequiredDocs ? "Hide Documents Info" : "View Required Documents"}
            </button>
          </div>
          
          {showRequiredDocs && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="text-md font-medium text-gray-800 mb-3">Required Documents by Claim Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {claimTypesData.map((type) => (
                  <div key={type.id} className="p-3 border border-gray-200 rounded-lg bg-white">
                    <h4 className="font-medium text-blue-700 mb-2">{type.name}</h4>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                      {type.requiredDocuments.map((doc, index) => (
                        <li key={index}>{doc}</li>
                      ))}
                    </ul>
                    <p className="text-xs text-gray-500 mt-2">
                      Processing time: {type.processingTime}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Policy Number</label>
              <input
                type="text"
                value={user.policyNumber}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Policy Holder</label>
              <input
                type="text"
                value={user.name}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
              />
            </div>
          </div>
          
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Claim Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {claimTypesData.map((type) => (
              <div 
                key={type.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedClaimType === type.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => handleClaimTypeSelection(type.id)}
              >
                <div className="flex items-start">
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 mr-3 ${
                    selectedClaimType === type.id ? 'border-blue-500' : 'border-gray-300'}`}
                  >
                    {selectedClaimType === type.id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-md font-medium">{type.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                    {selectedClaimType === type.id && (
                      <p className="text-xs text-blue-600 mt-2">Processing time: {type.processingTime}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {selectedClaimType && claimTypeDetail && (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="text-md font-medium text-blue-800 mb-2">Required Documents</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-blue-700">
                {claimTypeDetail.requiredDocuments.map((doc: string, index: number) => (
                  <li key={index}>{doc}</li>
                ))}
              </ul>
              <p className="text-sm text-blue-600 mt-2">
                You'll be able to upload these documents in the next step.
              </p>
            </div>
          )}
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Claim
            </label>
            <textarea
              rows={4}
              value={claimReason}
              onChange={(e) => setClaimReason(e.target.value)}
              placeholder="Please describe the reason for your claim..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
          
          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-gray-500 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              <span>Your information is secure and encrypted</span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isDisabled}
              className={`flex items-center px-4 py-2 rounded-md shadow-sm text-white ${
                isDisabled
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 transition-colors'
              }`}
            >
              <span>{demoMode ? 'Skip to Claim Status' : 'Continue to Document Upload'}</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Before You Continue</h3>
          <ul className="space-y-1 list-disc list-inside text-sm text-gray-600">
            <li>Have your policy information and relevant documents ready</li>
            <li>Ensure you're the policy holder or an authorized beneficiary</li>
            <li>If you're filing a death claim, make sure you have a certified death certificate</li>
            <li>For long-term care claims, medical documentation will be required</li>
          </ul>
          <p className="mt-3 text-sm text-gray-600">
            Need help determining the right claim type? Use the chat assistant or call <span className="font-medium">1-800-555-7890</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StartClaim;