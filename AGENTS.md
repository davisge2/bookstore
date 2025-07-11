# AGENTS

## Models

### Author
- Fields: name (CharField), bio (TextField)
- Methods: __str__

### Publisher
- Fields: name (CharField), website (URLField)
- Methods: __str__

### Book
- Fields: title (CharField), author (ForeignKey to Author)

## Forms

### AuthorForm
- Model: Author
- Fields: name, bio

### PublisherForm
- Model: Publisher
- Fields: name, website

### BookForm
- Model: Book
- Fields: accolades (CharField)

## Views

### General Views
- render, redirect, get_object_or_404
- JsonResponse, HttpResponse
- Q, Count
- csrf_protect, require_POST
- Paginator
- login_required

### Filters
- BookFilter
- AuthorFilter

### Models Used in Views
- Book
- Author
- Publisher
- BestsellerAccolade

### Templates
- django.template.loader