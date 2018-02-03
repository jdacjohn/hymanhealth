/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._CssStateMixin"]) {
	dojo._hasResource["dijit._CssStateMixin"] = true;
	dojo.provide("dijit._CssStateMixin");
	dojo.declare("dijit._CssStateMixin", [], {cssStateNodes:{}, postCreate:function () {
		this.inherited(arguments);
		dojo.forEach(["onmouseenter", "onmouseleave", "onmousedown"], function (e) {
			this.connect(this.domNode, e, "_cssMouseEvent");
		}, this);
		this.connect(this, "set", function (name, value) {
			if (arguments.length >= 2 && {disabled:true, readOnly:true, checked:true, selected:true}[name]) {
				this._setStateClass();
			}
		});
		dojo.forEach(["_onFocus", "_onBlur"], function (ap) {
			this.connect(this, ap, "_setStateClass");
		}, this);
		for (var ap in this.cssStateNodes) {
			this._trackMouseState(this[ap], this.cssStateNodes[ap]);
		}
		this._setStateClass();
	}, _cssMouseEvent:function (event) {
		if (!this.disabled) {
			switch (event.type) {
			  case "mouseenter":
			  case "mouseover":
				this._hovering = true;
				this._active = this._mouseDown;
				break;
			  case "mouseleave":
			  case "mouseout":
				this._hovering = false;
				this._active = false;
				break;
			  case "mousedown":
				this._active = true;
				this._mouseDown = true;
				var mouseUpConnector = this.connect(dojo.body(), "onmouseup", function () {
					this._active = false;
					this._mouseDown = false;
					this._setStateClass();
					this.disconnect(mouseUpConnector);
				});
				break;
			}
			this._setStateClass();
		}
	}, _setStateClass:function () {
		var newStateClasses = this.baseClass.split(" ");
		function multiply(modifier) {
			newStateClasses = newStateClasses.concat(dojo.map(newStateClasses, function (c) {
				return c + modifier;
			}), "dijit" + modifier);
		}
		if (!this.isLeftToRight()) {
			multiply("Rtl");
		}
		if (this.checked) {
			multiply("Checked");
		}
		if (this.state) {
			multiply(this.state);
		}
		if (this.selected) {
			multiply("Selected");
		}
		if (this.disabled) {
			multiply("Disabled");
		} else {
			if (this.readOnly) {
				multiply("ReadOnly");
			} else {
				if (this._active) {
					multiply("Active");
				} else {
					if (this._hovering) {
						multiply("Hover");
					}
				}
			}
		}
		if (this._focused) {
			multiply("Focused");
		}
		var tn = this.stateNode || this.domNode, classHash = {};
		dojo.forEach(tn.className.split(" "), function (c) {
			classHash[c] = true;
		});
		if ("_stateClasses" in this) {
			dojo.forEach(this._stateClasses, function (c) {
				delete classHash[c];
			});
		}
		dojo.forEach(newStateClasses, function (c) {
			classHash[c] = true;
		});
		var newClasses = [];
		for (var c in classHash) {
			newClasses.push(c);
		}
		tn.className = newClasses.join(" ");
		this._stateClasses = newStateClasses;
	}, _trackMouseState:function (node, clazz) {
		var hovering = false, active = false, focused = false;
		var self = this, cn = dojo.hitch(this, "connect", node);
		function setClass() {
			var disabled = ("disabled" in self && self.disabled) || ("readonly" in self && self.readonly);
			dojo.toggleClass(node, clazz + "Hover", hovering && !active && !disabled);
			dojo.toggleClass(node, clazz + "Active", active && !disabled);
			dojo.toggleClass(node, clazz + "Focused", focused && !disabled);
		}
		cn("onmouseenter", function () {
			hovering = true;
			setClass();
		});
		cn("onmouseleave", function () {
			hovering = false;
			active = false;
			setClass();
		});
		cn("onmousedown", function () {
			active = true;
			setClass();
		});
		cn("onmouseup", function () {
			active = false;
			setClass();
		});
		cn("onfocus", function () {
			focused = true;
			setClass();
		});
		cn("onblur", function () {
			focused = false;
			setClass();
		});
		this.connect(this, "set", function (name, value) {
			if (name == "disabled" || name == "readOnly") {
				setClass();
			}
		});
	}});
}

