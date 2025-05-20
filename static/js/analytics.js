let distributionChart;
let authorsChart;
let publishersChart;

function initializeAnalytics() {
    $.get(window.analyticsUrl + window.location.search, data => {
        initializeAnalyticsVisualizations(data);
    });
}

function updateAnalyticsAfterSearch() {
    $.get(window.analyticsUrl + window.location.search, data => {
        updateAnalyticsVisualizations(data);
    });
}

function initializeAnalyticsVisualizations(data) {
    updateKpis(data);
    initDistributionChart(data);
    initAuthorsChart(data);
    initPublishersChart(data);
}

function updateAnalyticsVisualizations(data) {
    updateKpis(data);
    updateDistributionChart(data);
    updateAuthorsChart(data);
    updatePublishersChart(data);
}

function updateKpis(data) {
    document.getElementById('filter-total-books').textContent = data.totalBooks;
    document.getElementById('filter-top5').textContent = data.totalTop5;
    document.getElementById('filter-top10').textContent = data.totalTop10;
    const rate = data.totalBooks > 0 ? ((data.totalTop10 / data.totalBooks) * 100).toFixed(1) : '0.0';
    document.getElementById('filter-bestseller-rate').textContent = rate + '%';
}

function initDistributionChart(data) {
    const ctx = document.getElementById('distributionChart').getContext('2d');
    const top5 = data.totalTop5 || 0;
    const top10 = (data.totalTop10 || 0) - top5;
    const other = (data.totalBooks || 0) - top5 - top10;
    distributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Top 5', 'Top 10', 'Other'],
            datasets: [{
                data: [top5, top10, other],
                backgroundColor: ['#6772e5', '#45d0a1', '#e2e2e2']
            }]
        },
        options: {responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}}}
    });
}

function updateDistributionChart(data) {
    const top5 = data.totalTop5 || 0;
    const top10 = (data.totalTop10 || 0) - top5;
    const other = (data.totalBooks || 0) - top5 - top10;
    distributionChart.data.datasets[0].data = [top5, top10, other];
    distributionChart.update();
}

function initAuthorsChart(data) {
    const ctx = document.getElementById('authorsChart').getContext('2d');
    const labels = data.topAuthorsTop5.map(a => a.name);
    const values = data.topAuthorsTop5.map(a => a.count);
    authorsChart = new Chart(ctx, {
        type: 'bar',
        data: {labels: labels, datasets:[{label:'Number of Books',data:values,backgroundColor:'#6772e5',borderRadius:4}]},
        options: {responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{precision:0}},x:{ticks:{display:false}}}}
    });
}

function updateAuthorsChart(data) {
    const labels = data.topAuthorsTop5.map(a => a.name);
    const values = data.topAuthorsTop5.map(a => a.count);
    authorsChart.data.labels = labels;
    authorsChart.data.datasets[0].data = values;
    authorsChart.update();
}

function initPublishersChart(data) {
    const ctx = document.getElementById('publishersChart').getContext('2d');
    const labels = data.topPublishersTop5.map(p => p.name);
    const values = data.topPublishersTop5.map(p => p.count);
    publishersChart = new Chart(ctx, {
        type: 'bar',
        data: {labels: labels, datasets:[{label:'Number of Books',data:values,backgroundColor:'#45d0a1',borderRadius:4}]},
        options: {responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{precision:0}},x:{ticks:{display:false}}}}
    });
}

function updatePublishersChart(data) {
    const labels = data.topPublishersTop5.map(p => p.name);
    const values = data.topPublishersTop5.map(p => p.count);
    publishersChart.data.labels = labels;
    publishersChart.data.datasets[0].data = values;
    publishersChart.update();
}
