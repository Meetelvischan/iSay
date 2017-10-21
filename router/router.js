let db = require('../model/db.js'); //封装的数据库
let formidable = require('formidable'); //表单处理
let ObjectId = require('mongodb').ObjectID; //将id转为mongodb里的id对象
let cookieParser = require('cookie-parser');  //cookie相关
let session = require('express-session'); //session相关
let md5 = require('../model/md5.js');  //md5加密
let gm = require('gm'); //GraphicsMagick图像处理

//显示主页
exports.showIndex = function(req,res,next){
  res.render('index');
};

//显示注册页面
exports.showRegister = function(req,res,next){
  res.render('login');
};

//处理注册
exports.doRegister = function(req,res,next){
  //处理上传的表单内容
  var formidable = require('formidable');
  var form = new formidable.IncomingForm();
  form.parse(req,function(err,fields){
      var username = fields.username;
      var pwd = md5(fields.pwd);
      db.insertOne('user',{"username":username,"password":pwd},function(err,result){
        if(err){
          res.send('注册失败!')
        }else{
          res.send('success!'+" "+username);
        }
      })
      
  })
}



