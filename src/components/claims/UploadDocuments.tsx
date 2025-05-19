import React, { useState, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Upload, File, CheckCircle, AlertTriangle, Info, XCircle, ArrowRight } from 'lucide-react';
import { Document, DocumentType } from '../../types';

const UploadDocuments: React.FC = () => {
  const { claimData, activeTab, setActiveTab, addMessageToChat, uploadedDocuments, setUploadedDocuments } = useAppContext();
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('Claim Form');
  
  // Determine required documents based on claim type
  const getRequiredDocuments = (): DocumentType[] => {
    if (!claimData) return [];
    
    switch (claimData.policyType) {
      case 'life':
        return ['Death Certificate', 'Claim Form', 'ID Proof'];
      case 'ltc':
        return ['Medical Records', 'Claim Form', 'ID Proof'];
      case 'annuity':
        return ['Claim Form', 'ID Proof'];
      case 'disability':
        return ['Medical Records', 'Claim Form', 'ID Proof'];
      default:
        return ['Claim Form', 'ID Proof'];
    }
  };
  
  const requiredDocuments = getRequiredDocuments();
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    // Process each file
    acceptedFiles.forEach(file => {
      const newDoc: Document = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: file.name,
        type: selectedDocType,
        uploadDate: new Date(),
        size: file.size,
        status: 'Uploaded'
      };
      
      setDocuments(prev => [...prev, newDoc]);
      setUploadedDocuments(prev => [...prev, file.name]);
    });
    
    // Simulate response from agent
    addMessageToChat({
      sender: 'user',
      content: `I've uploaded a ${selectedDocType.toLowerCase()}: ${acceptedFiles[0].name}`
    });
    
  }, [selectedDocType, addMessageToChat, setUploadedDocuments]);

  const handleDragEnter = () => setIsDragActive(true);
  const handleDragLeave = () => setIsDragActive(false);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onDrop(Array.from(e.dataTransfer.files));
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onDrop(Array.from(e.target.files));
    }
  };
  
  const handleRemoveDocument = (docId: string) => {
    const docToRemove = documents.find(doc => doc.id === docId);
    if (docToRemove) {
      setDocuments(documents.filter(doc => doc.id !== docId));
      setUploadedDocuments(prev => prev.filter(name => name !== docToRemove.name));
    }
  };
  
  const verifyDocument = (docId: string) => {
    setDocuments(documents.map(doc => 
      doc.id === docId ? { ...doc, status: 'Verified' } : doc
    ));
  };
  
  const handleContinue = () => {
    // Check if all required documents are uploaded
    const uploadedTypes = documents.map(doc => doc.type);
    const allRequiredUploaded = requiredDocuments.every(type => 
      uploadedTypes.includes(type)
    );
    
    if (allRequiredUploaded) {
      // Notify the user and proceed
      addMessageToChat({
        sender: 'agent',
        content: "All required documents have been successfully uploaded. You can now proceed to fill out the claim form.",
        agentType: 'document-assistant'
      });
      
      setTimeout(() => {
        setActiveTab('fill');
      }, 1500);
    } else {
      // Alert the user about missing documents
      addMessageToChat({
        sender: 'agent',
        content: "It appears some required documents are still missing. Please upload all required documents before proceeding.",
        agentType: 'document-assistant'
      });
    }
  };
  
  // Check if component should display based on active tab
  if (activeTab !== 'upload') return null;
  
  // Check if claim data exists
  if (!claimData) {
    return (
      <div className="flex h-full justify-center items-center p-8">
        <div className="bg-yellow-50 p-4 rounded-lg max-w-md text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-yellow-800 mb-2">No claim started</h3>
          <p className="text-yellow-700 mb-4">
            Please start a claim first to determine which documents you'll need to upload.
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

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload Documents</h1>
          <p className="text-gray-600">
            Please upload the required documentation for your {claimData.claimType.toLowerCase()}.
          </p>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4 mb-6 flex items-start">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-800 mb-1">Required Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {requiredDocuments.map((doc, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    documents.some(d => d.type === doc) 
                      ? 'bg-green-500' 
                      : 'bg-gray-400'
                  } mr-2`}></div>
                  <span className="text-sm text-blue-700">{doc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Document Upload Area */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Documents</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Type
            </label>
            <select
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value as DocumentType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {['Death Certificate', 'Claim Form', 'ID Proof', 'Medical Records', 'Power of Attorney', 'Other'].map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center ${
              isDragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-400'
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="space-y-3">
              <div className="mx-auto h-12 w-12 text-gray-400 flex items-center justify-center rounded-full bg-gray-100">
                <Upload className="h-6 w-6" />
              </div>
              <div className="text-gray-700">
                <p className="font-medium">Drag and drop your file here, or</p>
                <div className="mt-2">
                  <label htmlFor="file-upload" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none cursor-pointer">
                    Browse Files
                    <input
                      id="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                      multiple
                    />
                  </label>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                <p>Supported formats: PDF, JPG, PNG (Max size: 10MB)</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Uploaded Documents List */}
        {documents.length > 0 && (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Documents</h2>
            <div className="space-y-3">
              {documents.map(doc => (
                <div key={doc.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <File className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-gray-500">{doc.type}</span>
                        <span className="text-xs text-gray-500">
                          {(doc.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                        <div className="flex items-center">
                          {doc.status === 'Uploaded' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              Uploaded
                            </span>
                          ) : doc.status === 'Verified' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              <XCircle className="w-3 h-3 mr-1" />
                              Rejected
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {doc.status === 'Uploaded' && (
                      <button 
                        onClick={() => verifyDocument(doc.id)}
                        className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Verify
                      </button>
                    )}
                    <button 
                      onClick={() => handleRemoveDocument(doc.id)}
                      className="text-xs text-red-600 hover:text-red-800 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Continue Button */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setActiveTab('start')}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to Claim Selection
          </button>
          
          <button
            onClick={handleContinue}
            className={`flex items-center px-4 py-2 rounded-md shadow-sm text-white ${
              documents.length === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={documents.length === 0}
          >
            <span>Continue to Claim Form</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadDocuments;