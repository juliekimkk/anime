/**
 * 2017-12-21
 * 1.3.4 ver
 * Kim Yeonho
 * https://github.com/KimYeon-ho/Plugin/
 *
 */
;(function ($) {
    $.fn.jdSlider = function (options) {
        var defaults = {
            isUse: true, // 슬라이드 기능 적용 유무
            wrap: null, // 슬라이드가 보여지는 기준이 될 선택자 (null일 경우 default.slide 선택자를 향한다.)
            slide: '.slide-area', // 슬라이드를 감싸는 선택자
            prev: '.prev', // 이전 버튼 선택자
            next: '.next', // 다음 버튼 선택자
            indicate: '.indicate-area', // 인디케이트 버튼을 감싸는 선택자
            auto: '.auto', // 자동재생 버튼 선택자
            playClass: 'play', // 자동재생 버튼에서의 재생 class
            pauseClass: 'pause', // 자동재생 버튼에서의 정지 class
            noSliderClass: 'slider--none', // 슬라이드 기능이 없는 경우 나타낼 class
            noTransitionClass: 'transition--none', // transition none class
            unusedClass: 'hidden',
            slideShow: 1, // 화면에 보여질 슬라이드 수
            slideToScroll: 1, // 슬라이딩 되어지는 슬라이드 수
            slideStart: 1, // 시작 슬라이드 번호
            margin: null, // 슬라이드간 여백 (margin-right와 동일하게 구성 필요 | null일 경우 style margin-right값을 따른다.)
            speed: 500, // ie9 이하는 transition duration값을 별도로 설정해주어야 함.
            interval: 4000, // 자동재생속도
            touchDistance: 20, // 스와이프 적용 거리
            isOverflow: false, // 사이드 영역 노출 여부
            isIndicate: true, // 인디케이트 사용 유무
            isAuto: false, // 자동재생 유무 (true 시 자동재생 실행)
            isLoop: false, // 무한루프 유무
            isSliding: true, // 슬라이딩 유무(페이드인 적용시 false)
            isCursor: true, // 마우스오버에 따른 자동재생 조절 유무
            isTouch: true, // 모바일 터치 스와이프 유무
            isDrag: true, // 웹 드래깅 스와이프 유무
            isCustomAuto: false, // 자동재생 수동 컨트롤 유무 (자동은 false)
            autoState: 'auto', // 리사이징시 재생상태 변환
            indicateList: function (i){
                return '<a href="#">' + i + '</a>'
            },
            progress: function () {}, // 슬라이딩과 동시에 진행될 함수
            callback: function () {}, // 슬라이딩 후 콜백함수
            onPrev: function () {}, // prev버튼 클릭 시 콜백함수
            onNext: function () {}, // next버튼 클릭 시 콜백함수
            onIndicate: function () {}, // indicate버튼 클릭 시 콜백함수
            onAuto: function () {}, // auto버튼 클릭 시 콜백함수
            responsive: [
                /*{
                    viewSize: 768, // break point(0~768)
                    settings: {
                        isUse: true
                    } // options 설정
                }, {
                    viewSize: 1024, // break point(769~1024)
                    settings: {
                        isUse: true
                    }
                }*/
            ] // 반응형 옵션 설정
        };
        var opt = $.extend({}, defaults, options);

        var // 환경설정
            $win = $(window),
            isMobile = window.navigator.userAgent.match('LG|SAMSUNG|Samsung|iPhone|iPod|iPad|Android|Windows CE|BlackBerry|Symbian|Windows Phone|webOS|Opera Mini|Opera Mobi|POLARIS|IEMobile|lgtelecom|nokia|SonyEricsson'),
            isIOS = window.navigator.userAgent.match('iPhone|iPod|iPad'),
            isFF = window.navigator.userAgent.toLocaleLowerCase().match('firefox'),
            isIE = window.navigator.appName === 'Netscape' && window.navigator.userAgent.toLowerCase().indexOf('trident') !== -1 || window.navigator.userAgent.toLowerCase().indexOf("msie") !== -1,
            isCss3 = (function () { // ie9 이하는 false
                var rv = true;
                if (window.navigator.appName === 'Microsoft Internet Explorer') {
                    var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
                    if (re.exec(window.navigator.userAgent) !== null) {
                        rv = parseFloat(RegExp.$1);
                        if (rv <= 9)
                            rv = false;
                    }
                }
                return rv;
            })(),
            capturing = function (e) {
                if (e.preventDefault)
                    e.preventDefault();
                else
                    e.returnValues = false;
            },
            bubbling = function (e) {
                if (e.stopPropagation)
                    e.stopPropagation();
                else
                    e.cancelBubble = true;
            };

        return this.each(function () {
            var // 선택자 설정
                obj = $(this),
                winW = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
                wrap,slide,prev,next,auto,indicate,marginRight,
                selectorSet = function(){
                    wrap = opt.wrap === null ? obj : obj.find(opt.wrap).eq(0);
                    slide = obj.find(opt.slide).eq(0);
                    prev = obj.find(opt.prev);
                    next = obj.find(opt.next);
                    auto = obj.find(opt.auto);
                    indicate = obj.find(opt.indicate);
                    marginRight = opt.margin;
                },
                durationCalc = function () {
                    var _duration;
                    if (isCss3) {
                        _duration = window.getComputedStyle(obj.find(opt.slide)[0]).transitionDuration || window.getComputedStyle(obj.find(opt.slide)[0]).webkitTransitionDuration;
                        _duration = _duration.indexOf('ms') !== -1 ? _duration.substr(0, _duration.length - 2) : _duration.substr(0, _duration.length - 1) * 1000;
                    } else {
                        _duration = opt.speed;
                    }
                    return _duration;
                },
                duration = durationCalc(),
                // 모드 설정
                isMotion = false, // 애니메이션 상태 변수
                timer1 = null, // 자동 타이머 메서드
                timer2 = null, // 자동 타이머 메서드
                responsiveLen = null, // 반응형 (-1:기본)
                setLoop = null; // onresize setInterval 메서드

            // 초기화 (초기 실행 및 resizing시 분기점 전환시)
            var init = function (first) {
                var isFirst = first,
                    i;

                // 슬라이더 상태가 아닐 시 인자 재설정
                if (obj.hasClass(opt.noSliderClass))
                    isFirst = true;

                // 선택자 설정
                selectorSet();

                // iOS 이슈
                if (isFirst && isIOS)
                    $win.on('touchmove', function () {});

                // 초기화 중 트랜지션 효과 OFF
                slide.addClass(opt.noTransitionClass);

                // 클론 제거
                if (slide.find('>.clone').length)
                    slide.find('>.clone').remove();

                // 반응형 옵션값이 설정 되어있을 시 해당 뷰사이즈 옵션 갱신
                if (opt.responsive.length) {
                    if (responsiveLen === null) { // responsiveLen 값이 null 일 경우 변수 설정
                        if (winW <= opt.responsive[0].viewSize)
                            responsiveLen = 0;
                        if (opt.responsive.length > 1) {
                            for (i = 0; i < opt.responsive.length - 1; i++) {
                                if (winW > opt.responsive[i].viewSize && winW <= opt.responsive[(i + 1)].viewSize) {
                                    responsiveLen = i + 1;
                                }
                            }
                        }
                        if (winW > opt.responsive[opt.responsive.length - 1].viewSize)
                            responsiveLen = -1;
                    }

                    // 해당 설정 포함시 리셋
                    for (i = 0; i < opt.responsive.length - 1; i++) {
                        if (opt.responsive[i].settings.slideToScroll || opt.responsive[i].settings.slideShow) {
                            isFirst = true;
                        }
                    }

                    if (responsiveLen === -1) {
                        opt = $.extend({}, defaults, options);
                    } else {
                        var optInit = $.extend({}, defaults, options);
                        opt = $.extend({}, optInit, opt.responsive[responsiveLen].settings);
                    }

                    // 선택자 재설정
                    selectorSet();
                }

                var slideLen = slide.find('>*').not('.clone').length;

                if (!opt.isUse || slideLen <= opt.slideShow) {
                    // 전체 작동 제거(리셋)
                    setting.reset();
                    update();
                    currentTab();
                    rendering3D();
                    imgDrag();
                    obj.addClass(opt.noSliderClass);
                    return false;
                } else if (opt.isSliding) { // 슬라이딩 기능 필요시 세팅
                    // 슬라이딩 off 클래스 제거
                    obj.removeClass(opt.noSliderClass);
                    // 무한루프시 클론 생성
                    if (opt.isLoop && opt.isSliding) {
                        var cloneLen = opt.isOverflow ? slideLen : opt.slideShow + opt.slideToScroll - 1,
                            slideChildL = [],
                            slideChildR = [];
                        for (i = 0; i < cloneLen; i++) {
                            slideChildL[cloneLen - 1 - i] = slide.find('>*').not('.clone').eq(slideLen - 1 - i % slideLen).clone().addClass('clone'); // 끝에서부터
                            slideChildR[i] = slide.find('>*').not('.clone').eq(i % slideLen).clone().addClass('clone'); // 처음부터
                        }
                        slide.prepend(slideChildL).append(slideChildR);
                    }
                }

                // 시작 슬라이드 노출 설정
                if (isFirst)
                    slide.attr('data-index', opt.slideStart-1).find('>*').removeClass('on').not('.clone').eq(opt.slideStart-1).addClass('on');
                else
                    slide.find('>.clone.on').removeClass('on');

                // 인디케이트 설정
                if (opt.isIndicate) {
                    if (!opt.isLoop || (slideLen - opt.slideShow) % opt.slideToScroll === 0) {
                        if (Math.ceil((slideLen - opt.slideShow) / opt.slideToScroll) + 1 !== indicate.find('>*').length) {
                            var listArr = [];
                            for (i = 0; i <= Math.ceil((slideLen - opt.slideShow) / opt.slideToScroll); i++){
                                listArr[i] = opt.indicateList(i+1);
                            }
                            indicate.empty().append(listArr);
                        }
                        if (isFirst || !indicate.find('.on').length){
                            slide.attr('data-index', opt.slideStart-1);
                            indicate.find('a').eq(opt.slideStart-1).addClass('on');
                        }
                        indicate.show();
                    } else {
                        indicate.hide();
                    }
                }

                // 리스트 숨김 설정 해제
                if (opt.isSliding)
                    slide.find('>*').css('display','block');

                swipe.init();
                setting.reset();
                setting.init();
                control.extreme();
                update();
                currentTab();
                rendering3D();
                imgDrag();

                // 자동재생 설정
                if (isFirst) {
                    auto.attr('data-state', opt.isAuto);
                    control.auto();
                } else {
                    if (opt.autoState !== 'auto')
                        auto.attr('data-state', opt.isAuto);
                }
            };

            // 리사이즈
            var resizeFn = function () {
                var resizeW = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                if (winW === resizeW)
                    return false;
                winW = resizeW;
                if (opt.responsive.length) {
                    // 첫번째 viewSize보다 작거나 같은 경우
                    if (winW <= opt.responsive[0].viewSize && responsiveLen !== 0) {
                        responsiveLen = 0;
                        init(false);
                        return false;
                    }
                    if (opt.responsive.length > 1) {
                        var i = 0;
                        for (; i < opt.responsive.length - 1; i++) {
                            // 너비가 i번째 viewSize보다 크면서 i+1보다 작거나 같은 경우
                            if (winW > opt.responsive[i].viewSize && winW <= opt.responsive[(i + 1)].viewSize && responsiveLen !== i + 1) {
                                responsiveLen = i + 1;
                                i = 99; // 현 시점에서 종료
                                init(false);
                            }
                        }
                        if (i === 99)
                            return false;
                    }
                    // viewSize보다 너비가 큰 경우 (기본 속성 적용시)
                    if (winW > opt.responsive[opt.responsive.length - 1].viewSize && responsiveLen !== -1) {
                        responsiveLen = -1;
                        init(false);
                        return false;
                    }
                }
                // 분기 전환이 이루어지지 않은 경우
                update();
            };

            // 탭 이동 제어
            var currentTab = function () {
                if (opt.isUse && slide.find('>*').not('.clone').length > opt.slideShow){
                    slide.find('>*').attr('tabindex','-1').not('.on').attr('aria-hidden','true').find('a,button').attr({'tabindex':'-1','aria-hidden':'true'});
                    slide.find('>.on').attr('aria-hidden','false').find('a,button').removeAttr('tabindex').attr('aria-hidden','false');
                } else {
                    slide.find('>*').removeAttr('tabindex').attr('aria-hidden','false').find('a,button').removeAttr('tabindex').attr('aria-hidden','false');
                }
            };

            // 스타일 조정
            var rendering3D = function () {
                if (!isIE) {
                    if (opt.isSliding && opt.isUse && slide.find('>*').not('.clone').length > opt.slideShow) {
                        obj.find(opt.slide).css({
                            webkitPerspective: '1000px',
                            perspective: '1000px',
                            webkitBackfaceVisibility: 'hidden',
                            backfaceVisibility : 'hidden'
                        });
                    } else {
                        obj.find(opt.slide).css({
                            webkitPerspective: '',
                            perspective: '',
                            webkitBackfaceVisibility: '',
                            backfaceVisibility : ''
                        });
                    }
                }
            };
            var imgDrag = function(){
                if (opt.isDrag && opt.isUse && slide.find('>*').not('.clone').length > opt.slideShow){
                    if (isFF){
                        slide.find('img').on('dragstart', function(){
                            return false;
                        });
                    } else {
                        slide.find('img').css('-webkit-user-drag','none');
                    }
                } else {
                    if (isFF){
                        slide.find('img').off('dragstart', function(){
                            return false;
                        });
                    } else {
                        slide.find('img').css('-webkit-user-drag','');
                    }
                }
            };

            var update = function () {
                var firstIdx, currentIdx, slideWid;
                slide.attr('data-hover', 'true'); // 스타일 조정 도중 자동플레이 방지

                wrap.css('width', '');
                if (!opt.isSliding || !opt.isUse || slide.find('>*').not('.clone').length <= opt.slideShow) {
                    if (isCss3) {
                        slide.css({
                            width: '',
                            marginRight: '',
                            webkitTransform: '',
                            transform: ''
                        });
                    } else {
                        slide.css({
                            width: '',
                            marginLeft: '',
                            marginRight: ''
                        });
                    }
                    slide.find('>*').css({
                        display: '',
                        width: ''
                    });
                } else {
                    var wrapW = window.getComputedStyle ? Math.ceil(window.getComputedStyle(wrap[0],null).width.split('px')[0]) : wrap.width(),
                        totalLen = slide.find('>*').length;
                    // margin
                    if (opt.margin !== null) {
                        marginRight = opt.margin.toString().indexOf('%') !== -1 ? parseFloat(opt.margin) * wrapW / 100 : parseFloat(opt.margin);
                        slide.find('>*').css('marginRight', marginRight + 'px');
                    } else {
                        marginRight = parseFloat(slide.find('>*').css('marginRight'));
                    }
                    // width
                    if (window.getComputedStyle(wrap[0],null).width.split('px')[0].indexOf('.') !== -1){
                        wrap.css('width', wrapW);
                    }
                    slide.find('>*').css('width', Math.ceil(wrapW / opt.slideShow - marginRight) + 'px'); // li 너비
                    firstIdx = slide.find('>*').not('.clone').eq(0).index();
                    currentIdx = slide.find('>.on').index() - firstIdx;
                    slideWid = parseFloat(slide.find('>*')[0].style.width) + marginRight;
                    if (isCss3) {
                        slide.addClass(opt.noTransitionClass).css({
                            width: totalLen * slideWid + 'px',
                            webkitTransform: 'translate3d(' + (-slideWid * (firstIdx + currentIdx)) + 'px,0,0)',
                            transform: 'translate3d(' + (-slideWid * (firstIdx + currentIdx)) + 'px,0,0)'
                        });
                        setTimeout(function () {
                            slide.removeClass(opt.noTransitionClass);
                        }, 10);
                    } else {
                        slide.css({
                            width: totalLen * slideWid + 'px',
                            marginLeft: -slideWid * (firstIdx + currentIdx) + 'px'
                        });
                    }
                }

                slide.attr('data-hover', 'false'); // 스타일 조정 도중 자동플레이 방지 해제
            };

            // 이벤트리스너 세팅
            var setting = {
                init: function () {
                    var slideLen = slide.find('>*').not('.clone').length,
                        slideIdx = slide.find('>.on').index(),
                        firstIdx = slide.find('>*').not('.clone').eq(0).index(),
                        thisIdx = slideIdx === slideLen - opt.slideShow ? Math.ceil((slideLen - opt.slideShow) / opt.slideToScroll) : Math.floor((slideIdx - firstIdx) / opt.slideToScroll);
                    slide
                        .attr({
                            'data-hover': 'false',
                            'data-index': thisIdx
                        })
                        .on('click', $.proxy(swipe, 'clickFn'));
                    obj
                        .on('click', opt.prev, function (e) {
                            control.prev();
                            if (auto.attr('data-state') === 'false') {
                                setting.auto();
                            }
                            currentTab();
                            opt.onPrev();
                            capturing(e);
                            bubbling(e);
                        })
                        .on('click', opt.next, function (e) {
                            control.next();
                            if (auto.attr('data-state') === 'false') {
                                setting.auto();
                            }
                            currentTab();
                            opt.onNext();
                            capturing(e);
                            bubbling(e);
                        })
                        .on('click', opt.indicate + ' a', function (e) {
                            var $this = $(this);
                            control.indicate($this);
                            if (auto.attr('data-state') === 'false') {
                                setting.auto();
                            }
                            currentTab();
                            opt.onIndicate();
                            capturing(e);
                            bubbling(e);
                        })
                        .on('click', opt.auto, function (e) {
                            control.auto();
                            opt.onAuto();
                            capturing(e);
                            bubbling(e);
                        });
                    if (!isMobile && opt.isCursor) { // 웹에서 마우스 오버 도중 자동플레이 방지 설정
                        slide
                            .on('mouseover', function () {
                                slide.attr('data-hover', 'true');
                            })
                            .on('mouseout', function () {
                                slide.attr('data-hover', 'false');
                            });
                        prev
                            .on('mouseover', function () {
                                slide.attr('data-hover', 'true');
                            })
                            .on('mouseout', function () {
                                slide.attr('data-hover', 'false');
                            });
                        next
                            .on('mouseover', function () {
                                slide.attr('data-hover', 'true');
                            })
                            .on('mouseout', function () {
                                slide.attr('data-hover', 'false');
                            });
                        indicate.find('a')
                            .on('mouseover', function () {
                                slide.attr('data-hover', 'true');
                            })
                            .on('mouseout', function () {
                                slide.attr('data-hover', 'false');
                            });
                        auto
                            .on('mouseover', function () {
                                slide.attr('data-hover', 'true');
                            })
                            .on('mouseout', function () {
                                slide.attr('data-hover', 'false');
                            });
                    }
                    if (opt.isTouch) {
                        slide
                            .on('touchstart', $.proxy(swipe, 'touchstartFn'))
                            .on('touchmove', $.proxy(swipe, 'touchmoveFn'))
                            .on('touchend', $.proxy(swipe, 'touchendFn'));
                    }
                    if (opt.isDrag) {
                        slide
                            .on('mousedown', $.proxy(swipe, 'dragstartFn'))
                            .on('mousemove', $.proxy(swipe, 'dragmoveFn'))
                            .on('mouseup mouseleave', $.proxy(swipe, 'dragendFn'));
                    }
                },
                auto: function(){
                    if (!opt.isCustomAuto){
                        if (timer1)
                            clearInterval(timer1);
                        if (timer2)
                            clearInterval(timer2);
                        timer1 = setTimeout(function(){
                            control.interval();
                            timer2 = setInterval(control.interval, opt.interval);
                        }, opt.interval - duration);
                    }
                },
                reset: function () {
                    slide.removeAttr('data-hover');
                    obj.off('click', opt.prev);
                    obj.off('click', opt.next);
                    obj.off('click', opt.indicate + ' a');
                    obj.off('click', opt.auto);
                    if (!isMobile) {
                        slide
                            .off('mouseover')
                            .off('mouseout');
                        prev
                            .off('mouseover')
                            .off('mouseout');
                        next
                            .off('mouseover')
                            .off('mouseout');
                        indicate.find('a')
                            .off('mouseover')
                            .off('mouseout');
                        auto
                            .off('mouseover')
                            .off('mouseout');
                    }
                    slide
                        .off('touchstart')
                        .off('touchmove')
                        .off('touchend')
                        .off('mousedown')
                        .off('mousemove')
                        .off('mouseup mouseleave');
                }
            };

            var control = {
                prev: function () {
                    var slideLen = slide.find('>*').not('.clone').length,
                        slideIdx = slide.find('>.on').index(),
                        firstIdx = slide.find('>*').not('.clone').eq(0).index(),
                        indicateIdx = parseInt(slide.attr('data-index')),
                        slideWid, prevPosition;
                    if (isMotion)
                        return false;
                    isMotion = true;
                    slideWid = parseFloat(slide.find('>*')[0].style.width) + marginRight;
                    if (!opt.isLoop && slideIdx === 0) {
                        // 반복x, 처음에서 제어
                        if (opt.isSliding) {
                            if (isCss3) {
                                slide.css({
                                    webkitTransform: 'translate3d(0,0,0)',
                                    transform: 'translate3d(0,0,0)'
                                });
                                setTimeout(function () {
                                    isMotion = false;
                                }, duration);
                            } else {
                                slide.animate({
                                    marginLeft: 0
                                }, duration, function () {
                                    isMotion = false;
                                });
                            }
                        } else {
                            isMotion = false;
                        }
                    } else if (!opt.isLoop && slideIdx === slideLen - opt.slideShow && (slideLen - opt.slideShow) % opt.slideToScroll !== 0) {
                        // 반복x, 슬라이드 이동 간격이 일정하지 않은 경우, 끝에서 제어
                        var afterIdx = slideLen - opt.slideShow - (slideLen - opt.slideShow) % opt.slideToScroll; // 전체 - 씬당 노출수 - 전체에서 변경되는 씬 갯수를 나눈 나머지
                        slide.removeClass(opt.noTransitionClass);
                        slide.find('>.on').removeClass('on');
                        slide.find('>*').eq(afterIdx).addClass('on');
                        slide.attr('data-index', parseInt(slide.attr('data-index')) - 1);
                        if (opt.isIndicate){
                            indicate.find('.on').removeClass('on');
                            indicate.find('a').eq(indicateIdx - 1).addClass('on');
                        }
                        control.extreme();
                        opt.progress();
                        if (opt.isSliding) {
                            if (isCss3) {
                                slide.css({
                                    webkitTransform: 'translate3d(' + -slideWid * afterIdx + 'px,0,0)',
                                    transform: 'translate3d(' + -slideWid * afterIdx + 'px,0,0)'
                                });
                                setTimeout(function () {
                                    opt.callback();
                                    isMotion = false;
                                }, duration);
                            } else {
                                slide.animate({
                                    marginLeft: -slideWid * afterIdx + 'px'
                                }, duration, function () {
                                    opt.callback();
                                    isMotion = false;
                                });
                            }
                        } else {
                            setTimeout(function () {
                                opt.callback();
                                isMotion = false;
                            }, duration);
                        }
                    } else {
                        // 기본
                        slide.removeClass(opt.noTransitionClass);
                        slide.find('>.on').removeClass('on');
                        if (opt.isSliding) {
                            slide.find('>*').eq(slideIdx - opt.slideToScroll).addClass('on');
                        } else {
                            if (slideIdx === firstIdx)
                                slide.find('>*').eq(slideLen - opt.slideShow).addClass('on');
                            else
                                slide.find('>*').eq(slideIdx - opt.slideToScroll).addClass('on');
                        }
                        if (parseInt(slide.attr('data-index')) !== 0)
                            slide.attr('data-index', parseInt(slide.attr('data-index')) - 1);
                        else
                            slide.attr('data-index', slideLen - 1);
                        if (opt.isIndicate){
                            indicate.find('.on').removeClass('on');
                            if (indicateIdx !== 0)
                                indicate.find('a').eq(indicateIdx - 1).addClass('on');
                            else
                                indicate.find('a').last().addClass('on');
                        }
                        control.extreme();
                        opt.progress();
                        if (opt.isSliding) {
                            if (isCss3) {
                                slide.css({
                                    webkitTransform: 'translate3d(' + -slideWid * (slideIdx - opt.slideToScroll) + 'px,0,0)',
                                    transform: 'translate3d(' + -slideWid * (slideIdx - opt.slideToScroll) + 'px,0,0)'
                                });
                                setTimeout(function () {
                                    if (slide.find('>.on').hasClass('clone')) {
                                        prevPosition = slide.css('transform') || slide.css('webkitTransform');
                                        prevPosition = isIE ? parseFloat($.trim(prevPosition.split(',')[12])) : prevPosition = parseFloat($.trim(prevPosition.split(',')[4]));
                                        slide.addClass(opt.noTransitionClass).css({
                                            webkitTransform: 'translate3d(' + (prevPosition - slideWid * slideLen) + 'px,0,0)',
                                            transform: 'translate3d(' + (prevPosition - slideWid * slideLen) + 'px,0,0)'
                                        });
                                        slide.find('>.on').removeClass('on');
                                        slide.find('>*').eq(slideIdx - opt.slideToScroll + slideLen).addClass('on');
                                    }
                                    opt.callback();
                                    isMotion = false;
                                }, duration);
                            } else {
                                slide.animate({
                                    marginLeft: -slideWid * (slideIdx - opt.slideToScroll) + 'px'
                                }, duration, function () {
                                    if (slide.find('>.on').hasClass('clone')) {
                                        prevPosition = parseFloat(slide.css('marginLeft').split('px')[0]);
                                        slide.css('marginLeft', (prevPosition - slideWid * slideLen) + 'px');
                                        slide.find('>.on').removeClass('on');
                                        slide.find('>*').eq(slideIdx - opt.slideToScroll + slideLen).addClass('on');
                                    }
                                    opt.callback();
                                    isMotion = false;
                                });
                            }
                        } else {
                            setTimeout(function () {
                                opt.callback();
                                isMotion = false;
                            }, duration);
                        }
                    }
                },
                next: function () {
                    var slideLen = slide.find('>*').not('.clone').length,
                        slideIdx = slide.find('>.on').index(),
                        firstIdx = slide.find('>*').not('.clone').eq(0).index(),
                        indicateIdx = parseInt(slide.attr('data-index')),
                        slideWid, prevPosition;
                    if (isMotion)
                        return false;
                    isMotion = true;
                    slideWid = parseFloat(slide.find('>*')[0].style.width) + marginRight;
                    if (!opt.isLoop && slideIdx === slideLen - opt.slideShow) {
                        // 반복x, 마지막에서에서 제어
                        if (opt.isSliding) {
                            if (isCss3) {
                                slide.css({
                                    webkitTransform: 'translate3d(' + -slideWid * (slideLen - opt.slideShow) + 'px,0,0)',
                                    transform: 'translate3d(' + -slideWid * (slideLen - opt.slideShow) + 'px,0,0)'
                                });
                                setTimeout(function () {
                                    isMotion = false;
                                }, duration);
                            } else {
                                slide.animate({
                                    marginLeft: -slideWid * (slideLen - opt.slideShow) + 'px'
                                }, duration, function () {
                                    isMotion = false;
                                });
                            }
                        } else {
                            isMotion = false;
                        }
                    } else if (!opt.isLoop && slideIdx === slideLen - opt.slideShow - (slideLen - opt.slideShow) % opt.slideToScroll && (slideLen - opt.slideShow) % opt.slideToScroll !== 0) {
                        // 반복x, 슬라이드 이동 간격이 일정하지 않은 경우, 처음에서 제어
                        slide.removeClass(opt.noTransitionClass);
                        slide.find('>.on').removeClass('on');
                        slide.find('>*').eq(slideLen - opt.slideShow).addClass('on');
                        slide.attr('data-index', parseInt(slide.attr('data-index')) + 1);
                        if (opt.isIndicate){
                            indicate.find('.on').removeClass('on');
                            indicate.find('a').eq(indicateIdx + 1).addClass('on');
                        }
                        control.extreme();
                        opt.progress();
                        if (opt.isSliding) {
                            if (isCss3) {
                                slide.css({
                                    webkitTransform: 'translate3d(' + -slideWid * (slideLen - opt.slideShow) + 'px,0,0)',
                                    transform: 'translate3d(' + -slideWid * (slideLen - opt.slideShow) + 'px,0,0)'
                                });
                                setTimeout(function () {
                                    opt.callback();
                                    isMotion = false;
                                }, duration);
                            } else {
                                slide.animate({
                                    marginLeft: -slideWid * (slideLen - opt.slideShow) + 'px'
                                }, duration, function () {
                                    opt.callback();
                                    isMotion = false;
                                });
                            }
                        } else {
                            setTimeout(function () {
                                opt.callback();
                                isMotion = false;
                            }, duration);
                        }
                    } else {
                        // 기본
                        slide.removeClass(opt.noTransitionClass);
                        slide.find('>.on').removeClass('on');
                        if (opt.isSliding) {
                            slide.find('>*').eq(slideIdx + opt.slideToScroll).addClass('on');
                        } else {
                            if (slideIdx === slideLen - opt.slideToScroll)
                                slide.find('>*').eq(firstIdx).addClass('on');
                            else
                                slide.find('>*').eq(slideIdx + opt.slideToScroll).addClass('on');
                        }
                        if (parseInt(slide.attr('data-index')) !== slideLen - 1)
                            slide.attr('data-index', parseInt(slide.attr('data-index')) + 1);
                        else
                            slide.attr('data-index', 0);
                        if (opt.isIndicate){
                            indicate.find('.on').removeClass('on');
                            if (indicateIdx !== indicate.find('>*').length - 1)
                                indicate.find('a').eq(indicateIdx + 1).addClass('on');
                            else
                                indicate.find('a').eq(0).addClass('on');
                        }
                        control.extreme();
                        opt.progress();
                        if (opt.isSliding) {
                            if (isCss3) {
                                slide.css({
                                    webkitTransform: 'translate3d(' + -slideWid * (slideIdx + opt.slideToScroll) + 'px,0,0)',
                                    transform: 'translate3d(' + -slideWid * (slideIdx + opt.slideToScroll) + 'px,0,0)'
                                });
                                setTimeout(function () {
                                    if (slide.find('>.on').hasClass('clone')) {
                                        prevPosition = slide.css('transform') || slide.css('webkitTransform');
                                        if (isIE)
                                            prevPosition = parseFloat($.trim(prevPosition.split(',')[12]));
                                        else
                                            prevPosition = parseFloat($.trim(prevPosition.split(',')[4]));
                                        slide.addClass(opt.noTransitionClass).css({
                                            webkitTransform: 'translate3d(' + (prevPosition + slideWid * slideLen) + 'px,0,0)',
                                            transform: 'translate3d(' + (prevPosition + slideWid * slideLen) + 'px,0,0)'
                                        });
                                        slide.find('>.on').removeClass('on');
                                        slide.find('>*').eq(slideIdx - slideLen + opt.slideToScroll).addClass('on');
                                    }
                                    opt.callback();
                                    isMotion = false;
                                }, duration);
                            } else {
                                slide.animate({
                                    marginLeft: -slideWid * (slideIdx + opt.slideToScroll) + 'px'
                                }, duration, function () {
                                    if (slide.find('>.on').hasClass('clone')) {
                                        prevPosition = parseFloat(slide.css('marginLeft').split('px')[0]);
                                        slide.css('marginLeft', (prevPosition + slideWid * slideLen) + 'px');
                                        slide.find('>.on').removeClass('on');
                                        slide.find('>*').eq(slideIdx - slideLen + opt.slideToScroll).addClass('on');
                                    }
                                    opt.callback();
                                    isMotion = false;
                                });
                            }
                        } else {
                            setTimeout(function () {
                                opt.callback();
                                isMotion = false;
                            }, duration);
                        }
                    }
                },
                indicate: function (that) {
                    var slideLen = slide.find('>*').not('.clone').length,
                        firstIdx = slide.find('>*').not('.clone').eq(0).index(),
                        prevIdx, currentIdx, slideWid;
                    if (isMotion)
                        return false;

                    isMotion = true;
                    if (that.parent('li').length) {
                        prevIdx = indicate.find('.on').parent().index();
                        currentIdx = that.parent().index();
                    } else {
                        prevIdx = indicate.find('.on').index();
                        currentIdx = that.index();
                    }
                    if (prevIdx === currentIdx) {
                        isMotion = false;
                        return false;
                    }
                    slideWid = parseFloat(slide.find('>*')[0].style.width) + marginRight;
                    slide.removeClass(opt.noTransitionClass);
                    slide.find('>.on').removeClass('on');
                    // 반복x, 딱 떨어지지 않을때(?)
                    if (!opt.isLoop && (slideLen - opt.slideShow) % opt.slideToScroll !== 0) {
                        if (currentIdx === indicate.find('>*').length - 1)
                            slide.find('>*').eq(slideLen - opt.slideShow).addClass('on');
                        else
                            slide.find('>*').eq(firstIdx + currentIdx * opt.slideToScroll).addClass('on');
                    } else {
                        slide.find('>*').eq(firstIdx + currentIdx * opt.slideToScroll).addClass('on');
                    }
                    slide.attr('data-index', currentIdx);
                    indicate.find('.on').removeClass('on');
                    indicate.find('a').eq(currentIdx).addClass('on');
                    control.extreme();
                    opt.progress();
                    if (opt.isSliding) {
                        if (isCss3) {
                            if (currentIdx === indicate.find('>*').length - 1) {
                                slide.css({
                                    webkitTransform: 'translate3d(' + (-slideWid * (firstIdx + slideLen - opt.slideShow)) + 'px,0,0)',
                                    transform: 'translate3d(' + (-slideWid * (firstIdx + slideLen - opt.slideShow)) + 'px,0,0)'
                                });
                            } else {
                                slide.css({
                                    webkitTransform: 'translate3d(' + (-slideWid * (firstIdx + currentIdx * opt.slideToScroll)) + 'px,0,0)',
                                    transform: 'translate3d(' + (-slideWid * (firstIdx + currentIdx * opt.slideToScroll)) + 'px,0,0)'
                                });
                            }
                            setTimeout(function () {
                                opt.callback();
                                isMotion = false;
                            }, duration);
                        } else {
                            if (currentIdx === indicate.find('>*').length - 1) {
                                slide.animate({
                                    marginLeft: -slideWid * (firstIdx + slideLen - opt.slideToScroll) + 'px'
                                }, duration, function () {
                                    opt.callback();
                                    isMotion = false;
                                });
                            } else {
                                slide.animate({
                                    marginLeft: -slideWid * (firstIdx + currentIdx * opt.slideToScroll) + 'px'
                                }, duration, function () {
                                    opt.callback();
                                    isMotion = false;
                                });
                            }
                        }
                    } else {
                        setTimeout(function () {
                            opt.callback();
                            isMotion = false;
                        }, duration);
                    }
                },
                extreme: function () {
                    // slide.attr('data-index', indicate.find('.on').index());
                    if (!opt.isLoop && Number(slide.attr('data-index').toString()) === 0)
                        prev.addClass(opt.unusedClass);
                    else
                        prev.removeClass(opt.unusedClass);
                    if (!opt.isLoop && Number(slide.attr('data-index')) === indicate.find('a').length - 1)
                        next.addClass(opt.unusedClass);
                    else
                        next.removeClass(opt.unusedClass);
                },
                auto: function () {
                    if (auto.attr('data-state') === 'true') {
                        setting.auto();
                        auto.attr('data-state', 'false');
                        auto.addClass(opt.pauseClass).removeClass(opt.playClass).attr('title', '정지');
                    } else {
                        if ((timer1 || timer2) && !opt.isCustomAuto){
                            clearInterval(timer1);
                            clearInterval(timer2);
                        }
                        auto.attr('data-state', 'true');
                        auto.addClass(opt.playClass).removeClass(opt.pauseClass).attr('title', '재생');
                    }
                },
                interval: function () {
                    var prevIdx;
                    if (slide.attr('data-hover') === 'false') {
                        if (opt.isLoop) {
                            control.next();
                        } else {
                            prevIdx = indicate.find('.on').index();
                            if (prevIdx !== indicate.find('>*').length - 1)
                                control.indicate(indicate.find('a').eq(prevIdx + 1));
                            else
                                control.indicate(indicate.find('a').eq(0));
                            control.extreme();
                        }
                        currentTab();
                    }
                }
            };

            var _touch, prevPosition, currentPosition;
            var swipe = {
                init: function () {
                    this.touchStep = 0;
                    this.touchX1 = null;
                    this.touchX2 = null;
                    this.touchY1 = null;
                    this.touchY2 = null;
                    this.touchMoveX = null;
                    this.touchMoveY = null;
                    this.startPosition = slide.css('transform') || slide.css('webkitTransform');
                },
                touchstartFn: function (e) {
                    e.stopPropagation();
                    if (!isMotion && this.touchStep === 0) {
                        isMotion = true;
                        window.scrollIng = false;
                        _touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
                        this.touchX1 = _touch.pageX;
                        this.touchY1 = _touch.pageY;
                        if (opt.isSliding) this.startPosition = parseFloat($.trim(slide.css('transform').split(',')[4]) || $.trim(slide.css('webkitTransform').split(',')[4]));
                        slide.addClass(opt.noTransitionClass);
                        this.touchStep = 1;
                    }
                },
                touchmoveFn: function (e) {
                    if (isMotion && this.touchStep === 1) {
                        _touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
                        this.touchX2 = _touch.pageX;
                        this.touchY2 = _touch.pageY;
                        this.touchMoveX = this.touchX2 - this.touchX1;
                        this.touchMoveY = this.touchY2 - this.touchY1;
                        if (Math.abs(this.touchMoveX) < Math.abs(this.touchMoveY))
                            window.scrollIng = true;
                        if (!window.scrollIng) {
                            e.preventDefault();
                            if (opt.isSliding) {
                                currentPosition = this.startPosition + (this.touchMoveX / (opt.slideShow / opt.slideToScroll));
                                slide.css({
                                    webkitTransform: 'translate3d(' + currentPosition + 'px,0,0)',
                                    transform: 'translate3d(' + currentPosition + 'px,0,0)'
                                });
                            }
                        }
                    }
                },
                touchendFn: function (e) {
                    if (isMotion && this.touchStep === 1) {
                        _touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
                        this.touchStep = 2;
                        this.touchX2 = _touch.pageX;
                        this.touchY2 = _touch.pageY;
                        this.touchMoveX = this.touchX2 - this.touchX1;
                        this.touchMoveY = this.touchY2 - this.touchY1;
                        slide.removeClass(opt.noTransitionClass);
                        if (Math.abs(this.touchMoveX) < opt.touchDistance)
                            slide.find('a').off('click touchstart');
                        if (!window.scrollIng) {
                            e.stopPropagation();
                            if (this.touchMoveX > opt.touchDistance) {
                                isMotion = false;
                                control.prev();
                            } else if (this.touchMoveX < -opt.touchDistance) {
                                isMotion = false;
                                control.next();
                            } else {
                                if (opt.isSliding) {
                                    prevPosition = -(parseFloat(slide.find('>*')[0].style.width) + marginRight) * slide.find('>.on').index();
                                    slide.css({
                                        webkitTransform: 'translate3d(' + prevPosition + 'px,0,0)',
                                        transform: 'translate3d(' + prevPosition + 'px,0,0)'
                                    });
                                }
                            }
                            if (auto.attr('data-state') === 'false') {
                                setting.auto();
                            }
                            setTimeout(function () {
                                swipe.init();
                                window.scrollIng = true;
                                isMotion = false;
                            }, duration);
                        } else {
                            if (opt.isSliding) {
                                prevPosition = -(parseFloat(slide.find('>*')[0].style.width) + marginRight) * slide.find('>.on').index();
                                slide.css({
                                    webkitTransform: 'translate3d(' + prevPosition + 'px,0,0)',
                                    transform: 'translate3d(' + prevPosition + 'px,0,0)'
                                });
                            }
                            swipe.init();
                            window.scrollIng = true;
                            isMotion = false;
                        }
                    }
                },
                dragstartFn: function (e) {
                    bubbling(e);
                    if (!isMotion && this.touchStep === 0) {
                        isMotion = true;
                        this.touchX1 = e.pageX;
                        this.touchY1 = e.pageY;
                        if (opt.isSliding) {
                            if (isIE) {
                                if (isCss3)
                                    this.startPosition = parseFloat($.trim(slide.css('transform').split(',')[12]));
                                else
                                    this.startPosition = parseFloat(slide.css('marginLeft').split('px')[0]);
                            } else {
                                this.startPosition = parseFloat($.trim(slide.css('transform').split(',')[4]) || $.trim(slide.css('webkitTransform').split(',')[4]));
                            }
                        }
                        slide.addClass(opt.noTransitionClass);
                        this.touchStep = 1;
                    }
                },
                dragmoveFn: function (e) {
                    if (isMotion && this.touchStep === 1) {
                        this.touchX2 = e.pageX;
                        this.touchY2 = e.pageY;
                        this.touchMoveX = this.touchX2 - this.touchX1;
                        this.touchMoveY = this.touchY2 - this.touchY1;
                        if (opt.isSliding) {
                            currentPosition = this.startPosition + (this.touchMoveX / (opt.slideShow / opt.slideToScroll));
                            capturing(e);
                            if (isCss3) {
                                slide.css({
                                    webkitTransform: 'translate3d(' + currentPosition + 'px,0,0)',
                                    transform: 'translate3d(' + currentPosition + 'px,0,0)'
                                });
                            } else {
                                slide.css('marginLeft', currentPosition + 'px');
                            }
                        }
                    }
                },
                dragendFn: function (e) {
                    var that = this;
                    if (isMotion && this.touchStep === 1) {
                        this.touchStep = 2;
                        this.touchX2 = e.pageX;
                        this.touchY2 = e.pageY;
                        this.touchMoveX = this.touchX2 - this.touchX1;
                        this.touchMoveY = this.touchY2 - this.touchY1;
                        slide.removeClass(opt.noTransitionClass);
                        if (Math.abs(this.touchMoveX) < opt.touchDistance)
                            slide.find('a').off('click touchstart');
                        if (this.touchMoveX > opt.touchDistance) {
                            bubbling(e);
                            isMotion = false;
                            control.prev();
                            currentTab();
                        } else if (this.touchMoveX < -opt.touchDistance) {
                            bubbling(e);
                            isMotion = false;
                            control.next();
                            currentTab();
                        } else {
                            if (opt.isSliding) {
                                prevPosition = -(parseFloat(slide.find('>*')[0].style.width) + marginRight) * slide.find('>.on').index();
                                if (isCss3) {
                                    slide.css({
                                        webkitTransform: 'translate3d(' + prevPosition + 'px,0,0)',
                                        transform: 'translate3d(' + prevPosition + 'px,0,0)'
                                    });
                                } else {
                                    slide.animate({
                                        marginLeft: prevPosition + 'px'
                                    }, duration);
                                }
                            }
                        }
                        if (auto.attr('data-state') === 'false') {
                            setting.auto();
                        }
                        currentTab();
                        setTimeout(function () {
                            that.touchStep = 0;
                            isMotion = false;
                        }, duration);
                    }
                },
                clickFn: function (e) {
                    if (isMotion && Math.abs(this.touchMoveX) >= opt.touchDistance) {
                        capturing(e);
                        bubbling(e);
                    } // 슬라이드 시 클릭이벤트 발생 방지
                }
            };

            // load
            init(true);

            // trigger setting
            obj.on('slideInit', init); // 구조초기화
            obj.on('update', update); // size 초기화
            obj.on('resizeFn', resizeFn); // 반응형 분기가 변경 되었을 시에는 slideInit, 같은 분기일 시에는 update 실행.

            function resizing(){
                clearTimeout(setLoop);
                obj.trigger('resizeFn');
                setLoop = setTimeout(function () {
                    obj.trigger('resizeFn');
                }, 100);
            }
            if(window.addEventListener){
                document.addEventListener('visibilitychange', update);
                document.addEventListener('webkitVisibilitychange', update);
                window.addEventListener('resize', resizing);
            } else if (window.attachEvent){
                window.attachEvent('onresize', resizing);
            }
        });
    };
})(jQuery);