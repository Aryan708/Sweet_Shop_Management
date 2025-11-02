# Sweet Shop Management System - Setup & Run Instructions

## Prerequisites

**Assumptions:** You should have the following installed:
- **Python 3.8+** and **pip** (for Django backend)
- **Node.js 16+** and **npm** (for React frontend)
- **Database:** SQLite is included (no MongoDB needed - project uses SQLite)

---

## Step 1: Backend Setup (Django REST Framework)

### 1.1 Install CORS Support (Required for React Frontend)

Open PowerShell/Terminal and run:

```powershell
cd c:\Sweet_shop
.\venv\Scripts\Activate.ps1
pip install django-cors-headers
```

### 1.2 Configure CORS in Django Settings

Add to `sweet_shop_project/settings.py`:

1. Add `'corsheaders'` to `INSTALLED_APPS` (after `'django.contrib.staticfiles'`)
2. Add `"corsheaders.middleware.CorsMiddleware"` to `MIDDLEWARE` (right after `SecurityMiddleware`)
3. Add CORS configuration at the end of settings.py:

```python
# CORS settings for React frontend
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]
CORS_ALLOW_CREDENTIALS = True
```

### 1.3 Start Django Backend Server

In **Terminal 1 (PowerShell):**

```powershell
cd c:\Sweet_shop
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

**Expected Output:**
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

**✅ Backend should be running at:** `http://127.0.0.1:8000/`

**Verify:** Open browser to `http://127.0.0.1:8000/api/sweets/` (should return 401, which is expected without auth)

---

## Step 2: Frontend Setup (React with Vite)

### 2.1 Create React Frontend Project (If Not Already Created)

In **Terminal 2 (PowerShell)** - open a NEW terminal window:

```powershell
# Navigate to project root (or parent directory if you want frontend separate)
cd c:\Sweet_shop

# Create Vite React app
npm create vite@latest frontend -- --template react

# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Install required packages
npm install react-router-dom axios
```

### 2.2 Copy React Source Files

Copy your existing React source files from `c:\Sweet_shop\src\` to `c:\Sweet_shop\frontend\src\`:

```powershell
# From c:\Sweet_shop directory
xcopy /E /I src frontend\src
```

Or manually copy:
- Copy `src/App.jsx` → `frontend/src/App.jsx`
- Copy `src/main.jsx` → `frontend/src/main.jsx`
- Copy `src/context/` → `frontend/src/context/`
- Copy `src/pages/` → `frontend/src/pages/`
- Copy `src/components/` → `frontend/src/components/`
- Copy `src/utils/` → `frontend/src/utils/`

### 2.3 Verify index.html Exists

Ensure `frontend/index.html` exists with:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sweet Shop Management</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### 2.4 Start React Frontend Server

In **Terminal 2 (PowerShell):**

```powershell
cd c:\Sweet_shop\frontend
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**✅ Frontend should be running at:** `http://localhost:5173/`

---

## Step 3: Access the Application

1. **Open your browser** and navigate to: **`http://localhost:5173/`**

2. **You should see:**
   - Login page (redirect to `/login` if not authenticated)
   - Register page available at `/register`
   - Dashboard page (after login) at `/`

3. **Verify both servers are running:**
   - ✅ **Backend Terminal:** Should show Django development server running on port 8000
   - ✅ **Frontend Terminal:** Should show Vite dev server running on port 5173
   - ✅ **No errors** in either terminal

---

## Quick Reference Commands

### Start Backend (Terminal 1):
```powershell
cd c:\Sweet_shop
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

### Start Frontend (Terminal 2):
```powershell
cd c:\Sweet_shop\frontend
npm run dev
```

### Stop Servers:
- Press `CTRL+C` in each terminal window

---

## Troubleshooting

### CORS Errors:
- Ensure `django-cors-headers` is installed
- Verify CORS settings are added to `settings.py`
- Restart Django server after changes

### Frontend Not Loading:
- Check that `index.html` exists in `frontend/` directory
- Verify `src/main.jsx` and `src/App.jsx` are in `frontend/src/`
- Check browser console for errors

### Backend Connection Issues:
- Verify Django server is running on port 8000
- Check `API_BASE_URL` in `frontend/src/utils/constants.js` matches backend URL
- Verify JWT token is being sent in requests (check Network tab in browser dev tools)

---

## URLs

- **Backend API:** http://127.0.0.1:8000/api/
- **Frontend App:** http://localhost:5173/
- **Django Admin:** http://127.0.0.1:8000/admin/ (create superuser first)

