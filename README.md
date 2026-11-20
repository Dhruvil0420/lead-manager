# Lead Manager

A full-stack, production-ready Lead Management web application built with **React (Vite)**, **Tailwind CSS**, **Node.js**, **Express**, and **MongoDB (Mongoose)**. Designed with clean architectural separation, strict multi-user data isolation, standard RESTful error responses, and a responsive UI.

---

## Table of Contents

- [Features](#features)
- [Demo Credentials](#demo-credentials)
- [Tech Stack & Architecture Decisions](#tech-stack--architecture-decisions)
- [Folder Structure](#folder-structure)
- [Local Setup & Getting Started](#local-setup--getting-started)
- [Seed Demo Data](#seed-demo-data)
- [API Reference](#api-reference)
- [Database Design & Indexing Strategy](#database-design--indexing-strategy)
- [Assumptions & Design Tradeoffs](#assumptions--design-tradeoffs)
- [Future Improvements (With More Time)](#future-improvements-with-more-time)
- [Engineering Highlights & Tricky Challenges](#engineering-highlights--tricky-challenges)

---

## Features

### Core Features
- **Lead Creation & Editing**: Create and update leads with Name, Email, Phone, Company, Source (`Website`, `Referral`, `LinkedIn`, `Cold Call`, `Event`, `Other`), and Status (`New`, `Contacted`, `Qualified`, `Lost`).
- **Pipeline Table**: Responsive table displaying leads with color-coded status badges, formatted creation dates, and action menus.
- **Color-Coded Status Badges**:
  - `New`: Blue
  - `Contacted`: Yellow / Amber
  - `Qualified`: Green / Emerald
  - `Lost`: Red / Rose
- **Two-Step Modal Deletion**: Reusable confirmation dialog displaying the lead's name before executing deletion to prevent accidental loss.
- **Search & Filter**: Debounced search by lead name (~400ms delay) and status filter dropdown.
- **Input Validation on Both Ends**: Validated with Zod on the server and mirrored on the client with inline field error mapping.

### Bonus Features
- **Authentication & User Data Isolation**: Secure signup and login using JWT and bcrypt (password min 6 characters). Users only see and manage their own leads (queries scoped to `req.user._id`; unauthorized requests return 404 to avoid leaking ID existence).
- **Server-Side Pagination & Sorting**: Whitelist sorting by `name`, `company`, `status`, and `createdAt` (asc/desc), with page navigation and automatic page reset when filters change.
- **Dashboard Stat Cards**: Real-time aggregation cards displaying total leads and count per status. Clicking a card instantly filters the table by that status.
- **Resilient UX**:
  - Loading skeleton placeholders for cards and table rows.
  - Distinct empty states for "No leads yet" vs "No results found for search/filter".
  - Network error banner with a one-click **Retry** action.
  - Brute-force rate limiting on auth endpoints (20 attempts per 15 min per IP).

---

## Demo Credentials

For quick evaluation and testing without registering a new account:

| Field | Value |
|---|---|
| **Email** | `lead@30gmail.com` |
| **Password** | `Lead123` |

> [!NOTE]
> Run `npm run seed` in the `server/` directory to automatically provision this demo account and pre-populate 60 realistic leads.

---

## Tech Stack & Architecture Decisions

| Layer | Technology | Why Chosen |
|---|---|---|
| **Frontend** | React 19 + Vite | Blazing fast build tooling, minimal overhead, instant Hot Module Replacement (HMR). |
| **Styling** | Tailwind CSS | Utility-first CSS ensuring consistent spacing, accessible color palettes, and responsive design without bloated CSS bundles. |
| **Routing & State** | React Router v7 + React Context | Clean SPA routing, centralized authentication context, and dedicated custom hooks (`useLeads`, `useDebounce`, `useAuth`) keeping components modular. |
| **Backend** | Node.js + Express 5 | Lightweight, non-blocking asynchronous event loop with predictable middleware chaining. |
| **Database** | MongoDB + Mongoose 9 | Flexible document model with schema validation, native aggregation pipelines for real-time stats, and compound index support. |
| **Validation** | Zod | Declarative, TypeScript-friendly schema validation with automatic string-to-number type coercion and custom regex checks. |
| **Security** | Helmet, CORS, bcrypt, JWT, Rate Limiting | Standard defense-in-depth security: secure HTTP headers, origin checks, salted password hashing, stateless tokens, and brute-force mitigation. |

---

## Folder Structure

```text
lead-manager/
├── .gitignore
├── README.md
├── server/
│   ├── .env.example
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── src/
│       ├── index.js                # App entrypoint (connects DB & boots server)
│       ├── app.js                  # Express middleware configuration & route mounting
│       ├── config/
│       │   └── db.js               # Mongoose connection logic & error handling
│       ├── controllers/
│       │   ├── authController.js   # Signup, login, and me handlers
│       │   └── leadController.js   # CRUD operations, query filters & aggregation stats
│       ├── middleware/
│       │   ├── auth.js             # JWT verification & req.user attachment
│       │   ├── errorHandler.js     # Centralized error handler & 404 handler
│       │   ├── rateLimiter.js      # Auth rate limiting via express-rate-limit
│       │   └── validate.js         # Reusable Zod validation middleware (body/query)
│       ├── models/
│       │   ├── User.js             # User model with bcrypt pre-save hash & methods
│       │   └── Lead.js             # Lead model with user reference and compound indexes
│       ├── routes/
│       │   ├── authRoutes.js       # /api/auth routes
│       │   └── leadRoutes.js       # /api/leads routes (protected)
│       ├── seed/
│       │   └── seed.js             # Idempotent database seeder (60 sample leads + demo user)
│       └── validators/
│           ├── authSchema.js       # Zod schemas for signup and login
│           └── leadSchema.js       # Zod schemas for create, update, and query params
└── client/
    ├── .env.example
    ├── .env
    ├── .gitignore
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── vite.config.js
    └── src/
        ├── main.jsx                # React DOM mount point
        ├── App.jsx                 # Route definitions & global providers
        ├── index.css               # Tailwind CSS directives & global resets
        ├── api/
        │   └── axios.js            # Axios instance with auth header and 401 interceptor
        ├── context/
        │   └── AuthContext.jsx     # Authentication state, login, signup, and logout
        ├── hooks/
        │   ├── useDebounce.js      # Custom debounce hook for search input
        │   └── useLeads.js         # Leads fetching, filtering, and mutation hook
        ├── components/
        │   ├── ConfirmDialog.jsx   # Delete confirmation modal
        │   ├── LeadFormModal.jsx   # Reusable Add & Edit lead modal
        │   ├── Modal.jsx           # Generic accessible modal (ESC key & body scroll lock)
        │   ├── Navbar.jsx          # Responsive navigation bar with user badge & logout
        │   ├── ProtectedRoute.jsx  # Route guard redirecting unauthenticated users to /login
        │   ├── StatCards.jsx       # Interactive status cards with loading skeletons
        │   └── StatusBadge.jsx     # Status badge with dot indicator
        └── pages/
            ├── Dashboard.jsx       # Main dashboard (stats, table, search, pagination)
            ├── Login.jsx           # Login page with field validation & error alerts
            └── Signup.jsx          # Registration page with min 6 characters password check
```

---

## Local Setup & Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster URI.

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/Dhruvil0420/TempProject.git lead-manager
cd lead-manager
```

---

### Step 2: Configure Server Environment
1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
3. Update `.env` with your settings (defaults work out of the box for local MongoDB):
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/lead_manager
   JWT_SECRET=lead_manager_dev_secret_key_12345
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
   ```
4. Install dependencies and start the backend:
   ```bash
   npm install
   npm run dev
   ```
   *The server will start at `http://localhost:5000`.*

---

### Step 3: Configure Client Environment
1. Open a new terminal and navigate to the `client/` directory:
   ```bash
   cd client
   ```
2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
3. Verify `.env` matches your server API URL:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Install dependencies and start the frontend:
   ```bash
   npm install
   npm run dev
   ```
5. Open your browser and visit: **`http://localhost:5173`**

---

### Step 4: Seed Demo Data (Optional but Recommended)
Populate 60 sample leads and provision the demo account:
```bash
cd server
npm run seed
```

---

## Seed Demo Data

The application provides an idempotent seeding script at `server/src/seed/seed.js` to quickly test the pipeline with high-quality sample data.

### How to Run:
```bash
cd server
npm run seed
```

### What It Does:
- **Environment & Connection**: Automatically loads `MONGO_URI` from `server/.env`.
- **Demo Account Creation & Sync**: Creates (or reuses) the demo user:
  - **Email**: `lead@30gmail.com`
  - **Password**: `Lead123` (hashed with bcrypt via the User model)
- **Strictly Idempotent**: Safely purges *only* this demo user's prior leads before inserting new ones. It never drops collections or modifies other users' records.
- **60 Realistic Leads**:
  - Mix of authentic Indian and international names and companies (`name@company.com` unique emails).
  - Valid international phone numbers conforming to `/^\+?[0-9\s\-()]{7,20}$/`.
  - Even distribution across all 6 lead sources: **Website**, **Referral**, **LinkedIn**, **Cold Call**, **Event**, **Other** (10 leads per source).
  - Status breakdown optimized for dashboard visualization:
    - **New**: 21 leads (~35%)
    - **Contacted**: 15 leads (~25%)
    - **Qualified**: 15 leads (~25%)
    - **Lost**: 9 leads (~15%)
  - Creation dates randomly distributed over the last 90 days with logically consistent updated timestamps.
- **Graceful Termination**: Prints a summary report, cleanly closes the Mongoose connection, and exits with code `0`.

---

## API Reference

All error responses strictly adhere to the standardized error contract:
```json
{
  "message": "Human-readable summary of the error",
  "errors": [
    {
      "field": "fieldName",
      "message": "Specific explanation for this field"
    }
  ]
}
```

### Endpoints Overview

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `GET` | `/api/health` | No | Health check and server status. |
| `POST` | `/api/auth/signup` | No | Register a new user account. |
| `POST` | `/api/auth/login` | No | Authenticate user and issue JWT. |
| `GET` | `/api/auth/me` | **Bearer** | Fetch profile of authenticated user. |
| `GET` | `/api/leads/stats` | **Bearer** | Status count aggregation for the current user. |
| `GET` | `/api/leads` | **Bearer** | List leads with search, filter, sort, and pagination. |
| `POST` | `/api/leads` | **Bearer** | Create a new lead scoped to the user. |
| `GET` | `/api/leads/:id` | **Bearer** | Fetch single lead by ID (user-scoped). |
| `PUT` | `/api/leads/:id` | **Bearer** | Update existing lead by ID (user-scoped). |
| `DELETE` | `/api/leads/:id` | **Bearer** | Delete lead by ID (user-scoped). |

---

### Endpoint Samples

#### 1. Signup (`POST /api/auth/signup`)
- **Request**:
  ```json
  {
    "name": "Sarah Connor",
    "email": "sarah@cyberdyne.com",
    "password": "password123"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "message": "User registered successfully",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsIn...",
      "user": {
        "_id": "673dd38a7e...",
        "name": "Sarah Connor",
        "email": "sarah@cyberdyne.com",
        "createdAt": "2026-11-20T14:40:00.000Z"
      }
    }
  }
  ```

#### 2. Get Leads with Query (`GET /api/leads?search=alex&status=Qualified&sortBy=name&order=asc&page=1&limit=10`)
- **Headers**: `Authorization: Bearer <TOKEN>`
- **Response (200 OK)**:
  ```json
  {
    "message": "Leads fetched successfully",
    "data": [
      {
        "_id": "673de15f...",
        "name": "Alex Vance",
        "email": "alex@blackmesa.com",
        "phone": "+1-555-0144",
        "company": "Black Mesa",
        "source": "Referral",
        "status": "Qualified",
        "user": "673dd38a7e...",
        "createdAt": "2026-11-20T14:45:00.000Z",
        "updatedAt": "2026-11-20T15:10:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
  ```

#### 3. Lead Stats (`GET /api/leads/stats`)
- **Headers**: `Authorization: Bearer <TOKEN>`
- **Response (200 OK)**:
  ```json
  {
    "message": "Lead statistics fetched successfully",
    "data": {
      "total": 12,
      "New": 5,
      "Contacted": 3,
      "Qualified": 3,
      "Lost": 1
    }
  }
  ```

---

## Database Design & Indexing Strategy

### 1. `User` Model
- `name`: String, required, trimmed
- `email`: String, required, unique, lowercase, trimmed
- `password`: String, required, bcrypt hashed with 10 salt rounds (`select: false` so it is never inadvertently exposed)
- `timestamps`: `createdAt`, `updatedAt`

### 2. `Lead` Model
- `name`: String, required, trimmed
- `email`: String, required, trimmed, lowercase
- `phone`: String, required, trimmed
- `company`: String, required, trimmed
- `source`: String, enum: `['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Event', 'Other']`
- `status`: String, enum: `['New', 'Contacted', 'Qualified', 'Lost']`, default: `'New'`
- `user`: ObjectId, ref `'User'`, required, indexed
- `timestamps`: `createdAt`, `updatedAt`

### Indexes & Reasoning
```javascript
leadSchema.index({ user: 1, status: 1 });
leadSchema.index({ user: 1, createdAt: -1 });
leadSchema.index({ user: 1, name: 1 });
leadSchema.index({ name: 1 });
```

1. **`{ user: 1, status: 1 }`**: Since all lead lookups are scoped to the authenticated user, compound indexing on `user` and `status` turns status filtering from an $O(N)$ collection scan into a fast $O(\log N)$ index scan.
2. **`{ user: 1, createdAt: -1 }`**: Powers the default dashboard sorting (most recent leads first) directly from the index, eliminating in-memory MongoDB sorting penalties.
3. **`{ user: 1, name: 1 }`**: Supports user-scoped name sorting and index-accelerated prefix regex searches.
4. **`{ name: 1 }`**: Standalone index for fast name querying.

---

## Assumptions & Design Tradeoffs

1. **Multi-Tenancy & Data Isolation**:
   - Leads belong strictly to the creating user.
   - If User A attempts to read, update, or delete User B's lead ID, the API returns a **404 Not Found** rather than a 403 Forbidden. This deliberate security practice avoids information disclosure regarding whether a given lead ID exists in the system.
2. **Token Storage**:
   - The JWT is stored in `localStorage` for rapid client-side hydration across page reloads. An Axios response interceptor immediately purges stale credentials and redirects to `/login` if any request receives a 401 Unauthorized.
3. **Regular Expression Safety (ReDoS)**:
   - Search inputs are sanitized with an `escapeRegex` utility on the backend before being applied to `$regex`, preventing Regular Expression Denial of Service (ReDoS) or syntax crashes from characters like `(`, `[`, or `*`.
4. **Flexible International Phone Format**:
   - Rather than locking users to a rigid US-only format, phone numbers are validated against `/^\+?[0-9\s\-()]{7,20}$/` on both frontend and backend to support common international conventions.

---

## Future Improvements (With More Time)

- **Comprehensive Automated Testing**:
  - Unit & Integration tests for Express controllers and middleware using **Jest + Supertest**.
  - Component and hook unit tests using **Vitest + React Testing Library**.
  - End-to-end user journeys using **Playwright** or **Cypress**.
- **Enhanced Authentication**:
  - Refresh token rotation stored in `HttpOnly`, `SameSite=Strict` cookies to mitigate XSS exposure.
  - Password reset via signed email verification tokens.
- **Data Export & Import**:
  - CSV / Excel lead export and bulk CSV lead ingestion with error reporting per row.
- **Soft Deletes**:
  - Retain deleted leads with a `deletedAt` timestamp and provide a "Trash" / "Restore" recovery workflow.
- **Activity Timeline & Notes**:
  - Sub-document array of call logs, meeting notes, and status transition timestamps.
- **Dockerization**:
  - A multi-stage `docker-compose.yml` spinning up MongoDB, Express, and Vite in isolated development and production containers.

---

## Engineering Highlights & Tricky Challenges

> "What I'm proud of / what was tricky"
>
> 1. **Robust Aggregation Pipelines**: In MongoDB aggregations, Mongoose does not automatically cast strings to `ObjectId` inside `$match`. Explicitly wrapping `new mongoose.Types.ObjectId(req.user._id)` ensured bulletproof aggregation across all MongoDB drivers while returning zero-filled stats even when a user has no leads for a status.
> 2. **Pagination Edge Cases**: Handling the classic "delete the last item on page $N$" scenario by proactively detecting `leads.length === 1 && page > 1` and smoothly navigating backwards prevented jarring empty table states.
> 3. **Zod v4 Schema Unification**: Zod v4 uses `.issues` rather than v3's `.errors`. Standardizing the validation middleware to handle both versions seamlessly ensured zero-dependency mismatch issues while guaranteeing our standardized error envelope `{ message, errors: [{ field, message }] }` across every failure path.

