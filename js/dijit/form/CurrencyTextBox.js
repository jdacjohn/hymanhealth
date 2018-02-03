/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form.CurrencyTextBox"]) {
	dojo._hasResource["dijit.form.CurrencyTextBox"] = true;
	dojo.provide("dijit.form.CurrencyTextBox");
	dojo.require("dojo.currency");
	dojo.require("dijit.form.NumberTextBox");
	dojo.declare("dijit.form.CurrencyTextBox", dijit.form.NumberTextBox, {currency:"", baseClass:"dijitTextBox dijitCurrencyTextBox", regExpGen:function (constraints) {
		return "(" + (this._focused ? this.inherited(arguments, [dojo.mixin({}, constraints, this.editOptions)]) + "|" : "") + dojo.currency.regexp(constraints) + ")";
	}, _formatter:dojo.currency.format, parse:function (value, constraints) {
		var v = dojo.currency.parse(value, constraints);
		if (isNaN(v) && /\d+/.test(value)) {
			return this.inherited(arguments, [value, dojo.mixin({}, constraints, this.editOptions)]);
		}
		return v;
	}, _setConstraintsAttr:function (constraints) {
		if (!constraints.currency && this.currency) {
			constraints.currency = this.currency;
		}
		this.inherited(arguments, [dojo.currency._mixInDefaults(dojo.mixin(constraints, {exponent:false}))]);
	}});
}

