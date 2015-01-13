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
           "name":"机关考核",
           "sub_button":[
           {	
               "type":"view",
               "name":"党群部门",
               "url":"http://www.soso.com/"
            },
            {
               "type":"view",
               "name":"行政部门",
               "url":"http://v.qq.com/"
            },
            {
               "type":"view",
               "name":"业务直属",
               "url":"http://v.qq.com/"
            }]
       }]
 };


app.use('/static', express.static(__dirname + '/public'));

app.get('/',function(req,res){
    res.send("hahahhaha");
});

app.get('/menu',function(req,res){
   console.log("sent menu");
    var options = {
      headers: { multipart: true }
    }

    needle.post('https://api.weixin.qq.com/cgi-bin/menu/create?access_token=vchat', menudata, options, function(err, resp) {
      // you can pass params as a string or as an object.
        console.log(resp);
    });

    
    
});


app.get('/report/all',function(req,res){
    
        knex.raw('select  org.name,sum(score) as totalscore  from score left join org on score.org_id = org.id group by org_id order by totalscore desc').then(function(resp) {

            res.render('report', {'data':resp[0]});
            
        });
    
    
    
});

app.get('/report/me',function(req,res){
            knex.raw("select org.name,score from score left join org on org.id = score.org_id where  uid = 'oMR8gsycPJgCn2PH0RVAvlPd3oCc'  order by score desc ").then(function(resp) {
            res.render('reportme', {'data':resp[0]});
        });
});

app.use('/wechat', mp.start())

app.post('/wechat', function(req, res, next) {
 
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
    content: '对不起，您发送的指令已超出我们的服务范围，请核对指令。'
  };

  var msgOtherEvent = {
    msgType: 'text',
    content: '其它事件，咱无服务。'
  };
    
  var msgSuccessCmd = {
    msgType: 'text',
    content: '命令执行完毕，评分成功。'
  };

  var msgSubscribeEvent = {
      msgType: 'news',
      content: [{
        title: '全部评分结果报告',
        url: 'http://vchat.ngrok.com/report/all',
        picUrl: 'http://vchat.ngrok.com/static/report.png'
      }]
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
      knex('msg')
     .insert([req.body.raw])
     .then(function(ret){
        console.log("msg log success")
     });
     
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
           
            }
        //个人报表
        else if(req.body.raw.Content.toLowerCase().indexOf('report_me') == 0){
                res.body = msgReportMe; 
            
            } else res.body = msgDefault;
 }else if(req.body.raw.MsgType == 'event'){
    if(req.body.raw.Event == 'subscribe'){
        res.body = msgSubscribeEvent; 
    }else{
        res.body = msgOtherEvent; 
    }
 }
  else{
     res.body = msgError; 
 }


  next()
}, mp.end())

var responseMsg = function(res,msg){
    res.body = msg;
}


app.listen(1234,function(){
    console.log("running at 1234.");
});