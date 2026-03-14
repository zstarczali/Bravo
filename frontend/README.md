# Bravo Points Frontend

React + TypeScript frontend for the Bravo Points Manager application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The app will be available at http://localhost:3000

## Features

- **User Authentication**: Register/login with JWT tokens stored in localStorage (7-day validity)
- **Employee Management**: View, add, update, and delete employees (user-specific)
  - Multiple users can track the same employee separately
  - Migration tool for existing employees
- **AI Evaluations**: Generate evaluations using Google Gemini with custom prompts
  - Approval workflow with ✓ Approved and 📧 Sent status toggles
  - Color-coded borders: green (approved), blue (sent), purple (both)
  - Duplicate detection across all users for same employee
- **Duplicate Detection**: AI-powered similarity checking
  - Compares prompts using Gemini AI
  - Searches last 2 weeks across all users
  - Shows warning with "👤 Different user" indicator
  - Two-step confirmation process
- **Phrase Library**: Create, categorize, and manage reusable phrases
  - Categories: positive, improvement, achievement, skill, teamwork, leadership, other
  - Quick insertion into evaluation prompts via 💡 button
  - User-specific phrase collections
- **Theme Toggle**: Dark/light mode with 🌙/☀️ button (preference saved)
- **Markdown Support**: Rich text formatting in generated evaluations (bold, italic, lists, etc.)
- **Evaluation History**: View all past evaluations with timestamps
- **Responsive UI**: Modern gradient-styled interface with smooth interactions

## Components

- **Auth**: Login and Registration forms (Login.tsx, Register.tsx)
- **EmailList**: Display all employees for current user with evaluation counts
- **EmailDetail**: Show employee details and evaluations
  - Approved/Sent toggle buttons with visual indicators
  - Color-coded evaluation cards
  - Markdown rendering for evaluation text
- **EvaluationForm**: Create new evaluations with AI
  - Similarity checking before generation
  - Warning display for duplicate detection
  - Quick phrase picker with 💡 button
  - Two-step confirmation for similar evaluations
- **PhraseManager**: Manage phrase library by category
  - Add, edit, delete phrases
  - Category organization
- **AddEmailForm**: Add new employees (auto-assigned to current user)
- **App**: Main application with theme toggle and user info display

## Authentication Flow

1. User registers/logs in
2. JWT token stored in localStorage
3. Token sent with all API requests in Authorization header
4. Auto-logout on token expiration

## Technologies

- **React 18**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **CSS3**: Gradient styling and animations
- **marked**: Markdown parsing for rich text display

## Environment

Backend API base URL is configured in component files. The frontend expects the backend at:
```
http://localhost:5000/api
```
