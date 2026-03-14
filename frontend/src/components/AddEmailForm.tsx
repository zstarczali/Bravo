import { useState, FormEvent, ChangeEvent } from 'react';
import './AddEmailForm.css';

interface AddEmailFormProps {
  onEmailAdded: () => void;
  onCancel: () => void;
}

interface FormData {
  name: string;
  email: string;
}

function AddEmailForm({ onEmailAdded, onCancel }: AddEmailFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
      }

      setFormData({ name: '', email: '' });
      onEmailAdded();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form className="add-email-form" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}
      
      <div className="form-group">
        <label>Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="John Doe"
        />
      </div>

      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="kovacs.janos@example.com"
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary btn-small" disabled={loading}>
          {loading ? 'Adding...' : 'Add'}
        </button>
        <button type="button" className="btn btn-secondary btn-small" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default AddEmailForm;
