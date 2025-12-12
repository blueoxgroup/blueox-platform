export type UserPath = 
  | 'student_university'
  | 'student_job'
  | 'worker_job'
  | 'company';

export interface ChatChoice {
  id: string;
  label: string;
  value: string;
  description?: string;
}

export interface ConversationMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
  choices?: ChatChoice[];
  inputType?: 'text' | 'select' | 'date' | 'file' | 'multiselect' | 'number';
  inputPlaceholder?: string;
  inputOptions?: string[];
  field?: string;
}

export interface ConversationStep {
  id: string;
  question: string;
  inputType: 'text' | 'select' | 'date' | 'file' | 'multiselect' | 'number' | 'choices';
  field: string;
  choices?: ChatChoice[];
  inputOptions?: string[];
  placeholder?: string;
  validation?: (value: string) => boolean;
  nextStep?: string | ((data: Record<string, unknown>) => string);
}

export interface FormField {
  field: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'file';
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  helpLink?: string;
}

export interface PathConfig {
  id: UserPath | string;
  name: string;
  steps: ConversationStep[];
  formFields?: FormField[];
  showJobMatching?: boolean;
  redirectToWhatsApp?: boolean;
}

export interface CollectedData {
  [key: string]: unknown;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  type: string;
  skills: string[];
  description: string;
}

export interface ChatbotState {
  messages: ConversationMessage[];
  isTyping: boolean;
  userPath: UserPath | null;
  currentStepIndex: number;
  collectedData: CollectedData;
  isComplete: boolean;
  sessionId: string;
}
