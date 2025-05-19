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
  RotateCw,
  Clock,
  AlertCircle
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
    
    // Check if all required documents are uploaded
    if (requiredDocuments.length > 0) {
      const uploadedTypes = documents.map(doc => doc.type);
      const uniqueUploadedTypes = [...new Set(uploadedTypes)];
      const allUploaded = requiredDocuments.every(doc => 
        uniqueUploadedTypes.includes(doc as DocumentType)
      );
      setAllRequiredUploaded(allUploaded);
    }
  }, [claimData, activeTab, documents, addMessageToChat, requiredDocuments]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    // Show scanning animation
    setIsScanning(true);
    
    // Process each file
    const progressInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
    
    setTimeout(() => {
      // Simulate document quality check
      const newQuality = {
        clarity: Math.floor(Math.random() * 30) + 70, // 70-100
        completeness: Math.floor(Math.random() * 20) + 80, // 80-100
        authenticity: Math.floor(Math.random() * 15) + 85, // 85-100
        overall: 0
      };
      
      // Calculate overall score (weighted average)
      newQuality.overall = Math.floor(
        (newQuality.clarity * 0.3) + 
        (newQuality.completeness * 0.4) + 
        (newQuality.authenticity * 0.3)
      );
      
      setDocumentQuality(newQuality);
      setIsScanning(false);
      setScanProgress(0);
      
      // Show quality feedback for a moment
      setShowQualityFeedback(true);
      setTimeout(() => setShowQualityFeedback(false), 3000);
      
      // Create document objects
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
      
      // Add documents and show verification feedback for the first one
      setDocuments(prev => [...prev, ...newDocuments]);
      setUploadedDocuments(prev => [...prev, ...acceptedFiles.map(file => file.name)]);
      
      if (newDocuments.length > 0) {
        setVerificationFeedback({
          document: newDocuments[0],
          show: true
        });
      }
      
      // Show success toast
      setToastMessage(`Successfully uploaded ${newDocuments.length} document${newDocuments.length !== 1 ? 's' : ''}`);
      setToastType('success');
      setShowToast(true);
      
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
      
    }, 2000);
    
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
      
      // Show toast notification
      setToastMessage(`Removed document: ${docToRemove.name}`);
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
      // Show verification feedback
      setVerificationFeedback({
        document: { ...docToVerify, status: 'Verified' },
        show: true
      });
      
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
    // Check if all required documents are uploaded
    const uploadedTypes = documents.map(doc => doc.type);
    const uniqueUploadedTypes = [...new Set(uploadedTypes)];
    const allRequiredUploaded = requiredDocuments.every(type => 
      uniqueUploadedTypes.includes(type as DocumentType)
    );
    
    if (allRequiredUploaded) {
      // Notify the user and proceed
      addMessageToChat({
        sender: 'agent',
        content: "All required documents have been successfully uploaded. You can now proceed to fill out the claim form.",
        agentType: 'document-assistant'
      });
      
      // Show success toast
      setToastMessage("All documents uploaded successfully");
      setToastType('success');
      setShowToast(true);
      
      setTimeout(() => {
        setActiveTab('fill');
      }, 1500);
    } else {
      // Alert the user about missing documents
      const missingDocs = requiredDocuments.filter(doc => !uniqueUploadedTypes.includes(doc as DocumentType));
      
      // Show error toast
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
  
  // Demo mode documents
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
    
    // Show scanning animation
    setIsScanning(true);
    
    // Process each file
    const progressInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
    
    setTimeout(() => {
      // Simulate document quality check
      const newQuality = {
        clarity: Math.floor(Math.random() * 30) + 70, // 70-100
        completeness: Math.floor(Math.random() * 20) + 80, // 80-100
        authenticity: Math.floor(Math.random() * 15) + 85, // 85-100
        overall: 0
      };
      
      // Calculate overall score (weighted average)
      newQuality.overall = Math.floor(
        (newQuality.clarity * 0.3) + 
        (newQuality.completeness * 0.4) + 
        (newQuality.authenticity * 0.3)
      );
      
      setDocumentQuality(newQuality);
      setIsScanning(false);
      setScanProgress(0);
      
      // Show quality feedback for a moment
      setShowQualityFeedback(true);
      setTimeout(() => setShowQualityFeedback(false), 3000);
    
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
      
      // Show verification feedback
      setVerificationFeedback({
        document: newDocument,
        show: true
      });
      
      // Show success toast
      setToastMessage(`Successfully uploaded ${demoDoc.name}`);
      setToastType('success');
      setShowToast(true);
      
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
    }, 2000);
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
    <div className="h-full overflow-y-auto p-4 md:p-8 transition-all duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload Documents</h1>
          <p className="text-gray-600">
            Please upload the required documentation for your {claimData.claimType.toLowerCase()}.
          </p>
        </div>
        
        {/* Document Upload Area with Enhanced UI */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <Upload className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Upload Documents</h2>
                <p className="text-sm text-gray-500">Files should be PDF, JPG, or PNG (max 10MB)</p>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Demo Mode</span>
              <button 
                onClick={() => setDemoMode(!demoMode)}
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              {demoMode ? (
                /* Demo Mode Upload Interface */
                <div className="border-2 border-dashed rounded-lg p-8 text-center bg-blue-50 border-blue-300 h-full flex flex-col justify-center">
                  <div className="space-y-4">
                    <div className="mx-auto h-12 w-12 text-blue-500 flex items-center justify-center rounded-full bg-blue-100">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="text-gray-700">
                      <h3 className="text-lg font-medium mb-1">Demo Mode: Sample Document Selection</h3>
                      <p className="text-sm text-gray-600">
                        Select a sample document to demonstrate the upload process without using actual files
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                      {demoDocuments[selectedDocType as keyof typeof demoDocuments]?.map((doc, index) => (
                        <button
                          key={index}
                          onClick={() => addDemoDocument(index)}
                          className="px-4 py-2 bg-white border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors"
                        >
                          <span className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-blue-500" />
                            {doc.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Real Upload Interface */
                <div 
                  {...getRootProps()} 
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors h-full ${
                    isDragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                  }`}
                >
                  <input {...getInputProps()} ref={fileInputRef} />
                  <div className="space-y-4">
                    <div className="mx-auto h-16 w-16 text-gray-400 flex items-center justify-center rounded-full bg-gray-100">
                      <Upload className="h-8 w-8" />
                    </div>
                    <div className="text-gray-700">
                      <h3 className="text-lg font-medium mb-1">Drag and drop your documents here</h3>
                      <p className="text-sm text-gray-600">
                        or click to browse files from your computer
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Select Files
                    </button>
                    <div className="text-xs text-gray-500">
                      <p>Supported formats: PDF, JPG, PNG</p>
                      <p>Maximum size: 10MB per file</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Document Scanning Animation */}
              {isScanning && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100 animate-fade-in">
                  <div className="flex items-center mb-2">
                    <Shield className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="text-sm font-medium text-blue-800">Document Verification in Progress</h3>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-200"
                      style={{ width: `${scanProgress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-blue-600">
                    <span>Scanning</span>
                    <span>{scanProgress}% complete</span>
                  </div>
                </div>
              )}
              
              {/* Document Quality Feedback */}
              {showQualityFeedback && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-100 animate-fade-in">
                  <div className="flex items-center mb-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <h3 className="text-sm font-medium text-green-800">Document Quality Check Passed</h3>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-600">Overall Quality</span>
                        <span className="text-xs font-medium">{documentQuality.overall}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${documentQuality.overall}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-600">Image Clarity</span>
                        <span className="text-xs font-medium">{documentQuality.clarity}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${documentQuality.clarity}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-600">Completeness</span>
                        <span className="text-xs font-medium">{documentQuality.completeness}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${documentQuality.completeness}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <div className="bg-white rounded-lg border border-gray-200 p-4 h-full">
                <h3 className="text-md font-medium text-gray-900 mb-3">Document Type</h3>
                <select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value as DocumentType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-4"
                >
                  {requiredDocuments.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
                
                <div className="bg-blue-50 p-3 rounded-lg mb-3">
                  <div className="flex items-start">
                    <Info className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-medium text-blue-800 mb-1">Required Documents</h4>
                      <ul className="list-disc pl-4 text-xs text-blue-700 space-y-0.5">
                        {requiredDocuments.map((doc, idx) => {
                          const isUploaded = documents.some(d => d.type === doc);
                          return (
                            <li key={idx} className={isUploaded ? "text-green-600" : ""}>
                              {doc}
                              {isUploaded && " ✓"}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
                
                {selectedDocType === 'Death Certificate' && (
                  <div className="bg-gray-50 p-3 rounded-lg mb-4 text-xs text-gray-600">
                    <p className="font-medium text-gray-700 mb-1">Death Certificate Requirements:</p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li>Must be a certified copy</li>
                      <li>Issued by a government authority</li>
                      <li>Include cause of death (if applicable)</li>
                      <li>Clear and complete document</li>
                    </ul>
                  </div>
                )}
                
                {selectedDocType === 'ID Proof' && (
                  <div className="bg-gray-50 p-3 rounded-lg mb-4 text-xs text-gray-600">
                    <p className="font-medium text-gray-700 mb-1">Acceptable ID Documents:</p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li>Driver's license</li>
                      <li>Passport</li>
                      <li>State ID card</li>
                      <li>Government-issued photo ID</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Upload Progress */}
          {documents.length > 0 && (
            <div className="mt-6">
              <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                <FileCheck className="h-5 w-5 mr-2 text-blue-500" />
                Uploaded Documents
              </h3>
              
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div 
                    key={doc.id} 
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      doc.status === 'Verified'
                        ? 'bg-green-50 border-green-200'
                        : doc.status === 'Rejected'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    } transition-colors`}
                  >
                    <div className="flex items-center">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center mr-3 ${
                        doc.status === 'Verified'
                          ? 'bg-green-100 text-green-500'
                          : doc.status === 'Rejected'
                          ? 'bg-red-100 text-red-500'
                          : 'bg-blue-100 text-blue-500'
                      }`}>
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span>{doc.type}</span>
                          <span>•</span>
                          <span>{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                          <span>•</span>
                          <span>{doc.uploadDate.toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {doc.status === 'Uploaded' ? (
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Clock className="w-3 h-3 mr-1" />
                            Processing
                          </span>
                        </div>
                      ) : doc.status === 'Verified' ? (
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle className="w-3 h-3 mr-1" />
                            Rejected
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePreview(doc)}
                          className="p-1.5 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Preview Document"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {doc.status === 'Uploaded' && (
                          <button
                            onClick={() => verifyDocument(doc.id)}
                            className="p-1.5 rounded-full text-gray-500 hover:text-green-600 hover:bg-green-50 transition-colors"
                            title="Verify Document"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleRemoveDocument(doc.id)}
                          className="p-1.5 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Remove Document"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Document Verification Feedback */}
        {verificationFeedback && verificationFeedback.show && (
          <div className="mb-6 animate-fade-in">
            <DocumentVerificationFeedback 
              document={verificationFeedback.document}
              onClose={() => setVerificationFeedback(null)}
            />
          </div>
        )}
        
        {/* Required Documents Checklist */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileCheck className="h-5 w-5 mr-2 text-blue-500" />
            Required Documents
          </h3>
          
          <div className="space-y-4">
            {requiredDocuments.map((docType, index) => {
              const isUploaded = documents.some(doc => doc.type === docType);
              const isVerified = documents.some(doc => doc.type === docType && doc.status === 'Verified');
              
              return (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border ${
                    isVerified
                      ? 'border-green-200 bg-green-50'
                      : isUploaded
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  } transition-all duration-300`}
                >
                  <div className="flex items-center">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                      isVerified
                        ? 'bg-green-100 text-green-600'
                        : isUploaded
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {isVerified ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : isUploaded ? (
                        <Clock className="h-4 w-4" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h4 className="font-medium text-gray-900">{docType}</h4>
                        {isVerified ? (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            Verified
                          </span>
                        ) : isUploaded ? (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            Uploaded
                          </span>
                        ) : (
                          <span className="ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
                            Required
                          </span>
                        )}
                      </div>
                      
                      {isUploaded && (
                        <div className="text-xs text-gray-500 mt-1">
                          Document uploaded: {
                            documents.find(doc => doc.type === docType)?.name
                          }
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Document Guidelines */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <span className="text-sm font-medium text-blue-700">1</span>
              </div>
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-1">File Requirements</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                  <li>Upload documents in PDF, JPG, or PNG format</li>
                  <li>Each file must be under 10MB in size</li>
                  <li>Documents must be clear, complete, and legible</li>
                  <li>Remove any password protection from PDF files</li>
                </ul>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <span className="text-sm font-medium text-blue-700">2</span>
              </div>
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-1">Image Quality</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                  <li>Ensure the entire document is visible</li>
                  <li>All text should be readable</li>
                  <li>Take photos in good lighting</li>
                  <li>Avoid shadows and glare</li>
                </ul>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <span className="text-sm font-medium text-blue-700">3</span>
              </div>
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-1">Document Verification</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                  <li>Documents will be verified for authenticity</li>
                  <li>You'll receive notification if issues are found</li>
                  <li>Rejected documents must be re-uploaded</li>
                  <li>Processing begins after all documents are verified</li>
                </ul>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <span className="text-sm font-medium text-blue-700">4</span>
              </div>
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-1">After Uploading</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                  <li>Once all documents are uploaded, proceed to the claim form</li>
                  <li>Keep original documents for your records</li>
                  <li>You can upload additional documents later if needed</li>
                  <li>Document verification typically takes 1-2 business days</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Continue Button */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setActiveTab('start')}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Back to Claim Selection
          </button>
          
          <button
            onClick={handleContinue}
            className={`flex items-center px-4 py-2 rounded-md shadow-sm text-white transition-colors ${
              allRequiredUploaded
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
            disabled={!allRequiredUploaded}
          >
            <span>{allRequiredUploaded ? "Continue to Claim Form" : "Upload Required Documents"}</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Document Preview Modal */}
      {previewDocument && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col animate-fade-in">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-500" />
                {previewDocument.name}
              </h3>
              <div className="flex items-center space-x-2">
                {previewDocument.status === 'Uploaded' && (
                  <button
                    onClick={() => {
                      verifyDocument(previewDocument.id);
                      closePreview();
                    }}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="h-4 w-4 mr-1.5" />
                    Verify
                  </button>
                )}
                <button
                  onClick={closePreview}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                  aria-label="Close preview"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-100">
              {previewDocument.fileUrl ? (
                previewDocument.name.toLowerCase().endsWith('.pdf') ? (
                  <div className="h-full flex items-center justify-center bg-gray-800 rounded-lg">
                    <iframe 
                      src={previewDocument.fileUrl}
                      className="w-full h-[70vh]"
                      title={previewDocument.name}
                    ></iframe>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-800 rounded-lg p-4">
                    <img 
                      src={previewDocument.fileUrl}
                      alt={previewDocument.name}
                      className="max-w-full max-h-[70vh] object-contain"
                    />
                  </div>
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center bg-gray-200 rounded-lg p-8">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-500">Preview not available</p>
                  <p className="text-sm text-gray-400 mt-1">This is a simulated document in demo mode</p>
                </div>
              )}
            </div>
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="flex items-center text-sm text-gray-600">
                    <Shield className="h-4 w-4 text-blue-500 mr-1" />
                    <span>Document Status: </span>
                    <span className={`ml-1 font-medium ${
                      previewDocument.status === 'Verified'
                        ? 'text-green-600'
                        : previewDocument.status === 'Rejected'
                        ? 'text-red-600'
                        : 'text-blue-600'
                    }`}>
                      {previewDocument.status}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Uploaded on {previewDocument.uploadDate.toLocaleString()}
                  </p>
                </div>
                <div>
                  <button
                    onClick={closePreview}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
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

export default EnhancedUploadDocuments;