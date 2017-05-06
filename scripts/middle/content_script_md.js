


g.content_script = function() {

    var _md_msg = g.msg
        , _con_msg = g.con.msg
        , _md_record = g.record
        , _md_oper = g.oper
        , _md_storage = g.storage
        , _con_storage = g.con.storage;

    function ContentScript() {}


    /**
     * 页面刷新
     */
    ContentScript.prototype._init = function() {
        var self = this;

        _md_storage.get(_con_storage.storage,function(result) {

            var status = result[_con_storage.storage].status;

            console.log(status);

            //1.如果页面正在记录,刷新后仍然继续记录
            if(status.recording) {
                self.startRecord();
                console.log("recording...");
            }

            //2.如果页面正在记录,刷新后仍然继续记录(需要注意的是没有控制这两个status的绝对行为,事实上recording时肯定不能opering)
            else if(status.opering) {
                self.startOper();
                console.log("opering...");
            }
        });
    };

    /**
     * 启动页面脚本
     */
    ContentScript.prototype.start = function() {
        this._init();
        this._addListenerMsg();
    };



    /**
     * 通信监听
     */

    ContentScript.prototype._addListenerMsg = function() {

        var self = this;

        _md_msg.receive(function(req,sender,res) {

            //1.反馈信息(反馈信息优先[因为要先设置状态(防止在操作和记录时状态被覆盖)])
            req.href = window.location.href;
            res(req);

            //2.接收来自pupup的消息
            if(req.origin === _con_msg.sender.popup) {
                switch (req.status) {
                    //2.1 [开始记录]
                    case _con_msg.status.startRecord:
                        self.startRecord();
                        break;

                    //2.2 [停止记录]
                    case _con_msg.status.stopRecord:
                        self.stopRecord();
                        break;

                    ////2.3 [执行记录]
                    //case _con_msg.status.startExecutive:
                    //    self.startOper();
                    //    break;

                    ////2.4 [停止执行]
                    //case _con_msg.status.stopExecutive:
                    //    self.stopOper();
                    //    break;

                    default:
                        break;
                }
            }


            //3.接收来自background的消息
            if(req.origin === _con_msg.sender.background) {
                switch (req.status) {
                    //3.1 [执行记录]
                    case _con_msg.status.startExecutive:
                        self.startOper();
                        break;

                    //3.2 [停止执行]
                    case _con_msg.status.stopExecutive:
                        self.stopOper();
                        break;

                    default:
                        break;
                }
            }


        });
    };



    /**
     * 启动记录操作脚本
     */

    ContentScript.prototype.startRecord = function() {
        _md_record.start();
    };


    /**
     * 停止记录操作脚本
     */
    ContentScript.prototype.stopRecord = function() {
        _md_record.stop();
    };

    /**
     * 启动执行记录脚本
     */
    ContentScript.prototype.startOper = function() {
        _md_oper.start();
    };

    /**
     * 停止执行记录脚本
     */
    ContentScript.prototype.stopOper = function() {
        _md_oper.stop();
    };



    return new ContentScript();

}();