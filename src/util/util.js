/**
 * util 方法集合
 *
 * @author:   波比(｡･∀･)ﾉﾞ
 * @date:     2016-11-24  下午4:50
 */

var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'; // 随机数种子

/**
 * mergeUrl
 * @param url
 * @param options
 * @returns {string}
 */
var mergeUrl = function(url, options){
	var arr = url.split('?'),
		furl= arr.shift(),
		origin = query2Object(arr.shift() || '', '&');
	// merge data
	for(var key in options){
		origin[key] = options[key]
	}

	// sarialize
	for(var key in origin){
		arr.push(key + '=' + (origin[key] || ''))
	}

	return furl + '?' + arr.join('&');
}

/**
 * query2Object
 * @param str
 * @param reg
 * @returns {{}}
 */
var query2Object = function(str, reg){
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
}

/**
 * typeof 数据类型判断
 * @param obj
 * @private
 */
var _typeof =  function(obj) {
	({}).toString.call(obj).toLowerCase().slice(8,-1)
};

/**
 * findLocalItems
 * @param query
 * @param noJson
 * @returns {Array}
 */
var findLocalItems = function(query, noJson){
	var i, results = [], value;
	for (i in localStorage) {
		if (i.match(query) || (!query && typeof i === 'string')) {
			value = !noJson ? localStorage.getItem(i) : JSON.parse(localStorage.getItem(i));
			results.push({key:i,val:value});
		}
	}
	return results;
};

/**
 * clearLocalItems
 * @param list
 */
var clearLocalItems =  function(list){
	for(var i=0;i<list.length;i++){
		window.localStorage.removeItem(list[i].key);
	}
};

/**
 * random
 *
 * @returns {string}
 */
var random = function(){
	var ret = [];
	for (var i = 0, n; i < 20; ++i) {
		n = Math.floor(Math.random() * chars.length);
		ret.push(chars.charAt(n));
	}
	return ret.join('').toLowerCase();
}

/**
 * each
 * @param o
 * @param func
 */
var each = function (o, func) {
	if (!o || !func) return;
	for (var x in o) {
		if (o.hasOwnProperty(x)) {
			func.call(null, x, o[x]);
		}
	}
};

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


	
module.exports = {
	mergeUrl : mergeUrl,
	query2Object : query2Object,
	typeof : _typeof,
	findLocalItems : findLocalItems,
	clearLocalItems : clearLocalItems,
	random : random,
	each : each,
	serialize : serialize
}