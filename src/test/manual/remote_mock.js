var $j = jQuery.noConflict();

var mockedResponse = {
  "builds": {
      "10": 1509558868936,
      "9":  1509620003853,
      "8":  1509620112771,
      "3":  1509620115317,
      "2":  1509620117361,
      "1":  1513678234919
  },
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
