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
};

var isMobilePlatform = function () {
	if (/(iPhone|iPod|iOS|Android)/i.test(navigator.userAgent)) {
		return true;
	}
	return false;
};


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

// 构建父容器
var buildHolder = function(cache,options){
	var holder = document.createElement('div'),
		customStr = "YSF-CUSTOM-ENTRY-" + window.__YSFTHEMELAYEROUT__;

	if(window.__YSFTHEMELAYEROUT__){
		holder.className = 'layer-'+window.__YSFTHEMELAYEROUT__;
	}

	holder.setAttribute('id','YSF-BTN-HOLDER');

	if(cache['hidden']==1) holder.style.display = 'none';

	document.body.appendChild(holder);

	holder.onclick = function () {
		ysf.open();
	};

	holder.innerHTML = '<div id="'+customStr+'"><img src="' + options.src + '"/></div>';
	return holder
};

// 构建circle子节点
var buildCircle = function(parent){
	var circle = document.createElement('span');
	circle.setAttribute('id', 'YSF-BTN-CIRCLE');
	parent.appendChild(circle)
};

// 构建Bubble子节点
var buildBubble = function(parent){
	var container = document.createElement('div'),
		content = document.createElement('div'),
		arrow = document.createElement('span'),
		close = document.createElement('span');

	container.setAttribute('id', 'YSF-BTN-BUBBLE');
	content.setAttribute('id', 'YSF-BTN-CONTENT');
	arrow.setAttribute('id', 'YSF-BTN-ARROW');
	close.setAttribute('id', 'YSF-BTN-CLOSE');

	close.onclick = function(event){
		event.stopPropagation();
		event.preventDefault();
		ysf.NotifyMsgAndBubble({category : 'clearCircle'});
	};

	parent.appendChild(container);
	container.appendChild(content);
	container.appendChild(arrow);
	container.appendChild(close);
};


module.exports = {
	addEvent: addEvent,
	isMobilePlatform: isMobilePlatform,
	buildIframe : buildIframe,
	buildCircle : buildCircle,
	buildBubble : buildBubble,
	buildHolder : buildHolder
}
