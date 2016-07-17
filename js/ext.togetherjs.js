( function ( mw, $, TogetherJS ) {
	"use strict";

	// add option to start togetherjs in a action tab
	var pTabsId = $( '#p-views' ).length ? 'p-views' : 'p-cactions';
	mw.util.addPortletLink( pTabsId, '#', mw.msg( 'togetherjs-tab' ),
	                       'ca-tjs-start', mw.msg( 'togetherjs-start' ) );
	$( '#ca-tjs-start' ).click( TogetherJS );

	// add togetherjs to edit source toolbar
	if ( mw.toolbar ) {
		mw.toolbar.addButton({
			imageId: 'togetherjs-button',
			imageFile: TogetherJSConfig.baseUrl +
				'/togetherjs/images/notification-togetherjs-logo.png',
			speedTip: mw.msg( 'togetherjs-start' )
		});
		$( '#togetherjs-button' ).click( function( event ) {
			/* jshint newcap: false */
			TogetherJS(); // toggle togetherjs
			return false;
		} );
	}

}( mediaWiki, jQuery, TogetherJS ) );
