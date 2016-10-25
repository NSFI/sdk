/**
 * 合集, 封装三种请求方式
 * 1. request[application/x-www-form-urlencoded], upload[multipart/form-data], json[application/json]
 * 2. 
 *
 * @author:   波比(｡･∀･)ﾉﾞ
 * @date:     2016-10-18  下午1:47
 */


module.exports = {
	request : require('./xdr'),
	json : require('./json')
}