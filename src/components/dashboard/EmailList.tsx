import { Star } from "lucide-react";
import type { Email } from "../../types/email";

interface EmailListProps {
  emails: Email[];
  activeTab: "scheduled" | "sent";
  onSelect: (email: Email) => void;
}

export default function EmailList({
  emails,
  activeTab,
  onSelect,
}: EmailListProps) {
  if (emails.length === 0) {
    return <div className="empty-state">No {activeTab} emails found.</div>;
  }

  return (
    <div className="email-list">
      {emails.map((email) => {
        const isFailed = email.status === "failed";
        const isSent = email.status === "sent";
        const rawDate =
          activeTab === "sent" && email.sent_at
            ? email.sent_at
            : email.scheduled_at;
        const displayDate = rawDate ? new Date(rawDate).toLocaleString() : "";

        const statusLabel = isSent
          ? "Sent"
          : isFailed
          ? "Failed"
          : email.status === "processing"
          ? "Processing"
          : "Scheduled";

        const snippet = email.body ? email.body.replace(/<[^>]*>/g, "").trim() : "";

        return (
          <button
            className="email-row"
            key={email.id}
            onClick={() => onSelect(email)}
          >
            <div className="email-recipient">To: {email.recipient}</div>

            <span
              className={`status-pill ${isSent ? "sent" : ""} ${
                isFailed ? "failed" : ""
              }`}
            >
              {statusLabel}
            </span>

            <div className="email-preview">
              <strong>{email.subject}</strong>
              {snippet && <span> — {snippet}</span>}
            </div>

            {displayDate && <span className="email-date">{displayDate}</span>}

            <Star size={15} className="star-icon" />
          </button>
        );
      })}
    </div>
  );
}
