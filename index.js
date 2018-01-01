var express = require('express');
var webot = require('weixin-robot');
var Room = require('./lib/room');
var log = require('debug')('wolf:log');
var _ = require('underscore')._;

var app = express();

var room_list = {};
var user_list = {};
var user_name_list = {};

webot.set('subscribe', {
  pattern: function(info) {
    return info.is('event') && info.param.event === 'subscribe';
  },
  handler: function(info) {
    return '欢迎程序员的狼人杀世界！\n'
    +'\n常\n用\n命\n令：'
    +'\n创建房间命令：\n>create 狼人 3 女巫 1 预言家 1 村民 4'
    +'\n进入房间命令：\n>1449 小明'
    +'\n上帝查看角色命令：\n>list'
    +'\n再来一局命令：\n>restart'
    +'\n查看本简介：\n>help'
    +'\n房间重启后获得新角色命令：\n>role\n'
    +'\n补充说明：'
    +'\n1,在创建命令中，角色和数目都可以自由配置。创建者负责组织游戏，即为上帝！'
    +'\n2,第一次进入房间（以后只需输入房间号），请严格按照标准："房间号 名字"输入，房间号与名字之间有一个空格，名字中不能有空格。上帝查看游戏角色时，会显示这个名字。'
    +'\n3,再来一局命令，只有房间创建者（上帝）可以使用';
  }
});

function parse(cmd_str){
    var arr = cmd_str.split(' ');

    var lista = new Array(), listb = new Array();
    var count = 0;
    for(var i = 1, l = arr.length; i < l; i+=2){
        lista[count] = arr[i];
        listb[count] = arr[i + 1]
        count++;
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

webot.set("show help command list",{
    pattern: /^help$/i,
    handler: function(info){ //return the message you want to send back to user
        return '常用命令及说明\n'
        +'\n创建房间命令：\n>create 狼人 3 女巫 1 预言家 1 村民 4'
        +'\n进入房间命令：\n>1449 小明'
        +'\n上帝查看角色命令：\n>list'
        +'\n再来一局命令：\n>restart'
        +'\n查看本简介：\n>help'
        +'\n房间重启后获得新角色命令：\n>role\n'
        +'\n补充说明：'
        +'\n1,在创建命令中，角色和数目都可以自由配置。创建者负责组织游戏，即为上帝！'
        +'\n2,第一次进入房间（以后只需输入房间号），请严格按照标准："房间号 名字"输入，房间号与名字之间有一个空格，名字中不能有空格。上帝查看游戏角色时，会显示这个名字。'
        +'\n3,再来一局命令，只有房间创建者（上帝）可以使用';
    }
})


webot.set('enter hourse number',{
    pattern: /^\d+/,
    handler: function(info){ //return the message you want to send back to user
        var arr = info.text.split(' ');
        if(arr.length == 1){
            var roomId = arr[0], userName = user_name_list[info.uid];
            if(userName == undefined) return '第一次玩，输入房间号的同时请输入你的名字。 输入格式："房间号 你的名字"(房间号与名字之间有一个空格，名字中不能有空格额）'
        }
        else if(arr.length == 2){
            var roomId = arr[0], userName = arr[1];
            user_name_list[info.uid] = userName;
        }
        else{
            return '输入有误， 输入格式："房间号 你的名字"(房间号与名字之间有一个空格，名字中不能有空格额）';
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
        if(room_list[roomId] == undefined) return '你所在的房间因时间过长已经撤销，请重新创建房间';
        if(room.creator_id != info.uid  && info.uid != room.god_id) return '你不是房间的创建者（上帝），无权重新开始'
        room.restart();
        return '房间重启完成！提示大家输入“role”获取新的角色。';
    }
})

webot.set('player get role again',{
    pattern:/^role$/i,
    handler: function(info){
        var roomId = user_list[info.uid];
        if(roomId == undefined) return '你还没有加入任何房间';
        var room = room_list[roomId];
        if(room_list[roomId] == undefined) return '你所在的房间因时间过长已经撤销，请重新创建房间';

        return room.regain_role(info.uid);
    }
})

webot.set('test to reply picture',{
    pattern:/^picture$/i,
    handler: function(info){
        return {
            title: '流动的火车',
            url: 'http://haifwu.com:8080/train.gif',
            picUrl: 'http://haifwu.com:8080/train.gif',
            description: '火车滴滴答答，消逝的是年华',
        }
    }
})

webot.set('test to reply picture',{
    pattern:/^music$/i,
    handler: function(info){
        return {
            title: "来段音乐吧",
            description: "生如夏花",
            musicUrl: "http://haifwu.com:8080/life.mp3",
            hqMusicUrl: "http://haifwu.com:8080/life.mp3"
        }
    }
})

webot.waitRule('wait_guess', function(info){
    var r = Number(info.text);

    if(isNaN(r)){
        info.resolve();
        return null;
    }

    var num = info.session.guess_answer;

    if(r == num){
        return '你真聪明！';
    }

    var rewaitCount = info.session.rewait_count || 0;

    if(rewaitCount >= 2){
        return '怎么这样都猜不出来！答案是 ' + num + '啊！';
    }

    info.rewait();
    return (r > num ? '大了' : '小了') + ', 还有 ' + ( 2 - rewaitCount ) + '次机会，再猜.';
})


require('js-yaml');
webot.dialog(__dirname + '/rules/dialog.yaml')

webot.set('default reply',{
    handler: function(info){
        return '无效的命令\n你可以输入help获取命令列表';
    }
})

// 接管消息请求
webot.watch(app, { token: 'wolf', path: '/wechat' });

// 如果需要 session 支持，sessionStore 必须放在 watch 之后
var cookieParser = require('cookie-parser'),
    expressSession = require('express-session');

app.use(cookieParser());
app.use(expressSession({
    secret: 'abcd123',
    store: new expressSession.MemoryStore(),
    resave: false,
    saveUninitialized: true
}));

// 在生产环境，你应该将此处的 store 换为某种永久存储。
// 请参考 http://expressjs.com/2x/guide.html#session-support

// 在环境变量提供的 $PORT 或 3000 端口监听
var port = process.env.PORT || 80
app.listen(port, function(){
    log("Listening on %s", port);
})

// 微信接口地址只允许服务放在 80 端口
// 所以需要做一层 proxy
//app.enable('trust proxy');

