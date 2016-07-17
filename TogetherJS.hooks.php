<?php

class TogetherJSHooks {

	// Add the togetherjs scripts to the page so we can do cool things
	static function getModules( $out, $skin ) {
		$out->addModules( array( 'ext.togetherjs' ) );

		return true;
	}
}
