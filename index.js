var express = require('express');
var webot = require('weixin-robot');

var app = express();

// 指定回复消息
webot.set('hi', '你好');

webot.set('subscribe', {
  pattern: function(info) {
    return info.is('event') && info.param.event === 'subscribe';
  },
  handler: function(info) {
    return '欢迎订阅微信机器人';
  }
});

webot.set('test', {
  pattern: /^test/i,
  handler: function(info, next) {
    next(null, 'roger that!')
  }
})


// 接管消息请求
webot.watch(app, { token: 'wolf', path: '/wechat' });

// 启动 Web 服务
// 微信后台只允许 80 端口
app.listen(80);

