from django.contrib import messages
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes, force_str

from .forms import UserRegistrationForm, UserUpdateForm, ProfileUpdateForm
from catalog.models import Book
from django.core.mail import send_mail
from django.conf import settings
from django.views.decorators.http import require_POST


def register(request):
    if request.method == 'POST':
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_active = True
            user.save()
            login(request, user)
            message = render_to_string('registration/activation_email.txt', {
                'user': user,
            })
            send_mail(
                'Welcome to Bookstore',
                message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=True,
            )
            messages.success(request, 'Registration successful.')
            return redirect('home')
    else:
        form = UserRegistrationForm()
    return render(request, 'registration/register.html', {'form': form})


def activate(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None
    if user is not None and default_token_generator.check_token(user, token):
        user.is_active = True
        user.save()
        messages.success(request, 'Account activated. You can now login.')
        return redirect('login')
    else:
        return HttpResponse('Activation link invalid.')


@login_required
def profile(request):
    if request.method == 'POST':
        user_form = UserUpdateForm(request.POST, instance=request.user)
        profile_form = ProfileUpdateForm(request.POST, instance=request.user.profile)
        if user_form.is_valid() and profile_form.is_valid():
            user_form.save()
            profile_form.save()
            messages.success(request, 'Profile updated.')
            return redirect('profile')
    else:
        user_form = UserUpdateForm(instance=request.user)
        profile_form = ProfileUpdateForm(instance=request.user.profile)

    favorite_books = request.user.profile.favorite_books.select_related('author', 'publisher')
    context = {
        'form': user_form,
        'profile_form': profile_form,
        'favorite_books': favorite_books,
    }
    return render(request, 'registration/profile.html', context)


@login_required
@require_POST
def toggle_favorite_book(request, book_id):
    book = get_object_or_404(Book, id=book_id)
    profile = request.user.profile
    if book in profile.favorite_books.all():
        profile.favorite_books.remove(book)
        action = 'removed'
    else:
        profile.favorite_books.add(book)
        action = 'added'
    return JsonResponse({'status': 'success', 'action': action})
