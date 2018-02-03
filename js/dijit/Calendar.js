/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.Calendar"]) {
	dojo._hasResource["dijit.Calendar"] = true;
	dojo.provide("dijit.Calendar");
	dojo.require("dojo.cldr.supplemental");
	dojo.require("dojo.date");
	dojo.require("dojo.date.locale");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	dojo.require("dijit._CssStateMixin");
	dojo.require("dijit.form.DropDownButton");
	dojo.declare("dijit.Calendar", [dijit._Widget, dijit._Templated, dijit._CssStateMixin], {templateString:dojo.cache("dijit", "templates/Calendar.html", "<table cellspacing=\"0\" cellpadding=\"0\" class=\"dijitCalendarContainer\" role=\"grid\" dojoAttachEvent=\"onkeypress: _onKeyPress\">\n\t<thead>\n\t\t<tr class=\"dijitReset dijitCalendarMonthContainer\" valign=\"top\">\n\t\t\t<th class='dijitReset dijitCalendarArrow' dojoAttachPoint=\"decrementMonth\">\n\t\t\t\t<img src=\"${_blankGif}\" alt=\"\" class=\"dijitCalendarIncrementControl dijitCalendarDecrease\" role=\"presentation\"/>\n\t\t\t\t<span dojoAttachPoint=\"decreaseArrowNode\" class=\"dijitA11ySideArrow\">-</span>\n\t\t\t</th>\n\t\t\t<th class='dijitReset' colspan=\"5\">\n\t\t\t\t<div dojoType=\"dijit.form.DropDownButton\" dojoAttachPoint=\"monthDropDownButton\"\n\t\t\t\t\tid=\"${id}_mddb\" tabIndex=\"-1\">\n\t\t\t\t</div>\n\t\t\t</th>\n\t\t\t<th class='dijitReset dijitCalendarArrow' dojoAttachPoint=\"incrementMonth\">\n\t\t\t\t<img src=\"${_blankGif}\" alt=\"\" class=\"dijitCalendarIncrementControl dijitCalendarIncrease\" role=\"presentation\"/>\n\t\t\t\t<span dojoAttachPoint=\"increaseArrowNode\" class=\"dijitA11ySideArrow\">+</span>\n\t\t\t</th>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<th class=\"dijitReset dijitCalendarDayLabelTemplate\" role=\"columnheader\"><span class=\"dijitCalendarDayLabel\"></span></th>\n\t\t</tr>\n\t</thead>\n\t<tbody dojoAttachEvent=\"onclick: _onDayClick, onmouseover: _onDayMouseOver, onmouseout: _onDayMouseOut, onmousedown: _onDayMouseDown, onmouseup: _onDayMouseUp\" class=\"dijitReset dijitCalendarBodyContainer\">\n\t\t<tr class=\"dijitReset dijitCalendarWeekTemplate\" role=\"row\">\n\t\t\t<td class=\"dijitReset dijitCalendarDateTemplate\" role=\"gridcell\"><span class=\"dijitCalendarDateLabel\"></span></td>\n\t\t</tr>\n\t</tbody>\n\t<tfoot class=\"dijitReset dijitCalendarYearContainer\">\n\t\t<tr>\n\t\t\t<td class='dijitReset' valign=\"top\" colspan=\"7\">\n\t\t\t\t<h3 class=\"dijitCalendarYearLabel\">\n\t\t\t\t\t<span dojoAttachPoint=\"previousYearLabelNode\" class=\"dijitInline dijitCalendarPreviousYear\"></span>\n\t\t\t\t\t<span dojoAttachPoint=\"currentYearLabelNode\" class=\"dijitInline dijitCalendarSelectedYear\"></span>\n\t\t\t\t\t<span dojoAttachPoint=\"nextYearLabelNode\" class=\"dijitInline dijitCalendarNextYear\"></span>\n\t\t\t\t</h3>\n\t\t\t</td>\n\t\t</tr>\n\t</tfoot>\n</table>\n"), widgetsInTemplate:true, value:new Date(""), datePackage:"dojo.date", dayWidth:"narrow", tabIndex:"0", currentFocus:new Date(), baseClass:"dijitCalendar", cssStateNodes:{"decrementMonth":"dijitCalendarArrow", "incrementMonth":"dijitCalendarArrow", "previousYearLabelNode":"dijitCalendarPreviousYear", "nextYearLabelNode":"dijitCalendarNextYear"}, _isValidDate:function (value) {
		return value && !isNaN(value) && typeof value == "object" && value.toString() != this.constructor.prototype.value.toString();
	}, setValue:function (value) {
		dojo.deprecated("dijit.Calendar:setValue() is deprecated.  Use set('value', ...) instead.", "", "2.0");
		this.set("value", value);
	}, _getValueAttr:function () {
		var value = new this.dateClassObj(this.value);
		value.setHours(0, 0, 0, 0);
		if (value.getDate() < this.value.getDate()) {
			value = this.dateFuncObj.add(value, "hour", 1);
		}
		return value;
	}, _setValueAttr:function (value, priorityChange) {
		if (value) {
			value = new this.dateClassObj(value);
		}
		if (this._isValidDate(value)) {
			if (!this._isValidDate(this.value) || this.dateFuncObj.compare(value, this.value)) {
				value.setHours(1, 0, 0, 0);
				if (!this.isDisabledDate(value, this.lang)) {
					this.value = value;
					this.set("currentFocus", value);
					if (priorityChange || typeof priorityChange == "undefined") {
						this.onChange(this.get("value"));
						this.onValueSelected(this.get("value"));
					}
				}
			}
		} else {
			this.value = null;
			this.set("currentFocus", this.currentFocus);
		}
	}, _setText:function (node, text) {
		while (node.firstChild) {
			node.removeChild(node.firstChild);
		}
		node.appendChild(dojo.doc.createTextNode(text));
	}, _populateGrid:function () {
		var month = new this.dateClassObj(this.currentFocus);
		month.setDate(1);
		var firstDay = month.getDay(), daysInMonth = this.dateFuncObj.getDaysInMonth(month), daysInPreviousMonth = this.dateFuncObj.getDaysInMonth(this.dateFuncObj.add(month, "month", -1)), today = new this.dateClassObj(), dayOffset = dojo.cldr.supplemental.getFirstDayOfWeek(this.lang);
		if (dayOffset > firstDay) {
			dayOffset -= 7;
		}
		dojo.query(".dijitCalendarDateTemplate", this.domNode).forEach(function (template, i) {
			i += dayOffset;
			var date = new this.dateClassObj(month), number, clazz = "dijitCalendar", adj = 0;
			if (i < firstDay) {
				number = daysInPreviousMonth - firstDay + i + 1;
				adj = -1;
				clazz += "Previous";
			} else {
				if (i >= (firstDay + daysInMonth)) {
					number = i - firstDay - daysInMonth + 1;
					adj = 1;
					clazz += "Next";
				} else {
					number = i - firstDay + 1;
					clazz += "Current";
				}
			}
			if (adj) {
				date = this.dateFuncObj.add(date, "month", adj);
			}
			date.setDate(number);
			if (!this.dateFuncObj.compare(date, today, "date")) {
				clazz = "dijitCalendarCurrentDate " + clazz;
			}
			if (this._isSelectedDate(date, this.lang)) {
				clazz = "dijitCalendarSelectedDate " + clazz;
			}
			if (this.isDisabledDate(date, this.lang)) {
				clazz = "dijitCalendarDisabledDate " + clazz;
			}
			var clazz2 = this.getClassForDate(date, this.lang);
			if (clazz2) {
				clazz = clazz2 + " " + clazz;
			}
			template.className = clazz + "Month dijitCalendarDateTemplate";
			template.dijitDateValue = date.valueOf();
			dojo.attr(template, "dijitDateValue", date.valueOf());
			var label = dojo.query(".dijitCalendarDateLabel", template)[0], text = date.getDateLocalized ? date.getDateLocalized(this.lang) : date.getDate();
			this._setText(label, text);
		}, this);
		var monthNames = this.dateLocaleModule.getNames("months", "wide", "standAlone", this.lang, month);
		this.monthDropDownButton.dropDown.set("months", monthNames);
		this.monthDropDownButton.containerNode.innerHTML = (dojo.isIE == 6 ? "" : "<div class='dijitSpacer'>" + this.monthDropDownButton.dropDown.domNode.innerHTML + "</div>") + "<div class='dijitCalendarMonthLabel dijitCalendarCurrentMonthLabel'>" + monthNames[month.getMonth()] + "</div>";
		var y = month.getFullYear() - 1;
		var d = new this.dateClassObj();
		dojo.forEach(["previous", "current", "next"], function (name) {
			d.setFullYear(y++);
			this._setText(this[name + "YearLabelNode"], this.dateLocaleModule.format(d, {selector:"year", locale:this.lang}));
		}, this);
		var _this = this;
		var typematic = function (nodeProp, dateProp, adj) {
			_this._connects.push(dijit.typematic.addMouseListener(_this[nodeProp], _this, function (count) {
				if (count >= 0) {
					_this._adjustDisplay(dateProp, adj);
				}
			}, 0.8, 500));
		};
		typematic("incrementMonth", "month", 1);
		typematic("decrementMonth", "month", -1);
		typematic("nextYearLabelNode", "year", 1);
		typematic("previousYearLabelNode", "year", -1);
	}, goToToday:function () {
		this.set("value", new this.dateClassObj());
	}, constructor:function (args) {
		var dateClass = (args.datePackage && (args.datePackage != "dojo.date")) ? args.datePackage + ".Date" : "Date";
		this.dateClassObj = dojo.getObject(dateClass, false);
		this.datePackage = args.datePackage || this.datePackage;
		this.dateFuncObj = dojo.getObject(this.datePackage, false);
		this.dateLocaleModule = dojo.getObject(this.datePackage + ".locale", false);
	}, postMixInProperties:function () {
		if (isNaN(this.value)) {
			delete this.value;
		}
		this.inherited(arguments);
	}, buildRendering:function () {
		this.inherited(arguments);
		dojo.setSelectable(this.domNode, false);
		var cloneClass = dojo.hitch(this, function (clazz, n) {
			var template = dojo.query(clazz, this.domNode)[0];
			for (var i = 0; i < n; i++) {
				template.parentNode.appendChild(template.cloneNode(true));
			}
		});
		cloneClass(".dijitCalendarDayLabelTemplate", 6);
		cloneClass(".dijitCalendarDateTemplate", 6);
		cloneClass(".dijitCalendarWeekTemplate", 5);
		var dayNames = this.dateLocaleModule.getNames("days", this.dayWidth, "standAlone", this.lang);
		var dayOffset = dojo.cldr.supplemental.getFirstDayOfWeek(this.lang);
		dojo.query(".dijitCalendarDayLabel", this.domNode).forEach(function (label, i) {
			this._setText(label, dayNames[(i + dayOffset) % 7]);
		}, this);
		var dateObj = new this.dateClassObj(this.currentFocus);
		this.monthDropDownButton.dropDown = new dijit.Calendar._MonthDropDown({id:this.id + "_mdd", onChange:dojo.hitch(this, "_onMonthSelect")});
		this.set("currentFocus", dateObj, false);
	}, _adjustDisplay:function (part, amount) {
		this._setCurrentFocusAttr(this.dateFuncObj.add(this.currentFocus, part, amount));
	}, _setCurrentFocusAttr:function (date, forceFocus) {
		var oldFocus = this.currentFocus, oldCell = oldFocus ? dojo.query("[dijitDateValue=" + oldFocus.valueOf() + "]", this.domNode)[0] : null;
		date = new this.dateClassObj(date);
		date.setHours(1, 0, 0, 0);
		this.currentFocus = date;
		this._populateGrid();
		var newCell = dojo.query("[dijitDateValue=" + date.valueOf() + "]", this.domNode)[0];
		newCell.setAttribute("tabIndex", this.tabIndex);
		if (this._focused || forceFocus) {
			newCell.focus();
		}
		if (oldCell && oldCell != newCell) {
			if (dojo.isWebKit) {
				oldCell.setAttribute("tabIndex", "-1");
			} else {
				oldCell.removeAttribute("tabIndex");
			}
		}
	}, focus:function () {
		this._setCurrentFocusAttr(this.currentFocus, true);
	}, _onMonthSelect:function (month) {
		this.currentFocus.setMonth(month);
		this._populateGrid();
	}, _onDayClick:function (evt) {
		dojo.stopEvent(evt);
		for (var node = evt.target; node && !node.dijitDateValue; node = node.parentNode) {
		}
		if (node && !dojo.hasClass(node, "dijitCalendarDisabledDate")) {
			this.set("value", node.dijitDateValue);
		}
	}, _onDayMouseOver:function (evt) {
		var node = dojo.hasClass(evt.target, "dijitCalendarDateLabel") ? evt.target.parentNode : evt.target;
		if (node && (node.dijitDateValue || node == this.previousYearLabelNode || node == this.nextYearLabelNode)) {
			dojo.addClass(node, "dijitCalendarHoveredDate");
			this._currentNode = node;
		}
	}, _onDayMouseOut:function (evt) {
		if (!this._currentNode) {
			return;
		}
		if (evt.relatedTarget && evt.relatedTarget.parentNode == this._currentNode) {
			return;
		}
		var cls = "dijitCalendarHoveredDate";
		if (dojo.hasClass(this._currentNode, "dijitCalendarActiveDate")) {
			cls += " dijitCalendarActiveDate";
		}
		dojo.removeClass(this._currentNode, cls);
		this._currentNode = null;
	}, _onDayMouseDown:function (evt) {
		var node = evt.target.parentNode;
		if (node && node.dijitDateValue) {
			dojo.addClass(node, "dijitCalendarActiveDate");
			this._currentNode = node;
		}
	}, _onDayMouseUp:function (evt) {
		var node = evt.target.parentNode;
		if (node && node.dijitDateValue) {
			dojo.removeClass(node, "dijitCalendarActiveDate");
		}
	}, handleKey:function (evt) {
		var dk = dojo.keys, increment = -1, interval, newValue = this.currentFocus;
		switch (evt.keyCode) {
		  case dk.RIGHT_ARROW:
			increment = 1;
		  case dk.LEFT_ARROW:
			interval = "day";
			if (!this.isLeftToRight()) {
				increment *= -1;
			}
			break;
		  case dk.DOWN_ARROW:
			increment = 1;
		  case dk.UP_ARROW:
			interval = "week";
			break;
		  case dk.PAGE_DOWN:
			increment = 1;
		  case dk.PAGE_UP:
			interval = evt.ctrlKey || evt.altKey ? "year" : "month";
			break;
		  case dk.END:
			newValue = this.dateFuncObj.add(newValue, "month", 1);
			interval = "day";
		  case dk.HOME:
			newValue = new this.dateClassObj(newValue);
			newValue.setDate(1);
			break;
		  case dk.ENTER:
		  case dk.SPACE:
			this.set("value", this.currentFocus);
			break;
		  default:
			return true;
		}
		if (interval) {
			newValue = this.dateFuncObj.add(newValue, interval, increment);
		}
		this._setCurrentFocusAttr(newValue);
		return false;
	}, _onKeyPress:function (evt) {
		if (!this.handleKey(evt)) {
			dojo.stopEvent(evt);
		}
	}, onValueSelected:function (date) {
	}, onChange:function (date) {
	}, _isSelectedDate:function (dateObject, locale) {
		return this._isValidDate(this.value) && !this.dateFuncObj.compare(dateObject, this.value, "date");
	}, isDisabledDate:function (dateObject, locale) {
	}, getClassForDate:function (dateObject, locale) {
	}});
	dojo.declare("dijit.Calendar._MonthDropDown", [dijit._Widget, dijit._Templated], {months:[], templateString:"<div class='dijitCalendarMonthMenu dijitMenu' " + "dojoAttachEvent='onclick:_onClick,onmouseover:_onMenuHover,onmouseout:_onMenuHover'></div>", _setMonthsAttr:function (months) {
		this.domNode.innerHTML = dojo.map(months, function (month, idx) {
			return month ? "<div class='dijitCalendarMonthLabel' month='" + idx + "'>" + month + "</div>" : "";
		}).join("");
	}, _onClick:function (evt) {
		this.onChange(dojo.attr(evt.target, "month"));
	}, onChange:function (month) {
	}, _onMenuHover:function (evt) {
		dojo.toggleClass(evt.target, "dijitCalendarMonthLabelHover", evt.type == "mouseover");
	}});
}

