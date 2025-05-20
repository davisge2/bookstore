/**
 * Book Management System
 * Consolidated JavaScript functionality
 */

// Global variables for sorting and searching state
let currentSortBy = '';
let currentSortDir = '';

// === INITIALIZATION ===

/**
 * Initialize all functionality
 * @param {string} sortBy - Current sort column
 * @param {string} sortDir - Current sort direction
 */
function initializeAll(sortBy, sortDir) {
    // Set global sort values
    currentSortBy = sortBy;
    currentSortDir = sortDir;
    
    // Initialize select2 components only if not already initialized
    initializeSelect2Components();
    
    // No need to initialize event handlers with event delegation,
    // they're already set up below
}

/**
 * Initialize Select2 dropdowns for search and forms
 */
function initializeSelect2Components() {
    // Only initialize if not already initialized
    if (!$('#author-select-modal').hasClass('select2-hidden-accessible')) {
        $('#author-select-modal').select2({
            placeholder: 'Search authors...',
            ajax: {
                url: '/ajax/search-authors/',
                dataType: 'json',
                delay: 250,
                data: params => ({q: params.term}),
                processResults: data => ({ results: data }),
                minimumInputLength: 2
            }
        });
    }
    
    if (!$('#publisher-select-modal').hasClass('select2-hidden-accessible')) {
        $('#publisher-select-modal').select2({
            placeholder: 'Search publishers...',
            ajax: {
                url: '/ajax/search-publishers/',
                dataType: 'json',
                delay: 250,
                data: params => ({q: params.term}),
                processResults: data => ({ results: data }),
                minimumInputLength: 2
            }
        });
    }
    
    if (!$('#accolades-select').hasClass('select2-hidden-accessible')) {
        $('#accolades-select').select2({
            placeholder: 'Select Accolades...',
            ajax: {
                url: '/ajax/get-accolades/',
                dataType: 'json',
                processResults: data => ({ results: data }),
            },
            tags: true, // allows creating new items
            tokenSeparators: [',']
        });
    }
    
    // Setup advanced search Select2 components
    setupAdvancedSearchSelect2();
}

/**
 * Set up Select2 components for advanced search
 */
function setupAdvancedSearchSelect2() {
    setupSelect2('#book-select', '/ajax/search-books/', () => getCurrentSelections('book'));
    setupSelect2('#author-select', '/ajax/search-authors/', () => getCurrentSelections('author'));
    setupSelect2('#publisher-select', '/ajax/search-publishers/', () => getCurrentSelections('publisher'));
}

/**
 * Helper to set up a Select2 component with proper configuration
 */
function setupSelect2(id, url, extraDataCallback) {
    if ($(id).hasClass('select2-hidden-accessible')) {
        return; // Already initialized
    }
    
    $(id).select2({
        placeholder: 'Start typing to search...',
        minimumInputLength: 3,
        ajax: {
            url: url,
            dataType: 'json',
            delay: 250,
            data: function(params) {
                let data = { q: params.term };
                if (extraDataCallback) {
                    data = {...data, ...extraDataCallback()};
                }
                return data;
            },
            processResults: function(data) {
                return { results: data };
            }
        }
    });
    
    // Check if there's an initial value that needs to be set (for existing filters)
    const urlParams = new URLSearchParams(window.location.search);
    const paramName = $(id).attr('name');
    const paramValue = urlParams.get(paramName);
    
    if (paramValue && window.initialFilterValues) {
        // For book, author, publisher selects, we need to fetch the text value
        const displayName = id === '#book-select' ? window.initialFilterValues.book_name : 
                            id === '#author-select' ? window.initialFilterValues.author_name : 
                            id === '#publisher-select' ? window.initialFilterValues.publisher_name : null;
        
        if (displayName) {
            // Create a new option and set it as selected
            const newOption = new Option(displayName, paramValue, true, true);
            $(id).append(newOption).trigger('change');
        }
    }
}

/**
 * Get current selections from other filters
 */
function getCurrentSelections(exclude) {
    let selections = {};
    if (exclude !== 'book') selections.book = $('#book-select').val();
    if (exclude !== 'author') selections.author = $('#author-select').val();
    if (exclude !== 'publisher') selections.publisher = $('#publisher-select').val();
    return selections;
}

// === BOOK CRUD OPERATIONS ===

/**
 * Event handler for edit book button
 */
$(document).on('click', '.btn-edit-book', function() {
    const bookId = $(this).data('book-id');
    $.getJSON(`/ajax/get-book/${bookId}/`, function(data) {
        $('#book-id').val(data.id);
        $('input[name="title"]').val(data.title);

        // Clear existing options before appending
        $('#author-select-modal').empty().append(new Option(data.author.text, data.author.id, true, true)).trigger('change');
        $('#publisher-select-modal').empty().append(new Option(data.publisher.text, data.publisher.id, true, true)).trigger('change');
        $('input[name="publish_date"]').val(data.publish_date);

        // Clear and re-populate accolades
        $('#accolades-select').empty();
        data.accolades.forEach(function(accolade) {
            if (!$('#accolades-select').find(`option[value="${accolade}"]`).length) {
                $('#accolades-select').append(new Option(accolade, accolade, true, true));
            }
        });
        $('#accolades-select').trigger('change');

        $('#bookModal').modal('show');
    });
});

/**
 * Event handler for add book button
 */
$(document).on('click', '.btn-add-book', function() {
    $('#book-form')[0].reset();
    $('#book-id').val('');
    $('#author-select-modal, #publisher-select-modal, #accolades-select').val(null).trigger('change');
    $('#bookModal').modal('show');
});

/**
 * Event handler for book form submission
 */
$(document).on('submit', '#book-form', function(e) {
    e.preventDefault();
    let bookId = $('#book-id').val();
    let url = bookId ? `/ajax/save-book/${bookId}/` : '/ajax/save-book/';

    // Serialize form properly including multi-select accolades
    let formData = $(this).serializeArray();
    
    // Add accolades if they exist
    const accolades = $('#accolades-select').val();
    if (accolades && accolades.length) {
        accolades.forEach(accolade => {
            formData.push({name: 'accolades', value: accolade});
        });
    }

    $.ajax({
        url: url,
        method: 'POST',
        data: formData,
        headers: {'X-CSRFToken': getCsrfToken()},
        success: function() {
            window.location.reload();
        },
        error: function(response) {
            alert('Error: ' + JSON.stringify(response.responseJSON.errors));
        }
    });
});

/**
 * Event handler for delete book button
 */
$(document).on('click', '.btn-delete-book', function(e) {
    e.preventDefault();
    const bookId = $(this).data('book-id');
    const bookTitle = $(this).data('book-title');
    
    // Show confirmation dialog
    if (confirm(`Are you sure you want to delete the book "${bookTitle}"? This action cannot be undone.`)) {
        // User confirmed, proceed with deletion
        $.ajax({
            url: `/ajax/delete-book/${bookId}/`,
            method: 'POST',
            headers: {
                'X-CSRFToken': getCsrfToken()
            },
            success: function(response) {
                // Show success message
                alert(response.message);
                
                // Remove the row from the table
                $(e.target).closest('tr').fadeOut(300, function() {
                    $(this).remove();
                });
            },
            error: function(xhr) {
                let errorMessage = 'An error occurred while deleting the book.';
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                }
                alert('Error: ' + errorMessage);
            }
        });
    }
});

// === SEARCHING AND FILTERING ===

/**
 * Reset all filters in the advanced search form
 */
function resetFilters() {
    $('#book-select').val(null).trigger('change.select2');
    $('#author-select').val(null).trigger('change.select2');
    $('#publisher-select').val(null).trigger('change.select2');
    $('input[name="publish_date_after"]').val('');
    $('input[name="publish_date_before"]').val('');
    // Reset accolades checkboxes
    $('input[name="accolades"]').prop('checked', false);
    $('#search-btn').click();
}

/**
 * Perform combined search with both simple and advanced search parameters
 */
function performCombinedSearch() {
    // Get simple search query
    const simpleQuery = $('#simple-search-form input[name="simple_search"]').val();
    
    // Get all advanced search form data
    const advancedFormData = $('#advanced-search-form').serializeArray();
    
    // Combine both searches
    let combinedData = new FormData();
    
    // Add simple search
    if (simpleQuery) {
        combinedData.append('simple_search', simpleQuery);
    }
    
    // Add all advanced search params
    advancedFormData.forEach(function(item) {
        if (item.value) {
            combinedData.append(item.name, item.value);
        }
    });
    
    // Convert FormData to URLSearchParams for the AJAX request
    const searchParams = new URLSearchParams();
    for (const pair of combinedData.entries()) {
        searchParams.append(pair[0], pair[1]);
    }
    // Perform the AJAX request
    $.ajax({
        url: window.location.pathname,
        type: 'get',
        data: searchParams.toString(),
        headers: { "X-Requested-With": "XMLHttpRequest" },
        success: function(data) {
            // Update the search results
            $('#search-results').html(data);
            
            // Update URL with all parameters
            if (history.pushState) {
                const newUrl = window.location.protocol + "//" + window.location.host + 
                              window.location.pathname + '?' + searchParams.toString();
                window.history.pushState({path: newUrl}, '', newUrl);
                
                // NEW CODE: Update active filters section
                updateActiveFilters(searchParams);
                
                // Reinitialize components after AJAX update
                initializeAll(currentSortBy, currentSortDir);
                if (typeof updateAnalyticsAfterSearch === 'function') {
                    updateAnalyticsAfterSearch();
                }
            }
        },
        error: function() {
            alert("Error retrieving search results.");
        }
    });
}

/**
 * Update the active filters section based on URL parameters
 */
function updateActiveFilters(searchParams) {
    // Create a container for all filter tags
    let filterTags = [];
    
    // Simple search filter
    const simpleSearch = searchParams.get('simple_search');
    if (simpleSearch) {
        filterTags.push(`
            <li>
                <span class="label label-info">Search: ${simpleSearch} 
                    <a href="#" class="remove-filter" data-filter="simple_search">
                        <i class="glyphicon glyphicon-remove"></i>
                    </a>
                </span>
            </li>
        `);
    }
    
    // Book filter (we'll need to get the name from the select2 control)
    const bookId = searchParams.get('book');
    if (bookId) {
        const bookName = $('#book-select').select2('data')[0]?.text || 'Selected Book';
        filterTags.push(`
            <li>
                <span class="label label-info">Book: ${bookName} 
                    <a href="#" class="remove-filter" data-filter="book">
                        <i class="glyphicon glyphicon-remove"></i>
                    </a>
                </span>
            </li>
        `);
    }
    
    // Author filter
    const authorId = searchParams.get('author');
    if (authorId) {
        const authorName = $('#author-select').select2('data')[0]?.text || 'Selected Author';
        filterTags.push(`
            <li>
                <span class="label label-info">Author: ${authorName} 
                    <a href="#" class="remove-filter" data-filter="author">
                        <i class="glyphicon glyphicon-remove"></i>
                    </a>
                </span>
            </li>
        `);
    }
    
    // Publisher filter
    const publisherId = searchParams.get('publisher');
    if (publisherId) {
        const publisherName = $('#publisher-select').select2('data')[0]?.text || 'Selected Publisher';
        filterTags.push(`
            <li>
                <span class="label label-info">Publisher: ${publisherName} 
                    <a href="#" class="remove-filter" data-filter="publisher">
                        <i class="glyphicon glyphicon-remove"></i>
                    </a>
                </span>
            </li>
        `);
    }
    
    // Date range filters
    const publishDateAfter = searchParams.get('publish_date_after');
    if (publishDateAfter) {
        filterTags.push(`
            <li>
                <span class="label label-info">From: ${publishDateAfter} 
                    <a href="#" class="remove-filter" data-filter="publish_date_after">
                        <i class="glyphicon glyphicon-remove"></i>
                    </a>
                </span>
            </li>
        `);
    }
    
    const publishDateBefore = searchParams.get('publish_date_before');
    if (publishDateBefore) {
        filterTags.push(`
            <li>
                <span class="label label-info">To: ${publishDateBefore} 
                    <a href="#" class="remove-filter" data-filter="publish_date_before">
                        <i class="glyphicon glyphicon-remove"></i>
                    </a>
                </span>
            </li>
        `);
    }
    
    // Single accolade filter
    const accolade = searchParams.get('accolade');
    if (accolade) {
        filterTags.push(`
            <li>
                <span class="label label-info">Accolade: ${accolade} 
                    <a href="#" class="remove-filter" data-filter="accolade">
                        <i class="glyphicon glyphicon-remove"></i>
                    </a>
                </span>
            </li>
        `);
    }
    
    // Multiple accolades filter
    const accolades = searchParams.getAll('accolades');
    accolades.forEach(accolade => {
        filterTags.push(`
            <li>
                <span class="label label-info">Accolade: ${accolade} 
                    <a href="#" class="remove-filter" data-filter="accolades" data-value="${accolade}">
                        <i class="glyphicon glyphicon-remove"></i>
                    </a>
                </span>
            </li>
        `);
    });
    
    // Build the final HTML
    let filtersHtml = '';
    if (filterTags.length > 0) {
        filtersHtml = `
            <ul class="list-inline">
                ${filterTags.join('')}
            </ul>
            <button id="quick-reset-btn" class="btn btn-xs btn-danger">Clear All Filters</button>
        `;
    } else {
        filtersHtml = '<p>No active filters</p>';
    }
    
    // Update the active filters section
    $('#active-filters .col-md-12').html(filtersHtml);
}
/**
 * Search button event handler
 */
$(document).on('click', '#search-btn', function(e) {
    e.preventDefault();
    performCombinedSearch();
    $('#searchModal').modal('hide');
});

/**
 * Simple search form submission
 */
$(document).on('submit', '#simple-search-form', function(e) {
    e.preventDefault();
    // Trigger the same logic as the advanced search button so all UI elements update
    $('#search-btn').trigger('click');
});

/**
 * Reset button event handler
 */
$(document).on('click', '#reset-btn', function() {
    resetFilters();
});

/**
 * Reset all filters button
 */
$(document).on('click', '#reset-all-btn', function() {
    // Reset simple search
    $('#simple-search-form input[name="simple_search"]').val('');
    
    // Reset advanced search form
    $('#book-select').val(null).trigger('change.select2');
    $('#author-select').val(null).trigger('change.select2');
    $('#publisher-select').val(null).trigger('change.select2');
    $('input[name="publish_date_after"]').val('');
    $('input[name="publish_date_before"]').val('');
    $('input[name="accolades"]').prop('checked', false);
    $('#date_range_form select[name="accolade"]').val('');
    
    // Redirect to home without parameters
    window.location.href = window.location.pathname;
});

/**
 * Quick reset button
 */
$(document).on('click', '#quick-reset-btn', function() {
    window.location.href = window.location.pathname;
});

/**
 * Live search with debounce for simple search
 */
$(document).ready(function() {
    let searchTimeout;
    $('#simple-search-form input[name="simple_search"]').on('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(function() {
            performCombinedSearch();
        }, 500); // Wait 500ms after typing stops
    });
});

/**
 * Handle removing individual filters
 */
$(document).on('click', '.remove-filter', function(e) {
    e.preventDefault();
    
    // Get the current URL and parameters
    let searchParams = new URLSearchParams(window.location.search);
    const filter = $(this).data('filter');
    
    if (filter === 'accolades') {
        // For multiselect accolades, remove specific value
        const value = $(this).data('value');
        let accolades = searchParams.getAll('accolades');
        accolades = accolades.filter(item => item !== value);
        
        // Remove all accolades params first
        searchParams.delete('accolades');
        
        // Re-add the remaining accolades
        accolades.forEach(accolade => {
            searchParams.append('accolades', accolade);
        });
    } else {
        // For regular filters, just remove the parameter
        searchParams.delete(filter);
    }
    
    // Reset to page 1 when filtering
    searchParams.set('page', 1);
    
    // Navigate to the new URL
    window.location.href = window.location.pathname + '?' + searchParams.toString();
});

// === SORTING ===

/**
 * Column sorting functionality
 */
$(document).on('click', '.sortable', function() {
    const sortBy = $(this).data('sort');
    let sortDir = 'asc';
    
    // If already sorting by this column, toggle direction
    if (sortBy === currentSortBy && currentSortDir === 'asc') {
        sortDir = 'desc';
    }
    
    // Navigate to the new URL with updated sort parameters
    const currentUrl = new URL(window.location.href);
    const searchParams = currentUrl.searchParams;
    
    // Update or add the sort parameters
    searchParams.set('sort_by', sortBy);
    searchParams.set('sort_dir', sortDir);
    searchParams.set('page', 1); // Reset to page 1 when changing sort
    
    // Redirect to the new URL
    window.location.href = currentUrl.toString();
});

// === PAGINATION ===

/**
 * AJAX Pagination with event delegation
 */
$(document).on('click', '.pagination a', function(e) {
    e.preventDefault();
    const url = $(this).attr('href');
    
    $.ajax({
        url: url,
        type: 'get',
        headers: { "X-Requested-With": "XMLHttpRequest" },
        success: function(data) {
            $('#search-results').html(data);
            
            // Re-initialize after AJAX update
            initializeAll(currentSortBy, currentSortDir);
            if (typeof updateAnalyticsAfterSearch === 'function') {
                updateAnalyticsAfterSearch();
            }
            
            // Update URL without page reload
            if (history.pushState) {
                window.history.pushState({path: url}, '', url);
            }
        },
        error: function() {
            alert("Pagination error.");
        }
    });
});

// === UTILITIES ===

/**
 * Get CSRF token from cookies or from meta tag
 */
function getCsrfToken() {
    // Try to get from cookie first
    let csrftoken = getCookie('csrftoken');
    
    // If not found in cookie, try to get from meta tag
    if (!csrftoken) {
        const csrfInput = document.querySelector('[name=csrfmiddlewaretoken]');
        if (csrfInput) {
            csrftoken = csrfInput.value;
        }
    }
    
    return csrftoken;
}

/**
 * Get a cookie by name
 */
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Initialize everything when document is ready
$(document).ready(function() {
    initializeAll(window.initialSortBy || '', window.initialSortDir || 'asc');
    if (typeof initializeAnalytics === 'function') {
        initializeAnalytics();
    }
});