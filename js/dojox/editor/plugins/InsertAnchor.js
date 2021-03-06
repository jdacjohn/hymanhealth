/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.editor.plugins.InsertAnchor"]) {
	dojo._hasResource["dojox.editor.plugins.InsertAnchor"] = true;
	dojo.provide("dojox.editor.plugins.InsertAnchor");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	dojo.require("dijit._editor._Plugin");
	dojo.require("dijit.TooltipDialog");
	dojo.require("dijit.form.Button");
	dojo.require("dijit.form.ValidationTextBox");
	dojo.require("dijit.form.Select");
	dojo.require("dijit._editor.range");
	dojo.require("dojo.i18n");
	dojo.require("dojo.string");
	dojo.requireLocalization("dijit", "common", null, "ROOT,ar,ca,cs,da,de,el,es,fi,fr,he,hu,it,ja,ko,nb,nl,pl,pt,pt-pt,ro,ru,sk,sl,sv,th,tr,zh,zh-tw");
	dojo.requireLocalization("dojox.editor.plugins", "InsertAnchor", null, "ROOT,ro");
	dojo.declare("dojox.editor.plugins.InsertAnchor", dijit._editor._Plugin, {htmlTemplate:"<a name=\"${anchorInput}\" class=\"dijitEditorPluginInsertAnchorStyle\">${textInput}</a>", iconClassPrefix:"dijitAdditionalEditorIcon", _template:["<table><tr><td>", "<label for='${id}_anchorInput'>${anchor}</label>", "</td><td>", "<input dojoType='dijit.form.ValidationTextBox' required='true' " + "id='${id}_anchorInput' name='anchorInput' intermediateChanges='true'>", "</td></tr><tr><td>", "<label for='${id}_textInput'>${text}</label>", "</td><td>", "<input dojoType='dijit.form.ValidationTextBox' required='true' id='${id}_textInput' " + "name='textInput' intermediateChanges='true'>", "</td></tr>", "<tr><td colspan='2'>", "<button dojoType='dijit.form.Button' type='submit' id='${id}_setButton'>${set}</button>", "<button dojoType='dijit.form.Button' type='button' id='${id}_cancelButton'>${cancel}</button>", "</td></tr></table>"].join(""), _initButton:function () {
		var _this = this;
		var messages = dojo.i18n.getLocalization("dojox.editor.plugins", "InsertAnchor", this.lang);
		var dropDown = (this.dropDown = new dijit.TooltipDialog({title:messages["title"], execute:dojo.hitch(this, "setValue"), onOpen:function () {
			_this._onOpenDialog();
			dijit.TooltipDialog.prototype.onOpen.apply(this, arguments);
		}, onCancel:function () {
			setTimeout(dojo.hitch(_this, "_onCloseDialog"), 0);
		}}));
		this.button = new dijit.form.DropDownButton({label:messages["insertAnchor"], showLabel:false, iconClass:this.iconClassPrefix + " " + this.iconClassPrefix + "InsertAnchor", tabIndex:"-1", dropDown:this.dropDown});
		messages.id = dijit.getUniqueId(this.editor.id);
		this._uniqueId = messages.id;
		this.dropDown.set("content", dropDown.title + "<div style='border-bottom: 1px black solid;padding-bottom:2pt;margin-bottom:4pt'></div>" + dojo.string.substitute(this._template, messages));
		dropDown.startup();
		this._anchorInput = dijit.byId(this._uniqueId + "_anchorInput");
		this._textInput = dijit.byId(this._uniqueId + "_textInput");
		this._setButton = dijit.byId(this._uniqueId + "_setButton");
		this.connect(dijit.byId(this._uniqueId + "_cancelButton"), "onClick", function () {
			this.dropDown.onCancel();
		});
		if (this._anchorInput) {
			this.connect(this._anchorInput, "onChange", "_checkInput");
		}
		if (this._textInput) {
			this.connect(this._anchorInput, "onChange", "_checkInput");
		}
		this.editor.contentDomPreFilters.push(dojo.hitch(this, this._preDomFilter));
		this.editor.contentDomPostFilters.push(dojo.hitch(this, this._postDomFilter));
		this._setup();
	}, setEditor:function (editor) {
		this.editor = editor;
		this._initButton();
	}, _checkInput:function () {
		var disable = true;
		if (this._anchorInput.isValid()) {
			disable = false;
		}
		this._setButton.set("disabled", disable);
	}, _setup:function () {
		this.editor.onLoadDeferred.addCallback(dojo.hitch(this, function () {
			this.connect(this.editor.editNode, "ondblclick", this._onDblClick);
			setTimeout(dojo.hitch(this, function () {
				this._applyStyles();
			}), 100);
		}));
	}, getAnchorStyle:function () {
		var style = "@media screen {\n" + "\t.dijitEditorPluginInsertAnchorStyle {\n" + "\t\tbackground-image: url({MODURL}/images/anchor.gif);\n" + "\t\tbackground-repeat: no-repeat;\n" + "\t\tbackground-position: top left;\n" + "\t\tborder-width: 1px;\n" + "\t\tborder-style: dashed;\n" + "\t\tborder-color: #D0D0D0;\n" + "\t\tpadding-left: 20px;\n" + "\t}\n" + "}\n";
		var modurl = dojo.moduleUrl(dojox._scopeName, "editor/plugins/resources").toString();
		if (!(modurl.match(/^https?:\/\//i)) && !(modurl.match(/^file:\/\//i))) {
			var bUrl;
			if (modurl.charAt(0) === "/") {
				var proto = dojo.doc.location.protocol;
				var hostn = dojo.doc.location.host;
				bUrl = proto + "//" + hostn;
			} else {
				bUrl = this._calcBaseUrl(dojo.global.location.href);
			}
			if (bUrl[bUrl.length - 1] !== "/" && modurl.charAt(0) !== "/") {
				bUrl += "/";
			}
			modurl = bUrl + modurl;
		}
		return style.replace(/\{MODURL\}/gi, modurl);
	}, _applyStyles:function () {
		if (!this._styled) {
			try {
				this._styled = true;
				var doc = this.editor.document;
				var style = this.getAnchorStyle();
				if (!dojo.isIE) {
					var sNode = doc.createElement("style");
					sNode.appendChild(doc.createTextNode(style));
					doc.getElementsByTagName("head")[0].appendChild(sNode);
				} else {
					var ss = doc.createStyleSheet("");
					ss.cssText = style;
				}
			}
			catch (e) {
			}
		}
	}, _calcBaseUrl:function (fullUrl) {
		var baseUrl = null;
		if (fullUrl !== null) {
			var index = fullUrl.indexOf("?");
			if (index != -1) {
				fullUrl = fullUrl.substring(0, index);
			}
			index = fullUrl.lastIndexOf("/");
			if (index > 0 && index < fullUrl.length) {
				baseUrl = fullUrl.substring(0, index);
			} else {
				baseUrl = fullUrl;
			}
		}
		return baseUrl;
	}, _checkValues:function (args) {
		if (args) {
			if (args.anchorInput) {
				args.anchorInput = args.anchorInput.replace(/"/g, "&quot;");
			}
			if (!args.textInput) {
				args.textInput = "&nbsp;";
			}
		}
		return args;
	}, setValue:function (args) {
		this._onCloseDialog();
		if (!this.editor.window.getSelection) {
			var sel = dijit.range.getSelection(this.editor.window);
			var range = sel.getRangeAt(0);
			var a = range.endContainer;
			if (a.nodeType === 3) {
				a = a.parentNode;
			}
			if (a && (a.nodeName && a.nodeName.toLowerCase() !== "a")) {
				a = dojo.withGlobal(this.editor.window, "getSelectedElement", dijit._editor.selection, ["a"]);
			}
			if (a && (a.nodeName && a.nodeName.toLowerCase() === "a")) {
				if (this.editor.queryCommandEnabled("unlink")) {
					dojo.withGlobal(this.editor.window, "selectElementChildren", dijit._editor.selection, [a]);
					this.editor.execCommand("unlink");
				}
			}
		}
		args = this._checkValues(args);
		this.editor.execCommand("inserthtml", dojo.string.substitute(this.htmlTemplate, args));
	}, _onCloseDialog:function () {
		this.editor.focus();
	}, _getCurrentValues:function (a) {
		var anchor, text;
		if (a && a.tagName.toLowerCase() === "a" && dojo.attr(a, "name")) {
			anchor = dojo.attr(a, "name");
			text = a.textContent || a.innerText;
			dojo.withGlobal(this.editor.window, "selectElement", dijit._editor.selection, [a, true]);
		} else {
			text = dojo.withGlobal(this.editor.window, dijit._editor.selection.getSelectedText);
		}
		return {anchorInput:anchor || "", textInput:text || ""};
	}, _onOpenDialog:function () {
		var a;
		if (!this.editor.window.getSelection) {
			var sel = dijit.range.getSelection(this.editor.window);
			var range = sel.getRangeAt(0);
			a = range.endContainer;
			if (a.nodeType === 3) {
				a = a.parentNode;
			}
			if (a && (a.nodeName && a.nodeName.toLowerCase() !== "a")) {
				a = dojo.withGlobal(this.editor.window, "getSelectedElement", dijit._editor.selection, ["a"]);
			}
		} else {
			a = dojo.withGlobal(this.editor.window, "getAncestorElement", dijit._editor.selection, ["a"]);
		}
		this.dropDown.reset();
		this._setButton.set("disabled", true);
		this.dropDown.set("value", this._getCurrentValues(a));
	}, _onDblClick:function (e) {
		if (e && e.target) {
			var t = e.target;
			var tg = t.tagName ? t.tagName.toLowerCase() : "";
			if (tg === "a" && dojo.attr(t, "name")) {
				this.editor.onDisplayChanged();
				dojo.withGlobal(this.editor.window, "selectElement", dijit._editor.selection, [t]);
				setTimeout(dojo.hitch(this, function () {
					this.button.set("disabled", false);
					this.button.openDropDown();
				}), 10);
			}
		}
	}, _preDomFilter:function (node) {
		var ed = this.editor;
		dojo.withGlobal(ed.window, function () {
			dojo.query("a", ed.editNode).forEach(function (a) {
				if (dojo.attr(a, "name") && !dojo.attr(a, "href")) {
					if (!dojo.hasClass(a, "dijitEditorPluginInsertAnchorStyle")) {
						dojo.addClass(a, "dijitEditorPluginInsertAnchorStyle");
					}
				}
			});
		});
	}, _postDomFilter:function (node) {
		var ed = this.editor;
		dojo.withGlobal(ed.window, function () {
			dojo.query("a", node).forEach(function (a) {
				if (dojo.attr(a, "name") && !dojo.attr(a, "href")) {
					if (dojo.hasClass(a, "dijitEditorPluginInsertAnchorStyle")) {
						dojo.removeClass(a, "dijitEditorPluginInsertAnchorStyle");
					}
				}
			});
		});
		return node;
	}});
	dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
		if (o.plugin) {
			return;
		}
		var name = o.args.name;
		if (name) {
			name = name.toLowerCase();
		}
		if (name === "insertanchor") {
			o.plugin = new dojox.editor.plugins.InsertAnchor();
		}
	});
}

