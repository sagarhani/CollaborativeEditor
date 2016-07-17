( function ( mw ) {
	"use strict";

	/* TogetherJS configuration; loaded *before* TogetherJS loads. */
	window.TogetherJSConfig = {
		toolName: mw.msg( 'togetherjs-name' ),
		baseUrl: mw.config.get( 'wgServer' ) +
			mw.config.get( 'wgExtensionAssetsPath' ) +
			'/TogetherJS',
		hubBase: 'http://hub.togetherjs.com/',
		
		useMinimizedCode: true,
		cacheBust: false,
		lang: (function(lang) {
			// re-map language codes to those supported by togetherJS
			if (/_/.test(lang || '')) {
				return lang.replace(/_/g, '-'); 
			}
			return lang || 'en-US';
		})(mw.config.get( 'wgUserLanguage' )),
		callToStart: function(callback) {
			// defer loading of TogetherJS until after mw loads.
			var hook = mw.hook( 'togetherjs.autostart' );
			var once = function() {
				hook.remove(once);
				callback();
			};
			hook.add( once );
		},
		getUserName: function() {
			if (mw.user.isAnon()) { return null; }
			return mw.user.getName();
		}
	};

}( mediaWiki ) );
