# Project Setup

This repository contains two main parts:

1. **Server** (API/backend)
2. **Next.js App** (frontend)

Follow the steps below to get both running locally.

---

## 1. Start the Server

```bash
# Navigate into the server folder\ ncd server

# Install dependencies
npm install

# Start the development server
npm run dev
```

The server will start on its designated port (typically `http://localhost:8080` unless configured otherwise).

---

## 2. Start the Next.js App

```bash
# From the root directory of the project

# Install Next.js dependencies
npm install

# Start the Next.js development server
npm run dev
```

The Next.js app will be available at `http://localhost:3000` by default.

---

## Environment Variables

Make sure you have a `.env` file in **server/.env** path.
The .env file is in the zip we uploaded on canvas
