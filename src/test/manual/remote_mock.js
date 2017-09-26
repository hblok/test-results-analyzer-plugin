var $j = jQuery.noConflict();

var mockedResponse = {
  "builds": [6, 5, 4, 3, 2, 1],
  "results": {
    "children": {

      "com.example.package1": {
        "testResults": "FFFFFF",
        "children": {
          "class11": {
            "testResults": "FFFFFF",
            "children": {
              "test111": {"testResults": "PF/SPF"},
              "test112": {"testResults": "FFFFFF"},
            }
          },
          "class12": {
            "testResults": "PFPPPF",
            "children": {
              "test121": {"testResults": "PF/SPF"},
              "test122": {"testResults": "PPPPPP"},
            }
          },
        }
      },

      "com.example.package2": {
        "testResults": "PFPPPF",
        "children": {
          "class11": {
            "testResults": "PFPPPF",
            "children": {
              "test111": {"testResults": "PF/SPF"},
              "test112": {"testResults": "SSSSSS"},
            }
          },
        }
      }

    }
  }
};

var remoteAction = {
  "getTestResults": function (userConfig, callback) {
    console.log(callback);

    var t = {
      "responseObject": function() {
        return mockedResponse;
      }
    };

    callback(t);
  }
};
