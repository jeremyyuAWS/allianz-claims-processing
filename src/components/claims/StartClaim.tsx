import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Info, ArrowRight, FileText } from 'lucide-react';

const StartClaim: React.FC = () => {
  const { claimTypes, setClaimData, setActiveTab, addMessageToChat, user } = useAppContext();
  const [selectedClaimType, setSelectedClaimType] = useState<string | null>(null);
  const [claimReason, setClaimReason] = useState<string>('');
  const [showGuide, setShowGuide] = useState(true);

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

  const handleClaimTypeSelection = (claimTypeId: string) => {
    setSelectedClaimType(claimTypeId);
    
    // Find the claim type details
    const claimType = claimTypes.find(type => type.id === claimTypeId);
    
    if (claimType) {
      // Add message to chat about selection
      addMessageToChat({
        sender: 'user',
        content: `I'd like to file a ${claimType.name.toLowerCase()}.`
      });
    }
  };

  const handleSubmit = () => {
    if (!selectedClaimType || !claimReason.trim()) return;
    
    const claimType = claimTypes.find(type => type.id === selectedClaimType);
    
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

      // Simulate next steps
      setTimeout(() => {
        setActiveTab('upload');
      }, 1500);
    }
  };

  const isDisabled = !selectedClaimType || !claimReason.trim();

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Start Your Claim</h1>
          <p className="text-gray-600">
            Select the type of policy you're filing a claim for, and we'll guide you through the process.
          </p>
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
        
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Policy Information</h2>
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
            {claimTypes.map((type) => (
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
                  <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 mr-3 
                    ${selectedClaimType === type.id ? 'border-blue-500' : 'border-gray-300'}"
                  >
                    {selectedClaimType === type.id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-md font-medium">{type.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
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
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <span>Continue to Document Upload</span>
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