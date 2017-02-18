// by 6Harmonics Qige @ 2017.02.18

var store = {
	mode: 'demo',
	offlineCounter: 0,
	offlineCounterBar: 6,

	defaultRecordQty: 200, // 200 records for each chart
};

// window.location.href
(function($) {
	$.url = {
		get: function(key) {
			var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)");
			var r = window.location.search.substr(1).match(reg);
			if (r != null) return unescape(r[2]); return null;
		},
		goto: function(url, reason) {
			if (confirm('Will leave current page due to ' + reason)) {
					$(window.location).attr('href', url);
			}
		},
		check: function(url, reason) {
			if (store.offlineCounter == store.offlineCounterBar)
				$.url.goto(url, reason);
		},
		reload: function() {
			window.location.reload();
		},
		close: function() {
			window.opener = null; window.open(".", "_self"); window.close();
			if (window) { window.location.href = "about: blank"; }
		}
	};
}) (jQuery);


// Materialize controller
(function($) {
	$.materialize = {
		init: function() {
			$('.modal').modal();
		}
	}
}) (jQuery);


// Flot controller
(function($) {
	$.flot = {
		init: function() {
			$('.qz-chart-holder').each(function() {
				console.dir($(this));
				$(this).resize();
			});
		},
		one: function(data_obj, val, qty_max) {
			var max = qty_max || store.defaultRecordQty;
			if (data_obj.length >= max) {
				data_obj.shift();
			}
			data_obj.push(val);
		}
	}
}) (jQuery);

// data controller
(function($) {
	$.cache = {
		demo: {
			data_local_basic: function() {
				var data = {
					nw: [{
						bridge: 0,
						ifname: 'eth0',
						zone: 'wan',
						ip: '10.10.1.2',
						mac: '00:5e:ac:00:00:01'
					},{
						bridge: 0,
						ifname: 'wlan0',
						zone: 'lan',
						ip: '192.168.1.2',
						mac:'00:5e:ac:00:00:02'
					}],
					wls: [{
						mac:'00:5e:ac:00:00:02',
						mode: 'CAR',
						ssid: 'gws2016',
						encrypt: '',
						service: ['QoS','Firewall']
					}]
				};
				return data;
			},
			data_local_update: function() {
				var data = {
					gws: {
						conf: [{
							rgn: 1,
							ch: 43,
							freq: 650,
							bw: 8,
							txpwr: 33,
							rxgain: 12,
							agc: 1,
							tpc: 1
						}],
						abb: [{
							ifname: 'wlan0',
							rssi: -75,
							noise: -101,
							txmcs: 5,
							rxmcs: 6
						}]
					},
					nw: [{
						zone: 'wan',
						rxb: 65211,
						txb: 11256
					},{
						zone: 'lan',
						rxb: 110286,
						txb: 290487
					}]
				};
				return data;
			}
		}
	}
}) (jQuery);

// ui controller
(function($) {
	$.ui = {
		init: function() {
			$.materialize.init();
			$.flot.init();
		}
	}
}) (jQuery);

// app algorithm
(function($) {
	$.app = {
		init: function(mode) {
			store.mode = mode;
			$.ui.init();
		},
		run: function(mode) {
			$.app.init(mode);
			if (mode == 'realtime') {
				console.log("App Running (realtime).");
			} else {
				console.log("App Running in DEMO mode.");
				var data_local_basic = $.cache.demo.data_local_basic();
				var data_local_update = $.cache.demo.data_local_update();
			}
		}
	}
}) (jQuery);


// start app
$(function() {
	var m = $.url.get('k') || 'demo';
	$.app.run(m);
});





// import from flot examples
$(function() {
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

		var plot = $.plot("#qz-chart-local", [ getRandomData() ], {
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

		var chart_peers = $('.qz-chart-peer');
		var plot2 = $.plot(chart_peers[0], [ getRandomData() ], {
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

		var plot3 = $.plot(chart_peers[1], [ getRandomData() ], {
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