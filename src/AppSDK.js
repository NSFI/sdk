/**
 * AppSDK app接入SDK
 *
 * @author:   波比(｡･∀･)ﾉﾞ
 * @date:     2016-11-24  下午10:33
 */

var SDK = require('./sdk');
var Cache = require('./cache');



class TraderSDK extends SDK {
	constructor(options){
		super(options)
	}

	init(options){

	}

	/**
	 * 未读数逻辑
	 */
	unread(){
	}

	/**
	 * 注销账户
	 */
	logoff(){

	}

	/**
	 * 打开入口
	 */
	open(){

	}

	/**
	 *
	 * @param options
	 */
	config(options){

	}

	/**
	 * 同步CRM信息
	 */
	syncProfile(){

	}
}


module.exports = TraderSDK;
