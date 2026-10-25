import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock3,
  Paperclip,
  X,
  Upload,
  FileText,
} from "lucide-react";
import Button from "../components/common/Button";
import RichTextEditor from "../components/compose/RichTextEditor";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/emails";
const MAX_FILES = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function AttachmentPreview({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!file.type.startsWith("image/")) return;

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="attachment-preview-card">
      {previewUrl ? (
        <img src={previewUrl} alt={file.name} />
      ) : (
        <div className="attachment-file-icon">
          <FileText size={22} />
          <span>{file.name}</span>
        </div>
      )}

      <button
        type="button"
        className="attachment-remove"
        aria-label={`Remove ${file.name}`}
        onClick={onRemove}
      >
        <X size={15} />
      </button>
    </div>
  );
}

export default function ComposePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const sender = location.state?.email || "";

  const [recipients, setRecipients] = useState<string[]>([]);
  const [recipientInput, setRecipientInput] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [scheduleDraft, setScheduleDraft] = useState("");
  const [showSchedule, setShowSchedule] = useState(false);
  const [showAllRecipients, setShowAllRecipients] = useState(false);
  const [delaySeconds, setDelaySeconds] = useState("5");
  const [hourlyLimit, setHourlyLimit] = useState("10");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [leadCountMessage, setLeadCountMessage] = useState("");

  function addRecipients(emails: string[]) {
    setRecipients((previous) =>
      [...new Set([
        ...previous,
        ...emails.map((email) => email.trim().toLowerCase()),
      ])].filter(Boolean)
    );
  }

  async function handleRecipientList(file: File) {
    setError("");
    setLeadCountMessage("");

    if (file.size > 2 * 1024 * 1024) {
      setError("Recipient list must be smaller than 2 MB.");
      return;
    }

    try {
      const content = await file.text();
      const matches =
        content.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? [];

      if (!matches.length) {
        setError("No email addresses found in this file.");
        return;
      }

      addRecipients(matches);
      setLeadCountMessage(
        `Detected ${matches.length} email address${
          matches.length === 1 ? "" : "es"
        } from ${file.name}`
      );
    } catch {
      setError("Could not read the recipient file.");
    }
  }

  function handleFiles(selectedFiles: FileList | null) {
    if (!selectedFiles) return;

    const selected = Array.from(selectedFiles);
    const messages: string[] = [];

    setAttachments((previous) => {
      const combined = [...previous];

      for (const file of selected) {
        if (file.size > MAX_FILE_SIZE) {
          messages.push(`${file.name} exceeds the 10 MB file limit.`);
          continue;
        }

        const duplicate = combined.some(
          (item) =>
            item.name === file.name &&
            item.size === file.size &&
            item.lastModified === file.lastModified
        );

        if (duplicate) continue;

        if (combined.length >= MAX_FILES) {
          messages.push(`You can attach up to ${MAX_FILES} files.`);
          break;
        }

        combined.push(file);
      }

      return combined;
    });

    setError(messages.join(" "));
  }

  function formatLocalDateTime(date: Date) {
    return new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    ).toISOString().slice(0, 16);
  }

  function selectPreset(hour: number) {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(hour, 0, 0, 0);
    setScheduleDraft(formatLocalDateTime(date));
  }

  function selectOffsetPreset(seconds: number) {
    const date = new Date(Date.now() + seconds * 1000);
    setScheduleDraft(formatLocalDateTime(date));
  }

  async function handleSchedule(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!sender.trim()) {
        throw new Error("Please select a sender email account.");
      }

      const finalRecipients = [...new Set([
        ...recipients,
        ...(recipientInput.trim()
          ? [recipientInput.trim().toLowerCase()]
          : []),
      ])];

      if (!finalRecipients.length) {
        throw new Error("Add at least one recipient.");
      }

      if (finalRecipients.length > 500) {
        throw new Error("You can add up to 500 recipients per request.");
      }

      const invalidEmail = finalRecipients.find(
        (email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      );

      if (invalidEmail) {
        throw new Error(`Invalid email address: ${invalidEmail}`);
      }

      if (!subject.trim()) {
        throw new Error("Please enter a subject.");
      }

      const plainBody = body
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .trim();

      if (!plainBody) {
        throw new Error("Please enter an email message.");
      }

      const sendDate = new Date(scheduledAt);

      if (
        !scheduledAt ||
        Number.isNaN(sendDate.getTime()) ||
        sendDate.getTime() <= Date.now()
      ) {
        throw new Error("Please select a future date and time.");
      }

      const formData = new FormData();
      formData.append("recipients", JSON.stringify(finalRecipients));
      formData.append("subject", subject.trim());
      formData.append("body", body);
      formData.append("sender", sender);
      formData.append("scheduledAt", sendDate.toISOString());
      formData.append("delaySeconds", delaySeconds);
      formData.append("hourlyLimit", hourlyLimit);

      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      const response = await fetch(`${API_URL}/schedule`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Could not schedule emails."
        );
      }

      navigate("/dashboard", {
        state: { email: sender, refresh: true },
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="compose-page">
      <header className="compose-header">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/dashboard", { state: { email: sender } })}
        >
          <ArrowLeft size={18} />
          Compose New Email
        </button>

        <div className="compose-header-actions">
          <button
            type="button"
            className="compose-icon-button attachment-header-button"
            title="Attach files"
            aria-label="Attach files"
            onClick={() => document.getElementById("email-attachments")?.click()}
          >
            <Paperclip size={18} />
            {attachments.length > 0 && (
              <span className="attachment-count">{attachments.length}</span>
            )}
          </button>

          <button
            type="button"
            className="compose-icon-button"
            title="Schedule email"
            aria-label="Schedule email"
            onClick={() => {
              setScheduleDraft(scheduledAt || "");
              setShowSchedule(true);
            }}
          >
            <Clock3 size={18} />
          </button>

          <Button type="submit" form="compose-form" disabled={loading}>
            {loading ? "Scheduling..." : "Send Later"}
          </Button>
        </div>
      </header>

      <form
        id="compose-form"
        className="compose-form"
        onSubmit={handleSchedule}
      >
        <input
          id="email-attachments"
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          hidden
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />

        <div className="compose-row">
          <label>From</label>
          <input value={sender} readOnly placeholder="Sender email" />
        </div>

        <div className="compose-row recipient-row">
          <label>To</label>
          <div className="recipient-input-area">
            <div className="recipient-chips">
              {(showAllRecipients ? recipients : recipients.slice(0, 3)).map(
                (email) => (
                  <span className="recipient-chip" key={email}>
                    <span className="recipient-chip-email">{email}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${email}`}
                      onClick={() => {
                        setRecipients((previous) =>
                          previous.filter((item) => item !== email)
                        );
                        if (recipients.length <= 4) setShowAllRecipients(false);
                      }}
                    >
                      ×
                    </button>
                  </span>
                )
              )}

              {!showAllRecipients && recipients.length > 3 && (
                <button
                  type="button"
                  className="recipient-chip recipient-overflow"
                  onClick={() => setShowAllRecipients(true)}
                >
                  +{recipients.length - 3}
                </button>
              )}

              {showAllRecipients && recipients.length > 3 && (
                <button
                  type="button"
                  className="recipient-chip recipient-overflow"
                  onClick={() => setShowAllRecipients(false)}
                >
                  Show less
                </button>
              )}

              <input
                type="email"
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
                placeholder={recipients.length ? "" : "Add recipient email"}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    const value = recipientInput.trim().replace(/,$/, "");
                    if (value) addRecipients([value]);
                    setRecipientInput("");
                  }
                }}
                onBlur={() => {
                  const value = recipientInput.trim();
                  if (value) addRecipients([value]);
                  setRecipientInput("");
                }}
              />
            </div>

            <input
              id="recipient-list-upload"
              type="file"
              accept=".csv,.txt,text/csv,text/plain"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleRecipientList(file);
                e.target.value = "";
              }}
            />

            <button
              type="button"
              className="upload-list-button"
              onClick={() =>
                document.getElementById("recipient-list-upload")?.click()
              }
            >
              <Upload size={15} />
              Upload List
            </button>
          </div>
        </div>

        {leadCountMessage && (
          <div className="compose-row">
            <span style={{ width: 75 }} />
            <p className="recipient-count">{leadCountMessage}</p>
          </div>
        )}

        <div className="compose-row">
          <label>Subject</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            required
          />
        </div>

        <div className="compose-settings">
          <label>
            Delay between emails
            <input
              type="number"
              min="0"
              value={delaySeconds}
              onChange={(e) => setDelaySeconds(e.target.value)}
            />
            sec
          </label>

          <label>
            Hourly limit
            <input
              type="number"
              min="1"
              value={hourlyLimit}
              onChange={(e) => setHourlyLimit(e.target.value)}
            />
          </label>
        </div>

        <RichTextEditor value={body} onChange={setBody} />

        <div className="attachment-list">
          {attachments.map((file) => (
            <AttachmentPreview
              key={`${file.name}-${file.size}-${file.lastModified}`}
              file={file}
              onRemove={() =>
                setAttachments((previous) =>
                  previous.filter((item) => item !== file)
                )
              }
            />
          ))}
        </div>

        {showSchedule && (
          <div
            className="schedule-overlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setShowSchedule(false);
              }
            }}
          >
            <section
              className="schedule-popup"
              role="dialog"
              aria-modal="true"
              aria-label="Schedule email"
            >
              <h3>Send Later</h3>
              <label htmlFor="schedule-datetime">Pick date &amp; time</label>

              <input
                id="schedule-datetime"
                type="datetime-local"
                min={formatLocalDateTime(new Date())}
                value={scheduleDraft}
                onChange={(event) => setScheduleDraft(event.target.value)}
              />

              <div className="schedule-presets">
                <button type="button" onClick={() => selectOffsetPreset(30)}>
                  ⚡ In 30 Seconds (Quick Demo)
                </button>
                <button type="button" onClick={() => selectOffsetPreset(120)}>
                  ⏱ In 2 Minutes
                </button>
                <button type="button" onClick={() => selectPreset(9)}>
                  Tomorrow, 9:00 AM
                </button>
                <button type="button" onClick={() => selectPreset(15)}>
                  Tomorrow, 3:00 PM
                </button>
              </div>

              {scheduleDraft && (
                <p className="schedule-selected-time">
                  Selected: {new Date(scheduleDraft).toLocaleString()}
                </p>
              )}

              <div className="schedule-actions">
                <button type="button" onClick={() => setShowSchedule(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="schedule-done"
                  onClick={() => {
                    if (
                      !scheduleDraft ||
                      new Date(scheduleDraft).getTime() <= Date.now()
                    ) {
                      setError("Please select a future date and time.");
                      return;
                    }

                    setScheduledAt(scheduleDraft);
                    setError("");
                    setShowSchedule(false);
                  }}
                >
                  Done
                </button>
              </div>
            </section>
          </div>
        )}

        {error && <p className="form-error">{error}</p>}
      </form>
    </main>
  );
}
