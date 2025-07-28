# 🚀 AI Component Generator Platform

A stateful, AI-driven micro-frontend playground where authenticated users can iteratively generate, preview, tweak, and export React components with full chat history and code edits preserved.

## 🌟 Features

### ✅ Mandatory Features
- **Authentication & Persistence**: Secure JWT sessions with MongoDB
- **Conversational UI**: Side-panel chat with AI-powered component generation
- **Live Preview**: Real-time component rendering in sandboxed environment
- **Code Inspection**: Syntax-highlighted JSX/TSX and CSS tabs
- **Export Functionality**: Copy and download components as ZIP files
- **Session Management**: Load previous sessions with full state preservation

### 🎯 Optional/Bonus Features
- **Interactive Property Editor**: Click elements to modify properties in real-time
- **Chat-Driven Overrides**: Target specific elements with natural language prompts
- **Auto-save**: Automatic state persistence after every interaction
- **Responsive Design**: Mobile-friendly interface with keyboard support

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express
- **MongoDB** for data persistence
- **Redis** for session caching
- **JWT** for authentication
- **OpenRouter API** for AI integration

### Frontend
- **React** with Next.js
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Monaco Editor** for code editing
- **Socket.io** for real-time updates

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- Redis
- OpenRouter API key

### Environment Variables

Create `.env` files in both `backend` and `frontend` directories:

**Backend (.env)**
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

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:5004
NEXT_PUBLIC_WS_URL=ws://localhost:5004
```

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd acciojob
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd frontend
npm install
```

4. **Start the services**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5004

## 📁 Project Structure

```
acciojob/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/         # MongoDB schemas
│   │   ├── middleware/     # Auth & validation
│   │   ├── services/       # Business logic
│   │   ├── routes/         # API routes
│   │   └── utils/          # Helper functions
│   ├── package.json
│   └── .env
├── frontend/               # Next.js React app
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Next.js pages
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   ├── store/         # State management
│   │   └── styles/        # CSS styles
│   ├── package.json
│   └── .env.local
└── README.md
```

## 🎯 Core Functionality

### Authentication
- JWT-based authentication
- Secure password hashing with bcrypt
- Session management with Redis
- Protected routes and middleware

### AI Integration
- OpenRouter API integration
- Streaming responses for real-time feedback
- Context-aware component generation
- Error handling and retry mechanisms

### Component Generation
- Natural language to React component conversion
- Live preview with hot reload
- Syntax highlighting for code inspection
- Export functionality (copy/download)

### State Management
- Auto-save functionality
- Session persistence across logins
- Real-time state synchronization
- Optimistic updates

## 🎨 UI/UX Features

### Interactive Property Editor
- Click any element to open property panel
- Real-time property modification
- Two-way binding with code generation
- Visual feedback for changes

### Chat-Driven Overrides
- Target specific elements with natural language
- Incremental component updates
- Context-aware AI responses
- Seamless integration with existing code

## 🔒 Security Features

- JWT token validation
- Password hashing with bcrypt
- CORS configuration
- Input validation and sanitization
- Rate limiting
- Secure session management

## 📊 Performance Optimizations

- Redis caching for sessions
- Lazy loading of components
- Optimized bundle size
- Efficient state management
- Real-time updates with WebSocket

## 🚀 Deployment

### Backend Deployment
```bash
cd backend
npm run build
npm start
```

### Frontend Deployment
```bash
cd frontend
npm run build
npm start
```

### Environment Setup for Production
- Set `NODE_ENV=production`
- Configure production MongoDB URI
- Set up Redis for production
- Configure CORS for production domain
- Set up proper JWT secrets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the GitHub repository.

---

**Built with ❤️ for Acciojob Assignment** 