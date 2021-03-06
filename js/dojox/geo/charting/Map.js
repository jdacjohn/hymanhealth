/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.geo.charting.Map"]) {
	dojo._hasResource["dojox.geo.charting.Map"] = true;
	dojo.provide("dojox.geo.charting.Map");
	dojo.require("dojox.gfx");
	dojo.require("dojox.geo.charting._base");
	dojo.require("dojox.geo.charting._Feature");
	dojo.require("dojox.geo.charting._Marker");
	dojo.declare("dojox.geo.charting.Map", null, {defaultColor:"#B7B7B7", highlightColor:"#D5D5D5", series:[], constructor:function (container, shapeFile) {
		dojo.style(container, "display", "block");
		this.containerSize = {x:dojo.coords(container).x, y:dojo.coords(container).y, w:dojo.coords(container).w || 100, h:dojo.coords(container).h || 100};
		this.surface = dojox.gfx.createSurface(container, this.containerSize.w, this.containerSize.h);
		this.container = container;
		this._createZoomingCursor();
		this.mapObj = this.surface.createGroup();
		this.mapObj.features = {};
		dojo.xhrGet({url:shapeFile, handleAs:"json", sync:true, load:dojo.hitch(this, "_init")});
	}, setMarkerData:function (markerFile) {
		dojo.xhrGet({url:markerFile, handleAs:"json", handle:dojo.hitch(this, "_appendMarker")});
	}, setDataStore:function (dataStore, query) {
		this.dataStore = dataStore;
		var self = this;
		this.dataStore.fetch({query:query, onComplete:function (items) {
			var item = items[0];
			var attributes = self.dataStore.getAttributes(item);
			dojo.forEach(attributes, function (name) {
				if (self.mapObj.features[name]) {
					self.mapObj.features[name].setValue(self.dataStore.getValue(item, name));
				}
			});
		}});
	}, addSeries:function (series) {
		this.series = series;
	}, _init:function (shapeData) {
		var mapWidth = shapeData.layerExtent[2] - shapeData.layerExtent[0];
		var mapHeight = shapeData.layerExtent[3] - shapeData.layerExtent[1];
		this.mapObj.scale = Math.min(this.containerSize.w / mapWidth, this.containerSize.h / mapHeight);
		this.mapObj.currentScale = this.mapObj.scale;
		this.mapObj.boundBox = shapeData.layerExtent;
		this.mapObj.currentBBox = {x:shapeData.layerExtent[0], y:shapeData.layerExtent[1]};
		this.mapObj.setTransform([dojox.gfx.matrix.scale(this.mapObj.scale), dojox.gfx.matrix.translate(-shapeData.layerExtent[0], -shapeData.layerExtent[1])]);
		dojo.forEach(shapeData.featureNames, function (item) {
			var featureShape = shapeData.features[item];
			featureShape.bbox.x = featureShape.bbox[0];
			featureShape.bbox.y = featureShape.bbox[1];
			featureShape.bbox.w = featureShape.bbox[2];
			featureShape.bbox.h = featureShape.bbox[3];
			var feature = new dojox.geo.charting._Feature(this, item, featureShape);
			feature.init();
			this.mapObj.features[item] = feature;
		}, this);
		this.mapObj.marker = new dojox.geo.charting._Marker({}, this);
	}, _appendMarker:function (markerData) {
		this.mapObj.marker = new dojox.geo.charting._Marker(markerData, this);
	}, _createZoomingCursor:function () {
		if (!dojo.byId("mapZoomCursor")) {
			var mapZoomCursor = dojo.doc.createElement("div");
			dojo.attr(mapZoomCursor, "id", "mapZoomCursor");
			dojo.addClass(mapZoomCursor, "mapZoomIn");
			dojo.style(mapZoomCursor, "display", "none");
			dojo.body().appendChild(mapZoomCursor);
		}
	}, onFeatureClick:function (feature) {
	}, onFeatureOver:function (feature) {
	}, onZoomEnd:function (feature) {
	}});
}

