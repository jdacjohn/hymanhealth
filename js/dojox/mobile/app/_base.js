/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.mobile.app._base"]) {
	dojo._hasResource["dojox.mobile.app._base"] = true;
	dojo.provide("dojox.mobile.app._base");
	dojo.experimental("dojox.mobile.app._base");
	dojo.require("dijit._base");
	dojo.require("dijit._Widget");
	dojo.require("dojox.mobile");
	dojo.require("dojox.mobile.parser");
	dojo.require("dojox.mobile.app._event");
	dojo.require("dojox.mobile.app._Widget");
	dojo.require("dojox.mobile.app.StageController");
	dojo.require("dojox.mobile.app.SceneController");
	dojo.require("dojox.mobile.app.SceneAssistant");
	dojo.require("dojox.mobile.app.AlertDialog");
	dojo.require("dojox.mobile.app.List");
	dojo.require("dojox.mobile.app.ListSelector");
	dojo.require("dojox.mobile.app.TextBox");
	dojo.require("dojox.mobile.app.ImageView");
	dojo.require("dojox.mobile.app.ImageThumbView");
	(function () {
		var stageController;
		var appInfo;
		var jsDependencies = ["dojox.mobile", "dojox.mobile.parser"];
		var loadedResources = {};
		var loadingDependencies;
		var rootNode;
		var sceneResources = [];
		function loadResources(resources, callback) {
			var resource;
			var url;
			do {
				resource = resources.pop();
				if (resource.source) {
					url = resource.source;
				} else {
					if (resource.module) {
						url = dojo.baseUrl + dojo._getModuleSymbols(resource.module).join("/") + ".js";
					} else {
						alert("Error: invalid JavaScript resource " + dojo.toJson(resource));
						return;
					}
				}
			} while (resources.length > 0 && loadedResources[url]);
			if (resources.length < 1 && loadedResources[url]) {
				console.log("All resources already loaded");
				callback();
				return;
			}
			console.log("loading url " + url);
			dojo.xhrGet({url:url, sync:false}).addCallbacks(function (text) {
				dojo["eval"](text);
				if (resources.length > 0) {
					loadResources(resources, callback);
				} else {
					callback();
				}
			}, function () {
				alert("Failed to load resource " + url);
			});
		}
		var pushFirstScene = function () {
			stageController = new dojox.mobile.app.StageController(rootNode);
			var defaultInfo = {id:"com.test.app", version:"1.0.0", initialScene:"main"};
			if (window["appInfo"]) {
				dojo.mixin(defaultInfo, window["appInfo"]);
			}
			appInfo = dojox.mobile.app.info = defaultInfo;
			if (appInfo.title) {
				var titleNode = dojo.query("head title")[0] || dojo.create("title", {}, dojo.query("head")[0]);
				document.title = appInfo.title;
			}
			stageController.pushScene(appInfo.initialScene);
		};
		dojo.mixin(dojox.mobile.app, {init:function (node) {
			rootNode = node || dojo.body();
			dojo.subscribe("/dojox/mobile/app/goback", function () {
				stageController.popScene();
			});
			dojo.subscribe("/dojox/mobile/app/alert", function (params) {
				dojox.mobile.app.getActiveSceneController().showAlertDialog(params);
			});
			dojo.xhrGet({url:"view-resources.json", load:function (data) {
				var resources = [];
				if (data) {
					sceneResources = data = dojo.fromJson(data);
					console.log("Got scene resources", sceneResources);
					for (var i = 0; i < data.length; i++) {
						if (!data[i].scene) {
							resources.push(data[i]);
						}
					}
				}
				if (resources.length > 0) {
					console.log("Loading initial resources");
					loadResources(resources, pushFirstScene);
				} else {
					console.log("No initial resources");
					pushFirstScene();
				}
			}, error:pushFirstScene});
		}, getActiveSceneController:function () {
			return stageController.getActiveSceneController();
		}, getStageController:function () {
			return stageController;
		}, loadResources:function (resources, callback) {
			loadResources(resources, callback);
		}, loadResourcesForScene:function (sceneName, callback) {
			var resources = [];
			for (var i = 0; i < sceneResources.length; i++) {
				if (sceneResources[i].scene == sceneName) {
					resources.push(sceneResources[i]);
				}
			}
			if (resources.length > 0) {
				console.log("Loading " + resources.length + " resources for" + sceneName);
				loadResources(resources, callback);
			} else {
				callback();
			}
		}, resolveTemplate:function (sceneName) {
			return "app/views/" + sceneName + "/" + sceneName + "-scene.html";
		}, resolveAssistant:function (sceneName) {
			return "app/assistants/" + sceneName + "-assistant.js";
		}});
	})();
}

