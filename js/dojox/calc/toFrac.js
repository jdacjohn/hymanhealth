/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.calc.toFrac"]) {
	dojo._hasResource["dojox.calc.toFrac"] = true;
	dojo.provide("dojox.calc.toFrac");
	(function () {
		var a = [];
		var sqrts = [2, 3, 5, 6, 7, 10, 11, 13, 14, 15, 17, 19, 21, 22, 23, 26, 29, 30, 31, 33, 34, 35, 37, 38, 39, 41, 42, 43, 46, 47, 51, 53, 55, 57, 58, 59, 61, 62, 65, 66, 67, 69, 70, 71, 73, 74, 77, 78, 79, 82, 83, 85, 86, 87, 89, 91, 93, 94, 95, 97];
		var _fracHashInitialized = false;
		var i = -3;
		var d = 2;
		var epsilon = 1e-15 / 9;
		function _fracHashInit(searchNumber) {
			var m, mt;
			while (i < sqrts.length) {
				switch (i) {
				  case -3:
					m = 1;
					mt = "";
					break;
				  case -2:
					m = Math.PI;
					mt = "pi";
					break;
				  case -1:
					m = Math.sqrt(Math.PI);
					mt = "\u221a(pi)";
					break;
				  default:
					m = Math.sqrt(sqrts[i]);
					mt = "\u221a(" + sqrts[i] + ")";
				}
				while (d <= 100) {
					for (n = 1; n < (m == 1 ? d : 100); n++) {
						var r = m * n / d;
						var f = dojox.calc.approx(r);
						if (!(f in a)) {
							if (n == d) {
								n = 1;
								d = 1;
							}
							a[f] = {n:n, d:d, m:m, mt:mt};
							if (f == searchNumber) {
								searchNumber = undefined;
							}
						}
					}
					d++;
					if (searchNumber == undefined) {
						setTimeout(function () {
							_fracHashInit();
						}, 1);
						return;
					}
				}
				d = 2;
				i++;
			}
			_fracHashInitialized = true;
		}
		function isInt(n) {
			return Math.floor(n) == n;
		}
		function _fracLookup(number) {
			number = Math.abs(number);
			var i = Math.floor(number);
			number %= 1;
			var inv = dojox.calc.approx(1 / number);
			return isInt(inv) ? {m:1, mt:1, n:i * inv + 1, d:inv} : null;
		}
		_fracHashInit();
		function _fracLookup(number) {
			function retryWhenInitialized() {
				_fracHashInit(number);
				return _fracLookup(number);
			}
			number = Math.abs(number);
			var f = a[dojox.calc.approx(number)];
			if (!f && !_fracHashInitialized) {
				return retryWhenInitialized();
			}
			if (!f) {
				var i = Math.floor(number);
				if (i == 0) {
					return _fracHashInitialized ? null : retryWhenInitialized();
				}
				var n = number % 1;
				if (n == 0) {
					return {m:1, mt:1, n:number, d:1};
				}
				f = a[dojox.calc.approx(n)];
				if (!f || f.m != 1) {
					var inv = dojox.calc.approx(1 / n);
					return isInt(inv) ? {m:1, mt:1, n:1, d:inv} : (_fracHashInitialized ? null : retryWhenInitialized());
				} else {
					return {m:1, mt:1, n:(i * f.d + f.n), d:f.d};
				}
			}
			return f;
		}
		dojo.mixin(dojox.calc, {toFrac:function (number) {
			var f = _fracLookup(number);
			return f ? ((number < 0 ? "-" : "") + (f.m == 1 ? "" : (f.n == 1 ? "" : (f.n + "*"))) + (f.m == 1 ? f.n : f.mt) + ((f.d == 1 ? "" : "/" + f.d))) : number;
		}, pow:function (base, exponent) {
			if (isInt(exponent)) {
				return Math.pow(base, exponent);
			} else {
				var f = _fracLookup(exponent);
				if (base >= 0) {
					return (f && f.m == 1) ? Math.pow(Math.pow(base, 1 / f.d), exponent < 0 ? -f.n : f.n) : Math.pow(base, exponent);
				} else {
					return (f && f.d & 1) ? Math.pow(Math.pow(-Math.pow(-base, 1 / f.d), exponent < 0 ? -f.n : f.n), f.m) : NaN;
				}
			}
		}});
	})();
}

