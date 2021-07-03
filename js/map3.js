//统计图层数量的变量
require([
	"esri/Map",
	"esri/views/MapView",
	"esri/layers/TileLayer",
	"esri/layers/FeatureLayer",
	"esri/core/watchUtils",
], function(Map, MapView, TileLayer, MapImageLayer, watchUtils) {

	//右侧预置底图
	var map1 = new Map({
		basemap: "gray"
	});
	//待切换底图(左边窗口)
	var mapnames = [
		"osm",
		"oceans",
		"satellite",
	];
	var maps = mapnames.map(function(mapid) {
		return new Map({
			basemap: mapid
		});
	});
	//左边窗口
	var view = new MapView({
		container: "viewDiv",
		map: maps[0],
		zoom: 4,
		center: [15, 16] // longitude, latitude
	});
	//右边窗口
	var view2 = new MapView({
		id: 'view2',
		container: 'view2Div',
		map: map1,
		zoom: 4,
		center: [15, 16], // longitude, latitude
		constraints: {
			// Disable zoom snapping to get the best synchonization
			snapToZoom: false
		}
	});
	
	view.on(["mouse-wheel","pointer-down","pointer-move"], function(evt) {
		LinkMap02();
	});
				
	function LinkMap02() {		
		view2.zoom=view.zoom;
		view2.center=view.center;
	}
				
	view2.on(["mouse-wheel","pointer-down","pointer-move"], function(evt) {
		LinkMap01();
	});
				
	function LinkMap01() {
		view.zoom=view2.zoom;
		view.center=view2.center;
	}
	
	
	
	//路网图层
	var transportationLayer = new TileLayer({
		url: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer",
		visible: false
	});
	//飓风图层
	var HurricanesLayer = new MapImageLayer({
		url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/AGP/Hurricanes/MapServer",
		visible: false
	});
	
	
	//路网图层标签
	var streetsLayerToggle = document.getElementById("streetsLayer");
	streetsLayerToggle.addEventListener("change", function() {
		transportationLayer.visible = streetsLayerToggle.checked;
		console.log(transportationLayer.visible);
		if (streetsLayerToggle.checked == true) {
			view.map.add(transportationLayer);
		} else {
			view.map.remove(transportationLayer);
		}

	});
	//飓风图层标签
	var HurricanesLayerToggle = document.getElementById("HurricanesLayer");
	HurricanesLayerToggle.addEventListener("change", function() {
		HurricanesLayer.visible = HurricanesLayerToggle.checked;
		if (HurricanesLayerToggle.checked == true) {
			view.map.add(HurricanesLayer);
			HurricanesLayer.when(function() {
				view.goTo(HurricanesLayer.fullExtent);
			});
		} else {
			view.map.remove(HurricanesLayer);
		}
	});
	////////////////////////监测图层数量///////////////////////////////
	view.map.allLayers.on("change", function(event) {
		var num = event.target.length - 1;
		document.getElementById("layerNum").textContent = "图层数量： " + num;
	});
	///////////////////////////点击切换地图////////////////////////////////////////
	document.querySelector(".btns").addEventListener("click", function(event) {
		var id = event.target.getAttribute("data-id");
		if (id) {
			var map = maps[id];
			view.map = map;
			var nodes = document.querySelectorAll(".btn-switch");
			for (var idx = 0; idx < nodes.length; idx++) {
				var node = nodes[idx];
				var mapIndex = node.getAttribute("data-id");
				if (mapIndex === id) {
					node.classList.add("active-map");
				} else {
					node.classList.remove("active-map");
				}
			}
		}
	});
	/////////////////////显示信息///////////////////////////////////////
	view.watch(["stationary"], function() {
		showInfo(view.center);
	});
	view.on(["pointer-move"], function(evt) {
		showInfo(view.toMap({
			x: evt.x,
			y: evt.y
		}));
	});

	function showInfo(pt) {
		document.getElementById("scaleDisplay").textContent = "比例尺：1:" + Math.round(view.scale * 1) / 1;
		document.getElementById("coordinateDisplay").textContent = "经度为：" + pt.latitude.toFixed(3) + "  纬度为：" + pt.longitude
			.toFixed(3);
	}



	/////////////////卷帘////////////////////////////////////////
	var status = 0;
	var verticalToggle = document.getElementById("vertical");
	verticalToggle.addEventListener("change", function(event) {
		if (verticalToggle.checked == true) {
			styleChange();
			status += 1;
		} else {
			status -= 1;
			if (status == 0) {
				location.reload([false]);
			}
		}
	});
	view.on('pointer-move', function(e) {
		if (status == 1) {
			verticalSwipt();
		}
	});
	view2.on('pointer-move', function(e) {
		if (status == 1) {
			verticalSwipt();
		}
	});

	function styleChange() {
		document.getElementById("viewDiv").style.width = "100%";
		document.getElementById("view2Div").style.width = "100%";
		document.getElementById("view2Div").style.left = "0";
	}

	function verticalSwipt() {
		var x = event.screenX;
		document.getElementById("view2Div").style.clip = 'rect(-10000px,10000px,1000000px,' + x + 'px)';
	}

});
