
import type { Email } from "../types/email";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/emails";

async function fetchEmails(endpoint: "scheduled" | "sent"): Promise<Email[]> {
  const response = await fetch(`${API_URL}/${endpoint}`);

  if (!response.ok) {
    throw new Error(`Failed to load ${endpoint} emails`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : data.emails ?? [];
}

export const emailService = {
  getScheduled: () => fetchEmails("scheduled"),
  getSent: () => fetchEmails("sent"),
};
