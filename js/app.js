// 展示在左侧列表视图的每一个地点
var MarkerListView = function(marker){
  var self = this;
  // 把 marker的 title属性作为列表中展示的名字
  self.name = ko.observable(marker.title);
  // 根据筛选条件是否显示此地点
  self.isVisible = ko.observable(true);
  // 给列表视图的项目添加点击事件
  self.triggerMarker = function(){
    new google.maps.event.trigger( marker, 'click' );
  };
};

var viewModel = function(){
  var self = this;
  // 监控用户输入的搜索值
  self.searchStr = ko.observable('');
  // 创建一个数组，存放左侧列表视图中需要显示的 marker集
  self.MarkerListViews = ko.observableArray([]);
  // 遍历 markers[] (在 map.js中定义的)，创建列表视图项，放进 MarkerListViews[]
  markers.forEach(function(marker){
    self.MarkerListViews.push(new MarkerListView(marker));
  });
  // 过滤功能
  self.filter = ko.computed(function(){
    // 将输入的过滤值存放到变量 searchStr (去除所有空格,不区分大小写)
    var searchStr = self.searchStr().replace(/\s+/g,"").toLowerCase();
    // 遍历 markers[] (在 map.js中定义的)，筛选出 title中含有输入字符的 marker
    markers.forEach(function(marker,i){
      var title = marker.title.replace(/\s+/g,"").toLowerCase();
      if(title.match(searchStr)!==null){
        // 将匹配条件的每一个 marker显示到 map上，
        // 每隔 200ms添加一个，形成动画效果
        setTimeout(function() {
          marker.setMap(map);
        }, i * 200);
        // 将匹配条件的每一个 marker对应的列表视图显示出来
        self.MarkerListViews()[i].isVisible(true);
      }else{
        marker.setMap(null);
        self.MarkerListViews()[i].isVisible(false);
      }
    });
  },self);
  // 收起左边的列表视图窗口
  self.hideNav = ko.observable(false);
  self.closeNav = function(){
    self.hideNav(!self.hideNav());
  };
};
