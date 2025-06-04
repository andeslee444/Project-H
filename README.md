# Mental Health Practice Scheduling and Waitlist Management System

A comprehensive scheduling and waitlist management application designed specifically for mental health practices. This system helps reduce appointment gaps by intelligently matching patients from waitlists with last-minute cancellations.

## 🌐 Live Demo

**[View Live Application on GitHub Pages](https://andeslee444.github.io/Project-H/)**

> Experience the patient dashboard with mood tracking, provider management system, and intelligent scheduling features.

## 🎯 Project Overview

This system addresses the critical problem of last-minute cancellations in mental health practices by:
- Automatically matching waitlisted patients with available slots
- Reducing revenue loss from empty appointments
- Improving patient satisfaction through faster access to care
- Streamlining practice operations with intelligent scheduling

## 📁 Project Structure

```
Project-H/
├── docs/                    # Documentation
├── frontend/               # React frontend application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   └── styles/        # Global styles
│   └── package.json
├── backend/               # Node.js/Express backend
│   ├── src/
│   │   ├── models/        # Database models
│   │   ├── services/      # Business logic
│   │   ├── controllers/   # API controllers
│   │   ├── routes/        # API routes
│   │   └── middleware/    # Express middleware
│   ├── migrations/        # Database migrations
│   └── package.json
└── scripts/               # Utility scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd "Project-H"
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Set up Backend Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and other settings
   ```

4. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Set up Database**
   ```bash
   # Create PostgreSQL database
   createdb mental_health_db
   
   # Run migrations (from backend directory)
   cd ../backend
   npm run migrate
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on http://localhost:3001

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on http://localhost:5173

## 🛠️ Development

### Frontend Development

- **Framework**: React 18 with Vite
- **Routing**: React Router v6
- **Styling**: CSS Modules
- **State Management**: React Context API (can be extended with Redux)

Key directories:
- `frontend/src/pages/` - Main application pages
- `frontend/src/components/` - Reusable components
- `frontend/src/services/` - API integration layer

### Backend Development

- **Framework**: Express.js
- **Database**: PostgreSQL with Knex.js
- **Authentication**: JWT
- **API**: RESTful design

Key directories:
- `backend/src/models/` - Database models
- `backend/src/routes/` - API endpoints
- `backend/src/services/` - Business logic

## 📚 Documentation

Detailed documentation is available in the `docs/` directory:
- `PRD.txt` - Product Requirements Document
- `System Architecture.md` - Technical architecture details
- `Database Schema.md` - Database design and relationships
- `API Endpoints.md` - API documentation

## 🔑 Key Features

### For Practices
- **Waitlist Management**: Smart patient prioritization and filtering
- **Automated Matching**: Intelligent patient-provider matching based on multiple criteria
- **Real-time Notifications**: Instant alerts for scheduling changes
- **Analytics Dashboard**: Track utilization, revenue recovery, and operational metrics
- **HIPAA Compliant**: Secure data handling and communications

### For Patients
- **Transparent Waitlist**: Clear visibility into position and estimated wait times
- **Quick Booking**: Rapid response to available slots
- **Preference Management**: Set availability and provider preferences
- **Mobile Friendly**: Access from any device
- **📊 Mood Tracking**: GitHub-style contributions chart for emotional wellness monitoring
- **🎯 Interactive Dashboard**: Modern healthcare UI with seamless mood logging integration

## 🧪 Testing

```bash
# Run frontend tests
cd frontend
npm test

# Run backend tests
cd backend
npm test
```

## 🚢 Deployment

See deployment guides in the `docs/` directory for production deployment instructions.

## 🔐 Security

- HIPAA compliant data handling
- Encrypted data transmission
- Secure authentication with JWT
- Role-based access control
- Audit logging for all sensitive operations

## 🤝 Contributing

Please read the contributing guidelines in the docs before submitting pull requests.

## 📄 License

This project is proprietary software for mental health practice management.