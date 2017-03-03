/**
 * util 方法集合
 *
 * @author:   波比(｡･∀･)ﾉﾞ
 * @date:     2016-11-24  下午4:50
 */

var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'; // 随机数种子

/**
 * mergeUrl
 * @param url
 * @param options
 * @returns {string}
 */
var mergeUrl = function(url, options){
	var arr = url.split('?'),
		furl= arr.shift(),
		origin = query2Object(arr.shift() || '', '&');
	// merge data
	for(var key in options){
		origin[key] = options[key]
	}

	// sarialize
	for(var key in origin){
		arr.push(key + '=' + (origin[key] || ''))
	}

	return furl + '?' + arr.join('&');
}

/**
 * query2Object
 * @param str
 * @param reg
 * @returns {{}}
 */
var query2Object = function(str, reg){
	var r = str.split(reg),
		c = {};
	for(var i=0;i<r.length;i++){
		var itm = r[i],
			tmp = (itm || '').split('='),
			key = tmp.shift();
		if(!key) continue;
		c[decodeURIComponent(key)] = decodeURIComponent(tmp.join('='));
	}

	return c;
}

/**
 * typeof 数据类型判断
 * @param obj
 * @private
 */
var _typeof =  function(obj) {
	({}).toString.call(obj).toLowerCase().slice(8,-1)
};

/**
 * findLocalItems
 * @param query
 * @param noJson
 * @returns {Array}
 */
var findLocalItems = function(query, noJson){
	var i, results = [], value;
	for (i in localStorage) {
		if (i.match(query) || (!query && typeof i === 'string')) {
			value = !noJson ? localStorage.getItem(i) : JSON.parse(localStorage.getItem(i));
			results.push({key:i,val:value});
		}
	}
	return results;
};

/**
 * clearLocalItems
 * @param list
 */
var clearLocalItems =  function(list){
	for(var i=0;i<list.length;i++){
		window.localStorage.removeItem(list[i].key);
	}
};

/**
 * random
 *
 * @returns {string}
 */
var random = function(){
	var ret = [];
	for (var i = 0, n; i < 20; ++i) {
		n = Math.floor(Math.random() * chars.length);
		ret.push(chars.charAt(n));
	}
	return ret.join('').toLowerCase();
}

/**
 * each
 * @param o
 * @param func
 */
var each = function (o, func) {
	if (!o || !func) return;
	for (var x in o) {
		if (o.hasOwnProperty(x)) {
			func.call(null, x, o[x]);
		}
	}
};

/**
 * merge
 * @param o
 * @return {void}
 * @description 合并数据
 */
var merge = function (o) {
    each(o, function (k, v) {
        cache[k] = v;
    });
};

/**
 * serialize
 * @param o
 * @return {string}
 * @description 序列化对象
 */
var serialize = function (o) {
	var ret = [];
	each(o, function (k, v) {
		ret.push(
			encodeURIComponent(k) + '=' +
			encodeURIComponent(v)
		);
	});
	return ret.join('&');
};

/**
 * notification
 *
 * @returns {void}
 */

var notification = function(){
    var notify, timer;
    return function(msg){
        if(notify){
            clearTimeout(timer);
            notify.close();
        }
        if(window.Notification && window.Notification.permission !== "granted"){
            Notification.requestPermission();
        }

        if (window.Notification && window.Notification.permission != "denied") {
            notify = new Notification(msg.notify, {
                tag: msg.tag,
                body : msg.body,
                icon : window.__YSFSDKADR__ + msg.icon
            });
            util.playAudio();
            notify.onclick = function(){
                notify&&notify.close();
                window.focus();
                ysf.openLayer();
                ysf.NotifyMsgAndBubble({category : 'clearCircle'});

            };

            // close notify
            timer = window.setTimeout(
                function(){
                    notify.close();
                },20000
            );
        }
    }
};

/**
 * playAudio
 *
 * @returns {void}
 */
var playAudio = function(){
    var audio = document.createElement('audio');
    audio.src = window.__YSFSDKADR__ + "/prd/res/audio/message.mp3?26b875bad3e46bf6661b16a5d0080870";

    return function(){
        audio.play();
    }
};

/**
 * rand
 *
 * @returns {string}
 */
// 为没有uid表示的访客生成随机身份标识
var rand = function (uid) {
    if (!!uid) {
        return 'ysf-' + uid;
    }
    var ret = [];
    for (var i = 0, n; i < 20; ++i) {
        n = Math.floor(Math.random() * chars.length);
        ret.push(chars.charAt(n));
    }
    return ret.join('').toLowerCase();
};

/**
 * migrate
 *
 * @returns {void}
 */
var migrate = function () {
    // migrate uid
    var uid;
    if (/YSF_UID\s*=\s*(.*?)(?=;|$)/i.test(document.cookie)) {
        uid = RegExp.$1;
    }
    if (!!uid) {
        localStorage.setItem('YSF_UID', uid);
    }
    // migrate last uid
    var uid;
    if (/YSF_LAST\s*=\s*(.*?)(?=;|$)/i.test(document.cookie)) {
        uid = RegExp.$1;
    }
    if (!!uid) {
        localStorage.setItem('YSF_LAST', uid);
    }
    // remove cookie
    var expires = (new Date(1990, 11, 30)).toGMTString();
    document.cookie = 'YSF_UID=;path=/;expires=' + expires;
    document.cookie = 'YSF_LAST=;path=/;expires=' + expires;
};

/**
 * refresh
 * @param {uid}
 * @returns {void}
 * @description 同步 YSF-[appkey]-UID 信息,访客端轮询改动
 */
var refresh = function (uid) {
    uid = uid || '';
    var dvc = device(),
        lst = lastUID();
    // check device

    // 1. uid != '' && lst == '' anonymous -> realname no update;
    // 2. uid == '' && lst != '' realname -> anonymouse update
    // re-device if
    // - first time
    // - user switch
    if(!dvc || (uid == '' && lst != '')) {
        // dvc change then clear localStorage
        // dvc = rand(uid);
        dvc = uid || dvc || rand(uid);
        sendMsg('synckey:'+dvc);

    }

    cache.device = dvc;
    localStorage.setItem('YSF-' + cache['appKey'].toUpperCase()+'-UID', uid || dvc);
    localStorage.setItem('YSF-' + cache['appKey'].toUpperCase()+ '-LAST', uid || '');
};

/**
 * device
 * @param {void}
 * @returns {string}
 * @description  从LocalStorage中获取设备Id
 */
var device = function () {
    return localStorage.getItem('YSF-' + cache['appKey'].toUpperCase()+'-UID') || '';
};

/**
 * lastUID
 * @param {void}
 * @returns {string}
 * @description 从LocalStorage中获取 lastUId
 */
var lastUID = function () {
    return localStorage.getItem('YSF-' + cache['appKey'].toUpperCase()+ '-LAST') || '';
};

/**
 * updateDevice
 * @param {void}
 * @returns {void}
 * @description 更新设备id
 */
var updateDevice = function(){
    cache.device = rand();
    localStorage.setItem('YSF-' + cache['appKey'].toUpperCase()+'-UID', cache.device);
    sendMsg('synckey:'+ cache.device);
};



module.exports = {
	mergeUrl : mergeUrl,
	query2Object : query2Object,
	typeof : _typeof,
	findLocalItems : findLocalItems,
	clearLocalItems : clearLocalItems,
	random : random,
	each : each,
	serialize : serialize,
    notification : notification,
    playAudio : playAudio,
    rand : rand,
    migrate : migrate,
    merge : merge,
    refresh : refresh,
    device : device,
    lastUID : lastUID,
    updateDevice : updateDevice
}