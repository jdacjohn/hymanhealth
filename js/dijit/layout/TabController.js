/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.layout.TabController"]) {
	dojo._hasResource["dijit.layout.TabController"] = true;
	dojo.provide("dijit.layout.TabController");
	dojo.require("dijit.layout.StackController");
	dojo.require("dijit.Menu");
	dojo.require("dijit.MenuItem");
	dojo.requireLocalization("dijit", "common", null, "ROOT,ar,ca,cs,da,de,el,es,fi,fr,he,hu,it,ja,ko,nb,nl,pl,pt,pt-pt,ro,ru,sk,sl,sv,th,tr,zh,zh-tw");
	dojo.declare("dijit.layout.TabController", dijit.layout.StackController, {templateString:"<div role='tablist' dojoAttachEvent='onkeypress:onkeypress'></div>", tabPosition:"top", buttonWidget:"dijit.layout._TabButton", _rectifyRtlTabList:function () {
		if (0 >= this.tabPosition.indexOf("-h")) {
			return;
		}
		if (!this.pane2button) {
			return;
		}
		var maxWidth = 0;
		for (var pane in this.pane2button) {
			var ow = this.pane2button[pane].innerDiv.scrollWidth;
			maxWidth = Math.max(maxWidth, ow);
		}
		for (pane in this.pane2button) {
			this.pane2button[pane].innerDiv.style.width = maxWidth + "px";
		}
	}});
	dojo.declare("dijit.layout._TabButton", dijit.layout._StackButton, {baseClass:"dijitTab", cssStateNodes:{closeNode:"dijitTabCloseButton"}, templateString:dojo.cache("dijit.layout", "templates/_TabButton.html", "<div role=\"presentation\" dojoAttachPoint=\"titleNode\" dojoAttachEvent='onclick:onClick'>\n	<div role=\"presentation\" class='dijitTabInnerDiv' dojoAttachPoint='innerDiv'>\n		<div role=\"presentation\" class='dijitTabContent' dojoAttachPoint='tabContent'>\n		\t<div role=\"presentation\" dojoAttachPoint='focusNode'>\n\t\t		<img src=\"${_blankGif}\" alt=\"\" class=\"dijitIcon\" dojoAttachPoint='iconNode' />\n\t\t		<span dojoAttachPoint='containerNode' class='tabLabel'></span>\n\t\t		<span class=\"dijitInline dijitTabCloseButton dijitTabCloseIcon\" dojoAttachPoint='closeNode'\n\t\t		\t\tdojoAttachEvent='onclick: onClickCloseButton' role=\"presentation\">\n\t\t			<span dojoAttachPoint='closeText' class='dijitTabCloseText'>x</span\n\t\t		></span>\n\t\t\t</div>\n		</div>\n	</div>\n</div>\n"), scrollOnFocus:false, postMixInProperties:function () {
		if (!this.iconClass) {
			this.iconClass = "dijitTabButtonIcon";
		}
	}, buildRendering:function () {
		this.inherited(arguments);
		if (this.iconNode.className == "dijitTabButtonIcon") {
			dojo.style(this.iconNode, "width", "1px");
		}
		dojo.setSelectable(this.containerNode, false);
	}, startup:function () {
		this.inherited(arguments);
		var n = this.domNode;
		setTimeout(function () {
			n.className = n.className;
		}, 1);
	}, _setCloseButtonAttr:function (disp) {
		this.closeButton = disp;
		dojo.toggleClass(this.innerDiv, "dijitClosable", disp);
		this.closeNode.style.display = disp ? "" : "none";
		if (disp) {
			var _nlsResources = dojo.i18n.getLocalization("dijit", "common");
			if (this.closeNode) {
				dojo.attr(this.closeNode, "title", _nlsResources.itemClose);
			}
			var _nlsResources = dojo.i18n.getLocalization("dijit", "common");
			this._closeMenu = new dijit.Menu({id:this.id + "_Menu", dir:this.dir, lang:this.lang, targetNodeIds:[this.domNode]});
			this._closeMenu.addChild(new dijit.MenuItem({label:_nlsResources.itemClose, dir:this.dir, lang:this.lang, onClick:dojo.hitch(this, "onClickCloseButton")}));
		} else {
			if (this._closeMenu) {
				this._closeMenu.destroyRecursive();
				delete this._closeMenu;
			}
		}
	}, _setLabelAttr:function (content) {
		this.inherited(arguments);
		if (this.showLabel == false && !this.params.title) {
			this.iconNode.alt = dojo.trim(this.containerNode.innerText || this.containerNode.textContent || "");
		}
	}, destroy:function () {
		if (this._closeMenu) {
			this._closeMenu.destroyRecursive();
			delete this._closeMenu;
		}
		this.inherited(arguments);
	}});
}

