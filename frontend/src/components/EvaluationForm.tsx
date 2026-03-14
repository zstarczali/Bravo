import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { IPhrase } from '../types';
import './EvaluationForm.css';

interface EvaluationFormProps {
  emailId: string;
  onEvaluationAdded: () => void;
  onCancel: () => void;
}

function EvaluationForm({ emailId, onEvaluationAdded, onCancel }: EvaluationFormProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phrases, setPhrases] = useState<IPhrase[]>([]);
  const [showPhrases, setShowPhrases] = useState(false);
  const [similarWarning, setSimilarWarning] = useState<any>(null);
  const [checkingSimilarity, setCheckingSimilarity] = useState(false);

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

  const insertPhrase = (phraseText: string) => {
    setPrompt(prev => prev ? `${prev} ${phraseText}` : phraseText);
  };

  const generateEvaluation = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/evaluations/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ emailId, prompt })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error generating evaluation');
      }

      setPrompt('');
      setSimilarWarning(null);
      
      // Check if response contains fallback indicator
      if (data.evaluation?.includes('[AI Quota Exceeded') || data.evaluation?.includes('Gemini not configured')) {
        alert('⚠️ AI quota exceeded or not configured. A template evaluation was created. Check your Gemini API settings.');
      }
      
      onEvaluationAdded();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // If similarWarning exists, user is confirming they want to proceed
    if (similarWarning) {
      await generateEvaluation();
      return;
    }

    // Check for similar evaluations first
    setCheckingSimilarity(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/evaluations/check-similarity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ emailId, prompt })
      });

      const data = await response.json();

      if (data.hasSimilar && data.similarEvaluations.length > 0) {
        // Show warning and wait for user confirmation
        setSimilarWarning(data.similarEvaluations);
      } else {
        // No similar evaluations found, proceed with generation
        await generateEvaluation();
      }
    } catch (err) {
      console.error('Error checking similarity:', err);
      // If check fails, proceed with generation anyway
      await generateEvaluation();
    } finally {
      setCheckingSimilarity(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  return (
    <div className="evaluation-form-container">
      <form className="evaluation-form" onSubmit={handleSubmit}>
        <h3>Generate New Evaluation</h3>
        
        {error && <div className="form-error">{error}</div>}

        {similarWarning && similarWarning.length > 0 && (
          <div className="similarity-warning">
            <div className="warning-header">
              <strong>⚠️ Similar Evaluation Found</strong>
              <button 
                type="button" 
                className="btn-close-warning"
                onClick={() => setSimilarWarning(null)}
              >
                ✕
              </button>
            </div>
            <p>A similar evaluation was created recently for this employee:</p>
            {similarWarning.map((similar: any) => (
              <div key={similar._id} className="similar-item">
                <div className="similar-date">
                  {new Date(similar.createdAt).toLocaleDateString()}
                  {similar.fromAnotherUser && <span style={{ marginLeft: '8px', color: '#f59e0b', fontWeight: 'bold' }}>👤 Different user</span>}
                </div>
                <div className="similar-prompt">
                  <strong>Prompt:</strong> {similar.prompt}
                </div>
              </div>
            ))}
            <p className="warning-footer">
              Do you still want to create this evaluation? Click "Generate" again to proceed.
            </p>
          </div>
        )}

        {checkingSimilarity && (
          <div className="checking-similarity">
            <span>🔍 Checking for similar evaluations...</span>
          </div>
        )}

        <div className="form-group">
          <div className="label-with-button">
            <label>What would you like to evaluate? (Prompt)</label>
            <button
              type="button"
              className="btn btn-secondary btn-small"
              onClick={() => setShowPhrases(!showPhrases)}
            >
              {showPhrases ? '✕ Hide Phrases' : '💡 Quick Phrases'}
            </button>
          </div>

          {showPhrases && phrases.length > 0 && (
            <div className="phrase-picker">
              {['positive', 'achievement', 'skill', 'teamwork', 'leadership', 'improvement', 'other'].map(category => {
                const categoryPhrases = phrases.filter(p => p.category === category);
                if (categoryPhrases.length === 0) return null;
                
                return (
                  <div key={category} className="phrase-category">
                    <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                    <div className="phrase-chips">
                      {categoryPhrases.map(phrase => (
                        <button
                          key={phrase._id}
                          type="button"
                          className="phrase-chip"
                          onClick={() => insertPhrase(phrase.text)}
                          title="Click to insert into prompt"
                        >
                          {phrase.text}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <textarea
            value={prompt}
            onChange={handleChange}
            required
            placeholder="E.g.: Excellent work on the project, all tasks completed on time..."
            rows={4}
          />
          <small>The AI will use this prompt to create a detailed evaluation.</small>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading || checkingSimilarity}
          >
            {loading ? '⏳ Generating...' : checkingSimilarity ? '🔍 Checking...' : '✨ Generate Evaluation'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onCancel}
            disabled={loading || checkingSimilarity}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EvaluationForm;
