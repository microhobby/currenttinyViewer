var serialObject = null;
var window = null;

var str2ab = function(str) 
{
	var encodedString = unescape(encodeURIComponent(str));
	var bytes = new Uint8Array(encodedString.length);

	for (var i = 0; i < encodedString.length; ++i) {
		bytes[i] = encodedString.charCodeAt(i);
	}

	return bytes.buffer;
};

function sendSerialCommand(cmd, fun)
{
	chrome.serial.send(
		window.serialObject.connectionId, 
		str2ab(cmd), fun);
}

chrome.app.runtime.onLaunched.addListener(function() 
{
	/* construct window */
	chrome.app.window.create('index.html', {
		id: "curren_minit",
		innerBounds: {
			width: 1160,
			height: 680,
			maxWidth: 1160,
			maxHeight: 680,
		},
		resizable: false,
		frame: "chrome",
	}, function(w) 
	{
		/* stop flush and disconnect serial on close window app */
		w.onClosed.addListener(function()
		{
			console.info("Window closed please disconnect serial ...");

			if (window.serialObject) {
				console.info("send stop");
				/* 2x attempts */
				sendSerialCommand("at+instant\n", function()
				{
					sendSerialCommand(
						"at+instant\n", function()
						{
							chrome.serial.disconnect(
							window.serialObject.connectionId, 
							function()
							{
								console.info("Device disconnected");
							});	
						});	
				});
			}
		});
	});
});

/* receive from window the serial connected object */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) 
{
	console.info("Received serial object :: ", request);
	window.serialObject = request.serial;
});
