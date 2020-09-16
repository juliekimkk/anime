var resizeCallback = null,
    careerCntCmd = null,
    moveState = null,
    workList = [],
    careerVoCnt = null,
    $content = $('.content'),
    $sec0 = $('#Sec0'),
    $sec1 = $('#Sec1'),
    $sec2 = $('#Sec2'),
    $sec3 = $('#Sec3'),
    $sec4 = $('#Sec4'),
    $sec5 = $('#Sec5'),
    $auto = $sec0.find('.auto'),
    $btnTop = $('.btn-top'),
    $square = null,
    $careerVoCnt = $('#careerVoCnt'),
    $mainVideo = $('.main-video');

/**
 * INIT FUNCTION
 * : 768사이즈 기준으로 웹/모바일을 나눠 세팅한다.
 * w - 웹, m - 모바일
 */
var init = {
    w: function () {
        // 스크롤 제거
        PTK.$htmlBody.css({
            overflowY: 'hidden',
            height: '100%'
        });

        // 헤더 초기화
        PTK.$btnHeader.css('display', 'none');
        PTK.$headerWrap.css({
            display: 'block',
            opacity: 1
        });

        // 모바일 스크롤 이벤트 제거
        $('.js-smooth').addClass('js-smooth--end').removeClass('js-smooth transition--none');
        $('.js-smooth--end').css('opacity', 1);

        // 스퀘어 생성
        var squareFlag = document.createDocumentFragment(),
            square = document.createElement('div');
        square.setAttribute('id', 'Square');
        squareFlag.appendChild(square);
        $content.append(squareFlag);
        $square = $('#Square');
        squareMotion.case0('Square', 10, 0);
        setTimeout(function () {
            $square.addClass('active');
        });

        // 레이아웃 초기화
        $sec0.css('height', calcScreenW(880) + 'px');
        $content.find('> section').not('#Sec0').removeClass('transition--none').css({
            height: Math.ceil(calcScreenW(750)) + 'px',
            webkitTransform: 'scale(.9)',
            msTransform: 'scale(.9)',
            transform: 'scale(.9)'
        }).find('a').attr('tabIndex', '-1');
        $content.find('> section').not('#Sec0,#Sec1').css('opacity', '.5');
        $content.find('> section').not('#Sec2').find('img,video').css('width', '99.5%');
        $content.find('> section').find('img,video').css('display', 'block');
        setTimeout(function(){
            $content.find('> #Sec0').find('.kv-wrap').removeClass('transition--none');
        },1);
        $sec0.find('ul li .kv-img').addClass('after').css('height', calcScreenW(880) + (calcScreenW(750) * 0.1) / 2 + 'px');
        $sec3.find('.under-square img.m-hide').attr('src', 'img/bg_sec04.jpg');
        $sec4.find('.under-square img.m-hide').attr('src', 'img/bg_sec05.jpg');
        $sec5.find('.branch').removeClass('on');
        $sec5.find('.bottom-tag .branch-wrap').removeClass('on');

        marqueeCharW();
        $mainVideo.each(function(){
            if(this.readyState >= 2){
                this.currentTime = 0;
                this.pause();
            }
        });
        $btnTop.removeClass('on').on('click', btnTopClickListener);

        // 원 페이지 스크롤 전환
        PTK.$body.on('mousewheel DOMMouseScroll', wheelEventListener);
        PTK.$doc.on('keydown', keyDownEventListener);
        if ($auto.attr('data-state') === 'true'){
            $auto.trigger('click');
        }
        window.$wheelEvent = false;
    },
    m: function () {
        // 스크롤 생성
        PTK.$htmlBody.css({
            overflowY: '',
            height: '100%'
        });

        // 모바일 스크롤이벤트 초기화
        $('.js-smooth--end').addClass('js-smooth transition--none').removeClass('js-smooth--end');
        $('.js-smooth').css('opacity', 0);
        setTimeout(function(){
            $('.js-smooth').removeClass('transition--none');
        },1);

        // 헤더 초기화
        PTK.$headerWrap.removeClass('close').css('display', 'block');

        // 스퀘어 초기화
        $('#Square').remove();

        // tabIndex 초기화
        $('a[tabIndex]').removeAttr('tabIndex');

        // 레이아웃 초기화
        $('.blind-square').removeClass('blind-square');
        calcScrollTop('Sec0', 1);
        $sec0.css({
            height: 'auto',
            opacity: 1
        }).addClass('appear').siblings().removeClass('appear');
        $content.find('> section').not('#Sec0').addClass('transition--none').css({
            height: 'auto',
            opacity: 1,
            webkitTransform: '',
            msTransform: '',
            transform: ''
        });
        setTimeout(function(){
            $content.find('> #Sec0').find('.kv-wrap').removeClass('transition--none');
            $sec1.removeClass('transition-none');
        },1);
        $sec0.find('.kv-info,.kv-name,.indi-wrap').css('opacity', 1);
        smoothMotionType1('js-smooth', 1.1); // common.js

        marqueeCharW();
        $btnTop.off('click', btnTopClickListener);
        PTK.$body.off('mousewheel DOMMouseScroll', wheelEventListener);
        PTK.$doc.off('keydown', keyDownEventListener);
        // 슬라이드 재생 활성화
        if ($auto.attr('data-state') === 'true'){
            $auto.trigger('click');
        }
        window.$wheelEvent = true;
    }
};

$(function () {
    /**
     * INIT
     */
    if (PTK.$body.hasClass('js-w'))
        init.w();
    else
        init.m();

    $sec0.imagesLoaded()
        .always(function (instance) {
            $('.mask').remove();
            // if ( PTK.$jsW.length )
            // $('.main-kv ul li .kv-img'); // 이미지 로드
        });
    // .progress(function(instance,image){
    //     var result = image.isLoaded ? 'loaded' : 'broken';
    //     console.log( 'progress: ' + result + ' for ' + image.img.src );
    // });

    /**
     * Layer Popup
     */
    // mainLayerPop();
    function mainLayerPop () {
        var $layer_popup_wrap = $('.layer-popup-wrap'),
            $layer_dim = $('.layer-dim');

        if(PTK.$body.hasClass('js-w')){
            window.$wheelEvent = true;
        } else {
            PTK.$body.css('overflowY','hidden');
        }
        $layer_popup_wrap.on('click', '.btn-layer-close', function(e){
            $layer_popup_wrap.hide().removeClass('on');
            $layer_dim.attr('style', 'display:none !important');
            if(PTK.$body.hasClass('js-w')) {
                window.$wheelEvent = false;
            } else {
                PTK.$body.css('overflowY','visible');
            }
            // if (layerPopVideo){
            //     layerPopVideo.stopVideo();
            // }
            $auto.trigger('click');
            return false;
        });
    }

    /**
     * KV Motion
     */
    $sec0.jdSlider({ // jquery.jdSlider.js
        slide: '.slide-area',
        indicate: '.indi-wrap',
        isSliding: false,
        isAuto: true,
        isTouch: false,
        isDrag: false,
        isCursor: false,
        speed: 1500,
        interval: 6000,
        callback: function(){
            var $list = $sec0.find('> ul > li'),
                idx = $list.parent().find('> .on').index();
            if (PTK.$jsW.length && $sec0.hasClass('appear'))
                squareMotion.case0('Square', 1750, idx + 1);
        }
    });

    /**
     * DATA
     */
    callAjax('/api/main', 'post', {}, function (response, status, xhr) { // common.js
        workList = response.data.workList;
        careerVoCnt = response.data.careerVo.total_count;
        $sec2.find('.sec-tit .work-tit').html(workList[0].work_name); // 타이틀 init
        var $list = $sec2.find('.work-list > li'),
            $link = $sec2.find('.work-link > li'),
            i;
        if (PTK.$jsW.length) {
            for (i = 0; i < $list.length; i++) {
                $list.eq(i).find('img.m-hide').attr('src', workList[i].main_off_img_path).css('height', calcScreenW(250) + 'px');
                $list.eq(i).find('img.img-load').attr('src', workList[i].main_img_path);
                $link.eq(i).find('a').attr('href', './work/index.html#' + workList[i].work_id);
            }
        } else {
            for (i = 0; i < $list.length; i++) {
                $list.eq(i).find('.tit-in').html(workList[i].work_name);
                $list.eq(i).find('img.m-show').attr('src', workList[i].m_main_img_path);
                $list.eq(i).find('a').attr('href', './work/index.html#' + workList[i].work_id);
            }
        }
    }, function (xhr, status, errorThrown) {
        console.log(xhr + '/' + status + '/' + errorThrown);
    });

    // hover click
    PTK.$doc
        .on('click', '#Sec0 .kv-link', function(e){
            e.preventDefault();
            var $this = $(this),
                cb = linkCallback($this), // common.js
                idx = $this.closest('li').index(),
                label;
            // kv 별로 애널리틱스 달기
            label = $sec0.find('.slide-area').find('> li').eq(idx).attr('data-event-label')
            analyticsSubmit('Main-KV', 'Clik-Link', label); // common.js
            setTimeout(cb, 300);
        })
        .on('mouseenter', '#Sec2 .work-link a', function () {
            if (PTK.$jsW.length) {
                var idx = $(this).closest('li').index(),
                    $img = $sec2.find('.work-list li:eq(' + idx + ') img.m-hide');
                $img.attr('src', workList[idx].main_img_path).addClass('hover');
                $sec2.find('.sec-tit').find('.work-tit').html(workList[idx].work_name);
            }
        })
        .on('mouseleave', '#Sec2 .work-link a', function () {
            if (PTK.$jsW.length) {
                var idx = $(this).closest('li').index(),
                    $img = $sec2.find('.work-list li:eq(' + idx + ') img.m-hide');
                $img.attr('src', workList[idx].main_off_img_path).removeClass('hover');
            }
        })
        .on('click', '#Sec2 .work-list a', function (e) {
            e.preventDefault();
            if (PTK.$jsM.length) {
                var $this = $(this),
                    cb = linkCallback($this), // common.js
                    idx = $this.closest('li').index(),
                    href = $this.attr('href').split('#')[1];
                // 기존 href 해쉬값에서 지정값으로 변경
                // if (idx === 0 || idx === 1){
                //     href = $this.attr('data-label');
                // }
                analyticsSubmit('Main-Work', 'Click-Link', href); // common.js
                setTimeout(cb, 300);
            }else {
                e.stopPropagation();
            }
        })
        .on('click', '#Sec2 .work-link a', function (e) {
            e.preventDefault();
            var $this = $(this),
                cb = linkCallback($this), // common.js
                idx = $this.closest('li').index(),
                href = $this.attr('href').split('#')[1];
            if (idx === 0 || idx === 1){
                href = $sec2.find('.work-list').find('li').eq(idx).find('a').attr('data-label');
            }
            analyticsSubmit('Main-Work', 'Click-Link', href); // common.js
            setTimeout(cb, 300);
        });
    /**
     * BTN
     */
    PTK.$btnHeader
        .on('mouseenter', function () {
            if (PTK.$jsW.length) {
                PTK.$btnHeader.stop().fadeOut(200);
                PTK.$headerWrap.stop().delay(100).fadeIn(400);
            }
        })
        .on('focusin', function(){
            if (PTK.$jsW.length) {
                PTK.$btnHeader.stop().fadeOut(200);
                PTK.$headerWrap.stop().delay(100).fadeIn(400);
                setTimeout(function(){
                    PTK.$logo.focus();
                }, 500);
            }
        });
    PTK.$header.on('mouseleave', function () {
        if (!$sec0.hasClass('appear') && PTK.$jsW.length) {
            PTK.$headerWrap.stop().fadeOut(200);
            PTK.$btnHeader.stop().delay(100).fadeIn(400);
        }
    });
    $btnTop
        .on('mouseenter', function () {
            $(this).addClass('js-btn-bounce');
        })
        .on('mouseleave', function () {
            $(this).removeClass('js-btn-bounce');
        });

    /**
     * ANALTICS
     */
    PTK.$doc.on('click', '.btn-more a', function (e) {
        e.preventDefault();
        var $this = $(this),
            cb = linkCallback($this), // common.js
            idx = $this.closest('section').attr('id').substr(3, 1);
        switch (Number(idx)) {
            case 1:
                analyticsSubmit('Main-Service', 'Click-Link', 'More-Service'); // common.js
                setTimeout(cb, 300);
                break;
            // case 2:
            //     analyticsSubmit('Main-Work', 'Click-Link', 'More-Work');
            //     setTimeout(cb, 300);
            //     break;
            case 3:
                analyticsSubmit('Main-Culture', 'Click-Link', 'More-How'); // common.js
                setTimeout(cb, 300);
                break;
            case 4:
                analyticsSubmit('Main-Culture', 'Click-Link', 'More-Where'); // common.js
                setTimeout(cb, 300);
                break;
            case 5:
                analyticsSubmit('Main-Career', 'Click-Link', 'More-Career'); // common.js
                setTimeout(cb, 300);
                break;
            default:
                break;
        }
    });
});

if (window.addEventListener){
    window.addEventListener('resize', mainResizeFn);
    window.addEventListener('scroll', mainScrollFn);
} else if (window.attachEvent){
    window.attachEvent('onresize', mainResizeFn);
    window.attachEvent('onscroll', mainScrollFn);
}
function mainResizeFn(){
    var winW = window.innerWidth;
    deviceChange();
    PTK.$win.trigger('resizeFn');
    if (winW >= 1024) {
        clearTimeout(resizeCallback);
        layoutResize();
        resizeCallback = setTimeout(layoutResize, 1000);
    } else if (winW < 1024) {
        marqueeCharW();
    }
}
function mainScrollFn(){
    var st = PTK.$win.scrollTop(),
        winH = window.innerHeight,
        $workList = $sec2.find('.work-list'),
        $this;
    if (PTK.$jsM.length) {
        motionObj.execution(1.1); // common.js
        // Sec2
        $sec2.find('.under-square').find('li:lt(3)').find('img').each(function () {
            $this = $(this);
            if (st + winH / 2 >= $this.offset().top && st + winH / 2 <= $this.offset().top + $this.height()) {
                $this.closest('li').addClass('on').siblings().removeClass('on');
            }
        });
        if (st + winH / 2 < $workList.offset().top || st + winH / 2 > $workList.offset().top + $workList.height()) {
            $sec2.find('.under-square li:lt(3)').removeClass('on');
        }
        if (st + winH / 2 >= $careerVoCnt.offset().top) {
            careerVoCntFnc();
        }
    }
}

/**
 * RESIZE
 */
function deviceChange() {
    var winW = window.innerWidth,
        $list, $link, i,
        workListArr = window.workList;
    if (winW >= 1024 && document.getElementById('Square') === null) {
        init.w();
        layerPopResize('w');
        squareMotion.case0('Square', 10, $sec0.find('.active').index());
        $list = $sec2.find('.work-list').find('> li');
        $link = $sec2.find('.work-link').find('> li');
        for (i = 0; i < $list.length; i++) {
            $list.eq(i).find('img.m-hide').attr('src', workListArr[i].main_off_img_path).css('height', calcScreenW(250) + 'px');
            $list.eq(i).find('img.img-load').attr('src', workListArr[i].main_img_path);
            $link.eq(i).find('a').attr('href', './work/index.html#' + workList[i].work_id);
        }
    } else if (winW < 1024 && document.getElementById('Square')) {
        init.m();
        layerPopResize('m');
        $list = $sec2.find('.work-list > li');
        for (i = 0; i < $list.length; i++) {
            $list.eq(i).find('.tit-in').html(workListArr[i].work_name);
            $list.eq(i).find('img.m-show').attr('src', workListArr[i].m_main_img_path);
            $list.eq(i).find('a').attr('href', './work/index.html#' + workList[i].work_id);
        }
    }
}

function layoutResize() {
    var winW = window.innerWidth,
        currentIdx = $content.find('> section.appear').index(),
        SPEED = 0;
    if (winW >= 1024) {
        $sec0.css('height', calcScreenW(880) + 'px');
        $content.find('> section').not('#Sec0').css('height', calcScreenW(750) + 'px');
        $sec0.find('ul li .kv-img').css('height', calcScreenW(880) + (calcScreenW(750) * 0.1) / 2 + 'px');
        $sec2.find('.under-square').find('li').find('img.m-hide').css('height', calcScreenW(250) + 'px');
        $.globalEval('squareMotion.case' + currentIdx + '("Square", ' + SPEED + ')');
        calcScrollTop('Sec' + currentIdx);
        marqueeCharW();
    }
}

function layerPopResize(device){
    var dv = device,
        $layer_popup_wrap = $('.layer-popup-wrap');
    if($layer_popup_wrap.hasClass('on')){
        if( dv === 'w'){
            window.$wheelEvent = true;
        } else if( dv === 'm'){
            PTK.$body.css('overflowY','hidden');
        }
    }
}

/**
 * CONTROL
 */
function cssTransfrm(id, val) {
    document.getElementById(id).style.webkitTransform = val;
    document.getElementById(id).style.transform = val;
}

function calcScreenW(val) {
    var INIT_W = 1920;
    return parseInt(val) / INIT_W * window.innerWidth;
}

function wheelEventListener(event, delta) {
    var winW = window.innerWidth;
    if (winW < 1024) return false;
    event.preventDefault();
    event.stopPropagation();
    if (delta < 0 && !$wheelEvent) { // 아래로 휠
        window.$wheelEvent = true;
        secMoveAddClass(delta);
    } else if (!$wheelEvent) { // 위로 휠
        window.$wheelEvent = true;
        secMoveAddClass(delta);
    }
}
function keyDownEventListener(event){
    var key = event.keycode || event.which;
    if (key === 38 && !$wheelEvent){ // 위
        window.$wheelEvent = true;
        secMoveAddClass(1);
        PTK.$logo.focus();
    }else if (key === 40 && !$wheelEvent){ // 아래
        window.$wheelEvent = true;
        secMoveAddClass(-1);
        PTK.$logo.focus();
    }
}

function btnTopClickListener(e) {
    if (window.$wheelEvent)
        return false;
    window.$wheelEvent = true;

    // 탑버튼 숨김
    $btnTop.removeClass('on');
    // sec0 초기화
    calcScrollTop('Sec0', 1);
    $sec0.addClass('transition--none').css('opacity', '1').addClass('appear').siblings().removeClass('appear');
    setTimeout(function () {
        $sec0.removeClass('transition--none');
    }, 1);
    $sec0.find('.kv-info,.kv-name,.indi-wrap').css('opacity', '1');
    cssTransfrm('Sec0', 'none', '1');
    // sec1 초기화
    $sec1.addClass('transition--none').css('opacity', '1');
    setTimeout(function () {
        $sec1.removeClass('transition--none');
    }, 1);
    cssTransfrm('Sec1', 'scale(.9)');
    cssTransfrm('Square', 'scale(1)');
    // 스퀘어 초기화
    $square.removeClass('active');
    setTimeout(function () {
        $square.addClass('active');
    }, 1);
    squareMotion.case0('Square', 0, $sec0.find('.active').index());
    // 헤더 초기화
    PTK.$btnHeader.stop().fadeOut(200);
    PTK.$headerWrap.stop().delay(100).fadeIn(400);
    // tabIndex 갱신
    $('a[tabIndex]').removeAttr('tabIndex');
    $content.find('> section').not('#Sec0').find('a').attr('tabIndex', '-1');
    if(!PTK.isMobile){
        $sec1.find($mainVideo.selector)[0].currentTime = 0;
        $sec1.find($mainVideo.selector)[0].pause();
    }
    // 자동재생 재가동
    if ($auto.attr('data-state') === 'true')
        $auto.trigger('click');
    window.$wheelEvent = false;
    e.preventDefault();
}

function secMoveAddClass(delta) {
    var $id = null,
        currentIdx = $content.find('> section.appear').index();
    if ((delta > 0 && currentIdx === 0) || (delta < 0 && currentIdx === 5)) {
        window.$wheelEvent = false;
        return false;
    }
    if (delta < 0) {
        $id = $('#Sec' + (parseInt(currentIdx) + 1));
        $id.addClass('appear').siblings().removeClass('appear');
        calcScrollTop($id.attr('id'));
        secMoveTargetMove('appear');
        PTK.$headerWrap.stop().fadeOut(200);
        PTK.$btnHeader.stop().delay(100).fadeIn(400);
    } else if (delta > 0) {
        $id = $('#Sec' + (parseInt(currentIdx) - 1));
        $id.addClass('appear').siblings().removeClass('appear');
        calcScrollTop($id.attr('id'));
        secMoveTargetMove('appear');
        if (currentIdx === 1) {
            PTK.$btnHeader.stop().fadeOut(200);
            PTK.$headerWrap.stop().delay(100).fadeIn(400);
        }else if (PTK.$headerWrap.css('display') === 'block'){
            PTK.$headerWrap.stop().fadeOut(200);
            PTK.$btnHeader.stop().delay(100).fadeIn(400);
        }
    }
}

function marqueeCharW() {
    var $marquee = $('.marquee').find('span');
    $marquee.css('width', 'auto');
    var CHAR_W = $marquee.eq(0).width() + calcScreenW(100);
    $content.find('.job-sec .job-state .moving').css('width', CHAR_W + 'px');
    $content.find('.job-sec .job-state .marquee').css('width', CHAR_W * 2 + 'px');
    $marquee.css({
        float: 'left',
        width: CHAR_W + 'px'
    });
}

function careerVoCntFnc() {
    if (careerCntCmd === null) {
        var i;
        for (i = 1; i <= window.careerVoCnt; i++) {
            if (window.careerVoCnt < 10) {
                careerCntCmd += 'countExeSet' + i + ' = setTimeout(function(){$careerVoCnt.html("0"+' + i + ');' +
                    '$careerVoCnt.html().split("")[1] == 1 ? $careerVoCnt.parent(".count").addClass("one2").removeClass("one") : ' +
                    '$careerVoCnt.parent(".count").removeClass("one one2");}, ' +
                    (i * 100) + ');';
            } else if (window.careerVoCnt >= 10) {
                if (i <= Math.ceil(window.careerVoCnt / 10) * 8) {
                    careerCntCmd += 'countExeSet' + i + ' = setTimeout(function(){' + i + ' < 10 ? $careerVoCnt.html("0"+' + i + ') : $careerVoCnt.html(' + i + ');' +
                        '$careerVoCnt.html().split("")[0] == 1 ? $careerVoCnt.parent(".count").addClass("one").removeClass("one2") : ' +
                        '$careerVoCnt.html().split("")[1] == 1 ? $careerVoCnt.parent(".count").addClass("one2").removeClass("one") : ' +
                        '$careerVoCnt.parent(".count").removeClass("one one2");}, ' +
                        (i * (1000 / window.careerVoCnt)) + ');';
                } else {
                    careerCntCmd += 'countExeSet' + i + ' = setTimeout(function(){' + i + ' < 10 ? $careerVoCnt.html("0"+' + i + ') : $careerVoCnt.html(' + i + ');' +
                        '$careerVoCnt.html().split("")[0] == 1 ? $careerVoCnt.parent(".count").addClass("one").removeClass("one2") : ' +
                        '$careerVoCnt.html().split("")[1] == 1 ? $careerVoCnt.parent(".count").addClass("one2").removeClass("one") : ' +
                        '$careerVoCnt.parent(".count").removeClass("one one2");}, ' +
                        (((i - 1) * (1000 / window.careerVoCnt)) +
                            ((i - (Math.ceil(window.careerVoCnt / 10) * 8)) * 100)) + ');';
                }
            }
        }
        $.globalEval(careerCntCmd);
    }
}

/**
 * 마우스 오버시 배경 전환
 */
var bgFill = {
    init: function (obj, dir) {
        window.moveState = dir;
        obj.on('mousemove', bgFillOnMousemove).on('mouseleave', bgFillOnMouseleave);
    },
    on1: function (SPEED) {
        $sec3.find('.under-square').removeClass('blind-square');
        $sec3.find('.upper-square').find('.sec-tit').find('> *').css('opacity', 0);
        $sec3.find('.upper-square p').css('opacity', 0);
        if ($sec3.hasClass('appear'))
            squareMotion.case1('Square', SPEED);
    },
    on2: function (SPEED) {
        $sec4.find('.under-square').removeClass('blind-square');
        $sec4.find('.upper-square').find('.sec-tit').find('> *').css('opacity', 0);
        $sec4.find('.upper-square p').css('opacity', 0);
        if ($sec4.hasClass('appear'))
            squareMotion.case1('Square', SPEED);
    },
    off1: function () {
        $sec3.find('.under-square').addClass('blind-square');
        $sec3.find('.upper-square').find('.sec-tit').find('> *').css('opacity', 1);
        $sec3.find('.upper-square p').css('opacity', 1);
        cssTransfrm('Sec3', 'none');
        if ($sec3.hasClass('appear')) {
            $square.css({
                top: PTK.$win.height() / 2 + 'px',
                width: Math.ceil(calcScreenW(865)) + 'px',
                height: Math.ceil(calcScreenW(750)) + 'px',
                marginTop: '-' + calcScreenW(375) + 'px',
                marginLeft: '0px',
                borderWidth: calcScreenW(30) + 'px',
                borderColor: '#3c3c3c',
                opacity: 1
            });
        }
    },
    off2: function () {
        $sec4.find('.under-square').addClass('blind-square');
        $sec4.find('.upper-square').find('.sec-tit').find('> *').css('opacity', 1);
        $sec4.find('.upper-square p').css('opacity', 1);
        cssTransfrm('Sec4', 'none');
        if ($sec4.hasClass('appear')) {
            $square.css({
                top: PTK.$win.height() / 2 + 'px',
                width: Math.ceil(calcScreenW(865)) + 'px',
                height: Math.ceil(calcScreenW(750)) + 'px',
                marginTop: '-' + calcScreenW(375) + 'px',
                marginLeft: '-' + calcScreenW(865) + 'px',
                borderWidth: calcScreenW(30) + 'px',
                borderColor: '#3c3c3c',
                opacity: 1
            });
        }
    }
};

function bgFillOnMousemove(e) {
    var x = e.pageX,
        $this = $(this);
    if (moveState !== 'left' && x < parseFloat(window.innerWidth / 2)) {
        moveState = 'left';
        if ($this.closest('#Sec3').length && $sec3.hasClass('appear'))
            bgFill.off1();
        if ($this.closest('#Sec4').length && $sec4.hasClass('appear'))
            bgFill.on2(500);
    } else if (moveState !== 'right' && x > parseFloat(window.innerWidth / 2)) {
        moveState = 'right';
        if ($this.closest('#Sec3').length && $sec3.hasClass('appear'))
            bgFill.on1(500);
        if ($this.closest('#Sec4').length && $sec4.hasClass('appear'))
            bgFill.off2();
    }
}

function bgFillOnMouseleave(e) {
    var $this = $(this);
    if (moveState == 'right') {
        if ($this.closest('#Sec3').length && $sec3.hasClass('appear'))
            bgFill.off1();
        moveState = 'left';
    } else if (moveState == 'left') {
        if ($this.closest('#Sec4').length && $sec4.hasClass('appear'))
            bgFill.off2();
        moveState = 'right';
    }
}

function calcScrollTop(id, spd) {
    var calcTop = Math.abs($content.offset().top) + $('#' + id).offset().top - (PTK.$win.height() - calcScreenW(750)) / 2;
    // 첫번째 마지막 예외 따로 하기
    if ($('#' + id).index() === 0) {
        if (spd === 1) {
            /*            $content.css({
                            'top': 0,
                            '-webkit-transition': 'none',
                            'transition': 'none'
                        });
                        setTimeout(function () {
                            $content.css({
                                '-webkit-transition': 'top 500ms linear',
                                'transition': 'top 500ms linear'
                            });
                        }, 1);*/
            $content.addClass('transition--none').css('top', 0);
            setTimeout(function(){
                $content.removeClass('transition--none');
            }, 1);
        } else {
            $content.css('top', 0);
        }
    } else {
        if ($('#' + id).css('-webkit-transform') === undefined) {
            if ($('#' + id).css('transform') === 'none' || $('#' + id).css('transform').split(' ').join('') == 'matrix(1,0,0,1,0,0)')
                $content.css('top', '-' + calcTop + 'px');
            else
                $content.css('top', '-' + (calcTop - (calcScreenW(750) * 0.1) / 2) + 'px');
        } else {
            if ($('#' + id).css('-webkit-transform') === 'none' || $('#' + id).css('-webkit-transform').split(' ').join('') == 'matrix(1,0,0,1,0,0)')
                $content.css('top', '-' + calcTop + 'px');
            else
                $content.css('top', '-' + (calcTop - (calcScreenW(750) * 0.1) / 2) + 'px');
        }
    }
}

function secMoveTargetMove(cls) {
    var $target = $('.' + cls),
        idx = $target.index();
    if (!PTK.$jsW.length)
        return false;
    switch (idx) {
        case 0: secMotion.case0();
            break;
        case 1: secMotion.case1();
            break;
        case 2: secMotion.case2();
            break;
        case 3: secMotion.case3();
            break;
        case 4: secMotion.case4();
            break;
        case 5: secMotion.case5();
            break;
        case 6: secMotion.case_6();
            break;
    }
}

/**
 * SECTION 모션
 */
var secMotion = {
    case0: function () {
        var SPEED = 500,
            easing = 'linear';
        $btnTop.removeClass('on');
        $sec0.css('opacity', '1');
        if(!PTK.isMobile){
            $sec1.find($mainVideo.selector)[0].currentTime = 0;
            $sec1.find($mainVideo.selector)[0].pause();
        }
        setTimeout(function () {
            $sec0.find('.kv-info,.kv-name,.indi-wrap').css('opacity', '1');
            cssTransfrm('Sec0', 'none', '1');
            /* tabIndex 갱신 */
            $('a[tabIndex]').removeAttr('tabIndex');
            $content.find('> section').not('#Sec0').find('a').attr('tabIndex', '-1');
        }, SPEED);
        squareMotion.case0('Square', SPEED, $sec0.find('.active').index());
        cssTransfrm('Sec1', 'scale(.9)');
        setTimeout(function () {
            if ($auto.attr('data-state') === 'true')
                $auto.trigger('click'); // 자동재생 재가동
            window.$wheelEvent = false;
        }, SPEED * 2);
    },
    case1: function () {
        var SPEED = 500,
            easing = 'linear';
        // 자동재생 정지
        if ($auto.attr('data-state') === 'false')
            $auto.trigger('click');
        $btnTop.addClass('on');
        $sec1.css('opacity', '1');
        $sec2.css('opacity', '0.2');
        $sec0.find('.kv-info,.kv-name,.indi-wrap').css('opacity', '0');
        $sec0.closest('.container').find('.bg').css('opacity', '0');
        $sec0.css('opacity', '0');
        squareMotion.case1('Square', SPEED);
        cssTransfrm('Sec2', 'scale(.9)');
        setTimeout(function () {
            cssTransfrm('Sec0', 'none');
            cssTransfrm('Sec1', 'scale(1)');
            /* tabIndex 갱신 */
            $('a[tabIndex]').removeAttr('tabIndex');
            $content.find('> section').not('#Sec1').find('a').attr('tabIndex', '-1');
        }, SPEED);
        setTimeout(function () {
            cssTransfrm('Sec1', 'none');
            if(!PTK.isMobile)
                $sec1.find($mainVideo.selector)[0].play();
        }, SPEED * 2);
        setTimeout(function(){
            if (Number(PTK.ieVer) === 11) { // IE11 이슈
                $content.animate({
                    top: '+=0.01'
                }, 1, function () {
                    window.$wheelEvent = false;
                });
            } else {
                window.$wheelEvent = false;
            }
        }, SPEED * 2 + 50);
    },
    case2: function () {
        var SPEED = 500,
            easing = 'linear';
        $sec1.css('opacity', '0.2');
        $sec2.css('opacity', '1');
        $sec3.css('opacity', '0.2');
        squareMotion.case2('Square', SPEED);
        cssTransfrm('Sec1', 'scale(.9)');
        cssTransfrm('Sec3', 'scale(.9)');
        $sec3.find('.upper-square').off('mousemove', bgFillOnMousemove).off('mouseleave', bgFillOnMouseleave);
        $sec3.find('.under-square').removeClass('blind-square');
        $sec3.find('.upper-square').find('.sec-tit').find('> *').css('opacity', '0');
        $sec3.find('.upper-square p').addClass('trans').css('opacity', '0');
        if(!PTK.isMobile){
            $sec1.find($mainVideo.selector)[0].currentTime = 0;
            $sec1.find($mainVideo.selector)[0].pause();
            $sec3.find($mainVideo.selector)[0].currentTime = 0;
            $sec3.find($mainVideo.selector)[0].pause();
        }
        setTimeout(function () {
            cssTransfrm('Sec2', 'scale(1)');
            /* tabIndex 갱신 */
            $('a[tabIndex]').removeAttr('tabIndex');
            $content.find('> section').not('#Sec2').find('a').attr('tabIndex', '-1');
            $sec2.find('.work-list a').attr('tabIndex', '-1');
        }, SPEED);
        setTimeout(function () {
            cssTransfrm('Sec2', 'none');
            if (Number(PTK.ieVer) === 11) { // IE11 이슈
                $content.animate({
                    top: '-=0.01'
                }, 1, function () {
                    window.$wheelEvent = false;
                });
            } else {
                window.$wheelEvent = false;
            }
        }, SPEED * 2);
    },
    case3: function () {
        var SPEED = 500,
            easing = 'linear';
        $sec2.css('opacity', '0.2');
        $sec3.css('opacity', '1');
        $sec4.css('opacity', '0.2');
        squareMotion.case3('Square', SPEED);
        cssTransfrm('Sec2', 'scale(.9)');
        cssTransfrm('Sec4', 'scale(.9)');
        $sec4.find('.upper-square').off('mousemove', bgFillOnMousemove).off('mouseleave', bgFillOnMouseleave);
        $sec4.find('.under-square').removeClass('blind-square');
        $sec4.find('.upper-square').find('.sec-tit').find('> *').css('opacity', '0');
        $sec4.find('.upper-square p').addClass('trans').css('opacity', '0');
        if(!PTK.isMobile){
            $sec4.find($mainVideo.selector)[0].currentTime = 0;
            $sec4.find($mainVideo.selector)[0].pause();
        }
        setTimeout(function () {
            cssTransfrm('Sec3', 'scale(1)');
            /* tabIndex 갱신 */
            $('a[tabIndex]').removeAttr('tabIndex');
            $content.find('> section').not('#Sec3').find('a').attr('tabIndex', '-1');
        }, SPEED);
        setTimeout(function () {
            $sec3.find('.under-square').addClass('blind-square');
            cssTransfrm('Sec3', 'none');
        }, SPEED * 2);
        setTimeout(function () {
            if (Number(PTK.ieVer) === 11)
                calcScrollTop('Sec3');  // IE11 이슈
            $sec3.find('.upper-square').find('.sec-tit').find('> *').addClass('transition--all').css('opacity', 1);
        }, SPEED * 3 + 50);
        setTimeout(function () {
            if(!PTK.isMobile)
                $sec3.find($mainVideo.selector)[0].play();
            $sec3.find('.upper-square').find('p').addClass('transition--all').css('opacity', 1);
        }, SPEED * 4);
        setTimeout(function () {
            bgFill.init($sec3.find('.upper-square'), 'left');
            window.$wheelEvent = false;
        }, SPEED * 5);
    },
    case4: function () {
        var SPEED = 500,
            easing = 'linear';
        $sec3.css('opacity', '.2');
        $sec4.css('opacity', '1');
        $sec5.css('opacity', '.2');
        squareMotion.case4('Square', SPEED);
        cssTransfrm('Sec3', 'scale(.9)');
        cssTransfrm('Sec5', 'scale(.9)');
        $sec3.find('.upper-square').off('mousemove', bgFillOnMousemove).off('mouseleave', bgFillOnMouseleave);
        $sec3.find('.under-square').removeClass('blind-square');
        $sec3.find('.upper-square').find('.sec-tit').find('> *').css('opacity', '0');
        $sec3.find('.upper-square p').addClass('trans').css('opacity', '0');
        if(!PTK.isMobile){
            $sec3.find($mainVideo.selector)[0].currentTime = 0;
            $sec3.find($mainVideo.selector)[0].pause();
        }
        setTimeout(function () {
            /* 임시 추가 */
            cssTransfrm('Square', 'scale(1)');
            cssTransfrm('Sec4', 'scale(1)');
            /* tabIndex 갱신 */
            $('a[tabIndex]').removeAttr('tabIndex');
            $content.find('> section').not('#Sec4').find('a').attr('tabIndex', '-1');
            /* 임시 끝 */
        }, SPEED);
        setTimeout(function () {
            $sec4.find('.under-square').addClass('blind-square');
            cssTransfrm('Sec4', 'none');
        }, SPEED * 2);
        setTimeout(function () {
            if (Number(PTK.ieVer) === 11)
                calcScrollTop('Sec4'); // IE11 이슈
            $sec4.find('.upper-square').find('.sec-tit').find('> *').addClass('transition--all').css('opacity', 1);
        }, SPEED * 3 + 50);
        setTimeout(function () {
            if(!PTK.isMobile)
                $sec4.find($mainVideo.selector)[0].play();
            $sec4.find('.upper-square p').addClass('transition--all').css('opacity', 1);
        }, SPEED * 4);
        setTimeout(function () {
            bgFill.init($sec4.find('.upper-square'), 'right');
            window.$wheelEvent = false;
        }, SPEED * 5);
    },
    case5: function () {
        var SPEED = 500,
            easing = 'linear';
        $sec4.css('opacity', '.2');
        $sec5.css('opacity', '1');
        squareMotion.case5('Square', SPEED);
        /* 임시 추가 */
        $sec4.find('.upper-square').off('mousemove', bgFillOnMousemove).off('mouseleave', bgFillOnMouseleave);
        $sec4.find('.under-square').removeClass('blind-square');
        $sec4.find('.upper-square').find('.sec-tit').find('> *').css('opacity', '0');
        $sec4.find('.upper-square p').addClass('trans').css('opacity', '0');
        if(!PTK.isMobile){
            $sec4.find($mainVideo.selector)[0].currentTime = 0;
            $sec4.find($mainVideo.selector)[0].pause();
        }
        /* 임시 끝 */
        setTimeout(function () {
            cssTransfrm('Sec4', 'scale(.9)');
            cssTransfrm('Square', 'scale(.9)');
            cssTransfrm('Sec5', 'scale(1)');
            marqueeCharW();
            /* tabIndex 갱신 */
            $('a[tabIndex]').removeAttr('tabIndex');
            $content.find('> section').not('#Sec5').find('a').attr('tabIndex', '-1');
        }, SPEED);
        setTimeout(function () {
            careerVoCntFnc();
            window.$wheelEvent = false;
        }, SPEED * 2);
    }
};

/**
 * SQUARE 모션
 */
var squareMotion = {
    case0: function (id) {
        var $id = $('#' + id),
            txtLineH = calcScreenW(162);
        $id.css({
            top: 0,
            width: $sec0.find('li').eq(0).find('.kv-tit').outerWidth() + calcScreenW(30) * 2 + 'px',
            height: txtLineH + calcScreenW(30) * 2 + 'px',
            marginTop: Math.abs($sec0.find('li').eq(0).find('.kv-tit').offset().top) - calcScreenW(30) + 'px',
            marginLeft: '-' + ($sec0.find('li').eq(0).find('.kv-tit').outerWidth() / 2 + calcScreenW(30)) + 'px',
            borderWidth: calcScreenW(30) + 'px',
            borderColor: '#3c3c3c',
            opacity: 1
        });
    },
    case1: function (id) {
        var $id = $('#' + id);
        $id.css({
            top: PTK.$win.height() / 2 + 'px',
            width: Math.ceil(calcScreenW(1730)) + 'px',
            height: Math.ceil(calcScreenW(750)) + 'px',
            marginTop: '-' + calcScreenW(375) + 'px',
            marginLeft: '-' + calcScreenW(865) + 'px',
            borderWidth: calcScreenW(30) + 'px',
            borderColor: '#3c3c3c',
            opacity: 1
        });
    },
    case2: function (id, spd) {
        squareMotion.case1(id, spd);
    },
    case3: function (id, spd) {
        var $id = $('#' + id);
        if (spd) {
            squareMotion.case1(id, spd);
            setTimeout(function () {
                $id.addClass('active').css({
                    top: PTK.$win.height() / 2 + 'px',
                    width: Math.ceil(calcScreenW(865)) + 'px',
                    height: Math.ceil(calcScreenW(750)) + 'px',
                    marginTop: '-' + calcScreenW(375) + 'px',
                    marginLeft: '0px',
                    borderWidth: calcScreenW(30) + 'px',
                    borderColor: '#3c3c3c',
                    opacity: 1
                });
            }, spd * 2);
        } else {
            $id.removeClass('active').css({
                top: PTK.$win.height() / 2 + 'px',
                width: Math.ceil(calcScreenW(865)) + 'px',
                height: Math.ceil(calcScreenW(750)) + 'px',
                marginTop: '-' + calcScreenW(375) + 'px',
                marginLeft: '0px',
                borderWidth: calcScreenW(30) + 'px',
                borderColor: '#3c3c3c',
                opacity: 1
            });
            setTimeout(function () {
                $id.addClass('active');
            }, 1);
        }
    },
    case4: function (id, spd) {
        var $id = $('#' + id);
        if (spd) {
            squareMotion.case1(id, spd);
            setTimeout(function () {
                $id.addClass('active').css({
                    top: PTK.$win.height() / 2 + 'px',
                    width: Math.ceil(calcScreenW(865)) + 'px',
                    height: Math.ceil(calcScreenW(750)) + 'px',
                    marginTop: '-' + calcScreenW(375) + 'px',
                    marginLeft: '-' + calcScreenW(865) + 'px',
                    borderWidth: calcScreenW(30) + 'px',
                    borderColor: '#3c3c3c',
                    opacity: 1
                });
            }, spd * 2);
        } else {
            $id.removeClass('active').css({
                top: PTK.$win.height() / 2 + 'px',
                width: Math.ceil(calcScreenW(865)) + 'px',
                height: Math.ceil(calcScreenW(750)) + 'px',
                marginTop: '-' + calcScreenW(375) + 'px',
                marginLeft: '-' + calcScreenW(865) + 'px',
                borderWidth: calcScreenW(30) + 'px',
                borderColor: '#3c3c3c',
                opacity: 1
            });
            setTimeout(function () {
                $id.addClass('active');
            }, 1);
        }
    },
    case5: function (id) {
        // var el = document.getElementById(id);
        // el.classList.add('active');
        // el.style.cssText =
        //     'top:' + (PTK.$win.height() / 2) + 'px;'
        //     + 'width:' + Math.ceil(calcScreenW(1730)) + 'px;'
        //     + 'height:' + Math.ceil(calcScreenW(750)) + 'px;'
        //     + 'margin-top:' + '-' + calcScreenW(375) - calcScreenW(750) + 'px;'
        //     + 'margin-left:' + '-' + calcScreenW(865) + 'px;'
        //     + 'border-width:' + calcScreenW(30) + 'px;'
        //     + 'border-color:' + '#3c3c3c' + ';'
        //     + 'opacity:' + 0;

        var $id = $('#' + id);
        $id.addClass('active').css({
            top: PTK.$win.height() / 2 + 'px',
            width: Math.ceil(calcScreenW(1730)) + 'px',
            height: Math.ceil(calcScreenW(750)) + 'px',
            marginTop: '-' + calcScreenW(375) - calcScreenW(750) + 'px',
            marginLeft: '-' + calcScreenW(865) + 'px',
            borderWidth: calcScreenW(30) + 'px',
            borderColor: '#3c3c3c',
            opacity: 0
        });
    }
};