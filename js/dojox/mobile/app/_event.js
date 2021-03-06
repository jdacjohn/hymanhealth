/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.mobile.app._event"]) {
	dojo._hasResource["dojox.mobile.app._event"] = true;
	dojo.provide("dojox.mobile.app._event");
	dojo.experimental("dojox.mobile.app._event.js");
	dojo.mixin(dojox.mobile.app, {eventMap:{}, connectFlick:function (target, context, method) {
		var startX;
		var startY;
		var isFlick = false;
		var currentX;
		var currentY;
		var connMove;
		var connUp;
		var direction;
		var time;
		var connDown = dojo.connect("onmousedown", target, function (event) {
			isFlick = false;
			startX = event.targetTouches ? event.targetTouches[0].clientX : event.clientX;
			startY = event.targetTouches ? event.targetTouches[0].clientY : event.clientY;
			time = (new Date()).getTime();
			connMove = dojo.connect(target, "onmousemove", onMove);
			connUp = dojo.connect(target, "onmouseup", onUp);
		});
		var onMove = function (event) {
			dojo.stopEvent(event);
			currentX = event.targetTouches ? event.targetTouches[0].clientX : event.clientX;
			currentY = event.targetTouches ? event.targetTouches[0].clientY : event.clientY;
			if (Math.abs(Math.abs(currentX) - Math.abs(startX)) > 15) {
				isFlick = true;
				direction = (currentX > startX) ? "ltr" : "rtl";
			} else {
				if (Math.abs(Math.abs(currentY) - Math.abs(startY)) > 15) {
					isFlick = true;
					direction = (currentY > startY) ? "ttb" : "btt";
				}
			}
		};
		var onUp = function (event) {
			dojo.stopEvent(event);
			connMove && dojo.disconnect(connMove);
			connUp && dojo.disconnect(connUp);
			if (isFlick) {
				var flickEvt = {target:target, direction:direction, duration:(new Date()).getTime() - time};
				if (context && method) {
					context[method](flickEvt);
				} else {
					method(flickEvt);
				}
			}
		};
	}});
	dojox.mobile.app.isIPhone = (dojo.isSafari && (navigator.userAgent.indexOf("iPhone") > -1 || navigator.userAgent.indexOf("iPod") > -1));
	dojox.mobile.app.isWebOS = (navigator.userAgent.indexOf("webOS") > -1);
	if (dojox.mobile.app.isIPhone) {
		dojox.mobile.app.eventMap = {onmousedown:"ontouchstart", mousedown:"ontouchstart", onmouseup:"ontouchend", mouseup:"ontouchend", onmousemove:"ontouchmove", mousemove:"ontouchmove"};
	}
	dojo._oldConnect = dojo._connect;
	dojo._connect = function (obj, event, context, method, dontFix) {
		event = dojox.mobile.app.eventMap[event] || event;
		if (event == "flick" || event == "onflick") {
			if (window["Mojo"]) {
				event = Mojo.Event.flick;
			} else {
				return dojox.mobile.app.connectFlick(obj, context, method);
			}
		}
		return dojo._oldConnect(obj, event, context, method, dontFix);
	};
}

