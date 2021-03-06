/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.mobile.app.List"]) {
	dojo._hasResource["dojox.mobile.app.List"] = true;
	dojo.provide("dojox.mobile.app.List");
	dojo.experimental("dojox.mobile.app.List");
	dojo.require("dojo.string");
	dojo.require("dijit._Widget");
	(function () {
		var templateCache = {};
		dojo.declare("dojox.mobile.app.List", dijit._Widget, {items:null, itemTemplate:"", emptyTemplate:"", labelDelete:"Delete", labelCancel:"Cancel", controller:null, autoDelete:true, enableDelete:true, _templateLoadCount:0, _mouseDownPos:null, constructor:function () {
			this._checkLoadComplete = dojo.hitch(this, this._checkLoadComplete);
			this._replaceToken = dojo.hitch(this, this._replaceToken);
			this._postDeleteAnim = dojo.hitch(this, this._postDeleteAnim);
		}, postCreate:function () {
			var _this = this;
			if (this.emptyTemplate) {
				this._templateLoadCount++;
			}
			if (this.itemTemplate) {
				this._templateLoadCount++;
			}
			dojo.addClass(this.domNode, "list");
			var msg;
			this.connect(this.domNode, "onmousedown", function (event) {
				var touch = event;
				if (event.targetTouches && event.targetTouches.length > 0) {
					touch = event.targetTouches[0];
				}
				var rowNode = _this._getRowNode(event.target);
				if (rowNode) {
					_this._setDataInfo(rowNode, event);
					_this._selectRow(rowNode);
					_this._mouseDownPos = {x:touch.pageX, y:touch.pageY};
					_this._dragThreshold = null;
				} else {
					console.log("didnt get a node");
				}
			});
			this.connect(this.domNode, "onmouseup", function (event) {
				if (event.targetTouches && event.targetTouches.length > 0) {
					event = event.targetTouches[0];
				}
				var rowNode = _this._getRowNode(event.target);
				if (rowNode) {
					_this._setDataInfo(rowNode, event);
					if (_this._selectedRow) {
						_this.onSelect(rowNode._data, rowNode._idx, rowNode);
					}
					this._deselectRow();
				}
			});
			if (this.enableDelete) {
				this.connect(this.domNode, "mousemove", function (event) {
					dojo.stopEvent(event);
					if (!_this._selectedRow) {
						return;
					}
					var rowNode = _this._getRowNode(event.target);
					if (_this.enableDelete && rowNode && !_this._deleting) {
						_this.handleDrag(event);
					}
				});
			}
			this.connect(this.domNode, "onclick", function (event) {
				if (event.touches && event.touches.length > 0) {
					event = event.touches[0];
				}
				var rowNode = _this._getRowNode(event.target, true);
				if (rowNode) {
					_this._setDataInfo(rowNode, event);
				}
			});
			this.connect(this.domNode, "mouseout", function (event) {
				if (event.touches && event.touches.length > 0) {
					event = event.touches[0];
				}
				if (event.target == _this._selectedRow) {
					_this._deselectRow();
				}
			});
			if (!this.itemTemplate) {
				throw Error("An item template must be provided to " + this.declaredClass);
			}
			this._loadTemplate(this.itemTemplate, "itemTemplate", this._checkLoadComplete);
			if (this.emptyTemplate) {
				this._loadTemplate(this.emptyTemplate, "emptyTemplate", this._checkLoadComplete);
			}
		}, handleDrag:function (event) {
			var touch = event;
			if (event.targetTouches && event.targetTouches.length > 0) {
				touch = event.targetTouches[0];
			}
			var diff = touch.pageX - this._mouseDownPos.x;
			var absDiff = Math.abs(diff);
			if (absDiff > 10 && !this._dragThreshold) {
				this._dragThreshold = dojo.marginBox(this._selectedRow).w * 0.6;
				if (!this.autoDelete) {
					this.createDeleteButtons(this._selectedRow);
				}
			}
			this._selectedRow.style.left = (absDiff > 10 ? diff : 0) + "px";
			if (this._dragThreshold && this._dragThreshold < absDiff) {
				this.preDelete(diff);
			}
		}, handleDragCancel:function () {
			if (this._deleting) {
				return;
			}
			dojo.removeClass(this._selectedRow, "hold");
			this._selectedRow.style.left = 0;
			this._mouseDownPos = null;
			this._dragThreshold = null;
			this._deleteBtns && dojo.style(this._deleteBtns, "display", "none");
		}, preDelete:function (currentLeftPos) {
			var self = this;
			this._deleting = true;
			dojo.animateProperty({node:this._selectedRow, duration:400, properties:{left:{end:currentLeftPos + ((currentLeftPos > 0 ? 1 : -1) * this._dragThreshold * 0.8)}}, onEnd:dojo.hitch(this, function () {
				if (this.autoDelete) {
					this.deleteRow(this._selectedRow);
				}
			})}).play();
		}, deleteRow:function (row) {
			dojo.style(row, {visibility:"hidden", minHeight:"0px"});
			dojo.removeClass(row, "hold");
			this._deleteAnimConn = this.connect(row, "webkitAnimationEnd", this._postDeleteAnim);
			dojo.addClass(row, "collapsed");
		}, _postDeleteAnim:function (event) {
			if (this._deleteAnimConn) {
				this.disconnect(this._deleteAnimConn);
				this._deleteAnimConn = null;
			}
			var row = this._selectedRow;
			var sibling = row.nextSibling;
			row.parentNode.removeChild(row);
			this.onDelete(row._data, row._idx, this.items);
			while (sibling) {
				if (sibling._idx) {
					sibling._idx--;
				}
				sibling = sibling.nextSibling;
			}
			dojo.destroy(row);
			dojo.query("> *:not(.buttons)", this.domNode).forEach(this.applyClass);
			this._deleting = false;
			this._deselectRow();
		}, createDeleteButtons:function (aroundNode) {
			var mb = dojo.marginBox(aroundNode);
			var pos = dojo._abs(aroundNode, true);
			if (!this._deleteBtns) {
				this._deleteBtns = dojo.create("div", {"class":"buttons"}, this.domNode);
				this.buttons = [];
				this.buttons.push(new dojox.mobile.Button({btnClass:"mblRedButton", label:this.labelDelete}));
				this.buttons.push(new dojox.mobile.Button({btnClass:"mblBlueButton", label:this.labelCancel}));
				dojo.place(this.buttons[0].domNode, this._deleteBtns);
				dojo.place(this.buttons[1].domNode, this._deleteBtns);
				dojo.addClass(this.buttons[0].domNode, "deleteBtn");
				dojo.addClass(this.buttons[1].domNode, "cancelBtn");
				this._handleButtonClick = dojo.hitch(this._handleButtonClick);
				this.connect(this._deleteBtns, "onclick", this._handleButtonClick);
			}
			dojo.removeClass(this._deleteBtns, "fade out fast");
			dojo.style(this._deleteBtns, {display:"", width:mb.w + "px", height:mb.h + "px", top:(aroundNode.offsetTop) + "px", left:"0px"});
		}, onDelete:function (data, index, array) {
			array.splice(index, 1);
			if (array.length < 1) {
				this.render();
			}
		}, cancelDelete:function () {
			this._deleting = false;
			this.handleDragCancel();
		}, _handleButtonClick:function (event) {
			if (event.touches && event.touches.length > 0) {
				event = event.touches[0];
			}
			var node = event.target;
			if (dojo.hasClass(node, "deleteBtn")) {
				this.deleteRow(this._selectedRow);
			} else {
				if (dojo.hasClass(node, "cancelBtn")) {
					this.cancelDelete();
				} else {
					return;
				}
			}
			dojo.addClass(this._deleteBtns, "fade out");
		}, applyClass:function (node, idx, array) {
			dojo.removeClass(node, "first last");
			if (idx == 0) {
				dojo.addClass(node, "first");
			}
			if (idx == array.length - 1) {
				dojo.addClass(node, "last");
			}
		}, _setDataInfo:function (rowNode, event) {
			event.item = rowNode._data;
			event.index = rowNode._idx;
		}, onSelect:function (data, index, rowNode) {
		}, _selectRow:function (row) {
			if (this._deleting && this._selectedRow && row != this._selectedRow) {
				this.cancelDelete();
			}
			if (!dojo.hasClass(row, "row")) {
				return;
			}
			dojo.addClass(row, "hold");
			this._selectedRow = row;
		}, _deselectRow:function () {
			if (!this._selectedRow || this._deleting) {
				return;
			}
			this.handleDragCancel();
			dojo.removeClass(this._selectedRow, "hold");
			this._selectedRow = null;
		}, _getRowNode:function (fromNode, ignoreNoClick) {
			while (fromNode && !fromNode._data && fromNode != this.domNode) {
				if (!ignoreNoClick && dojo.hasClass(fromNode, "noclick")) {
					return null;
				}
				fromNode = fromNode.parentNode;
			}
			return fromNode;
		}, render:function () {
			dojo.query("> *:not(.buttons)", this.domNode).forEach(dojo.destroy);
			var rows = [];
			var row, i;
			dojo.addClass(this.domNode, "list");
			for (i = 0; i < this.items.length; i++) {
				row = dojo._toDom(dojo.string.substitute(this.itemTemplate, this.items[i], this._replaceToken, this));
				rows.push(row);
			}
			for (i = 0; i < this.items.length; i++) {
				rows[i]._data = this.items[i];
				rows[i]._idx = i;
				this.domNode.appendChild(rows[i]);
			}
			if (this.items.length < 1 && this.emptyTemplate) {
				dojo.place(dojo._toDom(this.emptyTemplate), this.domNode, "first");
			}
			if (dojo.hasClass(this.domNode.parentNode, "mblRoundRect")) {
				dojo.addClass(this.domNode.parentNode, "mblRoundRectList");
			}
			var divs = dojo.query("> div:not(.buttons)", this.domNode);
			divs.addClass("row");
			if (divs.length > 0) {
				dojo.addClass(divs[0], "first");
				dojo.addClass(divs[divs.length - 1], "last");
			}
		}, _replaceToken:function (value, key) {
			if (key.charAt(0) == "!") {
				value = dojo.getObject(key.substr(1), false, _this);
			}
			if (typeof value == "undefined") {
				return "";
			}
			if (value == null) {
				return "";
			}
			return key.charAt(0) == "!" ? value : value.toString().replace(/"/g, "&quot;");
		}, _checkLoadComplete:function () {
			this._templateLoadCount--;
			if (this._templateLoadCount < 1 && this.get("items")) {
				this.render();
			}
		}, _loadTemplate:function (url, thisAttr, callback) {
			if (!url) {
				callback();
				return;
			}
			if (templateCache[url]) {
				this.set(thisAttr, templateCache[url]);
				callback();
			} else {
				var _this = this;
				dojo.xhrGet({url:url, sync:false, handleAs:"text", load:function (text) {
					templateCache[url] = dojo.trim(text);
					_this.set(thisAttr, templateCache[url]);
					callback();
				}});
			}
		}, _setItemsAttr:function (items) {
			this.items = items || [];
			if (this._templateLoadCount < 1 && items) {
				this.render();
			}
		}, destroy:function () {
			if (this.buttons) {
				dojo.forEach(this.buttons, function (button) {
					button.destroy();
				});
				this.buttons = null;
			}
			this.inherited(arguments);
		}});
	})();
}

