dependencies = {
	stripConsole: "normal",

	layers:[
		{
			name:"dojo.js",
			dependencies:[
				"app.dojo_requires"
			]
		},
		{
			name:"app.js",
			dependencies:[
				"app.app_requires"
			]
		}
	],
	prefixes:[
		["app", "../html/app"],
		["dijit", "../dijit"],
		["dojox", "../dojox"],
		["css", "../html/css"]
	]
};
