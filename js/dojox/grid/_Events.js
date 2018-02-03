/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.grid._Events"]) {
	dojo._hasResource["dojox.grid._Events"] = true;
	dojo.provide("dojox.grid._Events");
	dojo.declare("dojox.grid._Events", null, {cellOverClass:"dojoxGridCellOver", onKeyEvent:function (e) {
		this.dispatchKeyEvent(e);
	}, onContentEvent:function (e) {
		this.dispatchContentEvent(e);
	}, onHeaderEvent:function (e) {
		this.dispatchHeaderEvent(e);
	}, onStyleRow:function (inRow) {
		var i = inRow;
		i.customClasses += (i.odd ? " dojoxGridRowOdd" : "") + (i.selected ? " dojoxGridRowSelected" : "") + (i.over ? " dojoxGridRowOver" : "");
		this.focus.styleRow(inRow);
		this.edit.styleRow(inRow);
	}, onKeyDown:function (e) {
		if (e.altKey || e.metaKey) {
			return;
		}
		var dk = dojo.keys;
		var colIdx;
		switch (e.keyCode) {
		  case dk.ESCAPE:
			this.edit.cancel();
			break;
		  case dk.ENTER:
			if (!this.edit.isEditing()) {
				colIdx = this.focus.getHeaderIndex();
				if (colIdx >= 0) {
					this.setSortIndex(colIdx);
					break;
				} else {
					this.selection.clickSelect(this.focus.rowIndex, dojo.isCopyKey(e), e.shiftKey);
				}
				dojo.stopEvent(e);
			}
			if (!e.shiftKey) {
				var isEditing = this.edit.isEditing();
				this.edit.apply();
				if (!isEditing) {
					this.edit.setEditCell(this.focus.cell, this.focus.rowIndex);
				}
			}
			if (!this.edit.isEditing()) {
				var curView = this.focus.focusView || this.views.views[0];
				curView.content.decorateEvent(e);
				this.onRowClick(e);
			}
			break;
		  case dk.SPACE:
			if (!this.edit.isEditing()) {
				colIdx = this.focus.getHeaderIndex();
				if (colIdx >= 0) {
					this.setSortIndex(colIdx);
					break;
				} else {
					this.selection.clickSelect(this.focus.rowIndex, dojo.isCopyKey(e), e.shiftKey);
				}
				dojo.stopEvent(e);
			}
			break;
		  case dk.TAB:
			this.focus[e.shiftKey ? "previousKey" : "nextKey"](e);
			break;
		  case dk.LEFT_ARROW:
		  case dk.RIGHT_ARROW:
			if (!this.edit.isEditing()) {
				var keyCode = e.keyCode;
				dojo.stopEvent(e);
				colIdx = this.focus.getHeaderIndex();
				if (colIdx >= 0 && (e.shiftKey && e.ctrlKey)) {
					this.focus.colSizeAdjust(e, colIdx, (keyCode == dk.LEFT_ARROW ? -1 : 1) * 5);
				} else {
					var offset = (keyCode == dk.LEFT_ARROW) ? 1 : -1;
					if (dojo._isBodyLtr()) {
						offset *= -1;
					}
					this.focus.move(0, offset);
				}
			}
			break;
		  case dk.UP_ARROW:
			if (!this.edit.isEditing() && this.focus.rowIndex !== 0) {
				dojo.stopEvent(e);
				this.focus.move(-1, 0);
			}
			break;
		  case dk.DOWN_ARROW:
			if (!this.edit.isEditing() && this.focus.rowIndex + 1 != this.rowCount) {
				dojo.stopEvent(e);
				this.focus.move(1, 0);
			}
			break;
		  case dk.PAGE_UP:
			if (!this.edit.isEditing() && this.focus.rowIndex !== 0) {
				dojo.stopEvent(e);
				if (this.focus.rowIndex != this.scroller.firstVisibleRow + 1) {
					this.focus.move(this.scroller.firstVisibleRow - this.focus.rowIndex, 0);
				} else {
					this.setScrollTop(this.scroller.findScrollTop(this.focus.rowIndex - 1));
					this.focus.move(this.scroller.firstVisibleRow - this.scroller.lastVisibleRow + 1, 0);
				}
			}
			break;
		  case dk.PAGE_DOWN:
			if (!this.edit.isEditing() && this.focus.rowIndex + 1 != this.rowCount) {
				dojo.stopEvent(e);
				if (this.focus.rowIndex != this.scroller.lastVisibleRow - 1) {
					this.focus.move(this.scroller.lastVisibleRow - this.focus.rowIndex - 1, 0);
				} else {
					this.setScrollTop(this.scroller.findScrollTop(this.focus.rowIndex + 1));
					this.focus.move(this.scroller.lastVisibleRow - this.scroller.firstVisibleRow - 1, 0);
				}
			}
			break;
		  default:
			break;
		}
	}, onMouseOver:function (e) {
		e.rowIndex == -1 ? this.onHeaderCellMouseOver(e) : this.onCellMouseOver(e);
	}, onMouseOut:function (e) {
		e.rowIndex == -1 ? this.onHeaderCellMouseOut(e) : this.onCellMouseOut(e);
	}, onMouseDown:function (e) {
		e.rowIndex == -1 ? this.onHeaderCellMouseDown(e) : this.onCellMouseDown(e);
	}, onMouseOverRow:function (e) {
		if (!this.rows.isOver(e.rowIndex)) {
			this.rows.setOverRow(e.rowIndex);
			e.rowIndex == -1 ? this.onHeaderMouseOver(e) : this.onRowMouseOver(e);
		}
	}, onMouseOutRow:function (e) {
		if (this.rows.isOver(-1)) {
			this.onHeaderMouseOut(e);
		} else {
			if (!this.rows.isOver(-2)) {
				this.rows.setOverRow(-2);
				this.onRowMouseOut(e);
			}
		}
	}, onMouseDownRow:function (e) {
		if (e.rowIndex != -1) {
			this.onRowMouseDown(e);
		}
	}, onCellMouseOver:function (e) {
		if (e.cellNode) {
			dojo.addClass(e.cellNode, this.cellOverClass);
		}
	}, onCellMouseOut:function (e) {
		if (e.cellNode) {
			dojo.removeClass(e.cellNode, this.cellOverClass);
		}
	}, onCellMouseDown:function (e) {
	}, onCellClick:function (e) {
		this._click[0] = this._click[1];
		this._click[1] = e;
		if (!this.edit.isEditCell(e.rowIndex, e.cellIndex)) {
			this.focus.setFocusCell(e.cell, e.rowIndex);
		}
		this.onRowClick(e);
	}, onCellDblClick:function (e) {
		if (this._click.length > 1 && dojo.isIE) {
			this.edit.setEditCell(this._click[1].cell, this._click[1].rowIndex);
		} else {
			if (this._click.length > 1 && this._click[0].rowIndex != this._click[1].rowIndex) {
				this.edit.setEditCell(this._click[0].cell, this._click[0].rowIndex);
			} else {
				this.edit.setEditCell(e.cell, e.rowIndex);
			}
		}
		this.onRowDblClick(e);
	}, onCellContextMenu:function (e) {
		this.onRowContextMenu(e);
	}, onCellFocus:function (inCell, inRowIndex) {
		this.edit.cellFocus(inCell, inRowIndex);
	}, onRowClick:function (e) {
		this.edit.rowClick(e);
		this.selection.clickSelectEvent(e);
	}, onRowDblClick:function (e) {
	}, onRowMouseOver:function (e) {
	}, onRowMouseOut:function (e) {
	}, onRowMouseDown:function (e) {
	}, onRowContextMenu:function (e) {
		dojo.stopEvent(e);
	}, onHeaderMouseOver:function (e) {
	}, onHeaderMouseOut:function (e) {
	}, onHeaderCellMouseOver:function (e) {
		if (e.cellNode) {
			dojo.addClass(e.cellNode, this.cellOverClass);
		}
	}, onHeaderCellMouseOut:function (e) {
		if (e.cellNode) {
			dojo.removeClass(e.cellNode, this.cellOverClass);
		}
	}, onHeaderCellMouseDown:function (e) {
	}, onHeaderClick:function (e) {
	}, onHeaderCellClick:function (e) {
		this.setSortIndex(e.cell.index);
		this.onHeaderClick(e);
	}, onHeaderDblClick:function (e) {
	}, onHeaderCellDblClick:function (e) {
		this.onHeaderDblClick(e);
	}, onHeaderCellContextMenu:function (e) {
		this.onHeaderContextMenu(e);
	}, onHeaderContextMenu:function (e) {
		if (!this.headerMenu) {
			dojo.stopEvent(e);
		}
	}, onStartEdit:function (inCell, inRowIndex) {
	}, onApplyCellEdit:function (inValue, inRowIndex, inFieldIndex) {
	}, onCancelEdit:function (inRowIndex) {
	}, onApplyEdit:function (inRowIndex) {
	}, onCanSelect:function (inRowIndex) {
		return true;
	}, onCanDeselect:function (inRowIndex) {
		return true;
	}, onSelected:function (inRowIndex) {
		this.updateRowStyles(inRowIndex);
	}, onDeselected:function (inRowIndex) {
		this.updateRowStyles(inRowIndex);
	}, onSelectionChanged:function () {
	}});
}

