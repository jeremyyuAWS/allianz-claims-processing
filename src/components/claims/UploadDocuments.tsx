import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAppContext } from '../../context/AppContext';
import { Upload, File, CheckCircle, AlertTriangle, Info, XCircle, ArrowRight, Eye, FileText } from 'lucide-react';
import { Document, DocumentType } from '../../types';
import claimTypesData from '../../data/claim_types.json';

const UploadDocuments: React.FC = () => {
  const { claimData, activeTab, setActiveTab, addMessageToChat, uploadedDocuments, setUploadedDocuments, documents, setDocuments, demoMode } = useAppContext();
  
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('Claim Form');
  const [requiredDocuments, setRequiredDocuments] = useState<string[]>([]);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  
  useEffect(() => {
    // Determine required documents based on claim type
    if (claimData) {
      const claimTypeInfo = claimTypesData.find(type => type.id === claimData.policyType);
      if (claimTypeInfo) {
        setRequiredDocuments(claimTypeInfo.requiredDocuments);
        // Set first required document as default selection
        if (claimTypeInfo.requiredDocuments.length > 0) {
          setSelectedDocType(claimTypeInfo.requiredDocuments[0] as DocumentType);
        }
        
        // Add welcome message when first visiting this tab
        if (activeTab === 'upload' && documents.length === 0) {
          setTimeout(() => {
            addMessageToChat({
              sender: 'agent',
              content: `For your ${claimData.claimType}, please upload the following documents: ${claimTypeInfo.requiredDocuments.join(", ")}. Make sure each document is clear and complete.`,
              agentType: 'document-assistant'
            });
          }, 500);
        }
      }
    }
  }, [claimData, activeTab, documents.length, addMessageToChat]);
  
  // Check for demo mode and auto-advance if enabled
  useEffect(() => {
    if (demoMode && activeTab === 'upload') {
      // Add demo documents for all required document types
      setTimeout(() => {
        // If no documents have been added yet, add them
        if (documents.length === 0) {
          // Add one document for each required document type
          requiredDocuments.forEach((docType, index) => {
            setTimeout(() => {
              addDemoDocument(index, docType as DocumentType);
            }, index * 1000); // Add documents with a staggered delay
          });
          
          // After all documents are added, proceed to the next step
          setTimeout(() => {
            handleContinue();
          }, requiredDocuments.length * 1000 + 1500);
        }
      }, 1000);
    }
  }, [demoMode, activeTab, requiredDocuments]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    // Process each file
    const newDocuments = acceptedFiles.map(file => {
      // Create an object URL for preview
      const fileUrl = URL.createObjectURL(file);
      
      return {
        id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: file.name,
        type: selectedDocType,
        uploadDate: new Date(),
        size: file.size,
        status: 'Uploaded',
        fileUrl
      };
    });
    
    setDocuments(prev => [...prev, ...newDocuments]);
    setUploadedDocuments(prev => [...prev, ...acceptedFiles.map(file => file.name)]);
    
    // Simulate response from agent
    addMessageToChat({
      sender: 'user',
      content: `I've uploaded ${acceptedFiles.length > 1 ? 'documents' : 'a document'} for ${selectedDocType}`
    });
    
    // Simulate agent feedback based on document type
    setTimeout(() => {
      const uploadResponse = getUploadResponse(selectedDocType, acceptedFiles.length);
      
      addMessageToChat({
        sender: 'agent',
        content: uploadResponse,
        agentType: 'document-assistant'
      });
      
      // Check if all required docs are uploaded and provide guidance
      const uploadedTypes = [...documents, ...newDocuments].map(d => d.type);
      const uniqueUploadedTypes = [...new Set(uploadedTypes)];
      const allRequiredUploaded = requiredDocuments.every(doc => 
        uniqueUploadedTypes.includes(doc as DocumentType)
      );
      
      if (allRequiredUploaded) {
        setTimeout(() => {
          addMessageToChat({
            sender: 'agent',
            content: "Great job! You've uploaded all the required documents. You can proceed to fill out the claim form when you're ready.",
            agentType: 'document-assistant'
          });
        }, 1500);
      }
    }, 1000);
    
  }, [selectedDocType, documents, addMessageToChat, setUploadedDocuments, requiredDocuments, setDocuments]);

  // Configure react-dropzone
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: 10485760, // 10MB
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false)
  });

  // Generate contextual response based on document type
  const getUploadResponse = (docType: string, count: number): string => {
    const plural = count > 1 ? 's' : '';
    
    switch(docType) {
      case 'Death Certificate':
        return `I've received the death certificate${plural}. ${count > 1 ? 'These documents are' : 'This is a'} critical document for processing death claims. Please ensure ${count > 1 ? 'they are' : 'it\'s a'} certified cop${count > 1 ? 'ies' : 'y'} issued by the vital records office.`;
      case 'Claim Form':
        return `Thank you for uploading the claim form${plural}. I'll check to make sure all required fields are completed. If there are any issues, I'll let you know.`;
      case 'ID Proof':
        return `I've received your identification document${plural}. A clear government-issued photo ID is required to verify the claimant's identity.`;
      case 'Medical Records':
        return `Thank you for uploading the medical record${plural}. ${count > 1 ? 'These are' : 'This is'} essential for evaluating health-related claims. Please ensure ${count > 1 ? 'they\'re' : 'it\'s'} complete and include${count > 1 ? '' : 's'} the relevant diagnosis and treatment information.`;
      case 'Power of Attorney':
        return `I've received the Power of Attorney document${plural}. This authorizes you to act on behalf of the policy owner. Our legal team will review ${count > 1 ? 'these documents' : 'this document'}.`;
      default:
        return `Thank you for uploading ${count > 1 ? 'the documents' : 'the document'} for ${docType.toLowerCase()}. ${count > 1 ? 'These have' : 'This has'} been added to your claim file.`;
    }
  };
  
  const handleRemoveDocument = (docId: string) => {
    const docToRemove = documents.find(doc => doc.id === docId);
    if (docToRemove) {
      // Revoke object URL to prevent memory leaks
      if (docToRemove.fileUrl) {
        URL.revokeObjectURL(docToRemove.fileUrl);
      }
      
      setDocuments(documents.filter(doc => doc.id !== docId));
      setUploadedDocuments(prev => prev.filter(name => name !== docToRemove.name));
      
      // Add message about document removal
      addMessageToChat({
        sender: 'user',
        content: `I've removed the document: ${docToRemove.name}`
      });
    }
  };
  
  const verifyDocument = (docId: string) => {
    setDocuments(documents.map(doc => 
      doc.id === docId ? { ...doc, status: 'Verified' } : doc
    ));
    
    const docToVerify = documents.find(doc => doc.id === docId);
    if (docToVerify) {
      // Add verification message
      addMessageToChat({
        sender: 'agent',
        content: `I've verified the ${docToVerify.type.toLowerCase()}: ${docToVerify.name}. The document meets our requirements and has been accepted.`,
        agentType: 'document-assistant'
      });
    }
  };
  
  const handlePreview = (doc: Document) => {
    setPreviewDocument(doc);
  };
  
  const closePreview = () => {
    setPreviewDocument(null);
  };
  
  const handleContinue = () => {
    // Check if all required documents are uploaded or if in demo mode
    const uploadedTypes = documents.map(doc => doc.type);
    const uniqueUploadedTypes = [...new Set(uploadedTypes)];
    const allRequiredUploaded = requiredDocuments.every(type => 
      uniqueUploadedTypes.includes(type as DocumentType)
    );
    
    if (allRequiredUploaded || demoMode) {
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
      const missingDocs = requiredDocuments.filter(doc => !uniqueUploadedTypes.includes(doc as DocumentType));
      addMessageToChat({
        sender: 'agent',
        content: `Some required documents are still missing. Please upload the following: ${missingDocs.join(", ")} before proceeding.`,
        agentType: 'document-assistant'
      });
    }
  };
  
  // Sample documents for demo mode
  const demoDocuments = {
    'Death Certificate': [
      { name: 'Death_Certificate_Smith_John.pdf', size: 1234567 },
      { name: 'Death_Certificate_Certified_Copy.pdf', size: 2345678 }
    ],
    'Claim Form': [
      { name: 'Allianz_Claim_Form_Completed.pdf', size: 987654 },
      { name: 'Policy_Claim_Form.pdf', size: 876543 }
    ],
    'ID Proof': [
      { name: 'Drivers_License.jpg', size: 345678 },
      { name: 'Passport_ID_Page.jpg', size: 456789 }
    ],
    'Medical Records': [
      { name: 'Medical_History_Summary.pdf', size: 3456789 },
      { name: 'Hospital_Records.pdf', size: 4567890 }
    ],
    'Power of Attorney': [
      { name: 'Power_of_Attorney_Document.pdf', size: 2345678 },
      { name: 'Notarized_POA.pdf', size: 3456789 }
    ],
    'Other': [
      { name: 'Supporting_Documentation.pdf', size: 1234567 },
      { name: 'Additional_Information.pdf', size: 2345678 }
    ]
  };
  
  const addDemoDocument = (fileIndex: number = 0, docType: DocumentType = selectedDocType) => {
    const availableDocs = demoDocuments[docType as keyof typeof demoDocuments] || demoDocuments['Other'];
    const demoDoc = availableDocs[fileIndex % availableDocs.length];
    
    const newDocument: Document = {
      id: `demo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: demoDoc.name,
      type: docType,
      uploadDate: new Date(),
      size: demoDoc.size,
      status: 'Uploaded',
      // We can't provide a real fileUrl since we don't have actual files in demo mode
      fileUrl: `https://via.placeholder.com/800x1000?text=Demo+${docType.replace(/\s+/g, '+')}`
    };
    
    setDocuments(prev => [...prev, newDocument]);
    setUploadedDocuments(prev => [...prev, demoDoc.name]);
    
    // Simulate user message
    addMessageToChat({
      sender: 'user',
      content: `I've uploaded a ${docType}`
    });
    
    // Simulate agent response
    setTimeout(() => {
      const uploadResponse = getUploadResponse(docType, 1);
      
      addMessageToChat({
        sender: 'agent',
        content: uploadResponse,
        agentType: 'document-assistant'
      });
      
      // Check if all required docs are uploaded and provide guidance
      const uploadedTypes = [...documents, newDocument].map(d => d.type);
      const uniqueUploadedTypes = [...new Set(uploadedTypes)];
      const allRequiredUploaded = requiredDocuments.every(doc => 
        uniqueUploadedTypes.includes(doc as DocumentType)
      );
      
      if (allRequiredUploaded) {
        setTimeout(() => {
          addMessageToChat({
            sender: 'agent',
            content: "Great job! You've uploaded all the required documents. You can proceed to fill out the claim form when you're ready.",
            agentType: 'document-assistant'
          });
        }, 1500);
      }
    }, 1000);
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
              {requiredDocuments.map((doc, index) => {
                const isUploaded = documents.some(d => d.type === doc);
                return (
                  <div key={index} className="flex items-center">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      isUploaded
                        ? 'bg-green-500' 
                        : 'bg-gray-400'
                    } mr-2`}></div>
                    <span className={`text-sm ${isUploaded ? 'text-green-700' : 'text-blue-700'}`}>{doc}</span>
                  </div>
                );
              })}
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
              {requiredDocuments.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
              <option value="Other">Other</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {selectedDocType === 'Death Certificate' && 'Please upload a certified copy of the death certificate'}
              {selectedDocType === 'ID Proof' && 'Please provide a government-issued photo ID'}
              {selectedDocType === 'Medical Records' && 'Include relevant diagnosis and treatment information'}
            </p>
          </div>
          
          {demoMode ? (
            /* Demo Mode Upload Interface */
            <div className="border-2 border-dashed rounded-lg p-6 text-center bg-blue-50 border-blue-300">
              <div className="space-y-3">
                <div className="mx-auto h-12 w-12 text-blue-500 flex items-center justify-center rounded-full bg-blue-100">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="text-gray-700">
                  <p className="font-medium">Demo Mode: Sample Document Selection</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Select a sample document to demonstrate the upload process without using actual files
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 justify-center mt-4">
                  {demoDocuments[selectedDocType as keyof typeof demoDocuments]?.map((doc, index) => (
                    <button
                      key={index}
                      onClick={() => addDemoDocument(index)}
                      className="px-4 py-2 bg-white border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 hover:bg-blue-50 focus:outline-none"
                    >
                      {doc.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Real Upload Interface */
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-lg p-6 text-center ${
                isDragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              <input {...getInputProps()} />
              <div className="space-y-3">
                <div className="mx-auto h-12 w-12 text-gray-400 flex items-center justify-center rounded-full bg-gray-100">
                  <Upload className="h-6 w-6" />
                </div>
                <div className="text-gray-700">
                  <p className="font-medium">Drag and drop your file here, or</p>
                  <div className="mt-2">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Browse Files
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  <p>Supported formats: PDF, JPG, PNG (Max size: 10MB)</p>
                </div>
              </div>
            </div>
          )}
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
                    <button 
                      onClick={() => handlePreview(doc)}
                      className="text-xs text-gray-600 hover:text-blue-800 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
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
            
            {/* Upload Progress */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Upload Progress</h3>
              <div className="space-y-2">
                {requiredDocuments.map((doc, index) => {
                  const isUploaded = documents.some(d => d.type === doc);
                  const isVerified = documents.some(d => d.type === doc && d.status === 'Verified');
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-5 h-5 flex items-center justify-center rounded-full mr-2 ${
                          isVerified 
                            ? 'bg-green-100 text-green-600' 
                            : isUploaded 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {isVerified ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <span className="text-xs">{index + 1}</span>
                          )}
                        </div>
                        <span className="text-sm text-gray-700">{doc}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${
                        isVerified 
                          ? 'bg-green-100 text-green-600' 
                          : isUploaded 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {isVerified ? 'Verified' : isUploaded ? 'Uploaded' : 'Required'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        
        {/* Document Guidelines */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Document Guidelines</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <span className="text-sm font-medium text-blue-700">1</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">File Format</h3>
                <p className="text-sm text-gray-600">
                  Upload documents in PDF, JPG, or PNG format. Documents must be clear, complete, and legible.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <span className="text-sm font-medium text-blue-700">2</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">File Size</h3>
                <p className="text-sm text-gray-600">
                  Each file must be under 10MB in size. If a document exceeds this limit, try scanning at a lower resolution.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <span className="text-sm font-medium text-blue-700">3</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Death Certificates</h3>
                <p className="text-sm text-gray-600">
                  For life insurance claims, please provide a certified copy of the death certificate issued by the vital records office.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <span className="text-sm font-medium text-blue-700">4</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Processing Time</h3>
                <p className="text-sm text-gray-600">
                  {claimData && claimTypesData.find(type => type.id === claimData.policyType)?.processingTime
                    ? `Typical processing time for ${claimData.claimType} claims is ${claimTypesData.find(type => type.id === claimData.policyType)?.processingTime}.`
                    : 'Processing times vary by claim type. Complete submissions are processed faster.'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
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
              documents.length === 0 && !demoMode
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={documents.length === 0 && !demoMode}
          >
            <span>Continue to Claim Form</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Document Preview Modal */}
      {previewDocument && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">{previewDocument.name}</h3>
              <button
                onClick={closePreview}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {previewDocument.fileUrl ? (
                previewDocument.name.toLowerCase().endsWith('.pdf') ? (
                  <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
                    <iframe 
                      src={previewDocument.fileUrl}
                      className="w-full h-[70vh]"
                      title={previewDocument.name}
                    ></iframe>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg p-4">
                    <img 
                      src={previewDocument.fileUrl}
                      alt={previewDocument.name}
                      className="max-w-full max-h-[70vh] object-contain"
                    />
                  </div>
                )
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
                  <p>Preview not available</p>
                </div>
              )}
            </div>
            <div className="px-4 py-3 border-t border-gray-200">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-600">Type: {previewDocument.type}</p>
                  <p className="text-sm text-gray-600">Size: {(previewDocument.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <div className="flex space-x-3">
                  {previewDocument.status !== 'Verified' && (
                    <button
                      onClick={() => {
                        verifyDocument(previewDocument.id);
                        closePreview();
                      }}
                      className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700"
                    >
                      Verify Document
                    </button>
                  )}
                  <button
                    onClick={closePreview}
                    className="px-3 py-1.5 bg-gray-200 text-gray-800 text-sm font-medium rounded hover:bg-gray-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadDocuments;