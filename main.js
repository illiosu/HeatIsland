import $ from "jquery";
import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import MiniMap from "leaflet-minimap";
import "leaflet-minimap/dist/Control.MiniMap.min.css";
import "heatmap.js";
import HeatmapOverlay from "heatmap.js/plugins/leaflet-heatmap";
import "./static/Leaflet.Measure/src/leaflet.measure";
import "./static/Leaflet.Measure/src/leaflet.measure.css";

// 图层配置
import layerConfigs from "./config/layerConfig";

import { requestWfsService } from "./utils/requestService";
import place from "./assets/place.json";
console.log(place);
// 从写Marker图片路径
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

var map = L.map("map-container", {
  center: [31.852492579346, 117.28484178759],
  zoom: 8,
  minZoom: 5,
  zoomControl: false,
  attributionControl: false,
});

// //加载json数据
// place.forEach= ((item)=> {
//     console.log(111)
//     //从json对象中提取经纬度和名称
//     var lat = item.lat;
//     var lon = item.lon;
//     var name = item.name;
//     //创建一个marker对象，设置坐标和弹出窗口的内容
//     var marker = L.marker([lat, lon]).bindPopup(name);
//     //将marker添加到地图上
//     marker.addTo(map);
//   });
/**谷歌地图**/
const tileLayer = L.tileLayer(
  "https://gac-geo.googlecnapps.cn/maps/vt?lyrs=r&x={x}&y={y}&z={z}"
).addTo(map);
const imageLayer = L.tileLayer(
  `https://gac-geo.googlecnapps.cn/maps/vt?lyrs=y&x={x}&y={y}&z={z}`
);

/**天地图**/
// const labelLayer = L.tileLayer(`http://t1.tianditu.com/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=${TIANDITU_KEY}`).addTo(map)
// const labelLayer = L.tileLayer(`http://t1.tianditu.com/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=${TIANDITU_KEY}`)

// 鹰眼组件
const overViewLayer = L.tileLayer(
  "https://gac-geo.googlecnapps.cn/maps/vt?lyrs=p&x={x}&y={y}&z={z}"
);
const miniMap = new MiniMap(overViewLayer, {
  toggleDisplay: true,
  width: 280,
  height: 200,
  zoomAnimation: true,
  minimized: false, // 默认打开
  strings: {
    hideText: "关闭鹰眼",
    showText: "打开鹰眼",
  },
});
miniMap.addTo(map);

// 显示坐标
map.on("mousemove", (e) => {
  const { lng, lat } = e.latlng;
  const text = `经度：${lng.toFixed(6)}，纬度：${lat.toFixed(6)}`;
  $("#coordinate").text(text);
});

// 比例尺
L.control
  .scale({
    maxWidth: 100,
    metric: true,
    imperial: false,
  })
  .addTo(map);

// 图层控制
const baseLayers = { 街道: tileLayer, 影像: imageLayer };
const layerControl = L.control
  .layers(
    baseLayers,
    {},
    {
      collapsed: false,
    }
  )
  .addTo(map);

// 测量控件
L.control
  .measure({
    title: "测量工具",
  })
  .addTo(map);

const { wmsLayers, wfsLayers } = layerConfigs;
// 加载配置的wms图层
for (const layerInfo of wmsLayers) {
  const layer = L.tileLayer.wms(layerInfo.url, {
    // tiled: true,
    service: "WMS",
    version: "1.1.1",
    request: "GetMap",
    layers: layerInfo.layers, //需要加载的图层
    format: "image/png", //返回的数据格式
    transparent: true,
  });
  if (layerInfo.visible) layer.addTo(map);
  layerControl.addOverlay(layer, layerInfo.name);
}

// 加载wfs图层
for (const layerInfo of wfsLayers) {
  const { url, layer, name } = layerInfo;
  requestWfsService(url, { layer }).then((features) => {
    const wfslayer = L.geoJSON(features, {
      coordsToLatLng: (coords) => {
        // 坐标转换
        return L.CRS.EPSG3857.unproject(L.point(coords[0], coords[1]));
      },
      pointToLayer: (feature, latlng) => {
        const { lng, lat } = latlng;
        return new L.Marker([lat, lng]);
      },
    }).bindPopup((layer) => {
      const { properties } = layer.feature;
      return `
            <h3>${properties.name}</h3>
            
            <p>经纬度：${properties.lon}，${properties.lat}</p>
            <p>2018年最低温: ${properties.min2018}℃</p>
            <p>2018年最高温 : ${properties.max2018}℃</p>
            <p>2018年平均温: ${properties.avg2018}℃</p>
            <p>2019年最低温: ${properties.min2019}℃</p>
            <p>2019年最高温 : ${properties.max2019}℃</p>
            <p>2019年平均温: ${properties.avg2019}℃</p>
            `; // 弹窗
    });
    // 加到图层控制
    layerControl.addOverlay(wfslayer, name);
  });
}

let heatmapLayer = null; // 热力图层
// 热力图分析
const rendererHeatMap = (valueField, data) => {
  const config = {
    radius: 0.25,
    maxOpacity: 0.8,
    scaleRadius: true,
    useLocalExtrema: true,
    latField: "lat",
    lngField: "lon",
    valueField: valueField,
  };
  heatmapLayer = new HeatmapOverlay(config).addTo(map);
  heatmapLayer.setData(data);
};

// 热力图分析按钮点击
$("#submit").on("click", () => {
  if (heatmapLayer) map.removeLayer(heatmapLayer);
  const qx = wfsLayers.find((item) => item.id === "qx");
  if (!qx) return;
  const { url, layer } = qx;
  const year = $("#year").val(); //获取年份
  const type = $("#type").val(); //获取类型
  const valueField = `${type}${year}`;
  requestWfsService(url, { layer }).then((featureCollection) => {
    const valueArr = featureCollection.features.map((item) => item.properties);
    const valueMax = Math.max(...valueArr.map((item) => item[valueField])); //计算最大值
    const data = { max: valueMax, data: valueArr };
    // 渲染热力图
    rendererHeatMap(valueField, data);
  });
});

// 清除热力图
$("#clear").on("click", () => {
  if (heatmapLayer) map.removeLayer(heatmapLayer);
});
var markers = [];

var added = false;

const addOrRemovePlace = () => {
  if (!added) {
    place.forEach((item) => {
      var lat = item.lat;
      var lon = item.lon;

      var marker = L.marker([lat, lon]);
      markers.push(marker);

      marker.addTo(map);
    });

    added = true;
  } else {
    markers.forEach((item) => {
      map.removeLayer(item);
      markers = [];
    });
    added = false;
  }
};

$(`#nav_list li`).on("click", (e) => {
  const { data_url, data_tool } = e.target.attributes;
  if (data_url) window.open(data_url.value);
  else {
    switch (data_tool.value) {
      case "heatMap":
        $(".heat-map-tool").toggle();

        break;
      case "echarts":
        $(".main-content").toggle();

        break;
      case "timeselector":
        $(".time-selector").toggle();

        $(".waring-icon").toggle();
        // addPlace()
        addOrRemovePlace();

        break;
      case "temperatureInversion":
        $(".temperature-inversion").toggle();
        break;
    }
  }
});

$(`#warningButton`).on("click", (e) => {
  //获取年份
  var year = document.getElementById("year");
  //获取温度值
  var warningnumber = document.getElementById("warningNumber");
  place.forEach(function (item, index) {
    var avg = item["avg" + year.value];
    if (avg > warningnumber.value) {
      markers[index].setIcon(
        L.icon({
          iconUrl: require("./img/marker-red.png"),
        })
      );
    } else {
      markers[index].setIcon(
        L.icon({
          iconUrl:
            "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
        })
      );
    }
  });
});
// function fileChange() {
//   console.log("fileChange");
// }

// //示例代码
// let _fileObj;
// $("#inputfile").on("change", function (e) {
//   console.log("change");
//   let file = e.target.files[0];
//   _fileObj = file;
// });
// $("#submitfile").on("click", function (e) {
//   console.log("submitfile");
//   let formData = new FormData();
//   formData.append("test", _fileObj);
//   $.ajax({
//     url: "http://localhost:9090/testPython/uploadAndProcess",
//     type: "POST",
//     data: formData,
//     processData: false,
//     contentType: false,

//     success: function (res) {
//       if (res.code == 200) {
//         console.log(res);
//         alert("操作成功");
//       }
//       // console.log(res);
//     },
//     error: function (err) {
//       console.log(err);
//     },
//   });
// });

let _fileObj;
let uploadPath;
$("#inputfile").on("change", function (e) {
  console.log("change");
  let file = e.target.files[0];
  _fileObj = file;
});

$("#submitfile").on("click", function (e) {
  console.log("submitfile");
  let formData = new FormData();
  formData.append("test", _fileObj);
  $.ajax({
    url: "http://localhost:9091/Temperature/" + uploadPath,
    type: "POST",
    data: formData,
    processData: false,
    contentType: false,

    success: function (res) {
      if (res.code == 200) {
        console.log(res);
        alert("操作成功");
      }
    },
    error: function (err) {
      console.log(err);
    },
  });
});

document.getElementById("typeSelect").addEventListener("change", function () {
  var selectedOption = this.value;
  switch (selectedOption) {
    case "br":
      console.log("br");
      uploadPath = "processBR";
      // 处理 'br' 选项条件
      break;
    case "ndvi":
      console.log("ndvi");
      uploadPath = "processNDVI";
      // 处理 'ndvi' 选项条件
      break;
    case "srr":
      console.log("srr");
      uploadPath = "processSRR";
      break;
    case "dem":
      console.log("dem");
      uploadPath = "processDEM";
      break;
    case "veg":
      console.log("veg");
      uploadPath = "processVEG";
      break;
  }
});

// $(document).ready(function () {
//   var clicked = false;
//   $("#heatMap").on("click", function () {
//     if (!clicked) {
//       $(this).show(); // show this div on first click
//       clicked = true;
//     } else {
//       $(this).hide(); // hide this div on second click
//       clicked = false;
//     }
//   });
// });

$("#temperature").on("click", function () {
  console.log("temperature");
});
