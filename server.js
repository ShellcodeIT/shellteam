var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
io.set("log level", 0);
app.listen(9999);

var resources = {
	'/': {file: '/index.html', mime: 'text/html'},
	'/js/jquery-2.0.3.min.js': {file: '/js/jquery-2.0.3.min.js', mime: 'text/javascript'},
	'/js/jquery.cookie.js': {file: '/js/jquery.cookie.js', mime: 'text/javascript'},
	'/css/style.css': {file: '/css/style.css', mime: 'text/css'}
};

/*
 * HTTP request handler
 */
function handler (req, res) {
	var file = null;
	var mime = null;
	if (typeof resources[req.url] != "undefined" && typeof resources[req.url].file != "undefined") {
		file = resources[req.url].file;
		mime = resources[req.url].mime;
	}
	if (file != null) {
		fs.readFile(__dirname + file,
		function (err, data) {
			if (err) {
				res.writeHead(500);
				return res.end('Error loading ' + file);
			}
			res.writeHead(200, {"Content-Type": mime});
			res.end(data);
		});
	}
}

function chk (v) {
	if (typeof v != "undefined")
		return true;
	return false;
}

var users = {
	"anderson": {
		name: "Anderson Calixto",
		password: "123",
		activity: "none"
	},
	"admin": {
		name: "Administrador",
		password: "123",
		activity: "none"
	}
}

var rooms = {
	"hardware": {
		title: "Sala de mensagens referente à equipe de HARDWARE"
	},
	"software": {
		title: "Sala de mensagens referente à equipe de SOFTWARE"
	}
}

/*
 * socket.io handler
 */
io.sockets.on('connection', function (socket) {
	socket.__clientinfo = {};

	/*
	 * identification
	 */
	socket.on('identify', function (data) {
		var success = false;
		console.log("Client "+socket.id+" has sent an identification request");
		socket.__clientinfo.identity = data;
		if (chk(data) && chk(data.user) && chk(data.password)) {
			if (chk(users[data.user]) && data.password == users[data.user].password) {
				success = true;
				var user = users[data.user];
				socket.join('work');
				// alert anothers that has joined
				socket.broadcast.to('work').emit('userJoin', {
					user: data.user,
					name: user.name,
					activity: user.activity
				});
				socket.emit("identified", {
					user: {
						user: data.user,
						name: user.name,
						activity: user.activity
					},
					ret: "success"
				});
				console.log(socket.id+" identify: success");
			}
		}

		if (!success) {
			socket.emit("identified", {ret: "fail"});
			console.log(socket.id+" identify: fail");
		}
	});
	
	socket.on('roomMessage', function(data) {
		var user = users[socket.__clientinfo.identity.user];
		socket.broadcast.to('work').emit('roomMessage', {
			sender: {
				user: socket.__clientinfo.identity.user,
				name: user.name,
				activity: user.activity
			},
			message: data
		});
	})
});
