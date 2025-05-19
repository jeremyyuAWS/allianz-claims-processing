import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import StartClaim from '../components/claims/StartClaim';
import UploadDocuments from '../components/claims/UploadDocuments';
import FillClaimForm from '../components/claims/FillClaimForm';
import TrackClaimStatus from '../components/claims/TrackClaimStatus';
import ContactSupport from '../components/claims/ContactSupport';
import ChatModal from '../components/common/ChatModal';
import ChatButton from '../components/common/ChatButton';
import EnhancedUploadDocuments from '../components/claims/EnhancedUploadDocuments';
import ImprovedFillClaimForm from '../components/claims/ImprovedFillClaimForm';
import EnhancedTrackClaimStatus from '../components/claims/EnhancedTrackClaimStatus';

const ClaimsLayout: React.FC = () => {
  const { activeTab, setActiveTab } = useAppContext();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [useEnhancedUI, setUseEnhancedUI] = useState(true);

  return (
    <div className="flex flex-col h-full">
      <div className="py-2 px-4 bg-white border-b border-gray-200">
        <div className="flex space-x-4 overflow-x-auto">
          <button
            className={`py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'start'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('start')}
          >
            1. Start a Claim
          </button>
          <button
            className={`py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'upload'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('upload')}
          >
            2. Upload Documents
          </button>
          <button
            className={`py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'fill'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('fill')}
          >
            3. Fill Claim Form
          </button>
          <button
            className={`py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'track'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('track')}
          >
            4. Track Claim Status
          </button>
          <button
            className={`py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'contact'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('contact')}
          >
            5. Contact a Claims Agent
          </button>
        </div>
      </div>
      
      {/* Enhanced UI Toggle Button */}
      <div className="px-4 py-2 bg-white border-b border-gray-100 flex justify-end">
        <div className="flex items-center">
          <span className="text-sm text-gray-600 mr-2">Demo mode</span>
          <button 
            onClick={() => setUseEnhancedUI(!useEnhancedUI)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${useEnhancedUI ? 'bg-blue-600' : 'bg-gray-200'}`}
          >
            <span 
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${useEnhancedUI ? 'translate-x-6' : 'translate-x-1'}`} 
            />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        {activeTab === 'start' && <StartClaim />}
        
        {activeTab === 'upload' && (
          useEnhancedUI ? <EnhancedUploadDocuments /> : <UploadDocuments />
        )}
        
        {activeTab === 'fill' && (
          useEnhancedUI ? <ImprovedFillClaimForm /> : <FillClaimForm />
        )}
        
        {activeTab === 'track' && (
          useEnhancedUI ? <EnhancedTrackClaimStatus /> : <TrackClaimStatus />
        )}
        
        {activeTab === 'contact' && <ContactSupport />}
      </div>

      <ChatButton onClick={() => setIsChatOpen(true)} />
      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default ClaimsLayout;