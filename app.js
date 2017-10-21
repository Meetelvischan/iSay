const express = require('express'); //express框架
let app = express(); 
let db = require('./model/db.js'); //封装的数据库
let formidable = require('formidable'); //表单处理
let ObjectId = require('mongodb').ObjectID; //将id转为mongodb里的id对象
let cookieParser = require('cookie-parser');  //cookie相关
let session = require('express-session'); //session相关
let md5 = require('./model/md5.js');  //md5加密
let gm = require('gm'); //GraphicsMagick图像处理

app.set('view engine','ejs'); //设置模板引擎
app.use(express.static('./public'));  //设置静态服务 

