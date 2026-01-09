from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated , AllowAny
from .models import Note
from .serializers import NoteSerializer , UserSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings
import openai

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
    
    
class TranscribeAudioView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if 'audio' not in request.FILES:
            return Response({'error': 'No audio file provided'}, status=400)

        audio_file = request.FILES['audio']

        # Initialize OpenAI Client
        client = openai.OpenAI(api_key = 'AIzaSyCUfveG4qLEBXuw384_UXFmVQlMxNWw-mY')

        try:
            # Send to Whisper API
            # Note: We pass the file object directly. 
            # OpenAI expects a file-like object with a name attribute (which Django provides).
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file
            )
            return Response({'text': transcript.text}, status=200)

        except Exception as e:
            return Response({'error': str(e)}, status=500)