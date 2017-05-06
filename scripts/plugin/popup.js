/**
 * 页面加载
 */

$(function() {
    popup.init();           //页面状态初始化
    popup.start();          //页面启动监听
});



/**
 * 页面卸载
 */

window.onunload = function() {

};





/**
 * 模块模式(单例模式)
 */
var popup = function() {

    var _md_msg = g.msg
        , _md_storage = g.storage
        , _con_storage = g.con.storage
        , _con_msg = g.con.msg;


    /**
     * 私有常量
     */
    var _con = {};
    /*id常量*/
    _con.targetId = {
        recordName  : 'recordName',             //记录名称(input)
        recordList  : 'recordList',             //记录列表(ul)
        start       : 'start',                  //开始记录(button)
        executive   : 'executive',              //执行记录(button)
        save        : 'save',                   //保存记录(button)
        delete      : 'delete'                  //删除记录(button)
    };

    _con.color = {
        selected    : 'rgb(234, 234, 234)',     //选中时的颜色
        unselect    : 'rgb(255, 255, 255)',     //未选中的颜色
        init        : '',                       //颜色初始值
        executiveing: 'rgb(242, 222, 222)'      //正在执行的颜色
    };

    _con.class = {
        success     : "btn btn-success",
        danger      : "btn btn-danger",
        warning     : "btn btn-warning"
    };

    _con.text = {
        startRecord     : "开始记录",
        stopRecord       : "停止记录",
        startExecutive  : "执行记录",
        stopExecutive    : "停止执行",
        nameNull        : "请填写记录名称!",     //没有填写记录名称
        empty           : "",
        executiveNull   : "请选记录"            //没有需要执行的记录
    };

    _con.nodeType = {
        li           : 'li'
    };

    _con.liOper = {
        delete      : "delete",                 //删除li元素
        update      : "update"                  //更新li列表
    };


    /**
     * 公有构造函数
     */
    function Popup() {
    }


    /**
     * 页面初始化
     */
    Popup.prototype.init = function() {

        var self = this;

        _md_storage.get(_con_storage.storage,function(result) {
            var storage = result[_con_storage.storage]
            , _con_storage_key = _con_storage.key;
            console.log(storage);


            /*1.遍历数据*/
            for(var key in storage.data) {
                switch(key) {
                    /*2.1 显示记录名称*/
                    case _con_storage_key.recordName:
                        $('#' + _con.targetId.recordName).val(storage.data[key]);
                        break;

                    /*2.2 显示记录列表(注意先显示列表才能显示列表的背景色等,所以要先遍历数据)*/
                    case _con_storage_key.recordList:
                        var html = _con.text.empty;
                        $.each(storage.data.recordList,function(index,item) {
                            html += item.html;
                        });
                        $('#' + _con.targetId.recordList).html(html);
                        break;

                    default:
                        break;
                }
            }



            /*2.遍历状态*/
            for(var key in storage.status) {
                switch(key) {
                    /*1.1 [开始记录]/[停止记录]状态对应DOM显示*/
                    case _con_storage_key.recording:
                        self._showRecordStatus(storage.status[key],_con.targetId.start);
                        break;

                    /*1.2 [执行记录]/[停止执行]状态对应DOM显示*/
                    case _con_storage_key.opering:
                        self._showExecutiveStatus({
                            status: storage.status[key] ? _con_msg.status.startExecutive : _con_msg.status.stopExecutive,
                            oper: storage.data.oper
                        },_con.targetId.executive);
                        break;

                    default:
                        break;
                }
            }
        });
    };


    /**
     * 页面启动并添加监听事件
     */
    Popup.prototype.start = function() {
        this._addClickListener();
        this._addMsgListener();
    };



    /**
     * 添加执行状态监听消息事件
     */
    Popup.prototype._addMsgListener = function() {
        var self = this;
        _md_msg.receive(function(req,sender,res) {
            //当background.js通过startExecutive状态发送给content_script执行命令时,popup监听执行状态
            if(req.origin === _con_msg.sender.background && req.status === _con_msg.status.startExecutive) {
                self._showExecutiveStatus(req, _con.targetId.executive);
            }
        });
    };





    /**
     * 添加click监听事件
     */
    Popup.prototype._addClickListener = function() {
        var self = this;
        $(document).click(function(e) {
            self._onClick(e);
        });
    };


    /**
     * click事件处理
     */
    Popup.prototype._onClick = function(e) {

            switch(e.target.id) {
                // 1.[开始记录]/[停止记录]按钮点击事件
                case _con.targetId.start:
                    this._clickRecord(e);
                    break;

                // 2.[删除记录]/[执行记录]/[保存记录]按钮点击事件
                case _con.targetId.delete:
                case _con.targetId.save:
                case _con.targetId.executive:
                    this._clickExecutiveDeleteSave(e);
                    break;


                // n.记录列表的点击事件(因为li元素没有id)
                default:
                    if(e.target.nodeName.toLocaleLowerCase() === _con.nodeType.li) {
                        this._clickRecordList(e);
                    }
                    break;
            }
    };

    /**
     * [开始记录]/[停止记录]按钮点击事件
     */
    Popup.prototype._clickRecord = function(e) {
        var self = this
        , recordNameText = $('#' + _con.targetId.recordName).val();

        //1.1 填写了记录名称
        if(recordNameText) {
            // 1.1.1 发送消息给background
            _md_msg.send(_con_msg.type.extensions,{
                status: e.target.textContent === _con.text.startRecord ? _con_msg.status.startRecord : _con_msg.status.stopRecord ,
                name:recordNameText,
                origin: _con_msg.sender.popup}, function (res) {
                //1.1.1.1 反馈来自background的消息
                if (res.status === _con_msg.status.startRecord || res.status == _con_msg.status.stopRecord) {
                    self._showRecordStatus(res.status, e.target.id);
                }
            });

        //1.2 未填写记录名称
        } else {
            var $btn = $('#' + e.target.id);
            $btn.text(_con.text.nameNull);                      //显示[请填写记录名称!]
            $btn.removeClass().addClass(_con.class.danger);

            setTimeout(function(){
                self._showRecordStatus(_con_msg.status.stopRecord, e.target.id);
            },1000);
        }
    };


    /**
     * [开始记录]/[停止记录]状态对应DOM显示
     */
    Popup.prototype._showRecordStatus = function(status,id) {

        var $btn = $('#' + id);

        //1.[开始记录]
        if(status === _con_msg.status.startRecord || status === true) {   // status === true是根据chrome.storage获取状态
            this._domStatusSet(_con.targetId.executive,true);
            this._domStatusSet(_con.targetId.save,true);
            this._domStatusSet(_con.targetId.delete,true);
            this._domStatusSet(_con.targetId.recordName,true);
            $btn.text(_con.text.stopRecord);                     //显示[停止运行]
            $btn.removeClass().addClass(_con.class.warning);

        //2.[停止记录]
        } else if(status === _con_msg.status.stopRecord) {
            this._domStatusSet(_con.targetId.executive,false);
            this._domStatusSet(_con.targetId.save,false);
            this._domStatusSet(_con.targetId.delete,false);
            this._domStatusSet(_con.targetId.recordName,false);
            $('#' + _con.targetId.recordName).val(_con.text.empty);
            $btn.text(_con.text.startRecord);                   //显示[开始记录]
            $btn.removeClass().addClass(_con.class.success);
            this._showRecordList(_con.liOper.update);           //停止记录后更新记录列表(此时可能已经有新增的记录)
        }
    };



    /**
    * 设置dom元素状态
    */
    Popup.prototype._domStatusSet = function(id,status) {
        $('#'+ id).attr("disabled",status);
    };


    /**
     * 设置list元素的增删
     */
    Popup.prototype._showRecordList = function(type,elem) {
        //1.删除元素
        if(type === _con.liOper.delete) {
            elem.style.display = "none";
        //2.新增元素(因为可能没有记录操作,所以不是增加数据,而是更新整个记录列表)
        } else if(type === _con.liOper.update) {
            setTimeout(function(){
                _md_storage.get(_con_storage.storage,function(result) {
                    var storage = result[_con_storage.storage];
                    var html = _con.text.empty;
                    $.each(storage.data.recordList,function(index,item) {
                        html += item.html;
                    });
                    $('#' + _con.targetId.recordList).html(html);    //内部使用了文档碎片进行处理
                });
            },50);                                                   //这个延时很重要,因为background.js可能正在存储一条新的记录,所以这里需要延时获取这条新数据
        }
    };



    /**
     * li元素(记录列表)的点击事件
     */
    Popup.prototype._clickRecordList = function(e) {
        var bgColor = e.target.style.backgroundColor;
        if(bgColor == _con.color.init || bgColor == _con.color.unselect) {
            e.target.style.backgroundColor = _con.color.selected;
        } else if(bgColor == _con.color.selected) {
            e.target.style.backgroundColor = _con.color.unselect;
        }
    };


    /**
     * [删除记录]/[执行记录]/[保存记录]按钮点击事件
     */
    Popup.prototype._clickExecutiveDeleteSave = function(e) {
        var self = this
            , lis = []
            , selectList = []           //选中的记录列表
            , unSelectList = [];        //非选中的记录列表

        //1.遍历所有的li
        $.each($('#'+ _con.targetId.recordList).children(),function(index,li) {
            //1.1 获取li中的选中项
            if(li.style.backgroundColor === _con.color.selected) {
                //1.1.1 [删除记录]隐藏需要删除的li
                if(e.target.id == _con.targetId.delete) {
                    self._showRecordList(_con.liOper.delete,li);
                }

                //1.1.2 获取li中选中项的文本
                lis.push(li.textContent);
            }
        });



        //2.获取记录列表中对应li的选中项和非选中项记录
        _md_storage.get(_con_storage.storage,function(result) {
            var storage = result[_con_storage.storage];

            //2.1 获取选中项记录列表
            $.each(storage.data.recordList,function(index,record) {
                $.each(lis,function(index,text) {
                    //2.1.1 比对li的文本和记录的时间(li的文本中有记录时间)
                    if(text.indexOf(record.recordTime) != -1) {
                        record.selected = true;
                        selectList.push(record);
                    }
                });
            });

            //2.2 获取非选中项列表
            $.each(storage.data.recordList,function(index,record) {
                if(record.selected == false) {
                    unSelectList.push(record);
                }
            });


            //2.3 [删除记录]/[执行记录]/[保存记录]
            switch(e.target.id) {
                //2.3.1 [删除记录]
                case _con.targetId.delete:
                    storage.data.recordList = unSelectList; //需要保存的记录是未选中的记录列表
                    _md_storage.set(_con_storage.type.all,null,storage);
                    break;


                //2.3.2 [执行记录]
                case _con.targetId.executive:

                    //2.3.2.1 [执行记录]
                    if(e.target.textContent === _con.text.startExecutive) {
                        //2.3.2.1.1 如果有选中的记录需要执行
                        if(selectList.length) {
                            ////2.3.2.1.1.1 存储选中的需要执行的记录(这里只是设置了部分)
                            //_md_storage.set(_con_storage.type.some,
                            //    [
                            //        _con_storage.type.data,
                            //        _con_storage.key.operList
                            //    ],
                            //    [
                            //        selectList
                            //    ],
                            //    function() {
                            //        //需要注意一定要等存储完毕后再发起执行信
                            //        _md_msg.send(_con_msg.type.extensions,{
                            //            status: _con_msg.status.startExecutive,
                            //            origin: _con_msg.sender.popup}, function (res) {
                            //            self._showExecutiveStatus(res.status, _con.targetId.executive);
                            //        });
                            //    }
                            //);

                            _md_msg.send(_con_msg.type.extensions,{
                                status: _con_msg.status.startExecutive,
                                origin: _con_msg.sender.popup,
                                operList: selectList        //需要操作的命令是选中的命令列表
                            }, function (res) {
                                self._showExecutiveStatus(res, _con.targetId.executive);
                            });

                        //2.3.2.1.2 没有需要执行的记录
                        } else {
                            self._showExecutiveStatus({status: null}, _con.targetId.executive);
                            setTimeout(function(){
                                self._showExecutiveStatus({status:_con_msg.status.stopExecutive}, _con.targetId.executive);
                            },1000);
                        }

                    //2.3.2.2 [停止执行]
                    } else {
                        _md_msg.send(_con_msg.type.extensions,{
                            status: _con_msg.status.stopExecutive,
                            origin: _con_msg.sender.popup}, function (res) {
                            res.oper = [];
                            self._showExecutiveStatus(res, _con.targetId.executive);
                        });
                    }


                    break;

                default:
                    break;
            }
        });
    };


    /**
     * [执行记录]/[停止执行状态对应DOM显示
     */
    Popup.prototype._showExecutiveStatus = function(req,id) {

        var $btn = $('#' + id);


        //1.显示按钮状态
        switch(req.status) {
            //1.1 [执行记录]
            case _con_msg.status.startExecutive:
                $btn.text(_con.text.stopExecutive);
                $btn.removeClass().addClass(_con.class.danger);
                this._domStatusSet(_con.targetId.start,true);
                this._domStatusSet(_con.targetId.save,true);
                this._domStatusSet(_con.targetId.delete,true);
                break;

            //1.2 [停止执行]
            case _con_msg.status.stopExecutive:
                $btn.text(_con.text.startExecutive);
                $btn.removeClass().addClass(_con.class.success);
                this._domStatusSet(_con.targetId.start,false);
                this._domStatusSet(_con.targetId.save,false);
                this._domStatusSet(_con.targetId.delete,false);
                break;

            //1.3 [请选记录]
            case null:
                $btn.text(_con.text.executiveNull);
                $btn.removeClass().addClass(_con.class.danger);
                break;
        }


        //2. 如果记录执行完毕(记录执行完毕后req.oper = [])
        if(req.oper && !req.oper.recordTime) {
            $btn.text(_con.text.startExecutive);
            $btn.removeClass().addClass(_con.class.success);
            this._domStatusSet(_con.targetId.start, false);
            this._domStatusSet(_con.targetId.save, false);
            this._domStatusSet(_con.targetId.delete, false);
        }

        //3.显示当前正在执行的那条记录的背景颜色(如果执行完毕去掉背景颜色)
        if(req.oper) {
            $.each($('#' + _con.targetId.recordList).children(), function(index,li) {
                li.style.backgroundColor = _con.color.unselect; //先把选中列表的背景颜色清空
                if(req.oper.recordTime && li.textContent.indexOf(req.oper.recordTime) != -1) {
                    li.style.backgroundColor = _con.color.executiveing;
                    //return false; 不能跳出,因为li需要全局清除背景
                }
            });
        }
    };


    return new Popup();
}();





