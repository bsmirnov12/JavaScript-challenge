// JavaScript-challenge
// UT-TOR-DATA-PT-01-2020-U-C Week 14 Homework
// (c) Boris Smirnov

// jQuery in this case is much easier to use then D3
// Set footer background to match jumbotron's
var jumboNode = $('.jumbotron')
$('.page-footer').css('background', jumboNode.css('background-color'));

// Convert dates to ISO format, find date limits, set limits to date input control
// NOTE: this is modified version, it uses non-breaking hyphen instead of regular dash to keep dates in one line.
// This is non-breaking hyphen: '‑'. This is regular hyphen: '-'. Do not confuse.
function toIsoishDate(d) {
    return  d.getUTCFullYear() +
        '‑' + ((d.getUTCMonth() < 9 ?  '0' : '') + (d.getUTCMonth() + 1)) +
        '‑' + ((d.getUTCDate() < 10 ?  '0' : '') + d.getUTCDate());
}

data.forEach( encounter => {
    var d = new Date(encounter.datetime);
    encounter.datetime = toIsoishDate(d);
});

// Used for creating filter forms, table, filters...
var metaData = [
    { column: 'Date',      key: 'datetime',        filtered: true },
    { column: 'City',      key: 'city',            filtered: true },
    { column: 'State',     key: 'state',           filtered: true },
    { column: 'Country',   key: 'country',         filtered: true },
    { column: 'Shape',     key: 'shape',           filtered: true },
    { column: 'Duration',  key: 'durationMinutes', filtered: false },
    { column: 'Comments',  key: 'comments',        filtered: false}
];

// Create Search form
function createForm() {

    metaData.forEach(field => {
        if (!field.filtered)
            return; 
        
        const template = `
                    <div class="form-group col">
                        <label for="select${field.column}">${field.column}</label>
                        <div class="input-group">
                            <div class="input-group-prepend">
                                <button class="btn btn-outline-warning" type="button" id="cancel${field.column}" disabled>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <select id="select${field.column}" class="form-control">
                            </select>
                        </div>
                    </div>
        `
        $( '.form-row' ).append( $.parseHTML(template) );
    });

}

// Creates the table
function createTable() {

    // Where to build ...
    var tableSpace = d3.select('#table-space');

    // Building table structure
    tableSpace.append('table')
        .attr('class', 'table table-hover')
        .append('thead')
        .attr('class', 'text-warning')
        .append('tr')
        .selectAll('th')
        .data(metaData)
        .join('th')
            .text(meta => meta.column)
            .attr('scope', 'col');

    tableSpace.select('table').append('tbody');
}

createForm();
createTable();

// The rest is handled in filter.js