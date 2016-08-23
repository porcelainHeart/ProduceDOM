
(function (valProduce) {
    var produce = valProduce();

    // CommonJS
    if (typeof exports === "object") {
        module.exports = produce;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
        define(valProduce);

    // window
    } else {
        window.produce = produce;
    }

    // 作为jQuery的插件使用
    if (window.jQuery !== undefined && jQuery.fn) {

        jQuery.produce = function(selector) {
            return jQuery(produce(selector));
        };

    }
})(function(){

    var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^[\]]*\]|['"][^'"]*['"]|[^[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?/g,
        exprRegex = {
            ID: /#((?:[\w\u00c0-\uFFFF_-]|\\.)+)/,
            CLASS: /\.((?:[\w\u00c0-\uFFFF_-]|\\.)+)(?![^[\]]+])/g,
            NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF_-]|\\.)+)['"]*\]/,
            ATTR: /\[\s*((?:[\w\u00c0-\uFFFF_-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/g,
            TAG: /^((?:[\w\u00c0-\uFFFF\*_-]|\\.)+)/,
            CLONE: /\:(\d+)(?=$|[:[])/,
            COMBINATOR: /^[>~+]$/
        },
        cache = {},
        attrMap = {
            'for': 'htmlFor',
            'class': 'className',
            'html': 'innerHTML'
        },
        callbackTypes = ['ID','CLASS','NAME','ATTR'],
        exprCallback = {
            ID: function(match, node) {
                node.id = match[1];
            },
            CLASS: function(match, node) {
                var cls = node.className.replace(/^\s+$/,'');
                node.className = cls ? cls + ' ' + match[1] : match[1];
            },
            NAME: function(match, node) {
                node.name = match[1];
            },
            ATTR: function(match, node) {

                var attr = match[1],
                    val = match[4] || true;

                if ( val === true || attr === 'innerHTML' || attrMap.hasOwnProperty(attr) ) {
                    node[attrMap[attr] || attr] = val;
                } else {
                    node.setAttribute( attr, val );
                }

            }
        };

    function create(part, n) {

        var tag = exprRegex.TAG.exec(part),
            node = document.createElement( tag && tag[1] !== '*' ? tag[1] : 'div' ),
            fragment = document.createDocumentFragment(),
            c = callbackTypes.length,
            match, regex, callback;

        while (c--) {

            regex = exprRegex[callbackTypes[c]];
            callback = exprCallback[callbackTypes[c]];

            if (regex.global) {

                while ( (match = regex.exec(part)) !== null ) {
                    callback( match, node );
                }

                continue;

            }

            if (match = regex.exec(part)) {
                callback( match, node );
            }

        }

        while (n--) {
            fragment.appendChild( node.cloneNode(true) );
        }

        return fragment;

    }

    function multiAppend(parents, children) {

        parents = parents.childNodes;

        var i = parents.length,
            parent;

        while ( i-- ) {

            parent = parents[i];

            if (parent.nodeName.toLowerCase() === 'table') {

                parent.appendChild(parent = document.createElement('tbody'));
            }

            parent.appendChild(children.cloneNode(true));

        }

    }

    function produce(selector) {

        if (selector in cache) {
            return cache[selector].cloneNode(true).childNodes;
        }

        var selectorParts = [],
            fragment = document.createDocumentFragment(),
            children,
            prevChildren,
            curSelector,
            nClones = 1,
            nParts = 0,
            isSibling = false,
            cloneMatch,
            m;

        while ( (m = chunker.exec(selector)) !== null ) {
            ++nParts;
            selectorParts.push(m[1]);
        }

        // 反向
        while (nParts--) {

            curSelector = selectorParts[nParts];

            if (exprRegex.COMBINATOR.test(curSelector)) {
                isSibling = curSelector === '~' || curSelector === '+';
                continue;
            }

            // clones数字需要大于等于1
            nClones = (cloneMatch = curSelector.match(exprRegex.CLONE)) ? ~~cloneMatch[1] : 1;

            prevChildren = children;
            children = create(curSelector, nClones);

            if (prevChildren) {

                if (isSibling) {
                    children.appendChild(prevChildren);
                    isSibling = false;
                } else {
                    multiAppend(children, prevChildren);
                }

            }

        }

        fragment.appendChild(children);

        cache[selector] = fragment.cloneNode(true);

        return fragment.childNodes;

    }

    produce.cache = cache;

    return produce;
});