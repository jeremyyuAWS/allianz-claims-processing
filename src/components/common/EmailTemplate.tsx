import React, { useState } from 'react';
import { Mail, Download, Send, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { ClaimStatus } from '../../types';

interface EmailTemplateProps {
  templateType: 'submission' | 'status_update' | 'approval' | 'additional_info' | 'payment';
  recipientName: string;
  policyNumber: string;
  claimType: string;
  claimStatus?: ClaimStatus;
  onSend?: () => void;
  onClose: () => void;
  showPreviewOnly?: boolean;
}

const EmailTemplate: React.FC<EmailTemplateProps> = ({
  templateType,
  recipientName,
  policyNumber,
  claimType,
  claimStatus,
  onSend,
  onClose,
  showPreviewOnly = false
}) => {
  const [showHtml, setShowHtml] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  
  const getTemplateData = () => {
    switch (templateType) {
      case 'submission':
        return {
          subject: `Allianz Claim Submission Confirmation - ${policyNumber}`,
          greeting: `Dear ${recipientName},`,
          body: `Thank you for submitting your ${claimType.toLowerCase()} claim. This email confirms that we have received your claim submission.

Your claim has been assigned the reference number ${policyNumber}. Our claims team will begin processing your claim and you will receive updates as your claim progresses.

Next steps:
• Our team will review your submitted documents
• You may be contacted if additional information is needed
• You can track your claim status online through our claims portal
          
The typical processing time for ${claimType.toLowerCase()} claims is 7-10 business days after all required documentation has been received.`,
          closingText: "If you have any questions, please don't hesitate to contact our claims department.",
          buttonText: "Track Your Claim",
          buttonUrl: "#track-claim"
        };
      
      case 'status_update':
        return {
          subject: `Allianz Claim Status Update - ${policyNumber}`,
          greeting: `Dear ${recipientName},`,
          body: `This is to inform you that the status of your ${claimType.toLowerCase()} claim (${policyNumber}) has been updated.

Current Status: ${claimStatus}

${getStatusUpdateMessage(claimStatus)}

You can log in to our claims portal to view detailed information about your claim status and any actions that may be required.`,
          closingText: "If you have any questions, please don't hesitate to contact our claims department.",
          buttonText: "View Claim Details",
          buttonUrl: "#view-claim"
        };
      
      case 'approval':
        return {
          subject: `Allianz Claim Approved - ${policyNumber}`,
          greeting: `Dear ${recipientName},`,
          body: `We're pleased to inform you that your ${claimType.toLowerCase()} claim (${policyNumber}) has been approved.

Payment Details:
• Payment Method: [Payment Method]
• Amount: [Payment Amount]
• Expected Delivery: Within 5-7 business days

For direct deposit, please allow 1-3 business days for the funds to appear in your account. For check payments, please allow 7-10 business days for mail delivery.

You can log in to our claims portal to view the full details of your approved claim.`,
          closingText: "Thank you for choosing Allianz. We appreciate your patience throughout this process.",
          buttonText: "View Payment Details",
          buttonUrl: "#payment-details",
          isPositive: true
        };
      
      case 'additional_info':
        return {
          subject: `Action Required: Additional Information Needed - ${policyNumber}`,
          greeting: `Dear ${recipientName},`,
          body: `We're writing regarding your ${claimType.toLowerCase()} claim (${policyNumber}). After reviewing your claim, we require additional information to continue processing.

Required Information:
• [Specific Document 1]
• [Specific Document 2]
• [Additional Details Needed]

Please log in to our claims portal to upload the requested information. Your prompt response will help us process your claim as quickly as possible.

If you have any questions about what is needed, please contact our claims department.`,
          closingText: "Thank you for your prompt attention to this matter.",
          buttonText: "Upload Documents",
          buttonUrl: "#upload-documents",
          isWarning: true
        };
      
      case 'payment':
        return {
          subject: `Allianz Claim Payment Processed - ${policyNumber}`,
          greeting: `Dear ${recipientName},`,
          body: `We're pleased to inform you that the payment for your ${claimType.toLowerCase()} claim (${policyNumber}) has been processed.

Payment Details:
• Payment Method: [Payment Method]
• Amount: [Payment Amount]
• Payment Date: [Payment Date]

For direct deposit, the funds should appear in your account within 1-3 business days. For check payments, please allow 7-10 business days for mail delivery.

This concludes the claims process for this claim. Thank you for choosing Allianz for your insurance needs.`,
          closingText: "If you have any questions about your payment, please contact our claims department.",
          buttonText: "View Payment Details",
          buttonUrl: "#payment-details",
          isPositive: true
        };
      
      default:
        return {
          subject: `Allianz Claim Information - ${policyNumber}`,
          greeting: `Dear ${recipientName},`,
          body: `This is a notification regarding your ${claimType.toLowerCase()} claim (${policyNumber}).

Please log in to our claims portal to view the most up-to-date information about your claim.`,
          closingText: "If you have any questions, please don't hesitate to contact our claims department.",
          buttonText: "View Claim Details",
          buttonUrl: "#view-claim"
        };
    }
  };
  
  // Helper function to generate status update message
  const getStatusUpdateMessage = (status?: ClaimStatus) => {
    switch (status) {
      case 'In Review':
        return "Your claim is currently under review by our claims processing team. We are working diligently to process your claim as quickly as possible.";
      case 'Additional Info Required':
        return "We need additional information to continue processing your claim. Please see the details below and provide the requested information as soon as possible.";
      case 'Approved':
        return "We're pleased to inform you that your claim has been approved. Payment processing will begin shortly.";
      case 'Paid':
        return "Your claim payment has been processed. Please see the payment details below.";
      case 'Denied':
        return "We regret to inform you that your claim has been denied. Please see the explanation below for details on the decision and your options.";
      default:
        return "Please log in to our claims portal for more details about your claim status.";
    }
  };
  
  const template = getTemplateData();
  
  const handleSend = () => {
    if (onSend) {
      setIsSending(true);
      // Simulate sending delay
      setTimeout(() => {
        setIsSending(false);
        setIsSent(true);
        onSend();
        // Automatically close after showing success
        setTimeout(onClose, 2000);
      }, 1500);
    }
  };
  
  // Generate HTML version of the email for preview
  const getHtmlVersion = () => {
    return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #003781; color: white; padding: 20px; text-align: center; }
    .logo { font-size: 24px; font-weight: bold; margin: 0; }
    .content { padding: 20px; background-color: #fff; }
    .footer { background-color: #f7f7f7; padding: 15px; text-align: center; font-size: 12px; color: #666; }
    .button { display: inline-block; background-color: #0047cc; color: white; padding: 10px 20px; 
              text-decoration: none; border-radius: 4px; margin-top: 15px; }
    .positive { background-color: #10b981; }
    .warning { background-color: #f59e0b; }
    .divider { border-top: 1px solid #eee; margin: 20px 0; }
    pre { white-space: pre-wrap; font-family: Arial, sans-serif; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo">Allianz Claims</h1>
    </div>
    <div class="content">
      <p>${template.greeting}</p>
      <pre>${template.body}</pre>
      <div class="divider"></div>
      <p>${template.closingText}</p>
      <a href="${template.buttonUrl}" class="button ${template.isPositive ? 'positive' : ''} ${template.isWarning ? 'warning' : ''}">${template.buttonText}</a>
    </div>
    <div class="footer">
      <p>This is an automated email. Please do not reply to this message.</p>
      <p>© 2023 Allianz Life Insurance Company. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-2xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Mail className="h-5 w-5 mr-2" />
          <h2 className="text-lg font-medium">Email Notification</h2>
        </div>
        {!showPreviewOnly && (
          <div className="flex space-x-2">
            <button 
              className="p-1 hover:bg-blue-700 rounded transition-colors"
              onClick={() => setShowHtml(!showHtml)}
              title={showHtml ? "Show preview" : "Show HTML"}
            >
              {showHtml ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            </button>
            <button 
              className="p-1 hover:bg-blue-700 rounded transition-colors"
              onClick={onClose}
              title="Close preview"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
      
      {/* Email Preview */}
      {!showHtml ? (
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="mb-4">
            <div className="mb-2">
              <span className="text-sm font-medium text-gray-500">From:</span>
              <span className="text-sm ml-2">claims@allianz-example.com</span>
            </div>
            <div className="mb-2">
              <span className="text-sm font-medium text-gray-500">To:</span>
              <span className="text-sm ml-2">{recipientName}</span>
            </div>
            <div className="mb-2">
              <span className="text-sm font-medium text-gray-500">Subject:</span>
              <span className="text-sm font-medium ml-2">{template.subject}</span>
            </div>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="bg-blue-600 text-white text-center py-4 rounded-t-lg mb-4">
              <h2 className="text-xl font-bold">Allianz Claims</h2>
            </div>
            
            <div className="bg-white p-4 rounded-lg">
              <p className="mb-4">{template.greeting}</p>
              <div className="whitespace-pre-line mb-4 text-sm text-gray-700">
                {template.body}
              </div>
              <hr className="my-4" />
              <p className="mb-4 text-sm text-gray-700">{template.closingText}</p>
              <div className="text-center">
                <button className={`px-4 py-2 rounded-md text-white font-medium ${
                  template.isPositive 
                    ? 'bg-green-600' 
                    : template.isWarning
                    ? 'bg-amber-500'
                    : 'bg-blue-600'
                }`}>
                  {template.buttonText}
                </button>
              </div>
            </div>
            
            <div className="bg-gray-100 text-center p-3 mt-4 rounded-b-lg text-xs text-gray-500">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>© 2023 Allianz Life Insurance Company. All rights reserved.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="font-mono text-sm bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <pre>{getHtmlVersion()}</pre>
          </div>
        </div>
      )}
      
      {/* Actions */}
      {!showPreviewOnly && (
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-between">
          <button 
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => { /* Would download email template in a real application */ }}
          >
            <Download className="h-4 w-4 mr-1.5" />
            Download
          </button>
          
          <button 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
            onClick={handleSend}
            disabled={isSending || isSent}
          >
            {isSending ? (
              <>
                <span className="animate-pulse mr-1.5">•</span>
                Sending...
              </>
            ) : isSent ? (
              <>
                <CheckCircle className="h-4 w-4 mr-1.5" />
                Sent!
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-1.5" />
                Send Email
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default EmailTemplate;