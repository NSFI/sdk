/**
 * manage SDK数据模型层
 *
 * @author:   波比(｡･∀･)ﾉﾞ
 * @date:     2016-10-25  下午8:19
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

var clearLocalItems =  function(list){
	for(var i=0;i<list.length;i++){
		window.localStorage.removeItem(list[i].key);
	}
};