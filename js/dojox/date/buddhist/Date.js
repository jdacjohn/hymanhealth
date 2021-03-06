/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.date.buddhist.Date"]) {
	dojo._hasResource["dojox.date.buddhist.Date"] = true;
	dojo.provide("dojox.date.buddhist.Date");
	dojo.experimental("dojox.date.buddhist.Date");
	dojo.declare("dojox.date.buddhist.Date", null, {_date:0, _month:0, _year:0, _hours:0, _minutes:0, _seconds:0, _milliseconds:0, _day:0, constructor:function () {
		var len = arguments.length;
		if (!len) {
			this.fromGregorian(new Date());
		} else {
			if (len == 1) {
				var arg0 = arguments[0];
				if (typeof arg0 == "number") {
					arg0 = new Date(arg0);
				}
				if (arg0 instanceof Date) {
					this.fromGregorian(arg0);
				} else {
					if (arg0 == "") {
						this._date = new Date("");
					} else {
						this._year = arg0._year;
						this._month = arg0._month;
						this._date = arg0._date;
						this._hours = arg0._hours;
						this._minutes = arg0._minutes;
						this._seconds = arg0._seconds;
						this._milliseconds = arg0._milliseconds;
					}
				}
			} else {
				if (len >= 3) {
					this._year += arguments[0];
					this._month += arguments[1];
					this._date += arguments[2];
					if (this._month > 11) {
						console.warn("the month is incorrect , set 0");
						this._month = 0;
					}
					this._hours += arguments[3] || 0;
					this._minutes += arguments[4] || 0;
					this._seconds += arguments[5] || 0;
					this._milliseconds += arguments[6] || 0;
				}
			}
		}
	}, getDate:function (isNumber) {
		return parseInt(this._date);
	}, getMonth:function () {
		return parseInt(this._month);
	}, getFullYear:function () {
		return parseInt(this._year);
	}, getHours:function () {
		return this._hours;
	}, getMinutes:function () {
		return this._minutes;
	}, getSeconds:function () {
		return this._seconds;
	}, getMilliseconds:function () {
		return this._milliseconds;
	}, setDate:function (date) {
		date = parseInt(date);
		if (date > 0 && date <= this._getDaysInMonth(this._month, this._year)) {
			this._date = date;
		} else {
			var mdays;
			if (date > 0) {
				for (mdays = this._getDaysInMonth(this._month, this._year); date > mdays; date -= mdays, mdays = this._getDaysInMonth(this._month, this._year)) {
					this._month++;
					if (this._month >= 12) {
						this._year++;
						this._month -= 12;
					}
				}
				this._date = date;
			} else {
				for (mdays = this._getDaysInMonth((this._month - 1) >= 0 ? (this._month - 1) : 11, ((this._month - 1) >= 0) ? this._year : this._year - 1); date <= 0; mdays = this._getDaysInMonth((this._month - 1) >= 0 ? (this._month - 1) : 11, ((this._month - 1) >= 0) ? this._year : this._year - 1)) {
					this._month--;
					if (this._month < 0) {
						this._year--;
						this._month += 12;
					}
					date += mdays;
				}
				this._date = date;
			}
		}
		return this;
	}, setFullYear:function (year, month, date) {
		this._year = parseInt(year);
	}, setMonth:function (month) {
		this._year += Math.floor(month / 12);
		this._month = Math.floor(month % 12);
		for (; this._month < 0; this._month = this._month + 12) {
		}
	}, setHours:function () {
		var hours_arg_no = arguments.length;
		var hours = 0;
		if (hours_arg_no >= 1) {
			hours = parseInt(arguments[0]);
		}
		if (hours_arg_no >= 2) {
			this._minutes = parseInt(arguments[1]);
		}
		if (hours_arg_no >= 3) {
			this._seconds = parseInt(arguments[2]);
		}
		if (hours_arg_no == 4) {
			this._milliseconds = parseInt(arguments[3]);
		}
		while (hours >= 24) {
			this._date++;
			var mdays = this._getDaysInMonth(this._month, this._year);
			if (this._date > mdays) {
				this._month++;
				if (this._month >= 12) {
					this._year++;
					this._month -= 12;
				}
				this._date -= mdays;
			}
			hours -= 24;
		}
		this._hours = hours;
	}, setMinutes:function (minutes) {
		while (minutes >= 60) {
			this._hours++;
			if (this._hours >= 24) {
				this._date++;
				this._hours -= 24;
				var mdays = this._getDaysInMonth(this._month, this._year);
				if (this._date > mdays) {
					this._month++;
					if (this._month >= 12) {
						this._year++;
						this._month -= 12;
					}
					this._date -= mdays;
				}
			}
			minutes -= 60;
		}
		this._minutes = minutes;
	}, setSeconds:function (seconds) {
		while (seconds >= 60) {
			this._minutes++;
			if (this._minutes >= 60) {
				this._hours++;
				this._minutes -= 60;
				if (this._hours >= 24) {
					this._date++;
					this._hours -= 24;
					var mdays = this._getDaysInMonth(this._month, this._year);
					if (this._date > mdays) {
						this._month++;
						if (this._month >= 12) {
							this._year++;
							this._month -= 12;
						}
						this._date -= mdays;
					}
				}
			}
			seconds -= 60;
		}
		this._seconds = seconds;
	}, setMilliseconds:function (milliseconds) {
		while (milliseconds >= 1000) {
			this.setSeconds++;
			if (this.setSeconds >= 60) {
				this._minutes++;
				this.setSeconds -= 60;
				if (this._minutes >= 60) {
					this._hours++;
					this._minutes -= 60;
					if (this._hours >= 24) {
						this._date++;
						this._hours -= 24;
						var mdays = this._getDaysInMonth(this._month, this._year);
						if (this._date > mdays) {
							this._month++;
							if (this._month >= 12) {
								this._year++;
								this._month -= 12;
							}
							this._date -= mdays;
						}
					}
				}
			}
			milliseconds -= 1000;
		}
		this._milliseconds = milliseconds;
	}, toString:function () {
		return this._date + ", " + this._month + ", " + this._year + "  " + this._hours + ":" + this._minutes + ":" + this._seconds;
	}, _getDaysInMonth:function (month, year) {
		return dojo.date.getDaysInMonth(new Date(year - 543, month));
	}, fromGregorian:function (gdate) {
		var date = new Date(gdate);
		this._date = date.getDate();
		this._month = date.getMonth();
		this._year = date.getFullYear() + 543;
		this._hours = date.getHours();
		this._minutes = date.getMinutes();
		this._seconds = date.getSeconds();
		this._milliseconds = date.getMilliseconds();
		this._day = date.getDay();
		return this;
	}, toGregorian:function () {
		return new Date(this._year - 543, this._month, this._date, this._hours, this._minutes, this._seconds, this._milliseconds);
	}, getDay:function () {
		return this.toGregorian().getDay();
	}});
	dojox.date.buddhist.Date.prototype.valueOf = function () {
		return this.toGregorian().valueOf();
	};
}

