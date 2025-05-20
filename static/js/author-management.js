// Author management functionality

let currentSortBy = '';
let currentSortDir = '';

function initializeAuthorPage(sortBy, sortDir) {
    currentSortBy = sortBy;
    currentSortDir = sortDir;
    setupAdvancedSelect2();
}

function setupAdvancedSelect2() {
    if (!$('#author-book-select').hasClass('select2-hidden-accessible')) {
        $('#author-book-select').select2({
            placeholder: 'Search books...',
            ajax: {
                url: '/ajax/search-books/',
                dataType: 'json',
                delay: 250,
                data: params => ({q: params.term}),
                processResults: data => ({results: data}),
                minimumInputLength: 2
            }
        });
    }

    if (!$('#author-publisher-select').hasClass('select2-hidden-accessible')) {
        $('#author-publisher-select').select2({
            placeholder: 'Search publishers...',
            ajax: {
                url: '/ajax/search-publishers/',
                dataType: 'json',
                delay: 250,
                data: params => ({q: params.term}),
                processResults: data => ({results: data}),
                minimumInputLength: 2
            }
        });
    }
}

function getCsrfToken() {
    let csrftoken = getCookie('csrftoken');
    if (!csrftoken) {
        const csrfInput = document.querySelector('[name=csrfmiddlewaretoken]');
        if (csrfInput) {
            csrftoken = csrfInput.value;
        }
    }
    return csrftoken;
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Add Author
$(document).on('click', '.btn-add-author', function() {
    $('#author-form')[0].reset();
    $('#author-id').val('');
    $('#authorModal').modal('show');
});

// Edit Author
$(document).on('click', '.btn-edit-author', function() {
    const id = $(this).data('author-id');
    $.getJSON(`/ajax/get-author/${id}/`, function(data) {
        $('#author-id').val(data.id);
        $('input[name="name"]').val(data.name);
        $('textarea[name="bio"]').val(data.bio);
        $('#authorModal').modal('show');
    });
});

// Save Author
$(document).on('submit', '#author-form', function(e) {
    e.preventDefault();
    const id = $('#author-id').val();
    const url = id ? `/ajax/save-author/${id}/` : '/ajax/save-author/';
    $.ajax({
        url: url,
        method: 'POST',
        data: $(this).serialize(),
        headers: { 'X-CSRFToken': getCsrfToken() },
        success: function() { window.location.reload(); },
        error: function(r) { alert('Error: ' + JSON.stringify(r.responseJSON.errors)); }
    });
});

// Delete Author
$(document).on('click', '.btn-delete-author', function(e) {
    e.preventDefault();
    const id = $(this).data('author-id');
    const name = $(this).data('author-name');
    if (confirm(`Delete author "${name}"?`)) {
        $.ajax({
            url: `/ajax/delete-author/${id}/`,
            method: 'POST',
            headers: { 'X-CSRFToken': getCsrfToken() },
            success: function(resp) {
                alert(resp.message);
                $(e.target).closest('tr').fadeOut(300, function(){ $(this).remove(); });
            },
            error: function(xhr) {
                let msg = 'Error deleting author.';
                if (xhr.responseJSON && xhr.responseJSON.message) { msg = xhr.responseJSON.message; }
                alert('Error: ' + msg);
            }
        });
    }
});

// Toggle favorite author
$(document).on('click', '.btn-favorite-author', function(e) {
    e.preventDefault();
    const btn = $(this);
    const id = btn.data('author-id');
    $.ajax({
        url: `/accounts/favorite-author/${id}/`,
        method: 'POST',
        headers: { 'X-CSRFToken': getCsrfToken() },
        success: function(data) {
            const icon = btn.find('i');
            if (data.action === 'added') {
                icon.removeClass('fa-star-o').addClass('fa-star text-warning');
            } else {
                icon.removeClass('fa-star text-warning').addClass('fa-star-o');
            }
        }
    });
});

// Simple search
$(document).on('submit', '#author-search-form', function(e) {
    e.preventDefault();
    performAuthorSearch();
});

function performAuthorSearch() {
    const query = $('#author-search-form input[name="simple_search"]').val();
    const params = new URLSearchParams();
    if (query) params.append('simple_search', query);
    $.ajax({
        url: window.location.pathname,
        type: 'get',
        data: params.toString(),
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        success: function(data) {
            $('#author-results').html(data);
            updateAuthorFilters(params);
        },
        error: function() { alert('Error retrieving authors.'); }
    });
}


// Remove filter
$(document).on('click', '.remove-author-filter', function(e) {
    e.preventDefault();
    const filter = $(this).data('filter');
    let params = new URLSearchParams(window.location.search);
    params.delete(filter);
    window.location.href = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
});

$('#authors-reset-btn, #authors-quick-reset-btn').on('click', function() {
    window.location.href = window.location.pathname;
});

// Remove author from favorites on profile page
$(document).on('click', '.btn-remove-favorite-author', function(e) {
    e.preventDefault();
    const btn = $(this);
    const id = btn.data('author-id');
    const name = btn.data('author-name');
    if (confirm(`Remove "${name}" from favorites?`)) {
        $.ajax({
            url: `/accounts/favorite-author/${id}/`,
            method: 'POST',
            headers: { 'X-CSRFToken': getCsrfToken() },
            success: function() { btn.closest('tr').fadeOut(300, function(){ $(this).remove(); }); },
            error: function() { alert('Error removing favorite.'); }
        });
    }
});

// Advanced search button
$(document).on('click', '#author-search-btn', function() {
    performCombinedAuthorSearch();
    $('#authorSearchModal').modal('hide');
});

// Advanced search form submit
$(document).on('submit', '#author-advanced-search-form', function(e) {
    e.preventDefault();
    $('#author-search-btn').trigger('click');
});

function performCombinedAuthorSearch() {
    const simpleQuery = $('#author-search-form input[name="simple_search"]').val();
    const advancedData = $('#author-advanced-search-form').serializeArray();

    let combined = new FormData();
    if (simpleQuery) {
        combined.append('simple_search', simpleQuery);
    }
    advancedData.forEach(item => {
        if (item.value) {
            combined.append(item.name, item.value);
        }
    });

    const params = new URLSearchParams();
    for (const pair of combined.entries()) {
        params.append(pair[0], pair[1]);
    }

    $.ajax({
        url: window.location.pathname,
        type: 'get',
        data: params.toString(),
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        success: function(data) {
            $('#author-results').html(data);
            updateAuthorFilters(params);
            initializeAuthorPage(currentSortBy, currentSortDir);
            if (history.pushState) {
                const newUrl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?' + params.toString();
                window.history.pushState({path: newUrl}, '', newUrl);
            }
        },
        error: function() { alert('Error retrieving authors.'); }
    });
}

function updateAuthorFilters(params) {
    let filterTags = [];
    const simpleSearch = params.get('simple_search');
    if (simpleSearch) {
        filterTags.push(`<li><span class="label label-info">Search: ${simpleSearch} <a href="#" class="remove-author-filter" data-filter="simple_search"><i class="glyphicon glyphicon-remove"></i></a></span></li>`);
    }

    const bookId = params.get('book');
    if (bookId) {
        const bookName = $('#author-book-select').select2('data')[0]?.text || window.initialFilterValues.book_name || 'Selected Book';
        filterTags.push(`<li><span class="label label-info">Book: ${bookName} <a href="#" class="remove-author-filter" data-filter="book"><i class="glyphicon glyphicon-remove"></i></a></span></li>`);
    }

    const publisherId = params.get('publisher');
    if (publisherId) {
        const publisherName = $('#author-publisher-select').select2('data')[0]?.text || window.initialFilterValues.publisher_name || 'Selected Publisher';
        filterTags.push(`<li><span class="label label-info">Publisher: ${publisherName} <a href="#" class="remove-author-filter" data-filter="publisher"><i class="glyphicon glyphicon-remove"></i></a></span></li>`);
    }

    const after = params.get('publish_date_after');
    if (after) {
        filterTags.push(`<li><span class="label label-info">From: ${after} <a href="#" class="remove-author-filter" data-filter="publish_date_after"><i class="glyphicon glyphicon-remove"></i></a></span></li>`);
    }

    const before = params.get('publish_date_before');
    if (before) {
        filterTags.push(`<li><span class="label label-info">To: ${before} <a href="#" class="remove-author-filter" data-filter="publish_date_before"><i class="glyphicon glyphicon-remove"></i></a></span></li>`);
    }

    const accolade = params.get('accolade');
    if (accolade) {
        filterTags.push(`<li><span class="label label-info">Accolade: ${accolade} <a href="#" class="remove-author-filter" data-filter="accolade"><i class="glyphicon glyphicon-remove"></i></a></span></li>`);
    }

    const accolades = params.getAll('accolades');
    accolades.forEach(value => {
        filterTags.push(`<li><span class="label label-info">Accolade: ${value} <a href="#" class="remove-author-filter" data-filter="accolades" data-value="${value}"><i class="glyphicon glyphicon-remove"></i></a></span></li>`);
    });

    $('#author-active-filters ul').html(filterTags.join(''));
    if (filterTags.length) {
        $('#authors-quick-reset-btn').show();
    } else {
        $('#authors-quick-reset-btn').hide();
    }
}

function resetAuthorFilters() {
    $('#author-book-select').val(null).trigger('change.select2');
    $('#author-publisher-select').val(null).trigger('change.select2');
    $('input[name="publish_date_after"]').val('');
    $('input[name="publish_date_before"]').val('');
    $('input[name="accolades"]').prop('checked', false);
    $('#author-search-btn').click();
}

$(document).on('click', '#authors-reset-btn', function() {
    resetAuthorFilters();
});

$(document).on('click', '#authors-reset-all-btn', function() {
    window.location.href = window.location.pathname;
});

// Sorting
$(document).on('click', '.sortable', function() {
    const sortBy = $(this).data('sort');
    let sortDir = 'asc';
    if (sortBy === currentSortBy && currentSortDir === 'asc') {
        sortDir = 'desc';
    }
    const currentUrl = new URL(window.location.href);
    const params = currentUrl.searchParams;
    params.set('sort_by', sortBy);
    params.set('sort_dir', sortDir);
    params.set('page', 1);
    window.location.href = currentUrl.toString();
});

// Pagination
$(document).on('click', '.pagination a', function(e) {
    e.preventDefault();
    const url = $(this).attr('href');
    $.ajax({
        url: url,
        type: 'get',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        success: function(data) {
            $('#author-results').html(data);
            initializeAuthorPage(currentSortBy, currentSortDir);
            if (history.pushState) {
                window.history.pushState({path: url}, '', url);
            }
        },
        error: function() { alert('Pagination error.'); }
    });
});

$(document).ready(function() {
    initializeAuthorPage(window.initialSortBy || '', window.initialSortDir || 'asc');
});
