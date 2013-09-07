/** @license Hyphenator 3.3.0 - client side hyphenation for webbrowsers
 *  Copyright (C) 2011  Mathias Nater, Zürich (mathias at mnn dot ch)
 *  Project and Source hosted on http://code.google.com/p/hyphenator/
 * 
 *  This JavaScript code is free software: you can redistribute
 *  it and/or modify it under the terms of the GNU Lesser
 *  General Public License (GNU LGPL) as published by the Free Software
 *  Foundation, either version 3 of the License, or (at your option)
 *  any later version.  The code is distributed WITHOUT ANY WARRANTY;
 *  without even the implied warranty of MERCHANTABILITY or FITNESS
 *  FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 *  As additional permission under GNU GPL version 3 section 7, you
 *  may distribute non-source (e.g., minimized or compacted) forms of
 *  that code without the copy of the GNU GPL normally required by
 *  section 4, provided you include this license notice and a URL
 *  through which recipients can access the Corresponding Source.
 */
 
/* 
 *  Comments are jsdoctoolkit formatted. See http://code.google.com/p/jsdoc-toolkit/
 */
 
/* The following comment is for JSLint: */
/*global window, ActiveXObject, unescape */
/*jslint white: true, browser: true, onevar: true, undef: true, nomen: true, eqeqeq: true, regexp: true, sub: true, newcap: true, immed: true, evil: true, eqeqeq: false */


/**
 * @constructor
 * @description Provides all functionality to do hyphenation, except the patterns that are loaded
 * externally.
 * @author Mathias Nater, <a href = "mailto:mathias@mnn.ch">mathias@mnn.ch</a>
 * @version 3.3.0
 * @namespace Holds all methods and properties
 * @example
 * &lt;script src = "Hyphenator.js" type = "text/javascript"&gt;&lt;/script&gt;
 * &lt;script type = "text/javascript"&gt;
 *   Hyphenator.run();
 * &lt;/script&gt;
 */
var Hyphenator = (function (window) {

	var
	/**
	 * @name Hyphenator-supportedLang
	 * @description
	 * A key-value object that stores supported languages.
	 * The key is the bcp47 code of the language and the value
	 * is the (abbreviated) filename of the pattern file.
	 * @type {Object.<string, string>}
	 * @private
	 * @example
	 * Check if language lang is supported:
	 * if (supportedLang.hasOwnProperty(lang))
	 */
	supportedLang = {
		'be': 'be.js',
		'ca': 'ca.js',
		'cs': 'cs.js',
		'da': 'da.js',
		'bn': 'bn.js',
		'de': 'de.js',
		'el': 'el-monoton.js',
		'el-monoton': 'el-monoton.js',
		'el-polyton': 'el-polyton.js',
		'en': 'en-us.js',
		'en-gb': 'en-gb.js',
		'en-us': 'en-us.js',
		'es': 'es.js',
		'fi': 'fi.js',
		'fr': 'fr.js',
		'grc': 'grc.js',
		'gu': 'gu.js',
		'hi': 'hi.js',
		'hu': 'hu.js',
		'hy': 'hy.js',
		'it': 'it.js',
		'kn': 'kn.js',
		'la': 'la.js',
		'lt': 'lt.js',
		'lv': 'lv.js',
		'ml': 'ml.js',
		'no': 'no-nb.js',
		'no-nb': 'no-nb.js',
		'nl': 'nl.js',
		'or': 'or.js',
		'pa': 'pa.js',
		'pl': 'pl.js',
		'pt': 'pt.js',
		'ru': 'ru.js',
		'sl': 'sl.js',
		'sv': 'sv.js',
		'ta': 'ta.js',
		'te': 'te.js',
		'tr': 'tr.js',
		'uk': 'uk.js'
	},

	/**
	 * @name Hyphenator-languageHint
	 * @description
	 * An automatically generated string to be displayed in a prompt if the language can't be guessed.
	 * The string is generated using the supportedLang-object.
	 * @see Hyphenator-supportedLang
	 * @type {string}
	 * @private
	 * @see Hyphenator-autoSetMainLanguage
	 */

	languageHint = (function () {
		var k, r = '';
		for (k in supportedLang) {
			if (supportedLang.hasOwnProperty(k)) {
				r += k + ', ';
			}
		}
		r = r.substring(0, r.length - 2);
		return r;
	}()),
	
	/**
	 * @name Hyphenator-prompterStrings
	 * @description
	 * A key-value object holding the strings to be displayed if the language can't be guessed
	 * If you add hyphenation patterns change this string.
	 * @type {Object.<string,string>}
	 * @private
	 * @see Hyphenator-autoSetMainLanguage
	 */	
	prompterStrings = {
		'be': 'Мова гэтага сайта не можа быць вызначаны аўтаматычна. Калі ласка пакажыце мову:',
		'cs': 'Jazyk této internetové stránky nebyl automaticky rozpoznán. Určete prosím její jazyk:',
		'da': 'Denne websides sprog kunne ikke bestemmes. Angiv venligst sprog:',
		'de': 'Die Sprache dieser Webseite konnte nicht automatisch bestimmt werden. Bitte Sprache angeben:',
		'en': 'The language of this website could not be determined automatically. Please indicate the main language:',
		'es': 'El idioma del sitio no pudo determinarse autom%E1ticamente. Por favor, indique el idioma principal:',
		'fi': 'Sivun kielt%E4 ei tunnistettu automaattisesti. M%E4%E4rit%E4 sivun p%E4%E4kieli:',
		'fr': 'La langue de ce site n%u2019a pas pu %EAtre d%E9termin%E9e automatiquement. Veuillez indiquer une langue, s.v.p.%A0:',
		'hu': 'A weboldal nyelvét nem sikerült automatikusan megállapítani. Kérem adja meg a nyelvet:',
		'hy': 'Չհաջողվեց հայտնաբերել այս կայքի լեզուն։ Խնդրում ենք նշեք հիմնական լեզուն՝',
		'it': 'Lingua del sito sconosciuta. Indicare una lingua, per favore:',
		'kn': 'ಜಾಲ ತಾಣದ ಭಾಷೆಯನ್ನು ನಿರ್ಧರಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ಮುಖ್ಯ ಭಾಷೆಯನ್ನು ಸೂಚಿಸಿ:',
		'lt': 'Nepavyko automatiškai nustatyti šios svetainės kalbos. Prašome įvesti kalbą:',
		'lv': 'Šīs lapas valodu nevarēja noteikt automātiski. Lūdzu norādiet pamata valodu:',
		'ml': 'ഈ വെ%u0D2C%u0D4D%u200Cസൈറ്റിന്റെ ഭാഷ കണ്ടുപിടിയ്ക്കാ%u0D28%u0D4D%u200D കഴിഞ്ഞില്ല. ഭാഷ ഏതാണെന്നു തിരഞ്ഞെടുക്കുക:',
		'nl': 'De taal van deze website kan niet automatisch worden bepaald. Geef de hoofdtaal op:',
		'no': 'Nettstedets språk kunne ikke finnes automatisk. Vennligst oppgi språk:',
		'pt': 'A língua deste site não pôde ser determinada automaticamente. Por favor indique a língua principal:',
		'ru': 'Язык этого сайта не может быть определен автоматически. Пожалуйста укажите язык:',
		'sl': 'Jezika te spletne strani ni bilo mogoče samodejno določiti. Prosim navedite jezik:',
		'sv': 'Spr%E5ket p%E5 den h%E4r webbplatsen kunde inte avg%F6ras automatiskt. V%E4nligen ange:',
		'tr': 'Bu web sitesinin dili otomatik olarak tespit edilememiştir. Lütfen dökümanın dilini seçiniz%A0:',
		'uk': 'Мова цього веб-сайту не може бути визначена автоматично. Будь ласка, вкажіть головну мову:'
	},
	
	/**
	 * @name Hyphenator-basePath
	 * @description
	 * A string storing the basepath from where Hyphenator.js was loaded.
	 * This is used to load the patternfiles.
	 * The basepath is determined dynamically by searching all script-tags for Hyphenator.js
	 * If the path cannot be determined http://hyphenator.googlecode.com/svn/trunk/ is used as fallback.
	 * @type {string}
	 * @private
	 * @see Hyphenator-loadPatterns
	 */
	basePath = (function () {
		var s = document.getElementsByTagName('script'), i = 0, p, src, t;
		while (!!(t = s[i++])) {
			if (!t.src) {
				continue;
			}
			src = t.src;
			p = src.indexOf('Hyphenator.js');
			if (p !== -1) {
				return src.substring(0, p);
			}
		}
		return 'http://hyphenator.googlecode.com/svn/trunk/';
	}()),

	/**
	 * @name Hyphenator-isLocal
	 * @description
	 * isLocal is true, if Hyphenator is loaded from the same domain, as the webpage, but false, if
	 * it's loaded from an external source (i.e. directly from google.code)
	 */
	isLocal = (function () {
		var re = false;
		if (window.location.href.indexOf(basePath) !== -1) {
			re = true;
		}
		return re;
	}()),
	
	/**
	 * @name Hyphenator-documentLoaded
	 * @description
	 * documentLoaded is true, when the DOM has been loaded. This is set by runOnContentLoaded
	 */
	documentLoaded = false,
	documentCount = 0,
	
	/**
	 * @name Hyphenator-persistentConfig
	 * @description
	 * if persistentConfig is set to true (defaults to false), config options and the state of the 
	 * toggleBox are stored in DOM-storage (according to the storage-setting). So they haven't to be
	 * set for each page.
	 */	
	persistentConfig = false,	

	/**
	 * @name Hyphenator-contextWindow
	 * @description
	 * contextWindow stores the window for the document to be hyphenated.
	 * If there are frames this will change.
	 * So use contextWindow instead of window!
	 */
	contextWindow = window,

	/**
	 * @name Hyphenator-doFrames
	 * @description
	 * switch to control if frames/iframes should be hyphenated, too
	 * defaults to false (frames are a bag of hurt!)
	 */
	doFrames = false,
	
	/**
	 * @name Hyphenator-dontHyphenate
	 * @description
	 * A key-value object containing all html-tags whose content should not be hyphenated
	 * @type {Object.<string,boolean>}
	 * @private
	 * @see Hyphenator-hyphenateElement
	 */
	dontHyphenate = {'script': true, 'code': true, 'pre': true, 'img': true, 'br': true, 'samp': true, 'kbd': true, 'var': true, 'abbr': true, 'acronym': true, 'sub': true, 'sup': true, 'button': true, 'option': true, 'label': true, 'textarea': true, 'input': true},

	/**
	 * @name Hyphenator-enableCache
	 * @description
	 * A variable to set if caching is enabled or not
	 * @type boolean
	 * @default true
	 * @private
	 * @see Hyphenator.config
	 * @see hyphenateWord
	 */
	enableCache = true,

	/**
	 * @name Hyphenator-storageType
	 * @description
	 * A variable to define what html5-DOM-Storage-Method is used ('none', 'local' or 'session')
	 * @type {string}
	 * @default 'none'
	 * @private
	 * @see Hyphenator.config
	 */	
	storageType = 'local',

	/**
	 * @name Hyphenator-storage
	 * @description
	 * An alias to the storage-Method defined in storageType.
	 * Set by Hyphenator.run()
	 * @type {Object|undefined}
	 * @default null
	 * @private
	 * @see Hyphenator.run
	 */	
	storage,
	
	/**
	 * @name Hyphenator-enableReducedPatternSet
	 * @description
	 * A variable to set if storing the used patterns is set
	 * @type boolean
	 * @default false
	 * @private
	 * @see Hyphenator.config
	 * @see hyphenateWord
	 * @see Hyphenator.getRedPatternSet
	 */	
	enableReducedPatternSet = false,
	
	/**
	 * @name Hyphenator-enableRemoteLoading
	 * @description
	 * A variable to set if pattern files should be loaded remotely or not
	 * @type boolean
	 * @default true
	 * @private
	 * @see Hyphenator.config
	 * @see Hyphenator-loadPatterns
	 */
	enableRemoteLoading = true,
	
	/**
	 * @name Hyphenator-displayToggleBox
	 * @description
	 * A variable to set if the togglebox should be displayed or not
	 * @type boolean
	 * @default false
	 * @private
	 * @see Hyphenator.config
	 * @see Hyphenator-toggleBox
	 */
	displayToggleBox = false,
	
	/**
	 * @name Hyphenator-hyphenateClass
	 * @description
	 * A string containing the css-class-name for the hyphenate class
	 * @type {string}
	 * @default 'hyphenate'
	 * @private
	 * @example
	 * &lt;p class = "hyphenate"&gt;Text&lt;/p&gt;
	 * @see Hyphenator.config
	 */
	hyphenateClass = 'hyphenate',

	/**
	 * @name Hyphenator-dontHyphenateClass
	 * @description
	 * A string containing the css-class-name for elements that should not be hyphenated
	 * @type {string}
	 * @default 'donthyphenate'
	 * @private
	 * @example
	 * &lt;p class = "donthyphenate"&gt;Text&lt;/p&gt;
	 * @see Hyphenator.config
	 */
	dontHyphenateClass = 'donthyphenate',
	
	/**
	 * @name Hyphenator-min
	 * @description
	 * A number wich indicates the minimal length of words to hyphenate.
	 * @type {number}
	 * @default 6
	 * @private
	 * @see Hyphenator.config
	 */	
	min = 6,
	
	/**
	 * @name Hyphenator-orphanControl
	 * @description
	 * Control how the last words of a line are handled:
	 * level 1 (default): last word is hyphenated
	 * level 2: last word is not hyphenated
	 * level 3: last word is not hyphenated and last space is non breaking
	 * @type {number}
	 * @default 1
	 * @private
	 */
	orphanControl = 1,
	
	/**
	 * @name Hyphenator-isBookmarklet
	 * @description
	 * Indicates if Hyphanetor runs as bookmarklet or not.
	 * @type boolean
	 * @default false
	 * @private
	 */	
	isBookmarklet = (function () {
		var loc = null, re = false, jsArray = document.getElementsByTagName('script'), i, l;
		for (i = 0, l = jsArray.length; i < l; i++) {
			if (!!jsArray[i].getAttribute('src')) {
				loc = jsArray[i].getAttribute('src');
			}
			if (!loc) {
				continue;
			} else if (loc.indexOf('Hyphenator.js?bm=true') !== -1) {
				re = true;
			}
		}
		return re;
	}()),
	
	/**
	 * @name Hyphenator-mainLanguage
	 * @description
	 * The general language of the document. In contrast to {@link Hyphenator-defaultLanguage},
	 * mainLanguage is defined by the client (i.e. by the html or by a prompt).
	 * @type {string|null}
	 * @private
	 * @see Hyphenator-autoSetMainLanguage
	 */	
	mainLanguage = null,

	/**
	 * @name Hyphenator-defaultLanguage
	 * @description
	 * The language defined by the developper. This language setting is defined by a config option.
	 * It is overwritten by any html-lang-attribute and only taken in count, when no such attribute can
	 * be found (i.e. just before the prompt).
	 * @type {string|null}
	 * @private
	 * @see Hyphenator-autoSetMainLanguage
	 */	
	defaultLanguage = '',

	/**
	 * @name Hyphenator-elements
	 * @description
	 * An array holding all elements that have to be hyphenated. This var is filled by
	 * {@link Hyphenator-gatherDocumentInfos}
	 * @type {Array}
	 * @private
	 */	
	elements = [],
	
	/**
	 * @name Hyphenator-exceptions
	 * @description
	 * An object containing exceptions as comma separated strings for each language.
	 * When the language-objects are loaded, their exceptions are processed, copied here and then deleted.
	 * @see Hyphenator-prepareLanguagesObj
	 * @type {Object}
	 * @private
	 */	
	exceptions = {},
	
	countObjProps = function (obj) {
		var k, l = 0;
		for (k in obj) {
			if (obj.hasOwnProperty(k)) {
				l++;
			}
		}
		return l;
	},
	/**
	 * @name Hyphenator-docLanguages
	 * @description
	 * An object holding all languages used in the document. This is filled by
	 * {@link Hyphenator-gatherDocumentInfos}
	 * @type {Object}
	 * @private
	 */	
	docLanguages = {},


	/**
	 * @name Hyphenator-state
	 * @description
	 * A number that inidcates the current state of the script
	 * 0: not initialized
	 * 1: loading patterns
	 * 2: ready
	 * 3: hyphenation done
	 * 4: hyphenation removed
	 * @type {number}
	 * @private
	 */	
	state = 0,

	/**
	 * @name Hyphenator-url
	 * @description
	 * A string containing a RegularExpression to match URL's
	 * @type {string}
	 * @private
	 */	
	url = '(\\w*:\/\/)?((\\w*:)?(\\w*)@)?((([\\d]{1,3}\\.){3}([\\d]{1,3}))|((www\\.|[a-zA-Z]\\.)?[a-zA-Z0-9\\-\\.]+\\.([a-z]{2,4})))(:\\d*)?(\/[\\w#!:\\.?\\+=&%@!\\-]*)*',
	//      protocoll     usr     pwd                    ip               or                          host                 tld        port               path
	/**
	 * @name Hyphenator-mail
	 * @description
	 * A string containing a RegularExpression to match mail-adresses
	 * @type {string}
	 * @private
	 */	
	mail = '[\\w-\\.]+@[\\w\\.]+',

	/**
	 * @name Hyphenator-urlRE
	 * @description
	 * A RegularExpressions-Object for url- and mail adress matching
	 * @type {RegExp}
	 * @private
	 */		
	urlOrMailRE = new RegExp('(' + url + ')|(' + mail + ')', 'i'),

	/**
	 * @name Hyphenator-zeroWidthSpace
	 * @description
	 * A string that holds a char.
	 * Depending on the browser, this is the zero with space or an empty string.
	 * zeroWidthSpace is used to break URLs
	 * @type {string}
	 * @private
	 */		
	zeroWidthSpace = (function () {
		var zws, ua = navigator.userAgent.toLowerCase();
		zws = String.fromCharCode(8203); //Unicode zero width space
		if (ua.indexOf('msie 6') !== -1) {
			zws = ''; //IE6 doesn't support zws
		}
		if (ua.indexOf('opera') !== -1 && ua.indexOf('version/10.00') !== -1) {
			zws = ''; //opera 10 on XP doesn't support zws
		}
		return zws;
	}()),
	
	/**
	 * @name Hyphenator-createElem
	 * @description
	 * A function alias to document.createElementNS or document.createElement
	 * @type {function(string, Object)}
	 * @private
	 */		
	createElem = function (tagname, context) {
		context = context || contextWindow;
		if (document.createElementNS) {
			return context.document.createElementNS('http://www.w3.org/1999/xhtml', tagname);
		} else if (document.createElement) {
			return context.document.createElement(tagname);
		}
	},
	
	/**
	 * @name Hyphenator-onHyphenationDone
	 * @description
	 * A method to be called, when the last element has been hyphenated or the hyphenation has been
	 * removed from the last element.
	 * @see Hyphenator.config
	 * @type {function()}
	 * @private
	 */		
	onHyphenationDone = function () {},

	/**
	 * @name Hyphenator-onError
	 * @description
	 * A function that can be called upon an error.
	 * @see Hyphenator.config
	 * @type {function(Object)}
	 * @private
	 */		
	onError = function (e) {
		window.alert("Hyphenator.js says:\n\nAn Error ocurred:\n" + e.message);
	},

	/**
	 * @name Hyphenator-selectorFunction
	 * @description
	 * A function that has to return a HTMLNodeList of Elements to be hyphenated.
	 * By default it uses the classname ('hyphenate') to select the elements.
	 * @see Hyphenator.config
	 * @type {function()}
	 * @private
	 */		
	selectorFunction = function () {
		var tmp, el = [], i, l;
		if (document.getElementsByClassName) {
			el = contextWindow.document.getElementsByClassName(hyphenateClass);
		} else {
			tmp = contextWindow.document.getElementsByTagName('*');
			l = tmp.length;
			for (i = 0; i < l; i++)
			{
				if (tmp[i].className.indexOf(hyphenateClass) !== -1 && tmp[i].className.indexOf(dontHyphenateClass) === -1) {
					el.push(tmp[i]);
				}
			}
		}
		return el;
	},

	/**
	 * @name Hyphenator-intermediateState
	 * @description
	 * The value of style.visibility of the text while it is hyphenated.
	 * @see Hyphenator.config
	 * @type {string}
	 * @private
	 */		
	intermediateState = 'hidden',
	
	/**
	 * @name Hyphenator-hyphen
	 * @description
	 * A string containing the character for in-word-hyphenation
	 * @type {string}
	 * @default the soft hyphen
	 * @private
	 * @see Hyphenator.config
	 */
	hyphen = String.fromCharCode(173),
	
	/**
	 * @name Hyphenator-urlhyphen
	 * @description
	 * A string containing the character for url/mail-hyphenation
	 * @type {string}
	 * @default the zero width space
	 * @private
	 * @see Hyphenator.config
	 * @see Hyphenator-zeroWidthSpace
	 */
	urlhyphen = zeroWidthSpace,

	/**
	 * @name Hyphenator-safeCopy
	 * @description
	 * Defines wether work-around for copy issues is active or not
	 * Not supported by Opera (no onCopy handler)
	 * @type boolean
	 * @default true
	 * @private
	 * @see Hyphenator.config
	 * @see Hyphenator-registerOnCopy
	 */
	safeCopy = true,
	
	/**
	 * @name Hyphenator-Expando
	 * @description
	 * This custom object stores data for elements: storing data directly in elements
	 * (DomElement.customData = foobar;) isn't a good idea. It would lead to conflicts
	 * in form elements, when the form has a child with name="foobar". Therefore, this
	 * solution follows the approach of jQuery: the data is stored in an object and
	 * referenced by a unique attribute of the element. The attribute has a name that 
	 * is built by the prefix "HyphenatorExpando_" and a random number, so if the very
	 * very rare case occurs, that there's already an attribute with the same name, a
	 * simple reload is enough to make it function.
	 * @private
	 */		
	Expando = (function () {
		var container = {},
			name = "HyphenatorExpando_" + Math.random(),
			uuid = 0;
		return {
			getDataForElem : function (elem) {
				return container[elem[name].id];
			},
			setDataForElem : function (elem, data) {
				var id;
				if (elem[name] && elem[name].id !== '') {
					id = elem[name].id;
				} else {
					id = uuid++;
					elem[name] = {'id': id}; //object needed, otherways it is reflected in HTML in IE
				}
				container[id] = data;
			},
			appendDataForElem : function (elem, data) {
				var k;
				for (k in data) {
					if (data.hasOwnProperty(k)) {
						container[elem[name].id][k] = data[k];
					}
				}
			},
			delDataOfElem : function (elem) {
				delete container[elem[name]];
			}
		};
	}()),
		
	/*
	 * runOnContentLoaded is based od jQuery.bindReady()
	 * see
	 * jQuery JavaScript Library v1.3.2
	 * http://jquery.com/
	 *
	 * Copyright (c) 2009 John Resig
	 * Dual licensed under the MIT and GPL licenses.
	 * http://docs.jquery.com/License
	 *
	 * Date: 2009-02-19 17:34:21 -0500 (Thu, 19 Feb 2009)
	 * Revision: 6246
	 */
	/**
	 * @name Hyphenator-runOnContentLoaded
	 * @description
	 * A crossbrowser solution for the DOMContentLoaded-Event based on jQuery
	 * <a href = "http://jquery.com/</a>
	 * I added some functionality: e.g. support for frames and iframes…
	 * @param {Object} w the window-object
	 * @param {function()} f the function to call onDOMContentLoaded
	 * @private
	 */
	runOnContentLoaded = function (w, f) {
		var DOMContentLoaded = function () {}, toplevel, hyphRunForThis = {};
		if (documentLoaded && !hyphRunForThis[w.location.href]) {
			f();
			hyphRunForThis[w.location.href] = true;
			return;
		}
		function init(context) {
			contextWindow = context || window;
			if (!hyphRunForThis[contextWindow.location.href] && (!documentLoaded || contextWindow != window.parent)) {
				documentLoaded = true;
				f();
				hyphRunForThis[contextWindow.location.href] = true;
			}
		}
		
		function doScrollCheck() {
			try {
				// If IE is used, use the trick by Diego Perini
				// http://javascript.nwbox.com/IEContentLoaded/
				document.documentElement.doScroll("left");
			} catch (error) {
				setTimeout(doScrollCheck, 1);
				return;
			}
		
			// and execute any waiting functions
			init(window);
		}

		function doOnLoad() {
			var i, haveAccess, fl = window.frames.length;
			if (doFrames && fl > 0) {
				for (i = 0; i < fl; i++) {
					haveAccess = undefined;
					//try catch isn't enough for webkit
					try {
						//opera throws only on document.toString-access
						haveAccess = window.frames[i].document.toString();
					} catch (e) {
						haveAccess = undefined;
					}
					if (!!haveAccess) {
						init(window.frames[i]);
					}
				}
				contextWindow = window;
				f();
				hyphRunForThis[window.location.href] = true;
			} else {
				init(window);
			}
		}
		
		// Cleanup functions for the document ready method
		if (document.addEventListener) {
			DOMContentLoaded = function () {
				document.removeEventListener("DOMContentLoaded", DOMContentLoaded, false);
				if (doFrames && window.frames.length > 0) {
					//we are in a frameset, so do nothing but wait for onload to fire
					return;
				} else {
					init(window);
				}
			};
		
		} else if (document.attachEvent) {
			DOMContentLoaded = function () {
				// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
				if (document.readyState === "complete") {
					document.detachEvent("onreadystatechange", DOMContentLoaded);
					if (doFrames && window.frames.length > 0) {
						//we are in a frameset, so do nothing but wait for onload to fire
						return;
					} else {
						init(window);
					}
				}
			};
		}

		// Mozilla, Opera and webkit nightlies currently support this event
		if (document.addEventListener) {
			// Use the handy event callback
			document.addEventListener("DOMContentLoaded", DOMContentLoaded, false);
			
			// A fallback to window.onload, that will always work
			window.addEventListener("load", doOnLoad, false);

		// If IE event model is used
		} else if (document.attachEvent) {
			// ensure firing before onload,
			// maybe late but safe also for iframes
			document.attachEvent("onreadystatechange", DOMContentLoaded);
			
			// A fallback to window.onload, that will always work
			window.attachEvent("onload", doOnLoad);

			// If IE and not a frame
			// continually check to see if the document is ready
			toplevel = false;
			try {
				toplevel = window.frameElement === null;
			} catch (e) {}

			if (document.documentElement.doScroll && toplevel) {
				doScrollCheck();
			}
		}

	},



	/**
	 * @name Hyphenator-getLang
	 * @description
	 * Gets the language of an element. If no language is set, it may use the {@link Hyphenator-mainLanguage}.
	 * @param {Object} el The first parameter is an DOM-Element-Object
	 * @param {boolean} fallback The second parameter is a boolean to tell if the function should return the {@link Hyphenator-mainLanguage}
	 * if there's no language found for the element.
	 * @private
	 */
	getLang = function (el, fallback) {
		if (!!el.getAttribute('lang')) {
			return el.getAttribute('lang').toLowerCase();
		}
		// The following doesn't work in IE due to a bug when getAttribute('xml:lang') in a table
		/*if (!!el.getAttribute('xml:lang')) {
			return el.getAttribute('xml:lang').substring(0, 2);
		}*/
		//instead, we have to do this (thanks to borgzor):
		try {
			if (!!el.getAttribute('xml:lang')) {
				return el.getAttribute('xml:lang').toLowerCase();
			}
		} catch (ex) {}
		if (el.tagName !== 'HTML') {
			return getLang(el.parentNode, true);
		}
		if (fallback) {
			return mainLanguage;
		}
		return null;
	},
	
	/**
	 * @name Hyphenator-autoSetMainLanguage
	 * @description
	 * Retrieves the language of the document from the DOM.
	 * The function looks in the following places:
	 * <ul>
	 * <li>lang-attribute in the html-tag</li>
	 * <li>&lt;meta http-equiv = "content-language" content = "xy" /&gt;</li>
	 * <li>&lt;meta name = "DC.Language" content = "xy" /&gt;</li>
	 * <li>&lt;meta name = "language" content = "xy" /&gt;</li>
	 * </li>
	 * If nothing can be found a prompt using {@link Hyphenator-languageHint} and {@link Hyphenator-prompterStrings} is displayed.
	 * If the retrieved language is in the object {@link Hyphenator-supportedLang} it is copied to {@link Hyphenator-mainLanguage}
	 * @private
	 */		
	autoSetMainLanguage = function (w) {
		w = w || contextWindow;
		var el = w.document.getElementsByTagName('html')[0],
			m = w.document.getElementsByTagName('meta'),
			i, text, e, ul;
		mainLanguage = getLang(el, false);
		if (!mainLanguage) {
			for (i = 0; i < m.length; i++) {
				//<meta http-equiv = "content-language" content="xy">	
				if (!!m[i].getAttribute('http-equiv') && (m[i].getAttribute('http-equiv').toLowerCase() === 'content-language')) {
					mainLanguage = m[i].getAttribute('content').toLowerCase();
				}
				//<meta name = "DC.Language" content="xy">
				if (!!m[i].getAttribute('name') && (m[i].getAttribute('name').toLowerCase() === 'dc.language')) {
					mainLanguage = m[i].getAttribute('content').toLowerCase();
				}			
				//<meta name = "language" content = "xy">
				if (!!m[i].getAttribute('name') && (m[i].getAttribute('name').toLowerCase() === 'language')) {
					mainLanguage = m[i].getAttribute('content').toLowerCase();
				}
			}
		}
		//get lang for frame from enclosing document
		if (!mainLanguage && doFrames && contextWindow != window.parent) {
			autoSetMainLanguage(window.parent);
		}
		//fallback to defaultLang if set
		if (!mainLanguage && defaultLanguage !== '') {
			mainLanguage = defaultLanguage;
		}
		//ask user for lang
		if (!mainLanguage) {
			text = '';
			ul = navigator.language ? navigator.language : navigator.userLanguage;
			ul = ul.substring(0, 2);
			if (prompterStrings.hasOwnProperty(ul)) {
				text = prompterStrings[ul];
			} else {
				text = prompterStrings.en;
			}
			text += ' (ISO 639-1)\n\n' + languageHint;
			mainLanguage = window.prompt(unescape(text), ul).toLowerCase();
		}
		if (!supportedLang.hasOwnProperty(mainLanguage)) {
			if (supportedLang.hasOwnProperty(mainLanguage.split('-')[0])) { //try subtag
				mainLanguage = mainLanguage.split('-')[0];
			} else {
				e = new Error('The language "' + mainLanguage + '" is not yet supported.');
				throw e;
			}
		}
	},
    
	/**
	 * @name Hyphenator-gatherDocumentInfos
	 * @description
	 * This method runs through the DOM and executes the process()-function on:
	 * - every node returned by the {@link Hyphenator-selectorFunction}.
	 * The process()-function copies the element to the elements-variable, sets its visibility
	 * to intermediateState, retrieves its language and recursivly descends the DOM-tree until
	 * the child-Nodes aren't of type 1
	 * @private
	 */		
	gatherDocumentInfos = function () {
		var elToProcess, tmp, i = 0,
		process = function (el, hide, lang) {
			var n, i = 0, hyphenatorSettings = {};
			if (hide && intermediateState === 'hidden') {
				if (!!el.getAttribute('style')) {
					hyphenatorSettings.hasOwnStyle = true;
				} else {
					hyphenatorSettings.hasOwnStyle = false;					
				}
				hyphenatorSettings.isHidden = true;
				el.style.visibility = 'hidden';
			}
			if (el.lang && typeof(el.lang) === 'string') {
				hyphenatorSettings.language = el.lang.toLowerCase(); //copy attribute-lang to internal lang
			} else if (lang) {
				hyphenatorSettings.language = lang.toLowerCase();
			} else {
				hyphenatorSettings.language = getLang(el, true);
			}
			lang = hyphenatorSettings.language;
			if (supportedLang[lang]) {
				docLanguages[lang] = true;
			} else {
				if (supportedLang.hasOwnProperty(lang.split('-')[0])) { //try subtag
					lang = lang.split('-')[0];
					hyphenatorSettings.language = lang;
				} else if (!isBookmarklet) {
					onError(new Error('Language ' + lang + ' is not yet supported.'));
				}
			}
			Expando.setDataForElem(el, hyphenatorSettings);			
			
			elements.push(el);
			while (!!(n = el.childNodes[i++])) {
				if (n.nodeType === 1 && !dontHyphenate[n.nodeName.toLowerCase()] &&
					n.className.indexOf(dontHyphenateClass) === -1 && !(n in elToProcess)) {
					process(n, false, lang);
				}
			}
		};
		if (isBookmarklet) {
			elToProcess = contextWindow.document.getElementsByTagName('body')[0];
			process(elToProcess, false, mainLanguage);
		} else {
			elToProcess = selectorFunction();
			while (!!(tmp = elToProcess[i++]))
			{
				process(tmp, true, '');
			}			
		}
		if (!Hyphenator.languages.hasOwnProperty(mainLanguage)) {
			docLanguages[mainLanguage] = true;
		} else if (!Hyphenator.languages[mainLanguage].prepared) {
			docLanguages[mainLanguage] = true;
		}
		if (elements.length > 0) {
			Expando.appendDataForElem(elements[elements.length - 1], {isLast : true});
		}
	},
		 
	/**
	 * @name Hyphenator-convertPatterns
	 * @description
	 * Converts the patterns from string '_a6' to object '_a':'_a6'.
	 * The result is stored in the {@link Hyphenator-patterns}-object.
	 * @private
	 * @param {string} lang the language whose patterns shall be converted
	 */		
	convertPatterns = function (lang) {
		var plen, anfang, ende, pats, pat, key, tmp = {};
		pats = Hyphenator.languages[lang].patterns;
		for (plen in pats) {
			if (pats.hasOwnProperty(plen)) {
				plen = parseInt(plen, 10);
				anfang = 0;
				ende = plen;
				while (!!(pat = pats[plen].substring(anfang, ende))) {
					key = pat.replace(/\d/g, '');
					tmp[key] = pat;
					anfang = ende;
					ende += plen;
				}
			}
		}
		Hyphenator.languages[lang].patterns = tmp;
		Hyphenator.languages[lang].patternsConverted = true;
	},

	/**
	 * @name Hyphenator-convertExceptionsToObject
	 * @description
	 * Converts a list of comma seprated exceptions to an object:
	 * 'Fortran,Hy-phen-a-tion' -> {'Fortran':'Fortran','Hyphenation':'Hy-phen-a-tion'}
	 * @private
	 * @param {string} exc a comma separated string of exceptions (without spaces)
	 */		
	convertExceptionsToObject = function (exc) {
		var w = exc.split(', '),
			r = {},
			i, l, key;
		for (i = 0, l = w.length; i < l; i++) {
			key = w[i].replace(/-/g, '');
			if (!r.hasOwnProperty(key)) {
				r[key] = w[i];
			}
		}
		return r;
	},
	
	/**
	 * @name Hyphenator-loadPatterns
	 * @description
	 * Adds a &lt;script&gt;-Tag to the DOM to load an externeal .js-file containing patterns and settings for the given language.
	 * If the given language is not in the {@link Hyphenator-supportedLang}-Object it returns.
	 * One may ask why we are not using AJAX to load the patterns. The XMLHttpRequest-Object 
	 * has a same-origin-policy. This makes the isBookmarklet-functionality impossible.
	 * @param {string} lang The language to load the patterns for
	 * @private
	 * @see Hyphenator-basePath
	 */
	loadPatterns = function (lang) {
		var url, xhr, head, script;
		if (supportedLang[lang] && !Hyphenator.languages[lang]) {
	        url = basePath + 'patterns/' + supportedLang[lang];
		} else {
			return;
		}
		if (isLocal && !isBookmarklet) {
			//check if 'url' is available:
			xhr = null;
			if (typeof XMLHttpRequest !== 'undefined') {
				xhr = new XMLHttpRequest();
			}
			if (!xhr) {
				try {
					xhr  = new ActiveXObject("Msxml2.XMLHTTP");
				} catch (e) {
					xhr  = null;
				}
			}
			if (xhr) {
				xhr.open('HEAD', url, false);
				xhr.setRequestHeader('Cache-Control', 'no-cache');
				xhr.send(null);
				if (xhr.status === 404) {
					onError(new Error('Could not load\n' + url));
					delete docLanguages[lang];
					return;
				}
			}
		}
		if (createElem) {
			head = window.document.getElementsByTagName('head').item(0);
			script = createElem('script', window);
			script.src = url;
			script.type = 'text/javascript';
			head.appendChild(script);
		}
	},
	
	/**
	 * @name Hyphenator-prepareLanguagesObj
	 * @description
	 * Adds a cache to each language and converts the exceptions-list to an object.
	 * If storage is active the object is stored there.
	 * @private
	 * @param {string} lang the language ob the lang-obj
	 */		
	prepareLanguagesObj = function (lang) {
		var lo = Hyphenator.languages[lang], wrd;
		if (!lo.prepared) {	
			if (enableCache) {
				lo.cache = {};
				//Export
				lo['cache'] = lo.cache;
			}
			if (enableReducedPatternSet) {
				lo.redPatSet = {};
			}
			//add exceptions from the pattern file to the local 'exceptions'-obj
			if (lo.hasOwnProperty('exceptions')) {
				Hyphenator.addExceptions(lang, lo.exceptions);
				delete lo.exceptions;
			}
			//copy global exceptions to the language specific exceptions
			if (exceptions.hasOwnProperty('global')) {
				if (exceptions.hasOwnProperty(lang)) {
					exceptions[lang] += ', ' + exceptions.global;
				} else {
					exceptions[lang] = exceptions.global;
				}
			}
			//move exceptions from the the local 'exceptions'-obj to the 'language'-object
			if (exceptions.hasOwnProperty(lang)) {
				lo.exceptions = convertExceptionsToObject(exceptions[lang]);
				delete exceptions[lang];
			} else {
				lo.exceptions = {};
			}
			convertPatterns(lang);
			wrd = '[\\w' + lo.specialChars + '@' + String.fromCharCode(173) + String.fromCharCode(8204) + '-]{' + min + ',}';
			lo.genRegExp = new RegExp('(' + url + ')|(' + mail + ')|(' + wrd + ')', 'gi');
			lo.prepared = true;
		}
		if (!!storage) {
			try {
				storage.setItem('Hyphenator_' + lang, window.JSON.stringify(lo));
			} catch (e) {
				//onError(e);
			}
		}
		
	},
	
	/**
	 * @name Hyphenator-prepare
	 * @description
	 * This funtion prepares the Hyphenator-Object: If RemoteLoading is turned off, it assumes
	 * that the patternfiles are loaded, all conversions are made and the callback is called.
	 * If storage is active the object is retrieved there.
	 * If RemoteLoading is on (default), it loads the pattern files and waits until they are loaded,
	 * by repeatedly checking Hyphenator.languages. If a patterfile is loaded the patterns are
	 * converted to their object style and the lang-object extended.
	 * Finally the callback is called.
	 * @param {function()} callback to call, when all patterns are loaded
	 * @private
	 */
	prepare = function (callback) {
		var lang, interval, tmp1, tmp2;
		if (!enableRemoteLoading) {
			for (lang in Hyphenator.languages) {
				if (Hyphenator.languages.hasOwnProperty(lang)) {
					prepareLanguagesObj(lang);
				}
			}
			state = 2;
			callback();
			return;
		}
		// get all languages that are used and preload the patterns
		state = 1;
		for (lang in docLanguages) {
			if (docLanguages.hasOwnProperty(lang)) {
				if (!!storage && storage.getItem('Hyphenator_' + lang)) {
					Hyphenator.languages[lang] = window.JSON.parse(storage.getItem('Hyphenator_' + lang));
					if (exceptions.hasOwnProperty('global')) {
						tmp1 = convertExceptionsToObject(exceptions.global);
						for (tmp2 in tmp1) {
							if (tmp1.hasOwnProperty(tmp2)) {
								Hyphenator.languages[lang].exceptions[tmp2] = tmp1[tmp2];
							}
						}
					}
					//Replace exceptions since they may have been changed:
					if (exceptions.hasOwnProperty(lang)) {
						tmp1 = convertExceptionsToObject(exceptions[lang]);
						for (tmp2 in tmp1) {
							if (tmp1.hasOwnProperty(tmp2)) {
								Hyphenator.languages[lang].exceptions[tmp2] = tmp1[tmp2];
							}
						}
						delete exceptions[lang];
					}
					//Replace genRegExp since it may have been changed:
					tmp1 = '[\\w' + Hyphenator.languages[lang].specialChars + '@' + String.fromCharCode(173) + String.fromCharCode(8204) + '-]{' + min + ',}';
					Hyphenator.languages[lang].genRegExp = new RegExp('(' + url + ')|(' + mail + ')|(' + tmp1 + ')', 'gi');
					
					delete docLanguages[lang];
					continue;
				} else {
					loadPatterns(lang);
				}
			}
		}
		// if all patterns are loaded from storage: callback
		if (countObjProps(docLanguages) === 0) {
			state = 2;
			callback();
			return;
		}
		// else async wait until patterns are loaded, then callback
		interval = window.setInterval(function () {
			var finishedLoading = true, lang;
			for (lang in docLanguages) {
				if (docLanguages.hasOwnProperty(lang)) {
					finishedLoading = false;
					if (!!Hyphenator.languages[lang]) {
						delete docLanguages[lang];
						//do conversion while other patterns are loading:
						prepareLanguagesObj(lang);
					}
				}
			}
			if (finishedLoading) {
				//console.log('callig callback for ' + contextWindow.location.href);
				window.clearInterval(interval);
				state = 2;
				callback();
			}
		}, 100);
	},

	/**
	 * @name Hyphenator-switchToggleBox
	 * @description
	 * Creates or hides the toggleBox: a small button to turn off/on hyphenation on a page.
	 * @see Hyphenator.config
	 * @private
	 */		
	toggleBox = function () {
		var myBox, bdy, myIdAttribute, myTextNode, myClassAttribute,
		text = (Hyphenator.doHyphenation ? 'Hy-phen-a-tion' : 'Hyphenation');
		if (!!(myBox = contextWindow.document.getElementById('HyphenatorToggleBox'))) {
			myBox.firstChild.data = text;
		} else {
			bdy = contextWindow.document.getElementsByTagName('body')[0];
			myBox = createElem('div', contextWindow);
			myIdAttribute = contextWindow.document.createAttribute('id');
			myIdAttribute.nodeValue = 'HyphenatorToggleBox';
			myClassAttribute = contextWindow.document.createAttribute('class');
			myClassAttribute.nodeValue = dontHyphenateClass;
			myTextNode = contextWindow.document.createTextNode(text);
			myBox.appendChild(myTextNode);
			myBox.setAttributeNode(myIdAttribute);
			myBox.setAttributeNode(myClassAttribute);
			myBox.onclick =  Hyphenator.toggleHyphenation;
			myBox.style.position = 'absolute';
			myBox.style.top = '0px';
			myBox.style.right = '0px';
			myBox.style.margin = '0';
			myBox.style.backgroundColor = '#AAAAAA';
			myBox.style.color = '#FFFFFF';
			myBox.style.font = '6pt Arial';
			myBox.style.letterSpacing = '0.2em';
			myBox.style.padding = '3px';
			myBox.style.cursor = 'pointer';
			myBox.style.WebkitBorderBottomLeftRadius = '4px';
			myBox.style.MozBorderRadiusBottomleft = '4px';
			bdy.appendChild(myBox);
		}
	},

	/**
	 * @name Hyphenator-hyphenateWord
	 * @description
	 * This function is the heart of Hyphenator.js. It returns a hyphenated word.
	 *
	 * If there's already a {@link Hyphenator-hypen} in the word, the word is returned as it is.
	 * If the word is in the exceptions list or in the cache, it is retrieved from it.
	 * If there's a '-' put a zeroWidthSpace after the '-' and hyphenate the parts.
	 * @param {string} lang The language of the word
	 * @param {string} word The word
	 * @returns string The hyphenated word
	 * @public
	 */	
	hyphenateWord = function (lang, word) {
		var lo = Hyphenator.languages[lang],
			parts, i, l, w, wl, s, hypos, p, maxwins, win, pat = false, patk, c, t, n, numb3rs, inserted, hyphenatedword, val, subst, ZWNJpos = [];
		if (word === '') {
			return '';
		}
		if (word.indexOf(hyphen) !== -1) {
			//word already contains shy; -> leave at it is!
			return word;
		}
		if (enableCache && lo.cache.hasOwnProperty(word)) { //the word is in the cache
			return lo.cache[word];
		}
		if (lo.exceptions.hasOwnProperty(word)) { //the word is in the exceptions list
			return lo.exceptions[word].replace(/-/g, hyphen);
		}
		if (word.indexOf('-') !== -1) {
			//word contains '-' -> hyphenate the parts separated with '-'
			parts = word.split('-');
			for (i = 0, l = parts.length; i < l; i++) {
				parts[i] = hyphenateWord(lang, parts[i]);
			}
			return parts.join('-');
		}
		w = '_' + word + '_';
		if (word.indexOf(String.fromCharCode(8204)) !== -1) {
			parts = w.split(String.fromCharCode(8204));
			w = parts.join('');
			for (i = 0, l = parts.length; i < l; i++) {
				parts[i] = parts[i].length.toString();
			}
			parts.pop();
			ZWNJpos = parts;
		}
		wl = w.length;
		s = w.split('');
		if (!!lo.charSubstitution) {
			for (subst in lo.charSubstitution) {
				if (lo.charSubstitution.hasOwnProperty(subst)) {
					w = w.replace(new RegExp(subst, 'g'), lo.charSubstitution[subst]);
				}
			}
		}
		if (word.indexOf("'") !== -1) {
			w = w.toLowerCase().replace("'", "’"); //replace APOSTROPHE with RIGHT SINGLE QUOTATION MARK (since the latter is used in the patterns)
		} else {
			w = w.toLowerCase();
		}
		//finally the core hyphenation algorithm
		hypos = [];
		numb3rs = {'0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9}; //check for member is faster then isFinite()
		n = wl - lo.shortestPattern;
		for (p = 0; p <= n; p++) {
			maxwins = Math.min((wl - p), lo.longestPattern);
			for (win = lo.shortestPattern; win <= maxwins; win++) {
				if (lo.patterns.hasOwnProperty(patk = w.substring(p, p + win))) {
					pat = lo.patterns[patk];
					if (enableReducedPatternSet && (typeof pat === 'string')) {
						lo.redPatSet[patk] = pat;
					}
					if (typeof pat === 'string') {
						//convert from string 'a5b' to array [1,5] (pos,value)
						t = 0;
						val = [];
						for (i = 0; i < pat.length; i++) {
							if (!!(c = numb3rs[pat.charAt(i)])) {
								val.push(i - t, c);
								t++;								
							}
						}
						pat = lo.patterns[patk] = val;
					}
				} else {
					continue;
				}
				for (i = 0; i < pat.length; i++) {
					c = p - 1 + pat[i];
					if (!hypos[c] || hypos[c] < pat[i + 1]) {
						hypos[c] = pat[i + 1];
					}
					i++;
				}
			}
		}
		inserted = 0;
		for (i = lo.leftmin; i <= (wl - 2 - lo.rightmin); i++) {
			if (ZWNJpos.length > 0 && ZWNJpos[0] === i) {
				ZWNJpos.shift();
				s.splice(i + inserted - 1, 0, String.fromCharCode(8204));
				inserted++;
			}			
			if (!!(hypos[i] & 1)) {
				s.splice(i + inserted + 1, 0, hyphen);
				inserted++;
			}
		}
		hyphenatedword = s.slice(1, -1).join('');
		if (enableCache) {
			lo.cache[word] = hyphenatedword;
		}
		return hyphenatedword;
	},
		
	/**
	 * @name Hyphenator-hyphenateURL
	 * @description
	 * Puts {@link Hyphenator-urlhyphen} after each no-alphanumeric char that my be in a URL.
	 * @param {string} url to hyphenate
	 * @returns string the hyphenated URL
	 * @public
	 */
	hyphenateURL = function (url) {
		return url.replace(/([:\/\.\?#&_,;!@]+)/gi, '$&' + urlhyphen);
	},

	/**
	 * @name Hyphenator-removeHyphenationFromElement
	 * @description
	 * Removes all hyphens from the element. If there are other elements, the function is
	 * called recursively.
	 * Removing hyphens is usefull if you like to copy text. Some browsers are buggy when the copy hyphenated texts.
	 * @param {Object} el The element where to remove hyphenation.
	 * @public
	 */
	removeHyphenationFromElement = function (el) {
		var h, i = 0, n;
		switch (hyphen) {
		case '|':
			h = '\\|';
			break;
		case '+':
			h = '\\+';
			break;
		case '*':
			h = '\\*';
			break;
		default:
			h = hyphen;
		}
		while (!!(n = el.childNodes[i++])) {
			if (n.nodeType === 3) {
				n.data = n.data.replace(new RegExp(h, 'g'), '');
				n.data = n.data.replace(new RegExp(zeroWidthSpace, 'g'), '');
			} else if (n.nodeType === 1) {
				removeHyphenationFromElement(n);
			}
		}
	},
	
	
	/**
	 * @name Hyphenator-registerOnCopy
	 * @description
	 * Huge work-around for browser-inconsistency when it comes to
	 * copying of hyphenated text.
	 * The idea behind this code has been provided by http://github.com/aristus/sweet-justice
	 * sweet-justice is under BSD-License
	 * @private
	 */
	registerOnCopy = function (el) {
		var body = el.ownerDocument.getElementsByTagName('body')[0],
		shadow,
		selection,
		range,
		rangeShadow,
		restore,
		oncopyHandler = function (e) {
			e = e || window.event;
			var target = e.target || e.srcElement,
			currDoc = target.ownerDocument,
			body = currDoc.getElementsByTagName('body')[0],
			targetWindow = 'defaultView' in currDoc ? currDoc.defaultView : currDoc.parentWindow;
			if (target.tagName && dontHyphenate[target.tagName.toLowerCase()]) {
				//Safari needs this
				return;
			}
			//create a hidden shadow element
			shadow = currDoc.createElement('div');
			shadow.style.overflow = 'hidden';
			shadow.style.position = 'absolute';
			shadow.style.top = '-5000px';
			shadow.style.height = '1px';
			body.appendChild(shadow);
			if (!!window.getSelection) {
				//FF3, Webkit
				selection = targetWindow.getSelection();
				range = selection.getRangeAt(0);
				shadow.appendChild(range.cloneContents());
				removeHyphenationFromElement(shadow);
				selection.selectAllChildren(shadow);
				restore = function () {
					shadow.parentNode.removeChild(shadow);
					selection.addRange(range);
				};
			} else {
				// IE
				selection = targetWindow.document.selection;
				range = selection.createRange();
				shadow.innerHTML = range.htmlText;
				removeHyphenationFromElement(shadow);
				rangeShadow = body.createTextRange();
				rangeShadow.moveToElementText(shadow);
				rangeShadow.select();
				restore = function () {
					shadow.parentNode.removeChild(shadow);
					if (range.text !== "") {
						range.select();
					}
				};
			}
			window.setTimeout(restore, 0);
		};
		if (!body) {
			return;
		}
		el = el || body;
		if (window.addEventListener) {
			el.addEventListener("copy", oncopyHandler, false);
		} else {
			el.attachEvent("oncopy", oncopyHandler);
		}
	},
	

	/**
	 * @name Hyphenator-hyphenateElement
	 * @description
	 * Takes the content of the given element and - if there's text - replaces the words
	 * by hyphenated words. If there's another element, the function is called recursively.
	 * When all words are hyphenated, the visibility of the element is set to 'visible'.
	 * @param {Object} el The element to hyphenate
	 * @private
	 */
	hyphenateElement = function (el) {
		var hyphenatorSettings = Expando.getDataForElem(el),
			lang = hyphenatorSettings.language, hyphenate, n, i,
			controlOrphans = function (part) {
				var h, r;
				switch (hyphen) {
				case '|':
					h = '\\|';
					break;
				case '+':
					h = '\\+';
					break;
				case '*':
					h = '\\*';
					break;
				default:
					h = hyphen;
				}
				if (orphanControl >= 2) {
					//remove hyphen points from last word
					r = part.split(' ');
					r[1] = r[1].replace(new RegExp(h, 'g'), '');
					r[1] = r[1].replace(new RegExp(zeroWidthSpace, 'g'), '');
					r = r.join(' ');
				}
				if (orphanControl === 3) {
					//replace spaces by non breaking spaces
					r = r.replace(/[ ]+/g, String.fromCharCode(160));
				}
				return r;
			};
		if (Hyphenator.languages.hasOwnProperty(lang)) {
			hyphenate = function (word) {
				if (!Hyphenator.doHyphenation) {
					return word;
				} else if (urlOrMailRE.test(word)) {
					return hyphenateURL(word);
				} else {
					return hyphenateWord(lang, word);
				}
			};
			if (safeCopy && (el.tagName.toLowerCase() !== 'body')) {
				registerOnCopy(el);
			}
			i = 0;
			while (!!(n = el.childNodes[i++])) {
				if (n.nodeType === 3 && n.data.length >= min) { //type 3 = #text -> hyphenate!
					n.data = n.data.replace(Hyphenator.languages[lang].genRegExp, hyphenate);
					if (orphanControl !== 1) {
						n.data = n.data.replace(/[\S]+ [\S]+$/, controlOrphans);
					}
				}
			}
		}
		if (hyphenatorSettings.isHidden && intermediateState === 'hidden') {
			el.style.visibility = 'visible';
			if (!hyphenatorSettings.hasOwnStyle) {
				el.setAttribute('style', ''); // without this, removeAttribute doesn't work in Safari (thanks to molily)
				el.removeAttribute('style');
			} else {
				if (el.style.removeProperty) {
					el.style.removeProperty('visibility');
				} else if (el.style.removeAttribute) { // IE
					el.style.removeAttribute('visibility');
				}  
			}
		}
		if (hyphenatorSettings.isLast) {
			state = 3;
			documentCount--;
			if (documentCount > (-1000) && documentCount <= 0) {
				documentCount = (-2000);
				onHyphenationDone();
			}
		}
	},
	

	/**
	 * @name Hyphenator-hyphenateDocument
	 * @description
	 * Calls hyphenateElement() for all members of elements. This is done with a setTimout
	 * to prevent a "long running Script"-alert when hyphenating large pages.
	 * Therefore a tricky bind()-function was necessary.
	 * @private
	 */
	hyphenateDocument = function () {
		function bind(fun, arg) {
			return function () {
				return fun(arg);
			};
		}
		var i = 0, el;
		while (!!(el = elements[i++])) {
			if (el.ownerDocument.location.href === contextWindow.location.href) {
				window.setTimeout(bind(hyphenateElement, el), 0);
			}
		}
	},

	/**
	 * @name Hyphenator-removeHyphenationFromDocument
	 * @description
	 * Does what it says ;-)
	 * @private
	 */
	removeHyphenationFromDocument = function () {
		var i = 0, el;
		while (!!(el = elements[i++])) {
			removeHyphenationFromElement(el);
		}
		state = 4;
	},
		
	/**
	 * @name Hyphenator-createStorage
	 * @description
	 * inits the private var storage depending of the setting in storageType
	 * and the supported features of the system.
	 * @private
	 */
	createStorage = function () {
		try {
			if (storageType !== 'none' &&
				typeof(window.localStorage) !== 'undefined' &&
				typeof(window.sessionStorage) !== 'undefined' &&
				typeof(window.JSON.stringify) !== 'undefined' &&
				typeof(window.JSON.parse) !== 'undefined') {
				switch (storageType) {
				case 'session':
					storage = window.sessionStorage;
					break;
				case 'local':
					storage = window.localStorage;
					break;
				default:
					storage = undefined;
					break;
				}
			}
		} catch (f) {
			//FF throws an error if DOM.storage.enabled is set to false
		}
	},
	
	/**
	 * @name Hyphenator-storeConfiguration
	 * @description
	 * Stores the current config-options in DOM-Storage
	 * @private
	 */
	storeConfiguration = function () {
		if (!storage) {
			return;
		}
		var settings = {
			'STORED': true,
			'classname': hyphenateClass,
			'donthyphenateclassname': dontHyphenateClass,
			'minwordlength': min,
			'hyphenchar': hyphen,
			'urlhyphenchar': urlhyphen,
			'togglebox': toggleBox,
			'displaytogglebox': displayToggleBox,
			'remoteloading': enableRemoteLoading,
			'enablecache': enableCache,
			'onhyphenationdonecallback': onHyphenationDone,
			'onerrorhandler': onError,
			'intermediatestate': intermediateState,
			'selectorfunction': selectorFunction,
			'safecopy': safeCopy,
			'doframes': doFrames,
			'storagetype': storageType,
			'orphancontrol': orphanControl,
			'dohyphenation': Hyphenator.doHyphenation,
			'persistentconfig': persistentConfig,
			'defaultlanguage': defaultLanguage
		};
		storage.setItem('Hyphenator_config', window.JSON.stringify(settings));
	},
	
	/**
	 * @name Hyphenator-restoreConfiguration
	 * @description
	 * Retrieves config-options from DOM-Storage and does configuration accordingly
	 * @private
	 */
	restoreConfiguration = function () {
		var settings;
		if (storage.getItem('Hyphenator_config')) {
			settings = window.JSON.parse(storage.getItem('Hyphenator_config'));
			Hyphenator.config(settings);
		}
	};

	return {
		
		/**
		 * @name Hyphenator.version
		 * @memberOf Hyphenator
		 * @description
		 * String containing the actual version of Hyphenator.js
		 * [major release].[minor releas].[bugfix release]
		 * major release: new API, new Features, big changes
		 * minor release: new languages, improvements
		 * @public
         */		
		version: '3.3.0',

		/**
		 * @name Hyphenator.doHyphenation
		 * @description
		 * If doHyphenation is set to false (defaults to true), hyphenateDocument() isn't called.
		 * All other actions are performed.
		 */		
		doHyphenation: true,
		
		/**
		 * @name Hyphenator.languages
		 * @memberOf Hyphenator
		 * @description
		 * Objects that holds key-value pairs, where key is the language and the value is the
		 * language-object loaded from (and set by) the pattern file.
		 * The language object holds the following members:
		 * <table>
		 * <tr><th>key</th><th>desc></th></tr>
		 * <tr><td>leftmin</td><td>The minimum of chars to remain on the old line</td></tr>
		 * <tr><td>rightmin</td><td>The minimum of chars to go on the new line</td></tr>
		 * <tr><td>shortestPattern</td><td>The shortes pattern (numbers don't count!)</td></tr>
		 * <tr><td>longestPattern</td><td>The longest pattern (numbers don't count!)</td></tr>
		 * <tr><td>specialChars</td><td>Non-ASCII chars in the alphabet.</td></tr>
		 * <tr><td>patterns</td><td>the patterns</td></tr>
		 * </table>
		 * And optionally (or after prepareLanguagesObj() has been called):
		 * <table>
		 * <tr><td>exceptions</td><td>Excpetions for the secified language</td></tr>
		 * </table>
		 * @public
         */		
		languages: {},
		

		/**
		 * @name Hyphenator.config
			 * @description
		 * Config function that takes an object as an argument. The object contains key-value-pairs
		 * containig Hyphenator-settings. This is a shortcut for calling Hyphenator.set...-Methods.
		 * @param {Object} obj <table>
		 * <tr><th>key</th><th>values</th><th>default</th></tr>
		 * <tr><td>classname</td><td>string</td><td>'hyphenate'</td></tr>
		 * <tr><td>donthyphenateclassname</td><td>string</td><td>''</td></tr>
		 * <tr><td>minwordlength</td><td>integer</td><td>6</td></tr>
		 * <tr><td>hyphenchar</td><td>string</td><td>'&amp;shy;'</td></tr>
		 * <tr><td>urlhyphenchar</td><td>string</td><td>'zero with space'</td></tr>
		 * <tr><td>togglebox</td><td>function</td><td>see code</td></tr>
		 * <tr><td>displaytogglebox</td><td>boolean</td><td>false</td></tr>
		 * <tr><td>remoteloading</td><td>boolean</td><td>true</td></tr>
		 * <tr><td>enablecache</td><td>boolean</td><td>true</td></tr>
		 * <tr><td>enablereducedpatternset</td><td>boolean</td><td>false</td></tr>
		 * <tr><td>onhyphenationdonecallback</td><td>function</td><td>empty function</td></tr>
		 * <tr><td>onerrorhandler</td><td>function</td><td>alert(onError)</td></tr>
		 * <tr><td>intermediatestate</td><td>string</td><td>'hidden'</td></tr>
		 * <tr><td>selectorfunction</td><td>function</td><td>[…]</td></tr>
		 * <tr><td>safecopy</td><td>boolean</td><td>true</td></tr>
		 * <tr><td>doframes</td><td>boolean</td><td>false</td></tr>
		 * <tr><td>storagetype</td><td>string</td><td>'none'</td></tr>
		 * </table>
		 * @public
		 * @example &lt;script src = "Hyphenator.js" type = "text/javascript"&gt;&lt;/script&gt;
         * &lt;script type = "text/javascript"&gt;
         *     Hyphenator.config({'minwordlength':4,'hyphenchar':'|'});
         *     Hyphenator.run();
         * &lt;/script&gt;
         */
		config: function (obj) {
			var assert = function (name, type) {
					if (typeof obj[name] === type) {
						return true;
					} else {
						onError(new Error('Config onError: ' + name + ' must be of type ' + type));
						return false;
					}
				},
				key;

			if (obj.hasOwnProperty('storagetype')) {
				if (assert('storagetype', 'string')) {
					storageType = obj.storagetype;
				}
				if (!storage) {
					createStorage();
				}			
			}
			if (!obj.hasOwnProperty('STORED') && storage && obj.hasOwnProperty('persistentconfig') && obj.persistentconfig === true) {
				restoreConfiguration();
			}
			
			for (key in obj) {
				if (obj.hasOwnProperty(key)) {
					switch (key) {
					case 'STORED':
						break;
					case 'classname':
						if (assert('classname', 'string')) {
							hyphenateClass = obj[key];
						}
						break;
					case 'donthyphenateclassname':
						if (assert('donthyphenateclassname', 'string')) {
							dontHyphenateClass = obj[key];
						}						
						break;
					case 'minwordlength':
						if (assert('minwordlength', 'number')) {
							min = obj[key];
						}
						break;
					case 'hyphenchar':
						if (assert('hyphenchar', 'string')) {
							if (obj.hyphenchar === '&shy;') {
								obj.hyphenchar = String.fromCharCode(173);
							}
							hyphen = obj[key];
						}
						break;
					case 'urlhyphenchar':
						if (obj.hasOwnProperty('urlhyphenchar')) {
							if (assert('urlhyphenchar', 'string')) {
								urlhyphen = obj[key];
							}
						}
						break;
					case 'togglebox':
						if (assert('togglebox', 'function')) {
							toggleBox = obj[key];
						}
						break;
					case 'displaytogglebox':
						if (assert('displaytogglebox', 'boolean')) {
							displayToggleBox = obj[key];
						}
						break;
					case 'remoteloading':
						if (assert('remoteloading', 'boolean')) {
							enableRemoteLoading = obj[key];
						}
						break;
					case 'enablecache':
						if (assert('enablecache', 'boolean')) {
							enableCache = obj[key];
						}
						break;
					case 'enablereducedpatternset':
						if (assert('enablereducedpatternset', 'boolean')) {
							enableReducedPatternSet = obj[key];
						}
						break;
					case 'onhyphenationdonecallback':
						if (assert('onhyphenationdonecallback', 'function')) {
							onHyphenationDone = obj[key];
						}
						break;
					case 'onerrorhandler':
						if (assert('onerrorhandler', 'function')) {
							onError = obj[key];
						}
						break;
					case 'intermediatestate':
						if (assert('intermediatestate', 'string')) {
							intermediateState = obj[key];
						}
						break;
					case 'selectorfunction':
						if (assert('selectorfunction', 'function')) {
							selectorFunction = obj[key];
						}
						break;
					case 'safecopy':
						if (assert('safecopy', 'boolean')) {
							safeCopy = obj[key];
						}
						break;
					case 'doframes':
						if (assert('doframes', 'boolean')) {
							doFrames = obj[key];
						}
						break;
					case 'storagetype':
						if (assert('storagetype', 'string')) {
							storageType = obj[key];
						}						
						break;
					case 'orphancontrol':
						if (assert('orphancontrol', 'number')) {
							orphanControl = obj[key];
						}
						break;
					case 'dohyphenation':
						if (assert('dohyphenation', 'boolean')) {
							Hyphenator.doHyphenation = obj[key];
						}
						break;
					case 'persistentconfig':
						if (assert('persistentconfig', 'boolean')) {
							persistentConfig = obj[key];
						}
						break;
					case 'defaultlanguage':
						if (assert('defaultlanguage', 'string')) {
							defaultLanguage = obj[key];
						}
						break;
					default:
						onError(new Error('Hyphenator.config: property ' + key + ' not known.'));
					}
				}
			}
			if (storage && persistentConfig) {
				storeConfiguration();
			}
		},

		/**
		 * @name Hyphenator.run
			 * @description
		 * Bootstrap function that starts all hyphenation processes when called.
		 * @public
		 * @example &lt;script src = "Hyphenator.js" type = "text/javascript"&gt;&lt;/script&gt;
         * &lt;script type = "text/javascript"&gt;
         *   Hyphenator.run();
         * &lt;/script&gt;
         */
		run: function () {
			documentCount = 0;
			var process = function () {
				try {
					if (contextWindow.document.getElementsByTagName('frameset').length > 0) {
						return; //we are in a frameset
					}
					documentCount++;
					autoSetMainLanguage(undefined);
					gatherDocumentInfos();
					//console.log('preparing for ' + contextWindow.location.href);
					prepare(hyphenateDocument);
					if (displayToggleBox) {
						toggleBox();
					}
				} catch (e) {
					onError(e);
				}
			}, i, haveAccess, fl = window.frames.length;
			
			if (!storage) {
				createStorage();
			}
			if (!documentLoaded && !isBookmarklet) {
				runOnContentLoaded(window, process);
			}
			if (isBookmarklet || documentLoaded) {
				if (doFrames && fl > 0) {
					for (i = 0; i < fl; i++) {
						haveAccess = undefined;
						//try catch isn't enough for webkit
						try {
							//opera throws only on document.toString-access
							haveAccess = window.frames[i].document.toString();
						} catch (e) {
							haveAccess = undefined;
						}
						if (!!haveAccess) {
							contextWindow = window.frames[i];
							process();
						}						
					}
				}
				contextWindow = window;
				process();
			}
		},
		
		/**
		 * @name Hyphenator.addExceptions
			 * @description
		 * Adds the exceptions from the string to the appropriate language in the 
		 * {@link Hyphenator-languages}-object
		 * @param {string} lang The language
		 * @param {string} words A comma separated string of hyphenated words WITH spaces.
		 * @public
		 * @example &lt;script src = "Hyphenator.js" type = "text/javascript"&gt;&lt;/script&gt;
         * &lt;script type = "text/javascript"&gt;
         *   Hyphenator.addExceptions('de','ziem-lich, Wach-stube');
         *   Hyphenator.run();
         * &lt;/script&gt;
         */
		addExceptions: function (lang, words) {
			if (lang === '') {
				lang = 'global';
			}
			if (exceptions.hasOwnProperty(lang)) {
				exceptions[lang] += ", " + words;
			} else {
				exceptions[lang] = words;
			}
		},
		
		/**
		 * @name Hyphenator.hyphenate
			 * @public
		 * @description
		 * Hyphenates the target. The language patterns must be loaded.
		 * If the target is a string, the hyphenated string is returned,
		 * if it's an object, the values are hyphenated directly.
		 * @param {string|Object} target the target to be hyphenated
		 * @param {string} lang the language of the target
		 * @returns string
		 * @example &lt;script src = "Hyphenator.js" type = "text/javascript"&gt;&lt;/script&gt;
		 * &lt;script src = "patterns/en.js" type = "text/javascript"&gt;&lt;/script&gt;
         * &lt;script type = "text/javascript"&gt;
		 * var t = Hyphenator.hyphenate('Hyphenation', 'en'); //Hy|phen|ation
		 * &lt;/script&gt;
		 */
		hyphenate: function (target, lang) {
			var hyphenate, n, i;
			if (Hyphenator.languages.hasOwnProperty(lang)) {
				if (!Hyphenator.languages[lang].prepared) {
					prepareLanguagesObj(lang);
				}
				hyphenate = function (word) {
					if (urlOrMailRE.test(word)) {
						return hyphenateURL(word);
					} else {
						return hyphenateWord(lang, word);
					}
				};
				if (typeof target === 'string' || target.constructor === String) {
					return target.replace(Hyphenator.languages[lang].genRegExp, hyphenate);
				} else if (typeof target === 'object') {
					i = 0;
					while (!!(n = target.childNodes[i++])) {
						if (n.nodeType === 3 && n.data.length >= min) { //type 3 = #text -> hyphenate!
							n.data = n.data.replace(Hyphenator.languages[lang].genRegExp, hyphenate);
						} else if (n.nodeType === 1) {
							if (n.lang !== '') {
								Hyphenator.hyphenate(n, n.lang);
							} else {
								Hyphenator.hyphenate(n, lang);
							}
						}
					}
				}
			} else {
				onError(new Error('Language "' + lang + '" is not loaded.'));
			}
		},
		
		/**
		 * @name Hyphenator.getRedPatternSet
			 * @description
		 * Returns {@link Hyphenator-isBookmarklet}.
		 * @param {string} lang the language patterns are stored for
		 * @returns object {'patk': pat}
		 * @public
         */
		getRedPatternSet: function (lang) {
			return Hyphenator.languages[lang].redPatSet;
		},
		
		/**
		 * @name Hyphenator.isBookmarklet
			 * @description
		 * Returns {@link Hyphenator-isBookmarklet}.
		 * @returns boolean
		 * @public
         */
		isBookmarklet: function () {
			return isBookmarklet;
		},

		getConfigFromURI: function () {
			var loc = null, re = {}, jsArray = document.getElementsByTagName('script'), i, j, l, s, gp, option;
			for (i = 0, l = jsArray.length; i < l; i++) {
				if (!!jsArray[i].getAttribute('src')) {
					loc = jsArray[i].getAttribute('src');
				}
				if (!loc) {
					continue;
				} else {
					s = loc.indexOf('Hyphenator.js?');
					if (s === -1) {
						continue;
					}
					gp = loc.substring(s + 14).split('&');
					for (j = 0; j < gp.length; j++) {
						option = gp[j].split('=');
						if (option[0] === 'bm') {
							continue;
						}
						if (option[1] === 'true') {
							re[option[0]] = true;
							continue;
						}
						if (option[1] === 'false') {
							re[option[0]] = false;
							continue;
						}
						if (isFinite(option[1])) {
							re[option[0]] = parseInt(option[1], 10);
							continue;
						}
						if (option[0] === 'onhyphenationdonecallback') {
							re[option[0]] = new Function('', option[1]);
							continue;
						}
						re[option[0]] = option[1];
					}
					break;
				}
			}
			return re;
		},

		/**
		 * @name Hyphenator.toggleHyphenation
			 * @description
		 * Checks the current state of the ToggleBox and removes or does hyphenation.
		 * @public
         */
		toggleHyphenation: function () {
			if (Hyphenator.doHyphenation) {
				removeHyphenationFromDocument();
				Hyphenator.doHyphenation = false;
				storeConfiguration();
				toggleBox();
			} else {
				hyphenateDocument();
				Hyphenator.doHyphenation = true;
				storeConfiguration();
				toggleBox();
			}
		}
	};
}(window));

//Export properties/methods (for google closure compiler)
Hyphenator['languages'] = Hyphenator.languages;
Hyphenator['config'] = Hyphenator.config;
Hyphenator['run'] = Hyphenator.run;
Hyphenator['addExceptions'] = Hyphenator.addExceptions;
Hyphenator['hyphenate'] = Hyphenator.hyphenate;
Hyphenator['getRedPatternSet'] = Hyphenator.getRedPatternSet;
Hyphenator['isBookmarklet'] = Hyphenator.isBookmarklet;
Hyphenator['getConfigFromURI'] = Hyphenator.getConfigFromURI;
Hyphenator['toggleHyphenation'] = Hyphenator.toggleHyphenation;
window['Hyphenator'] = Hyphenator;

if (Hyphenator.isBookmarklet()) {
	Hyphenator.config({displaytogglebox: true, intermediatestate: 'visible', doframes: true});
	Hyphenator.config(Hyphenator.getConfigFromURI());
	Hyphenator.run();
}

Hyphenator.languages['de'] = {
	leftmin : 2,
	rightmin : 2,
	shortestPattern : 2,
	longestPattern : 12,
	specialChars : "äüöéßſ",
	patterns : {
		3 : "2aaa1äa1ba1da1g2aia1j2aoa1öa1p2aqa1ßa2ua1xä1aä1bä1dä1gä1jä1k1äqä1ß1äxä1z1bibl21cacä32cc1céc4hc1jc4k3co2cp2cs3cu1cy2dc1de1did1ö1due1be1d4eee1fe1ge1ke1m2eoe1pe1qe1ße1te3üe1wey1e1zé1bé1cé1gé1hé1lé1oé1pé1ré1sé1v1fa1fä1fe1fé1fi1fo1fö1fu1fü1fy2gd1geg1n1guh1j2hl2hnh1q2hr4hsh2ü2hwh1zi1a2iä2ici1d2ifii2i1ji1ßi1üj2u1ka1käkl21ko1kök1q2ks1kü1le1li4ln1lo1lö2lx1ly1ma3mä2mc1me1mé1mi1mo1mö1mu1mü1my1na1nä1ne1né1nin1j1noo1b2oco1d2oi2ol2omo1qo1ßo2uo1vo1xö1bö1dö1e1öf2önöo1ö1ßö1vö1wö1zp2a1päp2e1pé1php1j1puqu42rc1re1ré1ri4rnr1q1ru1rü1ry1sa1sä1sc1se1sé1si1so1sös1t1su1sü1ta1tä1tet1h1ti1to2tö2ts1tu2tü2ua2ucu1h2uiu1ju1lun12uou1q2usu1w1üb2üc2üdü1gü1k2ünü1ß2ütü1vü1zv2r2vsw2aw2ä2wnw2rw2ux1a2xc1xex1jx1q1xu2xv2xyx1zy1by1ey1gy1hy1jy1ly1py1ry1vy1wy1yzä2zu1zw2",
		4 : "_ax4_äm3_ch2_en1_eu1_fs4_gd2_gs4_he2_ia4_in1_ks2_md2_mm2_oa3_öd2_pf4_ph4_ps2_st4_th4_ts2_um3_ur1_xe3a1abaa1ca3au2abaab1ä1abd1abf1abg1abh2abi1abkab1l1abnab3r1abs2abu2abü1abw2aby1abz2ac_2acaa1cia1cl2acuad1c1add2adf2adh5adj2ado2adp2adq2adu2a1eae2bae2cae2da2ekae2pa2eta2ewae2xaf1a2afe2afia2fö2agaag2n2agt2ah_2ahsa1huah1wa1hyaif2a2ilaje22ak_2akb2akc2akd4ako2aks1akza1laa1lä2ale2ali2aloa1lu4aly2am_2amä2amf2amk2amla2mö2amu1anb2ane1anf1anh2anj1anl2anna1nö1anra1nü1anwao1ia1opa1or2ap_2apa2apea2péa2pfap2n2apr2ar_a1raa1rä1arb2are2arf2arh2ari2arr2arua2rü2arv2ary4asha2söa2süaße22a1tata1at2cat2eat2h3atmat1ö4atra3tü2au_2aub4auc2aue2aug2auj4aum4aunau1o2auu2auw2aux2auz2a1ü2a1v4avia2vr2a1wax2eays4ay3t2a1zaz2aaz2oaz2uäb2sä1ckä2daä2dräd2s2ä1eäf3läf3räf2säg2näh1aä3hi2ähm2ähsä1huäh1wä1imä1la2äleä1lu2ämläm2s2än_2äne2änsä1onä1paär1äär1c4äreär1oä1röä2rü1ärzä3suä3teät2häu1cä2uf1äug4äul2äumä2un2äur1äuß4ä1v3bah3basb2ärb2äs4b1bb3bebb2sbbu12b1c3be_3bea3beb3bek3bel1bembe1o3bet1bezbge3bib23bilbiz24b1j2bl_b2leb2lo3blü2b1mbni2bo4abo2cboe1b1op2böf2b1qb2r42br_3brä3brü4b1sb3säb3scb4slb2söbss2bs2t4b3tb5teb4thbt4rbtü1bu2fbü1c2b1v2b1w3by1by3pbys2ca1h3camc4an3carcäs2c1cec2d2c3do2cec2cefce1i2cek1cen1cer1cetce1u2c1f4ch_2chb2chc2chd1ché2chf2chg2chh2chj2chk2chp4chs2cht4chü2chv4chw2chzci1cci2s4ck_ck1ack1ä2ckb2ckc2ckd1cke2ckf2ckg2ckh1cki2ckk2ckm2ckp4cks2ckt1cku2ckv2ckw1cky2ckzc4l2clo11cluc2m2co2ccoi2cos42c1qcre2cry2cs2ac2si4c1tcti22c1z3da_da1ad1afd1agda1sdä2ud1chd3dhd5dodeg2d1eides1det2d3gl3dicdi2edi1pdi5v2d1jd3lad3ledl3mdl3sdni2d1obdo2o2d1qd2r4d3rid3rö2d1s4dsb4dsld2södss4dst42d1td2thdto2d3tödt3rd3tüdu2fdu1idu1odur22düb3düf3dün2d1wdwa2dy2s2d1z2e1aea2ceak1eam3e2ase1ä22eba2ebl2ebre3bue1cee1ci2ecoe3cr2ected2eed2öee1eeeg2e1eie1en2ef_2efa2efe2efi2eflefs22efu2efüegd4e3gee2gn2egue1hee1hi2ehme1hoehs22ehte1hue1hüeh1we1hy4eibe2idei1ee4ilei1p2eire2it2eiu2e1jek2a1ekdek4nek2oek4r2ektek2ue1la2eli2eln2eloe1lü2elz2ema2emm2emüen3fe4nre4nten1ue1nüe1nye1ofe1ohe4ole1ore1ove1ö2e3pae3puer1ae1räer1cer3h2erie1roer1ö2eru2esbes2c2esf4eshes3l2esmes2ö2esp2esres3we3syes3ze3teet2he3tie3tö2etre3tü2etz2euf1euke1um2euneu1p2eut2eux2e1ve3vo2ewae3wä2eweew2s2ex_e1xiex3l3exp2exu1exzey4neys4e3ziez2wégi2élu2é1t2é1u2é1z2fab43facf4ahf2alf2arf3atfä1cf1äu2f1cfe2c3fewf1ex3fez2f1fff2efff4ff3lff2s3fi_fid2fi2ofi2r3fis3fiz2f1jf2l22fl_1fläf4léf3löf4lü2föf2f1qf2r2f3ruf3rü4f1sf3scf3sifs2tf2süf3sy4f1tf2thf3töf3tü3fugf1umf2ur3fut2fübfü2r2f1v2f1w2f1zfz2afz2öfzu33ga_ga1c5gaiga1kgäs5gä4ugbi22g1cg1dag1dog1dögdt4gd1uge1cged4gef4g2el4g1gg3gegg4r2g1h4gh_gh2egh1lg2hugh1w2g1j4gl_2gls3glüg2ly2gn_gn2e2gng2gnp2gns2gnt2gnug2nüg2ny2gnzgo4a2goggo1igo1y2g1qg2r4gse2g4slgso2gsp4g4swg3sy2g1tg3tegt2sg3tügu1cgu2egu2t2gübgür1güs32g1v2g1w3haah1ahh1aph2as2h1c2heahe3x2hi_2hiahi2ehi2n2hio2hiuhlb4hld4hlg4hll2hlm2h2lohl2ö2h1mh2moh3möhm2sh2muh2nah2nähn2eh1nu2hodhoe42hoih2on2hoo2hop3hov1h2öhö2ch4örhr1chr3dhrf2hrg2h2rihrr4h3rüh2ryhrz2hss24h1th2thhto2h4tshtt4h3tühu1chu2n2hurhüs32h1vhvi23hyg3hyphz2o2ia_i4aai2ab2iaci2afi2ahi2aji2ak2iali2am2iani2apia1q2iasi3au2iavi1ämiär22i1bib2oic1cice1i1cii1clidt4i2dyie1ci1eii1exif3lif3rif2s2i1gi2gli3go2i1hi3heih3mih3nih3rihs2ih1wi1iei3igi1imi1inii3t2i1k4ikei2kni1la6ilbil2cilf22iloilv42im_2ime2imo2imt2imu2inein3f2inoi1nö2inp2inrin1ui1ny2i1oio1cio2dion2i2ori2oui2ovio2xi3ön2ip_i1pai1peiph2ip4li1pr2ips2ipu2i1qi1räir1cir2eir2i2irki1roi1rö2isb2iseis3ti2sü4itäi3töi3tü2itzium12i1v2i1w2i1xi2xai3xi2i1zi2zöja1c2jatje2aje1cje2gje2pje3wji2ajit3ji2vjoa3jo2iju2kjus32j1v3ka_ka1ck2adk2agka2o3kask1ähk1änkär2kby42k3cki1c3kir2kiz2k3j4kl_k2lek1lu2kly2k1mk2n2k3nek3nu3knü3komk2onk2os3kowkö2fk1ölk2r4kst44k1tk2thktt2k3tükt3zku1ckuh12kübkü1c2k1v2k1w3la_1lad2laf1lai3lao1lawlay1lä1c1läd2läf4lät2l1blb2slb2u2l1cl3cl4l1dld3rldt43le_2lec3ledle2e3leh2leple2u3lev2l1flf4ul3fü2l1glgd4l3go3liali1cl2ie3ligli3l2limli2o3liu4l1j2l1klk2l4l1lllb4llg4llk4ll5mlln22l1mlm1clm3plm3tlnd2l3nil1nul1nü3loklo2o2lox2lödlö2f4lög4löß2l1pl3palp2fl3pu2l1q4l1s4l1tl2thl6tsltt2l3tü1luf4luo2lur3lux2lüb5lüd2l1v2l3wly3c3lynly1oly3u2l1zl2zölz1wm1abmae2ma1f3mas3maßm4aymb4lmby4m3ch2m1dmd1ameb43mehme1o2meö3mesmeu1mi1c3mig3mil3mit2m1jm3kaml3cml3lml3s2m1mmmd2mmm2mm3pmm2smoa33moh3mom3mos3motmo1ymö2c4mökm1öl2m1pm2pfm3pu2m1q2m1sm3säm3scm3sem2süm3sy4m1tm2thm3tömtt2m3tümt3zmu1a3munm4us2müb3mün3müt2m1vmwa4my4s2m1z3na_n1af3nain1ar3nas3natn1au3näe3näs2näunby42n1cn2ck2n1dnd1cn2döndy33ne_2nec3nedn1efneg4ne2l3nenne2un2ew3nez2n1fnf2änff4n3finf4lnf2onf4rnf3s4n1gng3mn2gnn3hän3hen3hu3nian1idn4ie3niknin1n2ip2nitni3v3nix2n1k4n1nnn3fnng4n3ni3no_no1cn1of3nov3now3noz2nödn2ör2n1q6n1snsp4n3sy2n1tn3ton3tön4tsn3tun3tü1nu_1nud3nuenuf21nug1nuinu2n1nuo2nup2nur1nut1nuu1nux1nuz3nü_3nüs1nüt4n1w1ny_1nyhn1yo1nyr1nys1nyw2n1znz3so4aco4ado4aho2aro2aso4ato5au2obbob2e1objob1lo3caoc1co1ceo1cio1cko1cl2odrodt4o2ecoen12ofa2ofiof3l2ofo2oft2o1go3ghogs2o1hao1häo1heo1hio1hooh1soh3to1huoh1wo3ieo1imo1inoi2r2o1j2o1kok4n4okrokt4o1lao1läo1léol2io3loo1lu3olyoms2omy12ona2onä2onc2oneono1o1nuon3v1onyon3zoof2o1opo1oro1pao1pi2or_or1ao3räor1c4ore2orf2orh2orm2orq2orro3ru2osh2osio3sk2oso2o1to3tüoub4oug2o3uho3um2our2ouv2o1ü2ovi2ovo2o1wo3wiox2aox2eox3lo2xu1oxyo1yo2o1zoz2eo3ziöb2l2ö1cödi3öf3lög3lög3rö1heö1huö1keök3r3öl_öls2öm2sön2eö3niön2sö1nuö1peör1cör1oöru4ö2saö2spö2stö3su2ö1töt2höts2öze31pa_1paa1pacpag41pak1pap1pat1pau3päd3pär3päs2p1b2p3cpda41pe_pe2a1pedpef4pei11pel1pem1pen1pep3pet4pf_1pfäpff4pf3r2p1g4ph_ph2a2phä2phb4phd2phf4phg4phkph2l2phm2phn2phöph4r2phs2phz3pik1pilpi2o3pip3pispku22pl_3pläp4lo2p1n1p2opo1c3podpo2i3pokpo2wpo3xpö2c2p1ppp3lppt2p2r2p4rä2p1s4ps_p3sep2söp2st2p1tpt1ap3tep2thptt2ptü4pt3zpu1apub42puc2pur3put1püf2pülpün22p1v2p1w3py1pys4py3t2p1z1ra_r1abr2ad1raer2afr2alr2apr1arr2as2raß1rat1raür2ax4räf4räg2räh2rämrä2u2r1brbb2rb2orb2srb2ur1cer1cir1cl2r1dr2dördt43re_2reä3reg3rekre2u2reür1ew3rez2r1frf2u4r1gr1h42rh_2rha2rhä2rhö2rhsrid2r2ie3rigr2isr2itrix12r1j2r1krk4n4r1lr3larl2erl2örl3t4r1mrm2urnd4r3nern3frng2r3nirn1ör1nur1nür1nyro1c2rof3roir2onr1or4roß2rox2röf4rögr1ök4röpr1örrp4arp4erpf4r3porp3tr3pu2r1rrrb2rr1crr2or3ru4r1sr3sirs3lr3sor3sy4r1tr3tör4tsrtt4r3türt3zru1a3ruf4rug2rum3rut4ruz2rüb2r1v2r1w4r1xry2c2r1zrz2ö3sa_3saa3sai3sams1an3sat3säl2sc_2scj2scos2cr2scs2scusd4r3see3seh3seq3set2s1hsh2as3häsh3ns3hösh4rsib43sio2s1j4sk_4skbsk4lsk4n4skö4skss3läsl3bs3les3li4sna4snö3so_so4aso1c3sog3sol3somso3o3sos3sov3sow3sozsö2csö2fs1ös1sp22sp_s2pä2spls3pn2spt4spy2s1q6s1sss3l6st_s2ta2stb2stdst2e2stf2stg4sth2stj2stk4stl4stm2stns2to1stö2stp2stqs2trst2u1stü2stv2stwsu2nsu2s3suv3süc3sün4s3v2s1ws3was3we1s4ysyl12s1zsz2os3zü2ß1b2ß1f2ß1n2ß1w3ta_4taatah22tam3tas3tav3tax4täbtä1c4täd3täe3täg2täh4tämt1äptä2st2ät2täx4t1ct4ckt3clt3cr3te_2teh3ten3tes4th_th2e1thi2thk2thp2ths2thü2thvt2hy3tig3tik3tio3tip3tis3tiv2t1j4t3ltl4e3to_to1c3tod3tok3ton3too4toß3tow4töftö4l3tön4töß3töttpf42t1q2tr_3tritry14ts_ts1ot2söt3sy4t1tt3tit3tot3töttt4t3tut3tü2tub3tuc2tud3tue4tuf2tuh2tuk4tüb3tüf3tüm4t3v4t3wtwa21ty13typtys44t1ztz1ätz2öu1amu3auu1ayu1ämu1äu2u1bub2lub1ruc1cu1ceu1ciu1cl2u1d2u1eu2edu2eguen1u2ep2uffuf3luf3r2u1gugo3u2göu2gü2uh_uh1wu1ieu3iguk2au1keu1kiuk4nuk2öu1kuulb4ulg4u2lü1umf1umg1umk4umm1umr1umz4un_u3ne2unk1unruns21unt1unw2unzu3ofuos2u1pau3piu1pr2ur_u1raurd22ure2urfu1röur3purt2u3ruurü2u2sü2u1ß2u1tu3teuto1u3töu3tüu1ü22u1xux2eux2oux3tu1ya2u1z2übc2übdübe2üb3lüb3rüd3rüf3lü2gnüg3süh1aü1heüh1iüh1süh3tü1huüh1wül1aül2cül4eü1luün2sünt2ü1nuü1peü1piür1aürr2ür2süs2aü2stva1cva1sv4at2v1b2v1d1ve2ve3bve3cve3dve3gve3hve4ive3over1ves12veüve3v2v1g2v1hvi2cvig22vii2v1k2v1m2v1n3vol3voyvö2c2v1pv3revs2e2v3t2v1v2v1w2v1z1waa1wag1wah1walwa2p1was1wäh1wäl1wäswbu22w1c2w1dwe2a1weg1wehwe2i1wet2w1g2w3h1widwi2ewik21wil2w1k2w1l2w1mwn3s1wohwot21wöc2w1pw3ro2w1sws2t2w1twti21wucwul2wus21wühwül2wün32w1w1xa_1xae2x1bx1cex1chx1cl4x1d2xekxe2lx1emx2en3xes2x1f2x1g2x1hxib4xi1cxi3gxil1x3läx3le2x1m2x1nx1or4x1p2x1r4x1txt1äxt1uxu1axu2s2x1w3xy_3xys1yacy1äty1c2y1d4y2efy1f2ygi2yg2lyhr2y1i4y1k2yl3cynt2y1nuy1ofyom2y1ouypa2ype2y2pfy3phypo3y3riyrr2yse1y1t2yu2ry1z2za1c3zahz1anz1as2z3czdä1ze1e2z1h2z1j3zolzo2oz1orz1öl2z1qz3saz3shz3skz3sz2z1tz3töz3tüzu3azub4zud4zu3kzuz22züb2z1v4z1zzz2ö",
		5 : "_ab1a_abi4_ab3l_abo2_ack2_ag4n_ag4r_ag2u_ai2s_al2e_ang2_an3s_apo1_aps2_as3t_at4h_au3d_ät2s_by4t_dab4_de1i_de1s_dü1b_dys1_ei3k_eke2_enn2_er1e_erf4_er1i_es1p_et2s_eu3t_ext4_fe2i_fi2s_ga4t_ge3u_im2a_im5m_in3e_ink4_int6_inu1_ire3_is2a_jor3_ka2i_ki4e_kus2_li2f_ma3d_ma2i_me2e_ne4s_ni4e_nob4_nus2_ob1a_obe2_or2a_ort2_ozo4_pro1_ro4a_rü1b_sch4_sha2_te2e_te2f_te2s_ti2a_tid1_ti2s_to2w_umo2_un3d_un3e_un3g_un3s_ur2i_ut2a_ut3r_übe4_vo4r_wa2s_wi4e_wor2_ya4l_za2s_zi2e_zwe2aa2beaa2gr4a2araart4aas5tab2äuab1ebabe1eabei12abela3ber2abet2abew3abfiab1irab1it2ableab3liab4loa2blua2bo_ab2ofa2bon2abora3braa4brä2abrü2abs_abs2aab5scabst4ab3szab1uraby4t2ac1ca1cem2ach_ach1a2achba1che4achfa1chiach3lach3mach3na1choach3öach3ra4chta1chuach3ü2achvac1in2ada_ad2ag4adav1a2dä2ade_2aden4a3diad2obad3ru2ads2ad3stad3szad4tead4tra2elaa2eleae2o3aes5ta2faka2fana3faraf4ata2faua2fexaf2fl2af3lafo1saf3raaf3räaf3reaf3röaf2spag1abag1arag1auag2diag2drag2duage1i2agesag3gl1aggr2a2glag4laa4glöag4nuag4roagsa2ags3pag2th2a1haah4at2a1heahe1sa1h2iahin3ah2löahnt21ahorah1osa2h3öahr1aah3riaht3saian3aid2sai1e2aien3ai3g4a3ik_ai3keai3kuai2loa1indain4ea1ingai2saaiso2a3iv_aive3a3ivla3ivs2akal2akarak4at4a1kea2kefa2keu2a1ki2ak3lak4li2a1kr4akra3akroak3sh2akta2aktb2a1kua2kun4a3kü2ala_al1abal1afala2ga3lalal1ama2larala4s2alatal1aual1ämal2bralb3sal2däal2dral3dualen1ale2pale4talf4r3algi3almba2l1öal2ös1alphal2ufa2lumal1ural2zw2am2aamab4amad2ama3g2am4e4ame_a2meba3meta2mewa3mi_a3miea3mis2ammlammu2am3pr2am2sam3sa1amt_am4töam2tu2ana_2anabana3ca3nak2anam2ananan1äs2anbuan3ch2and_2andua3nee2anfi4ang_2angf2anghang1l2angoang1r2a3nian2id2ank_an3klank1rankt4an2ky2anmu3annäan1oda3nola3nos2anpr1ansä1ansc2ansk2ant_2anto1antr1antw2a1nuanu3s2anzb2anzg2anzs1anzü2anzwa1os3ao3t2a3ot_a2pefa3pelap2faa3pfla3phäa2pht2ap3la2pot3applap3pu2a3pua3ra_ar2ab2arb_4arba2arbiar2bl2arbr2arbt2arbu1ar1ca2reaa4rega2reha4reka3renare3uar2ewarf1rar2glar2gnar2iaar1ima3riuarm2äarn2e2a1roar1oba2rorar2rh2arsaarse32arsiar2st2artoart3r2artsar1ufar1uhar1umarwa2ar2zä2arze1arztas3aua2s1äa2sca4as2ea2seb2asisas1ora2s1pas2phas2pias2poa3spuas2stas3teas3tias3to2astraßen3at1abat2afat4agata3la3tama2tatat1aua2t1ä4ate_a2teb4atena2tep4atesat3ha3athl4a3ti4atorat3räat3reat2saat2seat2siat2soat3taatt3sa3tubatu2nat2zoau2draue2baue2sau2faauff43aufn4au1iau2isau3lüaun2eau1nua4unz2aup22ausc1ausd3ausf1ausg1auslau2so1ausr1ausü1ausz2aut_2aute1autoauz2wa3v4aawi3eax4am2a1yaa1yeuaysi1ä2b3lä1cheä1chiäch3lä2chrä1chuäck2eäf2fläge1iäge3sä2g3lä2g3räg4ra1ä2gy2ä3heähl1aähl2eäh3neäh3riä1is_ä1iskä2k3lä2k3rälbe2äl2bläl2p3ämt2eän5deän2dräne1sän2f52ängeän2glän2gr2ä3niänk2eän2kränk2säp2pläp2präp4stär4afäre2när2grärk2särm2särse2är4siär2stärt4eär2thär2zwä5s4eäse3tä2s1päss2eäs2stäs4träte2nät1obä2t3rät2saät2sääts3lät4trät2zwäu2bräude3äu3eläuf2eäug3läu2maäun2eäu1nuäu3seä3usgä3uskä3usnäu2trba2bl2babs2b1afbais2ba2kabak1lbak1rbal2a2b1amban2ab1ang2banlban3tb1anzbar3bbar3nba2scba2stbau3gbau1sba1yobben3bbe4pbb2lö2b3d4bde1sbe3anbe3arbe3asb2ebe1be1cbedi4be1eh3bef4be3g2beil2b2einbe3li1ben_ben3nbe1ra3be1sbes2abe1ur3b2ew2b1ex2b5f4bfal22b1g2bges42b5h2bhut2bi3akbibe2bie2sbik2abil2abi2lubin2ebi2o1bio3dbi3onbiri1bi3seb1isobi2spb2it_b2itebi2tu2b1k4b3lad3blatb3leb3blem3blenb4letb3leub2lie2bligb3lisb2litb4locb3los2blun3blut4b3n2bnis1bo5asb1ob3bo2blbo2brbo3d22b1ofbo3febo1is3bon_bond1bo2ne3bonsbo4räbor2sb1ortbo2scbo3thbo2xibö2b32b1p2bpa2gb4ra_b4rahbrä4u2bre_3brea2breg3bremb4rer2brigb4riob3rohb4ronb4rucbru4sbs3arbsat2b4särbs2äubs2cabs4cub3se_bse2bbsi4tbs2kubso2rbs2plb3stob3stöb3stübtal3btil4b4ts2bu2e3bu3libung4b2urgbu2sa2b3z22c1abca1chca2e3ca3g4cal3tca2pecar3ncas3tca1y2c1ch2ce2drcen3gcere3ce3sh2ceta2chab2chaf1chaoch1äs1chef4chei2chic2chl2ch2lech2lu4ch2m2chn42chobcho2fch1ohch2r44chrech3rh2chuf2chuh2chum1cka_2ckac1ckag2ckalcka4r2ckau2ckeh2ckexck1imck1in3ckis2ck3l2ck3nck1o22ck3rckt2eclet4co3chco2d2co3dicoff4co1itco2keco2lecol2oco2peco1racor3dco3reco4te1c4r2cte3ecti4octur6cu2p32d1ab2d1acdagi2dah3lda1ho3d4aida1inda1isdal2ada3löd1altdamo3d4ampd2an_d1ang2danw2d1apd2aph4dapp3darlda2rod3arrdar3sd1artda2rudas4tdat2a4datmdau3e2dauk2d1äh2d1äp2därzdä3us2d1b4dbu2cdco4r2d1d2ddar2de2adde3asde3b43de1cdeco3de1e4de3gldehe2de3hod2eicde2löd2en_dend2den3gd2enhde2nide1nude1ondepi2d4er_de3rude2sade2spde2sude1unde3us2dexpd2exz2d1f42d1g2d2ge_2d1h2d2hisdi4abdi2addi4amdi1cediet3dik2adin2adi2obdi2spdist2di2tadi2thdit3sdi2tudi3z22d1k44d1l2dli2f2d3m24d5n2dnis1d2obadob4ld2obrdole4doll22doped2opp2dorc2dordd2orp2dortd2os_dos3sdot6hdo3undö2l13d2ör2d3p2drag4d3rai2drädd4räh4dre_2dreg4drem2d3rhd4ri_d4ridd4ried4rifd4rikd4rild3robd3rocd4roid3roud5rubdrü1bd2sands1änd3seidse4td3shodso2rd2späds2peds2pods2pud2steds2tids2tud2sundta2dd5teadt3hodt5s2du1ardub3l2d1uh2dumd2dumf2dumg2dumld2ump2dumrd1umsdung42dunrdun2s2duntdus3t2d1v2e3a2beab3lea2drea2g4ea3gaea3gleakt2ea2laeam1oea2nae2anoe3ar_ea2rae3arre3arveas3se3athea5tre3aug2ebedebe2i2ebeleb2en2ebeteb3loeb2lö2eb2oebot2ebö2seb4rueb2s1ebse22e3caech1äe1chiech3lech3mech3ne1chuech1weci6a2eckt2e1clec1s4e3d2aed2dre3deiede2re3d2oeds2äed2suedu2se3dy3ee3a2eeb2lee2ceee1chee2ckeede3e1effeef4leef3see1imeel2ee1empeena2e2enäe2encee3nie2enoeen3see1rae1erde1erkee1röeert2e1erzee3s2ees3kee3taee2thee1u2e1e2xef1are2fate2fäue3fe_ef1emef2er2eff_1effief2flefi2s1efkue3fraef4rüef3soef3spe2fumege1ue2gloeg3nieg2thegus32e1ha2e1häeh2eceh2ele3hereh1läehle2eh3loeh3mue3holehr1äeh3rieh3sheh3übei2blei3de2eidn1eifrei3gl2eigt2eigu2eil_2eilbeil3d2eilne1impei4näein3kei3o2eip2fei3ree1irre2is_2eitäei3teei2theitt4e3ke_e3kene3kese3keye3k2lekt2oe3k2wela2cel1afela2h2elaoela4s2e1läel2da2ele_elea2ele2c2eleh2elei1eleke3lepe3leu2elevele2x1elf_el3feelf4l1elfm1elfte3lieel3klel3leelm2ael5nae2lofe2lolelon2el2öfelö2selto22e1luel1ure2lyaelz2eema2keme2se2mop3empfem2saem2stem3t21emule2n1a4ena_2enace3nade4naf4enahe4nak4enam4enaten1äu2ene_2enem2enen2enesenf2aenf2uen3geen2gl1engpe3ni_e3nice4nide3niee3nio2enise3nit2enive2nofen1ohe3nolen1one3noteno2w2e1nö1entd1entn2entü1entw1entz2enut4enwüeo2fee1on_e1onde1onfe1onle1onre1onse1opee1opfeop4te3or_e3orbe3orse3orweo1s2e3os_eo3ulepa2gep3leep2paep4plep2prept2aepu2se3ra_era2ge1raie2rake1rale1rape2rare1rasera2ße1rawe1razer1äher1ämerb2eer3brer3da1erdber3de4ere_er1ebere2l2eren2erer2ereserf2eerf4rerg3s2erhüe3ribe3rio2erk_erk3te3ro_er3oaer1ofer1ohe3rone3rose3rowerö2d2eröker3p4er3rä2errüers2aer3seers2ier3sker3sner3sper3sz4ertier3uzerü4bes3abes3ake3sceesch2es2eles2hues2ide2siles2ire4skees3kles3kue4skye3sote3spies3sces3se2essoe1stre1stues4tüetab4et1am3etapet4atet1ähet2enete2oet3hüeti2m2e3toeto2bets2pet3suett1aet2thet2zäet2zweu1a2eu2gaeugs4euil4eu1ineu2käe3um_e3umbe3umleun2eeu1o2eur2eeu3speust4eut2heu2zw4everewä2se2we_e3wirewi2se3witex3atex1er1exis2ext_ex2tu2e3xye3z2aezi2sf1abefab5sfa2drfaib4fa2ke2fanb2fanf2fanlf1anp2fanrfan3s2fanw2f1ap3farifa3shf3aug3f4avfa2xa2f1b22f3d4fdie2f2echfe2drfe2eife1emfef4lf4eief1eisfel3tf2em_fem4m2fempfe2näfen3gfe2nof1entf2er_fe1raf2eref2ertf1erwfe2st3fete2fexpff3arff1auffe2eff3eiffe2mff4enf2fexff4laff4läff4lof3fluf3flüff3roff3röffs3t4f3g2fge3s2f1h2fi3atfi4dsfien3fi3klfi2krfil3dfilg4fi3lif2inafi3nifin2sfi3olfi3rafis2afis2pfi3tu4f1k4f3ladf3lapf3länf4leef3lerf3li_flo2wf4luc2f3m22f3n2fni2sfob2l2f1offoli3fo2nafo2nu2f1opfo1ra3form2f1ök2f1ölför2s4f1p2f4racf5radfra4mf5rap2fre_f3recf3red2fregf3repf4reufri3dfri2e2frig1frisf3rocfro2sf3rotf2sanfs3arf4scefs4cofse4tf2sphfs1prfs3s4fs3thf4ta_f2tabft1afft1anft1arf3tatft3hoft1opft2s1ftsa2ftse4ft3stf2tumftwa4ft3z23f2uhfung42funt2gabfgab4r2gabz2gadlga1flga2kagal2ag4amo2ganbgan3d2ganh2ganlgans22ganwga1ny2garb2garc3gardg2arsga3ruga2saga2siga3spgas3sgat2a2gatmgat4rgau1cg2aukg1aus2g1äp2gärz2g1b2gber2gby4tgd1ing1d3rgd3s2ge3a2geb2ageb4rge1e2ge3ecge2esge1imge1irge2isge3lege3lügelz2ge3migem2uge3nagen3ggen3ngeo2rge1ouge3p4ge1ragerm4ge3sigest2ge5trge1ulge1ur2g1ex2g1f4gga4tg2g3lgg4log2g3n3gh2rgie3ggi2elgi2gugi3negi3tugi4us4g3k2g1labg1lac3glad3glätg2l4e2gle_3gleag3lecg3leg2glehg3len2glesg4lia2glib2glifg2lik4gling2lio2glisg2lizglo3gg2lom2g1luglu2t2g1m2g2n2ag4na_2gnacg4nat3g2näg3neh2gneug2nieg2nifg4nin3g2nogno1r2g1of2g1ohgol2a2gord2gorggo2s1go3stgo3th2g1p2g4rebg4remg4rerg3retg3revgri2e3grif2grig2groc2grohgron4g4rosgro4ug4ruf2grut4g2s1gsa2gg3salgs3angs3arg3s2cg4scagsch4g4scogs2ehgsen1gs3ergse4tgsi2dg3silg3spigs3plgsrü2gs5s4gs3tag3stog3stögs3trg3stugs3tügti2mg5t4rgu3am2guedguet42g1uhgu1is3gummgu4stgut1agut3h2g3z2hab2ahab2eh2absha1kl2haleh1alph1amth2an_h2andh4ann2hanr2hantha2plha2pr2harbh2ardhasi1h1äff2h3b22h3d4hdan2he2adhe3behe2blhe3brhed2ghe3dihee4she2fä2heffhe2frhe2fuhe3guh1eieh1eifh1eighe2im4heioh1eiwhe3lihe3lohe2lö3hemdhe3mi3hemmh2en_he2näheng22henihe2nohen3z4he2ohe3onhe3ophe3phherg22hermhe3roh1eröhert2he3thhet2ih2e2uheu3ghe1y22h3f4hfi2s2h3g2hget42h1h2hi2achi1ce2hi3dh2idehi2krh1infh1inhhi3nohi4onhi3or2hip1hi2phhi2pih2i2rhi3rahi3rihirn1hi3rohir2shis2ahi2sehis2phi2sthi1thhi3ti2h1k4h4lachla2nh1lash1lath3lädh1läsh1läuh3lebhle3eh3lerh3lesh3lexh2lieh2lifh2liph2lish2lith3lochl1ofhl1oph4lorh3löch2löshl3t2h3lufh3lukh1lüfh2mabh3magh3manh3marh4mäch4mähh4mälh4mäuh3me_hme1eh3menh4monhm3p4hm3sahms1phn1adh3namhn1anhn3d4h2nelhn3exh2nich2nidh2niehn1imhn1inh2niphn3k4h2norhnts2h2nuch2nulho2blho2efho4fa3hole4holo3holzhom2ehono3ho1rahor3dh1orgho3slho2spho4st2hot_ho3thh1o2xho1y2hö3ckhö2s1h3öst2h3p2hr1achr3adh1raih3räuh2rech3redh3refh3relh3rephre2th3revh3richri4eh3rinh2robh3rohh3rolh4ronh2rorh3rouhrs3khr2suhr4swhr2thh3ruhh4rübh2sanh2sauh2späh2sphh1stah1stoh2s1uh2t1ahta4nht2ash2tärht1ehhte2sh4thohtod1h3töpht4riht3röht2soht2sphtti2ht3z2hu2buhuko3hu2lähu2loh1umsh1unah1up_h1upshurg2hu3sahu2sohu2tihut2th4übsh3übuhvil4hwe1c2hy2thzug4iab4liaf4li3ak_i3akti5al_ia2läial3bial3dialk2i3allia2lui4amoian2ei3anni2anoi3anti3anzi3ar_ia2rai2ascia3shi2asiias3siast4i3at_i4ate1iatri3atsia3uni1är_i1ärsi1ät_i1ätaib1eiibe4nibi2ki3blai3blei2b1öi4bräich1aich1äi1chei1chiich3lich3mi1choi1chuich1wi3damid2ani2deiidni3i2dol2i2drie3a2ie2bäie2blie2ckie2drie1e2iel3di1ell2i1eni3en_i3enai3endi2enei3enfi3enhi3enji3enki3enmi3enni3enöi3enpi3enrien2sie1nui3envi3enwi3enzie1o2i2erei4erii1ernie2röies2pie3sui1ettieu2eie1unif1arif4atif1aui2fecife2iif2enif2flif4läi1flüif4rai1freif3seif3spif2taiga3iig1läig4nai4gnäig4noig4raig3säig4seig3soi2harihe1eihe4nii3a4i1i4si2is_i2käri3ki_ik1ini2k3lik3noiko3si2kölik3räik3reik1s2ik3soik3szikt2eikt3ri2kuni3kusi1lä1il2daild1oil2drile2hil1el2ill_2illsi1lu2i2lumi3lusim4ati2megi2meji2meki2mew1immo1impoimp4s1impuim2stin2afin3ami3napina4sin1äsin3do2indrin3eii3nelin1euine2x2ingain2gl4inhei3nie2inigin2ir2inis2inn_2innlin1odin1orino3tin3suint2hin3zwi2odaio3e4iof4li2o3hio3k4i3ol_i3om_i3omsi3on_ion3di2onyi2o1pio4pfi3opsi3opti3or_i3orci3orpi3orsi3ortio3s2i2osti3ot_i3otsi3oz_i1ö2ki1ös_ipen3i3perip3fa2i1piipi2sip2plip3pui1r2ai3radirat2ir2bli3ree2irek2i3réir2glirg4sir2he2irigir4mäir2no1ironiro2sirr2hir3seir3shir2sti3sacis2api2saui2scaise3eisi2ais1opis1pais1peis3sais2stis4töis4tüit1amit1ani3tatit1auit2ärität22itelite4ni2texi5thr1itiii5tocit3rei3truit2sait2soit1uhitut4it2zä2i3u2i2vebive4niwur2ix2emiz1apiz1auize2niz4erizo2bi2z1wja3nejani1ja1stje3najet3tjo2b1job3rjoni1jo1rajord2jo2scjou4lju2blju3nijur2ok3a2aka3ar2kabh2kabska1frka1inka3kak1allkalo5k3amakand4kan2ekank42kanlk1anska3nu2kanw3kara2karbk2ardk2argk2arkk2arskar3tkaru2k2arwka3sekasi1kas3s2kattk1auskäse32k3b4kbo4nkbu2s2k3d2k1effkefi4kege2ke2glk1einkei1skeit2ke2lake2läk4eltk2en_ke2no2keo2ke2plk2er_k2erck2erlkerz2k6es_ket3ske1up2k3f42k1g22k1h4kho3mki3a4ki3drki2elki3k4ki3liki3lok2imik2in_k2ing2kinhk2inik2innkin3ski3orkio4skis2pkist2ki3zi2k1k44kla_k4lar4kle_4kleh2klic2kligk2link3lipk2lir4klizk4lopklö2sk2lötkluf23knabk4neiko2al2kobjkoff4ko1i2kol4ako3leko4muko3nu2kop_ko1pe2kops2kopzko3riko2spko2stko3ta2k1ouko2wek1o2x2k1p2k4rawk4raz2kre_2kreg2k3rh2krib2krip3kris2krufkrü1bk2sanks3ark2sauks2änksch4ks3hak3sofks1paks2puks3s2k1stak1stek1stok1strk1stuk2s1uk3talkt1amkt1anktä3skte3ekt1eik2texkt3hokt1imk3topkt4rokt3s4kul2a4kulpkung42kuntku2roku2spkus3tku2sukür4s2k3z2kze3lla3ba2labb2labf2labg2labhlab2ol2abr3labu2labwla1celad2il1adl2ladm3ladul1advla2falaf3slaf3tla2gala2gnlago2l2akk2l1al4lall4lalpl2amil2amp2lanb2lanf2lanll1anp2lanslar3sla2ru4lasdla3se2lash2lasila2so2laspla2stlat2ala3telat2s1lauglawa41länd2läub2läuc2läue1läufl3bacl3blälb3lel2blil3blolb3salb3selb4sklb3splbs6tl3chel3chilch3llch3rlch3ülch1wlda2gld1all3daml3dasl3datld1auld1ärl2deil2dexldo2rld2osld2ö2l2dreld4rüld3sald3stld3thle2adle2bl4leddle3dele3eilef2ale2gäle2glleg4r4lehs4leht3lei_l2eicl2eidl2eitlel3s4lemplem3sl2en_le2näl2enfle3nil2enkle1os3lepa3lepf3leprl2er_lerb4lerk2ler3tl1erzles2ele3shlesi1le3skles2t4lesw2lesy2leto4leud3leut2lexe2lexzl3fahlfe1elf3lolf2trlfur1lga3tlg3rel3gro2l1h23lhi_li3acli3akli3arlia1slibi34lickli4ds3lie_lig4nli3keli2krlil2a3limolin2al1inv2linzli4om3lis_4lishli2spliss2lit2ali3telit2hli3tu2lixili2zalk3lolk4nelk4ralk2s1lk3sälks3tl3k2ülla2nl3lapll1aullch4ll3d4ll2emll2esl2lexll3l2ll1obl3lowl2löfll5t4llu2fll1urll3z2lme2el2möllmpf4lms2tlna4rl3n4e2lobjl2obrlo1fllof4rloi4rlol2a2lopf2loptlo1ralo4rä2lorcl1ordlo3ro3lorq3los_lo4sa3loselo2ta2l1ovlo2velö2b3l1öhrlp3t42l3r2lre1slrut4lrü1bl3sacl2saul3sexlsho2ls2pels2pols3s2lst2al2stels4trls2tuls1uml2sunlsu3sl2tabltag4lt1aklt1ehlt2enlt3hol3thul2toblt1oplto2wlt1öll3törlt1ösl3trält3relt3sclt2solt1uhlu1anluba2lubs2lu2drlu2es2lufflu2golu2gu2l1uhlume22lumf2lumll2umpl1umsl1umw1lu2n2lunt2lunwl1urnl1urt2luselu2splu4stlu2tälüh1lly1ar2lymply3nolzo2flz3t2m2abe2mabk2mabs2mabtma2cima3damal3dmalu4mam3m2manbm2anfm2anh2manlm4ann2manzma2orm2app2marb4marrm1arzmat4cma3unma1yom1ähnmä1i2m1ärg2m1b2mbe2em3b4rm2d1äm2deimds2em2e1cmedi32medyme1efmega1m2eil3meldmell2m2en_m2ens2meou3mer_me1rame2ro3mersmes1ame4sä4mesume3th2m1ex2m1f4mfi4l4m1g22m1h4mi2admi3akmibi1mi3damie3lmi2ermi4etmi2kimi2ku4milzmi3nimi1nu3mir_mi3ra3miri3mirs3mirwmi2samise1mi2tami2th4mitz4m1k44m1l2m2mabmm1eimm3simm3spm2mummm2unmmül22m3n22mobj3m2odmo2dr4mog_mo2i32mol_mom2e3m2onmo3ne3mo2o2moptmo1ramork4m1o2xmp2flm3ponmp3ta2m3r2m2sanm4sapms1asm2saumsch2m4scom4sexmso2rm2späms2poms2pums3s2m3stoms4trms4tüms1ummt1abmt1akm3tammt1armt3homti2smt1ösm4ts1mt2samt2semt1um2m3uhmu3la2mulsmu3nim4unkmunt24munzmu3ra3musimu2spmus3tmu2sumuts32m1w2mwel42n1abna2bä4nabg4nabhna2bln2abona2br4nabt3n2ac4naddn2ade3n2ag3n2ahn3ahnnai2en3aign3air2n1akna2ka3nakon2al_na2län4alena2lu2nalyn4am_3name3namon1an_4nanb2nanh2nani4nank2nanl3nannna3non1anp2nanr2nanw5nar_2narcn2ard4narg3narin2ark2narmn2arpn2as_4naspn4ata4natmnats14natt4naufn3aug5naui3n2äcn1ähn2n1ännä2scn2äss2n3b4nbe3nnbes4nbu2snch3mnd2agndat2nd1aun2dein2dobndo1cnd1opnd1orn2drönd3thndt4rn2dü4ne2apne3asne3atne2bl3necane1ckne2de2nee32neff3nehm2n1ein2eid4neifne2ke3nelanel3bne3lin2em_n4en_n2enbn2encn2enhne2nin2enjnen3kne2non2ensn2envn2enwne2obne1os2nepfn2er_ne1ranere2n1erfn1erh3nerin1erkne2ron2erpn2erv3n2esn4es_nes4cnes1one2thneu1cneu3g2n1exnf1aknfo1snft2on2f1ung1adng3d4n3gefn3gerng3g4ng3hun2glon2glöng3neng1orngs3cng3tsn2gum2n1h4n3hann3harn3haunhe2rnib4lni2deni3drnie3bni1elnig2anig3rni3klni2kr3n2ilnim2o2ninfni2obni3okni3olni3ra3n2isni2tinit4sni3tunk2amn2kähnke2cnk2lonk2lunk4nan2knenk2öfn2köl2n3l22n1m4n2naunne2snn2exn2nofnn3scnn3senn2thnn1ur3nobl2no2dno3drn3olen2on_3nor_nor2a2norc3norh3norm3norsn1ortno3shno2spno2täno2tr2nö2f2n3p4npa2gnpro1npsy32n3r2n3savns2cans1ebnse2tn3sexn3siln2sphn2sponsrü2ns3s2ns2tins2tunst2ün2styns2umnta3mnt4atnt1ämnte2bnte1ent1ehnt2enn3ternteu3nte3vn3thrnti3cntmo2nt3sants2onts2pnts2tntum4nt3z21nu1anu3arnubi11nu1cnu2esnu2fe2n1uhnu3k4n2um_2numf2numg3numm2numr2nuna2nunt3nu2snu3scnu3senu3slnus1pnu2ta2nü4bnür1c2n1v2n3ver2nymun2zadn2zann2zärnz1ecn2zornz2öln2zwö2o3a2o4abioa3deo4a3ioa3ke2obano3bar2obe_2obea2obewobi4t2o3boo3briob3skobs2p2o3buobu2s2o3bü2oby4och1ao1cheoch3loch3moch1ooch3roch1socht2o1chuoch1wo3ckeo3ckio2ckoo3d2aod2dro3debo3dexo3diro3divo2donodo4so2dre2o3du2o1e2o4e3so2e3to3et_o3etsof1amof1auof2eno3feroffs2of2fuof1laof4läof4löof3raof3räof4rüofs1aof3thoga3dog2loo3g4nog3spohl1aoh3looh2lu3ohngoh2ni1ohnmo2h3öohr1aoh1ro2o1hyo1i2do2isco1ismoiss2oi1thoki2ook1läo2labol2arol4drole3eoler2ole3sol2faol2flolf1rol2glol2grol2klolk3rol2of1olymol2zwo2mabo2mebome3co2melo2mepom2esom3maom3pfomtu3ona2bo2naeo3nalon1apon2auonbe3one2ion3f2ong4rong3s4o3nion3k2onli4o3nodono3sons1aonsi2ons3lons1pont2hont3s2onukoor3foo4skoo2tr2o1ö2opab4opa5so1peco1peiope4no1pes2opf_op2fäo2pfeopf1l4oph2o3pheopin2op3li2o3poop4plop2pr2o1pr1opsiop3szo1rad2orak2oral3oramo1rasor1ätorb2l2orcaor2ce4orda1ordnor2do2ordr2ords2ordwore2hor1eror3gaor2glor2gn4oril2oritork2aork2s2o1ro2o1röorr4aor3rh2ors2or3shor3szor4töor2ufo2r3üo2ryaos3ados4anosa1sos4co2o3seose3eose2no3shoo4skaos3keo4skios2lo2os1pos2saos4säost1aos3to2osu42o3syo2tebote2s4ot2hot4heo2throt2inotli2ot4olot2oroto1so3traot2saot3scots1pot2thou2ceou2geou3glouri4outu4ove3so3wecoy1s4ozon1ö2bleö2b3röb2s3öch1lö2chröch2söcht4öd2stöf2flöh3riö3ig_ö2ko3öl1a2öl1eiöl1emöl4enöl1imöl1inöl3laöl1o2öl3saöl3szö2l1uölz2wönn2eön3scön3spöpf3lör3a2ör2drör2glör2klörs2eört2eör2trös2stös3teös2thös3trö2t3aöt2scöt2trözes4pa3dapa2drpa2elpa3ghpa1ho1pala1paläpa3li2paltpank42panlpant2papi23para1parc2parg1paro2parppa4stpat4cp3auf3pä2cpä2to2p1d2pea4rpech1pe2en2peicpe1im1peitpel3dpena4pe1ra1perl3pero5perspe3sape2stp2fabp2fadp2fafpf3aip2feipf3lopf3lup2forpf1ra2pfs2pf3slpf3sz2pf3tpgra2p3hopph3t2phu4s2p1hüpi2a3pias4p4id2pi2el3pierpi3lepin2epi3oipi2pepi3ri4pisopi1thpit2s2p1k2pkur11p2l43p4lap5la_p5lad2ple_ple1cp4legp4lem2pligp4likp4liz2p3lu2p1m2po3b42p3ohpo3id3poin3p4olpo3li2pondpo2plpo3pt2pornpor3spos2epo3ta3potepö2blp2p1hpp1läp2plep2pripp3sa1prak1prax1präd1präg3präm3präs2pre_2prec1pred1preipri4e2prig1p4ro3prob2proc3prod3prog3proj3prot1prüf2prünps4anp3s2hps1idps2pop3staps2tup3stü3p2syps2zept2abpt3atpte4lp4tospto2wp2t3rpt3s2pt1um3p2typu2dr2p1uh2pundpun2s2puntput2spwa4r1queura2abr3aalra3ar2rabd2rabf2rabgra2br2rabs2rabt1rabyra1cer2ackr4ad_rada23radf3radlrad5tra2gn4raht2raic1rake3rakür4al_ral3bra3le2ralgr4aliralk2r4alsra2lu3ralyr2ammr2an_4ranc2ranf2ranl2ranr2rapfr2ara2rarbr2arkr2arpr4as_ras2ar4at_r3atlrat4r4rau_4raud2rauf2raug3raum3r2äd3rän_3räni3räns2r1ärr2är_rä3raräu2s4räutr2bakr3blärb2lörb4rirb3serbs1orb3sprby4tr1chirch3lrch3mrch3rrch1wr2ck1r2dafrd2amr4dapr2deir3denrd1itr2dobr3donrd1osrd4rird3tard3thrdwa4re2amre3asreb1rre2bür2ech4reddre1elre1er3refe4reff3refl3refo5reg_rehl4r2ei_r2eie2reigr1einre3larel2ere3lorelu2r4em_r2emi4remur4en_r2enare2näre2nir2enzre3or3repe3repo4reppr1erfr1ergr1erkr1erlrer2nr2eror1erör1ertre2sa3rese3reso2ress3rest3resu2reulre2wi4rezirf2äurf2esrf4lör3flür3forrf4rurf4rürf2sarf2targ2abrg2anr2gnor2ha_r3herr2hoe2rholrhu2sri3amria1sri3atri1ceri1elri1euri2frrif3s5rig_5rige5rigjrig1l4rigrrik1lr2imb2rimprim2s2rink3rinn2rintr1inv4r1irris2ari3so3rissri2strit4r5riturk2amr2kährk4lork2lur3krirk2sprk1strk2tark1uhrk2umrku2nrle2ar3lecrle2ir3letr3l2irli2sr3l2orm2ärrm3d2r3me_r2meorm2esrmo1srm3sarmt2arna2brna4nr2naurn3drr4nefrn2eirne2nr5nesrn2etr4nexr3nodr1nötrn1ur2robj2robsro3e4roh1lro1irro3lerol3s2roly4rom_4romm4romt3ronnrons2ro1nyro3phr2oraro3shros2p3routrö2du1r2öh1r2öl3römir2ös_r2öse2r1p2r2plirpro1rps3trr2abrr2arrr1ämr3r2er4rewrr2herrik2rro3mrr2strr2thr3r2ürrü1brs3abrs2anrs3arr3shors2klr4skor4skrr4skurs4nor4sobrs2p4rs3s2rs2thrs2tir3stor3störs2tur3swirtal2rt1amrt1ärrten1r2thirto1prt1orr5trirt2sorube2ru2drru2fa3ruinru1is4rumfru2mi4ruml4rumz2rund4runn4runt2runwru3pr4r3urru2ra5ruroru2siru2strut3hru2zwrü1ch4rümmrz2anr2zarr2zasrz1idrz1oprz3terz2thr3zwä2s1absa2besa2blsa2br4sabss1adm3safasa2fe3safi3sagasag4nsa2grsail42s1aksa2ka3saki3sakr4sakt3salo5samms1amps2an_s3anbs2and3sani2s1apsa2po3sapr2s1ar3saris3arrs1aspsat2a4satmsa2trsa3tss1a4u3sau_3sauc3saue3saum3saur2s3avsa2vos3ähns1ält2s1äm2s1är3s2ät3säul2säuß4s3b4sba4n2scams2cans2cap2scar2s1ce4sch_s4chä4schb4schc2schd2schf2schg2schh2schks4chls4chö2schp2schq4schss4chu3schü2schv2schz4s3cl4s3d2sde1sseb4rse1ecse2glseg4rse3heseh1lseh1sseh3ts1ein3s2eks2el_s2elsse2nä3senkse2noseo2rs4er_3seraser3gs1erh3seriseru25ses_se3su2s1exse2xe4sexpsex3t4s3f4sflo44s3g2sha2k1shass3h2e3shi_3shidshi4rs3hoc4shof3shop3showsi2ad2siat5si1cs2ido3s4iesien3sie2ssi1f43s4igsig4nsi2kisik1lsi2krsik3ssi2ku3silosin1ision43s2issi2sasis3s3s2itsit3rsi3tusiv1asive3si2vr2s1k24skams3kar4skass4keps2kifs2kig4skirski1s3skiz4skom4skor4skow4sk3t2s1l23slal4slans2laws3lo_s3loe2s3m22s3n4snab4so3baso3et3softso3la3s2onsone2so2ny2sopf3sor_s1orc3sorsso4rus4os_2s1ox2s1ök2spaa2spaks2pan2spap2spaus2paz3späh2spärs2pee2spel2spet4s3pf2sphas3phe2sphispi2k4spil3spio4spip4spis4spla4splä2spod2spogs2poi2spok4spol4spr_3spru2s3ps2spun2spup3spur4sput4s3r4sret3srü2ds5safs3sagss1ajs3sals3s2äs4sces4scoss1ecssoi4ss2poss3s4sst2ass2thss2tis3stü4sta_3staast2ac2stag3stah2stak2stax3s2tä4stäg2st3c2steas2ted4stee2stem4stens2tep2ster4stes2stetst3ev4stexs4thäs4this2thu2stia2stibs2ticsti2e2stig2stiks2til2stio2stis2stiv2sto_s3tob1stof4ston4stoo1stoß4stou2stow2stoz2stöt1stru1stub4stuc2stue3stuf3stuhstu2n3stüt4st3zsu1ansuba24subi3su1c2s1uhsu1issul2asul2isult23summ3sun_su4nes1unf4sunt3s2upsup3psu2ras1urtsu3sasus1esu3shsu3sisus3s2sü4bsü2d1sweh24swie4swilsy4n34s3zas2zess2zis4s3zu4s3zwßen3gße2niße2noße2roßer3tßig4s2ß1s25taan4tab_2tabf2tabg2tabh2tabkta2br4tabsta2bü2tabw2tabz2t1ac3tacut1adatadi33taf_4tafft1afg3t2agt3agotai2ltai4r2takzta2latal3d3talo2talt3tameta2mit1amt3tan_2tanbta3ne4tanf2tang3tanit2ank4tanlt2anot1ansta2nuta3or2tapfta2pl2tarb4tark2taro2tartta2ruta3sata2tht3atlt4atmt1auk3taum4tägyt1ämt3tänzt2är_tä2ru4tätt2täuß4t3b2t3chat3chetch2itch3lt2chutch1w4t3d4tdun2te2a22teakte3alte3an3tebat2ech2teckte1emte2es2teff3teha3tehät2eieteik43teil5tel_3telatelb43telg3telk5teln3telp5tels3tem_tem3st6en_ten3ate2nät4enbten3gt4enhte2nit4enjt4enmten3n3terct4erit4erot3erötert2teru2t2estte2su3tet2t2et_4teth4tetl3teuf3teumte1unte2vite1xa4texp3text2texz4t1f4tfi2l4t1g2tger22th4at2hagt3hait2hak2t3hä3thea2thebt2hect2hekt2hem1then3theot2hest2heut2hik4th3l4th3m2th3n1t2hot3hoft3horthou24t3hö2thub4thunti2ad3tib4ti1cetieg42tiehti1elti1etti1eu3tif_ti1fr4tift3tilgti2lötil3stilt4ti2lut2imiti3nat1inbt1infti1nuti3orti3plti1rhti2sptium2tive3ti2za4t3k46t5li4t3m2tmal24t5n4tnes2to4asto5at4tobjtob2ltode2toi4rto3la3tole4tolz2tomg3topo2topt3tor_to1ra4torct1ord3toret1orgto2rö3torsto2rut2orwto3sc3toseto4sktos2p4toss3totrtots23t4outo3un3töch4t1ökt1öst4t3p21t2r45tra_3trac3trag3trak3tral4traß5träc3träg4träs4träß4treb4trec3tref4treg2trekt4remt4rert4rett4reut3rev2trez5t4ré2t3rh4tric2tridt4riptri2x3tro_3troe3tront4rop3troyt3röc2tröh3trös3trua4truktrum2t4rübt4rügts1adts1alt2sants1ast2sauts1emts3krtso2rt3sout2spät2spht2spots3s4t1st4ts2tut2s1u1tsubtt1abtt2actt1aktt2altta1st3telttes1tto1stt3rutt3rütts1ptt2untu3antuf2etuff3tul2at2um_3tun_3tune3tungt1up_tu2rätur1c3turntu2rotu4rutu2satu2sotu3ta3tüch3tür_tür1c3türe3türg4tütztwi4ety2pat2za2tz1agtz1altz1artz1aut3ze_t2zortz2thtz1wätz1witz1wuu1a2bu1a2cuad4ru1al_u1albu1alfu1alru1alsu1altua2luu1ansu3ar_u1arsua3saua2thuat2iubau1u3b4iu2bopub3räu2bübuch1auch1äu1cheu1chiuch3luch3much3nu1chuuch3üuch1wu2ckiu3d2au2donud3rau3druue2ckue2enu2elaue2leueli4ue2miue2näue2niue2nou2ereu3errue2tau3fahuf1akuf3aru3fasuf1au2ufe_uff4luffs4u2fobufo2ruf3säuf4sou2fumug1afug1akuga4sug1auug3d2ug3huu2g1lug3lou4gluu2g3nug1orug3roug3seug3siuh1lauh1läuh2liuhme4uhr1auh3riuhrt4uh2ruuh4rüui2chui1emu4igeu1in_u3käuu1k2lu1k4ruk2tauku2sul1abul1amula2sul1ämul2drule4nule2tu2lexul3f4uli2kul3kaul2knull2aull3sulo2iul1orul2sauls3z2ultaul3thult3sul2vrulz2wuma4rum2enum1ir1um3lumm2aum2suum3t2um2un2una_1unabun3acun4alun3at1unda1undd1undf2undg1undn1undv1undzune2bune2hung5hun2idunik4un2imuni2r2unisunks23unkuunna2uno4run2os2uns_un3se1unsiun3skun3spun3taun3trunt3s2untuu1o2bu3or_u3orsu1os_uote2u1pe2uper1up2faup2plup2prupt1oup4tru2rabu2rar2u1räur1änurch1ur3diure4nurf3turi2cur1imurk2s4u1rou3roluro1sur4swur2zaur2zäur2ziur2zou3sepus3klu4skous3ocu3sohus1ouu2spou2spuus2thus3tru1stuus2uru2tärut1egute2lut2esut2etu4tevutfi4ut2heu2thiu2thuuto3cut4orutos4ut3rüuts2put3teutts2ut2zo2u1u2uufe22u1v4u2ve_uz1weuz3z4übe3cüber3ü1cheüch3lüd3a4üd1o4üd3s2üdsa1üd3t4ü2f1aüfer2üf2flü2f1iüf2toü2g3lüg4stühla2ühl2eüh3moüh3neühn2süh1roühs2püh4thül2laül2loül2löü2n1aün2daün2dründ3sünen3ün2faün2frünn2sün3scün3seün3spün2zaüp2plür2flür2frür3scür3seür3spürt2hüse3hüse3lüse1süss2eüs2stü2t3rüt2s1üt2tr2v1abval2s2vang2varb2v1auve3arveit4ve3lave3leve3live3love3mave3muven2cve3neve3nive3növer3averd2vere2verf4verg4ve3river3kvert2ver3uve3tavete1ve3trve3x22v1f4vi3arvi2elvi2ervima2vi4navin2svi3savise4vi2spvis2u2v1l22v1obvo3gavo2gu2v1opvo2r1vor3avor3dvor3evor3gvo3ri2v3rav4ree2v3rov1stav3s2zvu2et2vumfwa5gewa3gowai2b2walb2walmwa3nawa3sawa3sewa3sh2wängwäs2c2w1b2we2bawe2blweb3swe2e4weed3we2fl2weiewe3niwerd2we2röwer2s1wesewe2spwe4stwet2s2w1eywie3lwin2e2wing1wi4rwi2sp1wisswi3th1wo1c1wolfwor3aw3s2kwun2s4wur_wur2s2xa2b1x2adxa1fl1x2agx3a2mx2anz1x2asx1e4gx2er_x2erexers22x3euxich2xide2xie3lxil2axi2loxi2lux2is1xis2cxi2sexis3sxi2su2x1k22x2l22x3s2x2t1axt2asx2tänxtfi4xt3s2x3turx1u2n2y1aby1al_y1a2myan2gy1anky2chiych3nyen4ny2erey2es_yes2pye2thygie5yke3nyk3s2y4le_yli4nyl3s2y2l1uyma4tym3p4ympi1y2n1oyno4dyon4iy1ontyp3any4p3sy3r2eyri2ayri1ey3r4oys2any3s2cy3s2hy4s3lysme3ys2poys1prys3t4y3s2zy2te_y2tesy3to1yure3zab3lz1a2dza3de2z1afza3grzale32z1amza2na3zani2zarb2zarcz1arm3zaubz3aug3zaun2z1äc3z2äh2z1ämz1ärgz1ärm4z3b4zbü1b2z3d2zdan2zeik4zelu25zen_zen3nze2no3zentz2er_zerk2z2ernzers2ze2säze3sczes1ezes1ize2spze2tr2z1ex2z1f42z1g2z2henzhir3zi3arzid3rzil2ezin2ezi2o3zi3opzirk22z3k42z1l22z1m2zme2e2z3n42z1ob2z1ofzo2gl2z1oh2zopezo2ri2z3ot2zö2f2z3p42z3r24z1s2zt3hozt3s2zu4chzudi4zu2elzu3f4zu3gl2zumf2zumg2zumlzun2ezung42zuntz1urkzu3s4zu5t2zür1cz1wac4zwahz1war2zwas4zwäl2zweg2zwet4zwirz2wit2z1woz1wörz1wur2z1wüz3z4az3z2o",
		6 : "_ab3ol_ab1or_akt2a_al3br_alt3s_ampe4_an3d2_angs4_ans2p_ans2t_an3th_ari1e_ark2a_ar2sc_as4ta_au2f3_au4s3_be3ra_boge2_da2r1_darm1_de2al_de1o2_des2e_de3sk_des2t_do2mo_do1pe_dorf1_ehe1i_ei3e2_ei4na_ei2sp_ei4st_ei4tr_el2bi_elb3s_em3m2_end3s_enns3_en2t3_en4tr_er2da_ere3c_es3ta_est2h_es3to_es5tr_eu3g4_eve4r_flug1_for2t_fu2sc_ge3ne_guss1_he3fe_he3ri_inn2e_kamp2_kle2i_kopf1_le4ar_li4tu_ma3la_ma2st_mel2a_mi4t1_näs1c_no4th_oper4_oste2_ost3r_poka2_ram3s_reli1_ri2as_rö2s1_se3ck_sen3s_ser2u_se2t1_si4te_ski1e_tal2e_ta2to_te3no_te4st_ti5ta_tite4_to4pl_tro2s_tu3ri_uf2e2_ufer1_un3a2_uni4t_uns4t_uro2p_ur3s2_wah4l4a1a2naa2r1aaar3f4aat4s3ab1aufab1eilabe2laab1erkab1erzab1ins1a2blaab5lag1a2bläab4le_3a2blö2absarab3s2iab3s2p2abst_ab3ste1abteia1chalach3auach1eia3cho_ach1orach3su4ach1wa1ckarack2ena2ckinack2seack3slacon4na3d2abad3amaa2d1an3a4dapade2aladefi4a2deina2deri4ade1sades4sadi3enad4res2ad2t1a2f1eca2fentaf1erlaf4fluaf3s2aaf3s2haf2t1aaf2teiaf2t3raf2tura2f3urag1a2da3gen_age4naage2saage4si3a2gitag4ne_a2g3rea2g3riag4samag4setag4spoag3staag3stea2gundahl3a2ahl3szah4n1aah3r2eahrta2ain3spai3s2e2a3kam1a2kazaken2nak3rauak5tan2aktikak2t3r2aktstal1ageal3amealami5al3ampal1anaal1ansal1anza3lar_a3lareal2armal3arral1asial1assal3augal2b1lalb3lial2bohalb3rualds2ta4l1eha2l1eia2l1ela2lengal1epoal1erl3alermal1etaal1etha2l1eua4leur3a2lexal2glial1insa2linvalk1ar1alkohalk3s2alks4tal2labal2laual3lesal2lobalo2gaal1opeal1orc3alpe_al3sklal3sunal4takal3tamal2treal2trial2troalt2seal1umb2ambiqame2n1amer2aa2meriame3rua4mesh2a3mirami3taami3ti2ammalam2meiam2minam3stram2t1aam2t1äam4tel2amtemam2t3ram4treanadi3an1algan3dacande2san2dexand2suand1uran3e2can2ei_an3eifan1e4kan1ethanft5san3f2uang1ar3angeb2angiean2gla4angs_3a4nima4ninsan2keian4klöank3ra3an3naann2aban3n2ea2n1orans2enan2seuan3skrans1pa1anspran3s2z1antei1anthran2tro2anwet1anzeian2zwiar3abtara3d2a2r3al2a2rara2r1auar2bauar2bec2arbenar2bre2arbs2ar2droar1effar1ehra2reinar2erfa2reria2rerlar1intar2kalar2knear2korar4kriark1s4ark3saark3shar2lesar2nana2r1oparr3hear3s2har3staar3t2ear2thear3t2iartin2ar6triar2z1was1alaa3schea3schia2schma3schua3s2hiasin2gaska3sa3skopas3panas3s2aas3s2eas3s2ias2s1pass3tias3stras3stu2as3taas4tauas4tofast3räaswa2s3a2sylat1apfa2tausat3eiga2teliate2ru4athe1atil4sati2st4atmusatra4tat3romat4setat2s1pat4takat4tauat2teiatz1eratz3t2at2z1w2au1a2au2bliau2bloauf1an2aufe_2aufehauf1er2aufs_4augehaule2sau2malau2m1oaum3p2aum3s6au3n4aau2nio2au3r2au2sauau2spraus3s22auts4ava3t4äche1eäch2späch4stä2d1iaäft4s3äg3str2äh3t4äl2l1aämi3enäne2n1äng3seän2k3län2s1cänse3häp2s1cä2r3a2ä2r1eiär1intär2k3lärt2s3äse3g2äser2iäskop2ä3s2kräs6s1cä4s3t2ä4t1a2ät2e1iätein2ät2s1iät2s1pät2s3täum4s52ä3us_äu2s1pbacks4b1a2drbah2nuba2k1iba2krabal3th3b2andban2drba3n2eban4klban2kr2b1ansbar3deba2reibar2enbar3zwba3s2abau3sp3b2ä1cbbens2bb3lerbbru2cbe2delbe2erkbe1erlbe1etabei1f4bei3k4bei3labe1indbei3scbeis2ebei1stbeit2sbe3lasbe3lecbe3leibe2letbel3label3szbel3t4ben3arbe3nei3ben3gbe3n2iben2sebenst4ben2sub1ents2bentwben3unben3z2ber3ambe2ranbere4sber3nab1erntbe2robbe3ropbe3rumbe3slobes2pobess4ebes3szbe2tapbe3thabien3sbi2ke_bi2kes2b1inb2b1infbin3gl2b1intbi2solbi2s5tb2it2abla3b4b2lancb2latt2b3law3ble2a2b3legb3leinb3leseble3sz2blich3blickbling43blitzbo3ch2bo2e3ibon2debo1r2abo2reibo4rigbo4s3pbot2st2b3radb4ra3k2b3refb3reif2b3repbri2er2b3rolbrust3bru2thb2s1adb3sandb3sel_bse2n1b3s2esb2s1ofb3s2pubst3acbst1akbs3tätbst3erb2stipb4stodbs4trib4stübb2s1unbu2chibul2la2b3umkbu3r4ibus1erbu2sinbu2s1pbu2s1ubzeit1carri1ca3t4hcha2ck2ch1akch2anb3chancch1ang4chanz4char_1characha2sc3chato4chatuch1ärm3chef_3chefi3chefsch1eimcher3ach1ess2cheta1ch1iachi3na4chind2chinf2chinhch1insch1int1chiruch1offch1orcchre3s1chron2chunt2ck3an4ckeffck1ehe4ck1eick1entcke2rack2ereck1erhck2ern2ckero2ck1id2ckunt2ck1upcon2nec1s4trcussi43d2abäda2ben3d2ablda2bredab4rüdach3ada2chodach1sdal3b2d1amma2d1amt2d1ana2dangedan4kldan2kr2d1ans2dantwd2anz_4danzida2r3a2darb2dar2mada3s2hdat4e2da3teidate4n4d3atl4daush2d1ämt2d1änd2d1ängde3a2tde4ca_de2cka2d1eff2d1ehrdein2ddein2sdel1ändel1ec2delek2delem2delfmdelle2de2lopde3lordel5scdel2sodel3t4dem2ar2d1empden3th2dentwdera2bde1radde2rapder2bl2derdbderer33derieder3m2de4ruhde4rumde3sacdesa2gde4samdes2äcde2sebde4sehde2seide4setde2sinde2sordes3s2de2sto2d1etwde1urlde2xisdha1s4di3e2ddi3enidie2thdige4sdil2s52d1imb2d1ind2d1inf2d1inh2d1ins2d1intdion3sdi4re_di2rendi2ris2d1irl2d1isrdi4t3rdle2ra2d1o2fdo2mardo5n4adoni1e2d1opfdor2fädor2fldor2fr2d1orgdo2riedor2tadost1rdö2s1c3d4ra_2d3rad2drahm3d4ramd3rand2d3rät2d3räud4rea_d4reas3d4rehd4reiv4d3ren2d3rep4d3rer4dres_d4resc3d4ria2d5ricd5riegd4rin_3d4rit4dritu2d3rod2d3rot2d3rovdrö2s13d4ruc2d3ruh2d5rutd2sau2d2s1efds2eigd2serhds1errd3s2had2s1imds2infd3skuld2s1opds1orids1pasd2sprods3tabd4stagd4stead3steid4stemds4tilds4tipds1umsds2zend4theidtran2du1alvdu2bli2d1ufe2d1umb2d3umkd2ums_2d1umvdund2a2d1unfdun3kedun2kl2d1url2dursadwest3ea3dereadli4e3aleieat4e2eater1eat3s2e3au2feau1ste3b2akeb3lereb4leue3blieeb3reiebs3paeb3staeb3strebu2t12e3cheech1eie2cho_e2ch3rech3taech1uheck3seede2aledens1edi4aled2s1oed2s1pee2choeed3s2ee2lekee3lenee4nage1e2pie1erbtee3r2eeere2see4reteer2öse1ertree3r2uee4tateewa4re2f1adef1anae2fente3f4lu2e3f2oef3reaef3rolef3romef2tanege2raeg4saleg4stoegung4eh1ache3h2aleh2auseh1eff1e2hepehe1raeh1inteh1lameh2linehl2seehr1a2eh2reiehre3seh1ro2ehr1obehr1ofeh1stee2hunt2ei3a2ei2bareibu4tei2choei2d1aei3danei3dra4eien33eifrüeig2er2eigew2eigrueik2arei3kauei2lareilen1eil3f41eilzuei2moreim2plei2n1aei4nasein3dr2einduei4nelei2neu2einfoein3g2e1initein4szei2sa4eis2peeis4thei1stoei2sumei2tabei2tanei2tarei2troeit3umek1s4tek5trie2l1akel4amiel4ampel1ansel1anze2l1apel3ariel1asiel1aspel2ast3elbiseld3s22e3lebe2l1el1e2leme3lem_el1empel1erdel1erfel1erkel1erl2eles2el1esse2l1ideli2neel1itael3lanel5le_el3linell3spel1opee2l1orelo2riel2sumelte2kel2t3re2l1umel3useel2zwae2m1ad3emanze3m2ene2m1imem1intemi3tiemma3uem2meiem3pflem2spren4amee4nanden3angen3areen2ascen3atte3nauee2n1ären4ce_en2dalend3siend3szend2umen1e2ce4neine2n1elene4lee2nerfe4nerhe4nerk4enerne4nerz1engad3engagen3g2ien3gloeng3see2n1ineni3seen3k2üeno2mae2n1openost3en1ö2den3sacen2sauen2sebens2el1ensemensen1en3ska2enstoent4agen2teb1entfa3entgaen2thi3entlaenü1ste1o2b1e3p2f41episo1e2pocep2tale3rad_er3admeraf4aera1frer3aicer3alleran3de3raneer3anfe2ranher3anmer3apfe3rarie2rathe3ratie2ratme1rauber3aueerau2fer3augerb4sper3chl2erdece3recher1effer1eige2reiner1ele2e3reme3renae3renz4erer_e4rerl4ererne3reroer1errer1erse2rerter1erwer1esser1eul4erfür1ergolergs4t1erhabe2riat4e3ric4e3rieer1inber1inker1inter1ita1erklä2erkreern1oser1o2be2r1ope4ro2rer3smoert2aker2thoert4raerts2eeruf4ser1u4mer1underung4er1unser3untes2aches3anze3s2ases3cape3schaes3evaes2hares3intes2kates4loges2ortes2sau4essemessi2aes2sofes2spues3stres3stuest1ake1stare1state3stele1stile2stipes4trie2s1umes3umse4teinet3haleti2tae4t1ofetons4e2treset4riget2tabet2teiet2t3ret4troett3szetwa4retze4seu2esceu4glae3um2seum4sceums1peum3steu4neie3un2geu2nioeun3ka3eu3roeu1staeu1stoeu1stre2velae2vent1e2xeme2x1inex2tinfa2benfa2chof1aderfa3l2afal2klfal3tefalt2sfan2gr2f1ankf1an3zfar2br2f3arcfarr3s3f4art2f3arzfa3s4afa2to32f1auff1ausb2f1ärmfeatu42f1eckfe1inifek2tafe2l1afel2drfe2lesfe2l1ofen3safer2anfe2rauferde3fer2erf1erfaf2erl_f4erpaf2ers_fest1afest3rfeu4ruf2f3efffe1inf3f4räff3shoffs4trfid3scfi2kinfik1o2fi2kobfi2lesfi4linfil2ipfin3sp2f1intfi2s5tfit1o2fi2tor3f4läc2f5läd2f3läu2f3leb3f6limfli4ne2f5lon1f4lop1f4lot1f4lug4f3orgfo3rinfor4stfor2thfor3tu2f1o2xf3rand1f4ränfreik2frein42f3ricf4risc1f4ronfro2nafs1allfs4ammf2s1asf2sauff2sausf2sautfs1e2bf2s1emf2s1erf2si2df2s1o2f3spanf3s2plf2sprefs2prif2sprofs2pruf2stasf3steif2stipf3st4rf2s1unf2t1alft1e2hft1eigft1eisf4theif2t3rof2t3röf3t4ruft4samft3s2cft4sehfts3elfts2tift1url2f1unffun2klfun2ko2f1unmfu4re_fus2safus2stfzu4gaga2b5l2ga2dr2g1amtgan2gagan2grg3anla3g2ano2g1armga3r2og1arti2g1arzga2sorga4spega4sprgas4taga4ste2g1auf2g1autg2d1aug2d1erge3g2l2g1eifge2in_gein2sge2intgein2vgei3shgelb1rge5lehgell2age3lorgels2tgel3szge3lumge4namge4nargen1ebge3necgen3szgen3th2gentwge2rabger2erger3noge1r2öge3r2ug2e1s23ge3scges4pige3steges3thge3t2a2getapge3t4ugge2ne3g2het3g2hiegi3alogi2e1igie1stgi2me_gi4mesgi2met2g1indgin2ga2g1insgi3t2ag2lade2g1lag3glanz2gläuf2g3leb4g3lerg3lese3g2lid3g2lie3g2lit3g2loa3g2lobg3loch3g4lok3g2lop3g2lotgne2tr4g3notgoa3li2gonis2g1ope2g1opfg2o1ragra2bigra2bl2gradl2g3rah2g3rak2g3räu2g5re_2g3recg4re2eg3reit2g3ric2g3röh2g3rui2g3rum3g4rup2g3rüc3g4rüng3s2ahg4saltgs3amags3augg4s3cegs4chig4s3crg3sel_gs3elig3selngs5erkg4setags4pieg4spings2pitgsrat4g3stang3starg4s3täg5stämg3stelg1steugst2heg3stirgs3tocg4stolgs3topgst4rig4sturgs4tücgu1an_gu1ant2g1u2fgu1ins2g1unfg2ung_gunge2g2un4s2gunt22g1urlgurt3sgu2s3agus2spgus2stha2choha2delha4dinh1adle2h2al_ha2lauhal2bahalb3rhal2lahal2sthand3shan2krh4a3rah1arm_h2armehar2thh1arti2ha3sahat5t2h1aukthau2sahau2sc2hautohau2trhä3usphe1choh1echthe3ckehe2e3lhe2fanhe2f3lhe3friheim3phei4muheine2h1einkhe1ismhe1isthel1eche3lenhe4lof4h1emphend2she2nethenst2hen5trh1entshe2ral2heraphe3rasherb4she2relh1erfüh1erkeher3thher2zwhe1stahe2tapheter2he3t4she1x4ahfell1hi2angh1i4dihi3enshier1ihiers2hil2frh1induhin2enhi3n2ihin3n2hin3s22hi3rehl1anzh1lauth5len_hlen3ghl2ennhle2rahl1erghl1erwh4lerzh4lesihl1indh3listhlo2reh3losihl2sanhl2serhl3skuhl3slohme1inhmen2shme2rahn3eighn3einhne4n1hne4pfh3nerlh3nerzhn3s2khn1unfho2ch3ho2ckahock3tho2f3rhol1au4holdyhol3g4ho4lor3hol3sh1o2lyho2mecho2medho4seihotli42ho2w1h1raneh3rechh4rei_h3reich3r2enhr2erghr2erkhr2ermhr2erzh4rickh4rineh4rinhh4risth4romeh4romihr2sauhr2serhr4sethr2tabhr2tanhr2torhrt3rihr2trohrt2sahrt2sehr1umsh2s1ech3s2exh2s1ofhs2penhs2porh2spräh2sprohst2anh1stechst2heh1s2tih2storh1s4trhst3rih1stunhs2ungh3t2alht3aneh3tankh4tasyht3a2tht1e2ch2t1efhte2heh2teifh2temph2t1euh2t1exh4theihthe3uh2t1inh2tolyh2torgh4trefh2t3ruh2t3rühts2tihu2b1ahu2b3lhu4b3rhu2h1ahu2h1ihuk3t4hu2l3ahu2lerhu2lethu3m2ahung4shu3ni1hus4sahus2sphu2tabhu3t2hhutz1ihühne4h2wallh1weibhy2pe_i4a3g2ia2l1ai3aleiial3laia2lorial3t4ial3z2ia2nali3and2ia3p2fi2a3spi3a4tai3at4hib2blii2beigi2beisibela2iben3ai2blisib3renib4stei2bunki2buntibu2s1ich1eii2chini3chloi2ch3ri3ck2eid2ab4i2d1au1i2deeidel2äide3soide3sp1i2dio1idol_i3d2scid2s1pie2breie2choie2fauief3f4ie2f3lie2froie4g5lie3g4nie2g3riegs3cie3lasiel3auiel1ecielo4biel3sziel3taiena2bi3e2näien1ebie3neri3en3gi3e2noien3scien3siiens2kien3spien3szier3a2ie2rapie3resi3ereuierin3ier3k2i3ern_iers2tier3teies2spie1staie2t1aie4t1oie2triiet2seiet3zwifens2if1ergif1erhi1f4lai1frauif4reii1f4rüif2topift3szig2absig1artiga1s4ige4naig1erzi2g1imig3reiig4salig3sprig4stoig4stöig3strig3stüigung4i2h1ami2h1umik1amtik1anzik1artik3atti2k1aui2k1eiike2l1ik1erfi2kindi3k4läi2k3raik2trei2l3abi2l1acil1a2di2l1akil1ansil1aspi2l1auil3ausild2eril2doril1e2cil1eheil1einil2f3lilf4s3ilie4ni2l1ipi3lip_i3lipsil3l2ail3l2iil2makil2mauil2mini2l1oril3t2hilung4i2manwima2tri2melei2melfi4meshi2metiim2meiim1orgim3pseim3staimt3s2in3a2ci4nacki2n1adin2arain2arsi2n3auin2dalin2dan1indexind4riin3drü1indusin1ehein2erhi4neskine3un1info_1infosing1af1inhab2inhar2inhauin2i3dini3krini3sei3nitzin2nor1inntain3olsino1s2in1ö2dins2aminsch2in2seb2insenin3skr1insta1insufin3s2z1integin3t4rin5trii3n2umin3unzinvil4io2i3dio2naui3ons3ion4stiore4nipi3elipi3en1i2rakir2k3lirli4nir2makir2mauir2mumir2narirpla4irt2stiru2s1isage2is3arei2s1äni2schmis1chyi2s3crise3haise3hiise2n1is2endisen3si2serhiser2uis2hasi2s1idi2s1of3i2soti2sparis1picis2piti2sprois4sauis3stais3stoiss3tris3stuis2sumis4tabis4tamist2anis4teliste4nistes3is4tocis5törist4raist3reisum3pit1ab_ital1ait1altit2an_it1arti3tauci4t1axi2t1äsi2t1eii4teigit2eili4teinite2lai4tepoi2t1idit2innitmen2i2t1ofit3rafit3rasit3rauit3räuit3ricit3romit4ronit3runit2speit2stoit2tebit4triitt2spi2t1umi2tunsit1urgitzes4it2z1wi2v1akiv1angi2v1eiiv1elti2v1urizei3ci2z1irjahr4sja3l2ajean2sjekto2jek2trje4s3tje2t1aje2t3hje2t3rjet3s2jugen2jut2e1kab2blka2ben2kabla2kabläka3b4r2k1abt2k3adaka1f4lkaf3t2kaken42kala_ka2lanka3leikal2kakal2krkal4trkan2alka2nau2kanda2k1angk2ans_k2anz_2k1apfka3r2i2k1armk2arp3kar2pfk2artaka2s3tka3tanka3t4hka4t3r4kaufrkau3t22kautok1ä2mikä2s1ckdamp22k1e1cke2he_kehr2s2k1eic2k1eig2keinhkel1acke3lagkel1aukel3b4ke2lenkell4e2k1empken3au2kenläkens2kken3szk2enteken3thk2entrk2entu2kentwke1radk2erkok1e2rok2ers_ke2selke4t1ake2t3h2k1e2xki1f4lki1f4r2k1intkis4to4k1lack4leidk3lem_2k3lerkle2ra2k3leukle3usk2lisc2klistklit2s2k3locklo2i3klost4klung42k1lüc2k5nerkno4bl2k5norkoh3lukol2k5ko3n2ekon3s4ko1r2a2k1orckot3s22k3radk3rats2kraum2k3rät2k3rec2k3refk3reick3reih2k3rick3ries3k4ronks1e2bk2s1emk2sentks1erlk2s1idk2s1ink2s1o2k3s2peks2pork1s2tik2stork2sträk2stumks2zenk2t1adkt1aktkta4rek2t1auk2tempk2tentkte3ruk2t1idkt1insk2t1ofkt1opekt4rankt3rask4trefktro1skt3runk2tuns2k1uhrku3l2eku3l2i2k3umlkum2s1kun4s4kunst32k1up_kur2blku2reikuri2ekur2spkur2stlab4ralab4ri2l3absla2ce_la2gio2la1hola2k1ila1k4lla3min1lammf2l1amtlamt4sla4munl1analla2nau3l2andlan2gl2lanhäl2anhe4lanli2l3ann4lansä2lantrlan2zwlap4pll3artila2saulast1ola4tel2l3athl2auf_lau2fol2aufz2lausl2lausr2lauto2l1ähnlä2s1cl4betal2b1idlb2latl4bre_lb3ritlbst3elb4stol2b3uflbzei2l3d2acl2d1akld1amml2da2rld3arild1arml2delel3der_ld1erpl2d1idl2d1iml2dranl3d4rul2d1umle2chile2gaulei2br4l1eigl2ein_l2eindl2eine2leinkl2eintl4eistlei2talekt2a2lektr3l2ela3lemesle4nad2lendul2e2nolen3szl1ents4lentzlen2zil2e1rale2ragle2raul1erfol2erfrl2erfül2erkal2erkol2erlel4ers_lers2klers2tl2erzales2amle3serleste3le1stole2tat2le3thlet4tule3u2f2leurole2xislfang3l2f1ecl4feisl3f4läl3f4lulf3ramlgen2alge3ral2getilian2gli3chili2ckali3d2ali2deo2l1idolid3scli3enelien3slie2stli2grelik2spli3m2alin3alli3narli2nefli2nehli2nepli2nes2l1inflings52l1inh2l1injlink2sli2noll2ins_l2insal2insc2linsp2linst2l1intli3os_li2p3ali3s2a2l1islli2tallit1s2lit3szlizei3lk1alpl3k2anl3kar_lken3tl3k4lul2k3rol2k3rulk4ställ1abbll1affll1aktl3l2alll3amall2anwll1anzll1armll3augl2lausl2l1ämll1echlle3enl2l1efll1eiml3len_llen3gl3ler_lle2ral2lerzll1imbll1impll1insl2l1ofll1opfl3lor_l3lorel2l1oull3s2kll2sprllti2mllt5s2l2marclm1auslm1indlm1inslm3stelm3s2zln3are3l2ob_lob4ril1o2felo2gaulo3h2e2l1ohrlo2k3rl1o2lylo2minlo2n1olo3renlo4skelo2speloss2elo4stelo3thaloti4o2l3öfelpe2n3l2p1holrat4sl3s2all2sannl3sarel2s1ecl2s1emls1erels1ergl2serhls1erlls2logl3s2pil2sprol3s2pulstab6ls4tafl3stecl3steil3stell4stemls2tiel2stitls2zenlt1a2mlt3andlt1angl3tarblt1artl2t1aultbau1lt3elil5ten_lter3alt2erglt4erölte2thl2t1eul4theiltimo4l2t1ofl4t3ötltra3llt3räult4rielt3roclt3rosl2t3röl2t1umltu2ri4lu4b32l1ufelu2g1alu4g3llu2g3rlug3salug3splu1id_lu1is_2l1una2l1unf2l1unilu2s1ulu2t1alu4teglu2toplu4t3rl2z3acl3z2anlz2erklz1indlz2wecm2ab4rma2d4rma4d2sma2ge_ma2gebma2gefma2gegma2gekma2gepma2getma2gevma2gew2m1aggma3g4n2m1agomai4se2m1aktmal1akma2lanma2lauma3lermali1emal3lo2malltma2nauman3d2ma2net2mansa2mansä2mansc2mantwmar3g2maro3dma3r2uma2tanma2telma5trimat3semat3sp2mausg4m1ändmä3t4rm2d1ummedie4mee2n12m1eif2m1eig3meistme3lamme2lekme2lermelet42melf_mel2semel5t4mena2bme3nalmen3armen3aumen3glme3normen4skmen2somen3ta2mentnmer2er3merinme2sal4meser2me3shmes2stmeste2me1stome3t2amie3drmi2e1imien3smie2romie4timi2karmi3l2amilch1mild4s2m1impmin2enmin2eumin2ga3min2omi2t1rmit3s2mit5sami5tsumi2t1umk5re_m2m1akm2m1almm1angmm1anzm2m1aumme4namme2samm1inbmm1infmm1inhmm1insmm1intmmi3scmm3stamm3strmmüll1m4nesimode3smo2galmo2k1lmon2s3mon3su2m1opemo2rar2m1orcmor2drmo2rermos4tampf3limpf1ormp3strms3andm4s1efms1erwms1inims1orim2spedm2spotm2sprom4stagm3stelm3s2tims5träm3s2tumt3aremt1eltm2t1eum2t1immtmen2m2t3romt2sprmt1urtmu3cke4m3unfmu4s1amu2s1omut1aumut2stmvoll14n3absna2ch1nach3s4na2drna1f4rna2gemna2h1a3n2aldna2letnal3lanalmo2na2lopnal2phn2als_nal3t4n4amenna3m4n2n1amtnamt4sn1and24n1ang2n1ans2nantrnap2sina2r1an2arle4n3artna3r2unasyl2na3t4hnat4sanat4sc3n2aul4nausb4nausgn2auso4nauss4nausw2n1ä2mnär4s53nä1umnbe2inn2d1akn2danlnd1annnde2sendi2a3ndo2ben2d3ren2drobnd3rolnd3rosn2druind2sornd2spr2n1ebnne3ein4n1ehr3neigtnek3t42n1ele5neleb4nelek4nelemne3lennel4la3ne3lu2n1embn1e2mi2n3emp2n1emsnen3a2n1endgnen3einenen14nengb4nengs4nengtnens4enen3skn1entb4nentn5nentrn1ents4nentzne2n3u2n1epone2posne2ranne2rapne2raun1erbine2reb2nerfü3nergrn2erlin1ermän2ern_ne1rösn2ert_n1ertrne2rup2n1erzne3sannesi1ene3skane2s1pne1stanes3tine2tadne2tapn1etatne2taunet3han1e2tunet2zi2n1eupnfalt4nf5linnft4s3ng2absn2g1acn2g1akng2anfng1anzn2g1äln3g2enngen2an3gläsn2glicngrab6ng3ratng3rocngs3panich1sni3de_nie4n3ni3eneni1eronifes3ni2grenig4spni2kalni2karni3ker4n1imp3n2in_n2in4a4n3ind4n1inhni2nor2n1insn2ins_4ninse4n1int2n1invni2s1eni2s1pni3spinis3s4ni2s1uni3t4rni3tscnitts1n2k3adn2k1akn3k2aln2kansn2kausn2k1ärnk4ergnk1inhnk3lennk3lesn2klienk3lunn2k3ronks2eink3s2znk2taknk2tannkt1itnk4topnk2trunmen2snna2ben2nadan2n1annnen3gnn2erhnn2erknne2rönner2znnes1enne4stnn1o2rnn3s2pn2n1ufno2blano2leu3n2opano2radno1rakno3ral3n2os_n2ostenost1r2nostvno3tabno2telno3t3hno4tha2n1o2x4n1ö4lnräu3snre3sznrö2s1n2sangn2santn2sausn2s1änns1e2dns1entn2s1epns1erfns1ergn2serhns1ersnsfi4lnsho2fn2simpnsi4tensi2trns2kaln2s1opn2spatns2peins2penn3s2pins4piens3ponn2sprän4spronst1akn3starn3statns4tornstü1bn2s1unns2ungns4unrns4unsn4s3zint3absn3t2alnt1angnt2arbnt1arknt2armn2t1äunte3aunt1ebente3g6n2teignt4enent4ernnt4ersnt4ertnt2hern2t3hon3t4hunti3kln2tinfntini1nt2insn3ti1tntmen2nto3ment3recn5trepnt4rign5tropn2t3rünt4saunt2sto3n4tu_ntu2ra2n3umb2n1ums2n3umz3nung_n3ungl2n1uninu4t3rn2z1aun2z1ännzdi1snzi2ganzig4snz1inin2zurkn2z1wan2z1wän2z1wuoa3cheoa3chioa4k1lo4a3lao4a3mioanne43oa3seo3b2al2o3b2äob3ein2o3b2iob3iteo2b3li2o3bloo2b3reob3s2hob2staocha2boche4boch1eioch3ö2och3teochu2fo2ckarock2erock3szodein3ode2n1odene4ode3sp2o3diaof1a2co2f1eiof2f1a1offizof2f5lof2f3r2o1f1rof4samof2speof2sprof2s1uof2teio2g1abog1alaog1ango2g1eiogi2erog1steohen3sohl3auoh3lecohl1eioh3lemoh3lenoh3lepohls2eoh2n1ooho2laoh1o2poh4rinoimmu4oka2laokale43o2kelok2s1po2l1akolars2ol1aufol4damol1eieol1eisol2fraoli3k4ol2kreol2lakol2lelolo3p2ol1ortol2strol2z1aol2zinom2anwom1arto2m1auo2m1eio3men_o2meruom1erzomiet1om1ingom1orgo4munto2narbon3ausone2n3onens2on1ergon1eröo3netton3g2lon2i3do4nikro4n1imon3ingonlo2con3n2eo2nokeon1orconsa2gon4samon2sebonse2lonst2hon3t2aoo2k3lo2p3adop3aktopa2leop2f3aop3fahopf3laop1flüopi5a4op5lago2p3le1op3t4or3a2bor4altor2ando2ranhor3arbor3attor1ändor2baror2dauor2deuor2ditor2dumore4aso2r1efor1eigo2reino2rerfor1ethor2fleorf3s42orgetor3g2h2orgiaorgi1eor3gle2o3rico3rier4orin1or5ne_or3s4aor2täror2tefor2theor2torort3reo4r3un2o3s2ao3scheo2s1eio3s2hi2os2kl2os2koo3s2poos2seios2s3oos4sonos2s3pos2s3tosta2bos4teios2t3hos3tilost3räost3reost3ufo3s2zeota2goo5tarko3tarto2t1auot3augotei4not4em3otemp2ot5helo4t3hiot3hosot1opfoto2rao2t3reot3rinot4spaots2peot2sprot2t3rot4triou1f4lou4le_o3undsou3s2ioviso3owe2r11o2xido1y2enöbe2laöbe4liöh3l2eöl2k3löl2naröl2ungöp4s3tö2r3ecö2r1eiör2ergö2rerlör2f3lö2r1imörner2ör3s2kö2schaö2schlö2schwö2s1eiös2s1cöte4n3pa1f4rpa1k4lpak2topala3tpa2narpa3neipa2neu3pa2nopan3sl3panz4pa5regpa5rek1park_par2klpar2kr1partn1partypar3z2pa3s2ppat4e2pa5t4rpa3unipä3ckepä2t3hpät3s4pekt4spe2letpe2lexpell2apell4epen3dape4nenpe2n1o3pensipen3z2per2an1pere2per4nape2robperwa4pes3s2p2f1akpf1ansp2fa4rpf3arepf3armp2f1au4p3fe_pf1eimpf1einp3fen_p2fentp3fer_pf2erwp3f2esp2f3läpf3leipf3lie2p1heiphen3dphen3sphi2ka2phthepi3as_pi3chlpiela2ping3s3pinsepi3onu3pirinpi3t2aplan3gpo2laupo4lorpo1o2bpo1ralpo1raupo4stapo4stäpo2stopos6trpo2t1upp3anlppe2n1p2p1f4p3p2hopp5lanp2p3rap2p3repre2e13preis2p3rer3p4res1prinz2prosspro1stp3steap3stelp3s2tipt3albp4t3ecp4t1eip4telept1in1pto3mept1urspul2sppu2s3t2r3aacra2barrab2blr2aber1r4abi2r3abwra2chura2dam2radapraf3arra2ferra3gle3r2ahmrail4l2r3airra2krera2kro2raktira2la2ral3abr3alar3r4aldral3larall2e2rallgr3alp_2ralper3al3trama3srambi2ra2mer1r2ami2r1amtramt4sr4andar4anderand3sr4aner1rangirani1eran2kr2r1anm2r1anpr2ans_r2ansp2rantr2r3anw3rareirar3f42r3arz2rato_rat2st3raub_rau2mi3rausc2rausgrau2spraut5srä2s1c3rätser2b1abrbal3arba3rerb1artrb1aufrb1echr4belär3b2larbla2dr2ble_rb3lerrb2linrb4seirb3skarb4stärb3strr1che_r1chenrch1s2rch3sprch3tar3d2acr2d1akr2d1alrdani1rd1antrd1anzrd2ei_rden3drde3rerde3sprdi3a2rdia4lrdo2berd3ratre2altre3at_re3atsre2b1are2b1lreb3ra4rechs2reck_2recki2reditre2hacre2h1ire2h1orei4bl4reifrrei3gareim2p4reingr3eink4reinr4re2ke2r1elbre3lei2r1elf2r1elt4rempfrena2bre3nal3rendiren3drren4gl2rengpr1ense2rentw3r4er_2r1erbr2erbr2r1erdr2erki2rerlö2r1ermre2robr2erse2rerspr2erte2rertr2r1erzrer5zer2erzy3r4es_ress2ere1stare2thyreu3g2re3uni2r1eurrewa4rrf1ältr2fentrf3licrf3linrf2s1ärf2s3trf3t4rr2g1ahr2g1akrge4anrge2blr2getor2glanr2gleur2gligr2g1obr2gregr2gresr2gretrg3rinrg3s2prgs4tr3r4he_3r4henrho2i3rib2blri1cha2ridolrie2frriene4rien3srie2nuri1er_ri4ereri2f1ari2ferri2f1orim4scr2i3na2r1indri3n4erine1i2r1infrin2foring3lrin2gr2r1inh2rinitr1innu2r1insrin4sorin2spr2inva2rinve3risikri4s1pri3t2irit2trr3klaur2klisrk5nebr2k5nurk3räurk3rinrk2s1erk3shirk2tinrk2t3rrk3trark4trirk1unirlös3srl2s1prl3ster3m2agrma2larm1ansrm1anzrm1a2pr2maphr2m1efr2mider2m1imrm3starm3umsrn2andrn3anirn2a2rrn3arern3arirn3eifr4nerfr4nerkr4n1inr2n1opr2n1orrn3s2ärn3s2prn3s2zrn3t2ero2bei3rock_r2o3deroh3na3r2ohrro2madro2merror3alro2ratro2reiro2r1oror3thro3s2iro3smorost1rro4tagrote3iro2thoro4trirots2orot2taro3t2uro3untrö2b3lrpe2rerrer4srre2strr2n3ar2r3obrr3stur4samprs3anprs3antrsch2lr3schur3schwr2seinrse2n1rs2endrse4ners1erers1erörs1ersrs1erzrs1etars2kalrs2kanrs2kiers2kisr4s1opr4sordr2s3phrs2tecr3stier2stinr2stiprs4tobr4stotr3s4trr3s4türtals1rt1angrt1annrt1antrt1anzr2t1arrte1e2rt4eifr2telfr2temort1ersrt3holrt2humr2t1idr2tinfrto2rir4trakrt3recrt1rosrtrü2crt2sparts2pert2sprru2ckurude2aruf2s32r1uhrru1insru2m3ar2ums_2r1unar2unde2r1unf2runglrun2kr2r1unl2r1unmru2r1erus4stru3staru2t3rrü1benrwun3srz1a2cr5zenerz1engr3z2ofrzug2u3sabetsa3blesach3t2s1ada2s3affsa1f4r3s2al_sal2se2s1alt3s2alz4s1amnsam2tos2an2cs4and_3sang_2s3anh2s3anl2s3anssan4sk2s3anw3s4ar_3s2ara4s3arb3s2ard3s2ars4sartisa4ru24s3ath4s3atlsauri1s3ausw2s1änd3sänge2schak2schao3sche_2schefsch2en3sches4schexschi4es4chim3schis2schmö2schn_2schoxschs2e4sch3tscht2ascht4rsch2up3s4cop3sco4rsda3mese3at_s1echtsee3igseein2se1er_se1erö2s1effse2galse4helse2hinseh3rese2hüb2s1ei_2s1eig2seinb4seing2seinh4seink2seinl2seinn4seinr2seinw4s1eis3s2eitse2l1ase3ladsela2gse3lamsel1ec4selem2self_s3elixse2l3ösel3szsel3trs4e3ma2s1emp3s2en_se4nagsen3gl3s2enise4nob3s2enss2ent_s2enti2sentw2sentzse2n3use5refser2ers2erfrs3erfüs2ergr2serhöse2robs2ers_2sersas4ert_s2ertase3rum3s4ervse2selse1stase2tatse1u2n3s2ha_4s3hansho4resi2achsi3am_si3enesi1errsi3gnusi2g3rsig4stsi2k1äsik3t42s1immsi3n4a2s1ind2s1infsing1asin3ghsin2gr4s1inhsini1e2s1inq2s1ins2s1int4s1invsi2s1esi2s1osi2s1psi2tausi2tra3skala4skanz3s2ki_3s2kik3skulpsler3s3s4lipsli4tu4s5not2s1o2bs1o2he4sohng2s1ohr4so2lyson3auson3säso1ral2s3ordso2rei4s1ostso3unt2s1ö2l2spara2sparo3sparuspe3p42sperls2perr2spers3s2pez3s2plis3p4lu4s3poss2potts2pracs2pran2sprax2spräm4spräs2spred2spres2sprob2sprüfsrat2ssrö2s1ssa3bos2sanos4sansss2antss3attsse3hass1erös3s2essse3tass1offs2s1opss1oriss2pens2spros3stelss4tipss2turss1ums2stabb3s4tad3staff2stale2stalkst1alpst1ami4stan_sta4na3stand2stani2stans2stanws4tar_4staris3tat_2stauf2staum3staur2staus4stälts4tänd5stätts3täus4s5te_3s2tegste2gr3s4tehs2te2i3steig4steil1s2tel2stel_2steln2stels4stem_s5ten_st4ens4stermste4sts4teti3s2teu1steue4steufs2t3ho2stie_s2tiegs2tiel2stien3s2tif3s4tims4tinfs3tinnst1ins1stitu2sto3d4stod_s4toffs4t3om2stopo2stor_2store2storg2storis3tort2stose4stote2stöch2strad2strag4strai4strak2stral5straß2strua2strug3struk2strup2st3t43s4tud2stumt2stun_4stunn2stuntstu3rest3url2sturn2s3tus2stüch2stür_2stüre2stürg2stürs3s2tyl3su2b3su2cha2s1u2fsu1it_su2marsu2mau3s2umesu2mels3umfesum1o2su2mors3umsas3umst2s1uni2s1urlsüden24s3zeis2zena4szent4s3zetße2l1a2t1abb3tabel2taben3table2t3abn2t3abtta3d2s3taf2et1af4rta2ga24ta3gltag4sttah3leta3i2kta1insta1ir_t1a2kata2krotak6ta3taktb3t2al_ta3lagta3lak3t4aletal2löta2mert1amplt1a2na4t2andt3ankl2tanwa2tanwät2anz_t1anzat1anzuta2pe_ta2pes2t1armt1artitar2to2t1arz4t1aspta2tanta2tautat3eita2temtat3heta2tom4tatue2t1auf4taufg4taufnt1ausb3tausct2auset1ausk4tausltaxi1s2t1ältt1ängs3t4ebbte3cha3technteck2ete2ckite2en3te1erwteg3re3t2ei_t3eifr2t1ein4teinf4teinnt3eis_t3eisb3te3letel1eb2telemtel1ente4leute2littell2ete2l1ö3telt4tel3tatel3thte2min2temme2tempfte4m1utena2bte4naste4nauten3dat6endit6endote2nettens2et4entat3entb4tentdt4ente4tentnten3zwt3e2pi3t4er_tera2bte1rafter3am4terbs4terbtte2relt4erfrte3ria3termi2ternct4ers_terst4ter3zatesa2cte2santesä2cte2selte2sprtes3s2te2tat3teur_3t4ha_3thal_4t3hau1t2he_2t3heit4heint4henet4heni2therr3these2t3hil2t3himth4mag2t3hoc2t3hoht4hol_2t3hot1th2r2ti3a2mtiden2ti2deo3tief_3ti2erti2kamti2karti2kinti2kräti2larti2leiti2lel4t1imp3t2in_4t1indti3n2eting3lting3s2t1inj2t1int4t1invti2seiti1sta2ti3tuti2vanti2velti2v1oti2v3rtlung4tnes4s3tochtto4d1utom1e2to2mento2nauto2pakto2patto2rauto4ränto2relto3rent3orga3torint1ort_3tost4to1sta3to3teto2thotouil44tractt3rad_6trahm5t4rai2trand3trankt3rann3transt3raset3rasi3träne4t5re_tre2brt3recht4reck6t3red5t4ree4trefe4trefot4rei_4treic2treift3reigt3reint3reis6treitt3reiz6t3relt4ren_3trendt3rent2trepe2trepot4reprt4res_3treuh5trieb2triegtri4er5triggt3rind4tringtri3ni4trinn4tripttrizi13t4roitro2ke4trom_tro2mi4troml2t3rootro1pe3tropf2t3röttrums12trund5t4ruptru2thtrü1betrü1bu2t3rüct4sa4bt3s2act2s1aht4s3art2s1änts4cort3seiltse2n1t2s1erts1init2s1irt1slalt3spalts1parts2pedt3spekt3s2pit4stagts3takts4talt2stipt4stitts3tocts3tort2strits3türtta2bet2t1adtt2anttt1arttt1ebett1eiftt1eistte2lattel1otte2satte2sät4tetitt2häut2t3hot3tro1tt4roctt2sentt2sortt2spett2sprtt2stitu1almtu2chitu3fent3u2kr3t2ume2t3umf2t3umg2t3umk2t3umrtum2situm2so2t3umt2t3umz2t1una2t1und2t3unft3unga2tunif2t3unttu2re_tu2reitu2resturin1tück2s3tür3s3tütentze4n1tz2enetz1erltze2rotz2erst3ze2stzgel2tz1indtz1inttz2tinua2lauu3aletual2mau3a2louara2bu2be2cub3licu2b3luub2sanub2s1oub2spau1cha_uch1eiu3chesuch1iluch1inu2ch3ruch2souchst4u2ckemuder2eudi3enuditi4ue2neruenge4uen2zuue2r3aue2r1äu3erehu3ereru3erexuer3g2uer2neue2r3ouer3scuer3t2u3erumue4teku2f1äsu2f1eiu2f1emu3fen_u2fentuf2ernuf2frouf1oriuf4sinuf2spouft3s2u2g1apu2g1eiug3ladu3g2löug4serug3spaug4sprug4spuug5stäug3strug3stüuhe3s6uh2reruh4rinuisi4nui4s5tukle1iuk2t3ruld2seu2l1elul1erful1erhul1erwule2saul1etaul1insul2lesul2p1hul4samuls2thul4trium1allum1anzu2maut1um3d2umer2aum1ins3umsatum4serum2simu2m1uru3n2amu2n3an2un2asun4dabun4deiun2didun2dorun2d3r4unds_und3spund3stun2ei_un3einunen2tun4es41unget1ungew1unglüun2g1rung3raung3riung4saun3ide1u2nifun3islu3n2it3u2nivun2keiun3n2eunvol2u1or3cu2pf2eu2pf1iu3rabaura2beur2anbur2anhu2r1auur3b2aur1effu2releu4r1epur1erhur1erwur2griurg3s4ur1iniur3insur1intu2rinv1urlauur3sacur2sanur2sauur2serur4sinurst4rur2z1wu4s1afus4annu2s1ecu2s1eiu3seiduse1rau2serpu2s1opu2spatu3spekus1picus2porus4sezus2sofu1stalus3tauust2inu2stunu2sturut1altut3a2mu2t1apu2t1arute4geutel1eute2n1u2tentu4t1exu2t3hout1opfu2topsut3reaut3s2aut2s1äut5t4lutu4reutu5ruut2zinut2z1wuve3räüb2s3tücht4eü3ckenück1erü3den_üden4güdwes2ü2f1eiü2h1eiühl1acüh3r2eühr3taü2mentün2fliün2g3lün3strü2r1eiü3r2o1ü2schlüs2s1cü2t1alva2teiva2t3hvatik2va2t3rvat3s4va2t1uveits3ve3nalve3radve3rasver3b2ve4rekve4rinver3stver5te2ve3scves3tivi4a3tvie2w1vi2l1avi4leh2v1i2m2v1intvi3s2ovoll1avol2liv1steuwab2blwa3chewaffe2wa2g3nwah2liwal4dawal2tawal2towang4s1war2eware1iwart4ewass4e4webebwe2g1awe2g3lwe2g3rweg3s4wei4blwei2gawei3k4wei4trwel2t1wel4trwen3a4we2r3awer2bl1werbu1werduwerer2wer2fl1werk_wer2ka1werkewer2klwer2kuwer2tawer2to1wertswest1awes2thwest3rwes4tuwett3swi3ckawien2ewie2stwim2mawin2drwi3s2e1witzlwo2chawoche4woh2lewo2r3iwo4r3uwört2hwul3sewur2fa1wurstwus3te1wu4t1xe3lei3x2em_xen3s2x1i2doxin3s2xi2so2xis4täx1i2tuxtblo4x2t1eix4tentx2t3evy3chisyloni1y2p1iny1s4tyy2s1u22z3a2b2z3a2k2z1all2z3anf2z3anlz1artizar2tr2z1arzza1st42z3at3z1au2fzbübe32zecho2z1eck2z1effzei3lazeile42z1einzei3s4zeist4zei2trze2lenzell2azel3sz2z1empzens2ezent3sze2r3a2zerhöz2erl_2zerlö2z1erq2z1erzze3skuzes2spzes2stze2s3tze3sta2zettszger2azi3alozi1erhziers1zi1es_2z1impzin4er2z1inf2z1inhzin1itzin2sa2z1invzirk6szi3s2zzi1t2hzor4ne2z1oszz2t1auz4tehezt1inszt3reczu3ckezug1un2z1uhr2z1um_zumen22z1umszup2fizu3r2a2z1url2z1urs2z1urtz2wangz2weigz1weis2z1wel2z1wen2z1werz2werg2z1weszzi1s4",
		7 : "_al4tei_amt4s3_and4ri_an3gli_angst3_an4si__an4tag_ausch3_be3erb_be3r2e_berg3a_bo4s3k_bu4ser_da4rin_da4te__da4tes_de4in__dien4e_ebe2r1_en2d3r_en4tei_er4dan_er4dar_er4dei_er4der_es5t4e_fer4no_fi3est_fi4le__fi4len_ge5nar_ge3r2a_ge3r2e_ger4in_hau2t1_her3an_ho4met_ima4ge_ka2b5l_lo3ver_lus4tr_men3t4_orts3e_pa4r1e_reb3s2_re3cha_rein4t_reli3e_res6tr_ro3m2a_sali3e_sim3p4_sto4re_tage4s_to4nin_tri3es_ul4mei_urin4s_ur3o2m_ve5n2e_wei4ta_wor4tu_zin4stab1er2raber4ziaber4zoab3essea4cherfa4cherka4cheröach1o2bach2t1oach1u2fa3d2ar3ade1r2aade3s2pade5str2ad3recaf4t5reage4neba4gentuage4ralage4selage2s3pag3esseags4toca2h1erhah4l1eiahner4eahre4s3ahr6tria3isch_1a2k4adak5t4riala5ch2a2l1angalb3einalb3eisal4berh3a2l1efa4l3einal3endsa2l1erfa2l1erha2l1ert3a2lerza2l1eskali4eneali4nalal3lenda2l1o2bal4spalalt3eigalt3ricalt4stüalzer4zamen4seamp2fa2am4schlana4lin2ana1s4and4artandel4san2d3rüand4sasand3stean2f5laan2g1eian2g3raan2k1anan2k3noan2k3rä3antennan3t4heant3rina3ra3lia2r1anga2r1ansa2r1anza2r3appar2b3unaren4seare3r2aa2r1erhar2f3raari3e4nari3erdari3ergarin3itark3amtar2k1arark3aueark3lagark4trear4merkar3m2ora2r1o2dar2r3adarre4n3ar4schlar4trama4schecasch3laa2s3e2ma2s1o2fas4s3eia1s4tasas6t3rea2t1aktater3s2ato4mana2t1ortat4schnatt3angat3t4häat2t3räat4zerkat4zerwat2z1inau2b1alauch3taau4ferkaup4terau2s1ahau4schmau4schoaus3erp3aussagaus4se_aus5triau2t1äuä3isch_äl4schlän3n4e2ä2r1eneär4mentäser4eiäse4renäskopf3ät4schlät4schräu4schmäus2s1cba2k1erban2k1aba2r1ambau3s2k2b1eier2b1eimebe1in2hbe2l1enben3dorben4spaben4spr2b1entbben5t4rber4ei_be4rerkber4in_ber3issbe2s1erb3esst_be3s4ze4b1illubis2s1cb2i3tusbjek4to2b3leidbo2l1anbor2d1ibor2d3rbor2t3rbra1st42b3rat_2b3riemb4schanb6schefb4s1erfb4s1ersbst1a2bb2s3träbs3treubtast3rbu4schlbu4schmbu4schwbügel3eca3s2a3ch3a2bich3anst3chartache4fer4chelemche4ler4chents4chentwche3rei2ch1e4x3chines2ch1invch3lein2ch1unf4ckense4ckentw4ckerhö4ckerke2ck1err4ckerze2ck1eseck4stro2ck1um3co4der_com4te_comtes4cre4mes2d1alar2d1ammädan4ce_dan5kladan2k1odar2m1i2d1au2f2d1aus3delei4gde3leindel4lebdel4leide2l1obdel4sandel2s5edel2s1p4denergden4sende2re2bde4reckder3ediderer4tderin4f4derklä4derneuder3taudes3eltde2sen1de4stredes4tumdeten4tdge4t1edie4nebdi3ens_die2s3cdi2s5tedi4tengd2o3r4ador2f1a2d3rast2d3rauc3d4reck2d3reic3d4riscdrunge3drü5cked4s1amtds3assid4schind2s1e2bd4seinsd2s1engd2s1entd2s1erfd2s1erkd2s1erzd4s1etad3s2kand2s1pard3stell2d1un3ddu4schndu4schrdu4schwe4aler_e3at5t4ebens3eebet2s3eb4scheeb4stätebs3temebs3t2hech1o2bede3n2eeden4seeden4speder3t2ed2s1esed2s3treein4see2f1e2be2f1i2de2f1insege4strehen6t3ehe3strehl3eineh4lenteh5l2erehr1e2cehr3erleienge44eigeno1ei2g3nei3k4laei4leineil3inseim3allei4nengein4fo_ein4fosein4hab3einkomei2n1o23einsate4inverekt4antekt3erfekt3ergela4bene2l3a2me2l1a2re2l1eine3leinee4leing2e3len_e4lensee2l1ente2l1erge2l1errell3ebeell3eiseller4nelt3eng3elternelt3s2kelt3s2pe2m3anfe2m1ansem2d3a2e2m1erw1e2metiem2p3leena3l2ien3d2acend4ortend3romend3s2pene4bene4n1enten4entr4e3ner_e2n1erd1e2nerge2n1erle2n1erre2n1erse2n1erte2n3erue2n1erwe4n3esseni3er_e2n1i4me2n1o2benob4lee2n1o2ren3s2poen4terb3entspr4entwetenz3erte4ratemerd3erwer3echser1e2ckere4dite2r1e2h4e3rei_4e3ren_e4rensee4rentne2r3erfe2r1erher3e4tiere4vid3ergebn4ergehäe3ri3k44e3rin_e2r1ini3erlebnermen4serm3ersers4toder4tersert3ins3erweck6erweise4s3atoe2s3einese4lere3s2peke3s2pore3s4praess3erges2s1paestab4be4starb1e2stase1s2tecest3ories3tropeten3d2eter4höeter4tre4traume6t3recetsch3wet2t3auette4n1et4t1umeu3ereieu3g2ereve5r2iewinde3e2z1ennfa4chebfa2ch1ifäh2r1ufeh4lei2f1eing4f1einh2f1einw2fe2lekfe2l1erfel4sohfe4rangfer3erz4ferneufest3ei2f1e4tafet2t3afeuer3effel2d1f2f3emifi1er2ffi2l1anfisch3o2f3leinflu4gerfor4teifor2t3r2f5raucf4schanf4scheff4s1ehrf2s1entf4s1etaf3s2kief2s1pasf3s2porf4stechf3s4telf3sternft1a2bef4t1entft4scheft4s3täft4stri2f1u2nifun2k3rfus2s1p4gangeb2g3ankuga2s3eigas5tangebe4amge4lanzge4lessgel3stegel3t2agen4auggen2d1rgen3eidgen3erngen4samgen4ta_2g1entfge4renggerin4fgerin4tger4satger4stoges3aufges3eltge2s3erges3s2tgien2e12g3isel3g2laub2g1lauf4g3lein4g3lisc2gni2s13g2num_2g3rede2g3reic2g3rein2g3renng3riese2g3ring3g4runsg4s3a2kg4schefg3s2eilg3s2pekg3s2porgst3entgst3errg4s3torgs4trat4gungew2g1unglguschi5gus4serhaf3f4lhalan4chal4beihal4t3rhar4mes2h1aufmhau4spahäu2s1chba2r3ahe4b1eihe5ch2ehe2f1eihef3ermheiler4hei4nehheit4s3he2l3auh3e2lekhel3ershel4meihe4n3a2hen3endhen3erg2h3entwher3a2bhe4reck4hereighe4rerwh1er2foherin4fherin4sh3erlauhe2s5trhie4rinhif3f4rhi2l3a4hin4t1ahir4nerhlags4ohle3runhner3eih3nungeho2l1ei2hot3s2hrei4bah4r3eigh3re2s1h2r1etah3rieslhr2s1achr2s3anhr3schlhr2s1enhr4s1inhr4s1ofh2s1achh4schanhse4lerh2s1erlh2s1ingh2s1parhst3alth2s3tauh3steinh5stellhst3ranh3taktsh4t3alth4t3a2mh4t3assh2t1eimh2t1eish4tentfht3erfoht3erfüh2t1erhh4terklht3erscht3ersth2t1erzh4t1eseh4t1esshte3stah4t3rakht3randh2t3rath4t5rinh2t3rolh2t3rosh4t1rösht3spriht4stabhts4tieht4stürh2t1urshu2b3eihu2b1enhu2l3eihu4lenthu2l1inhut4zeni3alenti3alerfi3alerhi3a2leti3a4liai1ät3s4i2b1aufich2t3rieb4stoieb4strie2f1akie2f1anie3g4rai2e2l1aien4erfienge4fien3s2eie3r2erie4rerfi2er5niier4sehier3staier3steies2s3tie2t3hoie4t1ö4i2f3armift3erkif4t3riift3s2pi2g1angi4gefari3g4neuig3steiig4strei2k1a4ki2k1anoi4kanzei2ker2li2k1etaik4leriik2o3p4ikt3erki2l3a2mi4lentsi2l1erfi2l1ergi2l1erril2f3reilig1a2ili4gabi2l1indil3l2eril4mangil2m3atil2z1arilz3erki2m1armimat5scima4turi2m1erfi2m1erzi2m1infi2m1insindes4ii2n1engin3erbei4nerbiiner4löing4sam3inkarninma4leinn4stains3ertin3skanin3stelin4s3umional3aion4spiir2m1eii4s1amtisch3ari3s2chei4schefi4schini2sch1lisch3leisch3obisch3reisch3rui4schwai4schwoisch3wuise3infi4seinti2s1ermi2s1essis4s1aci1s4tati1s4teui1s4tilit3a4reiten3s2iti4kani2t1in1i2t3ranits1a2git2s1e4its3er1it4stafi2v1enei2v1enti2z1enejek4terjektor4je2t1u2jugend3jung3s42k1a2bo2k3a2drka3len_ka4lenskal3eri2k1annakari3es2k1artikau2f1okauf4spke1in2d2k1eise2ke2lek2ke3letkel3s2kk3enten2k1ents4kerfahk4erfamk3ergebk3er4hökerin4tker4kenker4neuker4zeu2k1i2dekie2l3o2ki3l2aki3n4o32k1inse4k1lastkle3ari4k3leit2k1o2fekop4fenkot4tak2k3räum2k3redekreier4k4s1amtk2s1ersk2s1erwk3stat4k2t3a2rk2t1erhk2t1ingkti4terk4torgakt3oriek2u3n2akuri4erku4schl4l3aben4l1a2bl2l1a2drla2g1oblan2d3rlang3s4l1a2po2la2r1anla2r1eila4rene3l4ar3glar3ini2l1ar3t3lasserla2t3ralat4tanlat2t3rlau2b3rlaub4se2l1ausslär2m1al2b1edel2b1insld3a2b1ld3a2ckl2d1a2dl2d3a2nld4arm_lecht4ele2g1asleh3r2elein4duleit3s22le2lekle2m1o24lendet4lenerg2l1ennilen4sem2l3entwlent4wäle2r3asl3ereigle4rers3lergehl3ergen2l1ergilerin4s2l1er2ö3l2erra2l1esellgeräu33lichem3licherliebe4slie2s3clik4ter2l1indulingst4lin2k1ali4schu2l1i4solkor2b1ll1a2bel2l1abtl2l1a2mlle4n3all3endul4lentsl4lerfol4lergoll3erntll3ertrl2l1indl2lo2bel2l1o2rll1ö4sellus5t6l2m3a2blm3einsl2m1e2pl2m1erz2l1o2bllos3t4r2l1ö4l3l2s1a2dl4s1ambl4schinl4schmül2s1e2bl2s1ersl2s1erwl2s1impls3ohnel4t3amel2t3atol2t1eislt4stablt4stocltu4ranluf2t1aluf2t1eluf2t5rlung4sclus4s3alus2s1cluss3erlus2s1olus2s3plus2s3tlus4stälus4t1alust3relut1o2fmach4trma4ges_ma4laktma4l3atma2l3ut2m1analman4ce_man3ers2m1angr4ma3r2oma3s2pa4m1aspemassen3mas4telma1s4trma2ta2b2m1au2fmäu2s1cmbast3emedien3mein4dame1i4so2m1e2miment4spme2r3apme4rensmerin4dmerin4tmerz4en4m1essames2s1omes2s1pme4t3römierer4mil4cheminde4sming3s4mi4schami4schnmi4schwmis2s1cmi2s5tem2m1ansmme4linm4mentwmme2ra2mme4recmmi1s4tmo4n1ermor2d3amoster4mpf3erpmpf3errms5trenm2t1erfm4t1ergm2t1erlm2t1ersm2t1ertm4t1etam2t1insmt3s2kamun2d1amül4lenmütter3na3chenna2l1a2na4lent4n1a2nana4schw4n1a2synauf4frn4austenbe3r2en3ce2n3n2d1anznde4al_nde4lännde4robn2d3ratn4d3runnd4stabnds3taune2e2i22ne2he_4n3eing4n3eink3ne3l2o4n1endb4n1endd4n1endf4n1endh4n1endk4n1endp4n1endt4n1endwne4nenenen4ge_nen4gen4n1entl4n3entwne2ra2bne3r4alne2r3am4nerbe_4nerben4n5erfonerfor42n3erhö2n1erlöner4mit4n1ernt3n2ers_2n3ersa4n3essine2t1akne2t1annett4scnfi4le_n2g3a2mn2g1andn2g1einnge4ramnge4zänn2g1i2dn3g2locngs5trinie3l2a3n2ing4ni4schwnitt4san4k3algn2k1insn2k1ortnk2s1aln4n1alln4nentsn2n1unfn2o3ble2n1ob2s2n3o2fenor2d5rno4t3eino2t3inno2t1opn2s1a2dn2s1alln2s1äusn6schefn4schronsen4spn2s1erkn2s1erön2s1erwn2s1erzn4s1etan2s1inin4stat_nst3eifn3stemmns4tentnst4erön4stracn4strien3t2a3cn4tanzan2t1eisn4t1essn2t1inhnton2s1nt3reifnt3riegntu4re_ntu4res1n2ung4n2z1a2gn4zensen4zentwn4zentznz3erwe2o3b4enoben3d4oben3seobe4riso2ch1ecocher4ko3d2e1iof2f1inoge2l1io2h1eiso2h1erto2h1erzoh4lergoh4lerwo3isch_ol2l3auoll1e2col2l1eiol4lerkoma4nero3m2eiso2m1indo2m1into2n1erbo2n1erdon3n2anont3antont3erwon4t3riop4ferdopi3er_o2r3almor2d3amor2d1irord3s2to4rientor2k3aror4mansor4mentor3n2o1oro3n2aor2t1akor4t1anor2t1auort3eigort3erfor2t3evort3insor4trauort3ricor2t1umo4sentso2s3peross3andos4t3amos3tarrost4artos4ta4soster3eos4t1obost3ranost3roto3t2e1iote2l1aote4leio2t1erwo2t1i2mot4terkoun4ge_our4ne_ozen4taöchs4tuögen2s1öl2f1eiö2r1e2lö3r2erzö2r1uneö2sch3mpa2r3afpar3akt2par2erpar4kampar4kaupe2l3a2pe3li4npe3n2alper2r1a2ph1erspil4zerpingen4pi2z1in3ple5n4po2p3akpo2p3arpor4tinpor4trepor6tripo2s3tepost3eipost3rap2p3a2bppe4lerp4t1entpt3ereip4t1erwp4t1erz2r1acetra4chebra4chinracht3rr3a2d3r3ra1k4l2r3alm_r4alt2hram4manram4m3uram2p3lran4dep4r3aneiran4spara2r1inra4schl2r3asph2r3attarau3e2nrau4man2raus5srbe3r2erchst4rr2d1elbrden4glrder4err2d1innre3alerrech3ar3reigewrei3l2arei3l2irei3necre1in2v2re2lek2r1entl2r1ents4r3entzr4ergen2r1ernä4r3erns4r3ernt3r2ers_2r1ersare2s2tu2r3evid2r3e2x1rfi4le_rfolg4srf4s1idrf2s3prr2g1a2drge4ralrge4taprgi4selr2g3ralrg5s2turi2d3anri3ers_ri3estiri2f1eirif4terri4generin4dexrin4diz4rinnta3r4ins_r4inspirin4tegrin4t5rri4schori4schwr3i2talr2k3reark4stecrkt3ersrk2t1o2rl2s3tor2m1aldr2n1anzr4n3eisr4n1enern3enser4n1ergrn4erhir4n1ertrol4lanron4tanros2s1cro3st2arre4aler2s1a2dr4s1amtr2s3angr3sch2er4stantrs4temprs4terbrst3ingrst3ranr2t1almrt3a4rer2t3attrtei3lartei1s4rten3s2rt3ereir4terfor4t3erhr2t1erkrter4rerte3s2kr2t1imar4treisrt4s1ehr2t1urtru3a2r3ruch3strun2d1arund3er2r1u2ni4r3uniorus2s1pru2t1o2rve4n1er2z1erfr2z1ergr2z1erkr2z1erwrz2t3ror3z2wecsa2cho22s1a2drsa4gentsa3i2k1sa2l1ids3ameri6s1amma2s3a2nasan4dri4s3antr4s3a2sy2s3aufb2s3ausb3s2ausesbe3r2es4ch2al4schanc4schangsch3ei_4schemp4schess4schiru4schle_sch6lit4schre_4schrinsch3rom4schrousch3s2k4schunt4schwetsch4wilsdien4e2s1echo2s1e2ckse2e1i4se2h1a2se4h1eise4herk5s4ein_sein4dusei3n2esein4fos4eins_4seinsp4seinstsel3ers2s1endl4s1entf2s3entg2s1entsser3a2dse2r3als3erbe_s3ereig2s1erfo4serfül4serken2s3ernt4s3eröf4sersehse4r1ufse3rund4se4tap4s1e2thsi3ach_siege4ssi2g1a2si2k1absik3erlsin3g4lsing3sasi4schuska4te_4skategska4tes4s3klassni3er_sni3ersso4l1eisol4ler2s1orga5s2orgeso2r1o24s1o2ve4spensi2s1peri3s2pi4e4spier43s4prec3sprosssrat4scss1a2cks4s1alas4s1albs4s3amts4s3angs4s3anzs3sa1s2s2s1egasse3infss3ersessquet4s3ta3li4s3tanns4t2ars3staus_st3a2ve4stechn3steilhstei4naste4mar6s5ter_3sterncs4t3ese3s4tett1s2ti2rst1i4sosto3s2t1s4trah4strans3s4tras4straum4s5träg4sträne4s5tref4streibst3renn2s4trig2s5trisst3rollstro4ma4st3run2s4t3s42stum2sstum4sc3s4tunds2t3uni2s3tuns2st3urtsuch4st3s4zeneße3r2eißi2g1a2ta2b1anta4bend2t1a2drta2g1eitahl3sk3t2aktuta4lensta2l1optan4gar2t1anme4t1anna3t2ans_4t3ansi4t3anspta4rens3t4a3rita2ta2bta2t3erta2t1um4t3ausg4t3auss4t1auswtbauer4tbe3r2e4teilhet3einget3einlate2l1abte2l1acte2l1autele4bete4l1ecte4l1ehte4leinte4lerd4t3elf_te2l1inte4losttel3s2kte2m1ei3temperte4na2dte4na2g4t3endf4t1endl4t3endpten3d4rten3eidten3ens4tenerg4t1eng_ten4glate4n3in4tensem4t3entw4t3entzte3ran_te2re2bter3endte4rengte4rerkterer4z4terfol4terfül3ter3g2t6ergru4terklä2t1erlöter4mert3erneuter4re_ter4sert4erst_t4erstit4erstute4r1ufter4wäh2t3erzbtes3tantest3eitestes4teu3ereteu3eriteu2r3a2t3e2xe2t1e2xi4thrin_4thrinsti4dendti3e4n3tie4recti4gerzti3k2erti2ma2gtim2m1atin2g1at1in1ittin2k1l3t2ins_4t1inseti4que_ti4schatisch3w3ti3t2etle2r3atmen6t3tmo4desto2d1ertor3inttra3chatra4demtra4far3t4ran_tre4ale3t4reib2t3reih4trenditre2t3r3t4runkt3s2chat4schart3sch2et4schefts4chemtsch4lit4schrot2s1e2bt4seindt2s1engt2s1entt2s1i2dts4paret3s2pont3s2port4spreits3tätit2s3tepts3tradt4strants3traut2s3trät4streut4stropt2s3trütte4lebtte4lent3u2fertums5trtung4s5tu2r1ertu4schlt2z1e2ct2z1eiet2z1eistz3entsubal3l2ubi3os_u2b3rituch4spruch4toruch2t3ru4ckentu3ck2eruden3s2ue3reigue4rergue4rerku4erinnuer4neru3erunfu3eruntu2f1ä2ßu2f1erhu4ferleufs3temuf2t1ebu4gabteu2g1erfu2g1erlugge4stu2g3rüsu3isch_u3ischsuk2t1inulm3einu2m3a2ku2m1artu2m1ausument4su2m1ergu2m1erlu2m1erwumpf4lium2p3leum2s1peun2d1umun2k1a2unk4titunk2t3run2n3aduns4t1runte4riunvoll3up4t3a2upt3ergu2r3a2mu2r1anau2r1angu2r3atturgros4ur3s2zeu2s1eseusi3er_us3partu2s1pasu5s4pizust3abeu5strasus6trisute4leiuter4eruto4berut4schlut4schmut4schöut2s3pautz3engüch2s1cück3eriü4ckersück4speü3d2ensü2f1ergü2h1engü2h1erkü2h1erzühr3ei_ül2l1eiün2f1eiü2r1entüste3neva2t3a4va4t1inve4l1auvenen4dve3rand2ve3s2evid3s2tvie2h3avie4recvi2l1invollen4vormen4waffel3wah4lerwalt4stwar3stewa4schawä3schewe3cke_we3ckeswei3strwer4gelwe4r3iowest3eiwest1o2wim4m3uwolf4s3wol4lerwor2t3rxi2d1emx2t1e2dxtra3b4x2t3rany2l3a2myl4ante3zambiqzei2t1aze2l1a2ze2l1erze2l1inzel3t2hze4n3aczen4semzen4zerze2re2b2z1ergäz3erhalzerin4tzer4neb2z1ersazert1a2zert4anzer4tin4zerwei3z2erzazessen4zger4s1zin4ser4zinsufzon4terz3t2herzu2g1arzu4gentzwan2d1",
		8 : "_al5l4en_anden6k_ar4m3ac_ar4t3ei_bei6ge__ber6gab_ber4g3r_de3r4en_einen6g_en4d3er_en5der__er4zen4_ka4t3io_lo4g3in_mode6ra_ost5end_oste6re_par3t4h_richt6e_sucher6_tan4k3la2ch1e2ca4ch3erwacht5ergach6tritack3sta43a2er2o1af4t3erlage4s3tiah4l3erhal4b3erw3a2l1e2bal2l3a4rall5erfaalli5er_al4t3erfam4t3ernand6spas3a4n1erban4g3erfan4g3erlan4g3erzang4s3poani5ers_an2t3a4ran2z1i4nau5ereinau4s3erwauster6mau4ten4gau4t3erhäs4s3erkbach7t4ebal4l3ehbe4r3eiwber6gan_ber3st4abe6steinbe4s3tolbote3n4ebst5einbbu4s3chach3e4ben6chergebcher6zie6ckergeb4d3achse2d1an3d23d4ärme_2d1e4ben3d2e1i2mde2l1a2gde4l3augdel5sterde4n3endden4k3li4den4semde3r4erbde3r4erfde4r3ero4d3erhöh4d3ersatdest5altdest5ratdienst5r2d1in1it4d3innerdi4t3erldi4t3ermdi4t3ersd4s3tätid3s4tern2d1u2m1edu4sch3le3a4reneech3t4eiege4n3a2eg4se4r1ehr6erleei4b3uteei4d3errei2m1a2gein6karnein6stalei6schwuei4s3erwek4t3erzeld5erstel4d3erwe4ler4fae4ler4lae4l3ernäe4l1e4taelgi5er_elgi5ersel4l3einemen4t3he6mentspen4d3esse4n3ermoeni5ers_en5sch4eenst5alten4s3täten4t3rolen4z3erfen4z3ergen4z3erke2r3a4sie4r3eis_e4r3entferi3e4n3er6tereiess4e3rees4t3enges4t3erhes4t3essestmo6deet4z3enteue6reifeut6schnfacher5ffal6schafal6schmfe4r3anzfrach6trf4s3tätif4s3tresf4s3tütef4t1e4tift4s3tanfzeiten6gas4t3el2g1eise2gel4b3ragel4b3rogel6dersge4l3ers4g3ereigge4ren4sge4r3entge4s3terglei4t5rgrammen6gros6selg3s4tatigs4t3rosgu4t3erhhaft4s3phal6lerfhau3f4lihau5steihau6terkhe4f3inghel4l3auhe2n1e2bhe4r3eishe4r3o4bhfel6lerhich6terho6ckerlhol6zeneh6rerlebh3s4terbh3t4akt_h4teil4zh4t3elith4t3entsht5erkenh6terneuh4t3erreh6terstaht6ersteht6raumeht4s3turhu4l3enghut4z3eria4l3ermie4n3a2gie4n3ergienst5räie4r3erziesen3s4ie4t3erhie4t3ertiker6fahi3l4aufbim4m3enti2n1e2bei4ner4trin2g1a2gin4n3ermin4s3tätir4m3untir4sch3wi4sch3eii5schingi6schwiri4s3etatiso6nendis4s3cheit4z3ergjah4r3eika4n1a4s6kantennkehr4s3oke4l3eim4ken4gagken5steiker6gebnkerin6stk3er4lauk3er4lebk6erlebe2k1er2zikeu6schlkor6dergkre1i2e4k4s3tanzk4t3erfolan2d3a22lat2t1alat4t3inl2d1e2seleben4s3lei6nerble4n3end5lentwetle4r3eim3l4ergew6lerwerbli4g3ers2l1in1itl6lereigl6lergebl6lergen2l1or3g2l4s3ort_l4s3tätils6ternels6ternsl4te4leml4t1e4skl2t1o2rilu2g1e2blus6serflus6serklus6serslu4t3ergl2z1u4femagi5er_magi5ersmar6schmmar6schrma4t3erdmen6tanz4m3entwi4m3ergänmes6sergmp4f3ergmp4f3erz4m3ungebmu4r1u2fnacht6ra4n3a2mernavi5er_navi5ersn4d3entsnder5stene2n1e2bn4g3erseng4s3e4h2n3i2gelni4k3ingn4k3erfanseh5eren4s3ort_n4s3prien4s3tatens6terbenst5opfenten6te_nt4s3parober3in4ode6rat_ode6rateoh4l3erholl5endsoll5erweol4z3ernonderer5on4t3endopf5erdeopi5ers_or4d3engo2r1e2ckorsch5lior4t3entor4t3ereor4t3offor4t3räuos4s3enzö4sch3eipargel6dpä4t1e2hpä4t3entpe4l3inkp2f1in3spos4t3agrach6trärali5er_rali5ersran4d3errau4m3agräu5scher2b1a2der4b3lastrch6terwrderin6sr4d3erntrege4l3äre4h3entreister6re4n3end4r3erken4r3erlaurge4l3errgen4z3w4r3innerrkstati6rk4t3engrk4t3erfrk6terscrk4t3erwr2m1o2rirn3e4benrol3l4enrpe4r3inr6scherlr4s3ort_r6strangr4t3erler4t3ernäru6ckerlrun6derlrun6dersrun6derwr4z3entssa4l3erbsat4z3en6schlein2s1e2bense4l3erl4s1e2pos6sereignse4r3eimse4r3enk2s1i2deoson5ende2s1o2riesrücker6sse3in4tstel4l3äs4t3endss4t3engls4t3entfste6rersstes6se_5st4reif1s4tri2ksun6derhtan6zerhta4r3eretau3f4litau6schrtau6schwtblock5e4t1e2bentein3e4cte2m1o2rte2n1e2bte3n4ei_ten4t3riten6zerh4t3erde_te4r3eif6tergreiter4n3art6erscha6terwerbtes6terkti4v3erlto6ckenttrücker6t4s1amt4t4s3esset3s4terotta6gess2t1u2niotu2r1a2gtu2r1e4tu2ch1e4cu3erin4tuern3s4tu4g3reisun4d3erfund5erhau2r1an5sur3a4renu6schentusch5werusi5ers_u4t3ersaüge6leiswach6stuwach4t4rwahl5entwandels6we5cken_wein4s3aweis4s3pwel6schlwel6schrwel4t3a2wen4k3ri5werdensxpor6terx2t1er2fx2t1il2l2z1e2benzeit5endzei4t3er4z3ergebzer4n3ei4z3erstezer4t3agzer6tere",
		9 : "_char8me__er8stein_he6r5inn_men8schl_men8schw_rü6cker6_wort5en6_wor8tendach8traumalli7ers_allkon8tral5s6terbausan8ne_äh4l3e4be6b5rechtebs3e4r3inchner8ei_dampf8erfden6s5taue6ch5erziee4r3en4ge6l5eier_erg3el4s3fal6l5erk6fel6ternfor4m3a4gforni7er_fzei8tendgot6t5erggrab8schegren6z5eihä6s5chenhe6rin6nuherin8terh6l3er4näh6t5erspaieler8gebi2k1e2r2eil4d3en4ti4sch3e4hkamp8ferfke6rin6nulan6d5erwlan6d5erzleis6s5erlepositi86mel6ternmorgen5s65n2en3t2aner8schlenich8tersn4n3er4wano6t5entrnsch7werdn5s6ternen5s6ternsos4s3en4kpapieren8ram6m5ersr8blasserres6s5erw6r5innenmris6t5ersr6st5eingrs4t3er4wr4t3er4lasfal6l5erspani7er_sse6r5atts4s3e4strsu6m5ents4t3a4genttblocken8tes6ter6gür4g3en4gvati8ons_vol6l5endwer6t5ermwin4d3e4czer6t5rauzes6s5end",
		10 : "_er8brecht_os8ten8deder6t5en6deren8z7endgram8m7endhrei6b5e6cos6t5er6werein8s7trewel6t5en6dwin8n7ersczge8rin8nu",
		11 : "_er8stritt__spiege8leiach8träume_lei8t7er8scpapie8r7endpiegelei8en",
		12 : "ach8träumen_7sprechende_",
		13 : "_er8stritten_"
	},
	charSubstitution : {
		'ſ' : 's'
	}
};

// The en-GB hyphenation patterns are retrieved from
// http://tug_org/svn/texhyphen/trunk/collaboration/repository/hyphenator/
Hyphenator.languages['en-gb'] = {
	leftmin : 2,
	rightmin : 3,
	shortestPattern : 2,
	longestPattern : 8,
	specialChars : "",
	patterns : {
		3 : "sw2s2ym1p2chck1cl2cn2st24sss1rzz21moc1qcr2m5q2ct2byb1vcz2z5sd3bs1jbr4m3rs2hd2gbo2t3gd1jb1j1dosc2d1pdr2dt4m1v1dum3w2myd1vea2r2zr1we1bb2e2edn1az1irt2e1fe1j4aya4xr1q2av2tlzd4r2kr1jer1m1frh2r1fr2er1bqu44qft3ptr22ffy3wyv4y3ufl21fo1po2pn2ft3fut1wg1ba2ra4q2gh4ucm2ep5gp1fm5d2ap2aom1cg3p2gyuf2ha2h1bh1ch1d4nda2nhe22oz2oyo4xh1fh5h4hl2ot2hrun1h1wh2y2yp2aki2d2upie22ah2oo2igu4r2ii2omo1j2oiyn1lz42ip2iq2ir1aba4a2ocn3fuu4uv22ix1iz1jay1iy1h2lylx4l3wn5w2ji4jr4ng4jsy1gk1ck1fkk4y5fk1mkn21vok1pvr44vsk1t4vyk5vk1wl2aw5cn2ul3bw5fwh2wi2w1m1wowt4wy2wz4x1an1in1rn1ql3hxe4x1hx1ill24lsn3mlm2n1jx1ox3plr4x5wxx4",
		4 : "d3gr_fi2xy3ty1a2x5usy5acx1urxu4on2ielph2xti4ni2gx4thn2ilx1t2x1s25niql3rix4osxo4n1logn2ivx5om1locl3ro2lo_l3nel1n4_hi2l5rul1mexi4pl1max3io_ex1l1lu_ig3ll5tll3sll3p_in14n2kl1loll3mn3le_ew4n1n4nne4l1lixi4cll3fn3nil1lal5skls4p_eu14no_l4ivx3erx3enl1itx1eml1isx5eg3lirli1qxe2d3lik5lihx1ec1lig4y1bn1oun4ow4li_x3c4yb2il1g2l2fox2as1leyn3p42lev1letx2ag4ni_l1te_es1nhy2yc1l4n1sw3tow5tenho4ns2cwra42lerle5qn2si3womwol4l1try1d4lek42ledwl1in3suw3la4le_l3don1teldi2nth2lce4yda4l1c2l1tu4lu_l4by_od4lbe4lu1a4laz_oi4l4awnt2iwes4l4aul4asn2tjla4p_or1n1tr5wein1tun2tyn1h2w4ednu1awe4b5nuc_os13nudl4all4af_ov4w3drl4aey3eenu3iw1b45nukl4ac5laa4la_4lue3kyllu1in1gu4wabn1go_ph2v5vikur5_en12vv2ks4ty3enk3slv5rov5ri4k1sk3rung1n2vowy1erkol4ko5a4vonk2novo2l2vo_5lupn2gingh4k3lok3lik3lak2l2ng2aki4wvi2tkis4k1inki2l5kihk3holu1vke4g3kee4kedkdo4_sa2k5d2_eg4k1b4kav4kap4vim4ka3ovi4lk4ann3v2nve2vic2ka4lju1v4vi_ju5ljui4_sh2ygi2nfo4_st44jo_3jo2jil43jigl4vi2vel3veive3gjew3jeu42ve_4jesjeo2y3gljal43jac2ja__th44ly_2izz_ti22izo_do2i5yeix3oy3in2i1wn2x4i2vov4ad2ny25nyc5vacn1z24va_nzy4uy4aux2o2oa2o3ag2ivauve2u4vayle2i3um2ittly1c4obau3tu2itrob2i4obo_up12ithob5tuts2lym2ut2o_ve2oc2ait1a2isyo1clo1crut2ioct2is1pis1lo1cy4usto2doo2du4isblyp2n4ew2ab_2abai4saoe3a2abbus1pir2sir4qoe4do5eeir1ioep5o5eqo3er2usco1etir1a3lyr3lywipy43oeuo3evi3poab1ro3ex4ofo2o1gur1uo2ga2abyac2a3lyzi5oxo3gii3oti1orioe4ur2so2gui1od2io22acio1h2ur1o2inuo3hao3heohy44ma_oi4cins24inqoig4ac1r2ino2inn4inl4inkur1ioi4our2f4oisoi4t2iniynd4ok3lok5u2ind2inco1loyn2eo1mai2moom1iur2ca2doim1iil3v4iluon1co2nead1ril3f4onh2ik24iju4adyae5aija4i5in4aed2mahae5gihy4ae5pur1aae4s2i1h4igions2i1geyng42ont4af_4afe5maka4fui3fyu2pri3foon2zn1eru4po4agli2fe2i1foo1iu1ph4ieua2groo4moo2pyn4yi1er4iemie5ia1heah4n4iec2ai24ai_ai3aa1icne2p4idraig2oo2tu1peo1paop1iy1o2u1ouu3os4oplid1ayo3d2icuop1uor1a2ick4ich2a1ja4ju2mam4iceak5u4ibuunu44iboib1i2oreiav4i3aui3atun5ror1iun5o2alei5aii3ah2unniaf4i5ae2ormhy4thyr4hy3ohyn4hy2m2orthy2l1man2nedhuz4un2ihu4gh1th4alko1sch4skhsi42mapu1mu2h1shry4hri4hre41mar4h1pum2ph2ou4osp4osuy2ph4oth4ho_u1mi2h1mh1leh3la2ne_h4irhi2pu1mao4u2oub2h1in2a2mhi4l4oueu1lu2ulsoug4h1ic2hi_u1loul3mnde24ulln2daheu2ul2iou3mam1ihet12ounhep1ow1iows4ow5yyp1nox3ih4eiox5oypo1oy5aoys4u1la4ul_am2pu2izmav4h2ea4he_y2prhdu42m1ban2ao1zo_ch4mb4dy5pu4pa_ha4m1paru2ic5pau2ui2h4ac4ha_u4gon1cug5z2uft43gynu4fou3fl3ufa5gymmb2iue4tgy2b4anhnc1t2g1w5paw3gun2p1bu4edueb4p1c42guep5d2an1og5to2pe_gs4tgs4c2g1san2s2ped3grug4rou2dog4reud4g1gr2n1crgov12gou3gosud4e3goop4ee3goe5god3goc5goa2go_pe2fg2nog1niuc3lg1na2gn2an2y2pes3gluyr4r3pet5aowyr4s4ap_4apa3glo4pexyr5uu4ch2gl24y2s5gip2me_3gioap1i2ph_gi4g3gib4gi_uba41g2igh2tg3hoa2prphe44aps2medg2gegg4ame2g2g1gy3shu1alua5hu2ag2g1f3get2ua2ph2lge4o1pho2tz23gen4phs1gel1typ4gef2ge_g5d4me2m1phug1at4pi_p2iety4a4ty_p2ilt3wopim23gait2wi3gagn3b44ga_5piqar3har1i1tutfu4c4fu_1menp2l23tunna2vfs4p2f3s1pla1fr2tu1ifo3v4tufp4ly2p1myso53foo2arrme4par2stu1afo2n4tu_4po_t2tytt5s3pod2aru4poffo2e3foc4fo_ar5zas1ays1t3flu2asc3flo3flan2asas2et3ti2fin5poypph44f5hf3fr1pr2f1fif1fena5o3feufe4t4pry2ps22asotta4p3sh5fei3fecass2p1sits2its4ht2sc2fe_4t1s2f5d4f5b5faw5farp1st2pt2as1u2fa_1f2aeyl44ey_1expe1wre3whe1waevu4p4trp1tupub1puc4p4uneus44eumeuk5eue4p4uset5zyzy4z1a14p1wet2t2p4y4tovpy3e3pyg3pylpy5t2za__av44ra_r2adras2et2ae1su1namr2bat1orr2berb2ir1c2r2clrct4nak24re_rea4e2sc4es_2erza2to5tok2erurei4erk44erj1tog3toere1qre1vza2irf4lr1g2r2gez4as4ri_2ereto1b2erd2to_2erc4m3hri3ori5reph14mi_2au24au_m1ic4auc4t3me1paeo3mt1lieo2leof2eo3b4enur1lar1leaun2r1loen2sen1ot1laen3kzeb4r1mur2n24ene2end3tiurn5nrnt4ze4d4ro_r2od4roiroo4r2opelv4e1lur4owti4q1tip4roxrpe2r2ph1tior3puaw1i5nahaw5y4mijr3ri_as12eleay3mayn4ays2r5rurry5ek4l2az2m2ilaze4e2ize2iv4eis2ba_t1ineig24eifeid45bahba4ir2seehy21timeh5se5hoe1h2e2gr2efuef4lna2ceep1ee2mee1iee5gee2fr3su2na_rt3ced4g1basede23mytr1turu3ar2udr4ufe1clru2le1ceru2pb1c2ec2a2b1deb2te2bre4bl3myi4be_3beaeb2iebe4eb2b2bedzib5r1v2r2veeau3t1icmy3e5bee3bef2r2yry2tz2ie1bel2sa_2sabeap25saebe3meak1ea4gsa4g3sai4ti_5sak4beobe3q4eabmy4dd3zo3dyndyl25dyksa2l2d2y2d1wsa4mbe3w2b1fbfa44b1hb4ha2bi_1biazi5mdu3udu2ps3apb4ie3ducbif42ths2du_z4isb1ilmi3od4swds3m4bimd5sl1saumi3pz3li3dox4s3bd4osd2or3doosby3bip4bi5qbir44zo_s1cab2iss1cedo4jd4ob4do_5zoa2d1mmtu4d5lu2bl2d1losch2d1la2dl4tha42th_m5si4m1ss2co2t3f1diu2se_se2a4bly2b1m3texbmi44b1nm4ry4bo_3boa2sed5bobdil4bo5h3sei1didse2p1dia4di_d4hu3bon4d1hxys4dg4ami2t2d5f1boo3dexs2es1set3sev3sex3sey2s1fsfi4_an1d3eqde1ps4idsif4bow2si4g2sin5boyzo5p3sipde3gs1it3dec2de_d3di2tep3miute2od1d4d3c4zot23davs2k24sk_d1atske2d3ap4sksd1agb3sc2sl44da_5zumb5sicy4tbso2te2ltei4cys4cy4m2b1tcyl34bu_5bubte2g1cyc2cy_bun2cu5v5cuu1cuss2le1curt4edc4ufc1tyc1tu4te_c1trs1n2s2na2so_t1ca5mix4b3w4zy_4by_3byibys45byt2ca_2tc23soes2olc1te5cafsos45cai5cakc1al3sou4t3bt4axc2ta4m1lcry2sph2s1plc2res2pos4pym3pum3pocoz4cov14mo_sre22moc5cao1caps1sa3cooss3mcon11cars4sns1sos1su1takss3wmod13coe4st_1tai3tah3coc3coa4co_taf4c3nim2pist3cc1atste2mo1mc4kem4ons1th2cim3cau2tab2ta_3cayc1c44stl3cilc3ch3syn4cigci3f4ce_4ci_3chrs1tu1cho2ced4chm1sylch5k4stw4cefce5gs4tysy4d4su_sug3sy1c3sui4ch_m3pa2cem4sy_cew4ce2t1cepsu5zm4op2swo2s3vzzo3",
		5 : "n5tau2cenn3centsves45swee5cencsu5sus4urg1cen2sur3csu5pe3cerasun4a3cerdsum3i5cern5cesss4u2m1s2ulce4mo3cemi4celysy4bi4chab3chae3chaisui5ccelo45cellchec44ched3chee3chemsuf3fch1ersu3etsud4asuct44chessubt2ch5eusu4b13chewch5ex5chi_3chiasu5ansy4ce1styl3ceiv3chio5chip3cedi3cedestu4m5cedace4cicho3a5choc4chois4tud3chor3ceas2st3sstre43chots2tou3stonchow5cean3chur43chut5chyd3chyl3chym1c2i24ceab4ciaccia4mci3ca4cids4cie_ci3ers4toeci5etccle3cifi4ccip4ci3gast3lisyn5esyr5icat4ucim3aci3mes5tizs4thu4cinds4thac4atss4tec4cintci3olci5omci4pocisi4cit3rt2abockar5cka5tt5adeck5ifck4scc2atcs4teb3clasc2le22cle_c5lecc4at_clev3cli1mtad4icli2qclo4q4stakclue4clyp55clystad2rtae5n1c2o2case5car4vco5ba3tagrco3cico5custab23tail4cody2tairco5etco3grcar5mt4ais4col_col3atal2css5poco5lyta3lyco4met4anecomp4cap3uta4pass5liss1ins1sifs1siccon3scon3ts3siacapt4coop4co3orcop4eco3phco5plco3pocop4t2corassev3s5seus1sel1tard3corn4corotar3n5cort3cos_sre4ssreg5co5ta3tarr5cotytas3it3asmco3vacow5a5tassco5zic4anotas4t5craftat4rc4ran5spomcam4is4plysple2ca3maca3lys2pins2pids3phacal4m4speocri3lcron4so3vi4crousov5et5awacrym3cryo34c5s4csim5tawn43calcc3tacc4alaso5thct1an4soseca3gos3orycad4rc4teasor3os2o2ps4onect5esct5etct2ics2onaso3mo1so2mc3timsol3acaco3c4acesody4sod3oc5tio2s3odc3tittcas4tch5u4t1d4smo4dsmi3gc1tomc3tons3mensmas4b3utec2tres3man3bustc2tumte3cr2s1m4buss2s5lucslov5c2ulislo3cs3lits5leycu4mi5cunacun4e5cuni5cuolcu5pacu3pic3upl4tedds3lets5leabur3ebunt4cus5a3slauc3utr4tedobun4a4teeicy4bib4ulit3egoteg1rcy5noteg3us1latbsin41tellbsen4d4abr1d2acdach43tels3dact4b1s2sky3ld4aled4alg4bry_dam5a3damed3amida5mu3dangs5keybrum4d3ard5darms3ketbros4tem3as5kardat4ub4roa4teme4tenet5enm4tenob2ridteo5l4bre_5sivad3dlid3dyite3pe4s1ivde5awde4bisi4teb2ranbram44sismde1cr4dectded3i4sishs1is24bralde4gude3iosi4prtep5i4sio_1sio45sinkde5lo1d4emsin3is2ine4boxy1silibow3ssif5f4demybous4den4d4dened3enh4sidssi4de4sid_3bourde3oddeo3ldeon2si4cu5terd3sicc4s1ibde2pu5botishys44shu4d4eres3hon5shipsh3io1derider3k3dermsh5etsh1er4shab1teri2s1g4der3s5deru4des_de3sa5descbor4nter5k3terrdes4isexo23borides1psewo4de3sq2t2es5seum1de1t4tes_de5thde2tise5sh4ses_bor3d3septsep3atesi4t3esqdfol4tes4tteti4dgel4d4genbon4ebon4cdhot4bol4tbol3itet1rdi2ad3diarbol4e4d1ibd1ic_3sensdi4cedi3chd5iclsen5g1dictsem4osem2i5self4sele4boke5selasei3gd4ifo2boid3seedbod5i5dilldilo4di3luse4dabo5amdi1mi2d1indin4ese2cosec4a3di1odio4csea3wdip5t3diredi3riseas4di4s1d4iscs4eamb3lis3dissbli2q2s1d22s1cud3itos4coi2ditybli3oscof44blikscid5dix4i3bler4the_b3lan5dlefblag43dlewdlin45blac4b5k4bi5ve4d1n24bity4thea4thed4sceidog4abis4od4ol_s4ced5bismscav3sca2pd4ols5dom_1thei3theobi3ousbe4sdo5mos4bei4donybio5mbio3l4dor_dor4mdort41bi2ot4hersavi2dot1asaur52dousd4own4thi_th5lo2thm25binad3ral3dramdran4d4rassat1u3dreldres4sa2tedri4ed4rifs2a1td4romsas3s3sas_4d1s2th4mi3thotds4mi1th2rb2iledt5hobigu3bi5gadu1at5thurduch5sar5sdu4cosap3rbid5idu5en2santdu5indul3cd3uledul4lsan3adun4asamp43b2iddu3pl5durod5usesam5o5thymbi4b1dver2be3trsa3lube3sl3sale2bes_be1s2dy5ar5dy4e3thyrber5sdyll35dymi5berrdys3pberl4thys42beree1actbe5nuea5cue5addbe1neead1i1ti2ati3abben4deal3abel4tsad5osad5is3actean5i2t3ibsac4qe3appear3a5sacks3abl2belebe3labe3gube5grryp5arym4bry4goeas4t5rygmry5erbe3gobe4durvi4tr3veyr3vetr3vene4atube4doeav5ibed2it3ic_eaz5ibe3daebar43becube3caru3tirus4pe2beneb5et4bease5bile4bine4bisbdi4ve4bosrur4ibde4beb1rat2icie4bucru3putic1ut3id_run4trun4ge5camrun2eec3atr4umib3blir4umeech3ie4cibeci4ft4ida2b1b2ru3in3tidirue4lt5idsru4cerub3rr4ube1tif2ec1ror4tusti3fert5sirto5lr1t4oec1ulrt3li4tiffr2tize2dat3tigie4dede5dehrt3ivr2tinrth2ir5teue3deve5dew5barsr5tetr1ted4tigmr3tarrta4grt3abed1itedi2v5tigued3liedor4e4doxed1ror4suse2dulbar4nrs5liee4cers3ivee4doti4kabar4d5barbr4sitba4p1r3sioeem3ib4ansee4par4sileesi4ee3tot4illr5sieefal4rs3ibr3shir3sha5bangr3setb4anee4fugrsel4egel3egi5ae4gibe3glaeg3leeg4mir3secr3seat4ilte5gurban4abam4abal5utim1abal3abag4a5eidobaen43backr4sare4in_e3ince2inee1ingein5ir2sanei4p4eir3oazz4leis3ir2saleith4azyg4r4sagaz5eeaz3ar2r1s2ek3enek5isayth4e4lace5ladr3rymelam4r3ryi3tinnay5sirro4trrog5rrob3ay5larric4ax2idrrhe3rre2lele3orrap4el1ere1lesrra4h4r1r44tinst4intrpre4el5exrp5ise1lierph5ee3limav1isti3ocrp3atav3ige3livavas3r4oute3loae3locroul35rouero3tue2logro1te4rossr4osa4roreel3soror5dav5arelu4melus42t1ise5lyi3elytr4opr4rop_emar4tis4c5root1roomem5bie1me4e4meee4mele3mem3tissro1noro3murom4pe4miee2migro3lyro3laroid3e3mioro3ictis2te4miuro3gnro1fero3doava4ge2moge4moiro3cuem5om4emon5roccro5bre2morro4beav4abr5nute5mozrnuc4au3thr5nogr3noc3titlem3ume5muten3ace4nalrn3izrni5vr1nisrn3inr3nicrn5ibr5niaenct42t1ivr3neyr3netr3nelaus5pene5den3eern5are5nepe2nerr5nadr3nacrn3abt3iveen1et4aus_rmol4e3newen3gien3icr3mocrmil5en5inr5migaur4o5tleben3oieno2mrm4ieenov3aun3dr2micen3sprme2arm4asr2malr5madr3mac3tlefen2tor4litau3marlat33tlem5tlenen3uaen3ufen3uren5ut5enwa5tlewe4oche4odaaul4taul3ir3keyr3ketrk1ere5olutlin4eon4ae3onteop4te1or1r5kaseor3eeor5oeo1s2eo4toauc3oep4alaub5iepa4t4a2tyr2i4vr2ispris4cep5extmet2eph4ie2pige5pla2t3n2ri5orri4oprio4gatu4mrin4sr4inorin4e4rimse1p4u4rimmr4imbri2ma4rim_at1ulr4ileri2esera4gera4lri3erri5elrid4e2ricur4icl2riceri3boer3be2r2ib2a2tuer3cher3cltoas4ri5apri3am4toccat1ri4ered3r2hyrhos4tod4irgu5frg5lier3enr3gerr3geor5geee3reqer3erere4sa4trergal4r4gagat3rarfu4meret42a2tra5tozatos4ere4ver3exreur4er3glre3unre3tur3esq2res_er2ider3ierere4rer4aer3into5dore5phre1pe3reos3reogre3oce3river5iza3too4atoner3mer4enirene2rena4r3empr5em_re1le4ero_re1lam5ordreit3re3isre1inre3if2atolre2fe3reerree3mre1drre1de2r4ed4atogeru4beru5dre3cure3ce3reavr5eautol4ltolu5es5ames5an4atiure3agre3afr4ea_to5lye3seatom4be5seeat1itese4lr4dolrd3lie1shie5shurdi3ord2inr5digr4dier4desr2dares3imes3inr5dame4sitrc5titon4er5clor4clees4od3tonnrcis2rcil4eso3pe1sorr2cesrca4ston3ses4plr4bumr2bosrbit1r2binrbic4top4er4beses2sor3belrbe5ca4timrbar3e2stirb1anr4baga2tif4toreest4rrawn4tor5pra3sor4asktor4qr2aseras3cati2crare2eta3p4rarcran2tet4asra3mur5amnet5ayra3lyra3grra4de3tos_eter2r2acurac4aetex4e2th1r2abo2etia5rabera3bae5timet3inath5re3tir5quireti4u1quet2que_e2ton4quar5quaktos4ttot5uath3ipyr3etou4fet1ri5tourt3ousath3aet1ro4a2that5etetud4pu3tre4tumet4wetra5q3tray4ater4tre_4trede3urgeur5itren4pur3cpur5beut3ipu3pipun2tpun3i3puncev3atpun4aeve4n4trewpum4op4u4mpu5ere4vese1viapuch4e2vict2rieevid3ev5igpu5be2trilt2rit4trixe4viuevoc3p5tomp3tilata3st4rode4wage5wayew1erata3pew5ieew1inp5tiee3witatam4ex5icpt4ictro5ft2rotey4as2a2taey3s2p5tetp1tedez5ieas5uras4unfab4ip2tarfact2p4tan2f3agp4tad5falopt3abtro1v3psyc3troypso3mt4rucfar3itru3i2t4rytrys42asta3feast4silfeb5ras3ph2fed1as5orfe1lifem3i2t1t4p3sacf5enias4loas4la3feropro1l4pro_3ferrfer3v2fes_priv24priopren3aski43prempre1dfet4ot3tabpreb3as5iva3sit4pre_f5feta5siof5fiaf3ficf5fieffil3prar4ff4lepra5dffoc3prac1as3int5tanppi4ct5tast3tedfib5u4fic_ppet33fici4ficsppar34p1p2fiel4asep4p5oxi1fi2l4asedfin2apo1tefind3fin2ef1ing3p4os3portpor3pf3itapo4paas2crt3tlifle2s2ponyflin4t5toip4o2nasan2pom4eas4afa5ryta3ryot5torar3umt3tospo3caar2thar3soar2rhar4pupnos4tu5bufor5bar3oxtu5en5formplu2m2plesaro4ntu4is3plen3plegfrar44ple_fre4sar3odfruc42tum_3tumi4tumsf1tedtun4aft5es2p3k2p2itutu4netur4dtur4npis2sfug4ap4iscfun2gp4is_fur3npir4tfus5oar3guar5ghpi4pegadi4pip4at3wa4ar3en3gale3pi1op4innpin4e3galot3wit5pilo3piletwon4pig3n5tychpict4g5arcg4arepi4crpi3co4picagar5p5garr1ga4sgas5igas3o3piarar4bl3phyltyl5ig4at_2phy_phu5ity5mig4attgat5ugaud5ga5zaar3baara3va3rau5geal3gean2ge4d3gedi5gednar1at3type4gelege4li1tyr13phrage4lu2gelygem3i5gemoara3mph3ou3phorgen3oa3rajt5ziat5zie4gereph1is2ges_5gessphi4nua3ciget3aara2ga5quia5punua5lu1philg3ger4phic3phibg3gligglu3g5glyph3etg4grouan4og5haiuar3auar2dg4hosuar3iap5lia5pirph2angi4atu1b2igi5coap3in4phaeub5loub3ragi4orgi4otaph3igi5pag4i4s5gis_gi2t15gituu1c2aa5peug3laru5chrglec43glerap3alpe4wag4leypet3rpe2tia1pacaol3iglom34glopa5nyian5yap4ery3glyp2g1m4a5nuta3nurg4nabper3vp4eri4pere5percpe5ongn5eegn3eru4comg4niapen5upel5v4pelean3uluco5tgno4suc2trant4ruc3ubuc5ulu5cumgo4etgo4geu5dacg5oidgo3isgo2me5gonnpe2duud1algoph44gor_5gorg4gorsg4oryud5epgos4t1anth3pedsg1ousan2teu4derudev4grab43gram3pedigra2pudi3ogril43pedeu5doigro4gg5rongrop4ud5onan3scgru5ipe4coan5otan2osanor3g4stiu5doran2oeg4u2agu5ab5guan4annyg5uatan5no5gueu4aniuuen4ogu2magu4mi4anigpawk4uer3agur4ngur4u4gurypau3pani3fan3icues4san3euan4eagyn5ouga4cug2niug3uluhem3ui3alp5atohae3opas1t1p4ashag5uha5ichais4par3luid5ouil4apa3pypap3uhan2gpa3pepa4pahan4tpan3iha4pehap3lhar1ahar5bhar4dpan1ep4alspa3lohar3opain2paes4pad4rhat5ouil4to3zygozo5ihav5oana5kuin4san3aeuint4amyl5am3ului5pruis4t1head3hearui3vou4laba3mon4ulacu5lathe3doheek4ul4bohe3isul3caul4ch4uleaow5slow5shu5leehem1aow5in3amidow5hahem4pow1elhe3orulet4h1er_owd3lher2bowd4io5wayow3anow3ago1vish5erho5varouv5ah1erlouss42ouseh1ersoun2dul4evami2cul2fahet3ioul4tul4iaheum3ou5gihe4v4hev5ihex5oa3men3ambuu5lomhi4aram1atou5gaul4poh4iclh5ie_h1ierou3eth1iesama4gh3ifyhig4ohi5kaa5madoud5iou5coou5caa5lynhin4dou5brul1v45ou3aalv5uh2ins4o1trh4ioral1vahip3lum3amhir4ro4touhit4ahiv5aumar4u5masalu3bh3leth1l2ihli4aum2bio1t2oot4iv2h1n2o5tiaal3phho3anho4cou4micho5duho5epo4tedhold1o3taxo3tapot3ama5lowh2o4nos1uru4mos4ostaos4saos1pihon1o1hoodhoo5rh4opea4louo5sono5skeh4orno4sisos1inos5ifhosi4o3siaalos4os5eual1ora3looo2seta3lomoser4hr5erhres4um4paos5eohrim4h5rith3rodose5ga5loeo3secumpt4un5abun4aeht5aght5eeo4scio2schos4ceos4caht5eoht5esun2ce4aliuosar5un3doos3alosa5iory5phun4chunk4hun4thur3ior4unu1nicun4ie4or1uun3inal1in5aligal3ifal1iduni5por4schy1pehy3phuni1vor1ouun3iz2i1a2ia4blo5rooorm1ii2achiac3oa2letork5a5origa1leoun3kni2ag4ia3gnor3ifia3graleg4a3lec4ori_al3chor5gn4ialnor4fria5lyi5ambia3me5orexi3anti5apeia3phi2ardore4va5lavor3eiore3giat4uore3fal3atun3s4un5shun2tiibio4or4duib5lia1laei4bonibor4or4chi5bouib1riun3usoram4ic3acor5ali4calic1an2icariccu4akel4i5ceoa5ismich4io5raiora4g4icini5cioais1iic4lo2i2coico3cair3sair5pi5copop2ta2i1cri4crii4crui4cry1op1top5soopre4air5aop2plic3umopon4i5cut2i1cyuo3deain5oi5dayide4mo4poiain3iu1pato1phyid3ifi5digi5dili3dimo4pheo1phaidir4op1ero5peco4pabidi4vid3liid3olail3oai5guid3owu5peeid5riid3ulaid4aa5hoo2ieg2ie3gauper3i5ellahar22i1enien2da1h2aoo4sei2erio3opt4iernier2oi4erti3escagru5oon3iag3ri2i1eti4et_oo4leag5otook3iiev3au5pidiev3o4ag1nagli4if4fau5pola5giao5nuson5urifi4difi4n4i2fla5gheifoc5ont4rupre4af5tai3gadaev3a3igaraeth4i3geraet4aono3saes3ton5oionk4si3gonig1orig3oto1nioo5nigon3ifig1urae5siae3on4ura_aeco34uraead3umura2gik5anike4bi2l3aila4gon4id4a2duil4axil5dril4dui3lenon4guuras5on1eto3neoon1ee4oned4oneaad1owon5dyon3dril1ina3dos4onauon3aiil5iqona4do2mouil4moi5lonil3ouilth4il2trad3olil5uli5lumo4moi4adoi4ilymima4cim2agomni3im1alim5amom2naomme4om2itomil44adoeomi2co3mia3adjuome4gurc3ai5mogi3monim5ooome4dom4beo3mato2malo2macim5primpu4im1ulim5umin3abo4mabur4duadi4p4olytina4lol1ouin5amin3anin3apo3losol1or4olocur3eain3auin4aw4adilol3mia5difolle2ol2itolis4o5lifoli2eo1lia4inea4inedin5eeo3leuol1erine4so3lepo3leo4ineuinev5ol5chol4an4infu4ingaola4c4ingeur5ee4ingiad4haur1er4ingo4inguoith44adeeada3v4inico3isma5daiur3faac2too3inguril4ur1m4ac3ry4ino_in3oioil5i4inos4acou4oideo2i4d4acosurn5soi5chinse2o3ic_aco3din3si5insk4aco_ac3lio3ho4ack5aohab34acitacif4in5ulin5umin3unin3ura4cicuro4do5gyrur5oturph4iod5our3shio3gr4i1olio3maog4shio3moi5opeio3phi5opoiop4sa5cato4gro4ioreo2grio4got4iorlior4nio3sci3osei3osii4osoog2naur5taiot4aio5tho4gioio5tri4otyur1teo5geyac3alurth2ip3alipap4ogen1o3gasip1ato3gamurti4ur4vaofun4iphi4i4phuip3idi5pilip3ino4fulipir4ip5isab1uloflu42abs_ip3lou3sadi4pogus3agi4pomipon3i4powip2plab3omip4reoet4rip1uli5putus3alabli4i3quaab3laus4apoet3iira4co4et_ir4agus3atoes3t4abio2abiniray4ird3iire3air3ecir5eeirel4a3bieires4oelo4ab1icoe5icir4ima3bet5irizush5aoe5cuir5olir3omusil52abe4ir5taoe4biabay4us4pais5ado5dytis1alis3amis1anis3aris5av_za5ri2s3cod3ul_xy3lod5ruo3drouss4eod3liis2er5odizod5it4iseuod4ilodes4o5degode4co5cyt2isiais5icis3ie4isim_vo1c4isisis4keus1troc5uo2ismais1onocum4iso5pu5teooc1to5ispr2is1soc2te_vi2socre3u3tieiss4o4istao2cleu3tioo5chuoch4e4istho4cea4istloc5ago3cadis1tro4cab4istyi5sulis3urut3leutli4it5abita4c4itaiit3am_vec5it4asit3at_ur4oit3eeo3busob3ul_ura4_up3lo3braith5io5botith3rithy52itiao5bolob3ocit1ieit3ig4itim_un5uob1lio3blaob3iti5tiqut5smit3ivit4liit5lo4ito_it5ol2itonit1ou_un5sobe4lu4tul_un3goat5aoap5ioan4t4itueit1ulit1urit3us2i1u2_un3eiur5euven3oal4iiv1ati4vedu5vinoad5io3acto5ace_ul4luy5er2v3abives4iv3eti4vieiv3ifnyth4va1cavacu1iv1itva4geivoc3vag5rv1al_1vale_tor1vali25valu4izahiz3i2_til4iz5oivam4i_tho4va5mo5vannnwom4jac3ujag5u_te4mja5lonwin44vasev4at_jeop34vatuvect4_ta4m4velev1ellve1nejill55jis_4venu5ve3ojoc5ojoc5ujol4e_sis35verbju1di4ves__ses1ju3ninvi4tjut3a_se1qk4abinvel3kach4k3a4gkais5vi1b4vi4ca5vicuvign3vil3i5vimekar4i1kas_kaur42v1invin2evint4kcom43vi1oviol3kdol5vi5omke5dak5ede_rit2_rin4ken4dkeno4kep5tker5ak4erenu1trker4jker5okes4iket5anu4to5vi3pkfur4_re3w_re5uvire4kilo3vir3uk2in_3kind3nunc5numik3ingkin4ik2inskir3mkir4rv3ism3kis_k1ishkit5cvit2avit1rk5kervi3tu_re5ok5leak3lerk3let_re1mv3ity_re1ivi5zovolv41know3vorc4voreko5miko5pe3vorok5ro4_po2pv5ra4vrot4ks2miv3ure_pi2ev5verwag3owais4w3al_w3alswar4fwass4nu1men3ult5labrwas4tla2can4ulowa1tela4chla2conu4isw4bonla3cula4del5admw5die_out1nug4anu3enlag3r5lah4nud5i_oth54lale_osi4_or2o_or4ilam1ol5amu_ore4lan2d_or3dn5turntub5n3tua3weedweir4n5topwel3ilapi4n3tomn1t2o_op2i_on4ent3izla4tenti3pn3tign1tient4ibwent45laur_ome2_ol4d_of5twest3_oed5l4bit_ob3lw5hidl2catwid4elcen4n1thelch4el3darl3dedl3dehwi5ern4teol5dew_no4cl3dien3teln4tecwim2pld5li_ni4cwin2ecen3int1atnt1aln3swale3cawl1ernsta4_na5kle5drleg1an3s2t3leggn5sonleg3ons3ivwl4iensi2tlel5olelu5n3sion3sien3sid5lemml3emnle2mon4sicns3ibwon2tn3sh2n5seule1nen2seslen3on5seclen5ule3onleo4swoun4wp5inn4scun2sco_mis1_mi4enre3mnre4ix4ach4les_x4adenpri4x3aggnpos4npla4npil4leur5x3amil3eva5levexan5dle4wil5exaxano4lf5id_lyo3lf3on_lub3l4gall4gemlgi4al4gidl4goixas5pxcav3now3llias4lib1rl1ic_5lich_lo2pnove2nou5v2nousli4cul3ida3nounn4oug3lieul4ifel4ifoxcor5_li4p3notenot1a_li3oxec3r1l4illil4ilim2bno3splim4pnos4on4os_lin4dl4inenor4tn4oronop5i5nood4noneno2mo1nomi3linqnol4i3liogli4ollio3mliot4li3ou5liphlipt5x5edlx5edn_le2pl4iskno3la_le4ml2it_n5ol_no4fa3lithnoe4c3litrlit4uxer4gn4odyno4dinob4ln5obilk5atxer3on5nyi_ki4ex3ia_nnov3x4iasl5lasl4lawl5lebl1lecl1legl3leil1lellle5ml1lenl3lepl3leul3lev_is4o_is4c_ir3rx5ige_in3tllic4nlet4_in3ol5lie4n1l2l2linnk5ilnk5ifn3keyl5liolli5v_in2ixim3ank5ar_in3dllo2ql4lovnjam2_im5b_il4i_ig1n_idi2llun4l5lyal3lycl3lygl3lyhl3lyil5lymx4ime_hov3_ho2ll4mer_hi3bl5mipni3vox4it__he4ilneo4x4its5loadniv4ax4ode_hab2ni4ten5iss2locynis4onis4l_gos3n4isk4loi_lo5milom4mn4is_lon4expel43nipuni1ou5nioln4inu5ninnnin4jn4imelop4en3im1l3opm1lo1qnil4ax4tednik5e3nignn3igml4os_lo1soloss4_ga4mnift4nif4flo5tu5louplp1atlp3erxtre4l5phe_fo3cl2phol3piel3pitxur4b1y2ar_eye3_ex3a3yardl5samls5an4nicllsi4mls4isyas4i_eur4l1s2tni3ba3niac_es3tl5tar_es3pl4teiyca5mlth3inhyd5y3choltin4lti3tycom4lt4ory2cosnhab3_er2al4tusyder4_epi1luch4_eos5n2gumlu4cu_ent2lu1enlu5er_en3slu4ityel5olu4mo5lumpn4gry_en5c5lune_emp4n5gic_em3by5ettlusk5luss4_el2in5geen4gae_ei5rlut5r_ei3dygi5a_ec3t_eco3l4vorygo4i_dys3_du4c_do4eyl3osly4calyc4lyl5ouy1me4news3_de4wly4pay3meny5metnet1ry5miaym5inymot4yn4cim4acanet3an1est1nessn1escmact44mad_4mada4madsma4ge5magn2nes_yn3erma5ho3ma4i4mai_maid3_der2ner2vner5oyni4c_de1mneon4m3algneo3ln3end4n1enne2moyoun4n4ely2neleyp5alneis4man3a5negune3goneg3a3nedi_dav5m4ansne2coyper3m3aphy4petne4cl5neckn3earyph4en3dyind2wemar3vn4dunndu4bn2doundor4n5docnd1lin3diem4at_n1dicnd4hin5deznde4snde4ln1dedn3deayph3in3damm4atsn3daly4p1iy4poxyp5riyp4siypt3am5becn4cuny3ragm4besyr3atm2bicnct2oyr3icm4bisy5rigncoc4n1c2lm3blimbru4mbu3lmbur4yr3is_can1ys5agys5atmea5gn4cifme4bame4biy3s2c4med_n4cicn3chun3chon3chan5ceyme4dom5edy_bre2n5cetn3cer4melen1c2anbit4nbet4mel4tnbe4n_bov4ys1icys3in3men_2menaysi4o3nautnaus3me1nenat4rnati45meogys4sonas3s4merenas5p2me2snas5iys4tomes5qyz5er1me2tnam4nmet1e3nameza4bina3lyn5algmet3o_aus5_au3b_at3t_at3rza4tena5ivmi3co5nailm4ictzen4an5agom4idina4ginag4ami5fimig5an2ae_mi2gr_as4qmi5kaz5engm3ilanadi4nach4zer5a3millmi5lomil4t3m2immim5iz3et4_ari4_ar4e_ar5d5zic4_ap4i5my3c_any5z3ing3zlemz3ler_an3smu4sem5uncm2is_m4iscmi4semuff4zo3anmsol43zoo2_and2zo3olzo3onzo5op4mity_am2i_al1k_air3_ag5nmlun42m1m2_ag4amp5trmp3tompov5mpo2tmmig3_af3tmmis3mmob3m5mocmmor3mp3is4m1n2mnif4m4ninmni5omnis4mno5l_af3f_ae5d_ad3o_ad3em3pirmp1inmo4gom5pigm5oirmok4imol3amp5idz3zarm4phlmo3lyz5zasm4phe_ach4mona4z3ziemon1gmo4no_ace45most_ab4imo3spmop4t3morpz5zot",
		6 : "reit4i_ab3olmo5rel3moriam5orizmor5onm3orab3morse_acet3_aer3i_al5immo3sta2m1ous_al3le4monedm4pancm4pantmpath3_am5ar_am3pemper3izo5oti_am3phmo4mis_ana3b_ana3s_an5damog5rimp3ily_an4el_an4enmmut3ammin3u_an4glmmet4e_ant3am3medizing5imman4d_ar5abm5itanm3ists_ar5apmsel5fm3ist_5missimis3hamuck4e4misemmul1t2_ar4cimu5niomun3ismus5comirab4mus5kemu3til_at5ar1m4intmin3olm4initmin5ie_bas4i_be3di5myst4_be3lo_be5sm5min4d_bi4er_bo3lo_ca3de_cam5inac4te_cam3oyr5olona4d4amil4adnad4opyr3i4t_car4imid5onn4agen_ca4timid4inmi4cus_cer4imi3cul3micromi4cinmet3ri4naledyp5syfn4aliameti4cmeth4i4metedmeta3tna5nas_cit4anan4ta_co5itnan4to_co3pa4n4ard_co3ru_co3simes5enmer4iam5erannas5tenat5alna5tatn4ateena3thenath4l5mentsn4ati_nat5icn4ato_na3tomna4tosy4peroy4periy5peremend5oyoung5naut3imen4agna5vel4m5emeyo4gisnbeau4_de3linbene4mel3on_de3nomel5een4cal_yn4golncel4i_de3ra_de3rimega5tncer4en4ces_yn5ast3medityn5ap4nch4ie4medieynand5ynago43mediaym4phame5and_de3vem5blern4cles_dia3s_di4atmb5ist_din4anc4tin_dio5cm5bil5m4beryncu4lo_east5_ed5emncus4tmbat4t_elu5sn3da4c3m4attn4dalema3topnd3ancmat5omma3tognde3ciyes5tey3est__em5innd3enc_em5pyn3derlm4atit_en5tay4drouma3term4atenndic5undid5aydro5snd5ilynd4inend3ise_epi3d_er4i4nd5itynd3ler_er4o2_eros43mas1ty4collnd5ourndrag5ndram4n5dronmassi4y4colima3sonyclam4mar5rima3roone3aloma5ronne2b3umar5ol5maran_erot3_er4rima5nilych5isne4du4manic4man3dr_eth3e3m4an__eval3ne5lianeli4g_far4imal4limal3le_fen4dm3alismal3efmal5ed5male24nered_fin3gxtra3vner4r5mal3apxtra5d2mago4ma4cisne3sia5machy_fu5ganes3trmac3adnet3icne4toglys5erxtern3neut5rnev5erlypt5olymph5n4eys_lyc5osl5vet4xter3ixpoun4nfran3lv5atelu5tocxpo5n2_ge3ron3gerin5gerolut5an3lur3olu3oringio4gn5glemn3glien5gliol3unta_go3nolu2m5uxo4matluc5ralu2c5o_hama5l3t4ivltim4alti4ciltern3lt5antl4tangltan3en4icabni4cen_hem5anict5a_hy3loni4diol3phinni4ersximet4lot5atnif5ti_ico3s_in3e2loros4lo5rof_is4li_iso5ml4ored_ka5ro_kin3e5nimetn4inesl3onizl3onisloni4e3lonia_lab4olo5neyl5onellon4allo5gan3lo3drl3odis_la4me_lan5ixen4opnitch4loc5ulni3thon4itosni5tra_lep5rni3trinit4urloc3al5lob3al2m3odnivoc4niz5enlm3ing_lig3anjur5illoc5ulloc3an5kerol3linel3linal5lin__loc3anland5lli5col4liclllib4e_loph3_mac5ulli4anlli5amxa5met_math5llact4nni3killa4balk3erslk3er_lkal5ono5billiv5id_ment4_mi3gr_mirk4liv3erl5ivat5litia5liternois5il3it5a5lisselint5inom3al3lingu5lingtling3i3nonicw5sterws5ingnora4tnor5dinor4ianor4isnor3ma_mi5to_mo3bil4inasl4ina_wotch4word5ili5ger_mon3a5lidifl4idarlict4o_mu3ninova4l5licionov3el_mu3sili4cienow5erli4ani_myth3_nari4le5trenpoin4npo5lale5tra3les4sle3scon4quefler3otleros4ler3om_nast4le5rigl4eric3w4isens3cotle5recwin4tr_nec3tle5nielen4dolend4e_nom3ol5endalem5onn5sickl5emizlem3isns5ifins3ing_nos3tn3s2is4leledle3gransolu4le4ginn4soren4soryn3spirl3egan_obed5nstil4le5chansur4e_ob3elntab4unt3agew5est__oe5sont5and_om5el_on4cewel4liweliz4nt3ast_opt5ant5athnt3ati_or3eo3leaguld3ish_pal5in4tee_n4teesld4ine_pa5tald3estn4ter_n3terin5tern_pecu3war4tel5deral4cerenther5_ped3elav5atlat5usn4tic_ward5r_pend4n4tics_pep3tn3tid4_pi3la_plic4_plos4_po3lan5tillnt3ing_pop5lvo3tar_pur4rn4tis_nt3ismnt3istvo5raclat5al4laredlar5delar5anntoni4lan4tr_re3cantra3dnt3ralviv5orn3tratviv5alnt3rilv5itien5trymlan3etlan4er3landsvi5telland3i3land_lan3atlam4ievi3tal2v5istla4ic_la4gisla3gerlac5on5visiola5cerla5ceolabel4vi5ridlab5ar_re3ta5numerkin5et_rib5anu3tatn5utivkey4wok5erelkal4iska5limk2a5bunven4enven5o_ros3ajuscu4_sac5rjel5laja5panja2c5oi5vorevin5ta_sal4inym5itv5iniz5vinit3vinciiv3erii4ver_iv5elsoad5ervin4aciv5el_oak5ero3alesiv5ancoal5ino5alitit5uar_sanc5oar5eroar4se_sap5ait4titoat5eeoat5eri4tric_sa3vo4i5titob3ing2obi3o_sci3e4itio_it4insit4in_it5icuiti4coi5tholitha5lobrom4it3erait3entit3enci3tectit4ana3istry_sea3si4s1to5vider_sect4oc5ato4o3ce25vict2ocen5ovice3r_se3groch5ino3chon_sen3tvi4atroci3aboci4al5verseis4taliss4ivis5sanis4saliss5adi3s2phocu4luver4neislun4ocuss4ver3m4ocut5ris3incis5horocyt5ood3al_ish3op4ishioode4gao5dendo3dentish5eeod3icao4d1ieod3igais3harod1is2v5eriei2s3etis5ere4is3enis3ellod5olood5ousise5cr4i1secisci5cver3eiver5eaven4tris5chiis3agevent5oir5teeir5ochve5niair4is_ir2i4do3elecoelli4ir5essoe3o4pire5liven4doi5rasoven4alvel3liir4ae_ir4abiv4ellaip3plii4poliip3linip4itiip1i4tip4ine_su5daiphen3i1ph2ei3pendog5ar5v3eleripar3oi4oursi4our_iot5icio5staogoni45ioriz4ioritiora4mvel3atiod3i4ioact4_sul3tintu5m_tar5oin3til_tect45vateein4tee_tel5avast3av5a4sovar4isin3osiin5osei3nos_oi5ki5oil3eri5noleoin3de4vantlvanta4oin4tr_ter4pin3ionin4iciin5ia_oit4aling3um4ingliok4ine4ingleing5hain5galo4lacko5laliinfol4olan5dol5ast_thol45val4vole2c4ol5eciol5efiine5teole4onin3esi4in5eoo3lestin5egain5drool3icao3lice_ti5niol5ickol3icsol5id_va5lieo3lier_tri3dinde3tvager4oli5goo5linaol3ingoli5osol5ip4indes5inde5pin5darollim34vagedol4lyi3vag3ava5ceo4inataol3oido4lona_tro4vi3nas_in4ars_turb44ol1ubo3lumi_turi4ol3us_oly3phin3airin5aglin4ado4inaceimpot5im5pieo4maneomast4_tu5te_tu3toi3mos_im5mesomeg5aome3liom3enaomen4to3meriim5inoim4inei3m2ieomic5rom4ie_imat5uom4inyomiss4uv5eri_un5cei5m2asim3ageil5ureomoli3o2mo4nom5onyo4mos__un5chilit5uom5pil_un3d2il4iteil5ippo5nas__uni3c_uni3o4iliou_un3k4oncat3on4cho_un3t4u4t1raon3deru4to5sili4feili4eri5lienonec4ri3lici_ve5loon5ellil3iaron3essil3ia_ong3atilesi45u5tiz4o1niaon5iar2oni4conic5aut3istut5ismon3iesigu5iti4g5roi5gretigno5m4onneson5odiign5izono4miu5tiniut3ingo5nota_ver3nig3andu4tereon4ter_vis3ionton5if5teeon4treif5icsut5eniutch4eif3ic_u3taneoof3eriev3erook3eri5eutiiet3ieool5iei3est_i1es2ties3eloop4ieieri4ni3eresus5uri4idomioot3erooz5eridol3ausur4eo5paliopa5raopath5id4istopens4id1is43operaus4treidios4_vi5sooph4ieo5philop5holi3dicuus1to4iderm5op3iesop5ingo3p2itid3eraust3ilid3encopol3ii5cun4op5onyop5oriopoun4o2p5ovicu4luop5plioprac4op3ranict5icopro4lop5ropic4terust5igust4icicon3ous5tanic5olaor5adoich5olus3tacic5ado4oralsib3utaoran3eab5areorb3ini4boseorch3iibios4ib3eraor5eadore5arore5caab5beri5atomia5theoreo5lor3escore3shor3essusk5eru4s1inor5ett4iaritianch5i2a3loial5lii3alitab3erdor3ia_4orianori4cius5ianorien4ab3erria5demori5gaori4no4orio_or5ion4oriosia5crii2ac2rus4canor3n4a5ornisor3nitor3oneabi5onor5oseor5osohys3teorrel3orres3hyol5ior4seyor4stihyl5enort3anort3atort3erab3itaor3thior4thror4titort3izor4toror5traort3reh4warthu3siahu4minhu5merhu4matht4ineht4fooht3ensht3eniab4ituht3en_ab3otah3rym3osec3uhrom4ios5encosens43abouthre5maabu4loab3useho4tonosi4alosi4anos5ideo3sierhort5hho5roghorn5ihor5etab3usio3sophos3opoho2p5ro3specho5niohong3ioss5aros4sithon3eyur3theos4taros5teeos5tenac5ablur5tesos3tilac5ardost3orho5neuhon5emhom5inot3a4gurs3orho4magach5alho5lysurs5ero5ta5vurs5alhol3aroter4muroti4ho3donachro4ur5o4mach5urac5onro5thorurn3ero5tillurn3alh5micao3tivao5tiviur5lieo5toneo4tornhirr5ihio5looturi4oty3lehi5noph5inizhi5nieh2in2ehimos4hi5merhi5ma4h3ifi4url5erhi4cinur5ionur4iliur4ie_ac2t5roult5ih4et3ahes3trh5erwaound5aac5uatur3ettoun3troup5liour3erou5sanh4eron5ousiaher5omur1e2tur3ersova3lead5eni4ovatiad3icao4ver_over3bover3sov4eteadi4opadis4iovis5oo2v5oshere3ohere3aherb3iherb3aher4ashende5ur5diehe5mopa3ditihemis4he3menowi5neh3el3ohel4lihe5liuhe3lioh5elinhe5lat5admithe5delhec3t4adram4heast5ad3ulahdeac5ae4cithavel4ura4cipac4tepa5douhas4tehar4tipa3gan4pagataed5isu5quet4pairmpa5lanpal3inag4ariharge4pan5ac4agerihant3ah5anizh1ani4agi4asham5an4aginopara5sup3ingpa3rocpa3rolpar5onhagi3oag3onihaged5agor4apa3terpati4naha5raaid5erail3erhadi4epaul5egust5apa5vilg4uredg4uraspaw5kigui5ta5guit43guardaim5erai5neagrum4bpec4tugru3en5ped3agrim3a4grameped3isgour4igo5noma3ing_5gnorig4ni2ope5leogn4in_pen4at5p4encu5orospen5drpen4ic3p4ennal5ablg2n3ingn5edlalact4until4g5natial5ais5gnathala3map3eronalc3atald5riun4nagg5nateglu5tiglu5tepes4s3ale5ma4g5lodun5ketpet3eng5lis4gli5ong4letrg4letoal3ibrali4cigin5gigi5ganun3istph5al_gi4alluni3sogh5eniph5esiggrav3ggi4a5al5icsg5gedlun4ine3germ4phi5thgeo3logen5ti4phobla5linigen5italin5ophos3pgen4dugel5ligel4ing4atosg4ato_gat5ivgast3ral5ipegasol5ga5rotp5icalu3n2ergar3eeg5antsgan4trp4iestpi5etip5ifieg5ant_un4dus4ganed4alis_gan5atpi3lotgam4blun4diepin5et3pingegali4a5p4insga5lenga4dosga4ciefu5tilpir5acfu3sil4furedfu4minundi4cpiss5aunde4tpis4trft4inefti4etf4ter_un3dedpla5noun4dalalk5ieun4as_al4lab4pled_frant4frag5aunabu44plism4plistal4lagu4n3a4umu4lofore3tfor4difor5ayfo5ramfon4deallig4fo4liefo1l4ifoeti42p5oidpois5iump5tepo4ly1poly3spoman5flum4iump5lipon4acpon4ceump3er3ponifpon5taf3licaf5iteepo5pleal3ogrpor3ea4poredpori4ffir2m1fin4nial3ous5fininpos1s2fi3nalu4moraumi4fyu2m5iffight5fier4cfid3enfi5delal5penp4pene4ficalumen4tal3tiep4pledp5plerp5pletal5uedal3uesffor3effoni4ff3linf2f3isal5ver2a1ly4fet4inaman5dul3siffet4ala3mas_fest5ipres3aulph3op3reseulph3i5pricipri4es4pri4mam5atuam4binfest3ap5riolpri4osul4litfess3o4privafer5ompro3boul4lispro4chfe5rocpron4aul4latam5elopro3r2pros4iu5litypro3thfer3ee4feredu5litipsal5tfemin5fea3tup5sin_fant3iul5ishpsul3i4fan3aul3ingfa5lonu3linefa2c3ufa3cetpt5arcez5ersp5tenapt5enn5pteryez5er_ex4on_ew5ishamen4dp2t3inpt4inep3tisep5tisievol5eevis5oam3eraev5ishev4ileam5erle4viabpudi4ce4veriam5icapu4laramic5rpu5lisu5lentu1len4a3miliev5eliev3astpun5gieva2p3eval5eev4abieu3tereu5teneudio5am5ilypu3tat5ulcheet3udeet3tere4trima5mis_et4riaul5ardet4ranetra5mamor5aetra5getor3iet3onaamort3am5ose3quera4quere4ques_et5olo5quinauit5er3quito4quitueti4naeti4gie3ticuuisti4ethyl3ra3bolamp3liuis3erampo5luin4taet5enia5nadian3agerag5ouuinc5u3raillra5ist4raliaet3eeret3atiet3ater4andian3aliran4dura5neeui3libra3niara3noiet5aryan3arca5nastan4conrant5orapol5rap5toet3arieta5merar3efand5auug3uraan5delet3al_es4ur5e2s3ulrass5aan5difug5lifra5tapra5tatrat5eurath4erat3ifan5ditra5tocan5eeran3ellra4tosra5tuirat5umrat3urrav5aian3ganrav3itestud4ra3ziees5tooe3stocangov4rb3alian4gures5taue5starest3anesta4brbel5orb3entes4siless5eeessar5rbic5uan5ifor5binee5s2pres5potan5ionrbu5t4es5pitrcant54anityr4celean3omaan4scoans3ilrcha3irch3alan4suran2t2ar3cheor4cherud3iedr4chinrch3isr3chites3onaan3talan5tamrciz4ies3olae3s4mie3skinrcolo4rcrit5an4thies4itses4it_e5sion3anthrrd4an_es5iesr5de4lr3dens4anticrd5essrd5ianan4tiee5sickes5ic_rd3ingesi4anrd1is2rd5lere3sh4aes5encrd5ouse5seg5e3sectescut5esci5eant4ives5chees5canre5altre5ambre3anire5antre5ascreas3oeryth35erwauan4tusreb5ucre3calrec4ceer4vilan5tymre3chaan3um_an5umsap5aroerund5ert5izer4thire3disre4dolape5lireed5iu4cender4terer5tedre3finuccen5re5grare3grereg3rire3groreg3ulaph5emer4repaph5olaphyl3ero5stero5iser3oidern3it4reledre3liarel3icre5ligreli4qrel3liern3isrem5acap5icuub3linern3errem5ulu4bicuren5atr4endiap4ineren4eser4moirenic5ren4itub5blyre5num4eri2ta3planre5olare3olier4iscer3ioure4pereri4onrep5idre3pinre3plere4preeri4nauari4ner3iffre5reare3r2uapo3thre3scrre3selre3semre3serap5ronre5sitre3speapt5at4arabiara5bore5stu3retarre3tenar3agear5agire1t2ore5tonre3trare3trere5trier4ianer3ia_ergi3ver3ettrev3elrevi4ter3etser3et_ar3agoar3allaran4ger3esier5eseere5olr4geneeren4e5erende4remeer5elser5ellr5hel4rhe5oler5el_er3egrer3ealerdi4eerd5arerb5oser3batar5apaer5atuarb5etar4bidty4letri5cliri3colri5corri4craarb3lirid4aler3apyer3apier3aphera4doar4bularch5otwi5liri5gamaren5dri5l4aar5ettar3ev5ar5iff5tur5oequin4rima4gar4illrim3ate4putarimen4e3pur5ept3or5turitr4inetturf5iturb3aep5rimt4uranrins5itu5racep3rehtun5it5rioneepol3iepol3ari5p2ari5piear5iniep3licarm3erris4ise4peteris4paris4pear5mit4ristiri3tonr5it5rep5ertriv4alar3nalar3nisriv3enriv3il5ri5zoar5oidep5arceor4derk5atir5kellrk5enia5rotieol5ata5roucr3kiertud5ier5kin_r5kinsrks4meen4tusent5uptu5denr3l4icr3liner5linsen4tritu4binen5tiarma5cetuari4ent3arr4mancr4manor4marir4maryen4susars5alart5atarth4een4sumens5alrm4icar5m2iden3otyenit5ut4tupermin4erm3ingarth3rar5tizen5iere2n3euen4ettrmu3lie3nessen5esiener5var5un4as5conrn3ateas5cotrn5edlt3tlerr3nessrn5esttti3tuas3ectt5test3encept4tereen3as_rn4inee2n3arrn3isten4annash5ayem4preash5ilem5pesas5ilyempa5rask5erem3orras5ochrob3letstay4e3moniem3oloemod4uemo3birody4n4emnitem4maee4mitaem3ismem5ingem3inar4oledas4silassit5as4tatro5melro3mitas4tiaas3tisemet4eron4ac4ronalas4titron5chron4dorong5ir5onmeem5ero4asto2as3traas4trit5roto4atabiem3anaro3peltro3spem3agor5opteel5tieelp5inel5opsrosi4aro5solel5op_5troopros4tiatar3aro3tatata3t4ro4terelo4dieloc3uelo5caat3eautri3me4roussell5izel4labrow3erelit4ttri3lie4li4seli3onr3pentrp5er_el3ingat3echr3pholrp3ingat5eerrpol3ar2p5ouele3vi3tricuelev3at5ricla5tel_e5lesstres4sele5phel3enor4reo4el5eni4e4ledelea5grricu4tre5prate5lerri4oseld3ertre4moat3entat3eraelast3el5ancel5age4traddeiv3ereit5ertra4co4atesse4ins_to3warehyd5re5g4oneg5nabefut5arsell5rs3er_rs3ersa3thene4fiteath3odr4shier5si2ato3temto5stra5thonrs3ingeem5eree2l1ieed3ere4d5urrstor4to3s4ped3ulo4a3tiator5oitor5ered3imeed5igrrt3ageto5radr4tareed5icsto4posr4tedlr3tel4r5tendrt3enito5piaa2t3in4atinaat5ingede3teton5earth3rir1t4icr4ticlr5tietr5tilar5tilltom5osrt5ilyedes3tr3tinart3ingr3titirti5tue4delee5dansrt5lete5culito4mogec4titrt5ridecti4cec4teratit3urtwis4e4cremtoma4nec3ratec5oroec3oratom3acat4iviec3lipruis5iecip5i4toledec5ath5at5odrun4clruncu42t3oidrun2d4e4caporu5netecal5ea4topsec3adea4toryebus5iebot3oe4belstode5cat3ronat5rouat4tagru3tale4bel_eav5our4vanceavi4ervel4ie3atrirven4erv5er_t4nerer3vestat3uraeatit4e3atifeat5ieeat3ertmo4t5east5iat3urge1as1s3ryngoau5ceraud5ereas5erryth4iaudic4ear4tee5ar2rear4liear3ereap5eream3ersac4teeam4blea3logeal3eread3liead3ersain4teac4tedy4ad_sa5lacdwell3sa3lies4al4t5tletrdvert3sa5minault5id5un4cdum4be5tledrs4an4etlant4san5ifdu5ettau5reodu5elldu5eliau5rordrunk3tiv3isaus5erdri4g3aut3ars5ativti3tradrast4d5railsau5ciaut3erdossi4sa3voudo5simdon4atdom5itt3itisdomin5doman4tit5ildo4lonscar4cdol5ittith4edol3endo4c3u4s4ces5dlestt4istrdi4val1di1v2ditor3av3ageava5latish5idithe4av5alr3tisand4iterd4itas3disiadisen34d5irodi4oladi5nossec5andin5gisecon4dimet4di5mersed4itdi3gamdig3al3di3evdi4ersd5icurse3lecselen55dicul2s4emedic4tesemi5dav5antdic5oldic5amt3iristi5quaav3end5sentmti3pliav3ernti5omosep4side4voisep3tiser4antiol3aser4to4servode3vitde3visdev3ils5estade3tesdes3tid3est_sev3enaviol4aw5er_de3sidde3sectin3uetin4tedes4casfor5esfran5der5os3dero45dernesh4abiaw5ersder4miaw5nieay5sta3dererde5reg4deredde3raiderac4si4allsiast5tin3ets3icatdepen42s5icldeont5si5cul4tinedba5birdens5aside5lsid3enbalm5ideni4eba5lonsi4ersde1n2ade4mosde3morba5nan5tilindemo4nti4letsin5etbardi44demiedel5lisi5nolsi3nusba5romdeli4esi5o5sde3lat5de3isde4fy_bar3onde4cilsist3asist3otigi5odeb5itsit5omdeac3td3dlerd4derebas4tedaugh3dativ4dast5a3d4as2d1an4ts3kierba4th4sk5ily3baticba5tiod4a4gid5ache3ti2encys5toc3utivbat5on4cur4oti3diecur4er1c2ultb4batab4bonecul5abcu5itycub3atctro5tbcord4ti3colct5olo3smithbdeac5tic5asct5ivec4tityc4tituc3t2isbed5elc3tinict5ing4s3oid4te3loct4in_so5lansol4erso3lic3solvebe5dra5ti5bube3lit3some_bend5ac4ticsbe5nigson5atbicen5son5orc4tentbi4ers5soriosor4its5orizc2t5eec3tato5bilesct5antc5ta5gctac5u5c4ruscrost4spast45thoug3b2ill3sperms5pero4thoptcre4to5creti3spher4t5hoocre4p3sp5id_s5pierspil4lcre3atsp3ingspi5nith3oli4creancra4tecras3tbimet55crani5bin4d3spons3spoonspru5dbind3ecous5t3co3trth4is_srep5ucost3aco5rolco3rels5sam24coreds5sengs3sent5th4ioss3er_s5seriss3ers3thinkt5hillbin5etcon4iecon4eyth3eryss4in_s4siness4is_s3s2itss4ivicon4chth3ernco3mo4co5masssol3ut5herds4soreth5erc5colouco3logco3inc4c3oidco3difco3dicsta3bic4lotrs4talebin5i4s3tas_theo3lc3lingbi3re4ste5arste5atbi5rusbisul54s1teds4tedls4tedn4stereth5eas3bituas3terost5est5blastcine5a4cinabs3ti3a3sticks3ticuthal3ms4tilyst3ing5s4tir5cimenth5al_st3lercigar5ci3estch5ousstone3bla5tu5blespblim3as4tose4chotis4tray4chosostrep33strucstru5dbment4tew3arch5oid5chlorstur4echizz4ch3innch4in_ch3ily3chicoche5va3chetech4erltetr5och4eriche3olcha3pa4boledbon4iesu5ingces5trcest5oce3remcer4bites5tusu3pinsupra3sur4ascept3a5testesur3pltest3aboni4ft3ess_bon4spcent4ab3oratbor5eebor5etbor5icter5nobor5iocen5cice4metce5lomter3itt4erinsy4chrcel3aice3darcci3d4ter5ifsy5photer5idcav3ilter3iabot3an3tablica3t2rta3bolta4bout4a3cete3reota3chyta4cidc4atom3casu35t2adjta5dor5terel3cas3scashi4tage5ota5gogca3roucar5oocar5oncar3olcar3nicar3ifter5ecca3reeter3ebta5lept4aliat4alin2tere45tallut2alo43ter3bt4eragtera4c3brachtan5atbran4db4reas5taneltan5iet5aniz4b2rescap3tica5piltent4atark5ican4trte5nog5brief5tennaca3noec2an4eta3stabring5t4ateu3tatist4ato_tat4ouca5nartat3uttau3tobri4osca5lefcal5ar4tenarcab5inb5ut5obut4ivten4ag3butiob5utinbu5tarte5cha5technbus5sibusi4ete5d2abur4rite5monb4ulosb5rist5tegicb5tletbro4mab4stacbso3lubsol3e4teledtel5izbscon4ct4ina",
		7 : "mor4atobstupe5buf5ferb5u5nattch5ettm3orat4call5inmor5talcan5tarcan5tedcan4tictar5ia_brev5ettant5anca3ra5ctand5er_ad4din5ta3mettam5arit4eratocar5ameboun5tital4l3atal5entmonolo4cas5tigta5chom3teres4ta5blemcaulk4iccent5rcces4sacel5ib5mpel5licel5lincen5ded5ternit4sweredswell5icend5encend5ersvest5isvers5acen5tedt5esses_ama5tem5perercen5testest5ertest5intest5orcep5ticmpet5itchan5gi5cherin4choredchor5olmphal5os5toratblem5atston4iecil5lin4mologu4mologss4tern_ster4iaci5nesscla5rifclemat45static4molog_5therapmogast4ssolu4b4theredcon4aticond5erconta5dcor5dedcord5ermpol5itcost5ercraft5ispon5gicra5niuspital5spic5ulspers5a4thorescret5orspens5ac5tariabi4fid_4sor3iecter4iab5ertinberga5mc5ticiabend5erso5metesoma5toctifi4esolv5erc5tin5o_an4on_ct4ivittici5ar3ti3cint4icityc5torisc5toriz4ticulecull5ercull5inbattle5cur5ialmmel5lislang5idal5lersk5iness5kiest4tific_daun5tede5cantdefor5edel5ler_an3ti34dem4issim4plyb4aniti_ant4icde4mons_an4t5osid5eri5timet4dens5er5ti5nadden5titdeposi4zin4c3i_aph5orshil5lider5minsfact5otin5tedtint5erde5scalmis4tindes5ponse5renedevol5u4tionemdiat5omti5plexseo5logsent5eemi5racu_ar4isedic5tat4scuras4scura__ar4isi5scopic3s4cope5t4istedi5vineti5t4ando5linesca5lendom5inodot4tins5atorydress5oaus4tedtiv5allsassem4dropho4duci5ansant5risan5garaun4dresan4ded_ar5sendust5erault5erdvoc5ataul5tedearth5iea4soni4ryngoleassem4eat5enieat4iturv5ers_rus4t5urus5ticrust5eeatric5urust5at_as5sibrup5licminth5oecad5enruncul5ru4moreecent5oa5tivizecon4sc_ateli4_au3g4uec5rean_aur4e5ect5atiec4t5usrtil5le4at4is__av5erar4theneedeter5edi4alsr5terered5icala4t1i4lediges4at5icizediv5idtori4asrswear4ati5citat5icisedu5cerrstrat4eer4ineefact5oming5li_ba5sicef5ereemin4ersath5eteath5eromin4er__be5r4ae5ignitr5salizmind5err5salisejudic44traistmil5iestrarch4tra5ven_blaz5o4m5iliee4lates_bos5omat5enatelch5errrin5getrend5irri4fy_rran5gie4lesteel3et3o_boun4d_bra5chtri5fli_burn5ieli4ers_ca4ginrou5sel_can5tamigh5tiros5tita5talisro5stattro4pharop4ineemarc5aem5atizemat5ole4m3eraron4tonro5nateem4icisnaffil4romant4emig5rarol5iteass5iblassa5giemon5ola4sonedem5orise4moticempara54empli_en3am3o_cen5sot5tereren4cileen4d5alen4dedlttitud45n4a3grend5ritrn5atine5nellee5nereor4mite_r4ming_en3ig3rmet5icirma5tocr4m3atinannot4en4tersen4tifyarp5ersent5rinr5kiesteol5ar_eologi4aro4mas_clem5eriv5eliri5vallris5ternan5teda5rishi3mesti4epolit5tup5lettup5lic_cop5roepres5erink5erme5si4aring5ie_co5terrim5an4equi5noment5or4tut4ivna5turiera4cierig5ant5rifugaar4donear5dinarif5tiear5chetrift5er4erati_4eratimrick4enrich5omrica5tuaran5teer5esteer5estieres5trre5termar4aged_dea5coaract4irest5erre5stalapu5lareri4ciduant5isuant5itres5ist5er5ickapo5strer4imet_de5lecuar4t5iua5terneri5staren4ter5ernaclmend5errem5atoreman4d_del5egerre5laer5sinere5galiert5er_ert5ersrec4t3rr4e1c2rreci5simelt5er_deli5ran4tone_de5nitan4tinges5idenesi5diur4d1an4rcriti4es3ol3urci5nogant5abludi4cinrch4ieru5dinisrch5ateu5ditiorch5ardes3per3mel5lerrcen5eres5piraanis5teesplen5uen4teres4s3anest5ifi_de5resues5trin4cept_rav5elianel5li4r4atom5ra5tolan4donirat4in_r4as5teand5istrass5in5meg2a1et3al5oand5eerrar5ia_an3d4atrant5inuicent55rantelran5teduild5erran4gennch5oloetell5irad4inencid5enra5culorac5ulaet3er3aet5eria3ra3binet5itivui5val5amphi5gam5peri_de5sirqua5tio4e4trala4mium_et5ressetrib5aaminos4am5inizamini4fp5u5tis5ulchrepush4ieev5eratev5eren4ulenciever4erpu5lar_puff5erevictu4evis5in_de5sisfall5inncip5ie_di4al_fend5erpros5trpropyl5proph5eul4l5ibp3roc3apris5inpring5imbival5nco5pat5pressiyllab5iulp5ingpre5matylin5dem4b3ingnct4ivife5veriffec4te_du4al_pprob5am5bererum4bar__echin5fi5anceal5tatipparat5pout5ern4curviumi5liaumin4aru4minedu4m3ingpoult5epor5tieal4orim4poratopon4i4eflo5rical4lish_ed4it_foment4_ed4itialli5anplum4befor4m3a_el3ev3fratch4pla5t4oma5turem4atizafrost5ipis5tilmat4itifuel5ligal5lerpill5ingang5ergariz4aunho5lial5ipotgass5inph5oriz4phonedgest5atg5gererphant5ipha5gedgiv5en_5glass_unk5eripet5allal5endepes5tilpert5isper5tinper4os_al5ance5p4er3nperem5indeleg4gna5turndepre4aint5eruodent4pend5er4gogram_en4dedpearl5indes5crgth5enimas4tinpat4richad4inepas4tinnd5is4ihak4inehal5anthan4crohar5dieha5rismhar4tedaet4or_aerody5pag4atihaught5_er5em5hearch44urantiheav5enurb5ingoxic5olowhith4ur5den_ur5deniowel5lih5erettovid5ennd5ism_her5ialh5erineout5ishoun5ginound5elhet4tedact5oryu5ri5cuheumat5ur5ifieact5ileought5ihi3c4anuri4os_h4i4ersh4manicurl5ingact5atemast4ichnocen5_men5taaci4erso5thermmar4shimantel5ot5estaurpen5tach5isma5chinihol4is_ot4atioot4anico5talito5stome5acanthost5icaosten5tost5ageh4op4te3house3hras5eoy4chosen5ectom4abolicht5eneror5tes_man4icay5chedei5a4g5oori5cidialect4or5este_escal5iatur4aorator5_wine5s_vo5lutich5ingo5quial_etern5us5ticiic4tedloplast4ophy5laid4ines4operag2i4d1itoost5eriff5leronvo5lui4ficaconti5fiman5dar_vic5to_fal4lemament4mal4is__ver4ieila5telonical4i5later_feoff5ili4arl_va5ledil4ificond5ent_ur5eth5ond5arut4toneil5ine_on5ativonast5i_under5ompt5eromot5ivi4matedi4matin_fi5liaimpar5a_fil5tro5lunte4inalit_tular5olon5el5neringinator5_tro4ph_fis4c5inc4tua_trin4aol4lopeoli4f3eol5ies_mal5ari_tran4c_tit4isnerv5inval4iseol5icizinfilt5olat5erin4itud_gam5etxter4m3ink4inein4sch5_tell5evas5el5insect5insec5uinsolv5int5essvat4inaoher4erint5res_tamar5xtens5o_tact4iinvol5ui4omani_gen4et_gen5iave5linei5pheriip5torivel5lerir4alinvel5opiir4alliirassi4nfortu5irl5ingirwo4meo4ducts4lut5arv5en5ue_stat4o_si5gnoverde5v4v4ere4o4duct_odu5cerodis5iaocus5siis5onerist5encxotrop4_ser4ie5vialitist5entochro4n_gnost4_sec5tovi5cariocess4iis4t3iclum4brio5calli4is4tom4itioneit5ress3vili4av5ilisev5ilizevil5linoast5eritu4als_han4de_hast5ii4vers__sa5linlsi4fiai5vilit5ivist_5ivistsnvoc5at_ho5rol_rol4lakinema4ni4cul4nultim5_re5strloth4ie5la5collos5sienight5ilor4ife_re5spolor5iatntup5li5lo5pen_re5sen_res5ci_re5linnt5ressn4trant_re5garloom5erxhort4a_ran5gilong5invol4ubi_ra5cem_put4ten5tition4tiparlo4cus__pos5si_lash4e_len5tint5ing_nit5res_le5vanxecut5o_plica4n4tify__plast45latini_phon4illow5er_li4onslligat4_peri5nntic4u4_pen5dewall5ern5ticizwan5gliwank5erwar5dedward5ern5ticisnth5ine_lo4giawar5thinmater4_pec3t4_pa4tiowav4ine_lous5i_para5t_par5af_lov5ernmor5ti_orner4nt5ativ_or5che_ma5lin_mar5ti_or4at4le5ation5tasiswel4izint4ariun4t3antntan5eon4t3ancleav5erl3eb5rannel5li_nucle5_no5ticlem5enclen5darwill5in_ni5tronsec4tewing5er4lentio5l4eriannerv5a_nas5tinres5tr5le5tu5lev5itano5blemnovel5el3ic3onwol5ver_mor5tilift5erlight5ilimet4e_mo5lec5lin3ealin4er_lin4erslin4gern5ocula_min5uenobser4_met4er_me5rin_me5ridmas4ted",
		8 : "_musi5cobserv5anwith5erilect5icaweight5ica5laman_mal5ad5l5di5nestast5i4cntend5enntern5alnter5nat_perse5c_pe5titi_phe5nomxe5cutio5latiliz_librar5nt5ilati_les5son_po5lite_ac5tiva5latilisnis5tersnis5ter_tamorph5_pro5batvo5litiolan5tine_ref5eremophil5ila5melli_re5statca3r4i3c5lamandrcen5ter_5visecti5numentanvers5aniver5saliv5eling_salt5ercen5ters_ha5bilio4c5ativlunch5eois5terer_sev5era_glor5io_stra5tocham5perstor5ianstil5ler_ge5neti_sulph5a_tac5ticnform5eroin4t5erneuma5to_te5ra5tma5chinecine5mat_tri5bal_fran5ch_tri5sti_fi5n4it_troph5o_fin5essimparad5stant5iv_vent5il4o5nomicssor5ialight5ersight5er__evol5utm5ament_ont5ane_icotyle5orest5atiab5oliziab5olismod5ifiehrill5inothalam5oth5erinnduct5ivrth5ing_otherm5a5ot5inizov5elinghav5ersipass5ivessent5ermater5n4ain5dersuo5tatiopens5atipercent5slav5eriplant5er5sing5erfortu5naplumb5erpo5lemicpound5erffranch5ppress5oa5lumnia_domest5pref5ereprel5atea5marinepre5scina5m4aticpring5ertil4l5agmmand5er5sid5u4a_de5spoievol5utee5tometeetend5erting5ingmed5icatran5dishm5ed5ieset5allis_de5servsh5inessmlo5cutiuest5ratncent5rincarn5atdes5ignareact5ivr5ebratereced5ennbarric5sen5sorier5nalisuar5tersre4t4er3_custom5naugh5tirill5er_sen5sati5scripti_cotyle5e4p5rob5a5ri5netaun5chierin4t5errip5lica_art5icl5at5ressepend5entu4al5lir5ma5tolttitu5di_cent5ria5torianena5ture5na5geri_cas5ualromolec5elom5ateatitud5i_ca5pituround5ernac5tiva_at5omizrpass5intomat5oltrifu5gae4l3ica4rpret5erel5ativetrav5esttra5versat5ernisat5ernizefor5estath5erinef5initeto5talizto5talis_barri5c_authen5mass5ing",
		9 : "_bap5tismna5cious_econstit5na5ciousl_at5omisena5culari_cen5tena_clima5toepe5titionar5tisti_cri5ticirill5ingserpent5inrcen5tenaest5igati_de5scrib_de5signe_determ5ifals5ifiefan5tasizplas5ticiundeter5msmu5tatiopa5triciaosclero5s_fec5unda_ulti5matindeterm5ipart5ite_string5i5lutionizltramont5_re5storeter5iorit_invest5imonolog5introl5ler_lam5enta_po5sitio_para5dis_ora5tori_me5lodio"
	}
};Hyphenator.run();


