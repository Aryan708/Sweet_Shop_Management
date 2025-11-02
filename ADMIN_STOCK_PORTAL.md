# Admin Stock Management Portal Guide

## 🎯 Overview

The system now has a **separate admin portal** where only admins can add items to stock. Customers can only see and purchase items that have been marked as **available** by admins.

---

## 🔐 Admin Portal Access

### URL: `/admin/sweets/manage_stock/`

**Full URL:** http://127.0.0.1:8000/admin/sweets/manage_stock/

### How to Access:

1. **Start Django server:**
   ```powershell
   cd c:\Sweet_shop
   .\venv\Scripts\Activate.ps1
   python manage.py runserver
   ```

2. **Login to Django Admin:**
   - Go to: http://127.0.0.1:8000/admin/
   - Login with admin credentials:
     - Username: `admin`
     - Password: `admin123`

3. **Navigate to Stock Management:**
   - Direct link: http://127.0.0.1:8000/admin/sweets/manage_stock/
   - Or go to: **Sweets** → **Stock Management Portal** (if link added)

---

## 📋 Admin Portal Features

The **Stock Management Portal** shows:

### 1. **Statistics Dashboard**
   - Total Items: Count of all sweets
   - Available for Customers: Items with `is_available=True`
   - Not Available: Items with `is_available=False`

### 2. **Available Items Section** ✅
   - Shows all items that customers can see and purchase
   - These items have `is_available=True`
   - Customers will see these in the React frontend

### 3. **Unavailable Items Section** ❌
   - Shows items hidden from customers
   - These items have `is_available=False`
   - Customers **cannot** see these items

### 4. **Actions**
   - **Add New Item**: Create new sweets and add them to stock
   - **Edit Items**: Change availability status
   - **Quick Toggle**: Use the list view to quickly toggle `is_available`

---

## 🔧 How Admin Controls Stock

### Adding Items to Stock:

1. **From Admin Portal:**
   - Click "➕ Add New Item to Stock"
   - Fill in sweet details (name, category, price, quantity, stock_level)
   - **Important:** Check ✅ `is_available` to make it visible to customers
   - Save

2. **From Django Admin List:**
   - Go to: http://127.0.0.1:8000/admin/sweets/sweet/
   - Click "Add Sweet" button
   - Fill in details
   - Set `is_available = True` to make available
   - Save

### Making Items Available/Unavailable:

**Method 1: Quick Toggle (List View)**
- Go to: http://127.0.0.1:8000/admin/sweets/sweet/
- The `is_available` column is editable directly in the list
- Click to toggle checkbox ✅/❌

**Method 2: Edit Individual Item**
- Click on any sweet name
- Change `is_available` field
- Save

---

## 👥 Customer Experience

### What Customers See:

- ✅ **Only available items** (`is_available=True`)
- ✅ Can search and filter available items
- ✅ Can view details of available items
- ❌ **Cannot create** new items (403 Forbidden if they try)
- ❌ **Cannot update** items (403 Forbidden if they try)
- ❌ **Cannot see** unavailable items

### Customer API Behavior:

- `GET /api/sweets/` → Returns only items with `is_available=True`
- `GET /api/sweets/search/` → Searches only available items
- `GET /api/sweets/:id/` → Can only access available items
- `POST /api/sweets/` → **403 Forbidden** (Admin only)
- `PUT /api/sweets/:id/` → **403 Forbidden** (Admin only)
- `DELETE /api/sweets/:id/` → **403 Forbidden** (Admin only)

---

## 🔒 Permission Summary

### Admin Users (`is_staff=True`):
- ✅ Can see **all items** (available and unavailable)
- ✅ Can create new items
- ✅ Can update any item
- ✅ Can delete items
- ✅ Can set `is_available` status
- ✅ Can access admin portal at `/admin/sweets/manage_stock/`

### Regular Users:
- ✅ Can see **only available items** (`is_available=True`)
- ❌ Cannot create items (403 Forbidden)
- ❌ Cannot update items (403 Forbidden)
- ❌ Cannot delete items (403 Forbidden)
- ❌ Cannot see `is_available` field in API responses

---

## 📊 Workflow Example

1. **Admin adds new chocolate bar:**
   - Admin logs into Django Admin
   - Creates new Sweet: "Premium Chocolate Bar"
   - Sets `is_available = False` (not ready yet)
   - Saves

2. **Customer checks shop:**
   - Customer logs into React frontend
   - Sees **no chocolate bar** (it's not available)
   - Can only see items that admin marked as available

3. **Admin makes it available:**
   - Admin goes to `/admin/sweets/manage_stock/`
   - Clicks "Edit" on "Premium Chocolate Bar"
   - Changes `is_available = True`
   - Saves

4. **Customer checks shop again:**
   - Customer refreshes dashboard
   - Now sees "Premium Chocolate Bar" ✅
   - Can purchase it!

---

## 🎯 Quick Reference

**Admin Portal:** http://127.0.0.1:8000/admin/sweets/manage_stock/  
**Stock Report:** http://127.0.0.1:8000/admin/sweets/stock_report/  
**All Items List:** http://127.0.0.1:8000/admin/sweets/sweet/  
**Admin Login:** http://127.0.0.1:8000/admin/ (admin / admin123)

---

**✅ System is ready!** Admins control what customers can see and purchase!

