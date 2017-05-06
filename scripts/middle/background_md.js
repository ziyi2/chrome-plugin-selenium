
/**
 * background.js中间层
 */
g.background = function() {

    var _md_msg = g.msg
        , _md_storage = g.storage
        , _con_msg  = g.con.msg
        , _con_storage = g.con.storage;


    //重要说明: background运行期间的整个全局变量
    var _operList = [];

    /**
     * 构造函数
     */
    function Background() {

    }


    /**
     * 页面初始化
     */
    Background.prototype.init = function() {
        _md_storage.init();             //信息存储初始化
    };


    /**
     * 启动后台脚本
     */
    Background.prototype.start = function() {
        this.init();
        this._addListenerMsg();  //监听其他页面发送的消息
    };


    /**
     * 监听消息事件
     */
    Background.prototype._addListenerMsg = function() {

        _md_msg.receive(function(req,sender,res) {
            //1.接收来自popup的消息
            if(req.origin === _con_msg.sender.popup) {

                //1.1 popup发起的是[开始记录]/[停止记录]命令
                if(req.status === _con_msg.status.startRecord || req.status === _con_msg.status.stopRecord) {

                    //1.1 转发信息给content_script
                    _md_msg.send(_con_msg.type.tabs,req,function(res) {
                        // 1.1.1 如果找到了需要发送的页面
                        if(res) {
                            switch(res.status) {
                                //1.1.1.1 popup发起的是[开始记录]命令
                                case _con_msg.status.startRecord:

                                    _md_storage.get(_con_storage.storage, function(result) {
                                        var storage = result[_con_storage.storage];
                                        storage.data.time = Date.now();
                                        storage.status.recording = true;
                                        storage.data.recordName = res.name;
                                        storage.data.record = [{
                                            eventType: 'start',
                                            targetName: 'document',
                                            targetId: '',
                                            targetClass: '',
                                            targetLocation: res.href,
                                            targetType: 'document',
                                            timeSpan: Date.now()
                                        }];
                                        _md_storage.set(_con_storage.type.all,'',storage);
                                        console.log(storage);
                                    });

                                    break;


                                //1.1.1.2 popup发起的是[停止记录]命令
                                case _con_msg.status.stopRecord:

                                    _md_storage.get(_con_storage.storage, function(result) {
                                        var storage = result[_con_storage.storage];
                                        var time = new Date().toTimeString().split('GMT')[0].trim();

                                        if(storage.data.record.length > 1) {
                                            storage.data.recordList.push({                  //新增一条记录
                                                selected: false,
                                                recordTime: time,
                                                recordName: storage.data.recordName,
                                                html: "<li class='list-group-item'>" + storage.data.recordName + ' ' + time + "</li>",
                                                record: storage.data.record,
                                                href: storage.data.record[0].targetLocation
                                            });
                                        } else {
                                            alert("没有记录操作!")
                                        }

                                        storage.data.record = [];                           //清空记录数据
                                        storage.status.recording = false;                   //设置状态
                                        storage.data.recordName = '';                       //清空记录名称
                                        _md_storage.set(_con_storage.type.all,'',storage);
                                        console.log(storage);
                                    });

                                    break;

                                ////1.1.1.3 popup发起的是[执行记录]命令
                                //case _con_msg.status.startExecutive:
                                //    _md_storage.set(_con_storage.type.some,
                                //        [
                                //            _con_storage.type.status,
                                //            _con_storage.key.opering
                                //        ],
                                //        [
                                //            true
                                //        ]
                                //    );
                                //    break;
                                //
                                ////1.1.1.3 popup发起的是[停止执行]命令
                                //case _con_msg.status.stopExecutive:
                                //    _md_storage.set(_con_storage.type.some,
                                //        [
                                //            _con_storage.type.status,
                                //            _con_storage.key.opering
                                //        ],
                                //        [
                                //            false
                                //        ]
                                //    );
                                //    break;

                                default:
                                    break;

                            }

                        } else {
                            alert('没有发现可以通信的tab!');
                        }
                    });
                }

                //1.2 popup发起的是[开始执行]/[停止执行]命令
                else if(req.status === _con_msg.status.startExecutive || req.status === _con_msg.status.stopExecutive) {
                    switch(req.status) {
                        //1.2.1 popup发起的是[开始执行]命令
                        case _con_msg.status.startExecutive:

                            //1.2.1.2 处理需要发送的oper操作数据
                            _operList = req.operList;           //重要说明:这是一个全局变量
                            var oper = _operList.shift();       //获取需要执行的第一条记录
                            req.oper = oper;                    //反馈当前需要立马执行的第一条操作

                            _md_storage.set(_con_storage.type.some,
                                [
                                    _con_storage.type.status,
                                    _con_storage.key.opering,
                                    _con_storage.type.data,
                                    _con_storage.key.oper
                                    //_con_storage.type.data,
                                    //_con_storage.key.operList

                                ],
                                [
                                    true,
                                    oper
                                ],

                                //1.2.1.3 存储完毕后向content_script发起执行操作
                                function() {

                                    //2.1.2.1 发送给content_script执行
                                    _md_msg.send(_con_msg.type.tabs,{
                                        status: _con_msg.status.startExecutive,
                                        origin: _con_msg.sender.background,
                                        oper  : oper
                                    },function(res) {

                                    });

                                    ////2.1.2.2 发送执行状态给popup
                                    //_md_msg.send(_con_msg.type.extensions,{
                                    //    status: _con_msg.status.startExecutive,
                                    //    origin: _con_msg.sender.background,
                                    //    oper  : oper
                                    //},function(res) {
                                    //
                                    //});
                                }
                            );

                            break;


                        //1.2.2 popup发起的是[停止执行]命令
                        case _con_msg.status.stopExecutive:


                            _md_storage.set(_con_storage.type.some,
                                [
                                    _con_storage.type.status,
                                    _con_storage.key.opering,
                                    _con_storage.type.data,
                                    _con_storage.key.oper
                                ],
                                [
                                    false,
                                    []
                                ],

                                function() {
                                    _md_msg.send(_con_msg.type.tabs,{
                                        status: _con_msg.status.stopExecutive,
                                        origin: _con_msg.sender.background
                                    },function(res) {

                                    });
                                }
                            );


                            //_md_msg.send(_con_msg.type.tabs,{
                            //    status: _con_msg.status.stopExecutive,
                            //    origin: _con_msg.sender.background
                            //},function(res) {
                            //
                            //});

                            break;

                        default:
                            break;
                    }
                }


            //2.接收来自content_script的消息
            } else if(req.origin === _con_msg.sender.content_script){
                //2.1 content_script执行完毕单条记录后继续获取需要执行的记录
                if(req.status === _con_msg.status.doneOper) {

                    //2.1.1 发送执行状态给popup
                    _md_msg.send(_con_msg.type.extensions,{
                        status: _con_msg.status.startExecutive,
                        origin: _con_msg.sender.background,
                        oper  : _operList[0] || [],
                        operList: _operList
                    },function(res) {

                    });


                    //2.1.2 如果有需要执行的记录
                    if(_operList.length) {

                        var oper = _operList.shift();

                        _md_storage.set(_con_storage.type.some,
                            [
                                _con_storage.type.status,
                                _con_storage.key.opering,
                                _con_storage.type.data,
                                _con_storage.key.oper
                                //_con_storage.type.data,
                                //_con_storage.key.operList

                            ],
                            [
                                true,
                                oper
                            ],

                            //2.2.2.1 存储完毕后向content_script发起执行操作
                            function() {
                                _md_msg.send(_con_msg.type.tabs,{
                                    status: _con_msg.status.startExecutive,
                                    origin: _con_msg.sender.background,
                                    oper  : oper
                                },function(res) {

                                });
                            }
                        );


                    //2.1.3 记录执行完毕
                    } else {

                        _md_storage.set(_con_storage.type.some,
                            [
                                _con_storage.type.status,
                                _con_storage.key.opering

                            ],
                            [
                                false,
                                []
                            ],

                            function() {

                            }
                        );
                    }
                }
            }

            //2. 反馈信息(应该比存储数据和发送信息得到的反馈更快)
            //console.log(req);
            res(req);
        });
    };


    return new Background();
}();
