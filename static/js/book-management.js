function sortOptionsAlphabetically(options) {
    return options.sort((a, b) => a.text.localeCompare(b.text));
}

$(document).on('click', '#reset-all-btn', function() {
    // Reset simple search
    $('#simple-search-form input[name="simple_search"]').val('');
    
    // Reset advanced search form
    $('#book-select').val(null).trigger('change.select2');
    $('#author-select').val(null).trigger('change.select2');
    $('#publisher-select').val(null).trigger('change.select2');
    $('input[name="publish_date_after"]').val('');
    $('input[name="publish_date_before"]').val('');
    $('input[name="accolad
});

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
            data.results = sortOptionsAlphabetically(data.results);
            return { results: data.results };
        }
    }
});