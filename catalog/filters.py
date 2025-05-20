import django_filters
from .models import Book, BestsellerAccolade
from django import forms
from django.db.models import Q

class BookFilter(django_filters.FilterSet):
    title = django_filters.CharFilter(lookup_expr='icontains')
    author__name = django_filters.CharFilter(lookup_expr='icontains', label='Author')
    publisher__name = django_filters.CharFilter(lookup_expr='icontains', label='Publisher')
    publish_date = django_filters.DateFromToRangeFilter()
    
    # Single accolade filter
    accolade = django_filters.ChoiceFilter(
        choices=BestsellerAccolade.ACCOLADE_CHOICES,
        label='Bestseller Accolade',
        method='filter_by_accolade'
    )
    
    # Multiple accolades filter
    accolades = django_filters.MultipleChoiceFilter(
        choices=BestsellerAccolade.ACCOLADE_CHOICES,
        label='Multiple Accolades',
        method='filter_by_multiple_accolades',
        widget=forms.CheckboxSelectMultiple
    )

    class Meta:
        model = Book
        fields = ['title', 'author__name', 'publisher__name', 'publish_date', 'accolade', 'accolades']
        
    def filter_by_accolade(self, queryset, name, value):
        if value:
            return queryset.filter(bestselleraccolade__category=value).distinct()
        return queryset
        
    def filter_by_multiple_accolades(self, queryset, name, values):
        if values:
            # This creates an OR filter for the selected accolades
            q_objects = Q()
            for value in values:
                q_objects |= Q(bestselleraccolade__category=value)
            return queryset.filter(q_objects).distinct()
        return queryset