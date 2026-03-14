import { useState, useEffect } from 'react';
import { marked } from 'marked';
import EvaluationForm from './EvaluationForm';
import { IEmail, IEvaluation } from '../types';
import './EmailDetail.css';

interface EmailDetailProps {
  email: IEmail;
  onUpdate: () => void;
}

function EmailDetail({ email, onUpdate }: EmailDetailProps) {
  const [evaluations, setEvaluations] = useState<IEvaluation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEvaluations();
  }, [email]);

  const fetchEvaluations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/emails/${email._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setEvaluations(data.evaluations || []);
    } catch (error) {
      console.error('Error fetching evaluations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluationAdded = () => {
    setShowForm(false);
    fetchEvaluations();
    onUpdate();
  };

  const handleDeleteEvaluation = async (evaluationId: string) => {
    if (!confirm('Are you sure you want to delete this evaluation?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/evaluations/${evaluationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchEvaluations();
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting evaluation:', error);
    }
  };

  const handleDeleteEmail = async () => {
    if (!confirm(`Are you sure you want to delete ${email.name} and all related evaluations?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/emails/${email._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        onUpdate();
        // Reset selection after delete
        window.location.reload();
      }
    } catch (error) {
      console.error('Error deleting email:', error);
    }
  };

  const handleToggleApproved = async (evaluationId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/evaluations/${evaluationId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ approved: !currentStatus })
      });

      if (response.ok) {
        fetchEvaluations();
      }
    } catch (error) {
      console.error('Error updating approval status:', error);
    }
  };

  const handleToggleSent = async (evaluationId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/evaluations/${evaluationId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sent: !currentStatus })
      });

      if (response.ok) {
        fetchEvaluations();
      }
    } catch (error) {
      console.error('Error updating sent status:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="email-detail">
      <div className="detail-header">
        <div>
          <h2>{email.name}</h2>
          <p className="detail-email">{email.email}</p>
        </div>
        <div className="detail-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '+ New Evaluation'}
          </button>
          <button 
            className="btn btn-danger"
            onClick={handleDeleteEmail}
            style={{ whiteSpace: 'nowrap' }}
          >
            Delete User
          </button>
        </div>
      </div>

      {showForm && (
        <EvaluationForm
          emailId={email._id}
          onEvaluationAdded={handleEvaluationAdded}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="evaluations-section">
        <h3>Evaluations ({evaluations.length})</h3>
        
        {loading ? (
          <div className="loading">Loading...</div>
        ) : evaluations.length === 0 ? (
          <div className="no-evaluations">
            <p>No evaluations for this employee yet</p>
          </div>
        ) : (
          <div className="evaluations-list">
            {evaluations.map(evaluation => (
              <div key={evaluation._id} className={`evaluation-card ${evaluation.approved ? 'approved' : ''} ${evaluation.sent ? 'sent' : ''}`}>
                <div className="evaluation-header">
                  <div className="evaluation-header-left">
                    <span className="evaluation-date">
                      {formatDate(evaluation.generatedAt)}
                    </span>
                    <div className="evaluation-badges">
                      {evaluation.approved && <span className="badge badge-approved">✓ Approved</span>}
                      {evaluation.sent && <span className="badge badge-sent">📧 Sent</span>}
                    </div>
                  </div>
                  <div className="evaluation-actions">
                    <button
                      className={`btn btn-small ${evaluation.approved ? 'btn-secondary' : 'btn-success'}`}
                      onClick={() => handleToggleApproved(evaluation._id, evaluation.approved || false)}
                      title={evaluation.approved ? 'Mark as not approved' : 'Mark as approved'}
                    >
                      {evaluation.approved ? '✓' : '✓'}
                    </button>
                    <button
                      className={`btn btn-small ${evaluation.sent ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={() => handleToggleSent(evaluation._id, evaluation.sent || false)}
                      title={evaluation.sent ? 'Mark as not sent' : 'Mark as sent'}
                    >
                      {evaluation.sent ? '📧' : '📧'}
                    </button>
                    <button
                      className="btn btn-danger btn-small"
                      onClick={() => handleDeleteEvaluation(evaluation._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="evaluation-prompt">
                  <strong>Prompt:</strong> {evaluation.prompt}
                </div>
                
                <div 
                  className="evaluation-text"
                  dangerouslySetInnerHTML={{ __html: marked(evaluation.evaluation) }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EmailDetail;
