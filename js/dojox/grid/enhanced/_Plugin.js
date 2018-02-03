/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.grid.enhanced._Plugin"]) {
	dojo._hasResource["dojox.grid.enhanced._Plugin"] = true;
	dojo.provide("dojox.grid.enhanced._Plugin");
	dojo.require("dojox.grid.enhanced._Builder");
	dojo.require("dojox.grid.enhanced._Events");
	dojo.declare("dojox.grid.enhanced._Plugin", null, {fixedCellNum:-1, funcMap:null, _plugins:null, _connects:null, constructor:function (inGrid) {
		this.grid = inGrid;
		this.funcMap = {}, this._plugins = [], this._connects = [];
		this._parseProps(this.grid);
	}, _parseProps:function (grid) {
		grid.plugins && dojo.mixin(grid, grid.plugins);
		grid.rowSelectCell = null;
		grid.dnd && (grid.nestedSorting = true);
		(grid.dnd || grid.indirectSelection) && (grid.columnReordering = false);
	}, preInit:function () {
		var grid = this.grid;
		if (grid.indirectSelection) {
			this._plugins.push(new (this.getPluginClazz("dojox.grid.enhanced.plugins.IndirectSelection"))(grid));
		}
		if (grid.dnd && (!grid.rowSelector || grid.rowSelector == "false")) {
			grid.rowSelector = "20px";
		}
	}, postInit:function () {
		var grid = this.grid;
		new dojox.grid.enhanced._Events(grid);
		if (grid.menus) {
			this._plugins.push(new (this.getPluginClazz("dojox.grid.enhanced.plugins.Menu"))(grid));
		}
		if (grid.nestedSorting) {
			this._plugins.push(new (this.getPluginClazz("dojox.grid.enhanced.plugins.NestedSorting"))(grid));
		}
		if (grid.dnd) {
			this._plugins.push(new (this.getPluginClazz("dojox.grid.enhanced.plugins.DnD"))(grid));
		}
		this.fixedCellNum = this.getFixedCellNumber();
		this.grid.plugins && this._bindFuncs();
	}, getPluginClazz:function (clazzStr) {
		var clazz = dojo.getObject(clazzStr);
		if (clazz) {
			return clazz;
		}
		throw new Error("Please make sure class \"" + clazzStr + "\" is required.");
	}, isFixedCell:function (cell) {
		return cell && (cell.isRowSelector || cell.positionFixed);
	}, getFixedCellNumber:function () {
		if (this.fixedCellNum >= 0) {
			return this.fixedCellNum;
		}
		var i = 0;
		dojo.forEach(this.grid.layout.cells, dojo.hitch(this, function (cell) {
			this.isFixedCell(cell) && (i++);
		}));
		return i;
	}, inSingleSelection:function () {
		return this.grid.selectionMode && this.grid.selectionMode == "single";
	}, needUpdateRow:function () {
		return ((this.grid.indirectSelection || this.grid.isDndSelectEnable) ? this.grid.edit.isEditing() : true);
	}, _bindFuncs:function () {
		dojo.forEach(this.grid.views.views, this._bindView, this);
		this._connects.push(dojo.connect(this.grid.views, "addView", dojo.hitch(this, this._bindView)));
		this.funcMap["nextKey"] = this.grid.focus.nextKey;
		this.grid.focus.nextKey = this.nextKey;
		this.funcMap["previousKey"] = this.grid.focus.previousKey;
		this.grid.focus.previousKey = this.previousKey;
		if (this.grid.indirectSelection) {
			this.funcMap["renderPage"] = this.grid.scroller.renderPage;
			this.grid.scroller.renderPage = this.renderPage;
			this.funcMap["measurePage"] = this.grid.scroller.measurePage;
			this.grid.scroller.measurePage = this.measurePage;
		}
		this.funcMap["updateRow"] = this.grid.updateRow;
		this.grid.updateRow = this.updateRow;
		var edit = this.grid.edit;
		edit && (edit.styleRow = function (inRow) {
		});
	}, _bindView:function (view) {
		if (!view) {
			return;
		}
		dojox.grid.util.funnelEvents(view.contentNode, view, "doContentEvent", ["mouseup", "mousemove"]);
		dojox.grid.util.funnelEvents(view.headerNode, view, "doHeaderEvent", ["mouseup"]);
		this.grid.nestedSorting && (view._getHeaderContent = this.grid._getNestedSortHeaderContent);
		this.grid.dnd && (view.setScrollTop = this.setScrollTop);
	}, previousKey:function (e) {
		var isEditing = this.grid.edit.isEditing();
		if (!isEditing && !this.isNavHeader() && !this._isHeaderHidden()) {
			if (!this.grid.isDndSelectEnable) {
				this.focusHeader();
			} else {
				if (!this.isRowBar()) {
					this.focusRowBar();
				} else {
					this._blurRowBar();
					this.focusHeader();
				}
			}
			dojo.stopEvent(e);
			return;
		}
		dojo.hitch(this, this.grid.pluginMgr.funcMap["previousKey"])(e);
	}, nextKey:function (e) {
		var isEmpty = this.grid.rowCount == 0;
		var isRootEvt = (e.target === this.grid.domNode);
		if (!isRootEvt && this.grid.isDndSelectEnable && this.isNavHeader()) {
			this._colHeadNode = this._colHeadFocusIdx = null;
			this.focusRowBar();
			return;
		} else {
			if (!isRootEvt && (!this.grid.isDndSelectEnable && this.isNavHeader()) || (this.grid.isDndSelectEnable && this.isRowBar())) {
				this._colHeadNode = this._colHeadFocusIdx = null;
				if (this.grid.isDndSelectEnable) {
					this._blurRowBar();
				}
				if (this.isNoFocusCell() && !isEmpty) {
					this.setFocusIndex(0, 0);
				} else {
					if (this.cell && !isEmpty) {
						if (this.focusView && !this.focusView.rowNodes[this.rowIndex]) {
							this.grid.scrollToRow(this.rowIndex);
						}
						this.focusGrid();
					} else {
						if (!this.findAndFocusGridCell()) {
							this.tabOut(this.grid.lastFocusNode);
						}
					}
				}
				return;
			}
		}
		dojo.hitch(this, this.grid.pluginMgr.funcMap["nextKey"])(e);
	}, renderPage:function (inPageIndex) {
		for (var i = 0, j = inPageIndex * this.rowsPerPage; (i < this.rowsPerPage) && (j < this.rowCount); i++, j++) {
		}
		(--j >= 0) && this.grid.lastRenderingRows.push(j);
		dojo.addClass(this.grid.domNode, "dojoxGridSortInProgress");
		dojo.hitch(this, this.grid.pluginMgr.funcMap["renderPage"])(inPageIndex);
	}, measurePage:function (inPageIndex) {
		var pageHeight = dojo.hitch(this, this.grid.pluginMgr.funcMap["measurePage"])(inPageIndex);
		return (!dojo.isIE || this.grid.rowHeight || pageHeight > this.rowsPerPage * this.grid.minRowHeight) ? pageHeight : undefined;
	}, updateRow:function (inRowIndex) {
		var caller = arguments.callee.caller;
		if (caller.nom == "move" && !this.pluginMgr.needUpdateRow()) {
			return;
		}
		dojo.hitch(this, this.pluginMgr.funcMap["updateRow"])(inRowIndex);
	}, setScrollTop:function (inTop) {
		this.lastTop = inTop;
		this.scrollboxNode.scrollTop = inTop;
		return this.scrollboxNode.scrollTop;
	}, getViewByCellIdx:function (cellIdx) {
		var cellMatched = function (cells) {
			var j = 0, matched = false;
			for (; j < cells.length; j++) {
				if (dojo.isArray(cells[j])) {
					if (cellMatched(cells[j])) {
						return true;
					}
				} else {
					if (cells[j].index == cellIdx) {
						return true;
					}
				}
			}
		};
		var i = 0, views = this.grid.views.views;
		for (; i < views.length; i++) {
			cells = views[i].structure.cells;
			if (cellMatched(cells)) {
				return views[i];
			}
		}
		return null;
	}, destroy:function () {
		dojo.forEach(this._connects, dojo.disconnect);
		dojo.forEach(this._plugins, function (p) {
			p.destroy && p.destroy();
			delete p;
		});
		delete this._connects;
		delete this._plugins;
	}});
}

