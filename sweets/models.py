from django.db import models

# sweets/models.py
class Sweet(models.Model):
    name = models.CharField(max_length=100, unique=True, help_text="Unique name of the sweet.")

    CATEGORY_CHOICES = [
        ('CHOCOLATE', 'Chocolate'),
        ('GUMMY', 'Gummy'),
        ('HARD_CANDY', 'Hard Candy'),
        ('OTHER', 'Other'),
    ]
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    price = models.DecimalField(max_digits=5, decimal_places=2, help_text="Price of the sweet.")
    quantity = models.PositiveIntegerField(default=0, help_text="Quantity in stock.")
    stock_level = models.IntegerField(default=0, help_text="Current stock level for the sweet.")

    # ✅ Make sure this line is identical
    is_available = models.BooleanField(default=False,null=False,blank=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.quantity} in stock)"

