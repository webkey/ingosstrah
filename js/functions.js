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
			console.log('style reset');
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

	// close sidebar on click common slider (index.html)
	function closeMenuOnClickSlide() {

		$('.js-common-slider-nav').on('click', 'a[data-slide]', function () {

			$container.trigger('closeMenu');

		})

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

			if (!currentAccordionItem.has(collapsibleElement).length){
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
				swipe: false,
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
 * map init
 * */
// var styleMap = [{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#d3d3d3"}]},{"featureType":"transit","stylers":[{"color":"#808080"},{"visibility":"off"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"visibility":"on"},{"color":"#b3b3b3"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#ffffff"},{"weight":1.8}]},{"featureType":"road.local","elementType":"geometry.stroke","stylers":[{"color":"#d7d7d7"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#ebebeb"}]},{"featureType":"administrative","elementType":"geometry","stylers":[{"color":"#a7a7a7"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#efefef"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#696969"}]},{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"visibility":"on"},{"color":"#737373"}]},{"featureType":"poi","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#d6d6d6"}]},{"featureType":"road","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"color":"#dadada"}]}];

var pinMap = {
	path: "M572.8,182.1c-15.2-35.3-36.6-67.1-63.6-94.7c-27.7-27.7-59.5-49.1-94.7-63.6C377.8,8.5,338.4,0.2,298.3,0.2 s-79.5,7.6-116.2,23.5C146.9,39,115.1,60.4,87.4,87.4c-27.7,27.7-49.1,59.5-63.6,94.7C8.6,218.7,0.3,258.1,0.3,298.2 C0.3,366,48,474.5,142.1,621.8c69.1,107.9,139,197.7,139.7,199.1l15.9,20.7l15.9-20.7c0.7-0.7,70.5-91.3,139.7-199.1 c94-147.3,141.7-255.8,141.7-323.6C595.6,257.4,588,218.7,572.8,182.1z M298.3,399.9c-63.6,0-115.5-51.9-115.5-115.5 s51.9-115.5,115.5-115.5s115.5,51.9,115.5,115.5C413.8,348.7,361.9,399.9,298.3,399.9z",
	fillColor: '#124989',
	fillOpacity: 1,
	strokeWeight: 0
};

var localObjects = [
	[
		{lat: 53.8970355, lng: 27.5413969}, //coordinates of marker
		{latBias: 0.002, lngBias: 0}, //bias coordinates for center map
		pinMap,
		13,
		{
			title: 'Центральный офис',
			address: '<b>Адрес:</b> <div>Республика Беларусь, 220050<br> г. Минск, ул. Мясникова, 40</div>',
			phone: '<b>Тел.:</b> <div><a href="tel:+375172035878">+375 17 203-58-78</a></div>',
			works: '<b>E-mail:</b> <div><a href="mailto:office@belingo.by">office@belingo.by</a></div>'
		}
	],[
		{lat: 52.0888713, lng: 23.7029225}, //coordinates of marker
		{latBias: 0.002, lngBias: 0}, //bias coordinates for center map
		pinMap,
		13,
		{
			title: 'Брест - Центр страховых услуг ЗСАО "Ингосстрах"',
			address: '<b>Адрес:</b> <div>224013 г. Брест,<br> бульвар Космонавтов, 120</div>',
			phone: '<b>Тел.:</b> <div><a href="tel:+375162220222">+375 16 222-02-22</a></div>',
			works: '<b>E-mail:</b> <div><a href="mailto:brest@belingo.by">brest@belingo.by</a></div>'
		}
	],[
		{lat: 55.1798387, lng: 30.2022314}, //coordinates of marker
		{latBias: 0.002, lngBias: 0}, //bias coordinates for center map
		pinMap,
		13,
		{
			title: 'Витебск - Центр страховых услуг ЗСАО "Ингосстрах"',
			address: '<b>Адрес:</b> <div>210015 г. Витебск,<br> пр. Черняховского, 8а,<br> комната 103</div>',
			phone: '<b>Тел.:</b> <div><a href="tel:+375447877164">+375 44 787-71-64</a></div>',
			works: '<b>E-mail:</b> <div><a href="mailto:vitebsk@belingo.by">vitebsk@belingo.by</a></div>'
		}
	],[
		{lat: 53.6819085, lng: 23.8290566}, //coordinates of marker
		{latBias: 0.002, lngBias: 0}, //bias coordinates for center map
		pinMap,
		13,
		{
			title: 'Гродно - Центр страховых услуг ЗСАО "Ингосстрах"',
			address: '<b>Адрес:</b> <div>230023 г. Гродно,<br> ул. Малая Троицкая, 21</div>',
			phone: '<b>Тел.:</b> <div><a href="tel:+375152771909">+375 15 277-19-09</a></div>',
			works: '<b>E-mail:</b> <div><a href="mailto:grodno@belingo.by">grodno@belingo.by</a></div>'
		}
	],[
		{lat: 53.8952585, lng: 30.3333077}, //coordinates of marker
		{latBias: 0.002, lngBias: 0}, //bias coordinates for center map
		pinMap,
		13,
		{
			title: 'Могилев - Центр страховых услуг ЗСАО "Ингосстрах"',
			address: '<b>Адрес:</b> <div>212030 г. Могилев,<br> ул. Ленинская, 9</div>',
			phone: '<b>Тел.:</b> <div><a href="tel:+375222222200">+375 22 222-22-00</a></div>',
			works: '<b>E-mail:</b> <div><a href="mailto:mogilev@belingo.by">mogilev@belingo.by</a></div>'
		}
	]
];

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

		$(this)
			.toggleClass('active', !mapIsExpand)
			.parent()
			.toggleClass('active', !mapIsExpand);

		mapIsExpand = !mapIsExpand;

		e.preventDefault();

		setTimeout(function () {
			deleteMarkers();
			moveToLocation( indexAnchor, map0 );
			addMarker(indexAnchor, map0);
		}, 2000)
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
				$('html,body').stop().animate({scrollTop: $(this).parent().offset().top - $('.header').outerHeight()}, 300);
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
	popupInitial();
	menuAccordionInit();
	languageEvents();
	if( $('body').hasClass('home-page') ) {
		commonSliderInit();
		// pagesSwitcher();
		scrollToSection();
	}
	showFormSearch();
	contactsMap();
	contactsSwitcher();

	footerBottom();
	stickyLayout();
	equalHeightInit();

	// var loc = window.location;
	// console.log("loc: ", loc.hash.substring(1));
});