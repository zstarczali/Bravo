import { useState, useEffect } from 'react';
import { IPhrase } from '../types';
import './PhraseManager.css';

function PhraseManager() {
  const [phrases, setPhrases] = useState<IPhrase[]>([]);
  const [newPhrase, setNewPhrase] = useState({ text: '', category: 'positive' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { value: 'positive', label: '✅ Positive' },
    { value: 'achievement', label: '🏆 Achievement' },
    { value: 'skill', label: '💪 Skill' },
    { value: 'teamwork', label: '🤝 Teamwork' },
    { value: 'leadership', label: '👑 Leadership' },
    { value: 'improvement', label: '📈 Improvement' },
    { value: 'other', label: '📝 Other' }
  ];

  useEffect(() => {
    fetchPhrases();
  }, []);

  const fetchPhrases = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/phrases', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPhrases(data);
      }
    } catch (err) {
      console.error('Error fetching phrases:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/phrases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPhrase)
      });

      if (!response.ok) {
        throw new Error('Failed to add phrase');
      }

      setNewPhrase({ text: '', category: 'positive' });
      fetchPhrases();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this phrase?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/phrases/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchPhrases();
      }
    } catch (err) {
      console.error('Error deleting phrase:', err);
    }
  };

  const groupedPhrases = categories.map(cat => ({
    ...cat,
    phrases: phrases.filter(p => p.category === cat.value)
  })).filter(group => group.phrases.length > 0);

  return (
    <div className="phrase-manager">
      <h2>Quick Phrases Library</h2>
      <p className="phrase-manager-desc">
        Create reusable phrases to quickly build evaluation prompts
      </p>

      <form className="phrase-form" onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}
        
        <div className="phrase-form-row">
          <input
            type="text"
            value={newPhrase.text}
            onChange={(e) => setNewPhrase({ ...newPhrase, text: e.target.value })}
            placeholder="Enter a phrase or keyword..."
            required
            className="phrase-input"
          />
          
          <select
            value={newPhrase.category}
            onChange={(e) => setNewPhrase({ ...newPhrase, category: e.target.value })}
            className="phrase-select"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '...' : '+ Add'}
          </button>
        </div>
      </form>

      <div className="phrases-list">
        {groupedPhrases.length === 0 ? (
          <div className="no-phrases">
            <p>No phrases yet. Add your first one above!</p>
          </div>
        ) : (
          groupedPhrases.map(group => (
            <div key={group.value} className="phrase-group">
              <h3>{group.label}</h3>
              <div className="phrase-items">
                {group.phrases.map(phrase => (
                  <div key={phrase._id} className="phrase-item">
                    <span className="phrase-text">{phrase.text}</span>
                    <button
                      className="btn-delete-phrase"
                      onClick={() => handleDelete(phrase._id)}
                      title="Delete phrase"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PhraseManager;
