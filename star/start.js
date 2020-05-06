/**
 * Created by Administrator on 2016/4/30.
 */
(function () {//采用匿名函数自调实现加载运行
  //初始化一些值：找画布，添画笔，
  var canvasEl = document.getElementById('canvas');
  var ctx = canvasEl.getContext('2d');
  var mousePos = [0, 0];
  //定义变量，保存鼠标移动时候，第一个点链接鼠标点移动的缓动因子，让其平稳的移动！！！！
    //鼠标跟随：让第一个点缓缓移动到鼠标的位置——x = x + (t - x) / factor
  var easingFactor = 5.0;

  var backgroundColor = '#000';
  var nodeColor = '#fff';
  var edgeColor = '#fff';

  var nodes = [];
  var edges = [];

  //定义方法创建星星节点
  function constructNodes() {
    for (var i = 0; i < 100; i++) {
      var node = {
        drivenByMouse: i == 0,/*设置一个鼠标移动的属性，跟随鼠标点*/
        x: Math.random() * canvasEl.width,
        y: Math.random() * canvasEl.height,

        //星星移动的步长
        vx: Math.random() * 1 - 0.5,
        vy: Math.random() * 1 - 0.5,
        //星星的半径，采用随机数，控制权重，使产生的星半径大的少，小的多；
        radius: Math.random() > 0.9 ? 3 + Math.random() * 3 : 1 + Math.random() * 3
      };
      //生成的星数据要放入到数组中
      nodes.push(node);
    }
    //遍历数组，当任意两个e的坐标不重复时候，调用转化为边的方法，连成一条线；
    nodes.forEach(function (e) {
      nodes.forEach(function (e2) {
        if (e == e2) {
          return;
        }

        var edge = {
          from: e,
          to: e2
        }

        addEdge(edge);
      });
    });
  }

  //连点成边的方法。
  function addEdge(edge) {
    var ignore = false;//对传入的点默认是不生成边的，满足条件才进行

    //遍历数组，为保证线双向不重复，所以需要将开始或者其实坐标一样的点，其线不生成；
    edges.forEach(function (e) {
      if (e.from == edge.from && e.to == edge.to) {
        ignore = true;
      }

      if (e.to == edge.from && e.from == edge.to) {
        ignore = true;
      }
    });
    //满足条件的，压入到边的数组中
    if (!ignore) {
      edges.push(edge);
    }
  }

  //移动一步的方法（内步自调替代了interval）
  function step() {
    nodes.forEach(function (e) {
      //跟随鼠标移动的点，其位置不随程序动
      if (e.drivenByMouse) {
        return;
      }

      //点的移动
      e.x += e.vx;
      e.y += e.vy;

      //控制取值函数：筛选传入的数据，保证取得阀值。
      function clamp(min, max, value) {
        if (value > max) {
          return max;
        } else if (value < min) {
          return min;
        } else {
          return value;
        }
      }

      //碰撞检测，保证星在屏幕范围内
      if (e.x <= 0 || e.x >= canvasEl.width) {
        e.vx *= -1;
        e.x = clamp(0, canvasEl.width, e.x)
      }

      if (e.y <= 0 || e.y >= canvasEl.height) {
        e.vy *= -1;
        e.y = clamp(0, canvasEl.height, e.y)
      }
    });
    //调用两个方法
    adjustNodeDrivenByMouse();
    console.log(nodes[0]);
    render();

    /* 类似定时器，自调step方法，循环
     尽可能使用 requestAnimationFrame，它能保证你的帧率锁定在 <= 60="" fps="" ，不至于爆掉你的浏览器。
     函数参数即为回调函数，看起来有点像递归调用，但实际上，浏览器内部处理是将这个回调函数先入事件列队，
     等所有绘制计算工作完毕后再从列队中取出执行，十分高效。*/
    window.requestAnimationFrame(step);
  }

  /*鼠标跟随：让第一个点缓缓移动到鼠标的位置——x = x + (t - x) / factor
   其中 factor 是缓动因子，t 是最终位置，x 是当前位置。*/
  function adjustNodeDrivenByMouse() {
    nodes[0].x += (mousePos[0] - nodes[0].x) / easingFactor;
    nodes[0].y += (mousePos[1] - nodes[0].y) / easingFactor;
  }

  //两个点之间的线长：为后面控制在一定长度范围内才能描边
  function lengthOfEdge(edge) {
    return Math.sqrt(Math.pow((edge.from.x - edge.to.x), 2) + Math.pow((edge.from.y - edge.to.y), 2));
  }

  //开始绘制
  function render() {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);

    //遍历边数组，设定一个极限，如果超出界限就不需要绘制，在极限以内，需要绘制，这样控制了屏幕中出现的线条
    edges.forEach(function (e) {
      var l = lengthOfEdge(e);
      var threshold = canvasEl.width / 8;

      if (l > threshold) {
        return;
      }

      ctx.strokeStyle = edgeColor;

      //根据距离的远近绘制不同宽度的线条，同时设置不同的透明度。这样形成立体的感觉
      ctx.lineWidth = (1.0 - l / threshold) * 2.5;
      ctx.globalAlpha = 1.0 - l / threshold;
      ctx.beginPath();//每次都要开始，这样才不会杂乱链接
      ctx.moveTo(e.from.x, e.from.y);
      ctx.lineTo(e.to.x, e.to.y);
      ctx.stroke();
    });
    //绘制完成需要将透明度归为正常值，这样不影响后面星星的绘制
    ctx.globalAlpha = 1.0;

    //遍历星数组，绘制星
    nodes.forEach(function (e) {
      if (e.drivenByMouse) {
        return;
      }

      ctx.fillStyle = nodeColor;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius, 0, 2 * Math.PI);
      ctx.fill();
    });
  }

  window.onresize = function () {
    canvasEl.width = document.body.clientWidth;
    canvasEl.height = canvasEl.clientHeight;

    if (nodes.length == 0) {
      constructNodes();
    }

    render();
  };

  //鼠标移动事件，获取鼠标的位置坐标，保存在mousePos中
  window.onmousemove = function (e) {
    mousePos[0] = e.clientX;
    mousePos[1] = e.clientY;
  }

  //监听屏幕的变化
  window.onresize(); // trigger the event manually.
  //与上面的移动保持一致，移动就要重新绘制
  /*它优于setTimeout/setInterval的地方在于它是由浏览器专门为动画提供的API，在运行时浏览器会自动优化方法的调用，
   并且如果页面不是激活状态下的话，动画会自动暂停，有效节省了CPU开销。*/
  window.requestAnimationFrame(step);
}).call(this);