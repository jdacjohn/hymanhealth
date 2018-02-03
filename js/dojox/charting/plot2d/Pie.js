/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.charting.plot2d.Pie"]) {
	dojo._hasResource["dojox.charting.plot2d.Pie"] = true;
	dojo.provide("dojox.charting.plot2d.Pie");
	dojo.require("dojox.charting.Element");
	dojo.require("dojox.charting.axis2d.common");
	dojo.require("dojox.charting.plot2d.common");
	dojo.require("dojox.charting.plot2d._PlotEvents");
	dojo.require("dojox.lang.functional");
	dojo.require("dojox.lang.utils");
	dojo.require("dojox.gfx");
	dojo.require("dojo.number");
	(function () {
		var df = dojox.lang.functional, du = dojox.lang.utils, dc = dojox.charting.plot2d.common, da = dojox.charting.axis2d.common, g = dojox.gfx, m = g.matrix, FUDGE_FACTOR = 0.2;
		dojo.declare("dojox.charting.plot2d.Pie", [dojox.charting.Element, dojox.charting.plot2d._PlotEvents], {defaultParams:{labels:true, ticks:false, fixed:true, precision:1, labelOffset:20, labelStyle:"default", htmlLabels:true, radGrad:"native", fanSize:5, startAngle:0}, optionalParams:{radius:0, stroke:{}, outline:{}, shadow:{}, fill:{}, font:"", fontColor:""}, constructor:function (chart, kwArgs) {
			this.opt = dojo.clone(this.defaultParams);
			du.updateWithObject(this.opt, kwArgs);
			du.updateWithPattern(this.opt, kwArgs, this.optionalParams);
			this.run = null;
			this.dyn = [];
		}, clear:function () {
			this.dirty = true;
			this.dyn = [];
			this.run = null;
			return this;
		}, setAxis:function (axis) {
			return this;
		}, addSeries:function (run) {
			this.run = run;
			return this;
		}, getSeriesStats:function () {
			return dojo.delegate(dc.defaultStats);
		}, initializeScalers:function () {
			return this;
		}, getRequiredColors:function () {
			return this.run ? this.run.data.length : 0;
		}, render:function (dim, offsets) {
			if (!this.dirty) {
				return this;
			}
			this.resetEvents();
			this.dirty = false;
			this._eventSeries = {};
			this.cleanGroup();
			var s = this.group, t = this.chart.theme;
			if (!this.run || !this.run.data.length) {
				return this;
			}
			var rx = (dim.width - offsets.l - offsets.r) / 2, ry = (dim.height - offsets.t - offsets.b) / 2, r = Math.min(rx, ry), taFont = "font" in this.opt ? this.opt.font : t.axis.font, size = taFont ? g.normalizedLength(g.splitFontString(taFont).size) : 0, taFontColor = "fontColor" in this.opt ? this.opt.fontColor : t.axis.fontColor, startAngle = m._degToRad(this.opt.startAngle), start = startAngle, step, filteredRun, slices, labels, shift, labelR, run = this.run.data, events = this.events();
			if (typeof run[0] == "number") {
				filteredRun = df.map(run, "x ? Math.max(x, 0) : 0");
				if (df.every(filteredRun, "<= 0")) {
					return this;
				}
				slices = df.map(filteredRun, "/this", df.foldl(filteredRun, "+", 0));
				if (this.opt.labels) {
					labels = dojo.map(slices, function (x) {
						return x > 0 ? this._getLabel(x * 100) + "%" : "";
					}, this);
				}
			} else {
				filteredRun = df.map(run, "x ? Math.max(x.y, 0) : 0");
				if (df.every(filteredRun, "<= 0")) {
					return this;
				}
				slices = df.map(filteredRun, "/this", df.foldl(filteredRun, "+", 0));
				if (this.opt.labels) {
					labels = dojo.map(slices, function (x, i) {
						if (x <= 0) {
							return "";
						}
						var v = run[i];
						return "text" in v ? v.text : this._getLabel(x * 100) + "%";
					}, this);
				}
			}
			var themes = df.map(run, function (v, i) {
				if (v === null || typeof v == "number") {
					return t.next("slice", [this.opt, this.run], true);
				}
				return t.next("slice", [this.opt, this.run, v], true);
			}, this);
			if (this.opt.labels) {
				shift = df.foldl1(df.map(labels, function (label, i) {
					var font = themes[i].series.font;
					return dojox.gfx._base._getTextBox(label, {font:font}).w;
				}, this), "Math.max(a, b)") / 2;
				if (this.opt.labelOffset < 0) {
					r = Math.min(rx - 2 * shift, ry - size) + this.opt.labelOffset;
				}
				labelR = r - this.opt.labelOffset;
			}
			if ("radius" in this.opt) {
				r = this.opt.radius;
				labelR = r - this.opt.labelOffset;
			}
			var circle = {cx:offsets.l + rx, cy:offsets.t + ry, r:r};
			this.dyn = [];
			var eventSeries = new Array(slices.length);
			dojo.some(slices, function (slice, i) {
				if (slice <= 0) {
					return false;
				}
				var v = run[i], theme = themes[i], specialFill;
				if (slice >= 1) {
					specialFill = this._plotFill(theme.series.fill, dim, offsets);
					specialFill = this._shapeFill(specialFill, {x:circle.cx - circle.r, y:circle.cy - circle.r, width:2 * circle.r, height:2 * circle.r});
					specialFill = this._pseudoRadialFill(specialFill, {x:circle.cx, y:circle.cy}, circle.r);
					var shape = s.createCircle(circle).setFill(specialFill).setStroke(theme.series.stroke);
					this.dyn.push({fill:specialFill, stroke:theme.series.stroke});
					if (events) {
						var o = {element:"slice", index:i, run:this.run, shape:shape, x:i, y:typeof v == "number" ? v : v.y, cx:circle.cx, cy:circle.cy, cr:r};
						this._connectEvents(o);
						eventSeries[i] = o;
					}
					return true;
				}
				var end = start + slice * 2 * Math.PI;
				if (i + 1 == slices.length) {
					end = startAngle + 2 * Math.PI;
				}
				var step = end - start, x1 = circle.cx + r * Math.cos(start), y1 = circle.cy + r * Math.sin(start), x2 = circle.cx + r * Math.cos(end), y2 = circle.cy + r * Math.sin(end);
				var fanSize = m._degToRad(this.opt.fanSize);
				if (theme.series.fill && theme.series.fill.type === "radial" && this.opt.radGrad === "fan" && step > fanSize) {
					var group = s.createGroup(), nfans = Math.ceil(step / fanSize), delta = step / nfans;
					specialFill = this._shapeFill(theme.series.fill, {x:circle.cx - circle.r, y:circle.cy - circle.r, width:2 * circle.r, height:2 * circle.r});
					for (var j = 0; j < nfans; ++j) {
						var fansx = j == 0 ? x1 : circle.cx + r * Math.cos(start + (j - FUDGE_FACTOR) * delta), fansy = j == 0 ? y1 : circle.cy + r * Math.sin(start + (j - FUDGE_FACTOR) * delta), fanex = j == nfans - 1 ? x2 : circle.cx + r * Math.cos(start + (j + 1 + FUDGE_FACTOR) * delta), faney = j == nfans - 1 ? y2 : circle.cy + r * Math.sin(start + (j + 1 + FUDGE_FACTOR) * delta), fan = group.createPath({}).moveTo(circle.cx, circle.cy).lineTo(fansx, fansy).arcTo(r, r, 0, delta > Math.PI, true, fanex, faney).lineTo(circle.cx, circle.cy).closePath().setFill(this._pseudoRadialFill(specialFill, {x:circle.cx, y:circle.cy}, r, start + (j + 0.5) * delta, start + (j + 0.5) * delta));
					}
					group.createPath({}).moveTo(circle.cx, circle.cy).lineTo(x1, y1).arcTo(r, r, 0, step > Math.PI, true, x2, y2).lineTo(circle.cx, circle.cy).closePath().setStroke(theme.series.stroke);
					shape = group;
				} else {
					shape = s.createPath({}).moveTo(circle.cx, circle.cy).lineTo(x1, y1).arcTo(r, r, 0, step > Math.PI, true, x2, y2).lineTo(circle.cx, circle.cy).closePath().setStroke(theme.series.stroke);
					var specialFill = theme.series.fill;
					if (specialFill && specialFill.type === "radial") {
						specialFill = this._shapeFill(specialFill, {x:circle.cx - circle.r, y:circle.cy - circle.r, width:2 * circle.r, height:2 * circle.r});
						if (this.opt.radGrad === "linear") {
							specialFill = this._pseudoRadialFill(specialFill, {x:circle.cx, y:circle.cy}, r, start, end);
						}
					} else {
						if (specialFill && specialFill.type === "linear") {
							specialFill = this._plotFill(specialFill, dim, offsets);
							specialFill = this._shapeFill(specialFill, shape.getBoundingBox());
						}
					}
					shape.setFill(specialFill);
				}
				this.dyn.push({fill:specialFill, stroke:theme.series.stroke});
				if (events) {
					var o = {element:"slice", index:i, run:this.run, shape:shape, x:i, y:typeof v == "number" ? v : v.y, cx:circle.cx, cy:circle.cy, cr:r};
					this._connectEvents(o);
					eventSeries[i] = o;
				}
				start = end;
				return false;
			}, this);
			if (this.opt.labels) {
				start = startAngle;
				dojo.some(slices, function (slice, i) {
					if (slice <= 0) {
						return false;
					}
					var theme = themes[i];
					if (slice >= 1) {
						var v = run[i], elem = da.createText[this.opt.htmlLabels && dojox.gfx.renderer != "vml" ? "html" : "gfx"](this.chart, s, circle.cx, circle.cy + size / 2, "middle", labels[i], theme.series.font, theme.series.fontColor);
						if (this.opt.htmlLabels) {
							this.htmlElements.push(elem);
						}
						return true;
					}
					var end = start + slice * 2 * Math.PI, v = run[i];
					if (i + 1 == slices.length) {
						end = startAngle + 2 * Math.PI;
					}
					var labelAngle = (start + end) / 2, x = circle.cx + labelR * Math.cos(labelAngle), y = circle.cy + labelR * Math.sin(labelAngle) + size / 2;
					var elem = da.createText[this.opt.htmlLabels && dojox.gfx.renderer != "vml" ? "html" : "gfx"](this.chart, s, x, y, "middle", labels[i], theme.series.font, theme.series.fontColor);
					if (this.opt.htmlLabels) {
						this.htmlElements.push(elem);
					}
					start = end;
					return false;
				}, this);
			}
			var esi = 0;
			this._eventSeries[this.run.name] = df.map(run, function (v) {
				return v <= 0 ? null : eventSeries[esi++];
			});
			return this;
		}, _getLabel:function (number) {
			return this.opt.fixed ? dojo.number.format(number, {places:this.opt.precision}) : number.toString();
		}});
	})();
}

