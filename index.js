var mp = require('wechat-mp')("vchat");
var express = require('express');
var app = express();

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

app.use('/static', express.static(__dirname + '/public'));

app.get('/',function(req,res){
    res.send("hahahhaha");
});

app.get('/report/all',function(req,res){
    
        knex.raw('select  org.name,sum(score) as totalscore  from score left join org on score.org_id = org.id group by org_id order by totalscore desc').then(function(resp) {

            var reportstring = "";
            for(i in resp[0]){
                reportstring = reportstring+resp[0][i].name+":"+resp[0][i].totalscore+"<br/>";
            }
            res.send(reportstring);
        });
    
    
    
});

app.get('/report/me',function(req,res){
            knex.raw("select org.name,score from score left join org on org.id = score.org_id where  uid = 'oMR8gsycPJgCn2PH0RVAvlPd3oCc'  order by score desc ").then(function(resp) {

            var reportstring = "";
            for(i in resp[0]){
                reportstring = reportstring+resp[0][i].name+":"+resp[0][i].score+"<br/>";
            }
            res.send(reportstring);
        });
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
    
 
// //msg define
// var msgNews = { 
//  msgType: 'news',
//  content: [{
//    title: '打分规则',
//    url: 'http://...',
//    picUrl: 'http://...'
//  }, {
//    title: 'news 2',
//    url: 'http://...',
//    picUrl: 'http://...'
//  }]
//}
 
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
    
    
 var msgReportAll = { 
  msgType: 'news',
  content: [{
    title: '全部评分结果报告',
    url: 'http://vchat.ngrok.com/report/all',
    picUrl: 'http://vchat.ngrok.com/static/report.png'
  }]
}

  var msgReportMe = { 
  msgType: 'news',
  content: [{
    title: '我的评分结果报告',
    url: 'http://vchat.ngrok.com/report/me',
    picUrl: 'http://vchat.ngrok.com/static/report.png'
  }]
}
    
//logic
 if(req.body.raw.MsgType == 'text'){
     if(req.body.raw.Content.toLowerCase() == 'df') res.body = msgDf;
     else if(req.body.raw.Content.toLowerCase().indexOf('a') == 0){
            var msg_full = req.body.raw.Content.toLowerCase();
            var orgstring = msg_full.substring(0,msg_full.indexOf(' '));
            var orgid = orgstring.substring(1);
            
            var scorestring = msg_full.substring(msg_full.lastIndexOf(' ')+1);       
            var total = 0;
            if(scorestring.indexOf('s') == 0){
                total = parseFloat(scorestring.substring(1));
            }else{
                var scorearray = scorestring.split(",");
                for (x in scorearray)
                  {
                    total=total + parseFloat(scorearray[x]);
                  }
            }
                 knex('score')                 .insert([{org_id:orgid,uid:req.body.raw.FromUserName,score:total,msg_id:req.body.raw.MsgId}])
                 .then(function(ret){
                    console.log("db save success")
                    
                 });
            res.body = msgSuccessCmd; 
        } 
        else if(req.body.raw.Content.toLowerCase().indexOf('report_all') == 0){
                res.body = msgReportAll; 
                knex.raw('select  org.name,sum(score) as totalscore  from score left join org on score.org_id = org.id group by org_id order by totalscore desc').then(function(resp) {
                     //console.log(res);
                    //res.body = "xx";
                        var reportstring = "";
                        for(i in resp[0]){
                           // console.log(resp[0][i]);
                            reportstring = reportstring+resp[0][i].name+":"+resp[0][i].totalscore+"\n";
                        }
                          var reportmsg = {
                            msgType: 'text',
                            content: reportstring
                          };
                        res.body = reportmsg;
                    });
                     
            }else if(req.body.raw.Content.toLowerCase().indexOf('report_me') == 0){
                res.body = msgReportMe; 
            
            } else res.body = msgDefault;
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

var responseMsg = function(res,msg){
    res.body = msg;
}


app.listen(1234,function(){
    console.log("running at 1234.");
});