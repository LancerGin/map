//纽约市的著名景点
var locations = [
  {title: 'Midtown', location: {lat: 40.754931, lng: -73.984019}},
  {title: 'Statue of Liberty', location: {lat: 40.689249, lng: -74.0445}},
  {title: 'Brooklyn Bridge', location: {lat: 40.706086, lng: -73.996864}},
  {title: 'Central Park', location: {lat: 40.782865, lng: -73.965355}},
  {title: 'Times Square', location: {lat: 40.758895, lng: -73.985131}},
  {title: 'Empire State Building', location: {lat: 40.748441, lng: -73.985664}}
];
// 通过 GoogleAPI 创建的 map 会存放在这个变量
var map;
//通过 GoogleAPI 创建的 marker 会存放在这个变量
var markers = [];
//通过 GoogleAPI 创建的 infowindow 会存放在这个变量
var largeInfowindow;
//通过 GoogleAPI 创建的 streetViewService 会存放在这个变量
var streetViewService;
//街景的范围是 50米以内
var radius = 50;
//通过 wikipediaAPI 获取的信息会存放在这个变量
var wikis = [];

// GoogleAPI 请求的回调函数，会创建地图、标记及其各项功能
function initMap() {
  //初始化地图，设置放大倍数和显示区域的中心坐标
  map = new google.maps.Map(document.getElementById('main-content'), {
    zoom: 12,
    center: {lat: 40.7413549, lng: -73.9980244}
  });
  // 初始化一个 InfoWindow，点击每一个 marker时要更新里面的内容
  largeInfowindow = new google.maps.InfoWindow();
  // 初始化所有的 marker
  initMarker();
  // 初始化一个 StreetViewService,每一个地点需要一个StreetView
  streetViewService = new google.maps.StreetViewService();
  //地图准备好以后启动 app.js中的 viewmodel
  ko.applyBindings(new viewModel());
}
// 初始化所有 marker
function initMarker(){
  // 通过 函数makeMarkerIcon() 定义 marker 的默认样式和高亮样式
  var defaultIcon = makeMarkerIcon('0091ff');
  var highlightedIcon = makeMarkerIcon('FFFF24');
  // 对地点集 locations进行循环，创建所有的 marker
  for (var i = 0; i < locations.length; i++) {
    // 从地点集中获取 marker 所需的位置信息及其标题信息
    var position = locations[i].location;
    var title = locations[i].title;
    // 创建 marker
    var marker = new google.maps.Marker({
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      icon: defaultIcon,
      id: i
    });
    // 把所有创建好的 marker 放进 markers[]
    markers.push(marker);
    // 给每一个 marker 添加点击事件
    marker.addListener('click', function() {
      // 设置动画
      markerAnimation(this);
      // 点击 marker，调用 populateInfoWindow()设置内容并弹出 InfoWindow
      populateInfoWindow(this, largeInfowindow);
    });
    // 给每一个 marker 添加 mouse事件,
    // 鼠标移到 marker上更改它的 icon样式从而高亮显示
    marker.addListener('mouseover', function() {
      this.setIcon(highlightedIcon);
    });
    marker.addListener('mouseout', function() {
      this.setIcon(defaultIcon);
    });
  }
}
// 设置 marker的上下跳动
function markerAnimation(marker) {
  // 先取消所有 marker的动画
  for( var i in markers ){
    markers[i].setAnimation(null);
  }
  // 给当前点击的 marker设置动画
  marker.setAnimation(google.maps.Animation.BOUNCE);
  // 跳动两次的时间是 1400ms，完成后要取消
  setTimeout(function(){
    marker.setAnimation(null);
  },1400);
}
// 制造 marker的 icon样式的函数
function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21,34));
  return markerImage;
}
// 显示 infowindow的函数
function populateInfoWindow(marker, infowindow) {
  // 如果点击的弹窗已经显示了，则不做任何处理
  if (infowindow.marker !== marker) {
    // 清除 infowindow内的原有内容，
    // 并标明目前显示的弹窗是属于当前点击的 marker
    infowindow.setContent('');
    infowindow.marker = marker;
    // 关闭 infowindow的时候标明当前弹窗没有所属的 marker
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });
    // 调用此函数获取当前地点的相关信息，并弹出 infowindow
    setContent(marker,infowindow);
  }
}

function setContent(marker,infowindow){
  // 当请求成功时，从返回的数据中完善街景图的相关设定，
  // 并获取此位置的 StreetViewPanorama，调取 wikis[]里面的 wiki信息，
  // 给这个地点的 infowindow 填充这些信息
  function getStreetView(data, status) {
    if (status == google.maps.StreetViewStatus.OK) {
      var nearStreetViewLocation = data.location.latLng;
      var heading = google.maps.geometry.spherical.computeHeading(
        nearStreetViewLocation, marker.position);
        infowindow.setContent('<div>' + wikis[marker.title] + '</div><div id="pano"></div>');
        var panoramaOptions = {
          position: nearStreetViewLocation,
          pov: {
            heading: heading,
            pitch: 30
          }
        };
      var panorama = new google.maps.StreetViewPanorama(
        document.getElementById('pano'), panoramaOptions);
    } else {
      // 请求失败时，显示'没找到街景图'
      infowindow.setContent('<div>' + wikis[marker.title] + '</div>' +
        '<div>No Street View Found</div>');
    }
  }
  // 使用 streetview service 获取 50米范围内的 streetview image
  streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
  // 在当前 marker的上面打开 infowindow
  infowindow.open(map, marker);
}

function mapError(){
  document.body.innerHTML = "此页面不能正确加载 Google 地图，请检查网络设置。";
}
