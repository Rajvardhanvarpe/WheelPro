# 🚛 WheelPro — Truck Wheel Alignment Workshop Management System

> A full-stack, mobile-first workshop management application built for truck wheel alignment and leaf spring service centers. WheelPro digitalizes workshop operations — from truck tracking and alignment scheduling to invoicing and WhatsApp-based customer communication.

---

## 📌 Overview

WheelPro is a production-ready web application designed to replace paper-based registers in truck service workshops. It gives workshop owners a single, smart dashboard to manage their entire fleet database, track alignment due dates, generate professional invoices, and send instant WhatsApp reminders to truck owners and drivers — all from a phone or desktop.

Built for **G.Jadhav Enterprises**, Kolhapur — a professional truck alignment and leaf spring workshop.

---

## ✨ Features

### 🗂️ Truck Management
- Register trucks with owner name, driver name, phone numbers, truck type, and mileage
- Search trucks by number plate, owner name, or driver name
- View full truck profile with alignment history

### 📅 Alignment Tracking
- Record wheel alignment jobs per truck
- Auto-calculate next due dates based on KM intervals
- Live status updates: **OK**, **Due Soon**, **Overdue**
- Dedicated pages for Due Soon and Overdue trucks with full contact details

### 📊 Smart Dashboard
- Real-time stats: Total Trucks, Aligned (OK), Due Soon, Overdue
- Recent alignment activity feed
- Searchable truck list directly from the dashboard

### 💬 WhatsApp Reminders
- One-tap WhatsApp message to truck **owner** or **driver** individually
- Pre-filled professional message with truck number, driver name, and due date
- Works directly from Due Soon and Overdue sections — no copy-paste needed

### 🔔 Smart Browser Notifications
- Automatic push alerts for overdue and due-soon trucks
- Throttled to a maximum of **3 notifications per truck per day** (morning, afternoon, evening slots)
- No spam on page refresh — uses slot-based localStorage tracking

### 🧾 Billing & Invoice Generator
- Generate print-ready invoices for alignment and leaf spring services
- Auto-incrementing invoice numbers (INV-001, INV-002, ...)
- Itemized billing with quantity and amount
- Payment status: **Paid** / **Pending** with partial payment support
- Professional invoice layout with business header and signature block

### 📂 Pending Bills
- View all unpaid invoices
- Search by owner name or truck number
- Mark as paid with one click or record partial payments

### 📈 Reports
- Financial year-based billing reports
- Revenue summaries and payment analysis

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | [React.js](https://react.dev/) (Vite) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Database & Auth | [Supabase](https://supabase.com/) (PostgreSQL + Auth) |
| Routing | React Router v6 |
| Icons | Google Material Symbols |
| Notifications | Browser Notification API |
| Messaging | WhatsApp `wa.me` deep links |
| Hosting | Vercel / Any static host |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- A [Supabase](https://supabase.com/) project

### Installation

```bash
# Clone the repository
git clone https://github.com/Rajvardhanvarpe/WheelPro.git
cd wheelpro

# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run Locally

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

---

## 🗄️ Database Schema (Supabase)

### `trucks`
| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| truckNumber | text | Vehicle registration number |
| owner | text | Owner name |
| ownerPhone | text | Owner contact number |
| driver | text | Driver name |
| driverPhone | text | Driver contact number |
| type | text | Truck type (e.g. Semi-Trailer, Heavy Duty) |
| currentKM | integer | Current mileage reading |
| lastAlignmentDate | date | Date of last alignment |
| nextDueDate | date | Calculated next due date |
| status | text | OK / DUE_SOON / OVERDUE |

### `alignments`
| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| truckId | uuid | Reference to trucks table |
| truckNumber | text | Vehicle number |
| alignmentDate | date | Date of alignment |
| nextDueDate | date | Next scheduled due date |
| kmAtAlignment | integer | Mileage at time of service |

### `bills`
| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| invoiceNo | text | Auto-incremented invoice number |
| truckNumber | text | Vehicle number |
| truckOwnerName | text | Owner name |
| truckDriverName | text | Driver name |
| invoiceCategory | text | Alignment / Leaf spring work |
| items | jsonb | Array of line items |
| totalAmount | numeric | Total invoice amount |
| paymentStatus | text | Paid / Pending |
| advancePaid | numeric | Advance amount received |
| balanceDue | numeric | Remaining balance |
| date | date | Invoice date |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Layout.jsx          # App shell with sidebar & navigation
│   └── StatsCard.jsx       # Dashboard stat widget
├── contexts/
│   └── AuthContext.jsx     # Supabase auth context
├── pages/
│   ├── Dashboard.jsx       # Main dashboard
│   ├── TruckList.jsx       # All trucks with search
│   ├── TruckDetail.jsx     # Individual truck profile
│   ├── AddTruck.jsx        # Add new truck form
│   ├── AddAlignment.jsx    # Record new alignment
│   ├── DueSoonTrucks.jsx   # Trucks due within 7 days
│   ├── OverdueAlignments.jsx # Overdue trucks
│   ├── Billing.jsx         # Invoice generator
│   ├── PendingBills.jsx    # Unpaid invoices
│   ├── Reports.jsx         # Financial reports
│   └── Login.jsx           # Auth page
├── services/
│   ├── dataService.js      # All Supabase API calls
│   └── notificationService.js # Smart notification logic
└── config/
    └── supabaseClient.js   # Supabase client init
```

---

## 📸 Screenshots

> *(Add your screenshots here)*

---

## 📄 License

This project is proprietary software developed for **G.Jadhav Enterprises**, Kolhapur.
Not intended for redistribution without permission.

---

## 🙋 Author

Developed with ❤️ for G.Jadhav Enterprises  
783, Gokul Shirgoan Road, Next To Tata Motors, Kolhapur  
📞 982 277 2700 / 88770 01888
