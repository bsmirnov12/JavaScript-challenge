// JavaScript-challenge
// UT-TOR-DATA-PT-01-2020-U-C Week 14 Homework
// (c) Boris Smirnov

// jQuery in this case is much easier to use then D3
// Set footer background to match jumbotron's
var jumboNode = $('.jumbotron')
$('.page-footer').css('background', jumboNode.css('background-color'));


// Convert dates to ISO format, find date limits, set limits to date input control
function toIsoDate(d) {
    return  d.getUTCFullYear() +
        '-' + ((d.getUTCMonth() < 9 ?  '0' : '') + (d.getUTCMonth() + 1)) +
        '-' + ((d.getUTCDate() < 10 ?  '0' : '') + d.getUTCDate());
}

data.forEach( encounter => {
    var d = new Date(encounter.datetime);
    encounter.datetime = toIsoDate(d);
});

var minDate = new Date(data[0].datetime);
var maxDate = new Date(data[data.length - 1].datetime);

// Creates table
function createTable() {

    // Cannot take column names from data object
    var columnNames = [ 'Date', 'City', 'State', 'Country', 'Shape', 'Duration', 'Comments' ];

    // Where to build ...
    var tableSpace = d3.select('#table-space');

    // Building table structure
    tableSpace.append('table')
        .attr('class', 'table table-hover')
        .append('thead')
        .attr('class', 'text-warning')
        .append('tr')
        .selectAll('th')
        .data(columnNames)
        .join('th')
            .text(header => header)
            .attr('scope', 'col');

    tableSpace.select('table').append('tbody');
}

// Resets filter form and repopulates the table
function initPage() {

    // Initialize the filter
    d3.select('input[type="date"]')
        .attr('min', toIsoDate(minDate))
        .attr('max', toIsoDate(maxDate))
        .attr('value', toIsoDate(minDate));

    // Create the table
    var tableBody = d3.select('tbody');
    tableBody.selectAll('tr')
        .data(data)
        .join('tr')
        .selectAll('td')
        .data(encounter => Object.values(encounter))
        .join('td')
            .text(contents => contents);

}
// Handles reset events from the filter form
function resetFilter() {
    // Prevent the page from refreshing (why?)
    d3.event.preventDefault();
    console.log(`resetFilter(): ${d3.event.target.tagName} triggered this event`);
    initPage();
}

// Handles submit events from the filter form
function filterData() {

    // Prevent the page from refreshing (why?)
    d3.event.preventDefault();
    console.log(`filterData(): ${d3.event.target.tagName} triggered this event`);
    
    // Get input
    var filter_date = d3.select("#dateInput").property('value');
    console.log("Filter date: '" + filter_date + "'");

    try {
        // Validate input
        d = new Date(filter_date); // strangely, it doesn't throw exception on bogus data
        if (d == 'Invalid Date' || (d < minDate) || (d > maxDate))
            throw 'Invalid input';

        // In the worst case scenario, if I couldn't recognize invalid date, the table would be empty
        /// but this is easily fixed with one click on [Clear] button

        // Filter dataset
        filteredData = data.filter( encounter => encounter.datetime == toIsoDate(d) );

        // Rebuild table
        var tableBody = d3.select('tbody');
        tableBody.selectAll('tr')
            .data(filteredData)
            .join('tr')
            .selectAll('td')
            .data(encounter => Object.values(encounter))
            .join('td')
                .text(contents => contents);

    } catch (e) {

        console.log(`Exception: ${e}`);
        d3.select('div.modal-body>p').text(`Please enter date between ${toIsoDate(minDate)} and ${toIsoDate(maxDate)}`);
        $('#validationFailed').modal();
        initPage();
        
    }
}


// Initialize the page
createTable();
initPage();

// Set event handlers
d3.select('form').on('reset', resetFilter);
d3.select('button[type="reset"]').on('click', resetFilter);

d3.select('form').on('submit', filterData);
d3.select('button[type="submit"]').on('click', filterData);
