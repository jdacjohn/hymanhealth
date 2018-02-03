/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.grid.enhanced.plugins.Menu"]) {
	dojo._hasResource["dojox.grid.enhanced.plugins.Menu"] = true;
	dojo.provide("dojox.grid.enhanced.plugins.Menu");
	dojo.require("dojox.grid.enhanced.plugins._Mixin");
	dojo.declare("dojox.grid.enhanced.plugins.Menu", dojox.grid.enhanced.plugins._Mixin, {name:"menus", constructor:function (inGrid) {
		inGrid.mixin(inGrid, this);
	}, _initMenus:function () {
		!this.headerMenu && (this.headerMenu = this._getMenuWidget(this.menus["headerMenu"]));
		!this.rowMenu && (this.rowMenu = this._getMenuWidget(this.menus["rowMenu"]));
		!this.cellMenu && (this.cellMenu = this._getMenuWidget(this.menus["cellMenu"]));
		!this.selectedRegionMenu && (this.selectedRegionMenu = this._getMenuWidget(this.menus["selectedRegionMenu"]));
		this.headerMenu && this.set("headerMenu", this.headerMenu) && this.setupHeaderMenu();
		this.rowMenu && this.set("rowMenu", this.rowMenu);
		this.cellMenu && this.set("cellMenu", this.cellMenu);
		if (this.isDndSelectEnable && this.selectedRegionMenu) {
			this.connect(this.select, "setDrugCoverDivs", this._bindDnDSelectEvent);
		}
	}, _getMenuWidget:function (menuId) {
		if (!menuId) {
			return;
		}
		var menu = dijit.byId(menuId);
		if (!menu) {
			console.warn("Menu '" + menuId + "' not existed");
		}
		return menu;
	}, _bindDnDSelectEvent:function () {
		dojo.forEach(this.select.coverDIVs, dojo.hitch(this, function (cover) {
			this.selectedRegionMenu.bindDomNode(cover);
			this.connect(cover, "contextmenu", function (e) {
				dojo.mixin(e, this.select.getSelectedRegionInfo());
				this.onSelectedRegionContextMenu(e);
			});
		}));
	}, _setRowMenuAttr:function (menu) {
		this._setRowCellMenuAttr(menu, "rowMenu");
	}, _setCellMenuAttr:function (menu) {
		this._setRowCellMenuAttr(menu, "cellMenu");
	}, _setRowCellMenuAttr:function (menu, menuType) {
		if (!menu) {
			return;
		}
		if (this[menuType]) {
			this[menuType].unBindDomNode(this.domNode);
		}
		this[menuType] = menu;
		this[menuType].bindDomNode(this.domNode);
	}, showRowCellMenu:function (e) {
		var inRowSelectorView = e.sourceView.declaredClass == "dojox.grid._RowSelector";
		if (this.rowMenu && (!e.cell || this.selection.isSelected(e.rowIndex))) {
			this.rowMenu._openMyself({target:e.target, coords:"pageX" in e ? {x:e.pageX, y:e.pageY} : null});
			dojo.stopEvent(e);
			return;
		}
		if (inRowSelectorView || e.cell && e.cell.isRowSelector) {
			dojo.stopEvent(e);
			return;
		}
		if (this.isDndSelectEnable) {
			this.select.cellClick(e.cellIndex, e.rowIndex);
			this.focus.setFocusCell(e.cell, e.rowIndex);
		}
		if (this.cellMenu) {
			this.cellMenu._openMyself({target:e.target, coords:"pageX" in e ? {x:e.pageX, y:e.pageY} : null});
		}
	}, destroy:function () {
		this.rowMenu && this.rowMenu.unBindDomNode(this.domNode);
		this.cellMenu && this.cellMenu.unBindDomNode(this.domNode);
		this.selectedRegionMenu && this.selectedRegionMenu.destroy();
		this.inherited(arguments);
	}});
}

