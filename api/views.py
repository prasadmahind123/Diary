from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated , AllowAny
from .models import Note
from .serializers import NoteSerializer , UserSerializer


# Create your views here.

class CreateUserView(generics.CreateAPIView) :
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class Noteviewset(viewsets.ModelViewSet) :
    queryset = Note.objects.all().order_by('-created_at')
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author = user)
    
    def perform_create(self, serializer):
        if serializer.is_valid() :
            serializer.save(author = self.request.user)
        else :
            print(serializer.errors)
    
    
