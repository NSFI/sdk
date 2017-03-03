/**
 * 七鱼SDK 基类
 *
 * @author:   波比(｡･∀･)ﾉﾞ
 * @date:     2016-10-25  下午8:11
 */

const EventEmitter = require('events').EventEmitter;

class SDK extends EventEmitter {
	constructor(options){
		super(options);
		this.init(options);
	}
	init(options){
	}

	/**************接口层*************/

	/**
	 * 未读消息
	 */
	unread (){

	}
	/**
	 * 配置方式
	 */
	config (){

	}

	/**
	 * 商品链接
	 *
	 */
	product(){

	}

	/**
	 * 事件监听
	 *
	 */
	on(){

	}

	/**
	 * 登出
	 *
	 */
	logoff(){

	}

	/**
	 * 打开访客端窗口
	 */
	open(){

	}

}

module.exports = SDK;
