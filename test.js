    var connect = require('connect');  
      
    var app = connect()  
      .use(connect.query())  
      .use(function(req, res){  
        var name = req.query.name;   
        res.end("hello " + name);  
      });  
      
    app.listen(8080);  
    console.log('Server started on port 8080');  