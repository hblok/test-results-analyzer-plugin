var tableContent = '<div class="table-row" name = "{{addName text}}" ' +
                         '{{#if hierarchyLevel}}' +
                            'hierarchyLevel="{{hierarchyLevel}}" style="display:none"' +
                         '{{else}}' +
                            'hierarchyLevel="0"' +
                         '{{/if}}' +
                   '>' +

    ' <div class="name row-heading table-cell" ' +
        '{{#if hierarchyLevel}}' +
            'style="padding-left:{{addspaces hierarchyLevel}}em;"' +
        '{{/if}}' +
    '>' +
        '{{#if children}}' +
            '<span class="icon icon-plus-sign" title="Show Children"></span> ' +
        '{{/if}}' +
        '<span class="{{failureIconWhenNecessary buildResults}}" title="New Failure" ></span>' +
        '&nbsp;{{text}}</span>' +
    '</div>' +
    '{{#each this.buildResults}}' +
    '         <div class="table-cell build-result {{applystatus status}}" data-result=\'{{JSON2string this}}\' ' +
                          'title="Build {{buildNumber}}">' +
                          '{{#hasStatus status}} <a href="{{url}}">{{applyvalue status totalTimeTaken}}</a> ' + 
                          '{{else}} {{applyvalue status totalTimeTaken}} ' +
                          '{{/hasStatus}} </div>' +
      '{{/each}}' +
    '</div>' +
    '{{#each children}}' +
        '{{addHierarchy this ../hierarchyLevel}}' +
        '{{> tableBodyTemplate this}}' +
    '{{/each}}';

var tableBody = '<div class="heading">' +
    '<div class="table-cell">Package/Class/Testmethod</div>' +
    '{{#each builds}}' +
    '\n' + '         <div class="table-cell" title="Build {{this}}">{{this}}</div>' +
    '{{/each}}' +
    '\n' + '      </div>' +
    '{{#each results}}' +
    '{{> tableBodyTemplate}}' +
    '\n' + '{{/each}}';

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

Handlebars.registerHelper('addspaces', function (hierarchyLevel) {
    var spaces = 1.5;

    spaces = spaces * hierarchyLevel;
    return new Handlebars.SafeString(spaces);
});

Handlebars.registerHelper('addIndent', function (hierarchyLevel) {
    var parent = "|"
    var ident = "-";
    for(var i =0;i<hierarchyLevel;i++){
        ident = ident + ident;
    }

    return new Handlebars.SafeString(parent+ident);
});

Handlebars.registerHelper('addHierarchy', function (context, parentHierarchy, options) {
    if (parentHierarchy == undefined)
        parentHierarchy = 0;
    context["hierarchyLevel"] = parentHierarchy + 1;
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
