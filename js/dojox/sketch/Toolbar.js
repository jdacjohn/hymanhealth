/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.sketch.Toolbar"]) {
	dojo._hasResource["dojox.sketch.Toolbar"] = true;
	dojo.provide("dojox.sketch.Toolbar");
	dojo.require("dojox.sketch.Annotation");
	dojo.require("dijit.Toolbar");
	dojo.require("dijit.form.Button");
	dojo.declare("dojox.sketch.ButtonGroup", null, {constructor:function () {
		this._childMaps = {};
		this._children = [];
	}, add:function (plugin) {
		this._childMaps[plugin] = plugin.connect(plugin, "onActivate", dojo.hitch(this, "_resetGroup", plugin));
		this._children.push(plugin);
	}, _resetGroup:function (p) {
		var cs = this._children;
		dojo.forEach(cs, function (c) {
			if (p != c && c["attr"]) {
				c.attr("checked", false);
			}
		});
	}});
	dojo.declare("dojox.sketch.Toolbar", dijit.Toolbar, {figure:null, plugins:null, postCreate:function () {
		this.inherited(arguments);
		this.shapeGroup = new dojox.sketch.ButtonGroup;
		if (!this.plugins) {
			this.plugins = ["Slider", "Lead", "SingleArrow", "DoubleArrow", "Underline", "Preexisting"];
		}
		this._plugins = [];
		dojo.forEach(this.plugins, function (obj) {
			var name = dojo.isString(obj) ? obj : obj.name;
			var p = new dojox.sketch.tools[name](obj.args || {});
			this._plugins.push(p);
			p.setToolbar(this);
			if (!this._defaultTool && p.button) {
				this._defaultTool = p;
			}
		}, this);
	}, setFigure:function (f) {
		this.figure = f;
		this.connect(f, "onLoad", "reset");
		dojo.forEach(this._plugins, function (p) {
			p.setFigure(f);
		});
	}, destroy:function () {
		dojo.forEach(this._plugins, function (p) {
			p.destroy();
		});
		this.inherited(arguments);
		delete this._defaultTool;
		delete this._plugins;
	}, addGroupItem:function (item, group) {
		if (group != "toolsGroup") {
			console.error("not supported group " + group);
			return;
		}
		this.shapeGroup.add(item);
	}, reset:function () {
		this._defaultTool.activate();
	}, _setShape:function (s) {
		if (!this.figure.surface) {
			return;
		}
		if (this.figure.hasSelections()) {
			for (var i = 0; i < this.figure.selected.length; i++) {
				var before = this.figure.selected[i].serialize();
				this.figure.convert(this.figure.selected[i], s);
				this.figure.history.add(dojox.sketch.CommandTypes.Convert, this.figure.selected[i], before);
			}
		}
	}});
	dojox.sketch.makeToolbar = function (node, figure) {
		var toolbar = new dojox.sketch.Toolbar();
		toolbar.setFigure(figure);
		node.appendChild(toolbar.domNode);
		return toolbar;
	};
}

