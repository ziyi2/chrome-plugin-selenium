

/**
 * 执行记录操作中间层
 */

g.oper = function() {


    /**
     * 私有变量
     */
    var _con = {}
        , _md_storage = g.storage
        , _con_storage = g.con.storage
        , _con_msg = g.con.msg
        , _timeId
        , _md_msg = g.msg;

    _con.page = {
        start: 'start'
    };

    function Oper() {}

    /**
     * 启动执行操作
     */
    Oper.prototype.start = function() {
        this._executive();
    };


    /**
     * 停止执行操作
     */
    Oper.prototype.stop = function() {
        clearTimeout(_timeId);
        this._updateOper(false,[]);
    };

    /**
     * 执行记录
     */
    Oper.prototype._executive = function() {     //reFresh页面是否刷新和重定向
        var self = this;


        _md_storage.get(_con_storage.storage,function(result) {

            var oper = result[_con_storage.storage].data.oper
                , recordUnit = oper.record[0];


            //1. 如果是刚开始执行记录,则需要页面跳转
            if( recordUnit.eventType === _con.page.start) {
                oper.record.shift();
                self._updateOper(true,oper,function() {
                    window.location = recordUnit.targetLocation;
                });

            //2. 页面跳转后执行记录
            } else {
                self._chunk(oper,self._executiveUnit,oper.record[0].timeSpan);
            }
        });


        // 执行多条记录的code
        //_md_storage.get(_con_storage.storage,function(result) {
        //
        //    var operList = result[_con_storage.storage].data.operList;
        //
        //    if(operList.length) {
        //
        //        if(!refresh) {                           //第一次执行
        //            self._chunk(operList,self._executiveUint,0);
        //        } else {                                //页面刷新后执行
        //            self._chunk(operList,self._executiveUint,operList[0].record[0].timeSpan);
        //        }
        //    }
        //
        //});
    };


    /**
     * 执行的推动器
     */
    Oper.prototype._chunk = function(oper,cb,time) {

        var self = this;

        _timeId = setTimeout(function() {

            var callee = arguments.callee
                ,  recordUnit = oper.record.shift();

            cb(recordUnit);

            //1. 记录没有执行完毕
            if(oper.record.length > 0 ) {
                self._updateOper(true,oper,function() {
                    _timeId = setTimeout(callee,oper.record[0].timeSpan);
                });

            //2. 记录执行完毕
            } else {

                //2.1 清空执行记录
                self._updateOper(true,[],function() {
                    //2.2 发送消息给background.js继续获取执行记录进行执行
                    //需要注意这里不反馈,反馈给content_script_md.js的[执行记录]进行处理
                    _md_msg.send(_con_msg.type.extensions,{
                        status: _con_msg.status.doneOper,
                        origin: _con_msg.sender.content_script
                    },function(res){

                    });
                });
            }
        },time);


        //_timeId = setTimeout(function() {
        //
        //    var record = operList[0].record
        //        , recordUint = record.shift();
        //
        //    cb(recordUint);                                         //这里没有考虑页面跳转的情况
        //
        //    if(record.length > 0 ) {                                //当前这条记录没有执行完毕
        //        self._updateOperList(operList);
        //        _timeId = setTimeout(arguments.callee,record[0].timeSpan);
        //
        //    } else {
        //        operList.shift();                                   //这条数据执行完毕,需要删除整条数据,因此recordList.length会减1
        //        if(operList.length) {                               //如果operList还有数据需要执行
        //            self._updateOperList(operList);
        //            _timeId = setTimeout(arguments.callee,0);       //执行新的一条记录
        //        } else {                                            //所有记录执行完毕
        //            //self._updateOperingStatus(false);               //更新正在执行的状态标识
        //            //self._updateOperList([]);                       //清空执行列表
        //            self._clearStorage(false,[]);
        //            _md_msg.send(_con_msg.type.extensions,{         //单向发送,不需要反馈
        //                status: _con_msg.status.doneExecutive,
        //                origin: _con_msg.sender.content_script
        //            },function() {
        //
        //            })
        //        }
        //    }
        //
        //},time);


    };


    /**
     * 更新执行进度
     */

    Oper.prototype._updateOper = function(status,oper,cb) {
        _md_storage.set(_con_storage.type.some,       //更新当期执行的这条数据,因为跳转的时候需要保持数据的更新
            [
                _con_storage.type.status,
                _con_storage.key.opering,
                _con_storage.type.data,
                _con_storage.key.oper
            ],
            [
                status,
                oper
            ],
            cb
        );
    };


    /**
     * 执行单条操作
     */
    Oper.prototype._executiveUnit = function(recordUint) {


        var _con = {}
            , $element;

        _con.nodeType = {           //标签类型
            body        : 'body',
            input       : 'input',
            button      : 'button',
            a           : 'a',
            textarea    : 'textarea'
        };

        _con.eventType = {          //事件类型
            click       : 'click',
            keydown     : 'keydown'
        };

        _con.keyValue = {           //键值
            backSpace   : 'Backspace',
            capsLock    : 'CapsLock',
            shift       : 'Shift',
            arrowDown   : 'ArrowDown',
            arrowUp     : 'ArrowUp',
            arrowLeft   : 'ArrowLeft',
            arrowRight  : 'ArrowRight',
            tab         : 'Tab'
        };




        switch(recordUint.eventType) {

            //1.鼠标点击事件
            case _con.eventType.click:

                recordUint.targetClass = '.' + recordUint.targetClass.split(' ').join('.');


                //1.1 如果id和class存在
                if(recordUint.targetId || (recordUint.targetClass && recordUint.targetClass !== '.')) {
                    $element = recordUint.targetId ?  $('#' + recordUint.targetId) : $(recordUint.targetClass);

                //1.2 如果a标签id和class都不存在
                } else if(recordUint.targetType == _con.nodeType.a) {
                    $element = document.getElementsByTagName(_con.nodeType.a);
                }


                //1.3 判断记录的元素类型
                switch(recordUint.targetType) {
                    case _con.nodeType.button:

                        if($element.length == 1) {      //如果是id,肯定length=1,class也有可能唯一
                            $element.click();
                        } else {                        //多个同样的class

                        }
                        break;

                    case _con.nodeType.a:

                        if($element.length == 1) {      //a标签使用jQuery的点击事件是不会跳转的
                            $element[0].click();        //使用原生DOM的点击事件
                        } else {                        //多个同样的class

                            $.each($element,function(index,e) {
                                if(e.nodeName.toLocaleLowerCase() == _con.nodeType.a
                                    && e.href && e.href == recordUint.targetHref
                                    && e.textContent == recordUint.targetText     //需要注意可能存在多个a标签是href = "#" 的情况
                                ) {
                                    e.click();
                                    return false;       //终止遍历,注意不是break
                                }
                            })
                        }
                        break;

                    default:
                        break;
                }
                break;


            /* 键盘按键事件 */
            case _con.eventType.keydown:

                $element = $('#' + recordUint.targetId);

                switch(recordUint.targetType) {
                    case _con.nodeType.input:
                    case _con.nodeType.textarea:

                        //删除数据,遇到了Backspace键
                        if(recordUint.deleteValue) {
                            //var index = $element.val().indexOf(item.deleteValue);
                            //index = $element.val().substring(index,index+1);
                            //$element.val($element.val().replace(index,''));
                            var str = $element.val().substring(0,$element.val().length-1);
                            $element.val(str);

                        //增加数据
                        } else {
                            $element.val(($element.val() + recordUint.keyValue));
                        }
                        break;

                    default:
                        break;
                }

                break;

            default:
                break;
        }
    };



    return new Oper();
}();