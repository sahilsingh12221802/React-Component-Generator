// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  isActive: boolean;
  lastLogin: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Session types
export interface Message {
  _id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  type?: 'text' | 'image';
  fileName?: string;
  component?: Component;
  metadata?: Record<string, any>;
}

export interface Component {
  jsx: string;
  css: string;
  metadata?: Record<string, any>;
  version: number;
}

export interface Session {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  isActive: boolean;
  messages: Message[];
  currentComponent?: Component;
  componentHistory: Component[];
  settings: {
    theme: 'light' | 'dark';
    autoSave: boolean;
    autoSaveInterval: number;
  };
  lastActivity: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// AI types
export interface AIGenerationRequest {
  prompt: string;
  sessionId?: string;
  context?: Record<string, any>;
}

export interface AIGenerationResponse {
  message: string;
  component: Component;
}

export interface AIStreamChunk {
  chunk?: string;
  done: boolean;
  result?: Component;
  error?: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

// Export types
export interface ExportRequest {
  sessionId: string;
  componentName?: string;
}

export interface ExportCodeRequest {
  sessionId: string;
  format?: 'full' | 'jsx' | 'css';
}

export interface ExportCodeResponse {
  code: string;
  format: string;
  sessionTitle: string;
  timestamp: string;
}

// UI types
export interface PropertyEditorProps {
  element: HTMLElement;
  onUpdate: (properties: Record<string, any>) => void;
}

export interface ComponentPreviewProps {
  jsx: string;
  css: string;
  onElementClick?: (element: HTMLElement) => void;
}

export interface ChatMessageProps {
  message: Message;
  onSuggestionClick?: (suggestion: string) => void;
}

// State types
export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isGenerating: boolean;
  theme: 'light' | 'dark';
  currentSession: Session | null;
  sessions: Session[];
  error: string | null;
}

export interface ChatState {
  messages: Message[];
  isGenerating: boolean;
  selectedElement: HTMLElement | null;
  propertyPanel: {
    isOpen: boolean;
    element: HTMLElement | null;
  };
}

export interface ComponentState {
  currentComponent: Component;
  history: Component[];
  isEditing: boolean;
  selectedTab: 'preview' | 'jsx' | 'css';
}

// API types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Socket types
export interface SocketEvents {
  'join-session': (sessionId: string) => void;
  'message-added': (data: { sessionId: string; message: Message }) => void;
  'component-updated': (data: { sessionId: string; component: Component }) => void;
  'component-generated': (data: { sessionId: string; component: Component; message: Message }) => void;
  'component-refined': (data: { sessionId: string; component: Component; message: Message }) => void;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio';
  placeholder?: string;
  required?: boolean;
  validation?: any;
  options?: { label: string; value: any }[];
}

// Theme types
export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  };
}

// Validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>; 