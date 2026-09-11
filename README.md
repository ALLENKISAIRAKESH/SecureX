<p align="center">
  <img src="https://img.shields.io/badge/SecureX-Auth--as--a--Service-00d4ff?style=for-the-badge&logo=shield&logoColor=white" alt="SecureX Badge" />
</p>

<h1 align="center">SecureX — Authentication, Simplified</h1>

<p align="center">
  A production-ready, high-performance <strong>Authentication-as-a-Service (AaaS)</strong> platform designed for modern applications.
  <br />
  Includes developer SDK integration, TOTP 2FA, scoped API keys, real-time webhooks with HMAC verification, compliance audit logs, and an interactive API playground.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/JWT-HS256-000000?style=flat-square&logo=jsonwebtokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License" />
</p>

---

## 🌟 Features

### 🛡️ Enterprise Security & Identity
- **Scrypt Password Hashing**: Cryptographically salted scrypt hashing with constant-time (`crypto.timingSafeEqual`) authentication.
- **Two-Factor Authentication (TOTP)**: Google Authenticator / Authy compatibility with instant QR code generation and 8 emergency backup recovery codes.
- **Scoped API Keys**: Prefix-masked keys (`sx_live_...`) with granular permission controls (`read`, `write`, `admin`) and SHA-256 secure hash storage.
- **Security Hardening**: Helmet HTTP security headers, CORS origin management, and brute-force rate-limiting.

### 👥 Users & Identity Directory
- **End-User Administration**: Searchable directory for end-user identities with role assignment (`admin` / `user`).
- **One-Click Actions**: Account suspension/reactivation toggle, administrative password resets, and user invitations with auto-generated credentials.

### 📡 Webhooks & Real-Time Events
- **HMAC-SHA256 Signatures**: Dispatches signed HTTP POST events with cryptographic verification (`whsec_...`).
- **Granular Subscriptions**: Subscribe to `user.registered`, `user.login`, `user.2fa_enabled`, and `apikey.created`.
- **Live Test Ping**: Instant latency benchmarking and payload delivery inspector in the dashboard.

### 📋 Audit & Compliance Logs
- **SOC2 & HIPAA Ready**: Immutable audit trail of every authentication event, failed login, privilege change, and key lifecycle event.
- **Filters & Search**: Filter by user email, action type, or origin IP address.
- **1-Click CSV Export**: Download formatted compliance logs ready for external audits.

### 🧪 Developer Hub & Interactive API Playground
- **Live In-Browser API Console**: Test real REST endpoints, view latency timers, HTTP status codes, and formatted JSON output.
- **Multi-Language SDK Snippets**: Code examples in Node.js / Express, Python (FastAPI/Django), and cURL.
- **Drop-in Login Widget Simulator**: Preview the 3-line embeddable authentication modal.

---

## 🚀 Quick Start (Local Run)

### 1. Prerequisites
Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (running locally on port `27017` or a MongoDB Atlas URI)

### 2. Clone the Repository
```bash
git clone https://github.com/ALLENKISAIRAKESH/SecureX.git
cd SecureX
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment
Copy the sample environment file:
```bash
# On Linux / macOS / PowerShell:
cp .env.example .env
```

Edit `.env` if necessary:
```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/securex
JWT_SECRET=super_secret_jwt_key_securex_2026
TOTP_ISSUER=SecureX
CORS_ORIGIN=*
```

### 5. Start the Server
```bash
npm start
```

Open your browser and visit:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Default Test Credentials

You can sign in immediately using the pre-configured administrator account or register a new identity from the UI:

| Field | Value |
|---|---|
| **Email** | `alex@securex.dev` |
| **Password** | `SecureX@2026!` |
| **Role** | `Admin` |

---

## 📖 API Reference & Samples

### 1. System Health Check
```bash
curl -X GET http://localhost:3000/api/health
```

### 2. User Authentication (Login)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alex@securex.dev",
    "password": "SecureX@2026!"
  }'
```

### 3. Dashboard Statistics
```bash
curl -X GET http://localhost:3000/api/dashboard/stats \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### 4. Generate API Key
```bash
curl -X POST http://localhost:3000/api/keys \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production Service Key",
    "permissions": ["read", "write"]
  }'
```

### 5. Register Webhook Endpoint
```bash
curl -X POST http://localhost:3000/api/webhooks \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://api.yourdomain.com/webhooks/auth",
    "description": "User lifecycle sync",
    "events": ["user.registered", "user.login"]
  }'
```

---

## 📁 Project Architecture

```
SecureX/
├── middleware/
│   └── auth.js            # JWT verification & role authorization
├── models/
│   ├── ActivityLog.js     # Immutable compliance audit log schema
│   ├── ApiKey.js          # Scoped hashed API key schema
│   ├── User.js            # User identity & 2FA credentials schema
│   └── Webhook.js         # Webhooks & signing secrets schema
├── public/                # Frontend Single-Page Application
│   ├── css/
│   │   └── main.css       # Glassmorphic dark-theme design system
│   ├── js/
│   │   ├── components/    # Reusable Toast, Modal, Chart, and Loader
│   │   ├── pages/         # Landing, Auth, Dashboard, Users, Keys, Webhooks, Logs, Docs
│   │   ├── api.js         # Fetch client with auto JWT attachment
│   │   └── router.js      # Client-side hash router with auth guards
│   └── index.html         # Application shell
├── routes/
│   ├── auth.js            # Authentication, registration, 2FA, profile
│   ├── dashboard.js       # Analytics stats & activity feeds
│   ├── keys.js            # API key generation & revocation
│   ├── users.js           # Users directory & identity management
│   └── webhooks.js        # Webhook subscriptions & HMAC ping test
├── .env.example           # Environment template
├── .gitignore             # Git ignore rules
├── package.json           # Project manifest & scripts
├── README.md              # Documentation & guide
└── server.js              # Express entrypoint & security middleware
```

---

## 🛡️ License

This project is open-source software licensed under the [MIT License](LICENSE).
