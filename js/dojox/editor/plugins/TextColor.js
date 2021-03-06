/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.editor.plugins.TextColor"]) {
	dojo._hasResource["dojox.editor.plugins.TextColor"] = true;
	dojo.provide("dojox.editor.plugins.TextColor");
	dojo.require("dijit._editor._Plugin");
	dojo.require("dijit.TooltipDialog");
	dojo.require("dijit.form.Button");
	dojo.require("dojox.widget.ColorPicker");
	dojo.require("dojo.i18n");
	dojo.requireLocalization("dojox.editor.plugins", "TextColor", null, "ROOT,ro");
	dojo.experimental("dojox.editor.plugins.TextColor");
	dojo.declare("dojox.editor.plugins._TextColorDropDown", [dijit._Widget, dijit._Templated], {templateString:"<div style='display: none; position: absolute; top: -10000; z-index: -10000'>" + "<div dojoType='dijit.TooltipDialog' dojoAttachPoint='dialog' class='dojoxEditorColorPicker'>" + "<div dojoType='dojox.widget.ColorPicker' dojoAttachPoint='_colorPicker'></div>" + "<br>" + "<center>" + "<button dojoType='dijit.form.Button' type='button' dojoAttachPoint='_setButton'>${setButtonText}</button>" + "&nbsp;" + "<button dojoType='dijit.form.Button' type='button' dojoAttachPoint='_cancelButton'>${cancelButtonText}</button>" + "</center>" + "</div>" + "</div>", widgetsInTemplate:true, constructor:function () {
		var strings = dojo.i18n.getLocalization("dojox.editor.plugins", "TextColor");
		dojo.mixin(this, strings);
	}, startup:function () {
		if (!this._started) {
			this.inherited(arguments);
			this.connect(this._setButton, "onClick", dojo.hitch(this, function () {
				this.onChange(this.get("value"));
			}));
			this.connect(this._cancelButton, "onClick", dojo.hitch(this, function () {
				dijit.popup.close(this.dialog);
				this.onCancel();
			}));
			dojo.style(this.domNode, "display", "block");
		}
	}, _setValueAttr:function (value, priorityChange) {
		this._colorPicker.set("value", value, priorityChange);
	}, _getValueAttr:function () {
		return this._colorPicker.get("value");
	}, onChange:function (value) {
	}, onCancel:function () {
	}});
	dojo.declare("dojox.editor.plugins.TextColor", dijit._editor._Plugin, {buttonClass:dijit.form.DropDownButton, useDefaultCommand:false, constructor:function () {
		this._picker = new dojox.editor.plugins._TextColorDropDown();
		dojo.body().appendChild(this._picker.domNode);
		this._picker.startup();
		this.dropDown = this._picker.dialog;
		this.connect(this._picker, "onChange", function (color) {
			this.editor.execCommand(this.command, color);
		});
		this.connect(this._picker, "onCancel", function () {
			this.editor.focus();
		});
	}, updateState:function () {
		var _e = this.editor;
		var _c = this.command;
		if (!_e || !_e.isLoaded || !_c.length) {
			return;
		}
		var value;
		if (this.button) {
			try {
				value = _e.queryCommandValue(_c) || "";
			}
			catch (e) {
				value = "";
			}
		}
		if (value == "") {
			value = "#000000";
		}
		if (value == "transparent") {
			value = "#ffffff";
		}
		if (typeof value == "string") {
			if (value.indexOf("rgb") > -1) {
				value = dojo.colorFromRgb(value).toHex();
			}
		} else {
			value = ((value & 255) << 16) | (value & 65280) | ((value & 16711680) >>> 16);
			value = value.toString(16);
			value = "#000000".slice(0, 7 - value.length) + value;
		}
		if (value !== this._picker.get("value")) {
			this._picker.set("value", value, false);
		}
	}, destroy:function () {
		this.inherited(arguments);
		this._picker.destroyRecursive();
		delete this._picker;
	}});
	dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
		if (o.plugin) {
			return;
		}
		switch (o.args.name) {
		  case "foreColor":
		  case "hiliteColor":
			o.plugin = new dojox.editor.plugins.TextColor({command:o.args.name});
		}
	});
}

