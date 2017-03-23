/**
 * DOM 操作
 *
 * @author:   波比(｡･∀･)ﾉﾞ
 * @date:     2016-10-25  下午8:29
 */

var util = require('./util');

var buildentry = function(self) {
    // 构建父容器
    var buildHolder = function() {
        var holder = document.createElement('div'),
            customStr = "YSF-CUSTOM-ENTRY-" + window.__YSFTHEMELAYEROUT__;

        if (window.__YSFTHEMELAYEROUT__) {
            holder.className = 'layer-' + window.__YSFTHEMELAYEROUT__;
        }

        holder.setAttribute('id', 'YSF-BTN-HOLDER');

        if (cache.getItemsInCache('hidden') == 1) holder.style.display = 'none';

        document.body.appendChild(holder);

        holder.onclick = function() {
            self.open();
        };

        holder.innerHTML = '<div id="' + customStr + '"><img src="' + options.src + '"/></div>';
        return holder
    };


    // 构建circle子节点

    var buildCircle = function(parent) {
        var circle = document.createElement('span');
        circle.setAttribute('id', 'YSF-BTN-CIRCLE');
        parent.appendChild(circle)
    };

    // 构建Bubble子节点
    var buildBubble = function(parent) {
        var container = document.createElement('div'),
            content = document.createElement('div'),
            arrow = document.createElement('span'),
            close = document.createElement('span');

        container.setAttribute('id', 'YSF-BTN-BUBBLE');
        content.setAttribute('id', 'YSF-BTN-CONTENT');
        arrow.setAttribute('id', 'YSF-BTN-ARROW');
        close.setAttribute('id', 'YSF-BTN-CLOSE');

        close.onclick = function(event) {
            event.stopPropagation();
            event.preventDefault();
            self.NotifyMsgAndBubble({ category: 'clearCircle' });
        };

        parent.appendChild(container);
        container.appendChild(content);
        container.appendChild(arrow);
        container.appendChild(close);
    };

    var parent = buildHolder();
    buildCircle(parent);
    buildBubble(parent);
};


module.exports = {
    buildentry: buildentry
}
