# 🚀 AI Component Generator - Setup Guide

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (running locally or a cloud instance)
- **Redis** (running locally or a cloud instance)

## Quick Setup

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

#### Backend (.env)
```bash
cd backend
cp .env.example .env
```

The `.env` file should contain:
```
MONGODB_URI=mongodb://localhost:27017/accio-job
NODE_ENV=development
PORT=5004
JWT_SECRET=90ce8812536cccbb0dc6ed6e14de5c3a015be70c248ad897e1ae8ac5cf89607e
OPENROUTER_API_KEY=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
AI_MODEL=anthropic/claude-3.5-sonnet
FRONTEND_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379
```

#### Frontend (.env.local)
```bash
cd frontend
cp .env.example .env.local
```

The `.env.local` file should contain:
```
NEXT_PUBLIC_API_URL=http://localhost:5004
NEXT_PUBLIC_WS_URL=ws://localhost:5004
```

### 3. Start the Services

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5004

## Database Setup

### MongoDB
Make sure MongoDB is running:
```bash
# Start MongoDB (if using local installation)
mongod

# Or connect to your cloud MongoDB instance
```

### Redis
Make sure Redis is running:
```bash
# Start Redis (if using local installation)
redis-server

# Or connect to your cloud Redis instance
```

## Features Available

✅ **Authentication System**
- User registration and login
- JWT token management
- Password hashing with bcrypt

✅ **Session Management**
- Create, edit, delete sessions
- Session persistence
- Search and filter sessions

✅ **AI Component Generation**
- Natural language to React components
- Image upload support
- Real-time streaming responses
- Component refinement

✅ **Live Preview**
- Real-time component rendering
- Interactive element selection
- Code inspection (JSX/CSS tabs)

✅ **Export Functionality**
- Copy code to clipboard
- Download individual files
- Export as ZIP

✅ **Bonus Features**
- Interactive property editor
- Chat-driven overrides
- Auto-save functionality
- Dark/light theme toggle
- Responsive design

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Change the PORT in backend/.env
   - Or kill the process using the port

2. **MongoDB connection failed**
   - Ensure MongoDB is running
   - Check MONGODB_URI in backend/.env

3. **Redis connection failed**
   - Ensure Redis is running
   - Check REDIS_URL in backend/.env

4. **AI generation not working**
   - Verify OPENROUTER_API_KEY is valid
   - Check API quota/limits

5. **Frontend build errors**
   - Clear node_modules and reinstall
   - Check TypeScript errors

### Development Commands

```bash
# Backend
npm run dev          # Start development server
npm run build        # Build for production
npm test            # Run tests

# Frontend
npm run dev         # Start development server
npm run build       # Build for production
npm run lint        # Run ESLint
npm run type-check  # Run TypeScript check
```

## Project Structure

```
Acciojob/
├── backend/                 # Node.js + Express backend
│   ├── src/
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Auth & validation
│   │   ├── services/       # AI service
│   │   └── server.js       # Main server file
│   └── package.json
├── frontend/               # Next.js + React frontend
│   ├── src/
│   │   ├── app/           # Next.js app router
│   │   ├── components/    # React components
│   │   ├── store/         # Zustand state management
│   │   ├── lib/           # Utilities & API
│   │   └── types/         # TypeScript types
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Sessions
- `GET /api/sessions` - List user sessions
- `POST /api/sessions` - Create new session
- `PUT /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - Delete session

### AI Generation
- `POST /api/ai/generate` - Generate component
- `POST /api/ai/generate/stream` - Stream component generation
- `POST /api/ai/refine` - Refine existing component

### Export
- `POST /api/export/zip` - Export as ZIP
- `GET /api/export/code/:sessionId` - Get code for copying

## Deployment

### Backend Deployment
- **Vercel**: Use `vercel` CLI
- **Render**: Connect GitHub repo
- **Heroku**: Use `heroku` CLI
- **AWS**: Use Elastic Beanstalk

### Frontend Deployment
- **Vercel**: Automatic deployment from GitHub
- **Netlify**: Connect GitHub repo
- **AWS S3**: Static hosting

### Environment Variables for Production
Update the environment variables for your production environment:
- `MONGODB_URI` - Production MongoDB connection
- `REDIS_URL` - Production Redis connection
- `JWT_SECRET` - Strong secret key
- `FRONTEND_URL` - Production frontend URL

## Support

If you encounter any issues:

1. Check the console logs for errors
2. Verify all environment variables are set
3. Ensure MongoDB and Redis are running
4. Check the API documentation
5. Review the troubleshooting section above

---

**Happy Coding! 🎉** 