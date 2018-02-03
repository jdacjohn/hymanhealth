/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.store.Memory"]) {
	dojo._hasResource["dojo.store.Memory"] = true;
	dojo.provide("dojo.store.Memory");
	dojo.require("dojo.store.util.QueryResults");
	dojo.require("dojo.store.util.SimpleQueryEngine");
	dojo.declare("dojo.store.Memory", null, {constructor:function (options) {
		this.index = {};
		dojo.mixin(this, options);
		this.setData(this.data);
	}, data:[], idProperty:"id", index:null, queryEngine:dojo.store.util.SimpleQueryEngine, get:function (id) {
		return this.index[id];
	}, getIdentity:function (object) {
		return object[this.idProperty];
	}, put:function (object, options) {
		id = options && options.id || object[this.idProperty] || Math.random();
		this.index[id] = object;
	}, add:function (object, options) {
		if (this.index[options && options.id || object[this.idProperty]]) {
			throw new Error("Object already exists");
		}
		return this.put(object, options);
	}, remove:function (id) {
		delete this.index[id];
	}, query:function (query, options) {
		return dojo.store.util.QueryResults(this.queryEngine(query, options)(this.data));
	}, setData:function (data) {
		if (data.items) {
			this.idProperty = data.identifier;
			data = this.data = data.items;
		} else {
			this.data = data;
		}
		for (var i = 0, l = data.length; i < l; i++) {
			var object = data[i];
			this.index[object[this.idProperty]] = object;
		}
	}});
}

