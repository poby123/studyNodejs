var http = require('http');
var fs = require('fs');
var app = http.createServer(function(request,response){
    var url = request.url;
    if(request.url == '/'){
      url = '/index.html';
    }
    if(request.url == '/favicon.ico'){
      return response.writeHead(404);
    }
    response.writeHead(200);
    
    //url : /index.html etc...
    //__dirname : address of the project folder

    console.log(__dirname);
    response.end(fs.readFileSync(__dirname + url));

});
app.listen(3000);
