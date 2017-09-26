function populateTemplate(){
    reset();

    $j("#table-loading").show();

    remoteAction.getTestResults(getUserConfig(),$j.proxy(function(t) {
        console.log(t.responseObject());
        createTable(t.responseObject());
        $j("#table-loading").hide();
    },this));
}

function reset() {
    $j(".test-history-table").html("");
}

function searchTests(){
    var rows = $j(".test-history-table .table-row");
    var filter = $j("#filter").val().toLowerCase();

    if (filter == "") {
        clearedFilter(rows);
    } else {
        applyFilter(rows, filter);
    }
}

function clearedFilter(rows) {
	rows.filter("[custom='show']").removeClass("row-hidden");
	rows.filter("[custom='hide']").addClass("row-hidden");
}

function applyFilter(rows, filter) {
    $j(rows).each(function(index, row) {
        var dom = $j(row);
        var name = dom.find(".name")[0];
        var nameDom = $j(name);
		if (nameDom.hasClass("name-heading")) {
			return;
		}

        var matchName = nameDom.text().toLowerCase();
        if (matchName.indexOf(filter) == -1) {
            dom.addClass("row-hidden");
        }
        else {
            dom.removeClass("row-hidden");
        }
    });
}

function createTable(data) {
	var buildIds = data["builds"];
	var results = data["results"];
	
	var table = $j(".test-history-table");
	
	createHeader(table, buildIds);
	createRows(table, results, 0);
}

function createHeader(parentDom, buildIds) {
	var rowDom = createRow(parentDom, "heading", -1, "Package / Class / Test");
	
	for(var i = 0; i < buildIds.length; i++) {
		var cell = $j("<div>")
			.addClass("table-cell")
			.text(buildIds[i])
			.appendTo(rowDom);
	}		
}

var LEVELNAME = ["package", "class", "test"];

function createRows(parentDom, results, level) {
	var children = results["children"];
	var names = Object.keys(children);
	for (var i = 0; i < names.length; i++) {
		var name = names[i];
		var subResults = children[name];
		
		var rowDom = createRow(parentDom, LEVELNAME[level], level, name);
		//createSpacingRow(parentDom, LEVELNAME[level], level);
		createTestResults(rowDom, subResults["testResults"]);
		if (level < 2) {
			createRows(parentDom, subResults, level + 1);
		}
		createSpacingRow(parentDom, LEVELNAME[level], level);
	}
}

function createSpacingRow(parentDom, rowType, level) {
	var rowDom = $j("<div>")
	.addClass("table-row")
	.addClass("row-spacing-" + rowType)
	.attr("level", level);

	if (level > 0) {
		rowDom.addClass("row-hidden");
		rowDom.attr("custom", "hide");
	} else {
		rowDom.attr("custom", "show");
	}

	parentDom.append(rowDom);
}

var STATUSCSSMAP = {
	"P": "passed",
	"F": "failed",
	"S": "skipped",
	"/": "na"
};

function createTestResults(parentDom, results) {
	for (var i = 0; i < results.length; i++) {
		var status = results[i];
		var cell = $j("<div>")
			.addClass("table-cell")
			.addClass("build-result")
			.addClass(STATUSCSSMAP[status])
			.text(status)
			.appendTo(parentDom);
	}
}

function createRow(parentDom, rowType, level, name) {
	var rowDom = $j("<div>")
		.addClass("table-row")
		.addClass("table-row-" + rowType)
		.attr("level", level);

	if (level > 0) {
		rowDom.addClass("row-hidden");
		rowDom.attr("custom", "hide");
	} else {
		rowDom.attr("custom", "show");
	}
	
	var nameDom = $j("<div>")
		.addClass("name")
		.addClass("name-" + rowType)
		.text(name)
		.appendTo(rowDom);
		
	if (rowType == "package" || rowType == "class" ) {
		var expand = $j("<div>")
			.addClass("icon")
			.addClass("icon-plus-sign")
			.prependTo(nameDom)
			.click(rowDom, handleExpand);
	}
		
	parentDom.append(rowDom);
	
	return rowDom;
}

function handleExpand(src) {
	var row = $j(src.data);
	var icon = row.find(".icon");
	var expand = icon.hasClass("icon-plus-sign");
	var level = parseInt(row.attr("level"));

	icon.removeClass(expand ? "icon-plus-sign" : "icon-minus-sign");
	icon.addClass(expand ? "icon-minus-sign" : "icon-plus-sign");

	var next = row.next();
	var nextLevel = parseInt(next.attr("level"));
	while (next.length > 0 && nextLevel > level) {
		if (nextLevel == level + 1 && expand) {
			next.removeClass("row-hidden");
			next.attr("custom", "show");
		} else if (nextLevel > level && !expand) {
			next.addClass("row-hidden");
			next.attr("custom", "hide");
			var icons = next.find(".icon");
			icons.removeClass("icon-minus-sign");
			icons.addClass("icon-plus-sign");
		}
		next = next.next();
		nextLevel = parseInt(next.attr("level"));
	}
}

function getUserConfig(){
    var userConfig = {};

    var noOfBuilds = "-1";

    if (!$j("#allnoofbuilds").is(":checked")) {
        noOfBuilds = $j("#noofbuilds").val();
    }
    userConfig["noOfBuildsNeeded"] = noOfBuilds;

    return userConfig;
}
