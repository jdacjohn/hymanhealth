/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.parser"]) {
	dojo._hasResource["dojo.parser"] = true;
	dojo.provide("dojo.parser");
	dojo.require("dojo.date.stamp");
	new Date("X");
	dojo.parser = new function () {
		var d = dojo, _attrData = "data-" + d._scopeName + "-";
		this._attrName = d._scopeName + "Type";
		function val2type(value) {
			if (d.isString(value)) {
				return "string";
			}
			if (typeof value == "number") {
				return "number";
			}
			if (typeof value == "boolean") {
				return "boolean";
			}
			if (d.isFunction(value)) {
				return "function";
			}
			if (d.isArray(value)) {
				return "array";
			}
			if (value instanceof Date) {
				return "date";
			}
			if (value instanceof d._Url) {
				return "url";
			}
			return "object";
		}
		function str2obj(value, type) {
			switch (type) {
			  case "string":
				return value;
			  case "number":
				return value.length ? Number(value) : NaN;
			  case "boolean":
				return typeof value == "boolean" ? value : !(value.toLowerCase() == "false");
			  case "function":
				if (d.isFunction(value)) {
					value = value.toString();
					value = d.trim(value.substring(value.indexOf("{") + 1, value.length - 1));
				}
				try {
					if (value === "" || value.search(/[^\w\.]+/i) != -1) {
						return new Function(value);
					} else {
						return d.getObject(value, false) || new Function(value);
					}
				}
				catch (e) {
					return new Function();
				}
			  case "array":
				return value ? value.split(/\s*,\s*/) : [];
			  case "date":
				switch (value) {
				  case "":
					return new Date("");
				  case "now":
					return new Date();
				  default:
					return d.date.stamp.fromISOString(value);
				}
			  case "url":
				return d.baseUrl + value;
			  default:
				return d.fromJson(value);
			}
		}
		var dummyClass = {}, instanceClasses = {};
		d.connect(d, "extend", function () {
			instanceClasses = {};
		});
		function getProtoInfo(cls, params) {
			for (var name in cls) {
				if (name.charAt(0) == "_") {
					continue;
				}
				if (name in dummyClass) {
					continue;
				}
				params[name] = val2type(cls[name]);
			}
			return params;
		}
		function getClassInfo(className, skipParamsLookup) {
			var c = instanceClasses[className];
			if (!c) {
				var cls = d.getObject(className), params = null;
				if (!cls) {
					return null;
				}
				if (!skipParamsLookup) {
					params = getProtoInfo(cls.prototype, {});
				}
				c = {cls:cls, params:params};
			} else {
				if (!skipParamsLookup && !c.params) {
					c.params = getProtoInfo(c.cls.prototype, {});
				}
			}
			return c;
		}
		this._functionFromScript = function (script) {
			var preamble = "";
			var suffix = "";
			var argsStr = (script.getAttribute(_attrData + "args") || script.getAttribute("args"));
			if (argsStr) {
				d.forEach(argsStr.split(/\s*,\s*/), function (part, idx) {
					preamble += "var " + part + " = arguments[" + idx + "]; ";
				});
			}
			var withStr = script.getAttribute("with");
			if (withStr && withStr.length) {
				d.forEach(withStr.split(/\s*,\s*/), function (part) {
					preamble += "with(" + part + "){";
					suffix += "}";
				});
			}
			return new Function(preamble + script.innerHTML + suffix);
		};
		this.instantiate = function (nodes, mixin, args) {
			var thelist = [], dp = dojo.parser;
			mixin = mixin || {};
			args = args || {};
			d.forEach(nodes, function (obj) {
				if (!obj) {
					return;
				}
				var node, type, clsInfo, clazz, scripts, fastpath;
				if (obj.node) {
					node = obj.node;
					type = obj.type;
					fastpath = obj.fastpath;
					clsInfo = obj.clsInfo || (type && getClassInfo(type, fastpath));
					clazz = clsInfo && clsInfo.cls;
					scripts = obj.scripts;
				} else {
					node = obj;
					type = dp._attrName in mixin ? mixin[dp._attrName] : node.getAttribute(dp._attrName);
					clsInfo = type && getClassInfo(type);
					clazz = clsInfo && clsInfo.cls;
					scripts = (clazz && (clazz._noScript || clazz.prototype._noScript) ? [] : d.query("> script[type^='dojo/']", node));
				}
				if (!clsInfo) {
					throw new Error("Could not load class '" + type);
				}
				var params = {};
				if (args.defaults) {
					d._mixin(params, args.defaults);
				}
				if (obj.inherited) {
					d._mixin(params, obj.inherited);
				}
				if (fastpath) {
					var extra = node.getAttribute(_attrData + "props");
					if (extra && extra.length) {
						try {
							extra = d.fromJson("{" + extra + "}");
							d._mixin(params, extra);
						}
						catch (e) {
							console.warn("Invalid object notation in data-dojo-props:", node, e);
						}
					}
					var attachPoint = node.getAttribute(_attrData + "attach-point");
					if (attachPoint) {
						params.dojoAttachPoint = attachPoint;
					}
					var attachEvent = node.getAttribute(_attrData + "attach-Event");
					if (attachEvent) {
						params.dojoAttachEvent = attachEvent;
					}
					dojo.mixin(params, mixin);
				} else {
					var attributes = node.attributes;
					for (var name in clsInfo.params) {
						var item = name in mixin ? {value:mixin[name], specified:true} : attributes.getNamedItem(name);
						if (!item || (!item.specified && (!dojo.isIE || name.toLowerCase() != "value"))) {
							continue;
						}
						var value = item.value;
						switch (name) {
						  case "class":
							value = "className" in mixin ? mixin.className : node.className;
							break;
						  case "style":
							value = "style" in mixin ? mixin.style : (node.style && node.style.cssText);
						}
						var _type = clsInfo.params[name];
						if (typeof value == "string") {
							params[name] = str2obj(value, _type);
						} else {
							params[name] = value;
						}
					}
				}
				var connects = [], calls = [];
				d.forEach(scripts, function (script) {
					node.removeChild(script);
					var event = (script.getAttribute(_attrData + "event") || script.getAttribute("event")), type = script.getAttribute("type"), nf = d.parser._functionFromScript(script);
					if (event) {
						if (type == "dojo/connect") {
							connects.push({event:event, func:nf});
						} else {
							params[event] = nf;
						}
					} else {
						calls.push(nf);
					}
				});
				var markupFactory = clazz.markupFactory || clazz.prototype && clazz.prototype.markupFactory;
				var instance = markupFactory ? markupFactory(params, node, clazz) : new clazz(params, node);
				thelist.push(instance);
				var jsname = (node.getAttribute(_attrData + "id") || node.getAttribute("jsId"));
				if (jsname) {
					d.setObject(jsname, instance);
				}
				d.forEach(connects, function (connect) {
					d.connect(instance, connect.event, null, connect.func);
				});
				d.forEach(calls, function (func) {
					func.call(instance);
				});
			});
			if (!mixin._started) {
				d.forEach(thelist, function (instance) {
					if (!args.noStart && instance && instance.startup && !instance._started && (!instance.getParent || !instance.getParent())) {
						instance.startup();
					}
				});
			}
			return thelist;
		};
		this.parse = function (rootNode, args) {
			var root;
			if (!args && rootNode && rootNode.rootNode) {
				args = rootNode;
				root = args.rootNode;
			} else {
				root = rootNode;
			}
			var attrName = this._attrName;
			function scan(parent, list) {
				var inherited = dojo.clone(parent.inherited);
				dojo.forEach(["dir", "lang"], function (name) {
					var val = parent.node.getAttribute(name);
					if (val) {
						inherited[name] = val;
					}
				});
				var scripts = parent.clsInfo && !parent.clsInfo.cls.prototype._noScript ? parent.scripts : null;
				var recurse = (!parent.clsInfo || !parent.clsInfo.cls.prototype.stopParser) || (args && args.template);
				for (var child = parent.node.firstChild; child; child = child.nextSibling) {
					if (child.nodeType == 1) {
						var type, html5 = recurse && child.getAttribute(_attrData + "type");
						if (html5) {
							type = html5;
						} else {
							type = recurse && child.getAttribute(attrName);
						}
						var fastpath = html5 == type;
						if (type) {
							var params = {"type":type, fastpath:fastpath, clsInfo:getClassInfo(type, fastpath), node:child, scripts:[], inherited:inherited};
							list.push(params);
							scan(params, list);
						} else {
							if (scripts && child.nodeName.toLowerCase() == "script") {
								type = child.getAttribute("type");
								if (type && /^dojo\/\w/i.test(type)) {
									scripts.push(child);
								}
							} else {
								if (recurse) {
									scan({node:child, inherited:inherited}, list);
								}
							}
						}
					}
				}
			}
			var list = [];
			scan({node:root ? dojo.byId(root) : dojo.body(), inherited:(args && args.inherited) || {dir:dojo._isBodyLtr() ? "ltr" : "rtl"}}, list);
			var mixin = args && args.template ? {template:true} : null;
			return this.instantiate(list, mixin, args);
		};
	}();
	(function () {
		var parseRunner = function () {
			if (dojo.config.parseOnLoad) {
				dojo.parser.parse();
			}
		};
		if (dojo.exists("dijit.wai.onload") && (dijit.wai.onload === dojo._loaders[0])) {
			dojo._loaders.splice(1, 0, parseRunner);
		} else {
			dojo._loaders.unshift(parseRunner);
		}
	})();
}

