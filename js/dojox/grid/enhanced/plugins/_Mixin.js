/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.grid.enhanced.plugins._Mixin"]) {
	dojo._hasResource["dojox.grid.enhanced.plugins._Mixin"] = true;
	dojo.provide("dojox.grid.enhanced.plugins._Mixin");
	dojo.declare("dojox.grid.enhanced.plugins._Mixin", null, {_connects:[], _subscribes:[], privates:{}, constructor:function () {
		this._connects = [], this._subscribes = [];
		this.privates = dojo.mixin({}, dojox.grid.enhanced.plugins._Mixin.prototype);
	}, connect:function (obj, event, method) {
		var conn = dojo.connect(obj, event, this, method);
		this._connects.push(conn);
		return conn;
	}, disconnect:function (handle) {
		dojo.some(this._connects, function (conn, i, conns) {
			if (conn == handle) {
				dojo.disconnect(handle);
				conns.splice(i, 1);
				return true;
			}
		});
	}, subscribe:function (topic, method) {
		var subscribe = dojo.subscribe(topic, this, method);
		this._subscribes.push(subscribe);
		return subscribe;
	}, unsubscribe:function (handle) {
		dojo.some(this._subscribes, function (subscribe, i, subscribes) {
			if (subscribe == handle) {
				dojo.unsubscribe(handle);
				subscribes.splice(i, 1);
				return true;
			}
		});
	}, destroy:function () {
		dojo.forEach(this._connects, dojo.disconnect);
		dojo.forEach(this._subscribes, dojo.unsubscribe);
		delete this._connects;
		delete this._subscribes;
		delete this.privates;
	}});
	dojo.provide("dojox.grid.enhanced.plugins._Mixin");
	dojo.declare("dojox.grid.enhanced.plugins._Mixin", null, {_connects:[], _subscribes:[], privates:{}, constructor:function () {
		this._connects = [], this._subscribes = [];
		this.privates = dojo.mixin({}, dojox.grid.enhanced.plugins._Mixin.prototype);
	}, connect:function (obj, event, method) {
		var conn = dojo.connect(obj, event, this, method);
		this._connects.push(conn);
		return conn;
	}, disconnect:function (handle) {
		dojo.some(this._connects, function (conn, i, conns) {
			if (conn == handle) {
				dojo.disconnect(handle);
				conns.splice(i, 1);
				return true;
			}
		});
	}, subscribe:function (topic, method) {
		var subscribe = dojo.subscribe(topic, this, method);
		this._subscribes.push(subscribe);
		return subscribe;
	}, unsubscribe:function (handle) {
		dojo.some(this._subscribes, function (subscribe, i, subscribes) {
			if (subscribe == handle) {
				dojo.unsubscribe(handle);
				subscribes.splice(i, 1);
				return true;
			}
		});
	}, destroy:function () {
		dojo.forEach(this._connects, dojo.disconnect);
		dojo.forEach(this._subscribes, dojo.unsubscribe);
		delete this._connects;
		delete this._subscribes;
		delete this.privates;
	}});
}

