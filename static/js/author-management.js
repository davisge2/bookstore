// Author management functionality

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

function updateAuthorFilters(params) {
    const search = params.get('simple_search');
    let tags = '';
    if (search) {
        tags = `<li><span class="label label-info">Search: ${search} <a href="#" class="remove-author-filter" data-filter="simple_search"><i class="glyphicon glyphicon-remove"></i></a></span></li>`;
    }
    $('#author-active-filters ul').html(tags);
    if (search) { $('#authors-quick-reset-btn').show(); } else { $('#authors-quick-reset-btn').hide(); }
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
