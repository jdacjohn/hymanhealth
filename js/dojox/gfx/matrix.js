/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.gfx.matrix"]) {
	dojo._hasResource["dojox.gfx.matrix"] = true;
	dojo.provide("dojox.gfx.matrix");
	(function () {
		var m = dojox.gfx.matrix;
		var _degToRadCache = {};
		m._degToRad = function (degree) {
			return _degToRadCache[degree] || (_degToRadCache[degree] = (Math.PI * degree / 180));
		};
		m._radToDeg = function (radian) {
			return radian / Math.PI * 180;
		};
		m.Matrix2D = function (arg) {
			if (arg) {
				if (typeof arg == "number") {
					this.xx = this.yy = arg;
				} else {
					if (arg instanceof Array) {
						if (arg.length > 0) {
							var matrix = m.normalize(arg[0]);
							for (var i = 1; i < arg.length; ++i) {
								var l = matrix, r = dojox.gfx.matrix.normalize(arg[i]);
								matrix = new m.Matrix2D();
								matrix.xx = l.xx * r.xx + l.xy * r.yx;
								matrix.xy = l.xx * r.xy + l.xy * r.yy;
								matrix.yx = l.yx * r.xx + l.yy * r.yx;
								matrix.yy = l.yx * r.xy + l.yy * r.yy;
								matrix.dx = l.xx * r.dx + l.xy * r.dy + l.dx;
								matrix.dy = l.yx * r.dx + l.yy * r.dy + l.dy;
							}
							dojo.mixin(this, matrix);
						}
					} else {
						dojo.mixin(this, arg);
					}
				}
			}
		};
		dojo.extend(m.Matrix2D, {xx:1, xy:0, yx:0, yy:1, dx:0, dy:0});
		dojo.mixin(m, {identity:new m.Matrix2D(), flipX:new m.Matrix2D({xx:-1}), flipY:new m.Matrix2D({yy:-1}), flipXY:new m.Matrix2D({xx:-1, yy:-1}), translate:function (a, b) {
			if (arguments.length > 1) {
				return new m.Matrix2D({dx:a, dy:b});
			}
			return new m.Matrix2D({dx:a.x, dy:a.y});
		}, scale:function (a, b) {
			if (arguments.length > 1) {
				return new m.Matrix2D({xx:a, yy:b});
			}
			if (typeof a == "number") {
				return new m.Matrix2D({xx:a, yy:a});
			}
			return new m.Matrix2D({xx:a.x, yy:a.y});
		}, rotate:function (angle) {
			var c = Math.cos(angle);
			var s = Math.sin(angle);
			return new m.Matrix2D({xx:c, xy:-s, yx:s, yy:c});
		}, rotateg:function (degree) {
			return m.rotate(m._degToRad(degree));
		}, skewX:function (angle) {
			return new m.Matrix2D({xy:Math.tan(angle)});
		}, skewXg:function (degree) {
			return m.skewX(m._degToRad(degree));
		}, skewY:function (angle) {
			return new m.Matrix2D({yx:Math.tan(angle)});
		}, skewYg:function (degree) {
			return m.skewY(m._degToRad(degree));
		}, reflect:function (a, b) {
			if (arguments.length == 1) {
				b = a.y;
				a = a.x;
			}
			var a2 = a * a, b2 = b * b, n2 = a2 + b2, xy = 2 * a * b / n2;
			return new m.Matrix2D({xx:2 * a2 / n2 - 1, xy:xy, yx:xy, yy:2 * b2 / n2 - 1});
		}, project:function (a, b) {
			if (arguments.length == 1) {
				b = a.y;
				a = a.x;
			}
			var a2 = a * a, b2 = b * b, n2 = a2 + b2, xy = a * b / n2;
			return new m.Matrix2D({xx:a2 / n2, xy:xy, yx:xy, yy:b2 / n2});
		}, normalize:function (matrix) {
			return (matrix instanceof m.Matrix2D) ? matrix : new m.Matrix2D(matrix);
		}, clone:function (matrix) {
			var obj = new m.Matrix2D();
			for (var i in matrix) {
				if (typeof (matrix[i]) == "number" && typeof (obj[i]) == "number" && obj[i] != matrix[i]) {
					obj[i] = matrix[i];
				}
			}
			return obj;
		}, invert:function (matrix) {
			var M = m.normalize(matrix), D = M.xx * M.yy - M.xy * M.yx, M = new m.Matrix2D({xx:M.yy / D, xy:-M.xy / D, yx:-M.yx / D, yy:M.xx / D, dx:(M.xy * M.dy - M.yy * M.dx) / D, dy:(M.yx * M.dx - M.xx * M.dy) / D});
			return M;
		}, _multiplyPoint:function (matrix, x, y) {
			return {x:matrix.xx * x + matrix.xy * y + matrix.dx, y:matrix.yx * x + matrix.yy * y + matrix.dy};
		}, multiplyPoint:function (matrix, a, b) {
			var M = m.normalize(matrix);
			if (typeof a == "number" && typeof b == "number") {
				return m._multiplyPoint(M, a, b);
			}
			return m._multiplyPoint(M, a.x, a.y);
		}, multiply:function (matrix) {
			var M = m.normalize(matrix);
			for (var i = 1; i < arguments.length; ++i) {
				var l = M, r = m.normalize(arguments[i]);
				M = new m.Matrix2D();
				M.xx = l.xx * r.xx + l.xy * r.yx;
				M.xy = l.xx * r.xy + l.xy * r.yy;
				M.yx = l.yx * r.xx + l.yy * r.yx;
				M.yy = l.yx * r.xy + l.yy * r.yy;
				M.dx = l.xx * r.dx + l.xy * r.dy + l.dx;
				M.dy = l.yx * r.dx + l.yy * r.dy + l.dy;
			}
			return M;
		}, _sandwich:function (matrix, x, y) {
			return m.multiply(m.translate(x, y), matrix, m.translate(-x, -y));
		}, scaleAt:function (a, b, c, d) {
			switch (arguments.length) {
			  case 4:
				return m._sandwich(m.scale(a, b), c, d);
			  case 3:
				if (typeof c == "number") {
					return m._sandwich(m.scale(a), b, c);
				}
				return m._sandwich(m.scale(a, b), c.x, c.y);
			}
			return m._sandwich(m.scale(a), b.x, b.y);
		}, rotateAt:function (angle, a, b) {
			if (arguments.length > 2) {
				return m._sandwich(m.rotate(angle), a, b);
			}
			return m._sandwich(m.rotate(angle), a.x, a.y);
		}, rotategAt:function (degree, a, b) {
			if (arguments.length > 2) {
				return m._sandwich(m.rotateg(degree), a, b);
			}
			return m._sandwich(m.rotateg(degree), a.x, a.y);
		}, skewXAt:function (angle, a, b) {
			if (arguments.length > 2) {
				return m._sandwich(m.skewX(angle), a, b);
			}
			return m._sandwich(m.skewX(angle), a.x, a.y);
		}, skewXgAt:function (degree, a, b) {
			if (arguments.length > 2) {
				return m._sandwich(m.skewXg(degree), a, b);
			}
			return m._sandwich(m.skewXg(degree), a.x, a.y);
		}, skewYAt:function (angle, a, b) {
			if (arguments.length > 2) {
				return m._sandwich(m.skewY(angle), a, b);
			}
			return m._sandwich(m.skewY(angle), a.x, a.y);
		}, skewYgAt:function (degree, a, b) {
			if (arguments.length > 2) {
				return m._sandwich(m.skewYg(degree), a, b);
			}
			return m._sandwich(m.skewYg(degree), a.x, a.y);
		}});
	})();
	dojox.gfx.Matrix2D = dojox.gfx.matrix.Matrix2D;
}

