/**
 * Created by kk on 2018/3/2.
 */
var main = {};

main.timeScroll = null; //挂在整屏切换动画实例
main.currentStep = "step1";

//初始化时，设置
main.init = function(){
    main.resize();
    main.events();//配置事件
    main.configAnimate(); //初始化时导航条动画

    main.button3D(".start",".state1",".state2",0.3); //按钮
    main.button3D(".button1",".state1",".state2",0.3); //第五屏3D按钮
    main.button3D(".button2",".state1",".state2",0.3); //第五屏3D按钮
    main.configAllScreenAnimate(); //整屏切换

    //设置每一屏图片百分比
    main.imgWidth($(".scene img"));

    twoScrAnimate.init(); //执行第二屏动画
    threeScrAnimate.init(); //第三屏动画
    fiveScrAnimate.init(); //第五屏动画
};

//页面加载完成初始化
$(document).ready(main.init);


//配置事件
main.events = function(){


    main.nav(); //导航条nav动画交互；

    $(window).bind("scroll",scrollFun); //解决刷新时浏览器记录滚动条位置问题，新问题每当滚动滚轮，scroll值总变为零（滚动时解除事件）
    function scrollFun (){
        $(window).scrollTop(0);
    }

    //初始加载完成时，解决滚动条不能拖动问题。当mousedown时，解除scrollFun绑定
    $(window).mousedown(function(){
        $(window).unbind("scroll",scrollFun)
    });

    //当mouseup时，使当前的这一屏达到某个状态
    $(window).bind("mouseup",main.mouseupFun);

    //滚动条滚动过程中，计算页面运动到呢个时间点
    $(window).bind("scroll",main.scrollStatus);

    //滚轮切屏，首先清楚浏览器默认行为

    $(".wrapper").bind("mousewheel",function(ev){
        if($(window).width() > 780){
            ev.preventDefault();
        }

    });

    $(".wrapper").one("mousewheel",mousewheelFn);

    var timer = null;
    function mousewheelFn (ev,prediction){
        $(window).unbind("scroll",scrollFun); //滚动滚轮解除
        if(prediction < 1){
            console.log("next");
            main.changeSteps("next");
        }else {
            console.log("prev");
            main.changeSteps("prev");
        };

        clearTimeout(timer);
        timer = setTimeout(function(){
            if($(window).width() > 780){
                $(".wrapper").one("mousewheel",mousewheelFn);
            }

        },1000);
    };

    $(window).resize( main.resize );//浏览器页面变化改变页面大小
};

//当mouseup时，使当前的这一屏达到某个状态
main.mouseupFun = function(){
    var scale = main.scale();
    //得到当前页面到大的某个时间点
    var times = scale * main.timeScroll.totalDuration();

    //获得该时间点前后的两个状态
    var prevStep = main.timeScroll.getLabelBefore(times);
    var nextStep = main.timeScroll.getLabelAfter(times);

    //由获得的两个状态，获取对应的时间点
    var prevTime = main.timeScroll.getLabelTime(prevStep);
    var nextTime = main.timeScroll.getLabelTime(nextStep);

    //计算差值
    var prevDisValue = Math.abs(prevTime - times);
    var nextDisValue = Math.abs(nextTime - times);

    //判断滚动条拖动的四种情况
    var step = '';
    if(scale === 0){
        step = "step1"
    }else if(scale === 1){
        step = "footerState"
    }else if(prevDisValue < nextDisValue){
        step = prevStep
    }else{
        step = nextStep
    }

    main.timeScroll.tweenTo(step);

    /* 松开鼠标时，滚动条也要到达某个位置 */
    //获取运动总时长
    var totalTime = main.timeScroll.totalDuration();

    //获取下一状态运动时间
    var afterTime = main.timeScroll.getLabelTime(step);

    //滚动条能够滚动最大高度
    var maxH = $("body").height() - $(window).height();

    //滚动条滚动距离
    var scrollY = afterTime / totalTime * maxH;

    //滚动条运动持续时间
    var t = Math.abs(main.timeScroll.time() - afterTime);

    var scrollAnimate = new TimelineMax();
    scrollAnimate.to( "html,body",t,{scrollTop:scrollY} );

    //main.currentStep = step;
};

//滚动条滚动比例
main.scale = function(){
    var scrollY = $(window).scrollTop();
    var maxH = $("body").height() - $(window).height();
    var scale = scrollY / maxH;
    return scale ;

};

//滚动条滚动过程中，计算页面运动到呢个时间点
main.scrollStatus = function(){
    var timePoint = main.scale() * main.timeScroll.totalDuration();
    main.timeScroll.seek(timePoint,false); //参数false可以使每一屏中动画实现。
};

//切换正平切计算滚动距离
main.changeSteps = function(value){
    if(value === "next"){ //向下

        //获取运动总时长
        var totalTime = main.timeScroll.totalDuration();

        //获取当前运动时间
        var currentTime = main.timeScroll.getLabelTime(main.currentStep);

        //获取下一个状态字符串
        var afterStep = main.timeScroll.getLabelAfter(currentTime);

        //获取下一状态运动时间
        var afterTime = main.timeScroll.getLabelTime(afterStep);

        if(!afterStep){//为null时直接退出，否则会出现混乱
            return
        }

        /* 使滚动条滚动与切换页面同步
        *
        * 思路：
        *   1求出滚动能够滚动的最大距离，body高度减去可视区的高度，
        *   2下一状态运动时间 除 运动总时长 乘 滚动条最大距离
        *   3滚动条运动时间 = 前面运动时间 减 下一步运动时间
        * */
        //滚动条能够滚动最大高度
        var maxH = $("body").height() - $(window).height();

        //滚动条滚动距离
        var scrollY = afterTime / totalTime * maxH;

        //滚动条运动持续时间
        var t = Math.abs(main.timeScroll.time() - afterTime);

        var scrollAnimate = new TimelineMax();
        scrollAnimate.to( "html,body",t,{scrollTop:scrollY} );


        //tweenTo运动到下一个状态
        //main.timeScroll.tweenTo(afterStep);

        //使当前的状态记录为下一个状态
        main.currentStep = afterStep;
    }else{ //向上

        //获取运动总时长
        var totalTime = main.timeScroll.totalDuration();

        //获取当前运动时间
        var currentTime = main.timeScroll.getLabelTime(main.currentStep);

        //获取上一个状态字符串
        var beforeStep = main.timeScroll.getLabelBefore(currentTime);

        //获取上一状态运动时间
        var beforeTime = main.timeScroll.getLabelTime(beforeStep);

        if(!beforeStep){ //为null时直接退出，否则会出现混乱
            return
        }

        var maxH = $("body").height() - $(window).height();
        var scrollY = beforeTime / totalTime * maxH;
        var  t = Math.abs(main.timeScroll.time() - beforeTime);
        var scrollAnimate = new TimelineMax();
        scrollAnimate.to( "html,body",t,{scrollTop:scrollY} );


        //tweenTo运动到上一个状态
        //main.timeScroll.tweenTo(beforeStep);

        //使当前的状态记录为下一个状态
        main.currentStep = beforeStep;
    }
};

//
main.resize = function(){
    $(".scene").height( $(window).height() ); //设置每一屏高度为可视区高度
    $(".scene:not(':first')").css("top",$(window).height());//除第一个，其他屏的Top值都为可失去的高度

    if($(window).width() <= 780){

        $(".wrapper").unbind();
        $(window).unbind("mousewheel");
        $(window).unbind("scroll");
        $(window).unbind("mousedown");
        $(window).unbind("mouseup");

        $("body").css("height","auto");
        $("body").addClass("r780 r950").css("overflow-y","scroll");

        $(".menu").css("top",0);
        $(".menu").css("transform","none");
        $(".menu_wrapper").css("top",0);

        //$(".menu").removeClass("menu_state2");
        //$(".menu").removeClass("menu_state3");


    }else if( $(window).width() <= 950 ){


        $("body").css("height",8500);
        $("body").removeClass("r780").addClass("r950");
        $(".menu").css("top",22);
        $(".menu").css("transform","none");

    }else{
        $("body").removeClass("r780 r950");

        $("body").css("height",8500);
        $("body").removeClass("r950");
        $(".menu").css("top",22);
        //收回侧边栏
        $(".left_nav").css("left",-300);
    }

    //当页面大小改变时，不会一直显示首屏。
    main.configAllScreenAnimate();
};

//改变img宽度

main.imgWidth = function(imgElement){

    imgElement.each( function(){
        $(this).load(function(){

            width = $(this).width();

            $(this).css({
                width:"100%",
                "max-width":width,
                height:"auto"
            })
        })
    } )
};

//整屏切换动画以及每屏中的小动画。
main.configAllScreenAnimate = function(){

    var time = main.timeScroll ? main.timeScroll.time() : 0;

    if(main.timeScroll){
        main.timeScroll.clear();
    }

    main.timeScroll = new TimelineMax();

        //当从第二屏切换到其他屏，再返回到第二屏时，第二屏主动会再次执行
    main.timeScroll.to(".scene1",0,{onReverseComplete:function(){
        twoScrAnimate.timeLine.seek(0,false);
    }});

    //底部footer 浏览器页面发生改变时，它的top值回归原点
    main.timeScroll.to(".footer",0,{top:"100%"});

        main.timeScroll.add("step1");

    main.timeScroll.to( ".scene2",0.8,{top:0,ease:Cubic.easeInOut} );
    main.timeScroll.to( {},0.1,{onComplete:function(){
        menu.rotateMenu("menu_state2");
    },onReverseComplete: function () {
        menu.rotateMenu("menu_state1")
    }},"-=0.2");

    //当切换到第二屏时，第二屏第一个动画执行
    main.timeScroll.to( {},0,{onComplete:function(){
        twoScrAnimate.timeLine.tweenTo("state1")
    }},"-=0.2" );

    //第二屏的其他动画

    main.timeScroll.to( {},0,{onComplete:function(){
        twoScrAnimate.timeLine.tweenTo("state2");
    },onReverseComplete:function(){
        twoScrAnimate.timeLine.tweenTo("state1");
    }} );

    main.timeScroll.to({},0.4,{}); //使动画时间增加，

    main.timeScroll.add("point1");

    main.timeScroll.to( {},0,{onComplete:function(){
        twoScrAnimate.timeLine.tweenTo("state3");
    },onReverseComplete:function(){
        twoScrAnimate.timeLine.tweenTo("state2");
    }} );

    main.timeScroll.to({},0.4,{}); //使动画时间增加，

    main.timeScroll.add("point2");

    main.timeScroll.to( {},0,{onComplete:function(){
        twoScrAnimate.timeLine.tweenTo("state4");
    },onReverseComplete:function(){
        twoScrAnimate.timeLine.tweenTo("state3");
    }} );

    main.timeScroll.to({},0.4,{}); //使动画时间增加，

    main.timeScroll.add("point3");
    //第二屏的其他动画

      main.timeScroll.add("step2");

    main.timeScroll.to( ".scene3",0.8,{top:0,ease:Cubic.easeInOut,onReverseComplete:function(){ //当从第三屏切换到其他屏，再返回到第三屏时，第三屏主动会再次执行
        threeScrAnimate.timeLine.seek(0,false);
    }} );
    main.timeScroll.to( {},0.1,{onComplete:function(){
        menu.rotateMenu("menu_state3");
    },onReverseComplete: function () {
        menu.rotateMenu("menu_state2")
    }},"-=0.2");

    //第三屏中的主动画
    main.timeScroll.to({},0.1,{onComplete:function(){
        threeScrAnimate.timeLine.tweenTo("thState1");
    }},"-=0.2");


    main.timeScroll.add("step3");

    //第三屏小动画
    main.timeScroll.to({},0,{onComplete: function () {
        threeScrAnimate.timeLine.tweenTo("thState2");
    },onReverseComplete: function () {
        threeScrAnimate.timeLine.tweenTo("thState1");
    }});

    main.timeScroll.to({},0.4,{}); //使动画时间增加，

        main.timeScroll.add("thState");

    //第三屏小动画


    main.timeScroll.to( ".scene4",0.8,{top:0,ease:Cubic.easeInOut} );
    main.timeScroll.add("step4");

    //滚动到第五屏时，第五屏将第四屏顶到屏幕外边,一起向上移动
    main.timeScroll.to( ".scene4",0.8,{top: -$(window).height(),ease:Cubic.easeInOut} );

    //当可视区大于950 显示第五屏时，导航条消失
    if($(window).width() > 950){
        main.timeScroll.to(".menu_wrapper",0.8,{top:-110,ease:Cubic.easeInOut},"-=0.8");
    }else{
        $(".menu_wrapper").css("top",0);
    }


    main.timeScroll.to( ".scene5",0.8,{top:0,ease:Cubic.easeInOut,onReverseComplete: function () {
        fiveScrAnimate.timeLine.seek(0,false);
    }} ,"-=0.8");
    main.timeScroll.to({},0.1,{onComplete: function () {
        fiveScrAnimate.timeLine.tweenTo("fiveState");
    }},"-=0.2");
    main.timeScroll.add("step5");

    main.timeScroll.to(".scene5",0.5,{top:- $(".footer").height(),ease:Cubic.easeInOut});
    main.timeScroll.to(".footer",0.5,{top:$(window).height() - $(".footer").height(),ease:Cubic.easeInOut},"-=0.5");
    main.timeScroll.add("footerState");

    main.timeScroll.stop();

    //当浏览器页面改变大小时，让动画走到之前已经到达的时间点
    main.timeScroll.seek(time);
};


//导航条动画以及首屏动画
main.configAnimate  = function(){
    var animate = new TimelineMax();
    animate.to(".menu",0.5,{opacity:1});
    animate.to(".menu",0.5,{left:22},"-=0.2");
    animate.to(".nav",0.5,{opacity:1});

    //配置第一屏动画
    animate.to(".scene1_logo",0.5,{opacity:1});
    animate.staggerTo(".desk_img",2,{opacity:1,rotationX:0,ease:Elastic.easeOut},0.2);
    animate.to( ".light_left",0.7,{rotationZ:0,ease:Cubic.easeOut},"-=1.5");
    animate.to( ".light_right",0.7,{rotationZ:0,ease:Cubic.easeOut},"-=1.5" );
    animate.to(".controls",0.5,{bottom:20,opacity:1},"-=0.5");

    //首屏动画结束，滚动条
    animate.to( "body",0,{ "overflow-y":"scroll" } )
};

//导航条nav动画
main.nav = function () {
    var navAnimate = new TimelineMax();
    $(".nav a").bind('mouseenter',function(){
        var W = $(this).width();
        var L = $(this).offset().left;
        //console.log(W);
        navAnimate.clear(); //保持只有一个动画
        navAnimate.to( ".line",0.4,{opacity:1,left:L,width:W} )
    });

    $(".nav a").bind("mouseleave",function(){
        navAnimate.clear(); //保持只有一个动画
        navAnimate.to( ".line",0.4,{opacity:0} )
    });

    //鼠标移入语言，显示隐藏的dropdown

    var languageAnimate = new TimelineMax();  // 新建立一个，用同一个会相互干扰；
    $(".language").bind("mouseenter",function(){
        languageAnimate.clear(); //保持只有一个动画
        languageAnimate.to( ".dropdown",0.4,{opacity:1,"display":"block"} )
    });
    $(".language").bind("mouseleave",function(){
        languageAnimate.clear(); //保持只有一个动画
        languageAnimate.to( ".dropdown",0.4,{opacity:0,"display":"none"} )
    });

    //左侧导航条动画
    $(".btn_mobile").click( function(){
        var m_animate = new TimelineMax();
        m_animate.to( ".left_nav",0.5,{left:0});
    } );
    $(".l_close").click( function(){
        var closeAnimate = new TimelineMax();
        closeAnimate.to( ".left_nav",0.5,{left:-300} )
    } )
};

//3D按钮旋转动画

main.button3D = function( obj,element1,element2,t ){
    console.log(element1);
    var buttonAnimate = new TimelineMax();
    buttonAnimate.to( $(obj).find(element1),0,{rotationX:0,transformPerspective:600,transformOrigin:"center bottom"} );
    buttonAnimate.to( $(obj).find(element2),0,{rotationX:-90,transformPerspective:600,transformOrigin:"top center"} );

    //移入
    $(obj).bind("mouseenter",function(){
        var enterAnimate = new TimelineMax();

        var ele1 = $(this).find(element1);
        var ele2 = $(this).find(element2);

        enterAnimate.to(ele1,t,{rotationX:90,top:-ele1.height(),ease:Cubic.easeInOut},0);
        enterAnimate.to(ele2,t,{rotationX:0,top:0,ease:Cubic.easeInOut},0);
    });
    //移出
    $(obj).bind("mouseleave",function(){
        var leaveAnimate = new TimelineMax();

        var ele1 = $(this).find(element1);
        var ele2 = $(this).find(element2);

        leaveAnimate.to( ele1,t,{rotationX:0,top:0,ease:Cubic.easeInOut} ,0);
        leaveAnimate.to( ele2,t,{rotationX:-90,top:ele2.height(),ease:Cubic.easeInOut} ,0);
    })
};


//切屏时实现，导航条3D反转动画
//定义命名空间，便于管理
var menu = {};

//滚动一屏就调用这个函数，实现了3D反转的具体细节。
menu.rotateMenu = function(stateClass){ //参数为动画时改变的class

    var oldNav = $(".menu");
    var newNav = oldNav.clone();

    newNav.removeClass("menu_state1").removeClass("menu_state2").removeClass("menu_state3");
    newNav.addClass(stateClass);

    $(".menu_wrapper").append(newNav);

    oldNav.addClass("removeClass");

    //重新执行导航中的动画
    main.button3D(".start",".state1",".state2",0.3); //按钮
    main.nav();

    var menuAnimate = new TimelineMax();

    //可视区大于950才3D旋转
    if($(window).width() > 950){
        menuAnimate.to( newNav,0 ,{rotationX:-90,top:100,transformPerspective:600,transformOrigin:"top center"} );
        menuAnimate.to( oldNav,0 ,{rotationX:0,top:22,transformPerspective:600,transformOrigin:"center bottom"} );

        menuAnimate.to( oldNav,0.3,{rotationX:90,top:-55,ease:Cubic.easeInOut,onComplete:function(){
            $(".removeClass").remove();
        }} );
        menuAnimate.to( newNav,0.3 ,{rotationX:0,top:22,ease:Cubic.easeInOut},"-=0.3" );
    }

};

//第二屏动画
var twoScrAnimate = {};

twoScrAnimate.timeLine = new TimelineMax();

//实现具体动画
twoScrAnimate.init = function(){
    console.log("第二屏");
    twoScrAnimate.timeLine.staggerTo( ".scene2_1 img",1.5,{opacity:1,rotationX:0,ease:Elastic.easeOut} ,0.1);

    //所有按钮显示
    twoScrAnimate.timeLine.to( ".points",0.2,{bottom:20},"-=1" );

    //第一个按钮
    twoScrAnimate.timeLine.to(".scene2 .point0 .text",0.1,{opacity:1});
    twoScrAnimate.timeLine.to(".scene2 .point0 .point_icon",0,{"background-position":"right top"})

    twoScrAnimate.timeLine.add("state1");

    twoScrAnimate.timeLine.staggerTo( ".scene2_1 img",0.2,{opacity:0,rotationX:90});
    twoScrAnimate.timeLine.to( ".scene2_2 .left",0.4,{opacity:1} );
    twoScrAnimate.timeLine.staggerTo( ".scene2_2 .right img",0.3,{opacity:1,rotationX:0,ease:Cubic.easeInOut},0,"-=0.4" );

    //第二个按钮
    twoScrAnimate.timeLine.to(".scene2 .point .text",0,{opacity:0},"-=0.4");
    twoScrAnimate.timeLine.to(".scene2 .point1 .text",0.1,{opacity:1});
    twoScrAnimate.timeLine.to(".scene2 .point .point_icon",0,{"background-position":"left top"},"-=0.4");
    twoScrAnimate.timeLine.to(".scene2 .point1 .point_icon",0,{"background-position":"right top"},"-=0.4");

    twoScrAnimate.timeLine.add("state2");

    twoScrAnimate.timeLine.to( ".scene2_2 .left",0.4,{opacity:0} );
    twoScrAnimate.timeLine.staggerTo( ".scene2_2 .right img",0.3,{opacity:0,rotationX:90,ease:Cubic.easeInOut},0,"-=0.4" );
    twoScrAnimate.timeLine.to( ".scene2_3 .left",0.4,{opacity:1} );
    twoScrAnimate.timeLine.staggerTo( ".scene2_3 .right img",0.3,{opacity:1,rotationX:0,ease:Cubic.easeInOut},0,"-=0.4" );

    //第三个按钮
    twoScrAnimate.timeLine.to(".scene2 .point .text",0,{opacity:0},"-=0.4");
    twoScrAnimate.timeLine.to(".scene2 .point2 .text",0.1,{opacity:1});
    twoScrAnimate.timeLine.to(".scene2 .point .point_icon",0,{"background-position":"left top"},"-=0.4");
    twoScrAnimate.timeLine.to(".scene2 .point2 .point_icon",0,{"background-position":"right top"},"-=0.4");

    twoScrAnimate.timeLine.add("state3");

    twoScrAnimate.timeLine.to( ".scene2_3 .left",0.4,{opacity:0} );
    twoScrAnimate.timeLine.staggerTo( ".scene2_3 .right img",0.3,{opacity:0,rotationX:90,ease:Cubic.easeInOut},0,"-=0.4" );
    twoScrAnimate.timeLine.to( ".scene2_4 .left",0.4,{opacity:1} );
    twoScrAnimate.timeLine.staggerTo( ".scene2_4 .right img",0.3,{opacity:1,rotationX:0,ease:Cubic.easeInOut},0,"-=0.4" );

    //第四个按钮
    twoScrAnimate.timeLine.to(".scene2 .point .text",0,{opacity:0},"-=0.4");
    twoScrAnimate.timeLine.to(".scene2 .point3 .text",0.1,{opacity:1});
    twoScrAnimate.timeLine.to(".scene2 .point .point_icon",0,{"background-position":"left top"},"-=0.4");
    twoScrAnimate.timeLine.to(".scene2 .point3 .point_icon",0,{"background-position":"right top"},"-=0.4");

    twoScrAnimate.timeLine.add("state4");

    twoScrAnimate.timeLine.stop();

};

//设置第三屏动画

var threeScrAnimate = {};

threeScrAnimate.timeLine = new TimelineMax();

threeScrAnimate.init = function(){

    //首先把第三屏所有图片翻转隐藏。
    threeScrAnimate.timeLine.to(".scene3 .step img",0,{rotationX:-90,opacity:0,transformPerspective:600,transformOrigin:"center center"});

    threeScrAnimate.timeLine.staggerTo(".step3_1 img",0.2,{rotationX:0,opacity:1,ease:Cubic.easeInOut},0.1);
    threeScrAnimate.timeLine.add("thState1");

    threeScrAnimate.timeLine.staggerTo(".step3_1 img",0.3,{rotationX:-90,opacity:0,ease:Cubic.easeInOut});
    threeScrAnimate.timeLine.staggerTo(".step3_2 img",0.3,{rotationX:0,opacity:1,ease:Cubic.easeInOut});

    threeScrAnimate.timeLine.add("thState2");

    threeScrAnimate.timeLine.stop();
};


//第五屏动画
var fiveScrAnimate = {};
fiveScrAnimate.timeLine = new TimelineMax();
fiveScrAnimate.init = function(){

    //初始化所有图片，按钮隐藏
    //fiveScrAnimate.timeLine.to(".scene5 .button1,.scene5 .button2,.scene5 .area_content img",0,{ rotationX:-90,opacity:0,transformPerspective:500,transformOrigin:"center center" });
    //fiveScrAnimate.timeLine.to(".scene5 .scene5_img",0,{top:-220});
    //
    //
    //fiveScrAnimate.timeLine.to(".scene5 .scene5_img",0.5,{top:0,ease:Cubic.easeInOut});
    //fiveScrAnimate.timeLine.to(".scene5 .button1,.scene5 .button2,.scene5 .area_content img",1.2,{rotationX:0,opacity:1,ease:Elastic.easeOut},0.2);
    //
    //fiveScrAnimate.timeLine.to(".lines",0.5,{opacity:1});
    //
    //fiveScrAnimate.timeLine.add("fiveState");
    //
    //
    //fiveScrAnimate.timeLine.stop();

    fiveScrAnimate.timeLine.to(".scene5 .area_content img, .scene5 .button1,.scene5 .button2",0,{rotationX:-90,transformPerspective:600,transformOrigin:"center center"});
    fiveScrAnimate.timeLine.to(".scene5 .scene5_img",0,{top:-220});

    fiveScrAnimate.timeLine.to(".scene5 .scene5_img",0.5,{top:0,ease:Cubic.easeInOut});
    fiveScrAnimate.timeLine.staggerTo( ".scene5 .button1,.scene5 .button2,.scene5 .area_content img",1.2,{opacity:1,rotationX:0,ease:Elastic.easeOut},0.2 );

    fiveScrAnimate.timeLine.to(".scene5 .lines",0.5,{opacity:1});
    fiveScrAnimate.timeLine.add("fiveState");

    fiveScrAnimate.timeLine.stop();

};



/*
*
* 思路
*
* 定义对象
* 初始化
* 1，设置每屏的高度以及top值
* 2，设置baody的高度
* 3，浏览器可视区改变，每屏大小调整*/
/*
* 首屏图片展示
*
* 运用tweenMax按动画顺序依次改编每个人元素的样式，使其显示。*/