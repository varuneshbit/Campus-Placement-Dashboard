# 🎓 PLACEMATE — Campus Placement Dashboard

A full-stack web application for managing campus placements. Built for placement officers to track students, schedule interviews, manage companies, and generate reports — all in one place.

---

## 📸 Features

- 🔐 **Role-based Auth** — Admin & Student login with JWT
- 👨‍🎓 **Student Management** — Add students via bulk Excel upload or manually
- 🏢 **Company & Drive Management** — Track placement drives and company details
- 📅 **Interview Scheduling** — Schedule interviews, track rounds and results
- 📊 **Analytics Dashboard** — Real-time placement stats, CTC averages, hiring trends
- 🗓️ **Event Calendar** — Auto-generated calendar events for drives and interviews
- 🤖 **AI Resume Analysis** — Gemini-powered resume scoring and feedback
- 🏆 **Leaderboard** — Student ranking by CGPA and placement status
- 📄 **Report Generation** — Export placement reports

---

## 🛠️ Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | React, Vite, CSS                        |
| Backend  | Node.js, Express.js                     |
| Database | MongoDB (Mongoose)                      |
| Auth     | JWT (JSON Web Tokens), bcryptjs         |
| AI       | Google Gemini API                       |
| Uploads  | Multer (resume/image handling)          |

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/try/download/community) (running locally on port 27017)
- [Git](https://git-scm.com/)

---

### 1. Clone the Repository

```bash
git clone https://github.com/varuneshbit/Campus-Placement-Dashboard.git
cd Campus-Placement-Dashboard
```

---

### 2. Set Up the Server

```bash
cd server
npm install
```

Create your `.env` file from the template:

```bash
copy .env.example .env    # Windows
# OR
cp .env.example .env      # Mac/Linux
```

Open `.env` and fill in your values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/placementDB
JWT_SECRET=any_random_secret_string
JWT_EXPIRE=30d
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_here
```

> 💡 Get a **free Gemini API key** at [aistudio.google.com](https://aistudio.google.com)

---

### 3. Seed the Database

The `seed-data.json` file contains all preloaded records (students, companies, drives, interviews, events).

```bash
npm run seed
```

This will populate your local MongoDB with all existing data.

---

### 4. Start the Server

```bash
npm run dev
```

Server runs at: **http://localhost:5000**

---

### 5. Set Up the Client (new terminal)

```bash
cd ../client
npm install
npm run dev
```

Client runs at: **http://localhost:5173**

---

## 🔑 Default Login Credentials

| Role    | Email                    | Password     |
|---------|--------------------------|--------------|
| Admin   | admin@placemate.edu      | Admin@1234   |
| Student | arjun.kumar@college.edu  | Student@1234 |

> All registered students use `Student@1234` as their default password.

---

## 📁 Project Structure

```
Campus-Placement-Dashboard/
├── client/                  # React frontend (Vite)
│   └── src/
│       ├── components/
│       ├── context/
│       └── pages/
└── server/                  # Node.js backend
    ├── controllers/
    ├── models/
    ├── routes/
    ├── middleware/
    ├── seed.js              # Database seeder
    ├── exportDb.js          # Export current DB to seed-data.json
    ├── seed-data.json       # Shared database records
    └── .env.example         # Environment variable template
```

---

## 🔄 Team Workflow — Syncing Database

When a teammate adds new records and wants to share them with the team:

**1. Teammate exports their DB:**
```bash
cd server
npm run export
```
This updates `seed-data.json`.

**2. They commit and push:**
```bash
git add server/seed-data.json
git commit -m "update: sync database records"
git push
```

**3. You pull and re-seed:**
```bash
git pull
cd server
npm run seed
```

---

## 📜 Available Scripts

### Server (`/server`)
| Command           | Description                              |
|-------------------|------------------------------------------|
| `npm run dev`     | Start server in development mode         |
| `npm run seed`    | Seed database from `seed-data.json`      |
| `npm run export`  | Export current DB to `seed-data.json`    |

### Client (`/client`)
| Command           | Description                              |
|-------------------|------------------------------------------|
| `npm run dev`     | Start React development server           |
| `npm run build`   | Build for production                     |

---

## 👥 Team

Built with ❤️ by the PLACEMATE team.
