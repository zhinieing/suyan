
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var WxParse = require('../../wxParse/wxParse.js');
var wxApi = require('../../utils/wxApi.js')
var wxRequest = require('../../utils/wxRequest.js')

const db = wx.cloud.database()

Page({
  data: {
    title: '文章列表',
    postsList: [],
    postsDb: [],
    isLastPage: false,
    page: 1,
    search: '',
    categoryId:'',
    tagId:'',
    showerror:"none",
    isCategoryPage:"none",
    isTagPage:"none",
    isSearchPage:"none",
    showallDisplay: "block",
    displaySwiper: "block",
    floatDisplay: "none",
    year: new Date().getFullYear()
  },
  formSubmit: function (e) {
    var url = '../list/list'
    if (e.detail.value.input != '') {
      url = url + '?search=' + e.detail.value.input;
    }
    wx.navigateTo({
      url: url
    })
  },
  onShareAppMessage: function () {

    var title = "分享“素言”";
    var path =""

    if (this.data.categoryId)
  {
      title += "的专题：" + this.data.categoryId;
      path = 'pages/list/list?categoryId=' + this.data.categoryId;

  }
  else
  {
      title += "的搜索内容：" + this.data.search;
      path = 'pages/list/list?search=' + this.data.search;
  }


    return {
      title: title,
      path: path,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  reload:function(e)
  {
    var self = this;
    if (self.data.categoryId) {
      self.setData({
        isCategoryPage: "block",
        showallDisplay: "none",
        showerror: "none",
      });
    }
    if (self.data.tagId) {
      self.setData({
        isTagPage: "block",
        showallDisplay: "none",
        showerror: "none",
      });
    }
    if (self.data.search && self.data.search != '') {
      self.setData({
        isSearchPage: "block",
        showallDisplay: "none",
        showerror: "none"
      })
    }
    self.fetchPostsData(self.data);
  },
  //加载分页
  loadMore: function (e) {
    var self = this;
    if (!self.data.isLastPage) {
      self.setData({
        page: self.data.page + 1
      });
      console.log('当前页' + self.data.page);
      this.fetchPostsData(self.data);
    }
    else {
      wx.showToast({
        title: '没有更多内容',
        mask: false,
        duration: 1000
      });
    }
  },
  onLoad: function (options) {
    var self = this;
    if (options.categoryId) {
      wx.setNavigationBarTitle({
        title: options.categoryId,
        success: function (res) {
        }
      });
      self.setData({
        categoryId: options.categoryId,
        isCategoryPage:"block"
      });
    }
    if (options.tagId) {
      wx.setNavigationBarTitle({
        title: options.tagId,
        success: function (res) {
        }
      });
      self.setData({
        tagId: options.tagId,
        isTagPage:"block"
      });
    }
    if (options.search && options.search != '') {
      wx.setNavigationBarTitle({
        title: "搜索关键字：" + options.search,
        success: function (res) {
        }
      });
      self.setData({
        search: options.search,
        isSearchPage:"block"
      })
    }   
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
    this.fetchPostsData(self.data); 
  },
  //获取文章列表数据
  fetchPostsData: function (data) {
    var self = this;  
    if (!data) data = {};
    if (!data.page) data.page = 1;
    if (!data.categoryId) data.categoryId = 0;
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

    var getPostsRequest;
    if (self.data.categoryId != '') {
      getPostsRequest = wxRequest.getRequest(Api.getCategoryList(data.categoryId));
    } else if (self.data.tagId != '') {
      getPostsRequest = wxRequest.getRequest(Api.getTagList(data.tagId));
    } else {
      getPostsRequest = wxRequest.getRequest(Api.getSearch());
    }
  
    getPostsRequest.then(response =>{
        if (response.statusCode === 200) {
            self.setData({
              isLastPage: true
            });

            if (self.data.search != '') {
              var keywords = self.data.search.split(/[\s\-]+/);

              self.setData({
                floatDisplay: "block",
                showallDisplay: "block",
                postsList: self.data.postsList.concat(response.data.filter(item => {
                  var result = false
                  keywords.some(keyword =>{
                    if (item.title.indexOf(keyword) > -1 || item.content.indexOf(keyword) > -1) {
                      result = true
                      return true
                    }
                  })
                  return result
                }).map(item => {
                  var post = {}
                  post.title = item.title
                  post.slug = item.slug
                  post.cover = item.cover
                  post.date = util.cutstr(item.date, 10, 1)
  
                  let record = null;
                  self.data.postsDb.some(post => {
                    if (post._id == item.slug) {
                      record = post
                      return true
                    }
                  });
                  if (record != null) {
                    post.commentNum = record.comments;
                    post.viewNum = record.views;
                    post.likeNum = record.likes;
                  }
                  return post;
                }))
              })

              if (self.data.postsList.length == 0) {
                wx.showToast({
                  title: '什么都没找到',
                })
              }
            } else {
              self.setData({
                floatDisplay: "block",
                showallDisplay: "block",
                postsList: self.data.postsList.concat(response.data.postlist.map(item => {
                  item.date = util.cutstr(item.date, 10, 1);
                  return item;
                })).map(item => {
                  let record = self.data.postsDb.filter(post => post._id == item.slug);
                  if (record.length > 0) {
                    item.commentNum = record[0].comments;
                    item.viewNum = record[0].views;
                    item.likeNum = record[0].likes;
                  }
                  return item;
                })
              });
            }
        }

        setTimeout(function () {
          wx.hideLoading();
        }, 1000);
    })
    .catch(function(error){        
        if (data.page == 1) {
            console.log(error)
            self.setData({
                showerror: "block",
                floatDisplay: "none"
            });
        }

    })
    .finally(function () {
        wx.hideLoading();
    })  
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

  //获取分类列表
  // fetchCategoriesData: function (id) {
  //   var self = this;
  //   self.setData({
  //     categoriesList: []
  //   });

  //   var getCategoryRequest = wxRequest.getRequest(Api.getCategoryByID(id));

  //   getCategoryRequest.then(response =>{

  //       var catImage = "";
  //       if (typeof (response.data.category_thumbnail_image) == "undefined" || response.data.category_thumbnail_image == "") {
  //           catImage = "../../images/website.png";
  //       }
  //       else {
  //           catImage = response.data.category_thumbnail_image;
  //       }

  //       self.setData({
  //           categoriesList: response.data,
  //           categoriesImage: catImage,
  //           categoriesName: response.name
  //       });

  //       wx.setNavigationBarTitle({
  //           title: response.data.name,
  //           success: function (res) {
  //               // success
  //           }
  //       });

  //       self.fetchPostsData(self.data); 

  //   })
  // },

})



