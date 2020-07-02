var http = require('http');
var fs = require('fs');
var urlLib = require('url');

function templateHTML(title, list, body){
  return `
  <!doctype html>
  <html>
  <head>
    <title>WEB1 - ${title}</title>
    <meta charset="utf-8">
  </head>
  <body>
    <h1><a href="/">WEB</a></h1>
    ${list}
    ${body}
  </body>
  </html>
  `;
}

function templateLIST(filelist){
  var list = '<ul>';
  for(var i = 0;i<filelist.length;i++){
    list += `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
  }
  list+='</ul>';
  return list;
}

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = urlLib.parse(_url, true).query; //get query from url
    var pathname = urlLib.parse(_url, true).pathname;

    if(pathname === '/'){
      if(queryData.id === undefined){ //when welcome page
        fs.readdir('./data', function(error, filelist){
          var title = 'Welcome';
          var description = 'Hello, Nodejs';
          var list = templateLIST(filelist);
          var template = templateHTML(title, list, `<h2>${title}</h2><p>${description}</p>`);
          response.writeHead(200);
          response.end(template);
        });//fs.readdir end
      }
      else{ //when the other page
        fs.readFile(`data/${queryData.id}`, 'utf8',function(err,description){
          fs.readdir('./data', function(error, filelist){
            var list = templateLIST(filelist);
            var title = queryData.id;
            var template = templateHTML(title, list, `<h2>${title}</h2><p>${description}</p>`);
            response.writeHead(200);
            response.end(template);
          });//readdir end
        });//readFile end
      }//else end
    }//if(pathname === '/') end
    else{
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);
