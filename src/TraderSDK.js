/**
 * TraderSDK 电商SDK入口
 *
 * @author:   波比(｡･∀･)ﾉﾞ
 * @date:     2016-11-24  下午10:30
 */

const SDK = require('./sdk');
const Cache = require('./cache');
const util = require('./util/util');
const dom = require('./util/dom');
const _ = require('lodash');

var ysfTrader = {};

var config = {
	winParam : {
		type : 'url',
		param : {
			width : 800,
			height : 600,
			top : Math.max(0, ((screen.height || 0) - 600) / 2),
			left : Math.max(0, ((screen.width || 0) - 800) / 2 ),
			location : 0,
			menubar : 0,
			scrollbars : 0,
			status : 0,
			toolbar : 0,
			resizable : 0
		}
	}
};

class TraderSDK extends SDK {
	constructor(options){
		super(options);
		options = _.merge(config, options);

		this.options = options;

		this.init(options);
	}
	init(options){
		console.log("sdfas")
		this.cache = new Cache(options);
	}

	url() {
		var cache = this.cache.getItemsInCache(),
			opt = {};

		if (!cache.k) return '';
		_.merge(opt, {
			k : cache.k,
			u : cache.u,
			gid : cache.gid,
			uid : cache.uid,
			qtype : cache.qtype,
			bid : cache.b,
			t : encodeURIComponent(document.title)
		});

		return ysfTrader.IMROOT + '?' + util.serialize(opt)
	}

	/**
	 * 未读数逻辑
	 */
	unread(){
		return this.cache.getUnreadMsg()
	}

	/**
	 * 注销账户
	 */
	logoff(){
		this.cache.updateUser(util.random())
	}

	/**
	 * 打开入口
	 */
	open(){
		var winParam = this.options.winParam,
			type = winParam.type;
		switch(type){
			case 'win' :
				this.openWin(this.url(), winParam);
				break;
			case 'url' :
				this.openUrl(this.url());
				break;
		}
	}

	openUrl(url){
		var cache = this.cache.getItemsInCache();
		window.open(url, 'YSF_SERVICE_' + (cache.appkey || '').toUpperCase(), '');
	}
	openWin(url, event){
		var param = event.param,
			cache = this.cache.getItemsInCache(),
			ret = [];
		for(var key in param){
			ret.push(key + '=' + param[key]);
		}
		window.open(url, 'YSF_SERVICE_' + (cache.k || '').toUpperCase(), ret.join(','));
	}


	/**
	 * 配置入口
	 * @param options
	 */
	config(options){
		if (!options) return;

		this.cache.setItemsInUser(options);

		if (!! this.cache.appKey) {
			this.syncProfile();
		}
	}

	/**
	 * 往访客端同步消息
	 */
	sendMsg(){
		if(this.proxy){
			console.error('[error] : proxy not exist')
			return;
		}

		try{
			this.proxy.contentWindow.postMessage(msg, '*');
		}catch(err){
			console.log(err);
		}
	}

	/**
	 * 接受七鱼访客端同步消息
	 * @param event
	 */
	receiveMsg(event){
		var that = this;
		var cmap = {
			rdy : ()=>{
				that.syncProfile();
			}
		}


		// check origin
		if (event.origin != ysfTrader.ROOT) {
			return;
		}

		// do command
		var arr = (event.data || '').split(':'),
			type = arr.shift();

		if( type == 'pkg'){
			this.receiveMsgPkg(JSON.parse(arr.join(':')));
			return;
		};

		var func = cmap[(type || '').toLowerCase()];

		if (!!func) {
			func(arr.join(':'));
		}
	}

	/**
	 * 指令消息
	 * @param event
	 */
	
	receiveMsgPkg(event){
		
	}
	/**
	 * 同步CRM信息
	 */
	syncProfile(){
		var user = {
			title: document.title || ''
		};
		var cacheUser = this.cache.getItemsInUser();

		util.each({
			name: '',
			email: '',
			mobile: '',
			avatar: '',
			profile: 'data'
		}, function(k, v){
			var it = cacheUser[v] || cacheUser[k];
			if (it != null) {
				user[k] = it;
			}
		});

		user.referrer = location.href;
		user.uid = cacheUser.uid || '';
		this.sendMsg('USR:' + util.serialize(user));
	}

	buildProxy(src){
		var src = src || ysfTrader.RESROOT + 'res/delegate.html';
		if(this.proxy) return;
		this.proxy = dom.buildIframe(src)
	}

	entry(options){
		var cache = this.cache.getItemsInCache();
		var parent = dom.buildHolder(cache,options);
		dom.buildCircle(parent);
		dom.buildBubble(parent);
	}
}

window.__YSFOPTION__ = {
    corpInfo: Number('0'),
    winType: Number('3'),
    sdkCustom: 0,
    hidden: 0,
    appKey: '85d4ae43dfc35259c4a29abc9aea8f55',
    domain: "https://ysf.space"
};
__YSFOPTION__.uid = localStorage.getItem('YSF-' + __YSFOPTION__['appKey'].toUpperCase() + '-UID') || '';
try {
    __YSFOPTION__.profile = JSON.stringify(__YSFOPTION__.profile);
} catch(ex) {
    __YSFOPTION__.profile = '';
}
__YSFOPTION__.imgSrc = 'https://ysf.space/sdk/res/kefu/custom/3.png';
window.__YSFSDKADR__ = "https://ysf.space";

window.ysfTrader = new TraderSDK(__YSFOPTION__);

module.exports = function(options){

	util.each({
		DOMAIN : options.domain,
		IMROOT : (function(){
			return options.domain + '/traderClient/'
		})(),
		RESROOT : options.domain + '/sdk/'
	}, function(k, v){
		if(ysfTrader[k] == null){
			ysfTrader[k] = v
		}
	});

	return new TraderSDK(options);
};
