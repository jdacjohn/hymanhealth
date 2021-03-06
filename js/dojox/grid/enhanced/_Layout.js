/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.grid.enhanced._Layout"]) {
	dojo._hasResource["dojox.grid.enhanced._Layout"] = true;
	dojo.provide("dojox.grid.enhanced._Layout");
	dojo.require("dojox.grid._Layout");
	dojo.declare("dojox.grid.enhanced._Layout", dojox.grid._Layout, {addCellDef:function (inRowIndex, inCellIndex, inDef) {
		var cell = this.inherited(arguments);
		if (cell instanceof dojox.grid.cells._Base) {
			cell.getEditNode = function (inRowIndex) {
				return ((this.getNode(inRowIndex) || 0).firstChild || 0).firstChild || 0;
			};
		}
		return cell;
	}, addViewDef:function (inDef) {
		var viewDef = this.inherited(arguments);
		if (!viewDef["type"]) {
			viewDef["type"] = this.grid._viewClassStr;
		}
		return viewDef;
	}});
	dojo.provide("dojox.grid.enhanced._Layout");
	dojo.require("dojox.grid._Layout");
	dojo.declare("dojox.grid.enhanced._Layout", dojox.grid._Layout, {addCellDef:function (inRowIndex, inCellIndex, inDef) {
		var cell = this.inherited(arguments);
		if (cell instanceof dojox.grid.cells._Base) {
			cell.getEditNode = function (inRowIndex) {
				return ((this.getNode(inRowIndex) || 0).firstChild || 0).firstChild || 0;
			};
		}
		return cell;
	}, addViewDef:function (inDef) {
		var viewDef = this.inherited(arguments);
		if (!viewDef["type"]) {
			viewDef["type"] = this.grid._viewClassStr;
		}
		return viewDef;
	}});
}

