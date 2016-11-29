/**
 * Cache SDK数据模型层
 * 用于存储唯一账号, 及账号切换
 *
 *
 * @author:   波比(｡･∀･)ﾉﾞ
 * @date:     2016-10-25  下午8:19
 */
const EventEmitter = require('events').EventEmitter;
const _ = require('lodash');
const u = require('./util/util');


var cache = {
	t : '',  	// document.title
	k : -1,		 // appkey
	u : -1,	 	 // 用户id
	b : -1,	 	 // 商家id
	gid : 0,	 // 分组id
	sid : 0,	 // 客服id
	qtype : 0	 // 问题分类
};


var user = {
	avator : '',	// 用户头像
	name : '',
	email : '',
	mobile : ''
};

var trader = {
	avator : '',
	name : ''
}

/**
 * 未读消息数
 * @type {{type: string, message: string, total: number}}
 */
var unreadMsg = {
	type : 'text',
	message : '',
	total : 0
};


class Cache extends EventEmitter {
	constructor(options){
		super(options);
		this.appKey = options.appKey;
	}

	getUser(){
		localStorage.getItem('YSF-' + this.appKey.toUpperCase()+'-UID')
	}

	updateUser(dvcId){
		localStorage.setItem('YSF-' + this.appKey.toUpperCase()+'-UID', dvcId)
	}

	delItemInCache(key){
		if(u.typeof(key) != 'array'){
			delete cache[key]
		}else{
			_.forEach(key, function(){
				delete cache[key]
			})
		}
	}

	setItemsInCache(hash){
		if(u.typeof(hash) == 'object'){
			_.merge(cache, hash);
		}else{
			console.error('mergeItemsInCache must be object', hash, cache)
		}

		return cache;
	}

	getItemsInCache(){
		return cache
	}


	setItemsInUser(hash){
		if(_.isObject(hash)){
			_.merge(user, hash);
		}else{
			console.error('mergeDataInUser must be object', hash, user)
		}

		return user;
	}

	getItemsInUser(){
		return user;
	}

	setUnreadMsg(hash){
		return _.merge(unreadMsg, hash)
	}

	getUnreadMsg(){
		return unreadMsg
	}

}

module.exports = Cache;







