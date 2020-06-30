
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var WxParse = require('../../wxParse/wxParse.js');
var wxApi = require('../../utils/wxApi.js')
var wxRequest = require('../../utils/wxRequest.js')

import config from '../../utils/config.js'

const db = wx.cloud.database()

Page({
  data: {    
    postsList: [],
    postsShowSwiperList:[],
    postsDb: [],
    isLastPage:false,    
    page: 1,
    search: '',
    categories: 0,
    showerror:"none",
    showCategoryName:"",
    categoryName:"",
    showallDisplay:"block", 
    displayHeader:"none",
    displaySwiper: "none",
    floatDisplay: "none",
    year: new Date().getFullYear()
  },
  formSubmit: function (e) {
    var url = '../list/list'
    if (e.detail.value.input != '') {
      url = url + '?search=' + e.detail.value.input;
      wx.navigateTo({
        url: url
      })
    }
    else
    {
      wx.showModal({
        title: '提示',
        content: '请输入搜索内容',
        showCancel: false,
      });


    }
  },
  onShareAppMessage: function () {
    return {
      title: config.getWebsiteName,
      path: 'pages/index/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  onPullDownRefresh: function () {
    var self = this;
    self.setData({
      showerror: "none",
      showallDisplay:"none",
      displaySwiper:"none",
      floatDisplay:"none",
      isLastPage:false,
      page:0,
      postsShowSwiperList:[]
    });
    this.fetchTopFivePosts(); 
    
  },
  onReachBottom: function () {

    //console.log("xialajiazai");  
   
  },
  onLoad: function (options) {
    var self = this; 
    this.fetchTopFivePosts();   
    this.fetchPostsData(self.data);
    wx.cloud.callFunction({
      name: 'posts',
      data: {},
      success: res => {
          self.setData({
            postsDb: res.result.data,
            postsList: self.data.postsList.map(item => {
              let record = null;
              res.result.data.some(post => {
                if (post._id == item.slug) {
                  record = post
                  return true
                }
              });
              if (record != null) {
                item.commentNum = record.comments;
                item.viewNum = record.views;
                item.likeNum = record.likes;
              }
              return item;
            })
          })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    });
  },
  onShow: function (options){
      wx.setStorageSync('openLinkCount', 0);

  },  
  fetchTopFivePosts: function () {
    var self = this;
    //取置顶的文章
    var getPostsRequest = wxRequest.getRequest(Api.getSwiperPosts());
    getPostsRequest.then(response => {
        if (response.statusCode === 200 && response.data.postlist.length > 0) {
                self.setData({
                    postsShowSwiperList: response.data.postlist,
                    showallDisplay: "block",
                    displaySwiper: "block"
                });
                
            }
            else {
                self.setData({
                    displaySwiper: "none",
                    displayHeader: "block",
                    showallDisplay: "block",

                });
                
            }
     
    })
        .catch(function (response){
            console.log(response); 
            self.setData({
                showerror: "block",
                floatDisplay: "none"
            });

        })
        .finally(function () {
        
    });            
   
  },

  //获取文章列表数据
  fetchPostsData: function (data) {
    var self = this;    
    if (!data) data = {};
    if (!data.page) data.page = 1;
    if (!data.categories) data.categories = 0;
    if (!data.search) data.search = '';
    if (data.page === 1) {
      self.setData({
        postsList: []
      });
    };
    wx.showLoading({
      title: '正在加载',
      mask:true
    }); 
    var getPostsRequest = wxRequest.getRequest(Api.getPosts(data));
    getPostsRequest
        .then(response => {
            if (response.statusCode === 200) {
                if (response.data.data.length < 10) {
                    self.setData({
                        isLastPage: true
                    });
                }
                self.setData({
                    floatDisplay: "block",
                    postsList: self.data.postsList.concat(response.data.data.map(item => {
                      db.collection('posts').doc(item.slug).get({
                        success: function(res) {
                        },
                        fail: function() {
                          db.collection('posts').add({
                            data: {
                              _id: item.slug,
                              date: new Date(),
                              comments: 0,
                              views: 0,
                              likes: 0
                            }
                          })
                        }
                      });
                      item.date = util.cutstr(item.date, 10, 1);
                      return item;
                    })).map(item => {
                      let record = null;
                      self.data.postsDb.some(post => {
                        if (post._id == item.slug) {
                          record = post
                          return true
                        }
                      });
                      if (record != null) {
                        item.commentNum = record.comments;
                        item.viewNum = record.views;
                        item.likeNum = record.likes;
                      }
                      return item;
                    })
                });
            }
            
            setTimeout(function () {
              wx.hideLoading();
            }, 1000);
        })
        .catch(function (response)
        {
            console.log(response)
            if (data.page == 1) {

                self.setData({
                    showerror: "block",
                    floatDisplay: "none"
                });

            }
            else {
                wx.showModal({
                    title: '加载失败',
                    content: '加载数据失败,请重试.',
                    showCancel: false,
                });
                self.setData({
                    page: data.page - 1
                });
            }

        })
        .finally(function (response) {
            wx.hideLoading();
            wx.stopPullDownRefresh();
        });
  },
  //加载分页
  loadMore: function (e) {
    
    var self = this;
    if (!self.data.isLastPage)
    {
      self.setData({
        page: self.data.page + 1
      });
      //console.log('当前页' + self.data.page);
      this.fetchPostsData(self.data);
    }
    else
    {
      wx.showToast({
        title: '没有更多内容',
        mask: false,
        duration: 1000
      });
    }
  },
  // 跳转至查看文章详情
  redictDetail: function (e) {
    // console.log('查看文章');
    var id = e.currentTarget.id,
      url = '../detail/detail?id=' + id;
    wx.navigateTo({
      url: url
    })
  },
  //返回首页
  redictHome: function (e) {
    //console.log('查看某类别下的文章');  
    var id = e.currentTarget.dataset.id,
      url = '/pages/index/index';
    wx.switchTab({
      url: url
    });
  }
})
