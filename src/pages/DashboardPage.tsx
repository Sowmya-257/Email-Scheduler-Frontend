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

  // Get the currently authenticated Firebase user.
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

  // Load scheduled and sent emails.
  const loadEmails = useCallback(async (tab: Tab) => {
    setLoading(true);
    setError("");

    try {
      const [scheduled, sent] = await Promise.all([
        emailService.getScheduled(),
        emailService.getSent(),
      ]);

      setScheduledCount(scheduled.length);
      setSentCount(sent.length);

      setEmails(tab === "scheduled" ? scheduled : sent);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load emails."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && accountEmail) {
      void loadEmails(activeTab);
    }
  }, [authLoading, accountEmail, activeTab, loadEmails]);

  async function handleLogout() {
    await signOut(auth);
    navigate("/", { replace: true });
  }

  const filteredEmails = emails.filter((email) =>
    `${email.recipient} ${email.subject} ${email.body}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (authLoading) {
    return (
      <main className="dashboard">
        <p className="dashboard-message">Checking your account...</p>
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
              placeholder="Search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <button className="icon-button" title="Filter">
            <Filter size={16} />
          </button>

          <button
            className="icon-button"
            title="Refresh"
            onClick={() => void loadEmails(activeTab)}
          >
            <RefreshCw size={15} />
          </button>
        </header>

        {loading ? (
          <p className="dashboard-message">Loading emails...</p>
        ) : error ? (
          <div className="dashboard-message">
            <p>{error}</p>
            <button onClick={() => void loadEmails(activeTab)}>
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
          />
        )}
      </section>
    </main>
  );
}
