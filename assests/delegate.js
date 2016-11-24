/**
 * delegate 数据代理模型
 *
 * @author:   波比(｡･∀･)ﾉﾞ
 * @date:     2016-11-04  上午9:52
 */
(function(){
    if (!window.localStorage||
        !window.postMessage){
        return;
    }
    var appkey;
	var util = {
		findLocalItems: function(query, noJson){
			var i, results = [], value;
			for (i in localStorage) {
				if (i.match(query) || (!query && typeof i === 'string')) {
					value = !noJson ? localStorage.getItem(i) : JSON.parse(localStorage.getItem(i));
					results.push({key:i,val:value});
				}
			}
			return results;
		},
		clearLocalItems : function(list){
			for(var i=0;i<list.length;i++){
				window.localStorage.removeItem(list[i].key);
			}
		}
	};

    var cmap = {
        key:function(value){
            appkey = value||'';
        },
        usr:function(value){
            if (!appkey){
                return;
            }
            var key = 'X-'+appkey.toUpperCase()+'-YSF-INFO';
            localStorage.setItem(key,value);
        },
        product: function(value){
            if(!appkey){
                return;
            }

			// 先清除之前的商品链接信息
			util.clearLocalItems(util.findLocalItems(/-YSF-PRODUCT/ig));
			
            var key = 'X-'+appkey.toUpperCase()+'-YSF-PRODUCT';
            localStorage.setItem(key,value);
        },
        synckey : function(value){
			if(!appkey){
				return;
			}
            var key = 'YSF-' + appkey.toUpperCase() + '-UID';
            localStorage.setItem(key, value);
        },
        dvcnumbers : function(params){
            try{
                var obj = JSON.parse(params);
                var dvc = obj.deviceid,
                    key = 'YSF-' + dvc + '-NUMBERS';

                localStorage.setItem(key, obj.number);
            }catch(ex){

            }

        }
    };
    var sendMsg = function(msg){
        parent.postMessage(msg,'*');
    };
    var receiveMsg = function(event){
        var arr = (event.data||'').split(':'),
            func = cmap[(arr.shift()||'').toLowerCase()];
        if (!!func){
            func(arr.join(':'));
        }
    };
    if (!!window.addEventListener){
        window.addEventListener('message',receiveMsg,!1);
    }else{
        window.attachEvent('onmessage',receiveMsg);
    }
    var checkACK = function(){
        if (!appkey){
            return;
        }
        var key = 'X-'+appkey.toUpperCase()+'-YSF-ACK',
            time = localStorage.getItem(key);
        sendMsg('ACK:'+time);
    };
    // init delegate
    sendMsg('RDY:'+(+new Date));
    window.setInterval(checkACK,2000);
    checkACK();
})();
