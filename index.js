var app = require("express").createServer();
var wx = require('./lib/wx');
var fs = require("fs");
app.get('/', function(req, response) {

    fs.readFile("./qrCode.jpg", "binary", function(err, file) {
        if (err) {
            response.writeHead(500, {
                "Content-Type": "text/plain"
            });
            response.write(err + "\n");
        } else {
            response.writeHead(200, {
                "Content-Type": "image/jpg"
            });
            response.write(file, "binary");
        }
        response.end();
    });
});


app.get('/weixin', function(req, res) {
    var signature = req.query.signature;
    var timestamp = req.query.timestamp;
    var nonce = req.query.nonce;
    var echostr = req.query.echostr;
    var check = false;
    check = wx.isLegel(signature, timestamp, nonce, 'wolf'); //替换成你的token
    if (check) {
        res.write(echostr);
    } else {
        res.write("error data");
    }
    res.end();
});


app.post('/weixin', function(req, res) {
    var response = res;
    var formData = "";
    req.on("data", function(data) {
        formData += data;
    });
    req.on("end", function() {
        wx.processMessage(formData, response);
    });
});
app.listen(3000);