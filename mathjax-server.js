var http = require("http")
var MathJaxDelegate = require("./mathjax-delegate.js")

var servingPath = "/math-jax/math-jax";
var servingContentType = "application/json";

var responseHeader = {
    "Content-Type": servingContentType,
    "Access-Control-Allow-Origin": "*"
};

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
		try {
		    mjInputObj = JSON.parse(reqBody);

		    mjDelegate.convert(mjInputObj, function(data) {
			if (data.errors) {
			    resp.writeHead(500, responseHeader);
			    resp.end(JSON.stringify({
				respErrorsKey: ["Error occurred during " +
					        "conversion"]
			    }));
			} else {
			    outObj = {
				"mathTex": mjInputObj.mathTex,
			    };

			    if (mjInputObj.imageFormat == "png") {
				// TODO: Remove ulgy logic
				var png_data_prefix = "data:image/png;base64,";
				outObj.conversionResult = data.png;

				if (outObj.conversionResult.substring(0, png_data_prefix.length) ===
				    png_data_prefix) {
				    outObj.conversionResult = 
					outObj.conversionResult.substring(png_data_prefix.length,
									  outObj.conversionResult.length);
				}

			    } else if (mjInputObj.imageFormat == "MathML") {
				outObj.conversionResult = data.mml;
			    } else {
				outObj.conversoinResult = undefined;
			    }

			    if (typeof outObj.conversionResult == "string") {
				resp.writeHead(200, responseHeader);
				resp.end(JSON.stringify(outObj));
			    } else {
				resp.writeHead(400, responseHeader);
				console.error("typeof outObj.conversionResult =",
					      (typeof outObj.conversionResult));
				resp.end(JSON.stringify({
				    respErrorsKey:
				      ["Unsupported conversion type"]
				}));
			    }
			}
		    });
		} catch (e) {
		    console.log("Parsing failed");			
		    resp.writeHead(400, responseHeader);
		    resp.end(JSON.stringify({
			respErrorsKey: ["Invalid JSON content in request"]
		    }));
		}
		
		
	    });
	} else {
	    resp.writeHead(404, responseHeader);
	    resp.end(JSON.stringify({
		respErrorsKey: ["Invalid request path"]
	    }));
	}
    } else {
	resp.writeHead(404, responseHeader);
	resp.end(JSON.stringify({
	    respErrorsKey: ["Invalid request method"]
	}));
    }
});

// TODO: Turn into command-line arguments
port = 80;
server.listen(port);
console.log("Server running on port", port);
