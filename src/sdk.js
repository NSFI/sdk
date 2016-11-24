/**
 * 七鱼SDK
 *
 * @author:   波比(｡･∀･)ﾉﾞ
 * @date:     2016-10-25  下午8:11
 */

const EventEmitter = require('events').EventEmitter;


class SFSDK extends EventEmitter {
	constructor(options){
		super(options);
		this.init();
	}
	init(){

	}
}

module.exports = SFSDK;