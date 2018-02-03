/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.layout.StackContainer"]) {
	dojo._hasResource["dijit.layout.StackContainer"] = true;
	dojo.provide("dijit.layout.StackContainer");
	dojo.require("dijit._Templated");
	dojo.require("dijit.layout._LayoutWidget");
	dojo.requireLocalization("dijit", "common", null, "ROOT,ar,ca,cs,da,de,el,es,fi,fr,he,hu,it,ja,ko,nb,nl,pl,pt,pt-pt,ro,ru,sk,sl,sv,th,tr,zh,zh-tw");
	dojo.require("dojo.cookie");
	dojo.declare("dijit.layout.StackContainer", dijit.layout._LayoutWidget, {doLayout:true, persist:false, baseClass:"dijitStackContainer", buildRendering:function () {
		this.inherited(arguments);
		dojo.addClass(this.domNode, "dijitLayoutContainer");
		dijit.setWaiRole(this.containerNode, "tabpanel");
	}, postCreate:function () {
		this.inherited(arguments);
		this.connect(this.domNode, "onkeypress", this._onKeyPress);
	}, startup:function () {
		if (this._started) {
			return;
		}
		var children = this.getChildren();
		dojo.forEach(children, this._setupChild, this);
		if (this.persist) {
			this.selectedChildWidget = dijit.byId(dojo.cookie(this.id + "_selectedChild"));
		} else {
			dojo.some(children, function (child) {
				if (child.selected) {
					this.selectedChildWidget = child;
				}
				return child.selected;
			}, this);
		}
		var selected = this.selectedChildWidget;
		if (!selected && children[0]) {
			selected = this.selectedChildWidget = children[0];
			selected.selected = true;
		}
		dojo.publish(this.id + "-startup", [{children:children, selected:selected}]);
		this.inherited(arguments);
	}, resize:function () {
		var selected = this.selectedChildWidget;
		if (selected && !this._hasBeenShown) {
			this._hasBeenShown = true;
			this._showChild(selected);
		}
		this.inherited(arguments);
	}, _setupChild:function (child) {
		this.inherited(arguments);
		dojo.replaceClass(child.domNode, "dijitHidden", "dijitVisible");
		child.domNode.title = "";
	}, addChild:function (child, insertIndex) {
		this.inherited(arguments);
		if (this._started) {
			dojo.publish(this.id + "-addChild", [child, insertIndex]);
			this.layout();
			if (!this.selectedChildWidget) {
				this.selectChild(child);
			}
		}
	}, removeChild:function (page) {
		this.inherited(arguments);
		if (this._started) {
			dojo.publish(this.id + "-removeChild", [page]);
		}
		if (this._beingDestroyed) {
			return;
		}
		if (this.selectedChildWidget === page) {
			this.selectedChildWidget = undefined;
			if (this._started) {
				var children = this.getChildren();
				if (children.length) {
					this.selectChild(children[0]);
				}
			}
		}
		if (this._started) {
			this.layout();
		}
	}, selectChild:function (page, animate) {
		page = dijit.byId(page);
		if (this.selectedChildWidget != page) {
			this._transition(page, this.selectedChildWidget, animate);
			this.selectedChildWidget = page;
			dojo.publish(this.id + "-selectChild", [page]);
			if (this.persist) {
				dojo.cookie(this.id + "_selectedChild", this.selectedChildWidget.id);
			}
		}
	}, _transition:function (newWidget, oldWidget) {
		if (oldWidget) {
			this._hideChild(oldWidget);
		}
		this._showChild(newWidget);
		if (newWidget.resize) {
			if (this.doLayout) {
				newWidget.resize(this._containerContentBox || this._contentBox);
			} else {
				newWidget.resize();
			}
		}
	}, _adjacent:function (forward) {
		var children = this.getChildren();
		var index = dojo.indexOf(children, this.selectedChildWidget);
		index += forward ? 1 : children.length - 1;
		return children[index % children.length];
	}, forward:function () {
		this.selectChild(this._adjacent(true), true);
	}, back:function () {
		this.selectChild(this._adjacent(false), true);
	}, _onKeyPress:function (e) {
		dojo.publish(this.id + "-containerKeyPress", [{e:e, page:this}]);
	}, layout:function () {
		if (this.doLayout && this.selectedChildWidget && this.selectedChildWidget.resize) {
			this.selectedChildWidget.resize(this._containerContentBox || this._contentBox);
		}
	}, _showChild:function (page) {
		var children = this.getChildren();
		page.isFirstChild = (page == children[0]);
		page.isLastChild = (page == children[children.length - 1]);
		page.selected = true;
		dojo.replaceClass(page.domNode, "dijitVisible", "dijitHidden");
		page._onShow();
	}, _hideChild:function (page) {
		page.selected = false;
		dojo.replaceClass(page.domNode, "dijitHidden", "dijitVisible");
		page.onHide();
	}, closeChild:function (page) {
		var remove = page.onClose(this, page);
		if (remove) {
			this.removeChild(page);
			page.destroyRecursive();
		}
	}, destroyDescendants:function (preserveDom) {
		dojo.forEach(this.getChildren(), function (child) {
			this.removeChild(child);
			child.destroyRecursive(preserveDom);
		}, this);
	}});
	dojo.require("dijit.layout.StackController");
	dojo.extend(dijit._Widget, {selected:false, closable:false, iconClass:"", showTitle:true});
}

