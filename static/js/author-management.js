function sortOptionsAlphabetically(options) {
    return options.sort((a, b) => a.text.localeCompare(b.text));
}

function setupAdvancedSelect2() {
    if (!$('#author-book-select').hasClass('select2-hidden-accessible')) {
        $('#author-book-select').select2({
            placeholder: 'Search books...',
            ajax: {
                url: '/ajax/search-books/',
                dataType: 'json',
                delay: 250,
                data: function(params) {
                    let data = { q: params.term };
                    return data;
                },
                processResults: function(data) {
                    data.results = sortOptionsAlphabetically(data.results);
                    return { results: data.results };
                }
            }
        });
    }
}