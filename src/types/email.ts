export interface Email {
  id: number;
  recipient: string;
  sender: string;
  subject: string;
  body: string;
  status: "scheduled" | "processing" | "sent" | "failed";
  scheduled_at: string;
  sent_at?: string | null;
  created_at?: string;
  ethereal_url?: string | null;
  attachments?:
    | string
    | {
        filename: string;
        path?: string;
        mimetype: string;
      }[]
    | null;
}
