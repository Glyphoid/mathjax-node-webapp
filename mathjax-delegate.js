var mjAPI = require("mathjax-node/lib/mj-single.js");

var MathJaxDelegate = function() {
    var self = this;

    // Start mathjax API
    mjAPI.start();

    // Input json follows the format, e.g.,
    // {
    //     "mathTex": "E = mc^2",
    //     "imageFormat": "png",  // Or "MathML"
    //     "imageWidth": 300,
    //     "imageDpi": 200,
    // }
    // Args:
    //   input: Input JSON object
    //   callback: Callback for MathJax typeset completion
    this.convert = function(input, callback) {
	// TODO: Sanity-check that callback is a function
	
	mjInput = {
	    math: input.mathTex,
	    format: "TeX"
	};

	if (input.imageFormat == "png") {
	    mjInput.png = true;
	    if (typeof input.imageWidth === "undefined") {
		mjInput.width = 400;
	    } else {
		mjInput.width = input.imageWidth;
	    }

	    if (typeof input.imageDpi === "undefined") {
		mjInput.dpi = 800;
	    } else {
		mjInput.dpi = input.imageDpi;
	    }
	} else if (input.imageFormat ="MathML") {
	    mjInput.mml = true;
	} else {
	    // TODO: Throw error?
	}

	mjAPI.typeset(mjInput, function(data) {
	    callback(data);
	});
    };

    this.sayHello = function() {
	console.log("Hello");
    };
};

module.exports = MathJaxDelegate;
