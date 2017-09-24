var tableContent = 
	'<div class="table-row" name = "{{addName text}}">' +

    ' <div class="name row-heading table-cell">' +
        '{{#if children}}' +
            '<span class="icon icon-plus-sign" title="Show Children"></span> ' +
        '{{/if}}' +
        '<span class="{{failureIconWhenNecessary buildResults}}" title="New Failure" ></span>' +
        '&nbsp;{{text}}</span>' +
    '</div>' +
    '{{#each this.buildResults}}' +
      '<div class="table-cell build-result {{applystatus status}}" ' +
		  'title="Build {{buildNumber}}">' +
		  '{{#hasStatus status}} <a href="{{url}}">{{applyvalue status totalTimeTaken}}</a> ' + 
		  '{{else}} {{applyvalue status totalTimeTaken}} ' +
		  '{{/hasStatus}} </div>' +
	  '{{/each}}' +
    '</div>' +
    
    '{{#each children}}' +
        '{{> tableBodyTemplate this}}' +
    '{{/each}}';

var tableBody = '<div class="heading">' +
    '<div class="table-cell">Package/Class/Testmethod</div>' +
    '{{#each builds}}' +
    '  <div class="table-cell" title="Build {{this}}">{{this}}</div>' +
    '{{/each}}' +
    '</div>' +
    
    '{{#each results}}' +
    '{{> tableBodyTemplate}}' +
    '{{/each}}';

function removeSpecialChars(name){
    var modName = "";
    //modName = name.split('.').join('_');
    modName = name.replace(/[^a-z\d/-]+/gi, "_");
    return modName;
}

Handlebars.registerPartial("tableBodyTemplate", tableContent);

Handlebars.registerHelper('JSON2string', function (object) {
    return JSON.stringify(object);
});

Handlebars.registerHelper('buildLinks', function (object) {
    return new Handlebars.SafeString($j.map(object.slice(0, 10), function( value, index ) {
       var url = Handlebars.escapeExpression(value.buildUrl),
           text = Handlebars.escapeExpression(value.buildNumber);
      return "<a href=" + url + ">" + text + "</a>";
    }).join(', '));
});


Handlebars.registerHelper('addName', function (name) {
    return removeSpecialChars(name);
});

Handlebars.registerHelper('applyvalue', function (status, totalTimeTaken) {
    if (displayValues == true){
        return isNaN(totalTimeTaken) ? '/' : totalTimeTaken.toFixed(3) ;
    } else {
    	return customStatuses[status];
    }
});

Handlebars.registerHelper('hasStatus', function (status, options) {
    if(status != "N/A") {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

Handlebars.registerHelper('applystatus', function (status) {
    var statusClass = "no_status";
    switch (status) {
        case "FAILED":
            statusClass = "failed";
            break;
        case "PASSED":
            statusClass = "passed";
            break;
        case "SKIPPED":
            statusClass = "skipped";
            break;
    }
    return statusClass;
});

Handlebars.registerHelper('failureIconWhenNecessary', function (buildResults) {
    if (buildResults.length < 2) {
        return '';
    }

    if (buildResults[0].status == "FAILED" &&
        buildResults[1].status == "PASSED") {
        return 'icon icon-exclamation-sign';
    } else {
        return '';
    }
});



var analyzerTemplate = Handlebars.compile(tableBody);
