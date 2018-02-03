/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.mobile.compat"]) {
	dojo._hasResource["dojox.mobile.compat"] = true;
	dojo.provide("dojox.mobile.compat");
	dojo.require("dojo._base.fx");
	dojo.require("dojo.fx");
	dojo.require("dojox.fx.flip");
	dojo.extend(dojox.mobile.View, {_doTransition:function (fromNode, toNode, transition, dir) {
		var anim;
		this.wakeUp(toNode);
		if (!transition || transition == "none") {
			toNode.style.display = "";
			fromNode.style.display = "none";
			toNode.style.left = "0px";
			this.invokeCallback();
		} else {
			if (transition == "slide") {
				var w = fromNode.offsetWidth;
				var s1 = dojo.fx.slideTo({node:fromNode, duration:400, left:-w * dir, top:fromNode.offsetTop});
				var s2 = dojo.fx.slideTo({node:toNode, duration:400, left:0});
				toNode.style.position = "absolute";
				toNode.style.left = w * dir + "px";
				toNode.style.display = "";
				anim = dojo.fx.combine([s1, s2]);
				dojo.connect(anim, "onEnd", this, function () {
					fromNode.style.display = "none";
					toNode.style.position = "relative";
					this.invokeCallback();
				});
				anim.play();
			} else {
				if (transition == "flip") {
					anim = dojox.fx.flip({node:fromNode, dir:"right", depth:0.5, duration:400});
					toNode.style.position = "absolute";
					toNode.style.left = "0px";
					dojo.connect(anim, "onEnd", this, function () {
						fromNode.style.display = "none";
						toNode.style.position = "relative";
						toNode.style.display = "";
						this.invokeCallback();
					});
					anim.play();
				} else {
					if (transition == "fade") {
						anim = dojo.fx.chain([dojo.fadeOut({node:fromNode, duration:600}), dojo.fadeIn({node:toNode, duration:600})]);
						toNode.style.position = "absolute";
						toNode.style.left = "0px";
						toNode.style.display = "";
						dojo.style(toNode, "opacity", 0);
						dojo.connect(anim, "onEnd", this, function () {
							fromNode.style.display = "none";
							toNode.style.position = "relative";
							dojo.style(fromNode, "opacity", 1);
							this.invokeCallback();
						});
						anim.play();
					}
				}
			}
		}
	}, wakeUp:function (node) {
		if (dojo.isIE && !node._wokeup) {
			node._wokeup = true;
			var disp = node.style.display;
			node.style.display = "";
			var nodes = node.getElementsByTagName("*");
			for (var i = 0, len = nodes.length; i < len; i++) {
				var val = nodes[i].style.display;
				nodes[i].style.display = "none";
				nodes[i].style.display = "";
				nodes[i].style.display = val;
			}
			node.style.display = disp;
		}
	}});
	dojo.extend(dojox.mobile.Switch, {buildRendering:function () {
		this.domNode = this.srcNodeRef || dojo.doc.createElement("DIV");
		this.domNode.className = "mblSwitch";
		this.domNode.innerHTML = "<div class=\"mblSwitchInner\">" + "<div class=\"mblSwitchBg mblSwitchBgLeft\">" + "<div class=\"mblSwitchCorner mblSwitchCorner1T\"></div>" + "<div class=\"mblSwitchCorner mblSwitchCorner2T\"></div>" + "<div class=\"mblSwitchCorner mblSwitchCorner3T\"></div>" + "<div class=\"mblSwitchText mblSwitchTextLeft\">" + this.leftLabel + "</div>" + "<div class=\"mblSwitchCorner mblSwitchCorner1B\"></div>" + "<div class=\"mblSwitchCorner mblSwitchCorner2B\"></div>" + "<div class=\"mblSwitchCorner mblSwitchCorner3B\"></div>" + "</div>" + "<div class=\"mblSwitchBg mblSwitchBgRight\">" + "<div class=\"mblSwitchCorner mblSwitchCorner1T\"></div>" + "<div class=\"mblSwitchCorner mblSwitchCorner2T\"></div>" + "<div class=\"mblSwitchCorner mblSwitchCorner3T\"></div>" + "<div class=\"mblSwitchText mblSwitchTextRight\">" + this.rightLabel + "</div>" + "<div class=\"mblSwitchCorner mblSwitchCorner1B\"></div>" + "<div class=\"mblSwitchCorner mblSwitchCorner2B\"></div>" + "<div class=\"mblSwitchCorner mblSwitchCorner3B\"></div>" + "</div>" + "<div class=\"mblSwitchKnobContainer\">" + "<div class=\"mblSwitchCorner mblSwitchCorner1T\"></div>" + "<div class=\"mblSwitchCorner mblSwitchCorner2T\"></div>" + "<div class=\"mblSwitchCorner mblSwitchCorner3T\"></div>" + "<div class=\"mblSwitchKnob\"></div>" + "<div class=\"mblSwitchCorner mblSwitchCorner1B\"></div>" + "<div class=\"mblSwitchCorner mblSwitchCorner2B\"></div>" + "<div class=\"mblSwitchCorner mblSwitchCorner3B\"></div>" + "</div>" + "</div>";
		var n = this.inner = this.domNode.firstChild;
		this.left = n.childNodes[0];
		this.right = n.childNodes[1];
		this.knob = n.childNodes[2];
		dojo.addClass(this.domNode, (this.value == "on") ? "mblSwitchOn" : "mblSwitchOff");
		this[this.value == "off" ? "left" : "right"].style.display = "none";
	}, _changeState:function (state) {
		if (!this.inner.parentNode || !this.inner.parentNode.tagName) {
			dojo.addClass(this.domNode, (state == "on") ? "mblSwitchOn" : "mblSwitchOff");
			return;
		}
		var pos;
		if (this.inner.offsetLeft == 0) {
			if (state == "on") {
				return;
			}
			pos = -53;
		} else {
			if (state == "off") {
				return;
			}
			pos = 0;
		}
		var a = dojo.fx.slideTo({node:this.inner, duration:500, left:pos});
		var _this = this;
		dojo.connect(a, "onEnd", function () {
			_this[state == "off" ? "left" : "right"].style.display = "none";
		});
		a.play();
	}});
	if (dojo.isIE) {
		dojo.extend(dojox.mobile.RoundRect, {buildRendering:function () {
			dojox.mobile.createRoundRect(this);
			this.domNode.className = "mblRoundRect";
		}});
		dojox.mobile.RoundRectList._addChild = dojox.mobile.RoundRectList.prototype.addChild;
		dojo.extend(dojox.mobile.RoundRectList, {buildRendering:function () {
			dojox.mobile.createRoundRect(this, true);
			this.domNode.className = "mblRoundRectList";
		}, postCreate:function () {
			this.redrawBorders();
		}, addChild:function (widget) {
			dojox.mobile.RoundRectList._addChild.apply(this, arguments);
			this.redrawBorders();
			if (dojox.mobile.applyPngFilter) {
				dojox.mobile.applyPngFilter(widget.domNode);
			}
		}, redrawBorders:function () {
			var lastChildFound = false;
			for (var i = this.containerNode.childNodes.length - 1; i >= 0; i--) {
				var c = this.containerNode.childNodes[i];
				if (c.tagName == "LI") {
					c.style.borderBottomStyle = lastChildFound ? "solid" : "none";
					lastChildFound = true;
				}
			}
		}});
		dojo.extend(dojox.mobile.EdgeToEdgeList, {buildRendering:function () {
			this.domNode = this.containerNode = this.srcNodeRef || dojo.doc.createElement("UL");
			this.domNode.className = "mblEdgeToEdgeList";
		}});
		dojox.mobile.IconContainer._addChild = dojox.mobile.IconContainer.prototype.addChild;
		dojo.extend(dojox.mobile.IconContainer, {addChild:function (widget) {
			dojox.mobile.IconContainer._addChild.apply(this, arguments);
			if (dojox.mobile.applyPngFilter) {
				dojox.mobile.applyPngFilter(widget.domNode);
			}
		}});
		dojo.mixin(dojox.mobile, {createRoundRect:function (_this, isList) {
			var i;
			_this.domNode = dojo.doc.createElement("DIV");
			_this.domNode.style.padding = "0px";
			_this.domNode.style.backgroundColor = "transparent";
			_this.domNode.style.borderStyle = "none";
			_this.containerNode = dojo.doc.createElement(isList ? "UL" : "DIV");
			_this.containerNode.className = "mblRoundRectContainer";
			if (_this.srcNodeRef) {
				_this.srcNodeRef.parentNode.replaceChild(_this.domNode, _this.srcNodeRef);
				for (i = 0, len = _this.srcNodeRef.childNodes.length; i < len; i++) {
					_this.containerNode.appendChild(_this.srcNodeRef.removeChild(_this.srcNodeRef.firstChild));
				}
				_this.srcNodeRef = null;
			}
			_this.domNode.appendChild(_this.containerNode);
			for (i = 0; i <= 5; i++) {
				var top = dojo.create("DIV");
				top.className = "mblRoundCorner mblRoundCorner" + i + "T";
				_this.domNode.insertBefore(top, _this.containerNode);
				var bottom = dojo.create("DIV");
				bottom.className = "mblRoundCorner mblRoundCorner" + i + "B";
				_this.domNode.appendChild(bottom);
			}
		}});
	}
	if (dojo.isIE <= 6) {
		dojox.mobile.applyPngFilter = function (root) {
			root = root || dojo.body();
			var nodes = root.getElementsByTagName("IMG");
			var blank = dojo.moduleUrl("dojo", "resources/blank.gif");
			for (var i = 0, len = nodes.length; i < len; i++) {
				var img = nodes[i];
				var w = img.offsetWidth;
				var h = img.offsetHeight;
				if (w === 0 || h === 0) {
					return;
				}
				var src = img.src;
				if (src.indexOf("resources/blank.gif") != -1) {
					continue;
				}
				img.src = blank;
				img.runtimeStyle.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + src + "')";
				img.style.width = w + "px";
				img.style.height = h + "px";
			}
		};
	}
	dojox.mobile.loadCss = function (files) {
		if (!dojo.global._loadedCss) {
			var obj = {};
			dojo.forEach(dojo.doc.getElementsByTagName("link"), function (item) {
				obj[item.href] = true;
			});
			dojo.global._loadedCss = obj;
		}
		if (!dojo.isArray(files)) {
			files = [files];
		}
		for (var i = 0; i < files.length; i++) {
			var file = files[i];
			if (!dojo.global._loadedCss[file]) {
				dojo.global._loadedCss[file] = true;
				if (dojo.doc.createStyleSheet) {
					setTimeout(function (file) {
						return function () {
							dojo.doc.createStyleSheet(file);
						};
					}(file), 0);
				} else {
					var link = dojo.doc.createElement("link");
					link.href = file;
					link.type = "text/css";
					link.rel = "stylesheet";
					var head = dojo.doc.getElementsByTagName("head")[0];
					head.appendChild(link);
				}
			}
		}
	};
	dojox.mobile.loadCompatCssFiles = function () {
		var elems = dojo.doc.getElementsByTagName("link");
		for (var i = 0, len = elems.length; i < len; i++) {
			var href = elems[i].href;
			if ((href.indexOf("/mobile/themes/") != -1 || location.href.indexOf("/mobile/tests/") != -1) && href.substring(href.length - 4) == ".css") {
				var compatCss = href.substring(0, href.length - 4) + "-compat.css";
				dojox.mobile.loadCss(compatCss);
			}
		}
	};
	dojo.addOnLoad(function () {
		dojox.mobile.loadCompatCssFiles();
		if (dojox.mobile.applyPngFilter) {
			dojox.mobile.applyPngFilter();
		}
	});
}

