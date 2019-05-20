/* instantiete classes */
var current = new CurrentTiny();
var myChart = null;

/* defines */
var RING_BUFFER_SIZE = 1000;
var RING_TMP = 0;
var ringstack = 0;
var newStorage = false;
var storage = [];

/* DOM bindings */
var loading_page = document.getElementById("connection_page");
var loading_message = document.getElementById("loadingMessage");
var div_inputs = document.getElementById("inputs");
var button_begin = document.getElementById("begin");
var input_buffersize = document.getElementById("buffersize");
var input_offsets = document.getElementById("offsets");
var chart_canvas = document.getElementById("myChart");

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

	console.info("Make avg to " + RING_BUFFER_SIZE + " points");

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
	window.myChart.data.datasets[1].label = "AVG " + avg.toFixed(2) + " mA";
	window.myChart.data.datasets[2].label = "Min " + min.toFixed(2)+ " mA";
	window.myChart.data.datasets[3].label = "Max " + max.toFixed(2)+ " mA";
}

function pad(num, size) 
{
	var s = num+"";
	while (s.length < size) s = "0" + s;
	return s;
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
			var value = parseFloat(data);
			/* ampere to miliampere */
			value *= 1000.0;
			value -= 90.0; // remove noise
			value = value < 0 ? 0 : value;

			/* set to ring buffer */
			if (ringstack > RING_BUFFER_SIZE) {
				ringstack = 0;
				madeAvgs();
			}

			/* storage is working? */
			if (newStorage) {
				storage.push(value);
			}

			window.myChart.data.datasets[0]
				.data[ringstack] = value;
			window.myChart.data.datasets[0].label = 
				pad(value.toFixed(2), 7) + " mA";
			window.myChart.update();
			ringstack++;
		});
	},2000);
}

function map_events()
{
	window.addEventListener("keyup", function(e)
	{
		console.log(e.keyCode);

		/* key S start the sub array */
		if (e.keyCode == 83) {
			console.info("Start new storage ...");
			new Notification("Start new storage", {
				icon: 'assets/icons/icon_128.png',
				body: "Storing points",
				requireInteraction: false
			});
			storage = [];
			newStorage = true;
		}

		/* key D stop the sub array and made avg */
		if (e.keyCode == 68) {
			console.info("Stop new storage ...");
			new Notification("Stop storage", {
				icon: 'assets/icons/icon_128.png',
				body: "Ploting points",
				requireInteraction: false   
			});
			newStorage = false;

			/* 1x attempts */
			current.getInstantAVGValue();
			setTimeout(function()
			{
				current.getInstantAVGValue();

				/* wait to uart stop flush */
				setTimeout(function()
				{
					update_ringbuffer(storage.length);
					console.info("Get " + RING_BUFFER_SIZE + " points");
					window.myChart.data.datasets[0].data = storage;
					madeAvgs();
					window.myChart.update();
				}, 500);
			}, 500);
		}

		/* key F start normal flush */
		if (e.keyCode == 70) {
			console.info("Resume normal flush ...");
			update_ringbuffer(RING_TMP);
			ringstack = 0;
			current.sendFlushCommand();
		}
	});
}

function update_ringbuffer(size)
{
	RING_TMP = RING_BUFFER_SIZE;
	RING_BUFFER_SIZE = size;

	chartConfig.data.labels = [];
	window.myChart.data.datasets[0].data = [];
	window.myChart.data.datasets[1].data = [];
	window.myChart.data.datasets[2].data = [];
	window.myChart.data.datasets[3].data = [];
	/* update ring buffer size */
	for (var i = 0; i < RING_BUFFER_SIZE; i++)
		chartConfig.data.labels[i] = i+1;
}
