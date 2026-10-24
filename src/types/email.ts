export interface Email {
  id: number;
  recipient: string;
  sender: string;
  subject: string;
  body: string;
  status: string;
  scheduled_at: string;
  sent_at?: string | null;
  attachments?: string | {
  filename: string;
  path: string;
  mimetype: string;
}[] | null;
}