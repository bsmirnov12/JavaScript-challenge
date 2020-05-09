// JavaScript-challenge
// UT-TOR-DATA-PT-01-2020-U-C Week 14 Homework
// (c) Boris Smirnov

// Set footer background to match jumbotron's
// jQuery in this case is much easier to use then D3
var jumboNode = $('.jumbotron')
$('.page-footer').css('background', jumboNode.css('background-color'));

// Cleaning data: convert dates to ISO format, replace entities in comments to real characters
// NOTE: this is modified version, it uses non-breaking hyphen instead of regular dash to keep dates in one line.
// This is non-breaking hyphen: '‑' (U+02011). This is regular hyphen: '-'. Do not confuse.
function toISOishDate(d) {
    return  d.getUTCFullYear() +
        String.fromCharCode(0x2011) + ((d.getUTCMonth() < 9 ?  '0' : '') + (d.getUTCMonth() + 1)) +
        String.fromCharCode(0x2011) + ((d.getUTCDate() < 10 ?  '0' : '') + d.getUTCDate());
}

data.forEach(encounter => {
    var d = new Date(encounter.datetime);
    encounter.datetime = toISOishDate(d);

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
// jQuery in this case is much easier to use then D3
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
        $('.form-row').append( $.parseHTML(template) );
    });
}

// Create the table
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