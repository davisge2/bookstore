from django.urls import path
from django.shortcuts import redirect
from . import views

urlpatterns = [
    path('', lambda request: redirect('books'), name='home'),
    path('books/', views.home, name='books'),
    path('authors/', views.author_list, name='authors'),
    path('publishers/', views.publisher_list, name='publishers'),
    path('bestsellers/', views.bestseller_list, name='bestsellers'),
    path('add-author/', views.add_author, name='add_author'),
    path('add-publisher/', views.add_publisher, name='add_publisher'),
    path('add-book/', views.add_book, name='add_book'),
    path('add-bestseller/', views.add_bestseller, name='add_bestseller'),
    path('ajax/update-book/<int:book_id>/', views.update_book_ajax, name='update_book_ajax'),
    path('ajax/search-books/', views.ajax_search_books, name='ajax_search_books'),
    path('ajax/search-authors/', views.ajax_search_authors, name='ajax_search_authors'),
    path('ajax/search-publishers/', views.ajax_search_publishers, name='ajax_search_publishers'),
    path('ajax/save-book/', views.save_book, name='save_book'),
    path('ajax/save-book/<int:book_id>/', views.save_book, name='edit_book'),
    path('ajax/get-book/<int:book_id>/', views.get_book_data, name='get_book_data'),
    path('ajax/get-accolades/', views.ajax_get_accolades, name='ajax_get_accolades'),
    path('ajax/delete-book/<int:book_id>/', views.delete_book_ajax, name='delete_book_ajax'),
    path('ajax/save-author/', views.save_author, name='save_author'),
    path('ajax/save-author/<int:author_id>/', views.save_author, name='edit_author'),
    path('ajax/get-author/<int:author_id>/', views.get_author_data, name='get_author_data'),
    path('ajax/delete-author/<int:author_id>/', views.delete_author_ajax, name='delete_author_ajax'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('analytics/', views.filtered_analytics, name='filtered_analytics'),
]
