/**
 * util 方法集合
 *
 * @author:   波比(｡･∀･)ﾉﾞ
 * @date:     2016-11-24  下午4:50
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

var isObject =  function(obj) {
	return ({}).toString.call(obj).toLowerCase() === '[object object]';
};

var isFunction =  function(obj){
	return ({}).toString.call(obj).toLowerCase() === '[object function]';
};