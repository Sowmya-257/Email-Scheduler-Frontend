import { Clock3, Send, PenLine, ChevronDown, LogOut } from "lucide-react";

interface SidebarProps {
  email: string;
  displayName?: string;
  activeTab: "scheduled" | "sent";
  scheduledCount: number;
  sentCount: number;
  onTabChange: (tab: "scheduled" | "sent") => void;
  onCompose: () => void;
  onLogout?: () => void;
}

function getInitials(name: string, email: string): string {
  const cleanedName = name.trim();

  if (cleanedName) {
    const parts = cleanedName.split(/\s+/);

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }

    return cleanedName.slice(0, 2).toUpperCase();
  }

  const username = email.split("@")[0];
  const parts = username.split(/[._\-\s]+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return username.slice(0, 2).toUpperCase() || "U";
}

export default function Sidebar({
  email,
  displayName = "",
  activeTab,
  scheduledCount,
  sentCount,
  onTabChange,
  onCompose,
  onLogout,
}: SidebarProps) {
  const initials = getInitials(displayName, email);

  return (
    <aside className="sidebar">
      <div className="brand">Email Scheduler</div>

      <div className="profile">
        <span className="avatar">{initials}</span>

        <span className="profile-text">
          <strong>{displayName || email.split("@")[0] || "User"}</strong>
          <small>{email || "user@example.com"}</small>
        </span>

        <ChevronDown size={14} />
      </div>

      <button className="compose-button" onClick={onCompose}>
        <PenLine size={15} />
        Compose
      </button>

      <p className="sidebar-label">CORE</p>

      <button
        className={`nav-item ${activeTab === "scheduled" ? "active" : ""}`}
        onClick={() => onTabChange("scheduled")}
      >
        <Clock3 size={15} />
        <span>Scheduled</span>
        <span className="nav-count">{scheduledCount}</span>
      </button>

      <button
        className={`nav-item ${activeTab === "sent" ? "active" : ""}`}
        onClick={() => onTabChange("sent")}
      >
        <Send size={15} />
        <span>Sent</span>
        <span className="nav-count">{sentCount}</span>
      </button>

      {onLogout && (
        <div className="sidebar-footer">
          <button className="nav-item logout-button" onClick={onLogout}>
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </aside>
  );
}
