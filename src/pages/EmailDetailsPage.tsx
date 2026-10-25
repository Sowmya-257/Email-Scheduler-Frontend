import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  FileText,
  ExternalLink,
} from "lucide-react";
import type { Email } from "../types/email";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/emails";

interface EmailAttachment {
  filename: string;
  path?: string;
  mimetype: string;
}

export default function EmailDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchEmail() {
      try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error("Email not found");

        const data: Email = await response.json();
        setEmail(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not load email"
        );
      } finally {
        setLoading(false);
      }
    }

    void fetchEmail();
  }, [id]);

  const goBack = () => {
    navigate("/dashboard", {
      state: {
        email: location.state?.accountEmail || email?.sender || "",
      },
    });
  };

  if (loading) {
    return <main className="details-page">Loading email...</main>;
  }

  if (error || !email) {
    return (
      <main className="details-page">
        <button className="back-button" onClick={goBack}>
          <ArrowLeft size={18} />
          Back to inbox
        </button>
        <p className="details-error">{error || "Email not found"}</p>
      </main>
    );
  }

  const isSent = email.status === "sent";
  const isFailed = email.status === "failed";

  let attachments: EmailAttachment[] = [];

  try {
    const rawAttachments = email.attachments;

    if (typeof rawAttachments === "string") {
      attachments = JSON.parse(rawAttachments);
    } else if (Array.isArray(rawAttachments)) {
      attachments = rawAttachments;
    }
  } catch {
    attachments = [];
  }

  return (
    <main className="details-page">
      <header className="details-header">
        <button className="back-button" onClick={goBack}>
          <ArrowLeft size={18} />
          Back to inbox
        </button>

        <span
          className={`details-status ${isSent ? "sent" : ""} ${
            isFailed ? "failed" : ""
          }`}
        >
          {isSent ? (
            <CheckCircle2 size={15} />
          ) : isFailed ? (
            <AlertCircle size={15} />
          ) : (
            <Clock3 size={15} />
          )}
          {email.status}
        </span>
      </header>

      <section className="details-card">
        <div className="details-subject-row">
          <h1>{email.subject || "(No subject)"}</h1>
          <span className="details-id">Email #{email.id}</span>
        </div>

        <div className="details-metadata">
          <div className="details-avatar">
            {(email.sender || "U").charAt(0).toUpperCase()}
          </div>

          <div className="details-metadata-content">
            <p>
              <strong>From</strong>
              <span>{email.sender || "Unknown sender"}</span>
            </p>
            <p>
              <strong>To</strong>
              <span>{email.recipient}</span>
            </p>
            <p>
              <strong>Status</strong>
              <span className="details-status-text">{email.status}</span>
            </p>
            <p>
              <strong>{isSent ? "Sent at" : "Scheduled at"}</strong>
              <span>
                {new Date(
                  isSent && email.sent_at
                    ? email.sent_at
                    : email.scheduled_at
                ).toLocaleString()}
              </span>
            </p>
            {isSent && email.ethereal_url && (
              <p>
                <strong>Ethereal Preview</strong>
                <span>
                  <a
                    href={email.ethereal_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#2563eb", textDecoration: "underline", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  >
                    Open in Ethereal webmail <ExternalLink size={12} />
                  </a>
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="details-divider" />

        <article className="details-body">
          {email.body ? (
            <div dangerouslySetInnerHTML={{ __html: email.body }} />
          ) : (
            "(No message content)"
          )}
        </article>

        {attachments.length > 0 && (
          <section className="email-attachments">
            <h3>
              <Paperclip size={16} />
              Attachments ({attachments.length})
            </h3>

            <div className="email-attachments-list">
              {attachments.map((file, index) => (
                <a
                  className="email-attachment-item"
                  href={`${API_URL}/${email.id}/attachments/${index}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={`${file.filename}-${index}`}
                >
                  {file.mimetype?.startsWith("image/") ? (
                    <img
                      className="attachment-thumbnail"
                      src={`${API_URL}/${email.id}/attachments/${index}`}
                      alt={file.filename}
                    />
                  ) : (
                    <FileText size={24} />
                  )}

                  <div className="attachment-file-info">
                    <strong title={file.filename}>{file.filename}</strong>
                    <small>{file.mimetype}</small>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
