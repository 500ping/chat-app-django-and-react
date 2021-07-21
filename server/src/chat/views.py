from django.shortcuts import render, get_object_or_404
from .models import Chat


def last_10_messages(chatID):
    chat = get_object_or_404(Chat, id=chatID)
    return chat.messages.order_by('-timestamp').all()[:10]
