SME Compliance Navigator

The SME Compliance Navigator is an enterprise-grade platform designed to streamline regulatory compliance for Small and Medium Enterprises (SMEs). This system features a hybrid database architecture, multi-channel authentication (Web, SMS, and USSD), and a secure document management vault.

## 🚀 Key Features

* **Dual-Channel Authentication:** Secure registration using both Email and SMS OTP (backed by MongoDB and PostgreSQL).
* **USSD Fallback:** Offline compliance navigation and verification for users via `*384*2669#`.
* **Hybrid Data Architecture:** Utilizes **NeonDB (PostgreSQL)** for structured relational user data and **MongoDB (Atlas)** for transient OTP/session security.
* **Secure Document Vault:** Encrypted storage for compliance-related documentation.
* **Compliance Dashboard:** Real-time tracking of SME regulatory status.

## 🛠 Tech Stack

### Backend

* **Framework:** Python FastAPI
* **Databases:** PostgreSQL (NeonDB), MongoDB (Atlas)
* **Security:** JWT Authentication, Passlib (Bcrypt), OAuth2 scopes
* **Integration:** Africa's Talking (SMS & USSD APIs)

### Frontend

* **Framework:** React
* **State Management:** React Hooks
* **Communication:** Axios (consuming REST API)

---

## 📂 Project Structure

```text
SME-Regulartor-Compliance-Navigator/
├── README.md
├── group_project/
│   ├── backend/                    # FastAPI Application
│   │   ├── main.py                 # Main application entry point
│   │   ├── requirements.txt        # Python dependencies
│   │   ├── __pycache__/            # Python cache files
│   │   ├── api/                    # API Endpoints
│   │   │   ├── __init__.py
│   │   │   ├── routes_auth.py      # Authentication routes
│   │   │   ├── routes_dashboard.py # Dashboard routes
│   │   │   ├── routes_knowledge.py # Knowledge base routes
│   │   │   ├── routes_ussd.py      # USSD routes
│   │   │   ├── routes_vault.py     # Document vault routes
│   │   │   └── __pycache__/
│   │   ├── core/                   # Core functionality
│   │   │   ├── __init__.py
│   │   │   ├── compliance_engine.py # Compliance logic
│   │   │   ├── config.py           # Configuration settings
│   │   │   ├── deps.py             # Dependencies
│   │   │   ├── scheduler.py        # Task scheduler
│   │   │   ├── security.py         # Security utilities
│   │   │   └── __pycache__/
│   │   ├── db/                     # Database connections
│   │   │   ├── __init__.py
│   │   │   ├── mongo_session.py    # MongoDB session
│   │   │   ├── neon_session.py     # NeonDB session
│   │   │   └── __pycache__/
│   │   ├── models/                 # Database models
│   │   │   ├── __init__.py
│   │   │   ├── document_model.py   # Document models
│   │   │   ├── otp_model.py        # OTP models
│   │   │   ├── user_model.py       # User models
│   │   │   └── __pycache__/
│   │   ├── schemas/                # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── auth_schema.py      # Auth schemas
│   │   │   ├── dashboard_schema.py # Dashboard schemas
│   │   │   ├── document_schema.py  # Document schemas
│   │   │   ├── knowledge_schema.py # Knowledge schemas
│   │   │   └── __pycache__/
│   │   ├── services/               # Business logic services
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py     # Authentication service
│   │   │   ├── email_service.py    # Email service
│   │   │   ├── knowledge_service.py # Knowledge service
│   │   │   ├── sms_service.py      # SMS service
│   │   │   └── __pycache__/
│   │   └── uploads/                # File uploads
│   │       └── documents/          # Document storage
│   └── frontend/                   # Frontend applications
│       └── regulatory-compliance-ui/ # React application
│           ├── eslint.config.js    # ESLint configuration
│           ├── index.html          # Main HTML file
│           ├── package.json        # Node.js dependencies
│           ├── postcss.config.js   # PostCSS configuration
│           ├── README.md           # Frontend README
│           ├── tailwind.config.js  # Tailwind CSS config
│           ├── vite.config.js      # Vite configuration
│           ├── public/             # Public assets
│           └── src/                # Source code
│               ├── App.jsx         # Main App component
│               ├── index.css       # Global styles
│               ├── main.jsx        # Entry point
│               ├── assets/         # Static assets
│               ├── Auth/           # Authentication components
│               │   ├── ForgotPassword.jsx
│               │   ├── Register.jsx
│               │   ├── ResetPassword.jsx
│               │   ├── SignIn.jsx
│               │   └── VerifyOTP.jsx
│               ├── components/     # Reusable components
│               │   ├── DashboardCard.jsx
│               │   ├── Navbar.jsx
│               │   └── Sidebar.jsx
│               ├── pages/          # Page components
│               │   ├── Dashboard.jsx
│               │   ├── DocumentVault.jsx
│               │   ├── LandingPage.jsx
│               │   ├── Permits.jsx
│               │   └── Reminders.jsx
│               ├── routes/         # Routing components
│               │   ├── ProtectedRoute.jsx
│               │   └── PublicRoute.jsx
│               ├── services/       # API services
│               │   └── authService.js
│               └── utils/          # Utility functions
│                   ├── api.js
│                   └── auth.js
└── testenvirons/                   # Test environment
    ├── generate_test_permits.py    # Test permit generator
    └── test_docs/                  # Test documents
```

---

## ⚙️ Setup Instructions

### Prerequisites

* Python 3.13+
* Node.js (for frontend)
* Africa's Talking Sandbox/Live Credentials
* NeonDB & MongoDB Atlas clusters

### 1. Installation

Clone the repository and install backend dependencies:

```bash
git clone <your-repository-url>
cd group_project/backend

#load/install python virtual environment
python3 -m venv venv

#activate it
1. on Linux Treminal
source venv/bin/activate

2. on Windows powershell
.\venv\Scripts\Activate
//alternative windows powershell if doesn't work
.\venv\Scripts\Activate.ps1

pip install -r requirements.txt
#Run the app
#main is the main file_name, reload for re-run every time you make changes
uvicorn main:app --reload

```

### 2. Environment Configuration

Create a `.env` file in the `/backend` folder using the `.env.example` file as a reference:

```env
NEON_DATABASE_URL=your_postgresql_url
MONGO_URI=your_mongodb_uri
AT_USERNAME=your_username
AT_API_KEY=your_api_key
SENDER_EMAIL=your_email
SMTP_PASSWORD=your_password

```

### 3. Running the System

**Backend:**

```bash
cd group_project/backend
uvicorn main:app --reload

```

*Access the API Documentation (Swagger) at:* `http://127.0.0.1:8000/docs`

**Frontend:**

```bash
cd group_project/frontend/regulatoru-compliance-ui
#install the dependencies necessary
npm install
npm start

```

---

## 🔐 Security Disclaimer

This project uses environment variables (`.env`) to manage sensitive credentials. **Never commit the `.env` file to version control.** Always use the `.env.example` template when sharing your code.

---


### Pro-Tip for your Presentation:

When you push this to GitHub, make sure you also create a `requirements.txt` file if you haven't already. If you haven't generated one yet, you can do it by running this in your terminal while your virtual environment is active:

```bash
pip freeze > requirements.txt
