# Restore this code into your test file (e.g., sweets/tests.py)

from django.test import TestCase
from sweets.models import Sweet # This import should now succeed

class SweetModelTest(TestCase):
    def test_sweet_model_has_required_fields(self):
        """Test that the Sweet model has name, category, price, and quantity fields."""
        
        # We need to create an instance to ensure the model is registered and fields are accessible
        Sweet.objects.create(
            name="Gummy Bear",
            category='GUMMY',
            price=2.50,
            quantity=100
        )
        
        # Check for the existence of required fields using the model's metadata
        fields = [field.name for field in Sweet._meta.get_fields()]
        
        # We check for all required fields based on the requirements
        self.assertIn('name', fields)
        self.assertIn('category', fields)
        self.assertIn('price', fields)
        self.assertIn('quantity', fields)
        self.assertIn('id', fields) # Primary key 'id' is implicit in Django