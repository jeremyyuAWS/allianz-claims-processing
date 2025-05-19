import React, { useState, useEffect, useRef } from 'react';
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
  Mail, 
  FileCheck, 
  Send, 
  CreditCard,
  ArrowRight,
  Calendar,
  UserCheck,
  Shield,
  X,
  Wand2,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import EmailTemplate from '../common/EmailTemplate';
import Toast from '../common/Toast';

const EnhancedTrackClaimStatus: React.FC = () => {
  const { claimData, activeTab, setActiveTab, claimStatus, setClaimStatus, addMessageToChat, documents } = useAppContext();
  
  const [showDetails, setShowDetails] = useState(false);
  const [estimatedCompletion, setEstimatedCompletion] = useState<string | null>(null);
  const [statusHistory, setStatusHistory] = useState<{ status: string, timestamp: Date, message: string }[]>([]);
  const [animate, setAnimate] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [emailTemplateType, setEmailTemplateType] = useState<'submission' | 'status_update' | 'approval' | 'additional_info' | 'payment'>('status_update');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [demoMode, setDemoMode] = useState(false);
  const [autoProgressDemo, setAutoProgressDemo] = useState(false);
  
  // Ref for the timeline animation
  const timelineRef = useRef<HTMLDivElement>(null);
  
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
    if (autoProgressDemo && claimStatus === 'In Review') {
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
        setToastMessage('Your claim status has been updated. Additional information is required.');
        setToastType('info');
        setShowToast(true);
        
        // Show email preview
        setEmailTemplateType('additional_info');
        setShowEmailPreview(true);
      }, 15000); // Change status after 15 seconds in auto demo mode
    }
    
    // Start animation after component mounts
    setTimeout(() => setAnimate(true), 300);
    
    // Start timeline animations when component mounts
    if (timelineRef.current) {
      const timelineItems = timelineRef.current.querySelectorAll('.timeline-item');
      timelineItems.forEach((item, index) => {
        setTimeout(() => {
          (item as HTMLElement).style.opacity = '1';
          (item as HTMLElement).style.transform = 'translateY(0)';
        }, 300 + (index * 150));
      });
    }
    
    return () => clearTimeout(timer);
  }, [claimStatus, setClaimStatus, addMessageToChat, statusHistory.length, autoProgressDemo]);
  
  // Initialize status history when component first loads
  useEffect(() => {
    if ((claimStatus !== 'Not Started' && statusHistory.length === 0) || demoMode) {
      const initialHistory = [
        { 
          status: 'Documents Pending', 
          timestamp: new Date(Date.now() - 3600000 * 3), // 3 hours ago
          message: 'Claim initiated. Waiting for document uploads.' 
        }
      ];
      
      if (documents.length > 0 || demoMode) {
        initialHistory.push({ 
          status: 'Documents Verified', 
          timestamp: new Date(Date.now() - 3600000 * 2), // 2 hours ago
          message: 'Document verification complete.' 
        });
      }
      
      if (claimStatus === 'In Review' || claimStatus === 'Additional Info Required' || 
          claimStatus === 'Approved' || claimStatus === 'Paid' || claimStatus === 'Denied' || demoMode) {
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
      
      // If in demo mode and no status is set, set it to In Review
      if (demoMode && claimStatus === 'Not Started') {
        setClaimStatus('In Review');
        
        // Add initialization message to chat
        addMessageToChat({
          sender: 'agent',
          content: "Your claim is now in review. You can track its progress here in the 'Track Claim Status' tab. I'll notify you of any updates or if additional information is needed.",
          agentType: 'status-assistant'
        });
      }
    }
  }, [claimStatus, statusHistory.length, documents.length, demoMode, setClaimStatus, addMessageToChat]);
  
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
    setToastType(getToastType(newStatus));
    setShowToast(true);
    
    // Show email preview for status updates
    setEmailTemplateType(getEmailType(newStatus));
    setTimeout(() => setShowEmailPreview(true), 500);
  };
  
  const toggleDemoMode = () => {
    const newDemoMode = !demoMode;
    setDemoMode(newDemoMode);
    
    if (newDemoMode) {
      // If turning on demo mode
      if (claimStatus === 'Not Started') {
        // Initialize with demo data if not already started
        setClaimStatus('In Review');
        // Add demo notification
        addMessageToChat({
          sender: 'agent',
          content: "Demo mode activated. You can now track a simulated claim through various status changes. Use the simulation controls to advance the claim through different stages of processing.",
          agentType: 'status-assistant'
        });
      } else {
        // Add demo notification
        addMessageToChat({
          sender: 'agent',
          content: "Demo mode activated. You can now simulate different claim statuses using the controls at the bottom of the page.",
          agentType: 'status-assistant'
        });
      }
      
      setToastMessage('Demo mode activated');
      setToastType('info');
      setShowToast(true);
    } else {
      setToastMessage('Demo mode deactivated');
      setToastType('info');
      setShowToast(true);
    }
  };
  
  const toggleAutoProgressDemo = () => {
    const newAutoProgressDemo = !autoProgressDemo;
    setAutoProgressDemo(newAutoProgressDemo);
    
    if (newAutoProgressDemo) {
      setToastMessage('Auto progress enabled - status will change automatically');
      setToastType('info');
      setShowToast(true);
      
      addMessageToChat({
        sender: 'agent',
        content: "I've enabled auto-progress mode. You'll see the claim move through different statuses automatically, including notifications and required actions.",
        agentType: 'status-assistant'
      });
    }
  };
  
  const getToastType = (status: string): 'success' | 'error' | 'info' => {
    switch(status) {
      case 'Approved':
      case 'Paid':
        return 'success';
      case 'Denied':
        return 'error';
      default:
        return 'info';
    }
  };
  
  const getEmailType = (status: string): 'submission' | 'status_update' | 'approval' | 'additional_info' | 'payment' => {
    switch(status) {
      case 'Approved':
        return 'approval';
      case 'Paid':
        return 'payment';
      case 'Additional Info Required':
        return 'additional_info';
      case 'Denied':
      case 'In Review':
      default:
        return 'status_update';
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
  
  const handleSendEmailNotification = () => {
    // Simulate sending email
    setToastMessage('Email notification sent successfully');
    setToastType('success');
    setShowToast(true);
    
    // Add message to chat
    addMessageToChat({
      sender: 'agent',
      content: "I've sent an email notification to the beneficiary with the current status of the claim and next steps.",
      agentType: 'status-assistant'
    });
    
    setShowEmailPreview(false);
  };
  
  // Calculate the estimated time remaining based on processing time
  const getEstimatedTimeRemaining = () => {
    if (!claimData) return null;
    
    const claimTypeInfo = claimTypesData.find(type => type.id === claimData.policyType);
    if (!claimTypeInfo) return null;
    
    const processingTimeText = claimTypeInfo.processingTime;
    
    // Extract the days range from the processing time text (format: "X-Y business days")
    const daysRangeMatch = processingTimeText.match(/(\d+)-(\d+)/);
    if (!daysRangeMatch) return null;
    
    const minDays = parseInt(daysRangeMatch[1], 10);
    const maxDays = parseInt(daysRangeMatch[2], 10);
    
    // Use the average of min and max for the calculation
    const averageDays = Math.floor((minDays + maxDays) / 2);
    
    // Find when the claim entered review
    const reviewEntry = statusHistory.find(entry => entry.status === 'In Review');
    if (!reviewEntry) return null;
    
    // Calculate the expected completion date
    const reviewDate = new Date(reviewEntry.timestamp);
    const completionDate = new Date(reviewDate);
    completionDate.setDate(reviewDate.getDate() + averageDays);
    
    // Calculate days remaining
    const currentDate = new Date();
    const daysRemaining = Math.max(0, Math.ceil((completionDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    return {
      estimatedCompletion: completionDate.toLocaleDateString(),
      daysRemaining,
      progress: Math.min(100, Math.max(0, Math.round((1 - (daysRemaining / averageDays)) * 100))),
    };
  };
  
  const estimatedTime = getEstimatedTimeRemaining();
  
  // Mock claim types data for processing time info
  const claimTypesData = [
    {
      id: "annuity",
      name: "Annuity Claim",
      processingTime: "5-7 business days"
    },
    {
      id: "life",
      name: "Life Insurance Claim",
      processingTime: "7-10 business days"
    },
    {
      id: "ltc",
      name: "Long-Term Care Claim",
      processingTime: "10-14 business days"
    },
    {
      id: "disability",
      name: "Disability Income Claim",
      processingTime: "7-14 business days"
    }
  ];
  
  // Check if component should display based on active tab
  if (activeTab !== 'track') return null;
  
  // Check if claim was started
  if (!claimData && !demoMode) {
    return (
      <div className="flex h-full justify-center items-center p-8">
        <div className="bg-yellow-50 p-4 rounded-lg max-w-md text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-yellow-800 mb-2">No claim to track</h3>
          <p className="text-yellow-700 mb-4">
            Please start a claim first before tracking its status.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => setActiveTab('start')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              Start a Claim
            </button>
            
            <div className="flex flex-col items-center">
              <p className="text-sm text-yellow-700 mb-2">Or enable demo mode to see claim tracking features</p>
              <button
                onClick={() => {
                  toggleDemoMode();
                  toggleAutoProgressDemo();
                }}
                className="inline-flex items-center px-4 py-2 border border-yellow-300 text-sm font-medium rounded-md shadow-sm text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none"
              >
                <Wand2 className="h-4 w-4 mr-1.5" />
                Enable Demo Mode
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Check if form was submitted
  if (claimStatus === 'Not Started' && !demoMode) {
    return (
      <div className="flex h-full justify-center items-center p-8">
        <div className="bg-yellow-50 p-4 rounded-lg max-w-md text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Claim Not Submitted</h3>
          <p className="text-yellow-700 mb-4">
            Please complete and submit the claim form before tracking its status.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => setActiveTab('fill')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              Complete Claim Form
            </button>
            
            <div className="flex flex-col items-center">
              <p className="text-sm text-yellow-700 mb-2">Or enable demo mode to see claim tracking features</p>
              <button
                onClick={() => {
                  toggleDemoMode();
                  toggleAutoProgressDemo();
                }}
                className="inline-flex items-center px-4 py-2 border border-yellow-300 text-sm font-medium rounded-md shadow-sm text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none"
              >
                <Wand2 className="h-4 w-4 mr-1.5" />
                Enable Demo Mode
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Track Your Claim</h1>
            <p className="text-gray-600">
              Monitor the progress of your claim and receive updates on its status.
            </p>
          </div>
          
          {/* Demo Mode Toggle */}
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2">Demo Mode</span>
            <button 
              onClick={toggleDemoMode}
              className="focus:outline-none"
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
        
        {/* Auto Progress Demo Toggle */}
        {demoMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 animate-fade-in">
            <div className="flex items-start">
              <Wand2 className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-blue-800 mb-1">Demo Mode Activated</h3>
                <p className="text-sm text-blue-600 mb-2">
                  Use demo mode to simulate claim status changes and explore how the tracking system works. 
                </p>
                <div className="flex items-center">
                  <button
                    onClick={toggleAutoProgressDemo}
                    className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-sm font-medium rounded-md shadow-sm text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none transition-colors"
                  >
                    <Clock className="mr-1.5 h-4 w-4" />
                    {autoProgressDemo ? "Disable Auto Progress" : "Enable Auto Progress"}
                  </button>
                  <span className="ml-2 text-xs text-blue-500">
                    {autoProgressDemo ? "Status will change automatically" : "Use controls to change status manually"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className={`bg-white rounded-lg shadow border border-gray-200 p-6 mb-6 transition-all duration-500 transform ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Claim #{claimData?.policyNumber || "ALZ-1234567"}</h2>
              <p className="text-sm text-gray-500">
                {claimData?.claimType || "Life Insurance Claim"} - Filed on {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1.5 rounded-md text-sm font-medium inline-flex items-center gap-1.5 ${
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
                {claimStatus}
              </div>
              <button 
                onClick={() => {
                  setEmailTemplateType(getEmailType(claimStatus));
                  setShowEmailPreview(true);
                }}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Mail className="mr-1.5 h-4 w-4 text-gray-500" />
                Send Update
              </button>
            </div>
          </div>
          
          {/* Estimated time remaining */}
          {estimatedTime && claimStatus === 'In Review' && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-blue-800 flex items-center">
                  <Clock className="h-4 w-4 mr-1.5" />
                  Estimated Completion
                </h3>
                <span className="text-sm font-medium text-blue-800">
                  {estimatedTime.daysRemaining} {estimatedTime.daysRemaining === 1 ? 'day' : 'days'} remaining
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2.5 mb-1">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${estimatedTime.progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-blue-600">
                <span>Started</span>
                <span>Expected completion: {estimatedTime.estimatedCompletion}</span>
              </div>
            </div>
          )}
          
          {/* Status Timeline - Improved Visual */}
          <div className="relative mb-10 pt-4" ref={timelineRef}>
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gray-200 rounded-full"></div>
            
            <div className="absolute left-8 top-0 w-1 bg-blue-500 rounded-full transition-all duration-1000 ease-out-in"
                style={{ height: `${Math.min(100, getStatusStep(claimStatus) / 4 * 100)}%` }}>
            </div>
            
            <div className="relative flex flex-col space-y-10">
              {/* Step 1: Submitted */}
              <div className={`flex items-start timeline-item opacity-0 transform translate-y-4 transition-all duration-500 delay-150 ${
                getStatusStep(claimStatus) >= 0 ? 'active' : ''
              }`}>
                <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                  getStatusStep(claimStatus) >= 0 
                    ? 'bg-blue-500 text-white ring-2 ring-white' 
                    : 'bg-gray-200 text-gray-400'
                } mr-4 transition-colors duration-500`}>
                  <FileCheck className="h-4 w-4" />
                </div>
                <div className="block">
                  <div className="flex items-center">
                    <h3 className={`font-medium transition-colors duration-500 ${
                      getStatusStep(claimStatus) >= 0 ? 'text-blue-900' : 'text-gray-500'
                    }`}>
                      Claim Submitted
                    </h3>
                    {getStatusStep(claimStatus) >= 0 && (
                      <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                    )}
                  </div>
                  <time className="text-xs text-gray-500">
                    {statusHistory.length > 0
                      ? statusHistory[0].timestamp.toLocaleString()
                      : new Date().toLocaleString()}
                  </time>
                  <p className="text-sm text-gray-600 mt-1">
                    Claim form and documents have been submitted for processing.
                  </p>
                </div>
              </div>
              
              {/* Step 2: Documents Verified */}
              <div className={`flex items-start timeline-item opacity-0 transform translate-y-4 transition-all duration-500 delay-300 ${
                getStatusStep(claimStatus) >= 1 ? 'active' : ''
              }`}>
                <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                  getStatusStep(claimStatus) >= 1 
                    ? 'bg-blue-500 text-white ring-2 ring-white' 
                    : 'bg-gray-200 text-gray-400'
                } mr-4 transition-colors duration-500`}>
                  <Shield className="h-4 w-4" />
                </div>
                <div className="block">
                  <div className="flex items-center">
                    <h3 className={`font-medium transition-colors duration-500 ${
                      getStatusStep(claimStatus) >= 1 ? 'text-blue-900' : 'text-gray-500'
                    }`}>
                      Documents Verified
                    </h3>
                    {getStatusStep(claimStatus) >= 1 && (
                      <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                    )}
                  </div>
                  <time className="text-xs text-gray-500">
                    {statusHistory.length > 1
                      ? statusHistory[1].timestamp.toLocaleString()
                      : ''}
                  </time>
                  <p className="text-sm text-gray-600 mt-1">
                    All submitted documents have been reviewed and verified.
                  </p>
                </div>
              </div>
              
              {/* Step 2.5: Additional Info (Conditional) */}
              {claimStatus === 'Additional Info Required' && (
                <div className={`flex items-start timeline-item opacity-0 transform translate-y-4 transition-all duration-500 delay-450 ${
                  getStatusStep(claimStatus) === 1.5 ? 'active' : ''
                }`}>
                  <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white ring-2 ring-white mr-4">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <div className="block">
                    <h3 className="font-medium text-amber-800">
                      Additional Information Required
                    </h3>
                    <time className="text-xs text-gray-500">
                      {new Date().toLocaleString()}
                    </time>
                    <div className="text-sm text-gray-600 mt-2 bg-amber-50 p-3 rounded-lg border border-amber-200">
                      <h4 className="font-medium text-amber-800 mb-1">Required Documents:</h4>
                      <ul className="list-disc pl-5 space-y-1 text-amber-700">
                        <li>Copy of beneficiary's government-issued ID</li>
                        <li>Completed tax form W-9</li>
                        <li>Proof of relationship to the insured</li>
                      </ul>
                      <div className="mt-3">
                        <button 
                          className="inline-flex items-center px-3 py-1.5 border border-amber-300 text-sm font-medium rounded-md text-amber-700 bg-amber-100 hover:bg-amber-200 transition-colors"
                          onClick={() => setActiveTab('upload')}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Step 3: Under Review */}
              <div className={`flex items-start timeline-item opacity-0 transform translate-y-4 transition-all duration-500 delay-450 ${
                getStatusStep(claimStatus) >= 2 ? 'active' : ''
              }`}>
                <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                  getStatusStep(claimStatus) >= 2 
                    ? 'bg-blue-500 text-white ring-2 ring-white' 
                    : 'bg-gray-200 text-gray-400'
                } mr-4 transition-colors duration-500`}>
                  <UserCheck className="h-4 w-4" />
                </div>
                <div className="block">
                  <h3 className={`font-medium transition-colors duration-500 ${
                    getStatusStep(claimStatus) >= 2 ? 'text-blue-900' : 'text-gray-500'
                  }`}>
                    Claim Under Review
                  </h3>
                  <time className="text-xs text-gray-500">
                    {getStatusStep(claimStatus) >= 2 && statusHistory.length > 2
                      ? statusHistory[2].timestamp.toLocaleString()
                      : ''}
                  </time>
                  <p className="text-sm text-gray-600 mt-1">
                    Claim is being reviewed by our claims processing team.
                    {estimatedTime && claimStatus === 'In Review' && 
                      ` Expected completion on ${estimatedTime.estimatedCompletion}.`}
                  </p>
                </div>
              </div>
              
              {/* Step 4: Decision */}
              <div className={`flex items-start timeline-item opacity-0 transform translate-y-4 transition-all duration-500 delay-600 ${
                getStatusStep(claimStatus) >= 3 ? 'active' : ''
              }`}>
                <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                  claimStatus === 'Denied'
                    ? 'bg-red-500 text-white ring-2 ring-white'
                    : getStatusStep(claimStatus) >= 3
                    ? 'bg-green-500 text-white ring-2 ring-white'
                    : 'bg-gray-200 text-gray-400'
                } mr-4 transition-colors duration-500`}>
                  {claimStatus === 'Denied'
                    ? <XCircle className="h-4 w-4" />
                    : <CheckCircle className="h-4 w-4" />}
                </div>
                <div className="block">
                  <h3 className={`font-medium ${
                    claimStatus === 'Denied'
                      ? 'text-red-800'
                      : getStatusStep(claimStatus) >= 3
                      ? 'text-green-800' 
                      : 'text-gray-500'
                  }`}>
                    {claimStatus === 'Denied' ? 'Claim Denied' : 'Claim Approved'}
                  </h3>
                  <time className="text-xs text-gray-500">
                    {getStatusStep(claimStatus) >= 3 && statusHistory.length > 3
                      ? statusHistory[3].timestamp.toLocaleString()
                      : ''}
                  </time>
                  <p className="text-sm text-gray-600 mt-1">
                    {claimStatus === 'Denied'
                      ? 'Claim has been denied. Please see details below for the reason and your options.'
                      : getStatusStep(claimStatus) >= 3
                      ? 'Your claim has been approved! Payment processing will begin shortly.'
                      : 'Our team will make a decision after review is complete.'}
                  </p>
                  
                  {claimStatus === 'Denied' && (
                    <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                      <h4 className="text-sm font-medium text-red-800 mb-1">Reason for Denial:</h4>
                      <p className="text-sm text-red-700">
                        The policy terms do not cover the claimed event. Please refer to section 3.2 of your policy document for coverage details.
                      </p>
                      <p className="text-sm font-medium text-red-800 mt-2 mb-1">Your Options:</p>
                      <ul className="list-disc pl-5 text-sm text-red-700">
                        <li>Submit an appeal within 60 days</li>
                        <li>Provide additional supporting documentation</li>
                        <li>Request a review by a claims specialist</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Step 5: Payment */}
              <div className={`flex items-start timeline-item opacity-0 transform translate-y-4 transition-all duration-500 delay-750 ${
                getStatusStep(claimStatus) >= 4 ? 'active' : ''
              }`}>
                <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                  getStatusStep(claimStatus) >= 4 
                    ? 'bg-green-500 text-white ring-2 ring-white' 
                    : 'bg-gray-200 text-gray-400'
                } mr-4 transition-colors duration-500`}>
                  <DollarSign className="h-4 w-4" />
                </div>
                <div className="block">
                  <h3 className={`font-medium ${
                    getStatusStep(claimStatus) >= 4 ? 'text-green-800' : 'text-gray-500'
                  }`}>
                    Payment Issued
                  </h3>
                  <time className="text-xs text-gray-500">
                    {getStatusStep(claimStatus) >= 4 && statusHistory.length > 4
                      ? statusHistory[4].timestamp.toLocaleString()
                      : ''}
                  </time>
                  <p className="text-sm text-gray-600 mt-1">
                    {getStatusStep(claimStatus) >= 4
                      ? 'Payment has been issued according to your selected method. Direct deposits typically appear within 1-3 business days, while checks may take 7-10 business days for delivery.'
                      : 'Payment will be processed once your claim is approved.'}
                  </p>
                  
                  {getStatusStep(claimStatus) >= 4 && (
                    <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm text-green-800"><span className="font-medium">Payment Method:</span> Direct Deposit</p>
                          <p className="text-sm text-green-800"><span className="font-medium">Payment Amount:</span> $150,000.00</p>
                        </div>
                        <div>
                          <p className="text-sm text-green-800"><span className="font-medium">Reference:</span> PAY-123456</p>
                          <p className="text-sm text-green-800"><span className="font-medium">Date:</span> {new Date().toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Current Status Card */}
          <div className={`p-4 rounded-lg mb-6 flex items-start ${
            claimStatus === 'Approved' || claimStatus === 'Paid'
              ? 'bg-green-50 border border-green-100'
              : claimStatus === 'Denied'
              ? 'bg-red-50 border border-red-100'
              : claimStatus === 'In Review'
              ? 'bg-blue-50 border border-blue-100'
              : claimStatus === 'Additional Info Required'
              ? 'bg-amber-50 border border-amber-100'
              : 'bg-gray-50 border border-gray-200'
          } transition-colors duration-500`}>
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
            <div className="border border-amber-200 rounded-lg bg-amber-50 p-4 mb-6 shadow-sm">
              <h3 className="text-md font-medium text-amber-800 mb-2 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Additional Information Required
              </h3>
              <div className="space-y-4">
                <div className="p-3 bg-white rounded-lg border border-amber-100 shadow-sm">
                  <div className="flex items-start">
                    <div className="bg-amber-100 rounded-lg p-1.5 mr-2">
                      <FileText className="h-5 w-5 text-amber-700" />
                    </div>
                    <div>
                      <h4 className="font-medium text-amber-700">Missing Documentation</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 mt-1">
                        <li>Copy of beneficiary's government-issued photo ID</li>
                        <li>Completed tax form W-9</li>
                        <li>Proof of relationship to the insured</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-white rounded-lg border border-amber-100 shadow-sm">
                  <div className="flex items-start">
                    <div className="bg-amber-100 rounded-lg p-1.5 mr-2">
                      <Calendar className="h-5 w-5 text-amber-700" />
                    </div>
                    <div>
                      <h4 className="font-medium text-amber-700">Response Deadline</h4>
                      <p className="text-sm text-gray-700 mt-1">
                        Please submit the requested information by <span className="font-medium">{
                          (() => {
                            const date = new Date();
                            date.setDate(date.getDate() + 30);
                            return date.toLocaleDateString();
                          })()
                        }</span>. Failure to provide this information may result in claim denial.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex gap-3">
                <button 
                  className="flex-1 md:flex-none inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none transition-colors"
                  onClick={() => setActiveTab('upload')}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Documents
                </button>
                <button 
                  className="flex-1 md:flex-none inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none transition-colors"
                  onClick={() => setActiveTab('contact')}
                >
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Request Assistance
                </button>
              </div>
            </div>
          )}
          
          {/* Claim Details */}
          <div className="border rounded-lg overflow-hidden mb-6 shadow-sm">
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
              <div className="p-4 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                  <div>
                    <p className="text-xs text-gray-500">Policy Number</p>
                    <p className="text-sm font-medium">{claimData?.policyNumber || "ALZ-1234567"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Policy Holder</p>
                    <p className="text-sm font-medium">{claimData?.policyHolder || "John Smith"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Claim Type</p>
                    <p className="text-sm font-medium">{claimData?.claimType || "Life Insurance Claim"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Submission Date</p>
                    <p className="text-sm font-medium">{new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs text-gray-500">Claim Reason</p>
                    <p className="text-sm">{claimData?.claimReason || "Natural causes"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Documents Submitted</p>
                    <p className="text-sm font-medium">{documents.length || (demoMode ? 3 : 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Assigned To</p>
                    <p className="text-sm font-medium">Allianz Claims Team</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Expected Timeline</h4>
                  <p className="text-sm text-gray-600">
                    Typical processing time for {claimData?.claimType || "Life Insurance"} claims is {
                      (() => {
                        if (!claimData) return "7-10 business days";
                        const claimTypeInfo = claimTypesData.find(type => type.id === claimData.policyType);
                        return claimTypeInfo ? claimTypeInfo.processingTime : '7-10 business days';
                      })()
                    } after all required documentation is received.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Activity Timeline */}
          <div className="mb-8">
            <h3 className="font-medium text-gray-900 mb-4">Activity Timeline</h3>
            <div className="border rounded-lg overflow-hidden shadow-sm">
              {statusHistory.map((activity, index) => (
                <div 
                  key={index} 
                  className={`p-4 ${index < statusHistory.length - 1 ? 'border-b border-gray-200' : ''} ${
                    activity.status === 'Additional Info Required'
                      ? 'bg-amber-50'
                      : activity.status === 'Approved' || activity.status.includes('Verified')
                      ? 'bg-green-50'
                      : index === statusHistory.length - 1
                      ? 'bg-blue-50'
                      : 'bg-white'
                  }`}
                >
                  <div className="flex">
                    <div className="flex-shrink-0 mr-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        activity.status === 'Documents Verified' || activity.status === 'Approved' || activity.status === 'Paid'
                          ? 'bg-green-100 text-green-600'
                          : activity.status === 'In Review'
                          ? 'bg-blue-100 text-blue-600'
                          : activity.status === 'Additional Info Required'
                          ? 'bg-amber-100 text-amber-600'
                          : activity.status === 'Documents Pending'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {activity.status === 'Documents Verified' && <CheckCircle className="h-4 w-4" />}
                        {activity.status === 'In Review' && <Clock className="h-4 w-4" />}
                        {activity.status === 'Additional Info Required' && <AlertCircle className="h-4 w-4" />}
                        {activity.status === 'Documents Pending' && <FileText className="h-4 w-4" />}
                        {activity.status === 'Approved' && <CheckCircle className="h-4 w-4" />}
                        {activity.status === 'Paid' && <DollarSign className="h-4 w-4" />}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <p className={`text-sm font-medium ${
                          activity.status === 'Additional Info Required'
                            ? 'text-amber-800'
                            : activity.status === 'Approved' || activity.status === 'Paid' || activity.status.includes('Verified')
                            ? 'text-green-800'
                            : 'text-gray-900'
                        }`}>
                          {activity.status}
                        </p>
                        {index === statusHistory.length - 1 && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">Latest</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{activity.timestamp.toLocaleString()}</p>
                      <p className={`text-sm mt-1 ${
                        activity.status === 'Additional Info Required'
                          ? 'text-amber-700'
                          : activity.status === 'Approved' || activity.status === 'Paid' || activity.status.includes('Verified')
                          ? 'text-green-700'
                          : 'text-gray-600'
                      }`}>
                        {activity.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Simulation Controls - For demo only */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Simulation Controls (Demo Only)</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <button 
                onClick={() => handleStatusSimulation('In Review')}
                className="px-3 py-2 bg-blue-100 text-blue-700 text-xs font-medium rounded hover:bg-blue-200 transition-colors"
              >
                <Clock className="h-4 w-4 mx-auto mb-1" />
                Review
              </button>
              <button 
                onClick={() => handleStatusSimulation('Additional Info Required')}
                className="px-3 py-2 bg-amber-100 text-amber-700 text-xs font-medium rounded hover:bg-amber-200 transition-colors"
              >
                <AlertCircle className="h-4 w-4 mx-auto mb-1" />
                Need Info
              </button>
              <button 
                onClick={() => handleStatusSimulation('Approved')}
                className="px-3 py-2 bg-green-100 text-green-700 text-xs font-medium rounded hover:bg-green-200 transition-colors"
              >
                <CheckCircle className="h-4 w-4 mx-auto mb-1" />
                Approve
              </button>
              <button 
                onClick={() => handleStatusSimulation('Paid')}
                className="px-3 py-2 bg-green-100 text-green-700 text-xs font-medium rounded hover:bg-green-200 transition-colors"
              >
                <DollarSign className="h-4 w-4 mx-auto mb-1" />
                Pay
              </button>
              <button 
                onClick={() => handleStatusSimulation('Denied')}
                className="px-3 py-2 bg-red-100 text-red-700 text-xs font-medium rounded hover:bg-red-200 transition-colors"
              >
                <XCircle className="h-4 w-4 mx-auto mb-1" />
                Deny
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              These buttons are for demonstration purposes to simulate different claim statuses.
            </p>
          </div>
          
          {/* Need Help Section */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-start">
              <HelpCircle className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-1">Need assistance?</h3>
                <p className="text-sm text-gray-600">
                  If you have questions about your claim or need assistance, our customer service team is here to help.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button 
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors"
                    onClick={() => setActiveTab('contact')}
                  >
                    Contact a Claims Agent
                  </button>
                  <button 
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
                    onClick={() => {
                      setEmailTemplateType('status_update');
                      setShowEmailPreview(true);
                    }}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Send Status Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Email Template Preview Modal */}
      {showEmailPreview && (
        <div className="fixed inset-0 z-50 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="w-full max-w-3xl p-4">
            <EmailTemplate
              templateType={emailTemplateType}
              recipientName={claimData?.policyHolder || "John Smith"}
              policyNumber={claimData?.policyNumber || "ALZ-1234567"}
              claimType={claimData?.claimType || "Life Insurance Claim"}
              claimStatus={claimStatus}
              onSend={handleSendEmailNotification}
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
      
      <style jsx>{`
        .timeline-item.active {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
};

export default EnhancedTrackClaimStatus;