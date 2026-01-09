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
import openai

# Create your views here.

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

# RENAMED to NoteViewSet (Capital V) for consistency
class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.all().order_by('-created_at')
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)
    
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user)
        else:
            print(serializer.errors)



class TranscribeAudioView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if "audio" not in request.FILES:
            return Response({"error": "No audio"}, status=400)

        audio = request.FILES["audio"]

        if audio.size < 5000:
            return Response({"error": "Audio too short"}, status=400)

        try:
            openai.api_key = settings.OPENAI_API_KEY

            result = openai.Audio.transcribe(
                model="whisper-1",
                file=audio
            )

            return Response({"text": result["text"]})

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=500)