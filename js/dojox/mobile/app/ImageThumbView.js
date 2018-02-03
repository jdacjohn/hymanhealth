/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.mobile.app.ImageThumbView"]) {
	dojo._hasResource["dojox.mobile.app.ImageThumbView"] = true;
	dojo.provide("dojox.mobile.app.ImageThumbView");
	dojo.experimental("dojox.mobile.app.ImageThumbView");
	dojo.require("dijit._Widget");
	dojo.require("dojo.string");
	dojo.declare("dojox.mobile.app.ImageThumbView", dijit._Widget, {items:[], urlParam:"url", itemTemplate:"<div class=\"mblThumbInner\">" + "<div class=\"mblThumbOverlay\"></div>" + "<div class=\"mblThumbMask\">" + "<div class=\"mblThumbSrc\" style=\"background-image:url(${url})\"></div>" + "</div>" + "</div>", minPadding:5, maxPerRow:3, baseClass:"mblImageThumbView", thumbSize:"medium", selectedIndex:-1, cache:null, clickEvent:"onclick", cacheBust:false, constructor:function (params, node) {
	}, postCreate:function () {
		this.inherited(arguments);
		var _this = this;
		var hoverCls = "mblThumbHover";
		this.addThumb = dojo.hitch(this, this.addThumb);
		this.handleImgLoad = dojo.hitch(this, this.handleImgLoad);
		this._onLoadImages = {};
		this.cache = [];
		this.visibleImages = [];
		this._cacheCounter = 0;
		this.connect(this.domNode, this.clickEvent, function (event) {
			var itemNode = _this._getItemNodeFromEvent(event);
			if (itemNode) {
				_this.onSelect(itemNode._item, itemNode._index, _this.items);
				dojo.query(".selected", this.domNode).removeClass("selected");
				dojo.addClass(itemNode, "selected");
			}
		});
		dojo.addClass(this.domNode, this.thumbSize);
		this.resize();
		this.render();
	}, onSelect:function (item, index, items) {
	}, _setItemsAttr:function (items) {
		this.items = items || [];
		this.render();
	}, _getItemNode:function (node) {
		while (node && !dojo.hasClass(node, "mblThumb") && node != this.domNode) {
			node = node.parentNode;
		}
		return (node == this.domNode) ? null : node;
	}, _getItemNodeFromEvent:function (event) {
		if (event.touches && event.touches.length > 0) {
			event = event.touches[0];
		}
		return this._getItemNode(event.target);
	}, resize:function () {
		this._thumbSize = null;
		this._size = dojo.contentBox(this.domNode);
		this.render();
	}, render:function () {
		var i;
		var url;
		var item;
		var thumb;
		while (this.visibleImages && this.visibleImages.length > 0) {
			thumb = this.visibleImages.pop();
			this.cache.push(thumb);
			dojo.addClass(thumb, "hidden");
			thumb._cached = true;
		}
		if (!this.items || this.items.length == 0) {
			return;
		}
		for (i = 0; i < this.items.length; i++) {
			item = this.items[i];
			url = (dojo.isString(item) ? item : item[this.urlParam]);
			this.addThumb(item, url, i);
		}
		if (!this._thumbSize) {
			return;
		}
		var column = 0;
		var row = -1;
		var totalThumbWidth = this._thumbSize.w + (this.padding * 2);
		var totalThumbHeight = this._thumbSize.h + (this.padding * 2);
		var pos = 0;
		var nodes = this.visibleImages;
		for (i = 0; i < nodes.length; i++) {
			if (nodes[i]._cached) {
				continue;
			}
			if (pos % this.maxPerRow == 0) {
				row++;
			}
			column = pos % this.maxPerRow;
			this.place(nodes[i], (column * totalThumbWidth) + this.padding, (row * totalThumbHeight) + this.padding);
			if (!nodes[i]._loading) {
				dojo.removeClass(nodes[i], "hidden");
			}
			if (pos == this.selectedIndex) {
				dojo[pos == this.selectedIndex ? "addClass" : "removeClass"](nodes[i], "selected");
			}
			pos++;
		}
		var numRows = Math.ceil(pos / this.maxPerRow);
		if (this._numRows != numRows) {
			this._numRows = numRows;
			dojo.style(this.domNode, "height", (numRows * (this._thumbSize.h + this.padding * 2)) + "px");
		}
	}, addThumb:function (item, url, index) {
		var thumbDiv;
		if (this.cache.length > 0) {
			for (var i = 0; i < this.cache.length; i++) {
				if (this.cache[i]._url == url) {
					thumbDiv = this.cache.splice(i, 1)[0];
					break;
				}
			}
			if (!thumbDiv) {
				thumbDiv = this.cache.pop();
			}
			dojo.removeClass(thumbDiv, "selected");
		} else {
			thumbDiv = this.createThumb(url);
		}
		dojo.addClass(thumbDiv, "hidden");
		var loader = dojo.create("img", {});
		loader._thumbDiv = thumbDiv;
		loader._conn = dojo.connect(loader, "onload", this.handleImgLoad);
		loader._url = url;
		thumbDiv._loading = true;
		this._onLoadImages[url] = loader;
		loader.src = url;
		this.visibleImages.push(thumbDiv);
		thumbDiv._index = index;
		thumbDiv._item = item;
		thumbDiv._url = url;
		thumbDiv._cached = false;
		if (!this._thumbSize) {
			this.calcSize();
			this.calcPadding();
		}
	}, calcSize:function () {
		if (!this.sizeThumb) {
			this.sizeThumb = this.createThumb("");
			dojo.removeClass(this.sizeThumb, "mblAnimated");
		}
		dojo.place(this.sizeThumb, this.domNode);
		this._thumbSize = dojo.marginBox(this.sizeThumb);
		this.domNode.removeChild(this.sizeThumb);
	}, createThumb:function (url) {
		return dojo.create("div", {"class":"mblThumb hidden mblAnimated", innerHTML:dojo.string.substitute(this.itemTemplate, {url:url}, null, this)}, this.domNode);
	}, handleImgLoad:function (event) {
		var img = event.target;
		dojo.disconnect(img._conn);
		dojo.removeClass(img._thumbDiv, "hidden");
		img._thumbDiv._loading = false;
		var url = img._url;
		if (this.cacheBust) {
			url += (url.indexOf("?") > -1 ? "&" : "?") + "cacheBust=" + (new Date()).getTime() + "_" + (this._cacheCounter++);
		}
		dojo.query(".mblThumbSrc", img._thumbDiv).style("backgroundImage", "url(" + url + ")");
		delete this._onLoadImages[img._url];
	}, calcPadding:function () {
		var width = this._size.w;
		var thumbWidth = this._thumbSize.w;
		var imgBounds = thumbWidth + this.minPadding;
		this.maxPerRow = Math.floor(width / imgBounds);
		this.padding = Math.floor((width - (thumbWidth * this.maxPerRow)) / (this.maxPerRow * 2));
	}, place:function (node, x, y) {
		dojo.style(node, {"-webkit-transform":"translate(" + x + "px," + y + "px)"});
	}, _isTranslate:function (str) {
		return dojo.trim(str).indexOf("translate") != 0;
	}});
}

