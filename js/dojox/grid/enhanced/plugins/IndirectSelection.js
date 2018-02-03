/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.grid.enhanced.plugins.IndirectSelection"]) {
	dojo._hasResource["dojox.grid.enhanced.plugins.IndirectSelection"] = true;
	dojo.provide("dojox.grid.enhanced.plugins.IndirectSelection");
	dojo.require("dojox.grid.cells.dijit");
	dojo.require("dojox.grid.cells._base");
	dojo.require("dojox.grid.enhanced.plugins._Mixin");
	dojo.declare("dojox.grid.enhanced.plugins.IndirectSelection", dojox.grid.enhanced.plugins._Mixin, {name:"indirectSelection", constructor:function (inGrid) {
		this.grid = inGrid;
		this.connect(inGrid.layout, "setStructure", dojo.hitch(inGrid.layout, this.addRowSelectCell));
	}, addRowSelectCell:function () {
		if (!this.grid.indirectSelection || this.grid.selectionMode == "none") {
			return;
		}
		var rowSelectCellAdded = false, inValidFields = ["get", "formatter", "field", "fields"], defaultCellDef = {type:dojox.grid.cells.DijitMultipleRowSelector, name:"", editable:true, width:"30px", styles:"text-align: center;"};
		if (this.grid.rowSelectCell) {
			defaultCellDef["defaultValue"] = this.grid.rowSelectCell["defaultValue"];
			this.grid.rowSelectCell.destroy();
		}
		dojo.forEach(this.structure, dojo.hitch(this, function (view) {
			var cells = view.cells;
			if (cells && cells.length > 0 && !rowSelectCellAdded) {
				var firstRow = cells[0];
				if (firstRow[0] && firstRow[0]["isRowSelector"]) {
					console.debug("addRowSelectCell() - row selector cells already added, return.");
					rowSelectCellAdded = true;
					return;
				}
				var selectDef, cellType = this.grid.selectionMode == "single" ? dojox.grid.cells.DijitSingleRowSelector : dojox.grid.cells.DijitMultipleRowSelector;
				if (!dojo.isObject(this.grid.indirectSelection)) {
					selectDef = dojo.mixin(defaultCellDef, {type:cellType});
				} else {
					selectDef = dojo.mixin(defaultCellDef, this.grid.indirectSelection, {type:cellType, editable:true});
					dojo.forEach(inValidFields, function (field) {
						if (field in selectDef) {
							delete selectDef[field];
						}
					});
				}
				cells.length > 1 && (selectDef["rowSpan"] = cells.length);
				dojo.forEach(this.cells, function (cell, i) {
					if (cell.index >= 0) {
						cell.index += 1;
					} else {
						console.debug("Error:IndirectSelection.addRowSelectCell()-  cell " + i + " has no index!");
					}
				});
				var rowSelectCell = this.addCellDef(0, 0, selectDef);
				rowSelectCell.index = 0;
				firstRow.unshift(rowSelectCell);
				this.cells.unshift(rowSelectCell);
				this.grid.rowSelectCell = rowSelectCell;
				rowSelectCellAdded = true;
			}
		}));
		this.cellCount = this.cells.length;
	}, destroy:function () {
		this.grid.rowSelectCell.destroy();
		delete this.grid.rowSelectCell;
		this.inherited(arguments);
	}});
	dojo.declare("dojox.grid.cells._SingleRowSelectorMixin", null, {alwaysEditing:true, widgetMap:null, widget:null, isRowSelector:true, defaultValue:false, constructor:function () {
		this.widgetMap = {};
	}, formatEditing:function (inDatum, inRowIndex) {
		this.needFormatNode(inDatum, inRowIndex);
	}, _formatNode:function (inDatum, inRowIndex) {
		this.formatNode(inDatum, inRowIndex);
	}, setValue:function (inRowIndex, inValue) {
		return;
	}, getValue:function (inRowIndex) {
		return this.get(inRowIndex);
	}, get:function (inRowIndex) {
		var widget = this.widgetMap[inRowIndex];
		var value = widget ? widget.attr("checked") : "";
		return value;
	}, _fireSelectionChanged:function () {
		dojo.publish(this.grid.rowSelectionChangedTopic, [this]);
	}, _selectionChanged:function (obj) {
		if (!obj || obj == this || obj.grid && obj.grid != this.grid) {
			return;
		}
		for (var i in this.widgetMap) {
			var idx = new Number(i);
			var widget = this.widgetMap[idx];
			var value = !!this.grid.selection.selected[idx];
			widget.attr("checked", value);
		}
		this.defaultValue = false;
		this.grid.edit.isEditing() && this.grid.edit.apply();
	}, _toggleSingleRow:function (idx, value) {
		this._select(idx, value);
		var widget = this.widgetMap[idx];
		if (widget) {
			widget.attr("checked", value);
		}
		this._fireSelectionChanged();
	}, _select:function (index, value) {
		dojox.grid.Selection.prototype[value ? "addToSelection" : "deselect"].call(this.grid.selection, index);
	}, inIndirectSelectionMode:function () {
	}, toggleAllSelection:function () {
	}});
	dojo.declare("dojox.grid.cells._MultipleRowSelectorMixin", null, {swipeStartRowIndex:-1, swipeMinRowIndex:-1, swipeMaxRowIndex:-1, toSelect:false, lastClickRowIdx:-1, toggleAllTrigerred:false, _inDndSelection:false, domousedown:function (e) {
		if (e.target.tagName == "INPUT") {
			this._startSelection(e.rowIndex);
		}
		dojo.stopEvent(e);
	}, domousemove:function (e) {
		this._updateSelection(e, 0);
	}, onRowMouseOver:function (e) {
		this._updateSelection(e, 0);
		if (this.grid.dnd) {
			this._inDndSelection = this.grid.select.isInSelectingMode("row");
		}
	}, domouseup:function (e) {
		dojo.isIE && this.view.content.decorateEvent(e);
		var inSwipeSelection = e.cellIndex >= 0 && (this.inIndirectSelectionMode() || this._inDndSelection) && !this.grid.edit.isEditRow(e.rowIndex);
		inSwipeSelection && this._focusEndingCell(e.rowIndex, e.cellIndex);
		this._finisheSelect();
	}, dokeyup:function (e) {
		if (!e.shiftKey) {
			this._finisheSelect();
		}
	}, _startSelection:function (rowIndex) {
		this.swipeStartRowIndex = this.swipeMinRowIndex = this.swipeMaxRowIndex = rowIndex;
		this.toSelect = !this.widgetMap[rowIndex].attr("checked");
	}, _updateSelection:function (e, delta) {
		if (this.swipeStartRowIndex < 0) {
			return;
		}
		var byKey = delta != 0;
		var deltaRow = e.rowIndex - this.swipeStartRowIndex + delta;
		deltaRow > 0 && (this.swipeMaxRowIndex < e.rowIndex + delta) && (this.swipeMaxRowIndex = e.rowIndex + delta);
		deltaRow < 0 && (this.swipeMinRowIndex > e.rowIndex + delta) && (this.swipeMinRowIndex = e.rowIndex + delta);
		if (this.swipeMinRowIndex != this.swipeMaxRowIndex) {
			for (var i in this.widgetMap) {
				var idx = new Number(i);
				var inRange = (idx >= (deltaRow > 0 ? this.swipeStartRowIndex : e.rowIndex + delta) && idx <= (deltaRow > 0 ? e.rowIndex + delta : this.swipeStartRowIndex));
				var outOfRange = (idx >= this.swipeMinRowIndex && idx <= this.swipeMaxRowIndex);
				if (inRange && !(deltaRow == 0 && !this.toSelect)) {
					(this.widgetMap[idx]).attr("checked", this.toSelect);
					this._select(idx, this.toSelect);
				} else {
					if (outOfRange && !byKey) {
						(this.widgetMap[idx]).attr("checked", !this.toSelect);
						this._select(idx, !this.toSelect);
					}
				}
			}
		}
		this._fireSelectionChanged();
	}, swipeSelectionByKey:function (e, delta) {
		if (this.swipeStartRowIndex < 0) {
			this.swipeStartRowIndex = e.rowIndex;
			if (delta > 0) {
				this.swipeMaxRowIndex = e.rowIndex + delta;
				this.swipeMinRowIndex = e.rowIndex;
			} else {
				this.swipeMinRowIndex = e.rowIndex + delta;
				this.swipeMaxRowIndex = e.rowIndex;
			}
			this.toSelect = this.widgetMap[e.rowIndex].attr("checked");
		}
		this._updateSelection(e, delta);
	}, _finisheSelect:function () {
		this.swipeStartRowIndex = -1;
		this.swipeMinRowIndex = -1;
		this.swipeMaxRowIndex = -1;
		this.toSelect = false;
	}, inIndirectSelectionMode:function () {
		return this.swipeStartRowIndex >= 0;
	}, toggleAllSelection:function (checked) {
		for (var i in this.widgetMap) {
			var idx = new Number(i);
			var widget = this.widgetMap[idx];
			widget.attr("checked", checked);
			this._select(idx, checked);
		}
		!checked && this.grid.selection.deselectAll();
		this.defaultValue = checked;
		this.toggleAllTrigerred = true;
		this._fireSelectionChanged();
	}});
	dojo.declare("dojox.grid.cells.DijitSingleRowSelector", [dojox.grid.cells._Widget, dojox.grid.cells._SingleRowSelectorMixin], {widgetClass:dijit.form.RadioButton, _connects:null, _subscribes:null, constructor:function () {
		this._connects = {"col":[]}, this._subscribes = {"col":[]};
		this._subscribes["col"].push(dojo.subscribe(this.grid.rowSelectionChangedTopic, this, this._selectionChanged));
		this._subscribes["col"].push(dojo.subscribe(this.grid.sortRowSelectionChangedTopic, this, this._selectionChanged));
		this._connects["col"].push(dojo.connect(this.grid.scroller, "invalidatePageNode", this, "_pageDestroyed"));
		this.grid.indirectSelector = this;
	}, formatNode:function (inDatum, inRowIndex) {
		if (!this.widgetClass) {
			return inDatum;
		}
		var currWidget = this.widgetMap[inRowIndex];
		var cellNode = this.getNode(inRowIndex);
		if (!cellNode) {
			return;
		}
		var inNode = cellNode.firstChild;
		if (!inNode) {
			inNode = cellNode.appendChild(dojo.create("div"));
			console.warn("NO first child for cellNode");
		}
		if (!currWidget) {
			var value = this.getDefaultValue(false, inRowIndex);
			if (!this.widgetProps) {
				this.widgetProps = {};
			}
			this.widgetProps.name = "select_" + this.grid.id;
			this.widgetProps.id = this.grid.id + "_row_" + inRowIndex;
			this.widgetProps.checked = value;
			currWidget = this.createWidget(inNode, inDatum, inRowIndex);
			this.widgetMap[inRowIndex] = currWidget;
			var conns = this._connects[currWidget.id] = [];
			conns.push(dojo.connect(currWidget, "_onClick", dojo.hitch(this, function (e) {
				this._selectRow(e, inRowIndex);
			})));
			conns.push(dojo.connect(currWidget.domNode, "onkeyup", dojo.hitch(this, function (e) {
				e.keyCode == dojo.keys.SPACE && this._selectRow(e, inRowIndex, true);
			})));
			this._select(inRowIndex, value);
		} else {
			if (currWidget.domNode != inNode) {
				cellNode.appendChild(currWidget.domNode);
			}
		}
		if (!this.widget) {
			this.widget = currWidget;
		}
		var views = this.grid.views, lastRows = this.grid.lastRenderingRows;
		views.views.length > 1 && views.renormalizeRow(inRowIndex);
		var matched = dojo.some(lastRows, function (row, i, rows) {
			if (inRowIndex == row) {
				dojo.hitch(this.grid.scroller, "rowHeightChanged")(row);
				rows.splice(i, 1);
				return true;
			}
		});
		matched && dojo.removeClass(this.grid.domNode, "dojoxGridSortInProgress");
	}, getDefaultValue:function (widget, inRowIndex) {
		var value = widget ? widget.attr("checked") : this.defaultValue;
		if (!widget) {
			if (this.grid.nestedSorting) {
				value = value || this.grid.getStoreSelectedValue(inRowIndex);
			}
			value = this.grid.selection.isSelected(inRowIndex) ? true : value;
		}
		return value;
	}, focus:function (inRowIndex) {
		var widget = this.widgetMap[inRowIndex];
		if (widget) {
			setTimeout(dojo.hitch(widget, function () {
				dojox.grid.util.fire(this, "focus");
			}), 0);
		}
	}, _focusEndingCell:function (inRowIndex, cellIndex) {
		var cell = this.grid.getCell(cellIndex);
		this.grid.focus.setFocusCell(cell, inRowIndex);
		this.grid.isDndSelectEnable && this.grid.focus._blurRowBar();
	}, _selectRow:function (e, inRowIndex, preChange) {
		if (dojo.isMoz && preChange) {
			return;
		}
		dojo.stopEvent(e);
		this._focusEndingCell(inRowIndex, 0);
		var value = !this.grid.selection.selected[inRowIndex];
		this.grid.selection.deselectAll();
		this.grid.selection.addToSelection(inRowIndex);
		if (!dojo.isMoz) {
			var widget = this.widgetMap[inRowIndex];
			widget.attr("checked", true);
		}
		this._fireSelectionChanged();
	}, toggleRow:function (idx, value) {
		var currSelectIdx = dojox.grid.Selection.prototype.getFirstSelected.call(this.grid.selection);
		if (idx != currSelectIdx && !value || idx == currSelectIdx && value) {
			return;
		}
		var widget;
		if (idx != currSelectIdx && value && (widget = this.widgetMap[currSelectIdx])) {
			widget.attr("checked", false);
		}
		this.grid.selection.deselectAll();
		this._toggleSingleRow(idx, value);
	}, setDisabled:function (idx, disabled) {
		var widget = this.widgetMap[idx];
		widget && widget.attr("disabled", disabled);
	}, _pageDestroyed:function (inPageIndex) {
		var rowsPerPage = this.grid.scroller.rowsPerPage;
		var start = inPageIndex * rowsPerPage, end = start + rowsPerPage - 1;
		var r, w, map = this.widgetMap;
		if (!map) {
			return;
		}
		for (r = start; r <= end; r++) {
			w = map[r], rowId = this.grid.id + "_row_" + r;
			if (this._connects[rowId]) {
				dojo.forEach(this._connects[rowId], dojo.disconnect);
				delete this._connects[rowId];
			}
			if (w && w.destroy) {
				w.destroy();
				delete map[r];
			}
		}
	}, destroy:function () {
		var w, map = this.widgetMap;
		for (w in map) {
			map[w].destroy && map[w].destroy();
			delete map[w];
		}
		for (x in this._connects) {
			dojo.forEach(this._connects[x], dojo.disconnect);
			delete this._connects[x];
		}
		for (x in this._subscribes) {
			dojo.forEach(this._subscribes[x], dojo.unsubscribe);
			delete this._subscribes[x];
		}
		delete this._connects;
		delete this._subscribes;
	}});
	dojo.declare("dojox.grid.cells.DijitMultipleRowSelector", [dojox.grid.cells.DijitSingleRowSelector, dojox.grid.cells._MultipleRowSelectorMixin], {widgetClass:dijit.form.CheckBox, constructor:function () {
		this._connects["col"].push(dojo.connect(dojo.doc, "onmouseup", this, "domouseup"));
		this.grid.indirectSelector = this;
	}, _selectRow:function (e, inRowIndex, preChange) {
		dojo.stopEvent(e);
		this._focusEndingCell(inRowIndex, 0);
		var delta = inRowIndex - this.lastClickRowIdx;
		if (this.lastClickRowIdx >= 0 && !e.ctrlKey && !e.altKey && e.shiftKey) {
			var newValue = this.widgetMap[inRowIndex].attr("checked");
			newValue = preChange ? !newValue : newValue;
			for (var i in this.widgetMap) {
				var idx = new Number(i);
				var inRange = (idx >= (delta > 0 ? this.lastClickRowIdx : inRowIndex) && idx <= (delta > 0 ? inRowIndex : this.lastClickRowIdx));
				if (inRange) {
					var widget = this.widgetMap[idx];
					widget.attr("checked", newValue);
					this._select(idx, newValue);
				}
			}
		} else {
			var value = !this.grid.selection.selected[inRowIndex];
			var widget = this.widgetMap[inRowIndex];
			widget.attr("checked", value);
			this._select(inRowIndex, value);
		}
		this.lastClickRowIdx = inRowIndex;
		this._fireSelectionChanged();
	}, toggleRow:function (idx, value) {
		this._toggleSingleRow(idx, value);
	}});
}

