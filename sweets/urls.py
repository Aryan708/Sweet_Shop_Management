from django.urls import path
from sweets.views import RegisterView, SweetListCreateView, SweetSearchView, SweetRetrieveUpdateView, SweetExportCSVView
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='login'),
    path('sweets/', SweetListCreateView.as_view(), name='sweet-list-create'),
    path('sweets/search/', SweetSearchView.as_view(), name='sweet-search'),
    path('sweets/<int:pk>/', SweetRetrieveUpdateView.as_view(), name='sweet-retrieve-update'),
    path('report/export_csv/', SweetExportCSVView.as_view(), name='sweet-export-csv'),
]

