# SoleStore - Quick Start Guide

## 🚀 Starting the Application

### Prerequisites
- PHP 8.1+
- MySQL (XAMPP/local setup)
- Node.js 18+
- Composer installed

---

## Step 1: Start the Servers

### Terminal 1 - Laravel API Server
```bash
cd c:\Users\acer\storesole-react
php artisan serve
```
✅ Server runs on: **http://127.0.0.1:8000**

### Terminal 2 - React Frontend (Vite)
```bash
cd c:\Users\acer\storesole-react
npm run dev
```
✅ Frontend runs on: **http://localhost:5173**

---

## Step 2: Access the Application

### 🌐 Open in Browser
**http://localhost:5173**

### 📱 Admin Login
```
Email: admin@solestore.com
Password: password
```

### 👤 Customer Login
```
Email: customer@solestore.com
Password: password
```

---

## 📋 Feature Testing Checklist

### ✅ Task 1: Add Product
1. **Click** "+ Add Product" button (top-right of admin dashboard)
2. **Fill in form**:
   - Name: "Classic Black Sneaker"
   - Price: "1299.99"
   - Size: "38"
   - Stock: "50"
   - Description: "Comfortable school shoe"
   - Image: (optional - upload a photo)
3. **Click** "Create Product" button
4. **Expected**: Success alert → Redirects to Products page in 1.5s
5. **Verify**: New product appears in table

### ✅ Task 2: Products Page UI
1. **Navigate** to Admin → Products page
2. **Verify**:
   - ✅ Table with columns: Image, Name, Price, Size, Stock, Actions
   - ✅ Clean blue-themed design
   - ✅ Rounded corners & shadow on table
   - ✅ Search box (try typing a product name)
3. **Test Delete**:
   - Click red "Delete" button on any product
   - Confirm in dialog
   - Table auto-refreshes

### ✅ Task 3: Orders Status Dropdown
1. **Navigate** to Admin → Orders page
2. **Verify**:
   - ✅ Info cards showing: Total Orders, Pending, Ready for Pickup, Completed
   - ✅ Table with Order ID, Customer, Total, Status, Date
   - ✅ Status column has dropdown (not just text)
3. **Test Status Update**:
   - Click status dropdown on any order
   - Select different status:
     - Pending
     - Processing
     - Ready for Pickup
     - Delivered
     - Completed
   - **Expected**: Updates immediately without page reload
   - **Verify**: Status badge color changes

### ✅ Task 4: Export CSV Report
1. **Navigate** to Admin Dashboard
2. **Click** "Export Report" button (top-right)
3. **Expected**: 
   - CSV file downloads automatically
   - Filename: `sales-report-YYYY-MM-DD.csv`
4. **Open CSV in Excel/Sheets**:
   - Columns: Order ID, Customer Name, Total, Status, Date
   - Data populated from database

### ✅ Task 5: UI Elements
1. **Check all pages for**:
   - ✅ Blue color scheme (#0b5ed7)
   - ✅ Rounded cards/containers
   - ✅ Soft shadows
   - ✅ Clean spacing & padding
   - ✅ Responsive mobile layout (resize browser)
2. **Test button colors**:
   - Blue buttons: Primary actions (Add, Create, Update)
   - Red buttons: Delete actions
   - Hover effects on all buttons

---

## 🔧 Database Management

### View Migrations Status
```bash
php artisan migrate:status
```

### Seed Database (Test Data)
```bash
php artisan db:seed
```

### Reset & Reseed (Start Fresh)
```bash
php artisan migrate:fresh --seed
```

### View Database Tables (MySQL CLI)
```bash
mysql -u root -p storesole
SHOW TABLES;
SELECT * FROM products;
SELECT * FROM orders;
SELECT * FROM users;
```

---

## 📝 API Endpoints Reference

### Authentication
```
POST /api/auth/login
Body: { "email": "user@example.com", "password": "password" }
Response: { "token": "...", "user": {...} }

POST /api/auth/admin-login
Body: { "email": "admin@example.com", "password": "password" }
Response: { "token": "...", "user": {...} }
```

### Products (Protected by admin token)
```
GET /api/products
Response: [{ id, name, price, size, stock, description, image }, ...]

POST /api/products
Body: FormData { name, price, size, stock, description, image }
Response: { "product": {...}, "message": "..." }

PUT /api/products/:id
Body: FormData { name, price, size, stock, description, image }

DELETE /api/products/:id
Response: { "message": "Product deleted" }
```

### Orders (Protected by admin token)
```
GET /api/orders
Response: [{ id, user_id, total, status, created_at, user: {...} }, ...]

PUT /api/orders/:id
Body: { "status": "Processing" }
Allowed statuses: Pending, Processing, Ready for Pickup, Delivered, Completed
```

### Reports (Protected by admin token)
```
GET /api/reports/sales
Response: CSV file download
Columns: Order ID, Customer Name, Total, Status, Date
```

---

## 🛠️ Troubleshooting

### "Port 8000 in use"
```bash
php artisan serve --port=8001
```

### "Port 5173 in use"
```bash
npm run dev -- --port 5174
```

### Database connection error
1. Check `.env` file:
   ```
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=storesole
   DB_USERNAME=root
   DB_PASSWORD=
   ```
2. Verify MySQL is running
3. Create database if missing:
   ```bash
   mysql -u root -p -e "CREATE DATABASE storesole;"
   ```

### "Token invalid" or "Unauthorized"
1. Clear browser localStorage: F12 → Application → Clear All
2. Log out and log back in
3. Check if Bearer token is being sent: F12 → Network → check Request Headers

### Build errors
```bash
npm run build
# Or rebuild dependencies
rm -r node_modules package-lock.json
npm install
npm run build
```

---

## 📊 File Structure

```
storesole-react/
├── app/Http/Controllers/
│   ├── ProductController.php    ← Add, Edit, Delete Products
│   ├── OrderController.php      ← Order Management
│   ├── AuthController.php       ← Login
│   └── ReportController.php     ← CSV Export
├── app/Http/Middleware/
│   ├── ProtectAdmin.php         ← Admin Route Protection
│   └── ProtectUser.php          ← Customer Route Protection
├── database/migrations/
│   ├── *_create_users_table.php
│   ├── *_create_products_table.php
│   └── *_create_orders_table.php
├── resources/js/
│   ├── pages/admin/
│   │   ├── Dashboard.jsx        ← Report Export
│   │   ├── Products.jsx         ← Product List
│   │   ├── ProductCreate.jsx    ← Add Product Form
│   │   └── Orders.jsx           ← Order Status Management
│   └── utils/
│       ├── api.js               ← Axios with Token Auth
│       └── auth.js              ← Auth State Management
├── resources/scss/
│   ├── _variables.scss          ← Blue Theme Colors
│   └── pages/_dashboard.scss    ← Styling
└── routes/
    └── api.php                  ← API Route Definitions
```

---

## 🎨 Theme Colors

All colors defined in `resources/scss/_variables.scss`:

```scss
Primary Blue:     #0b5ed7
Dark Blue:        #084298
Accent Blue:      #6ea8fe
Light BG:         #f3f7ff
White:            #ffffff
Text:             #10213a
Soft Shadow:      rgba(15, 38, 84, 0.08)
```

---

## 📱 Responsive Design

All pages tested and responsive on:
- ✅ Desktop (1920px+)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (320px - 767px)

Test by resizing browser window or using DevTools device toolbar.

---

## 🚀 Production Build

```bash
npm run build
php artisan serve --host=0.0.0.0
```

Optimized build output goes to: `public/build/`

---

**Need Help?** Check the errors in browser DevTools (F12) or Laravel logs in `storage/logs/`

**Last Updated**: April 2, 2026
