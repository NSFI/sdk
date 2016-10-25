/**
 * xdr.spec 测试用例
 *
 * @author:   波比(｡･∀･)ﾉﾞ
 * @date:     2016-10-22  下午12:02
 */
var request = require('../../src/xdr');
var queryDefault = 'http://localhost:8010/'

describe('request', function () {
	it('default', function (done) {
		var sn = request(queryDefault, {
			onbeforesend: function (options) {
				expect(options.method).toBe('GET');
				expect(options.sync).toBe(false);
				expect(options.data).toBe(null);
				expect(options.timeout).toBe(6000);
			},
			onerror : function(result){
				done.fail(JSON.stringify(result));
			},
			onload : function(result){
				expect(result).toEqual(jasmine.any(String));
				done();
			},
			onprogress : function(event){
				console.log(event.loaded, event.total);
			}

		})
	});


	it('json', function (done) {
		var sn = request(queryDefault+'json', {
			method : 'POST',
			type : 'json',
			onbeforesend: function (options) {
				expect(options.headers).toEqual(jasmine.objectContaining({
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}));
				expect(options.type).toBe('json')
			},
			onerror : function(result, data){
				done.fail(JSON.stringify(data));
			},
			onload : function(result){
				expect(result).toEqual(jasmine.any(Object));
				done();
			}

		})
	});

})
