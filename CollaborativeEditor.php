<?php

$moduleInfo = array(
	'localBasePath' => __DIR__,
	'remoteExtPath' => 'CollaborativeEditor',
);

$wgExtensionMessagesFiles['CollaborativeEditor'] = __DIR__ . '/CollaborativeEditor.i18n.php';

$wgResourceModules['collaborativeEditor'] = array_merge( array(
	'scripts' => array(
		'modules/ext.collaborativeEditor.config.js',
	),
	'dependencies' => array(
		'mediawiki.user',
	),
), $moduleInfo );

$wgResourceModules['ext.collaborativeEditor'] = array_merge( array(
	'scripts' => array(
		'modules/ext.collaborativeEditor.js',
		'modules/ext.collaborativeEditor.ve.js',
	),

	'dependencies' => array(
		'collaborativeeditor',
	),
), $moduleInfo );

$wgAutoloadClasses['CollaborativeEditorHooks'] = __DIR__ . '/CollaborativeEditor.hooks.php';
$wgHooks['BeforePageDisplay'][] = 'CollaborativeEditorHooks::getModules';
