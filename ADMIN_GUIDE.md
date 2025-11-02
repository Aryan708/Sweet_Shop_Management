# Admin Guide - Sweet Shop Management System

## 🎯 What Admins Can Do

**Admin users** have special privileges:
- ✅ **Delete sweets** - Only admins can delete items from inventory
- ✅ **Export CSV reports** - Access to `/api/report/export_csv/` endpoint
- ✅ **Full CRUD access** - Create, Read, Update, and Delete all sweets

**Regular users** can:
- ✅ View all sweets
- ✅ Search and filter sweets
- ✅ Create new sweets
- ✅ Update existing sweets
- ❌ Cannot delete sweets (will get 403 Forbidden)

---

## 🔑 How to Create an Admin User

### Method 1: Using Django Admin Shell (Recommended)

Open PowerShell in `c:\Sweet_shop` and run:

```powershell
.\venv\Scripts\Activate.ps1
python manage.py shell
```

Then in the Python shell:

```python
from django.contrib.auth.models import User

# Create admin user (or update existing)
admin = User.objects.filter(username='admin').first()
if not admin:
    admin = User.objects.create_user(
        username='admin',
        password='admin123',
        email='admin@sweetshop.com'
    )

# Make them an admin/staff
admin.is_staff = True
admin.is_superuser = True
admin.save()

print(f"✅ Admin created: {admin.username}")
exit()
```

### Method 2: Using Django Management Command

```powershell
.\venv\Scripts\Activate.ps1
python manage.py createsuperuser
```

Follow the prompts to create an admin user.

### Method 3: Quick One-Liner (Already Done!)

If you already ran the setup command, an admin user has been created with:
- **Username:** `admin`
- **Password:** `admin123`

---

## 🔐 How to Login as Admin

1. **Start both servers:**
   - Backend: `python manage.py runserver` (Terminal 1)
   - Frontend: `npm run dev` in `frontend/` folder (Terminal 2)

2. **Open browser:** http://localhost:5173/

3. **Login with admin credentials:**
   - Username: `admin`
   - Password: `admin123`

4. **You'll see the dashboard** - All sweets are visible to everyone, but:
   - ✅ **Delete button** will work (admins only)
   - ✅ **Regular users** will see "Permission denied" if they try to delete

---

## 📊 Viewing Inventory Count

All authenticated users (including admins) can see the inventory:

1. **Login to dashboard** (any user)
2. **View the table** - Shows all sweets with quantities
3. **Search/Filter** - Use the search form to filter by name or price
4. **Check quantities** - The "Quantity" column shows stock levels

### Quick Inventory Check

The dashboard displays:
- **Total number of sweets** (count of rows in table)
- **Individual quantities** for each sweet
- **Search/filter** capabilities

---

## 🗑️ Admin-Only Actions

### Delete a Sweet

1. Login as admin
2. Find the sweet in the table
3. Click **"🗑️ Delete"** button
4. Confirm deletion
5. Sweet is removed from database

**Note:** Regular users will see "Permission denied: Only Admin users can delete sweets" if they try.

---

## 🔧 Verify Admin Status

To check if a user is admin, use Django shell:

```powershell
.\venv\Scripts\Activate.ps1
python manage.py shell
```

```python
from django.contrib.auth.models import User

user = User.objects.get(username='admin')
print(f"Username: {user.username}")
print(f"Is Staff: {user.is_staff}")
print(f"Is Superuser: {user.is_superuser}")
```

---

## 📝 Current Admin Credentials

After running the setup:
- **Username:** `admin`
- **Password:** `admin123`

**⚠️ Important:** Change the password in production!

To change password:
```python
from django.contrib.auth.models import User
admin = User.objects.get(username='admin')
admin.set_password('your_new_password')
admin.save()
```

---

## 🎯 Summary

1. **Admin user created** ✅ (username: `admin`, password: `admin123`)
2. **Login at:** http://localhost:5173/login
3. **All users can view** sweets inventory
4. **Only admins can delete** sweets
5. **Dashboard shows** all sweets with quantities

**Ready to use!** 🎉

