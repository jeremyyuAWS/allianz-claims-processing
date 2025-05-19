import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Phone, Mail, MessageSquare, Clock, ArrowRight, Clock8, FileText, AlertTriangle, HelpCircle, Search, ChevronDown, ChevronUp } from 'lucide-react';
import faqAnswers from '../../data/faq_answers.json';

const ContactSupport: React.FC = () => {
  const { claimData, activeTab, addMessageToChat } = useAppContext();
  const [contactMethod, setContactMethod] = useState<'phone' | 'email' | 'chat' | null>(null);
  const [availabilityStatus, setAvailabilityStatus] = useState<'available' | 'busy' | 'closed'>('available');
  const [waitTime, setWaitTime] = useState<number>(0);
  const [callbackSelected, setCallbackSelected] = useState(false);
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackRequested, setCallbackRequested] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [filteredFaqs, setFilteredFaqs] = useState(faqAnswers);
  
  useEffect(() => {
    // Check current time to set availability (in real app this would be based on business hours)
    const hour = new Date().getHours();
    if (hour < 8 || hour > 20) {
      setAvailabilityStatus('closed');
    } else if (hour > 17) {
      setAvailabilityStatus('busy');
      setWaitTime(15);
    } else {
      setAvailabilityStatus('available');
      setWaitTime(5);
    }
    
    // Welcome message
    setTimeout(() => {
      addMessageToChat({
        sender: 'agent',
        content: "If you need additional assistance with your claim, you can contact our support team through phone, email, or live chat. How would you like to get in touch with us?",
        agentType: 'escalation-assistant'
      });
    }, 500);
  }, [addMessageToChat]);
  
  // Filter FAQs when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFaqs(faqAnswers);
      return;
    }
    
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = faqAnswers.filter(faq => 
      faq.question.toLowerCase().includes(lowerCaseQuery) ||
      faq.answer.toLowerCase().includes(lowerCaseQuery)
    );
    
    setFilteredFaqs(filtered);
    setExpandedFaq(null);
  }, [searchQuery]);
  
  const handleContactMethodSelect = (method: 'phone' | 'email' | 'chat') => {
    setContactMethod(method);
    addMessageToChat({
      sender: 'user',
      content: `I'd like to contact support via ${method}.`
    });
    
    // Simulate agent response
    setTimeout(() => {
      let responseContent = "";
      
      switch (method) {
        case 'phone':
          responseContent = "You can reach our claims team at 1-800-555-7890. Our hours are Monday through Friday, 8 AM to 8 PM Eastern Time. Would you like us to call you back instead?";
          break;
        case 'email':
          responseContent = "You can email our claims department at claims@allianz-example.com. Please include your policy number and claim details in your message. Our team typically responds within 24-48 hours.";
          break;
        case 'chat':
          responseContent = availabilityStatus === 'available' 
            ? "I can connect you with a claims specialist right away. The current wait time is approximately 5 minutes. Would you like to proceed?" 
            : availabilityStatus === 'busy'
            ? `Our chat specialists are currently experiencing high volume. The estimated wait time is ${waitTime} minutes. Would you like to wait or try another contact method?`
            : "I'm sorry, but our live chat is currently closed. Our hours are Monday through Friday, 8 AM to 8 PM Eastern Time. Would you like to send an email instead?";
          break;
      }
      
      addMessageToChat({
        sender: 'agent',
        content: responseContent,
        agentType: 'escalation-assistant'
      });
    }, 1000);
  };
  
  const handleCallbackRequest = () => {
    if (!callbackPhone) return;
    
    setCallbackRequested(true);
    
    // Simulate confirmation message
    addMessageToChat({
      sender: 'user',
      content: `Please call me back at ${callbackPhone}.`
    });
    
    setTimeout(() => {
      addMessageToChat({
        sender: 'agent',
        content: `Thank you! We've scheduled a callback for you at ${callbackPhone}. A claims specialist will contact you within the next business day. Is there anything else you'd like me to help you with in the meantime?`,
        agentType: 'escalation-assistant'
      });
    }, 1000);
  };
  
  const handleFaqClick = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
    
    // If this is the first time clicking on an FAQ, simulate user question and agent response
    if (expandedFaq !== index) {
      const faq = filteredFaqs[index];
      
      addMessageToChat({
        sender: 'user',
        content: faq.question
      });
      
      setTimeout(() => {
        addMessageToChat({
          sender: 'agent',
          content: faq.answer,
          agentType: 'escalation-assistant'
        });
      }, 1000);
    }
  };
  
  // Check if component should display based on active tab
  if (activeTab !== 'contact') return null;
  
  // Check if claim exists
  if (!claimData) {
    return (
      <div className="flex h-full justify-center items-center p-8">
        <div className="bg-yellow-50 p-4 rounded-lg max-w-md text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-yellow-800 mb-2">No claim started</h3>
          <p className="text-yellow-700 mb-4">
            Please start a claim first before contacting support about it.
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Contact a Claims Agent</h1>
          <p className="text-gray-600">
            Get assistance with your claim from our dedicated support team.
          </p>
        </div>
        
        {/* FAQ Section - Added at the top for easy access */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
          
          <div className="mb-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search frequently asked questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            {filteredFaqs.map((faq, index) => (
              <div 
                key={index} 
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <div 
                  className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer"
                  onClick={() => handleFaqClick(index)}
                >
                  <h3 className="font-medium text-gray-900">{faq.question}</h3>
                  <div className="text-gray-500">
                    {expandedFaq === index ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>
                
                {expandedFaq === index && (
                  <div className="p-4 bg-white">
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
            
            {filteredFaqs.length === 0 && (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <HelpCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-700">No matching questions found</p>
                <p className="text-sm text-gray-500 mt-1">Try a different search term or contact us directly</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4 mb-6 flex items-start">
          <Clock className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-800 mb-1">Support Hours</h3>
            <p className="text-sm text-blue-600">
              Our claims support team is available Monday through Friday, 8 AM to 8 PM Eastern Time.
              For urgent matters outside of business hours, please call our 24/7 emergency line at 1-800-555-9999.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div 
            className={`bg-white rounded-lg shadow border p-6 cursor-pointer transition-all hover:shadow-md ${
              contactMethod === 'phone' ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-200'
            }`}
            onClick={() => handleContactMethodSelect('phone')}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Phone</h3>
              <p className="text-sm text-gray-500 mb-4">Speak directly with a claims specialist</p>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                availabilityStatus === 'available' 
                  ? 'bg-green-100 text-green-800' 
                  : availabilityStatus === 'busy'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {availabilityStatus === 'available' 
                  ? 'Available' 
                  : availabilityStatus === 'busy'
                  ? 'Busy'
                  : 'Closed'}
              </div>
            </div>
          </div>
          
          <div 
            className={`bg-white rounded-lg shadow border p-6 cursor-pointer transition-all hover:shadow-md ${
              contactMethod === 'email' ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-200'
            }`}
            onClick={() => handleContactMethodSelect('email')}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Email</h3>
              <p className="text-sm text-gray-500 mb-4">Send an email to our claims department</p>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Available
              </div>
            </div>
          </div>
          
          <div 
            className={`bg-white rounded-lg shadow border p-6 cursor-pointer transition-all hover:shadow-md ${
              contactMethod === 'chat' ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-200'
            }`}
            onClick={() => handleContactMethodSelect('chat')}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Live Chat</h3>
              <p className="text-sm text-gray-500 mb-4">Chat with a claims specialist in real-time</p>
              <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                availabilityStatus === 'available' 
                  ? 'bg-green-100 text-green-800' 
                  : availabilityStatus === 'busy'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {availabilityStatus === 'available' 
                  ? 'Available Now' 
                  : availabilityStatus === 'busy'
                  ? `${waitTime} min wait`
                  : 'Closed'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Phone Contact Details */}
        {contactMethod === 'phone' && !callbackSelected && !callbackRequested && (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Phone Contact Details</h2>
            <div className="flex items-start mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4 flex-shrink-0">
                <Phone className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Claims Department</h3>
                <p className="text-xl font-bold text-blue-700 mb-1">1-800-555-7890</p>
                <p className="text-sm text-gray-500">
                  Monday - Friday: 8 AM - 8 PM ET<br />
                  Average wait time: {waitTime} minutes
                </p>
              </div>
            </div>
            
            <div className="mb-3">
              <p className="text-sm text-gray-700 mb-3">Would you prefer a callback instead?</p>
              <button
                onClick={() => setCallbackSelected(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              >
                Request a Callback
              </button>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <Clock8 className="h-4 w-4 mr-1 text-gray-500" />
                <span>Please have your policy number ready when calling</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Callback Request Form */}
        {contactMethod === 'phone' && callbackSelected && !callbackRequested && (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Request a Callback</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Phone Number
                </label>
                <input
                  type="tel"
                  value={callbackPhone}
                  onChange={(e) => setCallbackPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Time
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  defaultValue="morning"
                >
                  <option value="morning">Morning (8 AM - 12 PM)</option>
                  <option value="afternoon">Afternoon (12 PM - 4 PM)</option>
                  <option value="evening">Evening (4 PM - 8 PM)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Callback
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  defaultValue="status"
                >
                  <option value="status">Check Claim Status</option>
                  <option value="documents">Question About Required Documents</option>
                  <option value="payment">Payment Questions</option>
                  <option value="escalation">Escalate an Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setCallbackSelected(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  Back
                </button>
                
                <button
                  onClick={handleCallbackRequest}
                  disabled={!callbackPhone}
                  className={`px-4 py-2 rounded-md shadow-sm text-white text-sm font-medium ${
                    !callbackPhone ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Request Callback
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Callback Confirmation */}
        {callbackRequested && (
          <div className="bg-green-50 rounded-lg p-6 mb-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-green-800 mb-2">Callback Requested</h3>
            <p className="text-green-700 mb-4">
              We've received your callback request. A claims specialist will contact you at {callbackPhone} within the next business day.
            </p>
            <p className="text-sm text-gray-600">
              Reference number: CB-{Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}
            </p>
          </div>
        )}
        
        {/* Email Contact Details */}
        {contactMethod === 'email' && (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Contact Details</h2>
            <div className="flex items-start mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4 flex-shrink-0">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Claims Email Address</h3>
                <p className="text-xl font-bold text-blue-700 mb-1">claims@allianz-example.com</p>
                <p className="text-sm text-gray-500">
                  Response time: 24-48 hours
                </p>
              </div>
            </div>
            
            <div className="border rounded-lg p-4 mb-4 bg-gray-50">
              <h3 className="text-sm font-medium text-gray-700 mb-2">When emailing us, please include:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                <li>Your full name</li>
                <li>Policy number: {claimData.policyNumber}</li>
                <li>Claim type: {claimData.claimType}</li>
                <li>A detailed description of your question or issue</li>
                <li>The best phone number to reach you (if applicable)</li>
              </ul>
            </div>
            
            <div className="mt-4">
              <a 
                href={`mailto:claims@allianz-example.com?subject=Claim%20Inquiry%20-%20${claimData.policyNumber}`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              >
                <Mail className="mr-2 h-4 w-4" />
                Compose Email
              </a>
            </div>
          </div>
        )}
        
        {/* Live Chat Details */}
        {contactMethod === 'chat' && (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Chat Details</h2>
            <div className="flex items-start mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4 flex-shrink-0">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Claims Chat Support</h3>
                <div className="flex items-center mb-1">
                  <div className={`w-2.5 h-2.5 rounded-full mr-2 ${
                    availabilityStatus === 'available' 
                      ? 'bg-green-500' 
                      : availabilityStatus === 'busy'
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`}></div>
                  <p className="text-sm">
                    {availabilityStatus === 'available' 
                      ? 'Available Now' 
                      : availabilityStatus === 'busy'
                      ? 'Busy'
                      : 'Closed'}
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  {availabilityStatus === 'available' 
                    ? `Current wait time: Approximately ${waitTime} minutes`
                    : availabilityStatus === 'busy'
                    ? `High volume. Wait time: Approximately ${waitTime} minutes`
                    : 'Our chat support is currently closed. Hours: Monday - Friday, 8 AM - 8 PM ET'}
                </p>
              </div>
            </div>
            
            <div className="border rounded-lg p-4 mb-4 bg-blue-50">
              <h3 className="text-sm font-medium text-blue-700 mb-2">Before starting a chat:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                <li>Please have your policy number {claimData.policyNumber} ready</li>
                <li>For security purposes, we'll need to verify your identity</li>
                <li>Be ready to provide details about your specific claim inquiry</li>
              </ul>
            </div>
            
            {availabilityStatus !== 'closed' ? (
              <div className="mt-4">
                <button 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Start Live Chat
                </button>
                {availabilityStatus === 'busy' && (
                  <p className="mt-2 text-xs text-amber-700">
                    <Clock8 className="inline-block h-3.5 w-3.5 mr-1" />
                    High volume alert - you may experience longer than usual wait times.
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-4">
                <button 
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  disabled
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Chat Unavailable
                </button>
                <p className="mt-2 text-xs text-gray-500">
                  Please try again during our business hours or use another contact method.
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Claim Summary Section */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Claim Summary</h2>
          <div className="border rounded-lg overflow-hidden mb-4">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="font-medium text-gray-700">Claim #{claimData.policyNumber}</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                <div>
                  <p className="text-xs text-gray-500">Policy Holder</p>
                  <p className="text-sm font-medium">{claimData.policyHolder}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Claim Type</p>
                  <p className="text-sm font-medium">{claimData.claimType}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-gray-500">Reason for Claim</p>
                  <p className="text-sm">{claimData.claimReason}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveTab('track')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Claim Status
            </button>
            <button
              onClick={() => {
                window.open('https://www.allianzlife.com/', '_blank');
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Visit Allianz Website
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSupport;