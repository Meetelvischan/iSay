## 练手项目-小美句





### 数据库结构

数据库使用MongoDB进行构建,以下为数据库集合的结构

```javascript
user集合存储用户的信息,规定username不能重复
{_id="001","username":"Elvis Chan","password":"123","avatar":"./pic","sentence":"Tomorrow is another day",}

post集合存储用户发表的句子或文章
{"title":"标题","content":"内容","author":"发布人","date":"时间","comment":[
    {
        "content":"评论内容",
      	"author":"评论人",
      	"date":"评论时间"
    }
],"praise":["点赞人1","点赞人2"]}
```



