/**
 * 第三方SDK实现文件
 *
 * @author:   	genify && 波比(｡･∀･)ﾉﾞ
 * @date:     	2015-10-16
 * @update:     2016-09-16  下午1:06
 */
(function () {
	if (!window.localStorage || !window.postMessage) {
		throw 'not support service';
		return;
	}

	/**
	 * 共用函数集合
	 *
	 * @param {Object} util							- 函数集合
	 * @param {Function} util.isMobilePlatform		- 检测是否是移动端平台
	 * @param {Function} util.createAjax 			- Ajax兼容性处理
	 * @param {Function} util.ajax					- 创建Ajax请求
	 * @param {Function} util.findLocalItems		- 正则匹配LocalStorage项
	 * @param {Function} util.clearLocalItems		- 清除localStorage列表
	 * @param {Function} util.addEvent				- 增加时间绑定
	 * @param {Function} util.isFunction			- 是否是函数
	 * @param {Function} util.isObject				- 是否是对象
	 * @param {Function} util.notification			- 飘窗处理
	 * @param {Function} util.playAudio				- 播放飘窗声音
	 */
	var util = {
		isMobilePlatform : function(){
			if (/(iPhone|iPod|iOS|Android)/i.test(navigator.userAgent)) {
				return true;
			}
			return false;
		},
		createAjax : function(){
			var xmlDom = null;
			var msxml = [
				'Msxml2.XMLHTTP.6.0',
				'Msxml2.XMLHTTP.3.0',
				'Msxml2.XMLHTTP.4.0',
				'Msxml2.XMLHTTP.5.0',
				'MSXML2.XMLHTTP',
				'Microsoft.XMLHTTP'
			];

			if(window.XMLHttpRequest){
				xmlDom = new XMLHttpRequest();
				if('withCredentials' in xmlDom){
					return xmlDom;
				}
			}


			if(window.xDomainRequest){
				xmlDom = new Window.xDomainRequest();
			}

			return xmlDom;
		},
		ajax : function (conf) {
			var type = conf.type || 'get',
				url = conf.url,
				data = conf.data,
				success = conf.success,
				error = conf.error;

			var xhr = util.createAjax();

			if(!xhr) {error();return;}

			try{ xhr.open(type, url); }catch(ex){ error();
				return;
			}

			// 监听状态改变
			xhr.onreadystatechange = function () {
				if (xhr.readyState == 4) {
					if (xhr.status === 200) {
						success(eval("(" + xhr.responseText + ")"));
					} else {
						error()
					}
				}
			};

			// 请求类型, 仅支持GET和POST两种方式

			if (type.toUpperCase() == "GET" ) {
				xhr.send(null);
			}else{
				xhr.setRequestHeader("content-type", "application/x-www-form-urlencoded");
				xhr.send(data);
			}

		},
		findLocalItems: function(query, noJson){
			var i, results = [], value;
			for (i in localStorage) {
					if (i.match(query) || (!query && typeof i === 'string')) {
						value = !noJson ? localStorage.getItem(i) : JSON.parse(localStorage.getItem(i));
						results.push({key:i,val:value});
					}
			}
			return results;
		},
		clearLocalItems : function(list){
			for(var i=0;i<list.length;i++){
				window.localStorage.removeItem(list[i].key);
			}
		},
		addEvent: function(target, eventType, callback) {
			if (target.addEventListener) {
				target.addEventListener(eventType, callback, false);
			} else if (target.attachEvent) {
				target.attachEvent('on' + eventType, callback);
			}
		},
		mergeUrl: function(url, options){
			var arr = url.split('?'),
				furl= arr.shift(),
				origin = util.query2Object(arr.shift() || '', '&');
			// merge data
			for(var key in options){
				origin[key] = options[key]
			}

			// sarialize
			for(var key in origin){
				arr.push(key + '=' + (origin[key] || ''))
			}

			return furl + '?' + arr.join('&');
		},
		query2Object : function(str, reg){
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
		},
		isObject: function(obj) {
			return ({}).toString.call(obj).toLowerCase() === '[object object]';
		},
		isFunction : function(obj){
			return ({}).toString.call(obj).toLowerCase() === '[object function]';
		},
		"notification" : (function(){
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
		})(),
		playAudio : (function(){
			var audio = document.createElement('audio');
			audio.src = window.__YSFSDKADR__ + "/prd/res/audio/message.mp3?26b875bad3e46bf6661b16a5d0080870";

			return function(){
				audio.play();
			}
		})()
	};

	// namespace for ysf
	window.ysf = window.ysf || {};
	ysf.ROOT = ysf.ROOT || '';
	ysf.VERSION = '2.8.0'; 				// 版本信息

	var winParam = {}; 					// 窗口信息参数
	var cache = {}; 					// 配置信息缓存
	var proxy; 	   						// iframe 代理
	var chatProxy; 						// 浮层模式下, 聊天窗口代理
	var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'; // 随机数种子
	var firstBtnClick = true;

	var CircleNumberFlag = 0;
	var msgSessionIds = [];


	var each = function (o, func) {
		if (!o || !func) return;
		for (var x in o) {
			if (o.hasOwnProperty(x)) {
				func.call(null, x, o[x]);
			}
		}
	};

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

	// 指令映射
	var cmap = {
		ack: function (value) {
			cache.timestamp = parseInt(value, 10);
			if (!!cache.onackdone) {
				cache.onackdone();
				delete cache.onackdone;
			}
		},
		rdy: function (value) {
			syncProfile();
		}
	};

	var wrap = function () {
		var body = document.createElement('div'),
			css = body.style,
			ret = {
				top: 0, left: 0,
				visibility: 'hidden',
				position: 'absolute',
				width: '1px', height: '1px'
			};
		each(ret, function (k, v) {
			css[k] = v;
		});
		document.body.appendChild(body);
		return body;
	};

	/**
	 * 合并数据
	 * @param {Object} o  			- 数据对象
	 */
	var merge = function (o) {
		each(o, function (k, v) {
			cache[k] = v;
		});
	};

	/**
	 * 同步 YSF-[appkey]-UID 信息
	 * 访客端轮询改动
	 * @param uid
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
	 * 序列化对象
	 *
	 * @param 	{Object} o				- 序列化对象
	 * @returns {string}
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
	 * 从LocalStorage中获取设备Id
	 *
	 * @returns {string}
	 */
	var device = function () {
		return localStorage.getItem('YSF-' + cache['appKey'].toUpperCase()+'-UID') || '';
	};

	/**
	 * 从LocalStorage中获取 lastUId
	 *
	 * @returns {string}
	 */
	var lastUID = function () {
		return localStorage.getItem('YSF-' + cache['appKey'].toUpperCase()+ '-LAST') || '';
	};

	/**
	 * 更新设备id
	 *
	 * @param {String} uid			- 用户Id
	 */
	var updateDevice = function(){
		cache.device = rand();
		localStorage.setItem('YSF-' + cache['appKey'].toUpperCase()+'-UID', cache.device);
		sendMsg('synckey:'+ cache.device);
	};

	/**
	 * 向浮层模式窗口发送消息
	 *
	 * @param {String} pkg				- 发送指令
	 * @param {Object} data				- 发送数据
	 */
	var sendChatMsg = function(pkg, data){
		chatProxy.contentWindow.postMessage(''+pkg+':' + JSON.stringify(data), '*');
	};

	/**
	 * 拉取历史访客信息
	 *
	 */
	var visit = function () {
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
	var syncProfile = function () {
		sendMsg('KEY:' + cache.appKey || '');
		var user = {
			title: document.title || ''
		};
		var findIndex = function(list, key){
			var flag = false;
			list.forEach(function(itm){
				if(itm.key == key) flag = true;
			})

			return flag;
		};
		each({
			name: '',
			email: '',
			mobile: '',
			avatar : '',
			profile: 'data'
		}, function (k, v) {
			var it = cache[v] || cache[k];
			if (it != null) {
				user[k] = it
			}
		});

		each({
			avatar : '头像'
		}, function(k, v){
			try{
				if(!user[k]) return;

				var profile = JSON.parse(user['profile']||'[]'),
					len = profile.length;

				if(!findIndex(profile, k)) {
					profile.push({
						key: k,
						value: user[k],
						index: len,
						label : v
					});
					user['profile'] = JSON.stringify(profile)
				}
			}catch(ex){
				console.error('parse profile error: [crm]' + k , ex);
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
	var syncCustomProfile = function(data){
		sendMsg('PRODUCT:' + serialize(data));
	};

	/**
	 * 发送消息到iframe
	 *
	 * @param msg
	 */
	var sendMsg = function (msg) {
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
	var msgNotifyLock = (function(){
		var timer = null;
		return function(data, callback){
			var key = ('YSFMSG-' + cache['appKey'] + '-'+data.id).toUpperCase();
			if(timer){
				clearTimeout(timer);
			}

			setTimeout(function(){
				if(window.localStorage.getItem(key) == null){
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
	var receiveMsg = function (event) {
		// check origin
		if (event.origin != ysf.ROOT) {
			return;
		}
		// do command
		var arr = (event.data || '').split(':'),
			type = arr.shift();

		if( type == 'pkg'){
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
	var receivePkg = function(data){
		var fmap = {
			notify : function(data){
				var dvc = 'YSF-' + device() + '-MSGNUMBERS';


				msgNotifyLock(data, function(flag){
					var num = Number(window.localStorage.getItem(dvc) || 0),
						circleNum = flag ? (++num) : num;

					// 缓存 未读消息 及 未读数量
					cache['notifyContent'] = data;
					cache['notifyNumber'] = circleNum;

					if(flag) ysf._unread(ysf.getUnreadMsg());

					ysf.NotifyMsgAndBubble({
						category : 'notifyCircle',
						data : {
							circleNum : circleNum,
							notifyCnt : data.content,
							type : data.type
						}
					})
				});

			},
			winfocus: function(msg){
				util.notification(msg);
			},
			closeIframe : function(event){
				var layerNode = document.getElementById('YSF-PANEL-CORPINFO') || document.getElementById('YSF-PANEL-INFO'),
					btnNode  = document.getElementById('YSF-BTN-HOLDER');
				layerNode.className = 'ysf-chat-layer';
				layerNode.setAttribute('data-switch', 0);
				try{
					sendChatMsg('status', {'layerOpen' : 0});
				}catch(ex){}

				if(cache['hidden'] == 0) btnNode.style.display = 'block';

			},
			leaveOk: function(event){
				if(util.resetTimer) clearTimeout(util.resetTimer);
				util.resetTimer = setTimeout(function(){
					reset();
				}, 1000);
			},
			pushMsg: function(event){
				if(event.data.sdkAppend){
					CircleNumberFlag = CircleNumberFlag + 1;
					msgSessionIds.push(event.data.msgSessionId);
					ysf.NotifyMsgAndBubble({
						category : 'notifyCircle',
						data : {
							circleNum : CircleNumberFlag,
							notifyCnt : event.data.content,
							type : 'text'      // 消息类型 text
						}
					})
				}
			}
		};

		var func = fmap[data.category];
		if(!!func){
			func(data)
		}
		
	};


	/**
	 * 重置窗口
	 *
	 */
	var reset = function(){
		var layerNode = document.getElementById('YSF-PANEL-CORPINFO') || document.getElementById('YSF-PANEL-INFO'),
			btnNode  = document.getElementById('YSF-BTN-HOLDER');

		document.body.removeChild(layerNode);
		document.body.removeChild(btnNode);
		ysf.init(cache['imgSrc']);
		firstBtnClick = true;
	};
	/**
	 * 构建代理信息
	 *
	 */
	var buildProxy = function () {
		if (!!proxy) {
			return;
		}
		// add event listener
		if (!!window.addEventListener) {
			window.addEventListener('message', receiveMsg, !1);
		} else {
			window.attachEvent('onmessage', receiveMsg);
		}
		// build proxy
		proxy = wrap();
		proxy.innerHTML = '<iframe style="height:0px; width:0px;" src="' + ysf.RESROOT + 'res/delegate.html?' + (+new Date) + '"></iframe>';
		proxy = proxy.getElementsByTagName('IFRAME')[0];
	};

	/**
	 * 初始化窗口配置
	 *
	 * @param {Number} winType			- 1: 浮层layer 2: 弹窗 3: url
	 */
	var initWinConfig = function(){
		var screen = window.screen || {};
		var winParamUtil = {
			base : ',location=0,menubar=0,scrollbars=0,status=0,toolbar=0,resizable=0',
			winNoInfo : {
				width : 600,
				height : 630,
				top : Math.max(0, ((screen.height || 0) - 630) / 2),
				left : Math.max(0, ((screen.width || 0) - 600) / 2 ),
			},
			winHasInfo : {
				width  : 842,
				height: 632,
				top : Math.max(0, ((screen.height || 0) - 630) / 2),
				left : Math.max(0, ((screen.width || 0) - 840) / 2 ),
			},
			layerNoInfo: {
				param : ''
			},
			layerHasInfo: {
				param : ''
			}
		};

		winParamUtil.winNoInfo.param = 	'top='+ winParamUtil.winNoInfo.top + ',left='+ winParamUtil.winNoInfo.left + ',width=' + winParamUtil.winNoInfo.width  + ',height=' + winParamUtil.winNoInfo.height + winParamUtil.base;
		winParamUtil.winHasInfo.param  =  'top='+ winParamUtil.winHasInfo.top + ',left='+ winParamUtil.winHasInfo.left + ',width=' + winParamUtil.winHasInfo.width  + ',height=' + winParamUtil.winHasInfo.height + winParamUtil.base;

		// 移动端平台使用url方式
		if(util.isMobilePlatform()){
			cache['winType'] = 3;
		}

		// winType 1: 浮层layer 2: 弹窗 3: url
		switch(cache['winType']){
			case 1 :
				winParam = cache['corpInfo'] ? winParamUtil.layerHasInfo : winParamUtil.layerNoInfo;
				winParam.type = 'layer';
				break;
			case 3 :
				winParam = {type : 'url', param : ''}
				break;
			default:
				winParam = cache['corpInfo'] ? winParamUtil.winHasInfo : winParamUtil.winNoInfo;
				winParam.type = 'win';
				break;
		}

	};

	/**
	 * 创建设备时序
	 *
	 */
	var createDvcTimer = function(){
		var temp = localStorage.getItem('YSFDVC-' + cache.device),
			number = 0;

		if(temp != null) number = Number(temp)+1;

		localStorage.setItem('YSFDVC-'+cache.device, number);
		cache.dvctimer = number;
	};

	/**
	 * 构建访客相关样式
	 *
	 * @param  {String} css 				- 样式内容
	 * @return {Void}
	 */
	ysf.style = function (content) {
		if (!content) {
			return;
		}
		var head = document.getElementsByTagName('head')[0] || document.body,
			node = document.createElement('style');
		node.type = 'text/css';
		head.appendChild(node);
		if ('textContent' in node) {
			node.textContent = content;
		} else if (!!node.styleSheet) {
			node.styleSheet.cssText = content;
		}
	};

	/**
	 * 打开客服内嵌模式
	 *
	 * @param {String | Node} parent 			- 父节点元素
	 * @param {Number} status					- 浮层模式标识
	 */
	ysf.openInline = function (parent, status) {
		var url = ysf.url.apply(
			ysf, arguments
		);
		if (!url) {
			return;
		}

		url = util.mergeUrl(url, {
			w : cache['winType']
		})


		var initIframe = function (url) {
			var iframe = document.createElement('iframe');
			iframe.src = url;
			iframe.id = 'YSF-IFRAME-LAYER';
			iframe.style.width = '100%';
			iframe.style.height = '100%';
			return iframe;
		};
		chatProxy = initIframe(url);
		parent.appendChild(chatProxy);

		util.addEvent(chatProxy, 'load', function(){
			if(status == 1) {
				sendChatMsg('doconnect', {doconnect : 1});
			}else if(status == 0 && cache['pushswitch'] == 1){
				sendChatMsg('dopushmsg', {'pushMsgSwitch' : 1, 'pushMsgId' : cache['pushmsgid']});
			}
		})
	};

	/**
	 * 构建在线客服节点
	 * @param  {Object} options      			- 配置信息
	 * @param  {String} options.src  			- 图片地址
	 */
	ysf.entry = function (options) {
		// 构建父容器
		var buildHolder = function(){
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

		var parent = buildHolder();
		buildCircle(parent);
		buildBubble(parent);
	};


	/**
	 * 构建在线客服控制台 Iframe容器
	 *
	 * @param {Number} corpInfo				- 1 显示右侧栏导航, 2 隐藏右侧栏导航
	 */
	ysf.entryPanel = function(corpInfo){
		var div = document.createElement('div'),
			layerOpen = cache['winType'] == 1 ? 0 : 1;

		parseInt(corpInfo) ? div.setAttribute('id', 'YSF-PANEL-CORPINFO') : div.setAttribute('id', 'YSF-PANEL-INFO');
		div.className = 'ysf-chat-layer';
		document.body.appendChild(div);
		div.setAttribute('data-switch', layerOpen);


		try{
			sendChatMsg('status', {'layerOpen' : layerOpen});
		}catch(ex){};

		createDvcTimer();

		ysf.openInline(div, cache['dvcswitch']);

	};

	/**
	 * 弹出邀请窗口
	 *
	 * @param  {Object} config - 配置信息
	 * @param  {String} config.src      		- 背景图片地址
	 * @param  {String} config.text     		- 提示文字
	 * @param  {String} config.reject   		- 关闭后对应操作方式
	 * @param  {Number} config.timeout  		- 邀请等待时间
	 * @param  {Number} config.interval 		- 关闭后再次打开时间
	 * @return {Void}
	 */
	ysf.invite = (function () {
		var nWrap, nBody, nText, xConf,
			doc = document.createDocumentFragment();
		var buildInvite = function () {
			if (!!nWrap && !!nBody) {
				return;
			}
			// build wrapper
			nWrap = document.createElement('div');
			nWrap.className = 'ysf-online-invite-mask';
			// build body
			nBody = document.createElement('div');
			nBody.className = 'ysf-online-invite-wrap';
			nBody.innerHTML = '<div class="ysf-online-invite"><div class="text"></div><div class="close" title="关闭"></div><img/></div>';
			var node = nBody.childNodes[0],
				list = node.childNodes,
				ntxt = list[0];
			if ('innerText' in ntxt) {
				ntxt.innerText = xConf.text;
			} else {
				ntxt.textContent = xConf.text;
			}
			// init event
			node.onclick = openChat;
			list[1].onclick = closeInvite;
			list[2].onload = function () {
				window.setTimeout(updatePosition, 100);
				 // ntxt.style.marginTop = -ntxt.offsetHeight / 2 + xConf.marginTop + 'px';
			};
		};
		var setImage = function (src) {
			nBody.getElementsByTagName('IMG')[0].src = src;
		};
		var updatePosition = function () {
			var node = nBody.childNodes[0];
			// node.style.top = -nBody.offsetHeight / 2 + 'px';
			nBody.style.visibility = 'visible';
		};
		var openChat = function () {
			ysf.open();
			hideInvite();
		};
		var closeInvite = function (event) {
			// stop event
			event = event || window.event || {};
			if (event.stopPropagation) {
				event.stopPropagation();
			} else {
				event.cancelBubble = !0;
			}
			// hidden invite
			if (nWrap.parentNode != doc) {
				hideInvite();
			}
			// check next time
			if (xConf.reject != 0) {
				window.setTimeout(
					showInvite,
					xConf.interval * 1000
				);
			}
		};
		var hideInvite = function () {
			//doc.appendChild(nWrap);
			doc.appendChild(nBody);
			setImage(ysf.RESROOT + 'res/nej_blank.gif');
		};
		var showInvite = function () {
			// check service opened
			var delta = (+new Date) - (cache.timestamp || 0);
			if (delta < 5000) {
				// stop if miss open time
				//return;
			}
			// show invite window
			buildInvite();
			//document.body.appendChild(nWrap);
			nBody.style.visibility = 'hidden';
			document.body.appendChild(nBody);
			setImage(xConf.src);
		};
		return function (config) {
			if (!xConf) {
				xConf = config || {};
			}
			// do invite listener
			var doCheck = function () {
				window.setTimeout(
					showInvite,
					(xConf.timeout || 0) * 1000
				);
			};
			// check proxy
			if (xConf.ignore || !!cache.timestamp) {
				doCheck();
			} else {
				cache.onackdone = doCheck;
			}
		};
	})();

	/**
	 * 浮层样式打开
	 *
	 * @param {String} url 			    	- 打开URL
	 * @param {Object} event 				- 新开窗口参数
	 */
	ysf.openLayer = (function(){
		return function(url, event){
			var layerNode = document.getElementById('YSF-PANEL-CORPINFO') || document.getElementById('YSF-PANEL-INFO'),
				btnNode = document.getElementById('YSF-BTN-HOLDER');

			if(!layerNode) return;

			// modify btnNode style
			btnNode.style.display = 'none';

			// modify layerNode style
			layerNode.className = 'ysf-chat-layer ysf-chat-layeropen';
			layerNode.setAttribute('data-switch', 1);
			try{
				sendChatMsg('status', {layerOpen : 1});
			}catch(ex){}
		}
	})();

	/**
	 * 新窗口打开
	 *
	 * @param {String} url 			    	- 打开URL
	 * @param {Object} event 				- 新开窗口参数
	 */
	ysf.openWin = (function(){
		return function(url, event){
			window.open(url, 'YSF_SERVICE_' + (cache.appKey || '').toUpperCase(), event.param);
		}
	})();

	/**
	 * 新标签打开
	 * @param {String} url 			    	- 打开URL
	 * @param {Object} event 				- 新开窗口参数
	 */
	ysf.openUrl = (function(){
		return function(url, event){
			window.open(url, 'YSF_SERVICE_' + (cache.appKey || '').toUpperCase(), event.param);
		}
	})();

	/**
	 * 消息提醒和气泡管理
	 *
	 * @param {Object} event 				- 事件对象
	 * @param {String} event.type       	- 清除消息圈 : clearCircle;
	 * @constructor
	 */
	ysf.NotifyMsgAndBubble = function(event){
		var fmap = {
			clearCircle : function(event){
				var dvc = 'YSF-' + device() + '-MSGNUMBERS',
					circle = document.getElementById('YSF-BTN-CIRCLE'),
					bubble = document.getElementById('YSF-BTN-BUBBLE');
				bubble.style.display = 'none';
				circle.style.display = 'none';

				// update MSGNUMBERS data
				localStorage.setItem(dvc, 0);
				cache['notifyNumber'] = 0;
				cache['notifyContent'] = '';
				CircleNumberFlag = 0;
			},

			notifyCircle : function(event){
				var dvc = 'YSF-' + device() + '-MSGNUMBERS';
				localStorage.setItem(dvc, event.data.circleNum);

				var bubble = document.getElementById('YSF-BTN-BUBBLE'),
					content = document.getElementById('YSF-BTN-CONTENT'),
					circle = document.getElementById('YSF-BTN-CIRCLE');

				var layerNode = document.getElementById('YSF-PANEL-CORPINFO') || document.getElementById('YSF-PANEL-INFO');

				var fmap = {
					image:function(msg){
						return '[图片]';
					},
					audio:function(msg){
						return '[音频]';
					},
					text : function(msg){
						return msg;
					}
				};

				// 浮层隐藏的时候 显示消息提醒和气泡
				if(layerNode.getAttribute('data-switch') == 0 && fmap[event.data.type] && cache['sdkCustom'] == 0){
					circle.style.display = 'block';
					bubble.style.display = 'block';
					circle.innerHTML = event.data.circleNum > 99 ? '99+' : event.data.circleNum;
					content.innerHTML = fmap[event.data.type](event.data.notifyCnt)
				}
			}
		};

		var func = fmap[event.category];
		if(!!func) func(event);
	};
	/**
	 * 获取当前未读消息数接口
	 *
	 * @return {Object} data				- 返回对象
	 * 		   {String} message				- 消息
	 * 		   {Number} total				- 消息数
	 */
	ysf.getUnreadMsg = function(){
		return {
			type : cache['notifyContent'].type,
			message : cache['notifyContent'].content,
			total: cache['notifyNumber']
		}
	}

	/*============================外部接口===================================*/
	/**
	 * 更新配置信息
	 *
	 * @param  {Object} options         - 配置信息
	 * @param  {String} options.appKey  - 当前企业申请到的云信KEY，必须传此参数
	 * @param  {String} options.uid     - 企业当前登录用户标识，不传表示匿名用户
	 * @param  {String} options.name    - 企业当前登录用户名称
	 * @param  {String} options.email   - 企业当前登录用户邮箱
	 * @param  {String} options.mobile  - 企业当前登录用户手机号
	 * @param  {String} options.profile - 企业当前信息
	 * @param  {String} options.avatar  - 用户头像
	 * @param  {String} options.data    - 企业当前登录用户其他信息，JSON字符串
	 */
	ysf.config = function (options) {
		if (!options) {
			return;
		}
		// merge user information
		merge(options);
		// check app key
		if (!!cache.appKey) {
			// check device id
			refresh(options.uid);
			// log user visit path
			visit();
			// sync crm information to qiyu
			syncProfile();

			// init window type config
			initWinConfig();

			// MSG Numbers Init


		}
	};

	/**
	 * 打开客服聊天窗口
	 * @param  {Object} options        		- 配置信息
	 * @param  {String} options.appKey 		- 当前企业申请到的云信KEY，必须传此参数
	 * @param  {String} options.uid    		- 企业当前登录用户标识，不传表示匿名用户
	 * @param  {String} options.name  		- 用户姓名
	 * @param  {String} options.email  		- 邮箱地址
	 * @return {String}                  	聊天地址
	 */
	ysf.url = function () {
		if (!cache.appKey) {
			return '';
		}
		// generator query object
		var opt = {
			k: cache.appKey,
			u: device(),
			gid: cache.groupid || 0,
			sid: cache.staffid || 0,
			dvctimer : cache.dvctimer || 0
		};
		// merge user information
		each({
			n: 'name',
			e: 'email',
			m: 'mobile'
		}, function (k, v) {
			var it = cache[v];
			if (!!it) {
				opt[k] = it;
			}
		});
		opt.t = encodeURIComponent(document.title);
		// generator chat url
		return ysf.IMROOT + '?' + serialize(opt);
	};

	/**
	 * 注销账户接口
	 *
	 */
	ysf.logoff = function(){
		updateDevice();
		util.clearLocalItems(util.findLocalItems(/msgnumbers/ig));
	};

	/**
	 * 通过链接方式打开，必须在A标签上调用，页面代码
	 *
	 * ```html
	 * <a href="#" onclick="ysf.openByLink(event);" target="_ONLINE_SERVICE_">在线客服</a>
	 * ```
	 *
	 * @param  {Event} event - 用户操作事件
	 */

	ysf.openByLink = function (event) {
		// generator url
		var url = ysf.url();
		if (!url) {
			return;
		}
		// check link node
		event = event || {};
		var node = event.target || event.srcElement;
		if (!node || node.tagName != 'A') {
			return;
		}
		node.href = url;
	};

	/**
	 * 自定义商品信息
	 * @param  {Object} config 				- 配置信息
	 * @param  {String} config.title      	- 图文混排消息的大标题
	 * @param  {String} config.desc     	- 消息描述
	 * @param  {String} config.picture   	- 展示在左边的图片url链接
	 * @param  {String} config.url  		- 点击图文消息的跳转链接地址
	 * @param  {String} config.note 		- 备注
	 * @param  {Number} config.hide 		- 是否要在用户端隐藏，0为显示，1为隐藏，默认为显示。
	 * @return {Void}
	 */
	ysf.product = (function(){
		var format = function(data){
			data.title = data.title&&data.title.length >100?data.title.slice(0,100):data.title;
			data.desc = data.desc&&data.desc.length >300?data.desc.slice(0,300):data.desc;
			data.note = data.note&&data.note.length >100?data.note.slice(0,100):data.note;
			return data;
		};

		return function(config){

			config = format(config);
			syncCustomProfile(config);
		}
	})();

	/**
	 * 打开客服聊天窗口
	 * 
	 * @return {Void}
	 */
	ysf.open = function () {
		// generator url
		var url = ysf.url.apply(
			ysf, arguments
		);
		if (!url) {
			return;
		}

		switch(winParam.type){
			case 'win' :
				ysf.openWin(url, winParam);
				break;
			case 'layer' :
				ysf.openLayer(url, winParam);
				try{
					if(firstBtnClick && cache['dvcswitch'] == 0 && cache['pushswitch'] == 0 ){
						sendChatMsg('doconnect', {doconnect: 1});
						firstBtnClick = false;
					}
				}catch(ex){};
				
				if(cache['dvcswitch'] == 0 && cache['pushswitch'] == 1 || CircleNumberFlag > 0){
					sendChatMsg('dopushmsgread', {ids: msgSessionIds});
					msgSessionIds = [];
				}
				ysf.NotifyMsgAndBubble({category : 'clearCircle'});
				break;
			case 'url' :
				ysf.openUrl(url, winParam);
				break
		}

	};

	/*====================== App Init and SDK Build ==================*/
	(function () {
		// init config
		each({
			DOMAIN: ysf.ROOT + '/',
			IMROOT: (function(){
				var ret = window.__YSFWINTYPE__ == 1 ? (ysf.ROOT + '/client/iframe') : (ysf.ROOT+ '/client');

				if(util.isMobilePlatform()){
					ret = ysf.ROOT+ '/client';
				}

				return ret;

			})(),
			RESROOT: ysf.ROOT + '/sdk/'
		}, function (k, v) {
			if (ysf[k] == null) {
				ysf[k] = v;
			}
		});
		// migrate cookie to storage
		migrate();
		// build proxy
		buildProxy();
	})();

	/**
	 * 程序开始入口
	 * @param {String} sdkURL			- SDK图片地址
	 */
	ysf.init = function(sdkURL){
		var init = function(){
			ysf.entry({
				src:sdkURL
			});

			if(cache['winType'] == 1){
				ysf.entryPanel(cache['corpInfo']);
			}
		};

		/**
		 * 询问服务器配置信息
		 *
		 * @date: 2016-09-09  下午2:18
		 * @param {Number} dvcSwitch          - 会话在线开关 1: 开 0: 关
		 * @param {Number} pushSwitch		  - 消息推送开关 1: 开 0: 关
		 * @param {Number} batchIdList		  - 要申请的消息Id
		 */

		setTimeout(function(){
			util.ajax({
				url: ysf.DOMAIN + 'webapi/user/dvcSession.action?k='+cache['appKey']+'&d='+cache['device']+'&f='+cache['uid'],
				success: function(json){
					if(json.code == 200){
						cache['dvcswitch'] = json.result.dvcSwitch ; //|| json.result.dvcSwitch
						cache['pushswitch'] = json.result.pushSwitch || 0;
						cache['pushmsgid'] = json.result.batchIdList || 0;
						init();
					}else{
						cache['dvcswitch'] = 0;
						cache['pushswitch'] = 0;
						init();
					}
				},
				error: function(){
					cache['dvcswitch'] = 0;
					cache['pushswitch'] = 0;
					init();
				}
			});
		}, 1000);

	};


	util.addEvent(window, 'beforeunload', function(){
		var key = 'YSFDVC-'+cache['device'],
			reg = 'YSFMSG-' + cache['appKey'],
			num = Number(localStorage.getItem(key));
		if(num > 0) localStorage.setItem(key, --num);
		util.clearLocalItems(util.findLocalItems(new RegExp(reg, 'ig')))
	});

	/**
	 * 提供外部事件监听方式, 以保证资源加载成功
	 *
	 * @param {Object} event				- 事件集合
	 * @param {String} event.onload			- iframe页面加载成功
	 */
	ysf.on = (function(){
		var fmap = {
			onload : 'load',
			unread : 1
		};

		return function(event){
			var type = Object.prototype.toString.call(event).slice(8, -1);
			if(/object/ig.test(type)){
				for(var key in event){
					if('onload' == key && util.isFunction(event[key])){
						util.addEvent(proxy, fmap[key] , event[key]);
					}else if(util.isFunction(ysf[key]) && util.isFunction(event[key])){
						// 自定义事件
						ysf['_'+key] = event[key];
					}
				}
			}else{
				console.warn('波比(｡･∀･)ﾉ: 请保持正确的监听姿势...')
			}
		}
	})();
	/**
	 * 拉取推送消息列表
	 *
	 * @param {Array} ids				- 消息列表
	 */
	ysf.getPushMessage = function(ids){
		sendChatMsg('dogetpushmsg', {
			ids: ids
		});
	};

	/**
	 * 获取当前未读消息数接口
	 * @return {Object} data			- 返回对象
	 * 		   {String} message			- 消息
	 * 		   {Number} total			- 消息数
	 */
	ysf._unread = function(){}
	ysf.unread = function(){
		return {
			type : cache['notifyContent'].type,
			message : cache['notifyContent'].content,
			total: cache['notifyNumber']
		}
	};
})();
