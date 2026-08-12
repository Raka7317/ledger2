# Rice Mill Book

Full-stack version of your Rice Mill Book: Node.js + Express backend, MongoDB Atlas
database, and the same dashboard UI you already had — now saving to the cloud instead
of the browser's localStorage.

```
rice-mill-book/
├── server.js            # Express app entry point
├── models/Entry.js      # Mongoose schema (entries)
├── models/User.js       # Mongoose schema (login users, hashed passwords)
├── middleware/auth.js   # JWT verification + admin-only guard
├── routes/entries.js    # /api/entries CRUD routes (login required, admin for write)
├── routes/auth.js       # /api/auth login + admin-only user management
├── seed-admin.js        # One-time script to create your first admin login
├── public/index.html    # Frontend (login screen + dashboard + forms)
├── package.json
├── .env.example
└── .gitignore
```

## 1. Set up MongoDB Atlas (free tier)

1. Go to https://www.mongodb.com/cloud/atlas/register and create a free account.
2. Create a new **Project** → **Build a Database** → choose the **M0 Free** tier.
3. Under **Database Access**, create a database user with a username + password
   (save these — you'll need them).
4. Under **Network Access**, click **Add IP Address** → **Allow Access from
   Anywhere** (`0.0.0.0/0`) — needed since your hosting provider's IP isn't fixed.
5. Click **Connect** on your cluster → **Drivers** → copy the connection string.
   It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Add a database name to it, e.g. `.../rice_mill_book?retryWrites=true&w=majority`.

## 2. Run locally

```bash
cd rice-mill-book
npm install
cp .env.example .env
```

Edit `.env` and paste your real connection string, plus a random secret for logins:

```
MONGO_URI=mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/rice_mill_book?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=some-long-random-string-nobody-can-guess
```

(Any long random string works for `JWT_SECRET` — it's used to sign login sessions.
Never reuse a value you've shared publicly.)

### Create your first admin login

Before anyone can log in, create one admin account (only needs to be done once):

```bash
npm run seed:admin -- youradminname YourStrongPassword123
```

Then start the server:

```bash
npm start
```

Open **http://localhost:5000** — you'll see a login screen. Log in with the
admin username/password you just created.

## 3. Deploy on the internet (Render — free, easiest)

Render can host the Node server, and since `server.js` also serves the `public/`
folder, you get one URL for both frontend and backend — no separate hosting needed.

1. Push this project to a GitHub repository.
2. Go to https://render.com → sign up/log in → **New** → **Web Service**.
3. Connect your GitHub repo.
4. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Under **Environment Variables**, add:
   - `MONGO_URI` = your Atlas connection string
   - `JWT_SECRET` = a long random string (used to sign login sessions)
   - `PORT` = `10000` (Render sets this automatically, but Express already
     falls back to `process.env.PORT`, so you can leave it out)
6. Click **Create Web Service**. Render will build and deploy — you'll get a
   live URL like `https://rice-mill-book.onrender.com`.
7. Once it's live, create your first admin account by running the seed
   command against the same `MONGO_URI` from your local machine:
   ```bash
   MONGO_URI="your-atlas-connection-string" npm run seed:admin -- youradminname YourStrongPassword123
   ```
   You only need to do this once — after that, log in on the live site and
   create additional users from the **Users** page in the sidebar.

**Alternative hosts** that work the same way (Node app + env var):
Railway (railway.app), Cyclic, Fly.io, or a VPS with PM2 + Nginx.

> Note: Render's free tier sleeps after inactivity, so the first request after
> a while takes ~30s to wake up. Fine for personal/shop use; upgrade to a paid
> plan if you need it always-on.

## 4. Login & user roles

The whole app is now behind a login screen. There are two roles:

- **Admin** — can view everything, add Kharid/Bikri/Payment entries, delete
  entries, and create/delete other users.
- **Viewer** — can log in and see the dashboard, search, and party history,
  but cannot add or delete anything (the entry forms and Delete buttons are
  hidden for them, and the server rejects those requests even if someone
  tries to call the API directly).

**Creating more users:** log in as admin → click **Users (Admin)** in the
sidebar → fill in username/password/role → **Banayein**. Give a password of
at least 6 characters. You can delete a user from the same page (you can't
delete the account you're currently logged in as).

**Forgot the admin password / locked out:** run the seed command again with
a new username to create a fresh admin account:
```bash
npm run seed:admin -- newadminname NewPassword123
```

**How it works under the hood:** passwords are hashed with bcrypt before
being stored (never saved as plain text). Logging in returns a signed JWT
token, which the browser stores and sends with every request; it expires
after 7 days, after which you'll be asked to log in again.

## 5. What changed from your original file

- Data is no longer stored in the browser (`localStorage`) — it's stored in
  MongoDB Atlas, so it's safe if you clear your browser, and accessible from
  any device once deployed.
- Added a small Express API:
  - `GET /api/entries` — fetch all entries (login required)
  - `POST /api/entries` — add a new entry (admin only)
  - `DELETE /api/entries/:id` — remove an entry (admin only)
  - `POST /api/auth/login` — log in, returns a token
  - `GET /api/auth/me` — check who's currently logged in
  - `GET /api/auth/users` / `POST /api/auth/users` / `DELETE /api/auth/users/:id` — admin-only user management
  - `GET /api/health` — simple check that the server is alive
- Added a **Delete** button per row on the dashboard (admin only).
- Added a login screen and role-based access (Admin vs Viewer).
- Added search-by-party-name, sort-by-date, and a Party History
  (date-range) search on the dashboard.
- Everything else (layout, Hindi labels, colors, dashboard cards) is unchanged.

## 6. Common issues

- **"MONGO_URI is not set" / "JWT_SECRET is not set" on startup** — you
  forgot to create `.env` locally, or forgot to add that environment
  variable on your hosting platform.
- **Could not load data (in browser)** — usually means the Atlas IP allowlist
  doesn't include your server's IP, or the username/password in the connection
  string is wrong (special characters in the password must be URL-encoded).
- **Stuck on the login screen / "Session khatam ho gaya"** — your token
  expired (after 7 days) or `JWT_SECRET` changed on the server; just log in
  again.
- **Local dev with auto-restart:** `npm run dev` (uses nodemon).
