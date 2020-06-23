
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var wxApi = require('../../utils/wxApi.js')
var wxRequest = require('../../utils/wxRequest.js')




Page({
  data:{
    text:"Page topic",
    tagsList:{},
    floatDisplay:"none",
    year: new Date().getFullYear()
  },
  onLoad:function(options){
    wx.setNavigationBarTitle({
      title: '素言-标签',
      success: function (res) {
        // success
      }
    });
    wx.showLoading({
      title: '正在加载',
      mask:true
    })
  
    this.fetchTagsData();
  },
  //获取分类列表
  fetchTagsData: function () {
    var self = this;
    self.setData({
      tagsList: []
    });

    var getTagsRequest = wxRequest.getRequest(Api.getTags());

    getTagsRequest.then(response =>{
        self.setData({
            floatDisplay: "block",
            tagsList: response.data.filter(({name}) => name != 'topic')
        });        
    })
    .finally(function () {
        setTimeout(function () {
            wx.hideLoading();
        }, 900)
        wx.hideNavigationBarLoading();;
        });      
  },

  onShareAppMessage: function () {
    return {
      title: '分享“素言”小程序的标签栏目.',
      path: 'pages/tag/tag',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  //跳转至某分类下的文章列表
  redictIndex: function (e) {
    //console.log('查看某类别下的文章');  
    var id = e.currentTarget.dataset.id;
    var url = '../list/list?tagId=' + id;
    wx.navigateTo({
      url: url
    });
  }
  
})