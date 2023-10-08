// EUC-JP

function init() {
	g_insTagPopup.resizeToInnerSize();
	document.getElementById("facemark_title").innerHTML = g_insTagLang['lang_facemark_desc'];
	document.getElementById("facemark_closewindow").innerHTML = g_insTagLang['lang_facemark_closewindow'];
}

var facemark = new Array();

// image-filename, chr, visible, description
facemark = [
	['/../../../image/face/smile.png', '&smile;', true, '笑い'],
	['/../../../image/face/bigsmile.png', '&bigsmile;', true, '大笑い'],
	['/../../../image/face/huh.png', '&huh;', true, '溜息'],
	['/../../../image/face/oh.png', '&oh;', true, 'びっくり'],
	['/../../../image/face/sad.png', '&sad;', true, '泣き顔'],
	['/../../../image/face/wink.png', '&wink;', true, 'ウィンク'],
	['/../../../image/face/worried.png', '&worried;', true, '心配'],
	['/../../../image/face/heart.png', '&heart;', true, 'ハート']
];

function renderPictographHTML() {
	var insertCol = 1;
	var charsPerRow = 4, tdWidth=20, tdHeight=20;
	var html = '<table border="0" cellspacing="1" cellpadding="0" width="' + (tdWidth*charsPerRow) + '"><tr height="' + tdHeight + '">';
	var cols=-1;
	for (var i=0; i<facemark.length; i++) {
		if (facemark[i][2]==true) {
			cols++;
			html += ''
				+ '<td width="' + tdWidth + '" height="' + tdHeight + '" class="facemark"'
				+ ' onmouseover="this.className=\'facemarkOver\';'
				+ 'previewChar(\'' + facemark[i][1] + '\',\'' + facemark[i][0] + '\',\'' + facemark[i][3] + '\');"'
				+ ' onmouseout="this.className=\'facemark\';"'
				+ ' nowrap="nowrap" onclick="insertChar(\'' + facemark[i][insertCol] + '\');"><a style="text-decoration: none;" onfocus="previewChar(\'' + facemark[i][1] + '\',\'' + facemark[i][0] + '\',\'' + facemark[i][3] + '\');" href="javascript:insertChar(\'' + facemark[i][insertCol] + '\');" onclick="return false;" onmousedown="return false;" title="' + facemark[i][3] + '">'
				+ '<img src="' + g_insTag.baseURL + facemark[i][0] + '" border="0" />'
				+ '</a></td>';
			if ((cols+1) % charsPerRow == 0)
				html += '</tr><tr height="' + tdHeight + '">';
		}
	 }
	if (cols % charsPerRow > 0) {
		var padd = charsPerRow - (cols % charsPerRow);
		for (var i=0; i<padd-1; i++)
			html += '<td width="' + tdWidth + '" height="' + tdHeight + '" class="facemark">&nbsp;</td>';
	}
	html += '</tr></table>';
	document.write(html);
}

function insertChar(chr) {
	var elm = g_insTag.getWindowArg('form_element_name');
	g_insTag.insTag(elm, chr, '', '');

	// Refocus in window
	if (g_insTagPopup.isWindow)
		window.focus();

	if(document.getElementById("closewindow").checked){
		g_insTagPopup.close();
	}
}

function previewChar(codeA, codeV, codeN) {
	var elmA = document.getElementById('codeA');
	var elmV = document.getElementById('codeV');
	var elmN = document.getElementById('codeN');

	elmA.innerHTML = codeA;
	elmV.innerHTML = '<img src="' + g_insTag.baseURL + codeV + '" width="30" height="30" border="0" />';
	elmN.innerHTML = codeN;
}
