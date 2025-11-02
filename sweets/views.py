from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.generics import ListCreateAPIView, ListAPIView, RetrieveUpdateDestroyAPIView
from sweets.serializers import UserRegisterSerializer, SweetSerializer
from sweets.models import Sweet
from django.http import HttpResponse
from django.contrib.auth.models import User
import csv


class RegisterView(APIView):
    """
    User registration endpoint.
    """
    permission_classes = [AllowAny]  # No authentication required for registration

    def post(self, request):
        """
        Handle user registration POST request.
        """
        serializer = UserRegisterSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {
                    'username': user.username,
                    'email': user.email
                },
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SweetListCreateView(ListCreateAPIView):
    """
    View for listing and creating Sweet objects with JWT authentication.
    - GET (list): Customers see only available items (is_available=True), Admins see all
    - POST (create): Only admin users can create new sweets
    """
    def get_serializer_context(self):
        """Pass request to serializer for permission-based field filtering"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get_queryset(self):
        """
        Return queryset based on user permissions:
        - Admin users: see all sweets
        - Regular users: see only available sweets (is_available=True)
        """
        queryset = Sweet.objects.all()
        # Only show available items to non-admin users
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_available=True)
        return queryset
    
    def get_permissions(self):
        """
        Return appropriate permissions based on the request method.
        GET requires only authentication.
        POST requires authentication AND admin status.
        """
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsAdminUser()]
        return [IsAuthenticated()]


class SweetSearchView(ListAPIView):
    """
    View for searching and filtering Sweet objects with JWT authentication.
    Supports filtering by name, category, and price range.
    Customers only see available items (is_available=True), admins see all.
    """
    serializer_class = SweetSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_context(self):
        """Pass request to serializer for permission-based field filtering"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get_queryset(self):
        """
        Filter queryset based on optional query parameters:
        - name: case-insensitive partial match (name__icontains)
        - category: exact match (category__exact)
        - min_price: greater than or equal (price__gte)
        - max_price: less than or equal (price__lte)
        - Customers: only see is_available=True items
        - Admins: see all items
        """
        # Start with base queryset based on user permissions
        if self.request.user.is_staff:
            queryset = Sweet.objects.all()
        else:
            queryset = Sweet.objects.filter(is_available=True)
        
        # Filter by name (case-insensitive, partial match)
        name = self.request.query_params.get('name', None)
        if name is not None:
            queryset = queryset.filter(name__icontains=name)
        
        # Filter by category (exact match)
        category = self.request.query_params.get('category', None)
        if category is not None:
            queryset = queryset.filter(category__exact=category)
        
        # Filter by minimum price (greater than or equal)
        min_price = self.request.query_params.get('min_price', None)
        if min_price is not None:
            try:
                queryset = queryset.filter(price__gte=float(min_price))
            except ValueError:
                pass  # Ignore invalid price values
        
        # Filter by maximum price (less than or equal)
        max_price = self.request.query_params.get('max_price', None)
        if max_price is not None:
            try:
                queryset = queryset.filter(price__lte=float(max_price))
            except ValueError:
                pass  # Ignore invalid price values
        
        return queryset


class SweetRetrieveUpdateView(RetrieveUpdateDestroyAPIView):
    """
    View for retrieving, updating, and deleting a single Sweet object with JWT authentication.
    Handles GET (retrieve), PUT (update), and DELETE (delete) requests.
    - GET: Customers can only retrieve available items, admins can retrieve any
    - PUT: Only admins can update items
    - DELETE: Only admins can delete items
    """
    serializer_class = SweetSerializer
    lookup_field = 'pk'
    
    def get_serializer_context(self):
        """Pass request to serializer for permission-based field filtering"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get_queryset(self):
        """
        Return queryset based on user permissions:
        - Admin users: see all sweets
        - Regular users: see only available sweets (is_available=True)
        """
        queryset = Sweet.objects.all()
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_available=True)
        return queryset
    
    def get_permissions(self):
        """
        Return appropriate permissions based on the request method.
        GET requires only authentication.
        PUT and DELETE require authentication AND admin status.
        """
        if self.request.method in ['PUT', 'DELETE']:
            return [IsAuthenticated(), IsAdminUser()]
        return [IsAuthenticated()]


class SweetExportCSVView(APIView):
    """
    Admin-only view for exporting all Sweet data as a CSV file.
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        """
        Export all Sweet objects to a CSV file.
        """
        # Query all Sweet objects
        sweets = Sweet.objects.all()
        
        # Create HttpResponse with CSV headers
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="sweets_report.csv"'
        
        # Create CSV writer
        writer = csv.writer(response)
        
        # Write header row
        writer.writerow(['name', 'category', 'price', 'quantity'])
        
        # Write data rows
        for sweet in sweets:
            writer.writerow([
                sweet.name,
                sweet.category,
                str(sweet.price),  # Convert Decimal to string for CSV
                sweet.quantity
            ])
        
        return response
