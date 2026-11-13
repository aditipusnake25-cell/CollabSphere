## Setup

### 1. Backend Setup

Navigate to the backend folder:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder:

```env
PORT=5000
MONGODB_URI=mongodb_connection_string
JWT_SECRET=jwt_secret
GEMINI_API_KEY=gemini_api_key
```

Start the backend:

```bash
npm run dev
```

Backend runs at `http://localhost:5000`.

### 2. Frontend Setup

Navigate to the frontend folder:

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

The frontend will run at the local URL provided by Vite.
