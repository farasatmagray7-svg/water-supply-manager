# 💧 Water Supply Manager (Paani Supply System)

A complete, mobile-friendly web application designed for bottled water delivery businesses in Pakistan. It supports managing clients with custom bottle rates, daily route deliveries, 19L empty bottle stock tracking, running customer balances, monthly PDF invoices with WhatsApp share links, PKR currency formatting, bilingual support (English & Roman Urdu), dark/light themes, and database backup/restore.

---

## 🚀 Key Features

1. **Clients Management**
   - Add, edit, delete, and search client accounts by name, mobile number, or area.
   - Per-client custom rates for 4 bottle sizes: **19 Liter**, **6 Liter**, **1.5 Liter**, and **500 ml**.
   - Security deposit tracking per client.
   - Client detail page with full historical logs of deliveries, payments, and running balance.

2. **Daily Route Deliveries**
   - Quick delivery entry form with auto-rate calculation.
   - Record quantities delivered for all 4 bottle sizes.
   - Record 19L empty bottles returned during delivery.
   - Option to collect cash at delivery time.
   - Filter by "Today's Deliveries" vs all delivery history.

3. **Empty Bottle Tracking (19L)**
   - Tracks 19L bottles held per client (`Delivered 19L - Returned 19L`).
   - Security deposits collected summary.
   - Leaderboard showing clients holding the most 19L bottles.

4. **Billing & Payments**
   - Running customer balance (`Total Billed - Total Paid`).
   - Monthly printable invoice generator formatted for paper print / PDF save.
   - One-click **WhatsApp Share** button sending formatted invoice text directly to customer's WhatsApp.
   - Payment entry supporting **Cash**, **Bank Transfer**, **JazzCash**, and **Easypaisa**.
   - "Pending Dues" list sorted by highest balance due.

5. **Dashboard & Analytics**
   - Today's sales (PKR), today's deliveries count, total pending dues, and active clients count.
   - Monthly sales trend chart & bottle size sales split.
   - Top 5 clients by sales volume and Top 5 pending dues accounts.

6. **Reports & Exports**
   - Custom date range filter for deliveries and payment logs.
   - One-click **Export to CSV / Excel**.

7. **Bilingual & Themes**
   - Toggle between **English** and **Roman Urdu** across all screens.
   - Dark mode & Light mode toggle.
   - SQLite Database Backup download (`.sqlite`) and upload restore.

---

## 🛠 Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, React Router DOM
- **Backend**: Node.js, Express.js
- **Database**: SQLite3 (`water_manager.db`)
- **Authentication**: JWT token-based admin login

---

## 💻 How to Install & Run on Laptop

### Prerequisites
- Node.js (v18 or higher) installed on your computer.

### Step 1: Install Dependencies
Open terminal / command prompt in the project folder and run:
```bash
npm install
```

### Step 2: Seed Sample Data (Optional)
To populate sample Pakistani client accounts (Lahore, Karachi, Islamabad, Rawalpindi) and past delivery logs:
```bash
npm run seed
```

### Step 3: Build & Start Application

To run both backend API server and frontend build in production mode:
```bash
# Build frontend
npm run build

# Start server
npm run server
```
Open your browser and navigate to:
👉 **`http://localhost:5000`**

Or to run in development mode with live-reloading:
```bash
# Terminal 1: Backend Server (Port 5000)
npm run server

# Terminal 2: Vite Dev Server (Port 3000)
npm run dev
```

---

## 🔑 Default Admin Credentials

- **Username**: `admin`
- **Password**: `admin123`

*(Password can be updated anytime from the **Settings** page).*
