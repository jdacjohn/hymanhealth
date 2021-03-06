/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.sketch.Annotation"]) {
	dojo._hasResource["dojox.sketch.Annotation"] = true;
	dojo.provide("dojox.sketch.Annotation");
	dojo.require("dojox.sketch.Anchor");
	dojo.require("dojox.sketch._Plugin");
	(function () {
		var ta = dojox.sketch;
		dojo.declare("dojox.sketch.AnnotationTool", ta._Plugin, {onMouseDown:function (e) {
			this._omd = true;
		}, onMouseMove:function (e, rect) {
			if (!this._omd) {
				return;
			}
			if (this._cshape) {
				this._cshape.setShape(rect);
			} else {
				this._cshape = this.figure.surface.createRect(rect).setStroke({color:"#999", width:1, style:"ShortDot"}).setFill([255, 255, 255, 0.7]);
				this._cshape.getEventSource().setAttribute("shape-rendering", "crispEdges");
			}
		}, onMouseUp:function (e) {
			if (!this._omd) {
				return;
			}
			this._omd = false;
			var f = this.figure;
			if (this._cshape) {
				f.surface.remove(this._cshape);
				delete this._cshape;
			}
			if (!(f._startPoint.x == e.pageX && f._startPoint.y == e.pageY)) {
				var limit = 10;
				if (Math.max(limit, Math.abs(f._absEnd.x - f._start.x), Math.abs(f._absEnd.y - f._start.y)) > limit) {
					this._create(f._start, f._end);
				}
			}
		}, _create:function (start, end) {
			var f = this.figure;
			var _ = f.nextKey();
			var a = new (this.annotation)(f, _);
			a.transform = {dx:f._calCol(start.x / f.zoomFactor), dy:f._calCol(start.y / f.zoomFactor)};
			a.end = {x:f._calCol(end.x / f.zoomFactor), y:f._calCol(end.y / f.zoomFactor)};
			if (a.control) {
				a.control = {x:f._calCol((end.x / 2) / f.zoomFactor), y:f._calCol((end.y / 2) / f.zoomFactor)};
			}
			f.onBeforeCreateShape(a);
			a.initialize();
			f.select(a);
			f.onCreateShape(a);
			f.history.add(ta.CommandTypes.Create, a);
		}});
		ta.Annotation = function (figure, id) {
			this.id = this._key = id;
			this.figure = figure;
			this.mode = ta.Annotation.Modes.View;
			this.shape = null;
			this.boundingBox = null;
			this.hasAnchors = true;
			this.anchors = {};
			this._properties = {"stroke":{color:"blue", width:2}, "font":{family:"Arial", size:16, weight:"bold"}, "fill":"blue", "label":""};
			if (this.figure) {
				this.figure.add(this);
			}
		};
		var p = ta.Annotation.prototype;
		p.constructor = ta.Annotation;
		p.type = function () {
			return "";
		};
		p.getType = function () {
			return ta.Annotation;
		};
		p.onRemove = function (noundo) {
			this.figure.history.add(ta.CommandTypes.Delete, this, this.serialize());
		};
		p.property = function (name, value) {
			var r;
			name = name.toLowerCase();
			if (this._properties[name] !== undefined) {
				r = this._properties[name];
			}
			if (arguments.length > 1) {
				this._properties[name] = value;
				if (r != value) {
					this.onPropertyChange(name, r);
				}
			}
			return r;
		};
		p.onPropertyChange = function (name, oldvalue) {
		};
		p.onCreate = function () {
			this.figure.history.add(ta.CommandTypes.Create, this);
		};
		p.onDblClick = function (e) {
			var l = prompt("Set new text:", this.property("label"));
			if (l !== false) {
				this.beginEdit(ta.CommandTypes.Modify);
				this.property("label", l);
				this.draw();
				this.endEdit();
			}
		};
		p.initialize = function () {
		};
		p.destroy = function () {
		};
		p.draw = function () {
		};
		p.apply = function (obj) {
		};
		p.serialize = function () {
		};
		p.getBBox = function () {
		};
		p.beginEdit = function (type) {
			if (!this._type) {
				this._type = type || ta.CommandTypes.Move;
				this._prevState = this.serialize();
			}
		};
		p.endEdit = function () {
			if (this._prevState != this.serialize()) {
				this.figure.history.add(this._type, this, this._prevState);
			}
			this._type = this._prevState = "";
		};
		p.calculate = {slope:function (p1, p2) {
			if (!(p1.x - p2.x)) {
				return 0;
			}
			return ((p1.y - p2.y) / (p1.x - p2.x));
		}, dx:function (p1, p2, dy) {
			var s = this.slope(p1, p2);
			if (s == 0) {
				return s;
			}
			return dy / s;
		}, dy:function (p1, p2, dx) {
			return this.slope(p1, p2) * dx;
		}};
		p.drawBBox = function () {
			var r = this.getBBox();
			if (!this.boundingBox) {
				this.boundingBox = this.shape.createRect(r).moveToBack().setStroke({color:"#999", width:1, style:"Dash"}).setFill([238, 238, 238, 0.3]);
				this.boundingBox.getEventSource().setAttribute("id", this.id + "-boundingBox");
				this.boundingBox.getEventSource().setAttribute("shape-rendering", "crispEdges");
				this.figure._add(this);
			} else {
				this.boundingBox.setShape(r);
			}
		};
		p.setBinding = function (pt) {
			this.transform.dx += pt.dx;
			this.transform.dy += pt.dy;
			this.draw();
		};
		p.getTextBox = function (zoomfactor) {
			var fp = this.property("font");
			var f = {fontFamily:fp.family, fontSize:fp.size, fontWeight:fp.weight};
			if (zoomfactor) {
				f.fontSize = Math.floor(f.fontSize / zoomfactor);
			}
			return dojox.gfx._base._getTextBox(this.property("label"), f);
		};
		p.setMode = function (m) {
			if (this.mode == m) {
				return;
			}
			this.mode = m;
			var method = "disable";
			if (m == ta.Annotation.Modes.Edit) {
				method = "enable";
			}
			if (method == "enable") {
				this.drawBBox();
				this.figure._add(this);
			} else {
				if (this.boundingBox) {
					if (this.shape) {
						this.shape.remove(this.boundingBox);
					}
					this.boundingBox = null;
				}
			}
			for (var p in this.anchors) {
				this.anchors[p][method]();
			}
		};
		p.zoom = function (pct) {
			pct = pct || this.figure.zoomFactor;
			if (this.labelShape) {
				var f = dojo.clone(this.property("font"));
				f.size = Math.ceil(f.size / pct) + "px";
				this.labelShape.setFont(f);
			}
			for (var n in this.anchors) {
				this.anchors[n].zoom(pct);
			}
			if (dojox.gfx.renderer == "vml") {
				pct = 1;
			}
			if (this.pathShape) {
				var s = dojo.clone(this.property("stroke"));
				s.width = pct > 1 ? s.width : Math.ceil(s.width / pct) + "px";
				this.pathShape.setStroke(s);
			}
		};
		p.writeCommonAttrs = function () {
			return "id=\"" + this.id + "\" dojoxsketch:type=\"" + this.type() + "\"" + " transform=\"translate(" + this.transform.dx + "," + this.transform.dy + ")\"" + (this.data ? (" ><![CDATA[data:" + dojo.toJson(this.data) + "]]") : "");
		};
		p.readCommonAttrs = function (obj) {
			var i = 0, cs = obj.childNodes, c;
			while ((c = cs[i++])) {
				if (c.nodeType == 4) {
					if (c.nodeValue.substr(0, 11) == "properties:") {
						this._properties = dojo.fromJson(c.nodeValue.substr(11));
					} else {
						if (c.nodeValue.substr(0, 5) == "data:") {
							this.data = dojo.fromJson(c.nodeValue.substr(5));
						} else {
							console.error("unknown CDATA node in node ", obj);
						}
					}
				}
			}
			if (obj.getAttribute("transform")) {
				var t = obj.getAttribute("transform").replace("translate(", "");
				var pt = t.split(",");
				this.transform.dx = parseFloat(pt[0], 10);
				this.transform.dy = parseFloat(pt[1], 10);
			}
		};
		ta.Annotation.Modes = {View:0, Edit:1};
		ta.Annotation.register = function (name, toolclass) {
			var cls = ta[name + "Annotation"];
			ta.registerTool(name, function (p) {
				dojo.mixin(p, {shape:name, annotation:cls});
				return new (toolclass || ta.AnnotationTool)(p);
			});
		};
	})();
}

