
/* chart config struct object */
var chartConfig = {
	type: 'line',
	data: {
		labels: [],
		datasets: [
			{
				label: "Current Measure",
				backgroundColor: window.chartColors.red,
				borderColor: window.chartColors.red,
				data: [],
				fill: false
			},
			{
				label: "AVG",
				backgroundColor: window.chartColors.green,
				borderColor: window.chartColors.green,
				data: [],
				fill: false
			},
			{
				label: "Min",
				backgroundColor: window.chartColors.orange,
				borderColor: window.chartColors.orange,
				data: [],
				fill: false
			},
			{
				label: "Max",
				backgroundColor: window.chartColors.blue,
				borderColor: window.chartColors.blue,
				data: [],
				fill: false
			}
		],
	},
	options: {
		elements: { 
			point: { 
				radius: 0 
			},
			line: {
				borderWidth: 1.5
			},
		},
		responsive: false,
		showTooltips: false,
		hover: {mode: null},
		events: [],
		title: {
			display: true,
			text: 'Current'
		},
		scales: {
			xAxes: [{
				display: true,
				scaleLabel: {
					display: true,
					labelString: 'x'
				}
			}],
			yAxes: [{
				display: true,
				ticks: { min: -2.5, max: 2.5 },
				scaleLabel: {
					display: true,
					labelString: 'y'
				}
			}]
		}
	}
}
