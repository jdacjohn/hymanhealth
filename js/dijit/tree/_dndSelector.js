/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.tree._dndSelector"]) {
	dojo._hasResource["dijit.tree._dndSelector"] = true;
	dojo.provide("dijit.tree._dndSelector");
	dojo.require("dojo.dnd.common");
	dojo.require("dijit.tree._dndContainer");
	dijit.tree._compareNodes = function (n1, n2) {
		if (n1 === n2) {
			return 0;
		}
		if ("sourceIndex" in document.documentElement) {
			return n1.sourceIndex - n2.sourceIndex;
		} else {
			if ("compareDocumentPosition" in document.documentElement) {
				return n1.compareDocumentPosition(n2) & 2 ? 1 : -1;
			} else {
				if (document.createRange) {
					var r1 = doc.createRange();
					r1.setStartBefore(n1);
					var r2 = doc.createRange();
					r2.setStartBefore(n2);
					return r1.compareBoundaryPoints(r1.END_TO_END, r2);
				} else {
					throw Error("dijit.tree._compareNodes don't know how to compare two different nodes in this browser");
				}
			}
		}
	};
	dojo.declare("dijit.tree._dndSelector", dijit.tree._dndContainer, {constructor:function (tree, params) {
		this.selection = {};
		this.anchor = null;
		this.events.push(dojo.connect(this.tree.domNode, "onmousedown", this, "onMouseDown"), dojo.connect(this.tree.domNode, "onmouseup", this, "onMouseUp"), dojo.connect(this.tree.domNode, "onmousemove", this, "onMouseMove"));
	}, singular:false, getSelectedTreeNodes:function () {
		var nodes = [], sel = this.selection;
		for (var i in sel) {
			nodes.push(sel[i]);
		}
		return nodes;
	}, selectNone:function () {
		var sel = this.selection;
		for (var i in sel) {
			this.removeTreeNode(sel[i]);
		}
		return this;
	}, destroy:function () {
		this.inherited(arguments);
		this.selection = this.anchor = null;
	}, addTreeNode:function (node, isAnchor) {
		if (isAnchor) {
			if (this.anchor == node) {
				return node;
			}
			this.anchor = node;
		}
		this._addItemClass(node.rowNode, "Selected");
		this.selection[node.id] = node;
		return node;
	}, removeTreeNode:function (node) {
		this._removeItemClass(node.rowNode, "Selected");
		if (this.anchor == node) {
			delete this.anchor;
		}
		delete this.selection[node.id];
		return node;
	}, isTreeNodeSelected:function (node) {
		return node.id && !!this.selection[node.id];
	}, onMouseDown:function (e) {
		if (!this.current) {
			return;
		}
		if (e.button == dojo.mouseButtons.RIGHT) {
			return;
		}
		dojo.stopEvent(e);
		var treeNode = this.current, copy = dojo.isCopyKey(e), id = treeNode.id;
		if (!this.singular && !e.shiftKey && this.selection[id]) {
			this._doDeselect = true;
			return;
		} else {
			this._doDeselect = false;
		}
		if (this.singular) {
			if (this.anchor == treeNode) {
				if (dojo.isCopyKey(e)) {
					this.selectNone();
				}
			} else {
				this.selectNone();
				this.addTreeNode(treeNode, true);
			}
		} else {
			if (e.shiftKey && this.anchor) {
				var cr = dijit.tree._compareNodes(this.anchor.rowNode, treeNode.rowNode), begin, end, anchor = this.anchor;
				if (cr) {
					if (cr < 0) {
						begin = anchor;
						end = treeNode;
					} else {
						begin = treeNode;
						end = anchor;
					}
					this.selectNone();
					while (begin) {
						this.addTreeNode(begin, begin === anchor);
						if (begin === end) {
							break;
						}
						begin = this.tree._getNextNode(begin);
					}
				}
			} else {
				if (!copy) {
					this.selectNone();
				}
				this.addTreeNode(treeNode, true);
			}
		}
	}, onMouseUp:function (e) {
		if (!this._doDeselect) {
			return;
		}
		this._doDeselect = false;
		if (dojo.isCopyKey(e)) {
			this.removeTreeNode(this.current);
		} else {
			this.selectNone();
			if (this.current) {
				this.addTreeNode(this.current, true);
			}
		}
	}, onMouseMove:function (e) {
		this._doDeselect = false;
	}, forInSelectedItems:function (f, o) {
		o = o || dojo.global;
		for (var id in this.selection) {
			f.call(o, this.getItem(id), id, this);
		}
	}});
}

