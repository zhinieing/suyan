

import config from 'config.js'

var domain = config.getDomain;
var HOST_URI = 'https://' + domain +'/api/';
   
module.exports = {  
  // 获取文章列表数据
  getPosts: function (obj) {
      var url = HOST_URI + 'posts/' + obj.page + '.json';     
    return url; 

  },
  
  //获取首页滑动文章
  getSwiperPosts: function () {
      var url = HOST_URI + 'tags/topic.json';
      return url;
  },

  //搜索
  getSearch: function () {
    var url = 'https://' + domain + '/search.json';
    return url;
  },

  // 获取内容页数据
  getPostByID: function (id) {
    return HOST_URI + 'articles/' + id + '.json';
  },

  //获取分类列表
  getCategories: function () {
    var url = HOST_URI + 'categories.json';
    return url
  },
  getCategoryList: function (id) {
    var url = HOST_URI + 'categories/' + id + '.json';
    return url;
  },
   //获取标签列表
   getTags: function () {
    var url = HOST_URI + 'tags.json';
    return url
  },
  getTagList: function (id) {
    var url = HOST_URI + 'tags/' + id + '.json';
    return url;
  },

};