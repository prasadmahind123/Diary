from django.urls import path , include
from rest_framework.routers import DefaultRouter 
from .views import NoteViewSet, CreateUserView, TranscribeAudioView

router = DefaultRouter()
router.register(r'notes' , NoteViewSet , basename='note')

urlpatterns = [
    path('user/register/', CreateUserView.as_view(), name='register'),
    path('transcribe/', TranscribeAudioView.as_view(), name='transcribe'),
    path('',include(router.urls))
]
