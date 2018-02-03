/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.grid.EnhancedGrid"]) {
	dojo._hasResource["dojox.grid.EnhancedGrid"] = true;
	dojo.provide("dojox.grid.EnhancedGrid");
	dojo.require("dojox.grid.DataGrid");
	dojo.require("dojox.grid.enhanced._Plugin");
	dojo.require("dojox.grid.enhanced._Layout");
	dojo.require("dojox.grid.enhanced._View");
	dojo.requireLocalization("dojox.grid.enhanced", "EnhancedGrid", null, "ROOT,ar,ca,cs,da,de,el,es,fi,fr,he,hu,it,ja,ko,nb,nl,pl,pt,pt-pt,ro,ru,sk,sl,sv,th,tr,zh,zh-tw");
	dojo.experimental("dojox.grid.EnhancedGrid");
	dojo.declare("dojox.grid.EnhancedGrid", dojox.grid.DataGrid, {plugins:null, pluginMgr:null, doubleAffordance:false, minRowHeight:10, keepSortSelection:false, _layoutClass:dojox.grid.enhanced._Layout, _viewClassStr:"dojox.grid.enhanced._View", _pluginMgrClass:dojox.grid.enhanced._Plugin, rowMovedTopic:"", colMovedTopic:"", rowSelectionChangedTopic:"", sortRowSelectionChangedTopic:"", lastRenderingRows:null, postMixInProperties:function () {
		this._nls = dojo.i18n.getLocalization("dojox.grid.enhanced", "EnhancedGrid", this.lang);
		var id = this.id;
		this.rowMovedTopic = "ROW_MOVED_" + id;
		this.colMovedTopic = "COLUMN_MOVED_" + id;
		this.rowSelectionChangedTopic = "ROW_SELECTION_CHANGED_" + id;
		this.sortRowSelectionChangedTopic = "SORT_ROW_SELECTION_CHANGED_" + id;
		this.lastRenderingRows = [];
		this.inherited(arguments);
	}, postCreate:function () {
		this.pluginMgr = new this._pluginMgrClass(this);
		this.pluginMgr.preInit();
		this.inherited(arguments);
		this.pluginMgr.postInit();
	}, startup:function () {
		this._initMenus && this._initMenus();
		this.inherited(arguments);
		if (this.doubleAffordance) {
			dojo.addClass(this.domNode, "dojoxGridDoubleAffordance");
		}
	}, textSizeChanged:function () {
		if (!dojo.isWebKit) {
			this.inherited(arguments);
		} else {
			if (this.textSizeChanging) {
				return;
			}
			this.textSizeChanging = true;
			this.inherited(arguments);
			this.textSizeChanging = false;
		}
	}, removeSelectedRows:function () {
		if (this.indirectSelection && this._canEdit) {
			var selected = dojo.clone(this.selection.selected);
			this.inherited(arguments);
			dojo.forEach(selected, function (value, index) {
				value && this.grid.rowSelectCell.toggleRow(index, false);
			});
		}
	}, doApplyCellEdit:function (inValue, inRowIndex, inAttrName) {
		if (!inAttrName) {
			this.invalidated[inRowIndex] = true;
			return;
		}
		this.inherited(arguments);
	}, mixin:function (target, source) {
		var props = {};
		for (p in source) {
			if (p == "_inherited" || p == "declaredClass" || p == "constructor" || source["privates"] && source["privates"][p]) {
				continue;
			}
			props[p] = source[p];
		}
		dojo.mixin(target, props);
	}, _copyAttr:function (idx, attr) {
		if (!attr) {
			return;
		}
		return this.inherited(arguments);
	}, destroy:function () {
		delete this._nls;
		delete this.lastRenderingRows;
		this.pluginMgr.destroy();
		this.inherited(arguments);
	}});
	dojox.grid.EnhancedGrid.markupFactory = function (props, node, ctor, cellFunc) {
		return dojox.grid._Grid.markupFactory(props, node, ctor, dojo.partial(dojox.grid.DataGrid.cell_markupFactory, cellFunc));
	};
}

