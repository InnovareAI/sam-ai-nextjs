export interface Message {
  id: string;
  content: string;
  sender: "user" | "sam";
  timestamp: Date;
  metadata?: {
    aiProcessingTime?: number;
    apiError?: string;
    fallbackUsed?: boolean;
  };
}

export interface ConversationSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  businessContext?: BusinessContext;
}

export interface BusinessContext {
  type?: string;
  targetAudience?: string;
  goals?: string[];
  challenges?: string[];
  industry?: string;
  companySize?: string;
  currentTools?: string[];
}

export interface QuickAction {
  title: string;
  description: string;
  prompt: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export interface SamStatus {
  isActive: boolean;
  currentStatus: string;
  processingStartTime?: Date;
}