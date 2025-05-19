import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
  Lightbulb, 
  Play, 
  ChevronDown, 
  UserCog, 
  Users, 
  X, 
  Sparkles,
  Beaker
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

const DemoPanel: React.FC = () => {
  const { 
    mode, 
    setMode, 
    setActiveTab, 
    setRetirementData, 
    setShowWelcomeModal 
  } = useAppContext();
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('profiles');
  
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
    
    setIsOpen(false);
  };
  
  const handleQuestionClick = (question: string) => {
    // Copy the question to clipboard
    navigator.clipboard.writeText(question)
      .then(() => {
        // Show toast or notification that text was copied
        alert(`Copied to clipboard: "${question}"\n\nPaste this into the chat input to simulate a demo question.`);
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
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
    
    setIsOpen(false);
  };
  
  return (
    <>
      <button
        className="fixed bottom-4 right-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full p-3 shadow-lg z-50 flex items-center justify-center"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open demo panel"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Beaker className="h-6 w-6" />
        )}
      </button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-end justify-end p-4 sm:items-center sm:justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 bg-yellow-50 border-b border-yellow-100 flex justify-between items-center">
              <div className="flex items-center">
                <Sparkles className="h-5 w-5 text-yellow-600 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">RetireWise Demo Helper</h2>
              </div>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex space-x-2">
                <button
                  className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                    activeSection === 'profiles'
                      ? 'bg-white shadow-sm border border-gray-200 text-gray-900'
                      : 'bg-transparent text-gray-600 hover:text-gray-900 hover:bg-white'
                  }`}
                  onClick={() => setActiveSection('profiles')}
                >
                  User Profiles
                </button>
                <button
                  className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                    activeSection === 'questions'
                      ? 'bg-white shadow-sm border border-gray-200 text-gray-900'
                      : 'bg-transparent text-gray-600 hover:text-gray-900 hover:bg-white'
                  }`}
                  onClick={() => setActiveSection('questions')}
                >
                  Demo Questions
                </button>
                <button
                  className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                    activeSection === 'modes'
                      ? 'bg-white shadow-sm border border-gray-200 text-gray-900'
                      : 'bg-transparent text-gray-600 hover:text-gray-900 hover:bg-white'
                  }`}
                  onClick={() => setActiveSection('modes')}
                >
                  Modes & Views
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {activeSection === 'profiles' && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Sample User Profiles</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Click on a profile to instantly load a sample user for demonstration purposes.
                    This will populate all fields and generate portfolio recommendations.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sampleUserProfiles.map((profile, index) => (
                      <div 
                        key={index}
                        className="border border-gray-200 rounded-lg p-4 hover:border-yellow-300 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => loadUserProfile(index)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">{profile.name}</h4>
                          <button
                            className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              loadUserProfile(index);
                            }}
                          >
                            Load
                          </button>
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                          <p>Age: <span className="text-gray-700">{profile.age}</span></p>
                          <p>Retirement Age: <span className="text-gray-700">{profile.retirementAge}</span></p>
                          <p>Savings: <span className="text-gray-700">${profile.currentSavings.toLocaleString()}</span></p>
                          <p>Income: <span className="text-gray-700">${profile.annualIncome.toLocaleString()}/yr</span></p>
                          <p>Risk Tolerance: <span className="text-gray-700">{profile.riskTolerance}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeSection === 'questions' && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Demo Questions</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Click on any question to copy it to your clipboard. You can then paste it into the appropriate chat input
                    to simulate a user or advisor inquiry.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-blue-700">Portfolio Questions</h4>
                        <span className="text-xs text-gray-500">For customer - Explore Options tab</span>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="space-y-1">
                          {portfolioQuestions.map((q, index) => (
                            <div 
                              key={index}
                              className="text-sm px-3 py-2 rounded-lg hover:bg-white cursor-pointer flex"
                              onClick={() => handleQuestionClick(q)}
                            >
                              <span className="flex-1">{q}</span>
                              <button className="text-gray-400 hover:text-blue-600">
                                <Play className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-purple-700">Advisor Customization Requests</h4>
                        <span className="text-xs text-gray-500">For advisor - Customize Portfolios tab</span>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="space-y-1">
                          {advisorRequests.map((r, index) => (
                            <div 
                              key={index}
                              className="text-sm px-3 py-2 rounded-lg hover:bg-white cursor-pointer flex"
                              onClick={() => handleQuestionClick(r)}
                            >
                              <span className="flex-1">{r}</span>
                              <button className="text-gray-400 hover:text-purple-600">
                                <Play className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-amber-700">Tax Calculator Questions</h4>
                        <span className="text-xs text-gray-500">For customer - Tax Calculator tab</span>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-3">
                        <div className="space-y-1">
                          {taxQuestions.map((q, index) => (
                            <div 
                              key={index}
                              className="text-sm px-3 py-2 rounded-lg hover:bg-white cursor-pointer flex"
                              onClick={() => handleQuestionClick(q)}
                            >
                              <span className="flex-1">{q}</span>
                              <button className="text-gray-400 hover:text-amber-600">
                                <Play className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-green-700">Social Security Questions</h4>
                        <span className="text-xs text-gray-500">For customer - Social Security tab</span>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="space-y-1">
                          {socialSecurityQuestions.map((q, index) => (
                            <div 
                              key={index}
                              className="text-sm px-3 py-2 rounded-lg hover:bg-white cursor-pointer flex"
                              onClick={() => handleQuestionClick(q)}
                            >
                              <span className="flex-1">{q}</span>
                              <button className="text-gray-400 hover:text-green-600">
                                <Play className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-blue-700">Contribution Calculator Questions</h4>
                        <span className="text-xs text-gray-500">For customer - Contribution Calculator tab</span>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="space-y-1">
                          {contributionQuestions.map((q, index) => (
                            <div 
                              key={index}
                              className="text-sm px-3 py-2 rounded-lg hover:bg-white cursor-pointer flex"
                              onClick={() => handleQuestionClick(q)}
                            >
                              <span className="flex-1">{q}</span>
                              <button className="text-gray-400 hover:text-blue-600">
                                <Play className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-indigo-700">ETF Questions</h4>
                        <span className="text-xs text-gray-500">For advisor - ETF Recommendations tab</span>
                      </div>
                      <div className="bg-indigo-50 rounded-lg p-3">
                        <div className="space-y-1">
                          {etfQuestions.map((q, index) => (
                            <div 
                              key={index}
                              className="text-sm px-3 py-2 rounded-lg hover:bg-white cursor-pointer flex"
                              onClick={() => handleQuestionClick(q)}
                            >
                              <span className="flex-1">{q}</span>
                              <button className="text-gray-400 hover:text-indigo-600">
                                <Play className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-purple-700">Cost of Delay Questions</h4>
                        <span className="text-xs text-gray-500">For customer - Cost of Delay tab</span>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="space-y-1">
                          {delayQuestions.map((q, index) => (
                            <div 
                              key={index}
                              className="text-sm px-3 py-2 rounded-lg hover:bg-white cursor-pointer flex"
                              onClick={() => handleQuestionClick(q)}
                            >
                              <span className="flex-1">{q}</span>
                              <button className="text-gray-400 hover:text-purple-600">
                                <Play className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-700">Common Follow-up Questions</h4>
                        <span className="text-xs text-gray-500">For any discussion</span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="space-y-1">
                          {commonFollowUpQuestions.map((item, index) => (
                            <div key={index} className="text-sm px-3 py-2 rounded-lg hover:bg-white">
                              <div 
                                className="cursor-pointer flex mb-1"
                                onClick={() => handleQuestionClick(item.question)}
                              >
                                <span className="flex-1 font-medium">{item.question}</span>
                                <button className="text-gray-400 hover:text-blue-600">
                                  <Play className="h-4 w-4" />
                                </button>
                              </div>
                              <p className="text-xs text-gray-600">{item.answer}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeSection === 'modes' && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Application Modes & Views</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Switch between modes and navigate to specific screens for your demonstration.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          mode === 'customer' 
                            ? 'border-blue-300 bg-blue-50' 
                            : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                        }`}
                        onClick={() => switchMode('customer')}
                      >
                        <div className="flex items-center mb-3">
                          <Users className="h-5 w-5 text-blue-600 mr-2" />
                          <h4 className="font-medium text-gray-900">Customer Mode</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          View the application as an end-user completing the retirement planning process.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button 
                            className="text-xs bg-white border border-gray-200 rounded px-2 py-1 hover:bg-blue-50"
                            onClick={(e) => { e.stopPropagation(); setActiveTab('plan'); switchMode('customer'); }}
                          >
                            Questionnaire
                          </button>
                          <button 
                            className="text-xs bg-white border border-gray-200 rounded px-2 py-1 hover:bg-blue-50"
                            onClick={(e) => { e.stopPropagation(); setActiveTab('explore'); switchMode('customer'); }}
                          >
                            Portfolio Options
                          </button>
                          <button 
                            className="text-xs bg-white border border-gray-200 rounded px-2 py-1 hover:bg-blue-50"
                            onClick={(e) => { e.stopPropagation(); setActiveTab('compare'); switchMode('customer'); }}
                          >
                            Comparison Tool
                          </button>
                          <button 
                            className="text-xs bg-white border border-gray-200 rounded px-2 py-1 hover:bg-blue-50"
                            onClick={(e) => { e.stopPropagation(); setActiveTab('tax'); switchMode('customer'); }}
                          >
                            Tax Calculator
                          </button>
                          <button 
                            className="text-xs bg-white border border-gray-200 rounded px-2 py-1 hover:bg-blue-50"
                            onClick={(e) => { e.stopPropagation(); setActiveTab('social'); switchMode('customer'); }}
                          >
                            Social Security
                          </button>
                          <button 
                            className="text-xs bg-white border border-gray-200 rounded px-2 py-1 hover:bg-blue-50"
                            onClick={(e) => { e.stopPropagation(); setActiveTab('contribution'); switchMode('customer'); }}
                          >
                            Contribution Calc
                          </button>
                          <button 
                            className="text-xs bg-white border border-gray-200 rounded px-2 py-1 hover:bg-blue-50"
                            onClick={(e) => { e.stopPropagation(); setActiveTab('delay'); switchMode('customer'); }}
                          >
                            Delay Calculator
                          </button>
                          <button 
                            className="text-xs bg-white border border-gray-200 rounded px-2 py-1 hover:bg-blue-50"
                            onClick={(e) => { e.stopPropagation(); setActiveTab('report'); switchMode('customer'); }}
                          >
                            Report
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
                        <div className="flex items-center mb-3">
                          <UserCog className="h-5 w-5 text-purple-600 mr-2" />
                          <h4 className="font-medium text-gray-900">Advisor Mode</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          View the application as a financial advisor working with clients.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button 
                            className="text-xs bg-white border border-gray-200 rounded px-2 py-1 hover:bg-purple-50"
                            onClick={(e) => { e.stopPropagation(); setActiveTab('plan'); switchMode('advisor'); }}
                          >
                            Client Insights
                          </button>
                          <button 
                            className="text-xs bg-white border border-gray-200 rounded px-2 py-1 hover:bg-purple-50"
                            onClick={(e) => { e.stopPropagation(); setActiveTab('explore'); switchMode('advisor'); }}
                          >
                            Customize Portfolios
                          </button>
                          <button 
                            className="text-xs bg-white border border-gray-200 rounded px-2 py-1 hover:bg-purple-50"
                            onClick={(e) => { e.stopPropagation(); setActiveTab('etf'); switchMode('advisor'); }}
                          >
                            ETF Recommendations
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      onClick={() => setShowWelcomeModal(true)}
                    >
                      <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
                      Show Welcome Modal Again
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">Demo Mode Active</h3>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>
                      This panel helps you load sample data and see suggested questions for demonstrating the app's capabilities.
                      Use the sample user profiles to quickly populate the app with realistic retirement scenarios.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DemoPanel;