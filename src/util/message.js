/**
 * message 消息通信集合
 *
 * @author:   波比(｡･∀･)ﾉﾞ
 * @date:     2016-10-25  下午8:29
 */

/**
 * 向浮层模式窗口发送消息
 *
 * @param {String} pkg				- 发送指令
 * @param {Object} data				- 发送数据
 */
var sendChatMsg = function(pkg, data) {
    chatProxy.contentWindow.postMessage('' + pkg + ':' + JSON.stringify(data), '*');
};

/**
 * 拉取历史访客信息
 *
 */
var visit = function() {
    if (!cache.appKey) {
        return;
    }
    var image = new Image(),
        query = serialize({
            uri: location.href,
            title: document.title,
            appkey: cache.appKey
        });
    // get device id from cookie X-[APPKEY]-DEVICE
    image.src = ysf.DOMAIN + 'webapi/user/accesshistory.action?' + query;
};

/**
 * 同步用户信息CRM信息
 *
 */
var syncProfile = function() {
    sendMsg('KEY:' + cache.appKey || '');
    var user = {
        title: document.title || ''
    };
    var findIndex = function(list, key) {
        var flag = false;
        list.forEach(function(itm) {
            if (itm.key == key) flag = true;
        })

        return flag;
    };
    each({
        name: '',
        email: '',
        mobile: '',
        avatar: '',
        profile: 'data'
    }, function(k, v) {
        var it = cache[v] || cache[k];
        if (it != null) {
            user[k] = it
        }
    });

    each({
        avatar: '头像'
    }, function(k, v) {
        try {
            if (!user[k]) return;

            var profile = JSON.parse(user['profile'] || '[]'),
                len = profile.length;

            if (!findIndex(profile, k)) {
                profile.push({
                    key: k,
                    value: user[k],
                    index: len,
                    label: v
                });
                user['profile'] = JSON.stringify(profile)
            }
        } catch (ex) {
            console.error('parse profile error: [crm]' + k, ex);
        }
    })


    user.referrer = location.href;
    user.uid = cache.uid || '';
    sendMsg('USR:' + serialize(user));
};

/**
 * 同步自定商品信息到CRM信息
 *
 * @param data
 */
var syncCustomProfile = function(data) {
    sendMsg('PRODUCT:' + serialize(data));
};

/**
 * 发送消息到iframe
 *
 * @param msg
 */
var sendMsg = function(msg) {
    try {
        proxy.contentWindow.postMessage(msg, '*');
    } catch (ex) {
        // ignore
    }
};

/**
 * 添加消息提醒锁, 300毫秒内认为是无效的
 *
 */
var msgNotifyLock = (function() {
    var timer = null;
    return function(data, callback) {
        var key = ('YSFMSG-' + cache['appKey'] + '-' + data.id).toUpperCase();
        if (timer) {
            clearTimeout(timer);
        }

        setTimeout(function() {
            if (window.localStorage.getItem(key) == null) {
                window.localStorage.setItem(key, 1);
                callback(true);
            };

            callback(false);
        }, cache['dvcTimer'] * 100);
    }
})();

/**
 * 接受消息
 * @param event
 */
var receiveMsg = function(event) {
    // check origin
    if (event.origin != ysf.ROOT) {
        return;
    }
    // do command
    var arr = (event.data || '').split(':'),
        type = arr.shift();

    if (type == 'pkg') {
        receivePkg(JSON.parse(arr.join(':')));
        return;
    };


    var func = cmap[(type || '').toLowerCase()];
    if (!!func) {
        func(arr.join(':'));
    }
};

/**
 * 执行方式接受消息
 * 
 * @param {Object} data 			- 接受消息
 * @param {String} data.type		- 消息类型
 */
var receivePkg = function(data) {
    var fmap = {
        notify: function(data) {
            var dvc = 'YSF-' + device() + '-MSGNUMBERS';


            msgNotifyLock(data, function(flag) {
                var num = Number(window.localStorage.getItem(dvc) || 0),
                    circleNum = flag ? (++num) : num;

                // 缓存 未读消息 及 未读数量
                cache['notifyContent'] = data;
                cache['notifyNumber'] = circleNum;

                if (flag) ysf._unread(ysf.getUnreadMsg());

                ysf.NotifyMsgAndBubble({
                    category: 'notifyCircle',
                    data: {
                        circleNum: circleNum,
                        notifyCnt: data.content,
                        type: data.type
                    }
                })
            });

        },
        winfocus: function(msg) {
            util.notification(msg);
        },
        closeIframe: function(event) {
            var layerNode = document.getElementById('YSF-PANEL-CORPINFO') || document.getElementById('YSF-PANEL-INFO'),
                btnNode = document.getElementById('YSF-BTN-HOLDER');
            layerNode.className = 'ysf-chat-layer';
            layerNode.setAttribute('data-switch', 0);
            try {
                sendChatMsg('status', { 'layerOpen': 0 });
            } catch (ex) {}

            if (cache['hidden'] == 0) btnNode.style.display = 'block';

        },
        leaveOk: function(event) {
            if (util.resetTimer) clearTimeout(util.resetTimer);
            util.resetTimer = setTimeout(function() {
                reset();
            }, 1000);
        },
        pushMsg: function(event) {
            if (event.data.sdkAppend) {
                CircleNumberFlag = CircleNumberFlag + 1;
                msgSessionIds.push(event.data.msgSessionId);
                ysf.NotifyMsgAndBubble({
                    category: 'notifyCircle',
                    data: {
                        circleNum: CircleNumberFlag,
                        notifyCnt: event.data.content,
                        type: 'text' // 消息类型 text
                    }
                })
            }
        }
    };

    var func = fmap[data.category];
    if (!!func) {
        func(data)
    }

};

module.exports = {
	sendChatMsg: sendChatMsg,
	visit: visit,
	syncProfile: syncProfile,
	syncCustomProfile: syncCustomProfile,
	sendMsg: sendMsg,
	msgNotifyLock: msgNotifyLock,
	receiveMsg: receiveMsg,
	receivePkg: receivePkg
}
