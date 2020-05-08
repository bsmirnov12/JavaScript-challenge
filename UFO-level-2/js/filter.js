// JavaScript-challenge
// UT-TOR-DATA-PT-01-2020-U-C Week 14 Homework
// (c) Boris Smirnov

// Class for handling filters
// Class uses global variable 'data' (from data.js)

class SelectFilter {
    // Registry of filter objects
    static filterRegistry = [];

    // Construct a filter for given column
    // Input: column name (it is used as a suffix in <select> and <button> ids), corresponding field in data entries
    constructor(idSuffix, dataKey) {
        // register this instance
        SelectFilter.filterRegistry.push(this);

        this.selectId = '#select' + idSuffix; // id of select control
        this.selectNode = d3.select(this.selectId);
        this.clearId = '#cancel' + idSuffix; // id of filter clear button
        this.clearNode = d3.select(this.clearId);
        this.dataKey = dataKey; // key name in data entries
        this.options = ['']; // list of options in a select control. First option is empty signifying unselected filter.
        this.selectedOpt = ''; // index of selected option

        // populate options list
        data.forEach(encounter => {
            let item = encounter[dataKey];
            if (!this.options.includes(item))
                this.options.push(item);
        });
        this.options.sort();

        // create options list in DOM tree (D3 magic)
        this.selectNode.selectAll('option')
            .data(this.options)
            .join('option')
                .text(option => option)
                .attr('value', option => option);
        
        // Add event handlers 
        this.selectNode.on('change', this.onChange.bind(this));
        this.clearNode.on('click', this.onClear.bind(this));

    }

    // Filters single data item (an encounter). Suitable for using in Array.filter()
    applyFilter(encounter) {
        return this.selectedOpt ? encounter[this.dataKey] == this.selectedOpt : true;
    }

    // Given already filtered encounter, look at the appropriate value and, possibly, add it to the options list
    addOption(encounter) {
        var item = encounter[this.dataKey];
        if (!this.options.includes(item))
            this.options.push(item);
    }

    // Applies all filters to a data item (an encounter). Returns true if the item passes all the filters.
    // Suitable for invocation in Array.filter()
    // In adition, it passes filtered encounters to each filter, so they could build updated lists of options
    static filter(encounter, only_obj) {
        // Main loop - filtering
        // It proceeds to the end only if all filters let the encounter pass
        for (var i = 0; i < SelectFilter.filterRegistry.length; i++) {
            if (!SelectFilter.filterRegistry[i].applyFilter(encounter))
                break;
        };

        // Additional loop for encounters that passed the filters
        // They are used to update option lists, so, that they contain only values that are in the dataset
        if (i == SelectFilter.filterRegistry.length) { // encounter passed all the filters
            // now, this is special case
            if (only_obj === undefined) // populate options for all filters. Active filters will have only one (selected) option
                SelectFilter.filterRegistry.forEach(obj => obj.addOption(encounter));
            else // populate options for this one particular ACTIVE filter (it is temporary removed from filterRegistry)
                only_obj.addOption(encounter);
            return true;
        } else
            return false;
    }

    // Render table applying filters
    // Second task: update options lists for each filter
    static renderTableBody() {

        // Reset option lists of each filter
        SelectFilter.filterRegistry.forEach(obj => obj.options = ['']);

        // This is how table body is created. D3 does all the job
        // This is the main part
        var tableBody = d3.select('tbody');
        tableBody.selectAll('tr')
            .data(data.filter(encounter => SelectFilter.filter(encounter)))
            .join('tr')
            .selectAll('td')
            .data(encounter => Object.values(encounter))
            .join('td') // change regular hyphen to non-breaking for the dates to remain in one line
                .text(value => /^\d{4}-\d{2}-\d{2}$/.test(value) ? value.replace(/-/g, '‑') : value);


        // This is the secondary part: update options in filters based of the new (filtered) dataset

        // First: update option lists for unset filters
        // (their options were already populated via SelectFilter.filter() calls above)
        SelectFilter.filterRegistry.forEach(obj => {
            // Populating active filters requires different approach (see below)
            if (!obj.selectedOpt) { // the filter is unset
                // sort options
                obj.options.sort();
                // populate 'option' elements
                obj.selectNode.selectAll('option')
                    .data(obj.options)
                    .join('option')
                        .text(option => option)
                        .attr('value', option => option);
                // The filter is unset, so... 0
                obj.selectNode.property('selectedIndex', 0);
            }
        });

        // Second: update option lists for set filters (now they have only one option in the list - selected)
        // For each set filter we have to recreate a dataset WITHOUT that filter,
        // and then make a list of possible options for this particular field
        var activeFilters = [];
        SelectFilter.filterRegistry.forEach(obj => obj.selectedOpt ? activeFilters.push(obj) : null);

        activeFilters.forEach(obj => {
            // temporary remove the filter from the registry
            var idx = SelectFilter.filterRegistry.indexOf(obj);
            SelectFilter.filterRegistry.splice(idx, 1);

            // Now apply remaining filters to the dataset, but only for the purpose of populating options of the removed filter
            // calling SelectFilter.filter() with obj as the second argument- special case, obj will be populated
            data.forEach(encounter => SelectFilter.filter(encounter, obj));

            // At this point the filter options should be repopulated and needed to be transferred to the 'option' elements
            // sorting
            obj.options.sort();
            // populating 'option' elements
            obj.selectNode.selectAll('option')
                .data(obj.options)
                .join('option')
                    .text(option => option)
                    .attr('value', option => option);
            // Restoring selected option
            obj.selectNode.property('selectedIndex', obj.options.indexOf(obj.selectedOpt));

            // Put the filter back to the registry
            SelectFilter.filterRegistry.splice(idx, 0, obj);

        });
    }

    // Handle 'change' event of <select> element containig filter options
    onChange(_data, _index, _nodes) {
        // Prevent the page from refreshing (why?)
        d3.event.preventDefault();

        // Read selected option for filtration
        let element = _nodes[_index];
        let selected = element.selectedOptions[0];
        this.selectedOpt = selected.value;
        console.log(`${this.selectId}.onChange() triggered: "${this.selectedOpt}"`);

        // Render filtered data and update option lists
        SelectFilter.renderTableBody();

        // Change cancel button state
        if (this.selectedOpt)
            this.clearNode.attr('disabled', null); // Turn on [X] button
        else
            this.clearNode.attr('disabled', ''); // Turn off [X] button
    }

    // Handle click on the clear button
    onClear(_data, _index, _nodes) {
        // Prevent the page from refreshing (why?)
        d3.event.preventDefault();
        console.log(`${this.selectId}.onClear() triggered`);

        // Reset select element
        this.selectNode.property('selectedIndex', 0);
        this.selectedOpt = '';

        // Render filtered data
        SelectFilter.renderTableBody();

        // Disable clear button
        this.clearNode.attr('disabled', '');
    }
}

// Create filters
var dateFilter = new SelectFilter('Date', 'datetime');
var dateCity = new SelectFilter('City', 'city');
var dateState = new SelectFilter('State', 'state');
var dateCountry = new SelectFilter('Country', 'country');
var dateShape = new SelectFilter('Shape', 'shape');

// Render the table for the first time with all filters cleared
SelectFilter.renderTableBody();

