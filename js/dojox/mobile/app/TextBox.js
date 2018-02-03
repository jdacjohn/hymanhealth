/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.mobile.app.TextBox"]) {
	dojo._hasResource["dojox.mobile.app.TextBox"] = true;
	dojo.provide("dojox.mobile.app.TextBox");
	dojo.experimental("dojox.mobile.app.TextBox");
	dojo.require("dojox.mobile.app._Widget");
	dojo.require("dojox.mobile.app._FormWidget");
	dojo.declare("dojox.mobile.app.TextBox", dojox.mobile.app._FormValueWidget, {trim:false, uppercase:false, lowercase:false, propercase:false, maxLength:"", selectOnClick:false, placeHolder:"", baseClass:"mblTextBox", attributeMap:dojo.delegate(dojox.mobile.app._FormValueWidget.prototype.attributeMap, {maxLength:"focusNode"}), buildRendering:function () {
		var node = this.srcNodeRef;
		if (!node || node.tagName != "INPUT") {
			node = dojo.create("input", {});
		}
		dojo.attr(node, {type:"text", value:dojo.attr(this.srcNodeRef, "value") || "", placeholder:this.placeHolder || null});
		this.domNode = this.textbox = this.focusNode = node;
	}, _setPlaceHolderAttr:function (v) {
		this.placeHolder = v;
		if (this.textbox) {
			dojo.attr(this.textbox, "placeholder", v);
		}
	}, _getValueAttr:function () {
		return this.parse(this.get("displayedValue"), this.constraints);
	}, _setValueAttr:function (value, priorityChange, formattedValue) {
		var filteredValue;
		if (value !== undefined) {
			filteredValue = this.filter(value);
			if (typeof formattedValue != "string") {
				if (filteredValue !== null && ((typeof filteredValue != "number") || !isNaN(filteredValue))) {
					formattedValue = this.filter(this.format(filteredValue, this.constraints));
				} else {
					formattedValue = "";
				}
			}
		}
		if (formattedValue != null && formattedValue != undefined && ((typeof formattedValue) != "number" || !isNaN(formattedValue)) && this.textbox.value != formattedValue) {
			this.textbox.value = formattedValue;
		}
		this.inherited(arguments, [filteredValue, priorityChange]);
	}, displayedValue:"", _getDisplayedValueAttr:function () {
		return this.filter(this.textbox.value);
	}, _setDisplayedValueAttr:function (value) {
		if (value === null || value === undefined) {
			value = "";
		} else {
			if (typeof value != "string") {
				value = String(value);
			}
		}
		this.textbox.value = value;
		this._setValueAttr(this.get("value"), undefined, value);
	}, format:function (value, constraints) {
		return ((value == null || value == undefined) ? "" : (value.toString ? value.toString() : value));
	}, parse:function (value, constraints) {
		return value;
	}, _refreshState:function () {
	}, _onInput:function (e) {
		if (e && e.type && /key/i.test(e.type) && e.keyCode) {
			switch (e.keyCode) {
			  case dojo.keys.SHIFT:
			  case dojo.keys.ALT:
			  case dojo.keys.CTRL:
			  case dojo.keys.TAB:
				return;
			}
		}
		if (this.intermediateChanges) {
			var _this = this;
			setTimeout(function () {
				_this._handleOnChange(_this.get("value"), false);
			}, 0);
		}
		this._refreshState();
	}, postCreate:function () {
		console.log("postCreate of textinput");
		this.textbox.setAttribute("value", this.textbox.value);
		this.inherited(arguments);
		if (dojo.isMoz || dojo.isOpera) {
			this.connect(this.textbox, "oninput", this._onInput);
		} else {
			this.connect(this.textbox, "onkeydown", this._onInput);
			this.connect(this.textbox, "onkeyup", this._onInput);
			this.connect(this.textbox, "onpaste", this._onInput);
			this.connect(this.textbox, "oncut", this._onInput);
		}
	}, _blankValue:"", filter:function (val) {
		if (val === null) {
			return this._blankValue;
		}
		if (typeof val != "string") {
			return val;
		}
		if (this.trim) {
			val = dojo.trim(val);
		}
		if (this.uppercase) {
			val = val.toUpperCase();
		}
		if (this.lowercase) {
			val = val.toLowerCase();
		}
		if (this.propercase) {
			val = val.replace(/[^\s]+/g, function (word) {
				return word.substring(0, 1).toUpperCase() + word.substring(1);
			});
		}
		return val;
	}, _setBlurValue:function () {
		this._setValueAttr(this.get("value"), true);
	}, _onBlur:function (e) {
		if (this.disabled) {
			return;
		}
		this._setBlurValue();
		this.inherited(arguments);
		if (this._selectOnClickHandle) {
			this.disconnect(this._selectOnClickHandle);
		}
		if (this.selectOnClick && dojo.isMoz) {
			this.textbox.selectionStart = this.textbox.selectionEnd = undefined;
		}
	}, _onFocus:function (by) {
		if (this.disabled || this.readOnly) {
			return;
		}
		if (this.selectOnClick && by == "mouse") {
			this._selectOnClickHandle = this.connect(this.domNode, "onmouseup", function () {
				this.disconnect(this._selectOnClickHandle);
				var textIsNotSelected;
				textIsNotSelected = this.textbox.selectionStart == this.textbox.selectionEnd;
				if (textIsNotSelected) {
					this.selectInputText(this.textbox);
				}
			});
		}
		this._refreshState();
		this.inherited(arguments);
	}, reset:function () {
		this.textbox.value = "";
		this.inherited(arguments);
	}});
}

