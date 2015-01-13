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

var reportConfig = {'report_all':
                    {'title':'全部评分报告',
                     'orgtype':'全部'
                    },
                    'report_me':                   
                    {'title':'我的评分报告',
                     'orgtype':'全部'
                    },
                    'report_dq':                    
                    {'title':'党群部门得分',
                     'orgtype':'党群部门'
                    },
                    'report_xz':                    
                    {'title':'行政部门得分',
                     'orgtype':'行政部门'
                    },
                    'report_yw':                 
                    {'title':'业务直属部门得分',
                     'orgtype':'业务直属'
                    },
                    'report_dq_desc':
                    {'title':'党群部门得分排序',
                     'orgtype':'党群部门'
                    },
                    'report_xz_desc':
                    {'title':'行政部门得分排序',
                     'orgtype':'行政部门'
                    },
                    'report_yw_desc': 
                    {'title':'业务直属得分排序',
                     'orgtype':'业务直属'
                    }
                   };

var menudata =  {
    "button": [
        {
            "name": "机关考核", 
            "sub_button": [
                {
                    "type": "click", 
                    "name": "党群部门", 
                    "key": "report_dq"
                }, 
                {
                    "type": "click", 
                    "name": "行政部门", 
                    "key": "report_xz"
                }, 
                {
                    "type": "click", 
                    "name": "业务直属", 
                    "key": "report_yw"
                }
            ]
        }, 
        {
            "name": "得分排序", 
            "sub_button": [
                {
                    "type": "click", 
                    "name": "党群部门", 
                    "key": "report_dq_desc"
                }, 
                {
                    "type": "click", 
                    "name": "行政部门", 
                    "key": "report_xz_desc"
                }, 
                {
                    "type": "click", 
                    "name": "业务直属", 
                    "key": "report_yw_desc"
                }
            ]
        }, 
        {
            "type": "click", 
            "name": "登录", 
            "key": "loginbd"
        }
    ]
};


app.use('/static', express.static(__dirname + '/public'));

app.get('/',function(req,res){
    res.send("ooooooo~~~~~ooooooooooo~~~~~~~~~oooooooooooo");
});

//create  menu
app.get('/menu',function(req,res){
   console.log("sent menu");
    var options = {
      headers: { multipart: true }
    }
    needle.get('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wxcaabe980b29fc96d&secret=7c4b55dfd00aae4985e121cd27cc4beb', function(error, response) {
  if (!error && response.statusCode == 200)
    console.log(response.body.access_token);
    var token = response.body.access_token;
        
        needle.post('https://api.weixin.qq.com/cgi-bin/menu/create?access_token='+token, menudata, options, function(error, response) {
          // you can pass params as a string or as an object.
            if (!error && response.statusCode == 200){
                 console.log(menudata);
                 console.log(response.body);
            }
           
        });

    });

    
});

//report
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

app.get('/report/:code',function(req,res){
        var reportTitle = req.params.code.split(':')[0];
        var uid = req.params.code.split(':')[1];
        var orgtype = reportConfig[reportTitle].orgtype;
        var ordertype = 'asc';
        if(reportTitle.indexOf('desc') != -1) ordertype = 'desc';
    
        knex.raw("select org.name,score from score left join org on org.id = score.org_id where  uid = ? and org.type = ? order by score  " +ordertype,[uid,orgtype]).then(function(resp) {
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
       //报表
        else if(req.body.raw.Content.toLowerCase().indexOf('report') == 0){

                               
            res.body = {msgType: 'news',
                          content: [{
                            title: reportConfig[req.body.raw.Content.toLowerCase()],
                            url: 'http://vchat.ngrok.com/report/'+req.body.raw.Content.toLowerCase()+':'+req.body.raw.FromUserName,
                            picUrl: 'http://vchat.ngrok.com/static/report.png'
                          }]
                        }; 
           
            } else res.body = msgDefault;
 }else if(req.body.raw.MsgType == 'event'){
    if(req.body.raw.Event == 'subscribe'){
        res.body = msgSubscribeEvent; 
    } else if(req.body.raw.Event == 'CLICK'){
        
        if(req.body.raw.EventKey.indexOf('report') == 0){
                               
            res.body = {msgType: 'news',
                          content: [{
                            title: reportConfig[req.body.raw.EventKey].title,
                            url: 'http://vchat.ngrok.com/report/'+req.body.raw.EventKey+':'+req.body.raw.FromUserName,
                            picUrl: 'http://vchat.ngrok.com/static/report1.png'
                          }]
                        }; 
           
            }else if(req.body.raw.EventKey == 'loginbd'){
                res.body = msgDf;
            }else{
                res.body = msgOtherEvent; 
            }
        
    } else
    {
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