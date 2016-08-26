## ProduceDOM
ProduceDOM能让你在javascript代码中生成虚拟DOM节点，加以修饰后插入到html中。

压缩后的ProduceDOM大小只有2kb！！！而且无任何依赖，当然你也可以作为jQuery的插件来使用它。

下面让我们来看看如何使用它：
---

你需要通过produce函数创建DOM节点。

    produce(selector);
produce函数只接收一个参数，这个参数是一个类似于css选择器的形式的字符串。

    produce("div p");
然后produce函数会返回一个nodeList，里面是你所期望的DOM节点

    <div>
      <p></p>
    </div>
---
produce函数支持一些便捷的写法

    produce("div ul li:3 span");
你会获得这样一个DOM节点

    <div>
      <ul>
        <li>
          <span>
        </li>
      </ul>
      <ul>
        <li>
          <span>
        </li>
      </ul>
      <ul>
        <li>
          <span>
        </li>
      </ul>
    </div>
---
当然produce也支持属性的添加

    produce("div.test");
结果是这样

    <div class="test"></div>
---
produce还支持更便捷的链式写法

    produce("div.test.nav.top#header");
结果是这样

    <div class="test nav top" id="header"></div> // 如果你试图添加多个id，不会报错，只会获得第一个id
---
可能你需要给DOM节点添加样式和文本,你可以把这些内容使用中括号隔开，就像在html内写行内样式一样

    produce("div[style="width:30px"][html="demo"]");
    
    <div style="width:30px">demo</div>
--- 
如果你的文件里引入了jQuery，那么produce函数返回的DOM节点可以直接通过jQuery添加到页面中

    $.produce('div a:5').prependTo('body');
---    
你可以利用ProduceDOM生成任何你想要的DOM节点，甚至做出一个完整的页面！
