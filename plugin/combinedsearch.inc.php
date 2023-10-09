<?php
/////////////////////////////////////////////////
// V2C使用法 + V2Cwiki 複合検索
//

function plugin_combinedsearch_convert() {
	return <<<EOF

<form id="cse-search-box" action="//google.com/cse">
	<div>
		<input type="hidden" name="cx" value="016981881007130442160:igoqc83fkm0" />
		<input type="hidden" name="ie" value="UTF-8" />
		<input type="text" name="q" size="20" />
		<input type="submit" name="sa" value="Search" />
	</div>
</form>
<script type="text/javascript" src="//www.google.com/coop/cse/brand?form=cse-search-box&amp;lang=ja"></script>

EOF;
} ?>
