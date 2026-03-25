export interface LogEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  location: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
