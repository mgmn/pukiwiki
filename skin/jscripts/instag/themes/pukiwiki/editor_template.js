/**
 * @file
 * @brief pukiwiki向けテーマファイル
 *
 * @author
 *
 * $Revision: 38 $
 */

/* Import theme specific language pack */
g_insTag.importThemeLanguagePack('pukiwiki');

var InsTag_PukiwikiTheme = {
	_buttons : [
		// button img, button title, command
	    //          0,            1,       2
		['lang_bold_img', 'lang_bold_desc', "javascript:g_insTag.insTag('{$form_element_name}','\\'\\'','\\'\\'','bold');"],
		['lang_italic_img', 'lang_italic_desc', "javascript:g_insTag.insTag('{$form_element_name}','\\'\\'\\'','\\'\\'\\'','italic');"],
		['lang_underline_img', 'lang_underline_desc', "javascript:g_insTag.insTag('{$form_element_name}','%%%','%%%','underline');"],
		['lang_strikethrough_img', 'lang_strikethrough_desc', "javascript:g_insTag.insTag('{$form_element_name}','%%','%%','strikethrough');"],
		['lang_font_color_img', 'lang_font_color_desc', "javascript:t=new Array;t['file']='color_picker.htm';t['width']=220+(g_insTag.isOpera?40:0);t['height']=190;g_insTag.openWindow(t,{form_element_name : '{$form_element_name}', inline : 'yes'});"],
		['lang_font_size_img', 'lang_font_size_desc', "javascript:g_insTag.insTag('{$form_element_name}','&size(10){','};','font_size');"],
		['lang_justifyleft_img', 'lang_justifyleft_desc', "javascript:g_insTag.insTag('{$form_element_name}','LEFT:','','left');"],
		['lang_justifycenter_img', 'lang_justifycenter_desc', "javascript:g_insTag.insTag('{$form_element_name}','CENTER:','','centering');"],
		['lang_justifyright_img', 'lang_justifyright_desc', "javascript:g_insTag.insTag('{$form_element_name}','RIGHT:','','right');"],
		['lang_numlist_img', 'lang_numlist_desc', "javascript:g_insTag.insTag('{$form_element_name}','+','','numlist');"],
		['lang_bullist_img', 'lang_bullist_desc', "javascript:g_insTag.insTag('{$form_element_name}','-','','bullist');"],
		['lang_head_img', 'lang_head_desc', "javascript:g_insTag.insTag('{$form_element_name}','*','','title');"],
		['lang_link_img', 'lang_link_desc', "javascript:g_insTag.insTag('{$form_element_name}','[[',']]','alias>wikipage');"],
		['lang_hr_img', 'lang_hr_desc', "javascript:g_insTag.insTag('{$form_element_name}','----','','');"],
		['lang_br_img', 'lang_br_desc', "javascript:g_insTag.insTag('{$form_element_name}','&br;','','');"],
		['lang_formatted_img', 'lang_formatted_desc', "javascript:g_insTag.insTagMultiLine('{$form_element_name}',' ','');"],
		['lang_unformat_img', 'lang_unformat_desc', "javascript:g_insTag.removeTagMultiLine('{$form_element_name}',' ','');"],
		['lang_attach_img', 'lang_attach_desc', "javascript:g_insTag.insTag('{$form_element_name}','#attach','','');"],
		['lang_facemark_img', 'lang_facemark_desc', "javascript:t=new Array;t['file']='facemark.htm';t['width']=225+(g_insTag.isOpera?40:0);t['height']=200;g_insTag.openWindow(t,{form_element_name : '{$form_element_name}', inline : 'yes'});"],
//		['rowseparator', '', ""],
		['formatselect', '', ""]
	],

	getControlHTML : function(id, replace_element, form_element_name, target_document){
//		g_insTag.debug('getControlHTML' + '\r\n' + id + '\r\n' + replace_element + '\r\n' + form_element_name + '\r\n' + target_document);alert(g_insTag.log);
		var themesURL = g_insTag.baseURL + '/themes/' + g_insTag.settings['theme'];
		var html = '';
		var outerHTML = g_insTag.getOuterHTML(replace_element);
		html = '<table class="mceEditor" cellpadding="0" cellspacing="0" ><tbody><tr><td align="center">';
		html += '<span id="' + id + '_toolbar" class="mceToolbarContainer">';
		for (var i=0; i<this._buttons.length; i++) {
			switch(this._buttons[i][0]){
			case 'rowseparator':
				html += "<br />";
				continue;
			case "formatselect":
				var tmp = '<select id="' + id + '_formatSelect" name="' + id + '_formatSelect" onchange="g_insTag.insTag(\'' + form_element_name + '\', this.options[this.selectedIndex].value,\'\',\'\');" class="mceSelectList">';
				var lookup = [
					['', 'lang_theme_block'],
					['#contents\n', 'lang_theme_contents'],
					['*', 'lang_theme_h1'],
					['**', 'lang_theme_h2'],
					['***', 'lang_theme_h3']
				];

				for (var x=0; x<lookup.length; x++) {
					tmp += '<option value="' + lookup[x][0] + '">' + g_insTagLang[lookup[x][1]] + '</option>';
				}
				tmp += '</select>';
				html += tmp;
				continue;
			}
			var href = g_insTag.replaceVar(this._buttons[i][2], 'form_element_name', form_element_name);
			var img = '<img src="' + themesURL + '/images/' + g_insTagLang[this._buttons[i][0]] + '" border="0" />';
			href = g_insTag.replaceVar(href, 'editor_id', id);
			html += '<a title="' + g_insTagLang[this._buttons[i][1]] + '" href="' + href + '" >' + img + '</a> ';
		}
		html += '</span></td></tr>';
		html += '<tr><td align="center">';
		html += outerHTML;
		html += '</td></tr></tbody></table>';

		g_insTag.setOuterHTML(replace_element, html, target_document);
	}
};

g_insTag.addTheme("pukiwiki", InsTag_PukiwikiTheme);
