import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight, 
  FileText, 
  Download, 
  Info, 
  User,
  Home, 
  Calendar,
  Phone,
  Mail,
  DollarSign,
  CreditCard,
  Building,
  AtSign,
  ToggleLeft,
  ToggleRight,
  Zap,
  Shield
} from 'lucide-react';
import dayjs from 'dayjs';
import { isValidEmail, isValidPhone, formatPhoneNumber } from '../../utils/validators';
import ValidationIndicator from '../common/ValidationIndicator';
import Toast from '../common/Toast';

const ImprovedFillClaimForm: React.FC = () => {
  const { 
    claimData, 
    activeTab, 
    setActiveTab, 
    uploadedDocuments, 
    addMessageToChat, 
    setClaimStatus, 
    claimStatus 
  } = useAppContext();
  
  const [formData, setFormData] = useState({
    policyNumber: '',
    claimantName: '',
    dateOfIncident: '',
    beneficiaryName: '',
    beneficiaryRelation: '',
    beneficiaryPhone: '',
    beneficiaryEmail: '',
    beneficiaryAddress: '',
    paymentMethod: 'directDeposit',
    accountType: 'checking',
    accountNumber: '',
    routingNumber: '',
    additionalInfo: ''
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formProgress, setFormProgress] = useState<number>(0);
  const [formTouched, setFormTouched] = useState<Record<string, boolean>>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [isSaving, setIsSaving] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [animateField, setAnimateField] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fieldRefs = useRef<Record<string, HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null>>({});
  
  // Demo data profiles
  const demoProfiles = [
    {
      name: "John Smith",
      relation: "spouse",
      phone: "(555) 123-4567",
      email: "john.smith@example.com",
      address: "123 Main St, Anytown, CA 90210",
      date: dayjs().subtract(10, 'day').format('YYYY-MM-DD')
    },
    {
      name: "Sarah Johnson",
      relation: "child",
      phone: "(555) 987-6543",
      email: "sarah.j@example.com",
      address: "456 Oak Ave, Somewhere, NY 10001",
      date: dayjs().subtract(7, 'day').format('YYYY-MM-DD')
    },
    {
      name: "Michael Wilson",
      relation: "sibling",
      phone: "(555) 456-7890",
      email: "michael.wilson@example.com",
      address: "789 Pine Dr, Elsewhere, TX 75001",
      date: dayjs().subtract(14, 'day').format('YYYY-MM-DD')
    }
  ];
  
  useEffect(() => {
    if (claimData) {
      // Pre-fill form with available claim data
      setFormData(prev => ({
        ...prev,
        policyNumber: claimData.policyNumber || '',
        claimantName: claimData.policyHolder || ''
      }));
    }
    
    // Add initial guidance when first visiting this tab
    if (activeTab === 'fill') {
      setTimeout(() => {
        addMessageToChat({
          sender: 'agent',
          content: "Now let's complete your claim form. I've pre-filled some information from your policy. Please fill in the remaining fields. If you need help with any field, you can ask me.",
          agentType: 'form-assistant'
        });
      }, 500);
    }
  }, [claimData, activeTab, addMessageToChat]);
  
  // Calculate form completion percentage
  useEffect(() => {
    const requiredFields = ['policyNumber', 'claimantName', 'dateOfIncident', 'beneficiaryName', 'beneficiaryPhone', 'beneficiaryEmail'];
    
    // Add payment fields if direct deposit is selected
    if (formData.paymentMethod === 'directDeposit') {
      requiredFields.push('accountNumber', 'routingNumber');
    }
    
    const completedFields = requiredFields.filter(field => {
      const value = formData[field as keyof typeof formData];
      return typeof value === 'string' && value.trim() !== '';
    });
    
    const progress = Math.floor((completedFields.length / requiredFields.length) * 100);
    setFormProgress(progress);
    
  }, [formData]);
  
  // Validate a single field
  const validateSingleField = (name: string, value: string): string => {
    const fieldLabels: Record<string, string> = {
      policyNumber: 'Policy number',
      claimantName: 'Claimant name',
      dateOfIncident: 'Date of incident',
      beneficiaryName: 'Beneficiary name',
      beneficiaryPhone: 'Phone number',
      beneficiaryEmail: 'Email address',
      accountNumber: 'Account number',
      routingNumber: 'Routing number'
    };
    
    // Get field label for error message
    const fieldLabel = fieldLabels[name] || name;
    
    // Required field check
    if (!value.trim()) {
      return `${fieldLabel} is required`;
    }
    
    // Field-specific validations
    switch(name) {
      case 'beneficiaryEmail':
        return isValidEmail(value) ? '' : 'Please enter a valid email address';
      
      case 'beneficiaryPhone':
        return isValidPhone(value) ? '' : 'Please enter a valid phone number';
        
      case 'routingNumber':
        // Simple routing number validation - 9 digits
        return /^\d{9}$/.test(value) ? '' : 'Routing number must be 9 digits';
        
      case 'accountNumber':
        // Simple account number validation
        return value.length >= 4 ? '' : 'Please enter a valid account number';
        
      default:
        return '';
    }
  };
  
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // Validate required fields
    Object.entries(formData).forEach(([key, value]) => {
      // Skip validation for optional fields
      if (['beneficiaryRelation', 'beneficiaryAddress', 'additionalInfo'].includes(key)) {
        return;
      }
      
      // Skip account fields if payment method is check
      if (formData.paymentMethod === 'check' && (key === 'accountNumber' || key === 'routingNumber')) {
        return;
      }
      
      if (typeof value === 'string') {
        const error = validateSingleField(key, value);
        if (error) {
          errors[key] = error;
        }
      }
    });
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = () => {
    // Skip validation in demo mode
    if (demoMode) {
      setIsSubmitting(true);
      
      // Show success toast
      setToastMessage('Processing your claim...');
      setToastType('info');
      setShowToast(true);
      
      // Simulate processing delay
      setTimeout(() => {
        setFormSubmitted(true);
        setIsSubmitting(false);
        
        // Update the claim status
        setClaimStatus('In Review');
        
        // Show success toast
        setToastMessage('Claim form submitted successfully!');
        setToastType('success');
        setShowToast(true);
        
        // Add success message to chat
        addMessageToChat({
          sender: 'agent',
          content: "Thank you! Your claim form has been successfully submitted. You can track the status of your claim in the 'Track Claim Status' tab. Our team will review your submission and contact you if any additional information is needed.",
          agentType: 'form-assistant'
        });
        
        // Automatically navigate to tracking after short delay
        setTimeout(() => {
          setActiveTab('track');
        }, 2000);
      }, 2000);
      
      return;
    }
    
    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setFormTouched(allTouched);
    
    if (validateForm()) {
      // Show loading state
      setIsSubmitting(true);
      
      // Show processing toast
      setToastMessage('Processing your claim...');
      setToastType('info');
      setShowToast(true);
      
      // Simulate API call delay
      setTimeout(() => {
        setIsSubmitting(false);
        setFormSubmitted(true);
        
        // Update the claim status
        setClaimStatus('In Review');
        
        // Show success toast
        setToastMessage('Claim form submitted successfully!');
        setToastType('success');
        setShowToast(true);
        
        // Add success message to chat
        addMessageToChat({
          sender: 'agent',
          content: "Thank you! Your claim form has been successfully submitted. You can track the status of your claim in the 'Track Claim Status' tab. Our team will review your submission and contact you if any additional information is needed.",
          agentType: 'form-assistant'
        });
        
        // Automatically navigate to tracking after short delay
        setTimeout(() => {
          setActiveTab('track');
        }, 3000);
      }, 2500);
    } else {
      // Show error toast
      setToastMessage('Please correct the errors in the form before submitting');
      setToastType('error');
      setShowToast(true);
      
      // Add error message to chat
      addMessageToChat({
        sender: 'agent',
        content: "There are some issues with your form submission. Please check the highlighted fields and provide the required information.",
        agentType: 'form-assistant'
      });
      
      // Focus on the first field with an error
      const firstErrorField = Object.keys(formErrors)[0];
      const element = fieldRefs.current[firstErrorField];
      if (element) {
        element.focus();
      }
      
      // Animate the field with error
      setAnimateField(firstErrorField);
      setTimeout(() => setAnimateField(null), 1000);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Special handling for phone numbers - format as they type
    if (name === 'beneficiaryPhone') {
      setFormData({
        ...formData,
        [name]: formatPhoneNumber(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Mark this field as touched
    setFormTouched({
      ...formTouched,
      [name]: true
    });
    
    // Track active field
    setActiveField(name);
    
    // Validate the field if it's been touched
    if (formTouched[name]) {
      const error = validateSingleField(name, name === 'beneficiaryPhone' ? formatPhoneNumber(value) : value);
      
      setFormErrors({
        ...formErrors,
        [name]: error
      });
      
      // Provide real-time guidance based on field interactions
      if (error && !formErrors[name]) {
        // Field just became invalid
        setAnimateField(name);
        setTimeout(() => setAnimateField(null), 800);
      }
      
      if (name === 'beneficiaryRelation' && value) {
        const delay = setTimeout(() => {
          addMessageToChat({
            sender: 'agent',
            content: `I see you've selected "${value}" as the relationship to the insured. Please make sure this matches any documentation you've provided that verifies your relationship.`,
            agentType: 'form-assistant'
          });
        }, 1000);
        
        return () => clearTimeout(delay);
      }
    }
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Mark this field as touched
    setFormTouched({
      ...formTouched,
      [name]: true
    });
    
    // Validate on blur
    const error = validateSingleField(name, value);
    
    setFormErrors({
      ...formErrors,
      [name]: error
    });
    
    // Clear active field
    setActiveField(null);
  };
  
  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setActiveField(name);
    
    // Provide field-specific guidance when a user focuses on a field
    if (name === 'beneficiaryPhone' && !formTouched[name]) {
      addMessageToChat({
        sender: 'agent',
        content: "Please enter the beneficiary's phone number in the format (XXX) XXX-XXXX. We'll use this to contact them if we need additional information.",
        agentType: 'form-assistant'
      });
    } else if (name === 'beneficiaryEmail' && !formTouched[name]) {
      addMessageToChat({
        sender: 'agent',
        content: "We'll send claim status updates to this email address. Make sure it's entered correctly.",
        agentType: 'form-assistant'
      });
    } else if (name === 'routingNumber' && !formTouched[name]) {
      addMessageToChat({
        sender: 'agent',
        content: "Your routing number is a 9-digit code that identifies your bank. It can be found on the bottom left of your check.",
        agentType: 'form-assistant'
      });
    }
  };
  
  // Auto-save form when fields change
  useEffect(() => {
    // Skip initial render
    if (Object.keys(formTouched).length === 0) return;
    
    // Only save if at least one field has been touched
    if (Object.values(formTouched).some(Boolean)) {
      const saveTimer = setTimeout(() => {
        // In a real app, this would save to a server or localStorage
        // For demo, just show a save indicator
        setIsSaving(true);
        setTimeout(() => {
          setIsSaving(false);
          // Show auto-save toast occasionally
          if (Math.random() > 0.7) {
            setToastMessage('Form progress auto-saved');
            setToastType('info');
            setShowToast(true);
          }
        }, 1000);
      }, 2000);
      
      return () => clearTimeout(saveTimer);
    }
  }, [formData, formTouched]);
  
  const generatePdf = () => {
    // In a real app, this would generate a PDF of the form
    // For this demo, we'll just show a simulated success message
    addMessageToChat({
      sender: 'agent',
      content: "I've generated a PDF copy of your claim form. This can be useful for your records. You can also continue filling the form online.",
      agentType: 'form-assistant'
    });
    
    // Show success toast
    setToastMessage('PDF copy of your form has been generated');
    setToastType('success');
    setShowToast(true);
  };
  
  const toggleDemoMode = () => {
    setDemoMode(!demoMode);
    
    if (!demoMode) {
      // Enabling demo mode
      addMessageToChat({
        sender: 'agent',
        content: "Demo mode activated. The form has been pre-filled with sample data for demonstration purposes. You can submit the form to proceed to claim tracking.",
        agentType: 'form-assistant'
      });
      
      // Pre-fill form with sample data
      const demoProfile = demoProfiles[Math.floor(Math.random() * demoProfiles.length)];
      setFormData({
        policyNumber: claimData?.policyNumber || 'ALZ-1234567',
        claimantName: claimData?.policyHolder || 'John Smith',
        dateOfIncident: demoProfile.date,
        beneficiaryName: demoProfile.name,
        beneficiaryRelation: demoProfile.relation,
        beneficiaryPhone: demoProfile.phone,
        beneficiaryEmail: demoProfile.email,
        beneficiaryAddress: demoProfile.address,
        paymentMethod: 'directDeposit',
        accountType: 'checking',
        accountNumber: '123456789',
        routingNumber: '987654321',
        additionalInfo: 'This is a demo submission for testing purposes.'
      });
      
      // Set all fields as touched
      const allTouched: Record<string, boolean> = {};
      Object.keys(formData).forEach(key => {
        allTouched[key] = true;
      });
      setFormTouched(allTouched);
      
      // Clear any errors
      setFormErrors({});
      
      // Show success toast
      setToastMessage('Form auto-filled with demo data');
      setToastType('success');
      setShowToast(true);
    }
  };
  
  // Check if component should display based on active tab
  if (activeTab !== 'fill') return null;
  
  // Check if all prerequisites are met
  if (!claimData) {
    return (
      <div className="flex h-full justify-center items-center p-8">
        <div className="bg-yellow-50 p-4 rounded-lg max-w-md text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-yellow-800 mb-2">No claim started</h3>
          <p className="text-yellow-700 mb-4">
            Please start a claim first before filling out the claim form.
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
  
  // In normal mode, check if documents were uploaded
  if (uploadedDocuments.length === 0 && !demoMode) {
    return (
      <div className="flex h-full justify-center items-center p-8">
        <div className="bg-yellow-50 p-4 rounded-lg max-w-md text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Missing Documents</h3>
          <p className="text-yellow-700 mb-4">
            Please upload the required documents before filling out the claim form.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-2">
            <button
              onClick={() => setActiveTab('upload')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              Upload Documents
            </button>
            <button
              onClick={() => setDemoMode(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              Continue in Demo Mode
            </button>
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Claim Form</h1>
            <p className="text-gray-600">
              Please complete the form below for your {claimData.claimType.toLowerCase()}.
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
        
        {formSubmitted ? (
          <div className="bg-green-50 rounded-lg p-8 mb-6 text-center transform transition-all duration-500 ease-in-out">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-medium text-green-800 mb-3">Claim Form Submitted Successfully</h3>
            <p className="text-green-700 mb-6 max-w-md mx-auto">
              Your claim has been submitted and is now under review. You can track its status in the next tab.
            </p>
            <button
              onClick={() => setActiveTab('track')}
              className="inline-flex items-center px-5 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors duration-150"
            >
              Track Claim Status
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        ) : (
          <>
            {/* Form Progress Bar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <h3 className="text-base font-medium text-gray-900 flex items-center">
                    <FileText className="h-5 w-5 text-blue-500 mr-2" />
                    Form Completion
                  </h3>
                  {isSaving && (
                    <div className="ml-3 flex items-center text-xs text-blue-600">
                      <div className="animate-pulse mr-1">•</div>
                      Auto-saving...
                    </div>
                  )}
                </div>
                <span className="text-base font-medium" style={{color: formProgress < 30 ? '#ef4444' : formProgress < 70 ? '#f59e0b' : '#10b981'}}>{formProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1.5">
                <div 
                  className="h-2.5 rounded-full transition-all duration-500 ease-in-out"
                  style={{
                    width: `${formProgress}%`,
                    backgroundColor: formProgress < 30 ? '#ef4444' : formProgress < 70 ? '#f59e0b' : '#10b981'
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">
                {formProgress < 100 ? 'Fill out all required fields to submit your claim' : 'All required fields completed, ready to submit!'}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <form className="space-y-7" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                {/* Form Header */}
                <div className="bg-gray-50 -mx-6 -mt-6 px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {claimData.claimType} Claim
                    </h2>
                    <div className="text-sm text-gray-500">
                      Reference: {claimData.policyNumber}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <User className="h-5 w-5 text-blue-500 mr-2" />
                      Claim Information
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${activeField === 'policyNumber' ? 'text-blue-700' : 'text-gray-700'}`}>
                          Policy Number
                        </label>
                        <div className={`relative rounded-md shadow-sm ${animateField === 'policyNumber' ? 'animate-shake' : ''}`}>
                          <input
                            type="text"
                            name="policyNumber"
                            value={formData.policyNumber}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            onFocus={handleFocus}
                            ref={el => fieldRefs.current.policyNumber = el}
                            className={`w-full px-3 py-2 border rounded-md ${
                              formTouched.policyNumber && formErrors.policyNumber 
                                ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                                : activeField === 'policyNumber'
                                ? 'border-blue-300 focus:ring-blue-500 focus:border-blue-500 bg-blue-50'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                            } transition-colors duration-200`}
                            disabled={formSubmitted || isSubmitting}
                          />
                          {formTouched.policyNumber && (
                            <ValidationIndicator 
                              isValid={!formErrors.policyNumber} 
                              message={formErrors.policyNumber} 
                            />
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${activeField === 'claimantName' ? 'text-blue-700' : 'text-gray-700'}`}>
                          Claimant Name
                        </label>
                        <div className={`relative rounded-md shadow-sm ${animateField === 'claimantName' ? 'animate-shake' : ''}`}>
                          <input
                            type="text"
                            name="claimantName"
                            value={formData.claimantName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            onFocus={handleFocus}
                            ref={el => fieldRefs.current.claimantName = el}
                            className={`w-full px-3 py-2 border rounded-md ${
                              formTouched.claimantName && formErrors.claimantName 
                                ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                                : activeField === 'claimantName'
                                ? 'border-blue-300 focus:ring-blue-500 focus:border-blue-500 bg-blue-50'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                            } transition-colors duration-200`}
                            disabled={formSubmitted || isSubmitting}
                          />
                          {formTouched.claimantName && (
                            <ValidationIndicator 
                              isValid={!formErrors.claimantName} 
                              message={formErrors.claimantName} 
                            />
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${activeField === 'dateOfIncident' ? 'text-blue-700' : 'text-gray-700'}`}>
                          Date of Incident
                        </label>
                        <div className={`relative rounded-md shadow-sm ${animateField === 'dateOfIncident' ? 'animate-shake' : ''}`}>
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="date"
                            name="dateOfIncident"
                            value={formData.dateOfIncident}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            onFocus={handleFocus}
                            ref={el => fieldRefs.current.dateOfIncident = el}
                            max={dayjs().format('YYYY-MM-DD')}
                            className={`w-full pl-10 pr-4 py-2 border rounded-md ${
                              formTouched.dateOfIncident && formErrors.dateOfIncident 
                                ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                                : activeField === 'dateOfIncident'
                                ? 'border-blue-300 focus:ring-blue-500 focus:border-blue-500 bg-blue-50'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                            } transition-colors duration-200`}
                            disabled={formSubmitted || isSubmitting}
                          />
                          {formTouched.dateOfIncident && (
                            <ValidationIndicator 
                              isValid={!formErrors.dateOfIncident} 
                              message={formErrors.dateOfIncident} 
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <AtSign className="h-5 w-5 text-blue-500 mr-2" />
                      Beneficiary Information
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${activeField === 'beneficiaryName' ? 'text-blue-700' : 'text-gray-700'}`}>
                          Beneficiary Name
                        </label>
                        <div className={`relative rounded-md shadow-sm ${animateField === 'beneficiaryName' ? 'animate-shake' : ''}`}>
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="beneficiaryName"
                            value={formData.beneficiaryName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            onFocus={handleFocus}
                            ref={el => fieldRefs.current.beneficiaryName = el}
                            className={`w-full pl-10 pr-4 py-2 border rounded-md ${
                              formTouched.beneficiaryName && formErrors.beneficiaryName 
                                ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                                : activeField === 'beneficiaryName'
                                ? 'border-blue-300 focus:ring-blue-500 focus:border-blue-500 bg-blue-50'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                            } transition-colors duration-200`}
                            disabled={formSubmitted || isSubmitting}
                          />
                          {formTouched.beneficiaryName && (
                            <ValidationIndicator 
                              isValid={!formErrors.beneficiaryName} 
                              message={formErrors.beneficiaryName} 
                            />
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${activeField === 'beneficiaryRelation' ? 'text-blue-700' : 'text-gray-700'}`}>
                          Relationship to Insured
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <select
                            name="beneficiaryRelation"
                            value={formData.beneficiaryRelation}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            onFocus={handleFocus}
                            ref={el => fieldRefs.current.beneficiaryRelation = el}
                            className={`w-full px-3 py-2 border rounded-md ${
                              activeField === 'beneficiaryRelation'
                              ? 'border-blue-300 focus:ring-blue-500 focus:border-blue-500 bg-blue-50'
                              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                            } transition-colors duration-200`}
                            disabled={formSubmitted || isSubmitting}
                          >
                            <option value="">Select relationship</option>
                            <option value="spouse">Spouse</option>
                            <option value="child">Child</option>
                            <option value="parent">Parent</option>
                            <option value="sibling">Sibling</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${activeField === 'beneficiaryPhone' ? 'text-blue-700' : 'text-gray-700'}`}>
                          Phone Number
                        </label>
                        <div className={`relative rounded-md shadow-sm ${animateField === 'beneficiaryPhone' ? 'animate-shake' : ''}`}>
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="tel"
                            name="beneficiaryPhone"
                            value={formData.beneficiaryPhone}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            onFocus={handleFocus}
                            ref={el => fieldRefs.current.beneficiaryPhone = el}
                            placeholder="(XXX) XXX-XXXX"
                            className={`w-full pl-10 pr-4 py-2 border rounded-md ${
                              formTouched.beneficiaryPhone && formErrors.beneficiaryPhone 
                                ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                                : activeField === 'beneficiaryPhone'
                                ? 'border-blue-300 focus:ring-blue-500 focus:border-blue-500 bg-blue-50'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                            } transition-colors duration-200`}
                            disabled={formSubmitted || isSubmitting}
                          />
                          {formTouched.beneficiaryPhone && (
                            <ValidationIndicator 
                              isValid={!formErrors.beneficiaryPhone} 
                              message={formErrors.beneficiaryPhone} 
                            />
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${activeField === 'beneficiaryEmail' ? 'text-blue-700' : 'text-gray-700'}`}>
                          Email Address
                        </label>
                        <div className={`relative rounded-md shadow-sm ${animateField === 'beneficiaryEmail' ? 'animate-shake' : ''}`}>
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            name="beneficiaryEmail"
                            value={formData.beneficiaryEmail}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            onFocus={handleFocus}
                            ref={el => fieldRefs.current.beneficiaryEmail = el}
                            className={`w-full pl-10 pr-4 py-2 border rounded-md ${
                              formTouched.beneficiaryEmail && formErrors.beneficiaryEmail 
                                ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                                : activeField === 'beneficiaryEmail'
                                ? 'border-blue-300 focus:ring-blue-500 focus:border-blue-500 bg-blue-50'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                            } transition-colors duration-200`}
                            disabled={formSubmitted || isSubmitting}
                          />
                          {formTouched.beneficiaryEmail && (
                            <ValidationIndicator 
                              isValid={!formErrors.beneficiaryEmail} 
                              message={formErrors.beneficiaryEmail} 
                            />
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${activeField === 'beneficiaryAddress' ? 'text-blue-700' : 'text-gray-700'}`}>
                          Address (Optional)
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Home className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="beneficiaryAddress"
                            value={formData.beneficiaryAddress}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            onFocus={handleFocus}
                            ref={el => fieldRefs.current.beneficiaryAddress = el}
                            className={`w-full pl-10 pr-4 py-2 border rounded-md ${
                              activeField === 'beneficiaryAddress'
                              ? 'border-blue-300 focus:ring-blue-500 focus:border-blue-500 bg-blue-50'
                              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                            } transition-colors duration-200`}
                            disabled={formSubmitted || isSubmitting}
                            placeholder="Street, City, State, ZIP"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <DollarSign className="h-5 w-5 text-blue-500 mr-2" />
                    Payment Information
                  </h3>
                  
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div 
                        className={`border rounded-lg p-4 transition-all duration-200 ${
                          formData.paymentMethod === 'directDeposit'
                            ? 'border-blue-300 bg-blue-50 shadow-sm'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        } cursor-pointer`}
                        onClick={() => {
                          if (!isSubmitting && !formSubmitted) {
                            setFormData({...formData, paymentMethod: 'directDeposit'});
                          }
                        }}
                      >
                        <div className="flex items-center">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            formData.paymentMethod === 'directDeposit'
                              ? 'border-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {formData.paymentMethod === 'directDeposit' && (
                              <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="text-base font-medium text-gray-900">Direct Deposit</p>
                            <p className="text-sm text-gray-500">Funds available in 1-3 business days</p>
                          </div>
                        </div>
                      </div>
                      
                      <div 
                        className={`border rounded-lg p-4 transition-all duration-200 ${
                          formData.paymentMethod === 'check'
                            ? 'border-blue-300 bg-blue-50 shadow-sm'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        } cursor-pointer`}
                        onClick={() => {
                          if (!isSubmitting && !formSubmitted) {
                            setFormData({...formData, paymentMethod: 'check'});
                          }
                        }}
                      >
                        <div className="flex items-center">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            formData.paymentMethod === 'check'
                              ? 'border-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {formData.paymentMethod === 'check' && (
                              <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="text-base font-medium text-gray-900">Check</p>
                            <p className="text-sm text-gray-500">Mailed within 5-7 business days</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {formData.paymentMethod === 'directDeposit' && (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-blue-800 mb-3 flex items-center">
                          <CreditCard className="h-4 w-4 mr-1.5" />
                          Bank Account Details
                        </h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${activeField === 'accountType' ? 'text-blue-700' : 'text-gray-700'}`}>
                              Account Type
                            </label>
                            <div className="relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Building className="h-4 w-4 text-gray-400" />
                              </div>
                              <select
                                name="accountType"
                                value={formData.accountType}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                onFocus={handleFocus}
                                ref={el => fieldRefs.current.accountType = el}
                                className={`w-full pl-10 pr-4 py-2 border rounded-md ${
                                  activeField === 'accountType'
                                  ? 'border-blue-300 focus:ring-blue-500 focus:border-blue-500 bg-blue-50'
                                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                } transition-colors duration-200`}
                                disabled={formSubmitted || isSubmitting}
                              >
                                <option value="checking">Checking</option>
                                <option value="savings">Savings</option>
                              </select>
                            </div>
                          </div>
                          
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${activeField === 'routingNumber' ? 'text-blue-700' : 'text-gray-700'}`}>
                              Routing Number
                            </label>
                            <div className={`relative rounded-md shadow-sm ${animateField === 'routingNumber' ? 'animate-shake' : ''}`}>
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <CreditCard className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                type="text"
                                name="routingNumber"
                                value={formData.routingNumber}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                onFocus={handleFocus}
                                ref={el => fieldRefs.current.routingNumber = el}
                                className={`w-full pl-10 pr-4 py-2 border rounded-md ${
                                  formTouched.routingNumber && formErrors.routingNumber 
                                    ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                                    : activeField === 'routingNumber'
                                    ? 'border-blue-300 focus:ring-blue-500 focus:border-blue-500 bg-blue-50'
                                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                } transition-colors duration-200`}
                                placeholder="9 digits"
                                maxLength={9}
                                disabled={formSubmitted || isSubmitting}
                              />
                              {formTouched.routingNumber && (
                                <ValidationIndicator 
                                  isValid={!formErrors.routingNumber} 
                                  message={formErrors.routingNumber} 
                                />
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${activeField === 'accountNumber' ? 'text-blue-700' : 'text-gray-700'}`}>
                              Account Number
                            </label>
                            <div className={`relative rounded-md shadow-sm ${animateField === 'accountNumber' ? 'animate-shake' : ''}`}>
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <CreditCard className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                type="text"
                                name="accountNumber"
                                value={formData.accountNumber}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                onFocus={handleFocus}
                                ref={el => fieldRefs.current.accountNumber = el}
                                className={`w-full pl-10 pr-4 py-2 border rounded-md ${
                                  formTouched.accountNumber && formErrors.accountNumber 
                                    ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                                    : activeField === 'accountNumber'
                                    ? 'border-blue-300 focus:ring-blue-500 focus:border-blue-500 bg-blue-50'
                                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                } transition-colors duration-200`}
                                disabled={formSubmitted || isSubmitting}
                              />
                              {formTouched.accountNumber && (
                                <ValidationIndicator 
                                  isValid={!formErrors.accountNumber} 
                                  message={formErrors.accountNumber} 
                                />
                              )}
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                              For security, your account number will be masked after entry.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {formData.paymentMethod === 'check' && (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <div className="flex items-start">
                          <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-medium text-blue-800 mb-1">Check Payment Information</h4>
                            <p className="text-sm text-blue-600">
                              Your check will be mailed to the address we have on file. Delivery typically takes 7-10 business days after claim approval.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${activeField === 'additionalInfo' ? 'text-blue-700' : 'text-gray-700'}`}>
                    Additional Information (Optional)
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <textarea
                      name="additionalInfo"
                      rows={4}
                      value={formData.additionalInfo}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      onFocus={handleFocus}
                      ref={el => fieldRefs.current.additionalInfo = el}
                      placeholder="Please provide any additional information that may help us process your claim..."
                      className={`w-full px-3 py-2 border rounded-md ${
                        activeField === 'additionalInfo'
                        ? 'border-blue-300 focus:ring-blue-500 focus:border-blue-500 bg-blue-50'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      } transition-colors duration-200`}
                      disabled={formSubmitted || isSubmitting}
                    ></textarea>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg flex items-start">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-800 mb-1">Important Information</h3>
                    <p className="text-sm text-blue-700 leading-relaxed">
                      By submitting this form, you certify that all information provided is true and correct to the best of your knowledge. False statements may lead to denial of your claim and potential legal action. For questions about your claim, please contact our support team.
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4">
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      onClick={() => setActiveTab('upload')}
                      disabled={formSubmitted || isSubmitting}
                    >
                      Back to Documents
                    </button>
                    
                    <button
                      type="button"
                      onClick={generatePdf}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm text-blue-700 font-medium rounded-md hover:bg-blue-50 transition-colors"
                      disabled={formSubmitted || isSubmitting}
                    >
                      <Download className="h-4 w-4 mr-1.5" />
                      Download Form
                    </button>
                  </div>
                  
                  {demoMode && (
                    <div className="flex items-center">
                      <button
                        type="submit"
                        className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors relative overflow-hidden"
                        disabled={isSubmitting}
                      >
                        <span className="flex items-center">
                          {isSubmitting ? (
                            <>
                              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <Zap className="mr-2 h-4 w-4" />
                              Submit Demo Claim
                            </>
                          )}
                        </span>
                      </button>
                    </div>
                  )}
                  
                  {!demoMode && (
                    <button
                      type="submit"
                      disabled={isSubmitting || formProgress < 100}
                      className={`inline-flex items-center px-5 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors relative ${
                        isSubmitting
                          ? 'bg-blue-400 cursor-wait'
                          : formProgress < 100
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-4 w-4" />
                          Submit Claim
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
            
            {/* Demo Mode Callout */}
            {demoMode && (
              <div className="bg-amber-50 rounded-lg p-4 mb-6 border border-amber-200">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-amber-800 mb-1">Demo Mode Active</h3>
                    <p className="text-sm text-amber-700">
                      Form has been pre-filled with sample data. You can submit the form to proceed to claim tracking without validation.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
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

export default ImprovedFillClaimForm;