var dateOptions = {
    1: { day: "numeric" },
    2: { day: "numeric", month: "numeric" },
    3: { day: "numeric", month: "numeric", year: "2-digit" },
    4: { day: "numeric", month: "numeric", year: "numeric" },
    5: { weekday: "short", day: "numeric", month: "numeric", year: "numeric" },
    6: { weekday: "short", day: "numeric", month: "short", year: "numeric" },
    7: { weekday: "short", day: "numeric", month: "long", year: "numeric" },
    8: { weekday: "short", day: "numeric", month: "long", year: "numeric" },
    9: { weekday: "short", day: "numeric", month: "long", year: "numeric" },
    10: { weekday: "long", day: "numeric", month: "long", year: "numeric" },
};
var keys = Object.keys(dateOptions);
var maxDateColSpan = parseInt(keys[keys.length - 1]);

function showLoading() {
    $j(".loading").show();
}

function hideLoading() {
    $j(".loading").hide();
    $j(".rendering").hide();
}

function showRendering() {
    $j(".rendering").show();
}

function hideRendering() {
    $j(".rendering").hide();
}

function reset() {
    $j(".test-history-table").html("");
}

function loadTestResults(){
    reset();
    showLoading();

    remoteAction.getTestResults(getUserConfig(),$j.proxy(function(t) {
        console.log(t.responseObject());
        createTable(t.responseObject());
        hideLoading();
    },this));
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

    postCreateTestResults();
}

var builds;
var results;
var sortedIds;
var storedResults = {};

function createTable(data) {
    builds = data["builds"];
    results = data["results"];
    storedResults = {};
    
    sortedIds = Object.keys(builds);
    sortedIds.sort(function (a, b) {  return b - a; });

    var table = $j(".test-history-table");

    createBuildDateHeader(table);
    createBuildIdHeader(table);
    createRows(table, results, 0, []);
}

function getLocalBuildDate(date, sameDayCount) {
    var count = Math.min(maxDateColSpan, sameDayCount);
    return date.toLocaleDateString("en-GB", dateOptions[count]);
}

function getLocalBuildTime(time) {
    var options = { hour: "2-digit", minute: "2-digit", weekday: "long", day: "numeric", month: "long", year: "numeric" };
    return time.toLocaleDateString("en-GB", options);
}

function createBuildDateHeader(parentDom) {
    var rowDom = createRow(parentDom, "heading", -1, "Build date", []);
    
    var dateGroups = [];
    
    for(var i = sortedIds.length - 1; i >= 0; i--) {
        var date = new Date(builds[sortedIds[i]]);
        var day = date.toLocaleDateString();
        
        var sameDayCount = 1;
        for(var j = i - 1; j >= 0; j--) {
            var nextDate = new Date(builds[sortedIds[j]]);
            var nextDay = nextDate.toLocaleDateString();
            
            if (day == nextDay) {
                dateGroups[i] = -sameDayCount;
                sameDayCount++;
                i--;
            } else {
                dateGroups[i] = getLocalBuildDate(date, sameDayCount);
                break;
            }
        }
        
        if (i == 0 && typeof dateGroups[i] === 'undefined') {
            dateGroups[0] = getLocalBuildDate(date, sameDayCount);
        }
    }
    
    for(var i = 0; i < sortedIds.length; i++) {
        var date = new Date(builds[sortedIds[i]]);
    
        var cell = $j("<div>")
            .addClass("table-cell")
            .appendTo(rowDom);
            
        if (dateGroups[i] == -1) {
            cell.addClass("date_hide_left");
        } else if (dateGroups[i] < -1) {
            cell.addClass("date_hide_both");
        } else {
            cell.text(dateGroups[i]);
            cell.addClass("date_show");
            cell.attr("title", getLocalBuildDate(date, maxDateColSpan));
        }
    }
}

function createBuildIdHeader(parentDom) {
    var rowDom = createRow(parentDom, "heading", -1, "Package | Class | Test  /  Build Id", []);

    for(var i = 0; i < sortedIds.length; i++) {
        var time = new Date(builds[sortedIds[i]]);
    
        var cell = $j("<div>")
            .addClass("table-cell")
            .text(sortedIds[i])
            .attr("title", getLocalBuildTime(time))
            .appendTo(rowDom);
    }
}

var LEVELNAME = ["package", "class", "test"];

function createRows(parentDom, results, level, path) {
    var children = results["children"];
    var names = Object.keys(children);
    var names_len = names.length;
    for (var i = 0; i < names_len; i++) {
        var name = names[i];
        path[level] = name;
        var subResults = children[name];

        var rowDom = createRow(parentDom, LEVELNAME[level], level, name, path.slice(0, level + 1));
        
        if ("testResults" in subResults) {
            var testResults = subResults["testResults"];
            var failed = testResults.indexOf("F") != -1;
            if (failed) {
                rowDom.addClass("failed-row");
            }
        }        
        
        if(level == 0) {
            createTestResults(rowDom, subResults["testResults"]);
        } else {
            storeResults(rowDom, subResults["testResults"]);
        }

        if (level < 2) {
            createRows(parentDom, subResults, level + 1, path);
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
        rowDom.addClass("sub-level-row");
        rowDom.attr("custom", "hide");
    } else {
        rowDom.attr("custom", "show");
    }

    parentDom.append(rowDom);
}

var STATUSCSSMAP = {
    "P": "thor-passed",
    "F": "thor-failed",
    "S": "thor-skipped",
    "/": "thor-na"
};

function createTestResults(parentDom, results) {
    var path = parentDom.attr("path");

    var failed = false;

    for (var i = 0; i < results.length; i++) {
        var buildId = sortedIds[i];
        var time = new Date(builds[sortedIds[i]]);
        var status = results[i];
        var cell = $j("<div>")
            .addClass("table-cell")
            .addClass("build-result")
            .addClass(STATUSCSSMAP[status])
            .appendTo(parentDom);

        if (status == "P" || status == "F") {
            var link = "../" + buildId + "/testReport/" + path;
            var title = "Build: " + buildId + "\n" +path + "\n" + getLocalBuildTime(time)
            var a = $j("<a>")
                .attr("href", link)
                .text(status)
                .attr("title", title)
                .appendTo(cell);
        } else {
            cell.text(status);
        }

        if (status == "F") {
            failed = true;
        }
    }

    parentDom.removeClass("stored-results");
}

function storeResults(parentDom, results) {
    var id = parentDom.attr("path");
    parentDom.addClass("stored-results")
    storedResults[id] = results;
}

function postCreateTestResults() {
    var emptyRows = $j(".stored-results").not(".row-hidden");
    var row_len = emptyRows.length;

    if (row_len > 0) {
        setTimeout(showRendering, 1);
    }

    for (var i=0; i < row_len; i++) {
        var parentDom = $j(emptyRows[i]);
        var id = parentDom.attr("path");
        
        setTimeout(
            function(parentDom, results, last) {
                createTestResults(parentDom, results);

                if (last) {
                    window.setTimeout(hideRendering, 10);
                }
            },
            10,
            parentDom, storedResults[id], i == row_len -1);
    }
}

function createRow(parentDom, rowType, level, name, path) {
    var rowDom = $j("<div>")
        .addClass("table-row")
        .addClass("table-row-" + rowType)
        .attr("level", level)
        .attr("path", path.join("/"));

    if (level < 2) {
        rowDom.addClass("super-level-row");
    }

    if (level > 0) {
        rowDom.addClass("row-hidden");
        rowDom.addClass("sub-level-row");
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

    postCreateTestResults();
}

var ALL_BUILDS = "ALL";

function onBuildSlide(src) {
    var val = parseInt(src.value);
    var max = parseInt(src.max);
    var builds = (val < max) ? Math.ceil(Math.pow(val, 2.6)) : ALL_BUILDS;

    $j("#nobuildsvalue")[0].innerText = builds;
}

function onBuildUpdate() {
    loadTestResults();
}

function expandAll() {
    $j(".super-level-row > div > .icon").removeClass("icon-plus-sign");
    $j(".super-level-row > div > .icon").addClass("icon-minus-sign");

    $j(".sub-level-row").removeClass("row-hidden");

    postCreateTestResults();
}

function expandFailed() {
    $j(".failed-row").removeClass("row-hidden");

    postCreateTestResults();
}

function collapseAll() {
    $j(".sub-level-row").addClass("row-hidden");

    $j(".super-level-row > div > .icon").removeClass("icon-minus-sign");
    $j(".super-level-row > div > .icon").addClass("icon-plus-sign");
}

function getUserConfig(){
    var nobuildsvalue = $j("#nobuildsvalue")[0];
    var noOfBuilds = 1;
    if (nobuildsvalue) {
        var divText = nobuildsvalue.innerText;
        noOfBuilds = (divText == ALL_BUILDS) ? -1 : parseInt(divText);
    }

    var userConfig = {};
    userConfig["buildCountRequested"] = noOfBuilds;

    return userConfig;
}
