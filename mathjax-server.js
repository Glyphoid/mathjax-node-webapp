var http = require("http")
var MathJaxDelegate = require("./mathjax-delegate.js")

var servingPath = "/math-jax/math-jax";
var servingContentType = "application/json";

var respErrorsKey = "errors";

mjDelegate = new MathJaxDelegate()

server = http.createServer(function(req, resp) {
    if (req.method == "POST") {
	if (req.url == servingPath) {
	    var reqBody = "";
	    req.on("data", function(data) {
		reqBody += data;
	    });
	    
	    req.on("end", function() {
		console.log("Parsing reqBody");  // DEBUG
		try {
		    mjInputObj = JSON.parse(reqBody);

		    mjDelegate.convert(mjInputObj, function(data) {
			if (data.errors) {
			    resp.writeHead(500,
					   {"Content-Type":
					    servingContentType});
			    resp.end({
				respErrorsKey: ["Error occurred during " +
					        "conversion"]
			    });
			} else {
			    outObj = {
				"mathTex": mjInputObj.mathTex,
			    };

			    if (mjInputObj.imageFormat == "png") {
				outObj.conversionResult = data.png;
			    } else if (mjInputObj.imageFormat == "MathML") {
				outObj.conversionResult = data.mml;
			    } else {
				outObj.conversoinResult = undefined;
			    }

			    if (typeof outObj.conversionResult == "string") {
				resp.writeHead(200,
					       {"Content-Type":
						servingContentType});
				resp.end(JSON.stringify(outObj));
			    } else {
				resp.writeHead(400,
					       {"Content-Type":
						servingContentType});
				resp.end({
				    respErrorsKey:
				      ["Unsupported conversion type"]
				});
			    }
			}
		    });
		} catch (e) {
		    console.log("Parsing failed");			
		    resp.writeHead(400,
				   {"Content-Type": servingContentType});
		    resp.end(JSON.stringify({
			respErrorsKey: ["Invalid JSON content in request"]
		    }));
		}
		
		
	    });
	} else {
	    resp.writeHead(404, {"Content-Type": servingContentType});
	    resp.end(JSON.stringify({
		respErrorsKey: ["Invalid request path"]
	    }));
	}
    } else {
	resp.writeHead(404, {"Content-Type": servingContentType});
	resp.end(JSON.stringify({
	    respErrorsKey: ["Invalid request method"]
	}));
    }
});

// TODO: Turn into command-line arguments
port = 80;
server.listen(port);
console.log("Server running on port", port);
