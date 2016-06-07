<?php

if ( function_exists( 'wfLoadExtension' ) ) {
	wfLoadExtension( 'CollaborativeEditor' );
	// Keep i18n globals so mergeMessageFileList.php doesn't break
	$wgMessagesDirs['CollaborativeEditor'] = __DIR__ . '/i18n';
	$wgExtensionMessagesFiles['CollaborativeEditorAlias'] = __DIR__ . '/CollaborativeEditor.i18n.alias.php';
	$wgExtensionMessagesFiles['CollaborativeEditorMagic'] = __DIR__ . '/CollaborativeEditor.i18n.magic.php';
	wfWarn(
		'Deprecated PHP entry point used for CollaborativeEditor extension. Please use wfLoadExtension ' .
		'instead, see https://www.mediawiki.org/wiki/Extension_registration for more details.'
	);
	return true;
} else {
	die( 'This version of the CollaborativeEditor extension requires MediaWiki 1.25+' );
}
