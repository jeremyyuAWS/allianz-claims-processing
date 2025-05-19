import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { CheckCircle, Clock, AlertCircle, HelpCircle, FileText, ChevronDown, ChevronUp } from 'lucide-react';

const TrackClaimStatus: React.FC = () => {
  const { claimData, activeTab, setActiveTab, claimStatus, setClaimStatus, addMessageToChat } = useAppContext();
  
  const [showDetails, setShowDetails] = useState(false);
  const [estimatedCompletion, setEstimatedCompletion] = useState<string | null>(null);
  
  useEffect(() => {
    // Set estimated completion based on status
    if (claimStatus === 'In Review') {
      const date = new Date();
      date.setDate(date.getDate() + 7);
      setEstimatedCompletion(date.toLocaleDateString());
    } else if (claimStatus === 'Additional Info Required') {
      const date = new Date();
      date.setDate(date.getDate() + 14);
      setEstimatedCompletion(date.toLocaleDateString());
    } else {
      setEstimatedCompletion(null);
    }
    
    // Simulate status changes for demo
    let timer: NodeJS.Timeout;
    if (claimStatus === 'In Review') {
      timer = setTimeout(() => {
        setClaimStatus('Additional Info Required');
        // Add message to chat
        addMessageToChat({
          sender: 'agent',
          content: "We need additional information to process your claim. Please check the 'Track Claim Status' tab for details on what is required.",
          agentType: 'status-assistant'
        });
      }, 30000); // Change status after 30 seconds for demo
    }
    
    return () => clearTimeout(timer);
  }, [claimStatus, setClaimStatus, addMessageToChat]);
  
  // Helper function to get status step number
  const getStatusStep = (status: string) => {
    switch (status) {
      case 'Not Started':
        return 0;
      case 'Documents Pending':
        return 1;
      case 'In Review':
        return 2;
      case 'Additional Info Required':
        return 1.5; // Between steps
      case 'Approved':
        return 3;
      case 'Paid':
        return 4;
      case 'Denied':
        return 3;
      default:
        return 0;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
      case 'Paid':
        return 'text-green-500';
      case 'Denied':
        return 'text-red-500';
      case 'Additional Info Required':
        return 'text-amber-500';
      case 'In Review':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
      case 'Paid':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Denied':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'Additional Info Required':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'In Review':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <HelpCircle className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Check if component should display based on active tab
  if (activeTab !== 'track') return null;
  
  // Check if claim was started
  if (!claimData) {
    return (
      <div className="flex h-full justify-center items-center p-8">
        <div className="bg-yellow-50 p-4 rounded-lg max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-yellow-800 mb-2">No claim to track</h3>
          <p className="text-yellow-700 mb-4">
            Please start a claim first before tracking its status.
          </p>
          <button
            onClick={() => setActiveTab('start')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            Start a Claim
          </button>
        </div>
      </div>
    );
  }
  
  // Check if form was submitted
  if (claimStatus === 'Not Started') {
    return (
      <div className="flex h-full justify-center items-center p-8">
        <div className="bg-yellow-50 p-4 rounded-lg max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Claim Not Submitted</h3>
          <p className="text-yellow-700 mb-4">
            Please complete and submit the claim form before tracking its status.
          </p>
          <button
            onClick={() => setActiveTab('fill')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            Complete Claim Form
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Track Your Claim</h1>
          <p className="text-gray-600">
            Monitor the progress of your claim and receive updates on its status.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Claim #{claimData.policyNumber}</h2>
              <p className="text-sm text-gray-500">
                {claimData.claimType} - Filed on {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-md text-sm font-medium ${
              claimStatus === 'Approved' || claimStatus === 'Paid'
                ? 'bg-green-100 text-green-800'
                : claimStatus === 'Denied'
                ? 'bg-red-100 text-red-800'
                : claimStatus === 'In Review'
                ? 'bg-blue-100 text-blue-800'
                : claimStatus === 'Additional Info Required'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {claimStatus}
            </div>
          </div>
          
          {/* Status Timeline */}
          <div className="relative mb-10">
            <div className="absolute h-1 w-full bg-gray-200 rounded-full"></div>
            <div 
              className="absolute h-1 bg-blue-500 rounded-full"
              style={{ width: `${Math.min(100, getStatusStep(claimStatus) / 4 * 100)}%` }}
            ></div>
            
            <div className="relative flex justify-between pt-6">
              <div className="flex flex-col items-center">
                <div className={`h-7 w-7 rounded-full ${
                  getStatusStep(claimStatus) >= 0 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-400'
                  } flex items-center justify-center`}
                >
                  <span className="text-xs">1</span>
                </div>
                <span className="mt-2 text-xs text-gray-500">Submitted</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className={`h-7 w-7 rounded-full ${
                  getStatusStep(claimStatus) >= 1 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-400'
                  } flex items-center justify-center`}
                >
                  <span className="text-xs">2</span>
                </div>
                <span className="mt-2 text-xs text-gray-500">Documents Verified</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className={`h-7 w-7 rounded-full ${
                  getStatusStep(claimStatus) >= 2 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-400'
                  } flex items-center justify-center`}
                >
                  <span className="text-xs">3</span>
                </div>
                <span className="mt-2 text-xs text-gray-500">Under Review</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className={`h-7 w-7 rounded-full ${
                  getStatusStep(claimStatus) >= 3 
                    ? claimStatus === 'Denied' 
                      ? 'bg-red-500 text-white' 
                      : 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-400'
                  } flex items-center justify-center`}
                >
                  <span className="text-xs">4</span>
                </div>
                <span className="mt-2 text-xs text-gray-500">Decision</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className={`h-7 w-7 rounded-full ${
                  getStatusStep(claimStatus) >= 4
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-400'
                  } flex items-center justify-center`}
                >
                  <span className="text-xs">5</span>
                </div>
                <span className="mt-2 text-xs text-gray-500">Payment</span>
              </div>
            </div>
          </div>
          
          {/* Current Status Card */}
          <div className={`p-4 rounded-lg mb-6 flex items-start ${
            claimStatus === 'Approved' || claimStatus === 'Paid'
              ? 'bg-green-50'
              : claimStatus === 'Denied'
              ? 'bg-red-50'
              : claimStatus === 'In Review'
              ? 'bg-blue-50'
              : claimStatus === 'Additional Info Required'
              ? 'bg-amber-50'
              : 'bg-gray-50'
          }`}>
            <div className="mr-3 mt-0.5">
              {getStatusIcon(claimStatus)}
            </div>
            <div>
              <h3 className={`text-md font-medium mb-1 ${getStatusColor(claimStatus)}`}>
                {claimStatus}
              </h3>
              <p className="text-sm text-gray-600">
                {claimStatus === 'In Review' && 
                  `Your claim is currently under review by our claims processing team. We'll notify you if additional information is needed.`
                }
                {claimStatus === 'Additional Info Required' && 
                  `We need additional information to process your claim. Please see the details below and submit the requested information as soon as possible.`
                }
                {claimStatus === 'Approved' && 
                  `Your claim has been approved. Payment processing will begin shortly.`
                }
                {claimStatus === 'Paid' && 
                  `Your claim has been paid. Please check your payment method for the funds.`
                }
                {claimStatus === 'Denied' && 
                  `We regret to inform you that your claim has been denied. Please see the details below for the reason and your options.`
                }
              </p>
              
              {estimatedCompletion && (
                <div className="mt-2 text-sm">
                  <span className="font-medium">Estimated completion:</span> {estimatedCompletion}
                </div>
              )}
            </div>
          </div>
          
          {claimStatus === 'Additional Info Required' && (
            <div className="border border-amber-200 rounded-lg bg-amber-50 p-4 mb-6">
              <h3 className="text-md font-medium text-amber-800 mb-2">Additional Information Required</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-amber-700">
                <li>Please provide a copy of the beneficiary's government-issued photo ID</li>
                <li>We need a completed W-9 form for tax purposes</li>
                <li>Clarification on the relationship between the claimant and the insured</li>
              </ul>
              <div className="mt-4">
                <button 
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                  onClick={() => setActiveTab('upload')}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Additional Documents
                </button>
              </div>
            </div>
          )}
          
          {/* Claim Details */}
          <div className="border rounded-lg overflow-hidden">
            <div 
              className="p-4 bg-gray-50 border-b flex justify-between items-center cursor-pointer"
              onClick={() => setShowDetails(!showDetails)}
            >
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-gray-500 mr-2" />
                <h3 className="font-medium text-gray-900">Claim Details</h3>
              </div>
              <div>
                {showDetails ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </div>
            
            {showDetails && (
              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                  <div>
                    <p className="text-xs text-gray-500">Policy Number</p>
                    <p className="text-sm font-medium">{claimData.policyNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Policy Holder</p>
                    <p className="text-sm font-medium">{claimData.policyHolder}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Claim Type</p>
                    <p className="text-sm font-medium">{claimData.claimType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Submission Date</p>
                    <p className="text-sm font-medium">{new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs text-gray-500">Claim Reason</p>
                    <p className="text-sm">{claimData.claimReason}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Activity Timeline */}
          <h3 className="font-medium text-gray-900 mt-6 mb-3">Activity Timeline</h3>
          <div className="border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex">
                <div className="flex-shrink-0 mr-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Claim Submitted</p>
                  <p className="text-xs text-gray-500">{new Date().toLocaleString()}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Your claim form and supporting documents have been received.
                  </p>
                </div>
              </div>
            </div>
            
            {claimStatus !== 'Not Started' && (
              <div className="p-4 border-b border-gray-200">
                <div className="flex">
                  <div className="flex-shrink-0 mr-3">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Documents Verified</p>
                    <p className="text-xs text-gray-500">{new Date(Date.now() - 10 * 60000).toLocaleString()}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Your documents have been verified and accepted.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {claimStatus === 'In Review' || claimStatus === 'Additional Info Required' || 
              claimStatus === 'Approved' || claimStatus === 'Paid' || claimStatus === 'Denied' ? (
              <div className="p-4 border-b border-gray-200">
                <div className="flex">
                  <div className="flex-shrink-0 mr-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Claim Under Review</p>
                    <p className="text-xs text-gray-500">{new Date(Date.now() - 5 * 60000).toLocaleString()}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Your claim is being reviewed by our claims processing team.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
            
            {claimStatus === 'Additional Info Required' && (
              <div className="p-4 border-b border-gray-200">
                <div className="flex">
                  <div className="flex-shrink-0 mr-3">
                    <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Additional Information Requested</p>
                    <p className="text-xs text-gray-500">{new Date().toLocaleString()}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      We need additional information to process your claim.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Need Help Section */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start">
              <HelpCircle className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-1">Need assistance?</h3>
                <p className="text-sm text-gray-600">
                  If you have questions about your claim or need assistance, our customer service team is here to help.
                </p>
                <button 
                  className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                  onClick={() => setActiveTab('contact')}
                >
                  Contact a Claims Agent
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackClaimStatus;