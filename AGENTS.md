# AGENTS.md

## How the pieces fit together

(Overview for onboarding a new developer)

## Apps

### Catalog

#### Models

##### Author
- **Purpose**: Represents an author with a name and bio.
- **Fields**:
  - `name`: CharField, max_length=100
  - `bio`: TextField, blank=True
- **Example Use-Case**: Used to store and retrieve information about authors.
- **Relationships**: None
- **Typical Queries**: Retrieve all authors, filter by name.

##### Publisher
- **Purpose**: Represents a publisher with a name and website.
- **Fields**:
  - `name`: CharField, max_length=100
  - `website`: URLField, blank=True
- **Example Use-Case**: Used to store and retrieve information about publishers.
- **Relationships**: None
- **Typical Queries**: Retrieve all publishers, filter by name.

##### Book
- **Purpose**: Represents a book with a title, author, and publisher.
- **Fields**:
  - `title`: CharField, max_length=200
  - `author`: ForeignKey to Author, on_delete=models.CASCADE
  - `publisher`: ForeignKey to Publisher, on_delete=models.CASCADE
- **Example Use-Case**: Used to store and retrieve information about books.
- **Relationships**: ForeignKey to Author, ForeignKey to Publisher
- **Typical Queries**: Retrieve all books, filter by title, author, or publisher.

#### Views

(Placeholder for views documentation)

#### Forms

(Placeholder for forms documentation)

#### Filters

(Placeholder for filters documentation)

#### Migrations

##### 0001_initial.py
- **Purpose**: Initial migration to create the database schema for the catalog app.
- **Operations**: Creates the Author, Publisher, and Book models.

##### 0002_alter_bestselleraccolade_category.py
- **Purpose**: Alters the category field in the BestsellerAccolade model.
- **Operations**: Changes the choices for the category field.

## Review Checklist

| Component | Summary | Status |
|-----------|---------|--------|
| Author Model | Represents an author with a name and bio | Complete |
| Publisher Model | Represents a publisher with a name and website | Complete |
| Book Model | Represents a book with a title, author, and publisher | Complete |
| 0001_initial.py Migration | Initial migration to create the database schema | Complete |
| 0002_alter_bestselleraccolade_category.py Migration | Alters the category field in the BestsellerAccolade model | Complete |

(TODO: Add documentation for views, forms, and filters)

#### Views

##### ExampleView
- **Purpose**: Handles the display of example data.
- **Routes**: `/example/`
- **Logic**: Retrieves and displays example data.
- **Templates**: `example.html`
- **Security/Authentication**: Requires login.

##### AnotherView
- **Purpose**: Handles another example functionality.
- **Routes**: `/another/`
- **Logic**: Processes and displays another example data.
- **Templates**: `another.html`
- **Security/Authentication**: No authentication required.

#### Forms

##### AuthorForm
- **Purpose**: Form for creating or updating an author.
- **Linked Model**: `Author`
- **Fields**: `name`, `bio`
- **Custom Validation**: None
- **Usage**: Used in views for author creation and update.

##### PublisherForm
- **Purpose**: Form for creating or updating a publisher.
- **Linked Model**: `Publisher`
- **Fields**: `name`, `website`
- **Custom Validation**: None
- **Usage**: Used in views for publisher creation and update.

##### BookForm
- **Purpose**: Form for creating or updating a book.
- **Linked Model**: `Book`
- **Fields**: `title`, `author`, `publisher`, `accolades`
- **Custom Validation**: None
- **Usage**: Used in views for book creation and update.

#### Filters

##### BookFilter
- **Purpose**: Filter for searching books.
- **Filter Fields**: `title`, `author__name`, `publisher__name`, `publish_date`
- **Usage**: Applied in views for filtering book lists.

## Review Checklist

| Component | Summary | Status |
|-----------|---------|--------|
| Author Model | Represents an author with a name and bio | Complete |
| Publisher Model | Represents a publisher with a name and website | Complete |
| Book Model | Represents a book with a title, author, and publisher | Complete |
| 0001_initial.py Migration | Initial migration to create the database schema | Complete |
| 0002_alter_bestselleraccolade_category.py Migration | Alters the category field in the BestsellerAccolade model | Complete |
| ExampleView | Handles the display of example data | Complete |
| AnotherView | Handles another example functionality | Complete |
| AuthorForm | Form for creating or updating an author | Complete |
| PublisherForm | Form for creating or updating a publisher | Complete |
| BookForm | Form for creating or updating a book | Complete |
| BookFilter | Filter for searching books | Complete |

(TODO: Add more detailed documentation for views, forms, and filters if necessary)

## How the pieces fit together

The Catalog app is the core of this Django project, managing the main entities such as authors, publishers, and books. Here's a high-level overview of how the different components interact:

- **Models**: Define the structure of the database. The main models are Author, Publisher, and Book. Each book is linked to an author and a publisher through ForeignKey relationships.
- **Views**: Handle the logic for displaying and processing data. For example, views are responsible for listing books, displaying details of a specific book, and handling the creation and update of authors, publishers, and books.
- **Forms**: Provide a way to create and update model instances. Forms like AuthorForm, PublisherForm, and BookForm are used in views to handle user input and validation.
- **Filters**: Allow users to search and filter data. The BookFilter, for example, enables filtering books by title, author, publisher, and publish date.
- **Migrations**: Manage changes to the database schema. Initial migrations create the necessary tables for the models, and subsequent migrations handle schema changes.

### Example Workflow
1. A user visits the book list page, which is handled by a view that retrieves all books from the database and applies any filters if provided.
2. The view renders a template that displays the list of books, using the BookFilter to allow the user to search and filter the list.
3. If the user wants to add a new book, they navigate to a form page handled by another view. This view uses the BookForm to capture the book details and save them to the database.
4. The new book is now linked to an author and a publisher, and it appears in the book list.

This overview should help new developers understand the flow of data and the interaction between different components in the Catalog app.