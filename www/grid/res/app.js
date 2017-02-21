// by 6Harmonics Qige @ 2017.02.18

var store = {
	mode: 'demo',
	offlineCounter: 0,
	offlineCounterBar: 6,

	defaultRecordQty: 200, // 200 records for each chart
	flot: {
		intl: {
			local: null,
			peers: [],
			DEMO: null
		},
		color: [
			'lime', 'red', 'blue', 'purple', 'deep-purple', 
			'indigo', 'pink', 'light-blue', 'cyan', 'teal', 
			'green', 'light-green', 'yellow', 'amber', 'orange', 
			'deep-orange', 'brown', 'grey', 'blue-grey'
		],
		chart: [],
		data: null
	}
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
			var flots = $('.qz-chart-holder');
			var local = flots.first();
			var local_chart = $.flot.chart(0, local);
			store.flot.chart.length = 0;
			store.flot.chart.push(local_chart);
			$.flot.bg(0, local);
		},
		bg: function(idx, item) {
				var color = $.flot.color(idx) || 'cyan';
				if (typeof(item) == 'object') {
					item.addClass(color)
					.resize(function() { console.log('Flot Chart(s) resized.'); });
				}
		},
		chart: function(idx, item) {
				var i, wan_tx, wan_rx, lan_tx, lan_rx;
				var data_wan_tx = [], data_wan_rx = [];

				if (store.flot.data) {
					if (idx) {
						var index = idx - 1;
						wan_tx = store.flot.data.peers[index].wan_tx;
						wan_rx = store.flot.data.peers[index].wan_rx;
					} else {
						wan_tx = store.flot.data.local.wan_tx;
						wan_rx = store.flot.data.local.wan_rx;
					}	

					for(i = 0; i < wan_tx.length; i ++) {
						data_wan_tx.push([i, wan_tx[i]]);
					}

					for(i = 0; i < wan_rx.length; i ++) {
						data_wan_rx.push([i, wan_rx[i]]);
					}
				}
				var data = [{
					label: "WAN Tx",
					data: data_wan_tx
				}, {
					label: "WAN Rx",
					data: data_wan_rx
				}];
				var flot = $.plot(item, data, {
					series: {
						stack: true, // stack lines
						lines: {
							show: true
						},
						points: {
							show: true
						},
						shadowSize: 0 // remove shadow to draw faster
					},
					grid: {
						//hoverable: true,
						//clickable: true
					},
					yaxis: {
						min: 0,
						//max: 30
					},
					xaxis: {
						show: true,
						tickDecimals: 0,
						min: 0
					},
					legend: {
						show: false // TODO: fix legend size
					}
				});

				//flot.setData([]);
				//flot.draw();
				return flot;
		},
		one: function(data_obj, val, qty_max) {
			var max = qty_max || store.defaultRecordQty;
			if (data_obj.length >= max) {
				data_obj.shift();
			}
			data_obj.push(val);
		},
		color: function(idx) {
			return store.flot.color[idx];
		},
		sync: function() {
			console.log("$.Flot.sync()");
		}
	}
}) (jQuery);

// data controller
(function($) {
	$.cache = {
		init: function() {
		},
		RANDOM: {
			int: function(range) {
				return Math.random() * (range | 10);
			}
		},
		fmt: {
			dev: function(data) {
				var dev = {
					bridge: data.bridge,
					mac: data.mac,
					wan_ip: data.wan_ip,
					wan_tx: data.wan_txb,
					wan_rx: data.wan_rxb,
					lan_ip: data.lan_ip,
					lan_tx: data.lan_txb,
					lan_rx: data.lan_rxb
				};
				return dev;	
			}
		},
		query: {
			local: function() {
				return Math.random()*10;
			},
			DEMO: function(idx) {
				var data = {
					bridge: 0,
					mac: '10:00:00:00:00:0'+idx,
					wan_ip: '10.10.1.2'+idx,
					wan_txb: $.cache.RANDOM.int(),
					wan_rxb: $.cache.RANDOM.int(),
					lan_ip: '192.168.1.2'+idx,
					lan_txb: $.cache.RANDOM.int(),
					lan_rxb: $.cache.RANDOM.int()
				};
				var dev = $.cache.fmt.dev(data);
				return dev;
			}
		},
		sync: {
			local: function() {
				var val = $.cache.query.local();
				console.log(" val = "+val);
				store.flot.data.local.wan_tx.push(val);
			},
			peers: function() {

			},
			DEMO: function() {
				var demo = {
					local: $.cache.query.DEMO(0),
					peers: [ $.cache.query.DEMO(1), $.cache.query.DEMO(2) ]
				};
				console.dir(demo);
				store.flot.data = demo;
			}
		},
		update: function() {
			// main data sync sequences
			$.cache.sync.local();
			$.cache.sync.peers();
		},
		DEMO: function() {
			$.cache.sync.DEMO();
		},
		_: {
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
		},
		update: function() {
			$.flot.sync();
		}
	}
}) (jQuery);

// app algorithm
(function($) {
	$.app = {
		init: function(mode) {
			store.mode = mode;
			$.ui.init();
			$.cache.init();
		},
		update: function() {
			console.log("$.app.update()");
			$.cache.update();
			$.ui.update();
		},
		DEMO: function() {
			console.log("$.app.DEMO()");
			$.cache.DEMO();
			$.ui.update();
		},
		run: function(mode) {
			$.app.init(mode);

			if (mode == 'realtime') {
				console.log("App Running (realtime).");
				// main loop
				$.app.update();
				store.flot.intl.local = setInterval("$.app.update", 1500);
			} else {
				console.log("App Running in DEMO mode.");
				$.app.DEMO();
				store.flot.intl.DEMO = setInterval("$.app.DEMO()", 2000);
			}
		}
	}
}) (jQuery);


// start app
$(function() {
	var m = $.url.get('k') || 'demo';
	$.app.run(m);
});

