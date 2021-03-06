/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.editor.plugins.Smiley"]) {
	dojo._hasResource["dojox.editor.plugins.Smiley"] = true;
	dojo.provide("dojox.editor.plugins.Smiley");
	dojo.experimental("dojox.editor.plugins.Smiley");
	dojo.require("dojo.i18n");
	dojo.require("dijit._editor._Plugin");
	dojo.require("dijit.form.ToggleButton");
	dojo.require("dijit.form.DropDownButton");
	dojo.require("dojox.editor.plugins._SmileyPalette");
	dojo.requireLocalization("dojox.editor.plugins", "Smiley", null, "ROOT,cs,de,es,fr,hu,it,ja,ko,pl,pt,ro,ru,zh,zh-tw");
	dojo.declare("dojox.editor.plugins.Smiley", dijit._editor._Plugin, {iconClassPrefix:"dijitAdditionalEditorIcon", emoticonMarker:"[]", emoticonImageClass:"dojoEditorEmoticon", _initButton:function () {
		this.dropDown = new dojox.editor.plugins._SmileyPalette();
		this.connect(this.dropDown, "onChange", function (ascii) {
			this.button.closeDropDown();
			this.editor.focus();
			ascii = this.emoticonMarker.charAt(0) + ascii + this.emoticonMarker.charAt(1);
			this.editor.execCommand("inserthtml", ascii);
		});
		this.i18n = dojo.i18n.getLocalization("dojox.editor.plugins", "Smiley");
		this.button = new dijit.form.DropDownButton({label:this.i18n.smiley, showLabel:false, iconClass:this.iconClassPrefix + " " + this.iconClassPrefix + "Smiley", tabIndex:"-1", dropDown:this.dropDown});
		this.emoticonImageRegexp = new RegExp("class=(\"|')" + this.emoticonImageClass + "(\"|')");
	}, setEditor:function (editor) {
		this.editor = editor;
		this._initButton();
		this.editor.contentPreFilters.push(dojo.hitch(this, this._preFilterEntities));
		this.editor.contentPostFilters.push(dojo.hitch(this, this._postFilterEntities));
	}, _preFilterEntities:function (value) {
		return value.replace(/\[([^\]]*)\]/g, dojo.hitch(this, this._decode));
	}, _postFilterEntities:function (value) {
		return value.replace(/<img [^>]*>/gi, dojo.hitch(this, this._encode));
	}, _decode:function (str, ascii) {
		var emoticon = dojox.editor.plugins.Emoticon.fromAscii(ascii);
		return emoticon ? emoticon.imgHtml(this.emoticonImageClass) : ascii;
	}, _encode:function (str) {
		if (str.search(this.emoticonImageRegexp) > -1) {
			return this.emoticonMarker.charAt(0) + str.replace(/(<img [^>]*)alt="([^"]*)"([^>]*>)/, "$2") + this.emoticonMarker.charAt(1);
		} else {
			return str;
		}
	}});
	dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
		if (o.plugin) {
			return;
		}
		if (o.args.name === "smiley") {
			o.plugin = new dojox.editor.plugins.Smiley();
		}
	});
}

