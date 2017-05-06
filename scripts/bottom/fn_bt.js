
/**
 * 底层工具方法
 */
if(g) { //g是命名空间
    g.fn = {}
} else {
    var g = {};
    g.fn = {};
}



/**
 * 简化chrome存储API
 */
g.fn.storage = {
    /*获取存储信息*/
    get:function(key,cb) {
        chrome.storage.local.get(key,function(result) {
            cb(result);
        });
    },

    /*设置存储信息*/
    set:function(obj,cb) {
        chrome.storage.local.set(obj,cb);
    }
};

/**
 * 简化chrome通信API
 */
g.fn.msg = {
    /*发送信息*/
    send: function(req,cb) {
        chrome.extension.sendMessage(req,function(res) {
            cb(res);
        })
    },

    /*监听信息*/
    receive: function(cb) {
        chrome.extension.onMessage.addListener(function(req, sender, res){
            cb(req, sender, res);
        });
    },

    /*通过tab发送信息*/
    sendTab: function(req,cb) {
        // 1.找到当前窗口的当前tab页
        chrome.tabs.query({currentWindow: true, active: true} , function(tabArr) {
            // 2.通过tab发送信息
            if(tabArr[0] && tabArr[0].id) {
                chrome.tabs.sendMessage(tabArr[0].id, req, function(res) {
                    cb(res);
                });
            // 3.找不到tab页
            } else {
                cb(false);
            }
        });
    }
};


