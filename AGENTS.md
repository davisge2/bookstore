# AGENTS

## Models

### Author
- **Fields**: name (CharField), bio (TextField)
- **Description**: Represents an author with a name and a biography.

### Publisher
- **Fields**: name (CharField), website (URLField)
- **Description**: Represents a publisher with a name and a website.

### Book
- **Fields**: title (CharField), author (ForeignKey to Author)
- **Description**: Represents a book with a title and an author.

### Profile
- **Fields**: user (OneToOneField to User), bio (TextField), first_name (CharField), last_name (CharField)
- **Description**: Represents a user profile with a one-to-one relationship to the User model and optional fields for biography, first name, and last name.

## Forms

### AuthorForm
- **Model**: Author
- **Fields**: name, bio
- **Description**: Form for creating or updating an author.

### PublisherForm
- **Model**: Publisher
- **Fields**: name, website
- **Description**: Form for creating or updating a publisher.

### BookForm
- **Model**: Book
- **Fields**: accolades (CharField)
- **Description**: Form for creating or updating a book, with an optional accolades field.

### UserRegistrationForm
- **Model**: User
- **Fields**: username, password1, password2
- **Description**: Form for registering a new user.

## Views

### Catalog Views
- **Description**: Handles the rendering and processing of catalog-related pages and actions.

#### Home View
- **URL**: /books/
- **Description**: Displays the list of books.

#### Book Detail View
- **URL**: /books/<int:id>/
- **Description**: Displays the details of a specific book.

### Accounts Views
- **Description**: Handles the rendering and processing of account-related pages and actions, including authentication and user management.

#### Register View
- **URL**: /register/
- **Description**: Handles user registration.

#### Activate View
- **URL**: /activate/<uidb64>/<token>/
- **Description**: Handles account activation.

#### Login View
- **URL**: /login/
- **Description**: Handles user login.

#### Logout View
- **URL**: /logout/
- **Description**: Handles user logout.

## Migrations

### 0002_profile_fields
- **Description**: Adds first_name and last_name fields to the Profile model.

### 0002_alter_bestselleraccolade_category
- **Description**: Alters the category field in the BestsellerAccolade model to include choices for Top 5, Top 10, and Top 25.

## Admin Configurations

### Catalog Admin
- **Description**: No custom admin configurations.

### Accounts Admin
- **Description**: No custom admin configurations.

## Tests

### Catalog Tests
- **Description**: Placeholder for catalog tests.

### Accounts Tests
- **Description**: Placeholder for accounts tests.

## URL Configurations

### Catalog URLs
- **Description**: Defines the URL patterns for the catalog application.

#### Home URL
- **Pattern**: ''
- **View**: Redirects to 'books'

#### Books URL
- **Pattern**: 'books/'
- **View**: views.home

#### Book Detail URL
- **Pattern**: 'books/<int:id>/'
- **View**: views.book_detail

## Filters

### BookFilter
- **Description**: Provides filtering options for the Book model.
- **Fields**: title (CharField), author (ForeignKey to Author), accolades (CharField)

### BestsellerAccoladeFilter
- **Description**: Provides filtering options for the BestsellerAccolade model.
- **Fields**: category (CharField)

### AuthorFilter
- **Description**: Provides filtering options for the Author model.
- **Fields**: name (CharField)