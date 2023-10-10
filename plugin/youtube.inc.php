<?php
/////////////////////////////////////////////////
// Youtube動画表示プラグイン
// youtube.inc.php
//
// Copyright(c) 2006 750.
// for PukiWiki(http://www.ninjatips.org)
//
// 例
//
// 表示したいビデオのアドレスのwatch?v=以降の文字列を
// #youtube(ID)
// と入力すれば表示できるようになります。
//
// 元々の出力例
//
//http://www.youtube.com/watch?v=T1_5X8nhFIM
//
//上記を表示したい場合は
//#youtube(T1_5X8nhFIM)
//と入力すれば動画で表示されます。
//
//
//
//





function plugin_youtube_convert() 
{
	if (func_num_args() < 1) return FALSE;
	$args = func_get_args();
	$name = trim($args[0]);
	$body = <<<EOF
		<iframe src="//www.youtube.com/embed/${name}" frameborder="0" allowfullscreen="true"
			style="display: inline-block;max-width: 100%;width: 640px;height: fit-content;aspect-ratio: 16/9;"></iframe>
	EOF;
	return $body . "\n";
}


function plugin_youtube_inline() {
	$args = func_get_args();
	return call_user_func_array('plugin_youtube_convert', $args);
}
?>
