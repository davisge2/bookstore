# AGENTS Documentation

## Catalog App

### Models

#### Author
- **Fields**: name (CharField), bio (TextField)
- **Description**: Represents an author with a name and optional bio.

#### Publisher
- **Fields**: name (CharField), website (URLField)
- **Description**: Represents a publisher with a name and optional website.

#### Book
- **Fields**: title (CharField), author (ForeignKey to Author)
- **Description**: Represents a book with a title and an author.

### Forms

#### AuthorForm
- **Description**: Form for creating and updating Author instances.

### Migrations

#### 0001_initial.py
- **Description**: Initial migration for the catalog app, creating the Author, Publisher, and Book models.

#### 0002_alter_bestselleraccolade_category.py
- **Description**: Alters the BestsellerAccolade model's category field.

## Accounts App

### Migrations

#### 0002_profile_fields.py
- **Description**: Adds first_name and last_name fields to the Profile model.