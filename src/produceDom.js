
(function (valProduce) {
    var produce = valProduce();

    // npm
    if (typeof exports === "object") {
        exports.produce = produce;

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
        regList = {
            ID: /#((?:[\w\u00c0-\uFFFF_-]|\\.)+)/,
            CLASS: /\.((?:[\w\u00c0-\uFFFF_-]|\\.)+)(?![^[\]]+])/g,
            NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF_-]|\\.)+)['"]*\]/,
            ATTR: /\[\s*((?:[\w\u00c0-\uFFFF_-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/g,
            TAG: /^((?:[\w\u00c0-\uFFFF\*_-]|\\.)+)/,
            CLONE: /\:(\d+)(?=$|[:[])/,
            COMBINATOR: /^[>~+]$/
        },
        attrList = {
            'for': 'htmlFor',
            'class': 'className',
            'html': 'innerHTML'
        },
        typeList = ['ID','CLASS','NAME','ATTR'],
        funcList = {
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

                if ( val === true || attr === 'innerHTML' || attrList.hasOwnProperty(attr) ) {
                    node[attrList[attr] || attr] = val;
                } else {
                    node.setAttribute( attr, val );
                }

            }
        };

    function create(part, n) {

        var tag = regList.TAG.exec(part),
            node = document.createElement( tag && tag[1] !== '*' ? tag[1] : 'div' ),
            fragment = document.createDocumentFragment(),
            c = typeList.length,
            match, reg, func;

        while (c--) {

            reg = regList[typeList[c]];
            func = funcList[typeList[c]];

            if (reg.global) {

                while ( (match = reg.exec(part)) !== null ) {
                    func( match, node );
                }

                continue;

            }

            if (match = reg.exec(part)) {
                func( match, node );
            }

        }

        while (n--) {
            fragment.appendChild( node.cloneNode(true) );
        }

        return fragment;

    }

    function appendMore(parents, children) {

        parents = parents.childNodes;

        var leng = parents.length, parent;

        while ( leng-- ) {

            parent = parents[leng];

            if (parent.nodeName.toLowerCase() === 'table') {

                parent.appendChild(parent = document.createElement('tbody'));
            }

            parent.appendChild(children.cloneNode(true));

        }

    }

    function produce(selector) {
        
        var selectorParts = [],
            fragment = document.createDocumentFragment(),
            children,
            prevChildren,
            corSelector,
            times = 1,
            n = 0,
            borderType = false,
            cloneMatch,
            m;

        while ( (m = chunker.exec(selector)) !== null ) {
            ++n;
            selectorParts.push(m[1]);
        }

        // 反向
        while (n--) {

            corSelector = selectorParts[n];

            if (regList.COMBINATOR.test(corSelector)) {
                borderType = corSelector === '~' || corSelector === '+';
                continue;
            }

            // clones数字需要大于等于1
            times = (cloneMatch = corSelector.match(regList.CLONE)) ? ~~cloneMatch[1] : 1;

            prevChildren = children;
            children = create(corSelector, times);

            if (prevChildren) {

                if (borderType) {
                    children.appendChild(prevChildren);
                    borderType = false;
                } else {
                    appendMore(children, prevChildren);
                }

            }

        }

        fragment.appendChild(children);


        return fragment.childNodes;

    }


    return produce;
});
