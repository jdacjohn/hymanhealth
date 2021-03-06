/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.analytics._base"]) {
	dojo._hasResource["dojox.analytics._base"] = true;
	dojo.provide("dojox.analytics._base");
	dojox.analytics = function () {
		this._data = [];
		this._id = 1;
		this.sendInterval = dojo.config["sendInterval"] || 5000;
		this.inTransitRetry = dojo.config["inTransitRetry"] || 200;
		this.dataUrl = dojo.config["analyticsUrl"] || dojo.moduleUrl("dojox.analytics.logger", "dojoxAnalytics.php");
		this.sendMethod = dojo.config["sendMethod"] || "xhrPost";
		this.maxRequestSize = dojo.isIE ? 2000 : dojo.config["maxRequestSize"] || 4000;
		dojo.addOnLoad(this, "schedulePusher");
		dojo.addOnUnload(this, "pushData", true);
	};
	dojo.extend(dojox.analytics, {schedulePusher:function (interval) {
		setTimeout(dojo.hitch(this, "checkData"), interval || this.sendInterval);
	}, addData:function (dataType, data) {
		if (arguments.length > 2) {
			var c = [];
			for (var i = 1; i < arguments.length; i++) {
				c.push(arguments[i]);
			}
			data = c;
		}
		this._data.push({plugin:dataType, data:data});
	}, checkData:function () {
		if (this._inTransit) {
			this.schedulePusher(this.inTransitRetry);
			return;
		}
		if (this.pushData()) {
			return;
		}
		this.schedulePusher();
	}, pushData:function () {
		if (this._data.length) {
			this._inTransit = this._data;
			this._data = [];
			var def;
			switch (this.sendMethod) {
			  case "script":
				def = dojo.io.script.get({url:this.getQueryPacket(), preventCache:1, callbackParamName:"callback"});
				break;
			  case "xhrPost":
			  default:
				def = dojo.xhrPost({url:this.dataUrl, content:{id:this._id++, data:dojo.toJson(this._inTransit)}});
				break;
			}
			def.addCallback(this, "onPushComplete");
			return def;
		}
		return false;
	}, getQueryPacket:function () {
		while (true) {
			var content = {id:this._id++, data:dojo.toJson(this._inTransit)};
			var query = this.dataUrl + "?" + dojo.objectToQuery(content);
			if (query.length > this.maxRequestSize) {
				this._data.unshift(this._inTransit.pop());
				this._split = 1;
			} else {
				return query;
			}
		}
	}, onPushComplete:function (results) {
		if (this._inTransit) {
			delete this._inTransit;
		}
		if (this._data.length > 0) {
			this.schedulePusher(this.inTransitRetry);
		} else {
			this.schedulePusher();
		}
	}});
	dojox.analytics = new dojox.analytics();
}

