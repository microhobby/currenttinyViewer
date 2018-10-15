/* instantiete classes */
var current = new CurrentTiny();
var myChart = null;

/* defines */
var RING_BUFFER_SIZE = 1000;
var ringstack = 0;

/* DOM bindings */
var loading_page = document.getElementById("connection_page");
var loading_message = document.getElementById("loadingMessage");
var div_inputs = document.getElementById("inputs");
var button_begin = document.getElementById("begin");
var input_buffersize = document.getElementById("buffersize");
var input_offsets = document.getElementById("offsets");

/* structs objects */
window.chartColors = {
	red: 'rgb(255, 99, 132)',
	orange: 'rgb(255, 159, 64)',
	yellow: 'rgb(255, 205, 86)',
	green: 'rgb(75, 192, 192)',
	blue: 'rgb(54, 162, 235)',
	purple: 'rgb(153, 102, 255)',
	grey: 'rgb(201, 203, 207)'
};

/* chart config struct is defined in myChart.js */

/* functions */

function showLimitsOffsetInputs()
{
	setTimeout(function()
	{
		div_inputs.classList.remove("flipHide");
		div_inputs.classList.add("flipInY");
	}, 200);
}

function timeoutRetry()
{
	loading_message.innerText = "Checking devices again ...";
	setTimeout(tryConnectCurrentTiny,2000);
}

function timeoutGetFirmwareVersion()
{
	current.getFirmwareVersion(function(ver)
	{
		loading_message.innerText = "Firmware Version :: " + ver;
		showLimitsOffsetInputs();
	});
}

/**
 * This functions is called and check the serial ports until a device
 * responds to its firmware version command
 */
function tryConnectCurrentTiny()
{
	current.connect(function(ret)
	{
		switch(ret) {
			case CurrentTiny.NO_DEVICES :
				loading_message.innerText 
					= "No devices connected :(";
				/* retry */
				setTimeout(timeoutRetry, 2000);
			break;

			case CurrentTiny.CONNECTED :
				loading_message.innerText 
					= "Connected to device :)";
				/* get firmware version */
				setTimeout(timeoutGetFirmwareVersion, 2000);
			break;
		}
	});
}

/**
 * On the end of ring buffer draw average / min / max lines from data
 * analyzed in ring buffer
 */
function madeAvgs()
{
	var avg = 0;
	var max = -Infinity;
	var min = Infinity;

	for (var i = 0; i < RING_BUFFER_SIZE; i++) {
		var read = window.myChart.data.datasets[0].data[i];
		avg += read;

		if (read > max) {
			max = read;
		}

		if (read < min) {
			min = read;
		}
	}

	avg /= RING_BUFFER_SIZE;

	/* store lines points */
	for (var i = 0; i < RING_BUFFER_SIZE; i++) {
		window.myChart.data.datasets[1].data[i] = avg;
		window.myChart.data.datasets[2].data[i] = min;
		window.myChart.data.datasets[3].data[i] = max;
	}

	/* identify the chart captions */
	window.myChart.data.datasets[1].label = "AVG " + avg.toFixed(3);
	window.myChart.data.datasets[2].label = "Min " + min.toFixed(3);
	window.myChart.data.datasets[3].label = "Max " + max.toFixed(3);
}

function beginFlush()
{
	/* flip out the loading page */
	loading_page.classList.add("flipOutX");

	/* wait for flip out end */
	setTimeout(function()
	{
		current.flushValues(function(data)
		{
			/* set to ring buffer */
			if (ringstack > RING_BUFFER_SIZE) {
				ringstack = 0;
				madeAvgs();
			}

			window.myChart.data.datasets[0]
				.data[ringstack] = parseFloat(data);
			window.myChart.update();
			ringstack++;
		});
	},2000);
}