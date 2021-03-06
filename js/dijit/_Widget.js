/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._Widget"]) {
	dojo._hasResource["dijit._Widget"] = true;
	dojo.provide("dijit._Widget");
	dojo.require("dijit._base");
	dojo.require("dojo.Stateful");
	dojo.connect(dojo, "_connect", function (widget, event) {
		if (widget && dojo.isFunction(widget._onConnect)) {
			widget._onConnect(event);
		}
	});
	dijit._connectOnUseEventHandler = function (event) {
	};
	dijit._lastKeyDownNode = null;
	if (dojo.isIE) {
		(function () {
			var keydownCallback = function (evt) {
				dijit._lastKeyDownNode = evt.srcElement;
			};
			dojo.doc.attachEvent("onkeydown", keydownCallback);
			dojo.addOnWindowUnload(function () {
				dojo.doc.detachEvent("onkeydown", keydownCallback);
			});
		})();
	} else {
		dojo.doc.addEventListener("keydown", function (evt) {
			dijit._lastKeyDownNode = evt.target;
		}, true);
	}
	(function () {
		var _attrReg = {}, getSetterAttributes = function (widget) {
			var dc = widget.declaredClass;
			if (!_attrReg[dc]) {
				var r = [], attrs, proto = widget.constructor.prototype;
				for (var fxName in proto) {
					if (dojo.isFunction(proto[fxName]) && (attrs = fxName.match(/^_set([a-zA-Z]*)Attr$/)) && attrs[1]) {
						r.push(attrs[1].charAt(0).toLowerCase() + attrs[1].substr(1));
					}
				}
				_attrReg[dc] = r;
			}
			return _attrReg[dc] || [];
		};
		dojo.declare("dijit._Widget", dojo.Stateful, {id:"", lang:"", dir:"", "class":"", style:"", title:"", tooltip:"", baseClass:"", srcNodeRef:null, domNode:null, containerNode:null, focused:false, attributeMap:{id:"", dir:"", lang:"", "class":"", style:"", title:""}, _deferredConnects:{onClick:"", onDblClick:"", onKeyDown:"", onKeyPress:"", onKeyUp:"", onMouseMove:"", onMouseDown:"", onMouseOut:"", onMouseOver:"", onMouseLeave:"", onMouseEnter:"", onMouseUp:""}, onClick:dijit._connectOnUseEventHandler, onDblClick:dijit._connectOnUseEventHandler, onKeyDown:dijit._connectOnUseEventHandler, onKeyPress:dijit._connectOnUseEventHandler, onKeyUp:dijit._connectOnUseEventHandler, onMouseDown:dijit._connectOnUseEventHandler, onMouseMove:dijit._connectOnUseEventHandler, onMouseOut:dijit._connectOnUseEventHandler, onMouseOver:dijit._connectOnUseEventHandler, onMouseLeave:dijit._connectOnUseEventHandler, onMouseEnter:dijit._connectOnUseEventHandler, onMouseUp:dijit._connectOnUseEventHandler, _blankGif:(dojo.config.blankGif || dojo.moduleUrl("dojo", "resources/blank.gif")).toString(), postscript:function (params, srcNodeRef) {
			this.create(params, srcNodeRef);
		}, create:function (params, srcNodeRef) {
			this.srcNodeRef = dojo.byId(srcNodeRef);
			this._connects = [];
			this._subscribes = [];
			this._deferredConnects = dojo.clone(this._deferredConnects);
			for (var attr in this.attributeMap) {
				delete this._deferredConnects[attr];
			}
			for (attr in this._deferredConnects) {
				if (this[attr] !== dijit._connectOnUseEventHandler) {
					delete this._deferredConnects[attr];
				}
			}
			if (this.srcNodeRef && (typeof this.srcNodeRef.id == "string")) {
				this.id = this.srcNodeRef.id;
			}
			if (params) {
				this.params = params;
				dojo._mixin(this, params);
			}
			this.postMixInProperties();
			if (!this.id) {
				this.id = dijit.getUniqueId(this.declaredClass.replace(/\./g, "_"));
			}
			dijit.registry.add(this);
			this.buildRendering();
			if (this.domNode) {
				this._applyAttributes();
				var source = this.srcNodeRef;
				if (source && source.parentNode && this.domNode !== source) {
					source.parentNode.replaceChild(this.domNode, source);
				}
				for (attr in this.params) {
					this._onConnect(attr);
				}
			}
			if (this.domNode) {
				this.domNode.setAttribute("widgetId", this.id);
			}
			this.postCreate();
			if (this.srcNodeRef && !this.srcNodeRef.parentNode) {
				delete this.srcNodeRef;
			}
			this._created = true;
		}, _applyAttributes:function () {
			var condAttrApply = function (attr, scope) {
				if ((scope.params && attr in scope.params) || scope[attr]) {
					scope.set(attr, scope[attr]);
				}
			};
			for (var attr in this.attributeMap) {
				condAttrApply(attr, this);
			}
			dojo.forEach(getSetterAttributes(this), function (a) {
				if (!(a in this.attributeMap)) {
					condAttrApply(a, this);
				}
			}, this);
		}, postMixInProperties:function () {
		}, buildRendering:function () {
			if (!this.domNode) {
				this.domNode = this.srcNodeRef || dojo.create("div");
			}
			if (this.baseClass) {
				var classes = this.baseClass.split(" ");
				if (!this.isLeftToRight()) {
					classes = classes.concat(dojo.map(classes, function (name) {
						return name + "Rtl";
					}));
				}
				dojo.addClass(this.domNode, classes);
			}
		}, postCreate:function () {
		}, startup:function () {
			this._started = true;
		}, destroyRecursive:function (preserveDom) {
			this._beingDestroyed = true;
			this.destroyDescendants(preserveDom);
			this.destroy(preserveDom);
		}, destroy:function (preserveDom) {
			this._beingDestroyed = true;
			this.uninitialize();
			var d = dojo, dfe = d.forEach, dun = d.unsubscribe;
			dfe(this._connects, function (array) {
				dfe(array, d.disconnect);
			});
			dfe(this._subscribes, function (handle) {
				dun(handle);
			});
			dfe(this._supportingWidgets || [], function (w) {
				if (w.destroyRecursive) {
					w.destroyRecursive();
				} else {
					if (w.destroy) {
						w.destroy();
					}
				}
			});
			this.destroyRendering(preserveDom);
			dijit.registry.remove(this.id);
			this._destroyed = true;
		}, destroyRendering:function (preserveDom) {
			if (this.bgIframe) {
				this.bgIframe.destroy(preserveDom);
				delete this.bgIframe;
			}
			if (this.domNode) {
				if (preserveDom) {
					dojo.removeAttr(this.domNode, "widgetId");
				} else {
					dojo.destroy(this.domNode);
				}
				delete this.domNode;
			}
			if (this.srcNodeRef) {
				if (!preserveDom) {
					dojo.destroy(this.srcNodeRef);
				}
				delete this.srcNodeRef;
			}
		}, destroyDescendants:function (preserveDom) {
			dojo.forEach(this.getChildren(), function (widget) {
				if (widget.destroyRecursive) {
					widget.destroyRecursive(preserveDom);
				}
			});
		}, uninitialize:function () {
			return false;
		}, onFocus:function () {
		}, onBlur:function () {
		}, _onFocus:function (e) {
			this.onFocus();
		}, _onBlur:function () {
			this.onBlur();
		}, _onConnect:function (event) {
			if (event in this._deferredConnects) {
				var mapNode = this[this._deferredConnects[event] || "domNode"];
				this.connect(mapNode, event.toLowerCase(), event);
				delete this._deferredConnects[event];
			}
		}, _setClassAttr:function (value) {
			var mapNode = this[this.attributeMap["class"] || "domNode"];
			dojo.replaceClass(mapNode, value, this["class"]);
			this["class"] = value;
		}, _setStyleAttr:function (value) {
			var mapNode = this[this.attributeMap.style || "domNode"];
			if (dojo.isObject(value)) {
				dojo.style(mapNode, value);
			} else {
				if (mapNode.style.cssText) {
					mapNode.style.cssText += "; " + value;
				} else {
					mapNode.style.cssText = value;
				}
			}
			this.style = value;
		}, setAttribute:function (attr, value) {
			dojo.deprecated(this.declaredClass + "::setAttribute(attr, value) is deprecated. Use set() instead.", "", "2.0");
			this.set(attr, value);
		}, _attrToDom:function (attr, value) {
			var commands = this.attributeMap[attr];
			dojo.forEach(dojo.isArray(commands) ? commands : [commands], function (command) {
				var mapNode = this[command.node || command || "domNode"];
				var type = command.type || "attribute";
				switch (type) {
				  case "attribute":
					if (dojo.isFunction(value)) {
						value = dojo.hitch(this, value);
					}
					var attrName = command.attribute ? command.attribute : (/^on[A-Z][a-zA-Z]*$/.test(attr) ? attr.toLowerCase() : attr);
					dojo.attr(mapNode, attrName, value);
					break;
				  case "innerText":
					mapNode.innerHTML = "";
					mapNode.appendChild(dojo.doc.createTextNode(value));
					break;
				  case "innerHTML":
					mapNode.innerHTML = value;
					break;
				  case "class":
					dojo.replaceClass(mapNode, value, this[attr]);
					break;
				}
			}, this);
			this[attr] = value;
		}, attr:function (name, value) {
			if (dojo.config.isDebug) {
				var alreadyCalledHash = arguments.callee._ach || (arguments.callee._ach = {}), caller = (arguments.callee.caller || "unknown caller").toString();
				if (!alreadyCalledHash[caller]) {
					dojo.deprecated(this.declaredClass + "::attr() is deprecated. Use get() or set() instead, called from " + caller, "", "2.0");
					alreadyCalledHash[caller] = true;
				}
			}
			var args = arguments.length;
			if (args >= 2 || typeof name === "object") {
				return this.set.apply(this, arguments);
			} else {
				return this.get(name);
			}
		}, get:function (name) {
			var names = this._getAttrNames(name);
			return this[names.g] ? this[names.g]() : this[name];
		}, set:function (name, value) {
			if (typeof name === "object") {
				for (var x in name) {
					this.set(x, name[x]);
				}
				return this;
			}
			var names = this._getAttrNames(name);
			if (this[names.s]) {
				var result = this[names.s].apply(this, Array.prototype.slice.call(arguments, 1));
			} else {
				if (name in this.attributeMap) {
					this._attrToDom(name, value);
				}
				this._set(name, value);
			}
			return result || this;
		}, _attrPairNames:{}, _getAttrNames:function (name) {
			var apn = this._attrPairNames;
			if (apn[name]) {
				return apn[name];
			}
			var uc = name.charAt(0).toUpperCase() + name.substr(1);
			return (apn[name] = {n:name + "Node", s:"_set" + uc + "Attr", g:"_get" + uc + "Attr"});
		}, _set:function (name, value) {
			var oldValue = this[name];
			this[name] = value;
			if (this._watchCallbacks) {
				this._watchCallbacks(name, oldValue, value);
			}
		}, toString:function () {
			return "[Widget " + this.declaredClass + ", " + (this.id || "NO ID") + "]";
		}, getDescendants:function () {
			return this.containerNode ? dojo.query("[widgetId]", this.containerNode).map(dijit.byNode) : [];
		}, getChildren:function () {
			return this.containerNode ? dijit.findWidgets(this.containerNode) : [];
		}, nodesWithKeyClick:["input", "button"], connect:function (obj, event, method) {
			var d = dojo, dc = d._connect, handles = [];
			if (event == "ondijitclick") {
				if (d.indexOf(this.nodesWithKeyClick, obj.nodeName.toLowerCase()) == -1) {
					var m = d.hitch(this, method);
					handles.push(dc(obj, "onkeydown", this, function (e) {
						if ((e.keyCode == d.keys.ENTER || e.keyCode == d.keys.SPACE) && !e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey) {
							dijit._lastKeyDownNode = e.target;
							if (!("openDropDown" in this && obj == this._buttonNode)) {
								e.preventDefault();
							}
						}
					}), dc(obj, "onkeyup", this, function (e) {
						if ((e.keyCode == d.keys.ENTER || e.keyCode == d.keys.SPACE) && e.target == dijit._lastKeyDownNode && !e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey) {
							dijit._lastKeyDownNode = null;
							return m(e);
						}
					}));
				}
				event = "onclick";
			}
			handles.push(dc(obj, event, this, method));
			this._connects.push(handles);
			return handles;
		}, disconnect:function (handles) {
			for (var i = 0; i < this._connects.length; i++) {
				if (this._connects[i] == handles) {
					dojo.forEach(handles, dojo.disconnect);
					this._connects.splice(i, 1);
					return;
				}
			}
		}, subscribe:function (topic, method) {
			var handle = dojo.subscribe(topic, this, method);
			this._subscribes.push(handle);
			return handle;
		}, unsubscribe:function (handle) {
			for (var i = 0; i < this._subscribes.length; i++) {
				if (this._subscribes[i] == handle) {
					dojo.unsubscribe(handle);
					this._subscribes.splice(i, 1);
					return;
				}
			}
		}, isLeftToRight:function () {
			return this.dir ? (this.dir == "ltr") : dojo._isBodyLtr();
		}, isFocusable:function () {
			return this.focus && (dojo.style(this.domNode, "display") != "none");
		}, placeAt:function (reference, position) {
			if (reference.declaredClass && reference.addChild) {
				reference.addChild(this, position);
			} else {
				dojo.place(this.domNode, reference, position);
			}
			return this;
		}, _onShow:function () {
			this.onShow();
		}, onShow:function () {
		}, onHide:function () {
		}, onClose:function () {
			return true;
		}});
	})();
}

