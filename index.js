var mp = require('wechat-mp')("vchat");
var express = require('express');
var hbs = require('hbs');
var needle = require('needle');
var app = express();

app.set('view engine', 'hbs');

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


var menudata =  {
     "button":[
     {	
          "type":"click",
          "name":"今日歌曲",
          "key":"V1001_TODAY_MUSIC"
      },
      {
           "name":"菜单",
           "sub_button":[
           {	
               "type":"view",
               "name":"搜索",
               "url":"http://www.soso.com/"
            },
            {
               "type":"view",
               "name":"视频",
               "url":"http://v.qq.com/"
            },
            {
               "type":"click",
               "name":"赞一下我们",
               "key":"V1001_GOOD"
            }]
       }]
 };


app.use('/static', express.static(__dirname + '/public'));

app.get('/',function(req,res){
    res.send("hahahhaha");
});

app.get('menu',function(req,res){
    needle
  .post('https://api.weixin.qq.com/cgi-bin/menu/create?access_token=vchat', data, { multipart: true })
  .on('readable', function() { /* eat your chunks */ })
  .on('end', function() {
    console.log('Ready-o, friend-o.');
    res.send("hahahhaha,ok,ok");
  })  
    
    
});


app.get('/report/all',function(req,res){
    
        knex.raw('select  org.name,sum(score) as totalscore  from score left join org on score.org_id = org.id group by org_id order by totalscore desc').then(function(resp) {

//            var reportstring = "";
//            for(i in resp[0]){
//                reportstring = reportstring+resp[0][i].name+":"+resp[0][i].totalscore+"<br/>";
//            }
            //res.send(reportstring);
            res.render('report', {'data':resp[0]});
            
        });
    
    
    
});

app.get('/report/me',function(req,res){
            knex.raw("select org.name,score from score left join org on org.id = score.org_id where  uid = 'oMR8gsycPJgCn2PH0RVAvlPd3oCc'  order by score desc ").then(function(resp) {

//            var reportstring = "";
//            for(i in resp[0]){
//                reportstring = reportstring+resp[0][i].name+":"+resp[0][i].score+"<br/>";
//            }
//            res.send(reportstring);
            res.render('reportme', {'data':resp[0]});
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
   var msgBD = {
    msgType: 'text',
    content: '绑定成功。'
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
     //打分提示
     if(req.body.raw.Content.toLowerCase() == 'df') res.body = msgDf;
     //绑定code
     else if(req.body.raw.Content.toLowerCase().indexOf('bd') == 0){
        var userCode = req.body.raw.Content.toLowerCase().substring(2);
         knex('user').count('code as count').where('uid',req.body.raw.FromUserName).then(function(ret){
            //console.log(ret[0].count);
             if(ret[0].count > 0){
                  knex('user')
                  .where('uid',req.body.raw.FromUserName)
                 .update({code:userCode})
                 .then(function(ret){
                    //console.log(ret);
                    console.log("BD update success by:"+req.body.raw.FromUserName)
                 });
             }
             else{
                 knex('user')
                 .insert([{uid:req.body.raw.FromUserName,code:userCode}])
                 .then(function(ret){
                    //console.log(ret);
                    console.log("BD new success by:"+req.body.raw.FromUserName)
                 });
             }
         });

        res.body = msgBD;
     }
     //打分指令
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
             knex('score').count('uid as count').where({org_id:orgid,uid:req.body.raw.FromUserName}).then(function(ret){
                 console.log(ret[0].count);
                  if(ret[0].count > 0){
                    knex('score')
                    .where({org_id:orgid,uid:req.body.raw.FromUserName})
                    .update({score:total,msg_id:req.body.raw.MsgId})
                    .then(function(ret){
                        console.log("df update success by:"+req.body.raw.FromUserName)
                    });
                  }else{
                    knex('score')                                   .insert([{org_id:orgid,uid:req.body.raw.FromUserName,score:total,msg_id:req.body.raw.MsgId}])
                 .then(function(ret){
                    console.log("df new success by:"+req.body.raw.FromUserName)
                 });
                    
                  }
             
             
             });
         

            res.body = msgSuccessCmd; 
        } 
       //全部报表
        else if(req.body.raw.Content.toLowerCase().indexOf('report_all') == 0){
                res.body = msgReportAll; 
//                knex.raw('select  org.name,sum(score) as totalscore  from score left join org on score.org_id = org.id group by org_id order by totalscore desc').then(function(resp) {
//                     //console.log(res);
//                    //res.body = "xx";
//                        var reportstring = "";
//                        for(i in resp[0]){
//                           // console.log(resp[0][i]);
//                            reportstring = reportstring+resp[0][i].name+":"+resp[0][i].totalscore+"\n";
//                        }
//                          var reportmsg = {
//                            msgType: 'text',
//                            content: reportstring
//                          };
//                        res.body = reportmsg;
//                    });                
            }
        //个人报表
        else if(req.body.raw.Content.toLowerCase().indexOf('report_me') == 0){
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