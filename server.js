var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
io.set("log level", 0);
app.listen(9999);

var resources = {
	'/': {file: '/index.html', mime: 'text/html'},
	'/css/style.css': {file: '/css/style.css', mime: 'text/css'}
};

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
				return res.end('Error loading index.html');
			}
			res.writeHead(200, {"Content-Type": mime});
			res.end(data);
		});
	}
}

var services = {
	"fts_arquivo": 1.0
}

function chk (v) {
	if (typeof v != "undefined")
		return true;
	return false;
}

io.sockets.on('connection', function (socket) {
	socket.__clientinfo = {};
	socket.on('identify', function (data) {
		console.log("Cliente "+socket.id+" enviou pedido de identificacao");
		socket.__clientinfo.identity = data;
		if (chk(data) && chk(data.service)) {
			socket.emit("identified", "ok");
			console.log("resultado da identificacao: ok");
		} else {
			socket.emit("identified", "fail");
			console.log("resultado da identificacao: fail");
		}
	});
});
