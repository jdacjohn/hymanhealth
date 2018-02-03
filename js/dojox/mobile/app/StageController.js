/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.mobile.app.StageController"]) {
	dojo._hasResource["dojox.mobile.app.StageController"] = true;
	dojo.provide("dojox.mobile.app.StageController");
	dojo.experimental("dojox.mobile.app.StageController");
	dojo.require("dojox.mobile.app.SceneController");
	dojo.declare("dojox.mobile.app.StageController", null, {scenes:null, effect:"fade", constructor:function (node) {
		this.domNode = node;
		this.scenes = [];
		if (dojo.config.mobileAnim) {
			this.effect = dojo.config.mobileAnim;
		}
	}, getActiveSceneController:function () {
		return this.scenes[this.scenes.length - 1];
	}, pushScene:function (sceneName, params) {
		console.log("pushScene", sceneName);
		if (this._opInProgress) {
			return;
		}
		this._opInProgress = true;
		var node = dojo.create("div", {"class":"scene-wrapper", style:{visibility:"hidden"}}, this.domNode);
		var controller = new dojox.mobile.app.SceneController({}, node);
		if (this.scenes.length > 0) {
			this.scenes[0].assistant.deactivate();
		}
		this.scenes.push(controller);
		var _this = this;
		dojo.forEach(this.scenes, this.setZIndex);
		controller.stageController = this;
		controller.init(sceneName, params).addCallback(function () {
			console.log("In callback after controller.init");
			if (_this.scenes.length == 1) {
				controller.domNode.style.visibility = "visible";
				_this.scenes[_this.scenes.length - 1].assistant.activate(params);
				_this._opInProgress = false;
			} else {
				_this.scenes[_this.scenes.length - 2].performTransition(_this.scenes[_this.scenes.length - 1].domNode, 1, _this.effect, null, function () {
					_this.scenes[_this.scenes.length - 1].assistant.activate(params);
					_this._opInProgress = false;
				});
			}
			console.log("at end of callback after controller.init");
		});
	}, setZIndex:function (controller, idx) {
		dojo.style(controller.domNode, "zIndex", idx + 1);
	}, popScene:function (data) {
		if (this._opInProgress) {
			return;
		}
		var _this = this;
		if (this.scenes.length > 1) {
			this._opInProgress = true;
			this.scenes[_this.scenes.length - 2].assistant.activate(data);
			this.scenes[_this.scenes.length - 1].performTransition(_this.scenes[this.scenes.length - 2].domNode, -1, this.effect, null, function () {
				_this._destroyScene(_this.scenes[_this.scenes.length - 1]);
				_this.scenes.splice(_this.scenes.length - 1, 1);
				_this._opInProgress = false;
			});
		} else {
			console.log("cannot pop the scene if there is just one");
		}
	}, popScenesTo:function (sceneName, data) {
		if (this._opInProgress) {
			return;
		}
		while (this.scenes.length > 2 && this.scenes[this.scenes.length - 2].sceneName != sceneName) {
			this._destroyScene(this.scenes[this.scenes.length - 2]);
			this.scenes.splice(this.scenes.length - 2, 1);
		}
		this.popScene(data);
	}, _destroyScene:function (scene) {
		scene.assistant.deactivate();
		scene.assistant.destroy();
		scene.destroyRecursive();
	}});
}

