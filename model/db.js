var MongoClient = require('mongodb').MongoClient;
var setting = require('../settings.js');

init(); //对数据库进行初始化(添加索引)

//封装数据库连接函数
function __connectDB(callback){
    let url = setting.dbUrl;
    MongoClient.connect(url,function(err,db){
        if(err){
            console.log("数据库连接失败!");
            callback(err,null);
            return;
        }
      	callback(err,db);
        db.close();
    })
}

//数据库初始化
function init() {
    __connectDB(function(err,db){
        if(err){
            console.log("初始化失败!");
            return;
        }
        let username = setting.dbIndexName;
        db.collection(setting.dbCollectionName).createIndex(
            {username:1},
            null,
            function(err,result){
                console.log("索引成功!");
            }
        )
    })
}

//添加数据到数据库
exports.insertOne = function(collectionName,json,callback){
    __connectDB(function(err,db){
        if(err){
            callback(err,db);
            return;
        }
        db.collection(collectionName).insertOne(json,function(err,result){
            callback(err,result);
            console.log(`id为{ ${json._id} }的用户:{ ${json.username} }添加了一条记录`);
        
        })
    }) 
}

exports.find = function(collectionName,json,C,D){
    //result为返回的结果
    var result = [];
    if(arguments.length ==4){
        var args = C;
        var callback = D;
         //数目限制以及应该省略的条数
        var limit = args.pageAmount ||0;
        var pageNum = Math.abs(args.page);
        var skipnum = args.pageAmount * pageNum || 0;
        var sort = args.sort || {};
    }else if(arguments.length ==3){
        //当没传入args时:
        var callback = C;
        var limit = 0;
        var skipnum = 0;
    }else{
        throw new Error("find函数的参数个数必须是3个或4个");
        return;
    }
   
    

    __connectDB(function(err,db){
        let cursor = db.collection(collectionName).find(json).skip(skipnum).limit(limit).sort(sort);
        cursor.each(function(err,doc){
            if(err){
                callback(err,null);
                db.close();
                return;
            }
            if(doc !== null){
                result.push(doc);
            }else{
                callback(null,result);
                db.close();
            }
        })
    })
}

//删除
exports.deleteMany = function(collectionName,json,callback){
    __connectDB(function(err,db){
        db.collection(collectionName).deleteMany(json,function(err,result){
            callback(err,result);
            console.log(`删除了一条id为{ ${json._id} }用户名为{ ${json.username} }的记录`);
        })
    })
}

//改
exports.updateMany = function(collectionName,json1,json2,callback){
    __connectDB(function(err,db){
        db.collection(collectionName).updateMany(json1,json2,function(err,result){
            callback(err,result);
            db.close();
        })
    })
}


//得到数据库数据条数
exports.getCount = function(collectionName,callback){
    __connectDB(function(err,db){
        db.collection(collectionName).count({}).then(function(count){
            callback(count);
            db.close();
        });
        
    })
}