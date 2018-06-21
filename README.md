# 生产打印管理工具
此项目初始是公司为了规范化生产部的出货、标签、打印、烧写等流程的工具。

## 项目介绍
因为打印、烧写等需要监听本地UDP端口以及获取本机的打印机等，使用B/S架构可能不太适合，或者说使用B/S就必须有一台服务器，并且这是一个工具，所以个人认为C/S架构更合适。而对于设备的MAC信息后期需要一个单独的数据库来存储设备的出厂、故障、维修记录以及MAC使用情况。便于公网查看管理
使用技术：
| 前端框架 | 数据库 | 桌面框架 | UI框架 |
--------- | ------- | -------| ------
 React    | sqlite | electron | ant design
_目前只是一个c/s工具，且并未完成，所以并没有涉及单独的设备信息管理工具的数据库，后期自行选择数据库_

## 完成情况
由于此项目并不是公司的主要项目，且中途由于应急广播会议系统等项目导致项目只是有一个雏形，下面列出已完成部分与未完成的部分
**已完成：**
- electron + react 框架搭建
- 标签模板设计
- 标签模板保存
- 批量打印（由于node打印模块在electron的环境中无法打印，所以换城调浏览器的打印，排版问题还没解决）

**未完成**
- [ ] 批量打印的排版调整（与现实的打印纸张对齐）
- [ ] 设备批量mac烧写与打印 （戴阳广播中完成过）
- [ ] 设备信息的存储

## 项目目录介绍
| 目录 | 介绍 | 
 ----- | ---- | 
 build | react项目构建的目录
 config| webpack的配置文件目录
 db    | sqlite 数据库文件与封装的sqlite方法文件`db_tool.js`
 main  | electron 代码，printimage目录里面放的打印的图片，printer.js注册一些通讯方式
 public| 静态资源文件夹
 scripts | react启动，构建，测试脚本
 src | react项目文件夹
 electron.js | electron + react 启动脚本(开发时要先启动react项目，再启动electron项目.因为electron的入口依赖于react启后的地址`localhost:3000`) 
 main | electron 启动代码

 ## 项目启动方式
 **编译**
_注意:npm install 之后npm start可能报错`can't find module sqlite3.node`,这是因为electron的环境与node环境不同，需要重新编译。在win10上直接运行`npm在win10上直接运行`npm run rebuild`重新编译模块即可。如果编译失败可能就要去electron-rebuild 的github上看有没有解决的办法了。下面提供几个解决的参考网址_
```
npm install -g node-gyp
Follow the instructions on https://github.com/nodejs/node-gyp
npm install electron-rebuild --save-dev
npm install sqlite3 --save-dev
add to your package.json - scripts following:
"postinstall": "cd node_modules/sqlite3 && npm install nan && npm run prepublish && node-gyp configure --module_name=node_sqlite3 --module_path=../lib/binding/electron-v1.4-win32-x64 && node-gyp rebuild --target=1.4.13 --arch=x64 --target_platform=win32 --dist-url=https://atom.io/download/atom-shell --module_name=node_sqlite3 --module_path=../lib/binding/electron-v1.4-win32-x64"
npm run postinstall
```
- [网址1](https://github.com/electron/electron/issues/7841)
- [网址2](https://blog.csdn.net/jiyulonely/article/details/77089701)
- [网址3](https://github.com/mapbox/node-sqlite3/issues/761)
- [网址4](https://newsn.net/say/electron-install-sqlite3.html)

**启动**
 1. 非debuge模式：
 `npm start` 

 2. debuge 模式：
  - 先启动react项目
 ```javascript
 npm run react-start //
 ```
  - debuge 模式开启electron
使用vscode中的debuge模式中的`Electron Main`配置启动，这样就可以在electron中打断点

## 注意事项
1.webpack 配置
这个项目一开始使用的creat-react-app脚手架构建的，后因为需要添加antdsign的按需加载和less的css module支持，所以最后将create-react-app的webpack配置开发出来，修改的地方主要是在config文件夹下的webpack.config.dev.js中。修改代码如下
```javascript
{
  test: /\.(js|jsx|mjs)$/,
  include: paths.appSrc,
  loader: require.resolve('babel-loader'),
  options: {
    // 这里的babel-loader添加ant-design按需加载配置plugins
    plugins: [['import', { "libraryName": "antd", "style": "css" }]],
    cacheDirectory: true,
  },
},
// "postcss" loader applies autoprefixer to our CSS.
// "css" loader resolves paths in CSS and adds assets as dependencies.
// "style" loader turns CSS into JS modules that inject <style> tags.
// In production, we use a plugin to extract that CSS to a file, but
// in development "style" loader enables hot editing of CSS.
{
  test: /\.css$/,
  exclude: [/node_modules/],
  use: [
    require.resolve('style-loader'), {
      loader: require.resolve('css-loader'),
      options: {
        // importLoaders: 1,
        modules: true, // 新增对css modules的支持
        localIdentName: '[name]__[local]__[hash:base64:5]'
      }
    }, {
      loader: require.resolve('postcss-loader'),
      options: {
        // Necessary for external CSS imports to work
        // https://github.com/facebookincubator/create-react-app/issues/2677
        ident: 'postcss',
        plugins: () => [
          require('postcss-flexbugs-fixes'),
          autoprefixer({
            browsers: [
              '>1%', 'last 4 versions', 'Firefox ESR', 'not ie < 9', // React doesn't support IE8 anyway
            ],
            flexbox: 'no-2009'
          })
        ]
      }
    }
  ]
},
{
  // 这里添加less的配置
  test: /\.less$/,
  exclude: [/node_modules/],
  use: [
    require.resolve('style-loader'), {
      loader: require.resolve('css-loader'),
      options: {
        importLoaders: 2,
        modules: true, // 新增对css modules的支持
        localIdentName: '[name]__[local]__[hash:base64:5]'
      }
    }, {
      loader: require.resolve('postcss-loader'),
      options: {
        // Necessary for external CSS imports to work
        // https://github.com/facebookincubator/create-react-app/issues/2677
        ident: 'postcss',
        plugins: () => [
          require('postcss-flexbugs-fixes'),
          autoprefixer({
            browsers: [
              '>1%', 'last 4 versions', 'Firefox ESR', 'not ie < 9', // React doesn't support IE8 anyway
            ],
            flexbox: 'no-2009'
          })
        ]
      }
    }, {
      loader: require.resolve('less-loader'),
      options: {
        sourceMap: true
      }
    }
  ]
},
{
  // 这里的配置是为了编译node_modules中ant-design的css样式
  test: /\.css$/,
  exclude: [/src/],
  use: [
    require.resolve('style-loader'), {
      loader: require.resolve('css-loader'),
      options: {
        importLoaders: 1,
        // modules: true, // 新增对css modules的支持
        // localIdentName: '[name]__[local]__[hash:base64:5]'
      }
    }, {
      loader: require.resolve('postcss-loader'),
      options: {
        // Necessary for external CSS imports to work
        // https://github.com/facebookincubator/create-react-app/issues/2677
        ident: 'postcss',
        plugins: () => [
          require('postcss-flexbugs-fixes'),
          autoprefixer({
            browsers: [
              '>1%', 'last 4 versions', 'Firefox ESR', 'not ie < 9', // React doesn't support IE8 anyway
            ],
            flexbox: 'no-2009'
          })
        ]
      }
    }
  ]
},
```

2. electron 通讯方式
c/s项目，server端并不需要起一个http服务来与client端通讯，eletron中自带主进程与渲染进程的通讯。所以需要了解electron通讯方式。与socket类似