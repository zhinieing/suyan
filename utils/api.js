

import config from 'config.js'

var domain = config.getDomain;
var HOST_URI = 'https://' + domain+'/api/';
// var HOST_URI_WATCH_LIFE_JSON = 'https://' + domain + '/wp-json/watch-life-net/v1/';
   
module.exports = {  
  // 获取文章列表数据
  getPosts: function (obj) {
      var url = HOST_URI + 'posts/' + obj.page + '.json';
    
    // if (obj.categories != 0) {
    //   url += '&categories=' + obj.categories;
    // }
    // else if (obj.search != '') {
    //   url += '&search=' + encodeURIComponent(obj.search);
    // }     
    return url; 

  },

// 获取置顶的文章
  getStickyPosts: function () {
    var url = HOST_URI + 'posts?sticky=true&per_page=5&page=1';
    return url;

  },
 
  
  //获取首页滑动文章
  getSwiperPosts: function () {
      var url = HOST_URI + 'tags/topic.json';
      return url;
  },


  // 获取tag相关的文章列表
  getPostsByTags: function (id,tags) {
      var url = HOST_URI + 'posts?per_page=5&&page=1&exclude=' + id + "&tags=" + tags;

      return url;

  },


  // 获取特定id的文章列表
  getPostsByIDs: function (obj) {
    var url = HOST_URI + 'posts?include=' + obj;

    return url;

  },
  // 获取特定slug的文章内容
  getPostBySlug: function (obj) {
      var url = HOST_URI + 'posts?slug=' + obj;
      return url;
  },
  // 获取内容页数据
  getPostByID: function (id) {
    return HOST_URI + 'articles/' + id + '.json';
  },
  // 获取页面列表数据
  getPages: function () {
    return HOST_URI + 'pages';
  },

  // 获取页面列表数据
  getPageByID: function (id, obj) {
    return HOST_URI + 'pages/' + id;
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
  //获取某个分类信息
  getCategoryByID: function (id) {
    var dd = HOST_URI + 'categories/' + id;
    return HOST_URI + 'categories/'+id;
  },
  //获取某文章评论
  getComments: function (obj) {
    return HOST_URI + 'comments?parent=0&per_page=100&orderby=date&order=desc&post=' + obj.postID + '&page=' + obj.page
  },

  //获取网站的最新20条评论
  getNewComments: function () {
      return HOST_URI + 'comments?parent=0&per_page=20&orderby=date&order=desc';
  },

  //获取回复
  getChildrenComments: function (obj) {
    var url= HOST_URI + 'comments?parent_exclude=0&per_page=100&orderby=date&order=desc&post=' + obj.postID
     return url;
  },


  //获取最近的30个评论
  getRecentfiftyComments:function(){
    return HOST_URI + 'comments?per_page=30&orderby=date&order=desc'
  },

  //提交评论
  postComment: function () {
    return HOST_URI + 'comments'
  }, 

  //提交微信评论
  postWeixinComment: function () {
    var url = HOST_URI_WATCH_LIFE_JSON;
    return url + 'comment/add'
  }, 

  //获取微信评论
  getWeixinComment: function (openid) {
      var url = HOST_URI_WATCH_LIFE_JSON;
      return url + 'comment/get?openid=' + openid;
  },    

  //获取文章的第一个图片地址,如果没有给出默认图片
  getContentFirstImage: function (content){
    var regex = /<img.*?src=[\'"](.*?)[\'"].*?>/i;
    var arrReg = regex.exec(content);
    var src ="../../images/logo_black.jpg";
    if(arrReg){   
      src=arrReg[1];
    }
    return src;  
  },

 //获取热点文章
  getTopHotPosts(flag){      
      var url = HOST_URI_WATCH_LIFE_JSON;
      if(flag ==1)
      {
          url +="post/hotpostthisyear"
      }
      else if(flag==2)
      {
          url += "post/pageviewsthisyear"
      }
      else if (flag == 3) {
          url += "post/likethisyear"
      }
      else if (flag == 4) {
          url += "post/praisethisyear"
      }

      return url;
  },

  //更新文章浏览数
  updatePageviews(id) {
      var url = HOST_URI_WATCH_LIFE_JSON;
      url += "post/addpageview/"+id;
      return url;
  },
  //获取用户openid
  getOpenidUrl(id) {
    var url = HOST_URI_WATCH_LIFE_JSON;
    url += "weixin/getopenid";
    return url;
  },

  //点赞
  postLikeUrl() {
    var url = HOST_URI_WATCH_LIFE_JSON;
    url += "post/like";
    return url;
  },

  //判断当前用户是否点赞
  postIsLikeUrl() {
    var url = HOST_URI_WATCH_LIFE_JSON;
    url += "post/islike";
    return url;
  },

  //获取我的点赞
  getMyLikeUrl(openid) {
      var url = HOST_URI_WATCH_LIFE_JSON;
      url += "post/mylike?openid=" + openid;
      return url;
  },

  //赞赏,获取支付密钥
  postPraiseUrl() {   
    var url = 'https://' + domain  + "/wp-wxpay/pay/app.php";
    return url;
  },

  //更新赞赏数据
  updatePraiseUrl() {
    var url = HOST_URI_WATCH_LIFE_JSON;
    url += "post/praise";
    return url;
  },

  //获取我的赞赏数据
  getMyPraiseUrl(openid) {
      var url = HOST_URI_WATCH_LIFE_JSON;
      url += "post/mypraise?openid=" + openid;
      return url;
  },

  //获取所有的赞赏数据
  getAllPraiseUrl() {
      var url = HOST_URI_WATCH_LIFE_JSON;
      url += "post/allpraise";
      return url;
  },

  //发送模版消息
  sendMessagesUrl() {
      var url = HOST_URI_WATCH_LIFE_JSON;
      url += "weixin/sendmessage";
      return url;
  }




};