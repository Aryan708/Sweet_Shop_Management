from rest_framework import serializers
from django.contrib.auth.models import User
from sweets.models import Sweet


class SweetSerializer(serializers.ModelSerializer):
    """
    Serializer for Sweet model with all fields.
    Note: is_available is included but only admins can modify it.
    """
    class Meta:
        model = Sweet
        fields = ['id', 'name', 'category', 'price', 'quantity', 'stock_level', 'is_available']
        # Note: is_available is writable but should be managed via admin portal
    
    def to_representation(self, instance):
        """
        Customize representation based on user permissions.
        Regular users don't see is_available field.
        """
        data = super().to_representation(instance)
        request = self.context.get('request')
        
        if request and not request.user.is_staff:
            # Hide is_available from regular users
            data.pop('is_available', None)
        
        return data


class UserRegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration with password confirmation.
    """
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        help_text="Password confirmation field"
    )
    password = serializers.CharField(
        write_only=True,
        required=True,
        help_text="User password"
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']

    def validate(self, attrs):
        """
        Validate that password and password2 match.
        """
        password = attrs.get('password')
        password2 = attrs.get('password2')

        if password != password2:
            raise serializers.ValidationError({
                "password": "Passwords do not match."
            })

        return attrs

    def create(self, validated_data):
        """
        Create a new user with hashed password.
        """
        # Remove password2 from validated_data as it's not a User model field
        validated_data.pop('password2', None)
        
        # Extract password separately for create_user
        password = validated_data.pop('password')
        
        # Create user with create_user which handles password hashing
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        
        return user

