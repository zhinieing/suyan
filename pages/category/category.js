
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var wxApi = require('../../utils/wxApi.js')
var wxRequest = require('../../utils/wxRequest.js')




Page({
  data:{
    text:"Page topic",
    categoriesList:{},
    floatDisplay:"none",
    year: new Date().getFullYear()
  },
  onLoad:function(options){
    wx.setNavigationBarTitle({
      title: '素言-专题',
      success: function (res) {
        // success
      }
    });
    wx.showLoading({
      title: '正在加载',
      mask:true
    })
   

    this.fetchCategoriesData();
  },
  //获取分类列表
  fetchCategoriesData: function () {
    var self = this;
    self.setData({
      categoriesList: []
    });

    var getCategoriesRequest = wxRequest.getRequest(Api.getCategories());

    getCategoriesRequest.then(response =>{
        self.setData({
            floatDisplay: "block",
            categoriesList: response.data
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
      title: '分享“素言”小程序的专题栏目.',
      path: 'pages/topic/topic',
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
    var url = '../list/list?categoryId=' + id;
    wx.navigateTo({
      url: url
    });
  }
  
})