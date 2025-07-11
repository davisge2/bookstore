# AGENTS.md

## How the pieces fit together

This document provides a comprehensive overview of the catalog app in this Django project. It includes detailed documentation for each model, view, form, filter, and migration, along with examples and real-world use-cases. This is intended to help onboard new developers and provide a reference for existing team members.

## Models

### Author
- **Purpose**: Represents an author of books.
- **Fields**:
  - `name`: CharField, max_length=100
  - `bio`: TextField, blank=True
- **Example**: An author named 'J.K. Rowling' with a bio describing her works.
- **Relationships**: None
- **Typical Queries**: `Author.objects.all()`, `Author.objects.filter(name__icontains='Rowling')`

### Publisher
- **Purpose**: Represents a publisher of books.
- **Fields**:
  - `name`: CharField, max_length=100
  - `website`: URLField, blank=True
- **Example**: A publisher named 'Penguin Books' with a website URL.
- **Relationships**: None
- **Typical Queries**: `Publisher.objects.all()`, `Publisher.objects.filter(name__icontains='Penguin')`

### Book
- **Purpose**: Represents a book.
- **Fields**:
  - `title`: CharField, max_length=200
  - `author`: ForeignKey to Author, on_delete=models.CASCADE
  - `publisher`: ForeignKey to Publisher, on_delete=models.CASCADE
- **Example**: A book titled 'Harry Potter' authored by 'J.K. Rowling' and published by 'Penguin Books'.
- **Relationships**: ForeignKey to Author, ForeignKey to Publisher
- **Typical Queries**: `Book.objects.all()`, `Book.objects.filter(author__name='J.K. Rowling')`

## Forms

### AuthorForm
- **Linked Model**: Author
- **Fields**: `name`, `bio`
- **Usage**: Used in views to create or update author instances.

### PublisherForm
- **Linked Model**: Publisher
- **Fields**: `name`, `website`
- **Usage**: Used in views to create or update publisher instances.

### BookForm
- **Linked Model**: Book
- **Fields**: `title`, `author`, `publisher`, `accolades`
- **Usage**: Used in views to create or update book instances.

## Filters

### BookFilter
- **Filter Fields**: `title`, `author`, `publisher`
- **Usage**: Applied in views to filter book instances based on the specified fields.

## Views

### Home View
- **Routes**: `/books/`
- **Logic**: Displays a list of books.
- **Templates**: `home.html`
- **Security/Auth**: None

### Author Detail View
- **Routes**: `/authors/<int:id>/`
- **Logic**: Displays details of a specific author.
- **Templates**: `author_detail.html`
- **Security/Auth**: None

## Migrations

### 0001_initial
- **Purpose**: Initial migration for the catalog app.
- **Operations**: Creates the Author, Publisher, and Book models.

## Review Checklist

| Component | Summary | Status |
|-----------|---------|--------|
| Author Model | Represents an author of books | Complete |
| Publisher Model | Represents a publisher of books | Complete |
| Book Model | Represents a book | Complete |
| AuthorForm | Form for creating/updating authors | Complete |
| PublisherForm | Form for creating/updating publishers | Complete |
| BookForm | Form for creating/updating books | Complete |
| BookFilter | Filter for books | Complete |
| Home View | Displays a list of books | Complete |
| Author Detail View | Displays details of a specific author | Complete |
| 0001_initial Migration | Initial migration for the catalog app | Complete |

## TODOs

- Add more detailed examples for each component.
- Review and improve any weak or short sections.

## Example Queries

- **How to get all books for an author**: `Book.objects.filter(author__name='J.K. Rowling')`

