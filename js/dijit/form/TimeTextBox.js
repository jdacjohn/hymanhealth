/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form.TimeTextBox"]) {
	dojo._hasResource["dijit.form.TimeTextBox"] = true;
	dojo.provide("dijit.form.TimeTextBox");
	dojo.require("dijit._TimePicker");
	dojo.require("dijit.form._DateTimeTextBox");
	dojo.declare("dijit.form.TimeTextBox", dijit.form._DateTimeTextBox, {baseClass:"dijitTextBox dijitComboBox dijitTimeTextBox", popupClass:"dijit._TimePicker", _selector:"time", value:new Date(""), _onKey:function (evt) {
		this.inherited(arguments);
		switch (evt.keyCode) {
		  case dojo.keys.ENTER:
		  case dojo.keys.TAB:
		  case dojo.keys.ESCAPE:
		  case dojo.keys.DOWN_ARROW:
		  case dojo.keys.UP_ARROW:
			break;
		  default:
			setTimeout(dojo.hitch(this, function () {
				var val = this.get("displayedValue");
				this.filterString = (val && !this.parse(val, this.constraints)) ? val.toLowerCase() : "";
				if (this._opened) {
					this.closeDropDown();
				}
				this.openDropDown();
			}), 0);
		}
	}});
}

