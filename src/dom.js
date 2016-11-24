/**
 * DOM 操作
 *
 * @author:   波比(｡･∀･)ﾉﾞ
 * @date:     2016-10-25  下午8:29
 */


var addEvent = function(target, eventType, callback) {
	if (target.addEventListener) {
		target.addEventListener(eventType, callback, false);
	} else if (target.attachEvent) {
		target.attachEvent('on' + eventType, callback);
	}
}

var isMobilePlatform = function(){
	if (/(iPhone|iPod|iOS|Android)/i.test(navigator.userAgent)) {
		return true;
	}
	return false;
}