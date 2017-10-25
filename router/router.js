let db = require('../model/db.js'); //封装的数据库
let formidable = require('formidable'); //表单处理
let ObjectId = require('mongodb').ObjectID; //将id转为mongodb里的id对象
let cookieParser = require('cookie-parser');  //cookie相关
let session = require('express-session'); //session相关
let md5 = require('../model/md5.js');  //md5加密
let gm = require('gm'); //GraphicsMagick图像处理
let path = require('path');
const fs = require('fs');

//sessions设置


//显示主页
exports.showIndex = function(req,res,next){
  if(req.session.login=="1"){
    db.find('users',{username:req.session.username},function(err,result){
      if(err){
        res.send("-3");
        return;
      }else{
        var avatar = result[0].avatar;
      }
      res.render('index',{
        login:req.session.login=="1"?true:false,
        username:req.session.username,
        active:"index",
        avatar:avatar
      });
    })
  }else{
    res.render('index',{
      login:req.session.login==false,
      username:"欢迎来到iSay",
      active:"index",
      avatar:"default.jpg"
    });
  }
  
  
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
        db.insertOne('users',{"username":username,"password":pwd,"avatar":"default.jpg"},function(err,result){
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

//退出登录
exports.doLogout = function(req,res,next){
  req.session.login = "-1";
  res.redirect('/');
}


//显示设置头像页面
exports.showSetAvatar = function(req,res,next){
  if(req.session.login !=="1"){
    res.redirect('/login');
    return;
  }
  res.render('setAvatar',{
    login:req.session.login=="1"?true:false,
    username:req.session.username,
    active:"index"
  });
}

//处理文件上传
exports.doSetAvatar = function(req,res,next){
  var form = new formidable.IncomingForm();
  form.uploadDir = path.normalize(__dirname+'/../avatar');
  form.parse(req,function(err,fields,files){
    if(err){
      res.send("-3");
      return;
    }
    var oldpath = files.avatar.path;
    var newpath = path.normalize(__dirname+'/../avatar')+"/"+req.session.username+".jpg";
    fs.rename(oldpath,newpath,function(err){
      if(err){
        res.send("-3");
        return;
      }
    });
    req.session.avatar = req.session.username+".jpg";//将头像图片名存在session中
    res.redirect('cropAvatar')
  })
}

//显示头像剪切页面
exports.showCropAvatar = function(req,res,next){
  if(req.session.login !=="1"){
    res.redirect('/');
    return;
  }
  res.render('cropAvatar',{
    login:true,
    username:req.session.username,
    active:"index",
    avatar:req.session.avatar
  });
}

//处理头像剪切
exports.doCropAvatar = function(req,res,next){
  var filename = req.session.avatar;
  var w = req.query.w;
  var h = req.query.h;
  var x = req.query.x;
  var y = req.query.y;
  gm('./avatar/'+filename)
    .crop(w,h,x,y)
    .resize(100,100,'!')
    .write('./avatar/'+filename,function(err){
     if(err){
       res.send("-3");
       return;
     }
     db.updateMany('users',{username:req.session.username},{$set:{"avatar":filename}},function(err,result){
      if(err){
        res.send("-3");
        return;
      }
      res.send("1");
     })
    })
}

//发表说说
exports.doPost = function(req,res,next){
  //处理上传的表单内容
  var formidable = require('formidable');
  var form = new formidable.IncomingForm();
  form.parse(req,function(err,fields){
      var username = req.session.username;
      var content = fields.content;
      //将发表的说说存入数据库
      db.insertOne('post',{"username":username,"content":content,"date":new Date().toLocaleString()},function(err,result){
        if(err){
          res.send("-3");
          return;
        }else{
          
          res.redirect('/');
          
        }
      })  
  })
}

//获得所有说说
exports.getAllSaying = function(req,res,next){
  var page = req.query.page;
  db.find('post',{},{"pageAmount":10,"page":page,"sort":{"date":-1}},function(err,result){
    res.json({"result":result});
  })
}

exports.getUserInfo = function(req,res,next){
  var username = req.query.username;
  db.find('users',{"username":username},function(err,result){
    res.json(result);
  })
}