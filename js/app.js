
/**
 * 
 */
window.onload = function()
{
	console.info("Starting app ...");

	console.info("Starting chart ...");

	/* get canvas context for chart */
	var ctx = document.getElementById("myChart").getContext('2d');
	ctx.canvas.width  = window.innerWidth;
	ctx.canvas.height = window.innerHeight;
	
	/*update_ringbuffer(RING_BUFFER_SIZE);*/

	/* instantiate here with context from canvas */
	window.myChart = new Chart(ctx, chartConfig);

	console.info("Start serial port pooling ...");
	
	setTimeout(function()
	{
		tryConnectCurrentTiny();
	}, 2000);
};

/**
 * Here we are connected to a Current Tiny device
 * After config limits and offsets we click getData to flush data to chart
 */
button_begin.onclick = function()
{
	/* read and set limits and offsets */
	let buffer = parseInt(input_buffersize.value);
	let offset = parseFloat(input_offsets.value);
	
	window.myChart.options.scales.yAxes[0].ticks.min = offset * -1;
	window.myChart.options.scales.yAxes[0].ticks.max = offset;
	RING_BUFFER_SIZE = buffer;

	/* clear labels */
	update_ringbuffer(RING_BUFFER_SIZE);

	map_events();

	/* start to get data from device */
	beginFlush();
};
