from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse, HttpResponse
from django.db.models import Q, Count
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.http import require_POST
from django.core.paginator import Paginator
from django.contrib.auth.decorators import login_required
from .filters import BookFilter, AuthorFilter
from .models import Book, Author, Publisher, BestsellerAccolade
from django.template.loader import render_to_string
from django.core.serializers.json import DjangoJSONEncoder
import json

from django.db.models import Prefetch
from .forms import BookForm, AuthorForm, PublisherForm, BestsellerAccoladeForm, DateRangeForm
@login_required
def home(request):
    books = Book.objects.select_related('author', 'publisher').prefetch_related(
        Prefetch('bestselleraccolade_set', queryset=BestsellerAccolade.objects.all())
    )

    # Check if simple search is applied
    simple_search = request.GET.get('simple_search', '')

    # Create the filter with request parameters
    book_filter = BookFilter(request.GET, queryset=books)
    date_range_form = DateRangeForm(request.GET)

    # Get filter values from request.GET
    book_id = request.GET.get('book')
    author_id = request.GET.get('author')
    publisher_id = request.GET.get('publisher')
    publish_date_after = request.GET.get('publish_date_after')
    publish_date_before = request.GET.get('publish_date_before')
    accolade = request.GET.get('accolade')
    accolades_list = request.GET.getlist('accolades')

    # Initialize names to None
    book_name = None
    author_name = None
    publisher_name = None

    # Get names for display in active filters
    if book_id:
        book_obj = Book.objects.filter(id=book_id).first()
        if book_obj:
            book_name = book_obj.title

    if author_id:
        author_obj = Author.objects.filter(id=author_id).first()
        if author_obj:
            author_name = author_obj.name

    if publisher_id:
        publisher_obj = Publisher.objects.filter(id=publisher_id).first()
        if publisher_obj:
            publisher_name = publisher_obj.name

    # Apply filters to queryset
    filtered_qs = book_filter.qs

    # Apply additional filters
    if book_id:
        filtered_qs = filtered_qs.filter(id=book_id)
    if author_id:
        filtered_qs = filtered_qs.filter(author_id=author_id)
    if publisher_id:
        filtered_qs = filtered_qs.filter(publisher_id=publisher_id)

    if simple_search:
        filtered_qs = filtered_qs.filter(
            Q(title__icontains=simple_search) |
            Q(author__name__icontains=simple_search) |
            Q(publisher__name__icontains=simple_search)
        )

    # Apply date range and accolade filters
    if date_range_form.is_valid():
        publish_date_after = date_range_form.cleaned_data.get('publish_date_after')
        publish_date_before = date_range_form.cleaned_data.get('publish_date_before')
        accolade = date_range_form.cleaned_data.get('accolade')
        accolades = date_range_form.cleaned_data.get('accolades')

        if publish_date_after:
            filtered_qs = filtered_qs.filter(publish_date__gte=publish_date_after)
        if publish_date_before:
            filtered_qs = filtered_qs.filter(publish_date__lte=publish_date_before)
        if accolade:
            filtered_qs = filtered_qs.filter(bestselleraccolade__category=accolade).distinct()
        elif accolades:  # Only apply multiple accolades if single accolade is not selected
            q_objects = Q()
            for value in accolades:
                q_objects |= Q(bestselleraccolade__category=value)
            filtered_qs = filtered_qs.filter(q_objects).distinct()

    # Get sorting parameters
    sort_by = request.GET.get('sort_by', 'title')  # Default sort by title
    sort_dir = request.GET.get('sort_dir', 'asc')  # Default ascending order

    # Apply sorting
    if sort_dir == 'desc':
        sort_by = f'-{sort_by}'  # Add minus sign for descending order

    # Handle special sort cases
    if sort_by in ['title', '-title']:
        filtered_qs = filtered_qs.order_by(sort_by)
    elif sort_by in ['author__name', '-author__name']:
        filtered_qs = filtered_qs.order_by(sort_by)
    elif sort_by in ['publisher__name', '-publisher__name']:
        filtered_qs = filtered_qs.order_by(sort_by)
    elif sort_by in ['publish_date', '-publish_date']:
        filtered_qs = filtered_qs.order_by(sort_by)
    else:
        # Default sort by title if invalid sort parameter
        filtered_qs = filtered_qs.order_by('title')
        
    paginator = Paginator(filtered_qs, 20)
    page_number = request.GET.get('page')
    books_page = paginator.get_page(page_number)

    # Update context to include all search parameters
    context = {
        'filter': book_filter,
        'date_range_form': date_range_form,
        'books': books_page,
        'request': request,
        'accolades_list': accolades_list,
        'book_name': book_name,
        'author_name': author_name,
        'publisher_name': publisher_name,
        'sort_by': sort_by.replace('-', ''),
        'sort_dir': sort_dir,
        'publish_date_after': publish_date_after,
        'publish_date_before': publish_date_before,
        'accolade': accolade,
        'simple_search': simple_search,
    }

    if request.user.is_authenticated:
        context['favorite_ids'] = list(request.user.profile.favorite_books.values_list('id', flat=True))

    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        html = render_to_string('partials/book_list.html', context, request=request)
        return HttpResponse(html)

    return render(request, 'books.html', context)
    
@login_required
def author_list(request):
    authors = (
        Author.objects
        .annotate(
            book_count=Count('book'),
            top5_count=Count(
                'book__bestselleraccolade',
                filter=Q(book__bestselleraccolade__category='Top 5')
            ),
            top10_count=Count(
                'book__bestselleraccolade',
                filter=Q(book__bestselleraccolade__category='Top 10')
            )
        )
    )

    simple_search = request.GET.get('simple_search', '')

    author_filter = AuthorFilter(request.GET, queryset=authors)
    date_range_form = DateRangeForm(request.GET)

    book_id = request.GET.get('book')
    publisher_id = request.GET.get('publisher')
    publish_date_after = request.GET.get('publish_date_after')
    publish_date_before = request.GET.get('publish_date_before')
    accolade = request.GET.get('accolade')
    accolades_list = request.GET.getlist('accolades')

    book_name = None
    publisher_name = None

    if book_id:
        book_obj = Book.objects.filter(id=book_id).first()
        if book_obj:
            book_name = book_obj.title

    if publisher_id:
        publisher_obj = Publisher.objects.filter(id=publisher_id).first()
        if publisher_obj:
            publisher_name = publisher_obj.name

    filtered_qs = author_filter.qs

    if book_id:
        filtered_qs = filtered_qs.filter(book__id=book_id)
    if publisher_id:
        filtered_qs = filtered_qs.filter(book__publisher_id=publisher_id)

    if simple_search:
        filtered_qs = filtered_qs.filter(
            Q(name__icontains=simple_search) |
            Q(book__title__icontains=simple_search) |
            Q(book__publisher__name__icontains=simple_search)
        )

    if date_range_form.is_valid():
        publish_date_after = date_range_form.cleaned_data.get('publish_date_after')
        publish_date_before = date_range_form.cleaned_data.get('publish_date_before')
        accolade = date_range_form.cleaned_data.get('accolade')
        accolades = date_range_form.cleaned_data.get('accolades')

        if publish_date_after:
            filtered_qs = filtered_qs.filter(book__publish_date__gte=publish_date_after)
        if publish_date_before:
            filtered_qs = filtered_qs.filter(book__publish_date__lte=publish_date_before)
        if accolade:
            filtered_qs = filtered_qs.filter(book__bestselleraccolade__category=accolade).distinct()
        elif accolades:
            q_objects = Q()
            for value in accolades:
                q_objects |= Q(book__bestselleraccolade__category=value)
            filtered_qs = filtered_qs.filter(q_objects).distinct()

    sort_by = request.GET.get('sort_by', 'name')
    sort_dir = request.GET.get('sort_dir', 'asc')
    sort_field = f'-{sort_by}' if sort_dir == 'desc' else sort_by

    if sort_field in ['name', '-name', 'book_count', '-book_count', 'top5_count', '-top5_count', 'top10_count', '-top10_count']:
        filtered_qs = filtered_qs.order_by(sort_field)
    else:
        filtered_qs = filtered_qs.order_by('name')

    paginator = Paginator(filtered_qs, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        'authors': page_obj,
        'simple_search': simple_search,
        'book_name': book_name,
        'publisher_name': publisher_name,
        'sort_by': sort_by,
        'sort_dir': sort_dir,
        'publish_date_after': publish_date_after,
        'publish_date_before': publish_date_before,
        'accolade': accolade,
        'accolades_list': accolades_list,
        'filter': author_filter,
        'date_range_form': date_range_form,
    }
    if request.user.is_authenticated:
        context['favorite_ids'] = list(request.user.profile.favorite_authors.values_list('id', flat=True))

    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        html = render_to_string('partials/author_list.html', context, request=request)
        return HttpResponse(html)

    analytics = {
        'total_authors': filtered_qs.count(),
        'authors_with_top5': filtered_qs.filter(top5_count__gt=0).count(),
        'authors_with_top10': filtered_qs.filter(top10_count__gt=0).count(),
        'top_authors_top5': filtered_qs.filter(top5_count__gt=0).order_by('-top5_count')[:5],
        'top_authors_top10': filtered_qs.filter(top10_count__gt=0).order_by('-top10_count')[:5],
    }

    context['analytics'] = analytics

    return render(request, 'authors.html', context)

@login_required
def publisher_list(request):
    publishers = (
        Publisher.objects
        .annotate(
            book_count=Count('book'),
            top5_count=Count(
                'book__bestselleraccolade',
                filter=Q(book__bestselleraccolade__category='Top 5')
            ),
            top10_count=Count(
                'book__bestselleraccolade',
                filter=Q(book__bestselleraccolade__category='Top 10')
            )
        )
    )

    analytics = {
        'total_publishers': publishers.count(),
        'publishers_with_top5': publishers.filter(top5_count__gt=0).count(),
        'publishers_with_top10': publishers.filter(top10_count__gt=0).count(),
        'top_publishers_top5': publishers.filter(top5_count__gt=0).order_by('-top5_count')[:5],
        'top_publishers_top10': publishers.filter(top10_count__gt=0).order_by('-top10_count')[:5],
    }

    return render(request, 'publishers.html', {
        'publishers': publishers,
        'analytics': analytics,
    })

@login_required
def bestseller_list(request):
    bestsellers = BestsellerAccolade.objects.select_related('book').all()
    return render(request, 'bestseller_list.html', {'bestsellers': bestsellers})

@login_required
def add_entity(request, entity_form, template, redirect_url):
    if request.method == 'POST':
        form = entity_form(request.POST)
        if form.is_valid():
            form.save()
            return redirect(redirect_url)
    else:
        form = entity_form()
    return render(request, template, {'form': form})

@login_required
def add_author(request):
    return add_entity(request, AuthorForm, 'add_author.html', 'authors')

@login_required
def add_publisher(request):
    return add_entity(request, PublisherForm, 'add_publisher.html', 'publishers')

@login_required
def add_book(request):
    return add_entity(request, BookForm, 'add_book.html', 'books')

@login_required
def add_bestseller(request):
    return add_entity(request, BestsellerAccoladeForm, 'add_bestseller.html', 'bestsellers')

@login_required
def save_author(request, author_id=None):
    if request.method == 'POST':
        instance = Author.objects.get(id=author_id) if author_id else None
        form = AuthorForm(request.POST, instance=instance)
        if form.is_valid():
            form.save()
            return JsonResponse({'success': True})
        return JsonResponse({'success': False, 'errors': form.errors}, status=400)

@login_required
def get_author_data(request, author_id):
    author = get_object_or_404(Author, id=author_id)
    data = {
        'id': author.id,
        'name': author.name,
        'bio': author.bio,
    }
    return JsonResponse(data)

@require_POST
@csrf_protect
@login_required
def delete_author_ajax(request, author_id):
    try:
        author = Author.objects.get(pk=author_id)
        name = author.name
        author.delete()
        return JsonResponse({'status': 'success', 'message': f'Author "{name}" has been deleted.'})
    except Author.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Author not found'}, status=404)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@require_POST
@login_required
def update_book_ajax(request, book_id):
    try:
        book = Book.objects.get(pk=book_id)
        book.title = request.POST.get('title', book.title)
        book.save()
        return JsonResponse({'status': 'success', 'title': book.title})
    except Book.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Book not found'}, status=404)

# views.py

@login_required
def ajax_search_books(request):
    q = request.GET.get('q', '')
    author_id = request.GET.get('author')
    publisher_id = request.GET.get('publisher')
    books = Book.objects.filter(title__icontains=q)

    if author_id:
        books = books.filter(author_id=author_id)
    if publisher_id:
        books = books.filter(publisher_id=publisher_id)

    results = books.values('id', 'title')[:20]
    return JsonResponse([{'id': item['id'], 'text': item['title']} for item in results], safe=False)


@login_required
def ajax_search_authors(request):
    q = request.GET.get('q', '')
    book_id = request.GET.get('book')
    publisher_id = request.GET.get('publisher')

    authors = Author.objects.filter(name__icontains=q)

    if book_id:
        authors = authors.filter(book__id=book_id)
    if publisher_id:
        authors = authors.filter(book__publisher_id=publisher_id)

    authors = authors.distinct().values('id', 'name')[:20]
    return JsonResponse([{'id': item['id'], 'text': item['name']} for item in authors], safe=False)


@login_required
def ajax_search_publishers(request):
    q = request.GET.get('q', '')
    book_id = request.GET.get('book')
    author_id = request.GET.get('author')

    publishers = Publisher.objects.filter(name__icontains=q)

    if book_id:
        publishers = publishers.filter(book__id=book_id)
    if author_id:
        publishers = publishers.filter(book__author_id=author_id)

    publishers = publishers.distinct().values('id', 'name')[:20]
    return JsonResponse([{'id': item['id'], 'text': item['name']} for item in publishers], safe=False)


@login_required
def save_book(request, book_id=None):
    if request.method == 'POST':
        instance = Book.objects.get(id=book_id) if book_id else None
        form = BookForm(request.POST, instance=instance)

        if form.is_valid():
            book = form.save(commit=False)
            book.save()  
            
            accolades_list = request.POST.getlist('accolades')

            book.bestselleraccolade_set.all().delete()

            # Add new accolades
            for category in accolades_list:
                BestsellerAccolade.objects.create(
                    book=book,
                    category=category,
                    accolade_date=book.publish_date
                )

            return JsonResponse({'success': True})

        return JsonResponse({'success': False, 'errors': form.errors}, status=400)

@login_required
def get_book_data(request, book_id):
    book = get_object_or_404(Book, id=book_id)
    accolades = list(book.bestselleraccolade_set.values_list('category', flat=True))
    data = {
        'id': book.id,
        'title': book.title,
        'author': {'id': book.author.id, 'text': book.author.name},
        'publisher': {'id': book.publisher.id, 'text': book.publisher.name},
        'publish_date': book.publish_date.strftime('%Y-%m-%d'),
        'accolades': accolades,
    }
    return JsonResponse(data)

@login_required
def ajax_get_accolades(request):
    accolades = set(
        BestsellerAccolade.objects.values_list('category', flat=True).distinct()
    )
    # Include all defined choices even if not present in the database
    accolades.update([choice[0] for choice in BestsellerAccolade.ACCOLADE_CHOICES])
    data = [{'id': accolade, 'text': accolade} for accolade in sorted(accolades)]
    return JsonResponse(data, safe=False)

@require_POST
@csrf_protect
@login_required
def delete_book_ajax(request, book_id):
    try:
        book = Book.objects.get(pk=book_id)
        book_title = book.title
        book.delete()
        return JsonResponse({
            'status': 'success', 
            'message': f'Book "{book_title}" has been deleted.'
        })
    except Book.DoesNotExist:
        return JsonResponse({
            'status': 'error', 
            'message': 'Book not found'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)


@login_required
def dashboard(request):
    total_books = Book.objects.count()
    total_top5 = BestsellerAccolade.objects.filter(category='Top 5').count()
    total_top10 = BestsellerAccolade.objects.filter(category='Top 10').count()

    top_authors_top5 = (
        Author.objects
        .annotate(top5_count=Count(
            'book__bestselleraccolade',
            filter=Q(book__bestselleraccolade__category='Top 5')
        ))
        .order_by('-top5_count')[:5]
    )

    top_publishers_top5 = (
        Publisher.objects
        .annotate(top5_count=Count(
            'book__bestselleraccolade',
            filter=Q(book__bestselleraccolade__category='Top 5')
        ))
        .order_by('-top5_count')[:5]
    )

    latest_books = Book.objects.select_related('author', 'publisher').prefetch_related(
        'bestselleraccolade_set'
    ).order_by('-publish_date')[:8]

    stats = {
        'totalBooks': total_books,
        'totalTop5': total_top5,
        'totalTop10': total_top10,
        'topAuthorsTop5': [
            {'name': a.name, 'count': a.top5_count}
            for a in top_authors_top5
        ],
        'topPublishersTop5': [
            {'name': p.name, 'count': p.top5_count}
            for p in top_publishers_top5
        ],
    }

    stats_json = json.dumps(stats, cls=DjangoJSONEncoder)

    return render(request, 'dashboard.html', {
        'stats_json': stats_json,
        'latest_books': latest_books,
    })


def get_filtered_books(request):
    books = Book.objects.select_related('author', 'publisher').prefetch_related(
        'bestselleraccolade_set'
    )

    simple_search = request.GET.get('simple_search', '')
    if simple_search:
        books = books.filter(
            Q(title__icontains=simple_search) |
            Q(author__name__icontains=simple_search) |
            Q(publisher__name__icontains=simple_search)
        )

    book_filter = BookFilter(request.GET, queryset=books)
    filtered_qs = book_filter.qs

    book_id = request.GET.get('book')
    author_id = request.GET.get('author')
    publisher_id = request.GET.get('publisher')
    publish_date_after = request.GET.get('publish_date_after')
    publish_date_before = request.GET.get('publish_date_before')
    accolade = request.GET.get('accolade')
    accolades_list = request.GET.getlist('accolades')

    if book_id:
        filtered_qs = filtered_qs.filter(id=book_id)
    if author_id:
        filtered_qs = filtered_qs.filter(author_id=author_id)
    if publisher_id:
        filtered_qs = filtered_qs.filter(publisher_id=publisher_id)
    if publish_date_after:
        filtered_qs = filtered_qs.filter(publish_date__gte=publish_date_after)
    if publish_date_before:
        filtered_qs = filtered_qs.filter(publish_date__lte=publish_date_before)
    if accolade:
        filtered_qs = filtered_qs.filter(bestselleraccolade__category=accolade).distinct()
    elif accolades_list:
        q_objects = Q()
        for value in accolades_list:
            q_objects |= Q(bestselleraccolade__category=value)
        filtered_qs = filtered_qs.filter(q_objects).distinct()

    return filtered_qs


@login_required
def filtered_analytics(request):
    filtered_books = get_filtered_books(request)
    book_ids = filtered_books.values_list('id', flat=True)

    total_books = filtered_books.count()
    total_top5 = BestsellerAccolade.objects.filter(
        category='Top 5', book_id__in=book_ids
    ).count()
    total_top10 = BestsellerAccolade.objects.filter(
        category='Top 10', book_id__in=book_ids
    ).count()

    top_authors_top5 = (
        Author.objects
        .filter(book__in=book_ids)
        .annotate(top5_count=Count(
            'book__bestselleraccolade',
            filter=Q(book__bestselleraccolade__category='Top 5', book__in=book_ids)
        ))
        .filter(top5_count__gt=0)
        .order_by('-top5_count')[:5]
    )

    top_publishers_top5 = (
        Publisher.objects
        .filter(book__in=book_ids)
        .annotate(top5_count=Count(
            'book__bestselleraccolade',
            filter=Q(book__bestselleraccolade__category='Top 5', book__in=book_ids)
        ))
        .filter(top5_count__gt=0)
        .order_by('-top5_count')[:5]
    )

    stats = {
        'totalBooks': total_books,
        'totalTop5': total_top5,
        'totalTop10': total_top10,
        'topAuthorsTop5': [
            {'name': a.name, 'count': a.top5_count}
            for a in top_authors_top5
        ],
        'topPublishersTop5': [
            {'name': p.name, 'count': p.top5_count}
            for p in top_publishers_top5
        ],
    }

    return JsonResponse(stats)


def get_filtered_authors(request):
    authors = (
        Author.objects
        .annotate(
            book_count=Count('book'),
            top5_count=Count(
                'book__bestselleraccolade',
                filter=Q(book__bestselleraccolade__category='Top 5')
            ),
            top10_count=Count(
                'book__bestselleraccolade',
                filter=Q(book__bestselleraccolade__category='Top 10')
            )
        )
    )

    simple_search = request.GET.get('simple_search', '')
    if simple_search:
        authors = authors.filter(
            Q(name__icontains=simple_search) |
            Q(book__title__icontains=simple_search) |
            Q(book__publisher__name__icontains=simple_search)
        )

    author_filter = AuthorFilter(request.GET, queryset=authors)
    filtered_qs = author_filter.qs

    book_id = request.GET.get('book')
    publisher_id = request.GET.get('publisher')
    publish_date_after = request.GET.get('publish_date_after')
    publish_date_before = request.GET.get('publish_date_before')
    accolade = request.GET.get('accolade')
    accolades_list = request.GET.getlist('accolades')

    if book_id:
        filtered_qs = filtered_qs.filter(book__id=book_id)
    if publisher_id:
        filtered_qs = filtered_qs.filter(book__publisher_id=publisher_id)
    if publish_date_after:
        filtered_qs = filtered_qs.filter(book__publish_date__gte=publish_date_after)
    if publish_date_before:
        filtered_qs = filtered_qs.filter(book__publish_date__lte=publish_date_before)
    if accolade:
        filtered_qs = filtered_qs.filter(book__bestselleraccolade__category=accolade).distinct()
    elif accolades_list:
        q_objects = Q()
        for value in accolades_list:
            q_objects |= Q(book__bestselleraccolade__category=value)
        filtered_qs = filtered_qs.filter(q_objects).distinct()

    sort_by = request.GET.get('sort_by', 'name')
    sort_dir = request.GET.get('sort_dir', 'asc')
    sort_field = f'-{sort_by}' if sort_dir == 'desc' else sort_by

    valid_fields = [
        'name', '-name', 'book_count', '-book_count',
        'top5_count', '-top5_count', 'top10_count', '-top10_count'
    ]
    if sort_field in valid_fields:
        filtered_qs = filtered_qs.order_by(sort_field)
    else:
        filtered_qs = filtered_qs.order_by('name')

    return filtered_qs


@login_required
def filtered_author_analytics(request):
    filtered_authors = get_filtered_authors(request)

    stats = {
        'totalAuthors': filtered_authors.count(),
        'authorsWithTop5': filtered_authors.filter(top5_count__gt=0).count(),
        'authorsWithTop10': filtered_authors.filter(top10_count__gt=0).count(),
        'topAuthorsTop5': [
            {'name': a.name, 'count': a.top5_count}
            for a in filtered_authors.filter(top5_count__gt=0).order_by('-top5_count')[:5]
        ],
        'topAuthorsTop10': [
            {'name': a.name, 'count': a.top10_count}
            for a in filtered_authors.filter(top10_count__gt=0).order_by('-top10_count')[:5]
        ],
    }

    return JsonResponse(stats)
