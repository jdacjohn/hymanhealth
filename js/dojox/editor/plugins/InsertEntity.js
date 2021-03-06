/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.editor.plugins.InsertEntity"]) {
	dojo._hasResource["dojox.editor.plugins.InsertEntity"] = true;
	dojo.provide("dojox.editor.plugins.InsertEntity");
	dojo.require("dijit._editor._Plugin");
	dojo.require("dijit.form.Button");
	dojo.require("dijit.TooltipDialog");
	dojo.require("dojox.editor.plugins.EntityPalette");
	dojo.require("dojox.html.entities");
	dojo.require("dojo.i18n");
	dojo.requireLocalization("dojox.editor.plugins", "InsertEntity", null, "ROOT,cs,de,es,fr,hu,it,ja,ko,pl,pt,ro,ru,zh,zh-tw");
	dojo.declare("dojox.editor.plugins.InsertEntity", dijit._editor._Plugin, {iconClassPrefix:"dijitAdditionalEditorIcon", _initButton:function () {
		this.dropDown = new dojox.editor.plugins.EntityPalette({showCode:this.showCode, showEntityName:this.showEntityName});
		this.connect(this.dropDown, "onChange", function (entity) {
			this.button.closeDropDown();
			this.editor.focus();
			this.editor.execCommand("inserthtml", entity);
		});
		var strings = dojo.i18n.getLocalization("dojox.editor.plugins", "InsertEntity");
		this.button = new dijit.form.DropDownButton({label:strings["insertEntity"], showLabel:false, iconClass:this.iconClassPrefix + " " + this.iconClassPrefix + "InsertEntity", tabIndex:"-1", dropDown:this.dropDown});
	}, setEditor:function (editor) {
		this.editor = editor;
		this._initButton();
		this.editor.addKeyHandler("s", true, true, dojo.hitch(this, function () {
			this.button.openDropDown();
			this.dropDown.focus();
		}));
		editor.contentPreFilters.push(this._preFilterEntities);
		editor.contentPostFilters.push(this._postFilterEntities);
	}, _preFilterEntities:function (s) {
		return dojox.html.entities.decode(s, dojox.html.entities.latin);
	}, _postFilterEntities:function (s) {
		return dojox.html.entities.encode(s, dojox.html.entities.latin);
	}});
	dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
		if (o.plugin) {
			return;
		}
		var name = o.args.name ? o.args.name.toLowerCase() : "";
		if (name === "insertentity") {
			o.plugin = new dojox.editor.plugins.InsertEntity({showCode:("showCode" in o.args) ? o.args.showCode : false, showEntityName:("showEntityName" in o.args) ? o.args.showEntityName : false});
		}
	});
}

