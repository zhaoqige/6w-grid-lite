-- GWS Controller
-- by Qige
-- 2017.02.23

gws = {}

gws.ops = {}
function gws.ops.update()
	local _gws = {}
	
	_gws.rgn = 1
	_gws.ch = 21
	_gws.txpwr = 21
	_gws.rxg = 10
	_gws.tpc = 0
	_gws.agc = 1
	
	return _gws
end

return gws