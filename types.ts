
export enum TaskStatus {
  POOL = 'POOL',
  ASSIGNED = 'ASSIGNED',
  PENDING = 'PENDING',
  ARCHIVED = 'ARCHIVED',
}

export enum WorkflowStep {
  QUALIFICATION = 'Qualification',
  ESTIMATION = 'Chiffrage',
  VALIDATION = 'Validation',
  SENT = 'Envoyé',
}

export enum SellsyStatus {
  UNKNOWN = 'UNKNOWN',
  SYNCED = 'SYNCED',
}

export interface User {
  id: string;
  name: string;
  avatar: string; // URL
  initials: string;
}

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'file';
  url: string;
  size: string;
}

export interface Message {
  id: string;
  sender: 'CLIENT' | 'AGENT';
  senderName: string;
  content: string;
  timestamp: Date;
  attachments?: Attachment[];
}

export type EventType = 'EMAIL_RECEIVED' | 'EMAIL_SENT' | 'SELLSY_SYNC' | 'STATUS_CHANGE' | 'NOTE_ADDED';

export interface TaskEvent {
  id: string;
  type: EventType;
  description: string;
  timestamp: Date;
  metadata?: any; // JSON stringified data
}

export interface Task {
  id: string; // e.g., #T-8X29
  subject: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  companyName?: string;
  status: TaskStatus;
  step: WorkflowStep;
  sellsyStatus: SellsyStatus;
  assigneeId?: string; // null if in Pool
  receivedAt: Date;
  updatedAt: Date;
  messages: Message[];
  quoteItems: QuoteItem[];
  events: TaskEvent[];
  unread: boolean;
  tags: string[]; // Nouveaux tags IA
  isZombie?: boolean; // Indicateur de ticket réveillé
}
