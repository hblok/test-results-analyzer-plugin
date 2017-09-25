var $j = jQuery.noConflict();

var mockedResponse = {
  "builds": [6, 5, 4, 3, 2, 1],
  "results": {
    
    "com.example.package1": {
      "class11": {
        "test111": "PF/SPF",
        "test112": "FFFFFF"
      },
      "class12": {
        "test121": "PF/SPF",
        "test122": "PPPPPP"
      }
    },

    "com.example.package2": {
      "class21": {
        "test211": "PF/SPF",
        "test212": "SSSSSS"
      },
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
