/**!
 * resize only width
 * */
var resizeByWidth = true;

var prevWidth = -1;
$(window).resize(function () {
	var currentWidth = $('body').outerWidth();
	resizeByWidth = prevWidth != currentWidth;
	if(resizeByWidth){
		$(window).trigger('resizeByWidth');
		prevWidth = currentWidth;
	}
});
/*resize only width end*/

/**!
 * preloader
 * */
function preloadPage(){
	$('html').addClass('page-loaded');
}
/*preloader end*/

/**!
 * device detected
 * */
var DESKTOP = device.desktop();
//console.log('DESKTOP: ', DESKTOP);
var MOBILE = device.mobile();
//console.log('MOBILE: ', MOBILE);
var TABLET = device.tablet();
//console.log('MOBILE: ', MOBILE);
/*device detected end*/

/**!
 *  placeholder
 *  */
function placeholderInit(){
	$('[placeholder]').placeholder();
}
/*placeholder end*/

/**!
 * print
 * */
function printShow() {
	$('.view-print').on('click', function (e) {
		e.preventDefault();
		window.print();
	})
}
/*print end*/

/**!
 *  multiselect init
 * */
/*! add ui position add class */
function addPositionClass(position, feedback, obj){
	removePositionClass(obj);
	obj.css( position );
	obj
		.addClass( feedback.vertical )
		.addClass( feedback.horizontal );
}

/*! add ui position remove class */
function removePositionClass(obj){
	obj.removeClass('top');
	obj.removeClass('bottom');
	obj.removeClass('center');
	obj.removeClass('left');
	obj.removeClass('right');
}

function customSelect(select){
	if ( select.length ) {
		selectArray = new Array();
		select.each(function(selectIndex, selectItem){
			var placeholderText = $(selectItem).attr('data-placeholder');
			var flag = true;
			if ( placeholderText === undefined ) {
				placeholderText = $(selectItem).find(':selected').html();
				flag = false;
			}
			var classes = $(selectItem).attr('class');
			selectArray[selectIndex] = $(selectItem).multiselect({
				header: false,
				height: 'auto',
				minWidth: 50,
				selectedList: 1,
				classes: classes,
				multiple: false,
				noneSelectedText: placeholderText,
				show: ['fade', 100],
				hide: ['fade', 100],
				create: function(event){
					var select = $(this);
					var button = $(this).multiselect('getButton');
					var widget = $(this).multiselect('widget');
					button.wrapInner('<span class="select-inner"></span>');
					button.find('.ui-icon').append('<i class="arrow-select"></i>')
						.siblings('span').addClass('select-text');
					widget.find('.ui-multiselect-checkboxes li:last')
						.addClass('last')
						.siblings().removeClass('last');
					if ( flag ) {
						$(selectItem).multiselect('uncheckAll');
						$(selectItem)
							.multiselect('widget')
							.find('.ui-state-active')
							.removeClass('ui-state-active')
							.find('input')
							.removeAttr('checked');
					}
				},
				selectedText: function(number, total, checked){
					var checkedText = checked[0].title;
					return checkedText;
				},
				position: {
					my: 'left top',
					at: 'left bottom',
					using: function( position, feedback ) {
						addPositionClass(position, feedback, $(this));
					}
				}
			});
		});
		$(window).resize(selectResize);
	}
}

function selectResize(){
	if ( selectArray.length ) {
		$.each(selectArray, function(i, el){
			var checked = $(el).multiselect('getChecked');
			var flag = true;
			if ( !checked.length ) {
				flag = false
			}
			$(el).multiselect('refresh');
			if ( !flag ) {
				$(el).multiselect('uncheckAll');
				$(el)
					.multiselect('widget')
					.find('.ui-state-active')
					.removeClass('ui-state-active')
					.find('input')
					.removeAttr('checked');
			}
			$(el).multiselect('close');
		});
	}
}
/* multiselect init end */

/**!
 * show / hide menu
 * */
(function ($) {
	// external js:
	// 1) TweetMax VERSION: 1.19.0 (widgets.js);
	// 2) device.js 0.2.7 (widgets.js);
	// 3) resizeByWidth (resize only width);
	var MainNavigation = function (settings) {
		var options = $.extend({
			mainContainer: 'html',
			navContainer: null,
			navMenu: '.nav-list',
			btnMenu: '.btn-menu',
			navMenuItem: null,
			navMenuAnchor: 'a',
			staggerItems: null,
			overlayClass: '.nav-overlay',
			overlayAppend: 'body',
			overlayAlpha: 0.8,
			classNoClickDrop: '.no-click', // Класс, при наличии которого дроп не буте открываться по клику
			classReturn: null,
			overlayBoolean: false,
			animationSpeed: 300,
			animationSpeedOverlay: null,
			minWidthItem: 100
		},settings || {});

		var navContainer = options.navContainer;
		var self = this,
			container = $(navContainer),
			_animateSpeed = options.animationSpeed;

		self.options = options;
		self.$mainContainer = $(options.mainContainer);            // Основной контейнер дом дерева. по умолчанию <html></html>
		self.$navMenu = $(options.navMenu);
		self.$btnMenu = $(options.btnMenu);                        // Кнопка открытия/закрытия меню для моб. верси;
		self.$navContainer = container;
		self.$navMenuItem = $(options.navMenuItem, container);     // Пункты навигации;
		self.$navMenuAnchor = $(options.navMenuAnchor, self.$navMenuItem); // Элемент, по которому производится событие (клик);
		self.$staggerItems = options.staggerItems || self.$navMenuItem;  //Элементы в стеке, к которым применяется анимация. По умолчанию navMenuItem;

		self._animateSpeed = _animateSpeed;
		self._classNoClick = options.classNoClickDrop;

		// overlay
		self._overlayBoolean = options.overlayBoolean;            // Добавить оверлей (по-умолчанию == false). Если не true, то не будет работать по клику вне навигации;
		self._overlayClass = options.overlayClass;                // Класс оверлея;
		self.overlayAppend = options.overlayAppend;               // Элемент ДОМ, вконец которого добавится оверлей, по умолчанию <body></body>;
		self.$overlay = $('<div class="' + self._overlayClass.substring(1) + '"></div>'); // Темплейт оверлея;
		self._overlayAlpha = options.overlayAlpha;
		self._animateSpeedOverlay = options.animationSpeedOverlay || _animateSpeed;
		self._minWidthItem = options.minWidthItem;

		self.desktop = device.desktop();

		var navContainerClass = String(navContainer).substring(1);

		self.modifiers = {
			active: 'active',
			openStart: '' + navContainerClass + '-open-start',
			opened: '' + navContainerClass + '-opened'
		};

		self.createOverlay();
		self.toggleNav();
		self.clearStyles();
		self.closeNavMethod();

		// special for ingosstrah project
		if ( $('body').hasClass('home-page') ) {
			self.menuItemsEvent();
		}
	};

	MainNavigation.prototype.navIsOpened = false;

	// init tween animation
	MainNavigation.prototype.overlayTween = new TimelineMax({paused: true});

	// overlay append to "overlayAppend"
	MainNavigation.prototype.createOverlay = function () {
		var self = this;
		if (!self._overlayBoolean) return false;

		var $overlay = self.$overlay;
		$overlay.appendTo(self.overlayAppend);

		TweenMax.set($overlay, {autoAlpha: 0});

		self.overlayTween.to($overlay, self._animateSpeedOverlay / 1000, {autoAlpha: self._overlayAlpha});
	};

	// show/hide overlay
	MainNavigation.prototype.showOverlay = function (close) {
		var self = this;
		if (!self._overlayBoolean) return false;

		var overlayTween = self.overlayTween;

		if (close === false) {
			overlayTween.reverse();
			return false;
		}

		if (overlayTween.progress() != 0 && !overlayTween.reversed()) {
			overlayTween.reverse();
			return false;
		}

		overlayTween.play();
	};

	// switch nav
	MainNavigation.prototype.toggleNav = function () {
		var self = this,
			$buttonMenu = self.$btnMenu;

		self.prepareAnimation();

		$buttonMenu.on('click', function (e) {
			if (self.navIsOpened) {
				self.closeNav();
			} else {
				self.openNav();
			}

			e.preventDefault();
		});

		$(document).on('click', self._overlayClass, function () {
			self.closeNav();
		});
	};

	// open nav
	MainNavigation.prototype.openNav = function() {
		var self = this,
			$html = self.$mainContainer,
			$navContainer = self.$navContainer,
			$buttonMenu = self.$btnMenu,
			_animationSpeed = self._animateSpeedOverlay;

		$buttonMenu.addClass(self.modifiers.active);
		$html.addClass(self.modifiers.openStart);

		$navContainer.css({
			'-webkit-transition-duration': '0s',
			'transition-duration': '0s'
		});

		var navTween = new TimelineMax();

		$navContainer.show(0);

		navTween
			.to($navContainer, _animationSpeed / 1000, {
				autoAlpha: 1, onComplete: function () {
					console.log('openNav');
					$html.addClass(self.modifiers.opened);
				}, ease:Cubic.easeInOut
			});

		self.showOverlay();

		self.navIsOpened = true;
	};

	// close nav
	MainNavigation.prototype.closeNav = function() {
		var self = this,
			$html = self.$mainContainer,
			$navContainer = self.$navContainer,
			$btnMenu = self.$btnMenu,
			_animationSpeed = self._animateSpeedOverlay;

		$html.removeClass(self.modifiers.opened);
		$html.removeClass(self.modifiers.openStart);
		$btnMenu.removeClass(self.modifiers.active);

		self.showOverlay(false);

		if ($btnMenu.is(':hidden') ) {
			console.log('style reset');
			$navContainer.attr('style', '');
			return;
		}

		TweenMax.to($navContainer, _animationSpeed / 1000, {
			autoAlpha: 0, onComplete: function () {

				if (!self.navIsOpened) return;
				console.log('close popup');
				self.prepareAnimation();

				self.navIsOpened = false;

			}
		});
	};

	// close method
	MainNavigation.prototype.closeNavMethod = function() {

		var self = this;

		self.$navContainer.on('closeMenu', function () {
			console.log('init closeNavMethod');
			self.closeNav();
		})

	};

	// preparation element before animation
	MainNavigation.prototype.prepareAnimation = function() {
		var self = this,
			$navContainer = self.$navContainer;

		if (self.$btnMenu.is(':visible')) {
			TweenMax.set($navContainer, {autoAlpha: 0, onComplete: function () {

				console.log('prepareAnimation');
				$navContainer.show(0);

			}});
		}
	};

	// clearing inline styles
	MainNavigation.prototype.clearStyles = function() {
		var self = this,
			$btnMenu = self.$btnMenu,
			$navContainer = self.$navContainer;

		//clear on horizontal resize
		$(window).on('resizeByWidth', function () {
			self.closeNav();
		});
	};

	// special for ingosstrah project
	// only home page
	// close menu on click first level nav item
	MainNavigation.prototype.menuItemsEvent = function() {
		var self = this,
			$btnMenu = self.$btnMenu,
			$menuItemLink = self.$navMenuItem;

		$('.js-common-slider-nav').on('click', function () {
			if (!$btnMenu.is(':hidden')) {
				self.closeNav();
			}
		})
	};

	window.MainNavigation = MainNavigation;

}(jQuery));
/*show / hide menu*/

/**!
 * toggle sidebar
 * */
function toggleSidebar(){
	var $container = $('.sidebar');
	if(!$container.length){ return; }
	new MainNavigation({
		navContainer: '.sidebar',
		navMenuItem: '.menu__list li',
		animationSpeed: 300,
		overlayAppend: '.main',
		overlayBoolean: true,
		overlayAlpha: 0.75
	});

	// close sidebar on click slider common
	function closeMenuOnClickSlide() {
		$('.js-common-slider-nav').on('click', 'a[data-slide]', function () {
			$container.trigger('closeMenu');
		})
	}

	closeMenuOnClickSlide();
}
/*toggle sidebar end*/

/**!
 * toggle aside
 * */
function toggleAside(){
	var $container = $('.aside');
	if(!$container.length){ return; }
	new MainNavigation({
		navContainer: '.aside',
		btnMenu: '.aside-opener-js',
		animationSpeed: 300,
		animationType: 'rtl',
		overlayAppend: '.main',
		overlayBoolean: false,
		overlayAlpha: 0.75
	});
}
/*toggle aside end*/

/**
 * header toggle on scroll event
 * */
function headerShow(){
	// external js:
	// 1) resizeByWidth (resize only width);

	var $page = $('html'),
		minScrollTop = $('.header').outerHeight();

	var previousScrollTop = $(window).scrollTop();
	$(window).on('load scroll resizeByWidth', function () {
		var currentScrollTop = $(window).scrollTop();
		var showHeaderPanel = currentScrollTop < minScrollTop || currentScrollTop < previousScrollTop;

		$page.toggleClass('header-show', showHeaderPanel);

		previousScrollTop = currentScrollTop;
	});
}
/*header toggle on scroll event end*/

/**
 * add class on scroll to top
 * */
function pageIsScrolled(){
	// external js:
	// 1) resizeByWidth (resize only width);

	var $page = $('html'),
		minScrollTop = $('.header').outerHeight();

	$(window).on('load scroll resizeByWidth', function () {
		var currentScrollTop = $(window).scrollTop();
		var showHeaderPanel = (currentScrollTop >= minScrollTop);

		$page.toggleClass('page-is-scrolled', showHeaderPanel);
	});
}
/*add class on scroll to top end*/

/**
 * popup initial
 * */
function popupInitial(){
	$('.popup-gmaps').magnificPopup({
		disableOn: 700,
		type: 'iframe',
		mainClass: 'mfp-fade',
		removalDelay: 160,
		preloader: false,
		tClose: 'Закрыть (Esc)',
		tLoading: 'Загрузка...',

		fixedContentPos: true,
		callbacks:{
			beforeClose: function() {
				$('.mfp-opened').removeClass('mfp-opened');
			}
		}
	});

	$('.popup-with-form').magnificPopup({
		type: 'inline',
		preloader: false,
		focus: '#name',
		mainClass: 'mfp-fade',
		fixedContentPos: true,

		// When elemened is focused, some mobile browsers in some cases zoom in
		// It looks not nice, so we disable it:
		callbacks: {
			beforeOpen: function() {
				if($(window).width() < 700) {
					this.st.focus = false;
				} else {
					this.st.focus = '#name';
				}
			}
		}
	});

	$('.image-popup-vertical-fit').magnificPopup({
		type: 'image',
		closeOnContentClick: true,
		closeBtnInside: true,
		fixedContentPos: true,
		mainClass: 'mfp-with-zoom', // class to remove default margin from left and right side
		image: {
			verticalFit: true
		},
		zoom: {
			enabled: true,
			duration: 300 // don't foget to change the duration also in CSS
		}
	});
}
/*popup initial end*/

/**
 * multi accordion
 * */
(function ($) {
	var MultiAccordion = function (settings) {
		var options = $.extend({
			collapsibleAll: false,
			animateSpeed: 300,
			resizeCollapsible: false
		}, settings || {});

		this.options = options;
		var container = $(options.accordionContainer);
		this.$accordionContainer = container; //блок с аккордеоном
		this.$accordionItem = $(options.accordionItem, container); //непосредственный родитель сворачиваемого элемента
		this.$accordionEvent = $(options.accordionEvent, container); //элемент, по которому производим клик
		this.$collapsibleElement = $(options.collapsibleElement); //элемент, который сворачивается/разворачивается
		this._collapsibleAll = options.collapsibleAll;
		this._animateSpeed = options.animateSpeed;
		this.$totalCollapsible = $(options.totalCollapsible);//элемент, по клику на который сворачиваются все аккордены в наборе
		this._resizeCollapsible = options.resizeCollapsible;//флаг, сворачивание всех открытых аккордеонов при ресайзе

		this.modifiers = {
			active: 'active',
			current: 'current'
		};

		this.bindEvents();
		this.totalCollapsible();
		this.totalCollapsibleOnResize();

	};

	MultiAccordion.prototype.totalCollapsible = function () {
		var self = this;
		self.$totalCollapsible.on('click', function () {
			self.$collapsibleElement.slideUp(self._animateSpeed, function () {
				self.$accordionContainer.trigger('accordionChange');
			});
			self.$accordionItem.removeClass(self.modifiers.active);
			self.$accordionItem.removeClass(self.modifiers.current);
		})
	};

	MultiAccordion.prototype.totalCollapsibleOnResize = function () {
		var self = this;
		$(window).on('resize', function () {
			if(self._resizeCollapsible){
				self.$collapsibleElement.slideUp(self._animateSpeed, function () {
					self.$accordionContainer.trigger('accordionChange');
				});
				self.$accordionItem.removeClass(self.modifiers.active);
			}
		});
	};

	MultiAccordion.prototype.bindEvents = function () {
		var self = this,
			modifiers = this.modifiers,
			animateSpeed = this._animateSpeed,
			accordionContainer = this.$accordionContainer,
			anyAccordionItem = this.$accordionItem,
			collapsibleElement = this.$collapsibleElement;

		self.$accordionEvent.on('click', function (e) {
			var current = $(this);
			var currentAccordionItem = current.closest(anyAccordionItem);

			if (!currentAccordionItem.has(collapsibleElement).length || !$('body').hasClass('home-page')){
				return;
			}

			e.preventDefault();

			if (current.parent().prop("tagName") != currentAccordionItem.prop("tagName")) {
				current = current.parent();
			}

			if (current.siblings(collapsibleElement).is(':visible')){
				currentAccordionItem.removeClass(modifiers.active).find(collapsibleElement).slideUp(animateSpeed, function () {
					self.$accordionContainer.trigger('accordionChange');
				});
				// currentAccordionItem.removeClass(modifiers.current);
				currentAccordionItem
					.find(anyAccordionItem)
					.removeClass(modifiers.active);
					// .removeClass(modifiers.current);
				return;
			}


			if (self._collapsibleAll){
				var siblingContainers = $(accordionContainer).not(current.closest(accordionContainer));
				siblingContainers.find(collapsibleElement).slideUp(animateSpeed, function () {
					self.$accordionContainer.trigger('accordionChange');
				});
				siblingContainers
					.find(anyAccordionItem)
					.removeClass(modifiers.active);
					// .removeClass(modifiers.current);
			}

			currentAccordionItem
				.siblings()
				.removeClass(modifiers.active)
				.find(collapsibleElement)
				.slideUp(animateSpeed, function () {
					self.$accordionContainer.trigger('accordionChange');
				});
			// currentAccordionItem.siblings().removeClass(modifiers.current);
			currentAccordionItem.siblings()
				.find(anyAccordionItem)
				.removeClass(modifiers.active);
				// .removeClass(modifiers.current);

			currentAccordionItem.addClass(modifiers.active);
			current.siblings(collapsibleElement).slideDown(animateSpeed, function () {
				self.$accordionContainer.trigger('accordionChange');
			});
		})
	};

	window.MultiAccordion = MultiAccordion;
}(jQuery));

function menuAccordionInit() {
	if($('.menu__list').length){
		new MultiAccordion({
			accordionContainer: '.menu__list',
			accordionItem: 'li',
			accordionEvent: 'a',
			collapsibleElement: '.menu-drop, .menu-sub-drop',
			animateSpeed: 200
		});
	}
}
/*multi accordion end*/

/**!
 * drop language
 * */
function languageEvents() {
	$('.js-lang-open').on('click', function (e) {
		e.preventDefault();
		$(this).closest('.lang').toggleClass('lang-opened');
		e.stopPropagation();
	});
	$('.lang-list').on('click', function (e) {
		e.stopPropagation();
	});
	$(document).on('click', function () {
		closeDropLong();
	});
	function closeDropLong() {
		$('.lang').removeClass('lang-opened');
	}
}
/*drop language end*/

/**!
 * common slider
 * */
function commonSliderInit() {
	//common slider
	var $commonSliders = $('.common-slider');

	if($commonSliders.length) {
		$commonSliders.each(function() {
			var $currentSlider = $(this),
				$sliderNav = $('.js-common-slider-nav');
			
			$currentSlider.on('init', function (event, slick) {

				addCurrentClass(slick.currentSlide);

			}).slick({
				slidesToShow: 1,
				slidesToScroll: 1,
				infinite: true,
				speed: 150,
				autoplay: true,
				autoplaySpeed: 8000,
				dots: false,
				arrows: false,
				fade: true,
				focusOnSelect: true,
				touchMove: false,
				draggable: false,
				accessibility: false,
				swipe: false
			}).on('beforeChange', function (event, slick, currentSlide, nextSlide) {

				addCurrentClass(nextSlide);

			});

			// common slider's navigation events
			$sliderNav.on('click', 'a', function(e){

				e.preventDefault();

				var $this = $(this);
				if ($this.parent().hasClass('current-slide')) return false;

				var index = $this.attr('data-slide');
				$currentSlider.slick('slickGoTo', index);

			});

			// toggle class current slide on navigation
			function addCurrentClass(index) {

				$sliderNav.find('li').removeClass('current-slide');
				$sliderNav.find('a[data-slide="'+index+'"]').parent().addClass('current-slide');

			}
		});
	}
}
/*common slider end*/

/**
 * scroll to section
 * */
function scrollToSection() {
	$(window).on("load",function(){

		/* Page Scroll to id fn call */
		$(".menu__list a").mPageScroll2id({
			highlightSelector: '.menu__list > li > a',
			scrollSpeed: 700,
			highlightClass: 'current',
			offset: '.header',
			forceSingleHighlight:true
		});
	});
}
/*scroll to section end*/

/*show form search */
function showFormSearch() {
	var $searchForm = $('.js-search-form');
	if (!$searchForm.length) {
		return;
	}

	var $body = $('body');
	var openedFormClass = 'search-form-opened';

	$searchForm.on('click', '.js-search-close', function (e) {
		e.preventDefault();

		$body.toggleClass(openedFormClass, !$body.hasClass(openedFormClass));

		focusingSearchForm();
	});

	$searchForm.on('click', 'input:submit', function () {
		if(!$body.hasClass(openedFormClass)){
			$body.addClass(openedFormClass);

			focusingSearchForm();

			return false;
		}
	});

	$searchForm.on('click', function () {
		focusingSearchForm();
	});

	function focusingSearchForm(){
		$searchForm.find('input[type="search"], input[type="text"]').trigger('focus');
	}
}
/*show form search end*/

/**!
 * equal height
 * */
function equalHeightInit() {
	$(window).load(function () {
		// gallery list
		var $catalog = $('.catalog');
		if ($catalog.length) {
			$('.catalog-item__inner', $catalog).equalHeight({
				useParent: true,
				parent: $catalog,
				resize: true
			});
		}
	})
}
/*equal height end*/


/**!
 * footer at bottom
 * */
function footerBottom(){
	var $footer = $('.footer');
	if($footer.length){
		var $tplSpacer = $('<div />', {
			class: 'spacer'
		});

		$('.main').append($tplSpacer.clone());
		$('.main').after($tplSpacer.clone());

		$(window).on('load resizeByWidth', function () {
			var footerOuterHeight = $footer.find('.footer-holder').outerHeight();
			$footer.css({
				// 'margin-top': -footerOuterHeight
			});

			$('.spacer').css({
				'height': footerOuterHeight
			});
		})
	}
}
/*footer at bottom end*/

/**
 * sticky layout
 * */
function stickyLayout(){
	var topValue = $('.header').outerHeight();

	/*aside sticky*/
	var $aside = $(".aside");
	$aside.css('position','static');
	if ($aside.length) {

		var resizeTimerAside;

		$(window).on('load resize', function () {
			if($(window).width() < 980){
				// $aside.trigger("sticky_kit:detach").attr('style','');
				$aside.trigger("sticky_kit:detach").css('position','fixed');
				return;
			}

			clearTimeout(resizeTimerAside);
			resizeTimerAside = setTimeout(function () {
				$aside.stick_in_parent({
					parent: '.main-holder',
					offset_top: topValue
				});
			}, 100);
		});
	}

	/*sidebar sticky*/
	var $sidebar = $(".sidebar");
	$sidebar.css('position','static');
	if ($sidebar.length) {
		var resizeTimerMenu;

		$(window).on('load resize', function () {
			if($(window).width() < 1280){
				// $sidebar.trigger("sticky_kit:detach").attr('style','');
				$sidebar.trigger("sticky_kit:detach").css('position','fixed');
				return;
			}

			clearTimeout(resizeTimerMenu);
			resizeTimerMenu = setTimeout(function () {
				$sidebar.stick_in_parent({
					parent: '.main',
					offset_top: topValue
				});
			}, 100);
		});
	}

	// $('.menu__list').on('accordionChange', function () {
	// 	$sidebar.trigger("sticky_kit:recalc");
	// });
}
/*sticky layout end*/

/** ready/load/resize document **/

$(window).load(function () {
	preloadPage();
});

$(document).ready(function(){
	placeholderInit();
	if(DESKTOP){
		customSelect($('select.cselect'));
	}
	printShow();
	toggleSidebar();
	toggleAside();
	headerShow();
	pageIsScrolled();
	popupInitial();
	menuAccordionInit();
	languageEvents();
	if( $('body').hasClass('home-page') ) {
		commonSliderInit();
		// pagesSwitcher();
		scrollToSection();
	}
	showFormSearch();

	footerBottom();
	stickyLayout();
	equalHeightInit();

	// var loc = window.location;
	// console.log("loc: ", loc.hash.substring(1));
});