# Academic Data Management System

A full-stack web application for managing academic and administrative data for faculty, HODs, and students at LNMIIT.  
This system supports role-based dashboards, data entry, editing, and report generation for various academic modules.

---

## Features

- **Role-based Authentication:**  
  - Faculty, HOD, and HOD Office roles with JWT-based login.
- **Modular Data Entry:**  
  - Faculty Info, Publications, Expert Talks, Events, Student Modules, Projects/Patents/MoUs, Paper Reviews, Annual Reports, and more.
- **File Uploads:**  
  - Upload certificates, reports, and supporting documents.
- **Edit & Search:**  
  - Edit existing entries and search by various fields.
- **Report Generation:**  
  - Download Excel (and future PDF/Word) reports for any module, filtered by academic year or date range.
- **Responsive UI:**  
  - Sidebar navigation, top navbar, and form layout with no overlap.
- **Forgot Password:**  
  - OTP-based password reset via email.

---

## Tech Stack

- **Frontend:** React, React Router, CSS (custom, modular)
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Other:** Multer (file uploads), JWT (auth), Nodemailer (email), ExcelJS, docx, jsPDF

---

## Folder Structure

```
LUSIP Project/
│
├── backend/
│   ├── routes/           # All Express route modules (Faculty, Student, Publications, etc.)
│   ├── uploads/          # Uploaded files (certificates, reports, etc.)
│   ├── db.js             # MySQL connection pool
│   ├── server.js         # Express app entry point
│   └── .env              # Environment variables (DB, email, JWT secret)
│
├── client/
│   ├── public/
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/   # All React components (HOD, Faculty, Sidebar, Navbar, etc.)
│   │   ├── App.jsx
│   │   └── App.css
│   └── package.json
│
├── package.json          # Root scripts for dev, client, server
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MySQL server

### 1. Clone the Repository

```sh
git clone <your-repo-url>
cd LUSIP\ Project
```

### 2. Setup the Database

- Create a MySQL database named `academic_portal`.
- Import your schema and tables as required.

### 3. Configure Environment Variables

Edit `backend/.env`:

```
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=academic_portal

PORT=5000
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_HOST=smtp.gmail.com

JWT_SECRET=your_jwt_secret
```

### 4. Install Dependencies

#### Backend

```sh
cd backend
npm install
```

#### Frontend

```sh
cd ../client
npm install
```

### 5. Run the Application

From the project root:

```sh
npm run dev
```

- This runs both backend (on port 5000) and frontend (on port 3000) concurrently.

---

## Usage

- Visit [http://localhost:3000](http://localhost:3000)
- Login with your LNMIIT email and password.
- Use the sidebar to navigate modules.
- HODs and HOD Office have access to more modules and report generation.
- Faculty can access their dashboard and reports.

---

## Project Structure Overview

- **Backend:**  
  - All API endpoints are under `/api/` (e.g., `/api/faculty-info`, `/api/publications`, etc.)
  - File uploads are handled via Multer and stored in `/backend/uploads/`.
  - JWT authentication middleware in `/backend/middleware/auth.js`.

- **Frontend:**  
  - React components for each module in `/client/src/components/`.
  - Sidebar and Navbar are always visible and never overlap forms.
  - Each module (e.g., Publications, Student, Faculty) has its own form and list view.

---

## Customization

- **Add new modules:**  
  - Create a new route in `backend/routes/` and a React component in `client/src/components/HOD/`.
- **Change sidebar links:**  
  - Edit `Sidebar.jsx` and `Sidebar.css`.
- **Change report formats:**  
  - Update the relevant backend route (e.g., `/routes/FacultyInfo.js`, `/routes/publications.js`).

---

## Security

- Passwords are hashed using bcrypt.
- JWT tokens are used for authentication and role-based access.
- OTP-based password reset via email.

---

## License

This project is for academic use at LNMIIT.  
Contact the maintainers for reuse or contributions.

---

##