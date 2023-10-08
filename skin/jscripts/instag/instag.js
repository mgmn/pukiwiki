/**
* @file
* @brief ¥¿¥°ÆþÎÏ JavaScript
*
* @date 2006/12/18 ¿·µ¬ºîÀ®
*
* @attention
*	- Encoding EUC-JP + LF
*
* @note
*   - GNU Lesser General Public License(LGPL)
*	- Æ°ºî³ÎÇ§¥Ö¥é¥¦¥¶
*		- Internet Explorer 6.0 SP2 °Ê¹ß
*		- Firefox 2.0 °Ê¹ß
*		- Opera 9.02 °Ê¹ß (Opera 7.54u2¤Ï¡Ödocument.selection¡×¥ª¥Ö¥¸¥§¥¯¥È¤¬Ì¤ÄêµÁ¤Ê¤Î¤ÇÈóÂÐ±þ¡£)
*	- »²¹Í¥µ¥¤¥ÈÍÍ(·É¾ÎÎ¬¡¢½çÉÔÆ±)
*		- tinyMCE http://tinymce.moxiecode.com/
*		- Silicone Brain http://masaki.homelinux.com/masaki/?InputHelper
*		- SxWiki http://linux.s33.xrea.com:8080/SxWiki/
*		- Pukiwiki.org http://pukiwiki.org/dev/?PukiWiki%2F1.4%2F%A4%C1%A4%E7%A4%C3%A4%C8%CA%D8%CD%F8%A4%CB%2FJavascript%A4%C7%C6%FE%CE%CF%BB%D9%B1%E7
*		- JavaScript++¤«¤âÆüµ­ http://jsgt.org/mt/01/#crossfunc
*
* @author DEX
*
* $Revision: 36 $
*/

/**
* ¥¿¥°ÆþÎÏ¥¯¥é¥¹ ¥×¥í¥Ñ¥Æ¥£
*/
function InsTag_Engine() {
	var ua;

	this.majorVersion = "1";
	this.minorVersion = "$Revision: 36 $";
	this.releaseDate = "$Date: 2007-02-17 14:22:33 +0900 (åœŸ, 17 2 2007) $";
	this.baseURL = '';
	this.srcMode = '';
	this.instances = new Array();
	this.switchClassCache = new Array();
	this.windowArgs = new Array();
	this.loadedFiles = new Array();
	this.pendingFiles = new Array();
	this.loadingIndex = 0;
	this.configs = new Array();
	this.currentConfig = 0;
	this.eventHandlers = new Array();
	this.log = new Array();
	this.undoLevels = [];
	this.undoIndex = 0;
	this.typingUndoIndex = -1;

	// Browser check
	ua = navigator.userAgent;
	this.isMSIE = (navigator.appName == "Microsoft Internet Explorer");
	this.isMSIE5 = this.isMSIE && (ua.indexOf('MSIE 5') != -1);
	this.isMSIE5_0 = this.isMSIE && (ua.indexOf('MSIE 5.0') != -1);
	this.isMSIE7 = this.isMSIE && (ua.indexOf('MSIE 7') != -1);
	this.isGecko = ua.indexOf('Gecko') != -1;
	this.isSafari = ua.indexOf('Safari') != -1;
	this.isOpera = ua.indexOf('Opera') != -1;
	this.isMac = ua.indexOf('Mac') != -1;
	this.isNS7 = ua.indexOf('Netscape/7') != -1;
	this.isNS71 = ua.indexOf('Netscape/7.1') != -1;
	this.dialogCounter = 0;
	this.plugins = new Array();
	this.themes = new Array();
	this.menus = new Array();
	this.loadedPlugins = new Array();
	this.buttonMap = new Array();
	this.isLoaded = false;

	// Fake MSIE on Opera and if Opera fakes IE, Gecko or Safari cancel those
	if (this.isOpera) {
		this.isMSIE = true;
		this.isGecko = false;
		this.isSafari =  false;
	}

	this.isIE = this.isMSIE;
	this.isRealIE = this.isMSIE && !this.isOpera;

	// editor id instance counter
	this.idCounter = 0;
};

/**
* ¥¿¥°ÆþÎÏ¥¯¥é¥¹ ¥×¥í¥Ñ¥Æ¥£ ¥á¥½¥Ã¥É
*/
InsTag_Engine.prototype = {
	init : function(settings) {
		var theme, nl, baseHREF = "", i;

		// IE 5.0x is no longer supported since 5.5, 6.0 and 7.0 now exists. We can't support old browsers forever, sorry.
		if (this.isMSIE5_0)
			return;

		this.settings = settings;

		// Check if valid browser has execcommand support
		if (typeof(document.execCommand) == 'undefined')
			return;

		// Get script base path
		if (!g_insTag.baseURL) {
			var elements = document.getElementsByTagName('script');

			// If base element found, add that infront of baseURL
			nl = document.getElementsByTagName('base');
			for (i=0; i<nl.length; i++) {
				if (nl[i].href)
					baseHREF = nl[i].href;
			}

			for (var i=0; i<elements.length; i++) {
				if (elements[i].src && (elements[i].src.indexOf("instag.js") != -1 || elements[i].src.indexOf("instag_dev.js") != -1 || elements[i].src.indexOf("instag_src.js") != -1 || elements[i].src.indexOf("instag_gzip") != -1)) {
					var src = elements[i].src;

					g_insTag.srcMode = (src.indexOf('_src') != -1 || src.indexOf('_dev') != -1) ? '_src' : '';
					g_insTag.gzipMode = src.indexOf('_gzip') != -1;
					src = src.substring(0, src.lastIndexOf('/'));

					if (settings.exec_mode == "src" || settings.exec_mode == "normal")
						g_insTag.srcMode = settings.exec_mode == "src" ? '_src' : '';

					// Force it absolute if page has a base href
					if (baseHREF != "" && src.indexOf('://') == -1)
						g_insTag.baseURL = baseHREF + src;
					else
						g_insTag.baseURL = src;

					break;
				}
			}
		}

		// Get document base path
		this.documentBasePath = document.location.href;
		if (this.documentBasePath.indexOf('?') != -1)
			this.documentBasePath = this.documentBasePath.substring(0, this.documentBasePath.indexOf('?'));
		this.documentURL = this.documentBasePath;
		this.documentBasePath = this.documentBasePath.substring(0, this.documentBasePath.lastIndexOf('/'));

		// If not HTTP absolute
		if (g_insTag.baseURL.indexOf('://') == -1 && g_insTag.baseURL.charAt(0) != '/') {
			// If site absolute
			g_insTag.baseURL = this.documentBasePath + "/" + g_insTag.baseURL;
		}

		// Set default values on settings
		this._def("mode", "none");
		this._def("theme", "advanced");
		this._def("plugins", "", true);
		this._def("language", "ja_JP.eucjp");
		this._def("docs_language", this.settings['language']);
		this._def("elements", "");
		this._def("textarea_trigger", "editable");
		this._def("editor_selector", "");
		this._def("editor_deselector", "noEditor");
		this._def("encoding", "");
		this._def("save_callback", "");
		this._def("debug", false);
		this._def("document_base_url", this.documentURL);
		this._def("ask", false);
		this._def("browsers", "msie,safari,gecko,opera", true);
		this._def("dialog_type", "window");
		this._def("content_css", '');
		this._def("strict_loading_mode", document.contentType == 'application/xhtml+xml');

		// Force strict loading mode to false on non Gecko browsers
		if (this.isMSIE && !this.isOpera)
			this.settings.strict_loading_mode = false;

		// Browser check IE
		if (this.isMSIE && this.settings['browsers'].indexOf('msie') == -1)
			return;

		// Browser check Gecko
		if (this.isGecko && this.settings['browsers'].indexOf('gecko') == -1)
			return;

		// Browser check Safari
		if (this.isSafari && this.settings['browsers'].indexOf('safari') == -1)
			return;

		// Browser check Opera
		if (this.isOpera && this.settings['browsers'].indexOf('opera') == -1)
			return;

		// If not super absolute make it so
		baseHREF = g_insTag.settings['document_base_url'];
		var h = document.location.href;
		var p = h.indexOf('://');
		if (p > 0 && document.location.protocol != "file:") {
			p = h.indexOf('/', p + 3);
			h = h.substring(0, p);

			if (baseHREF.indexOf('://') == -1)
				baseHREF = h + baseHREF;

			g_insTag.settings['document_base_url'] = baseHREF;
			g_insTag.settings['document_base_prefix'] = h;
		}

		// Trim away query part
		if (baseHREF.indexOf('?') != -1)
			baseHREF = baseHREF.substring(0, baseHREF.indexOf('?'));

		this.settings['base_href'] = baseHREF.substring(0, baseHREF.lastIndexOf('/')) + "/";

		theme = this.settings['theme'];
		this.callbacks = new Array('onInit', 'getInfo', 'getEditorTemplate', 'setupContent', 'onChange', 'onPageLoad', 'handleNodeChange', 'initInstance', 'execCommand', 'getControlHTML', 'handleEvent', 'cleanup');

		// Theme url
		this.settings['theme_href'] = g_insTag.baseURL + "/themes/" + theme;

		if (!g_insTag.isIE || g_insTag.isOpera)
			this.settings['force_br_newlines'] = false;

		if (g_insTag.getParam("popups_css", false)) {
			var cssPath = g_insTag.getParam("popups_css", "");

			// Is relative
			if (cssPath.indexOf('://') == -1 && cssPath.charAt(0) != '/')
				this.settings['popups_css'] = this.documentBasePath + "/" + cssPath;
			else
				this.settings['popups_css'] = cssPath;
		} else
			this.settings['popups_css'] = g_insTag.baseURL + "/themes/" + theme + "/css/editor_popup.css";

		if (g_insTag.getParam("editor_css", false)) {
			var cssPath = g_insTag.getParam("editor_css", "");

			// Is relative
			if (cssPath.indexOf('://') == -1 && cssPath.charAt(0) != '/')
				this.settings['editor_css'] = this.documentBasePath + "/" + cssPath;
			else
				this.settings['editor_css'] = cssPath;
		} else {
			if (this.settings.editor_css != '')
				this.settings['editor_css'] = g_insTag.baseURL + "/themes/" + theme + "/css/editor_ui.css";
		}

		if (g_insTag.settings['debug']) {
			var msg = "Debug: \n";

			msg += "baseURL: " + this.baseURL + "\n";
			msg += "documentBasePath: " + this.documentBasePath + "\n";
			msg += "content_css: " + this.settings['content_css'] + "\n";
			msg += "popups_css: " + this.settings['popups_css'] + "\n";
			msg += "editor_css: " + this.settings['editor_css'] + "\n";

			alert(msg);
		}

		// Only do this once
		if (this.configs.length == 0) {
			if (typeof(InsTagCompressed) == "undefined") {
				g_insTag.addEvent(window, "DOMContentLoaded", InsTag_Engine.prototype.onLoad);

				if (g_insTag.isRealIE) {
					if (document.body)
						g_insTag.addEvent(document.body, "readystatechange", InsTag_Engine.prototype.onLoad);
					else
						g_insTag.addEvent(document, "readystatechange", InsTag_Engine.prototype.onLoad);
				}

				g_insTag.addEvent(window, "load", InsTag_Engine.prototype.onLoad);
				g_insTag._addUnloadEvents();
			}
		}

		this.loadScript(g_insTag.baseURL + '/langs/' + this.settings['language'] +  '.js');
		this.loadScript(g_insTag.baseURL + '/themes/' + this.settings['theme'] + '/editor_template' + g_insTag.srcMode + '.js');
		this.loadCSS(this.settings['editor_css']);
		this.loadCSS(g_insTag.baseURL + "/themes/" + this.settings['theme'] + "/css/editor_content.css");

		// Add plugins
		var p = g_insTag.getParam('plugins', '', true, ',');
		if (p.length > 0) {
			for (var i=0; i<p.length; i++) {
				if (p[i].charAt(0) != '-')
					this.loadScript(g_insTag.baseURL + '/plugins/' + p[i] + '/editor_plugin' + g_insTag.srcMode + '.js');
			}
		}

		// Setup entities
		if (g_insTag.getParam('entity_encoding') == 'named') {
			settings['cleanup_entities'] = new Array();
			var entities = g_insTag.getParam('entities', '', true, ',');
			for (var i=0; i<entities.length; i+=2)
				settings['cleanup_entities']['c' + entities[i]] = entities[i+1];
		}

		// Save away this config
		settings['index'] = this.configs.length;
		this.configs[this.configs.length] = settings;

		// Start loading first one in chain
		this.loadNextScript();

		// Force flicker free CSS backgrounds in IE
		if (this.isIE && !this.isOpera) {
			try {
				document.execCommand('BackgroundImageCache', false, true);
			} catch (e) {
			}
		}
	},

	_addUnloadEvents : function() {
	},
	
	_def : function(key, def_val, t) {
		var v = g_insTag.getParam(key, def_val);

		v = t ? v.replace(/\s+/g, "") : v;

		this.settings[key] = v;
	},

	loadScript : function(url) {
		var i;

		for (i=0; i<this.loadedFiles.length; i++) {
			if (this.loadedFiles[i] == url)
				return;
		}

		if (g_insTag.settings.strict_loading_mode)
			this.pendingFiles[this.pendingFiles.length] = url;
		else
			document.write('<sc'+'ript language="javascript" type="text/javascript" src="' + url + '"></script>');

		this.loadedFiles[this.loadedFiles.length] = url;
	},

	loadNextScript : function() {
		var d = document, se;

		if (!g_insTag.settings.strict_loading_mode)
			return;

		if (this.loadingIndex < this.pendingFiles.length) {
			se = d.createElementNS('http://www.w3.org/1999/xhtml', 'script');
			se.setAttribute('language', 'javascript');
			se.setAttribute('type', 'text/javascript');
			se.setAttribute('src', this.pendingFiles[this.loadingIndex++]);

			d.getElementsByTagName("head")[0].appendChild(se);
		} else
			this.loadingIndex = -1; // Done with loading
	},

	loadCSS : function(url) {
		var ar = url.replace(/\s+/, '').split(',');
		var lflen = 0, csslen = 0;
		var skip = false;
		var x = 0, i = 0, nl, le;

		for (x = 0,csslen = ar.length; x<csslen; x++) {
			if (ar[x] != null && ar[x] != 'null' && ar[x].length > 0) {
				/* Make sure it doesn't exist. */
				for (i=0, lflen=this.loadedFiles.length; i<lflen; i++) {
					if (this.loadedFiles[i] == ar[x]) {
						skip = true;
						break;
					}
				}

				if (!skip) {
					if (g_insTag.settings.strict_loading_mode) {
						nl = document.getElementsByTagName("head");

						le = document.createElement('link');
						le.setAttribute('href', ar[x]);
						le.setAttribute('rel', 'stylesheet');
						le.setAttribute('type', 'text/css');

						nl[0].appendChild(le);			
					} else
						document.write('<link href="' + ar[x] + '" rel="stylesheet" type="text/css" />');

					this.loadedFiles[this.loadedFiles.length] = ar[x];
				}
			}
		}
	},

	hasTheme : function(n) {
		return typeof(this.themes[n]) != "undefined" && this.themes[n] != null;
	},

	addTheme : function(n, t) {
		this.themes[n] = t;

		this.loadNextScript();
	},

	onLoad : function() {
		var r;

		// Wait for everything to be loaded first
		if (g_insTag.settings.strict_loading_mode && this.loadingIndex != -1) {
			window.setTimeout('g_insTag.onLoad();', 1);
			return;
		}

		if (g_insTag.isRealIE && window.event.type == "readystatechange" && document.readyState != "complete")
			return true;

		if (g_insTag.isLoaded)
			return true;

		g_insTag.isLoaded = true;

		// IE produces JS error if g_insTag is placed in a frame
		// It seems to have something to do with the selection not beeing
		// correctly initialized in IE so this hack solves the problem
		if (g_insTag.isRealIE && document.body) {
			r = document.body.createTextRange();
			r.collapse(true);
			r.select();
		}

		for (var c=0; c<g_insTag.configs.length; c++) {
			g_insTag.settings = g_insTag.configs[c];

			var selector = g_insTag.getParam("editor_selector");
			var deselector = g_insTag.getParam("editor_deselector");
			var elementRefAr = new Array();

			// Add submit triggers
			if (document.forms && g_insTag.settings['add_form_submit_trigger'] && !g_insTag.submitTriggers) {
				for (var i=0; i<document.forms.length; i++) {
					var form = document.forms[i];

					g_insTag.addEvent(form, "submit", InsTag_Engine.prototype.handleEvent);
					g_insTag.addEvent(form, "reset", InsTag_Engine.prototype.handleEvent);
					g_insTag.submitTriggers = true; // Do it only once

					// Patch the form.submit function
					if (g_insTag.settings['submit_patch']) {
						try {
							form.mceOldSubmit = form.submit;
							form.submit = InsTag_Engine.prototype.submitPatch;
						} catch (e) {
							// Do nothing
						}
					}
				}
			}

			// Add editor instances based on mode
			var mode = g_insTag.settings['mode'];
			switch (mode) {
				case "textareas":
					var nodeList = document.getElementsByTagName("textarea");

					for (var i=0; i<nodeList.length; i++) {
						var elm = nodeList.item(i);
						var trigger = elm.getAttribute(g_insTag.settings['textarea_trigger']);

						if (elm.style.display == 'none')
							continue;

						if (selector != '' && !new RegExp('\\b' + selector + '\\b').test(g_insTag.getAttrib(elm, "class")))
							continue;

						if (selector != '')
							trigger = selector != "" ? "true" : "";

						if (new RegExp('\\b' + deselector + '\\b').test(g_insTag.getAttrib(elm, "class")))
							continue;

						if ((mode == "specific_textareas" && trigger == "true") || (mode == "textareas" && trigger != "false"))
							elementRefAr[elementRefAr.length] = elm;
					}
				break;
			}

			for (var i=0; i<elementRefAr.length; i++) {
				var element = elementRefAr[i];
				var elementId = element.name ? element.name : element.id;

				if (g_insTag.settings['ask'] || g_insTag.settings['convert_on_click']) {
					// Focus breaks in Mozilla
					if (g_insTag.isGecko) {
						var settings = g_insTag.settings;

						g_insTag.addEvent(element, "focus", function (e) {window.setTimeout(function() {InsTag_Engine.prototype.confirmAdd(e, settings);}, 10);});

						if (element.nodeName != "TEXTAREA" && element.nodeName != "INPUT")
							g_insTag.addEvent(element, "click", function (e) {window.setTimeout(function() {InsTag_Engine.prototype.confirmAdd(e, settings);}, 10);});
					} else {
						var settings = g_insTag.settings;

						g_insTag.addEvent(element, "focus", function () { InsTag_Engine.prototype.confirmAdd(null, settings); });
						g_insTag.addEvent(element, "click", function () { InsTag_Engine.prototype.confirmAdd(null, settings); });
					}
				} else
					g_insTag.addControl(element, elementId);
			}

			// Handle auto focus
			if (g_insTag.settings['auto_focus']) {
				window.setTimeout(function () {
					var inst = g_insTag.getInstanceById(g_insTag.settings['auto_focus']);
					inst.selection.selectNode(inst.getBody(), true, true);
					inst.contentWindow.focus();
				}, 100);
			}
		}
	},

	confirmAdd : function(e, settings) {
		var elm = g_insTag.isIE ? event.srcElement : e.target;
		var elementId = elm.name ? elm.name : elm.id;

		g_insTag.settings = settings;

		if (g_insTag.settings['convert_on_click'] || (!elm.getAttribute('mce_noask') && confirm(g_insTagLang['lang_edit_confirm'])))
			g_insTag.addControl(elm, elementId);

		elm.setAttribute('mce_noask', 'true');
	},

	addControl : function(replace_element, form_element_name, target_document) {
		var id = "editor_" + g_insTag.idCounter++;

		var t = this.settings['theme'];
		if (g_insTag.hasTheme(t)) {
			var fn = g_insTag.callbacks;
			var to = {};
			var o = this.themes[t];

			for (i=0; i<fn.length; i++) {
				var result;
				if (eval('o.'+fn[i]) && (result = eval('o.'+fn[i]+'(id, replace_element, form_element_name, target_document)')) != ''){
				}
			}
		}

/*		var inst = new InsTag_Control(g_insTag.settings);

		inst.editorId = id;
		this.instances[id] = inst;

		inst._onAdd(replace_element, form_element_name, target_document);
*/
	},

	getControlHTML : function(c) {
		var i, l, n, o, v;

		l = g_insTag.plugins;
		for (n in l) {
			o = l[n];

			if (o.getControlHTML && (v = o.getControlHTML(c)) != '')
				return g_insTag.replaceVar(v, "pluginurl", o.baseURL);
		}

		o = g_insTag.themes[g_insTag.settings['theme']];
		if (o.getControlHTML && (v = o.getControlHTML(c)) != '')
			return v;

		return '';
	},

	regexpReplace : function(in_str, reg_exp, replace_str, opts) {
		if (in_str == null)
			return in_str;

		if (typeof(opts) == "undefined")
			opts = 'g';

		var re = new RegExp(reg_exp, opts);
		return in_str.replace(re, replace_str);
	},

	trim : function(s) {
		return s.replace(/^\s*|\s*$/g, "");
	},

	cleanupEventStr : function(s) {
		s = "" + s;
		s = s.replace('function anonymous()\n{\n', '');
		s = s.replace('\n}', '');
		s = s.replace(/^return true;/gi, ''); // Remove event blocker

		return s;
	},

	getControlHTML : function(c) {
		var i, l, n, o, v;

		l = g_insTag.plugins;
		for (n in l) {
			o = l[n];

			if (o.getControlHTML && (v = o.getControlHTML(c)) != '')
				return g_insTag.replaceVar(v, "pluginurl", o.baseURL);
		}

		o = g_insTag.themes[g_insTag.settings['theme']];
		if (o.getControlHTML && (v = o.getControlHTML(c)) != '')
			return v;

		return '';
	},

	evalFunc : function(f, idx, a, o) {
		var s = '(', i;

		for (i=idx; i<a.length; i++) {
			s += 'a[' + i + ']';

			if (i < a.length-1)
				s += ',';
		}

		s += ');';

		return o ? eval("o." + f + s) : eval("f" + s);
	},

	dispatchCallback : function(i, p, n) {
		return this.callFunc(i, p, n, 0, this.dispatchCallback.arguments);
	},

	executeCallback : function(i, p, n) {
		return this.callFunc(i, p, n, 1, this.executeCallback.arguments);
	},

	execCommandCallback : function(i, p, n) {
		return this.callFunc(i, p, n, 2, this.execCommandCallback.arguments);
	},

	callFunc : function(ins, p, n, m, a) {
		var l, i, on, o, s, v;

		s = m == 2;

		l = g_insTag.getParam(p, '');

		if (l != '' && (v = g_insTag.evalFunc(typeof(l) == "function" ? l : eval(l), 3, a)) == s && m > 0)
			return true;

		if (ins != null) {
			for (i=0, l = ins.plugins; i<l.length; i++) {
				o = g_insTag.plugins[l[i]];

				if (o[n] && (v = g_insTag.evalFunc(n, 3, a, o)) == s && m > 0)
					return true;
			}
		}

		l = g_insTag.themes;
		for (on in l) {
			o = l[on];

			if (o[n] && (v = g_insTag.evalFunc(n, 3, a, o)) == s && m > 0)
				return true;
		}

		return false;
	},

	isInstance : function(o) {
		return o != null && typeof(o) == "object" && o.isg_insTag_Control;
	},

	getParam : function(name, default_value, strip_whitespace, split_chr) {
		var value = (typeof(this.settings[name]) == "undefined") ? default_value : this.settings[name];

		// Fix bool values
		if (value == "true" || value == "false")
			return (value == "true");

		if (strip_whitespace)
			value = g_insTag.regexpReplace(value, "[ \t\r\n]", "");

		if (typeof(split_chr) != "undefined" && split_chr != null) {
			value = value.split(split_chr);
			var outArray = new Array();

			for (var i=0; i<value.length; i++) {
				if (value[i] && value[i] != "")
					outArray[outArray.length] = value[i];
			}

			value = outArray;
		}

		return value;
	},

	entityDecode : function(s) {
		var e = document.createElement("div");

		e.innerHTML = s;

		return e.firstChild.nodeValue;
	},

	getLang : function(name, default_value, parse_entities, va) {
		var v = (typeof(g_insTagLang[name]) == "undefined") ? default_value : g_insTagLang[name], n;

		if (parse_entities)
			v = g_insTagLang.entityDecode(v);

		if (va) {
			for (n in va)
				v = this.replaceVar(v, n, va[n]);
		}

		return v;
	},

	addToLang : function(prefix, ar) {
		for (var key in ar) {
			if (typeof(ar[key]) == 'function')
				continue;

			g_insTagLang[(key.indexOf('lang_') == -1 ? 'lang_' : '') + (prefix != '' ? (prefix + "_") : '') + key] = ar[key];
		}

		this.loadNextScript();
	},

	getOuterHTML : function(e) {
		if (g_insTag.isIE)
			return e.outerHTML;

		var d = e.ownerDocument.createElement("body");
		d.appendChild(e.cloneNode(true));
		return d.innerHTML;
	},

	setOuterHTML : function(e, h, d) {
		var d = typeof(d) == "undefined" ? e.ownerDocument : d, i, nl, t;

		if (g_insTag.isIE && e.nodeType == 1)
			e.outerHTML = h;
		else {
			t = d.createElement("body");
			t.innerHTML = h;

			for (i=0, nl=t.childNodes; i<nl.length; i++)
				e.parentNode.insertBefore(nl[i].cloneNode(true), e);

			e.parentNode.removeChild(e);
		}
	},

	importThemeLanguagePack : function(name) {
		if (typeof(name) == "undefined")
			name = g_insTag.settings['theme'];

		g_insTag.loadScript(g_insTag.baseURL + '/themes/' + name + '/langs/' + g_insTag.settings['language'] + '.js');
	},

	replaceVar : function(h, r, v) {
		return h.replace(new RegExp('{\\\$' + r + '}', 'g'), v);
	},

	openWindow : function(template, args) {
		var html, width, height, x, y, resizable, scrollbars, url;

		args['template_file'] = template['file'];
		args['width'] = template['width'];
		args['height'] = template['height'];
		g_insTag.windowArgs = args;

		html = template['html'];
		if (!(width = parseInt(template['width'])))
			width = 320;

		if (!(height = parseInt(template['height'])))
			height = 200;

		// Add to height in M$ due to SP2 WHY DON'T YOU GUYS IMPLEMENT innerWidth of windows!!
		if (g_insTag.isIE)
			height += 40;
		else
			height += 20;

		x = parseInt(screen.width / 2.0) - (width / 2.0);
		y = parseInt(screen.height / 2.0) - (height / 2.0);

		resizable = (args && args['resizable']) ? args['resizable'] : "no";
		scrollbars = (args && args['scrollbars']) ? args['scrollbars'] : "no";

		if (template['file'].charAt(0) != '/' && template['file'].indexOf('://') == -1)
			url = g_insTag.baseURL + "/themes/" + g_insTag.getParam("theme") + "/" + template['file'];
		else
			url = template['file'];

		// Replace all args as variables in URL
		for (var name in args) {
			if (typeof(args[name]) == 'function')
				continue;

			url = g_insTag.replaceVar(url, name, escape(args[name]));
		}

		if (html) {
			html = g_insTag.replaceVar(html, "css", this.settings['popups_css']);
			html = g_insTag.applyTemplate(html, args);

			var win = window.open("", "popup" + new Date().getTime(), "top=" + y + ",left=" + x + ",scrollbars=" + scrollbars + ",dialog=yes,minimizable=" + resizable + ",modal=yes,width=" + width + ",height=" + height + ",resizable=" + resizable);
			if (win == null) {
				alert(g_insTagLang['lang_popup_blocked']);
				return;
			}

			win.document.write(html);
			win.document.close();
			win.resizeTo(width, height);
			win.focus();
		} else {
			if ((g_insTag.isRealIE) && resizable != 'yes' && g_insTag.settings["dialog_type"] == "modal") {
				height += 10;

				var features = "resizable:" + resizable 
					+ ";scroll:"
					+ scrollbars + ";status:yes;center:yes;help:no;dialogWidth:"
					+ width + "px;dialogHeight:" + height + "px;";

				window.showModalDialog(url, window, features);
			} else {
				var modal = (resizable == "yes") ? "no" : "yes";

				if (g_insTag.isGecko && g_insTag.isMac)
					modal = "no";

				if (template['close_previous'] != "no")
					try {g_insTag.lastWindow.close();} catch (ex) {}

				var win = window.open(url, "popup" + new Date().getTime(), "top=" + y + ",left=" + x + ",scrollbars=" + scrollbars + ",dialog=" + modal + ",minimizable=" + resizable + ",modal=" + modal + ",width=" + width + ",height=" + height + ",resizable=" + resizable);
				if (win == null) {
					alert(g_insTagLang['lang_popup_blocked']);
					return;
				}

				if (template['close_previous'] != "no")
					g_insTag.lastWindow = win;

				eval('try { win.resizeTo(width, height); } catch(e) { }');

				// Make it bigger if statusbar is forced
				if (g_insTag.isGecko) {
					if (win.document.defaultView.statusbar.visible)
						win.resizeBy(0, g_insTag.isMac ? 10 : 24);
				}

				win.focus();
			}
		}
	},

	closeWindow : function(win) {
		win.close();
	},

	getAttrib : function(e, n, d) {
		if (typeof(d) == "undefined")
			d = "";

		if (!e || e.nodeType != 1)
			return d;

		var v = e.getAttribute(n, 0);

		if (n == "class" && !v)
			v = e.className;

		if (this.isIE && n == "http-equiv")
			v = e.httpEquiv;

		if (this.isIE && e.nodeName == "FORM" && n == "enctype" && v == "application/x-www-form-urlencoded")
			v = "";

		if (this.isIE && e.nodeName == "INPUT" && n == "size" && v == "20")
			v = "";

		if (this.isIE && e.nodeName == "INPUT" && n == "maxlength" && v == "2147483647")
			v = "";

		if (n == "style" && !g_insTag.isOpera)
			v = e.style.cssText;

		return (v && v != "") ? '' + v : d;
	},

	getWindowArg : function(n, d) {
		return (typeof(this.windowArgs[n]) == "undefined") ? d : this.windowArgs[n];
	}
};

InsTag_Engine.prototype.addEvent = function(o, n, h) {
	// Add cleanup for all non unload events
	if (n != 'unload') {
		function clean() {
			var ex;

			try {
				g_insTag.removeEvent(o, n, h);
				g_insTag.removeEvent(window, 'unload', clean);
				o = n = h = null;
			} catch (ex) {
				// IE may produce access denied exception on unload
			}
		}

		// Add memory cleaner
		g_insTag.addEvent(window, 'unload', clean);
	}

	if (o.attachEvent)
		o.attachEvent("on" + n, h);
	else
		o.addEventListener(n, h, false);
};

InsTag_Engine.prototype.removeEvent = function(o, n, h) {
	if (o.detachEvent)
		o.detachEvent("on" + n, h);
	else
		o.removeEventListener(n, h, false);
};

// ¥°¥í¡¼¥Ð¥ëÊÑ¿ô
var g_insTag = new InsTag_Engine();
var g_insTagLang = {};

InsTag_Engine.prototype.debug = function() {
	var m = "", a, i, l = g_insTag.log.length;

	for (i=0, a = this.debug.arguments; i<a.length; i++) {
		m += a[i];

		if (i<a.length-1)
			m += ', ';
	}

	if (l < 1000)
		g_insTag.log[l] = "[debug] " + m;
};

/**
* ¥Æ¥­¥¹¥È¥¨¥ê¥¢¤Ø¤Î¥¿¥°¤ÎÁÞÆþ
*
* @param object form_element_name	¥¨¥ì¥á¥ó¥ÈÌ¾
* @param string tagOpen				³«»Ï¥¿¥°
* @param string tagClose			½ªÎ»¥¿¥°
* @param string sampleText			Ì¤ÁªÂò¤Î¾ì¹ç¤Î¥µ¥ó¥×¥ëÊ¸»úÎó
* @return void
*
* @note
* ¡ÖtagOpen + ÁªÂòÉôÊ¬ + tagClose¡×¤È¤Ê¤ë¡£
* Ì¤ÁªÂò¤Î¾ì¹ç¤Ï¡¢¡ÖtagOpen + sampleText + tagClose¡×¤È¤Ê¤ë¡£
*/
InsTag_Engine.prototype.insTag = function(form_element_name, tagOpen, tagClose, sampleText) {
	var textarea = this.getTextareaObj(form_element_name);

	// IE
	if (g_insTag.isIE) {
		var theSelection = document.selection.createRange().text;
		if (!theSelection) { theSelection=sampleText;}
		textarea.focus();
		if (theSelection.charAt(theSelection.length - 1) == " ") {
			// exclude ending space char, if any
			theSelection = theSelection.substring(0, theSelection.length - 1);
			document.selection.createRange().text = tagOpen + theSelection + tagClose + " ";
		} else {
			document.selection.createRange().text = tagOpen + theSelection + tagClose;
		}

	// Gecko
	} else if(g_insTag.isGecko) {
 		var startPos = textarea.selectionStart;
		var endPos = textarea.selectionEnd;
		var scrollTop=textarea.scrollTop;
		var myText = (textarea.value).substring(startPos, endPos);
		if(!myText) { myText=sampleText;}
		if(myText.charAt(myText.length - 1) == " "){ // exclude ending space char, if any
			subst = tagOpen + myText.substring(0, (myText.length - 1)) + tagClose + " ";
		} else {
			subst = tagOpen + myText + tagClose;
		}
		textarea.value = textarea.value.substring(0, startPos) + subst +
			textarea.value.substring(endPos, textarea.value.length);
		textarea.focus();

		var cPos=startPos+(tagOpen.length+myText.length+tagClose.length);
		textarea.selectionStart=cPos;
		textarea.selectionEnd=cPos;
		textarea.scrollTop=scrollTop;

	// All others
	} else {
		var alertText=g_insTagLang['lang_insText'];
		var re1=new RegExp("\\$1","g");
		var re2=new RegExp("\\$2","g");
		alertText=alertText.replace(re1,sampleText);
		alertText=alertText.replace(re2,tagOpen+sampleText+tagClose);
		var text;
		if (sampleText) {
			text=prompt(alertText);
		} else {
			text="";
		}
		if(!text) { text=sampleText;}
		text=tagOpen+text+tagClose;
		textarea.value = textarea.value + text;
		textarea.focus();
	}
	// reposition cursor if possible
	if (textarea.createTextRange) textarea.caretPos = document.selection.createRange().duplicate();
};

/// TEXTAREA¥ª¥Ö¥¸¥§¥¯¥È¤Î¼èÆÀ
InsTag_Engine.prototype.getTextareaObj = function(form_element_name) {
	var textarea = '';
	if (g_insTag.isIE) {
		// IE6.0SP2, Opera9.10 ¤Ç°Ê²¼¤Î¤è¤¦¤Ê¾ì¹ç¤Ë getElementById("msg") ¤¬input¤ÎÊý¤Î¥ª¥Ö¥¸¥§¥¯¥È¤òÊÖ¤·¤Æ¤·¤Þ¤¦ÉÔ¶ñ¹ç¤¬¤¢¤ë¡£
		// <input type="text"   name="msg" id="_p_comment_comment_0" size="70" />
		// <textarea name="msg" id="msg" rows="20" cols="80">#comment</textarea>
	}else{
		textarea = document.getElementById(form_element_name);
	}

	if(!textarea){
		var elements = document.getElementsByName(form_element_name);
		for(i=0; i<elements.length; i++){
			if(elements[i].nodeName == 'TEXTAREA' && elements[i].name == form_element_name){
				textarea = elements[i];
			}
		}
	}

	return textarea;
};

/// ²þ¹Ô¥³¡¼¥É¤ÎÀµµ¬²½
InsTag_Engine.prototype.normalize_crlf = function(str) {
	if( str == null ) return str;
	str = str.replace(/\r\n/g, "\n");
	str = str.replace(/\r/g, "\n");
	return str;
};

/// Ê£¿ô¹Ô¤ÎÁÞÆþ
InsTag_Engine.prototype.insTagMultiLine = function(form_element_name, tagOpen, tagClose) {
	this.innerTagMultiLine(form_element_name, "ins", tagOpen, tagClose);
};

/// Ê£¿ô¹Ô¤Îºï½ü
InsTag_Engine.prototype.removeTagMultiLine = function(form_element_name, tagOpen, tagClose) {
	this.innerTagMultiLine(form_element_name, "remove", tagOpen, tagClose);
};

/// Ê£¿ô¹Ô¤Î½èÍý
InsTag_Engine.prototype.innerTagMultiLine = function(form_element_name, mode, tagOpen, tagClose) {
	var textarea = this.getTextareaObj(form_element_name);
	var scrollY = textarea.scrollTop;
	var startPos = textarea.selectionStart;
	var endPos   = textarea.selectionEnd;
	var selected_str = null;
	var selected_obj = null;
	
	// ÁªÂòÈÏ°Ï¤ÎÃê½Ð
	if( g_insTag.isGecko ){
		selected_str = (textarea.value).substring(startPos,endPos);
		selected_obj = (textarea.value);
	}else if( g_insTag.isIE ){
		selected_str = document.selection.createRange().text;
		selected_obj = document.selection.createRange();
	}else{
		alert(g_insTagLang['lang_noPartialEdit']);
		return;
	}

	if (selected_str == ""){ // ¶õ¹Ô
		switch(mode){
		case "ins":
			break;
		case "remove":
			break;
		}
		return;
	}
	
	// ¹ÔÆ¬¤Î½èÍý
	if( g_insTag.isGecko ){
		var beforeStr = (textarea.value).substring(0, startPos);
		var afterStr  = (textarea.value).substring(endPos, textarea.textLength);
		switch(mode){
		case "ins":
			(textarea.value) = beforeStr + selected_str.replace(/^/mg, tagOpen) + afterStr;
			break;
		case "remove":
			(textarea.value) = beforeStr + eval('selected_str.replace(/^\\' + tagOpen + '/mg, "");') + afterStr;
			break;
		}
		return;
	}else{
		switch(mode){
		case "ins":
			selected_obj.text = this.normalize_crlf(selected_obj.text).replace(/^/mg, tagOpen);
			break;
		case "remove":
			selected_obj.text = eval('this.normalize_crlf(selected_obj.text).replace(/^\\' + tagOpen + '/mg, "");');
			break;
		}
	}

	textarea.scrollTop = scrollY;
	if( g_insTag.isGecko ){
		textarea.selectionStart = startPos;
		textarea.selectionEnd = endPos;
	}
	textarea.focus();
};
