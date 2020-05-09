// JavaScript-challenge
// UT-TOR-DATA-PT-01-2020-U-C Week 14 Homework
// (c) Boris Smirnov

// This script uses global variables 'data' (from data.js) and 'metaData' (from custom.js)

// Class implements filtering
// Its static members keep registry of filters and apply all filters to data after a filter changes its state
// Each filter instance is responsible for one table column, handles change/clear events, provides choice options.
class SelectFilter {
    // Registry of filter objects
    static filterRegistry = [];

    // Construct a filter for a given column
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
        this.selectedOpt = ''; // selected option - empty, clear filter

        // Add event handlers 
        this.selectNode.on('change', this.onChange.bind(this));
        this.clearNode.on('click', this.onClear.bind(this));
    }

    // Filters single data item (an encounter). Suitable for using in Array.filter()
    applyFilter(encounter) {
        return this.selectedOpt ? encounter[this.dataKey] == this.selectedOpt : true;
    }

    // Given already filtered encounter, look at its value and, possibly, add it to the options list
    addOption(encounter) {
        var item = encounter[this.dataKey];
        if (!this.options.includes(item))
            this.options.push(item);
    }

    // Create/recreate <option> elements
    makeOptions() {
        // sort
        this.options.sort();
        // populate 'option' elements
        this.selectNode.selectAll('option')
            .data(this.options)
            .join('option')
                .text(option => option)
                .attr('value', option => option);
        // Restoring selected option in <select> element (assume this.selectedOpt is set correctly)
        this.selectNode.property('selectedIndex', this.options.indexOf(this.selectedOpt));
    }

    // Applies all filters to a data item (an encounter). Returns true if the item passes all the filters.
    // Suitable for invocation in Array.filter()
    // In adition, it passes filtered encounters to each filter, so it could update its lists of options
    static filter(encounter, only_obj) {
        // Main loop - filtering
        // It proceeds to the end only if all filters let the encounter pass
        for (var i = 0; i < SelectFilter.filterRegistry.length; i++) {
            if (!SelectFilter.filterRegistry[i].applyFilter(encounter))
                break;
        };

        // Additional loop for encounters that passed the filters
        // They are used to update option lists, so that they contain only values that are in the dataset
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
    // Second task: update options list for each filter
    static renderTableBody() {

        // Reset options list of each filter
        SelectFilter.filterRegistry.forEach(obj => obj.options = ['']);

        // This is how table body is created. D3 does its magic.
        var tableBody = d3.select('tbody');
        tableBody.selectAll('tr')
            .data(data.filter(encounter => SelectFilter.filter(encounter)))
            .join('tr')
            .selectAll('td')
            .data(encounter => Object.values(encounter))
            .join('td')
                .text(value => value);

        // Based on filtered data update option lists for UNSET filters
        // (their options were already populated via SelectFilter.filter() calls above)
        SelectFilter.filterRegistry.forEach(obj => obj.selectedOpt ? null : obj.makeOptions());

        // Update option lists for ACTIVE filters (at this moment they have only one option in the list - the one selected)
        // For each active filter we have to recreate a dataset WITHOUT that filter
        var activeFilters = [];
        SelectFilter.filterRegistry.forEach(obj => obj.selectedOpt ? activeFilters.push(obj) : null);

        activeFilters.forEach(obj => {
            // temporary remove the filter from the registry
            let idx = SelectFilter.filterRegistry.indexOf(obj);
            SelectFilter.filterRegistry.splice(idx, 1);

            // Now apply remaining filters to the dataset, but only for the purpose of populating options of the removed filter
            // calling SelectFilter.filter() with obj as the second argument - only that obj options will be populated
            data.forEach(encounter => SelectFilter.filter(encounter, obj));

            // At this point the filter options should be repopulated and have to be transferred to the 'option' elements
            obj.makeOptions();

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

        // Render filtered data and update filter options lists
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
        this.selectedOpt = '';
        this.selectNode.property('selectedIndex', 0);

        // Render filtered data and update filter options lists
        SelectFilter.renderTableBody();

        // Disable clear button
        this.clearNode.attr('disabled', '');
    }
}

// Create filters
metaData.forEach(field => {
    if (field.filtered)
        new SelectFilter(field.column, field.key);
});

// Render the table for the first time with all filters cleared
SelectFilter.renderTableBody();
