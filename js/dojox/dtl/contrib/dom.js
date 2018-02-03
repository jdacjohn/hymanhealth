/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.dtl.contrib.dom"]) {
	dojo._hasResource["dojox.dtl.contrib.dom"] = true;
	dojo.provide("dojox.dtl.contrib.dom");
	dojo.require("dojox.dtl.dom");
	(function () {
		var dd = dojox.dtl;
		var ddch = dd.contrib.dom;
		var simple = {render:function () {
			return this.contents;
		}};
		ddch.StyleNode = dojo.extend(function (styles) {
			this.contents = {};
			this._current = {};
			this._styles = styles;
			for (var key in styles) {
				if (styles[key].indexOf("{{") != -1) {
					var node = new dd.Template(styles[key]);
				} else {
					var node = dojo.delegate(simple);
					node.contents = styles[key];
				}
				this.contents[key] = node;
			}
		}, {render:function (context, buffer) {
			for (var key in this.contents) {
				var value = this.contents[key].render(context);
				if (this._current[key] != value) {
					dojo.style(buffer.getParent(), key, this._current[key] = value);
				}
			}
			return buffer;
		}, unrender:function (context, buffer) {
			this._current = {};
			return buffer;
		}, clone:function (buffer) {
			return new this.constructor(this._styles);
		}});
		ddch.BufferNode = dojo.extend(function (nodelist, options) {
			this.nodelist = nodelist;
			this.options = options;
		}, {_swap:function (type, node) {
			if (!this.swapped && this.parent.parentNode) {
				if (type == "node") {
					if ((node.nodeType == 3 && !this.options.text) || (node.nodeType == 1 && !this.options.node)) {
						return;
					}
				} else {
					if (type == "class") {
						if (type != "class") {
							return;
						}
					}
				}
				this.onAddNode && dojo.disconnect(this.onAddNode);
				this.onRemoveNode && dojo.disconnect(this.onRemoveNode);
				this.onChangeAttribute && dojo.disconnect(this.onChangeAttribute);
				this.onChangeData && dojo.disconnect(this.onChangeData);
				this.swapped = this.parent.cloneNode(true);
				this.parent.parentNode.replaceChild(this.swapped, this.parent);
			}
		}, render:function (context, buffer) {
			this.parent = buffer.getParent();
			if (this.options.node) {
				this.onAddNode = dojo.connect(buffer, "onAddNode", dojo.hitch(this, "_swap", "node"));
				this.onRemoveNode = dojo.connect(buffer, "onRemoveNode", dojo.hitch(this, "_swap", "node"));
			}
			if (this.options.text) {
				this.onChangeData = dojo.connect(buffer, "onChangeData", dojo.hitch(this, "_swap", "node"));
			}
			if (this.options["class"]) {
				this.onChangeAttribute = dojo.connect(buffer, "onChangeAttribute", dojo.hitch(this, "_swap", "class"));
			}
			buffer = this.nodelist.render(context, buffer);
			if (this.swapped) {
				this.swapped.parentNode.replaceChild(this.parent, this.swapped);
				dojo.destroy(this.swapped);
			} else {
				this.onAddNode && dojo.disconnect(this.onAddNode);
				this.onRemoveNode && dojo.disconnect(this.onRemoveNode);
				this.onChangeAttribute && dojo.disconnect(this.onChangeAttribute);
				this.onChangeData && dojo.disconnect(this.onChangeData);
			}
			delete this.parent;
			delete this.swapped;
			return buffer;
		}, unrender:function (context, buffer) {
			return this.nodelist.unrender(context, buffer);
		}, clone:function (buffer) {
			return new this.constructor(this.nodelist.clone(buffer), this.options);
		}});
		dojo.mixin(ddch, {buffer:function (parser, token) {
			var parts = token.contents.split().slice(1);
			var options = {};
			var found = false;
			for (var i = parts.length; i--; ) {
				found = true;
				options[parts[i]] = true;
			}
			if (!found) {
				options.node = true;
			}
			var nodelist = parser.parse(["endbuffer"]);
			parser.next_token();
			return new ddch.BufferNode(nodelist, options);
		}, html:function (parser, token) {
			dojo.deprecated("{% html someVariable %}", "Use {{ someVariable|safe }} instead");
			return parser.create_variable_node(token.contents.slice(5) + "|safe");
		}, style_:function (parser, token) {
			var styles = {};
			token = token.contents.replace(/^style\s+/, "");
			var rules = token.split(/\s*;\s*/g);
			for (var i = 0, rule; rule = rules[i]; i++) {
				var parts = rule.split(/\s*:\s*/g);
				var key = parts[0];
				var value = dojo.trim(parts[1]);
				if (value) {
					styles[key] = value;
				}
			}
			return new ddch.StyleNode(styles);
		}});
		dd.register.tags("dojox.dtl.contrib", {"dom":["html", "attr:style", "buffer"]});
	})();
}
