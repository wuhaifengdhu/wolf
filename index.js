var express = require('express');
var webot = require('weixin-robot');

var app = express();

webot.set('creat room',{
    pattern: /^wolf$/i,
    handler: function(info){
        return "创建房间代码";
    }
})


webot.set("show all player's role list",{
    pattern: /^list$/,
    handler: function(info){
        return "显示所有玩家身份";
    }
})


webot.set('enter hourse number',{
    pattern: /^\d+$/,
    handler: function(info){
	var user = info.uid
        return "分配给" + user + "用户角色";
    }
})


// 接管消息请求
webot.watch(app, { token: 'wolf', path: '/wechat' });

// 启动 Web 服务
// 微信后台只允许 80 端口
app.listen(80);
console.log('listening on port 80')
