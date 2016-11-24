/**
 * notify 飘窗提醒
 *
 * @author:   波比(｡･∀･)ﾉﾞ
 * @date:     2016-11-24  下午4:57
 */

var notify, timer;

var buildNotify = function(msg){
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
};


var buildAudio = function(){
	var audio = document.createElement('audio');
	audio.src = window.__YSFSDKADR__ + "/prd/res/audio/message.mp3?26b875bad3e46bf6661b16a5d0080870";

	return function(){
		audio.play();
	}
};


