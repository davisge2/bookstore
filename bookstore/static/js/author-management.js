function setupAdvancedSelect2() {
    if (!$('#author-book-select').hasClass('select2-hidden-accessible')) {
        $('#author-book-select').select2({
            placeholder: 'Search books...',
            ajax: {
                url: '/ajax/search-books/',
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
}