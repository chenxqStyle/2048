var tetris={
  CSIZE:26,//一个格子的宽高
  OFFSET:15,//顶部和左侧的偏移量
  RN:20,//总行数
  CN:10,//总列数
  pg:null,//保存容器div
  shape:null,//保存主角图形
  nextShape:null,//保存备胎图形
  timer:null,//保存当前定时器的序号
  interval:500,//每次刷屏的时间间隔
  wall:null,//保存所有停止下落的单元格的二维数组
  lines:0,//保存删除的总行数
  score:0,//保存目前的得分
  SCORES:[0,10,50,120,200],
  state:1,//保存游戏状态
  GAMEOVER:0,
  RUNNING:1,
  PAUSE:2,
  start:function(){//启动游戏
    this.lines=0;
    this.score=0;
    this.state=this.RUNNING;

    //初始化空二维数组:
    this.wall=[];
    for(var r=0;r<this.RN;r++){
      this.wall[r]=new Array(this.CN);
    }
    this.pg=document.getElementsByClassName("playground")[0];
    //生成主角图形和备胎图形
    this.shape=this.randomShape();
    this.nextShape=this.randomShape();
    //shape:{cells:[cell{r,c,src},cell{},cell{},cell{}]}
    this.paint();
    //启动周期性定时器，传入moveDown函数，提前绑定this，设置时间间隔为interval，再将序号保存在timer中
    this.timer=setInterval(
      this.moveDown.bind(this),this.interval
    );
    document.onkeydown=this.keyDown.bind(this);//绑定键盘事件:
  },
  keyDown:function(e){//响应键盘按下事件
    switch(e.keyCode){//判断e的keyCode
      case 40://如果是40
        this.state==this.RUNNING&&this.moveDown(); 
        break; //调用游戏的moveDown方法
      case 37://如果是37
        this.state==this.RUNNING&&this.moveLeft(); 
        break; //调用游戏左移一次
      case 39://如果是39
        this.state==this.RUNNING&&this.moveRight(); 
        break; //调用游戏右移一次
      case 38://按向上，顺时针旋转
        this.state==this.RUNNING&&this.rotateR(); 
        break;
      case 90://按Z，逆时针旋转
        this.state==this.RUNNING&&this.rotateL(); 
        break;
      case 83://按S，重新启动
        this.state==this.GAMEOVER&&this.start(); 
        break;
      case 80://按P，暂停
        this.pause(); break;
      case 67://按C，回复运行
        this.myContinue(); break;
      case 32://按空格，则主角一落到底
        this.landToBottom(); break;
      case 81://按Q，直接结束游戏
        this.quit();
    }
  },
  landToBottom:function(){//专门将主角图形一落到底
    if(this.state==this.RUNNING){
      while(this.canDown()){
        this.moveDown();
      }
    }
  },
  quit:function(){//专门直接结束游戏
    this.state=this.GAMEOVER;
    clearInterval(this.timer);
    this.timer=null;
    this.paint();
  },
  pause:function(){//专门负责暂停游戏
    if(this.state==this.RUNNING){
      this.state=this.PAUSE;
      clearInterval(this.timer);
      this.timer=null;
      this.paint();
    }
  },
  myContinue:function(){//专门负责从暂停恢复运行
    if(this.state==this.PAUSE){
      this.state=this.RUNNING;
      this.timer=
        setInterval(this.moveDown.bind(this),this.interval);
      this.paint();
    }
  },
  rotateR:function(){//让shape顺时针旋转一次
    this.shape.rotateR();
    //如果不能旋转, 再顺时针转回去
    !this.canRotate()&&this.shape.rotateL();
  },
  rotateL:function(){//让shape顺时针旋转一次
    this.shape.rotateL();
    //如果不能旋转, 再顺时针转回去
    !this.canRotate()&&this.shape.rotateR();
  },
  canRotate:function(){//检测旋转后的图形，是否越界或撞墙
    //遍历shape中每个cell
    for(var i=0;i<this.shape.cells.length;i++){
      var cell=this.shape.cells[i];//临时保存当前cell
      //如果cell的r<0或>=RN，就返回false
      if(cell.r<0||cell.r>=this.RN){return false;}
      //否则，如果cell的c<0或>=CN，就返回false
      else if(cell.c<0||cell.c>=this.CN){return false;}
      //否则，在wall中和cell相同位置不为空，就返回false
      else if(this.wall[cell.r][cell.c]!==undefined){return false;}
    }//(遍历结束)就返回true
    return true;
  },
  canLeft:function(){//检查能否左移
    //遍历shape中每个cell
    for(var i=0;i<this.shape.cells.length;i++){
      var cell=this.shape.cells[i];//临时保存cell
      //如果cell的c==0,或wall中cell左侧有格
      if(cell.c==0
        ||this.wall[cell.r][cell.c-1]!==undefined){
        return false;//返回false
      }
    }//(遍历结束)返回true
    return true;
  },
  moveLeft:function(){//左移一次
    if(this.canLeft()){//如果可以左移
      this.shape.moveLeft();//让shape左移一次
      this.paint();//重绘一切
    }
  },
  canRight:function(){//检查能否右移
    //遍历shape中每个cell
    for(var i=0;i<this.shape.cells.length;i++){
      var cell=this.shape.cells[i];//临时保存cell
      //如果cell的c==CN-1，或wall中cell右侧有格
      if(cell.c==this.CN-1
        ||this.wall[cell.r][cell.c+1]!==undefined){
        return false;//返回false
      }
    }//(遍历结束)返回true
    return true;
  },
  moveRight:function(){
    if(this.canRight()){//如果可以右移
      this.shape.moveRight();//让shape右移一次
      this.paint();//重绘一切
    }
  },
  canDown:function(){//检查是否可以下落
    //遍历shape中每个cell
    for(var i=0;i<this.shape.cells.length;i++){
      var cell=this.shape.cells[i]//临时保存cell
      //如果wall中cell的位置下方有格，或cell的r==RN-1
      if(cell.r==this.RN-1
          ||this.wall[cell.r+1][cell.c]!==undefined){
        return false;//返回false
      }
    }return true;//(遍历结束)返回true
  },
  moveDown:function(){//this->tetris
    if(this.canDown()){//如果可以下落才
      this.shape.moveDown();//让shape下移一次
    }else{//停止下落后，执行的任务
      this.landIntoWall();//落到墙里
      var ls=this.deleteRows();//检查并删除满格行
      this.lines+=ls;//将本次删除的行数累加到总行数
      //将本次行数对应的得分累加到总分
      this.score+=this.SCORES[ls];
      if(!this.isGAMEOVER()){//如果游戏没结束
        this.shape=this.nextShape;//备胎图形转正
        this.nextShape=this.randomShape();//生成新备胎图形
      }else{//否则
        this.state=this.GAMEOVER;//修改游戏状态为GAMEOVER
        clearInterval(this.timer);//停止定时器
        this.timer=null;
      }
    }
    this.paint();//重绘一切
  },
  isGAMEOVER:function(){//判断游戏是否结束
    //遍历备胎图形中每个cell
    for(var i=0;i<this.nextShape.cells.length;i++){
      var cell=this.nextShape.cells[i];//临时保存当前cell
      //如果在wall中和当前cell相同的位置有格
      if(this.wall[cell.r][cell.c]!==undefined){
        return true;//返回true
      }
    }//(遍历结束)返回false
    return false;
  },
  paintState:function(){//专门更新游戏状态界面
    if(this.state==this.GAMEOVER){//如果游戏状态为GAMEOVER
      var img=new Image();//新建一个Image对象img
      img.src="img/game-over.png";//img的src为img/game-over.png
      this.pg.appendChild(img);
    }else if(this.state==this.PAUSE){//否则，如果游戏状态为PAUSE
      var img=new Image();//新建一个Image对象img
      img.src="img/pause.png";//img的src为img/pause.png
      this.pg.appendChild(img);
    }
  },
  paintScore:function(){//负责更新页面的分数和行数
    document.getElementById("score").innerHTML=this.score;
    document.getElementById("lines").innerHTML=this.lines;
  },
  deleteRows:function(){//负责删除所有满格行
    //自RN-1开始，向上遍历wall中每一行！同时声明lines=0
    for(var r=this.RN-1,lines=0;r>=0;r--){
      //如果当前行是空行，就直接break
      if(this.wall[r].join("")==""){break;}
      //否则，如果用isFullRow检查当前行是满格
      else if(this.isFullRow(r)){
        this.deleteRow(r);//调用deleteRow删除当前行
        r++;//将r留在原地
        lines++;//将lines+1
        if(lines==4){break;}//如果lines==4，就break
      }
    }//(遍历结束)
    return lines;//返回lines
  },
  isFullRow:function(r){//负责判断当前行是否满格
    //将wall中r行转为字符串,保存在str中
    //在str中找开头的,或,,或结尾的,将结果保存在i中
    //返回 i==-1;
    return String(this.wall[r]).search(/^,|,,|,$/)==-1;
  },
  deleteRow:function(delr){//删除当前行
    //r从delr开始向上遍历wall中每一行
    for(var r=delr;r>=0;r--){
      this.wall[r]=this.wall[r-1];//将上一行赋值给当前行
      //遍历当前行中每个cell
      for(var c=0;c<this.CN;c++){
        //如果当前cell有效，则将当前cell的r+1
        this.wall[r][c]&&this.wall[r][c].r++;
      }
      //将上一行赋值为CN个元素的空数组
      this.wall[r-1]=new Array(this.CN);
      //如果wall中r-2行也是空行，就break
      if(this.wall[r-2].join("")==""){break;}
    }
  },
  landIntoWall:function(){//将shape中的cell转移到wall中
    //遍历shape中每个cell
    for(var i=0;i<this.shape.cells.length;i++){
      var cell=this.shape.cells[i];//临时存储cell
      //将cell保存到wall中相同r，c的位置
      this.wall[cell.r][cell.c]=cell;
    }
  },
  randomShape:function(){//随机创建下一个备胎图形
    //在0~6间生成随机整数r
    var r=parseInt(Math.random()*7);
    switch(r){//判断r
      //如果是0，返回新创建的O图形
      case 0: return new O();
      //如果是1，返回新创建的I图形
      case 1: return new I();
      //如果是2，返回新创建的T图形
      case 2: return new T();
      case 3: return new S();
      case 4: return new Z();
      case 5: return new L();
      case 6: return new J();
    }
  },
  paint:function(){//重绘一切
    this.pg.innerHTML=//删除pg下所有img
      this.pg.innerHTML.replace(/<img[^>]*?>/g,"");
    this.paintShape();
    this.paintWall();
    this.paintNextShape();
    this.paintScore();
    this.paintState();
  },
  paintWall:function(){//负责绘制wall中的格
    //创建文档片段frag
    var frag=document.createDocumentFragment();
    for(var r=this.RN-1;r>=0;r--){//遍历wall中每个cell
      if(this.wall[r].join("")==""){
        break;
      }
      for(var c=0;c<this.CN;c++){
        var cell=this.wall[r][c];//临时保存当前cell
        if(cell){//如果cell有格
          var img=new Image();//新建Image对象，保存在img中
          img.src=cell.src;//设置img的src为cell的src
          //设置img的left为CSIZE*cell的c+OFFSET
          img.style.left=this.CSIZE*cell.c+this.OFFSET+"px";
          //设置img的top为CSIZE*cell的r+OFFSET
          img.style.top=this.CSIZE*cell.r+this.OFFSET+"px";
          //将img追加到frag中
          frag.appendChild(img);
        }
      }
    }//(遍历结束)
    this.pg.appendChild(frag);//将frag整体追加到pg中
  },
  paintNextShape:function(){
    //创建文档片段frag
    var frag=document.createDocumentFragment();
    //遍历nextShape的cells数组中每个cell
    for(var i=0;i<this.nextShape.cells.length;i++){
      //将当前cell保存在变量cell中
      var cell=this.nextShape.cells[i];
      var img=new Image();//新建Image对象，保存在img中
      img.src=cell.src;//设置img的src为cell的src
      //设置img的left为CSIZE*cell的c+OFFSET
      img.style.left=this.CSIZE*(cell.c+10)+this.OFFSET+"px";
      //设置img的top为CSIZE*cell的r+OFFSET
      img.style.top=this.CSIZE*(cell.r+1)+this.OFFSET+"px";
      frag.appendChild(img);//将img追加到frag中
    }//(遍历结束)
    this.pg.appendChild(frag);
  },
  paintShape:function(){//专门绘制主角图形shape
    //创建文档片段frag
    var frag=document.createDocumentFragment();
    //遍历shape的cells数组中每个cell
    for(var i=0;i<this.shape.cells.length;i++){
      //将当前cell保存在变量cell中
      var cell=this.shape.cells[i];
      var img=new Image();//新建Image对象，保存在img中
      img.src=cell.src;//设置img的src为cell的src
      //设置img的left为CSIZE*cell的c+OFFSET
      img.style.left=this.CSIZE*cell.c+this.OFFSET+"px";
      //设置img的top为CSIZE*cell的r+OFFSET
      img.style.top=this.CSIZE*cell.r+this.OFFSET+"px";
      frag.appendChild(img);//将img追加到frag中
    }//(遍历结束)
    this.pg.appendChild(frag);//将frag整体追加到pg中
  }
}
window.onload=function(){tetris.start();};