from django.urls import path , include
from rest_framework.routers import DefaultRouter 
from .views import Noteviewset 

router = DefaultRouter()
router.register(r'notes' , Noteviewset , basename='note')

urlpatterns = [
    path('',include(router.urls))
]
