import React from 'react';
import { CheckCircle, AlertCircle, X, Clock, Upload, Search } from 'lucide-react';
import { Document } from '../../types';

interface DocumentVerificationFeedbackProps {
  document: Document;
  onClose: () => void;
}

const DocumentVerificationFeedback: React.FC<DocumentVerificationFeedbackProps> = ({
  document,
  onClose
}) => {
  // Determine verification status and appropriate message/UI
  const getStatusDisplay = () => {
    switch (document.status) {
      case 'Verified':
        return {
          icon: <CheckCircle className="h-8 w-8 text-green-500" />,
          title: 'Document Verified',
          message: 'This document has been verified and meets all requirements.',
          color: 'bg-green-50 border-green-200 text-green-800'
        };
      case 'Rejected':
        return {
          icon: <AlertCircle className="h-8 w-8 text-red-500" />,
          title: 'Document Rejected',
          message: 'This document doesn\'t meet our requirements. Please upload a new version.',
          color: 'bg-red-50 border-red-200 text-red-800'
        };
      default:
        return {
          icon: <Clock className="h-8 w-8 text-blue-500" />,
          title: 'Document Processing',
          message: 'This document is being processed. We\'ll notify you when verification is complete.',
          color: 'bg-blue-50 border-blue-200 text-blue-800'
        };
    }
  };
  
  const statusDisplay = getStatusDisplay();
  const documentTypeInfo = getDocumentTypeInfo(document.type);
  
  return (
    <div className={`rounded-lg border p-4 ${statusDisplay.color} animate-fade-in`}>
      <div className="flex justify-between items-start">
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-3">
            {statusDisplay.icon}
          </div>
          <div>
            <h3 className="font-medium mb-1">{statusDisplay.title}</h3>
            <p className="text-sm">{statusDisplay.message}</p>
            
            {document.status === 'Rejected' && (
              <div className="mt-3 text-sm">
                <h4 className="font-medium mb-1">Rejection reasons:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Document is not clearly legible</li>
                  <li>Required information is missing or cut off</li>
                  <li>Document appears to be incomplete</li>
                </ul>
              </div>
            )}
          </div>
        </div>
        <button 
          className="text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      {document.status !== 'Rejected' && (
        <div className="mt-4 pt-3 border-t border-blue-200">
          <h4 className="text-sm font-medium mb-2">Document Requirements</h4>
          {documentTypeInfo.requirements.map((req, index) => (
            <div key={index} className="flex items-center mb-1 text-sm">
              <div className="w-5 h-5 rounded-full flex items-center justify-center mr-2 bg-white">
                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
              </div>
              <span>{req}</span>
            </div>
          ))}
        </div>
      )}
      
      {document.status === 'Rejected' && (
        <div className="mt-4">
          <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Upload className="mr-2 h-4 w-4" />
            Upload New Version
          </button>
        </div>
      )}
    </div>
  );
};

// Helper function to get document-specific information
const getDocumentTypeInfo = (documentType: string) => {
  switch (documentType) {
    case 'Death Certificate':
      return {
        requirements: [
          'Must be a certified copy',
          'All information must be legible',
          'Must include cause of death',
          'Official seal or stamp must be visible'
        ]
      };
    case 'ID Proof':
      return {
        requirements: [
          'Government-issued photo ID (driver\'s license, passport, etc.)',
          'Must be current and not expired',
          'All information must be legible',
          'Photo must be clearly visible'
        ]
      };
    case 'Medical Records':
      return {
        requirements: [
          'Must include patient name and date of birth',
          'Must be signed by healthcare provider',
          'Must include relevant diagnosis and treatment information',
          'Must be dated within the last 12 months'
        ]
      };
    case 'Claim Form':
      return {
        requirements: [
          'All required fields must be completed',
          'Must be signed and dated',
          'No whiteout or alterations',
          'Must use the correct form for claim type'
        ]
      };
    default:
      return {
        requirements: [
          'Document must be clear and legible',
          'All pages must be included',
          'Must be in PDF, JPG, or PNG format',
          'File size must not exceed 10MB'
        ]
      };
  }
};

export default DocumentVerificationFeedback;