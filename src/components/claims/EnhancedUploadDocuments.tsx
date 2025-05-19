import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAppContext } from '../../context/AppContext';
import { 
  Upload, 
  File, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  XCircle, 
  ArrowRight, 
  Eye, 
  FileText, 
  ToggleLeft, 
  ToggleRight,
  X,
  Shield,
  Search,
  RotateCw
} from 'lucide-react';
import { Document, DocumentType } from '../../types';
import claimTypesData from '../../data/claim_types.json';
import DocumentVerificationFeedback from '../common/DocumentVerificationFeedback';
import Toast from '../common/Toast';

const EnhancedUploadDocuments: React.FC = () => {
  const { claimData, activeTab, setActiveTab, addMessageToChat, uploadedDocuments, setUploadedDocuments, documents, setDocuments } = useAppContext();
  
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('Claim Form');
  const [requiredDocuments, setRequiredDocuments] = useState<string[]>([]);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [allRequiredUploaded, setAllRequiredUploaded] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<{document: Document, show: boolean} | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [showQualityFeedback, setShowQualityFeedback] = useState(false);
  const [documentQuality, setDocumentQuality] = useState<{
    overall: number;
    clarity: number;
    completeness: number;
    authenticity: number;
  }>({
    overall: 0,
    clarity: 0,
    completeness: 0,
    authenticity: 0
  });
  
  // Check if all required documents are uploaded
  useEffect(() => {
    if (requiredDocuments.length === 0 || !documents.length) {
      setAllRequiredUploaded(false);
      return;
    }
    
    const uploadedTypes = documents.map(doc => doc.type);
    const uniqueUploadedTypes = [...new Set(uploadedTypes)];
    const allUploaded = requiredDocuments.every(type => 
      uniqueUploadedTypes.includes(type as DocumentType)
    );
    
    setAllRequiredUploaded(allUploaded);
  }, [documents, requiredDocuments]);
  
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
    
    // Show success toast
    setToastMessage(`${acceptedFiles.length} document${acceptedFiles.length > 1 ? 's' : ''} uploaded successfully`);
    setToastType('success');
    setShowToast(true);
    
    // Simulate response from agent
    addMessageToChat({
      sender: 'user',
      content: `I've uploaded ${acceptedFiles.length > 1 ? 'documents' : 'a document'} for ${selectedDocType}`
    });
    
    // Simulate document scanning and verification - start the process for the first document
    if (newDocuments.length > 0) {
      initiateDocumentScan(newDocuments[0]);
    }
    
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
            content: "Great job! You've uploaded all the required documents. Now they need to be verified before you can proceed to fill out the claim form.",
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

  // Simulate scanning and verification of a document
  const initiateDocumentScan = (document: Document) => {
    setIsScanning(true);
    setScanProgress(0);
    
    // Set intervals for progressive updates to scan progress
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 200);
    
    // When scan completes, show quality feedback and then verification
    setTimeout(() => {
      clearInterval(interval);
      setIsScanning(false);
      setScanProgress(100);
      
      // Generate random quality scores
      const clarity = Math.floor(Math.random() * 40) + 60; // 60-100
      const completeness = Math.floor(Math.random() * 30) + 70; // 70-100
      const authenticity = Math.floor(Math.random() * 20) + 80; // 80-100
      const overall = Math.floor((clarity + completeness + authenticity) / 3);
      
      setDocumentQuality({
        overall,
        clarity,
        completeness,
        authenticity
      });
      
      setShowQualityFeedback(true);
      
      // After showing quality, show verification feedback
      setTimeout(() => {
        setShowQualityFeedback(false);
        setVerificationFeedback({ document, show: true });
      }, 3500);
    }, 4000);
  };

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
      
      // Show toast notification
      setToastMessage(`Document "${docToRemove.name}" removed`);
      setToastType('info');
      setShowToast(true);
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
  
  const rejectDocument = (docId: string, reason: string = 'The document does not meet our requirements') => {
    setDocuments(documents.map(doc => 
      doc.id === docId ? { ...doc, status: 'Rejected' } : doc
    ));
    
    const docToReject = documents.find(doc => doc.id === docId);
    if (docToReject) {
      // Add rejection message
      addMessageToChat({
        sender: 'agent',
        content: `I'm unable to verify the ${docToReject.type.toLowerCase()}: ${docToReject.name}. ${reason} Please upload a new version that meets our requirements.`,
        agentType: 'document-assistant'
      });
      
      // Show toast notification
      setToastMessage(`Document "${docToReject.name}" rejected: ${reason}`);
      setToastType('error');
      setShowToast(true);
    }
  };
  
  const handlePreview = (doc: Document) => {
    setPreviewDocument(doc);
    setPreviewError(null);
  };
  
  const closePreview = () => {
    setPreviewDocument(null);
    setPreviewError(null);
  };
  
  const handleContinue = () => {
    // Check if all required documents are uploaded
    const uploadedTypes = documents.map(doc => doc.type);
    const uniqueUploadedTypes = [...new Set(uploadedTypes)];
    const allRequiredUploaded = requiredDocuments.every(type => 
      uniqueUploadedTypes.includes(type as DocumentType)
    );
    
    if (allRequiredUploaded) {
      // Check if all uploaded required documents are verified
      const requiredDocsVerified = requiredDocuments.every(type => {
        const doc = documents.find(d => d.type === type);
        return doc && doc.status === 'Verified';
      });
      
      if (requiredDocsVerified) {
        // Notify the user and proceed
        addMessageToChat({
          sender: 'agent',
          content: "All required documents have been successfully uploaded and verified. You can now proceed to fill out the claim form.",
          agentType: 'document-assistant'
        });
        
        setTimeout(() => {
          setActiveTab('fill');
        }, 1500);
      } else {
        // Some documents are uploaded but not verified
        setToastMessage('Some documents require verification before proceeding');
        setToastType('info');
        setShowToast(true);
        
        addMessageToChat({
          sender: 'agent',
          content: "All required documents have been uploaded, but some still need verification. Please wait for verification to complete or click the 'Verify' button to manually verify documents.",
          agentType: 'document-assistant'
        });
      }
    } else {
      // Alert the user about missing documents
      const missingDocs = requiredDocuments.filter(doc => !uniqueUploadedTypes.includes(doc as DocumentType));
      
      // Show toast notification
      setToastMessage(`Missing required documents: ${missingDocs.join(", ")}`);
      setToastType('error');
      setShowToast(true);
      
      addMessageToChat({
        sender: 'agent',
        content: `Some required documents are still missing. Please upload the following: ${missingDocs.join(", ")} before proceeding.`,
        agentType: 'document-assistant'
      });
    }
  };
  
  // Demo mode handlers
  const toggleDemoMode = () => {
    setDemoMode(!demoMode);
    
    // Add message to chat about demo mode
    if (!demoMode) {
      addMessageToChat({
        sender: 'agent',
        content: "Demo mode activated. You can now use sample documents without having to upload actual files.",
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
  
  const addDemoDocument = (fileIndex: number = 0) => {
    const docType = selectedDocType;
    const availableDocs = demoDocuments[docType as keyof typeof demoDocuments] || demoDocuments['Other'];
    const demoDoc = availableDocs[fileIndex % availableDocs.length];
    
    // For demo documents, let's create more realistic preview URLs based on document type
    const getDemoFileUrl = () => {
      // For demo mode, we'll use placeholder images that look like the document type
      if (docType === 'Death Certificate') {
        return 'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
      } else if (docType === 'ID Proof') {
        return 'https://images.pexels.com/photos/3649408/pexels-photo-3649408.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
      } else if (docType === 'Medical Records') {
        return 'https://images.pexels.com/photos/5327653/pexels-photo-5327653.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
      } else if (docType === 'Power of Attorney') {
        return 'https://images.pexels.com/photos/6702282/pexels-photo-6702282.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
      } else {
        return 'https://images.pexels.com/photos/95916/pexels-photo-95916.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
      }
    };
    
    const newDocument: Document = {
      id: `demo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: demoDoc.name,
      type: docType,
      uploadDate: new Date(),
      size: demoDoc.size,
      status: 'Uploaded',
      fileUrl: getDemoFileUrl()
    };
    
    setDocuments(prev => [...prev, newDocument]);
    setUploadedDocuments(prev => [...prev, demoDoc.name]);
    
    // Show toast notification
    setToastMessage(`Demo document "${demoDoc.name}" added`);
    setToastType('success');
    setShowToast(true);
    
    // Simulate user message
    addMessageToChat({
      sender: 'user',
      content: `I've uploaded a ${docType}`
    });
    
    // Simulate document scanning - only for demo documents
    initiateDocumentScan(newDocument);
    
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
            content: "Great job! You've uploaded all the required documents. Once they're verified, you can proceed to fill out the claim form.",
            agentType: 'document-assistant'
          });
        }, 1500);
      }
    }, 1000);
  };
  
  // Handle preview errors
  const handlePreviewError = () => {
    setPreviewError("There was a problem loading this document. It may be corrupted or in an unsupported format.");
  };
  
  // Manually trigger file input click
  const handleBrowseFiles = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
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
        
        {/* Demo Mode Toggle */}
        <div className="flex items-center justify-end mb-4">
          <span className="text-sm text-gray-600 mr-2">Demo Mode</span>
          <button 
            className="focus:outline-none transition-colors" 
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
        
        <div className="bg-blue-50 rounded-lg p-4 mb-6 flex items-start">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-800 mb-1">Required Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {requiredDocuments.map((doc, index) => {
                const isUploaded = documents.some(d => d.type === doc);
                const isVerified = documents.some(d => d.type === doc && d.status === 'Verified');
                return (
                  <div key={index} className="flex items-center">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      isVerified
                        ? 'bg-green-500'
                        : isUploaded
                        ? 'bg-blue-500' 
                        : 'bg-gray-400'
                    } mr-2`}></div>
                    <span className={`text-sm ${
                      isVerified 
                        ? 'text-green-700' 
                        : isUploaded 
                        ? 'text-blue-700' 
                        : 'text-blue-700'
                    }`}>
                      {doc}
                      {isVerified && (
                        <span className="ml-1 text-xs text-green-600">(Verified)</span>
                      )}
                    </span>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
            /* Demo Mode Upload Interface */}
            <div className="border-2 border-dashed rounded-lg p-6 text-center bg-blue-50 border-blue-300 transition-all duration-300">
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
                      className="px-4 py-2 bg-white border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 hover:bg-blue-50 focus:outline-none transition-colors"
                    >
                      {doc.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Real Upload Interface */}
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${
                isDragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              <input {...getInputProps()} ref={fileInputRef} />
              <div className="space-y-3">
                <div className="mx-auto h-12 w-12 text-gray-400 flex items-center justify-center rounded-full bg-gray-100">
                  <Upload className="h-6 w-6" />
                </div>
                <div className="text-gray-700">
                  <p className="font-medium">Drag and drop your file here, or</p>
                  <div className="mt-2">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none cursor-pointer transition-colors"
                      onClick={handleBrowseFiles}
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
        
        {/* Document Scanning Modal */}
        {isScanning && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full animate-fade-in">
              <div className="text-center mb-6">
                <Shield className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Scanning Document</h3>
                <p className="text-sm text-gray-600">
                  We're scanning your document for quality and authenticity. This usually takes a few seconds.
                </p>
              </div>
              
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${scanProgress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Scanning...</span>
                  <span>{scanProgress}%</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <div className="w-5 h-5 mr-2 flex-shrink-0">
                    {scanProgress >= 30 ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <RotateCw className="h-5 w-5 text-blue-500 animate-spin" />
                    )}
                  </div>
                  <span className={scanProgress >= 30 ? "text-green-700" : "text-gray-700"}>
                    Checking file format and size
                  </span>
                </div>
                
                <div className="flex items-center text-sm">
                  <div className="w-5 h-5 mr-2 flex-shrink-0">
                    {scanProgress >= 60 ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : scanProgress >= 30 ? (
                      <RotateCw className="h-5 w-5 text-blue-500 animate-spin" />
                    ) : (
                      <Clock className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <span className={scanProgress >= 60 ? "text-green-700" : scanProgress >= 30 ? "text-gray-700" : "text-gray-400"}>
                    Analyzing document quality
                  </span>
                </div>
                
                <div className="flex items-center text-sm">
                  <div className="w-5 h-5 mr-2 flex-shrink-0">
                    {scanProgress >= 90 ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : scanProgress >= 60 ? (
                      <RotateCw className="h-5 w-5 text-blue-500 animate-spin" />
                    ) : (
                      <Clock className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <span className={scanProgress >= 90 ? "text-green-700" : scanProgress >= 60 ? "text-gray-700" : "text-gray-400"}>
                    Verifying document authenticity
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Document Quality Feedback Modal */}
        {showQualityFeedback && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full animate-fade-in">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Document Quality Analysis</h3>
                <button 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowQualityFeedback(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Overall Score</span>
                  <span className={`text-sm font-medium ${
                    documentQuality.overall >= 80 ? 'text-green-700' : 
                    documentQuality.overall >= 60 ? 'text-amber-700' : 'text-red-700'
                  }`}>{documentQuality.overall}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      documentQuality.overall >= 80 ? 'bg-green-500' : 
                      documentQuality.overall >= 60 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${documentQuality.overall}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-700">Image Clarity</span>
                    <span className="text-sm font-medium">{documentQuality.clarity}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${documentQuality.clarity}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-700">Document Completeness</span>
                    <span className="text-sm font-medium">{documentQuality.completeness}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${documentQuality.completeness}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-700">Verification Confidence</span>
                    <span className="text-sm font-medium">{documentQuality.authenticity}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${documentQuality.authenticity}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {documentQuality.overall >= 80 ? (
                <div className="p-4 bg-green-50 rounded-lg text-sm text-green-700 mb-4">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>This document meets our quality standards and should be accepted for processing.</span>
                  </div>
                </div>
              ) : documentQuality.overall >= 60 ? (
                <div className="p-4 bg-amber-50 rounded-lg text-sm text-amber-700 mb-4">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>This document meets minimum quality standards but could be improved. Consider uploading a clearer version if available.</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-50 rounded-lg text-sm text-red-700 mb-4">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>This document doesn't meet our quality standards. Please upload a clearer, more complete version.</span>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  onClick={() => setShowQualityFeedback(false)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Uploaded Documents List */}
        {documents.length > 0 && (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Documents</h2>
            <div className="space-y-3">
              {documents.map(doc => (
                <div 
                  key={doc.id} 
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
                    doc.status === 'Verified'
                      ? 'bg-green-50 border-green-200'
                      : doc.status === 'Rejected'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-gray-50 border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                  }`}
                >
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
                      <>
                        <button 
                          onClick={() => verifyDocument(doc.id)}
                          className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          Verify
                        </button>
                        <button 
                          onClick={() => rejectDocument(doc.id)}
                          className="text-xs text-red-600 hover:text-red-800 transition-colors"
                        >
                          Reject
                        </button>
                      </>
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
                  const isRejected = documents.some(d => d.type === doc && d.status === 'Rejected');
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-5 h-5 flex items-center justify-center rounded-full mr-2 ${
                          isVerified 
                            ? 'bg-green-100 text-green-600' 
                            : isRejected
                            ? 'bg-red-100 text-red-600'
                            : isUploaded 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {isVerified ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : isRejected ? (
                            <AlertCircle className="w-3 h-3" />
                          ) : (
                            <span className="text-xs">{index + 1}</span>
                          )}
                        </div>
                        <span className="text-sm text-gray-700">{doc}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${
                        isVerified 
                          ? 'bg-green-100 text-green-600' 
                          : isRejected
                          ? 'bg-red-100 text-red-600'
                          : isUploaded 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {isVerified ? 'Verified' : isRejected ? 'Rejected' : isUploaded ? 'Uploaded' : 'Required'}
                      </span>
                    </div>
                  );
                })}
              </div>
              
              {/* Document verification status summary */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-center">
                  <div className="grid grid-cols-3 w-full max-w-md gap-4">
                    <div className="flex flex-col items-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {documents.length}
                      </div>
                      <div className="text-xs text-gray-500">Uploaded</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-2xl font-bold text-green-600">
                        {documents.filter(d => d.status === 'Verified').length}
                      </div>
                      <div className="text-xs text-gray-500">Verified</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-2xl font-bold text-amber-600">
                        {requiredDocuments.length - documents.filter(d => 
                          requiredDocuments.includes(d.type) && d.status === 'Verified'
                        ).length}
                      </div>
                      <div className="text-xs text-gray-500">Pending</div>
                    </div>
                  </div>
                </div>
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
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
          >
            Back to Claim Selection
          </button>
          
          <button
            onClick={handleContinue}
            className={`flex items-center px-4 py-2 rounded-md shadow-sm text-white transition-colors ${
              !allRequiredUploaded
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={!allRequiredUploaded}
          >
            <span>Continue to Claim Form</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Document Preview Modal */}
      {previewDocument && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-500 bg-opacity-75 flex items-center justify-center transition-opacity duration-300">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col transition-transform duration-300 transform animate-fade-in">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">{previewDocument.name}</h3>
              <button
                onClick={closePreview}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {previewError ? (
                <div className="h-full flex items-center justify-center bg-red-50 rounded-lg p-6 text-center">
                  <div>
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600">{previewError}</p>
                    <p className="mt-2 text-sm text-gray-500">
                      The document may be in an unsupported format or corrupted.
                    </p>
                  </div>
                </div>
              ) : previewDocument.fileUrl ? (
                previewDocument.name.toLowerCase().endsWith('.pdf') ? (
                  <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg relative">
                    <iframe 
                      src={previewDocument.fileUrl}
                      className="w-full h-[70vh]"
                      title={previewDocument.name}
                      onError={handlePreviewError}
                    ></iframe>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg p-4">
                    <img 
                      src={previewDocument.fileUrl}
                      alt={previewDocument.name}
                      className="max-w-full max-h-[70vh] object-contain"
                      onError={handlePreviewError}
                    />
                  </div>
                )
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
                  <div className="text-center p-6">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Preview not available</p>
                    <p className="mt-2 text-sm text-gray-400">
                      {demoMode ? 
                        "This is a demo document without actual preview content." :
                        "The file cannot be previewed. Try downloading instead."
                      }
                    </p>
                  </div>
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
                      className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors"
                    >
                      Verify Document
                    </button>
                  )}
                  <button
                    onClick={closePreview}
                    className="px-3 py-1.5 bg-gray-200 text-gray-800 text-sm font-medium rounded hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Verification Feedback */}
      {verificationFeedback && verificationFeedback.show && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg max-w-md w-full p-6 transition-transform duration-300 transform animate-fade-in">
            <DocumentVerificationFeedback 
              document={verificationFeedback.document}
              onClose={() => setVerificationFeedback(null)}
            />
          </div>
        </div>
      )}
      
      {/* Toast notification */}
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

export default EnhancedUploadDocuments;