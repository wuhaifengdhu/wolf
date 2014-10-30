var express = require('express');
var webot = require('weixin-robot');
var Room = require('./lib/room');

var app = express();

function parse(cmd_str){
    var arr = cmd_str.split(' ');
    if(arr[0] == 'create'){
        var lista = new Array(), listb = new Array();
        var count = 0;
        for(var i = 1, l = arr.length; i < l; i+=2){
            lista[count] = arr[i];
            listb[count] = arr[i + 1]
        }
    }
    var result = {};
    result.role_list = lista;
    result.num_list = listb;
    return result;
}


webot.set('creat room',{
    pattern: /^create/i,
    handler: function(info){ //return the message you want to send back to user
        room = new Room();
        var cmd_str = info.text;
        var list = parse(cmd_str);
        return room.create(list.role_list, list.num_list);
    }
})


webot.set("show all player's role list",{
    pattern: /^list$/i,
    handler: function(info){ //return the message you want to send back to user
        return room.list(info.uid);
    }
})


webot.set('enter hourse number',{
    pattern: /^\d+$/,
    handler: function(info){ //return the message you want to send back to user
        var arr = info.text.split(' ');
        if(arr.length != 2) return '输入有误， 输入格式："房间号 你的名字"';
        var roomid = arr[0], userName = arr[1];
        return room.role(roomid, info.uid, userName);
    }
})

// 接管消息请求
webot.watch(app, { token: 'wolf', path: '/wechat' });


// 启动 Web 服务
// 微信后台只允许 80 端口
app.listen(80);
console.log('listening on port 80')
