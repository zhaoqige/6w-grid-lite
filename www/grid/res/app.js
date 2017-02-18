
$(document).ready(function(){
	$('.modal').modal();
});


$(document).ready(function() {
		// We use an inline data source in the example, usually data would
		// be fetched from a server

		var data = [],
			totalPoints = 300;

		function getRandomData() {

			if (data.length > 0)
				data = data.slice(1);

			// Do a random walk

			while (data.length < totalPoints) {

				var prev = data.length > 0 ? data[data.length - 1] : 25,
					y = prev + Math.random() * 10 - 5;

				if (y < 0) {
					y = 0;
				} else if (y > 100) {
					y = 100;
				}

				data.push(y);
			}

			// Zip the generated y values with the x values

			var res = [];
			for (var i = 0; i < data.length; ++i) {
				res.push([i, data[i]])
			}

			return res;
		}

		var plot = $.plot("#qz-chart-abb-local", [ getRandomData() ], {
			series: {
				shadowSize: 0	// Drawing is faster without shadows
			},
			yaxis: {
				min: 0,
				max: 100
			},
			xaxis: {
				show: true
			}
		});

		var plot2 = $.plot("#qz-chart-nw-local", [ getRandomData() ], {
			series: {
				shadowSize: 0	// Drawing is faster without shadows
			},
			yaxis: {
				min: 0,
				max: 100
			},
			xaxis: {
				show: true
			}
		});

		var plot3 = $.plot("#qz-chart-snr-local", [ getRandomData() ], {
			series: {
				shadowSize: 0	// Drawing is faster without shadows
			},
			yaxis: {
				min: 0,
				max: 100
			},
			xaxis: {
				show: true
			}
		});

		function update() {
			plot.setData([getRandomData()]);
			// Since the axes don't change, we don't need to call plot.setupGrid()
			plot.draw();
			plot2.setData([getRandomData()]);
			plot2.draw();

			plot3.setData([getRandomData()]);
			plot3.draw();

			setTimeout(update, 2500);
		}
		update();

});