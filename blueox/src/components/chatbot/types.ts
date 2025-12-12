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

export interface PathConfig {
  id: UserPath;
  name: string;
  steps: ConversationStep[];
}

export interface CollectedData {
  [key: string]: unknown;
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
