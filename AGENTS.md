# AGENTS Documentation

## Models

### Author
- **Fields**: name (CharField), bio (TextField)
- **Description**: Represents an author with a name and optional biography.

### Publisher
- **Fields**: name (CharField), website (URLField)
- **Description**: Represents a publisher with a name and optional website.

### Book
- **Fields**: title (CharField), author (ForeignKey to Author), publisher (ForeignKey to Publisher), publish_date (DateField)
- **Description**: Represents a book with a title, author, publisher, and publish date.

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
- **Fields**: title, author, publisher, publish_date, accolades
- **Description**: Form for creating or updating a book, with an optional accolades field.

## Filters

### BookFilter
- **Model**: Book
- **Fields**: title (CharFilter), author__name (CharFilter), publisher__name (CharFilter), publish_date (DateFromToRangeFilter)
- **Description**: Filter for searching books by title, author name, publisher name, and publish date range.

## Views

### BookListView
- **Description**: Displays a list of books with filtering options.

### AuthorDetailView
- **Description**: Displays detailed information about a specific author.

### PublisherDetailView
- **Description**: Displays detailed information about a specific publisher.

### BookDetailView
- **Description**: Displays detailed information about a specific book.

### BookCreateView
- **Description**: Provides a form for creating a new book.

### BookUpdateView
- **Description**: Provides a form for updating an existing book.

### BookDeleteView
- **Description**: Allows for the deletion of a book.