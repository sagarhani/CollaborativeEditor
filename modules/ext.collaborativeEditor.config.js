// TogetherJS server is running locally in 8080  port

( function ( mw ) {
	"use strict";

	/* TogetherJS configuration; loaded *before* TogetherJS loads. */
	window.TogetherJSConfig = {
		toolName: mw.msg( 'togetherjs-name' ),
		baseUrl: mw.config.get( 'wgServer' ) +
			mw.config.get( 'wgExtensionAssetsPath' ) +
			'/TogetherJS',
		hubBase: 'http://localhost:8080',
		// For ACE compatibility, use minimized code.  Otherwise TogetherJS
		// wants to define `window.require`, which apparently ACE also uses.
		useMinimizedCode: true,
		// don't use unnecessary cache-busting queries
		cacheBust: false,
		lang: (function(lang) {
			// re-map language codes to those supported by togetherJS
			if (/_/.test(lang || '')) {
				return lang.replace(/_/g, '-'); // BCP 47
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