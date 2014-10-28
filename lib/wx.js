var crypto = require("crypto");
var xml = require("./node-xml/lib/node-xml.js");
var messageSender = require("./messageSender.js");

function isLegel(signature, timestamp, nonce, token) {
    var array = new Array();
    array[0] = timestamp;
    array[1] = nonce;
    array[2] = token;
    array.sort();
    var hasher = crypto.createHash("sha1");
    var msg = array[0] + array[1] + array[2];
    hasher.update(msg);
    var msg = hasher.digest('hex');
    if (msg == signature) {
        return true;
    } else {
        return false;
    }
}

function processMessage(data, response) {
    var ToUserName = "";
    var FromUserName = "";
    var CreateTime = "";
    var MsgType = "";
    var Content = "";
    var Location_X = "";
    var Location_Y = "";
    var Scale = 1;
    var Label = "";
    var PicUrl = "";
    var FuncFlag = "";

    var tempName = "";
    var parse = new xml.SaxParser(function(cb) {
        cb.onStartElementNS(function(elem, attra, prefix, uri, namespaces) {
            tempName = elem;
        });

        cb.onCharacters(function(chars) {
            chars = chars.replace(/(^\s*)|(\s*$)/g, "");
            if (tempName == "CreateTime") {
                CreateTime = chars;
            } else if (tempName == "Location_X") {
                Location_X = cdata;
            } else if (tempName == "Location_Y") {
                Location_Y = cdata;
            } else if (tempName == "Scale") {
                Scale = cdata;
            }


        });

        cb.onCdata(function(cdata) {

            if (tempName == "ToUserName") {
                ToUserName = cdata;
            } else if (tempName == "FromUserName") {
                FromUserName = cdata;
            } else if (tempName == "MsgType") {
                MsgType = cdata;
            } else if (tempName == "Content") {
                Content = cdata;
            } else if (tempName == "PicUrl") {
                PicUrl = cdata;
            } else if (tempName == "Label") {
                Label = cdata;
            }
            console.log("cdata:" + cdata);
        });

        cb.onEndElementNS(function(elem, prefix, uri) {
            tempName = "";
        });

        cb.onEndDocument(function() {
            console.log("onEndDocument");
            tempName = "";
            var date = new Date();
            var yy = date.getYear();
            var MM = date.getMonth() + 1;
            var dd = date.getDay();
            var hh = date.getHours();
            var mm = date.getMinutes();
            var ss = date.getSeconds();
            var sss = date.getMilliseconds();
            var result = Date.UTC(yy, MM, dd, hh, mm, ss, sss);
            var msg = "";
            if (MsgType == "text") {
                msg = "谢谢关注,你说的是：" + Content;
            } else if (MsgType = "location") {
                msg = "你所在的位置: 经度：" + Location_X + "纬度：" + Location_Y;
            } else if (MsgType = "image") {
                msg = "你发的图片是：" + PicUrl;
            }
            messageSender.sendTextMessage(FromUserName, ToUserName, CreateTime, msg, FuncFlag, response);

        });
    });
    parse.parseString(data);
}
module.exports.isLegel = isLegel;
module.exports.processMessage = processMessage;