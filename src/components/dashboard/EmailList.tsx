import { Star, ExternalLink, Trash2 } from "lucide-react";
import type { Email } from "../../types/email";

interface EmailListProps {
  emails: Email[];
  activeTab: "scheduled" | "sent";
  onSelect: (email: Email) => void;
  onCancel?: (id: number) => void;
}

export default function EmailList({
  emails,
  activeTab,
  onSelect,
  onCancel,
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
          <div
            className="email-row"
            key={email.id}
            onClick={() => onSelect(email)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSelect(email);
            }}
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

            {/* Direct link to preview rendered email on Ethereal webmail */}
            {isSent && email.ethereal_url && (
              <a
                href={email.ethereal_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ethereal-tag"
                onClick={(e) => e.stopPropagation()}
                title="Open rendered email in Ethereal webmail"
              >
                <ExternalLink size={12} />
                <span>Ethereal</span>
              </a>
            )}

            {/* Cancel scheduled email button */}
            {activeTab === "scheduled" && onCancel && (
              <button
                type="button"
                className="cancel-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel(email.id);
                }}
                title="Cancel scheduled email"
              >
                <Trash2 size={14} />
              </button>
            )}

            <Star size={15} className="star-icon" />
          </div>
        );
      })}
    </div>
  );
}
