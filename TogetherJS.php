<?php

$moduleInfo = array(
	'localBasePath' => __DIR__,
	'remoteExtPath' => 'TogetherJS',
);

$wgExtensionMessagesFiles['TogetherJS'] = __DIR__ . '/TogetherJS.i18n.php';

$wgResourceModules['togetherjs'] = array_merge( array(
	'scripts' => array(
		'js/ext.togetherjs.config.js',
		'js/togetherjs.js',
	),
	'dependencies' => array(
		'mediawiki.user',
	),
	'messages' => array(
		'togetherjs-name',
	),
), $moduleInfo );

$wgResourceModules['ext.togetherjs'] = array_merge( array(
	'scripts' => array(
		'js/ext.togetherjs.js',
		'js/ext.togetherjs.ve.js',
	),

	'dependencies' => array(
		'togetherjs',
	),
	'messages' => array(
		'togetherjs-name',
		'togetherjs-start',
		'togetherjs-tab',
	),
), $moduleInfo );

$wgAutoloadClasses['TogetherJSHooks'] = __DIR__ . '/TogetherJS.hooks.php';
$wgHooks['BeforePageDisplay'][] = 'TogetherJSHooks::getModules';
