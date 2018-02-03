/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.store.util.SimpleQueryEngine"]) {
	dojo._hasResource["dojo.store.util.SimpleQueryEngine"] = true;
	dojo.provide("dojo.store.util.SimpleQueryEngine");
	dojo.store.util.SimpleQueryEngine = function (query, options) {
		if (typeof query == "string") {
			query = this[query];
		} else {
			if (typeof query == "object") {
				var queryObject = query;
				query = function (object) {
					for (var key in queryObject) {
						if (queryObject[key] != object[key]) {
							return false;
						}
					}
					return true;
				};
			}
		}
		function execute(array) {
			var results = dojo.filter(array, query);
			if (options && options.sort) {
				results.sort(function (a, b) {
					for (var sort, i = 0; sort = options.sort[i]; i++) {
						var aValue = a[sort.attribute];
						var bValue = b[sort.attribute];
						if (aValue != bValue) {
							return sort.descending == aValue > bValue ? -1 : 1;
						}
					}
					return 0;
				});
			}
			if (options && (options.start || options.count)) {
				results = results.slice(options.start || 0, (options.start || 0) + (options.count || Infinity));
			}
			return results;
		}
		execute.matches = query;
		return execute;
	};
}

