# StudyNook – Server (Node.js + Express + MongoDB)

Backend API for the StudyNook Library Study Room Booking platform.

🌐 **Live Site:** https://express-mongo-db-study-nook-server.vercel.app

---

## Features

- 🔐 JWT authentication stored in HTTP-only cookies
- 🔑 Google OAuth via Google Identity Services token verification
- 🏠 Full CRUD for study rooms (owner-only edit/delete)
- 📅 Booking system with conflict detection (`$gte`/`$lte`)
- 🔍 Room search with `$regex`, amenity filter with `$in`
- 📊 `$push`/`$pull` for user bookings array management
- ✅ Ownership checks via `req.user.id` vs `room.ownerId`

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- bcryptjs, jsonwebtoken, cookie-parser
- google-auth-library (for Google token verification)
- cors, dotenv

## Getting Started

```bash
# Install dependencies
pnpm install

# Create .env from example
cp .env.example .env
# Fill in MONGODB_URI, JWT_SECRET, GOOGLE_CLIENT_ID

# Start development server
pnpm run dev

# Start production server
pnpm start
```

## Environment Variables

| Variable          | Description                            |
| ----------------- | -------------------------------------- |
| `MONGODB_URI`     | MongoDB connection string              |
| `JWT_SECRET`      | Secret key for signing JWTs            |
| `GOOGLE_CLIENT_ID`| Google OAuth 2.0 Client ID             |
| `CLIENT_URL`      | Allowed frontend origin(s), comma-sep  |
| `PORT`            | Server port (default: 5000)            |

## API Routes

### Auth

| Method | Route                 | Auth | Description                        |
| ------ | --------------------- | ---- | ---------------------------------- |
| POST   | `/api/auth/register`  | ❌   | Register a new user                |
| POST   | `/api/auth/login`     | ❌   | Login with email & password        |
| POST   | `/api/auth/google`    | ❌   | Google OAuth login / registration  |
| POST   | `/api/auth/logout`    | ❌   | Logout (clears HTTP-only cookie)   |
| GET    | `/api/auth/me`        | ✅   | Get the currently authenticated user |

### Rooms

| Method | Route                     | Auth | Description                                           |
| ------ | ------------------------- | ---- | ----------------------------------------------------- |
| GET    | `/api/rooms`              | ❌   | Get all rooms (supports `?search=`, `?amenities=`, `?minRate=`, `?maxRate=`) |
| GET    | `/api/rooms/latest`       | ❌   | Get the 6 most recently added rooms (home page)       |
| GET    | `/api/rooms/amenities`    | ❌   | Get the full list of supported amenity options        |
| GET    | `/api/rooms/my-listings`  | ✅   | Get all rooms owned by the authenticated user         |
| GET    | `/api/rooms/:id`          | ❌   | Get a single room by ID                               |
| POST   | `/api/rooms`              | ✅   | Create a new room listing                             |
| PUT    | `/api/rooms/:id`          | ✅   | Update a room (owner only)                            |
| PATCH  | `/api/rooms/:id`          | ✅   | Partial update a room (owner only)                    |
| DELETE | `/api/rooms/:id`          | ✅   | Delete a room and its bookings (owner only)           |

### Bookings

| Method | Route                       | Auth | Description                                      |
| ------ | --------------------------- | ---- | ------------------------------------------------ |
| POST   | `/api/bookings`             | ✅   | Create a booking (with time-conflict detection)  |
| GET    | `/api/bookings/my`          | ✅   | Get all bookings for the authenticated user      |
| PATCH  | `/api/bookings/:id/cancel`  | ✅   | Cancel a booking (owner only, future dates only) |

### Health

| Method | Route         | Auth | Description             |
| ------ | ------------- | ---- | ----------------------- |
| GET    | `/`           | ❌   | API name & status ping  |
| GET    | `/api/health` | ❌   | Health check endpoint   |
