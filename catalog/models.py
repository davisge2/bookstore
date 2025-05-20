from django.db import models

class Author(models.Model):
    name = models.CharField(max_length=100)
    bio = models.TextField(blank=True)

    def __str__(self):
        return self.name

class Publisher(models.Model):
    name = models.CharField(max_length=100)
    website = models.URLField(blank=True)

    def __str__(self):
        return self.name

class Book(models.Model):
    title = models.CharField(max_length=200)
    author = models.ForeignKey(Author, on_delete=models.CASCADE)
    publisher = models.ForeignKey(Publisher, on_delete=models.CASCADE)
    publish_date = models.DateField()

    def __str__(self):
        return self.title

class BestsellerAccolade(models.Model):
    ACCOLADE_CHOICES = [
        ('Top 5', 'Top 5'),
        ('Top 10', 'Top 10'),
    ]
    
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    category = models.CharField(max_length=50, choices=ACCOLADE_CHOICES)
    accolade_date = models.DateField()

    def __str__(self):
        return f"{self.book.title} - {self.category}"
