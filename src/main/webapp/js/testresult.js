var colTemplate = "{'cellClass':'col1','value':'build20','header':'20','title':'20'}";
var reevaluateChartData = true;
var displayValues = false;

function clearedFilter(rows) {
    var levelsToShow = [0]; // stack to keep track of hierarchy

    // Ensure that every node is expanded, that was expanded before or by the user when filtering.
    $j(rows).each(function(index, row) {
        var rowLevel = parseInt($j(row).attr("hierarchyLevel"));

        // Remove all generations that happen after the current one, since these are not relevant anymore,
        // when we are at a (great*)uncle.
        while (levelsToShow[levelsToShow.length - 1] > rowLevel) {
            levelsToShow.pop();
        }

        if ($j(row).find(".icon-minus-sign").length > 0) {
            // also show children of this node
            levelsToShow.push(rowLevel + 1);
            $j(row).show();
        } else if (levelsToShow[levelsToShow.length - 1] == rowLevel) {
            $j(row).show();
        } else {
            $j(row).hide();
        }
    });
}

function applyFilter(rows, filter) {
    $j(rows).each(function(index, row) {
        var testCell = $j(row).find(".row-heading")[0];
        var rowText = $j(testCell).text().toLowerCase();
        if (rowText.indexOf(filter) == -1) {
            $j(row).hide();
        }
        else {
            $j(row).show();
        }
    });
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

function reset(){
    reevaluateChartData = true;
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
	var rowDom = createRow(parentDom, "heading", "Package / Class / Test");
	
	for(var i = 0; i < buildIds.length; i++) {
		var cell = $j("<div>")
			.addClass("table-cell")
			.text(buildIds[i])
			.appendTo(rowDom);
	}		
}

function createPackageRow(parentDom, packName, pack) {
	var rowDom = createRow(parentDom, "package", packName);

	var classes = Object.keys(pack);
	for (var c in classes) {
		if(!classes.hasOwnProperty(c)) continue;
	
		var cname = classes[c];
		var klass = pack[cname];
		
		createClassRow(parentDom, cname, klass);
	}
}
	
function createClassRow(parentDom, className, klass) {
	var rowDom = createRow(parentDom, "class", className);

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
	var rowDom = createRow(parentDom, "test", testName);

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

function createRow(parentDom, rowType, name) {
	var rowDom = $j("<div>")
		.addClass("table-row")
		.addClass(rowType);
	
	var nameDom = $j("<div>")
		.addClass("name")
		.addClass("name-" + rowType)
		.text(name)
		.appendTo(rowDom);
		
	if (rowType == "package" || rowType == "class" ) {
		$j("<div>")
			.addClass("icon")
			.addClass(".icon-plus-sign")
			.prependTo(nameDom);
	}
		
	parentDom.append(rowDom);
	
	return rowDom;
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

function resetAdvancedOptions(){
    $j("#show-build-durations").prop('checked', false);
}
