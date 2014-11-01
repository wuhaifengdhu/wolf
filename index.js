var express = require('express');
var webot = require('weixin-robot');
var Room = require('./lib/room');

var app = express();

var room_list = {};
var user_list = {};
var user_name_list = {};

function parse(cmd_str){
    var arr = cmd_str.split(' ');
    if(arr[0].substring(0, 5) == 'creat'){
        var lista = new Array(), listb = new Array();
        var count = 0;
        for(var i = 1, l = arr.length; i < l; i+=2){
            lista[count] = arr[i];
            listb[count] = arr[i + 1]
            count++;
        }
    }
    var result = {};
    result.role_list = lista;
    result.num_list = listb;
    return result;
}

function get_roomId(nowTime){
    var roomId = Math.floor((1+Math.random()) * 1000);
    var room = room_list[roomId];
    if(room == undefined) return roomId;
    else{
        if(nowTime - room.create_time > 3 * 60 * 60 * 1000) return roomId;
    }
    return get_roomId(nowTime);
}


webot.set('creat room',{
    pattern: /^creat/i,
    handler: function(info){ //return the message you want to send back to user
        var nowTime = new Date().getTime();
        var roomId = get_roomId(nowTime);
        var room = new Room(info.uid, roomId, nowTime);

        var cmd_str = info.text;
        var list = parse(cmd_str);
        var ret = room.create(list.role_list, list.num_list);

        if(ret.substring(0, 6) == '房间创建成功') room_list[roomId] = room;
        return ret;
    }
})


webot.set("show all player's role list",{
    pattern: /^list$/i,
    handler: function(info){ //return the message you want to send back to user
        var roomId = user_list[info.uid];
        if(roomId == undefined) return '你还没有加入任何房间';
        if(room_list[roomId] == undefined) return '你所在的房间已经撤销，请重新创建房间';
        var room = room_list[roomId];
        return room.list(info.uid);
    }
})


webot.set('enter hourse number',{
    pattern: /^\d+/,
    handler: function(info){ //return the message you want to send back to user
        var arr = info.text.split(' ');
        if(arr.length == 1){
            var roomId = arr[0], userName = user_name_list[info.uid];
            if(userName == undefined) return '第一次玩，输入房间号的同时请输入你的名字。 输入格式："房间号 你的名字"(名字不能有空格额）'
        }
        else if(arr.length == 2){
            var roomId = arr[0], userName = arr[1];
            user_name_list[info.uid] = userName;
        }
        else{
            return '输入有误， 输入格式："房间号 你的名字"(名字不能有空格额）';
        }

        console.log('用户'+ userName +'要求加入房间' + roomId);
        var room = room_list[roomId];
        if(room == undefined) return '该房间还没有创建';
        var ret = room.role(info.uid, userName);
        if(ret.substring(0, 6) == '成功进入房间') user_list[info.uid] = roomId;
        return ret;
    }
})

webot.set('room restart',{
    pattern:/^restart$/i,
    handler: function(info){
        var roomId = user_list[info.uid];
        if(roomId == undefined) return '你还没有加入任何房间';
        var room = room_list[roomId];
        if(room_list[roomId] == undefined) return '你所在的房间已经撤销，请重新创建房间';
        if(room.creator_id != info.uid  && info.uid != room.god_id) return '你不是房间的创建者或上帝，无权重新开始'
        room.restart();
        return '房间重启完成！提示大家输入“role”获取新的角色';
    }
})

webot.set('player get role again',{
    pattern:/^role$/i,
    handler: function(info){
        var roomId = user_list[info.uid];
        if(roomId == undefined) return '你还没有加入任何房间';
        var room = room_list[roomId];
        if(room_list[roomId] == undefined) return '你所在的房间已经撤销，请重新创建房间';

        return room.regain_role(info.uid);
    }
})


// 接管消息请求
webot.watch(app, { token: 'wolf', path: '/wechat' });


// 启动 Web 服务
// 微信后台只允许 80 端口
app.listen(80);
console.log('listening on port 80')
