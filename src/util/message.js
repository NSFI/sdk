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
