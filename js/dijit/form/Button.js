/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form.Button"]) {
	dojo._hasResource["dijit.form.Button"] = true;
	dojo.provide("dijit.form.Button");
	dojo.require("dijit.form._FormWidget");
	dojo.require("dijit._Container");
	dojo.require("dijit._HasDropDown");
	dojo.declare("dijit.form.Button", dijit.form._FormWidget, {label:"", showLabel:true, iconClass:"", type:"button", baseClass:"dijitButton", templateString:dojo.cache("dijit.form", "templates/Button.html", "<span class=\"dijit dijitReset dijitInline\"\n\t><span class=\"dijitReset dijitInline dijitButtonNode\"\n\t\tdojoAttachEvent=\"ondijitclick:_onButtonClick\"\n\t\t><span class=\"dijitReset dijitStretch dijitButtonContents\"\n\t\t\tdojoAttachPoint=\"titleNode,focusNode\"\n\t\t\trole=\"button\" aria-labelledby=\"${id}_label\"\n\t\t\t><span class=\"dijitReset dijitInline dijitIcon\" dojoAttachPoint=\"iconNode\"></span\n\t\t\t><span class=\"dijitReset dijitToggleButtonIconChar\">&#x25CF;</span\n\t\t\t><span class=\"dijitReset dijitInline dijitButtonText\"\n\t\t\t\tid=\"${id}_label\"\n\t\t\t\tdojoAttachPoint=\"containerNode\"\n\t\t\t></span\n\t\t></span\n\t></span\n\t><input ${!nameAttrSetting} type=\"${type}\" value=\"${value}\" class=\"dijitOffScreen\"\n\t\tdojoAttachPoint=\"valueNode\"\n/></span>\n"), attributeMap:dojo.delegate(dijit.form._FormWidget.prototype.attributeMap, {value:"valueNode", iconClass:{node:"iconNode", type:"class"}}), _onClick:function (e) {
		if (this.disabled) {
			return false;
		}
		this._clicked();
		return this.onClick(e);
	}, _onButtonClick:function (e) {
		if (this._onClick(e) === false) {
			e.preventDefault();
		} else {
			if (this.type == "submit" && !(this.valueNode || this.focusNode).form) {
				for (var node = this.domNode; node.parentNode; node = node.parentNode) {
					var widget = dijit.byNode(node);
					if (widget && typeof widget._onSubmit == "function") {
						widget._onSubmit(e);
						break;
					}
				}
			} else {
				if (this.valueNode) {
					this.valueNode.click();
					e.preventDefault();
				}
			}
		}
	}, buildRendering:function () {
		this.inherited(arguments);
		dojo.setSelectable(this.focusNode, false);
	}, _fillContent:function (source) {
		if (source && (!this.params || !("label" in this.params))) {
			this.set("label", source.innerHTML);
		}
	}, _setShowLabelAttr:function (val) {
		if (this.containerNode) {
			dojo.toggleClass(this.containerNode, "dijitDisplayNone", !val);
		}
		this.showLabel = val;
	}, onClick:function (e) {
		return true;
	}, _clicked:function (e) {
	}, setLabel:function (content) {
		dojo.deprecated("dijit.form.Button.setLabel() is deprecated.  Use set('label', ...) instead.", "", "2.0");
		this.set("label", content);
	}, _setLabelAttr:function (content) {
		this.containerNode.innerHTML = this.label = content;
		if (this.showLabel == false && !this.params.title) {
			this.titleNode.title = dojo.trim(this.containerNode.innerText || this.containerNode.textContent || "");
		}
	}});
	dojo.declare("dijit.form.DropDownButton", [dijit.form.Button, dijit._Container, dijit._HasDropDown], {baseClass:"dijitDropDownButton", templateString:dojo.cache("dijit.form", "templates/DropDownButton.html", "<span class=\"dijit dijitReset dijitInline\"\n\t><span class='dijitReset dijitInline dijitButtonNode'\n\t\tdojoAttachEvent=\"ondijitclick:_onButtonClick\" dojoAttachPoint=\"_buttonNode\"\n\t\t><span class=\"dijitReset dijitStretch dijitButtonContents\"\n\t\t\tdojoAttachPoint=\"focusNode,titleNode,_arrowWrapperNode\"\n\t\t\trole=\"button\" aria-haspopup=\"true\" aria-labelledby=\"${id}_label\"\n\t\t\t><span class=\"dijitReset dijitInline dijitIcon\"\n\t\t\t\tdojoAttachPoint=\"iconNode\"\n\t\t\t></span\n\t\t\t><span class=\"dijitReset dijitInline dijitButtonText\"\n\t\t\t\tdojoAttachPoint=\"containerNode,_popupStateNode\"\n\t\t\t\tid=\"${id}_label\"\n\t\t\t></span\n\t\t\t><span class=\"dijitReset dijitInline dijitArrowButtonInner\"></span\n\t\t\t><span class=\"dijitReset dijitInline dijitArrowButtonChar\">&#9660;</span\n\t\t></span\n\t></span\n\t><input ${!nameAttrSetting} type=\"${type}\" value=\"${value}\" class=\"dijitOffScreen\"\n\t\tdojoAttachPoint=\"valueNode\"\n/></span>\n"), _fillContent:function () {
		if (this.srcNodeRef) {
			var nodes = dojo.query("*", this.srcNodeRef);
			dijit.form.DropDownButton.superclass._fillContent.call(this, nodes[0]);
			this.dropDownContainer = this.srcNodeRef;
		}
	}, startup:function () {
		if (this._started) {
			return;
		}
		if (!this.dropDown && this.dropDownContainer) {
			var dropDownNode = dojo.query("[widgetId]", this.dropDownContainer)[0];
			this.dropDown = dijit.byNode(dropDownNode);
			delete this.dropDownContainer;
		}
		if (this.dropDown) {
			dijit.popup.moveOffScreen(this.dropDown);
		}
		this.inherited(arguments);
	}, isLoaded:function () {
		var dropDown = this.dropDown;
		return (!!dropDown && (!dropDown.href || dropDown.isLoaded));
	}, loadDropDown:function () {
		var dropDown = this.dropDown;
		if (!dropDown) {
			return;
		}
		if (!this.isLoaded()) {
			var handler = dojo.connect(dropDown, "onLoad", this, function () {
				dojo.disconnect(handler);
				this.openDropDown();
			});
			dropDown.refresh();
		} else {
			this.openDropDown();
		}
	}, isFocusable:function () {
		return this.inherited(arguments) && !this._mouseDown;
	}});
	dojo.declare("dijit.form.ComboButton", dijit.form.DropDownButton, {templateString:dojo.cache("dijit.form", "templates/ComboButton.html", "<table class=\"dijit dijitReset dijitInline dijitLeft\"\n\tcellspacing='0' cellpadding='0' role=\"presentation\"\n\t><tbody role=\"presentation\"><tr role=\"presentation\"\n\t\t><td class=\"dijitReset dijitStretch dijitButtonNode\" dojoAttachPoint=\"buttonNode\" dojoAttachEvent=\"ondijitclick:_onButtonClick,onkeypress:_onButtonKeyPress\"\n\t\t><div id=\"${id}_button\" class=\"dijitReset dijitButtonContents\"\n\t\t\tdojoAttachPoint=\"titleNode\"\n\t\t\trole=\"button\" aria-labelledby=\"${id}_label\"\n\t\t\t><div class=\"dijitReset dijitInline dijitIcon\" dojoAttachPoint=\"iconNode\" role=\"presentation\"></div\n\t\t\t><div class=\"dijitReset dijitInline dijitButtonText\" id=\"${id}_label\" dojoAttachPoint=\"containerNode\" role=\"presentation\"></div\n\t\t></div\n\t\t></td\n\t\t><td id=\"${id}_arrow\" class='dijitReset dijitRight dijitButtonNode dijitArrowButton'\n\t\t\tdojoAttachPoint=\"_popupStateNode,focusNode,_buttonNode\"\n\t\t\tdojoAttachEvent=\"onkeypress:_onArrowKeyPress\"\n\t\t\ttitle=\"${optionsTitle}\"\n\t\t\trole=\"button\" aria-haspopup=\"true\"\n\t\t\t><div class=\"dijitReset dijitArrowButtonInner\" role=\"presentation\"></div\n\t\t\t><div class=\"dijitReset dijitArrowButtonChar\" role=\"presentation\">&#9660;</div\n\t\t></td\n\t\t><td style=\"display:none !important;\"\n\t\t\t><input ${!nameAttrSetting} type=\"${type}\" value=\"${value}\" dojoAttachPoint=\"valueNode\"\n\t\t/></td></tr></tbody\n></table>\n"), attributeMap:dojo.mixin(dojo.clone(dijit.form.Button.prototype.attributeMap), {id:"", tabIndex:["focusNode", "titleNode"], title:"titleNode"}), optionsTitle:"", baseClass:"dijitComboButton", cssStateNodes:{"buttonNode":"dijitButtonNode", "titleNode":"dijitButtonContents", "_popupStateNode":"dijitDownArrowButton"}, _focusedNode:null, _onButtonKeyPress:function (evt) {
		if (evt.charOrCode == dojo.keys[this.isLeftToRight() ? "RIGHT_ARROW" : "LEFT_ARROW"]) {
			dijit.focus(this._popupStateNode);
			dojo.stopEvent(evt);
		}
	}, _onArrowKeyPress:function (evt) {
		if (evt.charOrCode == dojo.keys[this.isLeftToRight() ? "LEFT_ARROW" : "RIGHT_ARROW"]) {
			dijit.focus(this.titleNode);
			dojo.stopEvent(evt);
		}
	}, focus:function (position) {
		dijit.focus(position == "start" ? this.titleNode : this._popupStateNode);
	}});
	dojo.declare("dijit.form.ToggleButton", dijit.form.Button, {baseClass:"dijitToggleButton", checked:false, attributeMap:dojo.mixin(dojo.clone(dijit.form.Button.prototype.attributeMap), {checked:"focusNode"}), _clicked:function (evt) {
		this.set("checked", !this.checked);
	}, _setCheckedAttr:function (value, priorityChange) {
		this.checked = value;
		dojo.attr(this.focusNode || this.domNode, "checked", value);
		dijit.setWaiState(this.focusNode || this.domNode, "pressed", value);
		this._handleOnChange(value, priorityChange);
	}, setChecked:function (checked) {
		dojo.deprecated("setChecked(" + checked + ") is deprecated. Use set('checked'," + checked + ") instead.", "", "2.0");
		this.set("checked", checked);
	}, reset:function () {
		this._hasBeenBlurred = false;
		this.set("checked", this.params.checked || false);
	}});
}

