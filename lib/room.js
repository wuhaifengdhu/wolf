function room(){
    var _role = new Array()
    var _person = {}
    var _total = 0
    var _count = 0
    var _roomid = 1

    var _god_id = -1;

    function findGod(){
        if(_god_id != -1) return _god_id;

        for(var i = 0; i <= _total; i++){
            if(_role[i] == '上帝')  _god_id = i;
        }
        return _god_id;
    }

    this.list = function(userId){
        console.log('用户' + userId + '企图查看角色分配列表')
        var god_id = findGod();
        if(god_id == -1) return '程序出错了';
        if(userId != god_id) return '只有上帝可以查看角色信息';

        var str = ''
        for(var i = 0; i < _count; i++){
            str += _person[i].userName + ':' + _role[i] + '\n';
        }
        console.log('角色列表：' + str)
        return str;
    }

    function mess(arr){
        var _floor = Math.floor, _random = Math.random,
            len = arr.length, i, j, arri,
            n = _floor(len/2)+1;
        while(n--){
            i = _floor(_random()*len);
            j = _floor(_random()*len);
            if( i!==j ){
                arri = arr[i];
                arr[i] = arr[j];
                arr[j] = arri;
            }
        }
        //增加切牌操作
        i = _floor(_random()*len);
        arr.push.apply(arr, arr.splice(0,i));
    }

    this.create = function(role_list, num_list){
        console.log('创建房间解析命令成功，要求的角色有' + role_list)
        console.log('角色的数量分别是:' + num_list)
        _roomid = Math.floor((Math.random() + 1) * 1000);

        var count = 0;

        //创造出角色列表
        for(var i = 0, l = role_list.length; i < l; i++){
            for( var j = 0; j < num_list[i]; j++){
                _role[count++] = role_list[i];
            }
        }
        _role[count] = "上帝";
        _total = count

        //打乱角色的顺序
        mess(_role);

        console.log('打乱的角色列表为： ' + _role);

        return '房间创建成功，房间号为' + _roomid;
    }



    function check(userId){
        for(var i = 0; i < _count; i++){
            if(_person[i].userId == userId) return true;
        }
        return false;
    }

    this.role = function(roomid, userId, userName){
        console.log('用户'+ userName +'输入房间号：' + roomid + '，要求加入房间')
        if( roomid != _roomid || check(userId)) return "房间号不正确或者已经分配了角色";
        if( _count > _total) return "房间已满";
        console.log('用户通过验证，进入房间')
        var ps = {};
        ps.userId = userId;
        ps.userName = userName;
        _person[_count++] = ps
        console.log('用户分配到的角色为：' + _role[_count -1]);
        return _role[_count - 1]
    }
}

module.exports = room
