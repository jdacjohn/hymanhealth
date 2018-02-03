/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.charting.axis2d.Default"]) {
	dojo._hasResource["dojox.charting.axis2d.Default"] = true;
	dojo.provide("dojox.charting.axis2d.Default");
	dojo.require("dojox.charting.axis2d.Invisible");
	dojo.require("dojox.charting.scaler.linear");
	dojo.require("dojox.charting.axis2d.common");
	dojo.require("dojo.colors");
	dojo.require("dojo.string");
	dojo.require("dojox.gfx");
	dojo.require("dojox.lang.functional");
	dojo.require("dojox.lang.utils");
	(function () {
		var dc = dojox.charting, du = dojox.lang.utils, g = dojox.gfx, lin = dc.scaler.linear, labelGap = 4, centerAnchorLimit = 45;
		dojo.declare("dojox.charting.axis2d.Default", dojox.charting.axis2d.Invisible, {defaultParams:{vertical:false, fixUpper:"none", fixLower:"none", natural:false, leftBottom:true, includeZero:false, fixed:true, majorLabels:true, minorTicks:true, minorLabels:true, microTicks:false, rotation:0, htmlLabels:true}, optionalParams:{min:0, max:1, from:0, to:1, majorTickStep:4, minorTickStep:2, microTickStep:1, labels:[], labelFunc:null, maxLabelSize:0, stroke:{}, majorTick:{}, minorTick:{}, microTick:{}, tick:{}, font:"", fontColor:""}, constructor:function (chart, kwArgs) {
			this.opt = dojo.delegate(this.defaultParams, kwArgs);
			du.updateWithPattern(this.opt, kwArgs, this.optionalParams);
		}, getOffsets:function () {
			var s = this.scaler, offsets = {l:0, r:0, t:0, b:0};
			if (!s) {
				return offsets;
			}
			var o = this.opt, labelWidth = 0, a, b, c, d, gl = dc.scaler.common.getNumericLabel, offset = 0, ma = s.major, mi = s.minor, ta = this.chart.theme.axis, taFont = o.font || (ta.majorTick && ta.majorTick.font) || (ta.tick && ta.tick.font), taMajorTick = this.chart.theme.getTick("major", o), taMinorTick = this.chart.theme.getTick("minor", o), size = taFont ? g.normalizedLength(g.splitFontString(taFont).size) : 0, rotation = o.rotation % 360, leftBottom = o.leftBottom, cosr = Math.abs(Math.cos(rotation * Math.PI / 180)), sinr = Math.abs(Math.sin(rotation * Math.PI / 180));
			if (rotation < 0) {
				rotation += 360;
			}
			if (size) {
				if (o.maxLabelSize) {
					labelWidth = o.maxLabelSize;
				} else {
					if (this.labels) {
						labelWidth = this._groupLabelWidth(this.labels, taFont);
					} else {
						labelWidth = this._groupLabelWidth([gl(ma.start, ma.prec, o), gl(ma.start + ma.count * ma.tick, ma.prec, o), gl(mi.start, mi.prec, o), gl(mi.start + mi.count * mi.tick, mi.prec, o)], taFont);
					}
				}
				if (this.vertical) {
					var side = leftBottom ? "l" : "r";
					switch (rotation) {
					  case 0:
					  case 180:
						offsets[side] = labelWidth;
						offsets.t = offsets.b = size / 2;
						break;
					  case 90:
					  case 270:
						offsets[side] = size;
						offsets.t = offsets.b = labelWidth / 2;
						break;
					  default:
						if (rotation <= centerAnchorLimit || (180 < rotation && rotation <= (180 + centerAnchorLimit))) {
							offsets[side] = size * sinr / 2 + labelWidth * cosr;
							offsets[leftBottom ? "t" : "b"] = size * cosr / 2 + labelWidth * sinr;
							offsets[leftBottom ? "b" : "t"] = size * cosr / 2;
						} else {
							if (rotation > (360 - centerAnchorLimit) || (180 > rotation && rotation > (180 - centerAnchorLimit))) {
								offsets[side] = size * sinr / 2 + labelWidth * cosr;
								offsets[leftBottom ? "b" : "t"] = size * cosr / 2 + labelWidth * sinr;
								offsets[leftBottom ? "t" : "b"] = size * cosr / 2;
							} else {
								if (rotation < 90 || (180 < rotation && rotation < 270)) {
									offsets[side] = size * sinr + labelWidth * cosr;
									offsets[leftBottom ? "t" : "b"] = size * cosr + labelWidth * sinr;
								} else {
									offsets[side] = size * sinr + labelWidth * cosr;
									offsets[leftBottom ? "b" : "t"] = size * cosr + labelWidth * sinr;
								}
							}
						}
						break;
					}
					offsets[side] += labelGap + Math.max(taMajorTick.length, taMinorTick.length);
				} else {
					var side = leftBottom ? "b" : "t";
					switch (rotation) {
					  case 0:
					  case 180:
						offsets[side] = size;
						offsets.l = offsets.r = labelWidth / 2;
						break;
					  case 90:
					  case 270:
						offsets[side] = labelWidth;
						offsets.l = offsets.r = size / 2;
						break;
					  default:
						if ((90 - centerAnchorLimit) <= rotation && rotation <= 90 || (270 - centerAnchorLimit) <= rotation && rotation <= 270) {
							offsets[side] = size * sinr / 2 + labelWidth * cosr;
							offsets[leftBottom ? "r" : "l"] = size * cosr / 2 + labelWidth * sinr;
							offsets[leftBottom ? "l" : "r"] = size * cosr / 2;
						} else {
							if (90 <= rotation && rotation <= (90 + centerAnchorLimit) || 270 <= rotation && rotation <= (270 + centerAnchorLimit)) {
								offsets[side] = size * sinr / 2 + labelWidth * cosr;
								offsets[leftBottom ? "l" : "r"] = size * cosr / 2 + labelWidth * sinr;
								offsets[leftBottom ? "r" : "l"] = size * cosr / 2;
							} else {
								if (rotation < centerAnchorLimit || (180 < rotation && rotation < (180 - centerAnchorLimit))) {
									offsets[side] = size * sinr + labelWidth * cosr;
									offsets[leftBottom ? "r" : "l"] = size * cosr + labelWidth * sinr;
								} else {
									offsets[side] = size * sinr + labelWidth * cosr;
									offsets[leftBottom ? "l" : "r"] = size * cosr + labelWidth * sinr;
								}
							}
						}
						break;
					}
					offsets[side] += labelGap + Math.max(taMajorTick.length, taMinorTick.length);
				}
			}
			if (labelWidth) {
				this._cachedLabelWidth = labelWidth;
			}
			return offsets;
		}, render:function (dim, offsets) {
			if (!this.dirty) {
				return this;
			}
			var o = this.opt, ta = this.chart.theme.axis, leftBottom = o.leftBottom, rotation = o.rotation % 360, start, stop, axisVector, tickVector, anchorOffset, labelOffset, labelAlign, taFont = o.font || (ta.majorTick && ta.majorTick.font) || (ta.tick && ta.tick.font), taFontColor = o.fontColor || (ta.majorTick && ta.majorTick.fontColor) || (ta.tick && ta.tick.fontColor) || "black", taMajorTick = this.chart.theme.getTick("major", o), taMinorTick = this.chart.theme.getTick("minor", o), taMicroTick = this.chart.theme.getTick("micro", o), tickSize = Math.max(taMajorTick.length, taMinorTick.length, taMicroTick.length), taStroke = "stroke" in o ? o.stroke : ta.stroke, size = taFont ? g.normalizedLength(g.splitFontString(taFont).size) : 0;
			if (rotation < 0) {
				rotation += 360;
			}
			if (this.vertical) {
				start = {y:dim.height - offsets.b};
				stop = {y:offsets.t};
				axisVector = {x:0, y:-1};
				labelOffset = {x:0, y:0};
				tickVector = {x:1, y:0};
				anchorOffset = {x:labelGap, y:0};
				switch (rotation) {
				  case 0:
					labelAlign = "end";
					labelOffset.y = size * 0.4;
					break;
				  case 90:
					labelAlign = "middle";
					labelOffset.x = -size;
					break;
				  case 180:
					labelAlign = "start";
					labelOffset.y = -size * 0.4;
					break;
				  case 270:
					labelAlign = "middle";
					break;
				  default:
					if (rotation < centerAnchorLimit) {
						labelAlign = "end";
						labelOffset.y = size * 0.4;
					} else {
						if (rotation < 90) {
							labelAlign = "end";
							labelOffset.y = size * 0.4;
						} else {
							if (rotation < (180 - centerAnchorLimit)) {
								labelAlign = "start";
							} else {
								if (rotation < (180 + centerAnchorLimit)) {
									labelAlign = "start";
									labelOffset.y = -size * 0.4;
								} else {
									if (rotation < 270) {
										labelAlign = "start";
										labelOffset.x = leftBottom ? 0 : size * 0.4;
									} else {
										if (rotation < (360 - centerAnchorLimit)) {
											labelAlign = "end";
											labelOffset.x = leftBottom ? 0 : size * 0.4;
										} else {
											labelAlign = "end";
											labelOffset.y = size * 0.4;
										}
									}
								}
							}
						}
					}
				}
				if (leftBottom) {
					start.x = stop.x = offsets.l;
					tickVector.x = -1;
					anchorOffset.x = -anchorOffset.x;
				} else {
					start.x = stop.x = dim.width - offsets.r;
					switch (labelAlign) {
					  case "start":
						labelAlign = "end";
						break;
					  case "end":
						labelAlign = "start";
						break;
					  case "middle":
						labelOffset.x += size;
						break;
					}
				}
			} else {
				start = {x:offsets.l};
				stop = {x:dim.width - offsets.r};
				axisVector = {x:1, y:0};
				labelOffset = {x:0, y:0};
				tickVector = {x:0, y:1};
				anchorOffset = {x:0, y:labelGap};
				switch (rotation) {
				  case 0:
					labelAlign = "middle";
					labelOffset.y = size;
					break;
				  case 90:
					labelAlign = "start";
					labelOffset.x = -size * 0.4;
					break;
				  case 180:
					labelAlign = "middle";
					break;
				  case 270:
					labelAlign = "end";
					labelOffset.x = size * 0.4;
					break;
				  default:
					if (rotation < (90 - centerAnchorLimit)) {
						labelAlign = "start";
						labelOffset.y = leftBottom ? size : 0;
					} else {
						if (rotation < (90 + centerAnchorLimit)) {
							labelAlign = "start";
							labelOffset.x = -size * 0.4;
						} else {
							if (rotation < 180) {
								labelAlign = "start";
								labelOffset.y = leftBottom ? 0 : -size;
							} else {
								if (rotation < (270 - centerAnchorLimit)) {
									labelAlign = "end";
									labelOffset.y = leftBottom ? 0 : -size;
								} else {
									if (rotation < (270 + centerAnchorLimit)) {
										labelAlign = "end";
										labelOffset.y = leftBottom ? size * 0.4 : 0;
									} else {
										labelAlign = "end";
										labelOffset.y = leftBottom ? size : 0;
									}
								}
							}
						}
					}
				}
				if (leftBottom) {
					start.y = stop.y = dim.height - offsets.b;
				} else {
					start.y = stop.y = offsets.t;
					tickVector.y = -1;
					anchorOffset.y = -anchorOffset.y;
					switch (labelAlign) {
					  case "start":
						labelAlign = "end";
						break;
					  case "end":
						labelAlign = "start";
						break;
					  case "middle":
						labelOffset.y -= size;
						break;
					}
				}
			}
			this.cleanGroup();
			try {
				var s = this.group, c = this.scaler, t = this.ticks, canLabel, f = lin.getTransformerFromModel(this.scaler), forceHtmlLabels = (dojox.gfx.renderer == "canvas"), labelType = forceHtmlLabels || !rotation && this.opt.htmlLabels && !dojo.isIE && !dojo.isOpera ? "html" : "gfx", dx = tickVector.x * taMajorTick.length, dy = tickVector.y * taMajorTick.length;
				s.createLine({x1:start.x, y1:start.y, x2:stop.x, y2:stop.y}).setStroke(taStroke);
				dojo.forEach(t.major, function (tick) {
					var offset = f(tick.value), elem, x = start.x + axisVector.x * offset, y = start.y + axisVector.y * offset;
					s.createLine({x1:x, y1:y, x2:x + dx, y2:y + dy}).setStroke(taMajorTick);
					if (tick.label) {
						elem = dc.axis2d.common.createText[labelType](this.chart, s, x + dx + anchorOffset.x + (rotation ? 0 : labelOffset.x), y + dy + anchorOffset.y + (rotation ? 0 : labelOffset.y), labelAlign, tick.label, taFont, taFontColor);
						if (labelType == "html") {
							this.htmlElements.push(elem);
						} else {
							if (rotation) {
								elem.setTransform([{dx:labelOffset.x, dy:labelOffset.y}, g.matrix.rotategAt(rotation, x + dx + anchorOffset.x, y + dy + anchorOffset.y)]);
							}
						}
					}
				}, this);
				dx = tickVector.x * taMinorTick.length;
				dy = tickVector.y * taMinorTick.length;
				canLabel = c.minMinorStep <= c.minor.tick * c.bounds.scale;
				dojo.forEach(t.minor, function (tick) {
					var offset = f(tick.value), elem, x = start.x + axisVector.x * offset, y = start.y + axisVector.y * offset;
					s.createLine({x1:x, y1:y, x2:x + dx, y2:y + dy}).setStroke(taMinorTick);
					if (canLabel && tick.label) {
						elem = dc.axis2d.common.createText[labelType](this.chart, s, x + dx + anchorOffset.x + (rotation ? 0 : labelOffset.x), y + dy + anchorOffset.y + (rotation ? 0 : labelOffset.y), labelAlign, tick.label, taFont, taFontColor);
						if (labelType == "html") {
							this.htmlElements.push(elem);
						} else {
							if (rotation) {
								elem.setTransform([{dx:labelOffset.x, dy:labelOffset.y}, g.matrix.rotategAt(rotation, x + dx + anchorOffset.x, y + dy + anchorOffset.y)]);
							}
						}
					}
				}, this);
				dx = tickVector.x * taMicroTick.length;
				dy = tickVector.y * taMicroTick.length;
				dojo.forEach(t.micro, function (tick) {
					var offset = f(tick.value), elem, x = start.x + axisVector.x * offset, y = start.y + axisVector.y * offset;
					s.createLine({x1:x, y1:y, x2:x + dx, y2:y + dy}).setStroke(taMicroTick);
				}, this);
			}
			catch (e) {
			}
			this.dirty = false;
			return this;
		}});
	})();
}

