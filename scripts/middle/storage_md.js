
/**
 * 存储中间层
 */

g.storage = (function(){

    var _con_storage = g.con.storage
        , _fn_storage = g.fn.storage;


    return {

        /**
         * 存储信息初始化
         */
        init : function() {
            _fn_storage.set({
                storage: {
                    //操作状态
                    status:{
                        recording: false,   //是否正在记录 [pupup(r)/background(rw)/content_script(r)]
                        opering: false      //是否正在执行 [pupup(r)/background(rw)/content_script(r)]
                    },
                    //存储数据
                    data: {
                        recordName: '',     //记录名称 [pupup(r)/background(rw)]
                        time: Date.now(),   //一条操作记录中的每个操作记录的时间戳 [content_script(rw)]
                        record: [],         //正在记录的单条操作数据 [content_script(rw)/background(rw)]
                        recordList: [       //记录列表 [pupup(rw)/background(rw)]

                            //selected:     //记录是否被选中;
                            //recordTime:   //记录时间;
                            //record:       //记录数据;
                            //html:         //记录列表li的内容(popup.html显示用);
                            //href:         //记录的起始url
                        ],
                        oper: [],           //正在执行的单条记录
                        operList: []        //需要执行的记录列表 [pupup(rw)/background(rw)]
                    }
                }
            });
        },

        /**
         * 获取信息
         */
        get : function(key,cb) {
            _fn_storage.get(key,cb);
        },


        /**
         * 存储信息(没有封装好这个api)
         */
        set : function(type,key,data,cb) {
            switch(type) {
                //更新整个数据
                case _con_storage.type.all:
                    _fn_storage.set({storage:data},cb);
                    break;

                //更新部分数据
                case _con_storage.type.some:
                    _fn_storage.get(_con_storage.storage,function(result) {
                        var storage = result[_con_storage.storage];

                        $.each(key,function(index,value) {
                            if(!(index % 2)) {  //key的偶数项是需要存储的数据类型
                                storage[value][key[index+1]] = data[index/2];
                            }
                        });

                        _fn_storage.set({storage:storage},cb);
                    });
                    break;

                default:
                    break;
            }
        }
    }

})();





