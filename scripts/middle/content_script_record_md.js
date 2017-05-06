

/**
 * 记录操作中间层
 */


/**
 * 重要说明: 后期需要继续优化存储,在页面离开之前存储值,页面刷新后重新获取记录值进行记录操作! 这里暂时没有这么做(记录一个存储一个不太好)
 */

g.record = function() {

    /**
     * 私有变量
     */
    var _con = {}
        , _md_storage = g.storage
        , _con_storage = g.con.storage;

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


    function Record() {}


    /**
     * 启动记录操作,添加监听操作事件
     */
    Record.prototype.start = function() {
        this._onKeydown();      //监听按键事件
        this._onClick();        //监听点击事件
    };

    /**
     * 停止记录操作,取消监听操作事件
     */
    Record.prototype.stop = function() {
        $(document).off();
    };

    /**
     * 鼠标点击事件监听
     */
    Record.prototype._onClick = function() {
        var self = this;

        //1.事件委托
        $(document).click(function(e){

            var _e_target = e.target
                , _con_nodeType = _con.nodeType;

            var _target = {
                eventType: e.type,
                targetId: _e_target.id,
                targetClass: _e_target.className,
                targetType: _e_target.nodeName.toLocaleLowerCase(),
                timeSpan: Date.now()
            };

            switch(e.target.nodeName.toLocaleLowerCase()) {
                //1.1 忽略body元素的点击操作
                case _con_nodeType.body:
                    break;
                //1.2 记录input元素和textarea元素的点击操作
                case _con_nodeType.input:
                case _con_nodeType.textarea:
                    _target.targetName =  _e_target.name;
                    self._saveRecord(_target);
                    break;

                //1.3 记录button元素的点击操作
                case _con_nodeType.button:
                    _target.targetOnclick =  _e_target.attributes.onclick && _e_target.attributes.onclick.value;
                    self._saveRecord(_target);
                    break;

                //1.4 记录a元素的点击操作
                case _con_nodeType.a:
                    _target.targetHref = _e_target.href;
                    _target.targetText =  _e_target.textContent;
                    _target.targetOnclick =  _e_target.attributes.onclick && _e_target.attributes.onclick.value;
                    self._saveRecord(_target);
                    break;

                default:
                    break;
            }
        })
    };


    /**
     * 键盘输入事件监听
     */
    Record.prototype._onKeydown = function() {

        var self = this
            , _con_nodeType = _con.nodeType;

        //1.事件委托
        $(document).keydown(function(e) {
            switch(e.target.nodeName.toLocaleLowerCase()) {
                //1.1 忽略body元素的keydown操作记录
                case _con_nodeType.body:
                    break;

                //1.2 记录input元素和textarea的写入操作
                case _con_nodeType.input:
                case _con_nodeType.textarea:
                    self._onKeydownProcess(e);
                    break;

                default:
                    break;

            }
        })
    };


    /**
     * 键盘输入事件的数据处理
     */
    Record.prototype._onKeydownProcess = function(e) {

        var _con_keyValue = _con.keyValue
            , _e_target = e.target;

        switch(e.key) {

            //1.回退键Backspace处理
            case _con_keyValue.backSpace:
                this._deleteRecord(e);                  //重要说明:只能使用Backspace一个个删除,不能选中删除,也不能使用方向键回退指定位置删除
                break;

            //2.特殊键处理
            case _con_keyValue.capsLock:
            case _con_keyValue.shift:
            case _con_keyValue.tab:
            case _con_keyValue.arrowDown:
            case _con_keyValue.arrowLeft:
            case _con_keyValue.arrowRight:
            case _con_keyValue.arrowUp:
                break;

            //3.普通需要记录的键处理
            default:
                this._saveRecord({
                    eventType: e.type,
                    targetName: _e_target.name,
                    targetId: _e_target.id,              //重要说明:假设input和textarea都具有id
                    targetClass: _e_target.className,
                    targetType: _e_target.nodeName.toLocaleLowerCase(),
                    keyValue: e.key,
                    delete: false,
                    timeSpan: Date.now()
                });

                break;
        }
    };


    /**
     * 使用Backspace时需要处理需要删除的键
     */
    Record.prototype._deleteRecord = function(e) {

        var _e_target = e.target;


        _md_storage.get(_con_storage.storage,function(result) {

            var storage = result[_con_storage.storage];
            var recordArr = storage.data.record;

            //1.更新需要删除的数据
            for(var len = recordArr.length- 1,i=len; i > 0; i--) {
                if(recordArr[i].eventType === _con.eventType.keydown
                    && recordArr[i].targetClass === _e_target.className
                    && recordArr[i].targetId === _e_target.id    //重要说明:假设input和textarea都具有id
                ) {

                    //需要删除的键不可能是Backspace,也不可能是已经标记为需要删除的键
                    if(recordArr[i].keyValue !== _con.keyValue.backSpace && !recordArr[i].delete) {
                        recordArr[i].delete = true;
                        recordArr.push({
                            eventType: e.type,
                            targetName: _e_target.name,
                            targetId: _e_target.id,
                            targetClass: _e_target.className,
                            targetType: _e_target.nodeName.toLocaleLowerCase(),
                            keyValue: e.key,
                            deleteValue: recordArr[i].keyValue,
                            timeSpan: Date.now() - storage.data.time
                        });

                        break;
                    }
                }
            }

            storage.data.time = Date.now();  //更新时间

            //2.保存操作
            _md_storage.set(_con_storage.type.all,null,storage);
            console.log(storage);
        })
    };


    /**
     * 保存单次记录操作
     */
    Record.prototype._saveRecord = function(record) {
        _md_storage.get(_con_storage.storage,function(result) {
            var storage = result[_con_storage.storage];
            record.timeSpan =  Date.now() - storage.data.time;
            storage.data.record.push(record);   //更新记录
            storage.data.time = Date.now();     //更新时间
            _md_storage.set(_con_storage.type.all,null,storage);
            console.log(storage);
        })
    };


    return new Record();
}();