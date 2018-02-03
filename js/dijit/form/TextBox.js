/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form.TextBox"]) {
	dojo._hasResource["dijit.form.TextBox"] = true;
	dojo.provide("dijit.form.TextBox");
	dojo.require("dijit.form._FormWidget");
	dojo.declare("dijit.form.TextBox", dijit.form._FormValueWidget, {trim:false, uppercase:false, lowercase:false, propercase:false, maxLength:"", selectOnClick:false, placeHolder:"", templateString:dojo.cache("dijit.form", "templates/TextBox.html", "<div class=\"dijit dijitReset dijitInline dijitLeft\" id=\"widget_${id}\" role=\"presentation\"\n\t><div class=\"dijitReset dijitInputField dijitInputContainer\"\n\t\t><input class=\"dijitReset dijitInputInner\" dojoAttachPoint='textbox,focusNode' autocomplete=\"off\"\n\t\t\t${!nameAttrSetting} type='${type}'\n\t/></div\n></div>\n"), _singleNodeTemplate:"<input class=\"dijit dijitReset dijitLeft dijitInputField\" dojoAttachPoint=\"textbox,focusNode\" autocomplete=\"off\" type=\"${type}\" ${!nameAttrSetting} />", _buttonInputDisabled:dojo.isIE ? "disabled" : "", baseClass:"dijitTextBox", attributeMap:dojo.delegate(dijit.form._FormValueWidget.prototype.attributeMap, {maxLength:"focusNode"}), postMixInProperties:function () {
		var type = this.type.toLowerCase();
		if (this.templateString && this.templateString.toLowerCase() == "input" || ((type == "hidden" || type == "file") && this.templateString == dijit.form.TextBox.prototype.templateString)) {
			this.templateString = this._singleNodeTemplate;
		}
		this.inherited(arguments);
	}, _setPlaceHolderAttr:function (v) {
		this.placeHolder = v;
		if (!this._phspan) {
			this._attachPoints.push("_phspan");
			this._phspan = dojo.create("span", {className:"dijitPlaceHolder dijitInputField"}, this.textbox, "after");
		}
		this._phspan.innerHTML = "";
		this._phspan.appendChild(document.createTextNode(v));
		this._updatePlaceHolder();
	}, _updatePlaceHolder:function () {
		if (this._phspan) {
			this._phspan.style.display = (this.placeHolder && !this._focused && !this.textbox.value) ? "" : "none";
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
		this._updatePlaceHolder();
		this.inherited(arguments, [filteredValue, priorityChange]);
	}, displayedValue:"", getDisplayedValue:function () {
		dojo.deprecated(this.declaredClass + "::getDisplayedValue() is deprecated. Use set('displayedValue') instead.", "", "2.0");
		return this.get("displayedValue");
	}, _getDisplayedValueAttr:function () {
		return this.filter(this.textbox.value);
	}, setDisplayedValue:function (value) {
		dojo.deprecated(this.declaredClass + "::setDisplayedValue() is deprecated. Use set('displayedValue', ...) instead.", "", "2.0");
		this.set("displayedValue", value);
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
		if (dojo.isIE) {
			setTimeout(dojo.hitch(this, function () {
				var s = dojo.getComputedStyle(this.domNode);
				if (s) {
					var ff = s.fontFamily;
					if (ff) {
						var inputs = this.domNode.getElementsByTagName("INPUT");
						if (inputs) {
							for (var i = 0; i < inputs.length; i++) {
								inputs[i].style.fontFamily = ff;
							}
						}
					}
				}
			}), 0);
		}
		this.textbox.setAttribute("value", this.textbox.value);
		this.inherited(arguments);
		if (dojo.isMoz || dojo.isOpera) {
			this.connect(this.textbox, "oninput", "_onInput");
		} else {
			this.connect(this.textbox, "onkeydown", "_onInput");
			this.connect(this.textbox, "onkeyup", "_onInput");
			this.connect(this.textbox, "onpaste", "_onInput");
			this.connect(this.textbox, "oncut", "_onInput");
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
		this._updatePlaceHolder();
	}, _onFocus:function (by) {
		if (this.disabled || this.readOnly) {
			return;
		}
		if (this.selectOnClick && by == "mouse") {
			this._selectOnClickHandle = this.connect(this.domNode, "onmouseup", function () {
				this.disconnect(this._selectOnClickHandle);
				var textIsNotSelected;
				if (dojo.isIE) {
					var range = dojo.doc.selection.createRange();
					var parent = range.parentElement();
					textIsNotSelected = parent == this.textbox && range.text.length == 0;
				} else {
					textIsNotSelected = this.textbox.selectionStart == this.textbox.selectionEnd;
				}
				if (textIsNotSelected) {
					dijit.selectInputText(this.textbox);
				}
			});
		}
		this._updatePlaceHolder();
		this._refreshState();
		this.inherited(arguments);
	}, reset:function () {
		this.textbox.value = "";
		this.inherited(arguments);
	}});
	dijit.selectInputText = function (element, start, stop) {
		var _window = dojo.global;
		var _document = dojo.doc;
		element = dojo.byId(element);
		if (isNaN(start)) {
			start = 0;
		}
		if (isNaN(stop)) {
			stop = element.value ? element.value.length : 0;
		}
		dijit.focus(element);
		if (_document["selection"] && dojo.body()["createTextRange"]) {
			if (element.createTextRange) {
				var r = element.createTextRange();
				r.collapse(true);
				r.moveStart("character", -99999);
				r.moveStart("character", start);
				r.moveEnd("character", stop - start);
				r.select();
			}
		} else {
			if (_window["getSelection"]) {
				if (element.setSelectionRange) {
					element.setSelectionRange(start, stop);
				}
			}
		}
	};
}

