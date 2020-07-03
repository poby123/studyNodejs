var http = require('http');
var fs = require('fs');
var urlLib = require('url');
var qs = require('querystring');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var mysql = require('mysql');
var db = mysql.createConnection({
  host : 'localhost',
  user : 'nodejs',
  password : '12345678',
  database : 'opentutorials'
});

var template = require('./lib/template.js');

db.connect();//make connection

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = urlLib.parse(_url, true).query; //get query from url
    var pathname = urlLib.parse(_url, true).pathname;

    if(pathname === '/'){ //root directory
      if(queryData.id === undefined){ //when welcome page
          db.query(`SELECT * FROM topic`, function (error, topics, fields) {
            var title = 'Welcome';
            var description = 'Hello, Nodejs';
            var list = template.list(topics);
            var html = template.html(title, list,
              `<h2>${title}</h2><p>${description}</p>`,
              `<a href="/create">create</a>`
            );
            response.writeHead(200);
            response.end(html);
          });//db.query end
      }//if(queryData.id === undefined) end
      else{ //when the other page
        db.query(`SELECT * FROM topic`, function (error, topics, fields) {
          if(error){
            throw error;
          }
          db.query(`SELECT * FROM topic where id=?`,[queryData.id], function(error2,topic){
            if(error2){
              throw error2;
            }
            var title = topic[0].title;
            var description = topic[0].description;
            var list = template.list(topics);
            var html = template.html(title, list,
              `<h2>${title}</h2><p>${description}</p>`,

              `<a href="/create">create</a>
              <a href="/update?id=${queryData.id}">update</a>
              <form action = "/delete_process" method="post" onsubmit="">
                <input type="hidden" name="id" value=${queryData.id}>
                <input type="submit" value="delete">
              </form>
              `
            );
            response.writeHead(200);
            response.end(html);
          });//db.query end
        });//db.query end
      }//else end
    }//if(pathname === '/') end
    else if(pathname === '/create'){
      db.query(`SELECT * FROM topic`, function (error, topics, fields) {
        var title = 'Create';
        var list = template.list(topics);
        var html = template.html(title, list,
          `
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
          `,``);
        response.writeHead(200);
        response.end(html);
      });//db.query end
    }//else if(pathname === '/create') end
    else if(pathname === '/create_process'){
      var body = '';
      request.on('data', function(data){
          body += data; //body : parameterName=value&parameterName2=value2
      });
      request.on('end', function(){
          var post = qs.parse(body); //convert url string to object
          db.query(`
            INSERT INTO topic (title, description, created, author_id)
              VALUES (?,?,NOW(),?)`,
            [post.title, post.description,1],
            function(error, result){
              if(error){
                throw error;
              }
              response.writeHead(302, {Location: `/?id=${result.insertId}`}); //make redirection
              response.end(); //it is needed, if you dont't need to show some messages.
            });
      });
    }//pathname === /create_process end
    else if(pathname === '/update'){
      db.query(`SELECT * FROM topic`, function (error, topics, fields) {
        if(error){
          throw error;
        }
        db.query(`SELECT * FROM topic where id=?`,[queryData.id], function(error2,topic){
          if(error2){
            throw error2;
          }
          var list = template.list(topics);
          var html = template.html(topic[0].title, list,
            `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${topic[0].id}">
              <p>
                <input type="text" name="title" placeholder="title" value="${topic[0].title}">
              </p>
              <p>
                <textarea name="description" placeholder="description">${topic[0].description}</textarea>
              </p>
              <p>
                <input type="submit"/>
              </p>
            </form>
            `,
            `<a href="/create">create</a>
            <a href="/update?id=${topic[0].id}">update</a>
            `
          );
          response.writeHead(200);
          response.end(html);
        });//db.query end
      });//db.query end
    }//pathname === update end
    else if(pathname === '/update_process'){
      var body = '';
      request.on('data', function(data){
          body += data; //body : parameterName=value&parameterName2=value2
      });
      request.on('end', function(){
          var post = qs.parse(body); //convert url string to object
          db.query(`UPDATE topic SET title=?, description=? where id=?`, [post.title, post.description,post.id],
          function(error, result){
            if(error){
              throw error;
            }
            response.writeHead(302, {Location: `/?id=${post.id}`}); //make redirection
            response.end(); //it is needed, if you dont't need to show some messages.
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
          db.query(`DELETE FROM topic WHERE id=?`, [post.id],
          function(error, result){
            if(error){
              throw error;
            }
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
