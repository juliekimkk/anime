/**
 * 공통 변수 선언
 */
var PTK = {
    isMobile: /LG|SAMSUNG|Samsung|iPhone|iPod|Android|Windows CE|BlackBerry|Symbian|Windows Phone|webOS|Opera Mini|Opera Mobi|POLARIS|IEMobile|lgtelecom|nokia|SonyEricsson/i.test(navigator.userAgent),
    isIOS: !/Android/i.test(navigator.userAgent) && /iPhone|iPad|iPod/i.test(navigator.userAgent),
    ieVer: (function() {
        var word,
            version = 'N/A',
            agent = navigator.userAgent.toLowerCase(),
            name = navigator.appName,
            reg = null;
        if (name === 'Microsoft Internet Explorer') { // IE old version ( IE 10 or Lower )
            word = 'msie ';
        } else {
            if (agent.search('trident') > -1) { // IE 11
                word = 'trident/.*rv:';
            } else if (agent.search('edge/') > -1) { // IE 12  ( Microsoft Edge )
                word = 'edge/';
            }
        }
        reg = new RegExp(word + '([0-9]{1,})(\\.{0,}[0-9]{0,1})');
        if (reg.exec(agent) !== null) version = RegExp.$1 + RegExp.$2;
        return version;
    })(),
    setLoopCanvas: null,
    setLoopHeader: null,
    didScroll: false,
    disableClickFlag: false,

    $win: $(window),
    $doc: $(document),
    $htmlBody: $('html,body'),
    $body: $('body'),
    $headerWrap: $('.header-wrap'),
    $header: $('header'),
    $logo: $('.logo').find('a'),
    $gnb: $('.gnb'),
    $btnHeader: $('.btn-header'),
    $canvasArea: $('.canvas-area'),
    $jsW: $('.js-w'),
    $jsT: $('.js-t'),
    $jsM: $('.js-m'),
    $lazy: $('.lazy'),
    $lazy2: $('.lazy2'),

    LAST_SCROLL_TOP: 0,
    DELTA: 5,
    INIT_SHOW: 200
};

/**
 * 브라우저 체크
 */
function mobileDeviceChk() {
    if ( PTK.isMobile ) PTK.$body.addClass('device-m');
}

function readyFn() {
    /**
     * 컨텐츠 구분선 클릭이벤트
     */
    PTK.$doc.on('click', '.canvas-area.on', function () {
        var $this = $(this),
            DURATION = PTK.$win.scrollTop() < window.innerHeight * 3 ? 500 : 1000;
        $this.addClass('focus');
        PTK.$htmlBody.delay(500).stop().animate({
            scrollTop: 0
        }, DURATION, function () {
            $this.removeClass('focus');
        });
        return false;
    });
    /**
     * footer
     */
    $('footer').load('/_footer.html');
    PTK.$doc
        .on('mouseenter', '.js-w .family-list li', function () {
            $(this).closest('ul').addClass('hov');
        })
        .on('mouseleave', '.js-w .family-list li', function () {
            $(this).closest('ul').removeClass('hov');
        });
    /**
     * gnb 애널리틱스
     */
    if (PTK.isIOS) { // iOS
        PTK.$doc
            .on('touchend', '.gnb li a', gnbAnalyticsSet)
            .on('touchend', '.family-list li a', familyListAnaliticsSet);
    } else { // (/android/.test(PTK.ua)) 및 나머지 포함
        PTK.$doc
            .on('click', '.gnb li a', gnbAnalyticsSet)
            .on('click', '.family-list li a', familyListAnaliticsSet);
    }
}
function resizeFn() {
    var winW = window.innerWidth,
        winH = window.innerHeight,
        threshold = null;

    // 웹사이즈로 전환 (모바일->웹 || 탭->웹 || 웹->탭)
    if ( (winW > 1023 && !PTK.$body.hasClass('js-w')) || (winW > 1440 && PTK.$body.hasClass('js-t')) || (winW > 1023 && winW <= 1440 && !PTK.$body.hasClass('js-t')) ) {
        // body에 1023초과:웹, 1023이하:모바일 설정
        if (winW > 1023 && !PTK.$body.hasClass('js-w')){
            PTK.$body.addClass('js-w').removeClass('js-m');
            PTK.$jsW = $('.js-w');
        }
        // body에 1023초과 1440이하는 태블릿 추가 설정
        if(winW > 1023 && winW <= 1440) PTK.$body.addClass('js-t');
        else  PTK.$body.removeClass('js-t');
        PTK.$jsT = $('.js-t');

        // lazy load
        if (PTK.$lazy.length) {
            lazyloadCompress(PTK.$lazy, winH, 'lazy-w', function(){
                $(this).css('opacity', 1);
            });
        }
        // 서브페이지만 적용
        if (!document.getElementById('Main')) {
            if (PTK.$lazy2.length) {
                if (winW > 1440) {
                    threshold = document.getElementById('SubWork') ? winH * 2 : PTK.$doc.height();
                    lazyloadCompress(PTK.$lazy2, threshold, 'lazy-w', function(){
                        $(this).css('opacity', 1);
                    });
                } else {
                    threshold = document.getElementById('SubWork') ? winH * 2 : PTK.$doc.height();
                    lazyloadCompress(PTK.$lazy2, threshold, 'lazy-t', function(){
                        $(this).css('opacity', 1);
                    });
                }
            }
        }
        // 헤더부분 웹 형식으로 전환
        PTK.$btnHeader.off('click', btnHeaderClickListerner);
        if (PTK.$header.hasClass('on')) {
            PTK.$header.removeClass('on');
            PTK.$gnb.find('>li').removeClass('show');
            PTK.$body.css('overflowY', 'visible');
        }
        // 스크롤에 따른 header 노출 기능 제거
        clearInterval(PTK.setLoopHeader);

    } else if (winW <= 1023 && !PTK.$body.hasClass('js-m')) {
        PTK.$body.addClass('js-m').removeClass('js-w js-t');
        PTK.$jsM = $('.js-m');
        // lazy load
        // 메인, 서브 전체 적용
        if (document.getElementById('Main')) {
            if (PTK.$lazy.length) {
                threshold = $('#Main').height();
                lazyloadCompress(PTK.$lazy, threshold, 'lazy-m', function(){
                    $(this).css('opacity', 1);
                });
            }
        } else {
            if (PTK.$lazy.length) {
                threshold = document.getElementById('SubWork') ? winH * 2 : PTK.$doc.height();
                lazyloadCompress(PTK.$lazy, threshold, 'lazy-m', function(){
                    $(this).css('opacity', 1);
                });
            }
            if (PTK.$lazy2.length) {
                threshold = document.getElementById('SubWork') ? winH * 2 : PTK.$doc.height();
                lazyloadCompress(PTK.$lazy2, threshold, 'lazy-m', function(){
                    $(this).css('opacity', 1);
                });
            }
        }
        // 헤더부분 모바일 형식으로 전환
        PTK.$btnHeader.on('click', btnHeaderClickListerner);
        // 스크롤에 따른 header 노출
        rolling();
    }
}

function lazyloadCompress (selector, threshold, data_attr, loadFunc){
    var $this = selector;
    $this.lazyload({
        placeholder: '/img/blank.gif',
        threshold: threshold,
        data_attribute: data_attr,
        load: loadFunc
    });
}

/**
 * 스크롤에 따른 header 노출
 */
function rolling() {
    PTK.setLoopHeader = setInterval(function () {
        if (PTK.didScroll) {
            var st = PTK.$win.scrollTop();
            if (Math.abs(PTK.LAST_SCROLL_TOP - st) <= PTK.DELTA) return; // PTK.DELTA값(5) 이하는 리턴
            if (st > PTK.LAST_SCROLL_TOP && st > PTK.INIT_SHOW) { // PTK.INIT_SHOW(200) 이상이면서 아래로 이동할때
                PTK.$header.addClass('up');
            } else if (st < PTK.LAST_SCROLL_TOP && st > PTK.INIT_SHOW) { // PTK.INIT_SHOW 이상이면서 위로 이동할때
                if (st + PTK.$win.height() < PTK.$doc.height()) PTK.$header.removeClass('up');
            } else { // PTK.INIT_SHOW 이하
                PTK.$header.removeClass('up');
            }
            PTK.LAST_SCROLL_TOP = st; // 정지상태 스크롤값 갱신
            PTK.didScroll = false;
        }
    }, 250);
}

function scrollFn() {
    var st = PTK.$win.scrollTop(),
        winH = window.innerHeight;
    PTK.$canvasArea = $('.canvas-area');
    /**
     * 컨텐츠 구분선 스크롤 모션
    */
    PTK.didScroll = true;
    if (PTK.$canvasArea.length) {
        clearTimeout(PTK.setLoopCanvas);
        PTK.setLoopCanvas = setTimeout(function () {
            PTK.$canvasArea.each(function () {
                var $this = $(this);
                if (st + winH / 1.1 > $this.offset().top && st <= $this.offset().top && !$this.hasClass('on'))
                    $this.addClass('on');
                else if (st > $this.offset().top + $this.height() || st + winH / 1.1 <= $this.offset().top && $this.hasClass('on'))
                    $this.removeClass('on');
            });
        }, 10);
    }
}

/**
 * 모바일 헤더 클릭이벤트
 */
function btnHeaderClickListerner(e) {
    if (PTK.$header.hasClass('on')) {
        PTK.$header.removeClass('on');
        PTK.$gnb.find('>li').removeClass('show');
        PTK.$body.css('overflowY', 'visible');
        analyticsSubmit('GNB', 'Click-Menu', 'Menu-Open');
    } else {
        PTK.$header.addClass('on');
        PTK.$body.css('overflowY', 'hidden');
        analyticsSubmit('GNB', 'Click-Menu', 'Menu-Close');
        setTimeout(function () {
            PTK.$gnb.find('>li').addClass('show');
        }, 100);
    }
    e.preventDefault();
}

/**
 * smooth motion
 */
function smoothMotionType1(classname, mod) {
    motionObj = new SmoothMotion(classname);
    motionObj.execution(mod);
}
function smoothMotionType2(classname, mod) {
    motionObj2 = new SmoothMotion(classname);
    motionObj2.execution(mod);
}
function SmoothMotion(cls) {
    this.obj = $('.' + cls);
}
SmoothMotion.prototype.execution = function (mod) {
    var that = this.obj,
        st = PTK.$win.scrollTop(),
        winH = window.innerHeight,
        i = 0;
    for (; i < that.length; i++) {
        if(!that.eq(i).hasClass('js-smooth--end')){
            if (st + winH / mod > that.eq(i).offset().top) {
                that.eq(i).removeClass('transition--none').addClass('js-smooth--end');
                if(document.getElementById('Main') && PTK.$jsM.length)
                    that.eq(i).css('opacity', 1);
            }
        }
    }
};

/**
 * analytics 실행
 */
function analyticsSubmit(category, action, label){
    ga('send', 'event', category, action, label);
    mixpanel.track('event', {
        'event-category': category,
        'event-action': action,
        'event-label': label
    });
}

/**
 * analytics - gnb
 */
function gnbAnalyticsSet(e) {
    var $this = $(this),
        cb = linkCallback($this),
        idx = $this.closest('li').index(),
        labelArr = ['Company','Service','Work','Culture','Career','Archive','Contact'];
    e.preventDefault();
    analyticsSubmit('GNB', 'Click-GNB', labelArr[idx]);
    setTimeout(cb, 300);
}

/**
 * analytics - familysite
 */
function familyListAnaliticsSet(e) {
    var $this = $(this),
        idx = $this.closest('li').idx,
        labelArr = ['HQ','Ing','ChinaNow','Blog', 'Partner'];
    analyticsSubmit('Footer', 'Click-Shortcut', labelArr[idx]);
    setTimeout(function () {
        window.open($this.attr('href'));
    }, 300);
    e.preventDefault();
}

/**
 * 0.3초 뒤 링크 이동
 */
function linkCallback(obj) {
    return function(){
        if(PTK.$jsM.length)
            $(this).addClass('active');
        if(obj[0].target.match('blank'))
            window.open(obj.attr('href'));
        else
            window.location = obj.attr('href');
    };
}

/**
 * data
 */
function callAjax(url, type, data, successCallback, failCallback) {
    $.ajax({
        url: url,
        type: type,
        data: data,
        dataType: 'json',
        callback: 'callback',
        async: false,
        crossDomain: true,
        success: function (data, status, xhr) {
            if (successCallback !== null)
                successCallback(data, status, xhr);
        },
        error: function (xhr, status, errorThrown) {
            if (failCallback !== null)
                failCallback(xhr, status, errorThrown);
        }
    });
}

(function(){
    resizeFn();
    mobileDeviceChk();
    readyFn();
    if(window.addEventListener){
        window.addEventListener('resize', resizeFn);
        window.addEventListener('scroll', scrollFn);
    } else if (window.attachEvent){
        window.attachEvent('onresize', resizeFn);
        window.attachEvent('onscroll', scrollFn);
    } else {
        window.onresize = resizeFn;
        window.onscroll = scrollFn;
    }
})();