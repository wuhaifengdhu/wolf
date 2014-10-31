wolf
====

A small project to help web chat user to enjoying play wolf killer without cards.


解决方案：
    用户关注公众号，就能一起愉快的玩耍狼人杀。




游戏角色：
    管理员：输入人数和角色分配，创建房间，得到一个房间号，告诉大家。

    然后人们分别输入房间号和自己的名字，得到各自的角色。

    上帝：可以list得到名字和角色。
    狼人：无特殊权限
    村民：无特殊权限
    女巫：无特殊权限
    ……
    
    
    
    应用示例：
    任何人输入：create 狼人 3 村民 2 先知 1 女巫 1
    返回：房间号1234
    
    其他人输入：1234 myname
    返回角色：狼人
    
    上帝输入：list
    返回玩家角色分配列表
