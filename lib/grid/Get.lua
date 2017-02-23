-- Data Collector
-- by Qige @ 2017.02.23

require 'grid.base.cgi'
require 'grid.base.user'
require 'grid.base.fmt'
require 'grid.Http'

require 'grid.gws'


Get = {}

function Get.Run()
	cgi.save.init()

	local _result = ''
	if (user.verify.remote()) then
		local _get = cgi.data._get
		local _k = fmt.http.find('k', _get)

		if (_k == 'gws') then
			_result = Get.ops.gws()
		else
			_result = string.format('unknown (%s)', _k)
		end
		Http.job.Reply(_result)
	else
		Http.data.Error('nobody');
	end
end


-- #define
Get.conf = {}
Get.conf.path_ok = '/grid/app.html?k=realtime'
Get.conf.path_error = '/grid/'
Get.conf.path_exit = '/grid/'

Get.cmd = {}
Get.cmd.fmt_reply = '{"result":"%s", "cmd":"%s"}'
Get.cmd.abb = {}
Get.cmd.abb.reGet = 'wifi'
Get.cmd.abb.ssid = 'uci Get wireless.@wifi-iface[0].ssid="%s"; uci commit wireless; wifi'

Get.cmd.nw = '/etc/init.d/network restart'
Get.cmd.sys = 'reboot'

Get.cmd.gws = {}
Get.cmd.gws.reGet = '/etc/init.d/gws_radio restart'
Get.cmd.gws.rgn = 'uci Get gws_radio.v1.region=%s; uci commit gws_radio'
Get.cmd.gws.rxg = 'uci Get gws_radio.v1.rxgain=%s; uci commit gws_radio'
Get.cmd.gws.ch = 'uci Get gws_radio.v1.channel=%s; uci commit gws_radio'


Get.ops = {}

function Get.ops.gws()
	local _fmt = '{"gws":{"rgn": %d, "ch": %d, "rxg": %d, "txpwr": %d, "tpc": 0, "agc": 1 }}'
	local _gws = gws.ops.update()
	local _result = string.format(_fmt, _gws.rgn, _gws.ch, _gws.rxg, _gws.txpwr, _gws.tpc, _gws.agc)
	return _result
end

function Get.ops.nw(_item, _val)
	return _item .. _val
	--return Get.ops.exec(Get.cmd.nw)
end

function Get.ops.abb(_item, _val)
	if (_item == 'ssid') then
		Get.ops.exec(Get.cmd.abb.ssid, _val)
		return Get.ops.exec(Get.cmd.abb.reGet, '')
	else
		return _item .. '=' .. _val
	end
end

function Get.ops.sys(_item, _val)
	return _item .. _val
	--return Get.ops.exec(Get.cmd.sys)
end


return Get

