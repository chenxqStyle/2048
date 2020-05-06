window.$=HTMLElement.prototype.$=function(selector){
    var elems=(this==window?document:this)
        .querySelectorAll(selector);
    return elems.length==0?null:elems.length==1?elems[0]:elems;
}
var myJs = {
  //随机生成颜色
  randColor: function () {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    return 'rgb( ' + r + ', ' + g + ', ' + b + ')';
  },
  //获取任意子元素到顶部的距离
  getElemTop: function (elem) {
    var top = 0;
    while (elem != null) {
      top += elem.offsetTop;
      elem = elem.offsetParent;
    }
    return top;
  },
  // 页面加载完成后
  readyEvent: function (fn) {
    if (fn == null) {
      fn = document;
    }
    var oldonload = window.onload;
    if (typeof window.onload != 'function') {
      window.onload = fn;
    } else {
      window.onload = function () {
        oldonload();
        fn();
      };
    }
  },
  // 视能力分别使用dom0||dom2||IE方式 来绑定事件
  // 参数： 操作的元素,事件名称 ,事件处理程序
  addEvent: function (element, type, handler) {
    if (element.addEventListener) {
      //事件类型、需要执行的函数、是否捕捉
      element.addEventListener(type, handler, false);
    } else if (element.attachEvent) {
      element.attachEvent('on' + type, function () {
        handler.call(element);
      });
    } else {
      element['on' + type] = handler;
    }
  },
  // 移除事件
  removeEvent: function (element, type, handler) {
    if (element.removeEventListener) {
      element.removeEventListener(type, handler, false);
    } else if (element.datachEvent) {
      element.detachEvent('on' + type, handler);
    } else {
      element['on' + type] = null;
    }
  },
  // 阻止事件 (主要是事件冒泡，因为IE不支持事件捕获)
  stopPropagation: function (ev) {
    if (ev.stopPropagation) {
      ev.stopPropagation();
    } else {
      ev.cancelBubble = true;
    }
  },
  // 取消事件的默认行为
  preventDefault: function (event) {
    if (event.preventDefault) {
      event.preventDefault();
    } else {
      event.returnValue = false;
    }
  },
  // 获取事件目标
  getTarget: function (event) {
    return event.target || event.srcElement;
  },
  // 获取event对象的引用，取到事件的所有信息，确保随时能使用event；
  getEvent: function (e) {
    var ev = e || window.event;
    if (!ev) {
      var c = this.getEvent.caller;
      while (c) {
        ev = c.arguments[0];
        if (ev && Event == ev.constructor) {
          break;
        }
        c = c.caller;
      }
    }
    return ev;
  }

  //数组乱序
    //(遍历数组元素，将其与之前的任意元素交换。)
    //从后往前
  shuffleFromBack:function(array) {
    var _array = array.concat();
   
    for (var i = _array.length; i--; ) {
      var j = Math.floor(Math.random() * (i + 1));
        /*var temp = _array[i];
        _array[i] = _array[j];
        _array[j] = temp;*/

      _array[i]=[_array[j],_array[j]=_array[i]][0];

    }
    
    return _array;
  }
    //从前往后
  shuffleFromPre:function (a) {
    var length = a.length;
    var shuffled = Array(length);
   
    for (var index = 0, rand; index < length; index++) {
      rand = ~~(Math.random() * (index + 1));
      if (rand !== index) 
        shuffled[index] = shuffled[rand];
      shuffled[rand] = a[index];
    }
   
    return shuffled;
  }



}
