# AGENTS Documentation

## How the pieces fit together

This Django project consists of several interconnected components, including models, views, forms, filters, and migrations. Each component plays a crucial role in the functionality of the application. Below is a detailed documentation of each component, including their purpose, fields/properties, and real-world use-cases.

## Models

### Author
- **Purpose**: Represents an author in the system.
- **Fields**:
  - `name`: CharField, max_length=100
  - `bio`: TextField, blank=True
- **Relationships**: None
- **Example Use-Case**: Used to store and retrieve information about authors.
- **Typical Queries**: Retrieve all authors, filter authors by name.

### Publisher
- **Purpose**: Represents a publisher in the system.
- **Fields**:
  - `name`: CharField, max_length=100
  - `website`: URLField, blank=True
- **Relationships**: None
- **Example Use-Case**: Used to store and retrieve information about publishers.
- **Typical Queries**: Retrieve all publishers, filter publishers by name.

### Book
- **Purpose**: Represents a book in the system.
- **Fields**:
  - `title`: CharField, max_length=200
  - `author`: ForeignKey to Author, on_delete=models.CASCADE
- **Relationships**: ForeignKey to Author
- **Example Use-Case**: Used to store and retrieve information about books.
- **Typical Queries**: Retrieve all books, filter books by title, filter books by author.

## Views

### Example View
- **Purpose**: Handles the display of a list of books.
- **Routes**: `/books/`
- **Logic**: Retrieves all books from the database and renders them in a template.
- **Templates**: `books_list.html`
- **Security/Authentication**: None

## Forms

### AuthorForm
- **Linked Model**: Author
- **Custom Validation**: None
- **Usage**: Used in views to create or update author information.

## Filters

### BookFilter
- **Filter Fields**: `title`, `author`
- **Usage**: Applied in views to filter the list of books based on title or author.

## Migrations

### 0001_initial.py
- **Purpose**: Initial migration for the catalog app, creating the Author, Publisher, and Book models.

## Review Checklist

| Component | Status |
|-----------|--------|
| Models    | Documented |
| Views     | Documented |
| Forms     | Documented |
| Filters   | Documented |
| Migrations| Documented |

## TODOs
- Add more detailed documentation for each view.
- Include example queries for major features.


## Accounts App

### Models

#### Profile
- **Purpose**: Represents a user profile in the system.
- **Fields**:
  - `user`: OneToOneField to User, on_delete=models.CASCADE
  - `bio`: TextField, blank=True
  - `first_name`: CharField, max_length=150, blank=True
  - `last_name`: CharField, max_length=150, blank=True
- **Relationships**: OneToOneField to User
- **Example Use-Case**: Used to store and retrieve additional information about users.
- **Typical Queries**: Retrieve profile by user, filter profiles by first name or last name.

### Views

#### Example View
- **Purpose**: Handles user registration and profile management.
- **Routes**: `/register/`, `/profile/`
- **Logic**: Manages user registration, login, and profile updates.
- **Templates**: `registration_form.html`, `profile.html`
- **Security/Authentication**: Requires login for profile management.

### Forms

#### UserRegistrationForm
- **Linked Model**: User
- **Custom Validation**: None
- **Usage**: Used in views to register new users.

### Migrations

#### 0001_initial.py
- **Purpose**: Initial migration for the accounts app, creating the Profile model.

## Review Checklist

| Component | Status |
|-----------|--------|
| Models    | Documented |
| Views     | Documented |
| Forms     | Documented |
| Filters   | Not Applicable |
| Migrations| Documented |

## TODOs
- Add more detailed documentation for each view.
- Include example queries for major features.

## Catalog App

### Models

#### BestsellerAccolade
- **Purpose**: Represents accolades awarded to bestsellers.
- **Fields**:
  - `category`: CharField, choices=[('Top 5', 'Top 5'), ('Top 10', 'Top 10'), ('Top 25', 'Top 25')], max_length=50
- **Relationships**: None
- **Example Use-Case**: Used to categorize bestsellers based on their ranking.
- **Typical Queries**: Retrieve accolades by category.

### Views

#### Example View
- **Purpose**: Handles displaying and managing books.
- **Routes**: `/books/`, `/books/<id>/`
- **Logic**: Manages book listing, detail view, and search functionality.
- **Templates**: `book_list.html`, `book_detail.html`
- **Security/Authentication**: None

### Forms

#### AuthorForm
- **Linked Model**: Author
- **Custom Validation**: None
- **Usage**: Used in views to create or update author information.

### Filters

#### BookFilter
- **Filter Fields**: `title`, `author`, `category`
- **Usage**: Applied in views to filter book listings based on the specified criteria.

### Migrations

#### 0002_alter_bestselleraccolade_category.py
- **Purpose**: Alters the `category` field in the `BestsellerAccolade` model to include choices for Top 5, Top 10, and Top 25.

## Review Checklist

| Component | Status |
|-----------|--------|
| Models    | Documented |
| Views     | Documented |
| Forms     | Documented |
| Filters   | Documented |
| Migrations| Documented |

## TODOs
- Add more detailed documentation for each view.
- Include example queries for major features.

## How the pieces fit together

This Django project consists of two main apps: `accounts` and `catalog`. The `accounts` app handles user registration, authentication, and profile management, while the `catalog` app manages the book catalog, including authors, publishers, and accolades.

### Accounts App
- **Models**: The `Profile` model extends the default Django `User` model to include additional user information.
- **Views**: The views handle user registration, login, and profile management, ensuring that users can create accounts, log in, and update their profiles.
- **Forms**: The `UserRegistrationForm` is used for user registration, ensuring that new users can sign up with the required information.
- **Migrations**: The initial migration sets up the `Profile` model, creating the necessary database tables.

### Catalog App
- **Models**: The `Author`, `Publisher`, `Book`, and `BestsellerAccolade` models represent the core entities in the book catalog. Relationships between these models, such as `ForeignKey` and `ManyToMany`, are used to link authors to books and books to publishers.
- **Views**: The views handle displaying and managing books, authors, and publishers. They include functionality for listing books, viewing book details, and searching for books based on various criteria.
- **Forms**: The `AuthorForm` is used to create or update author information, ensuring that the catalog can be maintained with accurate author details.
- **Filters**: The `BookFilter` allows users to filter book listings based on title, author, and category, providing a powerful search functionality.
- **Migrations**: The migrations set up and modify the database schema, ensuring that the models are correctly represented in the database.

### Example Queries
- **Get all books for an author**:
  ```python
  author = Author.objects.get(name='Author Name')
  books = Book.objects.filter(author=author)
  ```
- **Filter books by category**:
  ```python
  filtered_books = BookFilter({'category': 'Top 10'}, queryset=Book.objects.all()).qs
  ```

## Review Checklist

| Component | Status |
|-----------|--------|
| Models    | Documented |
| Views     | Documented |
| Forms     | Documented |
| Filters   | Documented |
| Migrations| Documented |

## TODOs
- Add more detailed documentation for each view.
- Include additional example queries for major features.

## Accounts App

### Models

#### Profile
- **Purpose**: Extends the default Django `User` model to include additional user information.
- **Fields**:
  - `user`: OneToOneField to User
  - `bio`: TextField, blank=True
  - `first_name`: CharField, max_length=150, blank=True
  - `last_name`: CharField, max_length=150, blank=True
- **Relationships**: OneToOne relationship with the User model.
- **Example Use-Case**: Used to store additional information about users, such as their bio and names.
- **Typical Queries**: Retrieve profiles by user.

### Forms

#### UserRegistrationForm
- **Linked Model**: User
- **Custom Validation**: None
- **Usage**: Used for user registration, ensuring that new users can sign up with the required information.

### Migrations

#### 0002_profile_fields.py
- **Purpose**: Adds `first_name` and `last_name` fields to the `Profile` model.

## Review Checklist

| Component | Status |
|-----------|--------|
| Models    | Documented |
| Views     | TODO |
| Forms     | Documented |
| Filters   | TODO |
| Migrations| Documented |

## TODOs
- Add documentation for views in the accounts app.
- Add documentation for filters in the accounts app.
- Include additional example queries for major features.
