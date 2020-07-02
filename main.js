var http = require('http');
var fs = require('fs');
var urlLib = require('url');
var qs = require('querystring');

function templateHTML(title, list, body, control){
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
    ${control}
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

    if(pathname === '/'){ //root directory
      if(queryData.id === undefined){ //when welcome page
        fs.readdir('./data', function(error, filelist){
          var title = 'Welcome';
          var description = 'Hello, Nodejs';
          var list = templateLIST(filelist);
          var template = templateHTML(title, list,
            `<h2>${title}</h2><p>${description}</p>`,
            `<a href="/create">create</a>`
          );
          response.writeHead(200);
          response.end(template);
        });//fs.readdir end
      }//if(queryData.id === undefined) end
      else{ //when the other page
        fs.readdir('./data', function(error, filelist){
          fs.readFile(`data/${queryData.id}`, 'utf8',function(err,description){
            var list = templateLIST(filelist);
            var title = queryData.id;
            var template = templateHTML(title, list,
              `<h2>${title}</h2><p>${description}</p>`,
              `<a href="/create">create</a>
              <a href="/update?id=${title}">update</a>
              <form action = "/delete_process" method="post" onsubmit="">
                <input type="hidden" name="id" value=${title}>
                <input type="submit" value="delete">
              </form>
              `
            );
            response.writeHead(200);
            response.end(template);
          });//readFile end
        });//readdir end
      }//else end
    }//if(pathname === '/') end
    else if(pathname === '/create'){
      fs.readdir('./data', function(error, filelist){
        var title = 'Welcome - Create';
        var list = templateLIST(filelist);
        var template = templateHTML(title, list, `
              <form action="/create_process" method="post">
                <p>
                  <input type="text" name="title" placeholder="title">
                </p>
                <p>
                  <textarea name="description" placeholder="description"></textarea>
                </p>
                <p>
                  <input type="submit"/>
                </p>
              </form>
        `, '');
        response.writeHead(200);
        response.end(template);
      });//fs.readdir end
    }
    else if(pathname === '/create_process'){
      var body = '';
      request.on('data', function(data){
          body += data; //body : parameterName=value&parameterName2=value2
      });
      request.on('end', function(){
          var post = qs.parse(body); //convert url string to object
          var title = post.title;
          var description = post.description;
          fs.writeFile(`data/${title}`, description, 'utf8', function(err){
            response.writeHead(302, {Location: `/?id=${title}`}); //make redirection
            response.end(); //it is needed, if you dont't need to show some messages.
          });
      });
    }//pathname === /create_process end
    else if(pathname === '/update'){
      fs.readdir('./data', function(error, filelist){
        fs.readFile(`data/${queryData.id}`, 'utf8',function(err,description){
          var list = templateLIST(filelist);
          var title = queryData.id;
          var template = templateHTML(title, list,
            `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${title}">
              <p>
                <input type="text" name="title" placeholder="title" value="${title}">
              </p>
              <p>
                <textarea name="description" placeholder="description">${description}</textarea>
              </p>
              <p>
                <input type="submit"/>
              </p>
            </form>
            `,
            `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`, '');
          response.writeHead(200);
          response.end(template);
        });//readFile end
      });//readdir end
    }//pathname === update end
    else if(pathname === '/update_process'){
      var body = '';
      request.on('data', function(data){
          body += data; //body : parameterName=value&parameterName2=value2
      });
      request.on('end', function(){
          var post = qs.parse(body); //convert url string to object
          var id = post.id;
          var title = post.title;
          var description = post.description;
          fs.rename(`data/${id}`, `data/${title}`, function(error){
            fs.writeFile(`data/${title}`, description, 'utf8', function(err){
              response.writeHead(302, {Location: `/?id=${title}`}); //make redirection
              response.end(); //it is needed, if you dont't need to show some messages.
            });
          });
      });
    }//pathname === update_process end
    else if(pathname === '/delete_process'){
      var body = '';
      request.on('data', function(data){
          body += data; //body : parameterName=value&parameterName2=value2
      });
      request.on('end', function(){
          var post = qs.parse(body); //convert url string to object
          var id = post.id;
          fs.unlink(`data/${id}`, function(error){
            response.writeHead(302, {Location: '/'}); //make redirection
            response.end(); //it is needed, if you dont't need to show some messages.
          });
      });
    }//pathname === delete_process end
    else{
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);
