import type { Email } from "../types/email";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/emails";

// Fetch emails for a specific status tab with optional sender filtering
async function fetchEmails(endpoint: "scheduled" | "sent", sender?: string): Promise<Email[]> {
  const query = sender ? `?sender=${encodeURIComponent(sender)}` : "";
  const response = await fetch(`${API_URL}/${endpoint}${query}`);

  if (!response.ok) {
    throw new Error(`Failed to load ${endpoint} emails`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : data.emails ?? [];
}

export const emailService = {
  // Get scheduled emails
  getScheduled: (sender?: string) => fetchEmails("scheduled", sender),

  // Get sent emails
  getSent: (sender?: string) => fetchEmails("sent", sender),

  // Cancel and delete a pending scheduled email
  cancelEmail: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to cancel scheduled email");
    }
  },
};
