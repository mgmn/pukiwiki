// Some global instances, this will be filled later
var g_insTag = null, g_insTagLang = null;

function g_insTag_Popup() {
};

g_insTag_Popup.prototype = {
	findWin : function(w) {
		var c;

		// Check parents
		c = w;
		while (c && (c = c.parent) != null) {
			if (typeof(c.g_insTag) != "undefined")
				return c;
		}

		// Check openers
		c = w;
		while (c && (c = c.opener) != null) {
			if (typeof(c.g_insTag) != "undefined")
				return c;
		}

		// Try top
		if (typeof(top.g_insTag) != "undefined")
			return top;

		return null;
	},

	init : function() {
		var win = window.opener ? window.opener : window.dialogArguments, c;
		var inst;

		if (!win)
			win = this.findWin(window);

		if (!win) {
			alert("g_insTag object reference not found from popup.");
			return;
		}

		window.opener = win;
		this.windowOpener = win;
		this.onLoadEval = "";

		// Setup parent references
		g_insTag = win.g_insTag;
		g_insTagLang = win.g_insTagLang;

		inst = g_insTag.selectedInstance;
		this.isWindow = g_insTag.getWindowArg('inside_iframe', false) == false;
		this.storeSelection = (g_insTag.isRealIE) && !this.isWindow && g_insTag.getWindowArg('store_selection', true);

		if (this.isWindow)
			window.focus();

		// Store selection
		if (this.storeSelection)
			inst.selectionBookmark = inst.selection.getBookmark(true);

		// Setup dir
		if (g_insTagLang['lang_dir'])
			document.dir = g_insTagLang['lang_dir'];

		// Setup title
		var re = new RegExp('{|\\\$|}', 'g');
		var title = document.title.replace(re, "");
		if (typeof g_insTagLang[title] != "undefined") {
			var divElm = document.createElement("div");
			divElm.innerHTML = g_insTagLang[title];
			document.title = divElm.innerHTML;

			if (g_insTag.setWindowTitle != null)
				g_insTag.setWindowTitle(window, divElm.innerHTML);
		}

		// Output Popup CSS class
		document.write('<link href="' + g_insTag.getParam("popups_css") + '" rel="stylesheet" type="text/css">');

		if (g_insTag.getParam("popups_css_add")) {
			c = g_insTag.getParam("popups_css_add");

			// Is relative
			if (c.indexOf('://') == -1 && c.charAt(0) != '/')
				c = g_insTag.documentBasePath + "/" + c;

			document.write('<link href="' + c + '" rel="stylesheet" type="text/css">');
		}

		g_insTag.addEvent(window, "load", this.onLoad);
	},

	onLoad : function() {
		var dir, i, elms, body = document.body;

		if (body.style.display == 'none')
			body.style.display = 'block';

		// Execute real onload (Opera fix)
		if (g_insTagPopup.onLoadEval != "")
			eval(g_insTagPopup.onLoadEval);
	},

	executeOnLoad : function(str) {
		if (g_insTag.isOpera)
			this.onLoadEval = str;
		else
			eval(str);
	},

	resizeToInnerSize : function() {
		// Netscape 7.1 workaround
		if (this.isWindow && g_insTag.isNS71) {
			window.resizeBy(0, 10);
			return;
		}

		if (this.isWindow) {
			var doc = document;
			var body = doc.body;
			var oldMargin, wrapper, iframe, nodes, dx, dy;

			if (body.style.display == 'none')
				body.style.display = 'block';

			// Remove margin
			oldMargin = body.style.margin;
			body.style.margin = '0';

			// Create wrapper
			wrapper = doc.createElement("div");
			wrapper.id = 'mcBodyWrapper';
			wrapper.style.display = 'none';
			wrapper.style.margin = '0';

			// Wrap body elements
			nodes = doc.body.childNodes;
			for (var i=nodes.length-1; i>=0; i--) {
				if (wrapper.hasChildNodes())
					wrapper.insertBefore(nodes[i].cloneNode(true), wrapper.firstChild);
				else
					wrapper.appendChild(nodes[i].cloneNode(true));

				nodes[i].parentNode.removeChild(nodes[i]);
			}

			// Add wrapper
			doc.body.appendChild(wrapper);

			// Create iframe
			iframe = document.createElement("iframe");
			iframe.id = "mcWinIframe";
			iframe.src = document.location.href.toLowerCase().indexOf('https') == -1 ? "about:blank" : g_insTag.settings['default_document'];
			iframe.width = "100%";
			iframe.height = "100%";
			iframe.style.margin = '0';

			// Add iframe
			doc.body.appendChild(iframe);

			// Measure iframe
			iframe = document.getElementById('mcWinIframe');
			dx = g_insTag.getWindowArg('width') - iframe.clientWidth;
			dy = g_insTag.getWindowArg('height') - iframe.clientHeight;

			// Resize window
			window.resizeBy(dx, dy);

			// Hide iframe and show wrapper
			body.style.margin = oldMargin;
			iframe.style.display = 'none';
			wrapper.style.display = 'block';
		}
	},

	resizeToContent : function() {
		var isMSIE = (navigator.appName == "Microsoft Internet Explorer");
		var isOpera = (navigator.userAgent.indexOf("Opera") != -1);

		if (isOpera)
			return;

		if (isMSIE) {
			try { window.resizeTo(10, 10); } catch (e) {}

			var elm = document.body;
			var width = elm.offsetWidth;
			var height = elm.offsetHeight;
			var dx = (elm.scrollWidth - width) + 4;
			var dy = elm.scrollHeight - height;

			try { window.resizeBy(dx, dy); } catch (e) {}
		} else {
			window.scrollBy(1000, 1000);
			if (window.scrollX > 0 || window.scrollY > 0) {
				window.resizeBy(window.innerWidth * 2, window.innerHeight * 2);
				window.sizeToContent();
				window.scrollTo(0, 0);
				var x = parseInt(screen.width / 2.0) - (window.outerWidth / 2.0);
				var y = parseInt(screen.height / 2.0) - (window.outerHeight / 2.0);
				window.moveTo(x, y);
			}
		}
	},

	getWindowArg : function(name, default_value) {
		return g_insTag.getWindowArg(name, default_value);
	},

	restoreSelection : function() {
		if (this.storeSelection) {
			var inst = g_insTag.selectedInstance;

			inst.getWin().focus();

			if (inst.selectionBookmark)
				inst.selection.moveToBookmark(inst.selectionBookmark);
		}
	},

	close : function() {
		g_insTag.closeWindow(window);
	},

	openBrowser : function(element_id, type, option) {
		var cb = g_insTag.getParam(option, g_insTag.getParam("file_browser_callback"));
		var url = document.getElementById(element_id).value;

		g_insTag.setWindowArg("window", window);
		g_insTag.setWindowArg("document", document);

		// Call to external callback
		if (eval('typeof(g_insTagPopup.windowOpener.' + cb + ')') == "undefined")
			alert("Callback function: " + cb + " could not be found.");
		else
			eval("g_insTagPopup.windowOpener." + cb + "(element_id, url, type, window);");
	},

	importClass : function(c) {
		window[c] = function() {};

		for (var n in window.opener[c].prototype)
			window[c].prototype[n] = window.opener[c].prototype[n];

		window[c].constructor = window.opener[c].constructor;
	}

	};

// Setup global instance
var g_insTagPopup = new g_insTag_Popup();

g_insTagPopup.init();
