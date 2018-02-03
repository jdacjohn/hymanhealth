/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.dtl.filter.strings"]) {
	dojo._hasResource["dojox.dtl.filter.strings"] = true;
	dojo.provide("dojox.dtl.filter.strings");
	dojo.require("dojox.dtl.filter.htmlstrings");
	dojo.require("dojox.string.sprintf");
	dojo.require("dojox.string.tokenize");
	dojo.mixin(dojox.dtl.filter.strings, {_urlquote:function (url, safe) {
		if (!safe) {
			safe = "/";
		}
		return dojox.string.tokenize(url, /([^\w-_.])/g, function (token) {
			if (safe.indexOf(token) == -1) {
				if (token == " ") {
					return "+";
				} else {
					return "%" + token.charCodeAt(0).toString(16).toUpperCase();
				}
			}
			return token;
		}).join("");
	}, addslashes:function (value) {
		return value.replace(/\\/g, "\\\\").replace(/"/g, "\\\"").replace(/'/g, "\\'");
	}, capfirst:function (value) {
		value = "" + value;
		return value.charAt(0).toUpperCase() + value.substring(1);
	}, center:function (value, arg) {
		arg = arg || value.length;
		value = value + "";
		var diff = arg - value.length;
		if (diff % 2) {
			value = value + " ";
			diff -= 1;
		}
		for (var i = 0; i < diff; i += 2) {
			value = " " + value + " ";
		}
		return value;
	}, cut:function (value, arg) {
		arg = arg + "" || "";
		value = value + "";
		return value.replace(new RegExp(arg, "g"), "");
	}, _fix_ampersands:/&(?!(\w+|#\d+);)/g, fix_ampersands:function (value) {
		return value.replace(dojox.dtl.filter.strings._fix_ampersands, "&amp;");
	}, floatformat:function (value, arg) {
		arg = parseInt(arg || -1, 10);
		value = parseFloat(value);
		var m = value - value.toFixed(0);
		if (!m && arg < 0) {
			return value.toFixed();
		}
		value = value.toFixed(Math.abs(arg));
		return (arg < 0) ? parseFloat(value) + "" : value;
	}, iriencode:function (value) {
		return dojox.dtl.filter.strings._urlquote(value, "/#%[]=:;$&()+,!");
	}, linenumbers:function (value) {
		var df = dojox.dtl.filter;
		var lines = value.split("\n");
		var output = [];
		var width = (lines.length + "").length;
		for (var i = 0, line; i < lines.length; i++) {
			line = lines[i];
			output.push(df.strings.ljust(i + 1, width) + ". " + dojox.dtl._base.escape(line));
		}
		return output.join("\n");
	}, ljust:function (value, arg) {
		value = value + "";
		arg = parseInt(arg, 10);
		while (value.length < arg) {
			value = value + " ";
		}
		return value;
	}, lower:function (value) {
		return (value + "").toLowerCase();
	}, make_list:function (value) {
		var output = [];
		if (typeof value == "number") {
			value = value + "";
		}
		if (value.charAt) {
			for (var i = 0; i < value.length; i++) {
				output.push(value.charAt(i));
			}
			return output;
		}
		if (typeof value == "object") {
			for (var key in value) {
				output.push(value[key]);
			}
			return output;
		}
		return [];
	}, rjust:function (value, arg) {
		value = value + "";
		arg = parseInt(arg, 10);
		while (value.length < arg) {
			value = " " + value;
		}
		return value;
	}, slugify:function (value) {
		value = value.replace(/[^\w\s-]/g, "").toLowerCase();
		return value.replace(/[\-\s]+/g, "-");
	}, _strings:{}, stringformat:function (value, arg) {
		arg = "" + arg;
		var strings = dojox.dtl.filter.strings._strings;
		if (!strings[arg]) {
			strings[arg] = new dojox.string.sprintf.Formatter("%" + arg);
		}
		return strings[arg].format(value);
	}, title:function (value) {
		var last, title = "";
		for (var i = 0, current; i < value.length; i++) {
			current = value.charAt(i);
			if (last == " " || last == "\n" || last == "\t" || !last) {
				title += current.toUpperCase();
			} else {
				title += current.toLowerCase();
			}
			last = current;
		}
		return title;
	}, _truncatewords:/[ \n\r\t]/, truncatewords:function (value, arg) {
		arg = parseInt(arg, 10);
		if (!arg) {
			return value;
		}
		for (var i = 0, j = value.length, count = 0, current, last; i < value.length; i++) {
			current = value.charAt(i);
			if (dojox.dtl.filter.strings._truncatewords.test(last)) {
				if (!dojox.dtl.filter.strings._truncatewords.test(current)) {
					++count;
					if (count == arg) {
						return value.substring(0, j + 1);
					}
				}
			} else {
				if (!dojox.dtl.filter.strings._truncatewords.test(current)) {
					j = i;
				}
			}
			last = current;
		}
		return value;
	}, _truncate_words:/(&.*?;|<.*?>|(\w[\w\-]*))/g, _truncate_tag:/<(\/)?([^ ]+?)(?: (\/)| .*?)?>/, _truncate_singlets:{br:true, col:true, link:true, base:true, img:true, param:true, area:true, hr:true, input:true}, truncatewords_html:function (value, arg) {
		arg = parseInt(arg, 10);
		if (arg <= 0) {
			return "";
		}
		var strings = dojox.dtl.filter.strings;
		var words = 0;
		var open = [];
		var output = dojox.string.tokenize(value, strings._truncate_words, function (all, word) {
			if (word) {
				++words;
				if (words < arg) {
					return word;
				} else {
					if (words == arg) {
						return word + " ...";
					}
				}
			}
			var tag = all.match(strings._truncate_tag);
			if (!tag || words >= arg) {
				return;
			}
			var closing = tag[1];
			var tagname = tag[2].toLowerCase();
			var selfclosing = tag[3];
			if (closing || strings._truncate_singlets[tagname]) {
			} else {
				if (closing) {
					var i = dojo.indexOf(open, tagname);
					if (i != -1) {
						open = open.slice(i + 1);
					}
				} else {
					open.unshift(tagname);
				}
			}
			return all;
		}).join("");
		output = output.replace(/\s+$/g, "");
		for (var i = 0, tag; tag = open[i]; i++) {
			output += "</" + tag + ">";
		}
		return output;
	}, upper:function (value) {
		return value.toUpperCase();
	}, urlencode:function (value) {
		return dojox.dtl.filter.strings._urlquote(value);
	}, _urlize:/^((?:[(>]|&lt;)*)(.*?)((?:[.,)>\n]|&gt;)*)$/, _urlize2:/^\S+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+$/, urlize:function (value) {
		return dojox.dtl.filter.strings.urlizetrunc(value);
	}, urlizetrunc:function (value, arg) {
		arg = parseInt(arg);
		return dojox.string.tokenize(value, /(\S+)/g, function (word) {
			var matches = dojox.dtl.filter.strings._urlize.exec(word);
			if (!matches) {
				return word;
			}
			var lead = matches[1];
			var middle = matches[2];
			var trail = matches[3];
			var startsWww = middle.indexOf("www.") == 0;
			var hasAt = middle.indexOf("@") != -1;
			var hasColon = middle.indexOf(":") != -1;
			var startsHttp = middle.indexOf("http://") == 0;
			var startsHttps = middle.indexOf("https://") == 0;
			var firstAlpha = /[a-zA-Z0-9]/.test(middle.charAt(0));
			var last4 = middle.substring(middle.length - 4);
			var trimmed = middle;
			if (arg > 3) {
				trimmed = trimmed.substring(0, arg - 3) + "...";
			}
			if (startsWww || (!hasAt && !startsHttp && middle.length && firstAlpha && (last4 == ".org" || last4 == ".net" || last4 == ".com"))) {
				return "<a href=\"http://" + middle + "\" rel=\"nofollow\">" + trimmed + "</a>";
			} else {
				if (startsHttp || startsHttps) {
					return "<a href=\"" + middle + "\" rel=\"nofollow\">" + trimmed + "</a>";
				} else {
					if (hasAt && !startsWww && !hasColon && dojox.dtl.filter.strings._urlize2.test(middle)) {
						return "<a href=\"mailto:" + middle + "\">" + middle + "</a>";
					}
				}
			}
			return word;
		}).join("");
	}, wordcount:function (value) {
		value = dojo.trim(value);
		if (!value) {
			return 0;
		}
		return value.split(/\s+/g).length;
	}, wordwrap:function (value, arg) {
		arg = parseInt(arg);
		var output = [];
		var parts = value.split(/\s+/g);
		if (parts.length) {
			var word = parts.shift();
			output.push(word);
			var pos = word.length - word.lastIndexOf("\n") - 1;
			for (var i = 0; i < parts.length; i++) {
				word = parts[i];
				if (word.indexOf("\n") != -1) {
					var lines = word.split(/\n/g);
				} else {
					var lines = [word];
				}
				pos += lines[0].length + 1;
				if (arg && pos > arg) {
					output.push("\n");
					pos = lines[lines.length - 1].length;
				} else {
					output.push(" ");
					if (lines.length > 1) {
						pos = lines[lines.length - 1].length;
					}
				}
				output.push(word);
			}
		}
		return output.join("");
	}});
}
