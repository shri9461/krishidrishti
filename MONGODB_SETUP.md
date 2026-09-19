# 🌾 MongoDB Database Guide for KrishiDrishti

This guide explains how to connect, configure, and manage the **MongoDB** database for the KrishiDrishti backend.

---

## ⚡ Quick Start: Choose Your Setup

You can run MongoDB using either **Cloud (Atlas)** or **Local Server**.

| Feature | MongoDB Atlas (Cloud) 🌟 | Local MongoDB Server | Dev In-Memory Mode |
|---|---|---|---|
| **Setup Time** | 2 minutes | 5-10 minutes | Instant (0 sec) |
| **Installation** | None required | Windows MSI / winget | None (bundled) |
| **Accessibility** | Accessible from anywhere | Local machine only | Volatile RAM only |
| **Cost** | 100% Free (M0 Cluster) | 100% Free | 100% Free |
| **Recommended For** | **Development & Production** | Offline Development | Quick local testing |

---

## Option 1: MongoDB Atlas (Free Cloud Cluster) - Recommended

MongoDB Atlas gives you a free 512MB cloud database that is accessible from anywhere without needing to run any software on your PC.

### Step 1: Create a Free Account
1. Visit [MongoDB Atlas Registration](https://www.mongodb.com/atlas/database) and sign up (or sign in with Google/GitHub).
2. Choose **M0 (Free)** tier.
3. Select your preferred cloud provider and closest region (e.g., `AWS / Mumbai (ap-south-1)`).
4. Click **Create Deployment**.

### Step 2: Set Up Credentials & Network Access
1. **Database User**: Set a username (e.g., `krishiadmin`) and password. Click **Create Database User**. *(Note down the password!)*
2. **Network Access**: Under "Where would you like to connect from?", choose **Allow Access from Anywhere** (`0.0.0.0/0`) or add your current IP address.

### Step 3: Get Connection String
1. In the Atlas dashboard, click **Connect** on your cluster.
2. Select **Drivers** (Node.js).
3. Copy the connection string. It looks like:
   ```
   mongodb+srv://krishiadmin:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```
4. Replace `<password>` with your actual password and add `/krishdrishti` before the `?`:
   ```
   mongodb+srv://krishiadmin:YourPassword123@cluster0.abcde.mongodb.net/krishdrishti?retryWrites=true&w=majority
   ```

### Step 4: Add to `server/.env`
Open `server/.env` and paste your string:
```env
MONGODB_URI=mongodb+srv://krishiadmin:YourPassword123@cluster0.abcde.mongodb.net/krishdrishti?retryWrites=true&w=majority
```

### Step 5: Test & Seed
In your terminal, run:
```powershell
# 1. Test database connection
npm run db:test

# 2. Seed default data (Admin, farmers, mandis, schemes)
npm run db:seed
```

---

## Option 2: Local MongoDB Community Server (Windows)

If you prefer to run MongoDB locally on your Windows computer:

### Method A: Install via PowerShell (winget)
Open PowerShell and run:
```powershell
winget install MongoDB.Server
```

### Method B: Manual MSI Installer
1. Download MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community).
2. Select **Windows x64** and download the `.msi` installer.
3. Run the installer:
   - Select **Complete** installation.
   - Keep **"Run MongoDB as a Service"** checked.
   - (Optional) Check "Install MongoDB Compass" for a visual GUI.
4. Finish installation.

### Start the Service:
Open PowerShell as Administrator:
```powershell
net start MongoDB
```

### Configure `server/.env`:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/krishdrishti
```

### Test & Seed:
```powershell
npm run db:test
npm run db:seed
```

---

## Option 3: Automatic In-Memory Dev Mode

The backend includes a zero-config fallback runner (`mongodb-memory-server`).
If no local MongoDB service is running and no Atlas URI is provided:
- The backend automatically boots an in-memory MongoDB instance.
- You can develop, test endpoints, register farmers, and view mandis immediately without any setup.
- *Note:* In-memory data is kept in RAM and resets when the server is restarted.

---

## 🛠️ Database Management Commands

Run these commands from the root directory:

| Command | Action |
|---|---|
| `npm run db:test` | Pings the database, tests latency, and prints document counts |
| `npm run db:seed` | Populates database with sample admin, farmers, mandi prices, and government schemes |
| `npm run db:reset` | Drops existing collections and cleanly reseeds fresh data |

---

## 📦 Database Schemas & Collections

The KrishiDrishti database contains the following collections:

1. **`users`** (Farmers): Name, email, hashed password, phone, village location, state (`Maharashtra`, `Punjab`, `Haryana`, etc.), preferred language (`en`, `hi`).
2. **`admins`**: Administrator credentials with elevated system broadcast privileges.
3. **`marketprices`**: Real-time mandi commodity prices (Wheat, Onion, Paddy, Tomato, Cotton, etc.) with state, market, price per quintal, and trend indicators (`up`, `down`, `stable`).
4. **`schemes`**: Government agricultural welfare initiatives (PM-KISAN, PM-KUSUM, PMFBY, Soil Health Card, PKVY, KCC, SMAM).
5. **`weatherhistories`**: Weather telemetry logs (temperature, humidity, wind, rainfall alerts, agronomic recommendations).
6. **`notifications`**: Real-time broadcast alerts and advisories distributed via Socket.io.
7. **`cropdiagnoses`**: Plant pathology scans and leaf disease diagnostics linked to farmer accounts.

### Default Seed Accounts:

- **Admin Account**:
  - Email: `admin@agrismart.com`
  - Password: `adminpassword`
- **Demo Farmer Account**:
  - Email: `ramesh.patil@example.com`
  - Password: `farmerpassword123`
