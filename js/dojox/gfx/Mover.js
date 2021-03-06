/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.gfx.Mover"]) {
	dojo._hasResource["dojox.gfx.Mover"] = true;
	dojo.provide("dojox.gfx.Mover");
	dojo.declare("dojox.gfx.Mover", null, {constructor:function (shape, e, host) {
		this.shape = shape;
		this.lastX = e.clientX;
		this.lastY = e.clientY;
		var h = this.host = host, d = document, firstEvent = dojo.connect(d, "onmousemove", this, "onFirstMove");
		this.events = [dojo.connect(d, "onmousemove", this, "onMouseMove"), dojo.connect(d, "onmouseup", this, "destroy"), dojo.connect(d, "ondragstart", dojo, "stopEvent"), dojo.connect(d, "onselectstart", dojo, "stopEvent"), firstEvent];
		if (h && h.onMoveStart) {
			h.onMoveStart(this);
		}
	}, onMouseMove:function (e) {
		var x = e.clientX;
		var y = e.clientY;
		this.host.onMove(this, {dx:x - this.lastX, dy:y - this.lastY});
		this.lastX = x;
		this.lastY = y;
		dojo.stopEvent(e);
	}, onFirstMove:function () {
		this.host.onFirstMove(this);
		dojo.disconnect(this.events.pop());
	}, destroy:function () {
		dojo.forEach(this.events, dojo.disconnect);
		var h = this.host;
		if (h && h.onMoveStop) {
			h.onMoveStop(this);
		}
		this.events = this.shape = null;
	}});
}

