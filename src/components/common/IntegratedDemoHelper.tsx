import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import {
  Lightbulb,
  Play,
  ChevronDown,
  UserCog,
  Users,
  X,
  Sparkles,
  Settings,
  Share2,
  Copy,
  Check,
  Info
} from 'lucide-react';

import {
  portfolioQuestions,
  advisorRequests,
  taxQuestions,
  socialSecurityQuestions,
  commonFollowUpQuestions,
  contributionQuestions,
  etfQuestions,
  delayQuestions,
  sampleUserProfiles
} from '../../data/demoData';

const IntegratedDemoHelper: React.FC = () => {
  const {
    mode,
    setMode,
    setActiveTab,
    setRetirementData,
    setShowWelcomeModal,
    activeTab
  } = useAppContext();

  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('questions');
  const [copiedQuestion, setCopiedQuestion] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Close the panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('.demo-helper-panel') && !target.closest('.demo-helper-toggle')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const displayToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const loadUserProfile = (profileIndex: number) => {
    const profile = sampleUserProfiles[profileIndex];
    setRetirementData({
      age: profile.age,
      retirementAge: profile.retirementAge,
      currentSavings: profile.currentSavings,
      annualIncome: profile.annualIncome,
      riskTolerance: profile.riskTolerance,
      desiredLifestyle: profile.desiredLifestyle
    });

    // Switch to appropriate tab based on mode
    if (mode === 'customer') {
      setActiveTab('explore');
    } else {
      setActiveTab('plan');
    }

    displayToast(`Profile loaded: ${profile.name}`);
    setIsOpen(false);
  };

  // Get relevant questions for the current active tab
  const getRelevantQuestions = () => {
    if (mode === 'customer') {
      switch (activeTab) {
        case 'explore':
          return portfolioQuestions.slice(0, 5);
        case 'tax':
          return taxQuestions;
        case 'social':
          return socialSecurityQuestions;
        case 'contribution':
          return contributionQuestions;
        case 'delay':
          return delayQuestions;
        default:
          return commonFollowUpQuestions.map(q => q.question).slice(0, 5);
      }
    } else {
      // Advisor mode
      switch (activeTab) {
        case 'explore':
          return advisorRequests.slice(0, 5);
        case 'etf':
          return etfQuestions;
        default:
          return commonFollowUpQuestions.map(q => q.question).slice(0, 5);
      }
    }
  };

  const handleQuestionClick = (question: string) => {
    // Copy the question to clipboard
    navigator.clipboard.writeText(question)
      .then(() => {
        // Show visual feedback that question was copied
        setCopiedQuestion(question);
        setTimeout(() => setCopiedQuestion(null), 2000);
        
        displayToast(`Copied to clipboard: "${question.length > 30 ? question.substring(0, 30) + '...' : question}"`);
        
        // Find chat input in the current view and insert the question
        const inputElements = document.querySelectorAll('input[type="text"], textarea');
        for (const input of inputElements) {
          const inputElement = input as HTMLInputElement;
          if (inputElement.placeholder && 
              (inputElement.placeholder.includes('question') || 
               inputElement.placeholder.includes('response') || 
               inputElement.placeholder.includes('message') ||
               inputElement.placeholder.includes('chat') ||
               inputElement.placeholder.includes('Ask'))) {
            inputElement.value = question;
            inputElement.focus();
            // Trigger an input event to ensure React state updates
            const event = new Event('input', { bubbles: true });
            inputElement.dispatchEvent(event);
            break;
          }
        }
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
        displayToast('Failed to copy text. Please try again.');
      });
  };

  const switchMode = (newMode: 'customer' | 'advisor') => {
    setMode(newMode);

    // Set appropriate tab for the mode
    if (newMode === 'customer') {
      setActiveTab('plan');
    } else {
      setActiveTab('plan');
    }

    displayToast(`Switched to ${newMode === 'customer' ? 'Customer' : 'Advisor'} Mode`);
    setIsOpen(false);
  };

  // Get relevant questions for current section
  const relevantQuestions = getRelevantQuestions();

  return (
    <>
      {/* Toast notification */}
      {showToast && (
        <div className="toast-notification success">
          <div className="flex items-center">
            <Check className="w-4 h-4 mr-2" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6 transition-all duration-300">
        <div className="flex items-center justify-between px-4 py-3 bg-amber-50 border-b border-amber-200">
          <div className="flex items-center">
            <Sparkles className="h-5 w-5 text-amber-500 mr-2" />
            <span className="font-medium text-amber-800">Interactive Demo Helper</span>
            {!isOpen && (
              <span className="ml-2 text-xs text-amber-600 hidden md:inline-block">Try sample profiles and questions</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowWelcomeModal(true)}
              className="text-xs bg-white border border-amber-200 rounded px-2 py-1 text-amber-700 hover:bg-amber-50"
            >
              <span className="hidden sm:inline">Show Welcome</span>
              <Info className="w-3 h-3 sm:hidden" />
            </button>
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="demo-helper-toggle text-amber-600 hover:text-amber-800 transition-colors bg-white border border-amber-200 rounded-full w-6 h-6 flex items-center justify-center"
              aria-label="Toggle demo helper"
            >
              {isOpen ? <X className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="p-4 animate-fade-in demo-helper-panel">
            <div className="flex space-x-4 mb-3">
              <button
                className={`text-sm rounded-md px-3 py-1.5 ${
                  activeSection === 'profiles' 
                    ? 'bg-amber-100 text-amber-800 font-medium'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveSection('profiles')}
              >
                Sample Profiles
              </button>
              <button
                className={`text-sm rounded-md px-3 py-1.5 ${
                  activeSection === 'questions' 
                    ? 'bg-amber-100 text-amber-800 font-medium'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveSection('questions')}
              >
                Demo Questions
              </button>
              <button
                className={`text-sm rounded-md px-3 py-1.5 ${
                  activeSection === 'modes' 
                    ? 'bg-amber-100 text-amber-800 font-medium'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveSection('modes')}
              >
                Switch Modes
              </button>
            </div>

            {activeSection === 'profiles' && (
              <div className="animate-fade-in">
                <p className="text-xs text-gray-500 mb-3">Click a profile to instantly load demo data:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {sampleUserProfiles.map((profile, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded p-3 hover:border-amber-300 hover:bg-amber-50 transition-all cursor-pointer text-sm"
                      onClick={() => loadUserProfile(index)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-900">{profile.name}</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                          profile.riskTolerance === 'Low' ? 'bg-green-100 text-green-800' :
                          profile.riskTolerance === 'Medium' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {profile.riskTolerance}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-xs">
                        <div>Age: <span className="text-gray-700">{profile.age}</span></div>
                        <div>Retire: <span className="text-gray-700">{profile.retirementAge}</span></div>
                        <div>Savings: <span className="text-gray-700">${(profile.currentSavings/1000).toFixed(0)}k</span></div>
                        <div>Income: <span className="text-gray-700">${(profile.annualIncome/1000).toFixed(0)}k</span></div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-500 line-clamp-2">{profile.desiredLifestyle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeSection === 'questions' && (
              <div className="animate-fade-in">
                <p className="text-xs text-gray-500 mb-3">Click a question to copy to clipboard and auto-fill in chat:</p>
                <div className="space-y-2">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="text-xs font-medium text-blue-700 mb-2 uppercase tracking-wider">Questions for {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h4>
                    <div className="space-y-1.5">
                      {relevantQuestions.map((question, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-2 rounded ${
                            copiedQuestion === question 
                              ? 'bg-green-50 border border-green-200' 
                              : 'bg-white hover:bg-gray-50 border border-gray-100'
                          } cursor-pointer transition-all duration-200`}
                          onClick={() => handleQuestionClick(question)}
                        >
                          <span className="text-xs text-gray-700 flex-1 mr-2">{question}</span>
                          <button className={`flex items-center justify-center rounded-full w-6 h-6 ${
                            copiedQuestion === question
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}>
                            {copiedQuestion === question ? (
                              <Check className="h-3.5 w-3.5" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Popular questions from other sections */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">Popular Questions</h4>
                    <div className="space-y-1.5">
                      {commonFollowUpQuestions.slice(0, 3).map((item, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-2 rounded ${
                            copiedQuestion === item.question 
                              ? 'bg-green-50 border border-green-200' 
                              : 'bg-white hover:bg-gray-50 border border-gray-100'
                          } cursor-pointer transition-all duration-200`}
                          onClick={() => handleQuestionClick(item.question)}
                        >
                          <span className="text-xs text-gray-700 flex-1 mr-2">{item.question}</span>
                          <button className={`flex items-center justify-center rounded-full w-6 h-6 ${
                            copiedQuestion === item.question
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}>
                            {copiedQuestion === item.question ? (
                              <Check className="h-3.5 w-3.5" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeSection === 'modes' && (
              <div className="animate-fade-in">
                <p className="text-xs text-gray-500 mb-3">Switch between application modes:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      mode === 'customer' 
                        ? 'border-blue-300 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                    }`}
                    onClick={() => switchMode('customer')}
                  >
                    <div className="flex items-center mb-2">
                      <Users className="h-4 w-4 text-blue-600 mr-2" />
                      <h4 className="font-medium text-gray-900">Customer Mode</h4>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      View the application as an end-user completing the retirement planning process.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        className="text-xs bg-white border border-gray-200 rounded px-1.5 py-0.5 hover:bg-blue-50"
                        onClick={(e) => { e.stopPropagation(); setActiveTab('plan'); switchMode('customer'); }}
                      >
                        Questionnaire
                      </button>
                      <button 
                        className="text-xs bg-white border border-gray-200 rounded px-1.5 py-0.5 hover:bg-blue-50"
                        onClick={(e) => { e.stopPropagation(); setActiveTab('explore'); switchMode('customer'); }}
                      >
                        Portfolio Options
                      </button>
                      <button 
                        className="text-xs bg-white border border-gray-200 rounded px-1.5 py-0.5 hover:bg-blue-50"
                        onClick={(e) => { e.stopPropagation(); setActiveTab('compare'); switchMode('customer'); }}
                      >
                        Compare
                      </button>
                    </div>
                  </div>
                  
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      mode === 'advisor' 
                        ? 'border-purple-300 bg-purple-50' 
                        : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50'
                    }`}
                    onClick={() => switchMode('advisor')}
                  >
                    <div className="flex items-center mb-2">
                      <UserCog className="h-4 w-4 text-purple-600 mr-2" />
                      <h4 className="font-medium text-gray-900">Advisor Mode</h4>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      View the application as a financial advisor working with clients.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        className="text-xs bg-white border border-gray-200 rounded px-1.5 py-0.5 hover:bg-purple-50"
                        onClick={(e) => { e.stopPropagation(); setActiveTab('plan'); switchMode('advisor'); }}
                      >
                        Client Insights
                      </button>
                      <button 
                        className="text-xs bg-white border border-gray-200 rounded px-1.5 py-0.5 hover:bg-purple-50"
                        onClick={(e) => { e.stopPropagation(); setActiveTab('explore'); switchMode('advisor'); }}
                      >
                        Customize Portfolios
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default IntegratedDemoHelper;