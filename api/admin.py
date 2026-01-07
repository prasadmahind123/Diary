from django.contrib import admin
from .models import Note

class NoteAdmin(admin.ModelAdmin):
    list_display = ["title", "author", "created_at"]  # Columns to show in the list
    search_fields = ["title", "content"]              # Add a search bar
    list_filter = ["author", "created_at"]            # Add filters on the right side

admin.site.register(Note, NoteAdmin)