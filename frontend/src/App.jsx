import { useState, useEffect } from 'react';
import EmailList from './components/EmailList';
import EmailDetail from './components/EmailDetail';
import AddEmailForm from './components/AddEmailForm';
import './App.css';

function App() {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      const response = await fetch('/api/emails');
      const data = await response.json();
      setEmails(data);
    } catch (error) {
      console.error('Error fetching emails:', error);
    }
  };

  const handleEmailSelect = (email) => {
    setSelectedEmail(email);
  };

  const handleEmailAdded = () => {
    setShowAddForm(false);
    fetchEmails();
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎉 Bravo Points Manager</h1>
      </header>

      <div className="app-content">
        <div className="sidebar">
          <div className="sidebar-header">
            <h2>Munkatársak</h2>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? 'Mégse' : '+ Új hozzáadása'}
            </button>
          </div>

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
              <p>Válassz ki egy munkatársat az értékelések megtekintéséhez</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
