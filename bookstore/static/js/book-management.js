function initializeAll(sortBy, sortDir) {
    // Set global sort values
    currentSortBy = sortBy;
    currentSortDir = sortDir;
    
    // Initialize select2 with sorting
    $('#author-select').select2({
        placeholder: 'Search authors...',
        ajax: {
            url: '/ajax/search-authors/',
            dataType: 'json',
            delay: 250,
            data: function(params) {
                return {
                    q: params.term,
                    page: params.page
                };
            },
            processResults: function(data, params) {
                params.page = params.page || 1;
                data.results.sort((a, b) => a.text.localeCompare(b.text));
                return {
                    results: data.results,
                    pagination: {
                        more: (params.page * 30) < data.total_count
                    }
                };
            },
            cache: true
        }
    });
    
    $('#publisher-select').select2({
        placeholder: 'Search publishers...',
        ajax: {
            url: '/ajax/search-publishers/',
            dataType: 'json',
            delay: 250,
            data: function(params) {
                return {
                    q: params.term,
                    page: params.page
                };
            },
            processResults: function(data, params) {
                params.page = params.page || 1;
                data.results.sort((a, b) => a.text.localeCompare(b.text));
                return {
                    results: data.results,
                    pagination: {
                        more: (params.page * 30) < data.total_count
                    }
                };
            },
            cache: true
        }
    });
}