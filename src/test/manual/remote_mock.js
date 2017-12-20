var $j = jQuery.noConflict();

var mockedResponse = {
  "builds": {

      "18": 1524158868936,
      "17": 1524158868936,
      "16": 1524158868936,
      "15": 1524158868936,
      "14": 1524158868936,
      "13": 1524158868936,
      "12": 1524158868936,
      "11": 1524158868936,
      "10": 1524158868936,
      
      "9":  1519620003853,
      "8":  1519610003853,
      "3":  1519600003853,
      "2":  1509620117361,
      "1":  1509620017361,
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
