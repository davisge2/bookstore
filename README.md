# Bookstore Catalog

This project is a small Django application used to manage books, authors and publishers.  It also tracks when a book has achieved bestseller status.  The application provides an advanced search and filter interface as well as AJAX powered forms to add, edit and delete books.

## Features

- CRUD management for **Books**, **Authors**, **Publishers** and **Bestseller Accolades**.
- Advanced filtering by title, author, publisher, publish date ranges and accolades.
- Sortable columns and paginated results.
- AJAX modals for creating and updating books without leaving the page.
- Dynamic search fields backed by [Select2](https://select2.org/).
- Example fixtures to populate the database with demo data located in `catalog/fixtures`.
- Built-in authentication with registration, profile management and password reset.

The models used by the catalog are defined in `catalog/models.py`:

```python
from django.db import models

class Author(models.Model):
    name = models.CharField(max_length=100)
    bio = models.TextField(blank=True)

class Publisher(models.Model):
    name = models.CharField(max_length=100)
    website = models.URLField(blank=True)

class Book(models.Model):
    title = models.CharField(max_length=200)
    author = models.ForeignKey(Author, on_delete=models.CASCADE)
    publisher = models.ForeignKey(Publisher, on_delete=models.CASCADE)
    publish_date = models.DateField()

class BestsellerAccolade(models.Model):
    ACCOLADE_CHOICES = [
        ("Top 5", "Top 5"),
        ("Top 10", "Top 10"),
        ("Top 25", "Top 25"),
    ]
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    category = models.CharField(max_length=50, choices=ACCOLADE_CHOICES)
    accolade_date = models.DateField()
```

The main view used to display and filter books (`catalog/views.py`) performs complex filtering and supports both simple and advanced search:

```python
# excerpt from catalog/views.py
book_filter = BookFilter(request.GET, queryset=books)
date_range_form = DateRangeForm(request.GET)
book_id = request.GET.get('book')
author_id = request.GET.get('author')
publisher_id = request.GET.get('publisher')
publish_date_after = request.GET.get('publish_date_after')
publish_date_before = request.GET.get('publish_date_before')
accolade = request.GET.get('accolade')
accolades_list = request.GET.getlist('accolades')
```

AJAX functionality for the modals and dynamic search fields is implemented in `static/js/book-management.js`:

```javascript
function initializeSelect2Components() {
    if (!$('#author-select-modal').hasClass('select2-hidden-accessible')) {
        $('#author-select-modal').select2({
            placeholder: 'Search authors...',
            ajax: {
                url: '/ajax/search-authors/',
                dataType: 'json',
                delay: 250,
                data: params => ({ q: params.term }),
                processResults: data => ({ results: data }),
                minimumInputLength: 2
            }
        });
    }
    // additional Select2 setups omitted for brevity
}
```

The project uses WhiteNoise to serve static files (see `bookstore/settings.py`):

```python
INSTALLED_APPS = [
    'catalog',
    'django_filters',
    'bootstrap3',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    # ...
]
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
WHITENOISE_USE_FINDERS = True
```

## Quick start

1. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
2. Apply migrations and (optionally) load the example fixtures:
   ```bash
   python manage.py migrate
   python manage.py loaddata catalog/fixtures/enhanced_authors.json \
       catalog/fixtures/enhanced_publishers.json \
       catalog/fixtures/enhanced_books.json \
       catalog/fixtures/enhanced_bestsellers.json
   ```
3. Run the development server:
   ```bash
   python manage.py runserver
   ```
4. Open your browser at `http://localhost:8000/` to explore the catalog.
5. Email confirmations and password reset links are printed to the console using Django's console email backend.

## Requirements

The `requirements.txt` file lists the packages needed:

```text
Django
django-bootstrap3==23.4
pytz==2024.1
sqlparse==0.5.0
whitenoise
```

## License

This project is provided for demonstration purposes and does not include a specific license.

