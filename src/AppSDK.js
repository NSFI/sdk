/**
 * AppSDK app接入SDK
 *
 * @author:   波比(｡･∀･)ﾉﾞ
 * @date:     2016-11-24  下午10:33
 */

var SDK = require('./sdk');

class AppSDK extends SDK {
    constructor(options) {
        super(options);
        console.log('dddd');

    }
}

window.__YSFOPTION__ = {
    corpInfo: Number('0'),
    winType: Number('3'),
    sdkCustom: 0,
    hidden: 0,
    appKey: '85d4ae43dfc35259c4a29abc9aea8f55',
    domain: "https://ysf.space"
};
__YSFOPTION__.uid = localStorage.getItem('YSF-' + __YSFOPTION__['appKey'].toUpperCase() + '-UID') || '';
try {
    __YSFOPTION__.profile = JSON.stringify(__YSFOPTION__.profile);
} catch (ex) {
    __YSFOPTION__.profile = '';
}
__YSFOPTION__.imgSrc = 'https://ysf.space/sdk/res/kefu/custom/3.png';
window.__YSFSDKADR__ = "https://ysf.space";

window.ysfTrader = new AppSDK(__YSFOPTION__);
module.exports = window.ysfTrader;
