export type User = {
  name: string;
  policyNumber: string;
};

export type ClaimType = {
  id: string;
  name: string;
  description: string;
};

export type ClaimData = {
  policyNumber: string;
  policyHolder: string;
  policyType: string;
  claimType: string;
  claimReason: string;
  dateOfIncident?: Date;
  beneficiaryName?: string;
  beneficiaryRelation?: string;
  beneficiaryContact?: string;
  additionalInfo?: string;
};

export type ClaimStatus = 'Not Started' | 'Documents Pending' | 'In Review' | 'Additional Info Required' | 'Approved' | 'Paid' | 'Denied';

export interface Message {
  id: string;
  sender: 'user' | 'agent';
  content: string;
  timestamp: Date;
  agentType?: 'claims-assistant' | 'document-assistant' | 'form-assistant' | 'status-assistant' | 'escalation-assistant';
}

export interface ChatThread {
  id: string;
  messages: Message[];
}

export type DocumentType = 'Death Certificate' | 'Claim Form' | 'ID Proof' | 'Medical Records' | 'Power of Attorney' | 'Other';

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  uploadDate: Date;
  size: number;
  status: 'Uploaded' | 'Verified' | 'Rejected';
  fileUrl?: string;
}