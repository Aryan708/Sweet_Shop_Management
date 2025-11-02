from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from sweets.models import Sweet


class SweetCreationTest(TestCase):
    """
    Test suite for Sweet creation endpoint with JWT authentication.
    """
    
    def setUp(self):
        """
        Set up test user and obtain JWT access token.
        """
        # Create a test user
        self.test_user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        # Create API client
        self.client = APIClient()
        
        # Login to obtain JWT token
        login_response = self.client.post(
            '/api/auth/login/',
            {
                'username': 'testuser',
                'password': 'testpass123'
            },
            format='json'
        )
        
        # Extract access token from login response
        self.access_token = login_response.data.get('access')
        
        # Set the authorization header for authenticated requests
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
    
    def test_unauthenticated_user_cannot_create_sweet(self):
        """
        Test that unauthenticated users cannot create sweets (401 Unauthorized).
        """
        # Create a new client without authentication
        unauthenticated_client = APIClient()
        
        # Attempt to create a sweet without authentication
        response = unauthenticated_client.post(
            '/api/sweets/',
            {
                'name': 'Test Sweet',
                'category': 'CHOCOLATE',
                'price': '10.50',
                'quantity': 100
            },
            format='json'
        )
        
        # Assert 401 Unauthorized status
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_authenticated_user_can_create_sweet(self):
        """
        Test that authenticated users can create sweets (201 Created).
        """
        # Create a sweet with authentication
        response = self.client.post(
            '/api/sweets/',
            {
                'name': 'Test Sweet',
                'category': 'CHOCOLATE',
                'price': '10.50',
                'quantity': 100
            },
            format='json'
        )
        
        # Assert 201 Created status
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify the Sweet object was created in the database
        self.assertTrue(Sweet.objects.filter(name='Test Sweet').exists())
        
        # Verify the created sweet's details
        sweet = Sweet.objects.get(name='Test Sweet')
        self.assertEqual(sweet.category, 'CHOCOLATE')
        self.assertEqual(str(sweet.price), '10.50')
        self.assertEqual(sweet.quantity, 100)


class SweetSearchTest(TestCase):
    """
    Test suite for Sweet search/filter endpoint with JWT authentication.
    """
    
    def setUp(self):
        """
        Set up test data: multiple sweets and authenticated user with JWT token.
        """
        # Create a test user
        self.test_user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        # Create API client
        self.client = APIClient()
        
        # Login to obtain JWT token
        login_response = self.client.post(
            '/api/auth/login/',
            {
                'username': 'testuser',
                'password': 'testpass123'
            },
            format='json'
        )
        
        # Extract access token from login response
        self.access_token = login_response.data.get('access')
        
        # Set the authorization header for authenticated requests
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        # Create test sweets with varied data
        # Two sweets with "Gummy" in the name
        Sweet.objects.create(
            name='Gummy Bears',
            category='GUMMY',
            price='3.50',
            quantity=100
        )
        Sweet.objects.create(
            name='Gummy Worms',
            category='GUMMY',
            price='3.75',
            quantity=80
        )
        
        # Sweet with different category but similar price
        Sweet.objects.create(
            name='Chocolate Bar',
            category='CHOCOLATE',
            price='4.00',
            quantity=50
        )
        
        # Sweet with different price range
        Sweet.objects.create(
            name='Hard Candy Mix',
            category='HARD_CANDY',
            price='2.25',
            quantity=120
        )
        
        # Sweet with higher price
        Sweet.objects.create(
            name='Premium Chocolate',
            category='CHOCOLATE',
            price='7.50',
            quantity=30
        )
    
    def test_unauthenticated_user_cannot_search(self):
        """
        Test that unauthenticated users cannot search sweets (401 Unauthorized).
        """
        # Create a new client without authentication
        unauthenticated_client = APIClient()
        
        # Attempt to search without authentication
        response = unauthenticated_client.get('/api/sweets/search/')
        
        # Assert 401 Unauthorized status
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_search_by_name(self):
        """
        Test searching sweets by name with partial, case-insensitive match.
        """
        # Search for sweets containing "gummy" (case-insensitive)
        response = self.client.get('/api/sweets/search/?name=gummy')
        
        # Assert 200 OK status
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Assert that we get the correct number of sweets
        self.assertEqual(len(response.data), 2)
        
        # Verify the names contain "Gummy" (case-insensitive match)
        names = [sweet['name'] for sweet in response.data]
        self.assertIn('Gummy Bears', names)
        self.assertIn('Gummy Worms', names)
        
        # Test case-insensitive search
        response_upper = self.client.get('/api/sweets/search/?name=GUMMY')
        self.assertEqual(response_upper.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response_upper.data), 2)
    
    def test_search_by_price_range(self):
        """
        Test searching sweets by price range using min_price and max_price.
        """
        # Search for sweets with price between 2.00 and 5.00
        response = self.client.get('/api/sweets/search/?min_price=2.00&max_price=5.00')
        
        # Assert 200 OK status
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify all returned sweets are within the price range
        for sweet_data in response.data:
            price = float(sweet_data['price'])
            self.assertGreaterEqual(price, 2.00)
            self.assertLessEqual(price, 5.00)
        
        # Should get: Gummy Bears (3.50), Gummy Worms (3.75), Chocolate Bar (4.00), Hard Candy Mix (2.25)
        # But NOT Premium Chocolate (7.50)
        self.assertEqual(len(response.data), 4)
        
        # Verify Premium Chocolate is not included
        names = [sweet['name'] for sweet in response.data]
        self.assertNotIn('Premium Chocolate', names)


class SweetUpdateTest(TestCase):
    """
    Test suite for Sweet update endpoint with JWT authentication.
    """
    
    def setUp(self):
        """
        Set up test user, JWT token, and a Sweet object for updating.
        """
        # Create a test user
        self.test_user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        # Create API client
        self.client = APIClient()
        
        # Login to obtain JWT token
        login_response = self.client.post(
            '/api/auth/login/',
            {
                'username': 'testuser',
                'password': 'testpass123'
            },
            format='json'
        )
        
        # Extract access token from login response
        self.access_token = login_response.data.get('access')
        
        # Set the authorization header for authenticated requests
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        # Create an initial Sweet object for updating
        self.sweet = Sweet.objects.create(
            name='Original Sweet',
            category='CHOCOLATE',
            price='5.00',
            quantity=100
        )
    
    def test_unauthenticated_user_cannot_update_sweet(self):
        """
        Test that unauthenticated users cannot update sweets (401 Unauthorized).
        """
        # Create a new client without authentication
        unauthenticated_client = APIClient()
        
        # Attempt to update the sweet without authentication
        response = unauthenticated_client.put(
            f'/api/sweets/{self.sweet.id}/',
            {
                'name': 'Updated Sweet',
                'category': 'GUMMY',
                'price': '6.50',
                'quantity': 150
            },
            format='json'
        )
        
        # Assert 401 Unauthorized status
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Verify the sweet was not updated
        self.sweet.refresh_from_db()
        self.assertEqual(self.sweet.name, 'Original Sweet')
        self.assertEqual(self.sweet.category, 'CHOCOLATE')
    
    def test_authenticated_user_can_update_sweet(self):
        """
        Test that authenticated users can update sweets (200 OK).
        """
        # Update the sweet with new data
        response = self.client.put(
            f'/api/sweets/{self.sweet.id}/',
            {
                'name': 'Updated Sweet',
                'category': 'GUMMY',
                'price': '6.50',
                'quantity': 150
            },
            format='json'
        )
        
        # Assert 200 OK status
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify the Sweet object was correctly updated in the database
        self.sweet.refresh_from_db()
        self.assertEqual(self.sweet.name, 'Updated Sweet')
        self.assertEqual(self.sweet.category, 'GUMMY')
        self.assertEqual(str(self.sweet.price), '6.50')
        self.assertEqual(self.sweet.quantity, 150)


class SweetDeleteTest(TestCase):
    """
    Test suite for Sweet delete endpoint with admin-only access.
    """
    
    def setUp(self):
        """
        Set up test users (regular and admin), JWT tokens, and a Sweet object for deletion.
        """
        # Create a regular test user
        self.regular_user = User.objects.create_user(
            username='regularuser',
            email='regular@example.com',
            password='testpass123'
        )
        
        # Create an admin test user
        self.admin_user = User.objects.create_user(
            username='adminuser',
            email='admin@example.com',
            password='testpass123',
            is_superuser=True,
            is_staff=True
        )
        
        # Create API clients
        self.regular_client = APIClient()
        self.admin_client = APIClient()
        
        # Login regular user to obtain JWT token
        regular_login_response = self.regular_client.post(
            '/api/auth/login/',
            {
                'username': 'regularuser',
                'password': 'testpass123'
            },
            format='json'
        )
        self.regular_token = regular_login_response.data.get('access')
        self.regular_client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.regular_token}')
        
        # Login admin user to obtain JWT token
        admin_login_response = self.admin_client.post(
            '/api/auth/login/',
            {
                'username': 'adminuser',
                'password': 'testpass123'
            },
            format='json'
        )
        self.admin_token = admin_login_response.data.get('access')
        self.admin_client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        
        # Create an initial Sweet object for deletion
        self.sweet = Sweet.objects.create(
            name='Sweet To Delete',
            category='CHOCOLATE',
            price='5.00',
            quantity=100
        )
    
    def test_unauthenticated_user_cannot_delete(self):
        """
        Test that unauthenticated users cannot delete sweets (401 Unauthorized).
        """
        # Create a new client without authentication
        unauthenticated_client = APIClient()
        
        # Attempt to delete the sweet without authentication
        response = unauthenticated_client.delete(f'/api/sweets/{self.sweet.id}/')
        
        # Assert 401 Unauthorized status
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Verify the sweet still exists
        self.assertTrue(Sweet.objects.filter(id=self.sweet.id).exists())
    
    def test_regular_user_cannot_delete(self):
        """
        Test that regular users cannot delete sweets (403 Forbidden).
        """
        # Attempt to delete the sweet with regular user's token
        response = self.regular_client.delete(f'/api/sweets/{self.sweet.id}/')
        
        # Assert 403 Forbidden status
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Verify the sweet still exists
        self.assertTrue(Sweet.objects.filter(id=self.sweet.id).exists())
    
    def test_admin_user_can_delete(self):
        """
        Test that admin users can delete sweets (204 No Content).
        """
        # Store the sweet ID before deletion
        sweet_id = self.sweet.id
        
        # Delete the sweet with admin user's token
        response = self.admin_client.delete(f'/api/sweets/{sweet_id}/')
        
        # Assert 204 No Content status
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Verify the Sweet object is deleted from the database
        self.assertFalse(Sweet.objects.filter(id=sweet_id).exists())

