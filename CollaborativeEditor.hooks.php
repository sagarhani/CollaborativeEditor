<?php
/**
 * Hooks for CollaborativeEditor extension
 *
 * @file
 * @ingroup Extensions
 */

class CollaborativeEditorHooks {

	static function getModules( $out, $skin ) {
		$out->addModules( array( 'ext.collaborativeEditor' ) );

		return true;
	}
}
