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

// Creates the table
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

createTable();

// The rest is handled in filter.js