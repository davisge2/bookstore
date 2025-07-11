# AGENTS Documentation

## Catalog App

### Models

- **Author**: Represents an author with a name and bio.
- **Publisher**: Represents a publisher with a name and website.
- **Book**: Represents a book with a title, author, and publisher.

### Views

- **catalog/views.py**: Contains views for rendering templates, handling redirects, and processing HTTP requests.

### Migrations

- **catalog/migrations/0001_initial.py**: Initial migration for the catalog app.

## Accounts App

### Models

- **Profile**: Represents a user profile with a one-to-one relationship with the User model, and includes fields for bio, first name, and last name.

### Forms

- **UserRegistrationForm**: A form for user registration, extending the UserCreationForm.

### URLs

- **accounts/urls.py**: Contains URL routing and endpoints for user registration and activation.

### Admin

- **accounts/admin.py**: Admin configurations for the accounts app.

### Admin

- **catalog/admin.py**: Contains admin configurations for the catalog app.

### URLs

- **catalog/urls.py**: Contains URL routing and endpoints for the catalog app.

### Forms

- **AuthorForm**: A form for creating and updating authors.
- **PublisherForm**: A form for creating and updating publishers.
- **BookForm**: A form for creating and updating books.
- **BestsellerAccoladeForm**: A form for creating and updating bestseller accolades.

### Filters

- **BookFilter**: A filter for searching and filtering books based on title, author, and other criteria.
- **AuthorFilter**: A filter for searching and filtering authors based on name and other criteria.
- **BestsellerAccoladeFilter**: A filter for searching and filtering bestseller accolades based on category and other criteria.
