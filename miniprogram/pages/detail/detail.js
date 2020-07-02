


import config from '../../utils/config.js'
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var auth = require('../../utils/auth.js');
var WxParse = require('../../wxParse/wxParse.js');
var wxApi = require('../../utils/wxApi.js')
var wxRequest = require('../../utils/wxRequest.js')
var app = getApp();

const db = wx.cloud.database()
const $ = db.command.aggregate

Page({
    onReady: function (e) {
        this.audioCtx = wx.createAudioContext('myAudio')
        this.audioCtx.play()
    },
    data: {
        title: '文章内容',
        detail: {},
        postDb: {},
        commentList: [],        
        likeList: [],
        ChildrencommentList: [],
        detailDate: '',
        commentValue: '',
        wxParseData: [],
        display: 'none',
        page: 1,
        isLastPage: false,
        parentID: "0",
        focus: false,
        postID: null,
        scrollHeight: 0,
        postList: [],
        link: '',        
        dialog: {
            title: '',
            content: '',
            hidden: true
        },
        content: '',      
        isLike: false,
        isShow: false,//控制menubox是否显示
        isLoad: true,//解决menubox执行一次  
        menuBackgroup: false,  
        inputComment: ''
    },
    onLoad: function (options) {
        this.fetchDetailData(options.id);
        var self = this;
        db.collection('posts').doc(options.id).get({
            success: function(res) {
                self.setData({
                    postDb: res.data
                })
            },
            fail: function() {
            }
          });
    },    
    getLikeList: function(id){
        var self = this;
        wx.cloud.callFunction({
            name: 'likes',
            data: {
                postId: id
            },
            success: res => {
                self.setData({
                    likeList: res.result.data
                })
            },
            fail: err => {
              console.error('[云函数] [login] 调用失败', err)
            }
          });
    },
    onShareAppMessage: function (res) {
        return {
          title: '分享"' + config.getWebsiteName +'"的文章：' + this.data.detail.title.rendered,
            path: 'pages/detail/detail?id=' + this.data.detail.id,
            success: function (res) {
                // 转发成功
                console.log(res);
            },
            fail: function (res) {
                console.log(res);
                // 转发失败
            }  
        }
    },
    copyLink: function () {
        wx.setClipboardData({
            data: this.data.link,
            success: function (res) {
                wx.getClipboardData({
                    success: function (res) {
                        wx.showToast({
                            title: '链接已复制'
                        })
                    }
                })
            }
        })
    },
    getUserInfoLike: function(e) {
        var self = this;
        if (e.detail.userInfo) {
            if (self.data.isLike) {
                wx.showModal({
                    title: '提示',
                    content: '要取消点赞吗',
                    success (res) {
                        if (res.confirm) {
                          db.collection('likes').where({
                            _openid: app.globalData.openid,
                            postId: self.data.detail.slug 
                          }).get({
                            success: function(res) {
                                if (res.data.length > 0) {
                                    db.collection('likes').doc(res.data[0]._id).remove({
                                        success: function(res) {
                                            self.setData({
                                                isLike: false,
                                                'postDb.likes': self.data.postDb.likes - 1
                                            });  
                                            self.getLikeList(self.data.detail.slug)
                                            if (self.data.postDb.likes != null) {
                                                db.collection('posts').doc(self.data.detail.slug).update({
                                                    data: {
                                                        likes: self.data.postDb.likes
                                                    }
                                                })
                                            }
                                        }
                                    })
                                }
                            }
                          })
                        } 
                      }
                })
            } else {
                db.collection('likes').add({
                    data: {
                        postId: self.data.detail.slug,
                        title: self.data.detail.title,
                        cover: self.data.detail.cover,
                        nickName: e.detail.userInfo.nickName,
                        avatarUrl: e.detail.userInfo.avatarUrl,
                        date: new Date()
                    },
                    success: function(res) {
                        self.setData({
                            isLike: true,
                            'postDb.likes': self.data.postDb.likes + 1
                        });  
                        self.getLikeList(self.data.detail.slug)
                        if (self.data.postDb.likes != null) {
                            db.collection('posts').doc(self.data.detail.slug).update({
                                data: {
                                    likes: self.data.postDb.likes
                                }
                            })
                        }
                    },
                    fail: function(res) {
                        self.setData({
                            'dialog.hidden': false,
                            'dialog.title': '提示',
                            'dialog.content': '点赞文章失败'
                        });
                    }
                })
            }
        } else {
            self.setData({
                'dialog.hidden': false,
                'dialog.title': '提示',
                'dialog.content': '用户授权后才能点赞'
            });
        }
    },
    getIslike: function (id) { //判断当前用户是否点赞
        var self = this;
        db.collection('likes').where({
            _openid: app.globalData.openid,
            postId: id 
        }).get({
            success: function(res) {
                if (res.data.length > 0) {
                    self.setData({
                        isLike: true
                    })
                } 
            },
            fail: console.error
        })
    },    
   
    goHome:function()
    {
        wx.switchTab({
            url: '../index/index'
        })
    },

    //获取文章内容
    fetchDetailData: function (id) {
        var self = this;
        wx.showLoading({
            title: '正在加载',
            mask:true
          });
        var getPostDetailRequest = wxRequest.getRequest(Api.getPostByID(id));

        getPostDetailRequest
            .then(response => {
                if (response.statusCode === 200) {
                    self.setData({
                        detail: response.data,
                        postID: id,
                        link: config.getDomain + '/' + id,
                        detailDate: util.cutstr(response.data.date, 10, 1),
                        wxParseData: WxParse.wxParse('article', 'html', response.data.content, self, 5),
                        display: 'block',
                        'postDb.views': self.data.postDb.views + 1
                    });

                    wx.setNavigationBarTitle({
                        title: response.data.title
                    });
                
                    self.getIslike(id);
                    self.getLikeList(id);
                    self.getCommentList(id, self.data.page);

                    if (self.data.postDb.views != null) {
                        db.collection('posts').doc(id).update({
                            data: {
                                views: self.data.postDb.views
                            }
                        });
                    }

                    // 调用API从本地缓存中获取阅读记录并记录
                    var logs = wx.getStorageSync('readLogs') || [];
                    // 过滤重复值
                    if (logs.length > 0) {
                        logs = logs.filter(function (log) {
                            return log.postId !== id;
                        });
                    }
                    // 如果超过指定数量
                    if (logs.length > 19) {
                        logs.pop();//去除最后一个
                    }
                    logs.unshift({
                        postId: id,
                        title: response.data.title,
                        cover: response.data.cover
                    });
                    wx.setStorage({
                        key: 'readLogs',
                        data: logs
                    })
                }
                setTimeout(function () {
                    wx.hideLoading();
                }, 1000);
            })
            .finally(function () {
                wx.hideLoading();
            })  
    },
    //给a标签添加跳转和复制链接事件
    wxParseTagATap: function (e) {
        var self = this;
        var href = e.currentTarget.dataset.src;
        console.log(href);
        var domain = config.getDomain;
        //可以在这里进行一些路由处理
        if (href.indexOf(domain) == -1) {
            wx.setClipboardData({
                data: href,
                success: function (res) {
                    wx.getClipboardData({
                        success: function (res) {
                            wx.showToast({
                                title: '链接已复制'
                            })
                        }
                    })
                }
            })
        }
        else {
            var slug = util.GetUrlFileName(href, domain);
            if (slug == 'index') {
                wx.switchTab({
                    url: '../index/index'
                })
            }
            else {
                var getPostSlugRequest = wxRequest.getRequest(Api.getPostBySlug(slug));
                getPostSlugRequest
                    .then(res => {

                        if (res.data.length !=0)
                        {
                            var postID = res.data[0].id;
                            var openLinkCount = wx.getStorageSync('openLinkCount') || 0;
                            if (openLinkCount > 4) {
                                wx.redirectTo({
                                    url: '../detail/detail?id=' + postID
                                })
                            }
                            else {
                                wx.navigateTo({
                                    url: '../detail/detail?id=' + postID
                                })
                                openLinkCount++;
                                wx.setStorageSync('openLinkCount', openLinkCount);
                            }
                        }
                        else
                        {
                            var url = '../webpage/webpage'
                            wx.navigateTo({
                                url: url + '?url=' + href
                            })                           

                        }
                        

                    })

            }
        }

    },
    //获取评论
    getCommentList: function (postId, page) {
        var self = this;
        db.collection('comments')
          .aggregate()
          .match({
            postId: postId
          })
          .sort({
            date: -1
          })
          .skip(10 * (page - 1))
          .limit(10)
          .project({
            _openid: 1,
            avatarUrl: 1,
            nickName: 1,
            content: 1,
            formatDate: $.dateToString({
              date: '$date',
              format: '%Y-%m-%d %H:%M:%S',
              timezone: 'Asia/Shanghai'
            })
          }).end({
            success: function(res) {
                if (res.list.length < 10) {
                    self.setData({
                        isLastPage: true
                    })
                } else {
                    self.setData({
                        isLastPage: false
                    })
                }
                self.setData({
                    openid: app.globalData.openid,
                    commentList: self.data.commentList.concat(res.list)
                })
            }
          })
    },
    deleteComment: function(e) {
        var self = this;
        db.collection('comments').doc(e.target.id)
        .remove({
            success: function(res) {
                wx.showToast({
                  title: '删除评论成功',
                })
                self.setData({
                    page: 1,
                    commentList: [],
                    'postDb.comments': self.data.postDb.comments - 1
                });
                self.getCommentList(self.data.detail.slug, self.data.page)
                if (self.data.postDb.comments != null) {
                    db.collection('posts').doc(self.data.detail.slug).update({
                        data: {
                            comments: self.data.postDb.comments
                        }
                    })
                }
            }
        })
    },
    //获取回复
    // fetchChildrenCommentData: function (data, flag) {
    //     var self = this;
    //     var getChildrenCommentsRequest = wxRequest.getRequest(Api.getChildrenComments(data));
    //     getChildrenCommentsRequest
    //         .then(response => {
    //             if (response.data) {
    //                 self.setData({
    //                     ChildrencommentList: self.data.ChildrencommentList.concat(response.data.map(function (item) {
    //                         var strSummary = util.removeHTML(item.content.rendered);
    //                         var strdate = item.date
    //                         item.summary = strSummary;

    //                         item.date = util.formatDateTime(strdate);
    //                         if (item.author_url.indexOf('wx.qlogo.cn') != -1) {
    //                             if (item.author_url.indexOf('https') == -1) {
    //                                 item.author_url = item.author_url.replace("http", "https");
    //                             }
    //                         }
    //                         else {
    //                             item.author_url = "../../images/gravatar.png";
    //                         }
    //                         return item;
    //                     }))

    //                 });

    //             }
    //             setTimeout(function () {
    //                 //wx.hideLoading();
    //                 if (flag == '1') {
    //                     wx.showToast({
    //                         title: '评论发布成功。',
    //                         icon: 'success'
    //                         success: function () {

    //                         }
    //                     })
    //                 }
    //             }, 900);
    //         })
    // },
    //显示或隐藏功能菜单
    ShowHideMenu: function () {
        this.setData({
            isShow: !this.data.isShow,
            isLoad: false,
            menuBackgroup: !this.data.false
        })
    },
    //点击非评论区隐藏功能菜单
    hiddenMenubox: function () {
        this.setData({
            isShow: false,
            menuBackgroup: false
        })
    },
    //底部刷新
    loadMore: function (e) {
        var self = this;
        if (!self.data.isLastPage) {
            self.setData({
                page: self.data.page + 1
            });
            console.log('当前页' + self.data.page);
            this.getCommentList(self.data.detail.slug, self.data.page);
        }
        else {
            wx.showToast({
                title: '没有更多内容',
                mask: false
            });
        }
    },
    replay: function (e) {
        var self = this;
        var id = e.target.dataset.id;
        var name = e.target.dataset.name;
        self.setData({
            parentID: id,
            content: "@" + name + ":",
            focus: true
        });
    },
    getUserInfoComment: function(e) {
        var self = this;
        if (e.detail.userInfo) {
            if (self.data.inputComment == '') {
                self.setData({
                    'dialog.hidden': false,
                    'dialog.title': '提示',
                    'dialog.content': '评论内容不能为空'
                });
            } else {
                wx.cloud.callFunction({
                    name: 'msgCheck',
                    data: {
                        msg: self.data.inputComment
                    },
                    success: res => {
                        if (res.result &&res.result.errCode == 87014) {
                            wx.showToast({
                              title: '文字违规',
                            })
                        } else {
                            db.collection('comments').add({
                                data: {
                                    postId: self.data.detail.slug,
                                    title: self.data.detail.title,
                                    cover: self.data.detail.cover,
                                    content: self.data.inputComment,
                                    nickName: e.detail.userInfo.nickName,
                                    avatarUrl: e.detail.userInfo.avatarUrl,
                                    date: new Date()
                                },
                                success: function(res) {
                                    wx.showToast({
                                      title: '评论成功'
                                    })
                                    self.setData({
                                        page: 1,
                                        commentList: [],
                                        inputComment: '',
                                        'postDb.comments': self.data.postDb.comments + 1
                                    });
                                    self.getCommentList(self.data.detail.slug, self.data.page)
                                    if (self.data.postDb.comments != null) {
                                        db.collection('posts').doc(self.data.detail.slug).update({
                                            data: {
                                                comments: self.data.postDb.comments
                                            }
                                        })
                                    }
                                },
                                fail: function(res) {
                                    self.setData({
                                        'dialog.hidden': false,
                                        'dialog.title': '提示',
                                        'dialog.content': '评论文章失败'
                                    });
                                }
                            })
                        }
                        
                    },
                    fail: err => {
                      console.error('[云函数] [login] 调用失败', err)
                    }
                }); 
            }  
        } else {
            self.setData({
                'dialog.hidden': false,
                'dialog.title': '提示',
                'dialog.content': '用户授权后才能评论'
            });
        }
    },
    //提交评论
    inputChange: function (e) {
        this.setData({
            inputComment: e.detail.value
        })
    },
    userAuthorization: function (){
        var self = this;
        // 判断是否是第一次授权，非第一次授权且授权失败则进行提醒
        wx.getSetting({
            success: function success(res) {
                console.log(res.authSetting);
                var authSetting = res.authSetting;
                if (util.isEmptyObject(authSetting)) {
                    console.log('第一次授权');
                } else {
                    console.log('不是第一次授权', authSetting);
                    // 没有授权的提醒
                    if (authSetting['scope.userInfo'] === false) {
                        wx.showModal({
                            title: '用户未授权',
                            content: '如需正常使用评论、点赞、赞赏等功能需授权获取用户信息。是否在授权管理中选中“用户信息”?',
                            showCancel: true,
                            cancelColor: '#296fd0',
                            confirmColor: '#296fd0',
                            confirmText: '设置权限',
                            success: function (res) {
                                if (res.confirm) {
                                    console.log('用户点击确定')
                                    wx.openSetting({
                                        success: function success(res) {
                                            console.log('打开设置', res.authSetting);
                                            var scopeUserInfo = res.authSetting["scope.userInfo"];
                                            if (scopeUserInfo) {
                                                auth.getUsreInfo();
                                            }
                                        }
                                    });
                                }
                            }
                        })
                    }
                }
            }
        });
       },
    confirm: function () {
        this.setData({
            'dialog.hidden': true,
            'dialog.title': '',
            'dialog.content': ''
        })
    } 
})