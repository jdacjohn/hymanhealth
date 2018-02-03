/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.mobile._base"]) {
	dojo._hasResource["dojox.mobile._base"] = true;
	dojo.provide("dojox.mobile._base");
	dojo.require("dijit._Widget");
	dojo.declare("dojox.mobile.View", dijit._Widget, {selected:false, keepScrollPos:true, _started:false, constructor:function (params, node) {
		if (node) {
			dojo.byId(node).style.visibility = "hidden";
		}
	}, buildRendering:function () {
		this.domNode = this.containerNode = this.srcNodeRef || dojo.doc.createElement("DIV");
		this.domNode.className = "mblView";
		this.connect(this.domNode, "webkitAnimationEnd", "onAnimationEnd");
		this.connect(this.domNode, "webkitAnimationStart", "onAnimationStart");
		var id = location.href.match(/#(\w+)([^\w=]|$)/) ? RegExp.$1 : null;
		this._visible = this.selected && !id || this.id == id;
		if (this.selected) {
			dojox.mobile._defaultView = this;
		}
	}, startup:function () {
		if (this._started) {
			return;
		}
		var _this = this;
		setTimeout(function () {
			if (!_this._visible) {
				_this.domNode.style.display = "none";
			} else {
				dojox.mobile._currentView = _this;
				_this.onStartView();
			}
			_this.domNode.style.visibility = "visible";
		}, dojo.isIE ? 100 : 0);
		this._started = true;
	}, onStartView:function () {
	}, onBeforeTransitionIn:function (moveTo, dir, transition, context, method) {
	}, onAfterTransitionIn:function (moveTo, dir, transition, context, method) {
	}, onBeforeTransitionOut:function (moveTo, dir, transition, context, method) {
	}, onAfterTransitionOut:function (moveTo, dir, transition, context, method) {
	}, _saveState:function (moveTo, dir, transition, context, method) {
		this._context = context;
		this._method = method;
		if (transition == "none" || !dojo.isWebKit) {
			transition = null;
		}
		this._moveTo = moveTo;
		this._dir = dir;
		this._transition = transition;
		this._arguments = [];
		var i;
		for (i = 0; i < arguments.length; i++) {
			this._arguments.push(arguments[i]);
		}
		this._args = [];
		if (context || method) {
			for (i = 5; i < arguments.length; i++) {
				this._args.push(arguments[i]);
			}
		}
	}, performTransition:function (moveTo, dir, transition, context, method) {
		if (dojo.hash) {
			if (typeof (moveTo) == "string" && moveTo.charAt(0) == "#" && !dojox.mobile._params) {
				dojox.mobile._params = [];
				for (var i = 0; i < arguments.length; i++) {
					dojox.mobile._params.push(arguments[i]);
				}
				dojo.hash(moveTo);
				return;
			}
		}
		this._saveState.apply(this, arguments);
		var toNode;
		if (moveTo) {
			if (typeof (moveTo) == "string") {
				moveTo.match(/(\w+)/);
				toNode = RegExp.$1;
			} else {
				toNode = moveTo;
			}
		} else {
			if (!this._dummyNode) {
				this._dummyNode = dojo.doc.createElement("DIV");
				dojo.body().appendChild(this._dummyNode);
			}
			toNode = this._dummyNode;
		}
		var fromNode = this.domNode;
		toNode = this.toNode = dojo.byId(toNode);
		if (!toNode) {
			alert("dojox.mobile.View#performTransition: destination view not found: " + toNode);
		}
		toNode.style.visibility = "hidden";
		toNode.style.display = "";
		this.onBeforeTransitionOut.apply(this, arguments);
		var toWidget = dijit.byNode(toNode);
		if (toWidget && toWidget.onBeforeTransitionIn) {
			if (this.keepScrollPos && !dijit.getEnclosingWidget(this.domNode.parentNode)) {
				var scrollTop = dojo.body().scrollTop || dojo.doc.documentElement.scrollTop || window.pageYOffset || 0;
				if (dir == 1) {
					toNode.style.top = "0px";
					if (scrollTop > 1) {
						fromNode.style.top = -scrollTop + "px";
						if (dojo.config["mblHideAddressBar"] !== false) {
							setTimeout(function () {
								window.scrollTo(0, 1);
							}, 0);
						}
					}
				} else {
					if (scrollTop > 1 || toNode.offsetTop !== 0) {
						var toTop = -toNode.offsetTop;
						toNode.style.top = "0px";
						fromNode.style.top = toTop - scrollTop + "px";
						if (dojo.config["mblHideAddressBar"] !== false && toTop > 0) {
							setTimeout(function () {
								window.scrollTo(0, toTop + 1);
							}, 0);
						}
					}
				}
			} else {
				toNode.style.top = "0px";
			}
			toWidget.onBeforeTransitionIn.apply(this, arguments);
		}
		toNode.style.display = "none";
		toNode.style.visibility = "visible";
		this._doTransition(fromNode, toNode, transition, dir);
	}, _doTransition:function (fromNode, toNode, transition, dir) {
		var rev = (dir == -1) ? " reverse" : "";
		toNode.style.display = "";
		if (transition) {
			dojo.addClass(fromNode, transition + " out" + rev);
			dojo.addClass(toNode, transition + " in" + rev);
		} else {
			this.domNode.style.display = "none";
			this.invokeCallback();
		}
	}, onAnimationStart:function (e) {
	}, onAnimationEnd:function (e) {
		var isOut = false;
		if (dojo.hasClass(this.domNode, "out")) {
			isOut = true;
			this.domNode.style.display = "none";
			dojo.forEach([this._transition, "in", "out", "reverse"], function (s) {
				dojo.removeClass(this.domNode, s);
			}, this);
		}
		if (e.animationName.indexOf("shrink") === 0) {
			var li = e.target;
			li.style.display = "none";
			dojo.removeClass(li, "mblCloseContent");
		}
		if (isOut) {
			this.invokeCallback();
		}
		this.domNode && (this.domNode.className = "mblView");
	}, invokeCallback:function () {
		this.onAfterTransitionOut.apply(this, this._arguments);
		var toWidget = dijit.byNode(this.toNode);
		if (toWidget && toWidget.onAfterTransitionIn) {
			toWidget.onAfterTransitionIn.apply(this, this._arguments);
		}
		if (dojo.hash) {
			dojox.mobile._currentView = toWidget;
		}
		var c = this._context, m = this._method;
		if (!c && !m) {
			return;
		}
		if (!m) {
			m = c;
			c = null;
		}
		c = c || dojo.global;
		if (typeof (m) == "string") {
			c[m].apply(c, this._args);
		} else {
			m.apply(c, this._args);
		}
	}, addChild:function (widget) {
		this.containerNode.appendChild(widget.domNode);
	}});
	dojo.declare("dojox.mobile.Heading", dijit._Widget, {back:"", href:"", moveTo:"", transition:"slide", label:"", buildRendering:function () {
		this.domNode = this.containerNode = this.srcNodeRef || dojo.doc.createElement("H1");
		this.domNode.className = "mblHeading";
		this._view = this.domNode.parentNode && dijit.byNode(this.domNode.parentNode);
		if (this.label) {
			this.domNode.innerHTML = this.label;
		} else {
			this.label = this.domNode.innerHTML;
		}
		if (this.back) {
			var head = dojo.doc.createElement("DIV");
			head.className = "mblArrowButtonHead";
			var body = this._body = dojo.doc.createElement("DIV");
			body.className = "mblArrowButtonBody mblArrowButtonText";
			body.innerHTML = this.back;
			this.connect(body, "onclick", "onClick");
			var neck = dojo.doc.createElement("DIV");
			neck.className = "mblArrowButtonNeck";
			this.domNode.appendChild(head);
			this.domNode.appendChild(body);
			this.domNode.appendChild(neck);
			this.setLabel(this.label);
		}
	}, onClick:function (e) {
		var h1 = this.domNode;
		dojo.addClass(h1, "mblArrowButtonSelected");
		setTimeout(function () {
			dojo.removeClass(h1, "mblArrowButtonSelected");
		}, 1000);
		this.goTo(this.moveTo, this.href);
	}, setLabel:function (label) {
		if (label != this.label) {
			this.label = label;
			this.domNode.firstChild.nodeValue = label;
		}
		var s = this.domNode.style;
		if (this.label.length > 12) {
			var h = this.domNode.cloneNode(true);
			h.style.visibility = "hidden";
			dojo.body().appendChild(h);
			var b = h.childNodes[2];
			s.paddingLeft = b.offsetWidth + 30 + "px";
			s.textAlign = "left";
			dojo.body().removeChild(h);
			h = null;
		} else {
			s.paddingLeft = "";
			s.textAlign = "";
		}
	}, goTo:function (moveTo, href) {
		if (!this._view) {
			this._view = dijit.byNode(this.domNode.parentNode);
		}
		if (href) {
			this._view.performTransition(null, -1, this.transition, this, function () {
				location.href = href;
			});
		} else {
			if (dojox.mobile.app) {
				dojo.publish("/dojox/mobile/app/goback");
			} else {
				this._view.performTransition(moveTo, -1, this.transition);
			}
		}
	}});
	dojo.declare("dojox.mobile.RoundRect", dijit._Widget, {shadow:false, buildRendering:function () {
		this.domNode = this.containerNode = this.srcNodeRef || dojo.doc.createElement("DIV");
		this.domNode.className = this.shadow ? "mblRoundRect mblShadow" : "mblRoundRect";
	}});
	dojo.declare("dojox.mobile.RoundRectCategory", dijit._Widget, {label:"", buildRendering:function () {
		this.domNode = this.containerNode = this.srcNodeRef || dojo.doc.createElement("H2");
		this.domNode.className = "mblRoundRectCategory";
		if (this.label) {
			this.domNode.innerHTML = this.label;
		} else {
			this.label = this.domNode.innerHTML;
		}
	}});
	dojo.declare("dojox.mobile.EdgeToEdgeCategory", dojox.mobile.RoundRectCategory, {buildRendering:function () {
		this.inherited(arguments);
		this.domNode.className = "mblEdgeToEdgeCategory";
	}});
	dojo.declare("dojox.mobile.RoundRectList", dijit._Widget, {transition:"slide", iconBase:"", iconPos:"", buildRendering:function () {
		this.domNode = this.containerNode = this.srcNodeRef || dojo.doc.createElement("UL");
		this.domNode.className = "mblRoundRectList";
	}, addChild:function (widget) {
		this.containerNode.appendChild(widget.domNode);
		widget.inheritParams();
		widget.setIcon();
	}});
	dojo.declare("dojox.mobile.EdgeToEdgeList", dojox.mobile.RoundRectList, {buildRendering:function () {
		this.inherited(arguments);
		this.domNode.className = "mblEdgeToEdgeList";
	}});
	dojo.declare("dojox.mobile.AbstractItem", dijit._Widget, {icon:"", iconPos:"", href:"", moveTo:"", clickable:false, url:"", transition:"", callback:null, sync:true, label:"", inheritParams:function () {
		var parent = this.getParentWidget();
		if (parent) {
			if (!this.transition) {
				this.transition = parent.transition;
			}
			if (!this.icon) {
				this.icon = parent.iconBase;
			}
			if (!this.iconPos) {
				this.iconPos = parent.iconPos;
			}
		}
	}, transitionTo:function (moveTo, href, url) {
		var n = this.domNode.parentNode;
		var w;
		while (true) {
			w = dijit.getEnclosingWidget(n);
			if (!w) {
				return;
			}
			if (w.performTransition) {
				break;
			}
			n = w.domNode.parentNode;
		}
		if (href) {
			w.performTransition(null, 1, this.transition, this, function () {
				location.href = href;
			});
			return;
		}
		if (url) {
			var id;
			if (dojox.mobile._viewMap && dojox.mobile._viewMap[url]) {
				id = dojox.mobile._viewMap[url];
			} else {
				var text = this._text;
				if (!text) {
					if (this.sync) {
						text = dojo.trim(dojo._getText(url));
					} else {
						var prog = dojox.mobile.ProgressIndicator.getInstance();
						dojo.body().appendChild(prog.domNode);
						prog.start();
						var xhr = dojo.xhrGet({url:url, handleAs:"text"});
						xhr.addCallback(dojo.hitch(this, function (response, ioArgs) {
							prog.stop();
							if (response) {
								this._text = response;
								this.transitionTo(moveTo, href, url);
							}
						}));
						xhr.addErrback(function (error) {
							prog.stop();
							alert("Failed to load " + url + "\n" + (error.description || error));
						});
						return;
					}
				}
				this._text = null;
				id = this._parse(text);
				if (!dojox.mobile._viewMap) {
					dojox.mobile._viewMap = [];
				}
				dojox.mobile._viewMap[url] = id;
			}
			moveTo = id;
		}
		w.performTransition(moveTo, 1, this.transition, this.callback && this, this.callback);
	}, _parse:function (text) {
		var container = dojo.create("DIV");
		var view;
		if (text.charAt(0) == "<") {
			container.innerHTML = text;
			view = container.firstChild;
			if (!view && view.nodeType != 1) {
				alert("dojox.mobile.AbstractItem#transitionTo: invalid view content");
				return;
			}
			view.setAttribute("_started", "true");
			view.style.visibility = "hidden";
			dojo.body().appendChild(container);
			(dojox.mobile.parser || dojo.parser).parse(container);
		} else {
			if (text.charAt(0) == "{") {
				dojo.body().appendChild(container);
				this._ws = [];
				view = this._instantiate(eval("(" + text + ")"), container);
				for (var i = 0; i < this._ws.length; i++) {
					var w = this._ws[i];
					w.startup && !w._started && (!w.getParent || !w.getParent()) && w.startup();
				}
				this._ws = null;
			}
		}
		view.style.display = "none";
		view.style.visibility = "visible";
		var id = view.id;
		return dojo.hash ? "#" + id : id;
	}, _instantiate:function (obj, node, parent) {
		var widget;
		for (var key in obj) {
			if (key.charAt(0) == "@") {
				continue;
			}
			var cls = dojo.getObject(key);
			if (!cls) {
				continue;
			}
			var params = {};
			var proto = cls.prototype;
			var objs = dojo.isArray(obj[key]) ? obj[key] : [obj[key]];
			for (var i = 0; i < objs.length; i++) {
				for (var prop in objs[i]) {
					if (prop.charAt(0) == "@") {
						var val = objs[i][prop];
						prop = prop.substring(1);
						if (typeof proto[prop] == "string") {
							params[prop] = val;
						} else {
							if (typeof proto[prop] == "number") {
								params[prop] = val - 0;
							} else {
								if (typeof proto[prop] == "boolean") {
									params[prop] = (val != "false");
								} else {
									if (typeof proto[prop] == "object") {
										params[prop] = eval("(" + val + ")");
									}
								}
							}
						}
					}
				}
				widget = new cls(params, node);
				if (!node) {
					this._ws.push(widget);
				}
				if (parent && parent.addChild) {
					parent.addChild(widget);
				}
				this._instantiate(objs[i], null, widget);
			}
		}
		return widget && widget.domNode;
	}, getParentWidget:function () {
		var ref = this.srcNodeRef || this.domNode;
		return ref && ref.parentNode ? dijit.getEnclosingWidget(ref.parentNode) : null;
	}});
	dojo.declare("dojox.mobile.ListItem", dojox.mobile.AbstractItem, {rightText:"", btnClass:"", anchorLabel:false, buildRendering:function () {
		this.inheritParams();
		var a = this.anchorNode = dojo.create("A");
		a.className = "mblListItemAnchor";
		var box = dojo.create("DIV");
		box.className = "mblListItemTextBox";
		if (this.anchorLabel) {
			box.style.cursor = "pointer";
		}
		var r = this.srcNodeRef;
		if (r) {
			for (var i = 0, len = r.childNodes.length; i < len; i++) {
				box.appendChild(r.removeChild(r.firstChild));
			}
		}
		if (this.label) {
			box.appendChild(dojo.doc.createTextNode(this.label));
		}
		a.appendChild(box);
		if (this.rightText) {
			var txt = dojo.create("DIV");
			txt.className = "mblRightText";
			txt.innerHTML = this.rightText;
			a.appendChild(txt);
		}
		if (this.moveTo || this.href || this.url || this.clickable) {
			var arrow = dojo.create("DIV");
			arrow.className = "mblArrow";
			a.appendChild(arrow);
			this.connect(a, "onclick", "onClick");
		} else {
			if (this.btnClass) {
				var div = this.btnNode = dojo.create("DIV");
				div.className = this.btnClass + " mblRightButton";
				div.appendChild(dojo.create("DIV"));
				div.appendChild(dojo.create("P"));
				var dummyDiv = dojo.create("DIV");
				dummyDiv.className = "mblRightButtonContainer";
				dummyDiv.appendChild(div);
				a.appendChild(dummyDiv);
				dojo.addClass(a, "mblListItemAnchorHasRightButton");
				setTimeout(function () {
					dummyDiv.style.width = div.offsetWidth + "px";
					dummyDiv.style.height = div.offsetHeight + "px";
					if (dojo.isIE) {
						a.parentNode.style.height = a.parentNode.offsetHeight + "px";
					}
				});
			}
		}
		if (this.anchorLabel) {
			box.style.display = "inline";
		}
		var li = this.domNode = this.containerNode = this.srcNodeRef || dojo.doc.createElement("LI");
		li.className = "mblListItem";
		li.appendChild(a);
		this.setIcon();
	}, setIcon:function () {
		if (this.iconNode) {
			return;
		}
		var a = this.anchorNode;
		if (this.icon && this.icon != "none") {
			var img = this.iconNode = dojo.create("IMG");
			img.className = "mblListItemIcon";
			img.src = this.icon;
			this.domNode.insertBefore(img, a);
			dojox.mobile.setupIcon(this.iconNode, this.iconPos);
			dojo.removeClass(a, "mblListItemAnchorNoIcon");
		} else {
			dojo.addClass(a, "mblListItemAnchorNoIcon");
		}
	}, onClick:function (e) {
		if (this.anchorLabel) {
			for (var p = e.target; p.tagName != "LI"; p = p.parentNode) {
				if (p.className == "mblListItemTextBox") {
					dojo.addClass(p, "mblListItemTextBoxSelected");
					setTimeout(function () {
						dojo.removeClass(p, "mblListItemTextBoxSelected");
					}, 1000);
					this.onAnchorLabelClicked(e);
					return;
				}
			}
		}
		var a = e.currentTarget;
		var li = a.parentNode;
		dojo.addClass(li, "mblItemSelected");
		setTimeout(function () {
			dojo.removeClass(li, "mblItemSelected");
		}, 1000);
		this.transitionTo(this.moveTo, this.href, this.url);
	}, onAnchorLabelClicked:function (e) {
	}});
	dojo.declare("dojox.mobile.Switch", dijit._Widget, {value:"on", leftLabel:"ON", rightLabel:"OFF", _width:53, buildRendering:function () {
		this.domNode = this.srcNodeRef || dojo.doc.createElement("DIV");
		this.domNode.className = "mblSwitch";
		this.domNode.innerHTML = "<div class=\"mblSwitchInner\">" + "<div class=\"mblSwitchBg mblSwitchBgLeft\">" + "<div class=\"mblSwitchText mblSwitchTextLeft\">" + this.leftLabel + "</div>" + "</div>" + "<div class=\"mblSwitchBg mblSwitchBgRight\">" + "<div class=\"mblSwitchText mblSwitchTextRight\">" + this.rightLabel + "</div>" + "</div>" + "<div class=\"mblSwitchKnob\"></div>" + "</div>";
		var n = this.inner = this.domNode.firstChild;
		this.left = n.childNodes[0];
		this.right = n.childNodes[1];
		this.knob = n.childNodes[2];
		dojo.addClass(this.domNode, (this.value == "on") ? "mblSwitchOn" : "mblSwitchOff");
		this[this.value == "off" ? "left" : "right"].style.display = "none";
	}, postCreate:function () {
		this.connect(this.knob, "onclick", "onClick");
		this.connect(this.knob, "touchstart", "onTouchStart");
		this.connect(this.knob, "mousedown", "onTouchStart");
	}, _changeState:function (state) {
		this.inner.style.left = "";
		dojo.addClass(this.domNode, "mblSwitchAnimation");
		dojo.removeClass(this.domNode, (state == "on") ? "mblSwitchOff" : "mblSwitchOn");
		dojo.addClass(this.domNode, (state == "on") ? "mblSwitchOn" : "mblSwitchOff");
		var _this = this;
		setTimeout(function () {
			_this[state == "off" ? "left" : "right"].style.display = "none";
			dojo.removeClass(_this.domNode, "mblSwitchAnimation");
		}, 300);
	}, onClick:function (e) {
		if (this._moved) {
			return;
		}
		this.value = (this.value == "on") ? "off" : "on";
		this._changeState(this.value);
		this.onStateChanged(this.value);
	}, onTouchStart:function (e) {
		this._moved = false;
		this.innerStartX = this.inner.offsetLeft;
		if (e.targetTouches) {
			this.touchStartX = e.targetTouches[0].clientX;
			this._conn1 = dojo.connect(this.inner, "touchmove", this, "onTouchMove");
			this._conn2 = dojo.connect(this.inner, "touchend", this, "onTouchEnd");
		}
		this.left.style.display = "block";
		this.right.style.display = "block";
		return false;
	}, onTouchMove:function (e) {
		e.preventDefault();
		var dx;
		if (e.targetTouches) {
			if (e.targetTouches.length != 1) {
				return false;
			}
			dx = e.targetTouches[0].clientX - this.touchStartX;
		} else {
			dx = e.clientX - this.touchStartX;
		}
		var pos = this.innerStartX + dx;
		var d = 10;
		if (pos <= -(this._width - d)) {
			pos = -this._width;
		}
		if (pos >= -d) {
			pos = 0;
		}
		this.inner.style.left = pos + "px";
		this._moved = true;
		return true;
	}, onTouchEnd:function (e) {
		dojo.disconnect(this._conn1);
		dojo.disconnect(this._conn2);
		if (this.innerStartX == this.inner.offsetLeft) {
			return;
		}
		var newState = (this.inner.offsetLeft < -(this._width / 2)) ? "off" : "on";
		this._changeState(newState);
		if (newState != this.value) {
			this.value = newState;
			this.onStateChanged(this.value);
		}
	}, onStateChanged:function (newState) {
	}});
	dojo.declare("dojox.mobile.IconContainer", dijit._Widget, {defaultIcon:"", transition:"below", pressedIconOpacity:0.4, iconBase:"", iconPos:"", back:"Home", label:"My Application", single:false, buildRendering:function () {
		this.domNode = this.containerNode = this.srcNodeRef || dojo.doc.createElement("UL");
		this.domNode.className = "mblIconContainer";
		var t = this._terminator = dojo.create("LI");
		t.className = "mblIconItemTerminator";
		t.innerHTML = "&nbsp;";
		this.domNode.appendChild(t);
	}, _setupSubNodes:function (ul) {
		var len = this.domNode.childNodes.length - 1;
		for (i = 0; i < len; i++) {
			child = this.domNode.childNodes[i];
			if (child.nodeType != 1) {
				continue;
			}
			w = dijit.byNode(child);
			if (this.single) {
				w.subNode.firstChild.style.display = "none";
			}
			ul.appendChild(w.subNode);
		}
	}, startup:function () {
		var ul, i, len, child, w;
		if (this.transition == "below") {
			this._setupSubNodes(this.domNode);
		} else {
			var view = new dojox.mobile.View({id:this.id + "_mblApplView"});
			var _this = this;
			view.onAfterTransitionIn = function (moveTo, dir, transition, context, method) {
				_this._opening._open_1();
			};
			view.domNode.style.visibility = "hidden";
			var heading = view._heading = new dojox.mobile.Heading({back:this.back, label:this.label, moveTo:this.domNode.parentNode.id, transition:this.transition});
			view.addChild(heading);
			ul = dojo.doc.createElement("UL");
			ul.className = "mblIconContainer";
			ul.style.marginTop = "0px";
			this._setupSubNodes(ul);
			view.domNode.appendChild(ul);
			dojo.doc.body.appendChild(view.domNode);
		}
	}, closeAll:function () {
		var len = this.domNode.childNodes.length;
		for (var i = 0; i < len; i++) {
			child = this.domNode.childNodes[i];
			if (child.nodeType != 1) {
				continue;
			}
			if (child == this._terminator) {
				break;
			}
			w = dijit.byNode(child);
			w.containerNode.parentNode.style.display = "none";
			w.setOpacity(w.iconNode, 1);
		}
	}, addChild:function (widget) {
		this.domNode.insertBefore(widget.domNode, this._terminator);
		widget.transition = this.transition;
		if (this.transition == "below") {
			this.domNode.appendChild(widget.subNode);
		}
		widget.inheritParams();
		widget.setIcon();
	}});
	dojo.declare("dojox.mobile.IconItem", dojox.mobile.AbstractItem, {lazy:false, requires:"", timeout:10, templateString:"<li class=\"mblIconItem\">" + "<div class=\"mblIconArea\" dojoAttachPoint=\"iconDivNode\">" + "<div><img src=\"${icon}\" dojoAttachPoint=\"iconNode\"></div>${label}" + "</div>" + "</li>", templateStringSub:"<li class=\"mblIconItemSub\" lazy=\"${lazy}\" style=\"display:none;\" dojoAttachPoint=\"contentNode\">" + "<h2 class=\"mblIconContentHeading\" dojoAttachPoint=\"closeNode\">" + "<div class=\"mblBlueMinusButton\" style=\"position:absolute;left:4px;top:2px;\" dojoAttachPoint=\"closeIconNode\"><div></div></div>${label}" + "</h2>" + "<div class=\"mblContent\" dojoAttachPoint=\"containerNode\"></div>" + "</li>", createTemplate:function (s) {
		dojo.forEach(["lazy", "icon", "label"], function (v) {
			while (s.indexOf("${" + v + "}") != -1) {
				s = s.replace("${" + v + "}", this[v]);
			}
		}, this);
		var div = dojo.doc.createElement("DIV");
		div.innerHTML = s;
		var nodes = div.getElementsByTagName("*");
		var i, len, s1;
		len = nodes.length;
		for (i = 0; i < len; i++) {
			s1 = nodes[i].getAttribute("dojoAttachPoint");
			if (s1) {
				this[s1] = nodes[i];
			}
		}
		var domNode = div.removeChild(div.firstChild);
		div = null;
		return domNode;
	}, buildRendering:function () {
		this.inheritParams();
		this.domNode = this.createTemplate(this.templateString);
		this.subNode = this.createTemplate(this.templateStringSub);
		this.subNode._parentNode = this.domNode;
		if (this.srcNodeRef) {
			for (var i = 0, len = this.srcNodeRef.childNodes.length; i < len; i++) {
				this.containerNode.appendChild(this.srcNodeRef.removeChild(this.srcNodeRef.firstChild));
			}
			this.srcNodeRef.parentNode.replaceChild(this.domNode, this.srcNodeRef);
			this.srcNodeRef = null;
		}
		this.setIcon();
	}, setIcon:function () {
		this.iconNode.src = this.icon;
		dojox.mobile.setupIcon(this.iconNode, this.iconPos);
	}, postCreate:function () {
		this.connect(this.iconNode, "onmousedown", "onMouseDownIcon");
		this.connect(this.iconNode, "onclick", "iconClicked");
		this.connect(this.closeIconNode, "onclick", "closeIconClicked");
		this.connect(this.iconNode, "onerror", "onError");
	}, highlight:function () {
		dojo.addClass(this.iconDivNode, "mblVibrate");
		if (this.timeout > 0) {
			var _this = this;
			setTimeout(function () {
				_this.unhighlight();
			}, this.timeout * 1000);
		}
	}, unhighlight:function () {
		dojo.removeClass(this.iconDivNode, "mblVibrate");
	}, setOpacity:function (node, val) {
		node.style.opacity = val;
		node.style.mozOpacity = val;
		node.style.khtmlOpacity = val;
		node.style.webkitOpacity = val;
	}, instantiateWidget:function (e) {
		var nodes = this.containerNode.getElementsByTagName("*");
		var len = nodes.length;
		var s;
		for (var i = 0; i < len; i++) {
			s = nodes[i].getAttribute("dojoType");
			if (s) {
				dojo["require"](s);
			}
		}
		if (len > 0) {
			(dojox.mobile.parser || dojo.parser).parse(this.containerNode);
		}
		this.lazy = false;
	}, isOpen:function (e) {
		return this.containerNode.style.display != "none";
	}, onMouseDownIcon:function (e) {
		this.setOpacity(this.iconNode, this.getParentWidget().pressedIconOpacity);
	}, iconClicked:function (e) {
		if (e) {
			setTimeout(dojo.hitch(this, function (d) {
				this.iconClicked();
			}), 0);
			return;
		}
		if (this.moveTo || this.href || this.url) {
			this.transitionTo(this.moveTo, this.href, this.url);
			setTimeout(dojo.hitch(this, function (d) {
				this.setOpacity(this.iconNode, 1);
			}), 1500);
		} else {
			this.open();
		}
	}, closeIconClicked:function (e) {
		if (e) {
			setTimeout(dojo.hitch(this, function (d) {
				this.closeIconClicked();
			}), 0);
			return;
		}
		this.close();
	}, open:function () {
		var parent = this.getParentWidget();
		if (this.transition == "below") {
			if (parent.single) {
				parent.closeAll();
				this.setOpacity(this.iconNode, this.getParentWidget().pressedIconOpacity);
			}
			this._open_1();
		} else {
			parent._opening = this;
			if (parent.single) {
				parent.closeAll();
				var view = dijit.byId(parent.id + "_mblApplView");
				view._heading.setLabel(this.label);
			}
			this.transitionTo(parent.id + "_mblApplView");
		}
	}, _open_1:function () {
		this.contentNode.style.display = "";
		this.unhighlight();
		if (this.lazy) {
			if (this.requires) {
				dojo.forEach(this.requires.split(/,/), function (c) {
					dojo["require"](c);
				});
			}
			this.instantiateWidget();
		}
		this.contentNode.scrollIntoView();
		this.onOpen();
	}, close:function () {
		if (dojo.isWebKit) {
			var t = this.domNode.parentNode.offsetWidth / 8;
			var y = this.iconNode.offsetLeft;
			var pos = 0;
			for (var i = 1; i <= 3; i++) {
				if (t * (2 * i - 1) < y && y <= t * (2 * (i + 1) - 1)) {
					pos = i;
					break;
				}
			}
			dojo.addClass(this.containerNode.parentNode, "mblCloseContent mblShrink" + pos);
		} else {
			this.containerNode.parentNode.style.display = "none";
		}
		this.setOpacity(this.iconNode, 1);
		this.onClose();
	}, onOpen:function () {
	}, onClose:function () {
	}, onError:function () {
		this.iconNode.src = this.getParentWidget().defaultIcon;
	}});
	dojo.declare("dojox.mobile.Button", dijit._Widget, {btnClass:"mblBlueButton", duration:1000, label:null, buildRendering:function () {
		this.domNode = this.containerNode = this.srcNodeRef || dojo.doc.createElement("BUTTON");
		this.domNode.className = "mblButton " + this.btnClass;
		if (this.label) {
			this.domNode.innerHTML = this.label;
		}
		this.connect(this.domNode, "onclick", "onClick");
	}, onClick:function (e) {
		var button = this.domNode;
		var c = "mblButtonSelected " + this.btnClass + "Selected";
		dojo.addClass(button, c);
		setTimeout(function () {
			dojo.removeClass(button, c);
		}, this.duration);
	}});
	dojo.declare("dojox.mobile.TabContainer", dijit._Widget, {iconBase:"", iconPos:"", buildRendering:function () {
		var node = this.domNode = this.srcNodeRef;
		node.className = "mblTabContainer";
		var headerNode = this.tabHeaderNode = dojo.doc.createElement("DIV");
		var paneNode = this.containerNode = dojo.doc.createElement("DIV");
		for (var i = 0, len = node.childNodes.length; i < len; i++) {
			paneNode.appendChild(node.removeChild(node.firstChild));
		}
		headerNode.className = "mblTabPanelHeader";
		headerNode.align = "center";
		node.appendChild(headerNode);
		paneNode.className = "mblTabPanelPane";
		node.appendChild(paneNode);
	}, startup:function () {
		this.createTabButtons();
		this.inherited(arguments);
	}, createTabButtons:function () {
		var div = dojo.doc.createElement("DIV");
		div.align = "center";
		var tbl = dojo.doc.createElement("TABLE");
		var cell = tbl.insertRow(-1).insertCell(-1);
		var children = this.containerNode.childNodes;
		for (var i = 0; i < children.length; i++) {
			var pane = children[i];
			if (pane.nodeType != 1) {
				continue;
			}
			var widget = dijit.byNode(pane);
			if (widget.selected || !this._selectedPane) {
				this._selectedPane = widget;
			}
			pane.style.display = "none";
			var tab = dojo.doc.createElement("DIV");
			tab.className = "mblTabButton";
			if (widget.icon) {
				var imgDiv = dojo.create("DIV");
				var img = dojo.create("IMG");
				imgDiv.className = "mblTabButtonImgDiv";
				img.src = widget.icon;
				dojox.mobile.setupIcon(img, widget.iconPos);
				imgDiv.appendChild(img);
				tab.appendChild(imgDiv);
			}
			tab.appendChild(dojo.doc.createTextNode(widget.label));
			tab.pane = widget;
			widget.tab = tab;
			this.connect(tab, "onclick", "onTabClick");
			cell.appendChild(tab);
		}
		div.appendChild(tbl);
		this.tabHeaderNode.appendChild(div);
		this.selectTab(this._selectedPane.tab);
	}, selectTab:function (tab) {
		this._selectedPane.domNode.style.display = "none";
		dojo.removeClass(this._selectedPane.tab, "mblTabButtonSelected");
		this._selectedPane = tab.pane;
		this._selectedPane.domNode.style.display = "";
		dojo.addClass(tab, "mblTabButtonSelected");
	}, onTabClick:function (e) {
		var tab = e.currentTarget;
		dojo.addClass(tab, "mblTabButtonHighlighted");
		setTimeout(function () {
			dojo.removeClass(tab, "mblTabButtonHighlighted");
		}, 200);
		this.selectTab(tab);
	}});
	dojo.declare("dojox.mobile.TabPane", dijit._Widget, {label:"", icon:"", iconPos:"", selected:false, inheritParams:function () {
		var parent = this.getParentWidget();
		if (parent) {
			if (!this.icon) {
				this.icon = parent.iconBase;
			}
			if (!this.iconPos) {
				this.iconPos = parent.iconPos;
			}
		}
	}, buildRendering:function () {
		this.inheritParams();
		this.domNode = this.containerNode = this.srcNodeRef || dojo.doc.createElement("DIV");
		this.domNode.className = "mblTabPane";
	}, getParentWidget:function () {
		var ref = this.srcNodeRef || this.domNode;
		return ref && ref.parentNode ? dijit.getEnclosingWidget(ref.parentNode) : null;
	}});
	dojo.declare("dojox.mobile.ProgressIndicator", null, {interval:100, colors:["#C0C0C0", "#C0C0C0", "#C0C0C0", "#C0C0C0", "#C0C0C0", "#C0C0C0", "#B8B9B8", "#AEAFAE", "#A4A5A4", "#9A9A9A", "#8E8E8E", "#838383"], _bars:[], constructor:function () {
		this.domNode = dojo.create("DIV");
		this.domNode.className = "mblProgContainer";
		for (var i = 0; i < 12; i++) {
			var div = dojo.create("DIV");
			div.className = "mblProg mblProg" + i;
			this.domNode.appendChild(div);
			this._bars.push(div);
		}
	}, start:function () {
		var cntr = 0;
		var _this = this;
		this.timer = setInterval(function () {
			cntr--;
			cntr = cntr < 0 ? 11 : cntr;
			var c = _this.colors;
			for (var i = 0; i < 12; i++) {
				var idx = (cntr + i) % 12;
				_this._bars[i].style.backgroundColor = c[idx];
			}
		}, this.interval);
	}, stop:function () {
		if (this.timer) {
			clearInterval(this.timer);
		}
		this.timer = null;
		if (this.domNode.parentNode) {
			this.domNode.parentNode.removeChild(this.domNode);
		}
	}});
	dojox.mobile.ProgressIndicator._instance = null;
	dojox.mobile.ProgressIndicator.getInstance = function () {
		if (!dojox.mobile.ProgressIndicator._instance) {
			dojox.mobile.ProgressIndicator._instance = new dojox.mobile.ProgressIndicator();
		}
		return dojox.mobile.ProgressIndicator._instance;
	};
	dojox.mobile.addClass = function () {
		var elems = document.getElementsByTagName("link");
		for (var i = 0, len = elems.length; i < len; i++) {
			if (elems[i].href.match(/dojox\/mobile\/themes\/(\w+)\//)) {
				dojox.mobile.theme = RegExp.$1;
				dojo.addClass(dojo.body(), dojox.mobile.theme);
				break;
			}
		}
	};
	dojox.mobile.setupIcon = function (iconNode, iconPos) {
		if (iconNode && iconPos) {
			var arr = dojo.map(iconPos.split(/[ ,]/), function (item) {
				return item - 0;
			});
			var t = arr[0];
			var r = arr[1] + arr[2];
			var b = arr[0] + arr[3];
			var l = arr[1];
			iconNode.style.clip = "rect(" + t + "px " + r + "px " + b + "px " + l + "px)";
			iconNode.style.top = -t + "px";
			iconNode.style.left = -l + "px";
		}
	};
	dojo._loaders.unshift(function () {
		var nodes = dojo.body().getElementsByTagName("*");
		var i, len, s;
		len = nodes.length;
		for (i = 0; i < len; i++) {
			s = nodes[i].getAttribute("dojoType");
			if (s) {
				if (nodes[i].parentNode.getAttribute("lazy") == "true") {
					nodes[i].setAttribute("__dojoType", s);
					nodes[i].removeAttribute("dojoType");
				}
			}
		}
	});
	dojo.addOnLoad(function () {
		dojox.mobile.addClass();
		if (dojo.config["mblApplyPageStyles"] !== false) {
			dojo.addClass(dojo.doc.documentElement, "mobile");
		}
		if (dojo.config["mblHideAddressBar"] !== false) {
			var hideAddressBar = function () {
				setTimeout(function () {
					scrollTo(0, 1);
				}, 100);
			};
			hideAddressBar();
		}
		var nodes = dojo.body().getElementsByTagName("*");
		var i, len = nodes.length, s;
		for (i = 0; i < len; i++) {
			s = nodes[i].getAttribute("__dojoType");
			if (s) {
				nodes[i].setAttribute("dojoType", s);
				nodes[i].removeAttribute("__dojoType");
			}
		}
		if (dojo.hash) {
			var findWidgets = function (root) {
				var arr;
				arr = dijit.findWidgets(root);
				var widgets = arr;
				for (var i = 0; i < widgets.length; i++) {
					arr = arr.concat(findWidgets(widgets[i].containerNode));
				}
				return arr;
			};
			dojo.subscribe("/dojo/hashchange", null, function (value) {
				var view = dojox.mobile._currentView;
				if (!view) {
					return;
				}
				var params = dojox.mobile._params;
				if (!params) {
					var moveTo = value ? value : dojox.mobile._defaultView.id;
					var widgets = findWidgets(view.domNode);
					var dir = 1, transition = "slide";
					for (i = 0; i < widgets.length; i++) {
						var w = widgets[i];
						if ("#" + moveTo == w.moveTo) {
							transition = w.transition;
							dir = (w instanceof dojox.mobile.Heading) ? -1 : 1;
							break;
						}
					}
					params = [moveTo, dir, transition];
				}
				view.performTransition.apply(view, params);
				dojox.mobile._params = null;
			});
		}
		dojo.body().style.visibility = "visible";
	});
	dijit.getEnclosingWidget = function (node) {
		while (node && node.tagName !== "BODY") {
			if (node.getAttribute && node.getAttribute("widgetId")) {
				return dijit.registry.byId(node.getAttribute("widgetId"));
			}
			node = node._parentNode || node.parentNode;
		}
		return null;
	};
}

