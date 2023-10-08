/**
* @file
* @brief タグ入力 JavaScript
* @author DEX
*
* $Date: 2008-04-29 22:07:15 +0900 (���, 29  4��� 2008) $
* $Revision: 47 $
*/

= insTag htmlタグ入力補助 =

[[SubWiki]]

== 概要 ==
 * テキストエリアの入力補助が目的。
 * JavaScriptを追加するだけで動作する。
 * 検証ブラウザ
   * Firefox 2.0 以降 (推奨)
   * Opera 9.02 以降 (Opera 7.54u2は「document.selection」オブジェクトが未定義なので非対応。)
   * Internet Explorer 6.0 SP2 以降。Internet Explorer 7.0 (XP上)
 * プラグイン構造により、テーマ(thema)別に利用できる。
 * 文字コードも分離。
 * よりリッチなhtmlエディタが欲しい場合は、[http://tinymce.moxiecode.com/ tinyMCE]を使う事。

== ライセンス ==
 * LGPL

== 動作サンプル ==

 * examples/example_pukiwiki.html

==  組み込み方法 ==

=== pukiwiki 1.4.7の場合 ===
 1. pukiwikiのskinディレクトリの中にjscriptsディレクトリをアップロードします。( skin/jscripts )
 1. skin/pukiwiki.skin.php を編集し、<head></head>の間だに以下のコードを埋め込みます。(UTF8版は language : "ja_JP.utf8" )
{{{
<?php if ($_GET['cmd']=='edit'|| isset($_POST['preview']) || isset($_POST['template']) || $_GET['plugin']=='paraedit' ) { ?>
<script language="javascript" type="text/javascript" src="skin/jscripts/instag/instag.js" charset="EUC-JP"></script>
<script language="javascript" type="text/javascript">
	g_insTag.init({
		theme : "pukiwiki",
		mode : "textareas",
		language : "ja_JP.eucjp"
	});
</script>
<?php } ?>
}}}

== オプション ==

 theme::
   読み込むテーマを指定します。

 mode::
   処理対象を指定します。

 language::
   言語コードを指定します。あらかじめこの言語ファイル(${language}.js)を作成しておく必要があります。ja_JP.eucjp , ja_JP.utf8 が指定可能です。

 editor_selector::
   class名に一致したtextareaのみ処理する。デフォルトは全テキストエリア

 editor_deselector::
   class名に一致したtextareaは処理しない。"noEditor"というclass名を付ければ処理されない。
