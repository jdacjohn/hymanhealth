/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form.ComboBox"]) {
	dojo._hasResource["dijit.form.ComboBox"] = true;
	dojo.provide("dijit.form.ComboBox");
	dojo.require("dojo.window");
	dojo.require("dojo.regexp");
	dojo.require("dojo.data.util.simpleFetch");
	dojo.require("dojo.data.util.filter");
	dojo.require("dijit._CssStateMixin");
	dojo.require("dijit.form._FormWidget");
	dojo.require("dijit.form.ValidationTextBox");
	dojo.require("dijit._HasDropDown");
	dojo.requireLocalization("dijit.form", "ComboBox", null, "ROOT,ar,ca,cs,da,de,el,es,fi,fr,he,hu,it,ja,ko,nb,nl,pl,pt,pt-pt,ro,ru,sk,sl,sv,th,tr,zh,zh-tw");
	dojo.declare("dijit.form.ComboBoxMixin", dijit._HasDropDown, {item:null, pageSize:Infinity, store:null, fetchProperties:{}, query:{}, autoComplete:true, highlightMatch:"first", searchDelay:100, searchAttr:"name", labelAttr:"", labelType:"text", queryExpr:"${0}*", ignoreCase:true, hasDownArrow:true, templateString:dojo.cache("dijit.form", "templates/DropDownBox.html", "<div class=\"dijit dijitReset dijitInlineTable dijitLeft\"\n\tid=\"widget_${id}\"\n\trole=\"combobox\"\n\t><div class='dijitReset dijitRight dijitButtonNode dijitArrowButton dijitDownArrowButton dijitArrowButtonContainer'\n\t\tdojoAttachPoint=\"_buttonNode\" role=\"presentation\"\n\t\t><input class=\"dijitReset dijitInputField dijitArrowButtonInner\" value=\"&#9660; \" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\n\t\t\t${_buttonInputDisabled}\n\t/></div\n\t><div class='dijitReset dijitValidationContainer'\n\t\t><input class=\"dijitReset dijitInputField dijitValidationIcon dijitValidationInner\" value=\"&#935;\" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\n\t/></div\n\t><div class=\"dijitReset dijitInputField dijitInputContainer\"\n\t\t><input class='dijitReset dijitInputInner' ${!nameAttrSetting} type=\"text\" autocomplete=\"off\"\n\t\t\tdojoAttachPoint=\"textbox,focusNode\" role=\"textbox\" aria-haspopup=\"true\"\n\t/></div\n></div>\n"), baseClass:"dijitTextBox dijitComboBox", dropDownClass:"dijit.form._ComboBoxMenu", cssStateNodes:{"_buttonNode":"dijitDownArrowButton"}, maxHeight:-1, _getCaretPos:function (element) {
		var pos = 0;
		if (typeof (element.selectionStart) == "number") {
			pos = element.selectionStart;
		} else {
			if (dojo.isIE) {
				var tr = dojo.doc.selection.createRange().duplicate();
				var ntr = element.createTextRange();
				tr.move("character", 0);
				ntr.move("character", 0);
				try {
					ntr.setEndPoint("EndToEnd", tr);
					pos = String(ntr.text).replace(/\r/g, "").length;
				}
				catch (e) {
				}
			}
		}
		return pos;
	}, _setCaretPos:function (element, location) {
		location = parseInt(location);
		dijit.selectInputText(element, location, location);
	}, _setDisabledAttr:function (value) {
		this.inherited(arguments);
		dijit.setWaiState(this.domNode, "disabled", value);
	}, _abortQuery:function () {
		if (this.searchTimer) {
			clearTimeout(this.searchTimer);
			this.searchTimer = null;
		}
		if (this._fetchHandle) {
			if (this._fetchHandle.abort) {
				this._fetchHandle.abort();
			}
			this._fetchHandle = null;
		}
	}, _onInput:function (evt) {
		if (!this.searchTimer && (evt.type == "paste" || evt.type == "input") && this._lastInput != this.textbox.value) {
			this.searchTimer = setTimeout(dojo.hitch(this, function () {
				this._onKey({charOrCode:229});
			}), 100);
		}
		this.inherited(arguments);
	}, _onKey:function (evt) {
		var key = evt.charOrCode;
		if (evt.altKey || ((evt.ctrlKey || evt.metaKey) && (key != "x" && key != "v")) || key == dojo.keys.SHIFT) {
			return;
		}
		var doSearch = false;
		var pw = this.dropDown;
		var dk = dojo.keys;
		var highlighted = null;
		this._prev_key_backspace = false;
		this._abortQuery();
		this.inherited(arguments);
		if (this._opened) {
			highlighted = pw.getHighlightedOption();
		}
		switch (key) {
		  case dk.PAGE_DOWN:
		  case dk.DOWN_ARROW:
		  case dk.PAGE_UP:
		  case dk.UP_ARROW:
			if (this._opened) {
				this._announceOption(highlighted);
			}
			dojo.stopEvent(evt);
			break;
		  case dk.ENTER:
			if (highlighted) {
				if (highlighted == pw.nextButton) {
					this._nextSearch(1);
					dojo.stopEvent(evt);
					break;
				} else {
					if (highlighted == pw.previousButton) {
						this._nextSearch(-1);
						dojo.stopEvent(evt);
						break;
					}
				}
			} else {
				this._setBlurValue();
				this._setCaretPos(this.focusNode, this.focusNode.value.length);
			}
			if (this._opened || this._fetchHandle) {
				evt.preventDefault();
			}
		  case dk.TAB:
			var newvalue = this.get("displayedValue");
			if (pw && (newvalue == pw._messages["previousMessage"] || newvalue == pw._messages["nextMessage"])) {
				break;
			}
			if (highlighted) {
				this._selectOption();
			}
			if (this._opened) {
				this._lastQuery = null;
				this.closeDropDown();
			}
			break;
		  case " ":
			if (highlighted) {
				dojo.stopEvent(evt);
				this._selectOption();
				this.closeDropDown();
			} else {
				doSearch = true;
			}
			break;
		  case dk.DELETE:
		  case dk.BACKSPACE:
			this._prev_key_backspace = true;
			doSearch = true;
			break;
		  default:
			doSearch = typeof key == "string" || key == 229;
		}
		if (doSearch) {
			this.item = undefined;
			this.searchTimer = setTimeout(dojo.hitch(this, "_startSearchFromInput"), 1);
		}
	}, _autoCompleteText:function (text) {
		var fn = this.focusNode;
		dijit.selectInputText(fn, fn.value.length);
		var caseFilter = this.ignoreCase ? "toLowerCase" : "substr";
		if (text[caseFilter](0).indexOf(this.focusNode.value[caseFilter](0)) == 0) {
			var cpos = this._getCaretPos(fn);
			if ((cpos + 1) > fn.value.length) {
				fn.value = text;
				dijit.selectInputText(fn, cpos);
			}
		} else {
			fn.value = text;
			dijit.selectInputText(fn);
		}
	}, _openResultList:function (results, dataObject) {
		this._fetchHandle = null;
		if (this.disabled || this.readOnly || (dataObject.query[this.searchAttr] != this._lastQuery)) {
			return;
		}
		var wasSelected = this.dropDown._highlighted_option && dojo.hasClass(this.dropDown._highlighted_option, "dijitMenuItemSelected");
		this.dropDown.clearResultList();
		if (!results.length && !this._maxOptions) {
			this.closeDropDown();
			return;
		}
		dataObject._maxOptions = this._maxOptions;
		var nodes = this.dropDown.createOptions(results, dataObject, dojo.hitch(this, "_getMenuLabelFromItem"));
		this._showResultList();
		if (dataObject.direction) {
			if (1 == dataObject.direction) {
				this.dropDown.highlightFirstOption();
			} else {
				if (-1 == dataObject.direction) {
					this.dropDown.highlightLastOption();
				}
			}
			if (wasSelected) {
				this._announceOption(this.dropDown.getHighlightedOption());
			}
		} else {
			if (this.autoComplete && !this._prev_key_backspace && !/^[*]+$/.test(dataObject.query[this.searchAttr])) {
				this._announceOption(nodes[1]);
			}
		}
	}, _showResultList:function () {
		this.closeDropDown(true);
		this.displayMessage("");
		this.openDropDown();
		dijit.setWaiState(this.domNode, "expanded", "true");
	}, loadDropDown:function (callback) {
		this._startSearchAll();
	}, isLoaded:function () {
		return false;
	}, closeDropDown:function () {
		this._abortQuery();
		if (this._opened) {
			this.inherited(arguments);
			dijit.setWaiState(this.domNode, "expanded", "false");
			dijit.removeWaiState(this.focusNode, "activedescendant");
		}
	}, _setBlurValue:function () {
		var newvalue = this.get("displayedValue");
		var pw = this.dropDown;
		if (pw && (newvalue == pw._messages["previousMessage"] || newvalue == pw._messages["nextMessage"])) {
			this._setValueAttr(this._lastValueReported, true);
		} else {
			if (typeof this.item == "undefined") {
				this.item = null;
				this.set("displayedValue", newvalue);
			} else {
				if (this.value != this._lastValueReported) {
					dijit.form._FormValueWidget.prototype._setValueAttr.call(this, this.value, true);
				}
				this._refreshState();
			}
		}
	}, _onBlur:function () {
		this.closeDropDown();
		this.inherited(arguments);
	}, _setItemAttr:function (item, priorityChange, displayedValue) {
		if (!displayedValue) {
			var label = this.labelFunc(item, this.store);
			if (this.labelType == "html") {
				var span = this._helperSpan;
				span.innerHTML = label;
				displayedValue = span.innerText || span.textContent;
			} else {
				displayedValue = label;
			}
		}
		this.value = this._getValueField() != this.searchAttr ? this.store.getIdentity(item) : displayedValue;
		this.item = item;
		dijit.form.ComboBox.superclass._setValueAttr.call(this, this.value, priorityChange, displayedValue);
	}, _announceOption:function (node) {
		if (!node) {
			return;
		}
		var newValue;
		if (node == this.dropDown.nextButton || node == this.dropDown.previousButton) {
			newValue = node.innerHTML;
			this.item = undefined;
			this.value = "";
		} else {
			newValue = node.innerText || node.textContent || "";
			this.set("item", node.item, false, newValue);
		}
		this.focusNode.value = this.focusNode.value.substring(0, this._lastInput.length);
		dijit.setWaiState(this.focusNode, "activedescendant", dojo.attr(node, "id"));
		this._autoCompleteText(newValue);
	}, _selectOption:function (evt) {
		if (evt) {
			this._announceOption(evt.target);
		}
		this.closeDropDown();
		this._setCaretPos(this.focusNode, this.focusNode.value.length);
		dijit.form._FormValueWidget.prototype._setValueAttr.call(this, this.value, true);
	}, _startSearchAll:function () {
		this._startSearch("");
	}, _startSearchFromInput:function () {
		this._startSearch(this.focusNode.value.replace(/([\\\*\?])/g, "\\$1"));
	}, _getQueryString:function (text) {
		return dojo.string.substitute(this.queryExpr, [text]);
	}, _startSearch:function (key) {
		if (!this.dropDown) {
			var popupId = this.id + "_popup", dropDownConstructor = dojo.getObject(this.dropDownClass, false);
			this.dropDown = new dropDownConstructor({onChange:dojo.hitch(this, this._selectOption), id:popupId, dir:this.dir});
			dijit.removeWaiState(this.focusNode, "activedescendant");
			dijit.setWaiState(this.textbox, "owns", popupId);
		}
		var query = dojo.clone(this.query);
		this._lastInput = key;
		this._lastQuery = query[this.searchAttr] = this._getQueryString(key);
		this.searchTimer = setTimeout(dojo.hitch(this, function (query, _this) {
			this.searchTimer = null;
			var fetch = {queryOptions:{ignoreCase:this.ignoreCase, deep:true}, query:query, onBegin:dojo.hitch(this, "_setMaxOptions"), onComplete:dojo.hitch(this, "_openResultList"), onError:function (errText) {
				_this._fetchHandle = null;
				console.error("dijit.form.ComboBox: " + errText);
				_this.closeDropDown();
			}, start:0, count:this.pageSize};
			dojo.mixin(fetch, _this.fetchProperties);
			this._fetchHandle = _this.store.fetch(fetch);
			var nextSearch = function (dataObject, direction) {
				dataObject.start += dataObject.count * direction;
				dataObject.direction = direction;
				this._fetchHandle = this.store.fetch(dataObject);
				this.focus();
			};
			this._nextSearch = this.dropDown.onPage = dojo.hitch(this, nextSearch, this._fetchHandle);
		}, query, this), this.searchDelay);
	}, _setMaxOptions:function (size, request) {
		this._maxOptions = size;
	}, _getValueField:function () {
		return this.searchAttr;
	}, constructor:function () {
		this.query = {};
		this.fetchProperties = {};
	}, postMixInProperties:function () {
		if (!this.store) {
			var srcNodeRef = this.srcNodeRef;
			this.store = new dijit.form._ComboBoxDataStore(srcNodeRef);
			if (!("value" in this.params)) {
				var item = this.store.fetchSelectedItem();
				if (item) {
					var valueField = this._getValueField();
					this.value = valueField != this.searchAttr ? this.store.getValue(item, valueField) : this.labelFunc(item, this.store);
				}
			}
		}
		this._helperSpan = dojo.create("span");
		this.inherited(arguments);
	}, postCreate:function () {
		var label = dojo.query("label[for=\"" + this.id + "\"]");
		if (label.length) {
			label[0].id = (this.id + "_label");
			dijit.setWaiState(this.domNode, "labelledby", label[0].id);
		}
		this.inherited(arguments);
	}, destroy:function () {
		dojo.destroy(this._helperSpan);
		this.inherited(arguments);
	}, _setHasDownArrowAttr:function (val) {
		this.hasDownArrow = val;
		this._buttonNode.style.display = val ? "" : "none";
	}, _getMenuLabelFromItem:function (item) {
		var label = this.labelFunc(item, this.store), labelType = this.labelType;
		if (this.highlightMatch != "none" && this.labelType == "text" && this._lastInput) {
			label = this.doHighlight(label, this._escapeHtml(this._lastInput));
			labelType = "html";
		}
		return {html:labelType == "html", label:label};
	}, doHighlight:function (label, find) {
		var modifiers = (this.ignoreCase ? "i" : "") + (this.highlightMatch == "all" ? "g" : ""), i = this.queryExpr.indexOf("${0}");
		find = dojo.regexp.escapeString(find);
		return this._escapeHtml(label).replace(new RegExp((i == 0 ? "^" : "") + "(" + find + ")" + (i == (this.queryExpr.length - 4) ? "$" : ""), modifiers), "<span class=\"dijitComboBoxHighlightMatch\">$1</span>");
	}, _escapeHtml:function (str) {
		str = String(str).replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").replace(/"/gm, "&quot;");
		return str;
	}, reset:function () {
		this.item = null;
		this.inherited(arguments);
	}, labelFunc:function (item, store) {
		return store.getValue(item, this.labelAttr || this.searchAttr).toString();
	}});
	dojo.declare("dijit.form._ComboBoxMenu", [dijit._Widget, dijit._Templated, dijit._CssStateMixin], {templateString:"<ul class='dijitReset dijitMenu' dojoAttachEvent='onmousedown:_onMouseDown,onmouseup:_onMouseUp,onmouseover:_onMouseOver,onmouseout:_onMouseOut' style='overflow: \"auto\"; overflow-x: \"hidden\";'>" + "<li class='dijitMenuItem dijitMenuPreviousButton' dojoAttachPoint='previousButton' role='option'></li>" + "<li class='dijitMenuItem dijitMenuNextButton' dojoAttachPoint='nextButton' role='option'></li>" + "</ul>", _messages:null, baseClass:"dijitComboBoxMenu", postMixInProperties:function () {
		this.inherited(arguments);
		this._messages = dojo.i18n.getLocalization("dijit.form", "ComboBox", this.lang);
	}, buildRendering:function () {
		this.inherited(arguments);
		this.previousButton.innerHTML = this._messages["previousMessage"];
		this.nextButton.innerHTML = this._messages["nextMessage"];
	}, _setValueAttr:function (value) {
		this.value = value;
		this.onChange(value);
	}, onChange:function (value) {
	}, onPage:function (direction) {
	}, onClose:function () {
		this._blurOptionNode();
	}, _createOption:function (item, labelFunc) {
		var labelObject = labelFunc(item);
		var menuitem = dojo.doc.createElement("li");
		dijit.setWaiRole(menuitem, "option");
		if (labelObject.html) {
			menuitem.innerHTML = labelObject.label;
		} else {
			menuitem.appendChild(dojo.doc.createTextNode(labelObject.label));
		}
		if (menuitem.innerHTML == "") {
			menuitem.innerHTML = "&nbsp;";
		}
		menuitem.item = item;
		return menuitem;
	}, createOptions:function (results, dataObject, labelFunc) {
		this.previousButton.style.display = (dataObject.start == 0) ? "none" : "";
		dojo.attr(this.previousButton, "id", this.id + "_prev");
		dojo.forEach(results, function (item, i) {
			var menuitem = this._createOption(item, labelFunc);
			menuitem.className = "dijitReset dijitMenuItem" + (this.isLeftToRight() ? "" : " dijitMenuItemRtl");
			dojo.attr(menuitem, "id", this.id + i);
			this.domNode.insertBefore(menuitem, this.nextButton);
		}, this);
		var displayMore = false;
		if (dataObject._maxOptions && dataObject._maxOptions != -1) {
			if ((dataObject.start + dataObject.count) < dataObject._maxOptions) {
				displayMore = true;
			} else {
				if ((dataObject.start + dataObject.count) > dataObject._maxOptions && dataObject.count == results.length) {
					displayMore = true;
				}
			}
		} else {
			if (dataObject.count == results.length) {
				displayMore = true;
			}
		}
		this.nextButton.style.display = displayMore ? "" : "none";
		dojo.attr(this.nextButton, "id", this.id + "_next");
		return this.domNode.childNodes;
	}, clearResultList:function () {
		while (this.domNode.childNodes.length > 2) {
			this.domNode.removeChild(this.domNode.childNodes[this.domNode.childNodes.length - 2]);
		}
		this._blurOptionNode();
	}, _onMouseDown:function (evt) {
		dojo.stopEvent(evt);
	}, _onMouseUp:function (evt) {
		if (evt.target === this.domNode || !this._highlighted_option) {
			return;
		} else {
			if (evt.target == this.previousButton) {
				this._blurOptionNode();
				this.onPage(-1);
			} else {
				if (evt.target == this.nextButton) {
					this._blurOptionNode();
					this.onPage(1);
				} else {
					var tgt = evt.target;
					while (!tgt.item) {
						tgt = tgt.parentNode;
					}
					this._setValueAttr({target:tgt}, true);
				}
			}
		}
	}, _onMouseOver:function (evt) {
		if (evt.target === this.domNode) {
			return;
		}
		var tgt = evt.target;
		if (!(tgt == this.previousButton || tgt == this.nextButton)) {
			while (!tgt.item) {
				tgt = tgt.parentNode;
			}
		}
		this._focusOptionNode(tgt);
	}, _onMouseOut:function (evt) {
		if (evt.target === this.domNode) {
			return;
		}
		this._blurOptionNode();
	}, _focusOptionNode:function (node) {
		if (this._highlighted_option != node) {
			this._blurOptionNode();
			this._highlighted_option = node;
			dojo.addClass(this._highlighted_option, "dijitMenuItemSelected");
		}
	}, _blurOptionNode:function () {
		if (this._highlighted_option) {
			dojo.removeClass(this._highlighted_option, "dijitMenuItemSelected");
			this._highlighted_option = null;
		}
	}, _highlightNextOption:function () {
		if (!this.getHighlightedOption()) {
			var fc = this.domNode.firstChild;
			this._focusOptionNode(fc.style.display == "none" ? fc.nextSibling : fc);
		} else {
			var ns = this._highlighted_option.nextSibling;
			if (ns && ns.style.display != "none") {
				this._focusOptionNode(ns);
			} else {
				this.highlightFirstOption();
			}
		}
		dojo.window.scrollIntoView(this._highlighted_option);
	}, highlightFirstOption:function () {
		var first = this.domNode.firstChild;
		var second = first.nextSibling;
		this._focusOptionNode(second.style.display == "none" ? first : second);
		dojo.window.scrollIntoView(this._highlighted_option);
	}, highlightLastOption:function () {
		this._focusOptionNode(this.domNode.lastChild.previousSibling);
		dojo.window.scrollIntoView(this._highlighted_option);
	}, _highlightPrevOption:function () {
		if (!this.getHighlightedOption()) {
			var lc = this.domNode.lastChild;
			this._focusOptionNode(lc.style.display == "none" ? lc.previousSibling : lc);
		} else {
			var ps = this._highlighted_option.previousSibling;
			if (ps && ps.style.display != "none") {
				this._focusOptionNode(ps);
			} else {
				this.highlightLastOption();
			}
		}
		dojo.window.scrollIntoView(this._highlighted_option);
	}, _page:function (up) {
		var scrollamount = 0;
		var oldscroll = this.domNode.scrollTop;
		var height = dojo.style(this.domNode, "height");
		if (!this.getHighlightedOption()) {
			this._highlightNextOption();
		}
		while (scrollamount < height) {
			if (up) {
				if (!this.getHighlightedOption().previousSibling || this._highlighted_option.previousSibling.style.display == "none") {
					break;
				}
				this._highlightPrevOption();
			} else {
				if (!this.getHighlightedOption().nextSibling || this._highlighted_option.nextSibling.style.display == "none") {
					break;
				}
				this._highlightNextOption();
			}
			var newscroll = this.domNode.scrollTop;
			scrollamount += (newscroll - oldscroll) * (up ? -1 : 1);
			oldscroll = newscroll;
		}
	}, pageUp:function () {
		this._page(true);
	}, pageDown:function () {
		this._page(false);
	}, getHighlightedOption:function () {
		var ho = this._highlighted_option;
		return (ho && ho.parentNode) ? ho : null;
	}, handleKey:function (evt) {
		switch (evt.charOrCode) {
		  case dojo.keys.DOWN_ARROW:
			this._highlightNextOption();
			return false;
		  case dojo.keys.PAGE_DOWN:
			this.pageDown();
			return false;
		  case dojo.keys.UP_ARROW:
			this._highlightPrevOption();
			return false;
		  case dojo.keys.PAGE_UP:
			this.pageUp();
			return false;
		  default:
			return true;
		}
	}});
	dojo.declare("dijit.form.ComboBox", [dijit.form.ValidationTextBox, dijit.form.ComboBoxMixin], {_setValueAttr:function (value, priorityChange, displayedValue) {
		this.item = null;
		if (!value) {
			value = "";
		}
		dijit.form.ValidationTextBox.prototype._setValueAttr.call(this, value, priorityChange, displayedValue);
	}});
	dojo.declare("dijit.form._ComboBoxDataStore", null, {constructor:function (root) {
		this.root = root;
		if (root.tagName != "SELECT" && root.firstChild) {
			root = dojo.query("select", root);
			if (root.length > 0) {
				root = root[0];
			} else {
				this.root.innerHTML = "<SELECT>" + this.root.innerHTML + "</SELECT>";
				root = this.root.firstChild;
			}
			this.root = root;
		}
		dojo.query("> option", root).forEach(function (node) {
			node.innerHTML = dojo.trim(node.innerHTML);
		});
	}, getValue:function (item, attribute, defaultValue) {
		return (attribute == "value") ? item.value : (item.innerText || item.textContent || "");
	}, isItemLoaded:function (something) {
		return true;
	}, getFeatures:function () {
		return {"dojo.data.api.Read":true, "dojo.data.api.Identity":true};
	}, _fetchItems:function (args, findCallback, errorCallback) {
		if (!args.query) {
			args.query = {};
		}
		if (!args.query.name) {
			args.query.name = "";
		}
		if (!args.queryOptions) {
			args.queryOptions = {};
		}
		var matcher = dojo.data.util.filter.patternToRegExp(args.query.name, args.queryOptions.ignoreCase), items = dojo.query("> option", this.root).filter(function (option) {
			return (option.innerText || option.textContent || "").match(matcher);
		});
		if (args.sort) {
			items.sort(dojo.data.util.sorter.createSortFunction(args.sort, this));
		}
		findCallback(items, args);
	}, close:function (request) {
		return;
	}, getLabel:function (item) {
		return item.innerHTML;
	}, getIdentity:function (item) {
		return dojo.attr(item, "value");
	}, fetchItemByIdentity:function (args) {
		var item = dojo.query("> option[value='" + args.identity + "']", this.root)[0];
		args.onItem(item);
	}, fetchSelectedItem:function () {
		var root = this.root, si = root.selectedIndex;
		return typeof si == "number" ? dojo.query("> option:nth-child(" + (si != -1 ? si + 1 : 1) + ")", root)[0] : null;
	}});
	dojo.extend(dijit.form._ComboBoxDataStore, dojo.data.util.simpleFetch);
}

