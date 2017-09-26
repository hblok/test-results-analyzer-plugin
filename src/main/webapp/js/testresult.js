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

function reset() {
    $j(".test-history-table").html("");
}

function populateTemplate(){
    reset();
    
    $j("#table-loading").show();
    
    remoteAction.getTestResults(getUserConfig(),$j.proxy(function(t) {
        console.log(t.responseObject());
        createTable(t.responseObject());
        $j("#table-loading").hide();
    },this));
}

function createTable(data) {
	var buildIds = data["builds"];
	var results = data["results"];
	
	var table = $j(".test-history-table");
	
	createHeader(table, buildIds);

	var packs = Object.keys(results);
	for (var p in packs) {
		if(!packs.hasOwnProperty(p)) continue;
	
		var pname = packs[p];
		var pack = results[pname];
		
		createPackageRow(table, pname, pack);
	}
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

function createPackageRow(parentDom, packName, pack) {
	var rowDom = createRow(parentDom, "package", 0, packName);

	var classes = Object.keys(pack);
	for (var c in classes) {
		if(!classes.hasOwnProperty(c)) continue;
	
		var cname = classes[c];
		var klass = pack[cname];
		
		createClassRow(parentDom, cname, klass);
	}
}
	
function createClassRow(parentDom, className, klass) {
	var rowDom = createRow(parentDom, "class", 1, className);

	var tests = Object.keys(klass);
	for (var t in tests) {
		if(!tests.hasOwnProperty(t)) continue;
	
		var tname = tests[t];
		var results = klass[tname];
		
		createTestResults(parentDom, tname, results);
	}
}

var STATUSCSSMAP = {
	"P": "passed",
	"F": "failed",
	"S": "skipped",
	"/": "na"
};

function createTestResults(parentDom, testName, results) {
	var rowDom = createRow(parentDom, "test", 2, testName);

	for (var i = 0; i < results.length; i++) {
		var status = results[i];
		var cell = $j("<div>")
			.addClass("table-cell")
			.addClass("build-result")
			.addClass(STATUSCSSMAP[status])
			.text(status)
			.appendTo(rowDom);
	}
}

function createRow(parentDom, rowType, level, name) {
	var rowDom = $j("<div>")
		.addClass("table-row")
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
