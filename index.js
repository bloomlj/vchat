var mp = require('wechat-mp')("vchat")
var app = require('express')()

//mysql
var knex = require('knex')({
  client: 'mysql',
  connection: {
    host     : '127.0.0.1',
    user     : 'root',
    password : 'password',
    database : 'vchat'
  }
});

app.get('/',function(req,res){
    res.send("hahahhaha");
});

app.use('/wechat', mp.start())

app.post('/wechat', function(req, res, next) {
   //console.log(req);

 console.log(req.body)
 
 //msg define
 var msgNews = {
  msgType: 'news',
  content: [{
    title: '打分规则',
    url: 'http://...',
    picUrl: 'http://...'
  }, {
    title: 'news 2',
    url: 'http://...',
    picUrl: 'http://...'
  }]
}
 
 var msgDf = {
        msgType: 'text',
        content: '您好！欢迎进入打分模式。\n请按照使用说明输入打分单位和分值。\n指令：#id,index1,index2,index3。\nid：单位编号index1：指标一、工作完成情况 index2：指标二、内部管理 index3：指标三、领导班子状况'
      };
 var msgDefault = {
    msgType: 'text',
    content: '您发的指令我不认识。'
  };
  var msgError = {
    msgType: 'text',
    content: '对不起，本系统不接受文本以外的其它信息。'
  };

  var msgSuccessCmd = {
    msgType: 'text',
    content: '命令执行完毕，评分成功。'
  };
//logic
 if(req.body.raw.MsgType == 'text'){
     if(req.body.raw.Content.toLowerCase() == 'df') res.body = msgDf;
     else
        if(req.body.raw.Content.toLowerCase().indexOf('a') == 0){
                 knex('sensor_data')
                 .insert([{sensor_id:'1',data: event.data,createdtime:nowstring}])
                 .then(function(ret){
                    console.log(ret);
                    console.log("db save success")
                 });
                res.body = msgSuccessCmd;
        } 
        else res.body = msgDefault;
 }else{
     res.body = msgError; 
 }


  //or rich media message
//  res.body = {
//    msgType: 'music',
//    content: {
//      title: 'A beautiful song',
//      musicUrl: 'http://.....'
//    },
//  }
  next()
}, mp.end())

app.listen(1234,function(){
    console.log("running at 1234.");
});