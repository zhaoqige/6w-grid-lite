-- GWS Controller
-- by Qige
-- 2017.02.23
-- 2017.03.04

require 'grid.base.conf'
require 'grid.base.cmd'
require 'grid.base.fmt'


GWS = {}

GWS.conf = {}
GWS.conf.file = conf.default.file
GWS.conf.platform = conf.uci.get(GWS.conf.file, 'v1', 'radio') or 'gws5k'


-- GWS3000
GWS.gws3k = {}
GWS.gws3k.cmd = {}
GWS.gws3k.cmd.rfinfo = 'rfinfo | grep [0-9\.\-] -o'
GWS.gws3k.cmd.note = ''

function GWS.gws3k.update()
	local _gws = {}
	
	_gws.rgn = -1
	_gws.ch = -1
	_gws.chbw = -1
	_gws.txpwr = -99
	_gws.rxg = -99
	_gws.tpc = -1
	_gws.agc = -1
	_gws.note = '30.00 degree'

	return _gws
end

-- GWS4000
GWS.gws4k = {}
GWS.gws4k.cmd = {}
GWS.gws4k.cmd.region = 'getregion'
GWS.gws4k.cmd.channel = 'getchan'
GWS.gws4k.cmd.chanbw = 'getchanbw'
GWS.gws4k.cmd.txpwr = 'gettxpwr | grep "^Tx" -m1 | grep [0-9\.\-]* -o'
GWS.gws4k.cmd.rxgain = ''
GWS.gws4k.cmd.tpc = 'ps | grep -v grep | grep tpc'
GWS.gws4k.cmd.agc = ''
GWS.gws4k.cmd.note = 'gettemp | tr -d "\n"'

function GWS.gws4k.update()
	local _gws = {}
	
	_gws.rgn = cmd.exec(GWS.gws4k.cmd.region) or -1
	_gws.ch = cmd.exec(GWS.gws4k.cmd.channel) or -1
	_gws.chbw = cmd.exec(GWS.gws4k.cmd.chanbw) or -1
	_gws.txpwr = cmd.exec(GWS.gws4k.cmd.txpwr) or -1
	_gws.rxg = -99
	_gws.tpc = -1
	_gws.agc = -1
	_gws.note = cmd.exec(GWS.gws4k.cmd.note) or ''

	return _gws
end


-- GWS5000
GWS.gws5k = {}
GWS.gws5k.cmd = {}
GWS.gws5k.cmd.rfinfo = 'gws > /tmp/.grid_cache_rfinfo'
GWS.gws5k.cmd.wait = 'sleep 1'
GWS.gws5k.cmd.region = 'cat /tmp/.grid_cache_rfinfo | grep Region -m1 | grep [0-9]* -o'
GWS.gws5k.cmd.channel = 'cat /tmp/.grid_cache_rfinfo | grep Chan -m1 | grep [0-9]* -o'
GWS.gws5k.cmd.txpwr = 'cat /tmp/.grid_cache_rfinfo | grep Power -m1 | awk \'{print $2}\''
GWS.gws5k.cmd.chbw = 'getchanbw | grep [0-9]* -o'

--GWS.gws5k.cmd.note = 'gettemp | awk \'{print $2}\''
GWS.gws5k.cmd.note = 'cat /tmp/.grid_cache_rfinfo'

function GWS.gws5k.update()
	local _gws = {}
	
	-- cat rfinfo into temp file
	cmd.exec(GWS.gws5k.cmd.rfinfo)

	--cmd.exec(GWS.gws5k.cmd.wait)

	_gws.rgn = cmd.exec(GWS.gws5k.cmd.region) or -1
	_gws.ch = cmd.exec(GWS.gws5k.cmd.channel) or -1
	_gws.chbw = -1
	_gws.txpwr = cmd.exec(GWS.gws5k.cmd.txpwr) or -1
	_gws.rxg = -1
	_gws.tpc = -1
	_gws.agc = -1
	_gws.note = cmd.exec(GWS.gws5k.cmd.note) or ''

	return _gws
end



GWS.ops = {}
function GWS.ops.Update()
	local _result
	local _fmt = '{"rgn": %d, "ch": %d, "bw": %d, '
		.. '"rxg": %d, "txpwr": %d, "tpc": %d, "agc": %d, "note": "%s" }'

	local _gws = GWS.ops.read()
	_result = string.format(_fmt, _gws.rgn or -1, _gws.ch or -1, _gws.chbw or -1, 
		_gws.rxg or 0, _gws.txpwr or 0, _gws.tpc or -1, _gws.agc or -1, _gws.note or '')

	return _result
end

function GWS.ops.read()
	local _gws = {}
	
	local _platform = GWS.conf.platform

	if (_platform == 'gws3k') then
		_gws = GWS.gws3k.update()
	elseif (_platform == 'gws4k') then
		_gws = GWS.gws4k.update()
	--elseif (_platform == 'gws5k') then
	else
		_gws = GWS.gws5k.update()
	end

	return _gws
end


return GWS