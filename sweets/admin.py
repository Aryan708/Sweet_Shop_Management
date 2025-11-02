from django.contrib import admin
from django.template.response import TemplateResponse
from django.urls import path
from django.utils.html import format_html
from .models import Sweet


@admin.register(Sweet)
class SweetAdmin(admin.ModelAdmin):
    """
    Custom admin configuration for Sweet model.
    Admin can manage all fields including is_available to control what customers see.
    """
    list_display = ['name', 'category', 'price', 'quantity', 'stock_level', 'is_available']
    list_filter = ['category', 'is_available']
    search_fields = ['name']
    list_editable = ['is_available']  # Allow quick toggle of availability
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'category', 'price')
        }),
        ('Inventory', {
            'fields': ('quantity', 'stock_level', 'is_available'),
            'description': 'Control availability: Only items with is_available=True are visible to customers.'
        }),
    )
    
    def save_model(self, request, obj, form, change):
        """
        Ensure is_available always has a value (default to False if not provided).
        """
        if obj.is_available is None:
            obj.is_available = False
        super().save_model(request, obj, form, change)


def stock_report_view(request):
    """
    Custom admin view to display stock levels for all Sweet objects in a table.
    Accessible at /admin/sweets/stock_report/
    """
    # Check if user has permission to access admin
    if not request.user.is_staff:
        from django.contrib.auth.views import redirect_to_login
        from django.shortcuts import redirect
        return redirect_to_login(request.path)
    
    # Get all Sweet objects ordered by name
    sweets = Sweet.objects.all().order_by('name')
    
    # Prepare context for template
    context = {
        **admin.site.each_context(request),
        'title': 'Stock Level Report',
        'sweets': sweets,
        'opts': Sweet._meta,
    }
    
    # Render template with stock report table
    return TemplateResponse(
        request,
        'admin/sweets/stock_report.html',
        context,
    )


def manage_stock_view(request):
    """
    Admin-only portal for managing stock availability.
    Allows admins to add items to stock and control what customers can see.
    Accessible at /admin/sweets/manage_stock/
    """
    # Check if user has permission to access admin
    if not request.user.is_staff:
        from django.contrib.auth.views import redirect_to_login
        return redirect_to_login(request.path)
    
    # Get all Sweet objects ordered by name
    all_sweets = Sweet.objects.all().order_by('name')
    available_sweets = Sweet.objects.filter(is_available=True).order_by('name')
    unavailable_sweets = Sweet.objects.filter(is_available=False).order_by('name')
    
    # Prepare context for template
    context = {
        **admin.site.each_context(request),
        'title': 'Stock Management Portal',
        'all_sweets': all_sweets,
        'available_sweets': available_sweets,
        'unavailable_sweets': unavailable_sweets,
        'opts': Sweet._meta,
        'total_count': all_sweets.count(),
        'available_count': available_sweets.count(),
        'unavailable_count': unavailable_sweets.count(),
    }
    
    # Render template with stock management interface
    return TemplateResponse(
        request,
        'admin/sweets/manage_stock.html',
        context,
    )


# Register custom URLs at admin site level
def get_admin_urls():
    """Add custom URLs to admin site"""
    from django.urls import re_path
    return [
        re_path(r'^sweets/stock_report/$', admin.site.admin_view(stock_report_view), name='sweets_stock_report'),
        re_path(r'^sweets/manage_stock/$', admin.site.admin_view(manage_stock_view), name='sweets_manage_stock'),
    ]

# Monkey patch admin site to include our custom URLs
original_get_urls = admin.site.get_urls
def custom_get_urls():
    urls = original_get_urls()
    custom_urls = get_admin_urls()
    return custom_urls + urls

admin.site.get_urls = custom_get_urls
