

/**
 * 通信中间层
 */

g.msg = (function() {

    var _con_msg = g.con.msg
        , _fn_msg = g.fn.msg;

    return {

        /**
         * 发送信息
         */
        send: function(type,req,cb) {
            //通过extension发送信息
            if(type === _con_msg.type.extensions) {
                _fn_msg.send(req,cb);
            //通过tabs发送信息
            } else if (type === _con_msg.type.tabs) {
                _fn_msg.sendTab(req,cb);
            }
        },

        /**
         * 监听消息
         */
        receive: function(cb) {
            _fn_msg.receive(cb);
        }
    }
})();


