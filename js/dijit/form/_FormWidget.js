/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form._FormWidget"]) {
	dojo._hasResource["dijit.form._FormWidget"] = true;
	dojo.provide("dijit.form._FormWidget");
	dojo.require("dojo.window");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	dojo.require("dijit._CssStateMixin");
	dojo.declare("dijit.form._FormWidget", [dijit._Widget, dijit._Templated, dijit._CssStateMixin], {name:"", alt:"", value:"", type:"text", tabIndex:"0", disabled:false, intermediateChanges:false, scrollOnFocus:true, attributeMap:dojo.delegate(dijit._Widget.prototype.attributeMap, {value:"focusNode", id:"focusNode", tabIndex:"focusNode", alt:"focusNode", title:"focusNode"}), postMixInProperties:function () {
		this.nameAttrSetting = this.name ? ("name=\"" + this.name.replace(/'/g, "&quot;") + "\"") : "";
		this.inherited(arguments);
	}, postCreate:function () {
		this.inherited(arguments);
		this.connect(this.domNode, "onmousedown", "_onMouseDown");
	}, _setDisabledAttr:function (value) {
		this.disabled = value;
		dojo.attr(this.focusNode, "disabled", value);
		if (this.valueNode) {
			dojo.attr(this.valueNode, "disabled", value);
		}
		dijit.setWaiState(this.focusNode, "disabled", value);
		if (value) {
			this._hovering = false;
			this._active = false;
			var attachPointNames = "tabIndex" in this.attributeMap ? this.attributeMap.tabIndex : "focusNode";
			dojo.forEach(dojo.isArray(attachPointNames) ? attachPointNames : [attachPointNames], function (attachPointName) {
				var node = this[attachPointName];
				if (dojo.isWebKit || dijit.hasDefaultTabStop(node)) {
					node.setAttribute("tabIndex", "-1");
				} else {
					node.removeAttribute("tabIndex");
				}
			}, this);
		} else {
			if (this.tabIndex != "") {
				this.focusNode.setAttribute("tabIndex", this.tabIndex);
			}
		}
	}, setDisabled:function (disabled) {
		dojo.deprecated("setDisabled(" + disabled + ") is deprecated. Use set('disabled'," + disabled + ") instead.", "", "2.0");
		this.set("disabled", disabled);
	}, _onFocus:function (e) {
		if (this.scrollOnFocus) {
			dojo.window.scrollIntoView(this.domNode);
		}
		this.inherited(arguments);
	}, isFocusable:function () {
		return !this.disabled && !this.readOnly && this.focusNode && (dojo.style(this.domNode, "display") != "none");
	}, focus:function () {
		dijit.focus(this.focusNode);
	}, compare:function (val1, val2) {
		if (typeof val1 == "number" && typeof val2 == "number") {
			return (isNaN(val1) && isNaN(val2)) ? 0 : val1 - val2;
		} else {
			if (val1 > val2) {
				return 1;
			} else {
				if (val1 < val2) {
					return -1;
				} else {
					return 0;
				}
			}
		}
	}, onChange:function (newValue) {
	}, _onChangeActive:false, _handleOnChange:function (newValue, priorityChange) {
		this._lastValue = newValue;
		if (this._lastValueReported == undefined && (priorityChange === null || !this._onChangeActive)) {
			this._resetValue = this._lastValueReported = newValue;
		}
		this._pendingOnChange = this._pendingOnChange || (typeof newValue != typeof this._lastValueReported) || (this.compare(newValue, this._lastValueReported) != 0);
		if ((this.intermediateChanges || priorityChange || priorityChange === undefined) && this._pendingOnChange) {
			this._lastValueReported = newValue;
			this._pendingOnChange = false;
			if (this._onChangeActive) {
				if (this._onChangeHandle) {
					clearTimeout(this._onChangeHandle);
				}
				this._onChangeHandle = setTimeout(dojo.hitch(this, function () {
					this._onChangeHandle = null;
					this.onChange(newValue);
				}), 0);
			}
		}
	}, create:function () {
		this.inherited(arguments);
		this._onChangeActive = true;
	}, destroy:function () {
		if (this._onChangeHandle) {
			clearTimeout(this._onChangeHandle);
			this.onChange(this._lastValueReported);
		}
		this.inherited(arguments);
	}, setValue:function (value) {
		dojo.deprecated("dijit.form._FormWidget:setValue(" + value + ") is deprecated.  Use set('value'," + value + ") instead.", "", "2.0");
		this.set("value", value);
	}, getValue:function () {
		dojo.deprecated(this.declaredClass + "::getValue() is deprecated. Use get('value') instead.", "", "2.0");
		return this.get("value");
	}, _onMouseDown:function (e) {
		if (!e.ctrlKey && this.isFocusable()) {
			var mouseUpConnector = this.connect(dojo.body(), "onmouseup", function () {
				if (this.isFocusable()) {
					this.focus();
				}
				this.disconnect(mouseUpConnector);
			});
		}
	}});
	dojo.declare("dijit.form._FormValueWidget", dijit.form._FormWidget, {readOnly:false, attributeMap:dojo.delegate(dijit.form._FormWidget.prototype.attributeMap, {value:"", readOnly:"focusNode"}), _setReadOnlyAttr:function (value) {
		this.readOnly = value;
		dojo.attr(this.focusNode, "readOnly", value);
		dijit.setWaiState(this.focusNode, "readonly", value);
	}, postCreate:function () {
		this.inherited(arguments);
		if (dojo.isIE) {
			this.connect(this.focusNode || this.domNode, "onkeydown", this._onKeyDown);
		}
		if (this._resetValue === undefined) {
			this._lastValueReported = this._resetValue = this.value;
		}
	}, _setValueAttr:function (newValue, priorityChange) {
		this.value = newValue;
		this._handleOnChange(newValue, priorityChange);
	}, _getValueAttr:function () {
		return this._lastValue;
	}, undo:function () {
		this._setValueAttr(this._lastValueReported, false);
	}, reset:function () {
		this._hasBeenBlurred = false;
		this._setValueAttr(this._resetValue, true);
	}, _onKeyDown:function (e) {
		if (e.keyCode == dojo.keys.ESCAPE && !(e.ctrlKey || e.altKey || e.metaKey)) {
			var te;
			if (dojo.isIE) {
				e.preventDefault();
				te = document.createEventObject();
				te.keyCode = dojo.keys.ESCAPE;
				te.shiftKey = e.shiftKey;
				e.srcElement.fireEvent("onkeypress", te);
			}
		}
	}, _layoutHackIE7:function () {
		if (dojo.isIE == 7) {
			var domNode = this.domNode;
			var parent = domNode.parentNode;
			var pingNode = domNode.firstChild || domNode;
			var origFilter = pingNode.style.filter;
			var _this = this;
			while (parent && parent.clientHeight == 0) {
				(function ping() {
					var disconnectHandle = _this.connect(parent, "onscroll", function (e) {
						_this.disconnect(disconnectHandle);
						pingNode.style.filter = (new Date()).getMilliseconds();
						setTimeout(function () {
							pingNode.style.filter = origFilter;
						}, 0);
					});
				})();
				parent = parent.parentNode;
			}
		}
	}});
}

