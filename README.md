# Bravo Points Manager

A full-featured employee evaluation application with AI-powered evaluation generation using Google Gemini.

## 🎯 Features

### Authentication & User Management
- **Secure Authentication**: JWT-based login and registration (7-day token validity)
- **User-Specific Data**: Each user manages their own employees and evaluations
- **Data Migration**: Built-in tool to migrate existing employees to user accounts

### Employee Management
- **Multi-User Support**: Multiple users can track the same employee separately
- **Employee Profiles**: Store name, email, evaluation count, and last evaluation date
- **CRUD Operations**: Full create, read, update, delete functionality

### AI-Powered Evaluations
- **Google Gemini Integration**: Automatic evaluation generation using gemini-2.5-flash
- **Custom Prompts**: Write personalized evaluation criteria
- **Approval Workflow**: Mark evaluations as "Approved" ✓ and "Sent" 📧
- **Duplicate Detection**: AI-powered cross-user similarity checking
  - Detects similar evaluations within 2-week window
  - Works across different users for the same employee
  - Shows "Different user" indicator for cross-user matches

### Phrase Library
- **Quick Phrases**: Reusable evaluation snippets organized by category
- **Categories**: Positive, Achievement, Skill, Teamwork, Leadership, Improvement, Other
- **User-Specific**: Each user maintains their own phrase collection

### Modern UI/UX
- **Dark/Light Mode**: Toggle between themes with persistent preference
- **Markdown Support**: Rich text formatting in evaluations (bold, italic, lists, code)
- **Color-Coded Status**: Visual indicators for approved (green), sent (blue), both (purple)
- **Responsive Design**: Works on desktop and mobile devices
- **Gradient Styling**: Modern, professional appearance

## 📁 Project Structure

```
Bravo/
├── backend/          # Node.js Express API (TypeScript)
│   └── src/
│       ├── models/       # MongoDB models (User, Email, Evaluation, Phrase)
│       ├── routes/       # API endpoints
│       ├── middleware/   # Authentication middleware
│       ├── config/       # Gemini AI configuration
│       └── server.ts     # Server entry point
├── frontend/         # React + Vite frontend (TypeScript)
│   └── src/
│       ├── components/   # React components
│       ├── types/        # TypeScript interfaces
│       └── App.tsx       # Main application
└── .github/          # Project configuration
```

## 🚀 Installation and Setup

### Prerequisites

- Node.js (v18 or newer)
- MongoDB (local or cloud)
- Google Gemini API key (free: https://aistudio.google.com/app/apikey)

### Backend Setup

1. Navigate to the backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Fill in your `.env` file:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bravo-points
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_secure_jwt_secret_here
```

5. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Open a new terminal and navigate to the frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser at: http://localhost:3000

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Employees (Protected)
- `GET /api/emails` - Get all employees for current user
- `GET /api/emails/:id` - Get employee with evaluations
- `POST /api/emails` - Create new employee (auto-assigned to current user)
- `PUT /api/emails/:id` - Update employee
- `DELETE /api/emails/:id` - Delete employee and all evaluations
- `POST /api/emails/migrate-to-user` - Migrate orphaned employees to current user

### Evaluations (Protected)
- `POST /api/evaluations/generate` - Generate AI evaluation
- `GET /api/evaluations/email/:emailId` - Get all evaluations for an email
- `DELETE /api/evaluations/:id` - Delete evaluation
- `PATCH /api/evaluations/:id/status` - Update approved/sent status
- `POST /api/evaluations/check-similarity` - Check for similar evaluations (cross-user)

### Phrases (Protected)
- `GET /api/phrases` - Get all user phrases
- `GET /api/phrases/category/:category` - Get phrases by category
- `POST /api/phrases` - Create new phrase
- `PUT /api/phrases/:id` - Update phrase
- `DELETE /api/phrases/:id` - Delete phrase

## 💡 Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Migration** (first-time only): If you have existing employees, click "🔄 Migrate Existing Employees" button
3. **Add Employees**: Click "+ Add New" button in the left sidebar
   - Note: Multiple users can track the same employee independently
4. **Manage Phrases**: Toggle to "💡 Phrases" view to create reusable evaluation phrases
   - Organized by categories (Positive, Achievement, Skill, etc.)
5. **Generate Evaluation**: 
   - Select an employee
   - Click "New Evaluation"
   - Use "💡 Quick Phrases" button to insert pre-defined text
   - System automatically checks for similar evaluations (even from other users)
   - If similar evaluation found, review and confirm to proceed
6. **Approval Workflow**:
   - Mark evaluations as ✓ Approved with green checkmark
   - Mark as 📧 Sent with email icon
   - Visual color coding: green (approved), blue (sent), purple (both)
7. **Theme Toggle**: Click 🌙/☀️ button to switch between dark/light mode
8. **View History**: All evaluations displayed with markdown formatting and status indicators

## 🛠️ Technologies

### Backend
- Node.js + TypeScript
- Express.js
- MongoDB + Mongoose
- Google Gemini API (gemini-2.5-flash)
- JWT Authentication
- bcryptjs for password hashing

### Frontend
- React 18 + TypeScript
- Vite
- CSS3 with gradient styling
- marked (markdown parsing)

## 📝 License

ISC
