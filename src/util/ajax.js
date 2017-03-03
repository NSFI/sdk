/**
 * ajax 请求
 *
 * @author:   波比(｡･∀･)ﾉﾞ
 * @date:     2016-11-24  下午4:12
 */

module.exports = function(options){
	var errorCode = 10001;

	var buildRequest = function(){
		var xdr = null;

		if(window.XMLHttpRequest){
			xdr = new XMLHttpRequest();
			xdr.withCredentials = true;
		}else if(window.xDomainRequest){
			xdr = new xDomainRequest();
		}

		return xdr;
	};

	var setHeaders = function(req, headers){
		req.setRequestHeader("content-type", "application/x-www-form-urlencoded");
		for(var key in headers){
			req.setRequestHeader(key, headers[key]);
		}
	};


	var type = options.type || 'get',
		url = options.url,
		data = options.data || null,
		success = options.success,
		error = options.error,
		headers = options.headers || {};

	var req = buildRequest();

	if(!req){
		error({
			code : errorCode,
			message : 'Browse not support XMLHttpRequest and xDomainRequest'
		});
		return;
	}

	try{
		setHeaders(req, headers);
		req.open(type, url);
		req.send(data);

		req.onreadystatechange = function () {
			if (req.readyState == 4) {
				if (req.status === 200) {
					success(eval("(" + req.responseText + ")"));
				} else {
					error({
						code : errorCode,
						message : req.responseText
					});
				}
			}
		};
	}catch(err){
		console.error(err);
	}

};
