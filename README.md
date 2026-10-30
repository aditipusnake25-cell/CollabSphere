# CollabSphere

AI-powered developer collaboration platform built with React, Node.js, Express, MongoDB and Google Gemini.

## Features

- User registration and login with bcrypt and JWT
- Create, view, update and delete projects
- Add and remove project members
- Create, read, update and delete project notes
- Upload and manage project files
- Gemini code explanation, documentation and README generation
- Public read-only project page

## Requirements

- Node.js (LTS)
- MongoDB running locally or a MongoDB Atlas connection string
- Gemini API key for AI features

## Setup

### 1. Backend

```bash
cd Backend
npm install
```

Update `Backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/collabsphere
JWT_SECRET=use_a_long_random_secret
GEMINI_API_KEY=your_gemini_api_key
```

Start the backend:

```bash
npm run dev
```

Backend runs at `http://localhost:5000`.

### 2. Frontend

Open a second terminal:

```bash
cd Frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

Set `VITE_API_URL=http://localhost:5000/api` in `Frontend/.env`.

## API overview

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/profile` | Current profile |
| GET, POST | `/api/projects` | List/create projects |
| GET, PUT, DELETE | `/api/projects/:id` | Read/update/delete project |
| POST | `/api/projects/:id/members` | Add member |
| DELETE | `/api/projects/:id/members/:memberId` | Remove member |
| GET | `/api/projects/public/:id` | Public project |
| POST | `/api/notes` | Create note |
| GET | `/api/notes/project/:projectId` | List project notes |
| PUT, DELETE | `/api/notes/:id` | Update/delete note |
| POST | `/api/files/:projectId` | Upload file (`file` field) |
| GET | `/api/files/project/:projectId` | List files |
| DELETE | `/api/files/:projectId/:fileId` | Delete file |
| POST | `/api/gemini/explain` | Explain content |
| POST | `/api/gemini/docs` | Generate documentation |
| POST | `/api/gemini/readme` | Generate README |

All endpoints except register, login, root health check and public project retrieval require:
`Authorization: Bearer YOUR_TOKEN`

## Notes

- The initial implementation uses local disk storage for uploads. For production deployment, use persistent storage such as Cloudinary or another object storage service.
- Keep both `.env` files private. Never commit API keys or JWT secrets.
- Only the project creator can update/delete projects or manage members.
- Public project pages work only after the creator sets `isPublic` to `true` through the project update API.
