## 📥 Step 1: Download/Clone the Project

### Option A: Clone from GitHub (Recommended)
```bash
git clone https://github.com/suryacse2019/Mearn-Health-Care-Appointment-System.git

cd healthcare-appointment-system
```

### Option B: Download as ZIP
1. Visit GitHub repository
2. Click "Code" → "Download ZIP"
3. Extract ZIP file
4. Open folder in terminal

---

## 🔧 Step 2: Backend Setup

The backend is the **server** that handles data and logic.

### 2.1 Navigate to Backend Folder
```bash
cd backend
```

### 2.2 Install Dependencies
```bash
npm install
```
This downloads all required packages (takes 1-2 minutes)

### 2.3 Create `.env` File
Create a new file named `.env` in the backend folder:

**File: `backend/.env`**
```env
# Server Configuration
PORT=8000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/healthcare

# Frontend Configuration (For CORS)
FRONTEND_URL=http://localhost:3000

# JWT Secret (Change this to something secure)
JWT_SECRET=your_super_secret_key_12345_change_this

# API Configuration
API_URL=http://localhost:4000/api

# CORS Settings
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true
```

**If using MongoDB Atlas (Cloud):**
Replace the `MONGODB_URI` with your connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/healthcare?retryWrites=true&w=majority
```

### 2.4 Start Backend Server
```bash
npm start
```

**Expected Output:**
```
🚀 =============================================
🏥 Healthcare Appointment System
✅ Server is running on port: 8000
📍 http://localhost:8000
🌐 Frontend: http://localhost:3000
💾 Database: mongodb://localhost:27017/healthcare
✅ MongoDB Connected
🚀 =============================================
```

✅ **Backend is ready!** Leave this terminal running.

---

## 🎨 Step 3: Frontend Setup

The frontend is the **user interface** (what users see in the browser).

### 3.1 Open New Terminal (Keep Backend Running)
Open a **NEW terminal window** or tab (don't stop the backend!)

### 3.2 Navigate to Frontend Folder
```bash
cd frontend
```

### 3.3 Install Dependencies
```bash
npm install
```
This downloads all required packages (takes 1-2 minutes)

### 3.4 Create `.env` File
Create a new file named `.env` in the frontend folder:

**File: `frontend/.env`**
```env
REACT_APP_API_URL=http://localhost:4000/api
REACT_APP_ENV=development
REACT_APP_NAME=Healthcare Appointment System
```

### 3.5 Start Frontend Server
```bash
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

✅ **Browser will automatically open** at `http://localhost:3000`

---
 
## 📁 Project Folder Structure

```
healthcare-appointment-system/
│
├── backend/                          ← Server (Port 4000)
│   ├── controllers/                  ← Business logic
│   ├── routes/                       ← API endpoints
│   ├── models/                       ← Database schemas
│   ├── middleware/                   ← Auth, CORS, etc
│   ├── .env                          ← Configuration (CREATE THIS!)
│   ├── server.js                     ← Main server file
│   └── package.json
│
├── frontend/                         ← User Interface (Port 3000)
│   ├── src/
│   │   ├── pages/                    ← Web pages
│   │   ├── components/               ← UI components
│   │   ├── services/                 ← API calls
│   │   ├── styles/                   ← CSS styles
│   │   ├── App.js                    ← Main app
│   │   └── index.js                  ← React entry
│   ├── .env                          ← Configuration (CREATE THIS!)
│   └── package.json
│
└── README.md                         ← This file
```

---

   

### Backend (Node.js)
- Handles user login/registration
- Manages doctor data
- Processes appointment bookings
- Stores data in MongoDB
- Provides API endpoints

### Frontend (React)
- Shows login page
- Displays doctor list
- Shows appointment calendar
- Handles user interactions
- Communicates with backend

### Both Work Together
```
User clicks something in React App
    ↓
React sends request to Backend
    ↓
Backend processes and checks database
    ↓
Backend sends response back
    ↓
React displays result to user
```

---
 
**Frontend:**
```
Compiled successfully!
API URL: http://localhost:8000/api
```

---

## 🔗 Useful Links

- [Node.js Docs](https://nodejs.org/docs/)
- [React Docs](https://react.dev/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Express Docs](https://expressjs.com/)

---
 

## 📝 File Organization After Setup

```
healthcare-appointment-system/
├── backend/
│   ├── node_modules/          (auto-created by npm install)
│   ├── .env                   (CREATE: Database & Port config)
│   ├── server.js
│   ├── package.json
│   └── ...
│
├── frontend/
│   ├── node_modules/          (auto-created by npm install)
│   ├── .env                   (CREATE: API URL config)
│   ├── src/
│   ├── package.json
│   └── ...
│
└── README.md                  (This file)
```
