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

  // Rest of the component code...

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Upload Documents</h2>
        <div className="flex items-center">
          <span className="mr-2 text-sm text-gray-600">Demo Mode</span>
          <button 
            onClick={() => setDemoMode(!demoMode)}
            className="focus:outline-none"
          >
            {demoMode ? <ToggleRight className="text-blue-500" /> : <ToggleLeft className="text-gray-400" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: Document upload area */}
        <div className="md:col-span-2">
          <div 
            className={`border-2 border-dashed rounded-lg p-8 mb-6 transition-colors ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
            }`}
          >
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <h3 className="text-lg font-medium mb-2">Upload your documents</h3>
              <p className="text-sm text-gray-500 mb-4">
                Drag and drop your files here, or click to browse
              </p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Select Files
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                multiple 
                onChange={() => {}} 
              />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Required Documents</h3>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <ul className="space-y-2">
                {requiredDocuments.map((doc, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right column: Document type selection and preview */}
        <div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <h3 className="text-lg font-medium mb-3">Document Type</h3>
            <select 
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value as DocumentType)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="Claim Form">Claim Form</option>
              <option value="Medical Report">Medical Report</option>
              <option value="Proof of Identity">Proof of Identity</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-medium mb-3">Document Preview</h3>
            {previewDocument ? (
              <div className="text-center">
                <FileText className="mx-auto h-16 w-16 text-blue-500 mb-2" />
                <p className="font-medium">{previewDocument.name}</p>
                <div className="flex justify-center mt-3 space-x-2">
                  <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center">
                    <Eye className="h-4 w-4 mr-1" /> View
                  </button>
                  <button className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 flex items-center">
                    <XCircle className="h-4 w-4 mr-1" /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No document selected for preview</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document verification feedback */}
      {verificationFeedback && verificationFeedback.show && (
        <DocumentVerificationFeedback 
          document={verificationFeedback.document}
          onClose={() => setVerificationFeedback(null)}
        />
      )}

      {/* Action buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => {}}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            if (activeTab < 4) {
              setActiveTab(activeTab + 1);
            }
          }}
          disabled={!allRequiredUploaded}
          className={`px-6 py-2 rounded-md transition flex items-center ${
            allRequiredUploaded 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>

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