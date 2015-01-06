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
 //log message
 knex('msg')
 .insert([req.body.raw])
 .then(function(ret){
    console.log("msg log success")
 });
    
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
            var msg_full = req.body.raw.Content.toLowerCase();
            var orgstring = msg_full.substring(0,msg_full.indexOf(' '));
            var orgid = orgstring.substring(1);
            
            var scorestring = msg_full.substring(msg_full.lastIndexOf(' ')+1);
            
            var total = 0;
            console.log(msg_full);
            console.log("["+orgstring+"]");
             console.log("["+scorestring+"]");
            if(scorestring.indexOf('s') == 0){
                console.log("1111111111");
                console.log(scorestring.substring(1));
                total = parseFloat(scorestring.substring(1));
            }else{
                var scorearray = scorestring.split(",");
                for (x in scorearray)
                  {
                    total=total + parseFloat(scorearray[x]);
                  }
            }
            console.log(total);
            
            console.log(orgid);
                 knex('score')
                 .insert([{org_id:orgid,uid:req.body.raw.FromUserName,score:total,msg_id:req.body.raw.MsgId}])
                 .then(function(ret){
                    console.log("db save success")
                    
                 });
            res.body = msgSuccessCmd; 
        } 
        else
            if()
            
            res.body = msgDefault;
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