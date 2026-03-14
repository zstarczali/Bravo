import { useState, useEffect } from 'react';
import EmailList from './components/EmailList';
import EmailDetail from './components/EmailDetail';
import AddEmailForm from './components/AddEmailForm';
import Login from './components/Login';
import Register from './components/Register';
import PhraseManager from './components/PhraseManager';
import { IEmail } from './types';
import { IUser } from './types/auth';
import './App.css';

function App() {
  const [emails, setEmails] = useState<IEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<IEmail | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<IUser | null>(null);
  const [showLogin, setShowLogin] = useState(true);
  const [showPhraseManager, setShowPhraseManager] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  );
  const [showMigrationButton, setShowMigrationButton] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    if (token) {
      fetchEmails();
    }
  }, [token]);

  const fetchEmails = async () => {
    try {
      const response = await fetch('/api/emails', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 401) {
        handleLogout();
        return;
      }
      
      const data = await response.json();
      setEmails(data);
    } catch (error) {
      console.error('Error fetching emails:', error);
    }
  };

  const handleLogin = (newToken: string, newUser: IUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const handleRegister = (newToken: string, newUser: IUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setEmails([]);
    setSelectedEmail(null);
  };

  // Show login/register if not authenticated
  if (!token) {
    return showLogin ? (
      <Login 
        onLogin={handleLogin}
        onSwitchToRegister={() => setShowLogin(false)}
      />
    ) : (
      <Register
        onRegister={handleRegister}
        onSwitchToLogin={() => setShowLogin(true)}
      />
    );
  }

  const handleEmailSelect = (email: IEmail) => {
    setSelectedEmail(email);
  };

  const handleEmailAdded = () => {
    setShowAddForm(false);
    fetchEmails();
  };

  const handleMigration = async () => {
    if (!confirm('Migrate existing employees to your account? This will assign all employees without an owner to you.')) {
      return;
    }

    try {
      const response = await fetch('/api/emails/migrate-to-user', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      alert(`Migration complete! ${data.modifiedCount} employees migrated.`);
      setShowMigrationButton(false);
      fetchEmails();
    } catch (error) {
      console.error('Migration error:', error);
      alert('Migration failed. Please try again.');
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎉 Bravo Points Manager</h1>
        <div className="user-info">
          <button 
            className="btn btn-secondary btn-small" 
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button 
            className="btn btn-secondary btn-small" 
            onClick={() => {
              setShowPhraseManager(!showPhraseManager);
              setSelectedEmail(null);
            }}
          >
            {showPhraseManager ? '👥 Employees' : '💡 Phrases'}
          </button>
          <span>Welcome, {user?.name}!</span>
          <button className="btn btn-secondary btn-small" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {showPhraseManager ? (
        <PhraseManager />
      ) : (
        <div className="app-content">
          <div className="sidebar">
            <div className="sidebar-header">
              <h2>Employees</h2>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? 'Cancel' : '+ Add New'}
            </button>
          </div>

          {showMigrationButton && emails.length === 0 && (
            <div style={{ padding: '10px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px', margin: '10px' }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Not seeing your employees?</p>
              <button 
                className="btn btn-secondary"
                onClick={handleMigration}
                style={{ width: '100%' }}
              >
                🔄 Migrate Existing Employees
              </button>
            </div>
          )}

          {showAddForm && (
            <AddEmailForm 
              onEmailAdded={handleEmailAdded}
              onCancel={() => setShowAddForm(false)}
            />
          )}

          <EmailList 
            emails={emails}
            selectedEmail={selectedEmail}
            onEmailSelect={handleEmailSelect}
          />
        </div>

        <div className="main-content">
          {selectedEmail ? (
            <EmailDetail 
              email={selectedEmail}
              onUpdate={fetchEmails}
            />
          ) : (
            <div className="empty-state">
              <p>Select an employee to view evaluations</p>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}

export default App;
