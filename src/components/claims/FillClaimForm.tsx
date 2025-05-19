import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Check, AlertTriangle, ArrowRight, FileText, Download, Info } from 'lucide-react';
import dayjs from 'dayjs';

const FillClaimForm: React.FC = () => {
  const { claimData, activeTab, setActiveTab, uploadedDocuments, addMessageToChat, setClaimStatus } = useAppContext();
  
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
  
  useEffect(() => {
    if (claimData) {
      // Pre-fill form with available claim data
      setFormData(prev => ({
        ...prev,
        policyNumber: claimData.policyNumber || '',
        claimantName: claimData.policyHolder || ''
      }));
    }
  }, [claimData]);
  
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.policyNumber.trim()) errors.policyNumber = 'Policy number is required';
    if (!formData.claimantName.trim()) errors.claimantName = 'Claimant name is required';
    if (!formData.dateOfIncident) errors.dateOfIncident = 'Date of incident is required';
    
    if (!formData.beneficiaryName.trim()) errors.beneficiaryName = 'Beneficiary name is required';
    if (!formData.beneficiaryPhone.trim()) errors.beneficiaryPhone = 'Phone number is required';
    if (!formData.beneficiaryEmail.trim()) {
      errors.beneficiaryEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.beneficiaryEmail)) {
      errors.beneficiaryEmail = 'Email is invalid';
    }
    
    if (formData.paymentMethod === 'directDeposit') {
      if (!formData.accountNumber.trim()) errors.accountNumber = 'Account number is required';
      if (!formData.routingNumber.trim()) errors.routingNumber = 'Routing number is required';
      else if (formData.routingNumber.length !== 9) errors.routingNumber = 'Routing number must be 9 digits';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = () => {
    if (validateForm()) {
      setFormSubmitted(true);
      
      // Update the claim status
      setClaimStatus('In Review');
      
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
    } else {
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
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
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
  
  if (uploadedDocuments.length === 0) {
    return (
      <div className="flex h-full justify-center items-center p-8">
        <div className="bg-yellow-50 p-4 rounded-lg max-w-md text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Missing Documents</h3>
          <p className="text-yellow-700 mb-4">
            Please upload the required documents before filling out the claim form.
          </p>
          <button
            onClick={() => setActiveTab('upload')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            Upload Documents
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Claim Form</h1>
          <p className="text-gray-600">
            Please complete the form below for your {claimData.claimType.toLowerCase()}.
          </p>
        </div>
        
        {formSubmitted ? (
          <div className="bg-green-50 rounded-lg p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <Check className="h-6 w-6 text-green-600" />
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
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
            <form className="space-y-6">
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
                        className={`w-full px-3 py-2 border rounded-md ${
                          formErrors.policyNumber 
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                      />
                      {formErrors.policyNumber && (
                        <p className="mt-1 text-xs text-red-600">{formErrors.policyNumber}</p>
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
                        className={`w-full px-3 py-2 border rounded-md ${
                          formErrors.claimantName 
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                      />
                      {formErrors.claimantName && (
                        <p className="mt-1 text-xs text-red-600">{formErrors.claimantName}</p>
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
                        max={dayjs().format('YYYY-MM-DD')}
                        className={`w-full px-3 py-2 border rounded-md ${
                          formErrors.dateOfIncident 
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                      />
                      {formErrors.dateOfIncident && (
                        <p className="mt-1 text-xs text-red-600">{formErrors.dateOfIncident}</p>
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
                        className={`w-full px-3 py-2 border rounded-md ${
                          formErrors.beneficiaryName 
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                      />
                      {formErrors.beneficiaryName && (
                        <p className="mt-1 text-xs text-red-600">{formErrors.beneficiaryName}</p>
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
                        className={`w-full px-3 py-2 border rounded-md ${
                          formErrors.beneficiaryPhone 
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                      />
                      {formErrors.beneficiaryPhone && (
                        <p className="mt-1 text-xs text-red-600">{formErrors.beneficiaryPhone}</p>
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
                        className={`w-full px-3 py-2 border rounded-md ${
                          formErrors.beneficiaryEmail 
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                      />
                      {formErrors.beneficiaryEmail && (
                        <p className="mt-1 text-xs text-red-600">{formErrors.beneficiaryEmail}</p>
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
                        className={`border rounded-lg p-4 cursor-pointer ${
                          formData.paymentMethod === 'directDeposit'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300'
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
                        className={`border rounded-lg p-4 cursor-pointer ${
                          formData.paymentMethod === 'check'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300'
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
                          className={`w-full px-3 py-2 border rounded-md ${
                            formErrors.accountNumber 
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                          }`}
                        />
                        {formErrors.accountNumber && (
                          <p className="mt-1 text-xs text-red-600">{formErrors.accountNumber}</p>
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
                          className={`w-full px-3 py-2 border rounded-md ${
                            formErrors.routingNumber 
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                          }`}
                          maxLength={9}
                        />
                        {formErrors.routingNumber && (
                          <p className="mt-1 text-xs text-red-600">{formErrors.routingNumber}</p>
                        )}
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
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    onClick={() => setActiveTab('upload')}
                  >
                    Back to Documents
                  </button>
                  
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm text-blue-700 font-medium rounded-md hover:bg-blue-50"
                  >
                    <Download className="h-5 w-5 mr-1" />
                    Download Form
                  </button>
                </div>
                
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default FillClaimForm;