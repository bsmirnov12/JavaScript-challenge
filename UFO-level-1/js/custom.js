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

    encounter.city = encounter.city.replace(' ', String.fromCharCode(0xA0)); // &nbsp;

    const entityMap = [
        { regex: /&#33/g,   subst: String.fromCharCode(33) },
        { regex: /&#39/g,   subst: String.fromCharCode(39) },
        { regex: /&#44/g,   subst: String.fromCharCode(44) },
        { regex: /&amp;/g,  subst: '&'},
        { regex: /&quot;/g, subst: '"'}
    ];
    
    let s = encounter.comments;
    entityMap.forEach(map => s = s.replace(map.regex, map.subst));
    encounter.comments = s;
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
    var dateControl = document.querySelector('input[type="date"]');
    dateControl.min =  toIsoDate(minDate);
    dateControl.max =  toIsoDate(maxDate);
    dateControl.value = toIsoDate(minDate);   

    // Create the table
    var tableBody = d3.select('tbody');
    tableBody.selectAll('tr')
        .data(data)
        .join('tr')
        .selectAll('td')
        .data(encounter => Object.values(encounter))
        .join('td') // change regular hyphen to non-breaking for the dates to remain in one line
            .text(contents => /^\d{4}-\d{2}-\d{2}$/.test(contents) ? contents.replace(/-/g, String.fromCharCode(0x2011)) : contents);

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

        // Rebuild table
        var filterValue = toIsoDate(d);
        var tableBody = d3.select('tbody');
        tableBody.selectAll('tr')
            .data(data.filter( encounter => encounter.datetime == filterValue ))
            .join('tr')
            .selectAll('td')
            .data(encounter => Object.values(encounter))
            .join('td') // change regular hyphen to non-breaking for the dates to remain in one line
                .text(contents => /^\d{4}-\d{2}-\d{2}$/.test(contents) ? contents.replace(/-/g, String.fromCharCode(0x2011)) : contents);

    } catch (e) {

        console.log(`Exception: ${e}`);
        $('div.modal-body>p').html(`Please enter date between ${toIsoDate(minDate)} and ${toIsoDate(maxDate)}`);
        $('#validationFailed').modal();
        // initPage(); - called when the modal box is closed 
        
    }
}

// Initialize the page
createTable();
initPage();

// Set event handlers
d3.select('form').on('reset', resetFilter);
d3.select('button[type="reset"]').on('click', resetFilter);

//d3.select('#dateInput').on('change', filterData) // too interactive, triggers invalid input too often
d3.select('#dateInput').on('submit', filterData)
d3.select('button[type="submit"]').on('click', filterData);

$('.modal').on('hidden.bs.modal', initPage); // It's Bootstrap specific and doesn't work with D3