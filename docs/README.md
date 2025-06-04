# Project H - Mental Health Practice Scheduling System

## 🏥 Overview

Project H is a comprehensive HIPAA-compliant mental health practice scheduling and management system designed to streamline operations for mental health practitioners and improve patient experience.

## ✨ Features

### For Practice Staff
- **Dashboard**: Real-time overview of appointments, waitlists, and key metrics
- **Schedule Management**: Interactive calendar with provider-specific views
- **Patient Management**: Comprehensive patient database with search and filtering
- **Provider Management**: Staff scheduling and utilization tracking
- **Waitlist Management**: Prioritized patient queue with intelligent matching
- **Analytics**: Performance metrics and practice insights
- **Settings**: System configuration and user management

### For Patients
- **Patient Portal**: Secure access to appointments and messages
- **Appointment Booking**: Self-service scheduling with provider preferences
- **Communication**: Secure messaging with providers
- **Profile Management**: Personal information and preferences

## 🚀 Live Demo

Visit the live demo: [https://andeslee444.github.io/Project-H/](https://andeslee444.github.io/Project-H/)

### Demo Credentials

**Practice Staff:**
- Email: admin@example.com
- Password: password
- Role: Practice Staff

**Patient:**
- Email: patient@example.com  
- Password: password
- Role: Patient

## 🛠 Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **React Router** - Client-side routing
- **Vite** - Fast development and build tool
- **CSS3** - Modern styling with CSS variables

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Knex.js** - SQL query builder

## 🏗 Architecture

```
Project H/
├── frontend/          # React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page-level components
│   │   └── App.jsx      # Main application component
├── backend/           # Express API server
│   ├── routes/        # API route handlers
│   ├── models/        # Database models
│   └── server.js      # Server entry point
└── docs/             # Documentation
```

## 🔒 HIPAA Compliance

This system is designed with HIPAA compliance in mind:

- **Data Encryption**: All sensitive data is encrypted in transit and at rest
- **Access Controls**: Role-based permissions and authentication
- **Audit Logging**: Comprehensive logging of all data access
- **Secure Communication**: HTTPS and secure messaging protocols
- **Data Minimization**: Only necessary data is collected and stored

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/andeslee444/Project-H.git
   cd Project-H
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../backend
   npm install
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

5. **Run database migrations**
   ```bash
   npm run migrate
   ```

6. **Start the development servers**
   
   Frontend:
   ```bash
   cd frontend
   npm run dev
   ```
   
   Backend:
   ```bash
   cd backend
   npm run dev
   ```

## 📱 Screenshots

### Dashboard
![Dashboard Overview](./screenshots/dashboard.png)

### Schedule Management
![Schedule Interface](./screenshots/schedule.png)

### Patient Portal
![Patient Dashboard](./screenshots/patient-portal.png)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support or questions, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ for mental health practitioners**