# Bravo Points Backend

Node.js + TypeScript backend API for the Bravo Points Manager application with JWT authentication.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example` and add your credentials:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bravo-points
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_secure_jwt_secret_here
```
   - Get your free Gemini API key at: https://aistudio.google.com/app/apikey
   - Generate a secure JWT secret (128+ characters recommended)

3. Make sure MongoDB is running locally or update the connection string

4. Start the server:
```bash
npm run dev
```

The server will run on http://localhost:5000

## API Endpoints

### Authentication (Public)
- `POST /api/auth/register` - Register new user (requires: name, email, password)
- `POST /api/auth/login` - Login (requires: email, password) → Returns JWT token

### Employees (Protected - User-Specific)
- `GET /api/emails` - Get all employees for authenticated user
- `GET /api/emails/:id` - Get single employee with evaluations (must belong to user)
- `POST /api/emails` - Create new employee (requires: name, email) - auto-assigned to current user
- `PUT /api/emails/:id` - Update employee (must belong to user)
- `DELETE /api/emails/:id` - Delete employee and all related evaluations (must belong to user)
- `POST /api/emails/migrate-to-user` - Migrate employees without userId to current user

### Evaluations (Protected - User-Specific)
- `POST /api/evaluations/generate` - Generate AI evaluation using Gemini (requires: emailId, prompt)
  - Verifies employee belongs to current user
- `GET /api/evaluations/email/:emailId` - Get all evaluations for an employee
  - Verifies employee belongs to current user
- `DELETE /api/evaluations/:id` - Delete evaluation
  - Verifies employee belongs to current user
- `PATCH /api/evaluations/:id/status` - Update evaluation status
  - Fields: approved (boolean), sent (boolean)
  - Verifies employee belongs to current user
- `POST /api/evaluations/check-similarity` - Check for similar evaluations
  - Searches across ALL users for same employee email
  - Uses Gemini AI to compare prompts
  - Returns matches from last 2 weeks with "fromAnotherUser" flag

### Phrases (Protected)
- `GET /api/phrases` - Get all phrases for authenticated user
- `GET /api/phrases/category/:category` - Get phrases by category
- `POST /api/phrases` - Create new phrase (requires: text, category)
- `PUT /api/phrases/:id` - Update phrase
- `DELETE /api/phrases/:id` - Delete phrase

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

Tokens are valid for 7 days.

## AI Configuration

Gemini AI parameters can be configured in `src/config/gemini.config.ts`:
- Model: gemini-2.5-flash
- Temperature: 0.7 (creativity level)
- Max Output Tokens: 2000
- Safety settings: BLOCK_MEDIUM_AND_ABOVE

## Technologies

- **TypeScript**: Type-safe code
- **Express.js**: Web framework
- **MongoDB + Mongoose**: Database
- **JWT + bcryptjs**: Authentication and password hashing
- **Google Gemini API**: AI evaluation generation
- **nodemon + ts-node**: Development tools
