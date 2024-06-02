(function(){
	
	'use strict';

	/*------------------------------------------
	GLOBAL VARIABLES
	------------------------------------------*/

	/* Window Object and variables */
	var $window = $(window),
		$document = $(document),
		_windowH = $window.height(),
		_windowW = $window.width(),
		_windowST = $window.scrollTop();

	/* Global objects */
	var $html = $('html'),
		$body = $('body');

	/* Update global variables when window is resized */
	$window.on('load resize', function() {
		_windowH = $window.height();
		_windowW = $window.width();
		_windowST = $window.scrollTop();

		if (_windowW >= 991) {
			megaMenu();
		};
		submenus(); // Initial Submenus
	});

	/* Update scrollTop on window scroll */
	$window.on('scroll', function() {
		_windowST = $window.scrollTop();		
	});

	/* Initial functions when window is resized */
	$window.on('load', function() {
		megaMenu(); // Initial Megamenu
		initHeaderAnimations(); // Enabling header animations;
		portfolio(); // initialize Portfolio With Filter
		setTimeout(function(){
			$('.preloader').fadeOut(300);
		}, 300);
	});


	/*------------------------------------------
	Calling Functions
	------------------------------------------*/

	enableFullHeight(); // Full Height Sections

	initFullpage(); // Enable Fullpage Scroll

	initHeaderAnimations(); // Enabling header animations;

	enableFilterables(); // Enable Filterable Masonries

	mobileNav(); // Enable Mobile Navs

	sideheader(); // Enable Sideheader

	stickyMenu(); // Enable Sticlky Menu

	headerModules(); // Initial Header Modules

	onpageNav(); // Enable One Page Nav

	enableMediaElements(); // Enable Media Elements

	offcanvasNav(); // Enable Offcanvas Nav

	portfolioTab(); // Enable Portfolio Fullwidth

	twitterFeed(); // Enable Twitter Feed

	instafeed(); // Enable Instagram Feed

	portfolioImageMove(); // Enable Portfolio Image Movement Effect

	portfolio(); // initialize Portfolio With Filter

	blogNewPost(); // Blog New Post Widget Background

	enableParallax(); // Enable Scroll Parallax

	blogClassic(); // Enable Blog Classic

	blogMasonry(); // Enable Blog Masonry

	moveDown(); // Enable Move Down Button

	linkSmoothScroll(); // Smooth Scroll

	testimonialSlider(); // Initial Testimonials Slider

	itemSlider(); // Enable Store Item Slider

	fsNumber(); // Enable FS Number

	imageSlider(); // Enable Image Slider

	activePanr(); // Activate Panr

	initCountTo(); // Initial Counter Boxes

	teamMember3D(); // Enable Team Member 3D Effect

	initTabs(); // Initialize Tabs

	initParallaxCover(); // Initial Parallax Cover

	initialParticles(); // Initial Particles

	contactForm(); // Contact Form

	enableAjaxLoadMore(); // Enable AJAX Load More



	/*------------------------------------------
	Defining Functions
	------------------------------------------*/

	/**
	 *	Full Height Sections (.full-height)
	 */

	// Enables Full Width Sections
	function enableFullHeight(){
		if (_windowW >= 768 ) {
			initFullHeight();
		} else {
			$('.full-height').css('height', '');
		};
		$window.on('load resize', function(){
			if (_windowW >= 768 ) {
				initFullHeight();
			} else {
				$('.full-height').css('height', '');
			};
		});
	}
	
	// Initializes Fullwidth Sections
	function initFullHeight(){
		var mainHeader = $('#main-header'),
			pageHeadingOffset;
		if (mainHeader.length) {
			if (mainHeader.css('position') != 'absolute') {
				pageHeadingOffset = mainHeader.outerHeight();
			} else {
				pageHeadingOffset = 0;
			};
		};
		$('.full-height').each(function(){
            var element = $(this),
            	elementPT = parseInt(element.css('padding-top'), 10),
            	elementPB = parseInt(element.css('padding-bottom'), 10),
            	elementPaddings = elementPT + elementPB,
            	offsetElement = element.attr('data-offset-element');

            if (typeof offsetElement !== typeof undefined && offsetElement !== false) {
            	element.css('height', '');
            	element.height(_windowH - $(offsetElement).outerHeight() - elementPaddings);
            	return;
            } else {
            	element.css('height', '');
            	element.height(_windowH - elementPaddings);
            };
    	});
	};

	function initFullpage() {
		// $window.on('load resize', function() {
		// 	if (_windowW <= 991) {
		// 		$.fn.fullpage.destroy('all');
		// 	} else {
		// 		fullPageScroll();
		// 		$.fn.fullpage.destroy('all');
		// 		$.fn.fullpage.reBuild();
		// 	}
		// });
		if(! /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
			fullPageScroll();			
		};
	};

	function fullPageScroll() {
		var fullpage = $('body.fullpage-scroll'),
			wrapper = $('#wrapper');

		if (fullpage.length) {

			wrapper.imagesLoaded(function() {
				wrapper.children('section, #main-header, #main-footer').addClass('section');
				wrapper.fullpage({
					paddingBottom: ' ',
					paddingTop: ' ',
					scrollOverflow: true,
					autoScroll: true,
					navigation: true,
					resize: true,
					scrollBar: false,
					navigationPosition: 'left',
					afterLoad : function(anchorLink, index){
					    var loadedSection = $(this),
					        nav = $('#fp-nav'),
				        	animatedTextBlock = loadedSection.find('.animate-onscroll').children('*');
			        		function markAnimated() {
			        			animatedTextBlock.addClass('animated');
			        		};

			        	if (animatedTextBlock.length) {
			        		TweenMax.staggerFromTo(animatedTextBlock.not('.animated'), 0.7, {ease: Power0.easeNone, y: 30, opacity: 0}, {ease: Sine.easeInOut, y: 0, opacity: 1}, 0.2, markAnimated());
			        	};
					    if (loadedSection.hasClass('light-section')) {
					        nav.addClass('light').removeClass('dark');
					    } else if (loadedSection.hasClass('dark-section')) {
					        nav.addClass('dark').removeClass('light');
					    };
					    $('.to-next-section').on('click', function(event) {
					    	event.preventDefault();
					    	$.fn.fullpage.moveSectionDown();
					    });
					    $('.to-prev-section').on('click', function(event) {
					    	event.preventDefault();
					    	$.fn.fullpage.moveSectionUp();
					    });
					    nav.find('.active').parent('li').prevAll('li').each(function(index) {
					        $(this).find('span').addClass('animated').css({
					            '-webkit-animation-delay': (index / 5) + 's',
					            'animation-delay': (index / 5) + 's'
					        });
					    });
					    nav.find('.active').parent('li').nextAll('li').each(function(index) {
					        $(this).find('span').addClass('animated').css({
					            '-webkit-animation-delay': (index / 5) + 's',
					            'animation-delay': (index / 5) + 's'
					        });
					    });
						$.fn.fullpage.setAllowScrolling(true);
					},
					onLeave: function(index, nextIndex, direction){
						$('#fp-nav').find('span').removeClass('animated');
			        }
				});
			});
		};
	}

	/* Enabling Header Aanimations */
	function enableHeaderAnimations() {

		if ($('.viewport').length) {

			var viewport = $('.viewport'),
				viewportW = viewport.width(),
				leftSec = viewport.find('.left-sec'),
				rightSec = viewport.find('.right-sec'),
				leftSecFigure = leftSec.find('figure'),
				rightSecFigure = rightSec.find('figure'),
				leftSecImg = leftSecFigure.find('img'),
				rightSecImg = rightSecFigure.find('img'),
				leftText = leftSec.find('.texts'),
				rightText = rightSec.find('.texts'),
				leftSecImgW = leftSecImg.width(),
				leftSecImgH = leftSecImg.height();

			if (_windowW >= 992) {

				viewport.height(_windowH);

				leftSec.css({
					clip: 'rect(0px,' + (_windowW / 2) + 'px,' + _windowH + 'px,' +  '0px)'
				});
				rightSec.css({
					clip: 'rect(0px,' + _windowW + 30 + 'px,' + _windowH + 'px,' +  (_windowW / 2) + 'px)'
				});
				leftText.css({
					top: (_windowH / 2) - (leftText.height() / 2),
					left: $(document).find('.container').first().offset().left
				});
				rightText.css({
					top: (_windowH / 2) - (rightText.height() / 2),
					right: $(document).find('.container').first().offset().left
				});
				$('.shadow').css('left', (_windowW / 2) - 20);
				leftSecImg.panr({
					sensitivity: -6,
					scale: false,
					scaleOnHover: false,
					scaleTo: 1,
					scaleDuration: 0,
					panY: false,
					panX: true,
					panDuration: 1.25,
					moveTarget: $(document)
				});
				rightSecImg.panr({
					sensitivity: -6,
					scale: false,
					scaleOnHover: false,
					scaleTo: 1,
					scaleDuration: 0,
					panY: false,
					panX: true,
					panDuration: 1.25,
					moveTarget: $(document)
				});
				leftText.panr({
					sensitivity: -2,
					scale: false,
					scaleOnHover: false,
					scaleTo: 1,
					scaleDuration: 0.5,
					panY: false,
					panX: true,
					panDuration: 1.25,
					moveTarget: $(document)
				});
				rightText.panr({
					sensitivity: -2,
					scale: false,
					scaleOnHover: false,
					scaleTo: 1,
					scaleDuration: 0.5,
					panY: false,
					panX: true,
					panDuration: 1.25,
					moveTarget: $(document)
				});
			} else {
				viewport.height(leftSecImgH);
				leftSec.css({
					clip: 'rect(0px,' + (leftSecImg.width() / 2) + 'px,' + leftSecImgH + 'px,' +  '-30px)'
				});
				rightSec.css({
					clip: 'rect(0px,' + 992 + 'px,' + leftSecImgH + 'px,' +  (leftSecImg.width() / 2) + 'px)'
				});

				$('#main-header').off('mousemove');
			};
		};
	};


	/* Header Animatios */
	function initHeaderAnimations() {
		var viewport = $('.viewport'),
			viewportW = viewport.width(),
			leftSec = viewport.find('.left-sec'),
			rightSec = viewport.find('.right-sec');

		if (viewport.length) {
			viewport.imagesLoaded(function(){
				viewport.addClass('images_loaded');
				enableHeaderAnimations();
			});
		};

	};

	/* Mobile Nav */
	function mobileNav() {
		var trigger = $('.mobile-nav-trigger');
		trigger.on('click', function(event) {
			event.preventDefault();
			$('.menu-items').stop().slideToggle(300);
		});
	};

	function submenus() {
		var menuItems = $('.menu-items');

		if (_windowW >= 992) {

			if (!$('.sideheader').length) {
				menuItems.find('li').on('mouseenter', function() {
					var $this = $(this),
						submenu = $this.children('.submenu');
					if (submenu.length) {
						submenu.hide().stop().slideDown(300);
					};
					if ($this.hasClass('megamenu') == true) {
			 			$this.children('.submenu-inner').css('visibility', 'visible').hide().stop().slideDown(300);
		 			};
				}).on('mouseleave', function() {
					var $this = $(this),
						submenu = $this.children('.submenu');
					if (submenu.length) {
						submenu.stop().slideUp(300);
					};
					if ($this.hasClass('megamenu') == true) {
			 			$this.children('.submenu-inner').stop().slideUp(200, function(){$this.children('.submenu-inner').css('visibility', 'hidden')});
		 			};
				});
			};
		} else {
			$('.submenu, .submenu-inner').each(function() {
				var $this = $(this);
				$this.prev('a').on('click', function(event) {
					event.preventDefault();
					$this.stop().slideToggle(300);
					// if ($this.parents('.megamenu').length) {
					// 	$this.parents('.megamenu').children('selector')
					// }
				});
			});
		};
	};

	function headerModules() {
		var modules = $('.modules'),
			moduleTrigger = modules.find('.module-trigger');

		moduleTrigger.on('click', function(event) {
			event.preventDefault();
			$(this).siblings('.module-element').stop().slideToggle(300);
		});
	};

	function megaMenu() {
	 	var el = $('.megamenu'),
	 		headerContainer,
	 		headerW,
				containerOffset,
	 		mainNav = $('.main-nav');

			if ($('.sideheader').length == 0 && $('.submenu-inner').length && _windowW >= 991) {
				headerContainer = $('#main-header').find('.container'),
				headerW = headerContainer.width(),
				containerOffset = headerContainer.offset().left;

		 	el.each(function() {
		 		var $this = $(this),
		 			dropdown = $this.children('.submenu-inner'),
		 			dropdownW = dropdown.width(),
		 			offset;
		 		if (dropdown.children('.submenu').children('li').length <= 3) {
		 			if ((dropdownW + dropdown.offset().left) >= (headerW + (containerOffset * 2))) {
				 		dropdown.css({'left': '', 'right': ''});
				 		dropdown.css({'left': 'auto', 'right': _windowW - $this.offset().left - dropdownW + (dropdownW / 2) - 80});
		 				offset = (dropdownW - (headerW + (containerOffset * 2)));
		 			} else {
			 			offset = dropdownW - $this.offset().left + (containerOffset * 2);
				 		dropdown.css({'left': '', 'right': ''});
				 		dropdown.css({'left': -(offset) + 'px', 'right': 'auto'});
		 			};
		 		} else {
			 		dropdown.css({
			 			'right': ''
			 		});
			 		dropdown.css({
			 			'right': _windowW - (mainNav.offset().left + mainNav.width() + 30)
			 		});
		 		};
		 	});
		};
	};

	function sideheader() {
		var el = $('.sideheader #main-header');
		if (el.length) {		
			// var scrollTime = 1.3;
			// var scrollDistance = 220;

			// if (navigator.userAgent.indexOf('Mac OS X') != -1) {
			// 	return false;
			// } else {
			// 	el.find('.main-nav').on("mousewheel DOMMouseScroll", function(event){
					
			// 		event.preventDefault();	
													
			// 		var delta = event.originalEvent.wheelDelta/120 || -event.originalEvent.detail/3;
			// 		var scrollTop = el.find('.main-nav').scrollTop();
			// 		var finalScroll = scrollTop - parseInt(delta*scrollDistance);
						
			// 		TweenMax.to(el.find('.main-nav'), scrollTime, {
			// 			scrollTo : { y: finalScroll, autoKill:true },
			// 				ease: Expo.easeOut,
			// 				autoKill: true,
			// 				overwrite: 5							
			// 			});
			// 	});
			// }
			if (_windowW >= 991) {
				el.find('.main-nav').perfectScrollbar();
				el.find('.menu-items').find('li').find('a').on('click', function(event) {
					var $this = $(this),
						submenu = $this.siblings('.submenu');
					if (submenu.length) {
						event.preventDefault();
						submenu.stop().slideToggle(300)
							   .parents('li').toggleClass('open');
						el.find('.main-nav').perfectScrollbar('update');
					};
				});
			} else {
				el.find('.main-nav').perfectScrollbar('update');		
			};
		};
	};

	function stickyMenu() {
	 	var el = $('nav.sticky-on');

			el.imagesLoaded(function(){
				var elH = el.height(),
					placeholder = $('<div class="nav-holder"></div>').height(elH).insertBefore(el).hide();

	 		$window.on('scroll', function() {
	 			if($window.scrollTop() >= elH) {
	 				el.addClass('sticked');
	 				$('.nav-holder').show();
	 			} else {
	 				el.removeClass('sticked');
	 				$('.nav-holder').hide();
	 			};
	 		});
			});
	};

	function onpageNav() {
		if ($('.onepage-nav').length) {
			$('.onepage-nav').onePageNav({
				currentClass: 'active',
				filter: '.menu-items a'
			});
		};
	};

	function enableMediaElements() {

		if ($('video').length) {

			$('video').each(function() {
				var $this = $(this),
					videoContainer = $this.parents('.video-container'),
					extPoster = videoContainer.find('.external-video-poster'),
					videoContent = videoContainer.find('.video-contents');
					extPoster.css('background-image', 'url(' + extPoster.children('img').attr('src') + ')');
				$this.mediaelementplayer({
					plugins: ['flash', 'silverlight'],
					success: function(mediaElement, domObject) {
		                mediaElement.addEventListener('play', function(){
		                	extPoster.fadeOut(300);
	                		TweenMax.to(videoContainer.find('.mejs-layer.mejs-overlay-play'), 0.3, {y: -40, opacity: 0, visibility: 'hidden'});
		                	if (videoContent.length) {
		                		TweenMax.to(videoContent, 0.3, {y: '-30%', opacity: 0, visibility: 'hidden'});
		                	};
		                }, false);
		                mediaElement.addEventListener('pause', function(){
		                	extPoster.fadeIn(300);
	                		TweenMax.to(videoContainer.find('.mejs-layer.mejs-overlay-play'), 0.3, {y: 0, opacity: 1, visibility: 'visible'});
		                	if (videoContent.length) {
		                		TweenMax.to(videoContent, 0.3, {y: '-50%', opacity: 1, visibility: 'visible'});
		                	};
		                }, false);
				    }
				});
			});
		};
	};

	function offcanvasNav() {
		var nav = $('.offcanvas-nav'),
			navH = nav.height(),
			mainNav = $('.main-nav'),
			twitterFeed = nav.find('.twitter-feed'),
			instaFeed = nav.find('.instagram-feed'),
			trigger = $('.nav-trigger'),
			mainNavH = mainNav.outerHeight(),
			triggerBars = trigger.find('.bars');
			$window.on('resize', function() {
				navH = nav.height();
			});

		if (nav.length) {
			nav.find('.offcanvas-nav-inner').slimScroll({height: navH});
			trigger.on('click', function(event) {
				event.preventDefault();
				$body.toggleClass('nav-visible');
				if ($body.hasClass('nav-visible') == true) {
					TweenMax.to(nav, 0.5, {ease: Power3.easeIn, y: '0%'});
					TweenMax.fromTo(twitterFeed, 0.5, {ease: Power3.easeIn, x: 15, opacity: 0}, {x: 0, opacity: 1, delay: 0.8});
					TweenMax.fromTo(instaFeed, 0.5, {ease: Power3.easeIn, x: -15, opacity: 0}, {x: 0, opacity: 1, delay: 0.8});
					TweenMax.staggerFromTo(nav.find('.menu-items > li'), 0.5, {ease: Power3.easeIn, y: -15, opacity: 0}, {y: 0, opacity: 1, delay: 0.4}, 0.1);
					if ($('body.fullpage-scroll').length) {
						$.fn.fullpage.setAllowScrolling(false);
					};
				} else {
					TweenMax.to(twitterFeed, 0.5, {ease: Power3.easeIn, x: 15, opacity: 0});
					TweenMax.to(instaFeed, 0.5, {ease: Power3.easeIn, x: -15, opacity: 0});
					TweenMax.staggerTo([nav.find('.menu-items > li').last(),nav.find('.menu-items > li').last().prevAll('li')], 0.5, {ease: Power3.easeIn, y: -15, opacity: 0, delay: 0.3}, 0.1);
					TweenMax.to(nav, 0.5, {ease: Power3.easeIn, y: '-100%', delay: 0.4});
					if ($('body.fullpage-scroll').length) {
						$.fn.fullpage.setAllowScrolling(true);
					};
				};
			});
		};
		if (twitterFeed.length) {
			twitterFeed.find('ul').owlCarousel({
				items: 1,
				singleItem: true,
				nav: true,
				loop: true
			});
		};
	};

	function instafeed() {
		if( $('#instafeed').length ){
			var feed = new Instafeed({
				get: 'user',
			    accessToken: '54840800.007647a.dc6a881ae50d428aaeffa0c9aa7691c0',
				userId: 303273692,
				limit: 4,
				template: '<li><a href="{{link}}"><img src="{{image}}" /></a></li>'
			});
			feed.run();
		};
	};

	function twitterFeed() {
		var tweetList = $('.tweet-list');
		if (tweetList.length) {
			tweetList.twittie({
			    username: 'google',
			    dateFormat: '%B %d, %Y',
	            template: '{{user_name}}<span class="time">{{date}}</span><p>{{tweet}}</p>',
			    count: 5,
			    hideReplies: true,
			    apiPath: 'js/api/tweet.php'
			}, function (){
				if (tweetList.length) {
					tweetList.find('ul').owlCarousel({
						items: 1,
						singleItem: true,
						nav: true,
						loop: true,
						autoHeight: true
					});
				};
			});
		};
	};

	function portfolioTab() {
		var el = $('.tab-portfolio'),
			figure = el.find('.tab-contents').find('figure');

		if (el.length) {
			figure.each(function() {
				var $this = $(this);
				$this.css('background-image', 'url(' + $this.find('img').attr('src') + ')');
			});
		};
	};

	function portfolioImageMove() {
		var container = $('.portfolio.style1');

		container.each(function() {
			var $this = $(this),
				imageContainer = $this.find('.image-container'),
				firstImg = imageContainer.find('figure:first-child'),
				secondImg = imageContainer.find('figure:nth-child(2)'),
				teamMemberW = $this.width(),
				targetWidth = teamMemberW - 10;
			imageContainer.imagesLoaded(function(){

				imageContainer.on('mouseenter', function() {
					secondImg.panr({
						sensitivity: 20,
						scale: false,
						scaleOnHover: false,
						scaleTo: 1,
						scaleDuration: .5,
						panY: false,
						panX: true,
						panDuration: 1.25,
						moveTarget: imageContainer,
						resetPanOnMouseLeave: true
					});
				})
			});
		});
	};

	function portfolio() {
		var portfolioWithFilter = $('.portfolio.with-filter'),
			portfolioMasonry = $('.portfolio.masonry');


		// create SVG circle overlay and append it to the preview element
		function createCircleOverlay(previewEl) {
			if ($('.preview').find('.overlay').length) {
				return
			} else {
				var dummy = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
				dummy.setAttributeNS(null, 'version', '1.1');
				dummy.setAttributeNS(null, 'width', '100%');
				dummy.setAttributeNS(null, 'height', '100%');
				dummy.setAttributeNS(null, 'class', 'overlay');
				var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
				var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
				circle.setAttributeNS(null, 'cx', 0);
				circle.setAttributeNS(null, 'cy', 0);
				circle.setAttributeNS(null, 'r', Math.sqrt(Math.pow(previewEl.offsetWidth,2) + Math.pow(previewEl.offsetHeight,2)));
				dummy.appendChild(g);
				g.appendChild(circle);
				previewEl.appendChild(dummy);
			};
		}
		if (portfolioWithFilter.length || portfolioMasonry.length) {
			
			new GridFx(document.querySelector('.grid'), {
				onInit : function(instance) {
					createCircleOverlay(instance.previewEl);
					$('.filters').on( 'click', 'li', function() {
					    var filterValue = $( this ).attr('data-filter');
					    $('.grid').isotope({ filter: filterValue });
					});
					$('.filters').each( function( i, buttonGroup ) {
						var $buttonGroup = $( buttonGroup );
						$buttonGroup.on( 'click', 'li', function() {
							$buttonGroup.find('.active').removeClass('active');
							$( this ).addClass('active');
						});
					});
				},
				onResize : function(instance) {
					instance.previewEl.querySelector('svg circle').setAttributeNS(null, 'r', Math.sqrt(Math.pow(instance.previewEl.offsetWidth,2) + Math.pow(instance.previewEl.offsetHeight,2)));
				},
				onOpenItem : function(instance, item) {
					// item's image
					var gridImg = item.querySelector('img'),
						gridImgOffset = gridImg.getBoundingClientRect(),
						win = {width: document.documentElement.clientWidth, height: window.innerHeight},
						SVGCircleGroupEl = instance.previewEl.querySelector('svg > g'),
						SVGCircleEl = SVGCircleGroupEl.querySelector('circle');
						
					SVGCircleEl.setAttributeNS(null, 'r', Math.sqrt(Math.pow(instance.previewEl.offsetWidth,2) + Math.pow(instance.previewEl.offsetHeight,2)));
					// set the transform for the SVG g node. This will animate the circle overlay. The origin of the circle depends on the position of the clicked item.
					if( gridImgOffset.left + gridImg.offsetWidth/2 < win.width/2 ) {
						SVGCircleGroupEl.setAttributeNS(null, 'transform', 'translate(' + win.width + ', ' + (gridImgOffset.top + gridImg.offsetHeight/2 < win.height/2 ? win.height : 0) + ')');
					}
					else {
						SVGCircleGroupEl.setAttributeNS(null, 'transform', 'translate(0, ' + (gridImgOffset.top + gridImg.offsetHeight/2 < win.height/2 ? win.height : 0) + ')');
					}
				}
			});
		};
	};

	function blogNewPost() {

		var el = $('.blog-new-post');

		el.each(function() {
			var $this = $(this);
			$this.css('background-image', 'url(' + $this.children('figure').children('img').attr('src') + ')');
		});
	};

	function enableParallax() {
		var parallaxEl = $('.parallax');
		parallaxEl.each(function() {
			var $this = $(this),
				bgSrc = $this.css('background-image'),
				ratio = $this.attr('data-stellar-background-ratio'),
				vOffset = $this.attr('data-stellar-vertical-offset'),
				hOffset = $this.attr('data-stellar-horizontal-offset'),
				bgPos = $this.css('background-position'),
				bgSize = $this.css('background-size'),
				newParallaxEl = $('<div class="parallax-image" data-stellar-ratio="' + ratio + '"></div>');

			newParallaxEl.css({'background-image': bgSrc, 'background-position': bgPos, 'background-size': bgSize});
			newParallaxEl.attr({
				'data-stellar-vertical-offset': vOffset,
				'data-stellar-horizontal-offset': hOffset
			});
			$this.css('background-image', 'none');
			newParallaxEl.prependTo($this);
		});
		parallaxEl.imagesLoaded(function(){
			var hOffset;
			if ($('.sideheader').length) {
				hOffset = 350;
			} else {
				hOffset = 0;
			};
			$.stellar({
		  		responsive: true,
				positionProperty: 'transform',
				horizontalOffset: hOffset,
				verticalOffset: 100
			});
		});
	};

	function blogClassic() {
		var el = $('.blog-container.classic');

		if (el.length) {
			el.find('article').find('figure').each(function() {
				var $this = $(this);

				$this.parent('aside').css('background-image', 'url(' + $this.children('img').attr('src') + ')');
			});
		};
	};

	function blogMasonry() {
		var el = $('.blog-container.masonry');

		if (el.length) {
			el.imagesLoaded().progress(function(){
				el.isotope({
					itemSelector: '.col-md-4'
				});
			});
		};
	};

	function enableFilterables() {
		var itemsContainer = $('.masonry-items');
		itemsContainer.imagesLoaded(function(){
			itemsContainer.isotope({
				itemSelector: '.masonry-item'
			});
		});
		$('.masonry-filters').on( 'click', 'li', function() {
		    var filterValue = $( this ).attr('data-filter');
			itemsContainer.isotope({ filter: filterValue });
		});
		$('.masonry-filters').each( function( i, buttonGroup ) {
			var $buttonGroup = $( buttonGroup );
			$buttonGroup.on( 'click', 'li', function() {
				$buttonGroup.find('.active').removeClass('active');
				$( this ).addClass('active');
			});
		});
	};

	function moveDown() {
		var el = $('.move-down'),
			parent;

		if (el.parents('header').length) {
			parent = el.parents('header');
		} else if (el.parents('section').length) {
			parent = el.parents('section');
		} else {
			parent = el;
		};

		if (el.length) {

			var nextSec = parent.next(),
				nextSecOffsetTop;

			if (nextSec.length) {
				nextSecOffsetTop = nextSec.offset().top;
			} else {
				nextSecOffsetTop = 0;
			};

			el.on('click', function(event) {
				event.preventDefault();
				TweenMax.to(window, 1, {scrollTo:{y: nextSecOffsetTop}, ease:Power2.easeOut});
			});
		};

	};

	function linkSmoothScroll() {
		var el = $('.smooth-scroll'),
			target = el.attr('href'),
			scrollOffset = el.attr('data-scroll-offset');

		if (typeof scrollOffset !== typeof undefined && scrollOffset !== false ) {
			scrollOffset = el.attr('data-scroll-offset');
		} else {
			scrollOffset = 0;
		};
		if (target === null || target === undefined || !el.length) {
			return
		} else {

			var targetOffset = $(target).offset().top;
			el.on('click', function(event) {
				event.preventDefault();
				TweenMax.to(window, 1, {scrollTo:{y: targetOffset - scrollOffset}, ease:Power2.easeOut});
			});
		};
	};

	function testimonialSlider() {

		var el = $('.testimonials-slider');

		if (el.length) {
			el.owlCarousel({
				items: 1,
				singleItem: true,
				dots: true,
				loop: true,
				animateIn: 'fadeInLeft',
				animateOut: 'fadeOutRight'
			});
		};
	};

	function itemSlider(){

		var itemSlider = $(".product-slider"),
			preview = itemSlider.find('.product-preview'),
			thumbs = itemSlider.find('.product-thumbs');

		if ( itemSlider.length ) {
			itemSlider.imagesLoaded(function(){
				preview.owlCarousel({
					items : 1,
					singleItem : true,
					animateIn: 'fadeInLeft',
					animateOut: 'fadeOutRight'
				});
				thumbs.owlCarousel({
					items : 2,
					margin: 15,
					responsive : {
					    768: {
					        items: 4
					    }
					}
				});

				thumbs.find('.owl-item').on('click', function() {
					$(this).addClass('active').siblings().removeClass('active');
					preview.trigger('to.owl.carousel', $(this).index());
				});
			});
		};
	};

	function fsNumber(){
		
		if (typeof $.fn.number != 'function') {
			return;
		}
		
		if ( $('input[type=number]').length ) {
			$('input[type=number]').number();
		};
	};

	function imageSlider() {
		var el = $('.image-slider'),
			elStyle2 = $('.image-slider.style2');

		if (el.length) {
			el.owlCarousel({
				items: 1,
				singleItem: true,
				nav: true,
				loop: true,
				animateIn: 'zoomIn',
				animateOut: 'fadeOutDown',
				navText: ['<i class="fa fa-angle-left"></i>','<i class="fa fa-angle-right"></i>']
			});
		};
		if (elStyle2.length) {
			elStyle2.owlCarousel({
				items: 3,
				singleItem: false,
				nav: false,
				loop: true,
				animateIn: 'zoomIn',
				animateOut: 'fadeOutDown'
			});
		};
	};

	function activePanr() {
		var el = $('.panr-active');

		if (!el.length || typeof $.fn.panr != 'function') {
			return
		} else {
			el.each(function() {
				var $this = $(this),
					sensitivityValue = $this.attr('data-sensitivity');
				if (sensitivityValue === null || sensitivityValue === undefined) {
					sensitivityValue = 30;
				};
				$this.find('.panr-element').panr({
					sensitivity: sensitivityValue,
					scale: false,
					scaleOnHover: true,
					scaleTo: 1.1,
					scaleDuration: .5,
					panY: true,
					panX: true,
					panDuration: 1.25,
					moveTarget: $this,
					resetPanOnMouseLeave: false
				});
			});
		};
	};

	function initCountTo() {
		var animatedCounter = $('.animated-counter');

		animatedCounter.appear(function(){
			var $this = $(this),
				counterNumber = $this.find('.number'),
				counterNumberValue = counterNumber.text();
			counterNumber.countTo({to: counterNumberValue, refreshInterval: 3});
		});
	};

	function teamMember3D() {
		var teamMember = $('.team-member');

		teamMember.on('mousemove', function(event) {
			var $this = $(this),
				teamMemberW = $this.width(),
				targetWidth = teamMemberW - 10,
				cx = ( teamMemberW - targetWidth ) / targetWidth,
				ew = event.pageX - $this.width() / 2,
				eh = event.pageY - $this.height() / 2,
				x = event.pageX - _windowW / 2 - 100,
				y = event.pageY - $this.offset().top - 100;

			// TweenMax.to($this, 0.2, {rotationY: -cx * x, rotationX: -cx * y});

		}).on('mouseleave', function() {
			var $this = $(this);

			TweenMax.to($this, 1, {x: 0, y: 0, rotationY: 0, rotationX: 0});
		});
	};

	function initTabs(){

		function Plugin(t){return this.each(function(){var e=jQuery(this),n=e.data("bs.tab");n||e.data("bs.tab",n=new Tab(this)),"string"==typeof t&&n[t]()})}function transitionEnd(){var t=document.createElement("bootstrap"),e={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"};for(var n in e)if(void 0!==t.style[n])return{end:e[n]};return!1}var Tab=function(t){this.element=jQuery(t)};Tab.VERSION="3.3.5",Tab.TRANSITION_DURATION=600,Tab.prototype.show=function(){var t=this.element,e=t.closest("ul:not(.dropdown-menu)"),n=t.data("target");if(n||(n=t.attr("href"),n=n&&n.replace(/.*(?=#[^\s]*jQuery)/,"")),!t.parent("li").hasClass("active")){var a=e.find(".active:last a"),i=jQuery.Event("hide.bs.tab",{relatedTarget:t[0]}),r=jQuery.Event("show.bs.tab",{relatedTarget:a[0]});if(a.trigger(i),t.trigger(r),!r.isDefaultPrevented()&&!i.isDefaultPrevented()){var o=jQuery(n);this.activate(t.closest("li"),e),this.activate(o,o.parent(),function(){a.trigger({type:"hidden.bs.tab",relatedTarget:t[0]}),t.trigger({type:"shown.bs.tab",relatedTarget:a[0]})})}}},Tab.prototype.activate=function(t,e,n){function a(){i.removeClass("active").find("> .dropdown-menu > .active").removeClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded",!1),t.addClass("active").find('[data-toggle="tab"]').attr("aria-expanded",!0),r?(t[0].offsetWidth,t.addClass("in")):t.removeClass("fade"),t.parent(".dropdown-menu").length&&t.closest("li.dropdown").addClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded",!0),n&&n()}var i=e.find("> .active"),r=n&&jQuery.support.transition&&(i.length&&i.hasClass("fade")||!!e.find("> .fade").length);i.length&&r?i.one("bsTransitionEnd",a).emulateTransitionEnd(Tab.TRANSITION_DURATION):a(),i.removeClass("in")};var old=jQuery.fn.tab;jQuery.fn.tab=Plugin,jQuery.fn.tab.Constructor=Tab,jQuery.fn.tab.noConflict=function(){return jQuery.fn.tab=old,this};var clickHandler=function(t){t.preventDefault(),Plugin.call(jQuery(this),"show")};jQuery(document).on("click.bs.tab.data-api",'[data-toggle="tab"]',clickHandler).on("click.bs.tab.data-api",'[data-toggle="pill"]',clickHandler),jQuery.fn.emulateTransitionEnd=function(t){var e=!1,n=this;jQuery(this).one("bsTransitionEnd",function(){e=!0});var a=function(){e||jQuery(n).trigger(jQuery.support.transition.end)};return setTimeout(a,t),this},jQuery(function(){jQuery.support.transition=transitionEnd(),jQuery.support.transition&&(jQuery.event.special.bsTransitionEnd={bindType:jQuery.support.transition.end,delegateType:jQuery.support.transition.end,handle:function(t){return jQuery(t.target).is(this)?t.handleObj.handler.apply(this,arguments):void 0}})}),jQuery(".tab-nav").find("li").find("a").on("click",function(t){t.preventDefault(),t.stopPropagation(),jQuery(this).tab("show")});
	}

	function initParallaxCover() {
		var el = $('.cover');
		el.find('.cover-inner').children('figure').each(function() {
			var $this = $(this);
			$this.css({
				'background-image': 'url(' + $this.find('img').attr('src') + ')'
			});
		});
		el.parallax();
	};

	function initialParticles() {
		if ($('#particles').length) {
			window.requestAnimFrame = (function () {
			    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
			        window.setTimeout(callback, 1000 / 60);
			    };
			})();

		    var star = function () {
		        this.offset = 0;
		        this.x = 0,
		        this.y = 0,
		        this.params = {
		            velocity_x: 1,
		            velocity_y: 1,
		            opacicty: 1,
		            lifetime: 3,
		            x_offset: 0,
		            y_offset: 0,
		            radius: 0,
		            decay: 0,
		            growth: 0,
		            amplitude: 100,
		            phaseshift: 360,
		            freq: 0.05,
		            color: '255,255,255'
		        };
		    };


		    star.prototype.init = function () {
		        //Randomize
		        this.params.phaseshift = (Math.random() * 0.01);
		        this.params.amplitude = Math.ceil(Math.random() * settings.amplitudeSeed);
		        this.params.freq = (Math.random() * settings.freqSeed);
		        this.params.x_offset = Math.ceil(Math.random() * 1000);
		        this.params.y_offset = settings.y_center + Math.ceil(Math.random() * settings.y_offsetSeed);
		        this.params.lifetime = Math.ceil(Math.random() * 3);
		        this.params.velocity_x = (Math.random() * settings.velocity_xSeed)
		        this.params.velocity_y = (Math.random() * settings.velocity_ySeed)
		        this.params.radius = (Math.random() * settings.maxradius);
		        this.params.opacity = Math.round(Math.random() * settings.opacSeed, 2) / 100;
		        if (settings.decay) {
		            this.params.decay = Math.round(Math.random() * 1.5) * Math.random() * 0.01;
		        }
		        if (settings.growth) {
		            this.params.growth = Math.round(Math.random() * 1.2) * Math.random() * 0.01;
		        }

		        if (settings.irregColors) {
		            switch (Math.ceil(Math.random() * settings.colorPct)) {
		                case 1:
		                    this.params.color = '255,0,0';
		                    break;
		                case 2:
		                    this.params.color = '0,255,255';
		                    break;
		                case 3:
		                    this.params.color = '0,255,200';
		                    break;
		                case 4:
		                    this.params.color = '255,0,255';
		                    break;
		                default:
		                    this.params.color = '255,255,255';
		                    break;
		            }
		        }
		        this.x = this.params.x_offset;
		    }

		    star.prototype.draw = function (ctx, new_x) {
		        this.offset = (this.offset + 1);
		        var t = (this.params.x_offset + this.offset);

		        if (this.params.opacity > settings.opacMax) {
		            this.params.decay *= -1;
		            this.params.lifetime--;
		        } else if (this.params.opacity <= settings.opacMin) {
		            this.params.lifetime--;
		            this.params.decay *= -1;
		            this.params.opacity = 0;
		        }
		        if (this.params.radius > settings.maxradius) {
		            this.params.growth *= -1;

		        } else if (this.params.radius <= 0.2) {
		            this.params.growth *= -1;
		            this.params.radius = 0.2;
		        }
		        this.params.radius += 2 * (this.params.growth);

		        this.params.opacity += 2 * (this.params.decay);

		        this.y = this.params.y_offset + (this.params.amplitude / 4 * Math.sin((2 + t * settings.velocity_y * 0.03) * this.params.freq)) * this.params.velocity_y * settings.scale_y
		        this.x += (1 * this.params.velocity_x * settings.velocity_x);
		        ctx.beginPath();
		        ctx.fillStyle = "rgba(" + this.params.color + "," + Math.round(this.params.opacity * 100) / 100 + ")";
		        ctx.arc(this.x, this.y, this.params.radius, 0, Math.PI * 2, false);
		        ctx.fill();
		    }


		    var settings = {
		        velocity_x: 0.1,
		        scale_y: -10,
		        y_center: 250,
		        y_offsetSeed: 0,
		        velocity_y: 0.1,
		        particles: 1500,
		        maxradius: 0.03,
		        irregColors: false,
		        decay: true,
		        growth: true,
		        freqSeed: 1.5,
		        amplitudeSeed: 200,
		        velocity_xSeed: 5,
		        velocity_ySeed: 1,
		        opacMax: 0.5,
		        opacMin: 0.01,
		        opacSeed: 90,
		        colorPct: 10


		    };

		    var stars = [];
		    var init = function () {
		    	var i;
		        for (i = 0; i < settings.particles; i++) {
		            stars[i] = new star();
		            stars[i].init();
		        }
		    };

		    var deg2rad = function (angle) {
		        return angle * .017453292519943295; // (angle / 180) * Math.PI;
		    }

		    var colorfreq = function (i) {
		        var frequency = .3;
		        i = i % 32;
		        var red = Math.ceil(Math.sin(frequency * i + 0) * 127 + 128);
		        var green = Math.ceil(Math.sin(frequency * i + 2) * 127 + 128);
		        var blue = Math.ceil(Math.sin(frequency * i + 4) * 127 + 128);
		        return "rgba(" + red + "," + green + "," + blue + "," + settings.alpha + ")";
		    }

		    init();
		    var ctx = document.getElementById("particles").getContext('2d');
		    var offset = 0;
		    (function animloop() {
		        requestAnimFrame(animloop);
		        ctx.fillStyle = "rgba(0,0,0,1)";
		        ctx.fillRect(0, 0, 1000, 1000);
		        var i;
		        for (i = 0; i < settings.particles; i++) {
		            stars[i].draw(ctx);
		            ctx.beginPath();
		            ctx.fill();
		            if (stars[i].x > 998 || (stars[i].params.lifetime < 0 && stars[i].params.opacity <= 0) || (stars[i].y < (0 - settings.maxradius)) || (stars[i].x < (0 - settings.maxradius)) || (stars[i].y > (500 + settings.maxradius))) {
		                stars[i] = new star();
		                stars[i].init();
		                stars[i].params.x_offset = (-1) * offset;
		                stars[i].x -= Math.random() * 200;
		                stars[i].params.opacity = 0;
		            }
		        }
		    })();
		};
	}

	function contactForm() {

	    var form = $('.contact-form'),
		    formMessages = form.siblings('#form-messages');

	    form.submit(function(event) {
	        event.preventDefault();
	        var $this = $(this),
	        	formData = $this.serialize(),
		        name = $this.find('#c-name'),
		        email = $this.find('#c-email'),
		        message = $this.find('#c-message');

	        if ( !name.val() || !email.val() || !message.val() ) {
	        	formMessages.text('Please Complete All inputs');
	        } else {
	        	formMessages.text('Sending your message. Please wait...').slideDown();
	        };

	        formMessages.removeClass('error').removeClass('success');

	        $.ajax({
	            type: 'POST',
	            url: form.attr('action'),
	            data: formData
	        })
	        .done(function(response) {
	            formMessages.removeClass('error').delay(5000).slideUp();
	            formMessages.addClass('success').delay(5000).slideUp();

	            formMessages.text(response);

	            name.val('');
	            email.val('');
	            message.val('');
	        })
	        .fail(function(data) {
	            // Make sure that the formMessages div has the 'error' class.
	            formMessages.removeClass('success').delay(5000).slideUp();
	            formMessages.addClass('error').delay(5000).slideUp();

	            // Set the message text.
	            if (data.responseText !== '') {
	                formMessages.text(data.responseText);
	            } else {
	                formMessages.text('Oops! An error occured and your message could not be sent.');
	            }
	        });
	    });
	};

	function enableAjaxLoadMore(){
		initAjaxLoadMore();
	}
	
	// Initializes Ajax Load More
	function initAjaxLoadMore(){

		// Portfolio Ajaxfy
		ajaxify({
			button: '.ajax-load-more a',
			postWrapper: '.grid',
			postItem: '.grid__item'
		});
		
	}

	function ajaxify(args){
		var ajaxButton = args.button,
			postWrapper = args.postWrapper,
			postItem = args.postItem;
			
		$(ajaxButton).on('click', function(e){
			
			e.preventDefault();
			
			// Variables
			var element = $(this),
				target = element.attr('href'),
				loadingTextOrg = element.html(),
				loadingText = element.data('loading-text'),
				$postWrapper = $(postWrapper);
			
			// Loading Text
			if(loadingText == 'spinner') element.addClass('spinner');
			else element.html(loadingText);
			
			// Run AJAX
			$.ajax({
				type: 'GET',
				url: target,
				success: function(data, textStatus, XMLHttpRequest) {
					
					// Store New Data
					var newPostItems = $(data).find(postWrapper + ' ' + postItem),
						nextPageUrl = $(data).find(ajaxButton).attr('href');
					
					newPostItems.imagesLoaded().progress(function(){

						// Update Load More Button Href
						if (nextPageUrl) element.attr('href', nextPageUrl);
						else element.parent().slideUp();

						// Add New Items
						$postWrapper.append(newPostItems).isotope();
						portfolio();
						activePanr();

					});
					
					// Trigger Resize To Fix Responsive Issues
					$(window).trigger('resize'); 

				},
				complete: function() {
					element.removeClass('spinner');
				},
				error: function(MLHttpRequest, textStatus, errorThrown){
					alert(errorThrown);
				}
			});
			
		});
	}


	/*------------------------------------------
	Running function when widnow is resized
	------------------------------------------*/
	$window.on('resize', function() {
		if (_windowW >= 991) {
			$('.submenu-inner').css({
				'display': 'block',
				'visibility': 'hidden'
			});
			setTimeout(function(){
				$('.submenu-inner').slideUp();
			}, 100);
		};
		setTimeout(function() {
			enableHeaderAnimations();
		}, 200);

		sideheader();
		moveDown();
		linkSmoothScroll();
	});

})();