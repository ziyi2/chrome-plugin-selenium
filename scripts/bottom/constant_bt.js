
/**
 * 底层常量
 */

if(g) { //g是命名空间
    g.con = {}
} else {
    var g = {};
    g.con = {};
}

STORSDSF_TYPE_ALL = "all"
/**
 * 存储常量
 */
g.con.storage = {
    //存储的对象名称
    storage         : 'storage',                //chrome存储变量的命名空间
    //类型
    type: {
        status      : 'status',                 //需要操作的是状态
        data        : 'data',                   //需要操作的是数据
        some        : 'some',                   //需要操作是部分数据
        all         : 'all'                     //更新整个数据
    },
    //存储对象的属性
    key: {
        recording   : 'recording',              //是否正在记录操作
        recordName  : 'recordName',             //记录名称,
        recordList  : 'recordList',             //记录列表
        record      : 'record',                 //一条操作记录
        time        : 'time',                   //操作记录的时间戳
        operList    : 'operList',               //需要执行的记录列表
        oper        : 'oper',                   //当前执行的一条记录
        opering     : 'opering'                 //是否正在执行操作
    }
};

/**
 * 通信常量
 */
g.con.msg = {
    //信息的发送方
    sender: {
        background      : 'background',
        content_script  : 'content_script',
        popup           : 'popup'
    },

    //信息的发送类型
    type: {
        extensions      : 'extensions',
        tabs            : 'tabs'
    },

    //发送执行状态
    status: {
        startRecord           : 'startRecord',      //开始记录
        stopRecord            : 'stopRecord',
        startExecutive        : 'startExecutive',   //开始执行
        stopExecutive         : 'stopExecutive',    //停止执行
        doneExecutive         : 'doneExecutive',    //完成执行
        doneOper              : 'doneOper'          //完成单条执行
    }
};


