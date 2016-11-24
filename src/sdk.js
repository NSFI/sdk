/**
 * 七鱼SDK 基类
 *
 * @author:   波比(｡･∀･)ﾉﾞ
 * @date:     2016-10-25  下午8:11
 */

const EventEmitter = require('events').EventEmitter;

class SDK extends EventEmitter {
	constructor(options){
		this.init(options);
	}
	init(options){
	}
}

module.exports = SDK;