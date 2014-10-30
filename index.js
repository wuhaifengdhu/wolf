var express = require('express');
var webot = require('weixin-robot');

var app = express();

var rooms = [];
var rid = 0;
if(typeof Wolf_Role == 'undefined'){
    var Wolf_Role = {};
    Wolf_Role.Citizen = 'c';
    Wolf_Role.Wolf = 'w';
    Wolf_Role.Seer = 's';
    Wolf_Role.Witch = 'v';
    Wolf_Role.Cupid = 'q';
    Wolf_Role.Hunter = 'h';
    Wolf_Role.Guard = 'g';

}

var wolf_role_matrix = {


}

//7人 （2狼人 1预言家 1丘比特 1女巫 2村民）
//8人 （2狼人 1预言家 1丘比特 1女巫 1猎人 2村民）
//9人 （2狼人 1预言家 1丘比特 1女巫 1猎人 1守卫 2村民）
//10人（2狼人 1预言家 1丘比特 1女巫 1猎人 1守卫 3村民）
//11人（3狼人 1预言家 1丘比特 1女巫 1猎人 1守卫 3村民）
//12人（3狼人 1预言家 1丘比特 1女巫 1猎人 1守卫 4村民）
//13人（3狼人 1预言家 1丘比特 1女巫 1猎人 1守卫 5村民）
//14人（3狼人 1预言家 1丘比特 1女巫 1猎人 1守卫 1白痴 5村民）
//15人（3狼人 1预言家 1丘比特 1女巫 1猎人 1守卫 1白痴 1替罪羊 5村民）


function generate_roles(count){
    var ps = new Array(count);
    for(var i = 0; i < count; i++){
        ps[i]={role: wolf_role_matrix[count][i]};
    }
}

webot.set('creat room',{
    pattern: /^wolf\s*([0-9]*[1-9][0-9]*)$/i,
    handler: function(info){
        var pcount = Number( info.param[0]) || 0;
        log('crate room, pcount:', pcount);
        if(pcount < 7){
            return "oops, 才不到7个人还玩狼人杀"
        }
        rooms.push({rid: rid++, pcount: pcount, players: generate_charaters(pcount)});
        return "创建房间代码: "+ rid;
    }
});


webot.set("show all player's role list",{
    pattern: /^list$/,
    handler: function(info){
        return "显示所有玩家身份";
    }
});


webot.set('enter room number',{
    pattern: /^([0-9]*[1-9][0-9]*)$/,
    handler: function(info){
        var room_id = Number( info.param[0]) || 0;
        log('enter room, rid:', room_id);
        if(room_id > rid){
            return "oops, 溢出了"
        }
        //TODO

        return "分配给用户角色";
    }
});


// 接管消息请求
webot.watch(app, { token: 'wolf', path: '/wechat' });

// 启动 Web 服务
// 微信后台只允许 80 端口
app.listen(80);

