/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.charting.plot2d.Candlesticks"]) {
	dojo._hasResource["dojox.charting.plot2d.Candlesticks"] = true;
	dojo.provide("dojox.charting.plot2d.Candlesticks");
	dojo.require("dojox.charting.plot2d.common");
	dojo.require("dojox.charting.plot2d.Base");
	dojo.require("dojox.lang.utils");
	dojo.require("dojox.lang.functional");
	dojo.require("dojox.lang.functional.reversed");
	(function () {
		var df = dojox.lang.functional, du = dojox.lang.utils, dc = dojox.charting.plot2d.common, purgeGroup = df.lambda("item.purgeGroup()");
		dojo.declare("dojox.charting.plot2d.Candlesticks", dojox.charting.plot2d.Base, {defaultParams:{hAxis:"x", vAxis:"y", gap:2, animate:null}, optionalParams:{minBarSize:1, maxBarSize:1, stroke:{}, outline:{}, shadow:{}, fill:{}, font:"", fontColor:""}, constructor:function (chart, kwArgs) {
			this.opt = dojo.clone(this.defaultParams);
			du.updateWithObject(this.opt, kwArgs);
			du.updateWithPattern(this.opt, kwArgs, this.optionalParams);
			this.series = [];
			this.hAxis = this.opt.hAxis;
			this.vAxis = this.opt.vAxis;
			this.animate = this.opt.animate;
		}, collectStats:function (series) {
			var stats = dojo.delegate(dc.defaultStats);
			for (var i = 0; i < series.length; i++) {
				var run = series[i];
				if (!run.data.length) {
					continue;
				}
				var old_vmin = stats.vmin, old_vmax = stats.vmax;
				if (!("ymin" in run) || !("ymax" in run)) {
					dojo.forEach(run.data, function (val, idx) {
						if (val !== null) {
							var x = val.x || idx + 1;
							stats.hmin = Math.min(stats.hmin, x);
							stats.hmax = Math.max(stats.hmax, x);
							stats.vmin = Math.min(stats.vmin, val.open, val.close, val.high, val.low);
							stats.vmax = Math.max(stats.vmax, val.open, val.close, val.high, val.low);
						}
					});
				}
				if ("ymin" in run) {
					stats.vmin = Math.min(old_vmin, run.ymin);
				}
				if ("ymax" in run) {
					stats.vmax = Math.max(old_vmax, run.ymax);
				}
			}
			return stats;
		}, getSeriesStats:function () {
			var stats = this.collectStats(this.series);
			stats.hmin -= 0.5;
			stats.hmax += 0.5;
			return stats;
		}, render:function (dim, offsets) {
			if (this.zoom && !this.isDataDirty()) {
				return this.performZoom(dim, offsets);
			}
			this.resetEvents();
			this.dirty = this.isDirty();
			if (this.dirty) {
				dojo.forEach(this.series, purgeGroup);
				this._eventSeries = {};
				this.cleanGroup();
				var s = this.group;
				df.forEachRev(this.series, function (item) {
					item.cleanGroup(s);
				});
			}
			var t = this.chart.theme, f, gap, width, ht = this._hScaler.scaler.getTransformerFromModel(this._hScaler), vt = this._vScaler.scaler.getTransformerFromModel(this._vScaler), baseline = Math.max(0, this._vScaler.bounds.lower), baselineHeight = vt(baseline), events = this.events();
			f = dc.calculateBarSize(this._hScaler.bounds.scale, this.opt);
			gap = f.gap;
			width = f.size;
			for (var i = this.series.length - 1; i >= 0; --i) {
				var run = this.series[i];
				if (!this.dirty && !run.dirty) {
					t.skip();
					this._reconnectEvents(run.name);
					continue;
				}
				run.cleanGroup();
				var theme = t.next("candlestick", [this.opt, run]), s = run.group, eventSeries = new Array(run.data.length);
				for (var j = 0; j < run.data.length; ++j) {
					var v = run.data[j];
					if (v !== null) {
						var finalTheme = t.addMixin(theme, "candlestick", v, true);
						var x = ht(v.x || (j + 0.5)) + offsets.l + gap, y = dim.height - offsets.b, open = vt(v.open), close = vt(v.close), high = vt(v.high), low = vt(v.low);
						if ("mid" in v) {
							var mid = vt(v.mid);
						}
						if (low > high) {
							var tmp = high;
							high = low;
							low = tmp;
						}
						if (width >= 1) {
							var doFill = open > close;
							var line = {x1:width / 2, x2:width / 2, y1:y - high, y2:y - low}, rect = {x:0, y:y - Math.max(open, close), width:width, height:Math.max(doFill ? open - close : close - open, 1)};
							shape = s.createGroup();
							shape.setTransform({dx:x, dy:0});
							var inner = shape.createGroup();
							inner.createLine(line).setStroke(finalTheme.series.stroke);
							inner.createRect(rect).setStroke(finalTheme.series.stroke).setFill(doFill ? finalTheme.series.fill : "white");
							if ("mid" in v) {
								inner.createLine({x1:(finalTheme.series.stroke.width || 1), x2:width - (finalTheme.series.stroke.width || 1), y1:y - mid, y2:y - mid}).setStroke(doFill ? "white" : finalTheme.series.stroke);
							}
							run.dyn.fill = finalTheme.series.fill;
							run.dyn.stroke = finalTheme.series.stroke;
							if (events) {
								var o = {element:"candlestick", index:j, run:run, shape:inner, x:x, y:y - Math.max(open, close), cx:width / 2, cy:(y - Math.max(open, close)) + (Math.max(doFill ? open - close : close - open, 1) / 2), width:width, height:Math.max(doFill ? open - close : close - open, 1), data:v};
								this._connectEvents(o);
								eventSeries[j] = o;
							}
						}
						if (this.animate) {
							this._animateCandlesticks(shape, y - low, high - low);
						}
					}
				}
				this._eventSeries[run.name] = eventSeries;
				run.dirty = false;
			}
			this.dirty = false;
			return this;
		}, _animateCandlesticks:function (shape, voffset, vsize) {
			dojox.gfx.fx.animateTransform(dojo.delegate({shape:shape, duration:1200, transform:[{name:"translate", start:[0, voffset - (voffset / vsize)], end:[0, 0]}, {name:"scale", start:[1, 1 / vsize], end:[1, 1]}, {name:"original"}]}, this.animate)).play();
		}});
	})();
}

