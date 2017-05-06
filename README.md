# chrome-plugin-selenium

## 介绍

这是一个前端自动化测试工具,`Web Browser Automation`.

## 结构

``` javascript
.
├── css                                   # 样式目录
├── html                                  # popup页面
├── image                                 # 图标目录
├── lib                                   # 样式和js库
├── scripts                               # background/content_script/popup文件目录
│   ├── bootom                            # [底层]
│   │  ├── constant_bt.js                 # 底层常量
│   │  └── fn_bt.js		          # 底层工具方法
│   ├── middle                            # [中间层]
│   │  ├── message_md.js                  # 通信工具方法
│   │  ├── storage_md.js                  # 存储工具方法
│   │  ├── content_script_record_md.js    # 记录操作
│   │  ├── content_script_oper_md.js      # 执行记录
│   │  ├── content_script_md.js           # content_script中间层
│   │  └── background.js		          # background中间层
│   └── plugin			          # [应用层]
│      ├── popup.js                       # popup页面脚本
│      ├── content_script.js              # 植入页面脚本
│      └── background.js		          # 后台脚本
└── manigest.json                         # 配置文件
```

## 问题

- 存储改为一个对象之后,比较大的问题是读取和存储的速度没有通信那么快,同时设置整个对象后可能因为两个地方在同时读取和设置,导致数据不统一,解决的问题是重新修改底层的api,使存储对象可以修改部分.
- 在background中修改opering状态时有时候会修改失败(猜测是因为操作时的存储设置导致),所以在操作时实时存储opering的状态


## 缺陷

- 记录的跳转时间没有记录,这样一来同样的记录在不同PC上使用时可能因为网络问题而导致记录无法正确执行



## 存储结构

``` javascript
 storage: {
     //操作状态
     status:{
         recording: false,   //是否正在记录 [pupup(r)/background(rw)/content_script(r)]
         opering: false      //是否正在执行 [pupup(r)/background(rw)/content_script(r)]
     },
     //存储数据
     data: {
         recordName: '',     //记录名称 [pupup(r)/background(rw)]
         time: Date.now(),   //一条操作记录中的每个操作记录的时间戳 [content_script(rw)]
         record: [],         //正在记录的单条操作数据 [content_script(rw)/background(rw)]
         recordList: [       //记录列表 [pupup(rw)/background(rw)]

             //selected:     //记录是否被选中;
             //recordTime:   //记录时间;
             //record:       //记录数据;
             //html:         //记录列表li的内容(popup.html显示用);
             //href:         //记录的起始url
         ],
         oper: [],           //正在执行的单条记录
         operList: []        //需要执行的记录列表 [pupup(rw)/background(rw)]
     }
 }
```
## 版本

`V1.0.0`



## 优秀插件和结构

- [程序员必备的chrome插件](https://github.com/jiang111/chrome-plugin-recommand)

- [划词翻译](https://github.com/Selection-Translator/crx-selection-translate)

大体上采用webpack使用es6语法设计(利用import分离文件)

- [octotree](https://github.com/buunguyen/octotree)

大体上采用gulp使用es6语法设计(采用class和import),但是配置文件和background.js比较神奇,找不到content_script在哪里!

- [tomato](https://github.com/Pearyman/chrome_plugin/)

一款非常实用的搜索常用前端网站的插件

- [FeHelper](https://github.com/zxlie/FeHelper)

代码优化/压缩插件,感觉有点类似使用命名空间(文件夹超级多)

- [Wappalyzer](https://github.com/AliasIO/Wappalyzer)

显示网站的技术栈构成(使用的框架等), 模块化/ES6

- [Holmes] 书签搜索插件

- [IE Tab] 可以模拟IE7以上的浏览器环境

- [CSS Viewer] 元素的css样式查看器

- [Session Manager] 会话管理扩展

- [Postman] 强大的 API & HTTP 请求调试工具(这是一个桌面应用,接口调试工具)

- [Page ruler] 显示元素的尺寸

- [SEO for chrome] chrome搜索引擎优化

- [WindowResizer] 快速调整浏览器窗口以仿效各种不同的分辨率

- [WhatFont] 识别网页上的字体最简单的方法

- [ResponsiveInspector] 开发响应式网络布局时非常有用

- [EnjoyCSS] 生成css3代码

- [User-Agent Selector] 使用User-Agent Selector插件模拟手机等移动设备访问网站
