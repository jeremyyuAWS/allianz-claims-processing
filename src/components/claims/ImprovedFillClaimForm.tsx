import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { CheckCircle, AlertTriangle, ArrowRight, FileText, Download, Info, Clock, DollarSign } from 'lucide-react';
import dayjs from 'dayjs';
import { validateField, isValidEmail, isValidPhone, formatPhoneNumber } from '../../utils/validators';
import ValidationIndicator from '../common/ValidationIndicator';
import Toast from '../common/Toast';

const ImprovedFillClaimForm: React.FC = () => {
  const { claimData, activeTab, setActiveTab, uploadedDocuments, addMessageToChat, setClaimStatus, claimStatus } = useAppContext();
  
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
  const [demoMode, setDemoMode] = useState(false);
  
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

  // Handle demo mode
  useEffect(() => {
    if (demoMode && activeTab === 'fill') {
      // Auto-fill form with sample data
      setFormData({
        policyNumber: claimData?.policyNumber || 'ALZ-1234567',
        claimantName: claimData?.policyHolder || 'John Smith',
        dateOfIncident: '2023-03-15',
        beneficiaryName: 'Jane Smith',
        beneficiaryRelation: 'spouse',
        beneficiaryPhone: '(555) 123-4567',
        beneficiaryEmail: 'jane.smith@example.com',
        beneficiaryAddress: '123 Main Street, Anytown, CA 90210',
        paymentMethod: 'directDeposit',
        accountType: 'checking',
        accountNumber: '123456789',
        routingNumber: '021000021',
        additionalInfo: 'Please process this claim as quickly as possible.'
      });
      
      // Mark all fields as touched
      const allTouched: Record<string, boolean> = {};
      Object.keys(formData).forEach(key => {
        allTouched[key] = true;
      });
      setFormTouched(allTouched);
      
      // Add message to chat
      addMessageToChat({
        sender: 'agent',
        content: "Demo mode activated. I've pre-filled the form with sample data. You can review and submit it to see the claim tracking experience.",
        agentType: 'form-assistant'
      });
      
      // Automatically submit the form after a delay
      setTimeout(() => {
        handleSubmit();
      }, 2000);
    }
  }, [demoMode, activeTab]);
  
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
    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setFormTouched(allTouched);
    
    if (validateForm() || demoMode) {
      // Show loading state
      setIsSaving(true);
      
      // Simulate API call delay
      setTimeout(() => {
        setIsSaving(false);
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
        }, 2000);
      }, 1500);
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
    
    // Validate the field if it's been touched
    if (formTouched[name]) {
      const error = validateSingleField(name, name === 'beneficiaryPhone' ? formatPhoneNumber(value) : value);
      
      setFormErrors({
        ...formErrors,
        [name]: error
      });
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
  };
  
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
  
  if (uploadedDocuments.length === 0) {
    return (
      <div className="flex h-full justify-center items-center p-8">
        <div className="bg-yellow-50 p-6 rounded-lg max-w-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-10 w-10 text-yellow-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-yellow-800 mb-2">Missing Documents</h3>
              <p className="text-sm text-yellow-700 mb-4">
                Please upload the required documents before filling out the claim form.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setActiveTab('upload')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                >
                  Upload Documents
                </button>
                <button
                  onClick={() => setDemoMode(true)}
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
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Claim Form</h1>
              <p className="text-gray-600">
                Please complete the form below for your {claimData.claimType.toLowerCase()}.
              </p>
            </div>
            
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Demo mode</span>
              <button 
                onClick={() => setDemoMode(!demoMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${demoMode ? 'bg-blue-600' : 'bg-gray-200'}`}
                aria-label={demoMode ? "Disable demo mode" : "Enable demo mode"}
              >
                <span 
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${demoMode ? 'translate-x-6' : 'translate-x-1'}`} 
                />
              </button>
            </div>
          </div>
        </div>
        
        {formSubmitted ? (
          <div className="bg-green-50 rounded-lg p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-green-800 mb-2">Claim Form Submitted Successfully</h3>
            <p className="text-green-700 mb-4">
              Your claim has been submitted and is now under review. You can track its status in the next tab.
            </p>
            <button
              onClick={() => setActiveTab('track')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              Track Claim Status
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Form Progress Bar */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <h3 className="text-sm font-medium text-gray-700">Form Completion</h3>
                  {isSaving && (
                    <div className="ml-3 flex items-center text-xs text-blue-600">
                      <div className="animate-pulse mr-1">•</div>
                      Auto-saving...
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium text-blue-700">{formProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
                  style={{ width: `${formProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Fill out all required fields to submit your claim
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Claim Information</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Policy Number
                        </label>
                        <input
                          type="text"
                          name="policyNumber"
                          value={formData.policyNumber}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`w-full px-3 py-2 border rounded-md ${
                            formTouched.policyNumber && formErrors.policyNumber 
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                          }`}
                        />
                        {formTouched.policyNumber && (
                          <ValidationIndicator 
                            isValid={!formErrors.policyNumber} 
                            message={formErrors.policyNumber} 
                          />
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Claimant Name
                        </label>
                        <input
                          type="text"
                          name="claimantName"
                          value={formData.claimantName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`w-full px-3 py-2 border rounded-md ${
                            formTouched.claimantName && formErrors.claimantName 
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                          }`}
                        />
                        {formTouched.claimantName && (
                          <ValidationIndicator 
                            isValid={!formErrors.claimantName} 
                            message={formErrors.claimantName} 
                          />
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date of Incident
                        </label>
                        <input
                          type="date"
                          name="dateOfIncident"
                          value={formData.dateOfIncident}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          max={dayjs().format('YYYY-MM-DD')}
                          className={`w-full px-3 py-2 border rounded-md ${
                            formTouched.dateOfIncident && formErrors.dateOfIncident 
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                          }`}
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
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Beneficiary Information</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Beneficiary Name
                        </label>
                        <input
                          type="text"
                          name="beneficiaryName"
                          value={formData.beneficiaryName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`w-full px-3 py-2 border rounded-md ${
                            formTouched.beneficiaryName && formErrors.beneficiaryName 
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                          }`}
                        />
                        {formTouched.beneficiaryName && (
                          <ValidationIndicator 
                            isValid={!formErrors.beneficiaryName} 
                            message={formErrors.beneficiaryName} 
                          />
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Relationship to Insured
                        </label>
                        <select
                          name="beneficiaryRelation"
                          value={formData.beneficiaryRelation}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select relationship</option>
                          <option value="spouse">Spouse</option>
                          <option value="child">Child</option>
                          <option value="parent">Parent</option>
                          <option value="sibling">Sibling</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="beneficiaryPhone"
                          value={formData.beneficiaryPhone}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="(123) 456-7890"
                          className={`w-full px-3 py-2 border rounded-md ${
                            formTouched.beneficiaryPhone && formErrors.beneficiaryPhone 
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                          }`}
                        />
                        {formTouched.beneficiaryPhone && (
                          <ValidationIndicator 
                            isValid={!formErrors.beneficiaryPhone} 
                            message={formErrors.beneficiaryPhone} 
                          />
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="beneficiaryEmail"
                          value={formData.beneficiaryEmail}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`w-full px-3 py-2 border rounded-md ${
                            formTouched.beneficiaryEmail && formErrors.beneficiaryEmail 
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                          }`}
                        />
                        {formTouched.beneficiaryEmail && (
                          <ValidationIndicator 
                            isValid={!formErrors.beneficiaryEmail} 
                            message={formErrors.beneficiaryEmail} 
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Method
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <div 
                          className={`border rounded-lg p-4 cursor-pointer transition-all duration-300 ${
                            formData.paymentMethod === 'directDeposit'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                          }`}
                          onClick={() => setFormData({...formData, paymentMethod: 'directDeposit'})}
                        >
                          <div className="flex items-center">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              formData.paymentMethod === 'directDeposit'
                                ? 'border-blue-500'
                                : 'border-gray-400'
                            }`}>
                              {formData.paymentMethod === 'directDeposit' && (
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              )}
                            </div>
                            <span className="ml-2 text-sm">Direct Deposit</span>
                          </div>
                        </div>
                        <div 
                          className={`border rounded-lg p-4 cursor-pointer transition-all duration-300 ${
                            formData.paymentMethod === 'check'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                          }`}
                          onClick={() => setFormData({...formData, paymentMethod: 'check'})}
                        >
                          <div className="flex items-center">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              formData.paymentMethod === 'check'
                                ? 'border-blue-500'
                                : 'border-gray-400'
                            }`}>
                              {formData.paymentMethod === 'check' && (
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              )}
                            </div>
                            <span className="ml-2 text-sm">Check</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {formData.paymentMethod === 'directDeposit' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Account Type
                          </label>
                          <select
                            name="accountType"
                            value={formData.accountType}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="checking">Checking</option>
                            <option value="savings">Savings</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Account Number
                          </label>
                          <input
                            type="text"
                            name="accountNumber"
                            value={formData.accountNumber}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-3 py-2 border rounded-md ${
                              formTouched.accountNumber && formErrors.accountNumber 
                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                            }`}
                          />
                          {formTouched.accountNumber && (
                            <ValidationIndicator 
                              isValid={!formErrors.accountNumber} 
                              message={formErrors.accountNumber} 
                            />
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Routing Number
                          </label>
                          <input
                            type="text"
                            name="routingNumber"
                            value={formData.routingNumber}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-3 py-2 border rounded-md ${
                              formTouched.routingNumber && formErrors.routingNumber 
                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                            }`}
                            maxLength={9}
                          />
                          {formTouched.routingNumber && (
                            <ValidationIndicator 
                              isValid={!formErrors.routingNumber} 
                              message={formErrors.routingNumber} 
                            />
                          )}
                        </div>
                      </div>
                    )}
                    
                    {formData.paymentMethod === 'check' && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-start">
                          <Info className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                          <p className="text-sm text-blue-700">
                            Payment by check will be mailed to the address on file. Please ensure your address is current. Delivery typically takes 7-10 business days after claim approval.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Information
                  </label>
                  <textarea
                    name="additionalInfo"
                    rows={4}
                    value={formData.additionalInfo}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Please provide any additional information that may help us process your claim..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg flex items-start">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-800 mb-1">Claim Processing Information</h3>
                    <p className="text-sm text-blue-600">
                      Once submitted, your claim will be reviewed by our claims department. This process typically takes 7-10 business days. You will receive updates via email and can check the status of your claim at any time.
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4">
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                      onClick={() => setActiveTab('upload')}
                    >
                      Back to Documents
                    </button>
                    
                    <button
                      type="button"
                      onClick={generatePdf}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm text-blue-700 font-medium rounded-md hover:bg-blue-50 transition-colors"
                    >
                      <Download className="h-5 w-5 mr-1" />
                      Download Form
                    </button>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSaving || (formProgress < 100 && !demoMode)}
                    className={`flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors ${
                      isSaving
                        ? 'bg-blue-400 cursor-wait'
                        : formProgress < 100 && !demoMode
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isSaving ? (
                      <>
                        <span className="animate-pulse mr-2">•</span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Submit Claim
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
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