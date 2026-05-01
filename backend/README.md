# Spanish Poker Dice Platform — Backend

A Node.js/Express/MongoDB REST API for the Spanish Poker Dice platform, built as part of IDG2100 Fullstack 2026.

## Prerequisites

- Node.js (v18 or higher)
- npm
- MongoDB running locally (e.g. via MongoDB Compass or mongod)

## Installation

1. Navigate to the backend folder:
```bash
   cd backend
```
2. Install dependencies:
```bash
   npm install
```
3. Create a `.env` file in the backend root with the following content:
```
BACKEND_PORT=9000
DB_HOSTNAME=localhost
DB_PORT=27017
DB_NAME=gameApp
APP_SALT=your_own_random_string_here
```

Replace `your_own_random_string_here` with any long random string of your choice.

## Running the Application

```bash
npm run dev
```

The API will be available at `http://localhost:9000/api`.

## Seeding the Database

To populate the database with dummy data for testing:

```bash
npm run seed
```

This will create:
- Sample users (all with password `password123`)
- Game variants (all 18 combinations)
- Sample games in various states (waiting, ongoing, finished)
- Sample tournaments
- Sample comments

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/users/register | Register a new user |
| POST | /api/users/login | Log in |
| GET | /api/users/:id | Get user profile |
| PUT | /api/users/:id | Update user profile |
| PUT | /api/users/:id/avatar | Upload avatar |
| GET | /api/games | Get all games |
| GET | /api/games/:id | Get a single game |
| POST | /api/games/matchmake | Create or join a game |
| GET | /api/tournaments | Get all tournaments |
| GET | /api/tournaments/:id | Get a single tournament |
| POST | /api/tournaments/:id/join | Join a tournament |
| GET | /api/comments | Get comments |
| POST | /api/comments | Post a comment |
| GET | /api/leaderboard | Get leaderboard |