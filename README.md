# Hexo 小程序
### 一、安装 [hexo-generator-restful](https://github.com/yscoder/hexo-generator-restful) 插件

* 按需修改插件中 lib/generator.js 文件，这里给出小程序对应的版本 [generator.js](https://github.com/zhinieing/zhinieing.github.io/blob/master/images/generator.js) 。

* 修改站点配置文件 hexo/_config.yml，这里给出小程序修改的内容：

  ```yaml
  restful:
    # site 可配置为数组选择性生成某些属性
    # site: ['title', 'subtitle', 'description', 'author', 'since', email', 'favicon', 'avatar']
    site: true        # hexo.config mix theme.config
    posts_size: 10    # 文章列表分页，0 表示不分页
    posts_props:      # 文章列表项的需要生成的属性
      title: true
      slug: true
      date: true
      updated: true
      comments: true
      path: true
      excerpt: true
      cover: true      # 封面图
      content: false
      keywords: false
      categories: true
      tags: true
    categories: true         # 分类数据
    use_category_slug: false # Use slug for filename of category data
    tags: true               # 标签数据
    use_tag_slug: false      # Use slug for filename of tag data
    post: true               # 文章数据
    cover_prefix: https://suyan.peng-ming.cn/ # 封面图的 host 站点
    pages: false             # 额外的 Hexo 页面数据, 如 About
  ```

  

### 二、安装 [hexo-generator-searchdb](https://github.com/theme-next/hexo-generator-searchdb) 插件 （开启 hexo 搜索功能，如已安装直接修改）

* 按需修改插件中 lib/database.js 文件，这里给出小程序对应的版本 [database.js](https://github.com/zhinieing/zhinieing.github.io/blob/master/images/database.js) 。

* 修改站点配置文件 hexo/_config.yml，这里给出小程序修改的内容：

  ```yaml
  search:
    path: search.json
    field: post
    format: striptags
    limit: 10000
  ```



### 三、小程序自定义部分

* utils/config.js 中 DOMAIN 为域名，更改为自己的域名。

* 小程序配置有云函数，需要在开发者工具中部署到云端。

* 小程序评论点赞浏览部分使用了小程序云开发数据库，需要在云开发控制台中创建 posts, likes, comments 三个集合（相当于数据表），注意每个集合的权限设置需要用自定义安全规则让所有用户可读写，默认是仅创建者可读写。

* 小程序首页顶部的 swaper 展示的是 hexo topic 标签下的文章，所以 hexo 需要有一个名为 topic 的标签，否则 swaper 无内容。

* 小程序对应 hexo 文章 markdowm 文件格式：（markdowm 文件名需要为英文，标题放在 title 中）

  ```markdown
  ---
  title: 泡在北緯11度的周末里，不想上岸
  date: 2017-11-30 23:38:12
  cover: cover/boracay.jpg  
  categories:
  - travel
  tags:
  - 海岛
  ---
  
  <!-- 文章内容 -->
  
  <audio src="http://music.163.com/song/media/outer/url?id=450567505.mp3" poster="http://p2.music.126.net/ZgaAgq6eXTOKHsMU8rYZKA==/109951163909048455.jpg?param=130y130" name="青鸟与诗" author="愚青" loop autoplay>
  </audio>
  <!-- 本小程序文章有背景音乐，如不需要可将小程序中 pages/detail/detail.wxml 中的 audio 组件删除 -->
  ```

  