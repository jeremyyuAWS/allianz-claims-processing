import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  HelpCircle, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  Upload,
  ArrowRight,
  X,
  ToggleLeft,
  ToggleRight,
  Check,
  Clipboard,
  Download,
  Bell,
  Mail,
  DollarSign
} from 'lucide-react';
import EmailTemplate from '../common/EmailTemplate';
import Toast from '../common/Toast';

const EnhancedTrackClaimStatus: React.FC = () => {
  const { 
    claimData, 
    activeTab, 
    setActiveTab, 
    claimStatus, 
    setClaimStatus, 
    addMessageToChat, 
    documents 
  } = useAppContext();
  
  const [showDetails, setShowDetails] = useState(false);
  const [statusHistory, setStatusHistory] = useState<{ status: string, timestamp: Date, message: string }[]>([]);
  const [animate, setAnimate] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [estimatedCompletion, setEstimatedCompletion] = useState<string | null>(null);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [emailTemplateType, setEmailTemplateType] = useState<'submission' | 'status_update' | 'approval' | 'additional_info'>('status_update');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
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
    
    // Simulate status changes for demo mode
    let timer: NodeJS.Timeout;
    if (demoMode && claimStatus === 'In Review') {
      timer = setTimeout(() => {
        setClaimStatus('Additional Info Required');
        // Update status history
        setStatusHistory(prev => [
          ...prev, 
          { 
            status: 'Additional Info Required', 
            timestamp: new Date(), 
            message: 'Additional documents needed for claim verification. Please upload the requested documents.' 
          }
        ]);
        // Add message to chat
        addMessageToChat({
          sender: 'agent',
          content: "We need additional information to process your claim. Please check the 'Track Claim Status' tab for details on what is required.",
          agentType: 'status-assistant'
        });
        
        // Show toast notification
        setToastMessage('Claim status updated: Additional information required');
        setToastType('info');
        setShowToast(true);
        
        // Show email preview
        setEmailTemplateType('additional_info');
        if (notificationsEnabled) {
          setShowEmailPreview(true);
        }
      }, 20000); // Change status after 20 seconds for demo
    }
    
    // Start animation after component mounts
    setTimeout(() => setAnimate(true), 300);
    
    return () => clearTimeout(timer);
  }, [claimStatus, setClaimStatus, addMessageToChat, demoMode, notificationsEnabled]);
  
  // Initialize status history when component first loads
  useEffect(() => {
    if (claimStatus !== 'Not Started' && statusHistory.length === 0) {
      const initialHistory = [
        { 
          status: 'Documents Pending', 
          timestamp: new Date(Date.now() - 3600000 * 3), // 3 hours ago
          message: 'Claim initiated. Waiting for document uploads.' 
        }
      ];
      
      if (documents.length > 0) {
        initialHistory.push({ 
          status: 'Documents Verified', 
          timestamp: new Date(Date.now() - 3600000 * 2), // 2 hours ago
          message: 'Document verification complete.' 
        });
      }
      
      if (claimStatus === 'In Review' || claimStatus === 'Additional Info Required' || 
          claimStatus === 'Approved' || claimStatus === 'Paid' || claimStatus === 'Denied') {
        initialHistory.push({ 
          status: 'In Review', 
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
          message: 'Claim is being reviewed by our claims processing team.' 
        });
      }
      
      if (claimStatus === 'Additional Info Required') {
        initialHistory.push({ 
          status: 'Additional Info Required', 
          timestamp: new Date(), 
          message: 'Additional documents needed for claim verification. Please upload the requested documents.' 
        });
      }
      
      setStatusHistory(initialHistory);
    }
  }, [claimStatus, statusHistory.length, documents.length]);
  
  const toggleDemoMode = () => {
    setDemoMode(!demoMode);
    
    if (!demoMode) {
      // Enabling demo mode
      addMessageToChat({
        sender: 'agent',
        content: "Demo mode activated. You'll see automatic status updates and notifications to demonstrate the claim tracking experience.",
        agentType: 'status-assistant'
      });
      
      // Show toast notification
      setToastMessage('Demo mode activated');
      setToastType('info');
      setShowToast(true);
      
      // Reset to In Review status for demo
      if (claimStatus !== 'In Review') {
        setClaimStatus('In Review');
        
        // Add to status history
        setStatusHistory(prev => [
          ...prev, 
          { 
            status: 'In Review', 
            timestamp: new Date(), 
            message: 'Claim is now being reviewed by our claims processing team.' 
          }
        ]);
      }
    }
  };
  
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
  
  const handleStatusSimulation = (newStatus: string) => {
    setClaimStatus(newStatus as any);
    
    // Update status history
    setStatusHistory(prev => [
      ...prev, 
      { 
        status: newStatus, 
        timestamp: new Date(), 
        message: getStatusChangeMessage(newStatus)
      }
    ]);
    
    // Add message to chat
    addMessageToChat({
      sender: 'agent',
      content: getStatusChangeMessage(newStatus),
      agentType: 'status-assistant'
    });
    
    // Show toast notification
    setToastMessage(`Claim status updated to: ${newStatus}`);
    setToastType(newStatus === 'Denied' ? 'error' : newStatus === 'Approved' || newStatus === 'Paid' ? 'success' : 'info');
    setShowToast(true);
    
    // Show email notification for specific statuses
    if (notificationsEnabled && (newStatus === 'Approved' || newStatus === 'Additional Info Required')) {
      setEmailTemplateType(newStatus === 'Approved' ? 'approval' : 'additional_info');
      setShowEmailPreview(true);
    }
  };
  
  const getStatusChangeMessage = (status: string): string => {
    switch(status) {
      case 'Approved':
        return "Good news! Your claim has been approved. We'll process your payment according to the method you selected.";
      case 'Paid':
        return "Your claim payment has been processed and should be received according to your selected payment method.";
      case 'Denied':
        return "We regret to inform you that your claim has been denied. Please see the explanation in the claim details section.";
      case 'In Review':
        return "Your claim is now being reviewed by our processing team. We'll notify you of any updates.";
      default:
        return `Your claim status has been updated to: ${status}`;
    }
  };
  
  // Handle sending email
  const handleSendEmail = () => {
    setSendingEmail(true);
    
    // Simulate sending delay
    setTimeout(() => {
      setSendingEmail(false);
      setShowEmailPreview(false);
      
      // Show success toast
      setToastMessage('Email notification sent');
      setToastType('success');
      setShowToast(true);
      
      // Add message to chat about notification
      addMessageToChat({
        sender: 'agent',
        content: `We've sent you an email notification about your claim status update.`,
        agentType: 'status-assistant'
      });
    }, 1500);
  };
  
  // Check if component should display based on active tab
  if (activeTab !== 'track') return null;
  
  // Check if claim was started
  if (!claimData) {
    return (
      <div className="flex h-full justify-center items-center p-8">
        <div className="bg-yellow-50 p-4 rounded-lg max-w-md text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
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
        <div className="bg-yellow-50 p-6 rounded-lg max-w-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-10 w-10 text-yellow-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-yellow-800 mb-2">Claim Not Submitted</h3>
              <p className="text-sm text-yellow-700 mb-4">
                You haven't submitted your claim form yet. Please complete and submit the claim form to begin tracking its status.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setActiveTab('fill')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                >
                  Complete Claim Form
                </button>
                <button
                  onClick={() => {
                    setDemoMode(true);
                    setClaimStatus('In Review');
                    // Add to status history
                    setStatusHistory([
                      { 
                        status: 'Documents Pending', 
                        timestamp: new Date(Date.now() - 3600000 * 3), // 3 hours ago
                        message: 'Claim initiated. Waiting for document uploads.' 
                      },
                      { 
                        status: 'Documents Verified', 
                        timestamp: new Date(Date.now() - 3600000 * 2), // 2 hours ago
                        message: 'Document verification complete.' 
                      },
                      { 
                        status: 'In Review', 
                        timestamp: new Date(), 
                        message: 'Claim is being reviewed by our claims processing team.' 
                      }
                    ]);
                    
                    // Show toast notification
                    setToastMessage('Demo mode activated');
                    setToastType('info');
                    setShowToast(true);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-yellow-300 text-sm font-medium rounded-md shadow-sm text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none"
                >
                  Use Demo Mode
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Track Your Claim</h1>
            <p className="text-gray-600">
              Monitor the progress of your claim and receive updates on its status.
            </p>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2">Demo Mode</span>
            <button 
              className="focus:outline-none" 
              onClick={toggleDemoMode}
              aria-label={demoMode ? "Disable demo mode" : "Enable demo mode"}
            >
              {demoMode ? (
                <ToggleRight className="h-6 w-6 text-blue-600" />
              ) : (
                <ToggleLeft className="h-6 w-6 text-gray-400" />
              )}
            </button>
          </div>
        </div>
        
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 transition-all duration-500 transform ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center">
                <h2 className="text-lg font-semibold text-gray-900">Claim #{claimData.policyNumber}</h2>
                <div className="ml-2 flex space-x-2">
                  {notificationsEnabled ? (
                    <button 
                      className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                      title="Notifications enabled"
                      onClick={() => {
                        setNotificationsEnabled(false);
                        
                        // Show toast
                        setToastMessage('Email notifications disabled');
                        setToastType('info');
                        setShowToast(true);
                      }}
                    >
                      <Bell className="h-4 w-4" />
                    </button>
                  ) : (
                    <button 
                      className="text-gray-400 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50 transition-colors"
                      title="Notifications disabled"
                      onClick={() => {
                        setNotificationsEnabled(true);
                        
                        // Show toast
                        setToastMessage('Email notifications enabled');
                        setToastType('info');
                        setShowToast(true);
                      }}
                    >
                      <Bell className="h-4 w-4" />
                    </button>
                  )}
                  
                  <button 
                    className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                    title="Copy claim number"
                    onClick={() => {
                      // In a real app, this would copy to clipboard
                      // For this demo, just show a toast
                      setToastMessage('Claim number copied to clipboard');
                      setToastType('success');
                      setShowToast(true);
                    }}
                  >
                    <Clipboard className="h-4 w-4" />
                  </button>
                  
                  <button 
                    className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                    title="Download claim report"
                    onClick={() => {
                      // In a real app, this would download a report
                      // For this demo, just show a toast
                      setToastMessage('Claim report downloaded');
                      setToastType('success');
                      setShowToast(true);
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center mt-1 text-sm text-gray-500">
                {claimData.claimType} • Filed on {new Date().toLocaleDateString()}
              </div>
            </div>
            <div className={`px-4 py-2 rounded-md text-sm font-medium inline-flex items-center gap-1.5 ${
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
              {getStatusIcon(claimStatus)}
              <span>{claimStatus}</span>
            </div>
          </div>
          
          {/* Status Timeline */}
          <div className="mb-8">
            <h3 className="text-base font-medium text-gray-900 mb-4">Claim Progress</h3>
            <div className="relative">
              <div className="absolute h-1 w-full bg-gray-200 rounded-full"></div>
              <div 
                className="absolute h-1 bg-blue-500 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(100, getStatusStep(claimStatus) / 4 * 100)}%` }}
              ></div>
              
              <div className="relative grid grid-cols-5 gap-2 pt-6">
                <div className={`flex flex-col items-center transition-opacity duration-500 ${
                  getStatusStep(claimStatus) >= 0 ? 'opacity-100' : 'opacity-50'
                }`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    getStatusStep(claimStatus) >= 0 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    <Check className="h-4 w-4" />
                  </div>
                  <span className="mt-2 text-xs font-medium text-gray-700 text-center">Submitted</span>
                </div>
                
                <div className={`flex flex-col items-center transition-opacity duration-500 ${
                  getStatusStep(claimStatus) >= 1 ? 'opacity-100' : 'opacity-50'
                }`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    getStatusStep(claimStatus) >= 1 
                      ? getStatusStep(claimStatus) === 1.5
                        ? 'bg-amber-500 text-white'
                        : 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    <FileText className="h-4 w-4" />
                  </div>
                  <span className="mt-2 text-xs font-medium text-gray-700 text-center">Documents Verified</span>
                </div>
                
                <div className={`flex flex-col items-center transition-opacity duration-500 ${
                  getStatusStep(claimStatus) >= 2 ? 'opacity-100' : 'opacity-50'
                }`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    getStatusStep(claimStatus) >= 2 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    <Clock className="h-4 w-4" />
                  </div>
                  <span className="mt-2 text-xs font-medium text-gray-700 text-center">Under Review</span>
                </div>
                
                <div className={`flex flex-col items-center transition-opacity duration-500 ${
                  getStatusStep(claimStatus) >= 3 ? 'opacity-100' : 'opacity-50'
                }`}>
                  <div className={`h-8 w-8 rounded-full transition-colors duration-300 flex items-center justify-center ${
                    getStatusStep(claimStatus) >= 3 
                      ? claimStatus === 'Denied' 
                        ? 'bg-red-500 text-white' 
                        : 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {claimStatus === 'Denied' 
                      ? <X className="h-4 w-4" />
                      : <Check className="h-4 w-4" />}
                  </div>
                  <span className="mt-2 text-xs font-medium text-gray-700 text-center">Decision</span>
                </div>
                
                <div className={`flex flex-col items-center transition-opacity duration-500 ${
                  getStatusStep(claimStatus) >= 4 ? 'opacity-100' : 'opacity-50'
                }`}>
                  <div className={`h-8 w-8 rounded-full transition-colors duration-300 flex items-center justify-center ${
                    getStatusStep(claimStatus) >= 4
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <span className="mt-2 text-xs font-medium text-gray-700 text-center">Payment</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Current Status Card */}
          <div className={`p-5 rounded-lg mb-6 flex items-start ${
            claimStatus === 'Approved' || claimStatus === 'Paid'
              ? 'bg-green-50 border border-green-100'
              : claimStatus === 'Denied'
              ? 'bg-red-50 border border-red-100'
              : claimStatus === 'In Review'
              ? 'bg-blue-50 border border-blue-100'
              : claimStatus === 'Additional Info Required'
              ? 'bg-amber-50 border border-amber-100'
              : 'bg-gray-50 border border-gray-100'
          } transition-all duration-500`}>
            <div className="mr-4 mt-1">
              {getStatusIcon(claimStatus)}
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-medium mb-1 ${getStatusColor(claimStatus)}`}>
                {claimStatus}
              </h3>
              <p className="text-gray-600">
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
              
              {estimatedCompletion && claimStatus === 'In Review' && (
                <div className="mt-3 flex items-center text-sm">
                  <Clock className="h-4 w-4 text-blue-500 mr-1.5" />
                  <span className="font-medium text-blue-700">Estimated completion:</span>
                  <span className="ml-1.5 text-blue-800">{estimatedCompletion}</span>
                </div>
              )}
              
              <div className="mt-4 flex space-x-3">
                {claimStatus === 'Additional Info Required' && (
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="inline-flex items-center px-3 py-1.5 text-sm bg-amber-100 text-amber-800 rounded hover:bg-amber-200 transition-colors"
                  >
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                    Upload Documents
                  </button>
                )}
                
                <button
                  onClick={() => {
                    setEmailTemplateType(
                      claimStatus === 'Approved' ? 'approval' :
                      claimStatus === 'Additional Info Required' ? 'additional_info' : 
                      'status_update'
                    );
                    setShowEmailPreview(true);
                  }}
                  className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                >
                  <Mail className="h-3.5 w-3.5 mr-1.5" />
                  Email Status Update
                </button>
              </div>
            </div>
          </div>
          
          {claimStatus === 'Additional Info Required' && (
            <div className="border border-amber-200 rounded-lg bg-amber-50 p-5 mb-6">
              <h3 className="text-lg font-medium text-amber-800 mb-3 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
                Additional Information Required
              </h3>
              <div className="space-y-4">
                <p className="text-amber-700">
                  We need the following additional information to process your claim. Please provide:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 text-xs mr-2 mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="text-amber-800 font-medium">Beneficiary ID Verification</p>
                      <p className="text-sm text-amber-700">Please provide a copy of the beneficiary's government-issued photo ID</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 text-xs mr-2 mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="text-amber-800 font-medium">Completed W-9 Form</p>
                      <p className="text-sm text-amber-700">Required for tax reporting purposes</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 text-xs mr-2 mt-0.5">
                      3
                    </div>
                    <div>
                      <p className="text-amber-800 font-medium">Relationship Documentation</p>
                      <p className="text-sm text-amber-700">Proof of relationship between the beneficiary and the insured</p>
                    </div>
                  </li>
                </ul>
                <div className="pt-2">
                  <button 
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none transition-colors"
                    onClick={() => setActiveTab('upload')}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Required Documents
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Claim Details */}
          <div className="border rounded-lg overflow-hidden mb-6">
            <div 
              className="p-4 bg-gray-50 border-b flex justify-between items-center cursor-pointer"
              onClick={() => setShowDetails(!showDetails)}
            >
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-blue-500 mr-2" />
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
              <div className="p-4 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 mb-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500">Policy Number</p>
                    <p className="text-sm font-medium">{claimData.policyNumber}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500">Policy Holder</p>
                    <p className="text-sm font-medium">{claimData.policyHolder}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500">Claim Type</p>
                    <p className="text-sm font-medium">{claimData.claimType}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500">Submission Date</p>
                    <p className="text-sm font-medium">{new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="sm:col-span-2 bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500">Claim Reason</p>
                    <p className="text-sm">{claimData.claimReason}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Documents Submitted</h4>
                  <div className="space-y-2">
                    {documents.length > 0 ? (
                      documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-gray-500 mr-2" />
                            <span>{doc.name}</span>
                          </div>
                          <div className="flex items-center">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              doc.status === 'Verified' 
                                ? 'bg-green-100 text-green-800' 
                                : doc.status === 'Rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {doc.status}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 bg-gray-50 rounded text-sm text-gray-500 italic">
                        No documents have been uploaded yet
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Activity Timeline */}
          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
            <Clock className="h-5 w-5 text-blue-500 mr-2" />
            Activity Timeline
          </h3>
          <div className="border rounded-lg overflow-hidden mb-6">
            {statusHistory.map((activity, index) => (
              <div key={index} className={`p-4 ${index !== statusHistory.length - 1 ? 'border-b border-gray-200' : ''}`}>
                <div className="flex">
                  <div className="flex-shrink-0 mr-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      activity.status === 'Documents Verified'
                        ? 'bg-blue-100 text-blue-600'
                        : activity.status === 'In Review'
                        ? 'bg-blue-100 text-blue-600'
                        : activity.status === 'Additional Info Required'
                        ? 'bg-amber-100 text-amber-600'
                        : activity.status === 'Documents Pending'
                        ? 'bg-blue-100 text-blue-600'
                        : activity.status === 'Approved'
                        ? 'bg-green-100 text-green-600'
                        : activity.status === 'Paid'
                        ? 'bg-green-100 text-green-600'
                        : activity.status === 'Denied'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {activity.status === 'Documents Verified' && <CheckCircle className="h-4 w-4" />}
                      {activity.status === 'In Review' && <Clock className="h-4 w-4" />}
                      {activity.status === 'Additional Info Required' && <AlertCircle className="h-4 w-4" />}
                      {activity.status === 'Documents Pending' && <FileText className="h-4 w-4" />}
                      {activity.status === 'Approved' && <CheckCircle className="h-4 w-4" />}
                      {activity.status === 'Paid' && <DollarSign className="h-4 w-4" />}
                      {activity.status === 'Denied' && <X className="h-4 w-4" />}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900">{activity.status}</p>
                      <span className="mx-2 text-gray-400">•</span>
                      <p className="text-xs text-gray-500">{activity.timestamp.toLocaleString()}</p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {statusHistory.length === 0 && (
              <div className="p-4 text-center">
                <p className="text-gray-500 text-sm">No activity recorded yet</p>
              </div>
            )}
          </div>
          
          {/* Simulation Controls - For demo only */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-medium text-gray-900 flex items-center">
                <Clock className="h-5 w-5 text-blue-500 mr-2" />
                Simulation Controls
              </h3>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">Demo Only</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Use these controls to simulate different claim statuses and see how the tracking interface updates in real-time.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-2">
              <button 
                onClick={() => handleStatusSimulation('In Review')}
                className="px-4 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded hover:bg-blue-200 transition-colors flex items-center justify-center"
              >
                <Clock className="h-4 w-4 mr-1.5" />
                Set to In Review
              </button>
              
              <button 
                onClick={() => handleStatusSimulation('Additional Info Required')}
                className="px-4 py-2 bg-amber-100 text-amber-700 text-sm font-medium rounded hover:bg-amber-200 transition-colors flex items-center justify-center"
              >
                <AlertCircle className="h-4 w-4 mr-1.5" />
                Request Info
              </button>
              
              <button 
                onClick={() => handleStatusSimulation('Approved')}
                className="px-4 py-2 bg-green-100 text-green-700 text-sm font-medium rounded hover:bg-green-200 transition-colors flex items-center justify-center"
              >
                <CheckCircle className="h-4 w-4 mr-1.5" />
                Approve Claim
              </button>
              
              <button 
                onClick={() => handleStatusSimulation('Paid')}
                className="px-4 py-2 bg-green-100 text-green-700 text-sm font-medium rounded hover:bg-green-200 transition-colors flex items-center justify-center"
              >
                <DollarSign className="h-4 w-4 mr-1.5" />
                Mark as Paid
              </button>
              
              <button 
                onClick={() => handleStatusSimulation('Denied')}
                className="px-4 py-2 bg-red-100 text-red-700 text-sm font-medium rounded hover:bg-red-200 transition-colors flex items-center justify-center"
              >
                <X className="h-4 w-4 mr-1.5" />
                Deny Claim
              </button>
              
              <button 
                onClick={() => {
                  // Reset to initial state
                  setClaimStatus('In Review');
                  setStatusHistory([
                    { 
                      status: 'Documents Pending', 
                      timestamp: new Date(Date.now() - 3600000 * 3), // 3 hours ago
                      message: 'Claim initiated. Waiting for document uploads.' 
                    },
                    { 
                      status: 'Documents Verified', 
                      timestamp: new Date(Date.now() - 3600000 * 2), // 2 hours ago
                      message: 'Document verification complete.' 
                    },
                    { 
                      status: 'In Review', 
                      timestamp: new Date(), 
                      message: 'Claim is being reviewed by our claims processing team.' 
                    }
                  ]);
                  
                  // Show toast notification
                  setToastMessage('Claim status reset to In Review');
                  setToastType('info');
                  setShowToast(true);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <ArrowRight className="h-4 w-4 mr-1.5" />
                Reset Demo
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              These controls are for demonstration purposes only.
            </p>
          </div>
          
          {/* Need Help Section */}
          <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-100 p-5">
            <div className="flex items-start">
              <HelpCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-medium text-blue-800 mb-1">Need assistance?</h3>
                <p className="text-sm text-blue-700 mb-3">
                  If you have questions about your claim status or need assistance, our support team is here to help.
                </p>
                <button 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors"
                  onClick={() => setActiveTab('contact')}
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Email Preview Modal */}
      {showEmailPreview && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black bg-opacity-50 animate-fade-in">
          <div className="max-w-3xl w-full">
            <EmailTemplate 
              templateType={emailTemplateType}
              recipientName={claimData.policyHolder}
              policyNumber={claimData.policyNumber}
              claimType={claimData.claimType}
              claimStatus={claimStatus}
              onSend={handleSendEmail}
              onClose={() => setShowEmailPreview(false)}
            />
          </div>
        </div>
      )}
      
      {/* Toast notifications */}
      {showToast && (
        <Toast 
          message={toastMessage} 
          type={toastType} 
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default EnhancedTrackClaimStatus;