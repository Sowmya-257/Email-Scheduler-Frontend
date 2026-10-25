import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Search, Filter, RefreshCw } from "lucide-react";

import { auth } from "../firebase";
import Sidebar from "../components/layout/Sidebar";
import EmailList from "../components/dashboard/EmailList";
import { emailService } from "../services/emailService";
import type { Email } from "../types/email";

type Tab = "scheduled" | "sent";

export default function DashboardPage() {
  const navigate = useNavigate();

  const [accountEmail, setAccountEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [authLoading, setAuthLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<Tab>("scheduled");
  const [emails, setEmails] = useState<Email[]>([]);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [sentCount, setSentCount] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Authenticate Firebase user session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setAuthLoading(false);
        navigate("/", { replace: true });
        return;
      }

      setAccountEmail(user.email || "");
      setDisplayName(user.displayName || "");
      setAuthLoading(false);
    });

    return unsubscribe;
  }, [navigate]);

  // Load scheduled and sent emails for the logged-in sender
  const loadEmails = useCallback(
    async (tab: Tab, showSpinner = true) => {
      if (showSpinner) {
        setLoading(true);
      }
      setError("");

      try {
        const [scheduled, sent] = await Promise.all([
          emailService.getScheduled(accountEmail),
          emailService.getSent(accountEmail),
        ]);

        setScheduledCount(scheduled.length);
        setSentCount(sent.length);

        setEmails(tab === "scheduled" ? scheduled : sent);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load email records."
        );
      } finally {
        if (showSpinner) {
          setLoading(false);
        }
      }
    },
    [accountEmail]
  );

  // Initial load when user authentication is confirmed
  useEffect(() => {
    if (!authLoading && accountEmail) {
      void loadEmails(activeTab, true);
    }
  }, [authLoading, accountEmail, activeTab, loadEmails]);

  // Live auto-polling every 6 seconds to update job status without manual refresh
  useEffect(() => {
    if (authLoading || !accountEmail) return;

    const interval = setInterval(() => {
      void loadEmails(activeTab, false);
    }, 6000);

    return () => clearInterval(interval);
  }, [authLoading, accountEmail, activeTab, loadEmails]);

  // Cancel and unschedule an email
  async function handleCancelEmail(id: number) {
    if (!window.confirm("Are you sure you want to cancel this scheduled email?")) {
      return;
    }

    try {
      await emailService.cancelEmail(id);
      void loadEmails(activeTab, false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to cancel email.");
    }
  }

  // Sign out user and redirect to login
  async function handleLogout() {
    await signOut(auth);
    navigate("/", { replace: true });
  }

  // Filter emails by search keyword
  const filteredEmails = emails.filter((email) =>
    `${email.recipient} ${email.subject} ${email.body}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (authLoading) {
    return (
      <main className="dashboard">
        <p className="dashboard-message">Verifying authentication...</p>
      </main>
    );
  }

  if (!accountEmail) {
    return null;
  }

  return (
    <main className="dashboard">
      <Sidebar
        email={accountEmail}
        displayName={displayName}
        activeTab={activeTab}
        scheduledCount={scheduledCount}
        sentCount={sentCount}
        onTabChange={setActiveTab}
        onCompose={() =>
          navigate("/compose", {
            state: { email: accountEmail },
          })
        }
        onLogout={handleLogout}
      />

      <section className="inbox">
        <header className="inbox-toolbar">
          <div className="search-box">
            <Search size={16} />
            <input
              placeholder="Search emails..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <button className="icon-button" title="Filter options">
            <Filter size={16} />
          </button>

          <button
            className="icon-button"
            title="Refresh list"
            onClick={() => void loadEmails(activeTab, true)}
          >
            <RefreshCw size={15} />
          </button>
        </header>

        {loading ? (
          <p className="dashboard-message">Loading emails...</p>
        ) : error ? (
          <div className="dashboard-message">
            <p>{error}</p>
            <button onClick={() => void loadEmails(activeTab, true)}>
              Try again
            </button>
          </div>
        ) : (
          <EmailList
            emails={filteredEmails}
            activeTab={activeTab}
            onSelect={(email) =>
              navigate(`/email/${email.id}`, {
                state: { email, accountEmail },
              })
            }
            onCancel={handleCancelEmail}
          />
        )}
      </section>
    </main>
  );
}
