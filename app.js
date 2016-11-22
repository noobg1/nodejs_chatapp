var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	request = require("request"),
	nicknames = [];

app.use(express.static('public'))
server.listen(3000);


app.get('/',function(req,res){
	res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection',function(socket){
	socket.on('new user',function(data,callback){
		if(nicknames.indexOf(data) != -1){
			callback(false);
		}else{
			callback(true);
			socket.nickname = data;
			nicknames.push(socket.nickname);
			updateNicknames();
		}
	});

	socket.on('send message',function(data){
		var url = "http://noobg1.pythonanywhere.com/q/"+data, senti, sentiParsed

		request(url, function(error, response, body) {
			 senti = JSON.parse(body)
			 sentiParsed = String(senti['result'])
		  console.log(sentiParsed);
		  io.sockets.emit('new message',{msg : data, nick : socket.nickname, sentiment : sentiParsed});
		});
		

	});

	function updateNicknames(){
		io.sockets.emit('username',nicknames);
	}

	socket.on('disconnect',function(data){
		if(!socket.nickname) return;
		nicknames.splice(nicknames.indexOf(socket.nickname),1);
		updateNicknames();
	})

});