import { IEmail } from '../types';
import './EmailList.css';

interface EmailListProps {
  emails: IEmail[];
  selectedEmail: IEmail | null;
  onEmailSelect: (email: IEmail) => void;
}

function EmailList({ emails, selectedEmail, onEmailSelect }: EmailListProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return 'No evaluation';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="email-list">
      {emails.length === 0 ? (
        <div className="email-list-empty">
          <p>No employees added yet</p>
        </div>
      ) : (
        emails.map(email => (
          <div
            key={email._id}
            className={`email-item ${selectedEmail?._id === email._id ? 'active' : ''}`}
            onClick={() => onEmailSelect(email)}
          >
            <div className="email-item-header">
              <h3>{email.name}</h3>
              <span className="evaluation-count">{email.evaluationCount || 0}</span>
            </div>
            <p className="email-address">{email.email}</p>
            <p className="last-evaluation">
              Last evaluation: {formatDate(email.lastEvaluationDate)}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default EmailList;
