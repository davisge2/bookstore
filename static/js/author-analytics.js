function initializeAuthorAnalytics() {
    $.get(window.authorAnalyticsUrl + window.location.search, data => {
        updateAuthorAnalytics(data);
    });
}

function updateAuthorAnalyticsAfterSearch() {
    $.get(window.authorAnalyticsUrl + window.location.search, data => {
        updateAuthorAnalytics(data);
    });
}

function updateAuthorAnalytics(data) {
    $('#total-authors').text(data.totalAuthors);
    $('#authors-with-top5').text(data.authorsWithTop5);
    $('#authors-with-top10').text(data.authorsWithTop10);

    let listHtml = data.topAuthorsTop5.map(a => `<li><span class="name">${a.name}</span><span class="count">${a.count}</span></li>`).join('');
    if (!listHtml) listHtml = '<li>No data</li>';
    $('#top-authors-top5-list').html(listHtml);

    listHtml = data.topAuthorsTop10.map(a => `<li><span class="name">${a.name}</span><span class="count">${a.count}</span></li>`).join('');
    if (!listHtml) listHtml = '<li>No data</li>';
    $('#top-authors-top10-list').html(listHtml);
}

$(document).ready(function() {
    if (typeof window.authorAnalyticsUrl !== 'undefined') {
        initializeAuthorAnalytics();
    }
});
