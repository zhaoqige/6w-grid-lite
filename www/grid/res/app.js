// by 6Harmonics Qige @ 2017.02.22

// data controller
(function($) {
	$.cache = {
		// ...
		init: function() {
		},
		// get random value
		RANDOM: {
			int: function(range) {
				return Math.round(Math.random() * (range || 10));
			}
		},
		stop: function() {
			store.flot.intl.each(function() {
				if ($(this)) clearInterval($(this));
			});
		},
		// clear chart data when click "CLEAR" button
		clear: {
			local: function() {
				store.history.local.length = 0;
			}
		},
		// ajax query
		query: {
			// 'demo' mode
			DEMO: function(idx) {
				var data = {
					abb: {
						signal: -107 + 15 + $.cache.RANDOM.int(10),
						noise: -107 + $.cache.RANDOM.int(10),
						txmcs: 3 + $.cache.RANDOM.int(4),
						rxmcs: 4 + $.cache.RANDOM.int(3),
						chbw: 8,
						mode: 'CAR',
						ssid: 'gws2017',
						encrypt: ''
					},
					nw: {
						bridge: 1,
						wmac: '10:00:00:00:00:0'+idx,					
						wan_ip: '',
						wan_txb: $.cache.RANDOM.int(26*1024*1024),
						wan_rxb: $.cache.RANDOM.int(26*1024*1024),
						lan_ip: '192.168.1.2'+idx,
						lan_txb: $.cache.RANDOM.int(26*1024*1024),
						lan_rxb: $.cache.RANDOM.int(26*1024*1024)
					},
					gws: {
						rgn: 1,
						ch: 43,
						freq: 650,
						agc: 0,
						rxg: -10 + $.cache.RANDOM.int(30),
						txpwr: $.cache.RANDOM.int(33),
						tpc: $.cache.RANDOM.int(1),
						chbw: 8
					},
					sys: {
						qos: 0,
						firewall: 0,
						atf: 0,
						tdma: 0
					}
				};
				return data;
			}
		},
		// start ajax/proxy query
		sync: {
			local: function() {
				// TODO: call & handle ajax fails 
				$.get('/cgi-bin/get', { k: 'sync' }, function(resp) {
					console.log('get?k=sync'); console.dir(resp);
				}, 'json')
				.fail(function() {
					console.log('get?k=sync', "error> local sync failed");
				});
			},
			// proxy query
			peers: function() {
				// TODO: call & handle ajax fails
				$.get('/cgi-bin/proxy', { ip: '', cmd: 'cache' }, function(resp) {
				}, 'json')
				.fail(function() {
					console.log("error> peers sync failed");
				});
			},
			// generate DEMO data
			DEMO: function() {
				var demo = {
					local: $.cache.query.DEMO(0),
					peers: [ $.cache.query.DEMO(1), $.cache.query.DEMO(2) ]
				};
				store.query = demo;
			}
		},


		// parse store.query.cache,
		// save store.history;
		parse: {
			// TODO: parse data with DEMO
			local: {
				status: function() {
					var query = (store && "query" in store) ? store.query_last : null;
					var local = (query && "local" in query) ? query.local : null;

					var abb = (local && "abb" in local) ? local.abb : null;
					var nw = (local && "nw" in local) ? local.nw : null;
					var gws = (local && "gws" in local) ? local.gws : null;
					var sys = (local && "sys" in local) ? local.sys : null;

					var abb_text = '';
					if (abb) {
						if (abb.ssid)		abb_text += abb.ssid;
						if (abb.mode)		abb_text += ' | '+abb.mode;
					}
					if (gws) {
						var text = 'R'+gws.rgn+' - CH'+gws.ch;
						$('#qz-local-rgn-ch').text(text);
						text = gws.freq+' M - '+gws.chbw+' M';
						$('#qz-local-freq-chbw').text(text);
						text = gws.txpwr+' dBm - TPC '+(gws.tpc ? 'ON' : 'OFF');
						$('#qz-local-txpwr-tpc').text(text);
						text = gws.rxg+' dB - AGC '+(gws.agc ? 'ON' : 'OFF');
						$('#qz-local-rxg-rxagc').text(text);
					}
					if (nw) {
						var text = '';
						if (nw.lan_ip)		text += nw.lan_ip;
						if (nw.wan_ip) 		text += ' / '+nw.wan_ip;
						$('#qz-local-nw').text(text);

						text = abb_text;
						if (nw.bridge) {
							text += ' (router)';
						} else {
							text += ' (bridged)';	
						}	
						if (nw.wmac)		text += ' | '+nw.wmac;

						if (sys) {						
							if (sys.qos)		text += ' | QoS';
							if (sys.firewall)	text += ' | Firweall'
							if (sys.tdma)		text += ' | TDMA';
							if (sys.atf)		text += ' | ATF';
						}
						$('#qz-local-sts').text(text);
					}
				},
				chart: function() {
					// set store.history = history;
					var _local_history;

					// check history, query first
					var query = (store && "query" in store) ? store.query : null;
					var query_last = (store && "query_last" in store) ? 
							store.query_last : null;

					var local = (query && "local" in query) ? query.local : null;
					var local_last = (query_last && "local" in query_last) ? 
							query_last.local : null;

					var history = (store && "history" in store) ? store.history : null;
					var local_history = (history && "local" in history) ? 
							history.local : null;


					// start calculation
					if (local) {
						// 
						var _;
						
						// save txmcs, rxmcs
						var _snr = [], _txmcs = [], _rxmcs = [];
						// calc & save snr, ul_thrpt, dl_thprt
						var _ul_thrpt = [], _dl_thrpt = [];

						// calc & save snr
						if ("abb" in local) {						
							_ = 0;
							if ("signal" in local.abb && "noise" in local.abb) {
								_ = local.abb.signal - local.abb.noise;
							} else {
								_ = 0;
							}

							// push
							if ("snr" in local_history) {
								_snr = $.flot.one(local_history.snr, _, 60);
							} else {
								_snr.push(_);
							}

							// save txmcs
							_ = 0;
							if ("txmcs" in local.abb) {
								_ = local.abb.txmcs;
							}
							if ("txmcs" in local_history) {
								_txmcs = $.flot.one(local_history.txmcs, _, 60);
							} else {
								_txmcs.push(_);
							}

							// save rxmcs
							_ = 0;
							if ("rxmcs" in local.abb) {
								_ = local.abb.rxmcs;
							}
							if ("rxmcs" in local_history) {
								_rxmcs = $.flot.one(local_history.rxmcs, _, 60);
							} else {
								_rxmcs.push(_);
							}
						}

						// save uplink
						if ("nw" in local) {						
							var ul_thprt = 0, dl_thrpt = 1, last_lan_txb = 0, last_lan_rxb = 0;
							if (("lan_txb" in local.nw) && local_last && ("nw" in local_last)) {
								if ("lan_txb" in local_last.nw) {
									ul_thprt = local.nw.lan_txb - local_last.nw.lan_txb;
									ul_thprt = Math.round(ul_thprt / (1024*1024));
									if (ul_thprt < 0)	ul_thprt = 0;
								}

								// save downlink
								if ("lan_rxb" in local_last.nw) {
									dl_thrpt = local.nw.lan_txb - local_last.nw.lan_rxb;
									dl_thrpt = Math.round(dl_thrpt / (1024*1024));
									if (dl_thrpt < 0)	dl_thrpt = 0;
								}
							}

							if ("ul_thrpt" in local_history) {
								_ul_thrpt = $.flot.one(local_history.ul_thrpt, ul_thprt, 60);
							} else {
								_ul_thrpt.push(ul_thprt);
							}
							if ("dl_thrpt" in local_history) {
								_dl_thrpt = $.flot.one(local_history.dl_thrpt, dl_thrpt, 60);
							} else {
								_dl_thrpt.push(dl_thrpt);
							}
						}


						// save to store.history
						_local_history = {
							snr: _snr,
							txmcs: _txmcs,
							rxmcs: _rxmcs,
							ul_thrpt: _ul_thrpt,
							dl_thrpt: _dl_thrpt,
						};

					} else {
						_local_history = {
							snr: null,
							txmcs: null,
							rxmcs: null,
							ul_thprt: null,
							dl_thrpt: null
						}
					}

					// save result to "store.history.local"
					store.history.local = _local_history;
					$.cache.save.local();
				}
			},
			peers: {
				chart: function() {
					//var peers = store.query.peers;
				},
				status: function() {

				}
			}
		},

		save: {
			local: function() {
				var _ = store.query;
				store.query_last = _;
				store.query = null;
			}
		},

		// "realtime" update
		update: function() {
			// main data sync sequences
			$.cache.sync.local();
			//$.cache.parse.local();
			//$.cache.sync.peers();
			//$.cache.parse.peers();
		},
		// 'demo' mode entry
		// TODO: parse & save "store.cache" into "store.history"
		DEMO: function() {
			$.cache.sync.DEMO();
			$.cache.parse.local.status();
			$.cache.parse.local.chart();
			$.cache.parse.peers.status();
			$.cache.parse.peers.chart();
		},
	}
}) (jQuery); // $.cache


// ui controller
// @2017.02.22
(function($) {
	$.ui = {
		init: function() {
			$.materialize.init();
			$.flot.init();
			$.ui.forms();
		},
		update: function() {
			$.flot.sync();
		},
		forms: function() {
			$('form').submit(function() {
				return false;
			});
		},
		obj: {
			enable: function(obj) {
				obj.attr('disabled', false);
			},
			disable: function(obj) {
				obj.attr('disable', true);
			}
		}
	}
}) (jQuery); // $.ui


// Bind & handle all "EVENT"
// TODO: this page not finished yet
// @2017.02.22
(function($) {
	$.ops = {
		init: function() {
			$('#qz-local-reset').click(function() {
				$.cache.clear.local();
			});
			$('#qz-btn-sys-reset').click(function() {
				$('#qz-modal-chcfm-items').text('Reset Network');
				$('#qz-modal-chcfm-affected').text('This Operation Will REBOOT This Device');
				$('#qz-btn-confirm-change').attr('ops', 'reset').attr('val', 'sys');
			});

			$('#qz-btn-abb-reset').click(function() {
				$('#qz-modal-chcfm-items').text('Reset Analog Baseband');
				$('#qz-modal-chcfm-affected').text('This Operation Will Interrupt Your Current Wireless Communication');
				$('#qz-btn-confirm-change').attr('ops', 'reset').attr('val', 'abb');
			});

			$('#qz-btn-gws-reset').click(function() {
				$('#qz-modal-chcfm-items').text('Reset GWS');
				$('#qz-modal-chcfm-affected').text('This Operation Will Interrupt Your Current Wireless Communication');
				$('#qz-btn-confirm-change').attr('ops', 'reset').attr('val', 'gws');
			});

			$('#qz-btn-nw-reset').click(function() {
				$('#qz-modal-chcfm-items').text('Reset Network');
				$('#qz-modal-chcfm-affected').text('This Operation Will Interrupt Your Current Network Communication, including Wireless Communication');
				$('#qz-btn-confirm-change').attr('ops', 'reset').attr('val', 'nw');
			});

			$('#qz-btn-fw-factory').click(function() {
				$('#qz-modal-chcfm-items').text('Reset to FACTORY SETTINGS');
				$('#qz-modal-chcfm-affected').text('This Operation Will RESET This Device to FACTORY SETTINGS !');
				$('#qz-btn-confirm-change').attr('ops', 'init').attr('val', 'new');
			})

			$('#qz-btn-confirm-change').click(function() {
				var ops = $(this).attr('ops');
				var val = $(this).attr('val');
				console.log('ops>', ops, val);

				var url = '/cgi-bin/' + ops;
				if (val) {
					url += ('?k=' + val);
				}

				$.ops.ajax(val, url, null);
			});

			$(':text').keydown(function(e) {
				if (e.keyCode == 13) {
					var obj = $(this);
					obj.qz = {
						_com: obj.attr('alt'),
						_item: obj.attr('name'),
						_val: obj.val()
					};
					$.ops.change(obj);
				}
			});
			$(':checkbox').click(function() {
				var obj = $(this);
				var current = (obj.attr('checked') == 'checked') || false;
				if (current) {
					obj.removeAttr('checked');
				} else {
					obj.attr('checked', true);
				}

				obj.qz = {
					_com: obj.attr('alt'),
					_item: obj.attr('name'),
					_val: (obj.attr('checked') == 'checked') ? 'on' : 'off'
				};

				if (obj.qz._com != 'undefined' && obj.qz._item != 'undefined') {
					$.ops.change(obj);
				}
			});
			$('select').change(function() {
				var obj = $(this);
				obj.qz = {
					_com: obj.attr('alt'),
					_item: obj.attr('name'),
					_val: obj.val()
				};
				$.ops.change(obj);
			})

			$('.qz-btn-local-chart').click(function() {
				var type = $(this).attr('alt');
				store.flot.fields = type;
			});
		},
		change: function(obj) {
			if (obj.qz._val != '' && obj.qz._val != '-') {
				console.log('enter >', obj.qz._com, obj.qz._item, obj.qz._val);

				$.ops.ajax('Save', '/cgi-bin/set', {
					com: obj.qz._com, item: obj.qz._item, val: obj.qz._val
				}, obj);
			}
		},
		ajax: function(ops, url, params, obj) {
			var prompt = '';

			// prevent multi-submit
			if (obj) {
				$.ui.obj.disabled(obj);
				console.log(' disable:', obj.attr('disabled'));
			}

			$.get(url, params, function(resp) {
				switch(ops) {
				case 'abb':
					prompt = 'ABB has been RESET';
					break;
				case 'gws':
					prompt = 'GWS has been RESET';
					break;
				case 'nw':
					prompt = 'Network has been RESET';
					break;
				case 'sys':
					prompt = 'Device is REBOOTING';
					break;
				default:
					prompt = 'Operation completed';
					break;
				}
				console.log('ajax (ok) result:', prompt);

				$.materialize.toast(prompt);

				// reset nw: reload
				// reset sys: close
				$.ops.ajax_done(ops);

				// release submit
				if (obj) $.ui.obj.enable(obj);
			})
			.fail(function(resp) {
				switch(ops) {
				case 'nw':
					prompt = 'Network has been RESET';
					break;
				case 'sys':
					prompt = 'Device is REBOOTING';
					break;
				default:
					prompt = 'Operation failed > ' + ops;
					break;
				}
				console.log('ajax (fail) result:', prompt);
				
				$.materialize.toast(prompt);

				// reset nw: reload
				// reset sys: close
				$.ops.ajax_done(ops);

				// release submit
				if (obj) $.ui.obj.enable(obj);
				console.log(' disable:', obj.attr('disabled'));
			});
		},
		ajax_done: function(ops) {
			switch(ops) {
			case 'nw':
				$.materialize.toast('Reload this page due to Device Network is RESET');
				setTimeout("$.url.reload()", 3000);
				break;
			case 'sys':
				$.materialize.toast('Closing this page due to Device is REBOOTING', 5000);
				setTimeout("$.url.goto('/', 'Reboot')", 5000);
				break;
			default:
				break;
			}
		}
	}
}) (jQuery); // $.ops

// app algorithm
// @ 2017.02.22
(function($) {
	$.app = {
		init: function(mode) {
			store.mode = mode;
			$.ui.init();
			$.cache.init();
			$.ops.init();
		},
		// update store.query.cache with "ajax"
		update: function() {
			$.cache.update();
			$.ui.update();
		},
		// update store.query.cache with "DEMO"
		DEMO: function() {
			$.cache.DEMO();
			$.ui.update();
		},
		run: function(mode) {
			// init cache/data, ui
			$.app.init(mode);
			switch(mode) {
			case 'realtime':
				console.log("App Running (realtime).");
				// main loop
				$.app.update();
				store.flot.intl.local = setInterval("$.app.update", 1500);
				break;
			case 'demo':
			default:
				console.log("App Running in DEMO mode.");
				$.app.DEMO();
				store.flot.intl.DEMO = setInterval("$.app.DEMO()", 1000);
				break;
			}
		}
	}
}) (jQuery); // $.app


// app starts here
// @2017.02.22
$(function() {
	var m = $.url.get('k') || 'demo';
	$.app.run(m);
});

