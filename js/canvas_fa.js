//Canvas Frame Animation, by Rukkihuang, 2016-06-15  
//amended by danzizhong 2016-07-23
var canvasfa=function(obj){
    this.obj = obj;
    this.cav=document.getElementById(obj.cav);
    this.ctx=this.cav.getContext('2d');
    this.w=this.cav.width;
    this.h=this.cav.height;

    //6s这里有问题 先记下
    var devicePixelRatio = window.devicePixelRatio || 1;
    var backingStoreRatio = this.ctx.webkitBackingStorePixelRatio ||
                        this.ctx.mozBackingStorePixelRatio ||
                        this.ctx.msBackingStorePixelRatio ||
                        this.ctx.oBackingStorePixelRatio ||
                        this.ctx.backingStorePixelRatio || 1;
    var ratio = devicePixelRatio / backingStoreRatio;
    
    if (devicePixelRatio !== backingStoreRatio) {
        this.cav.width = this.w * ratio;
        this.cav.height = this.h * ratio;
        this.ctx.scale(ratio, ratio);
    } 

    this.url=obj.url?obj.url:'';
    this.ok=false;//是否加载就绪
    this.runFn=null;//动画interval
    this.page=0;//当前第几帧
    this.fps=obj.fps?obj.fps:15;//每秒帧数
    this.loop=obj.loop==false?false:true;//false单次播放，true循环
    this.frames = obj.frames;
    if(typeof(this.obj.autoplay)=='undefined'||this.obj.autoplay) this.autoplay=true;
    else this.autoplay=false;
    //卡帧
    this.flag_card = false;
    this.card_num = 2; //卡2帧 起码2帧 默认是2帧

    this.backFn = obj.backFn;

};
canvasfa.prototype.init = function(){    
    if(typeof(this.obj.loading_done)=='function'){
        this.loading_done=this.obj.loading_done;
        this.loading_done_br=true;
    }
    else this.loading_done_br=false;
    //独立帧
    if(this.frames instanceof Array){
        this.frames_imgs=this.frames;//原始的图片文件
        this.frames=[];//每帧的img对象存放数组
        this.frame_number=this.frames_imgs.length;
        this.much_frames();//加载帧
        this.sprites = null;
    }
    //合并帧
    else {
        this.direction=this.frames.direction;
        this.frame_number=this.frames.frame_number;
        this.sprites_frames(this.frames);
    }
    this.frame_fns=new Array(this.frame_number);
    return this;
};
canvasfa.prototype.much_frames=function(){
    this.load_frames={};//存放所有加载中的帧
    for(var i=0;i<this.frames_imgs.length;i++){this.load_frames['ok'+i]='ok';};
    for(var i=0;i<this.frames_imgs.length;i++){this.load_fn(this.frames_imgs[i],'ok'+i,i)}
};
canvasfa.prototype.load_fn=function(src,name,no){
    var img=new Image(),_this=this;
    img.onload=function(){
        _this.frames[no]=this;
        delete _this.load_frames[name];
        var n=0;
        for(var o in _this.load_frames){n++;}
        if(n==0) { _this.load_done();}
    };
    img.src=this.url+src;
};
canvasfa.prototype.sprites_frames=function(sprites){
    var img=new Image(),_this=this;
    img.onload=function(){
        _this.sprites=this;
        //竖向合并动画
        if(_this.direction){
            _this.spritesH=this.height;
            _this.sizeH=Math.floor(_this.spritesH/_this.frame_number);
            _this.sizeW=this.width;
        }
        else{
            _this.spritesW=this.width;
            _this.sizeW=Math.floor(_this.spritesW/_this.frame_number);
            _this.sizeH=this.height;
        }
        _this.load_done();
    };
    img.src=this.url+sprites.img;
};
canvasfa.prototype.load_done=function(){
    this.ok=true;
    if(this.autoplay) this.start();
    else this.show_single_frame(this.page);
    if(this.loading_done_br) this.loading_done();
}
canvasfa.prototype.gogogo=function(_this){
    _this.ctx.clearRect(0,0,_this.w,_this.h);
    _this.page++;
    if(_this.flag_card){
        if(_this.page > _this.card_index-1){
            _this.page -= this.card_num;
        }
    }else if(_this.page>_this.frame_number-1){
        if(!_this.loop){
            _this.page=_this.frame_number-1;
            _this.pause();
        }
        else _this.page=0;
    };
    _this.show_single_frame(_this.page);
    if(typeof(_this.frame_fns[_this.page])=='function') _this.frame_fns[_this.page]();
};
canvasfa.prototype.gogogoback=function(_this){
    _this.ctx.clearRect(0,0,_this.w,_this.h);
    _this.page--;

    if(!_this.loop && _this.page == 0){
        _this.pause();

        if(this.backFn){
            this.backFn();
        }

    }

    if(_this.page<0){_this.page=_this.frame_number-1;};
    _this.show_single_frame(_this.page);
    // if(typeof(_this.frame_fns[_this.page])=='function') _this.frame_fns[_this.page]();
};
canvasfa.prototype.show_single_frame=function(n){
    //合并帧动画
    if(this.sprites){
        if(this.direction) {this.ctx.drawImage(this.sprites,0,this.sizeH*n,this.sizeW,this.sizeH,0,0,this.w,this.h);}
        else{this.ctx.drawImage(this.sprites,this.sizeW*n,0,this.sizeW,this.sizeH,0,0,this.w,this.h);}
    }
    //单独帧动画
    else{ this.ctx.drawImage(this.frames[n],0,0,this.w,this.h);}
};
canvasfa.prototype.start=function() {
    var _this=this;
    if(_this.page>_this.frame_number-1) _this.page=0;
    if(!_this.loop&&_this.page==_this.frame_number-1) _this.page=0;
    (function(){
        if(!_this.ok){setTimeout(arguments.callee,50);}
        else{
            if(_this.runFn===null) _this.runFn=setInterval(function(){_this.gogogo(_this)},1000/_this.fps);
            else return;
        }
    })();
};
canvasfa.prototype.start_back=function(){
    var _this=this;
    if(_this.page<0) _this.page=_this.frame_number-1;
    (function(){
        if(!_this.ok){setTimeout(arguments.callee,50);}
        else{
            if(_this.runFn===null) _this.runFn=setInterval(function(){_this.gogogoback(_this)},1000/_this.fps);
            else return;
        }
    })();
};
canvasfa.prototype.pause=function() {
    clearInterval(this.runFn);
    this.runFn=null;
};
canvasfa.prototype.set_frame_fns=function(frame_number,fn){
    this.frame_fns[frame_number-1]=fn;
};
canvasfa.prototype.set_card = function(frame_num,num){
    this.flag_card = true;
    this.card_index = frame_num;
    this.card_num = num || 2;
}
canvasfa.prototype.pause_card = function(){
    this.flag_card = false;
}















/*  |xGv00|7059b305517cb4c3f2593d5c73d6bb33 */