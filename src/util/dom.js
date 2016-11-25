/**
 * DOM 操作
 *
 * @author:   波比(｡･∀･)ﾉﾞ
 * @date:     2016-10-25  下午8:29
 */

var util = require('./util');

var addEvent = function (target, eventType, callback) {
	if (target.addEventListener) {
		target.addEventListener(eventType, callback, false);
	} else if (target.attachEvent) {
		target.attachEvent('on' + eventType, callback);
	}
}

var isMobilePlatform = function () {
	if (/(iPhone|iPod|iOS|Android)/i.test(navigator.userAgent)) {
		return true;
	}
	return false;
}


var buildIframe = function (src) {
	var body = document.createElement('div'),
		css = body.style,
		ret = {
			top: 0,
			left: 0,
			visibility: 'hidden',
			position: 'absolute',
			width: '1px',
			height: '1px'
		};


	util.each(ret, function (k, v) {
		css[k] = v;
	});

	body.innerHTML = '<iframe style="height:0px; width:0px;" src="' + src + '?' +(+new Date) + '"></iframe>';

	return body.getElementsByTagName('iframe')[0];
};


module.exports = {
	addEvent: addEvent,
	isMobilePlatform: isMobilePlatform,
	buildIframe : buildIframe
}