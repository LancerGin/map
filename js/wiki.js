// 向第三方API发送请求获取相关信息
(function(){
  // 遍历地点集向 WikipediaAPI发送请求，获取每个地点的信息
  $.each( locations, function( key, val ) {
    // 属于每一个地点的 wiki信息
    var wiki;
    //wikipedia-links
    var wiki_url = "https://en.wikipedia.org/w/api.php";
    wiki_url += '?' + $.param({
      'action': 'opensearch',
      'search':  val.title,
      'format': 'json'
    });
    // 如果请求失败会显示此信息
    var wikiRequestTimeout = setTimeout(function(){
      wiki = 'failed to get wikipedia resources';
      // 保存到全局变量 wikis[]里面
      wikis[val.title]=wiki;
    },5000);
    $.ajax({
      'url':wiki_url,
      'dataType':'jsonp',//表明这是一个jsonp请求（获取的数据被包含在一个函数内返回）
      'success': function( data ) {
        // 请求成功后清除这个延迟函数
        clearTimeout(wikiRequestTimeout);
        // 通过返回的数据设置 wiki信息
        if(data[1]){
          var a = '<a href="'+data[3][0]+'">'+data[1][0]+'</a>';
          wiki = '<h3 class="wikipedia-links">' + a + "</h3>";
        }else{
          wiki = 'no wikipedia resources for this';
        }
        wikis[val.title]=wiki;
      }
    });
  });
})();
