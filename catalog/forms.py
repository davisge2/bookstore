from django import forms
from django.forms import ModelForm, ModelMultipleChoiceField, CharField, DateInput
from .models import Book, BestsellerAccolade, Author, Publisher

class AuthorForm(ModelForm):
    class Meta:
        model = Author
        fields = ['name', 'bio']

class PublisherForm(ModelForm):
    class Meta:
        model = Publisher
        fields = ['name', 'website']

class BookForm(ModelForm):
    accolades = CharField(required=False)

    class Meta:
        model = Book
        fields = ['title', 'author', 'publisher', 'publish_date', 'accolades']

class BestsellerAccoladeForm(ModelForm):
    class Meta:
        model = BestsellerAccolade
        fields = ['book', 'category', 'accolade_date']

class DateRangeForm(forms.Form):
    publish_date_after = forms.DateField(
        required=False,
        widget=DateInput(attrs={'type': 'date', 'class': 'form-control'})
    )
    publish_date_before = forms.DateField(
        required=False,
        widget=DateInput(attrs={'type': 'date', 'class': 'form-control'})
    )
    accolade = forms.ChoiceField(
        choices=[('', 'Any')] + BestsellerAccolade.ACCOLADE_CHOICES,
        required=False,
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    accolades = forms.MultipleChoiceField(
        choices=BestsellerAccolade.ACCOLADE_CHOICES,
        required=False,
        widget=forms.CheckboxSelectMultiple(),
        help_text="Select multiple accolades (OR filter)"
    )