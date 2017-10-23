let db = require('../model/db.js'); //封装的数据库
let formidable = require('formidable'); //表单处理
let ObjectId = require('mongodb').ObjectID; //将id转为mongodb里的id对象
let cookieParser = require('cookie-parser');  //cookie相关
let session = require('express-session'); //session相关
let md5 = require('../model/md5.js');  //md5加密
let gm = require('gm'); //GraphicsMagick图像处理

//sessions设置


//显示主页
exports.showIndex = function(req,res,next){
  res.render('index',{
    login:req.session.login=="1"?true:false,
    username:req.session.username,
    active:"index"
  });
};

//显示注册页面
exports.showRegister = function(req,res,next){
  res.render('register',{
    login:req.session.login=="1"?true:false,
    username:req.session.username,
    active:"register"
  });
};

//处理注册
exports.doRegister = function(req,res,next){
  //处理上传的表单内容
  var formidable = require('formidable');
  var form = new formidable.IncomingForm();
  form.parse(req,function(err,fields){
      var username = fields.username;
      var pwd = md5(fields.pwd);
      db.find('users',{"username":username},function(err,result){
        if(err){
          res.send("-3");//服务器错误
          return;
        };
        if(result.length !=0){
          res.send("-1");//用户名被占用
          return;
        }
        //用户名没被占用,插入数据库
        db.insertOne('users',{"username":username,"password":pwd},function(err,result){
          if(err){
            res.send("-3");
            return;
          }else{
            req.session.login = "1";
            req.session.username = username;
            res.send("1");
            
          }
        })

      })     
  })
}
exports.showLogin = function(req,res,next){
  res.render('login',{
    login:req.session.login=="1"?true:false,
    username:req.session.username,
    active:"login"
  });
}
exports.doLogin = function(req,res,next){
  //处理上传的表单内容
  var formidable = require('formidable');
  var form = new formidable.IncomingForm();
  form.parse(req,function(err,fields){
      var username = fields.username;
      var pwd = md5(fields.pwd);
      db.find('users',{"username":username},function(err,result){
        if(err){
          res.send("-5");//错误
          return;
        };
        if(result.length ==0){
          res.send("-1");//用户名不存在
          return;
        }
        if(pwd==result[0].password){
          req.session.login = "1";
          req.session.username = username;
          res.send("1");  //验证成功
          return;
        }else{
          res.send("-2"); //密码不正确
          return;
        }

      })     
  }) 
}
exports.doLogout = function(req,res,next){
  req.session.login = "-1";
  res.redirect('/');
}


