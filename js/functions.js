/**!
 * resize only width
 * */
var resizeByWidth = true;

var fpRussian = {
			firstDayOfWeek: 1, // Monday
			weekdays: {
				shorthand: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
				longhand: [
				  "Воскресенье",
				  "Понедельник",
				  "Вторник",
				  "Среда",
				  "Четверг",
				  "Пятница",
				  "Суббота",
				],
			  },

			  months: {
				shorthand: [
				  "Янв",
				  "Фев",
				  "Март",
				  "Апр",
				  "Май",
				  "Июнь",
				  "Июль",
				  "Авг",
				  "Сен",
				  "Окт",
				  "Ноя",
				  "Дек",
				],
				longhand: [
				  "Январь",
				  "Февраль",
				  "Март",
				  "Апрель",
				  "Май",
				  "Июнь",
				  "Июль",
				  "Август",
				  "Сентябрь",
				  "Октябрь",
				  "Ноябрь",
				  "Декабрь",
				],
			  },
			rangeSeparator: " — "
		};

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

function preloadPage(){
	$('html').addClass('page-loaded');
}

var DESKTOP = device.desktop();
var MOBILE = device.mobile();
var TABLET = device.tablet();

//How many days in dateRange
var daysInRange = 0;

function placeholderInit(){
	$('[placeholder]').placeholder();
}

function tabsInit(){
	$('.ui-tabs').tabs();
}

function scroll2idInit(){
	$("a.scroll-to-hash").mPageScroll2id();

	if(window.location.hash) {
		var hash = window.location.hash.substring(1);
		window.location.hash = "";
		setTimeout(function() {
			$.mPageScroll2id("scrollTo", hash);
		}, 1);
	}
}

function printShow() {
	$('.view-print').on('click', function (e) {
		e.preventDefault();
		window.print();
	});
}

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
	if (DESKTOP === true && selectArray.length) {
		$.each(selectArray, function(i, el){
			var checked = $(el).multiselect('getChecked');
			var flag = true;
			if ( !checked.length ) {
				flag = false;
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

		if (overlayTween.progress() !== 0 && !overlayTween.reversed()) {
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

		// event menu before open
		$navContainer.trigger('beforeMenuOpen');

		// add modifier class before open
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

					// event menu after open
					$navContainer.trigger('afterMenuOpen');

					// add modifier class after open
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

		// event menu before close
		$navContainer.trigger('beforeMenuClose');

		// remove modifier class before close
		$html.removeClass(self.modifiers.opened);
		$html.removeClass(self.modifiers.openStart);
		$btnMenu.removeClass(self.modifiers.active);

		self.showOverlay(false);

		if ($btnMenu.is(':hidden') ) {
			// console.log('style reset');
			$navContainer.attr('style', '');
			return;
		}

		TweenMax.to($navContainer, _animationSpeed / 1000, {
			autoAlpha: 0, onComplete: function () {

				if (!self.navIsOpened) return;

				// event menu after close
				$navContainer.trigger('afterMenuClose');

				self.prepareAnimation();

				self.navIsOpened = false;

			}
		});
	};

	// close method
	MainNavigation.prototype.closeNavMethod = function() {

		var self = this;

		self.$navContainer.on('closeMenu', function () {
			// console.log('init closeNavMethod');
			self.closeNav();
		});

	};

	// preparation element before animation
	MainNavigation.prototype.prepareAnimation = function() {
		var self = this,
			$navContainer = self.$navContainer;

		if (self.$btnMenu.is(':visible')) {
			TweenMax.set($navContainer, {autoAlpha: 0, onComplete: function () {

				// console.log('prepareAnimation');
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
		});
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
		animationSpeedOverlay: 100,
		overlayAppend: '.main',
		overlayBoolean: true,
		overlayAlpha: 0.75
	});

	// close sidebar on click common slider (index.html)
	function closeMenuOnClickSlide() {

		$('.js-common-slider-nav').on('click', 'a[data-slide]', function () {

			$container.trigger('closeMenu');

		});

	}

	closeMenuOnClickSlide();

	// toggle autoplay to false for common slider (index.html)
	function toggleAutoplaySlider() {

		$container.on('beforeMenuOpen', function () {

			$('.common-slider').slick("slickSetOption", "autoplay", false, true);

		});

		$container.on('beforeMenuClose', function () {

			if ( $(window).outerWidth() > 640 ) {
				$('.common-slider').slick("slickSetOption", "autoplay", true, true);
			}

		});

	}

	toggleAutoplaySlider();

	// close sidebar on click common slider (index.html)
	function closeAsideAfterShowSidebar() {

		$container.on('beforeMenuOpen', function () {

			if ( $(window).outerWidth() < 980 ) {
				$('.aside').trigger('closeMenu');
			}

		});

	}

	closeAsideAfterShowSidebar();
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
		animationSpeedOverlay: 100,
		animationType: 'rtl',
		overlayAppend: '.main',
		overlayBoolean: true,
		overlayAlpha: 0.75
	});
}
/*toggle aside end*/

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
		});
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

			if (!currentAccordionItem.has(collapsibleElement).length || current.hasClass('has-url-js')){
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
		});
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

		if ($('.search-form').length) {
			$(document).trigger('closeSearchForm');
		}

		$(this).closest('.lang').toggleClass('lang-opened');

		e.stopPropagation();
	});

	$(document).on('click closeDropLong', function () {
		closeDropLong();
	});

	$('.lang-list').on('click', function (e) {
		e.stopPropagation();
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
				dots: true,
				arrows: false,
				fade: true,
				focusOnSelect: true,
				touchMove: false,
				draggable: false,
				accessibility: false,
				swipe: true,
				responsive: [
					{
						breakpoint: 640,
						settings: {
							autoplay: false,
						}
					}
				]
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

/**
 * scroll to form
 * */
function scrollToForm() {
	$(window).on("load",function(){

		/* Page Scroll to id fn call */
		$("a.btn-callback").mPageScroll2id({
			scrollSpeed: 500,
			offset: '.header'
		});
	});
}
/*scroll to section end*/

/*toggle form search */
function toggleFormSearch() {
	var $searchForm = $('.js-search-form');
	if (!$searchForm.length) {
		return;
	}

	var $body = $('body');
	var openedFormClass = 'search-form-opened';

	$searchForm.on('click', function (e) {
		e.stopPropagation();
	});

	$searchForm.on('click', '.js-search-close', function (e) {
		e.preventDefault();

		$body.toggleClass(openedFormClass, !$body.hasClass(openedFormClass));

		focusingSearchForm();
	});

	$(document).on('click closeSearchForm', function () {
		$body.removeClass(openedFormClass);
	});

	$searchForm.on('click', 'input:submit', function (e) {
		if(!$body.hasClass(openedFormClass)){

			if ($('.lang').length) {
				$(document).trigger('closeDropLong');
			}

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
/*toggle form search end*/

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
	});
}
/*equal height end*/

/**!
 * map init
 * */
// var styleMap = [{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#d3d3d3"}]},{"featureType":"transit","stylers":[{"color":"#808080"},{"visibility":"off"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"visibility":"on"},{"color":"#b3b3b3"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#ffffff"},{"weight":1.8}]},{"featureType":"road.local","elementType":"geometry.stroke","stylers":[{"color":"#d7d7d7"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#ebebeb"}]},{"featureType":"administrative","elementType":"geometry","stylers":[{"color":"#a7a7a7"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#efefef"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#696969"}]},{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"visibility":"on"},{"color":"#737373"}]},{"featureType":"poi","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#d6d6d6"}]},{"featureType":"road","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"color":"#dadada"}]}];

// inline script
// var pinMap;
// var localObjects;

function contactsMap(){
	if (!$('#contacts-map').length) return false;

	function mapCenter(index){
		var localObject = localObjects[index];

		return{
			lat: localObject[0].lat + localObject[1].latBias,
			lng: localObject[0].lng + localObject[1].lngBias
		};
	}

	var markers = [],
		elementById = [
			document.getElementById('contacts-map')
		];

	pinMap['anchor'] = new google.maps.Point(300,830);
	pinMap['scale'] = 0.07;

	var mapOptions = {
		zoom: localObjects[0][3],
		center: mapCenter(0),
		// styles: styleMap,
		mapTypeControl: false,
		scaleControl: false,
		scrollwheel: false
	};

	var map0 = new google.maps.Map(elementById[0], mapOptions);

	addMarker(0, map0);

	/*aligned after resize*/
	var resizeTimer0;
	$(window).on('resize', function () {
		clearTimeout(resizeTimer0);
		resizeTimer0 = setTimeout(function () {
			moveToLocation(0, map0);
		}, 500);
	});

	/*move to location*/
	function moveToLocation(index, map){
		var object = localObjects[index];
		var center = new google.maps.LatLng(mapCenter(index));
		map.panTo(center);
		map.setZoom(object[3]);
	}

	// var infoWindow = new google.maps.InfoWindow({
	// 	maxWidth: 220
	// });

	var mapMarkerIndex, currentMapMarkerIndex = 0,
		indexAnchor = 0;

	$('.js-contacts-anchor').on('click', function(e) {
		e.preventDefault();

		var $this = $(this);

		mapMarkerIndex = $this.index();

		if (mapMarkerIndex === currentMapMarkerIndex) return false;

		indexAnchor = $this.data('location');
		deleteMarkers();
		moveToLocation( indexAnchor, map0 );
		addMarker(indexAnchor, map0);

		currentMapMarkerIndex = mapMarkerIndex;
	});

	var mapIsExpand = false;

	$('.js-map-expand').on('click', function (e) {

		e.preventDefault();

		$(this)
			.toggleClass('active', !mapIsExpand)
			.parent()
			.toggleClass('active', !mapIsExpand);

		mapIsExpand = !mapIsExpand;

		// moveToLocation( indexAnchor, map0 );
	});

	function addMarker(index,map) {
		var object = localObjects[index];

		var marker = new google.maps.Marker({
			position: object[0],
			map: map,
			icon: object[2],
			title: object[4].title,
			animation: google.maps.Animation.DROP
		});

		markers.push(marker);

		// function onMarkerClick() {
		// 	var marker = this;
		//
		// 	infoWindow.setContent(
		// 		'<div class="map-popup">' +
		// 		'<h4>'+object[4].title+'</h4>' +
		// 		'<div class="map-popup__list">' +
		// 		'<div class="map-popup__row">'+object[4].address+'</div>' +
		// 		'<div class="map-popup__row">'+object[4].phone+'</div>' +
		// 		'<div class="map-popup__row">'+object[4].works+'</div>' +
		// 		'</div>' +
		// 		'</div>'
		// 	);
		//
		// 	infoWindow.close();
		//
		// 	infoWindow.open(map, marker);
		// }

		// map.addListener('click', function () {
		// 	infoWindow.close();
		// });

		// marker.addListener('click', onMarkerClick);
	}

	function setMapOnAll(map) {
		for (var i = 0; i < markers.length; i++) {
			markers[i].setMap(map);
		}
	}

	function deleteMarkers() {
		setMapOnAll(null);
		//markers = [];
	}
}
/*map init end*/

/**
 * contacts switcher
 * */
function contactsSwitcher() {
	// external js:
	// 1) TweetMax VERSION: 1.19.0 (widgets.js);
	// 2) resizeByWidth (resize only width);

	var $main = $('.main');

	if($main.length){
		var $anchor = $('.js-contacts-anchor'),
			$container = $('.js-contacts-container'),
			$content = $('.js-contacts-content'),
			// $thumb = $('.js-tumbler'),
			activeClass = 'active',
			animationSpeed = 0.3,
			animationHeightSpeed = 0.15;

		$.each($main, function () {
			var $this = $(this),
				$thisAnchor = $this.find($anchor),
				$thisContainer = $this.find($container),
				$thisContent = $this.find($content),
				// $thisThumb = $this.find($thumb),
				// dataPrevThumb = $thisThumb.prev().find($anchor).data('for'),
				// dataNextThumb = $thisThumb.next().find($anchor).data('for'),
				initialDataAtr = 'contacts-minsk',
				activeDataAtr = false;

			// prepare traffic content
			function prepareTrafficContent() {
				$thisContainer.css({
					'display': 'block',
					'position': 'relative',
					'overflow': 'hidden'
				});

				$thisContent.css({
					'display': 'block',
					'position': 'absolute',
					'left': 0,
					'right': 0,
					'width': '100%',
					'z-index': -1
				});

				switchContent();
			}

			prepareTrafficContent();

			// toggle content
			$thisAnchor.on('click', function (e) {
				e.preventDefault();

				var $cur = $(this),
					dataFor = $cur.data('for');

				scrollToAnchors.call(this);

				if (activeDataAtr === dataFor) return false;

				initialDataAtr = dataFor;

				switchContent();
			});

			// thumb content
			// $thumb.on('click', function (e) {
			// 	e.preventDefault();
			//
			// 	activeDataAtr = false;
			//
			// 	initialDataAtr = (initialDataAtr === dataPrevThumb) ? dataNextThumb : dataPrevThumb;
			//
			// 	switchContent();
			// });

			// switch content
			function switchContent() {
				toggleContent();
				changeHeightContainer();
				toggleActiveClass();
			}

			// show active content and hide other
			function toggleContent() {
				var $initialContent = $thisContent.filter('[data-id="' + initialDataAtr + '"]');

				TweenMax.set($thisContent, {
					autoAlpha: 0,
					'z-index': -1
				});

				TweenMax.to($initialContent, animationSpeed, {
					autoAlpha: 1,
					onComplete: function () {
						$initialContent.css('z-index', 2);
					}
				});
			}

			// change container's height
			function changeHeightContainer() {
				var $initialContent = $thisContent.filter('[data-id="' + initialDataAtr + '"]');

				TweenMax.to($thisContainer, animationHeightSpeed, {
					'height': $initialContent.outerHeight()
				});
			}

			// change container's height on resize window width
			$(window).on('resizeByWidth', function () {
				changeHeightContainer();
			});

			// toggle class active
			function toggleActiveClass(){
				$thisAnchor.removeClass(activeClass);
				$thisContent.removeClass(activeClass);

				// toggleStateThumb();

				if (initialDataAtr !== activeDataAtr) {

					activeDataAtr = initialDataAtr;

					$thisAnchor.filter('[data-for="' + initialDataAtr + '"]').addClass(activeClass);
					$thisContent.filter('[data-id="' + initialDataAtr + '"]').addClass(activeClass);

					return false;
				}

				activeDataAtr = false;
			}

			function scrollToAnchors() {
				$('html,body').stop().animate({scrollTop: $(this).parent().offset().top - $('.header').outerHeight() - 20}, 300);
			}

			// toggle thumb's state
			// function toggleStateThumb() {
			// 	$thisThumb.addClass(activeClass);
			//
			// 	if (initialDataAtr == dataPrevThumb) {
			// 		$thisThumb.removeClass(activeClass)
			// 	}
			// }
		});
	}
}
/* contacts switcher end */


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
		});
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
	// var $sidebar = $(".sidebar");
	// $sidebar.css('position','static');
	// if ($sidebar.length) {
	// 	var resizeTimerMenu;
	//
	// 	$(window).on('load resize', function () {
	// 		if($(window).width() < 1280){
	// 			// $sidebar.trigger("sticky_kit:detach").attr('style','');
	// 			$sidebar.trigger("sticky_kit:detach").css('position','fixed');
	// 			return;
	// 		}
	//
	// 		clearTimeout(resizeTimerMenu);
	// 		resizeTimerMenu = setTimeout(function () {
	// 			$sidebar.stick_in_parent({
	// 				parent: '.main',
	// 				offset_top: topValue
	// 			});
	// 		}, 100);
	// 	});
	// }

	// $('.menu__list').on('accordionChange', function () {
	// 	$sidebar.trigger("sticky_kit:recalc");
	// });
}
/*sticky layout end*/

/** ready/load/resize document **/


function tip() {
	$("body").on("click", ".default-popup-link", function() {
		var $elem = $(this);
		openBuble($elem);
		return false;
	});

	$("body").on("click", function(){
		var $elem = $('.default-popup-closer');
		closeBuble($elem);
	});

	$('.b-default-popup-inner').on("click touchstart", function(e) {
		e.stopPropagation();
	});
}


function openBuble($elem) {
	$(".default-popup-link.opened").removeClass("opened");
	$elem.addClass("opened");
	var offset = $elem.offset();
	var pTitle = $elem.attr("data-popup-title");
	var pContent = $elem.attr("data-popup-content");
	$(".b-default-popup h4").html(pTitle);
	$(".b-default-popup-text").html(pContent).wrapInner("<div class='scroll-pane'></div>");
	$(".b-default-popup").removeAttr("style");
	$(".b-default-popup").fadeIn(0, function() {
		$(this).position({
			of: $(".default-popup-link.opened"),
			my: "center bottom-5",
			at: "center top",
			collision: "fit flip"
		});
	});
	$(".b-default-popup .scroll-pane").jScrollPane({
		verticalGutter: 19
	}).on("mousewheel", function(e) {
		e.preventDefault();
	});
};


function closeBuble($elem) {
	$(".n-c").removeClass("n-c");
	$(".default-popup-link.opened").removeClass("opened");
	$elem.parents(".b-default-popup").removeAttr("style").fadeOut();
};

function graphProgress() {
	if ($('.graph-progress').length > 0) {
		var el = $('.graph-progress');

		$.each(el, function(index, val) {
			var _this = $(val);
			var value = parseInt(_this.data('pct'));
			var $circle = $('.svg .circle-2', _this);

			if (isNaN(value)) {

				value = 100;

			} else{
				var r = $circle.attr('r');
				var c = Math.PI*(r*2);

				if (value < 0) { value = 0;}
				if (value > 100) { value = 100;}

				var pct = ((100-value)/100)*c;

				$circle.css({ strokeDashoffset: pct});

				$('.large-text', _this).animateNumber({ number: value }, 2000);
			}
		});
	}
}

function accordion() {
	if ($('.accordion').length > 0) {
		var allPanels = $('.accordion > dd').hide();
		$('.accordion > dt > a').click(function() {

			var el = $(this).parent().next();

			if (!el.is(':visible') === true) {
				allPanels.slideUp(200);
				el.slideDown(200);
			}
			return false;
		});
	};
}

;(function($){
	var defaults = {
		opener: '.zoom-table__opener-js',
		popup: '.zoom-table__popup-js',
		push: '.zoom-table__push-js',
		closeBtn: '.zoom-table__close-js',
		outsideClick: true, // Close all if outside click
		escapeClick: true // Close all if escape key click
	};

	function ZoomTable(element, options) {
		var self = this;

		self.config = $.extend(true, {}, defaults, options);

		self.element = element;
		self.page = $('html');
		self.stopPropogation = '.zoom-table__no-close-js';
		self.modifiers = {
			init: 'zoom-table--initialized',
			isOpen: 'zoom-table--is-open'
		};
		self.tplPopup = $('<div class="zoom-table-popup user-content zoom-table__popup-js"><a href="#" class="zoom-table-popup__close zoom-table__close-js" title="Закрыть">x Закрыть</a><div class="zoom-table-popup__holder"><div class="zoom-table-popup__table"><div class="zoom-table-popup__cell"><div class="zoom-table-popup__content zoom-table__push-js zoom-table__no-close-js"></div></div></div></div>');

		self.callbacks();

		// close popup if clicked outside active element
		if (self.config.outsideClick) {
			self.clickOutside();
		}
		// close popup if clicked escape key
		if (self.config.escapeClick) {
			self.clickEscape();
		}
		self.eventOnOpener();

		self.init();
	}

	/** track events */
	ZoomTable.prototype.callbacks = function () {
		var self = this;

		$.each(self.config, function (key, value) {
			if(typeof value === 'function') {
				self.element.on(key + '.zoomTable', function (e, param) {
					return value(e, self.element, param);
				});
			}
		});
	};

	ZoomTable.prototype.eventOnOpener = function () {
		var self = this;

		self.element.on('click', self.config.opener, function (event) {
			var curOpener = $(this);

			if (curOpener.hasClass(self.modifiers.isOpen)) {
				self.closePopup();

				event.preventDefault();
				event.stopPropagation();
				return;
			}

			if($('.' + self.modifiers.isOpen).length){
				self.closePopup();
			}

			// create popup
			if(!$(self.config.popup).length){
				console.log(1);
				self.tplPopup.clone().appendTo($('body'));
			}
			$(self.config.push).html(curOpener.parent().find('.table_auto').html());

			// open current popup
			curOpener.addClass(self.modifiers.isOpen);
			$(self.config.popup).addClass(self.modifiers.isOpen);
			self.page.addClass(self.modifiers.isOpen);

			// callback after opened popup
			self.element.trigger('afterOpened.zoomTable');

			event.preventDefault();
			event.stopPropagation();

		});

		self.page.on('click', self.config.closeBtn, function (event) {
			self.closePopup();

			event.preventDefault();
		});
	};

	ZoomTable.prototype.clickOutside = function () {

		var self = this;
		$(document).on('click', function(event){
			var isOpenElement = $('.' + self.modifiers.isOpen);

			if(isOpenElement.length && !$(event.target).closest(self.stopPropogation).length) {

				self.closePopup();
				event.stopPropagation();
			}
		});

	};

	ZoomTable.prototype.clickEscape = function () {

		var self = this;

		$(document).keyup(function(e) {
			var isOpenElement = $('.' + self.modifiers.isOpen);

			if (isOpenElement.length && e.keyCode === 27) {

				self.closePopup();
			}
		});

	};

	ZoomTable.prototype.closePopup = function () {

		var self = this;

		$('.' + self.modifiers.isOpen).removeClass(self.modifiers.isOpen);

		// callback afterClose
		self.element.trigger('afterClosed.zoomTable');
	};

	ZoomTable.prototype.init = function () {

		var self = this;

		this.element.addClass(self.modifiers.init);

		this.element.trigger('afterInit.zoomTable');

	};

	$.fn.zoomTable = function (options) {
		return this.each(function(){
			new ZoomTable($(this), options);
		});

	};
})(jQuery);

function tabWrapper() {
	var el = $('.user-content table');
	var tplBtn = '<a href="#"  class="table-zoom-btn table-zoom-btn-js" title="Поноэкранный режим"><span class="table-zoom-btn_nw"></span><span class="table-zoom-btn_ne"></span><span class="table-zoom-btn_sw"></span><span class="table-zoom-btn_se"></span></a>';
	if (el.length > 0) {
		el.wrap('<div class="table_zoom"><div class="table_auto"></div></div>');

		$('.table_auto').before(tplBtn);
	}

	var $zoomTableWrap = $('.user-content');
	if ($zoomTableWrap.length) {
		$zoomTableWrap.zoomTable({
			opener: '.table-zoom-btn-js',
			afterOpened: function (e, el) {
				console.log('afterOpened, el: ', el);
			},
			afterClosed: function (e, el) {
				console.log('afterClosed, el: ', el);
			}
		})

	}
}


yearsList = function() {

	if ($('.js-years-list').length > 0) {

		var el = $('.js-years-list');

		var cur = $('.years-list__current', el).index();

		if (cur == 0) {
			cur = 0
		} else {
			cur = cur - 1;
		}

		// console.log(cur);

		$('.js-years-list').slick({
			infinite: false,
			slidesToShow: 3,
			slidesToScroll: 3,
			speed: 200,
			initialSlide: cur,
			prevArrow: '<div class="years-list__item years-list__prev"><a href="#"><span class="icon-angle-left"></span></a></div>',
			nextArrow: '<div class="years-list__item years-list__next"><a href="#"><span class="icon-angle-right"></span></a></div>'
		});
	}

};

function initAjaxForm(form_container_selector, form_result_message_selector){
	var $form = $(form_container_selector + ' form'),
		$btn = $(form_container_selector + ' input[type="submit"]'),
		message = form_container_selector + ' ' + form_result_message_selector,
		$message = $(message);

	$form.ajaxForm({
		beforeSubmit: function (formData, jqForm, options) {
			$btn.attr("disabled", true);

			return true;
		},
		success: function(responseText, statusText, xhr, $form)  {
			if(responseText){
				$(responseText).find('.input-holder.ajax').each(function(i, item){
					// console.info('#' + $(item).attr('id') );
					$message.find( '#' + $(item).attr('id') ).html( $(item).html() );
				});

				$('html, body').animate({
					scrollTop: $(form_container_selector).offset().top - $('header.header').height()
				}, 2000);

				$btn.attr("disabled", false);
			}
		}
	});
}

/**
 * ! jquery.ms-tabs.js
 * Version: 2019.1.2 (2019.05.04)
 * Author: *
 * Description: Switch panels
 */

(function ($) {
	'use strict';

	var MsTabs = function (element, config) {
		var self,
				$element = $(element),
				$anchor = $element.find(config.anchor),
				$panels = $element.find(config.panels),
				$panel = $element.find(config.panel),
				$select = $element.find(config.compactView.elem),
				$selectDrop = $element.find(config.compactView.drop),
				$html = $('html'),
				isAnimated = false,
				activeId,
				isOpen = false,
				isSelectOpen = false,
				collapsible = $element.data('tabs-collapsible') || config.collapsible,
				pref = 'ms-tabs',
				pluginClasses = {
					initialized: pref + '_initialized',
					active: pref + '_active-tab',
					collapsible: pref + '_is-collapsible',
					selectOpen: pref + '_select-open'
				},
				mixedClasses = {
					initialized: pluginClasses.initialized + ' ' + (config.modifiers.initClass || ''),
					active: pluginClasses.active + ' ' + (config.modifiers.activeClass || ''),
					collapsible: pluginClasses.collapsible + ' ' + (config.modifiers.collapsibleClass || ''),
					selectOpen: pluginClasses.selectOpen + ' ' + (config.compactView.openClass || '')
				};

		var callbacks = function () {
					/** track events */
					$.each(config, function (key, value) {
						if (typeof value === 'function') {
							$element.on('msTabs.' + key, function (e, param) {
								return value(e, $element, param);
							});
						}
					});
				},

				prevent = function (event) {
					event.preventDefault();
					event.stopPropagation();
					return false;
				},

				changeSelect = function () {
					// Изменить контент селекта при изменении активного таба
					$select.html($anchor.filter('[href="#' + activeId + '"]').html() + '<i>&#9660;</i>');
					$element.trigger('msTabs.afterSelectValChange');
				},

				eventsSelect = function () {
					// Открыть переключатели табов
					$select.on('click', function () {
						// $element.add($select).toggleClass(mixedClasses.selectOpen);
						if (isSelectOpen) {
							closeSelect();
						} else {
							openSelect();
						}

						prevent(event);
					})
				},

				openSelect = function () {
					isSelectOpen = true;
					$element.add($select).add($selectDrop).addClass(mixedClasses.selectOpen);
					$element.trigger('msTabs.afterSelectOpen');
				},

				closeSelect = function () {
					isSelectOpen = false;
					$element.add($select).add($selectDrop).removeClass(mixedClasses.selectOpen);
					$element.trigger('msTabs.afterSelectClose');
				},

				closeSelectByClickOutside = function () {
					$html.on('click', function (event) {
						if (isSelectOpen && config.compactView.closeByClickOutside && !$(event.target).closest($selectDrop).length) {
							closeSelect();
						}
					});
				},

				closeSelectByClickEsc = function () {
					$html.keyup(function (event) {
						if (isSelectOpen && config.compactView.closeByClickEsc && event.keyCode === 27) {
							closeSelect();
						}
					});
				},

				show = function () {
					// Определяем текущий таб
					var $activePanel = $panel.filter('[id="' + activeId + '"]'),
							$otherPanel = $panel.not('[id="' + activeId + '"]'),
							$activeAnchor = $anchor.filter('[href="#' + activeId + '"]');

					if (!isAnimated) {
						// console.log('Показать таб:', activeId);
						isAnimated = true;

						// Удалить активный класс со всех элементов
						$panel.add($anchor).removeClass(mixedClasses.active);

						// Добавить класс на каждый активный элемент
						$activePanel.add($activeAnchor).addClass(mixedClasses.active);

						// Анимирование высоты табов
						$panels
								.css('overflow', 'hidden')
								.animate({
									'height': $activePanel.outerHeight()
								}, config.animationSpeed);

						// Скрыть все табы, кроме активного
						hideTab($otherPanel);

						// Показать активный таб
						$activePanel
								.css({
									'z-index': 2,
									'visibility': 'visible'
								})
								.animate({
									'opacity': 1
								}, config.animationSpeed, function () {
									$activePanel
											.css({
												'position': 'relative',
												'left': 'auto',
												'top': 'auto',
												'pointer-events': ''
											});
									// .attr('tabindex', 0);

									$panels.css({
										'height': '',
										'overflow': ''
									});

									// Анимация полностью завершена
									isOpen = true;
									isAnimated = false;
								});
					}

					// callback after showed tab
					$element.trigger('msTabs.afterOpen');
					$element.trigger('msTabs.afterChange');
				},

				hide = function () {
					// Определить текущий таб
					var $activePanel = $panel.filter('[id="' + activeId + '"]');

					if (!isAnimated) {
						// console.log("Скрыть таб: ", activeId);

						isAnimated = true;

						// Удалить активный класс со всех элементов
						$panel.add($anchor).removeClass(mixedClasses.active);

						// Анимирование высоты табов
						$panels
								.css('overflow', 'hidden')
								.animate({
									'height': 0
								}, config.animationSpeed);

						hideTab($activePanel, function () {
							$panels.css({
								'height': ''
							});

							isOpen = false;
							isAnimated = false;
						});
					}

					// callback after tab hidden
					$element.trigger('msTabs.afterClose');
					$element.trigger('msTabs.afterChange');
				},

				hideTab = function ($_panel) {
					var callback = arguments[1];
					$_panel
							.css({
								'z-index': -1
							})
							// .attr('tabindex', -1)
							.animate({
								'opacity': 0
							}, config.animationSpeed, function () {
								$_panel.css({
									'position': 'absolute',
									'left': 0,
									'top': 0,
									'visibility': 'hidden',
									'pointer-events': 'none'
								});

								// Анимация полностью завершена
								if (typeof callback === "function") {
									callback();
								}
							});
				},

				events = function () {
					$anchor.on('click', function (event) {
						event.preventDefault();

						var curId = $(this).attr('href').substring(1);
						// console.log("Таб анимируется?: ", isAnimated);
						// console.log("Текущий таб открыт?: ", isOpen);
						// console.log("Таб нужно закрывать, если открыт?: ", collapsible);
						// console.log("activeId (Предыдущий): ", activeId);

						if (isAnimated || !collapsible && curId === activeId) {
							return false;
						}

						if (collapsible && isOpen && curId === activeId) {
							hide();
						} else {
							activeId = curId;
							// console.log("activeId (Текущий): ", activeId);
							show();
						}

						// Изменить контент селекта
						if (config.compactView) {
							changeSelect();
							closeSelect();
						}
					});
				},

				init = function () {

					$anchor.filter('.' + pluginClasses.active).addClass(mixedClasses.active);
					$anchor.filter('.' + config.modifiers.activeClass).addClass(mixedClasses.active);

					$panels.css({
						'display': 'block',
						'position': 'relative'
					});

					$panel
							.css({
								'position': 'absolute',
								'left': 0,
								'top': 0,
								'opacity': 0,
								'width': '100%',
								'visibility': 'hidden',
								'z-index': -1,
								'pointer-events': 'none'
							});
					// .attr('tabindex', -1);

					// console.log("config.activeIndex === 0 || config.activeIndex: ", config.activeIndex === 0 || config.activeIndex);

					if ($anchor.filter('.' + pluginClasses.active).length) {
						activeId = $anchor.filter('.' + pluginClasses.active).attr('href').substring(1);
					} else if (config.activeIndex === 0 || config.activeIndex) {
						activeId = $anchor.eq(config.activeIndex).attr('href').substring(1);
					}

					// console.log("activeId (сразу после инициализации): ", activeId);

					if (activeId) {
						var $activeAnchor = $anchor.filter('[href="#' + activeId + '"]'),
								$activePanel = $panel.filter('[id="' + activeId + '"]');

						// Добавить класс на каждый активный элемент
						$activePanel.add($activeAnchor).addClass(mixedClasses.active);

						// Показать активный таб
						$activePanel
								.css({
									'position': 'relative',
									'left': 'auto',
									'top': 'auto',
									'opacity': 1,
									'visibility': 'visible',
									'z-index': 2,
									'pointer-events': ''
								});
						// .attr('tabindex', 0);

						isOpen = true;
					}

					// Изменить контент селекта
					if (config.compactView.elem) {
						changeSelect();
						// !Предупреждение, если не задан элемент, котрый будет выполнять роль опшинов
						if (!config.compactView.drop) {
							console.warn('You must choose a DOM element as select drop! Pun in a compactView.drop');
						}
					}

					// Добавить специальный класс, если включена возможность
					// разворачивать/сворачивать активный таб
					if (collapsible) {
						$element.addClass(mixedClasses.collapsible);
					}

					// После инициализации плагина добавить внутренний класс и,
					// если указан в опициях, пользовательский класс
					$element.addClass(mixedClasses.initialized);

					$element.trigger('msTabs.afterInit');
				};

		self = {
			callbacks: callbacks,
			eventsSelect: eventsSelect,
			closeSelectByClickOutside: closeSelectByClickOutside,
			closeSelectByClickEsc: closeSelectByClickEsc,
			events: events,
			init: init
		};

		return self;
	};

	$.fn.msTabs = function () {
		var _ = this,
				opt = arguments[0],
				args = Array.prototype.slice.call(arguments, 1),
				l = _.length,
				i,
				ret;
		for (i = 0; i < l; i++) {
			if (typeof opt === 'object' || typeof opt === 'undefined') {
				_[i].msTabs = new MsTabs(_[i], $.extend(true, {}, $.fn.msTabs.defaultOptions, opt));
				_[i].msTabs.init();
				_[i].msTabs.callbacks();
				_[i].msTabs.eventsSelect();
				_[i].msTabs.closeSelectByClickOutside();
				_[i].msTabs.closeSelectByClickEsc();
				_[i].msTabs.events();
			} else {
				ret = _[i].msTabs[opt].apply(_[i].msTabs, args);
			}
			if (typeof ret !== 'undefined') {
				return ret;
			}
		}
		return _;
	};

	$.fn.msTabs.defaultOptions = {
		anchor: '.tabs__anchor-js',
		panels: '.tabs__panels-js',
		panel: '.tabs__panel-js',
		animationSpeed: 300,
		activeIndex: 0,
		collapsible: false,
		compactView: {
			elem: null,
			drop: null,
			closeByClickOutside: true,
			closeByClickEsc: true,
			openClass: null
		},
		modifiers: {
			initClass: null,
			collapsibleClass: null,
			activeClass: null
		}
	};

})(jQuery);

/**
 * Tabs
 */
function tabsCustomInit () {
	var $tabs = $('.tabs-js'),
			$tabsPanels = $('.tabs__panels-js');

	if ($tabs.length) {
		$tabs.msTabs({
			anchor: $('.tabs__thumbs-js').find('a'),
			panels: $tabsPanels,
			panel: $tabsPanels.children(),
			modifiers: {
				activeClass: 'tabs-active'
			},
			compactView: {
				elem: '.tabs__select-js',
				drop: '.tabs__select-drop-js',
				arrowTpl: '<i><svg width="10" height="6" viewBox="0 0 10 6" xmlns="http://www.w3.org/2000/svg"><path d="M0.292893 0.292893C0.683417 -0.0976311 1.31658 -0.0976311 1.70711 0.292893L5 3.58579L8.29289 0.292893C8.68342 -0.0976311 9.31658 -0.0976311 9.70711 0.292893C10.0976 0.683417 10.0976 1.31658 9.70711 1.70711L5.70711 5.70711C5.31658 6.09763 4.68342 6.09763 4.29289 5.70711L0.292893 1.70711C-0.0976311 1.31658 -0.0976311 0.683417 0.292893 0.292893Z"></path></svg></i>',
				openClass: 'tabs-select-open'
			},
			afterChange: function () {
				recalcSticky();
			}
		});

		function recalcSticky() {
			$(".sidebar").trigger("sticky_kit:recalc");
			$(".aside").trigger("sticky_kit:recalc");
		}
	}
}

/**
 * ! jquery.ms-rolls.js
 * Version: 2019.1.1
 * Author: Astronim*
 * Description: Rolls
 */

(function ($) {
	'use strict';

	var MsRolls = function (element, config) {
		var self,
				$element = $(element),
				$panel = $(config.panel, $element),
				$panelWrap = $('.rolls__panel-wrap-js', $element),
				isAnimated = false,
				pref = 'ms-rolls',
				pluginClasses = {
					initClass: pref + '_initialized'
				},
				focusElements = 'input, a, [tabindex], area, select, textarea, button, [contentEditable=true]' + config.switcher,
				positionPanelStyle = {
					position: 'absolute',
					left: 0,
					top: 0,
					width: '100%'
				},
				destroyPositionPanelStyle = {
					position: '',
					left: '',
					top: '',
					width: ''
				},
				showPanelStyles = {
					opacity: '',
					'user-select': '',
					'pointer-event': '',
					'z-index': ''
				},
				hidePanelStyles = {
					opacity: 0,
					'user-select': 'none',
					'pointer-event': 'none',
					'z-index': -1
				};

		var dataCollapsed = $element.attr('data-rolls-collapsed');
		var collapsed = (dataCollapsed === "true" || dataCollapsed === "false") ? dataCollapsed === "true" : config.collapsed;

		var callbacks = function () {
					/** track events */
					$.each(config, function (key, value) {
						if (typeof value === 'function') {
							$element.on('msRolls.' + key, function (e, param) {
								return value(e, $element, param);
							});
						}
					});
				},
				tabindexOn = function (_element) {
					// Все элементы _element поставить в фокус-очередь
					_element.attr('tabindex', '0');
				},
				tabindexOff = function (_element) {
					// Все элементы _element убрать с фокус-очереди
					_element.attr('tabindex', '-1');
				},
				open = function ($_panel) {
					// Если входящей Панели не существует, выполнение функции прекращается
					if (!$_panel.length) {
						return false;
					}

					//
					var $activePanelWrap = $_panel.parent(), // Ближайшая родительская обертка активной Панели
							$activeParentsPanels = $_panel.parentsUntil(element, config.panel), // Все родительские Панели активной Панели
							$otherActivePanelsWrap = $activeParentsPanels.parent(), // Все родительские Обертка активной Панели не включая ближайшую
							$otherActiveHeader = $otherActivePanelsWrap.prev(config.header), // Все родительские Обертка активной Панели не включая ближайшую
							$otherActiveParentsItems = $activeParentsPanels.parentsUntil(element, config.item); // Все родительские Элементы активной Панели

					// 1) Открыть все родительские Панели (без анимации)
					// Добавить класс на активные родительские (не ближайшие) элементы
					$activeParentsPanels
							.add($otherActiveParentsItems)
							.add($otherActiveHeader)
							.add($(config.switcher, $otherActiveHeader))
							.addClass(config.modifiers.activeClass);

					// Открывать родительские Панели необходимо, если, например, открывается вложенная Панель методом "open"
					$activeParentsPanels
							.css($.extend(destroyPositionPanelStyle, showPanelStyles))
							.data('active', true).attr('data-active', true); // Указать в data-атрибуте, что Панель открыта;

					// 2) Открыть текущую панель (с анимацией)
					$element.trigger('msRolls.beforeOpen');// Вызов события перед открытием текущей панели

					var $activeItems = $_panel.closest(config.item), // Родительский Элемент активной Панели
							$activeHeader = $activePanelWrap.prev(config.header); // Шапка активной Панели

					// Добавить класс на активные элементы
					$_panel.add($activeItems).add($activeHeader).add($(config.switcher, $activeHeader)).addClass(config.modifiers.activeClass);

					var callback = arguments[1];

					$_panel.css(showPanelStyles); // Панель делаем видимой до начала анимации

					changeHeight($activePanelWrap, $_panel.outerHeight(), function () {
						$_panel
								.css(destroyPositionPanelStyle)
								.data('active', true).attr('data-active', true); // Указать в data-атрибуте, что Панель открыта

						$activePanelWrap.css({
							position: '',
							overflow: '',
							'height': ''
						});

						if (config.accessibility) {
							// Поставить в фокус-очередь все элементы с фокусировкой внутри активной Панели
							tabindexOn($(focusElements, $_panel));

							// В неактивных Панелях все элементы с фокусировкой убрать с фокус-очереди
							tabindexOff($(focusElements, $_panel.find(config.panel).filter(function () {
								return !$(this).data('active');
							})));
						}

						// Вызов события после открытия текущей панели
						$element.trigger('msRolls.afterOpen');

						// Вызов callback функции после открытия панели
						if (typeof callback === "function") {
							callback();
						}
					});

					if (collapsed) {
						// Проверить у соседей всех родительских Элементов наличие активных Панелей
						// Закрыть эти Панели
						var $siblingsPanel = $_panel.parentsUntil($element, config.item).siblings().find(config.panel).filter(function () {
							return $(this).data('active');
						});

						closePanel($siblingsPanel, function () {
							isAnimated = false; // Анимация завершена
						});
					}
				},
				close = function ($_panel) {
					if (!$_panel.length) {
						return false;
					}
					// Закрыть отдельно все вложенные активные панели,
					// И отдельно текущую панель.
					// Это сделано с целью определения события закрытия текущей панели отдельно.

					if (collapsed) {
						// Закрыть активные панели внутри текущей
						var $childrenOpenedPanel = $(config.panel, $_panel).filter(function () {
							return $(this).data('active');
						});

						closePanel($childrenOpenedPanel);
					}

					// Закрыть текущую панель
					$element.trigger('msRolls.beforeClose'); // Вызов события перед закрытием текущей панели
					var callback = arguments[1];

					closePanel($_panel, function () {
						$element.trigger('msRolls.afterClose'); // Вызов события после закрытия текущей панели

						// Вызов callback функции после закрытия панели
						if (typeof callback === "function") {
							callback();
						}
					});
				},
				closePanel = function ($_panel) {
					if (!$_panel.length) {
						return false;
					}

					var callback = arguments[1],
							$curPanelWrap = $_panel.parent(); // родительская обертка активной Панели

					var $curItems = $_panel.closest(config.item), // родительский Элемент активной Панели
							$curHeader = $curPanelWrap.prev(config.header); // Шапка активной Панели

					// Удалить активный класс со всех элементов
					$_panel.add($curItems).add($curHeader).add($(config.switcher, $curHeader)).removeClass(config.modifiers.activeClass);

					// Закрыть панель
					changeHeight($curPanelWrap, 0, function () {
						$_panel
								.css(positionPanelStyle)
								.css(hidePanelStyles)
								.data('active', false).attr('data-active', false); // Указать в data-атрибуте, что панель закрыта

						$curPanelWrap.css('height', '');

						// Web accessibility
						if (config.accessibility) {
							// Убрать с фокус-очереди все элементы с фокусировкой внутри текущей Панели
							tabindexOff($(focusElements, $_panel));
						}

						// Вызов callback функции после закрытия панели
						if (typeof callback === "function") {
							callback();
						}
					});
				},
				changeHeight = function ($_wrap, _val) {
					var callback = arguments[2];

					$_wrap.css({
						position: 'relative',
						overflow: 'hidden'
					}).animate({
						'height': _val
					}, config.animationSpeed, function () {

						if (typeof callback === "function") {
							callback();
						}

						isAnimated = false;
					});
				},
				events = function () {
					$(config.switcher, $element).on(config.event, function (event) {
						// Если панель во время клика находится в процессе анимации, то выполнение функции прекратится

						if (isAnimated) {
							event.preventDefault();
							return false;
						}

						var $currentSwitcher = $(this);

						// Если текущий пункт не содержит панелей,
						// то выполнение функции прекратится
						if (!$currentSwitcher.closest(config.item).has(config.panel).length) {
							return false;
						}

						// Начало анимирования панели
						// Включить флаг анимации
						isAnimated = true;

						event.preventDefault();

						// Определение текущей панели
						var $currentPanel = $currentSwitcher.closest(config.header).next().children(config.panel);

						// Проверка на наличише активного дата-атрибута
						if ($currentPanel.data('active')) {
							// Закрыть текущую панель
							close($currentPanel, function () {
								isAnimated = false; // Анимация завершина
							});
						} else {
							// Открыть текущую панель

							open($currentPanel, function () {
								isAnimated = false; // Анимация завершина
							});
						}
					});
				},
				init = function () {
					$panelWrap.css({
						position: 'relative',
						overflow: 'hidden'
					});

					$panel
							.css(positionPanelStyle)
							.css(hidePanelStyles);

					var $activePanel = $panel.filter('.' + config.modifiers.activeClass);

					// Определить в переменных все элементы, на которые нужно добавить активный класс
					var $activeItems = $activePanel.parents(config.item), // Все родительские Элементы активной Панели
							$parentPanels = $activePanel.parents(config.panel), // Все родительские Панели
							$allActivePanels = $activePanel.add($parentPanels), // Все активные Панели, включая текущую и родительские
							$activeHeaders = $activePanel.parents($allActivePanels).prev(), // Все Шапки родительских Элементов
							$activeSwitcher = $(config.switcher, $activeHeaders), // Все Шапки родительских Элементов
							$parentPanelsWrap = $activePanel.parents($panelWrap); // Все вспомогательные обертки родительских Панелей

					// Добавить класс на активные элементы
					$allActivePanels
							.add($activeItems)
							.add($activeHeaders)
							.add($activeSwitcher)
							.addClass(config.modifiers.activeClass);

					// Открыть активные панели
					$allActivePanels.css($.extend(destroyPositionPanelStyle, showPanelStyles));

					// На активные панели установить дата-атрибут active сo заначением true
					$allActivePanels.data('active', true).attr('data-active', true);

					// Очистить стили вспомогательных оберток активных Панелей
					$parentPanelsWrap.css({
						position: '',
						overflow: ''
					});

					// Web accessibility
					if (config.accessibility) {
						// Переключатель поставить в фокус-очередь
						tabindexOn($(config.switcher, $element));
						// Все элементы с фокусировкой внутри панелей убрать с фокус-очереди
						tabindexOff($(focusElements, $panel));
						// Все элементы с фокусировкой внутри активных панелей поставить в фокус-очередь
						tabindexOn($(focusElements, $parentPanels));
					}

					$element.addClass(pluginClasses.initClass);
					$element.trigger('msRolls.afterInit');
				};

		self = {
			callbacks: callbacks,
			open: open,
			close: close,
			events: events,
			init: init
		};

		return self;
	};

	$.fn.msRolls = function () {
		var _ = this,
				opt = arguments[0],
				args = Array.prototype.slice.call(arguments, 1),
				l = _.length,
				i,
				ret;
		for (i = 0; i < l; i++) {
			if (typeof opt === 'object' || typeof opt === 'undefined') {
				_[i].msRolls = new MsRolls(_[i], $.extend(true, {}, $.fn.msRolls.defaultOptions, opt));
				_[i].msRolls.callbacks();
				_[i].msRolls.init();
				_[i].msRolls.events();
			} else {
				ret = _[i].msRolls[opt].apply(_[i].msRolls, args);
			}
			if (typeof ret !== 'undefined') {
				return ret;
			}
		}
		return _;
	};

	$.fn.msRolls.defaultOptions = {
		item: '.rolls__item-js', // Общий ближайший родитель (Элемент) для переключателя и разворачивающейся панели (Далее Панель)
		header: '.rolls__header-js', // Обертка для переключателя (Шапка)
		switcher: '.rolls__switcher-js', // Переключатель состояния панели, которая относится к этому переключателю
		panel: '.rolls__panel-js', // Панель
		event: 'click', // Событие, которое разворачивает/сворачивает Панель
		animationSpeed: 300, // Скорость анимации Панели
		collapsed: true, // Параметр, указывающий на необходимось сворачивать ранее открытые Панели
		accessibility: false, // Опримизировать переключение фокуса по табу (снижает скорость выполнения скрипта)
		modifiers: {
			activeClass: 'rolls-active' // Класс, который добавляется, на активный элементы
		}
	};

})(jQuery);

/**
 * Rolls
 */
function rollsInit () {
	var $rolls = $('.rolls-js');

	if ($rolls.length) {
		$rolls.msRolls({
			accessibility: true,
			afterOpen: function () {
				recalcSticky();
			},
			afterClose: function () {
				recalcSticky();
			}
		})
	}

	function recalcSticky() {
		$(".sidebar").trigger("sticky_kit:recalc");
		$(".aside").trigger("sticky_kit:recalc");
	}
}

$(window).load(function () {
	preloadPage();
});

$(document).ready(function(){
	placeholderInit();
	// tabsInit();
	scroll2idInit();
	if(DESKTOP){
		customSelect($('select.cselect'));
	}
	printShow();
	toggleSidebar();
	toggleAside();
	popupInitial();
	menuAccordionInit();
	languageEvents();
	if( $('body').hasClass('home-page') ) {
		commonSliderInit();
		// pagesSwitcher();
		scrollToSection();
	}
	scrollToForm();
	toggleFormSearch();
	contactsMap();
	contactsSwitcher();

	footerBottom();
	stickyLayout();
	equalHeightInit();

	tip();

	if ($('.l-faq').length > 0) {

		var faqHandler = function() {

			var el;

			var options = {
				instant: false,
				defaultSpeed: 0
			}

			$('.faq-q').off('click');

			$('.faq-q').on('click', function(event) {
				event.preventDefault();
				el = $(this);
				el.toggleClass('active').next().slideToggle(options.defaultSpeed);
			});

		};

		faqHandler();
	}

	// var loc = window.location;
	// console.log("loc: ", loc.hash.substring(1));

	graphProgress();
	accordion();
	tabWrapper();
	yearsList();
	tabsCustomInit();
	rollsInit();

	// initFormElements();

	// $('.number input').increments();

	if ($('.js-ins-calc').length > 0) {
		insCalc();
	}

	if ($('#dropzone-previews').length > 0) {
		dropZone();
	}

	/** init radio **/
	var jsRadioSelector = '.js-radio-master';
	var jsRadio = $(jsRadioSelector);

	var setRadioSlaves = function($radio) {
		var id = $radio.attr('id');
		$radio.parents('.b-list-item').siblings('.js-radio-slave').slideUp(200);
		$('.js-radio-slave[data-extra="'+id+'"]').slideDown(200);
		if ($('.cselect').length > 0) {
			selectResize();
		}
	};
	jsRadio.on('change', function(event) {

		// console.log($(this));

		var $radio = $(this);
		setRadioSlaves($radio);
	});
		/** \ init radio end **/


	var jsSelect = $('.js-select-master');
	var setSelectSlaves =  function($select) {
		var $chosen = $select.val();

		$('option', $select).each(function(index, el) {

			var id = '#select-slave-' + this.value;
			var elem = $(id);

			if (elem.length > 0 && $chosen === this.value) {
				// console.log(elem);
				elem.slideDown(200);
				selectResize();
			} else {
				elem.slideUp(200);
			}

		});
	}

	$.each(jsSelect, function(index, val) {
		setSelectSlaves($(val));
	});

	jsSelect.on('change', function(event) {
		event.preventDefault();
		event.stopPropagation();
		var $select = $(this);
		setSelectSlaves($select);
	});
});


function initFormElements(obj) {

	obj = obj || document.body;

	var fp_config = {
		"locale": fpRussian,
		altInput: true,
		altFormat: 'd.m.Y',
		onValueUpdate: function() {
			$('.flatpickr.active').addClass('has-content');
		}
	};

	$(obj).find('.flatpickr').flatpickr(fp_config);

	$.each($('.js-car-instance', obj), function(index, val) {
		carMap(val);
});

	if ($('.js-toggler', obj).length > 0) {
		jsToggler();
	}

	if ($('.js-ins-form', obj).length > 0) {
		insForm();
	}
}





function carMap(elem) {

	var $this = $(elem),
		 link,
		 href,
		 rest,
		 same;

	$('a, .group', $this).on('mouseenter', function () {
		link = $(this);
		href = link.attr('href');
		rest = link.siblings();
		same = $('[href="' + href + '"]');

		same.addClass('active');
		rest.addClass('faded');

	}).on('mouseleave', function() {

		same.removeClass('active');
		rest.removeClass('faded');

	}).on('click', function(event) {

		// console.log(href);
		same.children('input').prop("checked", !same.children('input').prop("checked"));

	});

	// $('.car-img__sticky').stick_in_parent({
	// 	offset_top: 80
	// });
}

var userType;

function jsToggler() {

	setTimeout(function(){
		var elem = $('.js-toggler');

		$.each(elem, function(index, val) {

			var container    = $(val),
				item         = $('label', container);

			var switchItem = function(item) {
				var item_active  = item.children('input:checked').parent(),
					active_pos   = item_active.position().left,
					active_margn = parseInt(item_active.css('margin-left')),
					active_width = parseInt(item_active.width()),
					active_pres  = active_pos + active_margn,
					highlight    = $('.toggler-highlight', container);

				highlight.css({
					'width': active_width,
					'left': active_pres
				});

				item_active.addClass('active').siblings().removeClass('active');
			}

			var valueTabs = function(container) {
				var tab = $('input', container),
					checked = $('input[checked="checked"]', container).attr('value') || $('input[checked]', container).attr('value');

				tab.each(function(index, el) {

					var id = '#' + el.value;
					var elem = $(id);

					if (elem.length > 0 && checked === elem.value) {
						elem.slideDown(200);
						selectResize();
					} else {
						elem.slideUp(200);
					}

				});

				$('#' + checked).fadeIn(500).siblings('.tabber-content').fadeOut(500);

				if ($('.cselect').length > 0) {
					selectResize();
				}

				if ( $('.js-ins-calc').length ){
					$('.js-ins-calc').trigger( "changeTab", [ checked ] );
				}
				// console.log(checked);
			}



			var dataTabs = function(container) {
				var tab = $('input', container),
					checked = $('input[checked="checked"]', container).data('value');

				tab.each(function(index, el) {

					var id = '#' + $(el).data('value');
					var elem = $(id);

					elem.slideUp(200);

				});

				$('#' + checked).fadeIn(500).siblings('.tabber-content').fadeOut(500);

				if ($('.cselect').length > 0) {
					selectResize();
				}

				if ( $('.js-ins-calc').length ){
					$('.js-ins-calc').trigger( "changeTab", [ checked ] );
				}
				// console.log(checked);
			}





			var setUserType = function(container) {
				userType = $('input[checked="checked"]', container).data('type');
				// console.log(userType);
			}

			switchItem(item);

			if (container.hasClass('js-user-type')) {
				setUserType(container);
			}

			if (container.hasClass('js-tabs')) {
				valueTabs(container);
			}

			if (container.hasClass('js-data-tabs')) {
				dataTabs(container);
			}

			item.off("click").on('click', function(event) {

				event.preventDefault();

				if ( !$(this).hasClass('active') ) {

					//console.log( this );


					item.find('input[checked="checked"]').removeAttr('checked');
					$(this).children('input').prop('checked', true);
					$(this).children('input').attr('checked', 'checked');

					switchItem($(this));

					valueTabs(container);

					dataTabs(container);

					if (container.hasClass('js-user-type')) {
						setUserType(container);
					}

					$(this).children('input').change();

				}

			});

		});

	},500);
}


function insForm() {

	var gotoPage = location.search.substring(1).split('goto=')[1];

	if (gotoPage !== undefined) {
		gotoPage = gotoPage[0];
	}

	var form = $('.js-ins-form');

	$('.ins-form').parsley({
		minlength: 2,
		trigger: 'input change',
		errorClass: 'input__error',
		successClass: 'input__success',
		errorsWrapper: '<span class="input__note note__error color--red"></span>',
		errorTemplate: '<span></span>',
		excluded: "input[type=button], input[type=submit], input[type=reset], input[type=hidden], input:hidden, textarea:hidden"
	});

	var $sections = $('.ins-form-step');

	var supportOnInput = 'oninput' in document.createElement('input');

	$(".maxlength[maxlength], textarea[maxlength]").each(function() {
		var $this = $(this);
		var maxLength = parseInt($this.attr('maxlength'));
		var newLength = maxLength;

		var el = $("<div class=\"character-count\"><span>" + maxLength + "</span></div>");
		el.insertAfter($this);

		$this.bind(supportOnInput ? 'input' : 'keyup', function() {
			var cc = $this.val().length;

			newLength = maxLength - cc;

			el.html("<span>" + newLength + "</span>");

			if(maxLength < cc) {
				el.css('color', 'red');
			} else {
				el.css('color', null);
			}
		});
	});

	function navigateTo(index) {
		$sections.removeClass('current').slideUp('200');
		$sections.eq(index).addClass('current').slideDown('200');

		$('.ins-navigation .js-ins-prev').toggle(index > 0);

		var atTheEnd = index >= $sections.length - 1;

		$('.ins-navigation .js-ins-next').toggle(!atTheEnd);

		$('.ins-navigation .js-ins-submit').toggle(atTheEnd);

		if ($('.js-ins-steps').find('.step').eq(index).length > 0) {

			$('.js-ins-steps').css('display', '');

			$('.js-ins-steps').find('.step').removeClass('step--current').eq(index).addClass('step--current');

		} else {

			$('.js-ins-steps').css('display', 'none');

			getPDF($('.js-get-pdf'));

			$('#file__retry').on('click', function(event) {
				event.preventDefault();
				getPDF($('.js-get-pdf'));
			});
		}

		if ($('.form-section.current .has-content').length > 0) {
			$('.form-section.current .has-content').parsley().validate();
		}

		if ($('.js-toggler').length > 0) {
			jsToggler();
		}

		if ($('.cselect').length > 0) {
			selectResize();
		}

		if ($sections.eq(index).find('.type-slave').length > 0) {
			(function getUserType() {
				try {
					userType.length > 0;
				}
				catch(error) {
					setTimeout(getUserType, 100);
					return;
				}
				// console.log('type-slave: ' + userType);

				$('.type-slave').hide();
				$('.type-slave[data-type-slave="'+ userType +'"]').show();
			}());
		}

		$.scrollTo(0, 500, {
			easing: 'swing'
		});

		insFormSubmit(false); // запоминаем поля
	}



	function curIndex() {
		return $sections.index($sections.filter('.current'));
	}

	$('.ins').addClass('ins-init');

	$('.ins-navigation .js-ins-prev').on('click', function(event) {
		event.preventDefault();
		navigateTo(curIndex() - 1);
	});

	$('.ins-navigation .js-ins-next').on('click', function(event) {
		event.preventDefault();

		if ($('.ins-form').parsley().validate({group: 'block-' + curIndex()})) {
			navigateTo(curIndex() + 1);
		} else {
			$.scrollTo($('.note__error.filled'), 500, {
				offset:-160,
				easing: 'swing'
			});
		}


	});

	// СМОТРИ НЕ ЗАТРИ!
	$('.ins-navigation').on('dblclick', function(event) {
		event.preventDefault();
		navigateTo(curIndex() + 1);
	});

	$.each($sections, function(index, section) {
		$(section).find(':input').attr('data-parsley-group', 'block-' + index);
	});

	navigateTo(0);

	if (gotoPage !== undefined) {
		navigateTo(gotoPage);
	}

	$('.ins-navigation').show();

	$('.js-ins-form-submit').on('click', function(event) {
		event.preventDefault();
		insFormSubmit(true);
	});

	if (!$('#ins_result_box').length > 0) {
		$('#ins-result-widget').remove();
	}

};

function insFormSubmit(finish) {
	// console.log('insFormSubmit');
	var form = $('form.ins-form');
	var data = form.serialize();
	var url = $('form.ins-form').attr('action');
	// console.log(data);

	if (finish !== true) {
		$.post(url, data + '&submit=1', function(data, textStatus, xhr) {
			// console.info(textStatus);
			// console.info('Запоминаем денные шага');
		});
	} else {
		$.post(url, data + '&finish=1&submit=1', function(data, textStatus, xhr) {
			// console.log(textStatus);
			// console.log(data);

			var success = $.parseJSON(data).element_id > 0;
			// console.log(success);

			$('.ins-form-step').slideUp(300);
			$('.ins-navigation').slideUp(300);

			if (textStatus === 'success' && success === true) {
				// console.info('Все, это успех!');
				$('.ins-form-success').slideDown(300);

			} else {
				$('.ins-form-error').slideDown(300);
				// console.info('Мы на дне...');
			}
		});
	}


}

function getPDF(link, open) {

	var size  = $('.js-get-pdf-size');
	var form  = $('form.ins-form');
	var data  = form.serialize();
	var url   = $('form.ins-form').attr('action');

	var file  = $('.file')
	var title = $('.file__title span', file);
	var retry = $('.file__retry', file);

	var timer;

	link.addClass('loading');

	$.post(url, data + '&submit=1&pdf_link=1', function(data, textStatus, xhr) {

		// console.log(xhr);
		var $url  = $.parseJSON(data).link;
		var $size = $.parseJSON(data).size;
		link.attr('href', $url);
		size.text($size);

		link.removeClass('loading');

		if (open === true) {
			window.open(url, '_blank');
		}

	});
}

function insCalc() {


	var form = $('.js-ins-calc'),
		type = form.data('type'),
		result_html = $('.js-ins-result');

	var result_box = $('#ins_result_box'),
		result_title = $('.js-result-title', result_box),
		result_price = $('.js-ins-result', result_box),

		result_widget = $('#ins-result-widget'),
		result_title_slave = $('#ins-result-title-slave'),
		result_price_slave = $('#ins-result-price-slave');

	var testPrice;

	var resultWidget = function() {
		if (result_box.length > 0) {

			testPrice = (function(){
				return result_price.html() === '$0' || result_price.html() === '€0';
			}());

			result_title_slave.html(result_title.html());

			// console.log('testPrice', testPrice);

			if (testPrice) {
				result_widget.fadeOut(300);
			} else {
				result_widget.fadeIn(300);
				result_price_slave.html(result_price.html());
			}

		}
	}

	resultWidget();

	var renderPeople = function(num) {
		var container = $('#ins-user-list');
		var card = $('.user-card', container);
		var card_need = num;
		var card_done = $('.user-card', container).length;
		var template_title = $('#ins-user-title');
		var template = $('#ins-user').html();


		var renderInc = function() {

			for (var i = card_done; i < card_need; i++) {

				rendered = Mustache.to_html(template, {person_num: i + 1});


				$(rendered).tmpl().appendTo(container);

				card = $('.user-card', container);

				// console.log(card.eq(i));

				initFormElements(card.eq(i));
			}
			template_title.show();
		};

		var renderDec = function() {
			for (var i = card_done; i >= card_need; i--) {

				card.eq(i).remove();

			}
			template_title.hide();
		}

		if (card_need > card_done) {
			renderInc();
		} else if (card_need < card_done) {
			renderDec();
		}

		includeCheckboxInit();

	}

	if (!result_box.length > 0) {
		// console.error('Блок в результатами рассчета не найден');
		result_widget.remove();
	}

	var insResponsibility = function() {

		var result_12 = $('.js-ins-result-12');
		var result_6  = $('.js-ins-result-6');
		var result_3  = $('.js-ins-result-3');

		var input = form.find('input[data-calc]');
		var sosed = 0;

		//ranges
		var range_usd = $('input[data-usd]');
		var usd = 0;

		var calcResult = function() {
			var result = Math.round(sosed * usd / 100);
			result_html.html('&dollar;' + result);
			resultWidget();

			result_12.html('&dollar;' + result);
			result_6.html('&dollar;' + result/2);
			result_3.html('&dollar;' + result/4);

		}

		var getInputValue = function(input) {
			$.each(input, function(index, val) {

				var input = $(val);
				if (input.is(':checked')) {

					if (input.attr('data-type') == 'sosed') {
						sosed = input.val();
						calcResult();
					}
				}
			});
		}

		getInputValue(input);

		input.on('change', function(event) {
			event.preventDefault();
			getInputValue(input);
		});

		range_usd.ionRangeSlider({
			onStart: function(data) {
				usd = data.from;
				name = range_usd.attr('name')
				range_usd.after ('<input type="hidden" id="range_usd_result" name="'+ name +'" value="'+ usd +'"/>');
				calcResult();
			},
			onChange: function(data) {
				usd = data.from;
				$('#range_usd_result').val(usd);
				calcResult();
			}
		});
	}





	var insProperty = function() {

		var input = form.find('input[data-calc]');

		//ranges
		var range_usd_static = $('.js-ins-range[data-usd-static]').length > 0 ? $('.js-ins-range[data-usd-static]') : $('.js-ins-range[name="usd_static"]');
		var usd_static = 0;
		var p_static = 0;
		var p_min_static = 0;
		var p_max_static = 0;

		var range_usd_move = $('.js-ins-range[data-usd-move]').length > 0 ? $('.js-ins-range[data-usd-move]') : $('.js-ins-range[name="usd_move"]');
		var usd_move = 0;
		var p_move = 0;
		var p_min_move = 0;
		var p_max_move = 0;

		var movable = false;

		var result_12 = $('.js-ins-result-12');
		var result_6  = $('.js-ins-result-6');
		var result_3  = $('.js-ins-result-3');

		// рассчитываем недвижимость
		var calcResult = function() {
			//console.log('calcResult: ' + p_static, usd_static);

			var result = Math.round( ( p_static * usd_static / 100 ) ) + Math.round( ( p_move * usd_move / 100 ) );
			result_html.html('&dollar;' + result);
			resultWidget();

			result_12.html('&dollar;' + result);
			result_6.html('&dollar;' + result/2);
			result_3.html('&dollar;' + result/4);
		}

		var calcUpdateRange = function() {
			range_usd_static.data("ionRangeSlider").update({
				min: p_min_static,
				max: p_max_static,
				from: (p_max_static + p_min_static) / 2
			});

			calcResult();
		}

		var calcUpdateRangeMove = function() {

			range_usd_move.data("ionRangeSlider").update({
				min: p_min_move,
				max: p_max_move,
				from: (p_max_move + p_min_move) / 2
			});

			calcResult();
		}

		var getInputValue = function(input, cur_el) {

			$.each(input, function(index, val) {

				var input = $(val);
				if (input.is(':checked')) {

					if (input.attr('data-type') == 'place' ) {
						p_static = input.data('static');
						p_move = input.data('move');
						p_min_static = input.data('min-static');
						p_max_static = input.data('max-static');
						p_min_move = input.data('min-move');
						p_max_move = input.data('max-move');

						if ( $(cur_el).attr('data-type') != 'move' ) {
							calcUpdateRange();
						}
					}

				}

				if (input.attr('data-type') == 'move') {

					if ( input.is(':checked') ) {
						if ( $(input).data('value') == 'move-no' ){
							p_move = 0;
						}
					}

					calcUpdateRangeMove();
				}

			});
		}

		range_usd_static.ionRangeSlider({
			onStart: function(data) {
				usd_static = data.from;
				calcResult();
				name = range_usd_static.attr('name')
				range_usd_static.after ('<input type="hidden" id="range_usd_static_result" name="'+ name +'" value="'+ usd_static +'"/>');
			},
			onChange: function(data) {
				usd_static = data.from;
				$('#range_usd_static_result').val(usd_static);
				calcResult();
			},
			onUpdate: function(data) {
				usd_static = data.from;
				$('#range_usd_static_result').val(usd_static);
				calcResult();
			}
		});

		range_usd_move.ionRangeSlider({
			onStart: function(data) {
				usd_move = data.from;
				calcResult();
				name = range_usd_move.attr('name')
				range_usd_move.after ('<input type="hidden" id="range_usd_move_result" name="'+ name +'" value="'+ usd_move +'"/>');
			},
			onChange: function(data) {
				usd_move = data.from;
				$('#range_usd_move_result').val(usd_move);
				calcResult();
			},
			onUpdate: function(data) {
				usd_move = data.from;
				$('#range_usd_move_result').val(usd_move);
				calcResult();
			}
		});

		input.on('change', function(event) {
			event.preventDefault();
			getInputValue(input, $(this));
		});

		getInputValue(input);

	}






	var insHealth = function() {

		var input = form.find('input[data-calc]');
		var k_area_static = 0;
		var k_ns_static = 0;

		var adults = 0,
			sum_year = 0,
			sum_half_year = 0,
			ns_checked = '';

		// var range_usd = $('.js-ins-range[name="usd"]');
		var range_usd = $('.js-ins-range[data-usd]').length > 0 ? $('.js-ins-range[data-usd]') : $('.js-ins-range[name="usd"]');
		var usd;

		var result_12 = $('.js-ins-result-12');
		var result_6  = $('.js-ins-result-6');
		var result_3  = $('.js-ins-result-3');

		var calcResult = function() {

			// adults = $('input[name="adults"]', form).val();
			adults = $('input[data-adults]').length > 0 ? $('input[data-adults]') : $('input[name="adults"]');
			people = adults.val();

			var sum_year	= Math.round10( ( ( ( usd * k_ns_static ) * k_area_static ) / 100 ) , 0 ) * people;
			var sum_half_year	= Math.round10( sum_year / 2, 0 );

			/*result_html.html('<p>полгода - &dollar;' + sum_half_year + '</p>' +
							 'год - &dollar;' + sum_year);*/
			result_html.html('&dollar;' + sum_year);
			resultWidget();

			result_12.html('&dollar;' + sum_year);
			result_6.html('&dollar;' + sum_year/2);
			result_3.html('&dollar;' + sum_year/4);

			$('.strah-price', form).html( '&dollar;' + usd );

			if ( ns_checked == 'bradio1' ) {
				$('.invalid_ns', form).hide( );
				$('.death_ns', form).show( );
			}
			else if ( ns_checked == 'bradio2' ) {
				$('.invalid_ns', form).show( );
				$('.death_ns', form).hide( );
			}
			else if ( ns_checked == 'bradio3' ) {
				$('.invalid_ns', form).show( );
				$('.death_ns', form).show( );
			}
			else {
				$('.death_ns', form).hide( );
				$('.invalid_ns', form).hide( );
			}

			renderPeople(people);

		}

		var getInputValue = function(inp) {

			$.each(inp, function(index, val) {

				var input = $(val);
				if (input.is(':checked')) {

					if (input.attr('data-type') == 'area') {
						k_area_static = input.data('static');
					}

					if (input.attr('data-type') == 'ns') {
						k_ns_static = input.data('static');
						ns_checked = input.attr('id');
					}

				}
			});

			calcResult();

		}


		range_usd.ionRangeSlider({
			onStart: function(data) {
				usd = data.from;
				name = range_usd.attr('name')
				range_usd.after ('<input type="hidden" id="range_usd_result" name="'+ name +'" value="'+ usd +'"/>');
				calcResult();
			},
			onChange: function(data) {
				usd = data.from;
				$('#range_usd_result').val(usd);
				calcResult();
			}
		});

		input.on('change', function(event) {
			event.preventDefault();
			getInputValue(input);
		});

		$('.strah-count input', form).increments({
			callbackChange: function( val, inp ){
				calcResult();
			}
		});

		getInputValue(input);

	}



	var insTrip = function() {
		// var multi_sheng_num_days = $('input[name="range_multi_sheng"]', form );
		var multi_sheng_num_days = $('input[data-range_multi_sheng]').length > 0 ? $('input[data-range_multi_sheng]') : $('input[name="range_multi_sheng"]');

		// var range_multi_sheng_years = $('input[name="range_multi_sheng_years"]', form );
		var range_multi_sheng_years = $('input[data-range_multi_sheng_years]').length > 0 ? $('input[data-range_multi_sheng_years]') : $('input[name="range_multi_sheng_years"]');


		// var num_days_input = $( 'input[name="num_days"]', form );
		var num_days_input = $('input[data-num_days]').length > 0 ? $('input[data-num_days]') : $('input[name="num_days"]');

		// var num_days_input_single = $( 'input[name="num_days_single"]', form );
		var num_days_input_single = $('input[data-num_days_single]').length > 0 ? $('input[data-num_days_single]') : $('input[name="num_days_single"]');

		// var num_days_input_multi = $( 'input[name="num_days_multi"]', form );
		var num_days_input_multi = $('input[data-num_days_multi]').length > 0 ? $('input[data-num_days_multi]') : $('input[name="num_days_multi"]');


				// var rangeDate = $( 'input[name="rangeDate"]', form );
				//var rangeDate = $('input[data-rangeDate]').length > 0 ? $('input[data-rangeDate]') : $('input[name="rangeDate"]');
		var rangeDate = $( '#range' );


		// var children = $('input[name="children"]', form);
		var children = $('input[data-children]').length > 0 ? $('input[data-children]') : $('input[name="children"]');

		// var adults = $('input[name="adults"]', form);
		var adults = $('input[data-adults]').length > 0 ? $('input[data-adults]') : $('input[name="adults"]');

		// var aged = $('input[name="aged"]', form);
		var aged = $('input[data-aged]').length > 0 ? $('input[data-aged]') : $('input[name="aged"]');

		// var over_aged = $('input[name="over_aged"]', form);
		var over_aged = $('input[data-over_aged]').length > 0 ? $('input[data-over_aged]') : $('input[name="over_aged"]');



		var input = form.find('input[data-calc]');
		var k_varianttarif_static = 0;
		var k_tarif_static = 0;
		var num_days = 0;
		var strah_tariff = 0;

		var children_num = 0,
			adults_num = 0,
			aged_num = 0,
			over_aged_num = 0,
			is_shengen = 0;

		var k8 = 0.9,
			k14 = 0.9;
		var overall_num = 0;

		// var range_usd = $('input[data-usd]');
		var range_usd = $('input[name="valute"]').length > 0 ? $('input[name="valute"]') : $('input[data-valute]');
		var usd;
		var userValute = '&dollar;';
		var tariffArray;

		var country_k = 1;
		var country_K4 = new Array('WORLD_woASIA','US','CA','JP','IL','AE');
		var country_K8 = new Array('WORLD','AF','BD','BT','IN','NP','MV','PK','LK','VN','KH','LA','MM','TH','MY','BN','TL','ID','SG','PH');

		var country_SHENGEN = new Array('ALL', 'AT', 'BE', 'HU', 'DE', 'GR', 'DK', 'IS', 'ES', 'IT', 'LV', 'LT', 'LI', 'LU', 'MT', 'NL', 'NO', 'PL', 'PT', 'SK', 'SI', 'FI', 'FR', 'CZ', 'CH', 'SE', 'EE');


		Papa.parse( _download_path + 'trip_strah.csv', {
			download: true,
			complete: function(results) {
				tariffArray = results.data;
			}
		});


		var calcResult = function() {

			children_num	= children.val();
			adults_num		= adults.val();
			aged_num		= aged.val();
			over_aged_num	= over_aged.val();

			children_k		= children.data('static');
			adults_k		= adults.data('static');
			aged_k			= aged.data('static');
			over_aged_k		= over_aged.data('static');

			overall_num = parseInt(children_num) + parseInt(adults_num) + parseInt(aged_num) + parseInt(over_aged_num);

			num_days = num_days_input.val();

			if ( num_days > 0 ) {

				switch (usd) {
					case 30000:
					summ_range = 1;
					break
					case 50000:
					summ_range = 2;
					break
					case 70000:
					summ_range = 3;
					break
					case 90000:
					summ_range = 4;
					break
					default:
					summ_range = 1;
				}

				strah_tariff = tariffArray[ num_days ][summ_range];

			}


			var sum = ( children_num * Math.round10( (  strah_tariff * children_k ) * country_k * k_varianttarif_static * k_tarif_static * k8 * k14, 0 ) +
						adults_num * Math.round10( (  strah_tariff * adults_k ) * country_k * k_varianttarif_static * k_tarif_static * k8 * k14, 0 )  +
						aged_num * Math.round10( (  strah_tariff * aged_k ) * country_k * k_varianttarif_static * k_tarif_static * k8 * k14, 0 )  +
						over_aged_num * Math.round10( (  strah_tariff * over_aged_k ) * country_k * k_varianttarif_static * k_tarif_static * k8 * k14, 0 ) );

			/*console.log ( ( ( children_num * strah_tariff * children_k ) +
						( adults_num * strah_tariff * adults_k )  +
						( aged_num * strah_tariff * aged_k )  +
						( over_aged_num * strah_tariff * over_aged_k ) ), country_k, k_varianttarif_static, k_tarif_static );*/

			/*result_html.html('<p>полгода - &dollar;' + sum_half_year + '</p>' +
							 'год - &dollar;' + sum_year);*/
			result_html.html(userValute + sum );
			resultWidget();

			renderPeople(overall_num);

		}

		var getInputValue = function(inp) {

			$.each(inp, function(index, val) {

				var input = $(val);
				if (input.is(':checked')) {

					if (input.attr('data-type') == 'varianttarif') {
						k_varianttarif_static = input.data('static');
					}

					if (input.attr('data-type') == 'tarif') {
						k_tarif_static = input.data('static');
					}

				}
			});

			calcResult();

		}


		$(".flatpickr_single", form).flatpickr({
			"locale":fpRussian,
			mode: "range",
			minDate: "today",
			altInput: true,
			dateFormat: 'd-m-Y',
			altFormat: 'j M Y',
			onValueUpdate: function( ) {
				$('.flatpickr_single.active').addClass('has-content');
			},
			onClose: function( selectedDates, dateStr, instance ) {

				if ( selectedDates.length == 2 ) {
					var daysInRange = Math.round((selectedDates[1] - selectedDates[0])/(1000*60*60*24)) + 1;
				}

				$( '#daysInRange' ).text( daysInRange );
				num_days_input_single.val( daysInRange );
				num_days_input.val( daysInRange );

				updateSingleShengenDateRange(  );

			}
		});

		$(".flatpickr_multi", form).flatpickr({
			"locale": fpRussian,
			minDate: "today",
			altInput: true,
			dateFormat: 'd-m-Y',
			altFormat: 'j M Y',
			onValueUpdate: function( ) {
				$('.flatpickr_multi.active').addClass('has-content');
			},
			onClose: function( selectedDates, dateStr, instance ) {

				updateMutiShengenDateRange( selectedDates[0], num_days_input_multi.val() );

			}
		});

		range_usd.ionRangeSlider({
			onStart: function(data) {
				usd = data.from_value;
				name = range_usd.attr('name')
				range_usd.after ('<input type="hidden" id="range_usd_result" name="'+ name +'" value="'+ usd +'"/>');
				calcResult();
			},
			onChange: function(data) {
				usd = data.from_value;
				$('#range_usd_result').val(usd);
				calcResult();
			}
		});

		input.on('change', function(event) {
			event.preventDefault();
			getInputValue(input);
		});


		multi_sheng_num_days.increments({
			callbackChange: function( val, inp ){
				num_days_input_multi.val( val );
				num_days_input.val( val );

				updateMutiShengenDateRange( );

			}
		});

		range_multi_sheng_years.increments({
			callbackChange: function( val, inp ){
				//num_days_input_multi.val( val );
				//num_days_input.val( val );

				updateMutiShengenDateRange( );

			}
		});


		$('.strah-count input', form).increments({
			callbackChange: function( val, inp ){
				calcResult();
			}
		});


		form.on("changeTab", function ( event, elem ){

			if ( elem == 'days_multi' )	{
				num_days_input.val( $('input[name="num_'+elem+'"]').val() );
				updateMutiShengenDateRange();
			}
			else if ( elem == 'days_single' ) {
				num_days_input.val( $('input[name="num_'+elem+'"]').val() );
				updateSingleShengenDateRange();
			}
			else if ( elem == 'USD' || elem == 'EUR' ) {
				if ( elem == 'USD' ) {
					elem = 'dollar';
				}
				else if ( elem == 'EUR' ) {
					elem = 'euro';
				}
				userValute = '&' + elem + ';';
				calcResult();
			}


		});


		var multipleCountry = new Choices(document.getElementById('country'), {
			shouldSort: false,
			removeItemButton: true,
			loadingText: 'Загрузка...',
			noResultsText: 'Страна не найдена',
			noChoicesText: '',
			itemSelectText: 'Нажмите для выбора',
		});

		multipleCountry.passedElement.addEventListener('change', function(val) {

			country_k = 1;

			valueArray = multipleCountry.getValue(true);

			$.each( valueArray, function( key, value ) {

				if ( country_SHENGEN.indexOf( value ) >= 0 ) {
					is_shengen = 1;
				}
				else {
					is_shengen = 0;
				}

				if ( country_K8.indexOf( value ) >= 0 ) {
					country_k = ( country_k < 8 ) ? 8 : country_k;
				}
				else if ( country_K4.indexOf( value ) >= 0 ) {
					country_k = ( country_k > 4 ) ? country_k : 4;
				}
				else {
					country_k = ( country_k > 1 ) ? country_k : 1;
				}
			});

			updateSingleShengenDateRange();
			calcResult();

		}, false);


		function updateMutiShengenDateRange (  ) {

			num_days = num_days_input.val();
			num_years = range_multi_sheng_years.val();

			multiDatesArray = $(".flatpickr_multi", form).val().split('-');
			var selectedDates = new Date( multiDatesArray[2], multiDatesArray[1] - 1, multiDatesArray[0] );

			if ( Object.prototype.toString.call(selectedDates) === "[object Date]" && !isNaN( selectedDates.getTime() ) ) {
				//rangeDate.val( formatDate( selectedDates ) + ' — ' + formatDate ( selectedDates.addDays( parseInt( num_days ) ) ) );

				rangeDate.val( formatDate( selectedDates ) + ' — ' + formatDate ( selectedDates.addDays( parseInt( num_years*365 ) ) ) );

				$('#rangeBlock').show();
				$('#rangeVisible').text( rangeDate.val() );

			}
			else {
				rangeDate.val( '' );

				$('#rangeBlock').hide();
				$('#rangeVisible').text( rangeDate.val() );
			}

			calcResult();

		}

		function updateSingleShengenDateRange ( ) {

			singleDatesRange = $(".flatpickr_single", form).val().split(' — ');

			if ( singleDatesRange.length == 2 ){

				singleDatesStartArray = singleDatesRange[0].split('-');
				singleDatesEndArray = singleDatesRange[1].split('-');

				var dateStart = new Date( singleDatesStartArray[2], singleDatesStartArray[1] - 1, singleDatesStartArray[0] );
				var dateEnd = new Date( singleDatesEndArray[2], singleDatesEndArray[1] - 1, singleDatesEndArray[0] );

				if ( is_shengen > 0 ) {
					num_days = 15;
				}
				else {
					num_days = 0;
				}

				if ( ( Object.prototype.toString.call(dateStart) === "[object Date]" ) && !isNaN( dateStart.getTime() )
					&& ( Object.prototype.toString.call(dateEnd) === "[object Date]" ) && !isNaN( dateEnd.getTime() ) ) {
					rangeDate.val( formatDate( dateStart ) + ' — ' + formatDate ( dateEnd.addDays( parseInt( num_days ) ) ) );

					$('#rangeBlock').show();
					$('#rangeVisible').text( rangeDate.val() );
				}

			}
			else {
				rangeDate.val( '' );

				$('#rangeBlock').hide();
				$('#rangeVisible').text( rangeDate.val() );
			}

			calcResult();

		}

		Date.prototype.addDays = function(days) {
			var dat = new Date(this.valueOf());
			dat.setDate(dat.getDate() + days);
			return dat;
		};

		function formatDate(date) {
			var monthNames = [
			"Янв", "Фев", "Март",
			"Апр", "Май", "Июнь", "Июль",
			"Авг", "Сен", "Окт",
			"Ноя", "Дек"
			];

			var day = date.getDate();
			var monthIndex = date.getMonth();
			var year = date.getFullYear();

			return day + ' ' + monthNames[monthIndex] + ' ' + year;
		}



		getInputValue(input);

	};


	var insKasko = function() {

		var input = form.find('input[data-calc]');

		var car_yearInp = $('input[data-caryear]', form);
		var car_priceInp = $('input[data-carprice]', form);
		var k_terr = 1;
		var k_driver = "list";
		var k5 = 1;
		var min_strah_sum = 0;

		var car_year = 0,
			car_price = 0,
			ns_checked = '';

		var kTerrObj = {kasko_by:"0.95", kasko_world:"1"};
		var kDriverObj = {singledrive:"list", multidrive:"multi"};

/*
	Object { id: "1", program: "«Полное каско» без франшиз", rate: "3.9195" }
	Object { id: "2", program: "«КАСКО-Автопрофи с франшизой 200$ с…", rate: "3.5276" }
	Object { id: "3", program: "«КАСКО-Автопрофи с франшизой 200$ с…", rate: "3.1356" }
	Object { id: "4", program: "«КАСКО-Платинум» без франшиз", rate: "4.5728" }
	Object { id: "5", program: "«КАСКО-Оптимальное» без франшиз", rate: "1.8093" }
	Object { id: "16", program: "«КАСКО-Прагматик» без франшиз", rate: "0.9102" }
*/

		var minStrahSumNew = { 1:400, 2:300, 3:250, 4:1000, 5:150, 16:100 };
		var minStrahSumOld = { 1:250, 2:200, 3:260, 4:1000, 5:100, 16:100 };


		var calcResult = function() {

			var sumArray = [];

			car_year = car_yearInp.val();
			car_price = car_priceInp.val();

			if ( car_year < (new Date()).getFullYear() && car_year > 0 ) {
				years = (new Date()).getFullYear() - car_year;
			}
			else {
				years = 0;
			}

			if ( years <= 6 ) {
				k5 = 0.85;
			}


			$.ajax({
				method: "POST",
				url: "/local/rates/getRate.php",
				data: { face: k_driver, sum: car_price, years: years }
			})
				.done(function( msg ) {

					$('.table_auto tbody').html('');

					$('.div_auto').html('empty');

					var strahObj = jQuery.parseJSON( msg );

					var div_auto = $('#div_auto').html();

					var rendered;

					var final_price = $('<input id="final_price" type="hidden" value="">');

					for(var key in strahObj) {

						if ( years <= 8 ) {
							min_strah_sum = minStrahSumNew[ strahObj[key].id ];
						}
						else if ( years > 8 ) {
							min_strah_sum = minStrahSumOld[ strahObj[key].id ];
						}

						rate = strahObj[key].rate;

						if ( strahObj[key].id == 16 ) {
							k5 = 1;
						}

						var sum = Math.round10( ( ( car_price * ( rate / 100 ) ).toFixed(2) * k_terr * k5 ), 0 );

						if ( strahObj[key].id == 4 ) {
							sum = sum + 149;
						}

						if ( sum < min_strah_sum ) {
							sum = min_strah_sum;
						}

						sumArray.push( sum );

						Mustache.parse(div_auto);

						if (!rendered) {
							rendered =  Mustache.render(div_auto, {program: strahObj[key].program, sum: sum, readmore: strahObj[key].readmore});
						} else {
							rendered = rendered + Mustache.render(div_auto, {program: strahObj[key].program, sum: sum, readmore: strahObj[key].readmore});
						}

					}

					$('#div_auto_target').html(rendered);
					final_price.appendTo('#div_auto_target');

					$('#div_auto_target input').off().on('change', function(event) {
						$('#ins-result-price-slave').html('&dollar;' + $(this).data('sum'));
					});

					result_price_slave.html( '&dollar;' + Math.min.apply(null, sumArray) + '- &dollar;' + Math.max.apply(null, sumArray) );

				});


			var sum_year	= Math.round10( ( ( ( car_price * k_terr )  ) / 100 ) , 0 );
			var sum_half_year	= Math.round10( sum_year / 2, 0 );

			result_html.html('&dollar;' + sum_year);

			$('.strah-price', form).html( '&dollar;' + sum_year );


		}

		var getInputValue = function(inp) {

			$.each(inp, function(index, val) {

				var input = $(val);

				if (input.is(':checked')) {

					if (input.attr('data-type') == 'terr') {
						k_terr = kTerrObj[input.val()];
					}

					if (input.attr('data-type') == 'driver') {
						k_driver = kDriverObj[ input.val() ];
						ns_checked = input.val();

						var checkbox = $('#include-me');
						var checkbox_box = checkbox.parent();

						if (ns_checked === 'multidrive') {
							$('.user-card[data-cardnum]').hide();
							checkbox_box.hide();
						} else {
							checkbox_box.show();
							if (!checkbox.is(':checked')) {
								$('.user-card[data-cardnum]').show();
							} else {
								$('.user-card[data-cardnum="2"]').show();
								$('.user-card[data-cardnum="3"]').show();
							}
						}
					}

				}
			});

			calcResult();

		}

		input.on('change', function(event) {
			event.preventDefault();
			getInputValue(input);
			// console.log('change');
		});

		renderPeople(3);

		getInputValue(input);

	}


	$('.js-content-hidden').hide(0);

	$('.js-content-show').on('click', function(event) {
		event.preventDefault();
		var el = $(this);
		var href = el.attr('href');
		$(href).slideDown(300, function(){
			$.scrollTo($(href), 500, {
				offset:-130,
				easing: 'swing'
			});
		});
		el.slideUp(300);
	});

	$('.ins').addClass('ins-init');

	var $insForm = $('.js-ins-calc');

	var $form = $('.js-ins-form-submit').closest('form');
	$('.js-ins-form-submit').on('click', function(event) {
				var $price = $('#ins-result-price-slave');
				$form.find('input[data-price]').val($price.text());
				// event.preventDefault();
				// validate here?
	});

	// console.log(type);

	switch (type) {
		case 'responsibility':
			insResponsibility();
			break;

		case 'property':
			insProperty();
			break;

		case 'health':
			insHealth();
			break;

		case 'trip':
			insTrip();
			break;

		case 'kasko':
			insKasko();
			break;

		default:
		// console.info('ins form not found');
	}


}



var myDropzone;

function dropZone() {
	Dropzone.autoDiscover = false;
	myDropzone = new Dropzone("div#dropzone-previews", {
		url: "?load_file",
		dictDefaultMessage: '<svg enable-background="new 0 0 24 24" height="24px" version="1.1" viewBox="0 0 24 24" width="24px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g><path d="M21,0H8L0,8v15c0,0.6,0.4,1,1,1h20c0.6,0,1-0.4,1-1V1C22,0.4,21.6,0,21,0z M8,2.5V8H2.5L8,2.5z M20,22H2V9h6   c0.6,0,1-0.4,1-1V2h11V22z"/><polygon points="6,15 10,15 10,19 12,19 12,15 16,15 16,13 12,13 12,9 10,9 10,13 6,13  "/></g></svg><span>Добавьте файлы или перетащите их мышкой прямо сюда</span>',
		addRemoveLinks: 'dictCancelUpload',
		dictResponseError: 'Ошибка загрузки №{{statusCode}}',
		dictRemoveFile: 'Удалить файл',
		paramName: 'file'
	});

	myDropzone.on("removedfile", function(file) {
		$.ajax({
			type: 'POST',
			url: '?remove_file=' + file['file_id']
		});
		return true;
	});

	myDropzone.on("complete", function(file) {
		if(!file['file_id'] && "undefined" != typeof file['xhr']['response'])
			file['file_id'] = file['xhr']['response'];
		return true;
	});

	if(typeof myDropzoneThumbnails != 'undefined'){
		$(myDropzoneThumbnails).each(function (i, item) {
			myDropzone.emit("addedfile", item['params']);
			myDropzone.createThumbnailFromUrl(item['params'], item['url']);
			myDropzone.emit("complete", item['params']);
		});
	}
}

(function() {
	/**
	 * Корректировка округления десятичных дробей.
	 *
	 * @param {String}  type  Тип корректировки.
	 * @param {Number}  value Число.
	 * @param {Integer} exp   Показатель степени (десятичный логарифм основания корректировки).
	 * @returns {Number} Скорректированное значение.
	 */
	function decimalAdjust(type, value, exp) {
	// Если степень не определена, либо равна нулю...
	if (typeof exp === 'undefined' || +exp === 0) {
		return Math[type](value);
	}
	value = +value;
	exp = +exp;
	// Если значение не является числом, либо степень не является целым числом...
	if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
		return NaN;
	}
	// Сдвиг разрядов
	value = value.toString().split('e');
	value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
	// Обратный сдвиг
	value = value.toString().split('e');
	return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
	}

	// Десятичное округление к ближайшему
	if (!Math.round10) {
	Math.round10 = function(value, exp) {
		return decimalAdjust('round', value, exp);
	};
	}
	// Десятичное округление вниз
	if (!Math.floor10) {
	Math.floor10 = function(value, exp) {
		return decimalAdjust('floor', value, exp);
	};
	}
	// Десятичное округление вверх
	if (!Math.ceil10) {
	Math.ceil10 = function(value, exp) {
		return decimalAdjust('ceil', value, exp);
	};
	}
})();

$(function() {
	var checkbox = $('#checkbox-agree');
	var button = $('.js-ins-form-submit');

	checkbox.on('click', function() {
		if ($('#checkbox-agree').is(':checked')) {
			button.prop('disabled', false);
		}
		else {
			button.prop('disabled', true);
		};
	});
});

function includeCheckboxInit() {
	var checkbox = $('#include-me');
	var relative = $('#ins-user-list .user-card').eq(0);

	function check() {
		if ($('#include-me').is(':checked')) {
			relative.slideUp(200);
		} else {
			relative.slideDown(200);
		};
	}

	check();

	checkbox.on('click', function() {
		check();
	});
};
