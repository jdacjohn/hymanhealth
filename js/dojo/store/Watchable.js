/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.store.Watchable"]) {
	dojo._hasResource["dojo.store.Watchable"] = true;
	dojo.provide("dojo.store.Watchable");
	dojo.store.Watchable = function (store) {
		var callbacks = [];
		var notifyAll = store.notify = function (object, existingId) {
			for (var i = 0, l = callbacks.length; i < l; i++) {
				callbacks[i](object, existingId);
			}
		};
		var originalQuery = store.query;
		store.query = function (query, options) {
			var results = originalQuery.apply(this, arguments);
			var queryExecutor = store.queryEngine && store.queryEngine(query, options);
			if (results && results.forEach) {
				results.watch = function (listener) {
					var callback = function (changed, existingId) {
						if (queryExecutor) {
							if (existingId) {
								results.forEach(function (object, i) {
									if (store.getIdentity(object) == existingId) {
										results.splice(i, 1);
										listener(i, existingId);
									}
								});
							}
							if (changed && (queryExecutor.matches ? queryExecutor.matches(changed) : queryExecutor([changed]).length)) {
								results.push(changed);
								results = queryExecutor(results);
								listener(results.indexOf(changed), undefined, changed);
							}
						} else {
							listener(undefined, existingId, changed);
						}
					};
					callbacks.push(callback);
					return {unwatch:function () {
						callbacks.splice(dojo.indexOf(callbacks, callback), 1);
					}};
				};
			}
			return results;
		};
		var inMethod;
		function whenFinished(method, action) {
			var original = store[method];
			if (original) {
				store[method] = function (value) {
					if (inMethod) {
						return original.apply(this, arguments);
					}
					inMethod = true;
					try {
						return dojo.when(original.apply(this, arguments), function (results) {
							action(value);
							return results;
						});
					}
					finally {
						inMethod = false;
					}
				};
			}
		}
		whenFinished("put", function (object) {
			notifyAll(object, store.getIdentity(object));
		});
		whenFinished("add", notifyAll);
		whenFinished("remove", function (id) {
			notifyAll(undefined, id);
		});
		return store;
	};
}

