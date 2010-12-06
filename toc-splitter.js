/*
 * version: 2010.12.06
 *
 * jQuery.splitter.js
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * For more details see: http://methvin.com/splitter/
 *
 * @author Dave Methvin (dave.methvin@gmail.com)
 * @author Kaseluris-Nikos-1959
 */
(function($){

$.fn.splitter = function(args){
	args = args || {};
	return this.each(function() {

		$("body").css("margin", 0);

		function startSplitMouse(evt) {
			panes.css("-webkit-user-select", "none");	// Safari selects A/B text on a move
			bar.addClass('active');
			A._posSplit = A[0]["offsetWidth"] - evt["pageX"];
			$(document)
				.bind("mousemove", doSplitMouse)
				.bind("mouseup", endSplitMouse);
		}

		function doSplitMouse(evt) {
			var newPos = A._posSplit+evt["pageX"];
			resplit(newPos);
		}

		function endSplitMouse(evt) {
			bar.removeClass('active');
			var newPos = A._posSplit+evt["pageX"];
			panes.css("-webkit-user-select", "text");	// let Safari select text again
			$(document)
				.unbind("mousemove", doSplitMouse)
				.unbind("mouseup", endSplitMouse);
		}

		function resplit(newPos) {
			// Constrain new splitbar position to fit pane size limits
			newPos = Math.max(A._min, splitter._DA - B._max,
					Math.min(newPos, A._max, splitter._DA - bar._DA - B._min));
			// Resize/position the two panes
			bar._DA = bar[0]["offsetWidth"];		// bar size may change during dock
			bar.css("left", newPos).css("height", splitter._DF);
			A.css("left", 2).css("width", newPos).css("height",  splitter._DF);
			B.css("left", newPos+bar._DA +4)
				.css("width", splitter._DA-bar._DA-newPos).css("height",  splitter._DF);
			// IE fires resize for us; all others pay cash
			if ( !$.browser.msie )
				panes.trigger("resize");
		}

		function dimSum(jq, dims) {
			// Opera returns -1 for missing min/max width, turn into 0
			var sum = 0;
			for ( var i=1; i < arguments.length; i++ )
				sum += Math.max(parseInt(jq.css(arguments[i])) || 0, 0);
			return sum;
		}

		// Determine settings based on incoming opts, element classes, and defaults
		var vh = 'v';
		var opts = $.extend({
			v: {		type: 'v'	}
		}[vh], args);

		// Create jQuery object closures for splitter and both panes
		var splitter = $(this).css({position:"relative"});
		var panes = $(">*", splitter[0]).css({
			position: "absolute", 			// positioned inside splitter container
			"z-index": "1",						// splitbar is positioned above
		});
		var A = $(panes[0]);		// left  or top
		var B = $(panes[1]);		// right or bottom


		// Splitbar element, can be already in the doc or we create one
		var bar = $(panes[2] || '<div></div>')
			.insertAfter(A).css("z-index", "100")
			.attr({id: "idSplitBar", unselectable: "on"})
			.css({position: "absolute",	"user-select": "none", "-webkit-user-select": "none",
				"-khtml-user-select": "none", "-moz-user-select": "none"})
			.bind("mousedown", startSplitMouse);
		// Use our cursor unless the style specifies a non-default cursor
		if ( /^(auto|default|)$/.test(bar.css("cursor")) )
			bar.css("cursor", "e-resize");

		// Cache several dimensions for speed, rather than re-querying constantly
		bar._DA = bar[0]["offsetWidth"];
		splitter._PBF = 0;
		splitter._PBA = 0;
		A._pane = "Left";
		B._pane = "Right";
		$.each([A,B], function(){
			this._min = 20;
			this._max = dimSum(this, "max-width") || 9999;
			this._init = 259;
		});

		// Determine initial position, get from cookie if specified
		var initPos = A._init;

		// Resize event propagation and splitter sizing
		if ( opts.anchorToWindow ) {
			// Account for margin or border on the splitter container
			// and enforce min height
			splitter._hadjust = 0;
			splitter._hmin = 20;
			$(window).bind("resize", function(){
				var top = splitter.offset().top;
				var wh = $(window).height();
				splitter.css("height", Math.max(wh-top-splitter._hadjust, splitter._hmin)+"px");
				if ( !$.browser.msie ) splitter.trigger("resize");
			}).trigger("resize");
		}

		// Resize event handler; triggered immediately to set initial position
		splitter.bind("resize", function(e, size){
			// Custom events bubble in jQuery 1.3; don't get into a Yo Dawg
			if ( e.target != this ) return;
			// Determine new width/height of splitter container
			splitter._DF = splitter[0]["offsetHeight"] - splitter._PBF;
			splitter._DA = splitter[0]["offsetWidth"] - splitter._PBA -4;
			// Bail if splitter isn't visible or content isn't there yet
			if ( splitter._DF <= 0 || splitter._DA <= 0 ) return;
			// Re-divvy the adjustable dimension; maintain size of the preferred pane
			resplit(!isNaN(size)? size : (!(opts.sizeRight||opts.sizeBottom)? A[0]["offsetWidth"] :
				splitter._DA-B[0]["offsetWidth"]-bar._DA));
		}).trigger("resize" , [initPos]);
	});
};

})(jQuery);