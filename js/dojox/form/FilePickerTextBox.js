/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.form.FilePickerTextBox"]) {
	dojo._hasResource["dojox.form.FilePickerTextBox"] = true;
	dojo.provide("dojox.form.FilePickerTextBox");
	dojo.require("dojo.window");
	dojo.require("dijit.form.ValidationTextBox");
	dojo.require("dijit._HasDropDown");
	dojo.require("dojox.widget.FilePicker");
	dojo.declare("dojox.form.FilePickerTextBox", [dijit.form.ValidationTextBox, dijit._HasDropDown], {baseClass:"dojoxFilePickerTextBox", templateString:dojo.cache("dojox.form", "resources/FilePickerTextBox.html", "<div class=\"dijit dijitReset dijitInlineTable dijitLeft\"\n\tid=\"widget_${id}\"\n\trole=\"combobox\" tabIndex=\"-1\"\n\t><div style=\"overflow:hidden;\"\n\t\t><div class='dijitReset dijitRight dijitButtonNode dijitArrowButton dijitDownArrowButton'\n\t\t\tdojoAttachPoint=\"downArrowNode,_buttonNode,_popupStateNode\" role=\"presentation\"\n\t\t\t><div class=\"dijitArrowButtonInner\">&thinsp;</div\n\t\t\t><div class=\"dijitArrowButtonChar\">&#9660;</div\n\t\t></div\n\t\t><div class=\"dijitReset dijitValidationIcon\"><br></div\n\t\t><div class=\"dijitReset dijitValidationIconText\">&Chi;</div\n\t\t><div class=\"dijitReset dijitInputField\"\n\t\t\t><input type=\"text\" autocomplete=\"off\" ${!nameAttrSetting} class='dijitReset'\n\t\t\t\tdojoAttachEvent='onkeypress:_onKey' \n\t\t\t\tdojoAttachPoint='textbox,focusNode' role=\"textbox\" aria-haspopup=\"true\" aria-autocomplete=\"list\"\n\t\t/></div\n\t></div\n></div>\n"), searchDelay:500, valueItem:null, numPanes:2.25, postMixInProperties:function () {
		this.inherited(arguments);
		this.dropDown = new dojox.widget.FilePicker(this.constraints);
	}, postCreate:function () {
		this.inherited(arguments);
		this.connect(this.dropDown, "onChange", this._onWidgetChange);
		this.connect(this.focusNode, "onblur", "_focusBlur");
		this.connect(this.focusNode, "onfocus", "_focusFocus");
		this.connect(this.focusNode, "ondblclick", function () {
			dijit.selectInputText(this.focusNode);
		});
	}, _setValueAttr:function (value, priorityChange, fromWidget) {
		if (!this._searchInProgress) {
			this.inherited(arguments);
			value = value || "";
			var tVal = this.dropDown.get("pathValue") || "";
			if (value !== tVal) {
				this._skip = true;
				var fx = dojo.hitch(this, "_setBlurValue");
				this.dropDown._setPathValueAttr(value, !fromWidget, this._settingBlurValue ? fx : null);
			}
		}
	}, _onWidgetChange:function (item) {
		if (!item && this.focusNode.value) {
			this._hasValidPath = false;
			this.focusNode.value = "";
		} else {
			this.valueItem = item;
			var value = this.dropDown._getPathValueAttr(item);
			if (value) {
				this._hasValidPath = true;
			}
			if (!this._skip) {
				this._setValueAttr(value, undefined, true);
			}
			delete this._skip;
		}
		this.validate();
	}, startup:function () {
		if (!this.dropDown._started) {
			this.dropDown.startup();
		}
		this.inherited(arguments);
	}, openDropDown:function () {
		this.dropDown.domNode.style.width = "0px";
		if (!("minPaneWidth" in (this.constraints || {}))) {
			this.dropDown.set("minPaneWidth", (this.domNode.offsetWidth / this.numPanes));
		}
		this.inherited(arguments);
	}, toggleDropDown:function () {
		this.inherited(arguments);
		if (this._opened) {
			this.dropDown.set("pathValue", this.get("value"));
		}
	}, _focusBlur:function (e) {
		if (e.explicitOriginalTarget == this.focusNode && !this._allowBlur) {
			window.setTimeout(dojo.hitch(this, function () {
				if (!this._allowBlur) {
					this.focus();
				}
			}), 1);
		} else {
			if (this._menuFocus) {
				this.dropDown._updateClass(this._menuFocus, "Item", {"Hover":false});
				delete this._menuFocus;
			}
		}
	}, _focusFocus:function (e) {
		if (this._menuFocus) {
			this.dropDown._updateClass(this._menuFocus, "Item", {"Hover":false});
		}
		delete this._menuFocus;
		var focusNode = dijit.getFocus(this);
		if (focusNode && focusNode.node) {
			focusNode = dijit.byNode(focusNode.node);
			if (focusNode) {
				this._menuFocus = focusNode.domNode;
			}
		}
		if (this._menuFocus) {
			this.dropDown._updateClass(this._menuFocus, "Item", {"Hover":true});
		}
		delete this._allowBlur;
	}, _onBlur:function () {
		this._allowBlur = true;
		delete this.dropDown._savedFocus;
		this.inherited(arguments);
	}, _setBlurValue:function () {
		if (this.dropDown && !this._settingBlurValue) {
			this._settingBlurValue = true;
			this.set("value", this.focusNode.value);
		} else {
			delete this._settingBlurValue;
			this.inherited(arguments);
		}
	}, parse:function (value, constraints) {
		if (this._hasValidPath || this._hasSelection) {
			return value;
		}
		var dd = this.dropDown, topDir = dd.topDir, sep = dd.pathSeparator;
		var ddVal = dd.get("pathValue");
		var norm = function (v) {
			if (topDir.length && v.indexOf(topDir) === 0) {
				v = v.substring(topDir.length);
			}
			if (sep && v[v.length - 1] == sep) {
				v = v.substring(0, v.length - 1);
			}
			return v;
		};
		ddVal = norm(ddVal);
		var val = norm(value);
		if (val == ddVal) {
			return value;
		}
		return undefined;
	}, _startSearchFromInput:function () {
		var dd = this.dropDown, fn = this.focusNode;
		var val = fn.value, oVal = val, topDir = dd.topDir;
		if (this._hasSelection) {
			dijit.selectInputText(fn, oVal.length);
		}
		this._hasSelection = false;
		if (topDir.length && val.indexOf(topDir) === 0) {
			val = val.substring(topDir.length);
		}
		var dirs = val.split(dd.pathSeparator);
		var setFromChain = dojo.hitch(this, function (idx) {
			var dir = dirs[idx];
			var child = dd.getChildren()[idx];
			var conn;
			this._searchInProgress = true;
			var _cleanup = dojo.hitch(this, function () {
				delete this._searchInProgress;
			});
			if ((dir || child) && !this._opened) {
				this.toggleDropDown();
			}
			if (dir && child) {
				var fx = dojo.hitch(this, function () {
					if (conn) {
						this.disconnect(conn);
					}
					delete conn;
					var children = child._menu.getChildren();
					var exact = dojo.filter(children, function (i) {
						return i.label == dir;
					})[0];
					var first = dojo.filter(children, function (i) {
						return (i.label.indexOf(dir) === 0);
					})[0];
					if (exact && ((dirs.length > idx + 1 && exact.children) || (!exact.children))) {
						idx++;
						child._menu.onItemClick(exact, {type:"internal", stopPropagation:function () {
						}, preventDefault:function () {
						}});
						if (dirs[idx]) {
							setFromChain(idx);
						} else {
							_cleanup();
						}
					} else {
						child._setSelected(null);
						if (first && dirs.length === idx + 1) {
							dd._setInProgress = true;
							dd._removeAfter(child);
							delete dd._setInProgress;
							var targetString = first.label;
							if (first.children) {
								targetString += dd.pathSeparator;
							}
							targetString = targetString.substring(dir.length);
							window.setTimeout(function () {
								dojo.window.scrollIntoView(first.domNode);
							}, 1);
							fn.value = oVal + targetString;
							dijit.selectInputText(fn, oVal.length);
							this._hasSelection = true;
							try {
								first.focusNode.focus();
							}
							catch (e) {
							}
						} else {
							if (this._menuFocus) {
								this.dropDown._updateClass(this._menuFocus, "Item", {"Hover":false, "Focus":false});
							}
							delete this._menuFocus;
						}
						_cleanup();
					}
				});
				if (!child.isLoaded) {
					conn = this.connect(child, "onLoad", fx);
				} else {
					fx();
				}
			} else {
				if (child) {
					child._setSelected(null);
					dd._setInProgress = true;
					dd._removeAfter(child);
					delete dd._setInProgress;
				}
				_cleanup();
			}
		});
		setFromChain(0);
	}, _onKey:function (e) {
		if (this.disabled || this.readOnly) {
			return;
		}
		var dk = dojo.keys;
		var c = e.charOrCode;
		if (c == dk.DOWN_ARROW) {
			this._allowBlur = true;
		}
		if (c == dk.ENTER && this._opened) {
			this.dropDown.onExecute();
			dijit.selectInputText(this.focusNode, this.focusNode.value.length);
			this._hasSelection = false;
			dojo.stopEvent(e);
			return;
		}
		if ((c == dk.RIGHT_ARROW || c == dk.LEFT_ARROW || c == dk.TAB) && this._hasSelection) {
			this._startSearchFromInput();
			dojo.stopEvent(e);
			return;
		}
		this.inherited(arguments);
		var doSearch = false;
		if ((c == dk.BACKSPACE || c == dk.DELETE) && this._hasSelection) {
			this._hasSelection = false;
		} else {
			if (c == dk.BACKSPACE || c == dk.DELETE || c == " ") {
				doSearch = true;
			} else {
				doSearch = e.keyChar !== "";
			}
		}
		if (this._searchTimer) {
			window.clearTimeout(this._searchTimer);
		}
		delete this._searchTimer;
		if (doSearch) {
			this._hasValidPath = false;
			this._hasSelection = false;
			this._searchTimer = window.setTimeout(dojo.hitch(this, "_startSearchFromInput"), this.searchDelay + 1);
		}
	}});
}

