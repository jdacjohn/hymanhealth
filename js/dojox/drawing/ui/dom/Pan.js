/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.drawing.ui.dom.Pan"]) {
	dojo._hasResource["dojox.drawing.ui.dom.Pan"] = true;
	dojo.provide("dojox.drawing.ui.dom.Pan");
	dojo.require("dojox.drawing.plugins._Plugin");
	dojo.deprecated("dojox.drawing.ui.dom.Pan", "It may not even make it to the 1.4 release.", 1.4);
	dojox.drawing.ui.dom.Pan = dojox.drawing.util.oo.declare(dojox.drawing.plugins._Plugin, function (options) {
		this.domNode = options.node;
		var _scrollTimeout;
		dojo.connect(this.domNode, "click", this, "onSetPan");
		dojo.connect(this.keys, "onKeyUp", this, "onKeyUp");
		dojo.connect(this.keys, "onKeyDown", this, "onKeyDown");
		dojo.connect(this.anchors, "onAnchorUp", this, "checkBounds");
		dojo.connect(this.stencils, "register", this, "checkBounds");
		dojo.connect(this.canvas, "resize", this, "checkBounds");
		dojo.connect(this.canvas, "setZoom", this, "checkBounds");
		dojo.connect(this.canvas, "onScroll", this, function () {
			if (this._blockScroll) {
				this._blockScroll = false;
				return;
			}
			_scrollTimeout && clearTimeout(_scrollTimeout);
			_scrollTimeout = setTimeout(dojo.hitch(this, "checkBounds"), 200);
		});
		this._mouseHandle = this.mouse.register(this);
	}, {selected:false, type:"dojox.drawing.ui.dom.Pan", onKeyUp:function (evt) {
		if (evt.keyCode == 32) {
			this.onSetPan(false);
		}
	}, onKeyDown:function (evt) {
		if (evt.keyCode == 32) {
			this.onSetPan(true);
		}
	}, onSetPan:function (bool) {
		if (bool === true || bool === false) {
			this.selected = !bool;
		}
		if (this.selected) {
			this.selected = false;
			dojo.removeClass(this.domNode, "selected");
		} else {
			this.selected = true;
			dojo.addClass(this.domNode, "selected");
		}
		this.mouse.setEventMode(this.selected ? "pan" : "");
	}, onPanDrag:function (obj) {
		var x = obj.x - obj.last.x;
		var y = obj.y - obj.last.y;
		this.canvas.domNode.parentNode.scrollTop -= obj.move.y;
		this.canvas.domNode.parentNode.scrollLeft -= obj.move.x;
		this.canvas.onScroll();
	}, onStencilUp:function (obj) {
		this.checkBounds();
	}, onStencilDrag:function (obj) {
	}, checkBounds:function () {
		var log = function () {
		};
		var warn = function () {
		};
		var t = Infinity, r = -Infinity, b = -Infinity, l = Infinity, sx = 0, sy = 0, dy = 0, dx = 0, mx = this.stencils.group ? this.stencils.group.getTransform() : {dx:0, dy:0}, sc = this.mouse.scrollOffset(), scY = sc.left ? 10 : 0, scX = sc.top ? 10 : 0, ch = this.canvas.height, cw = this.canvas.width, z = this.canvas.zoom, pch = this.canvas.parentHeight, pcw = this.canvas.parentWidth;
		this.stencils.withSelected(function (m) {
			var o = m.getBounds();
			warn("SEL BOUNDS:", o);
			t = Math.min(o.y1 + mx.dy, t);
			r = Math.max(o.x2 + mx.dx, r);
			b = Math.max(o.y2 + mx.dy, b);
			l = Math.min(o.x1 + mx.dx, l);
		});
		this.stencils.withUnselected(function (m) {
			var o = m.getBounds();
			warn("UN BOUNDS:", o);
			t = Math.min(o.y1, t);
			r = Math.max(o.x2, r);
			b = Math.max(o.y2, b);
			l = Math.min(o.x1, l);
		});
		b *= z;
		var xscroll = 0, yscroll = 0;
		log("Bottom test", "b:", b, "z:", z, "ch:", ch, "pch:", pch, "top:", sc.top, "sy:", sy);
		if (b > pch || sc.top) {
			log("*bottom scroll*");
			ch = Math.max(b, pch + sc.top);
			sy = sc.top;
			xscroll += this.canvas.getScrollWidth();
		} else {
			if (!sy && ch > pch) {
				log("*bottom remove*");
				ch = pch;
			}
		}
		r *= z;
		if (r > pcw || sc.left) {
			cw = Math.max(r, pcw + sc.left);
			sx = sc.left;
			yscroll += this.canvas.getScrollWidth();
		} else {
			if (!sx && cw > pcw) {
				cw = pcw;
			}
		}
		cw += xscroll * 2;
		ch += yscroll * 2;
		this._blockScroll = true;
		this.stencils.group && this.stencils.group.applyTransform({dx:dx, dy:dy});
		this.stencils.withUnselected(function (m) {
			m.transformPoints({dx:dx, dy:dy});
		});
		this.canvas.setDimensions(cw, ch, sx, sy);
	}});
	dojox.drawing.ui.dom.Pan.setup = {name:"dojox.drawing.ui.dom.Pan", tooltip:"Pan Tool", iconClass:"iconPan"};
	dojox.drawing.register(dojox.drawing.ui.dom.Pan.setup, "plugin");
}

