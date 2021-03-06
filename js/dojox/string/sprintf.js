/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.string.sprintf"]) {
	dojo._hasResource["dojox.string.sprintf"] = true;
	dojo.provide("dojox.string.sprintf");
	dojo.require("dojox.string.tokenize");
	dojox.string.sprintf = function (format, filler) {
		for (var args = [], i = 1; i < arguments.length; i++) {
			args.push(arguments[i]);
		}
		var formatter = new dojox.string.sprintf.Formatter(format);
		return formatter.format.apply(formatter, args);
	};
	dojox.string.sprintf.Formatter = function (format) {
		var tokens = [];
		this._mapped = false;
		this._format = format;
		this._tokens = dojox.string.tokenize(format, this._re, this._parseDelim, this);
	};
	dojo.extend(dojox.string.sprintf.Formatter, {_re:/\%(?:\(([\w_]+)\)|([1-9]\d*)\$)?([0 +\-\#]*)(\*|\d+)?(\.)?(\*|\d+)?[hlL]?([\%scdeEfFgGiouxX])/g, _parseDelim:function (mapping, intmapping, flags, minWidth, period, precision, specifier) {
		if (mapping) {
			this._mapped = true;
		}
		return {mapping:mapping, intmapping:intmapping, flags:flags, _minWidth:minWidth, period:period, _precision:precision, specifier:specifier};
	}, _specifiers:{b:{base:2, isInt:true}, o:{base:8, isInt:true}, x:{base:16, isInt:true}, X:{extend:["x"], toUpper:true}, d:{base:10, isInt:true}, i:{extend:["d"]}, u:{extend:["d"], isUnsigned:true}, c:{setArg:function (token) {
		if (!isNaN(token.arg)) {
			var num = parseInt(token.arg);
			if (num < 0 || num > 127) {
				throw new Error("invalid character code passed to %c in sprintf");
			}
			token.arg = isNaN(num) ? "" + num : String.fromCharCode(num);
		}
	}}, s:{setMaxWidth:function (token) {
		token.maxWidth = (token.period == ".") ? token.precision : -1;
	}}, e:{isDouble:true, doubleNotation:"e"}, E:{extend:["e"], toUpper:true}, f:{isDouble:true, doubleNotation:"f"}, F:{extend:["f"]}, g:{isDouble:true, doubleNotation:"g"}, G:{extend:["g"], toUpper:true}}, format:function (filler) {
		if (this._mapped && typeof filler != "object") {
			throw new Error("format requires a mapping");
		}
		var str = "";
		var position = 0;
		for (var i = 0, token; i < this._tokens.length; i++) {
			token = this._tokens[i];
			if (typeof token == "string") {
				str += token;
			} else {
				if (this._mapped) {
					if (typeof filler[token.mapping] == "undefined") {
						throw new Error("missing key " + token.mapping);
					}
					token.arg = filler[token.mapping];
				} else {
					if (token.intmapping) {
						var position = parseInt(token.intmapping) - 1;
					}
					if (position >= arguments.length) {
						throw new Error("got " + arguments.length + " printf arguments, insufficient for '" + this._format + "'");
					}
					token.arg = arguments[position++];
				}
				if (!token.compiled) {
					token.compiled = true;
					token.sign = "";
					token.zeroPad = false;
					token.rightJustify = false;
					token.alternative = false;
					var flags = {};
					for (var fi = token.flags.length; fi--; ) {
						var flag = token.flags.charAt(fi);
						flags[flag] = true;
						switch (flag) {
						  case " ":
							token.sign = " ";
							break;
						  case "+":
							token.sign = "+";
							break;
						  case "0":
							token.zeroPad = (flags["-"]) ? false : true;
							break;
						  case "-":
							token.rightJustify = true;
							token.zeroPad = false;
							break;
						  case "#":
							token.alternative = true;
							break;
						  default:
							throw Error("bad formatting flag '" + token.flags.charAt(fi) + "'");
						}
					}
					token.minWidth = (token._minWidth) ? parseInt(token._minWidth) : 0;
					token.maxWidth = -1;
					token.toUpper = false;
					token.isUnsigned = false;
					token.isInt = false;
					token.isDouble = false;
					token.precision = 1;
					if (token.period == ".") {
						if (token._precision) {
							token.precision = parseInt(token._precision);
						} else {
							token.precision = 0;
						}
					}
					var mixins = this._specifiers[token.specifier];
					if (typeof mixins == "undefined") {
						throw new Error("unexpected specifier '" + token.specifier + "'");
					}
					if (mixins.extend) {
						dojo.mixin(mixins, this._specifiers[mixins.extend]);
						delete mixins.extend;
					}
					dojo.mixin(token, mixins);
				}
				if (typeof token.setArg == "function") {
					token.setArg(token);
				}
				if (typeof token.setMaxWidth == "function") {
					token.setMaxWidth(token);
				}
				if (token._minWidth == "*") {
					if (this._mapped) {
						throw new Error("* width not supported in mapped formats");
					}
					token.minWidth = parseInt(arguments[position++]);
					if (isNaN(token.minWidth)) {
						throw new Error("the argument for * width at position " + position + " is not a number in " + this._format);
					}
					if (token.minWidth < 0) {
						token.rightJustify = true;
						token.minWidth = -token.minWidth;
					}
				}
				if (token._precision == "*" && token.period == ".") {
					if (this._mapped) {
						throw new Error("* precision not supported in mapped formats");
					}
					token.precision = parseInt(arguments[position++]);
					if (isNaN(token.precision)) {
						throw Error("the argument for * precision at position " + position + " is not a number in " + this._format);
					}
					if (token.precision < 0) {
						token.precision = 1;
						token.period = "";
					}
				}
				if (token.isInt) {
					if (token.period == ".") {
						token.zeroPad = false;
					}
					this.formatInt(token);
				} else {
					if (token.isDouble) {
						if (token.period != ".") {
							token.precision = 6;
						}
						this.formatDouble(token);
					}
				}
				this.fitField(token);
				str += "" + token.arg;
			}
		}
		return str;
	}, _zeros10:"0000000000", _spaces10:"		  ", formatInt:function (token) {
		var i = parseInt(token.arg);
		if (!isFinite(i)) {
			if (typeof token.arg != "number") {
				throw new Error("format argument '" + token.arg + "' not an integer; parseInt returned " + i);
			}
			i = 0;
		}
		if (i < 0 && (token.isUnsigned || token.base != 10)) {
			i = 4294967295 + i + 1;
		}
		if (i < 0) {
			token.arg = (-i).toString(token.base);
			this.zeroPad(token);
			token.arg = "-" + token.arg;
		} else {
			token.arg = i.toString(token.base);
			if (!i && !token.precision) {
				token.arg = "";
			} else {
				this.zeroPad(token);
			}
			if (token.sign) {
				token.arg = token.sign + token.arg;
			}
		}
		if (token.base == 16) {
			if (token.alternative) {
				token.arg = "0x" + token.arg;
			}
			token.arg = token.toUpper ? token.arg.toUpperCase() : token.arg.toLowerCase();
		}
		if (token.base == 8) {
			if (token.alternative && token.arg.charAt(0) != "0") {
				token.arg = "0" + token.arg;
			}
		}
	}, formatDouble:function (token) {
		var f = parseFloat(token.arg);
		if (!isFinite(f)) {
			if (typeof token.arg != "number") {
				throw new Error("format argument '" + token.arg + "' not a float; parseFloat returned " + f);
			}
			f = 0;
		}
		switch (token.doubleNotation) {
		  case "e":
			token.arg = f.toExponential(token.precision);
			break;
		  case "f":
			token.arg = f.toFixed(token.precision);
			break;
		  case "g":
			if (Math.abs(f) < 0.0001) {
				token.arg = f.toExponential(token.precision > 0 ? token.precision - 1 : token.precision);
			} else {
				token.arg = f.toPrecision(token.precision);
			}
			if (!token.alternative) {
				token.arg = token.arg.replace(/(\..*[^0])0*/, "$1");
				token.arg = token.arg.replace(/\.0*e/, "e").replace(/\.0$/, "");
			}
			break;
		  default:
			throw new Error("unexpected double notation '" + token.doubleNotation + "'");
		}
		token.arg = token.arg.replace(/e\+(\d)$/, "e+0$1").replace(/e\-(\d)$/, "e-0$1");
		if (dojo.isOpera) {
			token.arg = token.arg.replace(/^\./, "0.");
		}
		if (token.alternative) {
			token.arg = token.arg.replace(/^(\d+)$/, "$1.");
			token.arg = token.arg.replace(/^(\d+)e/, "$1.e");
		}
		if (f >= 0 && token.sign) {
			token.arg = token.sign + token.arg;
		}
		token.arg = token.toUpper ? token.arg.toUpperCase() : token.arg.toLowerCase();
	}, zeroPad:function (token, length) {
		length = (arguments.length == 2) ? length : token.precision;
		if (typeof token.arg != "string") {
			token.arg = "" + token.arg;
		}
		var tenless = length - 10;
		while (token.arg.length < tenless) {
			token.arg = (token.rightJustify) ? token.arg + this._zeros10 : this._zeros10 + token.arg;
		}
		var pad = length - token.arg.length;
		token.arg = (token.rightJustify) ? token.arg + this._zeros10.substring(0, pad) : this._zeros10.substring(0, pad) + token.arg;
	}, fitField:function (token) {
		if (token.maxWidth >= 0 && token.arg.length > token.maxWidth) {
			return token.arg.substring(0, token.maxWidth);
		}
		if (token.zeroPad) {
			this.zeroPad(token, token.minWidth);
			return;
		}
		this.spacePad(token);
	}, spacePad:function (token, length) {
		length = (arguments.length == 2) ? length : token.minWidth;
		if (typeof token.arg != "string") {
			token.arg = "" + token.arg;
		}
		var tenless = length - 10;
		while (token.arg.length < tenless) {
			token.arg = (token.rightJustify) ? token.arg + this._spaces10 : this._spaces10 + token.arg;
		}
		var pad = length - token.arg.length;
		token.arg = (token.rightJustify) ? token.arg + this._spaces10.substring(0, pad) : this._spaces10.substring(0, pad) + token.arg;
	}});
}

