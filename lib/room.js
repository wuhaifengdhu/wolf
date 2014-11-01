function room(creatorId, roomId, nowTime){
    //public variable
    this.creator_id = creatorId;//创建者的id
    this.create_time = nowTime; //在创建房间和房间重启的时候更新
    this.room_id = roomId; //房间id，由创建的时候传入
    this.god_id = ''; //上帝的用户id，在发牌的时候确定

    //private variable
    var _total = 0;//创建角色的总人数
    var _count = 0;//保存当前游戏人数

    var _role = new Array(); //角色顺序
    var _group = new Array(); //玩家顺序  userId --> _role index
    var _user = {}; //保存用户信息 userId--> userName

    //在游戏的过程中，只有上帝可以查看各个玩家的角色
    this.list = function(userId){
        console.log('用户' + _user[userId] + '企图查看角色分配列表')
        if(this.god_id == '') return '上帝死了，众神在堕落。（程序出bug了）';
        if(userId != this.god_id) return '只有上帝可以查看角色信息';

        var str = ''
        for(var uid in _user){
            str += _role[_group[uid]] + ' : ' + _user[uid] + '\n';
        }
        console.log('角色列表：\n' + str)
        return str;
    }

    //打乱角色分配数组
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

    //根据角色及各个角色的人数分配角色（上帝是默认添加的）
    this.create = function(role_list, num_list){
        console.log('创建房间解析命令成功，要求的角色有' + role_list);
        console.log('角色的数量分别是:' + num_list);

        var count = 0;
        //创造出角色列表
        for(var i = 0, l = role_list.length; i < l; i++){
            for( var j = 0; j < num_list[i]; j++){
                _role[count++] = role_list[i];
            }
        }
        _role[count] = "上帝";
        _total = count;

        //打乱角色的顺序
        mess(_role);

        console.log('打乱的角色列表为： ' + _role);
        return '房间创建成功，房间号为' + this.room_id;
    }

    this.role = function(userId, userName){
        if(_user[userId] != undefined) return "已经分配了角色";
        if( _count > _total) return "房间已满";
        console.log('用户' + userName + '通过验证，进入房间');
        console.log('用户分配到的角色为：' + _role[_count]);
        if(_role[_count] == "上帝") this.god_id = userId;

        _group[userId] = _count;
        _user[userId] = userName;

        return "成功进入房间，你的角色是" + _role[_count ++];
    }


    this.restart = function(){
        this.create_time = new Date().getTime();
        mess(_role);
    }

    this.regain_role = function(userId){
        if(_user[userId] == undefined) return "你不是这个房间的玩家，不能获得角色";
        var role = _role[_group[userId]];
        if(role == '上帝') this.god_id = userId;
        return role;
    }
}

module.exports = room
