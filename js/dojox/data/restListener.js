/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.data.restListener"]) {
	dojo._hasResource["dojox.data.restListener"] = true;
	dojo.provide("dojox.data.restListener");
	dojox.data.restListener = function (message) {
		var channel = message.channel;
		var jr = dojox.rpc.JsonRest;
		var service = jr.getServiceAndId(channel).service;
		var result = dojox.json.ref.resolveJson(message.result, {defaultId:message.event == "put" && channel, index:dojox.rpc.Rest._index, idPrefix:service.servicePath.replace(/[^\/]*$/, ""), idAttribute:jr.getIdAttribute(service), schemas:jr.schemas, loader:jr._loader, assignAbsoluteIds:true});
		var target = dojox.rpc.Rest._index && dojox.rpc.Rest._index[channel];
		var onEvent = "on" + message.event.toLowerCase();
		var store = service && service._store;
		if (target) {
			if (target[onEvent]) {
				target[onEvent](result);
				return;
			}
		}
		if (store) {
			switch (onEvent) {
			  case "onpost":
				store.onNew(result);
				break;
			  case "ondelete":
				store.onDelete(target);
				break;
			}
		}
	};
}

